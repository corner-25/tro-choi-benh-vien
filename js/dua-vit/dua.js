/* Mô phỏng cuộc đua vịt. Thuần, không đụng DOM.
 *
 * Kết quả KHÔNG định trước: số ngẫu nhiên được bốc liên tục trong lúc đua, thứ hạng chỉ chốt khi qua vạch đích.
 * Công bằng: mọi con vịt dùng cùng một luật; làn bơi của từng con được bốc ngẫu nhiên mỗi lượt,
 * nên vị trí trong danh sách không ảnh hưởng khả năng thắng.
 *
 * Vị trí tính theo tỉ lệ 0 → 1 (1 là vạch đích). */
(function (root) {
  "use strict";

  function rngMatMa() {
    var c = (typeof globalThis !== "undefined" && globalThis.crypto) || null;
    if (c && c.getRandomValues) {
      var buf = new Uint32Array(1);
      return function () { c.getRandomValues(buf); return buf[0] / 4294967296; };
    }
    return Math.random;
  }

  /** PRNG có hạt giống, dùng cho test lặp lại được. */
  function rngHatGiong(hat) {
    var s = hat >>> 0;
    return function () {
      s = (s + 0x6d2b79f5) >>> 0;
      var t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  var MAC_DINH = {
    thoiGian: 30,          // giây, thời gian dự kiến của con vịt nhanh nhất
    soNguoiThang: 3,
    soLan: 10,             // số làn bơi (hàng ngang trên màn hình)
    soDongXiet: 3,
    soXoayNuoc: 3,
    nuocRut: 0.85,         // từ mốc này là giai đoạn nước rút
    doanDoiNhip: [0.45, 1.1],
    heSo: [0.6, 1.4],
    xacSuatBut: 0.06,
    xacSuatChungLai: 0.05,
    keoNhom: 0.9,          // con tụt xa được đẩy nhẹ để đàn vịt không dàn quá rộng
    canDauDan: 0.04,       // con dẫn đầu bị cản nhẹ để có nhiều lần đổi ngôi
  };

  /** Xáo trộn Fisher–Yates. */
  function xao(mang, rng) {
    for (var i = mang.length - 1; i > 0; i -= 1) {
      var j = Math.floor(rng() * (i + 1));
      var t = mang[i]; mang[i] = mang[j]; mang[j] = t;
    }
    return mang;
  }

  /** Địa hình: dòng nước xiết (tăng tốc) và xoáy nước (chậm lại), mỗi vùng phủ vài làn trong một đoạn sông. */
  function taoDiaHinh(o, rng) {
    var vung = [];
    function them(loai, so, heSo) {
      for (var k = 0; k < so; k += 1) {
        var rong = 1 + Math.floor(rng() * 3);
        var lan0 = Math.floor(rng() * (o.soLan - rong + 1));
        var tu = 0.12 + rng() * 0.66;
        var dai = loai === "xiet" ? 0.07 + rng() * 0.07 : 0.035 + rng() * 0.03;
        vung.push({ loai: loai, lanTu: lan0, lanDen: lan0 + rong - 1, tu: tu, den: Math.min(0.95, tu + dai), heSo: heSo });
      }
    }
    them("xiet", o.soDongXiet, 1.45);
    them("xoay", o.soXoayNuoc, 0.55);
    return vung;
  }

  function taoCuocDua(soVit, tuyChon) {
    var o = Object.assign({}, MAC_DINH, tuyChon || {});
    var rng = o.rng || rngMatMa();
    var vanToc = 1 / o.thoiGian;
    var lan = [];
    for (var i = 0; i < soVit; i += 1) lan.push(i % o.soLan);
    xao(lan, rng);
    var diaHinh = taoDiaHinh(o, rng);

    var vit = [];
    for (var k = 0; k < soVit; k += 1) {
      vit.push({ chiSo: k, lan: lan[k], doLech: rng() - 0.5, viTri: rng() * 0.004, vanTocHienTai: 0, heSo: 1,
        doiNhipSau: rng() * o.doanDoiNhip[1], suKien: null, trongVung: null, veDichLuc: null, hang: null });
    }
    var tg = 0;
    var thuTuVeDich = [];
    var dauDanTruoc = -1;

    function doiNhip(v, nuocRut) {
      var r = rng();
      var but = o.xacSuatBut * (nuocRut ? 2 : 1);
      var cham = o.xacSuatChungLai * (nuocRut ? 1.5 : 1);
      if (r < but) { v.heSo = 1.8 + rng() * 0.5; v.suKien = "but"; }
      else if (r < but + cham) { v.heSo = 0.25 + rng() * 0.2; v.suKien = "cham"; }
      else {
        var rongBien = nuocRut ? 1.5 : 1;
        var giua = (o.heSo[0] + o.heSo[1]) / 2, nua = (o.heSo[1] - o.heSo[0]) / 2 * rongBien;
        v.heSo = Math.max(0.3, giua - nua + rng() * nua * 2);
        v.suKien = null;
      }
      v.doiNhipSau = o.doanDoiNhip[0] + rng() * (o.doanDoiNhip[1] - o.doanDoiNhip[0]);
    }

    function vungTai(v) {
      for (var i = 0; i < diaHinh.length; i += 1) {
        var z = diaHinh[i];
        if (v.lan >= z.lanTu && v.lan <= z.lanDen && v.viTri >= z.tu && v.viTri <= z.den) return z;
      }
      return null;
    }

    /**
     * Tiến thêm dt giây. Trả { veDich: [chỉ số vừa về đích], suKien: [{ loai, chiSo }] }.
     * Loại sự kiện: doi-ngoi, but, cham, vao-xiet, vao-xoay, nuoc-rut.
     */
    function buoc(dt) {
      tg += dt;
      var suKien = [];
      var dau = 0, chiSoDau = -1;
      for (var i = 0; i < vit.length; i += 1) if (vit[i].veDichLuc === null && vit[i].viTri > dau) { dau = vit[i].viTri; chiSoDau = i; }
      var moiVe = [];
      for (var j = 0; j < vit.length; j += 1) {
        var v = vit[j];
        if (v.veDichLuc !== null) { v.vanTocHienTai = vanToc * 0.35; v.viTri += v.vanTocHienTai * dt; continue; }
        var nuocRut = v.viTri >= o.nuocRut;
        v.doiNhipSau -= dt;
        if (v.doiNhipSau <= 0) {
          var truoc = v.suKien;
          doiNhip(v, nuocRut);
          if (v.suKien && v.suKien !== truoc) suKien.push({ loai: v.suKien, chiSo: j });
        }
        var z = vungTai(v);
        if (z && v.trongVung !== z) suKien.push({ loai: z.loai === "xiet" ? "vao-xiet" : "vao-xoay", chiSo: j });
        v.trongVung = z;
        var keo = 1 + o.keoNhom * Math.max(0, dau - v.viTri);
        var can = j === chiSoDau ? 1 - o.canDauDan : 1;
        v.vanTocHienTai = vanToc * v.heSo * keo * can * (z ? z.heSo : 1);
        var cu = v.viTri;
        v.viTri += v.vanTocHienTai * dt;
        if (cu < o.nuocRut && v.viTri >= o.nuocRut && j === chiSoDau) suKien.push({ loai: "nuoc-rut", chiSo: j });
        if (v.viTri >= 1) moiVe.push({ chiSo: j, vuot: v.viTri - 1 });
      }
      moiVe.sort(function (a, b) { return b.vuot - a.vuot; }).forEach(function (m) {
        var v = vit[m.chiSo];
        v.veDichLuc = tg;
        v.hang = thuTuVeDich.length + 1;
        thuTuVeDich.push(m.chiSo);
      });
      if (!thuTuVeDich.length && chiSoDau >= 0 && chiSoDau !== dauDanTruoc) {
        if (dauDanTruoc >= 0) suKien.push({ loai: "doi-ngoi", chiSo: chiSoDau });
        dauDanTruoc = chiSoDau;
      }
      return { veDich: moiVe.map(function (m) { return m.chiSo; }), suKien: suKien };
    }

    function xepHang() {
      return vit.slice().sort(function (a, b) {
        if (a.hang !== null && b.hang !== null) return a.hang - b.hang;
        if (a.hang !== null) return -1;
        if (b.hang !== null) return 1;
        return b.viTri - a.viTri;
      });
    }

    return {
      vit: vit,
      diaHinh: diaHinh,
      soLan: o.soLan,
      nuocRut: o.nuocRut,
      buoc: buoc,
      xepHang: xepHang,
      thuTuVeDich: function () { return thuTuVeDich.slice(); },
      xong: function () { return thuTuVeDich.length >= Math.min(o.soNguoiThang, vit.length); },
      thoiGianDaChay: function () { return tg; },
    };
  }

  /** Chạy hết một cuộc đua không vẽ (dùng cho test). */
  function chayNhanh(soVit, tuyChon) {
    var cd = taoCuocDua(soVit, tuyChon);
    var an = 0;
    while (!cd.xong() && an < 100000) { cd.buoc(1 / 60); an += 1; }
    return cd.thuTuVeDich();
  }

  /** Xáo ngẫu nhiên rồi chia đều danh sách thành soBang bảng đấu. */
  function chiaBang(danhSach, soBang, rng) {
    var ds = danhSach.slice();
    var so = Math.max(1, Math.min(Math.floor(soBang) || 1, Math.max(1, Math.floor(ds.length / 2))));
    xao(ds, rng || rngMatMa());
    var cacBang = [];
    for (var i = 0; i < so; i += 1) cacBang.push([]);
    ds.forEach(function (nguoi, idx) { cacBang[idx % so].push(nguoi); });
    return cacBang.filter(function (b) { return b.length > 0; });
  }

  /** Gom danh sách đơn vị (khoa/phòng) duy nhất từ danh sách người chơi để đua theo đơn vị. */
  function danhSachDonVi(danhSach) {
    var dem = Object.create(null);
    var thuTu = [];
    danhSach.forEach(function (n) {
      var dv = String(n && n.donVi || "").trim();
      if (!dv) return;
      var k = dv.toLowerCase();
      if (!dem[k]) { dem[k] = { ten: dv, soNguoi: 0 }; thuTu.push(k); }
      dem[k].soNguoi += 1;
    });
    return thuTu.map(function (k) { return dem[k]; }).sort(function (a, b) {
      return a.ten.localeCompare(b.ten, "vi");
    }).map(function (d) {
      return { ma: d.ten, ten: d.ten, donVi: d.soNguoi + " đại biểu", tenDonViGoc: d.ten, soNguoi: d.soNguoi };
    });
  }

  /** Tìm chỉ số con vịt đang ở vị trí cuối cùng tại thời điểm chốt lượt. */
  function vitVeCuoi(cuocDua) {
    var xh = cuocDua.xepHang();
    return xh.length ? xh[xh.length - 1].chiSo : -1;
  }

  var api = {
    taoCuocDua: taoCuocDua, chayNhanh: chayNhanh, rngHatGiong: rngHatGiong, rngMatMa: rngMatMa,
    chiaBang: chiaBang, danhSachDonVi: danhSachDonVi, vitVeCuoi: vitVeCuoi,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Dua = api;
})(typeof window !== "undefined" ? window : globalThis);
