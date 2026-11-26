/* Khung nạp danh sách người chơi: chọn file Excel/CSV, dán từ Excel, hoặc nạp danh sách mẫu.
 * Dùng ở trang chủ cổng trò chơi. Dữ liệu người dùng chỉ đưa vào DOM bằng textContent. */
(function (root) {
  "use strict";

  var GIOI_HAN_FILE = 10 * 1024 * 1024;

  function danhSachMau() {
    var ho = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Võ", "Đặng", "Bùi", "Đỗ", "Huỳnh"];
    var dem = ["Văn", "Thị", "Minh", "Ngọc", "Thanh", "Hữu", "Thu", "Quốc"];
    var ten = ["An", "Bình", "Châu", "Dũng", "Hà", "Hải", "Hạnh", "Hòa", "Lan", "Linh", "Mai", "Nam", "Phúc", "Tâm", "Thảo", "Trang", "Tuấn", "Yến"];
    var dv = ["Khoa Khám bệnh", "Khoa Dược", "Khoa Xét nghiệm", "Khoa Cấp cứu", "Phòng Hành chính", "Phòng Điều dưỡng", "Khoa Thần kinh", "Khoa Phụ sản"];
    var dong = [["Mã nhân viên", "Họ và tên", "Đơn vị"]];
    for (var i = 1; i <= 320; i += 1) dong.push(["MAU-" + String(i).padStart(3, "0"), ho[i % ho.length] + " " + dem[(i * 3) % dem.length] + " " + ten[(i * 7) % ten.length], dv[i % dv.length]]);
    return root.DanhSach.docDong(dong);
  }

  /**
   * el: { file, dan, nutDoc, nutMau, trangThai } là các phần tử DOM.
   * xacNhan(): trả false để hủy việc thay danh sách. onNap(nguoiChoi): khi nạp thành công.
   */
  function gan(el, xacNhan, onNap) {
    function bao(loai, tieuDe, chiTiet) {
      var khung = el.trangThai;
      khung.textContent = "";
      khung.className = "trang-thai " + loai;
      var p = document.createElement("p"); p.textContent = tieuDe; khung.appendChild(p);
      if (chiTiet && chiTiet.length) {
        var ul = document.createElement("ul");
        chiTiet.slice(0, 8).forEach(function (c) { var li = document.createElement("li"); li.textContent = c; ul.appendChild(li); });
        if (chiTiet.length > 8) { var li = document.createElement("li"); li.textContent = "… và " + (chiTiet.length - 8) + " dòng khác."; ul.appendChild(li); }
        khung.appendChild(ul);
      }
    }

    function nhan(kq) {
      if (!kq.nguoiChoi.length) { bao("loi", "Chưa nạp được danh sách.", kq.loi); return; }
      if (!root.LuuTru.ghiDanhSach(kq.nguoiChoi)) { bao("loi", "Trình duyệt không cho lưu dữ liệu, danh sách sẽ mất khi tải lại trang.", []); }
      var ghiChu = kq.loi.concat(kq.canhBao);
      bao(ghiChu.length ? "canh-bao" : "ok", "Đã nạp " + kq.nguoiChoi.length + " người chơi." + (ghiChu.length ? " Có " + ghiChu.length + " dòng cần xem lại:" : ""), ghiChu);
      onNap(kq.nguoiChoi);
    }

    function docFile(file) {
      if (!file) return;
      if (file.size > GIOI_HAN_FILE) { bao("loi", "File quá lớn (tối đa 10 MB).", []); return; }
      if (!xacNhan()) return;
      var laExcel = /\.xlsx$/i.test(file.name);
      var doc = new FileReader();
      doc.onerror = function () { bao("loi", "Không đọc được file.", []); };
      doc.onload = function () {
        if (!laExcel) { nhan(root.DanhSach.docVanBan(doc.result)); return; }
        if (!root.ExcelJS) { bao("loi", "Không mở được thư viện đọc Excel. Hãy dán danh sách thay vì chọn file.", []); return; }
        var wb = new root.ExcelJS.Workbook();
        wb.xlsx.load(doc.result).then(function () {
          var ws = wb.worksheets[0];
          if (!ws) { bao("loi", "File Excel không có sheet nào.", []); return; }
          var dong = [];
          ws.eachRow({ includeEmpty: false }, function (row) { dong.push(row.values.slice(1).map(root.DanhSach.giaTriO)); });
          nhan(root.DanhSach.docDong(dong));
        }).catch(function (e) { bao("loi", "File Excel bị lỗi hoặc không đúng định dạng .xlsx.", [String((e && e.message) || "")]); });
      };
      if (laExcel) doc.readAsArrayBuffer(file); else doc.readAsText(file, "utf-8");
    }

    el.file.addEventListener("change", function (e) { docFile(e.target.files[0]); e.target.value = ""; });
    el.nutDoc.addEventListener("click", function () {
      if (!el.dan.value.trim()) { bao("loi", "Chưa dán danh sách.", []); return; }
      if (!xacNhan()) return;
      nhan(root.DanhSach.docVanBan(el.dan.value));
      el.dan.value = "";
    });
    el.nutMau.addEventListener("click", function () { if (xacNhan()) nhan(danhSachMau()); });
    return { bao: bao };
  }

  root.NapDanhSach = { gan: gan, danhSachMau: danhSachMau };
})(window);
