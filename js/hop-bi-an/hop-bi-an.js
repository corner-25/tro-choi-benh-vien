/* Logic thuần cho trò Mở Hộp Bí Ẩn. Không đụng DOM; dùng được trong trình duyệt và test Node.
 * Xáo trộn phần thưởng vào các hộp và bốc đại biểu bằng crypto.getRandomValues. */
(function (root) {
  "use strict";

  var BO_MAU_12 = [
    { ten: "GIẢI ĐẶC BIỆT", loai: "dac-biet" },
    { ten: "Giải Nhất", loai: "cao" },
    { ten: "Giải Nhất", loai: "cao" },
    { ten: "Giải Nhì", loai: "thuong" },
    { ten: "Giải Nhì", loai: "thuong" },
    { ten: "Giải Nhì", loai: "thuong" },
    { ten: "Quà Công đoàn", loai: "thuong" },
    { ten: "Quà Công đoàn", loai: "thuong" },
    { ten: "Quà Công đoàn", loai: "thuong" },
    { ten: "Mở thêm 1 hộp nữa!", loai: "dac-quyen" },
    { ten: "Nhân đôi phần quà!", loai: "dac-quyen" },
    { ten: "Tràng pháo tay cổ vũ!", loai: "vui" },
  ];

  var UU_TIEN_LOAI = { "dac-biet": 1, cao: 2, "dac-quyen": 3, thuong: 4, vui: 5 };

  function rngMatMa() {
    var c = (typeof globalThis !== "undefined" && globalThis.crypto) || null;
    if (c && c.getRandomValues) {
      var buf = new Uint32Array(1);
      return function () { c.getRandomValues(buf); return buf[0] / 4294967296; };
    }
    return Math.random;
  }

  function phanLoai(ten) {
    var s = String(ten || "").toLowerCase();
    if (s.indexOf("đặc biệt") >= 0 || s.indexOf("dac biet") >= 0) return "dac-biet";
    if (s.indexOf("nhất") >= 0 || s.indexOf("nhat") >= 0 || s.indexOf("voucher") >= 0) return "cao";
    if (s.indexOf("nhân đôi") >= 0 || s.indexOf("nhan doi") >= 0 || s.indexOf("mở thêm") >= 0 || s.indexOf("mo them") >= 0 || s.indexOf("thêm") >= 0) return "dac-quyen";
    if (s.indexOf("pháo tay") >= 0 || s.indexOf("may mắn") >= 0 || s.indexOf("hát") >= 0) return "vui";
    return "thuong";
  }

  /** Nhận diện loại đặc quyền có thể kích hoạt luật chơi thật. */
  function loaiDacQuyen(ten) {
    var s = String(ten || "").toLowerCase();
    if (s.indexOf("nhân đôi") >= 0 || s.indexOf("nhan doi") >= 0) return "nhan-doi";
    if (s.indexOf("mở thêm") >= 0 || s.indexOf("mo them") >= 0 || s.indexOf("thêm lượt") >= 0 || s.indexOf("them luot") >= 0) return "mo-them";
    return null;
  }

  /** Đọc danh sách quà (mỗi dòng 1 hộp), tối đa 20 hộp. */
  function docQuaTuVanBan(text) {
    return String(text || "").split(/\r?\n/).map(function (d) { return d.trim().slice(0, 80); }).filter(Boolean).slice(0, 20)
      .map(function (ten) { return { ten: ten, loai: phanLoai(ten) }; });
  }

  /** Xáo trộn công bằng các phần thưởng vào các hộp đánh số từ 1..N. */
  function xaoHop(danhSachQua, rng) {
    var ds = (danhSachQua || []).map(function (q) { return { ten: q.ten, loai: q.loai || phanLoai(q.ten) }; });
    var r = rng || rngMatMa();
    for (var i = ds.length - 1; i > 0; i -= 1) {
      var j = Math.floor(r() * (i + 1));
      var t = ds[i]; ds[i] = ds[j]; ds[j] = t;
    }
    return ds.map(function (q, idx) {
      return { so: idx + 1, ten: q.ten, loai: q.loai, daMo: false };
    });
  }

  /** Tính tỷ lệ mở trúng Giải Đặc biệt dựa trên các hộp còn đóng. */
  function tinhTyLeDacBiet(dsHop) {
    var ds = Array.isArray(dsHop) ? dsHop : [];
    var con = ds.filter(function (h) { return h && !h.daMo; });
    var soCon = con.length;
    var soDacBietCon = con.filter(function (h) { return h.loai === "dac-biet"; }).length;
    var phanTram = soCon > 0 ? Math.round((soDacBietCon / soCon) * 100) : 0;
    return {
      soCon: soCon,
      soDacBietCon: soDacBietCon,
      phanTram: phanTram,
      cao: soDacBietCon > 0 && phanTram >= 25,
    };
  }

  /** Kiểm tra chặng nước rút: còn <= 4 hộp đóng và vẫn còn Giải Đặc biệt hoặc giải cao. */
  function coCanKhungNap(dsHop) {
    var ds = Array.isArray(dsHop) ? dsHop : [];
    var con = ds.filter(function (h) { return h && !h.daMo; });
    if (!con.length || con.length > 4) return false;
    return con.some(function (h) { return h.loai === "dac-biet" || h.loai === "cao"; });
  }

  /** Gom nhóm các phần thưởng trùng tên theo thứ tự ưu tiên giải thưởng. */
  function gomNhomGiai(dsHop) {
    var ds = Array.isArray(dsHop) ? dsHop : [];
    var bang = {};
    var danhSach = [];
    ds.forEach(function (h, idx) {
      if (!h) return;
      var ten = String(h.ten || "");
      var loai = h.loai || phanLoai(ten);
      var khoa = ten.toLowerCase();
      if (!bang[khoa]) {
        bang[khoa] = {
          ten: ten,
          loai: loai,
          tong: 0,
          conLai: 0,
          daMoHet: false,
          thuTu: idx,
        };
        danhSach.push(bang[khoa]);
      }
      bang[khoa].tong += 1;
      if (!h.daMo) bang[khoa].conLai += 1;
    });
    danhSach.sort(function (a, b) {
      var u = (UU_TIEN_LOAI[a.loai] || 9) - (UU_TIEN_LOAI[b.loai] || 9);
      return u !== 0 ? u : a.thuTu - b.thuTu;
    });
    return danhSach.map(function (g) {
      return {
        ten: g.ten,
        loai: g.loai,
        tong: g.tong,
        conLai: g.conLai,
        daMoHet: g.conLai === 0,
      };
    });
  }

  /** Bốc ngẫu nhiên 1 đại biểu chưa nằm trong dsDaTrungMa; nếu hết thì lấy lại toàn bộ danh sách. */
  function bocDaiBieu(danhSachNguoi, dsDaTrungMa, rng) {
    var ds = Array.isArray(danhSachNguoi) ? danhSachNguoi.filter(Boolean) : [];
    if (!ds.length) return null;
    var daTrung = {};
    if (Array.isArray(dsDaTrungMa)) {
      dsDaTrungMa.forEach(function (m) {
        if (m != null) daTrung[String(m).trim().toLowerCase()] = true;
      });
    }
    var ungVien = ds.filter(function (n) {
      var m = String(n.ma || "").trim().toLowerCase();
      return !m || !daTrung[m];
    });
    if (!ungVien.length) ungVien = ds;
    var r = rng || rngMatMa();
    var idx = Math.floor(r() * ungVien.length);
    if (idx < 0) idx = 0;
    if (idx >= ungVien.length) idx = ungVien.length - 1;
    return ungVien[idx];
  }

  var api = {
    BO_MAU_12: BO_MAU_12,
    docQuaTuVanBan: docQuaTuVanBan,
    xaoHop: xaoHop,
    phanLoai: phanLoai,
    loaiDacQuyen: loaiDacQuyen,
    tinhTyLeDacBiet: tinhTyLeDacBiet,
    coCanKhungNap: coCanKhungNap,
    gomNhomGiai: gomNhomGiai,
    bocDaiBieu: bocDaiBieu,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.HopBiAn = api;
})(typeof window !== "undefined" ? window : globalThis);
