/* Điều phối trang Xổ số Lồng cầu. Dữ liệu người dùng chỉ vào DOM bằng textContent. */
(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };
  var KHOA = "long-cau";
  var CHE_TEN = "• • • • • •";

  var danhSach = [];
  var tt = {
    ketQua: [],
    daHien: [],
    cauHinh: { anTen: true, moiNguoiMotLan: true, loaiVang: true, caoTrao: false },
  };
  var giaiDoan = "chuan-bi";
  var longVe = null;
  var hienTai = null;
  var donViDangLoc = "";
  var henGioBocLai = 0;

  function xoaHenGioBocLai() {
    if (henGioBocLai) {
      window.clearTimeout(henGioBocLai);
      henGioBocLai = 0;
    }
  }

  function napDaLuu() {
    danhSach = window.LuuTru.docDanhSach().nguoiChoi;
    var d = window.LuuTru.doc(KHOA);
    if (d) {
      tt.ketQua = Array.isArray(d.ketQua) ? d.ketQua : [];
      tt.daHien = Array.isArray(d.daHien) ? d.daHien : [];
      tt.cauHinh = Object.assign(
        { anTen: true, moiNguoiMotLan: true, loaiVang: true, caoTrao: false },
        d.cauHinh || {}
      );
    }
    $("o-an-ten").checked = tt.cauHinh.anTen !== false;
    $("o-mot-lan").checked = tt.cauHinh.moiNguoiMotLan !== false;
    $("o-loai-vang").checked = tt.cauHinh.loaiVang !== false;
    $("o-cao-trao").checked = Boolean(tt.cauHinh.caoTrao);
    $("o-cao-trao-sk").checked = Boolean(tt.cauHinh.caoTrao);
    var ten = window.LuuTru.docTenSuKien();
    document.querySelectorAll(".ten-su-kien").forEach(function (el) { el.textContent = ten; });
  }

  function luu() { window.LuuTru.ghi(KHOA, tt); capNhatTongKet(); }
  function conLai() { return window.LongCau.conTrongLong(danhSach, tt.ketQua, tt.cauHinh); }

  function dsHienTaiTrongLong() {
    var toanVien = conLai();
    if (!donViDangLoc) return toanVien;
    return window.LongCau.locTheoDonVi(toanVien, donViDangLoc);
  }

  function datBinhLuan(chu) {
    $("lc-binh-luan").textContent = chu;
  }

  function capNhatBinhLuan(pha) {
    var ds = dsHienTaiTrongLong();
    var coSo = window.LongCau.coChuSo(ds.length ? ds : danhSach);
    if (pha === "thoi") {
      if (donViDangLoc) {
        datBinhLuan("Vòng Cầu Vàng (" + donViDangLoc + "): Lồng cầu vàng đang quay, các quả cầu đảo đều...");
      } else if (coSo) {
        datBinhLuan("Lồng cầu đang quay — Mời hội trường giơ tay đoán số cuối CHẴN hay LẺ!");
      } else {
        datBinhLuan("Lồng cầu đang quay, các quả cầu đảo đều trong lồng...");
      }
    } else if (pha === "hut-hut") {
      datBinhLuan("SUÝT NỮA! Một quả cầu đã chạm cửa lồng rồi bật ngược vào trong — lồng quay tiếp!");
    } else if (pha === "hut") {
      datBinhLuan("CỬA LỒNG MỞ! Quả cầu may mắn đang lăn qua ống kính xuống chén vàng...");
    } else if (pha === "xong") {
      datBinhLuan("ĐÃ CHỐT CẦU! Quả cầu may mắn đã hiện mã.");
    }
  }

  function capNhatTongKet() {
    $("so-nguoi").textContent = String(danhSach.length);
    $("so-long").textContent = String(conLai().length);
    $("so-trung").textContent = String(tt.ketQua.filter(function (k) { return k.trangThai === "trung"; }).length);
    $("goi-y-danh-sach").hidden = danhSach.length > 0;
    $("nut-vao").disabled = conLai().length === 0;
  }

  function capNhatBannerDonVi(dsHienTai) {
    var banner = $("lc-banner-dv");
    if (!donViDangLoc) {
      banner.hidden = true;
      $("lc-banner-dv-chu").textContent = "";
      return;
    }
    banner.hidden = false;
    $("lc-banner-dv-chu").textContent =
      "VÒNG ĐẶC BIỆT: " + donViDangLoc.toUpperCase() + " — CÒN " + dsHienTai.length + " CẦU";
  }

  function capNhatChanLe(dsHienTai) {
    var nguon = dsHienTai.length ? dsHienTai : danhSach;
    var coSo = window.LongCau.coChuSo(nguon);
    $("lc-dau-chan-le").hidden = !coSo;

    var pheChan = $("lc-phe-chan");
    var pheLe = $("lc-phe-le");
    var huyHieu = $("lc-chan-le");

    pheChan.classList.remove("chon", "mo-nhat");
    pheLe.classList.remove("chon", "mo-nhat");

    if (!coSo || !hienTai) {
      huyHieu.hidden = true;
      huyHieu.textContent = "";
      return;
    }

    var cl = window.LongCau.chanLeTuMa(hienTai.ma);
    if (!cl) {
      huyHieu.hidden = true;
      huyHieu.textContent = "";
      return;
    }

    huyHieu.hidden = false;
    huyHieu.textContent = "SỐ CUỐI: " + cl.so + " — " + cl.nhan;
    huyHieu.className = "lc-huy-hieu-cl " + (cl.loai === "chan" ? "cl-chan" : "cl-le");

    if (cl.loai === "chan") {
      pheChan.classList.add("chon");
      pheLe.classList.add("mo-nhat");
    } else {
      pheLe.classList.add("chon");
      pheChan.classList.add("mo-nhat");
    }
  }

  function veLichSu() {
    var ol = $("lc-ds");
    ol.textContent = "";
    tt.ketQua.slice().reverse().forEach(function (k, idx) {
      var li = document.createElement("li");
      if (k.trangThai === "huy") li.className = "da-huy";
      var stt = document.createElement("span"); stt.textContent = "#" + (tt.ketQua.length - idx);
      var ma = document.createElement("span"); ma.className = "ma"; ma.textContent = k.ma;
      var an = tt.cauHinh.anTen && tt.daHien.indexOf(k.id) < 0 && k.trangThai !== "huy";
      var ten = document.createElement("span"); ten.className = "ten";
      ten.textContent = k.trangThai === "huy" ? "Đã hủy (vắng mặt)" : (an ? CHE_TEN : k.ten);
      li.append(stt, ma, ten);
      ol.appendChild(li);
    });
  }

  function veTheHienTai() {
    var ds = dsHienTaiTrongLong();
    var k = hienTai;
    var dangChay = Boolean(longVe && longVe.dangBoc());
    var an = Boolean(k && tt.cauHinh.anTen && tt.daHien.indexOf(k.id) < 0);

    var theTrung = $("lc-the-trung");
    var theLat = $("lc-lat-the");

    theTrung.classList.toggle("co", Boolean(k));
    theTrung.classList.toggle("da-mo-ten", Boolean(k && !an));

    // Khi đang niêm phong (an === true): bỏ .mo để hiện mặt niêm phong; khi mở tên hoặc chờ bốc: thêm .mo
    theLat.classList.toggle("mo", !an);

    $("lc-ma-to").textContent = k ? k.ma : "—";
    if (k) {
      $("lc-ten-to").textContent = an ? CHE_TEN : k.ten;
      $("lc-ten-to").classList.toggle("an", an);
      $("lc-dv").textContent = an ? "" : (k.donVi || "");
    } else {
      $("lc-ten-to").textContent = donViDangLoc ? ("Vòng Cầu Vàng · " + donViDangLoc) : "Sẵn sàng bốc cầu";
      $("lc-ten-to").classList.remove("an");
      $("lc-dv").textContent = donViDangLoc ? ("Còn " + ds.length + " thành viên trong lồng") : "";
    }

    $("nut-hien-ten").hidden = !an || dangChay;
    $("nut-huy").hidden = !k || dangChay;
    $("nut-huy-boc-lai").hidden = !k || dangChay;

    // Nút Bốc tiếp theo Khoa vừa trúng: chỉ hiện khi có dữ liệu donVi, đã mở tên, người trúng có donVi và khoa đó còn ít nhất 1 cầu
    var hienNutLocDv = false;
    if (k && !an && !dangChay && window.LongCau.coDonVi(danhSach) && String(k.donVi || "").trim()) {
      var cungKhoaDangLoc = donViDangLoc &&
        donViDangLoc.trim().toLowerCase() === String(k.donVi).trim().toLowerCase();
      var conCungKhoa = window.LongCau.locTheoDonVi(conLai(), k.donVi).length;
      hienNutLocDv = !cungKhoaDangLoc && conCungKhoa > 0;
    }
    $("nut-loc-dv").hidden = !hienNutLocDv;

    $("sk-long").textContent = String(ds.length);
    $("nut-boc").disabled = dangChay || Boolean(henGioBocLai) || ds.length === 0;

    capNhatBannerDonVi(ds);
    capNhatChanLe(ds);
    veLichSu();
  }

  function vaoSanKhau() {
    if ($("nut-vao").disabled) return;
    window.AmThanh.moKhoa();
    xoaHenGioBocLai();
    donViDangLoc = "";
    giaiDoan = "san-khau";
    $("man-chuan-bi").hidden = true;
    $("man-san-khau").hidden = false;
    hienTai = null;
    $("o-cao-trao-sk").checked = Boolean(tt.cauHinh.caoTrao);
    if (!longVe) longVe = window.VeLong.tao($("long-canvas"), window.AmThanh);
    var ds = conLai();
    longVe.napDanhSach(ds.map(function (n) { return n.ma; }), { cauVang: false });
    datBinhLuan("Lồng cầu sẵn sàng với " + ds.length + " quả cầu. Bấm Space để bốc!");
    veTheHienTai();
  }

  function veChuanBi() {
    xoaHenGioBocLai();
    if (longVe && longVe.dangBoc()) return;
    if (longVe) longVe.dung();
    donViDangLoc = "";
    giaiDoan = "chuan-bi";
    $("man-san-khau").hidden = true;
    $("man-chuan-bi").hidden = false;
    capNhatTongKet();
  }

  function veToanVien(giuKetQua) {
    xoaHenGioBocLai();
    if (longVe && longVe.dangBoc()) return;
    donViDangLoc = "";
    var toanVien = conLai();
    if (longVe) {
      longVe.napDanhSach(
        toanVien.map(function (n) { return n.ma; }),
        { cauVang: false, giuKetQua: Boolean(giuKetQua) }
      );
    }
    if (!giuKetQua) {
      hienTai = null;
      datBinhLuan("Đã trả lồng cầu về toàn viện (" + toanVien.length + " quả cầu). Bấm Space để bốc tiếp!");
    }
    veTheHienTai();
  }

  function locTheoKhoaVuaTrung() {
    if (!hienTai || !hienTai.donVi || (longVe && longVe.dangBoc())) return;
    xoaHenGioBocLai();
    var tenKhoa = String(hienTai.donVi).trim();
    var dsLoc = window.LongCau.locTheoDonVi(conLai(), tenKhoa);
    if (!dsLoc.length) {
      window.alert("Khoa/Phòng " + tenKhoa + " không còn quả cầu nào trong lồng.");
      veTheHienTai();
      return;
    }
    donViDangLoc = tenKhoa;
    hienTai = null;
    if (longVe) {
      longVe.napDanhSach(dsLoc.map(function (n) { return n.ma; }), { cauVang: true });
    }
    datBinhLuan("Vòng Cầu Vàng: Đã thu gọn lồng về " + dsLoc.length + " thành viên của " + tenKhoa + ". Bấm Space để bốc!");
    veTheHienTai();
  }

  function boc() {
    xoaHenGioBocLai();
    if (!longVe || longVe.dangBoc()) return;
    var ds = dsHienTaiTrongLong();
    if (!ds.length) {
      if (donViDangLoc) {
        veToanVien(false);
        return;
      }
      window.alert("Không còn quả cầu nào trong lồng.");
      return;
    }

    var nguoi = window.LongCau.bocCau(ds);
    if (!nguoi) return;

    hienTai = null;
    $("lc-the-trung").classList.remove("co", "da-mo-ten");
    $("lc-lat-the").classList.add("mo");
    $("lc-ma-to").textContent = "ĐANG QUAY…";
    $("lc-ten-to").textContent = tt.cauHinh.caoTrao
      ? "Chế độ Cao trào Giải lớn đang bật..."
      : "Lồng cầu đang quay...";
    $("lc-ten-to").classList.remove("an");
    $("lc-dv").textContent = donViDangLoc ? ("Vòng Cầu Vàng · " + donViDangLoc) : "";
    $("lc-chan-le").hidden = true;
    $("lc-phe-chan").classList.remove("chon", "mo-nhat");
    $("lc-phe-le").classList.remove("chon", "mo-nhat");

    $("nut-boc").disabled = true;
    $("nut-hien-ten").hidden = true;
    $("nut-huy").hidden = true;
    $("nut-huy-boc-lai").hidden = true;
    $("nut-loc-dv").hidden = true;

    longVe.bocToi(
      nguoi.ma,
      function () {
        var kq = {
          id: "lc" + Date.now().toString(36) + Math.floor(Math.random() * 1e5).toString(36),
          ma: nguoi.ma,
          ten: nguoi.ten,
          donVi: nguoi.donVi,
          luc: new Date().toLocaleString("vi-VN", { hour12: false }),
          trangThai: "trung",
        };
        tt.ketQua.push(kq);
        hienTai = kq;
        luu();
        window.AmThanh.trung(true);
        window.Phao.banHaiBen($("phao-long"), 1.5);

        // Nếu đang lọc theo Khoa mà khoa vừa hết sạch cầu, tự động trả về toàn viện mà vẫn giữ quả cầu trúng trên đỉnh
        var thongBao = "CHỐT CẦU! Mã " + kq.ma + (tt.cauHinh.anTen ? " — Bấm Enter để lật mở họ tên!" : (" — Xin chúc mừng " + kq.ten + "!"));
        if (donViDangLoc && dsHienTaiTrongLong().length === 0) {
          var khoaCu = donViDangLoc;
          donViDangLoc = "";
          var toanVien = conLai();
          longVe.napDanhSach(toanVien.map(function (n) { return n.ma; }), { cauVang: false, giuKetQua: true });
          thongBao = "CHỐT CẦU mã " + kq.ma + "! " + khoaCu + " đã hết cầu, tự động trả lồng về toàn viện.";
        }
        datBinhLuan(thongBao);
        veTheHienTai();
      },
      {
        caoTrao: Boolean(tt.cauHinh.caoTrao),
        cauVang: Boolean(donViDangLoc),
        onPha: capNhatBinhLuan,
      }
    );
  }

  function hienTen() {
    if (!hienTai || (longVe && longVe.dangBoc())) return;
    var dangAn = tt.cauHinh.anTen && tt.daHien.indexOf(hienTai.id) < 0;
    if (!dangAn) return;
    tt.daHien.push(hienTai.id);
    window.AmThanh.latDapAn();
    luu();
    datBinhLuan("XIN CHÚC MỪNG: " + hienTai.ten + (hienTai.donVi ? (" — " + hienTai.donVi) : "") + " (Mã " + hienTai.ma + ")!");
    veTheHienTai();
  }

  function danhDauHuyHienTai() {
    var maCu = hienTai.ma;
    var idHuy = hienTai.id;
    tt.ketQua = tt.ketQua.map(function (x) {
      return x.id === idHuy ? Object.assign({}, x, { trangThai: "huy" }) : x;
    });
    hienTai = null;
    luu();

    if (donViDangLoc && dsHienTaiTrongLong().length === 0) {
      donViDangLoc = "";
      var toanVien = conLai();
      if (longVe) longVe.napDanhSach(toanVien.map(function (n) { return n.ma; }), { cauVang: false });
    } else if (longVe) {
      var dsCon = dsHienTaiTrongLong();
      longVe.napDanhSach(dsCon.map(function (n) { return n.ma; }), { cauVang: Boolean(donViDangLoc) });
    }
    return maCu;
  }

  function huy() {
    if (!hienTai || (longVe && longVe.dangBoc())) return;
    if (!window.confirm("Hủy kết quả của mã " + hienTai.ma + " (vắng mặt)?")) return;
    xoaHenGioBocLai();
    var maCu = danhDauHuyHienTai();
    datBinhLuan("Đã hủy kết quả mã " + maCu + " (vắng mặt). Bấm Space để bốc lượt mới.");
    veTheHienTai();
  }

  function huyVaBocDen() {
    if (!hienTai || (longVe && longVe.dangBoc())) return;
    xoaHenGioBocLai();
    var maCu = danhDauHuyHienTai();
    var con = dsHienTaiTrongLong().length;

    if (con > 0) {
      datBinhLuan("Đã hủy mã " + maCu + " (vắng mặt) — Tự động khởi động bốc đền ngay sau 1 giây...");
      henGioBocLai = window.setTimeout(function () {
        henGioBocLai = 0;
        if (giaiDoan === "san-khau") boc();
      }, 1000);
      veTheHienTai();
      $("lc-ten-to").textContent = "Đang chuẩn bị bốc đền...";
    } else {
      datBinhLuan("Đã hủy mã " + maCu + ". Không còn quả cầu nào trong lồng.");
      veTheHienTai();
    }
  }

  function dongBoCaoTrao(bat) {
    tt.cauHinh.caoTrao = Boolean(bat);
    $("o-cao-trao").checked = tt.cauHinh.caoTrao;
    $("o-cao-trao-sk").checked = tt.cauHinh.caoTrao;
    luu();
  }

  function toanManHinh() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(function () {});
    else document.exitFullscreen();
  }

  function ganSuKien() {
    [["o-an-ten", "anTen"], ["o-mot-lan", "moiNguoiMotLan"], ["o-loai-vang", "loaiVang"]].forEach(function (c) {
      $(c[0]).addEventListener("change", function () { tt.cauHinh[c[1]] = $(c[0]).checked; luu(); });
    });
    $("o-cao-trao").addEventListener("change", function () { dongBoCaoTrao($("o-cao-trao").checked); });
    $("o-cao-trao-sk").addEventListener("change", function () {
      dongBoCaoTrao($("o-cao-trao-sk").checked);
      datBinhLuan(
        tt.cauHinh.caoTrao
          ? "Đã bật chế độ Cao trào giải lớn: có một quả suýt rơi ra trước khi bốc thật."
          : "Đã chuyển về chế độ Chuẩn (~3,5 giây/lượt)."
      );
    });
    $("o-am-thanh").addEventListener("change", function () {
      if ($("o-am-thanh").checked !== window.AmThanh.dangBat()) window.AmThanh.batTat();
    });

    $("nut-vao").addEventListener("click", vaoSanKhau);
    $("nut-ve").addEventListener("click", veChuanBi);
    $("nut-boc").addEventListener("click", boc);
    $("nut-hien-ten").addEventListener("click", hienTen);
    $("nut-huy").addEventListener("click", huy);
    $("nut-huy-boc-lai").addEventListener("click", huyVaBocDen);
    $("nut-loc-dv").addEventListener("click", locTheoKhoaVuaTrung);
    $("nut-ve-toan-vien").addEventListener("click", function () { veToanVien(false); });

    $("nut-xuat").addEventListener("click", function () {
      if (!tt.ketQua.length) { window.alert("Chưa có kết quả để xuất."); return; }
      window.LuuTru.taiCsv(window.LongCau.dongXuat(tt.ketQua), "ket-qua-long-cau-" + new Date().toISOString().slice(0, 10) + ".csv");
    });
    $("nut-in-bien-ban").addEventListener("click", function () {
      if (!tt.ketQua.length) { window.alert("Chưa có kết quả để in biên bản."); return; }
      var bang = window.LongCau.dongXuat(tt.ketQua);
      window.BienBan.in({
        tenTro: "Xổ số Lồng cầu",
        tenSuKien: window.LuuTru.docTenSuKien(),
        tomTat: "Tổng số " + tt.ketQua.length + " lượt bốc cầu",
        cot: bang[0], dong: bang.slice(1),
        ghiChu: "Mã nhân viên được bốc ngẫu nhiên đều bằng nguồn mật mã trình duyệt (crypto.getRandomValues).",
      });
    });
    $("nut-lam-lai").addEventListener("click", function () {
      if (!tt.ketQua.length || !window.confirm("Xóa " + tt.ketQua.length + " kết quả lồng cầu?")) return;
      tt.ketQua = []; tt.daHien = []; luu();
    });

    document.addEventListener("keydown", function (e) {
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
      if (e.key === "f" || e.key === "F") { toanManHinh(); return; }
      if (e.key === "m" || e.key === "M") { $("o-am-thanh").checked = window.AmThanh.batTat(); return; }
      if (giaiDoan === "chuan-bi") {
        if (e.code === "Space" && !$("nut-vao").disabled) { e.preventDefault(); vaoSanKhau(); }
        return;
      }
      if (e.code === "Space") { e.preventDefault(); if (!$("nut-boc").disabled) boc(); }
      else if (e.key === "Enter") { e.preventDefault(); hienTen(); }
      else if (e.key === "Escape") veChuanBi();
    });
  }

  napDaLuu();
  ganSuKien();
  capNhatTongKet();
})();
