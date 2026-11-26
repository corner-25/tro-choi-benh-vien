# Cổng trò chơi sự kiện – Bệnh viện Đại học Y Dược TP.HCM

Cổng gồm **11 trò chơi** (với 13 bối cảnh đồ họa sân khấu) tối ưu cho hội nghị 300+ đại biểu, khán giả lớn tuổi, thời lượng 5–10 phút, **không cần điện thoại**, chạy hoàn toàn offline trên trình duyệt.

## Cách chạy

- Mở `index.html` bằng Chrome hoặc Edge (nhấp đúp).
- Hoặc chạy như trang web cục bộ: `python3 -m http.server 8080`, mở `http://localhost:8080`.

## Nhóm 1: Kịch tính trực quan & Trao quà minh bạch

1. **Đua vịt · Khinh khí cầu · Thuyền rồng** (`dua-vit.html`): 3 bối cảnh đường đua đổi theo mùa; đua cá nhân, chia bảng vòng loại → chung kết, đua theo đơn vị (kèm vòng 2); sự kiện bệnh viện; giải vui Vịt về cuối; xuất CSV & In biên bản (PDF).
2. **Thả bi Plinko** (`plinko.html`): Tháp bóng vật lý 2D với rừng chốt phát sáng, 2 tấm bật lò xo nảy mạnh và rãnh Giải Đặc biệt ở đáy; xuất CSV & In biên bản (PDF).
3. **Xổ số Lồng cầu vật lý** (`long-cau.html`): Lồng kính thổi gió xoáy 46 quả cầu vật lý, bóng trúng được hút ngược lên ống thủy tinh kèm chớp sáng; ẩn/hiện tên, hủy vắng mặt, xuất CSV & In biên bản (PDF).
4. **Quay số trúng thưởng** (`quay-so.html`): Máy quay từng ký tự mã nhân viên, nhiều hạng giải có ảnh phần thưởng (có nút bỏ ảnh/dọn ảnh), ẩn/hiện tên, hủy vắng mặt, xuất CSV & In biên bản (PDF).
5. **Vòng quay may mắn** (`vong-quay.html`): Vành 32 bóng đèn LED chạy đuổi, kim đàn hồi bắn tia sáng, zoom sát nút và màn vinh danh cỡ đại; quay theo cột Đơn vị hoặc danh sách tự nhập; xuất CSV & In biên bản (PDF).
6. **Mở Hộp Bí Ẩn** (`hop-bi-an.html`): 12–20 vali bí ẩn ẩn phần thưởng & thẻ đặc quyền (*Nhân đôi*, *Mở thêm 1 hộp*), rung hồi hộp kèm trống dồn rồi bật nắp 3D.

## Nhóm 2: Gắn kết hội trường & Văn hóa Bệnh viện

7. **Đố vui giơ thẻ A/B** (`do-vui.html`): Giơ thẻ màu Xanh (A) / Cam (B) hoặc 4 lựa chọn A/B/C/D; đồng hồ tròn thể thao, đèn quét trống dồn lật 3D đáp án đúng, trợ giúp 50:50 và cột điểm năng lượng khu vực.
8. **Đoán con số bệnh viện** (`doan-so.html`): Bảng lật từng chữ số cơ khí kết hợp **Thước đo Radar Canvas 2D** tự động phát sóng tìm khu vực đoán sát nhất.
9. **Ngày ấy – Bây giờ** (`ngay-ay-bay-gio.html`): Lưới 9 mảnh ghép 3D lật mở dần ảnh xưa, chớp máy ảnh và thanh rèm ánh sáng quét mượt so sánh Trước – Sau.
10. **Lật Ô Chữ Hội nghị** (`o-chu.html`): Gõ chữ cái không dấu A–Z tự động lật 3D liên hoàn mọi chữ cái có dấu tương ứng của các từ khóa ý kiến hội nghị.
11. **Đuổi hình bắt chữ Bệnh viện** (`duoi-hinh.html`): 8 câu đố hoạt họa trực tiếp 60fps về đời sống bệnh viện (*Trực đêm*, *Kẹt thang máy*, *Cấp cứu*, *Chuyển đổi số*…) và hỗ trợ tải ảnh riêng.

## Kiểm thử

```
node --test tests/dua-vit.test.cjs tests/quay-so.test.cjs tests/tro-choi-moi.test.cjs
```
