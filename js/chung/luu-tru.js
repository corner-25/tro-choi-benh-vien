/* Lưu dữ liệu trong trình duyệt của máy đang chạy (localStorage). Không gửi đi đâu.
 * Danh sách người chơi và tên sự kiện dùng chung cho mọi trò; mỗi trò có trạng thái riêng.
 * Trình duyệt chặn lưu trữ thì trò chơi vẫn chạy, chỉ không nhớ sau khi tải lại trang. */
(function (root) {
  "use strict";

  var TIEN_TO = "umc-tro-choi:";
  var KHOA_DANH_SACH = TIEN_TO + "danh-sach";
  var KHOA_SU_KIEN = TIEN_TO + "su-kien";
  var KHOA_CHU_DE = TIEN_TO + "chu-de";
  var TEN_SU_KIEN_MAC_DINH = "Hội nghị Đại biểu VC-NLĐ 2026";
  var CHU_DE_HOP_LE = ["hoi-nghi", "le-tet", "y-te"];

  function doc(khoa) {
    try {
      var raw = window.localStorage.getItem(TIEN_TO + khoa);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn("Không đọc được dữ liệu đã lưu (" + khoa + "):", e && e.message);
      return null;
    }
  }

  /** Trả false khi không lưu được (đầy bộ nhớ, trình duyệt chặn). */
  function ghi(khoa, giaTri) {
    try {
      window.localStorage.setItem(TIEN_TO + khoa, JSON.stringify(giaTri));
      return true;
    } catch (e) {
      console.warn("Không lưu được dữ liệu (" + khoa + "):", e && e.message);
      return false;
    }
  }

  function xoa(khoa) {
    try { window.localStorage.removeItem(TIEN_TO + khoa); } catch (e) { console.warn("Không xóa được dữ liệu:", e && e.message); }
  }

  /** Danh sách người chơi chung: [{ ma, ten, donVi }]. */
  function docDanhSach() {
    var d = null;
    try { d = JSON.parse(window.localStorage.getItem(KHOA_DANH_SACH) || "null"); } catch (e) { console.warn("Danh sách đã lưu bị lỗi:", e && e.message); }
    if (!d || !Array.isArray(d.nguoiChoi)) return { nguoiChoi: [], capNhatLuc: null };
    return { nguoiChoi: d.nguoiChoi.filter(function (n) { return n && typeof n.ma === "string"; }), capNhatLuc: d.capNhatLuc || null };
  }

  function ghiDanhSach(nguoiChoi) {
    try {
      window.localStorage.setItem(KHOA_DANH_SACH, JSON.stringify({ nguoiChoi: nguoiChoi, capNhatLuc: new Date().toISOString() }));
      return true;
    } catch (e) {
      console.warn("Không lưu được danh sách:", e && e.message);
      return false;
    }
  }

  function docTenSuKien() {
    try { return window.localStorage.getItem(KHOA_SU_KIEN) || TEN_SU_KIEN_MAC_DINH; } catch (e) { return TEN_SU_KIEN_MAC_DINH; }
  }

  function ghiTenSuKien(ten) {
    try { window.localStorage.setItem(KHOA_SU_KIEN, String(ten).slice(0, 80)); } catch (e) { console.warn("Không lưu được tên sự kiện:", e && e.message); }
  }

  function docChuDe() {
    try {
      var ma = window.localStorage.getItem(KHOA_CHU_DE);
      return CHU_DE_HOP_LE.indexOf(ma) >= 0 ? ma : "hoi-nghi";
    } catch (e) { return "hoi-nghi"; }
  }

  function apDungChuDe(ma) {
    var chon = CHU_DE_HOP_LE.indexOf(ma) >= 0 ? ma : docChuDe();
    if (typeof document !== "undefined" && document.documentElement) {
      document.documentElement.setAttribute("data-chu-de", chon);
    }
    return chon;
  }

  function ghiChuDe(ma) {
    var chon = CHU_DE_HOP_LE.indexOf(ma) >= 0 ? ma : "hoi-nghi";
    try { window.localStorage.setItem(KHOA_CHU_DE, chon); } catch (e) { console.warn("Không lưu được chủ đề:", e && e.message); }
    apDungChuDe(chon);
  }

  /** Ước lượng dung lượng localStorage đã dùng bởi cổng trò chơi (byte). */
  function dungLuongDaDung() {
    var tong = 0;
    try {
      Object.keys(window.localStorage).forEach(function (k) {
        if (k.indexOf(TIEN_TO) === 0) {
          var v = window.localStorage.getItem(k) || "";
          tong += (k.length + v.length) * 2;
        }
      });
    } catch (e) { return 0; }
    return tong;
  }

  /** Xóa toàn bộ dữ liệu của cổng trò chơi trên máy này. */
  function xoaTatCa() {
    try {
      Object.keys(window.localStorage).filter(function (k) { return k.indexOf(TIEN_TO) === 0; }).forEach(function (k) { window.localStorage.removeItem(k); });
    } catch (e) { console.warn("Không xóa được dữ liệu:", e && e.message); }
    apDungChuDe("hoi-nghi");
  }

  /** Ô CSV an toàn: bọc ngoặc kép, chặn công thức khi mở bằng Excel. */
  function oCsv(v) {
    var s = String(v == null ? "" : v);
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return '"' + s.replace(/"/g, '""') + '"';
  }

  /** Tải file CSV (mở bằng Excel). dong: mảng các dòng, dòng đầu là tiêu đề. */
  function taiCsv(dong, tenFile) {
    var csv = "﻿" + dong.map(function (d) { return d.map(oCsv).join(","); }).join("\r\n");
    var blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = tenFile;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  }

  root.LuuTru = {
    doc: doc, ghi: ghi, xoa: xoa, xoaTatCa: xoaTatCa,
    docDanhSach: docDanhSach, ghiDanhSach: ghiDanhSach, docTenSuKien: docTenSuKien, ghiTenSuKien: ghiTenSuKien,
    docChuDe: docChuDe, ghiChuDe: ghiChuDe, apDungChuDe: apDungChuDe, dungLuongDaDung: dungLuongDaDung,
    taiCsv: taiCsv, oCsv: oCsv,
  };
  apDungChuDe();
})(window);
