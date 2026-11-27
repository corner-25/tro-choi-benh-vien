# Tài liệu phát triển – Cổng trò chơi sự kiện

Tài liệu bàn giao cho người (hoặc agent AI) phát triển tiếp. Đọc hết trước khi sửa code.
`README.md` là hướng dẫn sử dụng; file này nói **vì sao làm vậy, đã làm gì, quy ước nào phải giữ, việc gì còn dở và ý tưởng tiếp theo**.

---

## 1. Bối cảnh và người dùng

- **Đơn vị:** Bệnh viện Đại học Y Dược TP.HCM. Dùng ở hội nghị Đại biểu Viên chức – Người lao động, giao ban cuối năm, các sự kiện nội bộ.
- **Người điều khiển:** MC hoặc cán bộ Phòng Hành chính, Công đoàn. Chiếu từ **một laptop** lên máy chiếu hoặc màn hình lớn.
- **Khán giả:** khoảng 300 người hoặc hơn, **đa số lớn tuổi**. Họ ngồi xem và cổ vũ, không thao tác trên điện thoại.
- **Thời lượng:** chen vào lúc chờ kiểm phiếu, khoảng 5–10 phút.
- **Điều kiện hội trường:** mạng không tin cậy, nên phải chạy **offline hoàn toàn**.

Hệ quả thiết kế (bắt buộc giữ):

1. Chữ to, tương phản cao, đọc được từ hàng ghế cuối. Luật chơi giải thích được trong một câu.
2. Không bắt người chơi dùng điện thoại hay quét QR.
3. Kết quả phải **công bằng, ngẫu nhiên thật, minh bạch**: có lịch sử và file kết quả để làm biên bản trao quà.
4. Không cần máy chủ, không database, không backend.

## 2. Đã làm gì (theo thứ tự)

| Thời điểm | Nội dung |
|---|---|
| 25/11/2026 | Bản đua vịt đầu tiên: nhập danh sách, đua, công bố, lịch sử, xuất CSV. |
| 25/11/2026 | Sửa lỗi kết quả tính cả vịt về đích trong lúc chờ công bố (ra 74 người thay vì 3). |
| 25/11/2026 | Chỉ ghi mã cho 12 con dẫn đầu (trước đó 300 nhãn chồng nhau). |
| 25/11/2026 | Làm lại logic đua cho hấp dẫn: địa hình (dòng xiết, xoáy nước), nước rút, cản con dẫn đầu, quay chậm khi sát nút, bình luận trực tiếp, bảng dẫn đầu có mũi tên và khoảng cách. |
| 25/11/2026 | Đổi giao diện: thử nền tối kiểu truyền hình, người dùng chê tối, chuyển sang **nền sáng** (giữ phong cách đồ họa thể thao). |
| 25/11/2026 | Sửa "đầu trên bị hụt": chừa lề trong lòng sông để vịt làn trên không chui dưới thanh thông tin. |
| 25/11/2026 | **Gộp thành cổng trò chơi**: trang chủ có danh sách người chơi dùng chung; thêm trò **Quay số trúng thưởng** (thiết kế lại từ dự án "giao ban cuối năm", chỉ lấy ý tưởng). |
| 25/11/2026 | Bảng dẫn đầu giữ nguyên phần tử từng dòng, đổi vị trí bằng transform để không chồng chữ. |
| 25/11/2026 | Nâng cấp cổng: chủ đề màu nhấn sự kiện, in biên bản A4/PDF (`bien-ban.js`); Đua vịt thêm chế độ chia bảng vòng loại–chung kết, đua theo đơn vị (kèm vòng 2), sự kiện bệnh viện, giải vịt về cuối, chống chồng nhãn mã và tránh bảng dẫn đầu che vạch đích; Quay số thêm dọn ảnh giải; thêm 4 trò mới không cần điện thoại (**Vòng quay may mắn**, **Đố vui giơ thẻ A/B**, **Đoán con số bệnh viện**, **Ngày ấy – Bây giờ**). Không làm trò đo tiếng ồn theo yêu cầu người dùng. |
| 25/11/2026 | Làm lại toàn bộ 4 trò mới chuẩn sân khấu gameshow nhiều hiệu ứng (Vòng quay đèn LED + kim lò xo + zoom sát nút; Đố vui trống dồn + lật 3D + đồng hồ tròn; Đoán số bảng lật cơ khí + thước đo Radar Canvas 2D; Ngày ấy – Bây giờ mảnh ghép 3D + rèm ánh sáng so sánh Trước–Sau); bổ sung thêm 5 trò & biến thể mới: **Thả bi Plinko** vật lý 2D, **Xổ số Lồng cầu vật lý**, **Mở Hộp Bí Ẩn** bật nắp 3D, bối cảnh **Khinh khí cầu & Thuyền rồng** trong Đua vịt, **Lật Ô Chữ Hội nghị** 3D và **Đuổi hình bắt chữ** hoạt họa 60fps. |

Phản hồi của người dùng cần nhớ:

- Không thích giao diện **"sến"** (vàng kem, viền dày, emoji, kiểu thiệp) và không thích **nền tối**. Muốn sáng, sạch, nhiều hiệu ứng đẹp nhưng không rối.
- Muốn trò chơi **có kịch tính**: thấy được vì sao thứ hạng thay đổi, chứ không chỉ ngẫu nhiên khó hiểu.

