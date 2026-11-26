/* Logic quay số trúng thưởng. Thuần, không đụng DOM; dùng được trong trình duyệt và test Node.
 *
 * Mỗi kết quả: { id, giaiId, ma, ten, donVi, luc, trangThai: "trung" | "huy" }.
 * "huy" = hủy giải (thường do người trúng vắng mặt); suất giải đó được quay lại. */
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

  var khoa = function (ma) { return String(ma).trim().toUpperCase(); };

  /** Số suất còn lại của một giải. */
  function conLai(giai, ketQua) {
    var daTrung = ketQua.filter(function (k) { return k.giaiId === giai.id && k.trangThai === "trung"; }).length;
    return Math.max(0, giai.soLuong - daTrung);
  }

  /**
   * Người còn trong lồng quay.
   * moiNguoiMotGiai: người đã trúng (chưa bị hủy) không được quay tiếp.
   * loaiNguoiVang: người bị hủy giải (vắng mặt) không được quay lại.
   */
  function longQuay(danhSach, ketQua, tuyChon) {
    var o = tuyChon || {};
    var loai = new Set();
    ketQua.forEach(function (k) {
      if (k.trangThai === "trung" && o.moiNguoiMotGiai !== false) loai.add(khoa(k.ma));
      if (k.trangThai === "huy" && o.loaiNguoiVang !== false) loai.add(khoa(k.ma));
    });
    return danhSach.filter(function (n) { return !loai.has(khoa(n.ma)); });
  }

  /** Bốc một người ngẫu nhiên đều trong lồng quay. Trả null khi lồng trống. */
  function boc(long, rng) {
    if (!long.length) return null;
    var r = (rng || rngMatMa())();
    return long[Math.min(long.length - 1, Math.floor(r * long.length))];
  }

  /** Bộ ký tự cho cuộn quay: các ký tự xuất hiện trong mã, sắp xếp ổn định, có ký tự trống. */
  function boKyTu(danhSach) {
    var tap = new Set([" "]);
    danhSach.forEach(function (n) { khoa(n.ma).split("").forEach(function (c) { tap.add(c); }); });
    return Array.from(tap).sort(function (a, b) {
      var loai = function (c) { return c === " " ? 0 : /[0-9]/.test(c) ? 1 : /[A-Z]/.test(c) ? 2 : 3; };
      return loai(a) - loai(b) || (a < b ? -1 : a > b ? 1 : 0);
    });
  }

  function doDaiMa(danhSach) {
    return danhSach.reduce(function (m, n) { return Math.max(m, khoa(n.ma).length); }, 1);
  }

  /** Mã căn phải theo số cuộn (ký tự trống ở đầu) để các mã dài ngắn khác nhau vẫn thẳng hàng. */
  function canMa(ma, soCuon) {
    var s = khoa(ma);
    return s.length >= soCuon ? s.slice(-soCuon) : new Array(soCuon - s.length + 1).join(" ") + s;
  }

  /** Lọc danh sách trong lồng quay theo tiền tố mã đã căn phải theo số cuộn. */
  function locTheoTienTo(long, tienTo, soCuon) {
    if (!Array.isArray(long)) return [];
    var t = String(tienTo || "").toUpperCase();
    if (!t.length) return long.slice();
    return long.filter(function (n) {
      return canMa(n.ma, soCuon).slice(0, t.length) === t;
    });
  }

  /**
   * Phân tích thứ tự dừng cuộn cho chế độ Quay Thông Minh:
   * - Các vị trí đồng nhất 100% (chỉ 1 ký tự duy nhất trong lồng) vào viTriCoDinh để khóa nhanh làm nền.
   * - Các vị trí biến thiên còn lại xếp ngược từ đuôi về đầu khi daoNguoc !== false, hoặc xuôi từ trái sang phải.
   */
  function phanTichThuTuQuay(long, soCuon, daoNguoc) {
    var tongCuon = Math.max(1, Math.floor(Number(soCuon) || 1));
    var viTriCoDinh = [];
    var viTriBienThien = [];
    var coDuLieu = Array.isArray(long) && long.length > 0;
    var maCanDs = coDuLieu ? long.map(function (n) { return canMa(n.ma, tongCuon); }) : [];

    for (var i = 0; i < tongCuon; i += 1) {
      if (!coDuLieu) {
        viTriBienThien.push(i);
        continue;
      }
      var kyTuDau = maCanDs[0].charAt(i);
      var dongNhat = true;
      for (var j = 1; j < maCanDs.length; j += 1) {
        if (maCanDs[j].charAt(i) !== kyTuDau) {
          dongNhat = false;
          break;
        }
      }
      if (dongNhat) viTriCoDinh.push(i);
      else viTriBienThien.push(i);
    }

    if (daoNguoc !== false) viTriBienThien.reverse();
    return {
      viTriCoDinh: viTriCoDinh,
      thuTu: viTriCoDinh.concat(viTriBienThien),
    };
  }

  /**
   * Lọc danh sách trong lồng quay khớp toàn bộ các vị trí ký tự đã khóa.
   * mauKyTu: bảng ánh xạ { [viTri]: kyTu } theo mã đã căn phải soCuon ký tự.
   */
  function locTheoViTri(long, mauKyTu, soCuon) {
    if (!Array.isArray(long)) return [];
    if (!mauKyTu || typeof mauKyTu !== "object") return long.slice();
    var tongCuon = Math.max(1, Math.floor(Number(soCuon) || 1));
    var dieuKien = [];
    Object.keys(mauKyTu).forEach(function (k) {
      var vt = Number(k);
      if (isNaN(vt) || vt < 0 || vt >= tongCuon) return;
      var gt = mauKyTu[k];
      if (gt === undefined || gt === null) return;
      dieuKien.push({ viTri: vt, kyTu: String(gt).toUpperCase() });
    });
    if (!dieuKien.length) return long.slice();
    return long.filter(function (n) {
      var ma = canMa(n.ma, tongCuon);
      for (var i = 0; i < dieuKien.length; i += 1) {
        if (ma.charAt(dieuKien[i].viTri) !== dieuKien[i].kyTu) return false;
      }
      return true;
    });
  }

  /** Bốc nhiều người không trùng bằng Fisher-Yates từng phần dùng nguồn ngẫu nhiên mật mã. */
  function bocNhieu(long, soLuong, rng) {
    if (!Array.isArray(long) || !long.length) return [];
    var n = Math.max(0, Math.min(Math.floor(Number(soLuong) || 0), long.length));
    if (!n) return [];
    var banSao = long.slice();
    var r = rng || rngMatMa();
    for (var i = 0; i < n; i += 1) {
      var j = i + Math.min(banSao.length - 1 - i, Math.floor(r() * (banSao.length - i)));
      var tam = banSao[i];
      banSao[i] = banSao[j];
      banSao[j] = tam;
    }
    return banSao.slice(0, n);
  }

  function soSanhMaTuNhien(a, b) {
    return String(a || "").trim().localeCompare(String(b || "").trim(), "vi", { numeric: true, sensitivity: "base" });
  }

  function khoangCachMaSo(maA, maB) {
    var a = khoa(maA).match(/^(.*?)(\d+)$/);
    var b = khoa(maB).match(/^(.*?)(\d+)$/);
    if (!a || !b || a[1] !== b[1]) return Infinity;
    return Math.abs(Number(a[2]) - Number(b[2]));
  }

  /** Tìm tối đa soLuong người trong lồng quay có mã liền kề sát nhất trước/sau maGoc. */
  function timMaLienKe(long, maGoc, soLuong) {
    if (!Array.isArray(long) || !long.length) return [];
    var toiDa = Math.max(1, Math.floor(Number(soLuong) || 2));
    var goc = khoa(maGoc);
    var ds = long.filter(function (n) { return khoa(n.ma) !== goc; }).sort(function (a, b) {
      return soSanhMaTuNhien(a.ma, b.ma);
    });
    if (!ds.length) return [];
    var viTri = 0;
    while (viTri < ds.length && soSanhMaTuNhien(ds[viTri].ma, maGoc) < 0) viTri += 1;
    var trai = viTri - 1;
    var phai = viTri;
    var ketQua = [];
    var uuTienTrai = true;
    while (ketQua.length < toiDa && (trai >= 0 || phai < ds.length)) {
      if (trai >= 0 && phai < ds.length) {
        var kcTrai = khoangCachMaSo(ds[trai].ma, maGoc);
        var kcPhai = khoangCachMaSo(ds[phai].ma, maGoc);
        var chonTrai;
        if (kcTrai !== kcPhai) chonTrai = kcTrai < kcPhai;
        else chonTrai = uuTienTrai;
        if (chonTrai) { ketQua.push(ds[trai]); trai -= 1; uuTienTrai = false; }
        else { ketQua.push(ds[phai]); phai += 1; uuTienTrai = true; }
      } else if (trai >= 0) {
        ketQua.push(ds[trai]); trai -= 1;
      } else {
        ketQua.push(ds[phai]); phai += 1;
      }
    }
    return ketQua;
  }

  /** Lọc danh sách trong lồng quay theo cùng đơn vị (so sánh chuẩn hóa), loại trừ mã chỉ định nếu có. */
  function locCungDonVi(long, donVi, maLoaiTru) {
    if (!Array.isArray(long) || !long.length) return [];
    var dv = chuanHoaDonVi(donVi);
    if (!dv) return [];
    var loai = maLoaiTru ? khoa(maLoaiTru) : "";
    return long.filter(function (n) {
      if (!n) return false;
      if (loai && khoa(n.ma) === loai) return false;
      return chuanHoaDonVi(n.donVi) === dv;
    });
  }

  /** Dòng CSV kết quả theo thứ tự giải (kèm nhóm Lộc Liền Kề và Lộc Đồng Đội nếu có). */
  function dongXuat(giaiDs, ketQua) {
    var dong = [["Giải", "Phần thưởng", "Mã nhân viên", "Họ tên", "Đơn vị", "Thời gian", "Trạng thái"]];
    giaiDs.forEach(function (g) {
      ketQua.filter(function (k) { return k.giaiId === g.id; }).forEach(function (k) {
        dong.push([g.ten, g.phanThuong || "", k.ma, k.ten, k.donVi, k.luc, k.trangThai === "huy" ? "Đã hủy (vắng mặt)" : "Trúng giải"]);
      });
    });
    ketQua.filter(function (k) { return k.giaiId === "loc-lien-ke"; }).forEach(function (k) {
      dong.push(["Lộc Liền Kề", k.phanThuong || "Quà tri ân mã liền kề Giải Đặc biệt", k.ma, k.ten, k.donVi, k.luc, k.trangThai === "huy" ? "Đã hủy (vắng mặt)" : "Trúng giải"]);
    });
    ketQua.filter(function (k) { return k.giaiId === "loc-dong-doi"; }).forEach(function (k) {
      dong.push(["Lộc Đồng Đội", k.phanThuong || "Quà đồng đội cùng đơn vị Giải Đặc biệt", k.ma, k.ten, k.donVi, k.luc, k.trangThai === "huy" ? "Đã hủy (vắng mặt)" : "Trúng giải"]);
    });
    return dong;
  }

  var api = {
    conLai: conLai,
    longQuay: longQuay,
    boc: boc,
    boKyTu: boKyTu,
    doDaiMa: doDaiMa,
    canMa: canMa,
    dongXuat: dongXuat,
    rngMatMa: rngMatMa,
    locTheoTienTo: locTheoTienTo,
    locCungDonVi: locCungDonVi,
    phanTichThuTuQuay: phanTichThuTuQuay,
    locTheoViTri: locTheoViTri,
    bocNhieu: bocNhieu,
    timMaLienKe: timMaLienKe,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Quay = api;
})(typeof window !== "undefined" ? window : globalThis);
