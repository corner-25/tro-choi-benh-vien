/* Điều khiển một lượt đua: đếm ngược, vòng lặp khung hình, zoom và quay chậm khi sát nút,
 * bình luận trực tiếp, bảng dẫn đầu có hiệu ứng đổi chỗ. */
(function (root) {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };
  var TOP_BANG = 10, SO_NHAN = 12;
  var CHO_SAU_VE_DICH = 2200;     // ms cho đàn vịt bơi tiếp trước khi công bố
  var NGUONG_SAT_NUT = 0.012;     // khoảng cách (tỉ lệ đường đua) giữa hạng 1 và 2 để coi là sát nút
  var CHAM_TOI_DA = 0.3;          // tốc độ thời gian khi quay chậm
  var CHIEU_DAI_M = 200;

  function dinhDangGio(giay) {
    var p = Math.floor(giay / 60), g = giay - p * 60;
    return String(p).padStart(2, "0") + ":" + g.toFixed(1).padStart(4, "0");
  }

  function tao(boVe, amThanh) {
    var cd = null, nguoi = [], soThang = 0, tamDung = false, dangChay = false, suKienBenhVien = false, boiCanh = "vit";
    var binhLuan = root.BinhLuan.tao($("binh-luan"));
    var hangTruoc = new Map(), lanCapNhat = 0;
    var tocDoTG = 1, anhVeDich = 0, daNoiSatNut = false, daNoiNuaChang = false, mocXong = null, soVeDich = 0;

    function ma(i) { return nguoi[i].ma; }
    function conLaiM(v) { return Math.max(0, Math.round((1 - v.viTri) * CHIEU_DAI_M)); }

    var dongBang = new Map(); // chiSo → <li>, giữ nguyên phần tử để trượt mượt khi đổi hạng
    var CAO_DONG = 46;

    function taoDong(chiSo) {
      var li = document.createElement("li");
      var so = document.createElement("span"); so.className = "xh-so";
      var m = document.createElement("span"); m.className = "xh-ma"; m.textContent = ma(chiSo);
      var cach = document.createElement("span"); cach.className = "xh-cach";
      var mui = document.createElement("span"); mui.className = "xh-mui";
      li.append(so, m, cach, mui);
      li.style.opacity = "0";
      $("bang-xh").appendChild(li);
      return li;
    }

    function capNhatBang(xh) {
      var dau = xh[0];
      var top = xh.slice(0, TOP_BANG);
      var conLai = new Set();
      top.forEach(function (v, k) {
        conLai.add(v.chiSo);
        var li = dongBang.get(v.chiSo);
        var moi = !li;
        if (moi) { li = taoDong(v.chiSo); dongBang.set(v.chiSo, li); li.style.transform = "translateY(" + ((k + 1) * CAO_DONG) + "px)"; }
        li.className = (k < 3 ? "top" + (k + 1) : "") + (v.hang !== null ? " ve-dich" : "");
        li.children[0].textContent = String(k + 1);
        li.children[2].textContent = v.hang !== null ? (v.hang <= soThang ? "THẮNG" : "ĐÍCH") : k === 0 ? conLaiM(v) + " m" : "+" + ((dau.viTri - v.viTri) * CHIEU_DAI_M).toFixed(1).replace(".", ",");
        var truoc = hangTruoc.get(v.chiSo), mui = li.children[3];
        mui.className = "xh-mui"; mui.textContent = "";
        var z = TOP_BANG - k;
        if (truoc !== undefined && truoc > k) { mui.classList.add("len"); mui.textContent = "▲"; z += 20; }
        else if (truoc !== undefined && truoc < k) { mui.classList.add("xuong"); mui.textContent = "▼"; }
        li.style.zIndex = String(z);
        requestAnimationFrame(function () { li.style.opacity = "1"; li.style.transform = "translateY(" + (k * CAO_DONG) + "px)"; });
      });
      dongBang.forEach(function (li, chiSo) {
        if (conLai.has(chiSo)) return;
        dongBang.delete(chiSo);
        li.style.opacity = "0"; li.style.transform = "translateY(" + (TOP_BANG * CAO_DONG) + "px)";
        setTimeout(function () { li.remove(); }, 400);
      });
      hangTruoc = new Map(xh.slice(0, TOP_BANG + 5).map(function (v, k) { return [v.chiSo, k]; }));
    }

    function xuLySuKien(ds, xh) {
      var top5 = new Set(xh.slice(0, 5).map(function (v) { return v.chiSo; }));
      ds.forEach(function (e) {
        var v = cd.vit[e.chiSo];
        if (e.loai === "doi-ngoi") binhLuan.noi(root.BinhLuan.cau("doi-ngoi", ma(e.chiSo), { gan: v.viTri > cd.nuocRut, conLai: conLaiM(v), suKienBenhVien: suKienBenhVien }), v.viTri > cd.nuocRut);
        else if (e.loai === "nuoc-rut") { binhLuan.noi(root.BinhLuan.cau("nuoc-rut", ma(e.chiSo), { conLai: conLaiM(v), suKienBenhVien: suKienBenhVien }), true); amThanh.nuocRut(); }
        else if (top5.has(e.chiSo) && (e.loai === "vao-xiet" || e.loai === "vao-xoay" || e.loai === "but" || e.loai === "cham")) {
          binhLuan.noi(root.BinhLuan.cau(e.loai, ma(e.chiSo), { suKienBenhVien: suKienBenhVien }), false);
        }
      });
      if (!daNoiNuaChang && xh[0].viTri >= 0.5) { daNoiNuaChang = true; binhLuan.noi(root.BinhLuan.cau("nua-chang", ma(xh[0].chiSo), {}), true); }
    }

    /** Sát nút gần đích: quay chậm, zoom, viền tối. */
    function satNut(xh) {
      if (soVeDich > 0 || xh.length < 2) return false;
      return xh[0].viTri > 0.95 && xh[0].viTri - xh[1].viTri < NGUONG_SAT_NUT;
    }

    function khung(dt, xh) {
      var top = xh.slice(0, SO_NHAN).map(function (v) { return v.chiSo; });
      var zoom = soVeDich > 0 ? 1.3 : anhVeDich > 0.05 ? 1.65 : xh[0].viTri > cd.nuocRut ? 1.18 : 1;
      boVe.ve(ma, top, dt, { zoom: zoom, anhVeDich: anhVeDich, suKienBenhVien: suKienBenhVien, boiCanh: boiCanh });
      root.Ve.veTienDo($("tien-do"), cd.vit, top.slice(0, 3), cd.nuocRut);
      $("dua-gio").textContent = dinhDangGio(cd.thoiGianDaChay()) + (tamDung ? " · TẠM DỪNG" : "");
      $("dua-con-lai").textContent = soVeDich ? (soVeDich >= soThang ? "ĐÃ ĐỦ " + soThang + " NGƯỜI VỀ ĐÍCH" : "ĐÃ CÓ " + soVeDich + "/" + soThang + " VỀ ĐÍCH") : "CÒN " + conLaiM(xh[0]) + " M";
      $("chip-anh").hidden = anhVeDich < 0.3;
      var bay = performance.now();
      if (bay - lanCapNhat > 500) { lanCapNhat = bay; capNhatBang(xh); }
    }

    function vongLap(xong) {
      var truoc = performance.now();
      requestAnimationFrame(function buocKhung(t) {
        if (!dangChay) return;
        var dtThuc = Math.min(0.05, (t - truoc) / 1000); truoc = t;
        var xh = cd.xepHang();
        var muonCham = satNut(xh);
        if (muonCham && !daNoiSatNut) { daNoiSatNut = true; binhLuan.noi(root.BinhLuan.cau("sat-nut", "", {}), true); amThanh.satNut(); }
        tocDoTG += ((muonCham ? CHAM_TOI_DA : 1) - tocDoTG) * Math.min(1, dtThuc * 6);
        anhVeDich += ((muonCham ? 1 : 0) - anhVeDich) * Math.min(1, dtThuc * (muonCham ? 5 : 1.5));
        var dt = tamDung ? 0 : dtThuc * tocDoTG;
        if (dt > 0) {
          var kq = cd.buoc(dt);
          binhLuan.nhip(cd.thoiGianDaChay());
          boVe.suKien(kq.suKien);
          xh = cd.xepHang();
          xuLySuKien(kq.suKien, xh);
          kq.veDich.forEach(function (i) {
            soVeDich += 1;
            if (soVeDich <= soThang) {
              boVe.nhayDich(); amThanh.veDich();
              binhLuan.noi(root.BinhLuan.cau("ve-dich", ma(i), { hang: cd.vit[i].hang }), true);
            }
          });
          if (cd.xong() && mocXong === null) { mocXong = t; amThanh.dungNhac(); }
        }
        khung(tamDung ? 0 : dtThuc, xh);
        if (mocXong !== null && t - mocXong > CHO_SAU_VE_DICH) { dangChay = false; xong(); return; }
        requestAnimationFrame(buocKhung);
      });
    }

    function demNguoc(so, xong) {
      if (!dangChay) return;
      var o = $("dem-nguoc");
      o.hidden = false;
      o.classList.remove("chay", "xuat-phat"); void o.offsetWidth;
      o.classList.add("chay");
      if (so <= 0) o.classList.add("xuat-phat");
      $("dem-so").textContent = so > 0 ? String(so) : "XUẤT PHÁT";
      amThanh.demNguoc(so);
      khung(0.016, cd.xepHang());
      if (so > 0) { setTimeout(function () { demNguoc(so - 1, xong); }, 1000); return; }
      amThanh.xuatPhat(); amThanh.batNhac();
      binhLuan.noi(root.BinhLuan.cau("xuat-phat", "", { soVit: nguoi.length, boiCanh: boiCanh }), true);
      setTimeout(function () { o.hidden = true; }, 650);
      vongLap(xong);
    }

    return {
      /** Bắt đầu lượt mới. xong() được gọi khi đủ người về đích và đã chờ xong. */
      chay: function (cuocDua, dsNguoi, soNguoiThang, xong, tuyChon) {
        cd = cuocDua; nguoi = dsNguoi; soThang = soNguoiThang;
        suKienBenhVien = Boolean(tuyChon && tuyChon.suKienBenhVien);
        boiCanh = (tuyChon && tuyChon.boiCanh) || "vit";
        tamDung = false; dangChay = true; tocDoTG = 1; anhVeDich = 0; daNoiSatNut = false; daNoiNuaChang = false; mocXong = null; soVeDich = 0;
        hangTruoc = new Map(); lanCapNhat = 0;
        $("bang-xh").textContent = ""; dongBang = new Map(); binhLuan.xoa(); $("chip-anh").hidden = true;
        boVe.coGian(); boVe.chuanBi(cd);
        demNguoc(3, xong);
      },
      coGian: function () { boVe.coGian(); },
      dung: function () { dangChay = false; amThanh.dungNhac(); $("dem-nguoc").hidden = true; },
      tamDungChuyen: function () { tamDung = !tamDung; return tamDung; },
      dangChay: function () { return dangChay; },
    };
  }

  root.LuotDua = { tao: tao };
})(window);