## 3. Công nghệ

- **HTML, CSS, JavaScript thuần (ES5–ES2017).** Không framework, không bước build, không npm cho phần chạy.
- **Script cổ điển dạng IIFE**, gắn vào `window.<TenModule>`. **Không dùng ES modules**, vì mở trực tiếp bằng `file://` thì Chrome chặn module. Module logic thuần còn xuất `module.exports` để test bằng Node.
- **Canvas 2D** cho đường đua vịt và pháo giấy. **CSS transform** cho cuộn quay số và bảng dẫn đầu.
- **Web Audio API** tự tạo âm thanh, không có file âm thanh (`js/chung/am-thanh.js`).
- **ExcelJS 4.4.0** (MIT) để đọc `.xlsx`, lưu sẵn ở `vendor/exceljs.min.js` để chạy offline. **Không tải thư viện từ CDN.**
- **localStorage** để lưu dữ liệu, tiền tố khóa `umc-tro-choi:`.
- **Ngẫu nhiên:** `crypto.getRandomValues`, có PRNG hạt giống (`rngHatGiong`) chỉ dùng trong test.
- **Test:** `node:test` (Node 22) cho logic thuần. Kiểm thử trình duyệt bằng Playwright (`playwright-core`, dùng Chrome cài sẵn trên máy, `channel: "chrome"`). Script e2e chưa lưu trong repo, xem mục 8.

## 4. Cấu trúc

```
index.html            Trang chủ cổng: tên sự kiện, danh sách người chơi dùng chung, thẻ chọn trò
dua-vit.html          Trò đua vịt (bàn điều khiển, màn đua, màn công bố, hộp lịch sử)
quay-so.html          Trò quay số (bàn điều khiển, sân khấu)
css/chung.css         Biến màu, chữ, nút, form, công tắc, thông báo, hộp thoại – dùng chung
css/cong.css          Riêng trang chủ
css/dua-vit.css       Riêng đua vịt (HUD, bảng dẫn đầu, đếm ngược, công bố)
css/quay-so.css       Riêng quay số (danh sách giải, sân khấu, máy quay)
js/chung/
  danh-sach.js        Đọc danh sách (dán, CSV, dòng Excel), nhận cột theo tiêu đề, báo mã trùng. THUẦN + test
  luu-tru.js          localStorage: danh sách chung, tên sự kiện, trạng thái từng trò; tải CSV an toàn
  nap-danh-sach.js    Khung nạp danh sách (file, dán, mẫu) – dùng ở trang chủ
  am-thanh.js         Âm thanh Web Audio: đếm ngược, quạc, về đích, tick/cạch máy quay, nhạc nền…
  phao.js             Pháo giấy canvas
js/cong.js            Điều phối trang chủ
js/dua-vit/
  dua.js              Mô phỏng cuộc đua. THUẦN + test
  ve-nen.js           Vẽ nước, bờ, phao chia làn, dòng xiết, xoáy nước, mốc, vạch đích
  ve-vit.js           Vẽ vịt, vệt sóng, hạt bọt và vòng gợn
  ve.js               Dựng cảnh, camera bám nhóm dẫn đầu, zoom, nhãn mã, lớp phủ ảnh về đích, thanh tiến độ
  luot-dua.js         Điều khiển một lượt: đếm ngược, vòng lặp, quay chậm, bình luận, bảng dẫn đầu
  binh-luan.js        Câu bình luận theo sự kiện
  ket-qua.js          Công bố từ hạng thấp lên hạng 1, bảng lịch sử
  app.js              Điều phối trang đua vịt
js/quay-so/
  quay.js             Logic: suất còn lại, lồng quay, bốc, bộ ký tự cuộn, xuất CSV. THUẦN + test
  may-quay.js         Máy quay: mỗi ký tự một cuộn, dừng lần lượt
  anh-giai.js         Thu nhỏ ảnh phần thưởng thành data URL, kiểm tra data URL hợp lệ
  cau-hinh-giai.js    Sửa danh sách giải trên bàn điều khiển
  app.js              Điều phối trang quay số
tests/                dua-vit.test.cjs, quay-so.test.cjs (17 test)
du-lieu-mau/          danh-sach-mau.csv – 320 người, DỮ LIỆU GIẢ
vendor/               exceljs.min.js + giấy phép
assets/logo.png       Logo bệnh viện
```

Thứ tự nạp script quan trọng: module dùng chung, rồi module vẽ và logic, cuối cùng là `app.js`. Thêm file mới thì phải thêm thẻ `<script defer>` vào đúng trang HTML. Đã từng quên một thẻ và trang không chạy.

## 5. Quy ước bắt buộc

### Ngôn ngữ và đặt tên

- Giao diện và chú thích **tiếng Việt có dấu, viết đầy đủ, không viết tắt**.
- **Tên biến, hàm: tiếng Việt không dấu**, camelCase (`taoCuocDua`, `nguoiConDua`, `veNhan`). Hằng số viết `UPPER_SNAKE`. **Không dùng ký tự có dấu trong định danh** (đã từng phải sửa `kéoNhom`, `bờTren`).
- Lớp CSS dạng kebab-case tiếng Việt không dấu (`.bang-xh`, `.kq-the`, `.sk-may`).

