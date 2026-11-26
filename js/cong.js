/* Trang chủ cổng trò chơi: tên sự kiện, màu nhấn, danh sách người chơi dùng chung, số liệu 11 trò chơi. */
(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };
  var SO_DONG_XEM = 200;

  function td(tag, chu) { var el = document.createElement(tag); el.textContent = chu; return el; }

  function veDanhSach() {
    var ds = window.LuuTru.docDanhSach();
    $("ds-so").textContent = String(ds.nguoiChoi.length);
    $("ds-cap-nhat").textContent = ds.capNhatLuc ? "Cập nhật " + new Date(ds.capNhatLuc).toLocaleString("vi-VN", { hour12: false }) : "Chưa nạp danh sách";
    var khung = $("ds-xem");
    khung.textContent = "";
    if (!ds.nguoiChoi.length) { khung.appendChild(td("p", "Chưa có người chơi. Nạp danh sách ở bên trái.")).className = "goi-y"; return; }
    var bang = document.createElement("table");
    var hd = document.createElement("tr");
    ["Mã", "Họ tên", "Đơn vị"].forEach(function (h) { var th = td("th", h); th.scope = "col"; hd.appendChild(th); });
    var thead = document.createElement("thead"); thead.appendChild(hd); bang.appendChild(thead);
    var tbody = document.createElement("tbody");
    ds.nguoiChoi.slice(0, SO_DONG_XEM).forEach(function (n) {
      var tr = document.createElement("tr");
      tr.append(td("td", n.ma), td("td", n.ten), td("td", n.donVi));
      tbody.appendChild(tr);
    });
    bang.appendChild(tbody);
    khung.appendChild(bang);
    if (ds.nguoiChoi.length > SO_DONG_XEM) khung.appendChild(td("p", "… và " + (ds.nguoiChoi.length - SO_DONG_XEM) + " người khác.")).className = "goi-y";
  }

  function veSoLieu() {
    var vit = window.LuuTru.doc("dua-vit");
    var soLuot = vit && Array.isArray(vit.lichSu) ? vit.lichSu.length : 0;
    $("so-lieu-vit").textContent = soLuot ? soLuot + " lượt đã đua · " + (vit.daThang || []).length + " người đã thắng" : "3 bối cảnh · sẵn sàng đua";

    var pl = window.LuuTru.doc("plinko");
    var soLuotPl = pl && Array.isArray(pl.lichSu) ? pl.lichSu.length : 0;
    $("so-lieu-plinko").textContent = soLuotPl ? soLuotPl + " lượt đã thả bóng" : "Tháp vật lý 2D · sẵn sàng";

    var lc = window.LuuTru.doc("long-cau");
    var soLc = lc && Array.isArray(lc.ketQua) ? lc.ketQua.filter(function (k) { return k.trangThai === "trung"; }).length : 0;
    $("so-lieu-long-cau").textContent = soLc ? soLc + " quả cầu đã trúng" : "Lồng kính xoáy · sẵn sàng";

    var quay = window.LuuTru.doc("quay-so");
    var soTrung = quay && Array.isArray(quay.ketQua) ? quay.ketQua.filter(function (k) { return k.trangThai !== "huy"; }).length : 0;
    var soGiai = quay && Array.isArray(quay.giai) ? quay.giai.length : 0;
    $("so-lieu-quay").textContent = soGiai ? soGiai + " hạng giải · " + soTrung + " người đã trúng" : "Chưa cấu hình giải";

    var vong = window.LuuTru.doc("vong-quay");
    var soMuc = vong && Array.isArray(vong.muc) ? vong.muc.length : 0;
    var soQuayVong = vong && Array.isArray(vong.ketQua) ? vong.ketQua.filter(function (k) { return k.trangThai !== "huy"; }).length : 0;
    $("so-lieu-vong").textContent = soMuc ? soMuc + " ô quay · " + soQuayVong + " lượt đã quay" : "Sẵn sàng cấu hình";

    var hop = window.LuuTru.doc("hop-bi-an");
    var tongHop = hop && Array.isArray(hop.hop) ? hop.hop.length : 0;
    var chuaMo = tongHop ? hop.hop.filter(function (h) { return !h.daMo; }).length : 0;
    $("so-lieu-hop").textContent = tongHop ? chuaMo + "/" + tongHop + " hộp còn đóng" : "Có sẵn 12 hộp mẫu";

    var doVui = window.LuuTru.doc("do-vui");
    var soCau = doVui && Array.isArray(doVui.cauHoi) ? doVui.cauHoi.length : 0;
    $("so-lieu-do-vui").textContent = soCau ? soCau + " câu hỏi đã lưu" : "Có sẵn 8 câu hỏi mẫu";

    var doanSo = window.LuuTru.doc("doan-so");
    var soCauSo = doanSo && Array.isArray(doanSo.cauHoi) ? doanSo.cauHoi.length : 0;
    $("so-lieu-doan-so").textContent = soCauSo ? soCauSo + " câu hỏi con số" : "Có sẵn 5 câu hỏi mẫu";

    var ngayAy = window.LuuTru.doc("ngay-ay-bay-gio");
    var soVongAnh = ngayAy && Array.isArray(ngayAy.vong) ? ngayAy.vong.length : 0;
    $("so-lieu-ngay-ay").textContent = soVongAnh ? soVongAnh + " vòng ảnh kỷ niệm" : "Có sẵn 3 vòng mẫu";

    var oChu = window.LuuTru.doc("o-chu");
    var soTu = oChu && Array.isArray(oChu.ds) ? oChu.ds.length : 0;
    $("so-lieu-o-chu").textContent = soTu ? soTu + " từ khóa hội nghị" : "Có sẵn 6 từ khóa mẫu";

    var duoiHinh = window.LuuTru.doc("duoi-hinh");
    var soDh = duoiHinh && Array.isArray(duoiHinh.ds) ? duoiHinh.ds.length : 0;
    $("so-lieu-duoi-hinh").textContent = soDh ? soDh + " câu đố hoạt họa" : "Có sẵn 8 câu hoạt họa";
  }

  function coLichSu() {
    var khoa = ["dua-vit", "quay-so", "vong-quay", "plinko", "long-cau"];
    return khoa.some(function (k) {
      var d = window.LuuTru.doc(k);
      return d && ((d.lichSu && d.lichSu.length) || (d.ketQua && d.ketQua.length));
    });
  }

  $("o-su-kien").value = window.LuuTru.docTenSuKien();
  $("o-su-kien").addEventListener("change", function () { window.LuuTru.ghiTenSuKien($("o-su-kien").value.trim() || "Sự kiện"); });
  $("o-chu-de").value = window.LuuTru.docChuDe();
  $("o-chu-de").addEventListener("change", function () { window.LuuTru.ghiChuDe($("o-chu-de").value); });

  var nap = window.NapDanhSach.gan(
    { file: $("chon-file"), dan: $("o-dan"), nutDoc: $("nut-doc"), nutMau: $("nut-mau"), trangThai: $("trang-thai-ds") },
    function () {
      return !coLichSu() || window.confirm("Đã có kết quả của các trò chơi trước đó. Danh sách mới sẽ dùng cho các lượt tiếp theo; kết quả cũ vẫn giữ trong lịch sử. Tiếp tục?");
    },
    function () { veDanhSach(); }
  );

  $("nut-xoa").addEventListener("click", function () {
    if (!window.confirm("Xóa danh sách người chơi, cấu hình và kết quả của tất cả trò chơi trên máy này? Nên tải file kết quả ở từng trò trước.")) return;
    window.LuuTru.xoaTatCa();
    $("o-su-kien").value = window.LuuTru.docTenSuKien();
    $("o-chu-de").value = window.LuuTru.docChuDe();
    nap.bao("ok", "Đã xóa toàn bộ dữ liệu trò chơi trên máy này.", []);
    veDanhSach(); veSoLieu();
  });

  veDanhSach();
  veSoLieu();
})();
