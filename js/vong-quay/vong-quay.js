/* Logic Vòng quay may mắn. Thuần, không đụng DOM; dùng được trong trình duyệt và test Node.
 * Ngẫu nhiên dùng crypto.getRandomValues. */
(function (root) {
  "use strict";

  var GIOI_HAN_MUC = 120;
  var HAI_PI = Math.PI * 2;
  var DANH_SACH_DOT_BIEN = [
    { nhan: "×2 QUÀ", loai: "dot-bien", maDotBien: "nhan-doi" },
    { nhan: "TẶNG BẠN", loai: "dot-bien", maDotBien: "tang-ban" },
    { nhan: "QUAY KÉP", loai: "dot-bien", maDotBien: "quay-kep" },
  ];

  function rngMatMa() {
    var c = (typeof globalThis !== "undefined" && globalThis.crypto) || null;
    if (c && c.getRandomValues) {
      var buf = new Uint32Array(1);
      return function () { c.getRandomValues(buf); return buf[0] / 4294967296; };
    }
    return Math.random;
  }

  function chuanHoaChu(s) {
    return String(s || "").trim().replace(/\s+/g, " ");
  }

  /** Đọc danh sách ô quay từ văn bản (mỗi dòng một mục), lọc dòng trống và mục trùng. */
  function docMucTuVanBan(text) {
    var daCo = Object.create(null);
    var ds = [];
    String(text || "").split(/\r?\n/).forEach(function (dong) {
      var s = chuanHoaChu(dong).slice(0, 80);
      if (!s) return;
      var k = s.toLowerCase();
      if (daCo[k]) return;
      daCo[k] = true;
      ds.push(s);
    });
    return ds.slice(0, GIOI_HAN_MUC);
  }

  /** Trích danh sách đơn vị (khoa/phòng) duy nhất từ danh sách người chơi dùng chung. */
  function layDonViTuDanhSach(danhSach) {
    var daCo = Object.create(null);
    var ds = [];
    (danhSach || []).forEach(function (n) {
      var dv = chuanHoaChu(n && n.donVi).slice(0, 80);
      if (!dv) return;
      var k = dv.toLowerCase();
      if (daCo[k]) return;
      daCo[k] = true;
      ds.push(dv);
    });
    return ds.sort(function (a, b) { return a.localeCompare(b, "vi"); }).slice(0, GIOI_HAN_MUC);
  }

  /** Lọc danh sách đại biểu thuộc đúng khoa/phòng (so khớp chuẩn hóa không phân biệt hoa thường). */
  function layNguoiTheoDonVi(danhSach, donVi) {
    var khoaChuan = chuanHoaChu(donVi).toLowerCase();
    if (!khoaChuan) return [];
    var daCo = Object.create(null);
    var ds = [];
    (danhSach || []).forEach(function (n) {
      if (!n) return;
      var dv = chuanHoaChu(n.donVi);
      if (dv.toLowerCase() !== khoaChuan) return;
      var ma = chuanHoaChu(n.ma).slice(0, 40);
      var ten = chuanHoaChu(n.ten).slice(0, 80);
      if (!ten && !ma) return;
      var khoaTrung = (ma || ten).toLowerCase();
      if (daCo[khoaTrung]) return;
      daCo[khoaTrung] = true;
      var nhan = ten && ma ? ten + " · " + ma : (ten || ma);
      ds.push({ ma: ma, ten: ten || ma, donVi: dv, nhan: nhan });
    });
    return ds.slice(0, GIOI_HAN_MUC);
  }

  function demSoKhong(so, doDai) {
    var s = String(so);
    while (s.length < doDai) s = "0" + s;
    return s;
  }

  /** Rút gọn tên đại biểu cho nan đĩa khi có nhiều ô, tránh cắt cụt vô nghĩa. */
  function rutGonTenTrenNan(ten, ma) {
    var t = chuanHoaChu(ten);
    var m = chuanHoaChu(ma);
    if (!t) return m;
    if (t.length <= 18) return t;
    var tu = t.split(" ");
    if (tu.length >= 4) {
      var vietTat = tu.slice(0, tu.length - 2).map(function (w) { return w.charAt(0).toUpperCase() + "."; }).join("");
      var gon = vietTat + " " + tu[tu.length - 2] + " " + tu[tu.length - 1];
      if (gon.length <= 20) return gon;
    }
    if (tu.length >= 2) {
      var vietTatHet = tu.slice(0, tu.length - 1).map(function (w) { return w.charAt(0).toUpperCase() + "."; }).join("");
      return vietTatHet + " " + tu[tu.length - 1];
    }
    return t.slice(0, 18);
  }

  /** Lập danh sách đại biểu khả dụng có đánh số thứ tự cố định theo danh sách gốc (001..N). */
  function taoDanhSachSo(danhSach, ketQua) {
    var goc = Array.isArray(danhSach) ? danhSach : [];
    var doDai = goc.length >= 100 ? String(goc.length).length : 2;
    var daMa = new Set();
    var daTen = new Set();
    var daSo = new Set();

    (ketQua || []).forEach(function (k) {
      if (!k || k.trangThai === "huy" || k.loai === "dot-bien") return;
      if (k.ma) daMa.add(chuanHoaChu(k.ma).toLowerCase());
      if (k.ten) daTen.add(chuanHoaChu(k.ten).toLowerCase());
      if (k.soThuTu) daSo.add(String(k.soThuTu));
    });

    var daTrongDs = Object.create(null);
    var ds = [];
    for (var i = 0; i < goc.length; i += 1) {
      var n = goc[i];
      if (!n) continue;
      var ma = chuanHoaChu(n.ma).slice(0, 40);
      var ten = chuanHoaChu(n.ten).slice(0, 80);
      var dv = chuanHoaChu(n.donVi).slice(0, 80);
      if (!ten && !ma) continue;

      var khoa = (ma || ten).toLowerCase();
      if (daTrongDs[khoa]) continue;
      daTrongDs[khoa] = true;

      var stt = i + 1;
      var so = demSoKhong(stt, doDai);
      if (daSo.has(so)) continue;
      if (ma && daMa.has(ma.toLowerCase())) continue;
      if (!ma && ten && daTen.has(ten.toLowerCase())) continue;

      var dauSo = so.slice(0, -1);
      var soCuoi = so.slice(-1);
      ds.push({
        stt: stt,
        so: so,
        dauSo: dauSo,
        soCuoi: soCuoi,
        ma: ma,
        ten: ten || ma,
        donVi: dv,
        nhan: so + " · " + (ten || ma),
      });
    }
    return ds;
  }

  /** Trích danh sách các đầu số thực có tồn tại (ví dụ 00_, 01_, …, 31_) theo thứ tự tăng dần. */
  function layDauSoTuDanhSachSo(dsSo) {
    var nhom = Object.create(null);
    var thuTu = [];
    (dsSo || []).forEach(function (item) {
      if (!item || item.dauSo == null) return;
      var d = String(item.dauSo);
      if (!nhom[d]) {
        nhom[d] = { dauSo: d, nhan: d + "_", soLuong: 0 };
        thuTu.push(d);
      }
      nhom[d].soLuong += 1;
    });
    thuTu.sort(function (a, b) { return Number(a) - Number(b); });
    return thuTu.map(function (d) { return nhom[d]; });
  }

  /** Trích danh sách chữ số cuối (0–9) thực có thuộc đầu số dauSo để vẽ Chặng 2 không có ô ảo. */
  function laySoCuoiTheoDauSo(dsSo, dauSo) {
    var dich = String(dauSo == null ? "" : dauSo);
    return (dsSo || [])
      .filter(function (item) { return item && String(item.dauSo) === dich; })
      .sort(function (a, b) { return Number(a.soCuoi) - Number(b.soCuoi); })
      .map(function (item) {
        return {
          soCuoi: item.soCuoi,
          so: item.so,
          dauSo: item.dauSo,
          nhan: item.soCuoi,
          nguoi: item,
        };
      });
  }

  /** Các mục còn lại trên vòng quay. */
  function mucConLai(tatCa, ketQua, loaiDaTrung) {
    if (!loaiDaTrung) return (tatCa || []).slice();
    var da = new Set(
      (ketQua || [])
        .filter(function (k) { return k && k.trangThai !== "huy" && k.loai !== "dot-bien" && k.muc; })
        .map(function (k) { return String(k.muc).toLowerCase(); })
    );
    return (tatCa || []).filter(function (m) { return !da.has(String(m).toLowerCase()); });
  }

  /** Trộn xen kẽ đều tối đa 2-3 ô Đột biến sân khấu khi đĩa có từ 2 đến 24 ô. */
  function tronDotBien(dsMuc, tuyChon) {
    var goc = (dsMuc || []).map(function (item) {
      if (item && typeof item === "object") {
        return {
          nhan: String(item.nhan || item.muc || ""),
          loai: item.loai === "dot-bien" ? "dot-bien" : "thuong",
          maDotBien: item.maDotBien || null,
        };
      }
      return { nhan: String(item == null ? "" : item), loai: "thuong", maDotBien: null };
    });
    if (goc.length < 2 || goc.length > 24) return goc;

    var boChon = goc.length >= 6
      ? [DANH_SACH_DOT_BIEN[0], DANH_SACH_DOT_BIEN[1], DANH_SACH_DOT_BIEN[2]]
      : [DANH_SACH_DOT_BIEN[0], DANH_SACH_DOT_BIEN[2]];

    if (tuyChon && typeof tuyChon === "object") {
      var loaiBo = null;
      if (tuyChon.loaiBoMa instanceof Set) loaiBo = tuyChon.loaiBoMa;
      else if (Array.isArray(tuyChon.loaiBoMa)) loaiBo = new Set(tuyChon.loaiBoMa);
      if (loaiBo && loaiBo.size) {
        boChon = boChon.filter(function (o) { return !loaiBo.has(o.maDotBien); });
      }
      if (typeof tuyChon.toiDa === "number" && isFinite(tuyChon.toiDa)) {
        var hanMuc = Math.max(0, Math.floor(tuyChon.toiDa));
        boChon = boChon.slice(0, hanMuc);
      }
    }
    if (!boChon.length) return goc;

    var soChen = boChon.length;
    var viTriChen = Object.create(null);
    for (var k = 0; k < soChen; k += 1) {
      var idx = Math.max(0, Math.min(goc.length - 1, Math.floor(((k + 1) * goc.length) / soChen) - 1));
      viTriChen[idx] = boChon[k];
    }

    var ketQua = [];
    for (var i = 0; i < goc.length; i += 1) {
      ketQua.push(goc[i]);
      if (viTriChen[i]) {
        ketQua.push({
          nhan: viTriChen[i].nhan,
          loai: viTriChen[i].loai,
          maDotBien: viTriChen[i].maDotBien,
        });
      }
    }
    return ketQua;
  }

  /** Bốc ngẫu nhiên đều một mục từ danh sách. Trả null khi danh sách rỗng. */
  function bocMuc(ds, rng) {
    if (!ds || !ds.length) return null;
    var r = (rng || rngMatMa())();
    var chiSo = Math.min(ds.length - 1, Math.floor(r * ds.length));
    return { chiSo: chiSo, muc: ds[chiSo] };
  }

  /** Chỉ số ô đang nằm dưới kim đặt tại góc thế giới gocKim (rad, mặc định 0) khi vòng xoay ở góc goc. */
  function chiSoTaiGoc(goc, tongSo, gocKim) {
    if (!tongSo) return -1;
    var buoc = HAI_PI / tongSo;
    var gk = typeof gocKim === "number" && isFinite(gocKim) ? gocKim : 0;
    var gocKimTrongVong = ((gk - goc) % HAI_PI + HAI_PI) % HAI_PI;
    return Math.min(tongSo - 1, Math.floor(gocKimTrongVong / buoc));
  }

  /** Chỉ số ô đang nằm dưới kim chỉ bên phải (góc 0 rad) khi vòng xoay ở góc goc. */
  function chiSoTaiKim(goc, tongSo) {
    return chiSoTaiGoc(goc, tongSo, 0);
  }

  /** Danh sách góc đặt kim (rad) cho chế độ 1, 2 hoặc 3 kim đồng thời. */
  function danhSachGocKim(soKim) {
    if (soKim === 3) return [0, HAI_PI / 3, (2 * HAI_PI) / 3];
    if (soKim === 2) return [0, Math.PI];
    return [0];
  }

  /** Tính góc dừng (rad) để kim chỉ (góc 0) rơi đúng vào ô chiSo sau soVong vòng quay. */
  function tinhGocDung(gocHienTai, chiSo, tongSo, soVong, rng, tuyChon) {
    var buoc = HAI_PI / tongSo;
    var r = (rng || rngMatMa())();
    var lech;
    if (tuyChon && typeof tuyChon.lech === "number" && isFinite(tuyChon.lech)) {
      lech = Math.max(0.04, Math.min(0.96, tuyChon.lech));
    } else {
      lech = 0.2 + r * 0.6; // tránh mép vạch chia
    }
    var gocMucTieu = (-(chiSo + lech) * buoc % HAI_PI + HAI_PI) % HAI_PI;
    var gocHienTaiChuan = ((gocHienTai % HAI_PI) + HAI_PI) % HAI_PI;
    var bu = (gocMucTieu - gocHienTaiChuan + HAI_PI) % HAI_PI;
    return gocHienTai + (soVong || 6) * HAI_PI + bu;
  }

  /** Tính góc dừng an toàn cho chế độ Đa kim sao cho không kim phụ nào rơi sát vạch chia. */
  function tinhGocDungDaKim(gocHienTai, chiSo0, tongSo, soVong, soKim, rng) {
    var boRng = rng || rngMatMa();
    var vongQuay = soVong || (6 + Math.floor(boRng() * 5));
    var gocCacKim = danhSachGocKim(soKim);
    if (!tongSo) return { gocDich: gocHienTai, cacChiSo: [], soVong: vongQuay };

    var buoc = HAI_PI / tongSo;
    var gocTotNhat = null;
    var cacChiSoTotNhat = null;
    var diemTotNhat = -1;

    function danhGiaLech(lech) {
      var gocThu = tinhGocDung(gocHienTai, chiSo0, tongSo, vongQuay, boRng, { lech: lech });
      var dsChiSo = [];
      var daCo = Object.create(null);
      var trungO = false;
      var khoangCachMin = 1;

      for (var i = 0; i < gocCacKim.length; i += 1) {
        var gk = gocCacKim[i];
        var gocTrongVong = ((gk - gocThu) % HAI_PI + HAI_PI) % HAI_PI;
        var viTri = gocTrongVong / buoc;
        var idx = Math.min(tongSo - 1, Math.floor(viTri));
        var phanLe = viTri - Math.floor(viTri);
        var cachMep = Math.min(phanLe, 1 - phanLe);
        if (cachMep < khoangCachMin) khoangCachMin = cachMep;
        if (daCo[idx]) trungO = true;
        daCo[idx] = true;
        dsChiSo.push(idx);
      }

      var hopLe = !trungO && khoangCachMin >= 0.08;
      var diem = (trungO ? -1 : 0) + khoangCachMin;
      if (diem > diemTotNhat) {
        diemTotNhat = diem;
        gocTotNhat = gocThu;
        cacChiSoTotNhat = dsChiSo;
      }
      return hopLe ? { gocDich: gocThu, cacChiSo: dsChiSo, soVong: vongQuay } : null;
    }

    for (var thu = 0; thu < 24; thu += 1) {
      var kq = danhGiaLech(0.18 + boRng() * 0.64);
      if (kq) return kq;
    }

    var buocQuet = 0.64 / 40;
    var batDau = Math.floor(boRng() * 40);
    for (var q = 0; q <= 40; q += 1) {
      var k = (batDau + q) % 41;
      var kqQuet = danhGiaLech(0.18 + k * buocQuet);
      if (kqQuet) return kqQuet;
    }

    return { gocDich: gocTotNhat, cacChiSo: cacChiSoTotNhat, soVong: vongQuay };
  }

  /** Tính pha dừng kèm kịch tính Sát nút (~28% lượt quay khi bật và có từ 3 ô trở lên). */
  function tinhPhaDung(gocHienTai, chiSo, tongSo, soVong, choPhepSatNut, rng) {
    var boRng = rng || rngMatMa();
    var vongQuay = soVong || (6 + Math.floor(boRng() * 5)); // 6 đến 10 vòng
    var satNut = Boolean(choPhepSatNut) && tongSo >= 3 && boRng() < 0.28;
    if (satNut) {
      var mep = boRng() < 0.5 ? "dau" : "cuoi";
      var lech = mep === "dau" ? 0.06 : 0.94;
      return {
        gocDich: tinhGocDung(gocHienTai, chiSo, tongSo, vongQuay, boRng, { lech: lech }),
        satNut: true,
        mep: mep,
        soVong: vongQuay,
      };
    }
    return {
      gocDich: tinhGocDung(gocHienTai, chiSo, tongSo, vongQuay, boRng),
      satNut: false,
      mep: "giua",
      soVong: vongQuay,
    };
  }

  /** Dòng xuất CSV / biên bản chuẩn 4 cột (giữ tương thích ngược). */
  function dongXuat(ketQua) {
    var dong = [["Lượt", "Kết quả", "Thời gian", "Trạng thái"]];
    (ketQua || []).forEach(function (k, i) {
      dong.push([String(i + 1), k.muc, k.luc, k.trangThai === "huy" ? "Đã hủy" : "Trúng"]);
    });
    return dong;
  }

  function tenCheDoXuat(k) {
    if (!k) return "Quay thường";
    if (k.loai === "dot-bien") return "Ô Đột biến";
    if (k.cheDo === "so-hai-chang" || k.loai === "so-hai-chang") return "Quay 300+ (2 chặng)";
    if (k.cheDo === "hai-nhip" || k.loai === "hai-nhip") return "Quay 2 nhịp";
    if (k.cheDo === "sinh-ton" || k.loai === "sinh-ton") return "Chung kết Sinh tồn";
    if (k.soKim > 1) return "Quay nhanh " + k.soKim + " kim";
    return "Quay thường";
  }

  function trangThaiXuat(k) {
    if (!k) return "";
    if (k.trangThai === "huy") return "Đã hủy";
    if (k.vaiTro === "quan-quan") return "Quán quân Sinh tồn";
    if (k.vaiTro === "khuyen-khich") return "Quà đồng hành";
    if (k.loai === "dot-bien") return "Hiệu ứng sân khấu";
    if (k.heSo === 2) return "Trúng (×2 Quà)";
    return "Trúng";
  }

  /** Dòng xuất CSV / biên bản mở rộng 6 cột (đủ Khoa/Đơn vị, Chế độ và ghi chú Đột biến). */
  function dongXuatChiTiet(ketQua) {
    var dong = [["Lượt", "Kết quả", "Chi tiết / Đơn vị", "Chế độ", "Thời gian", "Trạng thái"]];
    (ketQua || []).forEach(function (k, i) {
      var chiTiet = [];
      if (k.donVi) chiTiet.push(k.donVi);
      if (k.ghiChu && k.ghiChu !== k.donVi) chiTiet.push(k.ghiChu);
      dong.push([
        String(i + 1),
        k.muc || "",
        chiTiet.join(" · "),
        tenCheDoXuat(k),
        k.luc || "",
        trangThaiXuat(k),
      ]);
    });
    return dong;
  }

  var api = {
    docMucTuVanBan: docMucTuVanBan,
    layDonViTuDanhSach: layDonViTuDanhSach,
    layNguoiTheoDonVi: layNguoiTheoDonVi,
    taoDanhSachSo: taoDanhSachSo,
    layDauSoTuDanhSachSo: layDauSoTuDanhSachSo,
    laySoCuoiTheoDauSo: laySoCuoiTheoDauSo,
    rutGonTenTrenNan: rutGonTenTrenNan,
    mucConLai: mucConLai,
    tronDotBien: tronDotBien,
    bocMuc: bocMuc,
    chiSoTaiGoc: chiSoTaiGoc,
    chiSoTaiKim: chiSoTaiKim,
    danhSachGocKim: danhSachGocKim,
    tinhGocDung: tinhGocDung,
    tinhGocDungDaKim: tinhGocDungDaKim,
    tinhPhaDung: tinhPhaDung,
    dongXuat: dongXuat,
    dongXuatChiTiet: dongXuatChiTiet,
    rngMatMa: rngMatMa,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.VongQuay = api;
})(typeof window !== "undefined" ? window : globalThis);