### An toàn dữ liệu

- Dữ liệu người dùng (tên, mã, đơn vị, tên giải) **chỉ đưa vào DOM bằng `textContent`**. Không dùng `innerHTML` với dữ liệu.
- Xuất CSV dùng `LuuTru.oCsv` để chặn công thức Excel (ô bắt đầu bằng `= + - @`) và có BOM UTF‑8.
- Ảnh phần thưởng: chỉ nhận PNG, JPG, WEBP, GIF, thu nhỏ còn 560 px. Khi đọc lại từ lưu trữ phải qua `AnhGiai.hopLe`.
- Không ghi cứng danh sách nhân viên thật trong code. Dữ liệu mẫu phải là dữ liệu giả (mã `MAU-xxx`).
- Mọi `localStorage` bọc `try/catch`. Trang phải chạy được cả khi trình duyệt chặn lưu trữ.

### Công bằng

- Mọi bốc ngẫu nhiên dùng `crypto.getRandomValues`. Không dùng `Math.random` cho kết quả (chỉ dùng cho hiệu ứng).
- Đua vịt: làn bơi của từng vịt xáo ngẫu nhiên mỗi lượt; mọi vịt chung một luật. Có test chi-square cho phân bố người thắng.
- Quay số: bốc đều trong lồng quay; có test chi-square.
- **Kết quả đua không tính trước.** Số ngẫu nhiên bốc trong lúc đua, thứ hạng chỉ chốt khi qua vạch đích. Giữ nguyên tính chất này; nếu đổi, phải nói rõ với người dùng.
- Chỉ lấy đúng số người thắng (`slice(0, soThangLuot)`). Vịt về đích trong lúc chờ công bố không được tính.

### Hiệu năng (máy chiếu, laptop yếu, 300+ vịt)

- Hoạt ảnh chỉ dùng `transform` và `opacity` (cuộn quay, bảng dẫn đầu, thẻ kết quả).
- Canvas chỉ vẽ vịt nằm trong khung nhìn; tối đa 1.500 hạt.
- `devicePixelRatio` giới hạn ở 2.
- Có `prefers-reduced-motion`.

## 6. Phong cách giao diện

**Hướng thiết kế:** đồ họa truyền hình thể thao, **nền sáng**. Nền trắng ngà, chữ mực đậm, một màu nhấn chữ là xanh dương, màu xanh chanh làm nền nhấn cho vị trí dẫn đầu hoặc hạng 1. Không emoji, không gradient sặc sỡ, không kiểu thiệp Tết.

Biến màu (khai báo trong `css/chung.css`, `:root`):

| Biến | Giá trị | Dùng cho |
|---|---|---|
| `--nen` | `#f4f6f9` | Nền trang |
| `--be-mat` | `#ffffff` | Thẻ, bảng |
| `--chu` | `#0c1322` | Chữ chính, thẻ tab đang chọn, khung máy quay |
| `--chu-phu` | `#5b6577` | Chữ phụ, nhãn |
| `--xanh` | `#0b4fd6` | Màu nhấn chữ, nút chính, số liệu |
| `--chanh` | `#d4ff3a` | Nền nhấn: dẫn đầu, hạng 1 (**không dùng làm màu chữ trên nền trắng**) |
| `--chanh-dam` | `#65a30d` | Viền, mũi tên lên |
| `--vang`, `--dong` | `#d4a017`, `#c2763a` | Hạng 2, hạng 3 |
| `--do` | `#e53935` | Chấm trực tiếp, hủy giải, xoáy nước |

- **Chữ:** `system-ui` (Inter nếu máy có) cho nội dung; **chữ đều nét** (`ui-monospace`) cho mã nhân viên, đồng hồ, số liệu. Tiêu đề đậm 800–850, chữ khít (`letter-spacing` âm).
- **Nước sông:** `#2a8fd0` → `#62c6f0`, bờ cỏ `#cfe8bf`. Dòng xiết màu xanh ngọc `rgb(16,185,129)`, xoáy nước màu đỏ.
- **Bố cục màn chiếu:** thanh trên 104 px (tên sự kiện, lượt, đồng hồ), thanh dưới 92 px (bình luận, tiến độ), bảng dẫn đầu kính mờ bên phải.
- **Bàn điều khiển của MC:** thẻ trắng bo 14 px, bóng nhẹ; công tắc thay cho ô tích; hiện phím tắt.
- **Hiệu ứng đang có:**
  - Đua vịt: ánh sáng gợn trên mặt nước, vệt sóng sau đuôi vịt, bọt nước khi bứt tốc, vòng gợn khi chững hoặc vào xoáy; camera zoom ở chặng nước rút; quay chậm và khung ngắm khi sát nút; chớp sáng khi về đích.
  - Màn công bố: đèn sân khấu quét, thẻ hiện ra kèm ánh quét, pháo giấy.
  - Quay số: cuộn mờ khi đang quay, viền chanh lóe lên khi dừng, ảnh phần thưởng nổi lơ lửng, các đốm màu nền trôi.

## 7. Thông số có thể chỉnh

