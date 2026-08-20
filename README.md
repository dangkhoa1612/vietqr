# VietQR Generator

Plugin giúp tạo mã QR thanh toán VietQR ngay trong bảng tính, chỉ với vài thao tác — không cần biết lập trình.

## Plugin làm được gì?

Bạn chọn một ô có ghi số tiền, bấm plugin, một hình ảnh mã QR VietQR sẽ tự động được chèn ngay vào ô đó. Người khác quét mã này bằng app ngân hàng là chuyển tiền được luôn, đúng số tiền, đúng tài khoản, đúng nội dung bạn đã cấu hình sẵn.

## Cài đặt plugin (chỉ làm 1 lần)

1. Mở ONLYOFFICE (bảng tính).
2. Vào tab **Plugin** trên thanh công cụ.
3. Chọn mục thêm plugin, rồi trỏ tới file plugin (đuôi `.plugin`) bạn đã tải về.
4. Sau khi thêm xong, bạn sẽ thấy icon **VietQR Generator** xuất hiện trong tab Plugin.

## Bước 1 — Khai báo thông tin tài khoản nhận tiền

Trước khi dùng lần đầu, bạn cần nhập thông tin tài khoản nhận tiền của mình:

1. Bấm vào mũi tên nhỏ bên cạnh icon **VietQR Generator**, chọn **"Cài đặt"**.
2. Một cửa sổ hiện ra với các ô cần điền:
   - **Ngân Hàng**: bấm vào ô này, một danh sách ngân hàng sẽ hiện ra để bạn chọn (có ô gõ tìm kiếm ở trên để tìm nhanh theo tên ngân hàng, ví dụ gõ "vietcombank" hoặc "ICB"). Không cần nhớ mã ngân hàng nữa.   - **Số tài khoản**: số tài khoản ngân hàng của bạn.
   - **Kiểu QR**: chọn 1 trong 5 mẫu hiển thị có sẵn, xem bảng mô tả bên dưới để chọn mẫu phù hợp.
   - **Tên tài khoản**: tên chủ tài khoản (nên viết IN HOA không dấu, giống như trên thẻ ngân hàng).
   - **Nội dung chuyển khoản**: nội dung sẽ tự động ghi kèm mỗi khi tạo mã QR (ví dụ: "Thanh toan don hang").
3. Bấm **Lưu** để ghi lại. Từ giờ mỗi lần tạo mã QR, plugin sẽ tự dùng đúng những thông tin này.
4. Nếu muốn đổi thông tin sau này, quay lại đúng bước trên, sửa rồi bấm **Lưu** lại là được. Bấm **Hủy** nếu không muốn lưu thay đổi.

> Lưu ý: thông tin này được ghi nhớ riêng trên máy/trình duyệt bạn đang dùng. Nếu bạn mở file này trên một máy khác, bạn cần khai báo lại thông tin một lần ở máy đó.
>
> Danh sách ngân hàng cần có kết nối mạng để tải về khi mở cửa sổ Cài đặt. Nếu máy đang mất mạng, danh sách sẽ chỉ hiện một số ngân hàng phổ biến để bạn vẫn chọn được.

## Bước 2 — Tạo mã QR thanh toán

1. Trong bảng tính, chọn (bấm vào) ô đang chứa số tiền cần thu — số tiền phải là số nguyên dương (ví dụ `500000`).
2. Vào tab **Plugin**, bấm icon **VietQR Generator**.
3. Nếu số tiền hợp lệ, mã QR sẽ tự động xuất hiện ngay trong ô bạn vừa chọn.
4. Nếu ô đang chọn không phải là số hợp lệ (ví dụ để trống, có chữ, hoặc số âm), plugin sẽ báo lỗi và không tạo mã QR — bạn chỉ cần sửa lại giá trị trong ô rồi thử lại.

## Chọn mẫu Kiểu QR nào cho phù hợp?

| Kiểu QR | Phù hợp khi nào |
|---|---|
| `compact2` | Muốn có đầy đủ mã QR, logo và thông tin chuyển khoản, dạng vừa phải |
| `compact` | Muốn mã QR gọn kèm logo VietQR, Napas và logo ngân hàng |
| `qr_only` | Chỉ cần ảnh mã QR đơn giản, không kèm logo hay chữ |
| `print` | Cần bản đầy đủ thông tin để in ra giấy, dán tại quầy |
| `loax` | Dùng cho loa thanh toán / loa thông báo chuyển khoản (ảnh có kích thước lớn) |

Hình ảnh mã QR được tạo ra sẽ luôn đúng tỉ lệ với mẫu bạn chọn, không bị méo hay bóp hình.

## Cần hỗ trợ thêm?

Nếu gặp lỗi khi cài đặt hoặc sử dụng, hãy chụp lại màn hình thông báo lỗi (nếu có) và gửi cho người phụ trách kỹ thuật để được hỗ trợ nhanh hơn.
