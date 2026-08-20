(function (window, undefined) {

    var STORAGE_KEY = "vietqr_plugin_config";

    var DEFAULT_CONFIG = {
        BANK_ID       : "Vpbank",
        ACCOUNT_NO    : "166095611",
        TEMPLATE      : "compact",
        ACCOUNT_NAME  : "TDK",
        DESCRIPTION   : "Donate"
    };

    var VALID_TEMPLATES = ["compact2", "compact", "qr_only", "print", "loax"];

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

        document.getElementById("field-bank").value = cfg.BANK_ID || "";
        document.getElementById("field-account").value = cfg.ACCOUNT_NO || "";
        document.getElementById("field-name").value = cfg.ACCOUNT_NAME || "";
        document.getElementById("field-desc").value = cfg.DESCRIPTION || "";

        var templateValue = (VALID_TEMPLATES.indexOf(cfg.TEMPLATE) !== -1) ? cfg.TEMPLATE : "compact";
        setTemplateValue(templateValue);
        initCustomSelect();

        document.getElementById("field-bank").focus();

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
        var optionEl = document.querySelector('.custom-option[data-value="' + value + '"]');
        var triggerText = document.getElementById("template-trigger-text");
        if (optionEl) {
            triggerText.textContent = optionEl.textContent;
            document.querySelectorAll(".custom-option").forEach(function (el) {
                el.classList.toggle("active", el === optionEl);
            });
        } else {
            triggerText.textContent = value;
        }
    }

    function initCustomSelect() {
        var trigger = document.getElementById("template-trigger");
        var optionsBox = document.getElementById("template-options");
        var options = document.querySelectorAll(".custom-option");

        function openDropdown() {
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

        document.addEventListener("click", function () {
            closeDropdown();
        });
    }

    function onSave() {
        var bank = document.getElementById("field-bank").value.trim();
        var account = document.getElementById("field-account").value.trim();
        var template = document.getElementById("field-template").value;
        var name = document.getElementById("field-name").value.trim();
        var desc = document.getElementById("field-desc").value.trim();

        if (!bank || !account) {
            Asc.plugin.executeMethod(
                "ShowError",
                ["Vui lòng nhập đầy đủ Ngân Hàng và Số tài khoản.", 0]
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