**Đua vịt – `js/dua-vit/dua.js` (`MAC_DINH`):**

| Thông số | Mặc định | Ý nghĩa |
|---|---|---|
| `soLan` | 10 | Số làn bơi |
| `soDongXiet` / `soXoayNuoc` | 3 / 3 | Số vùng địa hình |
| `nuocRut` | 0.85 | Từ 85% đường đua là nước rút |
| `heSo` | [0.6, 1.4] | Biên tốc độ ngẫu nhiên |
| `xacSuatBut` / `xacSuatChungLai` | 0.06 / 0.05 | Khả năng bứt tốc hoặc chững lại mỗi lần đổi nhịp |
| `keoNhom` | 0.9 | Đẩy con tụt xa để đàn vịt không dàn quá rộng |
| `canDauDan` | 0.04 | Cản con dẫn đầu để có nhiều lần đổi ngôi |

**Đua vịt – `js/dua-vit/luot-dua.js`:** `NGUONG_SAT_NUT` = 0.012, `CHAM_TOI_DA` = 0.3, `CHO_SAU_VE_DICH` = 2200 ms, `SO_NHAN` = 12 nhãn, `TOP_BANG` = 10.

**Quay số – `js/quay-so/may-quay.js`:** thời gian quay mỗi cuộn là 1500 + i × 320 ms, cuộn cuối cộng thêm 1100 ms; chế độ nhanh (quay hết giải) là 700 + i × 110 ms.

Đổi thông số đua thì chạy lại test, đặc biệt test công bằng và test "trung bình từ 4 lần đổi ngôi trở lên".

## 8. Kiểm thử

```
node --test tests/dua-vit.test.cjs tests/quay-so.test.cjs
```

Kiểm thử trình duyệt đã làm (script để ở thư mục tạm, chưa đưa vào repo):

- Mở `file://.../index.html`, xóa localStorage, nạp danh sách mẫu.
- Đua vịt 20 giây, chụp màn hình lúc đang đua, lúc sát nút, lúc công bố.
- Quay số: dùng bộ giải mẫu, gắn ảnh, quay 1 suất, hiện tên, hủy, quay hết 10 suất, xuất CSV.
- Kiểm tra không có lỗi console; khung hình 1920×1080 và 1280×720.

Việc nên làm: đưa script Playwright vào `tests/e2e/` kèm hướng dẫn chạy.

## 9. Việc còn dở và lưu ý

- **Âm thanh chưa nghe thật trên loa** (đếm ngược, quạc, nước rút, sát nút, tick và cạch của máy quay). Cần chỉnh âm lượng tại hội trường.
- Ở khung 1280×720, vạch đích có thể bị bảng dẫn đầu che khoảng 1 giây khi mới xuất hiện.
- Nhãn mã của các vịt sát nhau vẫn có thể chồng lên nhau một phần.
- Bảng dẫn đầu: khi hai dòng đổi chỗ, chữ chồng nhau một thoáng (khoảng 260 ms). Lần sửa cuối chưa chạy lại trên trình duyệt.
- localStorage giới hạn khoảng 5 MB; nhiều ảnh phần thưởng lớn có thể làm đầy. Trang đã báo lỗi khi không lưu được, nhưng chưa có công cụ dọn ảnh.
- Chưa có chế độ **trình chiếu hai màn hình** (MC điều khiển trên laptop, khán giả xem màn hình riêng).
- Chưa có bản in hoặc biên bản dạng PDF; hiện chỉ có CSV.
- Trình duyệt mục tiêu là Chrome và Edge. Safari, Firefox chưa kiểm tra kỹ (localStorage trên `file://` có thể khác).

## 10. Ý tưởng phát triển tiếp (đã bàn với người dùng)

Nguyên tắc chọn: hợp **khán giả lớn tuổi**, **300+ người**, **5–10 phút**, **không cần điện thoại**, chạy offline.

### Cho đua vịt
- **Đua theo bảng**: chia 300 người thành 6 bảng × 50 vịt, mỗi bảng lấy 2 người, rồi 12 người vào chung kết. Tổng khoảng 7–8 phút.
- **Màn "đại hồng thủy"**: cả 300 vịt đua một lần làm màn mở đầu, rồi mới chia bảng.
- **Đua theo đơn vị hoặc khối** (63 vịt cho 63 đơn vị, hoặc theo khối Nội, Ngoại, Cận lâm sàng, Phòng ban); kết hợp hai vòng: vòng 1 chọn khoa may mắn, vòng 2 đua giữa các đại biểu của khoa đó.
- **Sự kiện mang chất bệnh viện** trên đường đua: "kẹt thang máy" (đứng yên 2 giây), "được tăng ca" (tăng tốc), "hết thẻ gửi xe" (lùi lại), "trực 24/24" (chậm dần). Lấy từ khóa trong word cloud ý kiến của hội nghị.
- **Giải "vịt về cuối"** cho vui.
- **Biệt danh vịt**: "Vịt Cấp Cứu – 24/7", "Vịt Xét Nghiệm – chính xác từng giọt".
- **Vòng dự đoán**: hội trường đoán vịt nào về nhất trước khi đua.

