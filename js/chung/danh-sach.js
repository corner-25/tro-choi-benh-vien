/* Đọc danh sách người chơi từ văn bản dán (Excel, CSV) hoặc từ các dòng của file Excel.
 * Thuần, không đụng DOM: dùng được trong trình duyệt và trong test Node. */
(function (root) {
  "use strict";

  var GIOI_HAN = 3000;

  function boDau(s) {
    return String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().trim();
  }

  function loaiCot(tieuDe) {
    var t = boDau(tieuDe).replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
    if (!t) return null;
    if (/^(ma|ma nv|ma nhan vien|ma vien chuc|ma vc|ma so|msnv|ma can bo|id)$/.test(t) || /^ma (nhan vien|vien chuc|nv|vc|so|can bo)/.test(t)) return "ma";
    if (/(ho va ten|ho ten|^ten$|^ten nhan vien|^ten vien chuc|^ho ten)/.test(t)) return "ten";
    if (/(don vi|khoa|phong|bo phan)/.test(t)) return "donVi";
    return null;
  }

  /** Tìm vị trí các cột từ dòng tiêu đề; null khi dòng đầu không phải tiêu đề. */
  function timCot(dong) {
    var cot = {};
    dong.forEach(function (o, i) {
      var loai = loaiCot(o);
      if (loai && cot[loai] === undefined) cot[loai] = i;
    });
    return cot.ma !== undefined && cot.ten !== undefined ? cot : null;
  }

  function tachDong(dong) {
    if (dong.indexOf("\t") >= 0) return dong.split("\t");
    if (dong.indexOf(";") >= 0) return dong.split(";");
    return dong.split(",");
  }

  /** Văn bản dán từ Excel (cột cách nhau bằng Tab) hoặc CSV → mảng dòng, mỗi dòng là mảng ô. */
  function tachVanBan(text) {
    return String(text || "")
      .replace(/^﻿/, "")
      .split(/\r?\n/)
      .filter(function (d) { return d.trim() !== ""; })
      .map(function (d) { return tachDong(d).map(function (o) { return o.replace(/^"|"$/g, "").trim(); }); });
  }

  /**
   * Mảng dòng → { nguoiChoi, loi, canhBao }.
   * Có dòng tiêu đề thì nhận cột theo tên (Mã NV, Họ tên, Đơn vị); không có thì lấy 3 cột đầu theo thứ tự đó.
   */
  function docDong(dong) {
    var loi = [];
    var canhBao = [];
    if (!dong.length) return { nguoiChoi: [], loi: ["Danh sách trống."], canhBao: canhBao };
    var cot = timCot(dong[0]);
    var batDau = cot ? 1 : 0;
    if (!cot) cot = { ma: 0, ten: 1, donVi: 2 };

    var daCo = Object.create(null);
    var nguoiChoi = [];
    for (var i = batDau; i < dong.length; i += 1) {
      var d = dong[i];
      var soDong = i + 1;
      var ma = String(d[cot.ma] == null ? "" : d[cot.ma]).trim();
      var ten = String(d[cot.ten] == null ? "" : d[cot.ten]).trim().replace(/\s+/g, " ");
      var donVi = cot.donVi === undefined ? "" : String(d[cot.donVi] == null ? "" : d[cot.donVi]).trim().replace(/\s+/g, " ");
      if (!ma && !ten) continue;
      if (!ma) { loi.push("Dòng " + soDong + ": thiếu mã nhân viên (" + ten + ")."); continue; }
      if (ma.length > 30) { loi.push("Dòng " + soDong + ": mã nhân viên quá dài."); continue; }
      var khoa = ma.toUpperCase();
      if (daCo[khoa]) { loi.push("Dòng " + soDong + ": mã " + ma + " bị trùng với dòng " + daCo[khoa] + ", đã bỏ qua."); continue; }
      if (!ten) canhBao.push("Dòng " + soDong + ": mã " + ma + " chưa có họ tên.");
      daCo[khoa] = soDong;
      nguoiChoi.push({ ma: ma, ten: ten.slice(0, 80), donVi: donVi.slice(0, 120) });
      if (nguoiChoi.length >= GIOI_HAN) { canhBao.push("Chỉ nhận tối đa " + GIOI_HAN + " người, các dòng sau bị bỏ qua."); break; }
    }
    if (!nguoiChoi.length && !loi.length) loi.push("Không đọc được người chơi nào. Kiểm tra lại cột Mã nhân viên và Họ tên.");
    return { nguoiChoi: nguoiChoi, loi: loi, canhBao: canhBao };
  }

  function docVanBan(text) {
    return docDong(tachVanBan(text));
  }

  /** Giá trị ô ExcelJS (chuỗi, số, rich text, công thức, ngày) → chuỗi. */
  function giaTriO(v) {
    if (v == null) return "";
    if (typeof v === "object") {
      if (Array.isArray(v.richText)) return v.richText.map(function (p) { return p.text; }).join("");
      if (v.result !== undefined) return giaTriO(v.result);
      if (v.text !== undefined) return String(v.text);
      if (v instanceof Date) return v.toISOString().slice(0, 10);
    }
    return String(v);
  }

  var api = { docVanBan: docVanBan, docDong: docDong, tachVanBan: tachVanBan, giaTriO: giaTriO, boDau: boDau, GIOI_HAN: GIOI_HAN };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.DanhSach = api;
})(typeof window !== "undefined" ? window : globalThis);
