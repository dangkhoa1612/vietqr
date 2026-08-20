(function (window, undefined) {    

    var amount = '';

    // Nhận số tiền từ input khi khởi tạo plugin
    window.Asc.plugin.init = function (text) {
        amount = text;
        this.button(-1);
    };

    window.Asc.plugin.button = function (id) {
        //kiem tra data
        var value = Number(amount.replace(/,/g, ""));
        var valid = (Number.isInteger(value) && value > 0);

        if (!valid) {
            Asc.plugin.executeMethod(
                "ShowError",
                ["Giá trị phải là số nguyên lớn hơn 0.", 0]
            );
        } else {

            // Tạo URL QR từ VietQR
            let baseUrl = "https://img.vietqr.io/image/";
            let BANK_ID = "ICB";
            let ACCOUNT_NO = "166095611";
            let TEMPLATE = "compact";
            let ACCOUNT_NAME = "TDK";
            let DESCRIPTION = "DONATE";
            
            let url = baseUrl + BANK_ID + "-" + ACCOUNT_NO + "-" + TEMPLATE + ".png";
            url += "?amount=" + encodeURIComponent(value);
            url += "&addInfo=" + encodeURIComponent(DESCRIPTION);
            url += "&accountName=" + encodeURIComponent(ACCOUNT_NAME);

            // Đóng gói dữ liệu ảnh để chèn vào selection
            let imageData = {
                "src": url,
                "width": 200,   // chỉnh kích thước ảnh QR
                "height": 200
            };
            // Chèn ảnh QR vào ô đang chọn
            window.Asc.plugin.executeMethod("PutImageDataToSelection", [imageData]);
        }
        window.Asc.plugin.executeCommand("close", "");
    };
})(window, undefined);
