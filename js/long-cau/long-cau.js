/* Logic thuần cho Xổ số Lồng cầu vật lý. Không đụng DOM; dùng được trong trình duyệt và test Node.
 * Ngẫu nhiên dùng crypto.getRandomValues. */
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

  function khoa(ma) { return String(ma || "").trim().toUpperCase(); }

  /** Danh sách người còn trong lồng cầu. */
  function conTrongLong(danhSach, ketQua, tuyChon) {
    var o = tuyChon || {};
    var loai = new Set();
    (ketQua || []).forEach(function (k) {
      if (k.trangThai === "trung" && o.moiNguoiMotLan !== false) loai.add(khoa(k.ma));
      if (k.trangThai === "huy" && o.loaiVang !== false) loai.add(khoa(k.ma));
    });
    return (danhSach || []).filter(function (n) { return n && !loai.has(khoa(n.ma)); });
  }

  /** Bốc ngẫu nhiên đều 1 người trong lồng cầu. */
  function bocCau(ds, rng) {
    if (!ds || !ds.length) return null;
    var r = (rng || rngMatMa())();
    return ds[Math.min(ds.length - 1, Math.floor(r * ds.length))];
  }

  /** Lấy chữ số 0-9 cuối cùng xuất hiện trong mã nhân viên, trả về số nguyên hoặc null. */
  function chuSoCuoi(ma) {
    var s = String(ma || "");
    for (var i = s.length - 1; i >= 0; i -= 1) {
      var c = s.charCodeAt(i);
      if (c >= 48 && c <= 57) return c - 48;
    }
    return null;
  }

  /** Xác định Chẵn / Lẻ từ chữ số cuối của mã nhân viên. */
  function chanLeTuMa(ma) {
    var so = chuSoCuoi(ma);
    if (so === null) return null;
    var laChan = so % 2 === 0;
    return { so: so, loai: laChan ? "chan" : "le", nhan: laChan ? "CHẴN" : "LẺ" };
  }

  /** Kiểm tra danh sách có ít nhất một mã chứa chữ số hay không. */
  function coChuSo(ds) {
    return (ds || []).some(function (n) { return n && chuSoCuoi(n.ma) !== null; });
  }

  /** Lọc danh sách theo tên đơn vị (không phân biệt hoa thường và khoảng trắng thừa). */
  function locTheoDonVi(ds, donVi) {
    var chuan = String(donVi || "").trim().toLowerCase();
    if (!chuan) return [];
    return (ds || []).filter(function (n) {
      return n && String(n.donVi || "").trim().toLowerCase() === chuan;
    });
  }

  /** Kiểm tra danh sách có ít nhất một người có cột đơn vị khác rỗng. */
  function coDonVi(ds) {
    return (ds || []).some(function (n) { return n && String(n.donVi || "").trim().length > 0; });
  }

  function dongXuat(ketQua) {
    var dong = [["Lượt", "Mã nhân viên", "Họ tên", "Đơn vị", "Thời gian", "Trạng thái"]];
    (ketQua || []).forEach(function (k, i) {
      dong.push([String(i + 1), k.ma, k.ten, k.donVi || "", k.luc, k.trangThai === "huy" ? "Đã hủy (vắng mặt)" : "Trúng giải"]);
    });
    return dong;
  }

  var api = {
    conTrongLong: conTrongLong,
    bocCau: bocCau,
    dongXuat: dongXuat,
    rngMatMa: rngMatMa,
    chuSoCuoi: chuSoCuoi,
    chanLeTuMa: chanLeTuMa,
    coChuSo: coChuSo,
    locTheoDonVi: locTheoDonVi,
    coDonVi: coDonVi,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.LongCau = api;
})(typeof window !== "undefined" ? window : globalThis);
