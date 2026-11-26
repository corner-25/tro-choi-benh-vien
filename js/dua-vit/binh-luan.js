/* Dòng bình luận trực tiếp ở chân màn hình. Dựng bằng textContent, không dùng innerHTML. */
(function (root) {
  "use strict";

  var GIAN_CACH = 1.8; // giây tối thiểu giữa hai câu thường; câu ưu tiên thì chen ngay

  function tao(khung) {
    var lanCuoi = -99;
    var t = 0;

    function hien(phan) {
      var span = document.createElement("span");
      span.className = "moi";
      phan.forEach(function (p) {
        if (typeof p === "string") span.appendChild(document.createTextNode(p));
        else { var b = document.createElement("b"); b.textContent = p.ma; span.appendChild(b); }
      });
      khung.textContent = "";
      khung.appendChild(span);
    }

    return {
      /** Cập nhật đồng hồ nội bộ (giây, theo thời gian đua). */
      nhip: function (tg) { t = tg; },
      /** uuTien: câu quan trọng (đổi ngôi gần đích, về đích) được nói ngay. */
      noi: function (phan, uuTien) {
        if (!uuTien && t - lanCuoi < GIAN_CACH) return;
        lanCuoi = t;
        hien(phan);
      },
      xoa: function () { khung.textContent = ""; lanCuoi = -99; t = 0; },
    };
  }

  /** Câu bình luận theo loại sự kiện. ma: mã nhân viên. Trả null khi không nói. */
  function cau(loai, ma, thongTin) {
    var M = { ma: ma };
    var bv = thongTin && thongTin.suKienBenhVien;
    switch (loai) {
      case "xuat-phat": return [thongTin.boiCanh === "khinh-khi-cau" ? thongTin.soVit + " khinh khí cầu UMC đã cất cánh. Xuất phát!" : thongTin.boiCanh === "thuyen-rong" ? thongTin.soVit + " thuyền rồng đã vào vạch, trống giục vang lên. Xuất phát!" : thongTin.soVit + " chú vịt đã xuống nước. Xuất phát!"];
      case "doi-ngoi": return thongTin.gan ? ["Đổi ngôi! ", M, " vượt lên dẫn đầu khi chỉ còn " + thongTin.conLai + " m!"] : [M, " vươn lên dẫn đầu!"];
      case "vao-xiet": return bv ? [M, " được đồng đội tiếp sức, lao vút lên phía trước!"] : [M, " bắt được dòng nước xiết, tăng tốc!"];
      case "vao-xoay": return bv ? [M, " gặp sự cố kẹt thang máy, chậm hẳn lại!"] : [M, " sa vào xoáy nước, chậm hẳn lại!"];
      case "but": return bv ? [M, " vừa nhận ca trực mới, bứt tốc mạnh mẽ!"] : [M, " bứt tốc mạnh mẽ!"];
      case "cham": return bv ? [M, " kẹt xe giờ tan tầm, đang hụt hơi…"] : [M, " đang hụt hơi…"];
      case "nua-chang": return ["Nửa chặng đường! ", M, " đang dẫn đầu."];
      case "nuoc-rut": return ["Vào giai đoạn nước rút! ", M, " dẫn đầu, còn " + thongTin.conLai + " m."];
      case "sat-nut": return ["Cực kỳ sát nút! Chờ ảnh về đích…"];
      case "ve-dich": return thongTin.hang === 1 ? [M, " về đích đầu tiên!"] : [M, " về đích ở vị trí thứ " + thongTin.hang + "."];
      default: return null;
    }
  }

  root.BinhLuan = { tao: tao, cau: cau };
})(window);