### Trò mới không cần điện thoại
- **Đố vui giơ thẻ A/B**: phát giấy hai màu hoặc giơ tay; câu hỏi hai lựa chọn về lịch sử bệnh viện, nơi người lớn tuổi có lợi thế.
- **"Ngày ấy – bây giờ"**: chiếu ảnh cũ của bệnh viện hoặc khoa phòng, hội trường đoán năm hoặc địa điểm. Gợi nhớ, gắn kết.
- **Đoán con số bệnh viện**: số viên chức, lượt khám mỗi ngày, số ý kiến hội nghị…; lật đáp án với hiệu ứng số chạy. Có thể chia hội trường thành 2–4 khu thi đấu.
- **Word cloud đoán từ**: che dần từ khóa trong word cloud ý kiến, hội trường đoán từ được nhắc nhiều nhất.
- **Ai là triệu phú phiên bản bệnh viện**: mời 2–3 đại biểu lên chơi, có trợ giúp "hỏi ý kiến hội trường".
- **Xổ số lồng cầu**: quay từng chữ số chậm để tạo hồi hộp.
- **Vòng quay may mắn** theo đơn vị hoặc số ghế; có thể ghép với đố vui: trả lời đúng thì được quay.
- **Đo độ ồn cổ vũ**: laptop đo âm lượng hội trường, khu nào hô to nhất thì thanh năng lượng trên màn hình đầy nhất. **Kéo co ảo**: hai nửa hội trường vỗ tay, sợi dây kéo về phía ồn hơn. Cần quyền dùng micro.
- **Không nên** với khán giả lớn tuổi: "đúng hay sai đứng lên ngồi xuống" nhiều lần (đổi thành giơ tay), trò cần phản xạ nhanh hoặc luật phức tạp.

### Trò cần điện thoại (chỉ khi hội trường có wifi tốt, cần máy chủ)
- Đố vui trực tiếp kiểu Kahoot, bình chọn trực tiếp, đua vịt điều khiển bằng điện thoại. Các trò này **trái với ràng buộc "không backend"**, phải bàn lại với người dùng trước khi làm.

### Nâng cấp cổng trò chơi
- Chế độ hai màn hình (trang điều khiển và trang trình chiếu đồng bộ qua `BroadcastChannel`, vẫn không cần máy chủ).
- Biên bản kết quả dạng in được hoặc PDF, có chỗ ký xác nhận.
- Nhập ảnh hoặc logo sự kiện, đổi màu nhấn theo sự kiện (Tết, hội nghị).
- Đưa test Playwright vào repo.

## 11. Liên quan

- Dự án quay số cũ (chỉ tham khảo ý tưởng, **không sửa**): `~/Library/Mobile Documents/com~apple~CloudDocs/Desktop/giao ban cuoi nam`. Bản cũ ghi cứng họ tên nhân viên thật và tải thư viện từ CDN; không chép những phần đó.
- Portal hội nghị chính (Next.js, không liên quan đến code ở đây): `~/Desktop/VC-NLĐ`.

## 12. Đợt nâng cấp 3 trò trọng tâm (25/11/2026)

Người dùng muốn tập trung vào **Đua (vịt, khinh khí cầu, thuyền rồng)**, **Xổ số Lồng cầu** và **Đuổi hình bắt chữ**.

### Nhận diện UMC
- `js/chung/umc-logo.js`: biểu tượng vuông của logo bệnh viện (tách từ `public/brand/logo-ngang.png` của portal hội nghị), nhúng sẵn dạng data URL (`window.UMC.lon`, `window.UMC.nho`) để vẽ lên canvas khi mở bằng `file://`. Ảnh gốc: `assets/umc-bieu-tuong.png`. Trang nào vẽ logo trên canvas phải nạp script này.
- Màu UMC dùng trên nhân vật: xanh `#2457a8`, xanh ngọc `#4fc6f0`.

### Đua (js/dua-vit/ve-vit.js)
- Nhân vật được vẽ một lần vào **sprite đệm** (theo loại, tông màu, kích thước, khung hình) rồi `drawImage`. Đo được khoảng 62 khung hình/giây với 320 nhân vật ở cả 3 bối cảnh.
- **Vịt UMC**: khăn quàng xanh UMC, huy hiệu UMC trên cánh.
- **Khinh khí cầu UMC**: múi xanh UMC – trắng – màu nhấn riêng từng quả, huy hiệu UMC giữa thân, giỏ mây, lửa đốt khi bứt tốc. Không vẽ vệt sóng nước; nhãn mã đặt cao hơn.
- **Thuyền rồng Việt**: thân sơn mài (đỏ son, xanh UMC, ngọc, đen then…) viền vàng, vảy rồng; đầu rồng thân uốn chữ S, bờm lửa, sừng, râu, ngọc; đuôi lửa; 6 tay chèo áo xanh UMC khăn đỏ, mái chèo nhúng nước theo nhịp (8 khung hình); tay trống và trống; cờ UMC ở đuôi; huy hiệu UMC ở mũi. Mặt sông dùng **hoa văn sóng nước truyền thống** (`veSongNuocCo` trong ve-nen.js).
- Chữ trên HUD và bình luận đổi theo bối cảnh (vịt, khinh khí cầu, thuyền rồng).

