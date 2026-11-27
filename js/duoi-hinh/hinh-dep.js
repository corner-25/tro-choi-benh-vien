/* Bộ hình vẽ lại cho 10 câu chính của Đuổi hình bắt chữ: kể bằng cảnh nhỏ để người lớn tuổi nhìn là đọc ra chữ
 * (cháu khoanh tay chào BÁC, cháu gọi bà NỘI, đứng TRÚ mưa dưới mái hiên, SIÊU nhân, một TÁ trứng, dấu chữ 口 KHẨU…).
 * Nạp SAU ve-tranh.js và hinh-them.js; ghi thêm hình vào VeTranh.HINH và ghi đè cặp hình của 10 câu trong VeTranh.CAU.
 * Mỗi hình vẽ quanh gốc (0,0) trong ô cạnh s; t là thời gian (giây) cho chuyển động nhẹ. */
(function (root) {
  "use strict";

  var VT = root.VeTranh;
  if (!VT) return;
  var M = VT.MAU, B = VT.but;
  var to = B.to, net = B.net, eli = B.eli, tron = B.tron, chuNhat = B.chuNhat, vachKhac = B.vachKhac;
  var HAI_PI = Math.PI * 2;
  var DA = "#f1c27d", TOC_BAC = "#f4f1ea", CHU = "700 ";

  // ───────── Bút phụ ─────────
  /** Nét dày có viền đen (tay, chân, gậy): vẽ viền đen rồi lõi màu. */
  function chi(c, s, diem, mau, rong) {
    c.beginPath(); c.moveTo(s * diem[0], s * diem[1]);
    for (var i = 2; i < diem.length; i += 2) c.lineTo(s * diem[i], s * diem[i + 1]);
    c.lineCap = "round"; c.lineJoin = "round";
    c.strokeStyle = M.den; c.lineWidth = s * (rong + 0.024); c.stroke();
    c.strokeStyle = mau; c.lineWidth = s * rong; c.stroke();
  }
  function duong(c, s, day, diem, mau) {
    c.beginPath(); c.moveTo(s * diem[0], s * diem[1]);
    for (var i = 2; i < diem.length; i += 2) c.lineTo(s * diem[i], s * diem[i + 1]);
    net(c, s, day); if (mau) c.strokeStyle = mau; c.stroke();
  }
  function cham(c, s, x, y, r, mau) { tron(c, s * x, s * y, s * r); c.fillStyle = mau || M.den; c.fill(); }
  function mieng(c, s, x, y, r) { c.beginPath(); c.arc(s * x, s * y, s * r, 0.25, Math.PI - 0.25); net(c, s, 0.01); c.stroke(); }
  function mat(c, s, x, y, nham) {
    if (!nham) { cham(c, s, x, y, 0.014); return; }
    c.beginPath(); c.arc(s * x, s * y, s * 0.018, Math.PI * 1.1, Math.PI * 1.9); net(c, s, 0.009); c.stroke();
  }
  function ma(c, s, x, y) { eli(c, s * x, s * y, s * 0.026, s * 0.016); c.fillStyle = "rgba(200,53,43,0.35)"; c.fill(); }

  /** Bóng nói kiểu tranh: khung giấy viền đen, đuôi chỉ vào người nói. */
  function bongNoi(c, s, x, y, w, h, duoi, chu, coChu) {
    c.beginPath();
    var r = s * 0.05, X = s * x, Y = s * y, W = s * w, H = s * h;
    c.moveTo(X + r, Y); c.arcTo(X + W, Y, X + W, Y + H, r); c.arcTo(X + W, Y + H, X, Y + H, r);
    c.lineTo(s * (duoi[0] + 0.05), Y + H); c.lineTo(s * duoi[2], s * duoi[3]); c.lineTo(s * duoi[0], Y + H);
    c.arcTo(X, Y + H, X, Y, r); c.arcTo(X, Y, X + W, Y, r); c.closePath();
    to(c, "#fffdf6", s, 0.014);
    c.fillStyle = M.den; c.textAlign = "center"; c.textBaseline = "middle";
    c.font = CHU + Math.round(s * (coChu || 0.07)) + "px 'DH Serif', 'Times New Roman', serif";
    c.fillText(chu, X + W / 2, Y + H / 2 + s * 0.005);
  }

  // ───────── Người ─────────
  function chauKhoanhTay(c, s, t) {
    var cui = 0.28 + Math.max(0, Math.sin(t * 1.6)) * 0.12; // cúi chào nhịp nhàng
    c.save(); c.translate(-s * 0.27, s * 0.25);
    chi(c, s, [-0.035, 0, -0.04, 0.16], DA, 0.04); chi(c, s, [0.035, 0, 0.04, 0.16], DA, 0.04);
    eli(c, -s * 0.045, s * 0.17, s * 0.035, s * 0.016); to(c, M.den, s, 0.008); eli(c, s * 0.05, s * 0.17, s * 0.035, s * 0.016); to(c, M.den, s, 0.008);
    chuNhat(c, -s * 0.075, -s * 0.03, s * 0.15, s * 0.08, s * 0.015); to(c, M.cham, s, 0.014);
    c.rotate(cui);
    chuNhat(c, -s * 0.08, -s * 0.2, s * 0.16, s * 0.19, s * 0.03); to(c, M.trang, s, 0.016);
    c.beginPath(); c.moveTo(-s * 0.05, -s * 0.2); c.lineTo(s * 0.05, -s * 0.2); c.lineTo(s * 0.0, -s * 0.1); c.closePath(); to(c, M.son, s, 0.01); // khăn quàng đỏ
    chuNhat(c, -s * 0.085, -s * 0.13, s * 0.17, s * 0.05, s * 0.02); to(c, DA, s, 0.012); // hai tay khoanh trước ngực
    tron(c, s * 0.01, -s * 0.28, s * 0.085); to(c, DA, s, 0.016);
    c.beginPath(); c.arc(s * 0.01, -s * 0.29, s * 0.087, Math.PI * 0.95, Math.PI * 2.02); c.quadraticCurveTo(s * 0.02, -s * 0.33, -s * 0.07, -s * 0.27); c.closePath(); to(c, M.den, s, 0.01);
    mat(c, s, 0.045, -0.27, true); ma(c, s, 0.05, -0.24); mieng(c, s, 0.05, -0.235, 0.018);
    c.restore();
  }

  function ongBacGia(c, s, t) {
    var x = 0.24;
    chi(c, s, [x - 0.05, 0.16, x - 0.06, 0.4], "#5a3a20", 0.06); chi(c, s, [x + 0.05, 0.16, x + 0.06, 0.4], "#5a3a20", 0.06);
    eli(c, s * (x - 0.08), s * 0.42, s * 0.05, s * 0.02); to(c, M.den, s, 0.008); eli(c, s * (x + 0.07), s * 0.42, s * 0.05, s * 0.02); to(c, M.den, s, 0.008);
    // Áo chàm dáng dài, hàng khuy
    c.beginPath(); c.moveTo(s * (x - 0.1), -s * 0.12); c.lineTo(s * (x + 0.1), -s * 0.12); c.lineTo(s * (x + 0.14), s * 0.2); c.lineTo(s * (x - 0.14), s * 0.2); c.closePath(); to(c, M.cham, s);
    for (var k = 0; k < 3; k += 1) cham(c, s, x, -0.06 + k * 0.08, 0.011, M.nghe);
    // Gậy chống và bàn tay
    chi(c, s, [x - 0.17, 0.4, x - 0.15, 0.02], M.nau, 0.022);
    c.beginPath(); c.arc(s * (x - 0.12), s * 0.02, s * 0.03, Math.PI, 0); net(c, s, 0.03); c.strokeStyle = M.den; c.stroke(); c.lineWidth = s * 0.016; c.strokeStyle = M.nau; c.stroke();
    chi(c, s, [x - 0.09, -0.08, x - 0.15, 0.04], M.cham, 0.05); cham(c, s, x - 0.15, 0.04, 0.028, DA);
    // Đầu: hói đỉnh, tóc bạc hai bên, kính tròn, ria và chòm râu bạc
    tron(c, s * x, -s * 0.24, s * 0.105); to(c, DA, s);
    [-1, 1].forEach(function (d) { eli(c, s * (x + d * 0.09), -s * 0.24, s * 0.03, s * 0.05); to(c, TOC_BAC, s, 0.01); });
    duong(c, s, 0.008, [x - 0.06, -0.31, x - 0.02, -0.33]); // nếp nhăn trán
    duong(c, s, 0.008, [x - 0.07, -0.29, x - 0.01, -0.3]);
    [-0.04, 0.04].forEach(function (d) { tron(c, s * (x + d), -s * 0.24, s * 0.03); c.fillStyle = "rgba(255,255,255,0.4)"; c.fill(); net(c, s, 0.009); c.stroke(); cham(c, s, x + d, -0.24, 0.01); });
    duong(c, s, 0.009, [x - 0.01, -0.24, x + 0.01, -0.24]);
    c.beginPath(); c.moveTo(s * (x - 0.06), -s * 0.18); c.quadraticCurveTo(s * x, -s * 0.21, s * (x + 0.06), -s * 0.18); c.quadraticCurveTo(s * x, -s * 0.16, s * (x - 0.06), -s * 0.18); to(c, TOC_BAC, s, 0.008);
    c.beginPath(); c.moveTo(s * (x - 0.035), -s * 0.15); c.quadraticCurveTo(s * x, -s * 0.06 + Math.sin(t * 2) * s * 0.005, s * (x + 0.035), -s * 0.15); c.closePath(); to(c, TOC_BAC, s, 0.008);
    ma(c, s, x - 0.07, -0.2); ma(c, s, x + 0.07, -0.2);
  }

  function baNoi(c, s, t) {
    var x = -0.1;
    // Quần đen, áo bà ba tím, tay ôm cháu
    chuNhat(c, s * (x - 0.12), s * 0.22, s * 0.24, s * 0.18, s * 0.02); to(c, M.den, s, 0.012);
    c.beginPath(); c.moveTo(s * (x - 0.11), -s * 0.08); c.lineTo(s * (x + 0.11), -s * 0.08); c.quadraticCurveTo(s * (x + 0.19), s * 0.1, s * (x + 0.16), s * 0.27);
    c.lineTo(s * (x - 0.16), s * 0.27); c.quadraticCurveTo(s * (x - 0.19), s * 0.1, s * (x - 0.11), -s * 0.08); c.closePath(); to(c, "#6b4c7a", s);
    [0.04, 0.13].forEach(function (y) { chuNhat(c, s * (x - 0.1), s * y, s * 0.06, s * 0.05, s * 0.01); c.fillStyle = "#57395f"; c.fill(); net(c, s, 0.008); c.stroke(); });
    duong(c, s, 0.008, [x + 0.02, -0.06, x + 0.02, 0.26]);
    chi(c, s, [x + 0.1, -0.02, x + 0.2, 0.08, x + 0.26, 0.06], "#6b4c7a", 0.05); cham(c, s, x + 0.27, 0.06, 0.026, DA);
    // Đầu: tóc bạc búi sau gáy, trâm cài, khuôn mặt hiền
    tron(c, s * (x - 0.13), -s * 0.26, s * 0.055); to(c, TOC_BAC, s, 0.014);
    duong(c, s, 0.012, [x - 0.2, -0.31, x - 0.07, -0.22], M.nghe);
    tron(c, s * x, -s * 0.2, s * 0.115); to(c, DA, s);
    c.beginPath(); c.arc(s * x, -s * 0.21, s * 0.118, Math.PI * 0.98, Math.PI * 2.02); c.quadraticCurveTo(s * (x + 0.04), -s * 0.26, s * (x - 0.02), -s * 0.24); c.quadraticCurveTo(s * (x - 0.07), -s * 0.26, s * (x - 0.118), -s * 0.2); c.closePath(); to(c, TOC_BAC, s, 0.012);
    for (var k = 0; k < 3; k += 1) duong(c, s, 0.006, [x - 0.06 + k * 0.04, -0.3, x - 0.04 + k * 0.04, -0.26], "rgba(29,21,16,0.35)");
    mat(c, s, x - 0.035, -0.19, true); mat(c, s, x + 0.045, -0.19, true);
    duong(c, s, 0.006, [x - 0.08, -0.17, x - 0.065, -0.155], "rgba(29,21,16,0.5)"); duong(c, s, 0.006, [x + 0.09, -0.17, x + 0.075, -0.155], "rgba(29,21,16,0.5)");
    ma(c, s, x - 0.06, -0.15); ma(c, s, x + 0.07, -0.15); mieng(c, s, x + 0.005, -0.15, 0.03);
    // Cháu gái ôm bà, ngước lên gọi
    var xc = 0.24, nay = Math.max(0, Math.sin(t * 3)) * s * 0.012;
    c.save(); c.translate(0, -nay);
    chi(c, s, [xc - 0.025, 0.28, xc - 0.03, 0.4], DA, 0.032); chi(c, s, [xc + 0.03, 0.28, xc + 0.035, 0.4], DA, 0.032);
    c.beginPath(); c.moveTo(s * (xc - 0.05), s * 0.05); c.lineTo(s * (xc + 0.05), s * 0.05); c.lineTo(s * (xc + 0.1), s * 0.3); c.lineTo(s * (xc - 0.1), s * 0.3); c.closePath(); to(c, "#e77f94", s, 0.016);
    cham(c, s, xc - 0.03, 0.18, 0.012, M.trang); cham(c, s, xc + 0.04, 0.22, 0.012, M.trang);
    tron(c, s * xc, -s * 0.03, s * 0.075); to(c, DA, s, 0.016);
    c.beginPath(); c.arc(s * xc, -s * 0.04, s * 0.078, Math.PI * 0.9, Math.PI * 2.1); c.closePath(); to(c, M.den, s, 0.008);
    [-1, 1].forEach(function (d) { tron(c, s * (xc + d * 0.085), -s * 0.0, s * 0.028); to(c, M.den, s, 0.008); cham(c, s, xc + d * 0.075, -0.035, 0.012, M.son); });
    mat(c, s, xc - 0.028, -0.025); mat(c, s, xc + 0.028, -0.025); ma(c, s, xc + 0.045, 0.005);
    tron(c, s * (xc + 0.005), s * 0.012, s * 0.014); c.fillStyle = M.son; c.fill();
    c.restore();
    bongNoi(c, s, 0.04, -0.48, 0.44, 0.15, [0.17, -0.33, 0.21, -0.14], "Bà … ơi!", 0.075);
  }

  // ───────── Bộ hình ─────────
  var HINH = {
    chaoBac: function (c, s, t) {
      ongBacGia(c, s, t);
      chauKhoanhTay(c, s, t);
      bongNoi(c, s, -0.5, -0.5, 0.56, 0.15, [-0.34, -0.35, -0.3, -0.12], "Cháu chào … ạ!", 0.064);
    },

    quanSiDep: function (c, s) {
      // Góc bàn cờ tướng có "cung" kẻ chéo, quân Sĩ đứng trên giao điểm
      chuNhat(c, -s * 0.46, -s * 0.4, s * 0.92, s * 0.8, s * 0.04); to(c, "#e8c98d", s, 0.016);
      c.strokeStyle = "rgba(122,75,37,0.75)"; c.lineWidth = s * 0.008;
      [-0.3, 0, 0.3].forEach(function (k) {
        c.beginPath(); c.moveTo(s * k, -s * 0.36); c.lineTo(s * k, s * 0.36); c.stroke();
        c.beginPath(); c.moveTo(-s * 0.42, s * k); c.lineTo(s * 0.42, s * k); c.stroke();
      });
      c.beginPath(); c.moveTo(-s * 0.3, -s * 0.3); c.lineTo(s * 0.3, s * 0.3); c.moveTo(s * 0.3, -s * 0.3); c.lineTo(-s * 0.3, s * 0.3); c.stroke();
      tron(c, 0, s * 0.035, s * 0.25); c.fillStyle = "#8a5a2b"; c.fill(); net(c, s, 0.016); c.stroke(); // bề dày quân cờ
      tron(c, 0, 0, s * 0.25); to(c, "#f6e3b8", s);
      tron(c, 0, 0, s * 0.205); c.strokeStyle = M.son; c.lineWidth = s * 0.016; c.stroke();
      c.strokeStyle = M.son; c.lineWidth = s * 0.048; c.lineCap = "round";
      c.beginPath(); c.moveTo(-s * 0.13, -s * 0.05); c.lineTo(s * 0.13, -s * 0.05); c.moveTo(0, -s * 0.15); c.lineTo(0, s * 0.12); c.moveTo(-s * 0.08, s * 0.12); c.lineTo(s * 0.08, s * 0.12); c.stroke();
      eli(c, -s * 0.1, -s * 0.15, s * 0.07, s * 0.025, -0.6); c.fillStyle = "rgba(255,255,255,0.55)"; c.fill();
    },

    baNoiDep: baNoi,

    kinhLupDep: function (c, s, t) {
      function la(phong) {
        c.save(); c.scale(phong, phong);
        eli(c, 0, s * 0.1, s * 0.44, s * 0.2, -0.25); to(c, phong > 1 ? "#6fae55" : M.la, s, 0.016 / phong);
        duong(c, s, 0.008 / phong, [-0.4, 0.2, 0.4, 0.0], "rgba(20,50,15,0.7)");
        for (var k = -2; k <= 2; k += 1) duong(c, s, 0.006 / phong, [k * 0.13, 0.1 - k * 0.032, k * 0.13 + 0.07, 0.0 - k * 0.032], "rgba(20,50,15,0.5)");
        c.restore();
      }
      function boRua(x, y, r) {
        eli(c, x, y, r, r * 0.85); to(c, M.son, s, 0.012);
        duong(c, s, 0.008, [x / s, (y - r * 0.85) / s, x / s, (y + r * 0.85) / s]);
        tron(c, x - r * 0.95, y, r * 0.42); c.fillStyle = M.den; c.fill();
        [[-0.4, -0.35], [0.35, -0.3], [-0.35, 0.35], [0.4, 0.3]].forEach(function (p) { tron(c, x + p[0] * r, y + p[1] * r, r * 0.17); c.fillStyle = M.den; c.fill(); });
      }
      la(1);
      var lx = -s * 0.02 + Math.sin(t * 0.9) * s * 0.03, ly = -s * 0.04;
      // Kính lúp: trong mặt kính lá và con bọ rùa phóng to
      c.save(); tron(c, lx, ly, s * 0.24); c.clip();
      c.fillStyle = "#dff0f7"; c.fillRect(-s, -s, s * 2, s * 2);
      c.save(); c.translate(lx, ly); c.scale(2.1, 2.1); c.translate(-lx, -ly); la(1); c.restore();
      boRua(lx + s * 0.02, ly + s * 0.04, s * 0.1);
      c.restore();
      chi(c, s, [0.17, 0.17, 0.4, 0.4], M.nau, 0.06);
      tron(c, lx, ly, s * 0.24); c.lineWidth = s * 0.06; c.strokeStyle = M.den; c.stroke(); c.lineWidth = s * 0.04; c.strokeStyle = M.nghe; c.stroke();
      c.beginPath(); c.arc(lx, ly, s * 0.18, Math.PI * 1.1, Math.PI * 1.45); c.strokeStyle = "rgba(255,255,255,0.9)"; c.lineWidth = s * 0.025; c.stroke();
    },

    truMuaDep: function (c, s, t) {
      // Mưa rơi bên ngoài mái hiên
      for (var k = 0; k < 26; k += 1) {
        var x = -0.48 + (k * 0.371) % 0.96, p = (t * 1.1 + k * 0.137) % 1, y = -0.5 + p * 0.92;
        var duoiMai = Math.abs(x) < 0.33 && y > -0.33;
        if (duoiMai) continue;
        duong(c, s, 0.009, [x, y, x - 0.015, y + 0.07], "#4d7cc4");
      }
      eli(c, -s * 0.42, s * 0.42, s * 0.08, s * 0.02); c.fillStyle = "rgba(77,124,196,0.45)"; c.fill();
      eli(c, s * 0.42, s * 0.42, s * 0.08, s * 0.02); c.fill();
      // Cột và mái ngói đỏ
      [-0.28, 0.28].forEach(function (x) { chuNhat(c, s * x - s * 0.025, -s * 0.12, s * 0.05, s * 0.54, s * 0.01); to(c, M.nau, s, 0.014); });
      c.beginPath(); c.moveTo(-s * 0.38, -s * 0.1); c.lineTo(-s * 0.26, -s * 0.34); c.lineTo(s * 0.26, -s * 0.34); c.lineTo(s * 0.38, -s * 0.1); c.closePath(); to(c, M.son, s);
      c.save(); c.beginPath(); c.moveTo(-s * 0.38, -s * 0.1); c.lineTo(-s * 0.26, -s * 0.34); c.lineTo(s * 0.26, -s * 0.34); c.lineTo(s * 0.38, -s * 0.1); c.closePath(); c.clip();
      c.strokeStyle = "rgba(29,21,16,0.45)"; c.lineWidth = s * 0.008;
      for (var h = 0; h < 4; h += 1) for (var n = 0; n < 9; n += 1) { c.beginPath(); c.arc(-s * 0.4 + n * s * 0.1 + (h % 2) * s * 0.05, -s * 0.31 + h * s * 0.065, s * 0.05, 0, Math.PI); c.stroke(); }
      c.restore();
      chuNhat(c, -s * 0.4, -s * 0.12, s * 0.8, s * 0.035, s * 0.01); to(c, "#8f2a20", s, 0.012);
      duong(c, s, 0.012, [-0.46, 0.42, 0.46, 0.42]);
      // Người đứng trú: khô ráo, xoa tay, nhìn ra mưa
      chi(c, s, [-0.03, 0.26, -0.04, 0.41], M.cham, 0.045); chi(c, s, [0.04, 0.26, 0.05, 0.41], M.cham, 0.045);
      chuNhat(c, -s * 0.085, s * 0.05, s * 0.17, s * 0.23, s * 0.035); to(c, M.la, s);
      chuNhat(c, -s * 0.09, s * 0.12, s * 0.18, s * 0.05, s * 0.02); to(c, M.la, s, 0.012);
      cham(c, s, -0.06, 0.145, 0.022, DA); cham(c, s, 0.06, 0.145, 0.022, DA);
      tron(c, 0, -s * 0.03, s * 0.075); to(c, DA, s, 0.016);
      c.beginPath(); c.arc(0, -s * 0.04, s * 0.078, Math.PI, 0); c.closePath(); to(c, M.den, s, 0.008);
      mat(c, s, 0.03, -0.03); mat(c, s, -0.025, -0.03); mieng(c, s, 0.005, -0.005, 0.02);
    },

    sieuNhan: function (c, s, t) {
      var gio = Math.sin(t * 6) * 0.025;
      c.save(); c.rotate(-0.14); c.translate(0, Math.sin(t * 2) * s * 0.02);
      for (var k = 0; k < 3; k += 1) duong(c, s, 0.01, [-0.5, -0.3 + k * 0.08, -0.36, -0.3 + k * 0.08], "rgba(29,21,16,0.35)");
      // Áo choàng đỏ bay phía sau
      c.beginPath(); c.moveTo(s * 0.13, -s * 0.09); c.bezierCurveTo(-s * 0.1, -s * (0.2 + gio), -s * 0.3, -s * (0.1 - gio), -s * 0.48, -s * (0.18 + gio));
      c.lineTo(-s * 0.42, -s * (0.06 - gio)); c.lineTo(-s * 0.46, s * (0.04 + gio)); c.bezierCurveTo(-s * 0.26, s * 0.06, -s * 0.06, s * 0.0, s * 0.08, s * 0.03); c.closePath(); to(c, M.son, s);
      // Chân xanh, ủng đỏ
      chi(c, s, [-0.08, 0.0, -0.36, 0.0], M.cham, 0.075); chi(c, s, [-0.08, 0.04, -0.34, 0.11], M.cham, 0.075);
      chi(c, s, [-0.36, 0.0, -0.43, 0.0], M.son, 0.08); chi(c, s, [-0.34, 0.11, -0.41, 0.13], M.son, 0.08);
      // Thân, thắt lưng, ngôi sao trên ngực
      chuNhat(c, -s * 0.13, -s * 0.09, s * 0.3, s * 0.17, s * 0.07); to(c, M.cham, s);
      chuNhat(c, -s * 0.11, -s * 0.09, s * 0.04, s * 0.17, 0); c.fillStyle = M.nghe; c.fill(); net(c, s, 0.01); c.stroke();
      c.beginPath();
      for (var d = 0; d < 10; d += 1) { var a = (d / 10) * HAI_PI - Math.PI / 2, r = d % 2 ? s * 0.023 : s * 0.055; c.lineTo(s * 0.05 + Math.cos(a) * r, Math.sin(a) * r); }
      c.closePath(); to(c, M.nghe, s, 0.01);
      // Tay vươn thẳng về trước, nắm đấm găng đỏ
      chi(c, s, [0.12, -0.05, 0.4, -0.1], M.cham, 0.06); tron(c, s * 0.42, -s * 0.105, s * 0.045); to(c, M.son, s, 0.014);
      chi(c, s, [0.1, 0.05, -0.02, 0.09], M.cham, 0.055);
      // Đầu: tóc đen có lọn trước trán, mặt nạ chàm, cười
      tron(c, s * 0.25, -s * 0.13, s * 0.08); to(c, DA, s, 0.016);
      c.beginPath(); c.arc(s * 0.245, -s * 0.145, s * 0.083, Math.PI * 1.0, Math.PI * 1.95); c.quadraticCurveTo(s * 0.3, -s * 0.16, s * 0.26, -s * 0.12); c.closePath(); to(c, M.den, s, 0.008);
      chuNhat(c, s * 0.24, -s * 0.15, s * 0.09, s * 0.035, s * 0.015); to(c, M.cham, s, 0.008);
      cham(c, s, 0.3, -0.133, 0.011, M.trang); mieng(c, s, 0.29, -0.1, 0.022);
      c.restore();
    },

    notNhacDep: function (c, s, t) {
      // Sóng âm lan ra từ hai nốt nhạc
      for (var k = 0; k < 3; k += 1) {
        var p = (t * 0.6 + k / 3) % 1;
        c.beginPath(); c.arc(-s * 0.05, s * 0.02, s * (0.26 + p * 0.2), -0.7, 0.7);
        c.strokeStyle = "rgba(44,74,133," + (0.55 * (1 - p)) + ")"; c.lineWidth = s * 0.018; c.stroke();
        c.beginPath(); c.arc(-s * 0.05, s * 0.02, s * (0.26 + p * 0.2), Math.PI - 0.7, Math.PI + 0.7); c.stroke();
      }
      HINH_CU.notNhac(c, s * 0.92, t);
    },

    chuYDep: function (c, s) {
      c.save(); c.rotate(-0.05);
      chuNhat(c, -s * 0.28, -s * 0.38, s * 0.56, s * 0.76, s * 0.04); to(c, "#fffaf0", s);
      chuNhat(c, -s * 0.22, -s * 0.32, s * 0.44, s * 0.64, s * 0.02); c.strokeStyle = M.son; c.lineWidth = s * 0.012; c.stroke();
      c.font = "900 " + Math.round(s * 0.6) + "px 'DH Serif', 'Times New Roman', serif"; c.textAlign = "center"; c.textBaseline = "middle";
      c.lineWidth = s * 0.03; c.strokeStyle = M.den; c.lineJoin = "round"; c.strokeText("Y", 0, s * 0.03);
      c.fillStyle = M.cham; c.fillText("Y", 0, s * 0.03);
      tron(c, 0, -s * 0.38, s * 0.04); to(c, M.son, s, 0.012);
      c.restore();
    },

    khayTrungDep: function (c, s) {
      chuNhat(c, -s * 0.45, -s * 0.16, s * 0.9, s * 0.42, s * 0.05); to(c, "#c9a877", s);
      chuNhat(c, -s * 0.45, -s * 0.16, s * 0.9, s * 0.42, s * 0.05); vachKhac(c, s, -s * 0.45, -s * 0.16, s * 0.45, s * 0.26, s * 0.05);
      for (var h = 0; h < 2; h += 1) for (var k = 0; k < 6; k += 1) {
        var x = -s * 0.36 + k * s * 0.144, y = -s * 0.02 + h * s * 0.17;
        eli(c, x, y + s * 0.05, s * 0.06, s * 0.025); c.fillStyle = "rgba(90,60,25,0.35)"; c.fill();
        eli(c, x, y, s * 0.058, s * 0.075); to(c, (h + k) % 3 ? "#f7ead0" : "#e9c79a", s, 0.012);
        eli(c, x - s * 0.018, y - s * 0.03, s * 0.014, s * 0.022, -0.3); c.fillStyle = "rgba(255,255,255,0.8)"; c.fill();
      }
      c.save(); c.translate(s * 0.3, -s * 0.3); c.rotate(0.12);
      tron(c, 0, 0, s * 0.11); to(c, M.son, s, 0.016);
      c.fillStyle = "#fbf3df"; c.font = "800 " + Math.round(s * 0.1) + "px 'DH Serif', 'Times New Roman', serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("12", 0, s * 0.005);
      c.restore();
    },

    vongDep: function (c, s, t) {
      var du = Math.sin(t * 1.4) * s * 0.025;
      [-0.44, 0.44].forEach(function (x) { chuNhat(c, s * x - s * 0.025, -s * 0.3, s * 0.05, s * 0.72, s * 0.01); to(c, M.nau, s, 0.014); });
      c.save(); c.translate(du, 0);
      c.beginPath(); c.moveTo(-s * 0.42, -s * 0.2); c.quadraticCurveTo(0, s * 0.36, s * 0.42, -s * 0.2); c.quadraticCurveTo(0, s * 0.16, -s * 0.42, -s * 0.2); to(c, M.son, s);
      c.save(); c.beginPath(); c.moveTo(-s * 0.42, -s * 0.2); c.quadraticCurveTo(0, s * 0.36, s * 0.42, -s * 0.2); c.quadraticCurveTo(0, s * 0.16, -s * 0.42, -s * 0.2); c.clip();
      c.strokeStyle = "rgba(251,246,234,0.6)"; c.lineWidth = s * 0.008;
      for (var k = -6; k <= 6; k += 1) { c.beginPath(); c.moveTo(s * k * 0.06, -s * 0.2); c.lineTo(s * k * 0.06, s * 0.3); c.stroke(); }
      c.restore();
      // Người nằm võng: chân bắt chéo, nón lá úp ngang ngực
      chi(c, s, [0.08, 0.06, 0.3, -0.02, 0.36, -0.08], M.cham, 0.05); chi(c, s, [0.08, 0.08, 0.28, 0.04, 0.38, -0.02], M.cham, 0.05);
      cham(c, s, 0.37, -0.1, 0.028, DA); cham(c, s, 0.39, -0.04, 0.028, DA);
      eli(c, -s * 0.02, s * 0.08, s * 0.16, s * 0.07, -0.05); to(c, "#e0e6ee", s, 0.016);
      c.beginPath(); c.moveTo(-s * 0.12, s * 0.02); c.lineTo(s * 0.06, -s * 0.06); c.lineTo(s * 0.08, s * 0.06); c.closePath(); to(c, "#e9d08c", s, 0.014);
      duong(c, s, 0.006, [0.06, -0.06, -0.05, 0.03]); duong(c, s, 0.006, [0.06, -0.06, 0.0, 0.05]);
      tron(c, -s * 0.24, -s * 0.0, s * 0.08); to(c, DA, s, 0.016);
      c.beginPath(); c.arc(-s * 0.25, -s * 0.0, s * 0.082, Math.PI * 0.55, Math.PI * 1.45); c.closePath(); to(c, M.den, s, 0.008);
      mat(c, s, -0.21, -0.01, true); mat(c, s, -0.19, 0.03, true); mieng(c, s, -0.18, 0.0, 0.018);
      c.restore();
      for (var z = 0; z < 3; z += 1) {
        var p = (t * 0.45 + z / 3) % 1;
        c.fillStyle = "rgba(29,21,16," + (0.85 - p * 0.75) + ")"; c.font = "700 " + Math.round(s * (0.06 + z * 0.025)) + "px 'DH Serif', 'Times New Roman', serif";
        c.fillText("z", -s * 0.2 + z * s * 0.07 + du, -s * 0.12 - p * s * 0.26);
      }
    },

    buNhinDep: function (c, s, t) {
      HINH_CU.buNhin(c, s, t);
      // Con quạ đậu trên tay bù nhìn
      var ngo = Math.sin(t * 2.4) * 0.15;
      c.save(); c.translate(s * 0.3, -s * 0.12); c.rotate(ngo);
      eli(c, 0, -s * 0.04, s * 0.06, s * 0.04, -0.2); to(c, "#2b2b2b", s, 0.012);
      c.beginPath(); c.moveTo(-s * 0.05, -s * 0.04); c.lineTo(-s * 0.11, -s * 0.01); c.lineTo(-s * 0.05, -s * 0.0); c.closePath(); to(c, "#2b2b2b", s, 0.01);
      tron(c, s * 0.05, -s * 0.08, s * 0.032); to(c, "#2b2b2b", s, 0.01);
      c.beginPath(); c.moveTo(s * 0.075, -s * 0.085); c.lineTo(s * 0.12, -s * 0.075); c.lineTo(s * 0.075, -s * 0.068); c.closePath(); to(c, M.nghe, s, 0.008);
      cham(c, s, 0.058, -0.088, 0.008, M.trang);
      c.restore();
    },

    miengDep: function (c, s, t) {
      // Khuôn miệng cười to: môi son, hàm răng trắng; con dấu chữ Hán 口 (khẩu = miệng) ở góc
      var ha = 1 + Math.max(0, Math.sin(t * 2.2)) * 0.12;
      c.save(); c.translate(-s * 0.04, s * 0.06); c.scale(1, ha);
      c.beginPath(); c.moveTo(-s * 0.38, -s * 0.02); c.quadraticCurveTo(-s * 0.2, -s * 0.2, -s * 0.06, -s * 0.12); c.quadraticCurveTo(0, -s * 0.16, s * 0.06, -s * 0.12);
      c.quadraticCurveTo(s * 0.2, -s * 0.2, s * 0.38, -s * 0.02); c.quadraticCurveTo(s * 0.2, s * 0.3, 0, s * 0.3); c.quadraticCurveTo(-s * 0.2, s * 0.3, -s * 0.38, -s * 0.02); c.closePath(); to(c, M.son, s);
      c.beginPath(); c.moveTo(-s * 0.3, -s * 0.03); c.quadraticCurveTo(0, -s * 0.07, s * 0.3, -s * 0.03); c.quadraticCurveTo(s * 0.16, s * 0.2, 0, s * 0.2); c.quadraticCurveTo(-s * 0.16, s * 0.2, -s * 0.3, -s * 0.03); c.closePath(); to(c, "#5a1a14", s, 0.012);
      c.save(); c.clip();
      c.beginPath(); c.moveTo(-s * 0.3, -s * 0.05); c.quadraticCurveTo(0, -s * 0.09, s * 0.3, -s * 0.05); c.lineTo(s * 0.3, s * 0.03); c.quadraticCurveTo(0, -s * 0.0, -s * 0.3, s * 0.03); c.closePath(); to(c, M.trang, s, 0.01);
      for (var k = -3; k <= 3; k += 1) duong(c, s, 0.007, [k * 0.075, -0.07, k * 0.075, 0.01]);
      eli(c, 0, s * 0.17, s * 0.12, s * 0.07); c.fillStyle = "#e0606a"; c.fill();
      c.restore();
      eli(c, -s * 0.15, -s * 0.14, s * 0.07, s * 0.022, -0.25); c.fillStyle = "rgba(255,255,255,0.55)"; c.fill();
      c.restore();
      c.save(); c.translate(s * 0.32, -s * 0.32); c.rotate(-0.12);
      chuNhat(c, -s * 0.1, -s * 0.1, s * 0.2, s * 0.2, s * 0.02); to(c, M.son, s, 0.012);
      c.strokeStyle = "#fbf3df"; c.lineWidth = s * 0.024; c.lineJoin = "miter";
      c.strokeRect(-s * 0.05, -s * 0.045, s * 0.1, s * 0.085);
      c.restore();
    },

    tangBangDep: function (c, s, t) {
      var nhap = Math.sin(t * 1.2) * s * 0.012;
      c.save(); c.translate(0, nhap);
      c.beginPath(); c.moveTo(-s * 0.36, s * 0.16); c.lineTo(-s * 0.22, -s * 0.14); c.lineTo(-s * 0.1, -s * 0.06); c.lineTo(s * 0.02, -s * 0.4); c.lineTo(s * 0.16, -s * 0.12); c.lineTo(s * 0.26, -s * 0.2); c.lineTo(s * 0.38, s * 0.16); c.closePath(); to(c, "#eef7fc", s);
      [[-0.22, -0.14, -0.14, 0.16], [0.02, -0.4, 0.04, 0.16], [0.16, -0.12, 0.2, 0.16]].forEach(function (d) {
        c.beginPath(); c.moveTo(s * d[0], s * d[1]); c.lineTo(s * d[2], s * d[3]); c.lineTo(s * (d[2] + 0.12), s * 0.16); c.closePath(); c.fillStyle = "#b9dcef"; c.fill();
      });
      c.beginPath(); c.moveTo(-s * 0.36, s * 0.16); c.lineTo(-s * 0.22, -s * 0.14); c.lineTo(-s * 0.1, -s * 0.06); c.lineTo(s * 0.02, -s * 0.4); c.lineTo(s * 0.16, -s * 0.12); c.lineTo(s * 0.26, -s * 0.2); c.lineTo(s * 0.38, s * 0.16); c.closePath(); net(c, s); c.stroke();
      c.restore();
      // Nước biển gợn sóng
      c.beginPath(); c.moveTo(-s * 0.48, s * 0.14);
      for (var k = 0; k < 8; k += 1) c.quadraticCurveTo(-s * 0.48 + (k + 0.5) * s * 0.12, s * (0.1 + 0.03 * Math.sin(t * 2 + k)), -s * 0.48 + (k + 1) * s * 0.12, s * 0.14);
      c.lineTo(s * 0.48, s * 0.36); c.lineTo(-s * 0.48, s * 0.36); c.closePath(); to(c, "#4f7fb8", s, 0.016);
      eli(c, 0, s * 0.25, s * 0.26, s * 0.06); c.fillStyle = "rgba(207,230,245,0.45)"; c.fill();
      for (var w = 0; w < 3; w += 1) duong(c, s, 0.008, [-0.36 + w * 0.3, 0.3, -0.26 + w * 0.3, 0.3], "rgba(251,246,234,0.8)");
      [[-0.3, -0.3], [0.32, -0.36], [0.4, -0.1]].forEach(function (p, i) {
        var a = 0.5 + 0.5 * Math.sin(t * 3 + i * 2);
        c.fillStyle = "rgba(255,255,255," + a + ")"; c.beginPath(); c.moveTo(s * p[0], s * (p[1] - 0.04)); c.lineTo(s * (p[0] + 0.012), s * p[1]); c.lineTo(s * p[0], s * (p[1] + 0.04)); c.lineTo(s * (p[0] - 0.012), s * p[1]); c.closePath(); c.fill();
      });
    },
  };

  // Giữ tham chiếu hình cũ trước khi ghi thêm, để hình mới dựng lại trên hình cũ
  var HINH_CU = { notNhac: VT.HINH.notNhac, buNhin: VT.HINH.buNhin };
  Object.keys(HINH).forEach(function (k) { VT.HINH[k] = HINH[k]; });

  var CAU = {
    "cong-doan": ["cong", "tau"], "bang-ca": ["tangBangDep", "ca"], "truc-dem": ["trucThang", "trangDem"],
    "bac-si": ["chaoBac", "quanSiDep"], "sieu-am": ["sieuNhan", "notNhacDep"], "noi-soi": ["baNoiDep", "kinhLupDep"],
    "noi-tru": ["baNoiDep", "truMuaDep"], "y-ta": ["chuYDep", "khayTrungDep"], "khau-trang": ["miengDep", "trangSach"],
    "dai-bieu": ["daiBang", "bieuDo"],
  };
  Object.keys(CAU).forEach(function (k) { VT.CAU[k] = CAU[k]; });
})(window);
