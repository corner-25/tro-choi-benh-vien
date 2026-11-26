/* Thu nhỏ ảnh phần thưởng người dùng chọn thành data URL để lưu trong trình duyệt (localStorage có giới hạn dung lượng). */
(function (root) {
  "use strict";

  var CANH_TOI_DA = 560;
  var LOAI_NHAN = /^image\/(png|jpeg|webp|gif)$/;
  var GIOI_HAN_FILE = 15 * 1024 * 1024;

  /** Trả Promise<string> data URL. Ảnh PNG giữ nền trong suốt, ảnh khác nén JPEG. */
  function thuNho(file) {
    return new Promise(function (xong, loi) {
      if (!file || !LOAI_NHAN.test(file.type)) { loi(new Error("Chỉ nhận ảnh PNG, JPG, WEBP hoặc GIF.")); return; }
      if (file.size > GIOI_HAN_FILE) { loi(new Error("Ảnh quá lớn (tối đa 15 MB).")); return; }
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        var tiLe = Math.min(1, CANH_TOI_DA / Math.max(img.naturalWidth, img.naturalHeight));
        var w = Math.max(1, Math.round(img.naturalWidth * tiLe)), h = Math.max(1, Math.round(img.naturalHeight * tiLe));
        var c = document.createElement("canvas"); c.width = w; c.height = h;
        c.getContext("2d").drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        xong(file.type === "image/png" ? c.toDataURL("image/png") : c.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = function () { URL.revokeObjectURL(url); loi(new Error("Không đọc được ảnh.")); };
      img.src = url;
    });
  }

  /** Chỉ nhận data URL ảnh do chính trang tạo ra, chặn giá trị lạ khi đọc lại từ lưu trữ. */
  function hopLe(anh) {
    return typeof anh === "string" && /^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(anh);
  }

  root.AnhGiai = { thuNho: thuNho, hopLe: hopLe };
})(window);