### Xổ số Lồng cầu (js/long-cau/ve-long.js – viết lại toàn bộ)
- Ý tưởng: **lồng cầu đồng quay tay của xổ số kiến thiết Việt Nam** thay cho lồng kính thổi gió.
- Khung nan 3D (kinh tuyến xoay quanh trục ngang, vĩ tuyến cố định), tay quay núm đỏ, cột đỡ, bệ sơn mài xanh có hoa văn sóng nước và huy hiệu UMC.
- Quả cầu va chạm 2D, nan lồng kéo theo chiều quay.
- Hiệu ứng: tia sáng xoay, đốm bokeh, vệt mờ khi quay nhanh, cửa lồng mở, cầu rơi qua ống kính vào chén vàng, rồi bay lên thành **quả cầu ánh sáng** mang mã trúng (hào quang, vòng sóng, tia lóe).
- Chế độ cao trào = **suýt trúng**: một quả lăn tới cửa rồi bật ngược vào.
- Giữ nguyên API cũ `VeLong.tao(canvas, amThanh) → { napDanhSach, bocToi, dangBoc, dung }` và các pha `thoi`, `hut-hut`, `hut`, `xong` nên `app.js` không phải sửa logic, chỉ đổi chữ bình luận.
- Kết quả bốc vẫn do `app.js` và `long-cau.js` quyết định; phần vẽ chỉ diễn lại mã đã bốc.

### Đuổi hình bắt chữ (viết lại theo đúng nghĩa chơi chữ đồng âm)
- `duoi-hinh.js`: `boMau()` là **10 câu chơi chữ** (canhId `tranh:<tên>`): Công đoàn, Tăng ca, Thang máy, Băng gạc, Ống nghe, Siêu âm, Phòng mổ, Thuốc bổ, Trực đêm, Đại biểu. Bộ hoạt họa cũ còn ở `boHoatHoa()`. Thêm `chonChuGoiY` và `diemThuong` (3/2/1 điểm), có test.
- `ve-tranh.js`: vẽ theo **phong cách tranh Đông Hồ**: nét viền đen đậm, màu son, nghệ, chàm, lá, vạch khắc gỗ; nền giấy điệp óng ánh; khung gỗ; 12 **mảnh gỗ khắc hoa thị** che hình, lật dần; **dấu son "ĐÚNG"** khi lật đáp án. Câu có ảnh riêng thì vẽ ảnh; câu hoạt họa cũ dùng `ve-hinh.js` trên canvas thứ hai.
- Sân khấu: đồng hồ **ống tre**, gợi ý dạng cuộn giấy có gạch chân nét bút son, ô chữ là **khối gỗ lật thành dấu son**, gợi ý chữ cái (phím H), **chấm điểm 2–4 đội** (phím 1–4, thẻ gỗ).

### Bản sao lưu trước khi viết lại
Các file cũ của lồng cầu và đuổi hình từng được sao lưu ở thư mục tạm của phiên làm việc. Ngày 26/11/2026 thư mục tạm đó **đã bị hệ thống dọn**, nên bản sao lưu không còn. Thư mục dự án chưa có git; nên chạy `git init` và commit để giữ lịch sử từ đây.

### Ý tưởng tiếp cho 3 trò này
- Đua: bối cảnh thứ tư **ghe ngo / ghe đua miền Tây**; khán giả hai bờ sông (cờ hội, trống); khinh khí cầu có bầu trời hoàng hôn và đèn lồng.
- Lồng cầu: chế độ **nhiều lồng** (mỗi lồng một giải); bốc từng chữ số bằng nhiều quả cầu (đúng kiểu xổ số kiến thiết); âm thanh lục cục khi quay.
- Đuổi hình: thêm câu chơi chữ (Viện phí, Hồi sức, Nội trú, Giao ban…); vòng **"Tranh ghép 3 hình"** khó hơn; MC đọc giải thích có giọng đọc; chế độ đội bấm chuông (phím riêng từng đội, ai bấm trước khóa lượt).

## 13. Đuổi hình bắt chữ: 25 câu, 3 mức độ (26/11/2026)
- **File mới `js/duoi-hinh/hinh-them.js`** (nạp sau `ve-tranh.js`): thêm 22 hình Đông Hồ vào `VeTranh.HINH` và 15 câu vào `VeTranh.CAU`. `ve-tranh.js` nay xuất `VeTranh.HINH`, `VeTranh.CAU`, `VeTranh.MAU` và bộ bút `VeTranh.but` (net, to, vachKhac, eli, tron, chuNhat) để file khác vẽ thêm.
- **15 câu mới**: Tim mạch (trái tim + lúa mạch), Cấp cứu (bậc cấp + phao cứu sinh), Máy thở (bánh răng + con thỏ), Băng ca (tảng băng + cái ca), Gửi xe (phong bì + xe đạp), Chấm công (chén nước chấm + con công), Ca trực (cái ca + trực thăng), Bác sĩ (ông bác + quân sĩ cờ tướng), Nghỉ bù (nằm võng + bù nhìn), Nghỉ phép (nằm võng + đũa phép), Nội soi (bà nội + kính lúp), Nội trú (bà nội + người trú mưa), Hồi sức (hoa hồi + lực sĩ cử tạ), Y tá (chữ Y + một tá trứng), Khẩu trang (cái miệng + trang sách).
- **Mức độ**: trường `mucDo` ("de" | "vua" | "kho" | rỗng) trong `chuanHoa`. `boMau(mucDo)` trả 25 câu xếp dễ → khó (12 dễ, 9 vừa, 4 khó) hoặc lọc theo mức. Thêm `tenMucDo()` và `xepTheoMucDo()` (sắp ổn định, câu chưa phân loại xuống cuối, không sửa mảng gốc).
- **Bàn điều khiển**: ô chọn mức trước khi nạp bộ có sẵn; nút ghi đúng số câu sẽ nạp; mỗi câu có ô chọn mức (câu MC tự thêm cũng gán được); nút "Xếp lại từ dễ đến khó".
- **Sân khấu**: thẻ "Mức dễ / vừa / khó" cạnh dấu son số câu, màu lá – nghệ – son.
- Danh sách đã lưu trong trình duyệt **không tự đổi**: muốn có 25 câu thì bấm nút nạp lại.
- Test: thêm 1 test (không trùng tranh và đáp án, thứ tự mức, lọc, mức lạ bị bỏ, xếp lại không sửa mảng gốc); tổng 32 test đều đạt.

