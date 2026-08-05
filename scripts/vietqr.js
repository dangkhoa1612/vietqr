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
            Asc.plugin.executeMethod("ShowError",["Invalid data.", 0]);
        } else {

            // Tạo URL QR từ VietQR
            let baseUrl = "https://vietqr.app/img?";
            let params =
                "acc=166095611" + //Số tài khoản ngân hàng (bắt buộc).
                "&bank=Vpbank" + //Code ngân hàng hoặc Short_name của ngân hàng (bắt buộc). 
                "&amount=" + encodeURIComponent(amount) + //Số tiền cần chuyển.
                "&des=" + encodeURIComponent("Donate") + //Nội dung chuyển khoản.
                "&template=compact"; //style: compact, qronly hoặc standee 

            let url = baseUrl + params;

            // Đóng gói dữ liệu ảnh để chèn vào selection
            let imageData = {
                "src": url,
                "width": 200,   // chỉnh kích thước ảnh QR
                "height": 200   // chỉnh kích thước ảnh QR
            };
            // Chèn ảnh QR vào ô đang chọn
            window.Asc.plugin.executeMethod("PutImageDataToSelection", [imageData]);
        }
        window.Asc.plugin.executeCommand("close", "");
    };
})(window, undefined);

