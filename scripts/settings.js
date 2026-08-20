(function (window, undefined) {

    var STORAGE_KEY = "vietqr_plugin_config";
    var BANKS_API_URL = "https://api.vietqr.io/v2/banks";

    var DEFAULT_CONFIG = {
        BANK_ID       : "ICB",
        ACCOUNT_NO    : "115003018063",
        TEMPLATE      : "compact",
        ACCOUNT_NAME  : "CONG TY TNHH 5EX",
        DESCRIPTION   : "Thanh toan tien hang 5Ex"
    };

    var VALID_TEMPLATES = ["compact2", "compact", "qr_only", "print", "loax"];

    // Dùng khi không tải được danh sách ngân hàng từ API (ví dụ mất mạng
    // hoặc API phản hồi quá lâu), để form vẫn dùng được với một số ngân hàng phổ biến.
    var FALLBACK_BANKS = [
        { code: "ICB",   shortName: "VietinBank",  name: "Ngân hàng TMCP Công Thương Việt Nam" },
        { code: "VCB",   shortName: "Vietcombank",  name: "Ngân hàng TMCP Ngoại Thương Việt Nam" },
        { code: "BIDV",  shortName: "BIDV",         name: "Ngân hàng TMCP Đầu tư và Phát triển Việt Nam" },
        { code: "ACB",   shortName: "ACB",          name: "Ngân hàng TMCP Á Châu" },
        { code: "TCB",   shortName: "Techcombank",  name: "Ngân hàng TMCP Kỹ Thương Việt Nam" },
        { code: "MB",    shortName: "MBBank",       name: "Ngân hàng TMCP Quân Đội" },
        { code: "VPB",   shortName: "VPBank",       name: "Ngân hàng TMCP Việt Nam Thịnh Vượng" },
        { code: "STB",   shortName: "Sacombank",    name: "Ngân hàng TMCP Sài Gòn Thương Tín" },
        { code: "VBA",   shortName: "Agribank",     name: "Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam" },
        { code: "OCB",   shortName: "OCB",          name: "Ngân hàng TMCP Phương Đông" }
    ];

    var bankList = [];

    function loadConfig() {
        try {
            var raw = window.localStorage.getItem(STORAGE_KEY);
            if (raw) {
                var parsed = JSON.parse(raw);
                var merged = {};
                for (var key in DEFAULT_CONFIG) merged[key] = DEFAULT_CONFIG[key];
                for (var key2 in parsed) merged[key2] = parsed[key2];
                return merged;
            }
        } catch (e) {}
        return DEFAULT_CONFIG;
    }

    // Đổ dữ liệu cấu hình hiện tại lên các ô input/select của form
    window.Asc.plugin.init = function () {
        var cfg = loadConfig();

        document.getElementById("field-account").value = cfg.ACCOUNT_NO || "";
        document.getElementById("field-name").value = cfg.ACCOUNT_NAME || "";
        document.getElementById("field-desc").value = cfg.DESCRIPTION || "";

        var templateValue = (VALID_TEMPLATES.indexOf(cfg.TEMPLATE) !== -1) ? cfg.TEMPLATE : "compact";
        setTemplateValue(templateValue);
        initTemplateSelect();

        initBankSelect(cfg.BANK_ID);

        document.getElementById("field-account").focus();

        // Gắn sự kiện cho nút Lưu / Hủy vẽ thủ công trong settings.html
        document.getElementById("btn-save").addEventListener("click", onSave);
        document.getElementById("btn-cancel").addEventListener("click", onCancel);
    };

    // --- Custom dropdown "Kiểu QR" ---
    // Dùng div tự vẽ thay cho <select> gốc vì popup của select native
    // không mở được trong webview nhúng của trình chỉnh sửa desktop
    // (chỉ đổi được bằng phím mũi tên lên/xuống khi input đang có focus).
    function setTemplateValue(value) {
        document.getElementById("field-template").value = value;
        var optionEl = document.querySelector('#template-options .custom-option[data-value="' + value + '"]');
        var triggerText = document.getElementById("template-trigger-text");
        if (optionEl) {
            triggerText.textContent = optionEl.textContent;
            document.querySelectorAll("#template-options .custom-option").forEach(function (el) {
                el.classList.toggle("active", el === optionEl);
            });
        } else {
            triggerText.textContent = value;
        }
    }

    function initTemplateSelect() {
        var trigger = document.getElementById("template-trigger");
        var optionsBox = document.getElementById("template-options");
        var options = document.querySelectorAll("#template-options .custom-option");

        function openDropdown() {
            closeAllDropdowns();
            optionsBox.classList.remove("hidden");
            trigger.classList.add("open");
        }
        function closeDropdown() {
            optionsBox.classList.add("hidden");
            trigger.classList.remove("open");
        }
        function toggleDropdown() {
            if (optionsBox.classList.contains("hidden")) openDropdown();
            else closeDropdown();
        }

        trigger.addEventListener("click", function (e) {
            e.stopPropagation();
            toggleDropdown();
        });

        // Vẫn hỗ trợ điều hướng bằng bàn phím khi trigger đang focus
        trigger.addEventListener("keydown", function (e) {
            var values = Array.prototype.map.call(options, function (o) { return o.getAttribute("data-value"); });
            var current = document.getElementById("field-template").value;
            var idx = values.indexOf(current);

            if (e.key === "ArrowDown") {
                e.preventDefault();
                idx = Math.min(values.length - 1, idx + 1);
                setTemplateValue(values[idx]);
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                idx = Math.max(0, idx - 1);
                setTemplateValue(values[idx]);
            } else if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleDropdown();
            } else if (e.key === "Escape") {
                closeDropdown();
            }
        });

        options.forEach(function (optionEl) {
            optionEl.addEventListener("click", function (e) {
                e.stopPropagation();
                setTemplateValue(optionEl.getAttribute("data-value"));
                closeDropdown();
            });
        });

        registerDropdownCloser(closeDropdown);
    }

    // --- Custom dropdown "Ngân Hàng" ---
    // Danh sách được tải trực tiếp từ API công khai của VietQR, có ô tìm kiếm
    // vì danh sách khá dài (khoảng 50-60 ngân hàng).
    function bankLabel(bank) {
        return bank.shortName + " (" + bank.code + ")";
    }

    function setBankValue(code, silent) {
        document.getElementById("field-bank").value = code || "";
        var bank = null;
        for (var i = 0; i < bankList.length; i++) {
            if (bankList[i].code === code) { bank = bankList[i]; break; }
        }
        var triggerText = document.getElementById("bank-trigger-text");
        if (bank) {
            triggerText.textContent = bankLabel(bank);
        } else if (code) {
            triggerText.textContent = code;
        } else if (!silent) {
            triggerText.textContent = "Chọn ngân hàng...";
        }
    }

    function renderBankOptions(list, filterText) {
        var listEl = document.getElementById("bank-options-list");
        var currentCode = document.getElementById("field-bank").value;
        var keyword = (filterText || "").trim().toLowerCase();

        var filtered = list.filter(function (bank) {
            if (!keyword) return true;
            return (
                bank.code.toLowerCase().indexOf(keyword) !== -1 ||
                bank.shortName.toLowerCase().indexOf(keyword) !== -1 ||
                bank.name.toLowerCase().indexOf(keyword) !== -1
            );
        });

        listEl.innerHTML = "";

        if (filtered.length === 0) {
            var emptyEl = document.createElement("div");
            emptyEl.className = "custom-option empty-state";
            emptyEl.textContent = "Không tìm thấy ngân hàng phù hợp.";
            listEl.appendChild(emptyEl);
            return;
        }

        filtered.forEach(function (bank) {
            var optionEl = document.createElement("div");
            optionEl.className = "custom-option";
            optionEl.setAttribute("data-value", bank.code);
            optionEl.textContent = bankLabel(bank);
            if (bank.code === currentCode) optionEl.classList.add("active");
            optionEl.addEventListener("click", function (e) {
                e.stopPropagation();
                setBankValue(bank.code);
                closeBankDropdown();
            });
            listEl.appendChild(optionEl);
        });
    }

    var closeBankDropdown = function () {};

    function initBankSelect(savedBankId) {
        var trigger = document.getElementById("bank-trigger");
        var optionsBox = document.getElementById("bank-options");
        var searchInput = document.getElementById("bank-search");

        function openDropdown() {
            closeAllDropdowns();
            optionsBox.classList.remove("hidden");
            trigger.classList.add("open");
            searchInput.value = "";
            renderBankOptions(bankList, "");
            searchInput.focus();
        }
        function closeDropdown() {
            optionsBox.classList.add("hidden");
            trigger.classList.remove("open");
        }
        closeBankDropdown = closeDropdown;

        trigger.addEventListener("click", function (e) {
            e.stopPropagation();
            if (optionsBox.classList.contains("hidden")) openDropdown();
            else closeDropdown();
        });

        searchInput.addEventListener("click", function (e) { e.stopPropagation(); });
        searchInput.addEventListener("input", function () {
            renderBankOptions(bankList, searchInput.value);
        });
        searchInput.addEventListener("keydown", function (e) {
            if (e.key === "Escape") closeDropdown();
        });

        registerDropdownCloser(closeDropdown);

        // Tải danh sách ngân hàng từ API VietQR (kèm giới hạn thời gian chờ,
        // để nếu API phản hồi quá chậm hoặc bị chặn mạng thì tự chuyển sang
        // danh sách rút gọn thay vì treo mãi ở trạng thái "Đang tải...").
        var TIMEOUT_MS = 6000;
        var timeoutPromise = new Promise(function (resolve) {
            setTimeout(function () { resolve(null); }, TIMEOUT_MS);
        });
        var fetchPromise = fetch(BANKS_API_URL)
            .then(function (res) { return res.json(); })
            .catch(function () { return null; });

        Promise.race([fetchPromise, timeoutPromise])
            .then(function (json) {
                if (json && json.data && json.data.length) {
                    bankList = json.data;
                } else {
                    bankList = FALLBACK_BANKS;
                }
                renderBankOptions(bankList, "");
                setBankValue(savedBankId || (bankList[0] && bankList[0].code));
            })
            .catch(function () {
                bankList = FALLBACK_BANKS;
                renderBankOptions(bankList, "");
                setBankValue(savedBankId || (bankList[0] && bankList[0].code));
            });
    }

    // Đóng mọi dropdown khác đang mở khi mở một dropdown mới, hoặc khi click ra ngoài
    var dropdownClosers = [];
    function registerDropdownCloser(fn) {
        dropdownClosers.push(fn);
    }
    function closeAllDropdowns() {
        dropdownClosers.forEach(function (fn) { fn(); });
    }
    document.addEventListener("click", function () {
        closeAllDropdowns();
    });

    function onSave() {
        var bank = document.getElementById("field-bank").value.trim();
        var account = document.getElementById("field-account").value.trim();
        var template = document.getElementById("field-template").value;
        var name = document.getElementById("field-name").value.trim();
        var desc = document.getElementById("field-desc").value.trim();

        if (!bank || !account) {
            Asc.plugin.executeMethod(
                "ShowError",
                ["Vui lòng chọn Ngân Hàng và nhập Số tài khoản.", 0]
            );
            return;
        }

        var cfg = {
            BANK_ID      : bank,
            ACCOUNT_NO   : account,
            TEMPLATE     : template,
            ACCOUNT_NAME : name,
            DESCRIPTION  : desc
        };

        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
        } catch (e) {
            Asc.plugin.executeMethod("ShowError", ["Không thể lưu cấu hình.", 0]);
            return;
        }

        window.Asc.plugin.executeCommand("close", "");
    }

    function onCancel() {
        // Không lưu gì cả, chỉ đóng cửa sổ
        window.Asc.plugin.executeCommand("close", "");
    }

    // Giữ hàm này để tương thích nếu ONLYOFFICE vẫn gọi button() cho nút đóng (X)
    window.Asc.plugin.button = function (id) {
        window.Asc.plugin.executeCommand("close", "");
    };

})(window, undefined);