### Ý tưởng tiếp
- Viện phí, Giao ban, Hội chẩn, Xét nghiệm… cần hình đồng âm dễ nhận ra hơn trước khi thêm.
- Vòng "tranh ghép 3 hình" cho mức khó; chế độ đội bấm chuông.

## 14. Đuổi hình bắt chữ: mảnh che logo, đề thi theo mức, ghi tên, vinh danh (26/11/2026)
- **Mảnh che mang biểu tượng Bệnh viện**: `ve-tranh.js` → `veMatManh()` vẽ mặt giấy sáng viền gỗ, giữa là `window.UMC.lon` (cần `js/chung/umc-logo.js`, đã thêm vào `duoi-hinh.html`). Ảnh chưa nạp thì tạm vẽ hoa thị. Các mảnh phủ chồng 0,5 px để không lộ hình qua khe.
- **Bộ câu và lượt thi tách riêng**: `tt.ds` là bộ câu (ngân hàng). `tt.cauHinh.deThi = { de, vua, kho, khac }` là số câu mỗi mức của một lượt. Bấm "Bắt đầu lượt thi mới" thì `DuoiHinh.taoDeThi()` bốc ngẫu nhiên (crypto) và lưu `tt.luot = { ids, ketQua: { id: { ten, diem } }, viTri, xong }`. Lượt mới đưa điểm đội về 0; lượt dở có ghi tên thì hỏi trước.
- Thiết lập: ô "Tổng số câu" tự chia theo tỷ lệ 5 dễ : 3 vừa : 2 khó (`DuoiHinh.chiaTheoTong`), sửa từng mức được, không vượt số câu có sẵn. Câu chưa phân loại chỉ hiện ô khi bộ có loại câu này.
- **Ghi tên người trả lời** (phím N, Enter để ghi): điểm câu chốt lúc lật đáp án (3/2/1). Ghi tên trước khi lật thì tự lật. Để trống rồi Enter là xóa. Gợi ý tên đã ghi qua `datalist`. Tên gộp không phân biệt hoa thường.
- **Vinh danh** (`js/duoi-hinh/vinh-danh.js`, phím V hoặc Space ở câu cuối): bục 3 người hiện dần ba → nhì → nhất kèm pháo giấy; thứ hạng tiếp theo; điểm đội. Đồng điểm và đồng số câu thì đồng hạng (`DuoiHinh.xepHangNguoi`). Bàn điều khiển có "Chơi tiếp lượt đang dở" và "Xem vinh danh lượt trước".
- Sửa lỗi: bấm Space hai lần nhanh khi các mảnh đang lật thì lần thứ hai bị mất. Nay bước "mở hết hình" xét theo `cau.moHetHinh`.
- Sao lưu trước khi sửa: `.sao-luu/2026-11-26/`. Trong đó `app.js` và `duoi-hinh.css` là bản trước đợt này. `ve-tranh.js`, `duoi-hinh.js` và `duoi-hinh.html` là bản giữa chừng, đã có 25 câu.
- Test: thêm 3 test (chia số câu, tạo đề, xếp hạng vinh danh); tổng 35 test đều đạt.
- Sửa lỗi chuyển câu (26/11/2026, sau phản hồi của người dùng):
  - Giải thích và pháo giấy được hẹn khoảng 1 giây sau khi lật đáp án; nếu MC sang câu mới trước lúc đó thì giải thích câu cũ hiện đè lên câu mới. Nay mỗi lần đổi câu tăng `maChieu`; việc hẹn giờ của câu cũ tự bỏ qua.
  - Hết giờ đồng hồ thì nút vẫn ghi "Mở hết hình"; nay cập nhật nút ngay.
  - Bấm N ở câu đã ghi tên thì tên mới nối vào tên cũ; nay ô tên tự chọn sẵn chữ cũ khi được chọn.
  - Màn 1366×768 phải cuộn khi hiện cùng lúc gợi ý, giải thích và ô tên. Nay lật đáp án thì cất gợi ý; dòng "Đã ghi" nằm cùng hàng ô tên.
  - Kịch bản kiểm tra: bấm chuột và phím xen kẽ, qua câu nhanh, đồng hồ chạy hết, cộng điểm đội, quay lại câu cũ; xem trạng thái màn hình sau mỗi bước.

