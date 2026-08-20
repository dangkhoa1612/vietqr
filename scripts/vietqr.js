(function (window, undefined) {

    var amount = '';
    var STORAGE_KEY = "vietqr_plugin_config";

    var DEFAULT_CONFIG = {
        BANK_ID       : "ICB",
        ACCOUNT_NO    : "115003018063",
        TEMPLATE      : "compact",
        ACCOUNT_NAME  : "CONG TY TNHH 5EX",
        DESCRIPTION   : "Thanh toan tien hang 5Ex"
    };

    // Kích thước gốc (px) của từng mẫu QR theo tài liệu VietQR,
    // dùng để tính tỉ lệ khung ảnh khi chèn vào ô, tránh bị méo.
    var TEMPLATE_SIZES = {
        "compact2" : { w: 540,  h: 640  },
        "compact"  : { w: 540,  h: 540  },
        "qr_only"  : { w: 480,  h: 480  },
        "print"    : { w: 600,  h: 776  },
        "loax"     : { w: 2583, h: 3719 }
    };

    // Kích thước hiển thị tối đa (px) trong cell — cạnh dài nhất sẽ bằng
    // giá trị này, cạnh còn lại tính theo đúng tỉ lệ của mẫu đã chọn.
    var MAX_DISPLAY_SIZE = 200;

    function getDisplaySize(template) {
        var size = TEMPLATE_SIZES[template] || TEMPLATE_SIZES["compact"];
        var scale = MAX_DISPLAY_SIZE / Math.max(size.w, size.h);
        return {
            width  : Math.round(size.w * scale),
            height : Math.round(size.h * scale)
        };
    }

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

    // Nhận số tiền từ input khi khởi tạo plugin (cell đang chọn)
    window.Asc.plugin.init = function (text) {
        amount = text;
        this.button(-1);
    };

    window.Asc.plugin.button = function (id) {
        // kiem tra data
        var value = Number(String(amount || '').replace(/,/g, ""));
        var valid = (Number.isInteger(value) && value > 0);

        if (!valid) {
            Asc.plugin.executeMethod(
                "ShowError",
                ["Giá trị phải là số nguyên lớn hơn 0.", 0]
            );
        } else {

            var cfg = loadConfig();

            // Tạo URL QR từ VietQR, dùng cấu hình do người dùng thiết lập
            let baseUrl = "https://img.vietqr.io/image/";
            let url = baseUrl + cfg.BANK_ID + "-" + cfg.ACCOUNT_NO + "-" + cfg.TEMPLATE + ".png";
            url += "?amount=" + encodeURIComponent(value);
            url += "&addInfo=" + encodeURIComponent(cfg.DESCRIPTION);
            url += "&accountName=" + encodeURIComponent(cfg.ACCOUNT_NAME);

            // Đóng gói dữ liệu ảnh để chèn vào selection, kích thước theo
            // đúng tỉ lệ khung của mẫu QR đang chọn (compact2/compact/qr_only/print/loax)
            var displaySize = getDisplaySize(cfg.TEMPLATE);
            let imageData = {
                "src": url,
                "width": displaySize.width,
                "height": displaySize.height
            };
            // Chèn ảnh QR vào ô đang chọn
            window.Asc.plugin.executeMethod("PutImageDataToSelection", [imageData]);
        }
        window.Asc.plugin.executeCommand("close", "");
    };
})(window, undefined);
