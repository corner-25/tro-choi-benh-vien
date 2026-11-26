# Hướng dẫn cho agent

Trước khi sửa code, đọc `PHAT-TRIEN.md` (bối cảnh, quy ước bắt buộc, phong cách giao diện, việc còn dở, ý tưởng tiếp theo) và `README.md` (cách dùng).

Tóm tắt quy ước không được phá:
- HTML/CSS/JS thuần, script cổ điển dạng IIFE (không ES modules, phải mở được bằng `file://`), không CDN, không backend, không database.
- Giao diện tiếng Việt đầy đủ; định danh tiếng Việt không dấu, camelCase.
- Dữ liệu người dùng chỉ vào DOM bằng `textContent`; ngẫu nhiên dùng `crypto.getRandomValues`.
- Giao diện sáng, phong cách đồ họa thể thao, chữ to cho khán giả lớn tuổi; không emoji, không nền tối, không kiểu "thiệp".
- Thêm file JS thì thêm thẻ `<script defer>` vào đúng trang HTML.
- Chạy `node --test tests/dua-vit.test.cjs tests/quay-so.test.cjs` sau khi sửa logic.