## 15. Rút còn 10 câu, vẽ lại hình cho dễ nhận ra (26/11/2026)
- `boMau()` còn 10 câu theo yêu cầu:
  - Dễ: Công đoàn, Băng ca, Trực đêm, Bác sĩ.
  - Vừa: Siêu âm, Đại biểu, Nghỉ bù, Nội soi.
  - Khó: Nội trú, Y tá.
  - Mặc định mỗi lượt 10 câu (4/4/2).
- File mới `js/duoi-hinh/hinh-dep.js` (nạp sau `hinh-them.js`) vẽ lại bằng **cảnh nhỏ có ngữ cảnh** thay cho hình đơn lẻ khó đoán, và ghi đè cặp hình của 10 câu trong `VeTranh.CAU`:
  - BÁC: cháu quàng khăn đỏ khoanh tay cúi chào ông cụ tóc bạc chống gậy, bóng nói "Cháu chào … ạ!".
  - SĨ: quân Sĩ (chữ 士 son) đặt trên giao điểm "cung" kẻ chéo của bàn cờ tướng.
  - NỘI: bà tóc bạc búi tóc, áo bà ba tím, cháu gái ôm bà gọi "Bà … ơi!".
  - SOI: kính lúp phóng to con bọ rùa trên chiếc lá.
  - TRÚ: người đứng dưới mái hiên ngói đỏ, mưa rơi hai bên, chỉ dưới mái là khô.
  - SIÊU: siêu nhân áo choàng đỏ bay (ngôi sao trên ngực, không dùng biểu tượng nhân vật có bản quyền).
  - ÂM: nốt nhạc có sóng âm lan ra.
  - Y: chữ Y lớn trên tấm thẻ.
  - TÁ: khay 12 trứng có nhãn "12".
  - NGHỈ: người nằm võng ngủ.
  - BÙ: bù nhìn có con quạ đậu trên tay.
  - BĂNG: tảng băng trôi trên mặt biển.
- Các câu và hình cũ trong `hinh-them.js` vẫn còn (danh sách đã lưu trên máy MC vẫn vẽ được), nhưng không nằm trong bộ mẫu nữa.
- Sao lưu trước khi sửa: `.sao-luu/2026-11-26-10cau/`.
- Đổi câu **Nghỉ bù thành Khẩu trang** (Nghỉ bù có thể không đúng từ bệnh viện đang dùng):
  - Mức: 4 dễ, 3 vừa, 3 khó; Khẩu trang ở mức khó.
  - Hình mới `miengDep`: miệng cười há to, kèm con dấu son chữ Hán 口 (khẩu = miệng); ghép với `trangSach`.
- **Sửa lỗi trang dài vô tận** (có sẵn từ trước): ô chọn ảnh ẩn `.an-di` định vị tuyệt đối nhưng không có khung chứa định vị, nên thoát khỏi khung danh sách cuộn và kéo dài trang theo số câu (bàn điều khiển Đuổi hình cao 3.037 px dù nội dung 1.167 px; Ngày ấy bây giờ cũng dư khoảng 130 px). Đã sửa:
  - `chung.css`: `label:has(> .an-di) { position: relative; }`.
  - `duoi-hinh.css`: `.dh-dong { position: relative; }`.
  - Đã đo lại 12 trang, không trang nào còn dư.

## 16. Màn hình chờ Đuổi hình bắt chữ – trò chơi chính thức (27/11/2026)
- Mở từ bàn điều khiển: nút "Mở màn hình chờ" hoặc phím **C**.
- Trên màn chờ:
  - **Space** bắt đầu lượt thi mới (vào thẳng sân khấu).
  - **+ / −** thêm, bớt 1 phút đếm ngược.
  - **Esc** về bàn điều khiển.
  - **F** toàn màn hình.
- Số phút đếm ngược chọn ở ô "Đếm ngược ở màn hình chờ" (0, 3, 5, 10, 15 phút; lưu ở `tt.cauHinh.phutCho`).
- Nội dung:
  - Tên trò lớn kiểu tranh Đông Hồ, luật chơi 3 bước (cả cách tính điểm 3/2/1).
  - Thẻ thông tin lấy từ thiết lập: số câu, chia mức, số đội, thời gian mỗi câu.
  - Đồng hồ giờ hiện tại; dải đếm ngược (dưới 1 phút nhấp nháy; hết giờ chuyển nền son "Mời mọi người cùng chơi!" kèm âm báo; MC vẫn tự bấm Space để bắt đầu).
  - **Câu ví dụ THANG MÁY** (không nằm trong bộ thi) tự chạy lặp: mảnh logo lật dần → ô chữ lật → dấu "ĐÚNG" → giải thích, để người lớn tuổi hiểu cách chơi trước.
- File: `js/duoi-hinh/man-cho.js` (API `ManChoDH.mo/dong/doiPhut`), `css/duoi-hinh-cho.css`. Đã kiểm tra bố cục ở 1920×1080, 1366×768, 1280×720.
