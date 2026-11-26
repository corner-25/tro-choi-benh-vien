/* Logic thuần cho Thả bi Plinko (Tháp bóng may mắn). Không đụng DOM; dùng được trong trình duyệt và test Node.
 * Ngẫu nhiên dùng crypto.getRandomValues. */
(function (root) {
  "use strict";

  var O_DAY_MAC_DINH = [
    { ten: "Khuyến khích", bac: 4, mau: "#64748b" },
    { ten: "Giải Ba", bac: 3, mau: "#0284c7" },
    { ten: "Giải Nhì", bac: 2, mau: "#0b4fd6" },
    { ten: "GIẢI ĐẶC BIỆT", bac: 1, mau: "#d4ff3a" },
    { ten: "Giải Nhì", bac: 2, mau: "#0b4fd6" },
    { ten: "Giải Ba", bac: 3, mau: "#0284c7" },
    { ten: "Khuyến khích", bac: 4, mau: "#64748b" },
  ];

  var CONG_THA = {
    "trai": { ten: "Cổng Trái", x: 0.24 },
    "giua": { ten: "Cổng Giữa", x: 0.50 },
    "phai": { ten: "Cổng Phải", x: 0.76 },
    "ngau-nhien": { ten: "Ngẫu nhiên", x: 0.50 },
  };

  var HE_SO_MO_RONG = 1.35;

  function rngMatMa() {
    var c = (typeof globalThis !== "undefined" && globalThis.crypto) || null;
    if (c && c.getRandomValues) {
      var buf = new Uint32Array(1);
      return function () { c.getRandomValues(buf); return buf[0] / 4294967296; };
    }
    return Math.random;
  }

  /** Xáo trộn Fisher–Yates và chọn đều soLuong người chưa thắng để thả bóng. */
  function chonNguoiTha(danhSach, daThang, soLuong, loaiDaThang, rng) {
    var loai = new Set(loaiDaThang ? (daThang || []).map(function (m) { return String(m).toUpperCase(); }) : []);
    var hopLe = (danhSach || []).filter(function (n) { return n && !loai.has(String(n.ma).toUpperCase()); }).slice();
    var r = rng || rngMatMa();
    for (var i = hopLe.length - 1; i > 0; i -= 1) {
      var j = Math.floor(r() * (i + 1));
      var t = hopLe[i]; hopLe[i] = hopLe[j]; hopLe[j] = t;
    }
    return hopLe.slice(0, Math.max(1, Math.min(soLuong || 10, hopLe.length)));
  }

  /** Tính mảng soO + 1 tọa độ ranh giới ngang chuẩn hóa trong [0.04, 0.96].
   * Khi moRongGiua bật (true hoặc hệ số > 1), ô chính giữa mở rộng bề ngang lên 1,35x, các ô còn lại chia đều phần dư. */
  function tinhRanhO(soO, moRongGiua) {
    var n = soO || O_DAY_MAC_DINH.length;
    var leTrai = 0.04;
    var rongTong = 0.92;
    var ranh = [leTrai];
    var heSo = moRongGiua === true ? HE_SO_MO_RONG : (typeof moRongGiua === "number" && moRongGiua > 1 ? moRongGiua : 1);

    if (heSo <= 1 || n < 3) {
      for (var i = 1; i <= n; i += 1) {
        ranh.push(leTrai + (i / n) * rongTong);
      }
      return ranh;
    }

    var giua = Math.floor(n / 2);
    var rongGiua = Math.min(rongTong * 0.42, (rongTong / n) * heSo);
    var rongKhac = (rongTong - rongGiua) / (n - 1);
    var x = leTrai;
    for (var j = 0; j < n; j += 1) {
      x += (j === giua ? rongGiua : rongKhac);
      ranh.push(j === n - 1 ? leTrai + rongTong : x);
    }
    return ranh;
  }

  /** Tạo tọa độ chuẩn hóa (0..1) cho rừng chốt đinh, 2 tấm bật lò xo, 6 trụ vách ngăn đáy và 2 đệm nghiêng rìa. */
  function taoThap(soHang, tuyChon) {
    var hang = Math.max(6, Math.min(12, soHang || 9));
    var tc = tuyChon || {};
    var soO = tc.soO || O_DAY_MAC_DINH.length;
    var moRongGiua = Boolean(tc.moRongGiua);

    var chot = [];
    var leX = 0.08;
    var rong = 1 - leX * 2;
    for (var r = 0; r < hang; r += 1) {
      var soCot = r % 2 === 0 ? 9 : 8;
      // Đặt hàng chốt cuối ở y = 0.74 để có khoảng rơi thoáng xuống đầu vách ngăn ở y = 0.82
      var y = 0.135 + (r / (hang - 1)) * 0.605;
      var buoc = rong / 8;
      var leHang = r % 2 === 0 ? leX : leX + buoc / 2;
      for (var c = 0; c < soCot; c += 1) {
        chot.push({ x: leHang + c * buoc, y: y, r: 0.0085, sang: 0 });
      }
    }

    // 2 tấm bật lò xo tạo kịch tính đảo chiều giữa tháp
    var loXo = [
      { x: 0.30, y: 0.475, r: 0.024, sang: 0 },
      { x: 0.70, y: 0.475, r: 0.024, sang: 0 },
    ];

    // 6 trụ vách ngăn thẳng đứng có đầu bo tròn chia giữa 7 ô giải thưởng
    var ranh = tinhRanhO(soO, moRongGiua);
    var giua = Math.floor(soO / 2);
    var vachNgan = [];
    for (var k = 1; k < ranh.length - 1; k += 1) {
      vachNgan.push({
        x: ranh[k],
        yTren: 0.82,
        yDuoi: 0.975,
        r: 0.0075,
        canhDacBiet: k === giua || k === giua + 1,
        sang: 0,
      });
    }

    // 2 đệm nghiêng nhẹ hai bên rìa giúp bóng không dính sát tường ngoài
    var demRia = [
      { x1: 0.032, y1: 0.735, x2: 0.062, y2: 0.825, phia: "trai", sang: 0 },
      { x1: 0.968, y1: 0.735, x2: 0.938, y2: 0.825, phia: "phai", sang: 0 },
    ];

    return {
      chot: chot,
      loXo: loXo,
      vachNgan: vachNgan,
      demRia: demRia,
      ranhO: ranh,
      moRongGiua: moRongGiua,
    };
  }

  /** Quy đổi tọa độ ngang chuẩn hóa (0..1) sang chỉ số ô giải ở đáy (0..soO-1).
   * Khi không truyền moRongGiua, giữ nguyên công thức chia đều mặc định. */
  function tinhO(xChuanHoa, soO, moRongGiua) {
    var n = soO || O_DAY_MAC_DINH.length;
    if (!moRongGiua) {
      var p = Math.max(0, Math.min(0.999999, (xChuanHoa - 0.04) / 0.92));
      return Math.floor(p * n);
    }
    var ranh = tinhRanhO(n, moRongGiua);
    for (var i = 0; i < n; i += 1) {
      if (xChuanHoa < ranh[i + 1]) return i;
    }
    return n - 1;
  }

  /** Tạo cấu trúc câu bình luận trực tiếp (mảng mảnh văn bản thường/đậm, không HTML, không emoji). */
  function taoCauBinhLuan(suKien, duLieu) {
    var d = duLieu || {};
    var ten = d.nguoi ? d.nguoi.ten : (d.ten || "");
    var ma = d.nguoi ? d.nguoi.ma : (d.ma || "");
    var nhan = ma && ten ? (ten + " (" + ma + ")") : (ten || ma || "đại biểu");
    var tenCong = (CONG_THA[d.congTha] && CONG_THA[d.congTha].ten) || "Ngẫu nhiên";

    if (suKien === "san-sang") {
      return [
        { text: "Mời hội trường chọn cổng thả " },
        { text: "[1] Trái · [2] Giữa · [3] Phải · [0] Ngẫu nhiên", dam: true },
        { text: " rồi nhấn Thả bóng!" },
      ];
    }
    if (suKien === "xuat-phat") {
      if (d.cheDo === "bi-vang") {
        return [
          { text: "BI VÀNG CHUNG KẾT xuất phát từ " },
          { text: tenCong, dam: true },
          { text: "! Toàn hội trường dõi theo " },
          { text: nhan, dam: true },
          { text: "!" },
        ];
      }
      return [
        { text: "Cửa sập đã mở tại " },
        { text: tenCong, dam: true },
        { text: "! " },
        { text: String(d.soBi || 10) + " quả bóng", dam: true },
        { text: " đồng loạt lao xuống tháp chốt!" },
      ];
    }
    if (suKien === "lo-xo") {
      return [
        { text: "Pha bật lò xo đảo chiều cực mạnh! Bóng của " },
        { text: nhan, dam: true },
        { text: " đổi hướng bất ngờ giữa tháp!" },
      ];
    }
    if (suKien === "sat-dac-biet") {
      return [
        { text: "Nghẹt thở! Bóng của " },
        { text: nhan, dam: true },
        { text: " vừa đập trúng mép vách " },
        { text: "GIẢI ĐẶC BIỆT", dam: true },
        { text: "!" },
      ];
    }
    if (suKien === "can-canh") {
      return [
        { text: "CẬN CẢNH CHẠM ĐÁY! Mọi ánh mắt dõi theo quả bóng quyết định của " },
        { text: nhan, dam: true },
        { text: "!" },
      ];
    }
    if (suKien === "cham-o") {
      var giai = d.giai || {};
      if (giai.bac === 1) {
        return [
          { text: "BÙNG NỔ HỘI TRƯỜNG! " },
          { text: nhan, dam: true },
          { text: " xuất sắc rơi thẳng vào ô " },
          { text: "GIẢI ĐẶC BIỆT", dam: true },
          { text: "!" },
        ];
      }
      if (giai.bac === 2) {
        return [
          { text: "Rất sát nút! " },
          { text: nhan, dam: true },
          { text: " dừng chân đầy tiếc nuối ngay sát cửa Đặc biệt tại " },
          { text: giai.ten || "Giải Nhì", dam: true },
          { text: "." },
        ];
      }
      return [
        { text: nhan, dam: true },
        { text: " đã chạm đáy tại ô " },
        { text: giai.ten || "phần thưởng", dam: true },
        { text: "." },
      ];
    }
    if (suKien === "mo-rong") {
      return [
        { text: "Chưa có bóng vào ô giữa — lượt kế tiếp tự động " },
        { text: "MỞ RỘNG CỬA ĐẶC BIỆT 1,35×", dam: true },
        { text: " cho đến khi có người trúng!" },
      ];
    }
    if (suKien === "ket-thuc") {
      return [
        { text: "Chốt kết quả lượt thả! Dẫn đầu lượt này là " },
        { text: nhan, dam: true },
        { text: " với " },
        { text: (d.tenGiai || "phần thưởng"), dam: true },
        { text: "." },
      ];
    }
    return [{ text: "Sân khấu Thả bi Plinko sẵn sàng." }];
  }

  /** Dòng xuất CSV / biên bản. */
  function dongXuat(lichSu) {
    var dong = [["Lượt", "Thời gian", "Ô giải thưởng", "Mã nhân viên", "Họ tên", "Đơn vị"]];
    (lichSu || []).forEach(function (l) {
      (l.ketQua || []).forEach(function (k) {
        dong.push([String(l.luot), l.luc, k.tenGiai, k.ma, k.ten, k.donVi || ""]);
      });
    });
    return dong;
  }

  var api = {
    O_DAY_MAC_DINH: O_DAY_MAC_DINH,
    CONG_THA: CONG_THA,
    HE_SO_MO_RONG: HE_SO_MO_RONG,
    chonNguoiTha: chonNguoiTha,
    tinhRanhO: tinhRanhO,
    taoThap: taoThap,
    tinhO: tinhO,
    taoCauBinhLuan: taoCauBinhLuan,
    dongXuat: dongXuat,
    rngMatMa: rngMatMa,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Plinko = api;
})(typeof window !== "undefined" ? window : globalThis);
