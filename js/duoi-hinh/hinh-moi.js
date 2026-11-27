/* 5 câu đố mới cho Đuổi hình bắt chữ (đợt 27/11/2026): ĐIỆN TIM, MẮT CÁ, TOA THUỐC, BÓ BỘT, BÁO CÁO.
 * Hình vẽ mới hoàn toàn, cùng phong cách tranh Đông Hồ (nét đen đậm, màu son – nghệ – chàm – lá).
 * Nạp SAU ve-tranh.js, hinh-them.js, hinh-dep.js; ghi thêm vào VeTranh.HINH và VeTranh.CAU.
 * Mỗi hình vẽ quanh gốc (0,0) trong ô cạnh s; t là thời gian (giây) cho chuyển động nhẹ. */
(function (root) {
  "use strict";

  var VT = root.VeTranh;
  if (!VT) return;
  var M = VT.MAU, B = VT.but;
  var to = B.to, net = B.net, eli = B.eli, tron = B.tron, chuNhat = B.chuNhat, vachKhac = B.vachKhac;
  var HAI_PI = Math.PI * 2;

  // ───────── Bút phụ ─────────
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
  function bong(c, s, x, y, rx, ry) { eli(c, s * x, s * y, s * rx, s * ry, -0.4); c.fillStyle = "rgba(255,255,255,0.6)"; c.fill(); }

  function bongHoa(c, s, x, y, r, mau, t, pha) {
    c.save(); c.translate(s * x, s * y); c.rotate(Math.sin(t * 1.3 + pha) * 0.08);
    for (var k = 0; k < 5; k += 1) {
      c.save(); c.rotate((k / 5) * HAI_PI);
      eli(c, 0, -s * r * 0.62, s * r * 0.45, s * r * 0.62); to(c, mau, s, 0.012);
      c.restore();
    }
    tron(c, 0, 0, s * r * 0.38); to(c, M.nghe, s, 0.01);
    c.restore();
  }

  var HINH = {
    // ── ĐIỆN: cột điện, dây điện, biển cảnh báo tia sét ──
    cotDien: function (c, s, t) {
      [[-0.48, -0.3, -0.18, -0.25, 0.42], [-0.48, -0.2, -0.18, -0.15, 0.36], [0.48, -0.3, 0.16, -0.25, 0.42], [0.48, -0.2, 0.16, -0.15, 0.36]].forEach(function (d) {
        c.beginPath(); c.moveTo(s * d[0], s * d[1]); c.quadraticCurveTo(s * (d[0] + d[2]) / 2, s * (d[1] + 0.08), s * d[2], s * d[3]); net(c, s, 0.01); c.stroke();
      });
      chuNhat(c, -s * 0.035, -s * 0.42, s * 0.07, s * 0.84, s * 0.01); to(c, "#9a958a", s);
      chuNhat(c, -s * 0.035, -s * 0.42, s * 0.07, s * 0.84, s * 0.01); vachKhac(c, s, -s * 0.04, -s * 0.42, s * 0.04, s * 0.42, s * 0.03);
      chuNhat(c, -s * 0.22, -s * 0.31, s * 0.44, s * 0.04, s * 0.01); to(c, M.nau, s, 0.014);
      chuNhat(c, -s * 0.2, -s * 0.21, s * 0.4, s * 0.035, s * 0.01); to(c, M.nau, s, 0.014);
      [-0.18, 0.16].forEach(function (x) { [-0.33, -0.23].forEach(function (y) { chuNhat(c, s * (x - 0.02), s * (y - 0.03), s * 0.04, s * 0.04, s * 0.01); to(c, M.trang, s, 0.01); }); });
      // Chú chim sẻ đậu trên dây
      var nhun = Math.sin(t * 3) * s * 0.006;
      eli(c, s * 0.33, -s * 0.24 + nhun, s * 0.04, s * 0.03); to(c, "#8a5a33", s, 0.01);
      tron(c, s * 0.37, -s * 0.27 + nhun, s * 0.022); to(c, "#8a5a33", s, 0.01); cham(c, s, 0.378, -0.275 + nhun / s, 0.006);
      // Biển cảnh báo tam giác có tia sét
      c.save(); c.translate(0, s * 0.04);
      c.beginPath(); c.moveTo(0, -s * 0.15); c.lineTo(s * 0.15, s * 0.11); c.lineTo(-s * 0.15, s * 0.11); c.closePath(); to(c, M.nghe, s, 0.02);
      var sang = 0.75 + 0.25 * Math.sin(t * 8);
      c.beginPath(); c.moveTo(s * 0.02, -s * 0.07); c.lineTo(-s * 0.04, s * 0.02); c.lineTo(s * 0.0, s * 0.02); c.lineTo(-s * 0.025, s * 0.09); c.lineTo(s * 0.05, -s * 0.005); c.lineTo(s * 0.01, -s * 0.005); c.lineTo(s * 0.04, -s * 0.07); c.closePath();
      c.fillStyle = "rgba(29,21,16," + sang + ")"; c.fill();
      c.restore();
      // Tia lửa nhỏ ở sứ cách điện
      if (Math.sin(t * 2.3) > 0.6) for (var k = 0; k < 4; k += 1) { var a = k * 1.6 + t * 9; duong(c, s, 0.008, [-0.18, -0.36, -0.18 + Math.cos(a) * 0.05, -0.36 + Math.sin(a) * 0.05], M.nghe); }
    },

    // ── TIM: trái tim bóng đỏ đang đập, có vạch rung hai bên ──
    timDap: function (c, s, t) {
      var nhip = Math.max(0, Math.sin(t * 4.2)), p = 1 + nhip * 0.07;
      [-1, 1].forEach(function (d) {
        for (var k = 0; k < 2; k += 1) { c.beginPath(); c.arc(0, 0, s * (0.38 + k * 0.06), d > 0 ? -0.5 : Math.PI - 0.5, d > 0 ? 0.5 : Math.PI + 0.5); c.strokeStyle = "rgba(200,53,43," + (0.2 + nhip * 0.5) / (k + 1) + ")"; c.lineWidth = s * 0.018; c.lineCap = "round"; c.stroke(); }
      });
      c.save(); c.scale(p, p);
      function hinhTim() { c.beginPath(); c.moveTo(0, s * 0.32); c.bezierCurveTo(-s * 0.5, -s * 0.02, -s * 0.3, -s * 0.4, 0, -s * 0.16); c.bezierCurveTo(s * 0.3, -s * 0.4, s * 0.5, -s * 0.02, 0, s * 0.32); c.closePath(); }
      hinhTim(); var g = c.createRadialGradient(-s * 0.1, -s * 0.12, s * 0.02, 0, 0, s * 0.42); g.addColorStop(0, "#ee5a4b"); g.addColorStop(1, "#a3241c"); to(c, g, s);
      hinhTim(); vachKhac(c, s, -s * 0.45, -s * 0.36, s * 0.45, s * 0.32, s * 0.07);
      bong(c, s, -0.16, -0.14, 0.08, 0.04);
      c.restore();
    },

    // ── MẮT: con mắt to, tròng nâu, lông mi, chớp mắt ──
    matTo: function (c, s, t) {
      var chop = (t % 4.2) < 0.18 ? 1 - Math.abs((t % 4.2) - 0.09) / 0.09 : 0;
      c.beginPath(); c.moveTo(-s * 0.32, -s * 0.36); c.quadraticCurveTo(0, -s * 0.46, s * 0.32, -s * 0.33); net(c, s, 0.04); c.stroke();
      function hanh() { c.beginPath(); c.moveTo(-s * 0.42, 0); c.quadraticCurveTo(0, -s * 0.36, s * 0.42, 0); c.quadraticCurveTo(0, s * 0.3, -s * 0.42, 0); c.closePath(); }
      hanh(); to(c, "#fffdf8", s);
      c.save(); hanh(); c.clip();
      tron(c, s * 0.02, 0, s * 0.17); var g = c.createRadialGradient(s * 0.02, 0, s * 0.04, s * 0.02, 0, s * 0.17); g.addColorStop(0, "#c08a4a"); g.addColorStop(1, "#5c3517"); to(c, g, s, 0.014);
      for (var k = 0; k < 12; k += 1) { var a = (k / 12) * HAI_PI; duong(c, s, 0.005, [0.02 + Math.cos(a) * 0.08, Math.sin(a) * 0.08, 0.02 + Math.cos(a) * 0.15, Math.sin(a) * 0.15], "rgba(40,20,5,0.35)"); }
      cham(c, s, 0.02, 0, 0.075); cham(c, s, -0.03, -0.05, 0.035, "#ffffff"); cham(c, s, 0.07, 0.05, 0.015, "#ffffff");
      // Mí mắt khép khi chớp
      if (chop > 0) { c.fillStyle = "#f1c27d"; c.fillRect(-s * 0.5, -s * 0.4, s, s * 0.4 + chop * s * 0.32); }
      c.restore();
      hanh(); net(c, s, 0.03); c.stroke();
      for (var l = 0; l < 6; l += 1) {
        var u = 0.12 + l * 0.15, x = -0.42 + u * 0.84, y = -0.36 * 2 * u * (1 - u) * (1 - chop);
        duong(c, s, 0.014, [x, y, x + (u - 0.5) * 0.12, y - 0.08]);
      }
    },

    // ── CÁ: cá chép đỏ cam, vảy, râu, bong bóng ──
    caChep: function (c, s, t) {
      for (var b = 0; b < 3; b += 1) { var p = (t * 0.5 + b / 3) % 1; tron(c, s * (0.34 + b * 0.04), -s * (0.08 + p * 0.36), s * (0.02 + b * 0.008)); c.fillStyle = "rgba(207,230,245," + (1 - p) + ")"; c.fill(); net(c, s, 0.006); c.globalAlpha = 1 - p; c.stroke(); c.globalAlpha = 1; }
      c.save(); c.translate(0, Math.sin(t * 2) * s * 0.02); c.rotate(Math.sin(t * 1.3) * 0.04);
      var vay = Math.sin(t * 5) * 0.06;
      c.beginPath(); c.moveTo(-s * 0.24, 0); c.lineTo(-s * 0.46, -s * (0.2 + vay)); c.quadraticCurveTo(-s * 0.38, 0, -s * 0.46, s * (0.2 - vay)); c.closePath(); to(c, "#f08a3c", s);
      for (var k = -2; k <= 2; k += 1) duong(c, s, 0.006, [-0.28, 0, -0.43, k * 0.07], "rgba(29,21,16,0.45)");
      c.beginPath(); c.moveTo(-s * 0.1, -s * 0.15); c.quadraticCurveTo(0, -s * 0.3, s * 0.12, -s * 0.15); c.closePath(); to(c, "#f08a3c", s, 0.016);
      c.beginPath(); c.moveTo(s * 0.0, s * 0.14); c.quadraticCurveTo(-s * 0.04, s * 0.26, -s * 0.1, s * 0.24); c.lineTo(-s * 0.06, s * 0.14); c.closePath(); to(c, "#f08a3c", s, 0.014);
      eli(c, 0, 0, s * 0.3, s * 0.17); to(c, "#e2572b", s);
      c.save(); eli(c, 0, 0, s * 0.3, s * 0.17); c.clip();
      eli(c, s * 0.02, s * 0.08, s * 0.26, s * 0.08); c.fillStyle = "#f6c26b"; c.fill();
      c.strokeStyle = "rgba(120,30,10,0.55)"; c.lineWidth = s * 0.008;
      for (var h = 0; h < 4; h += 1) for (var n = 0; n < 6; n += 1) { c.beginPath(); c.arc(-s * 0.2 + n * s * 0.07 + (h % 2) * s * 0.035, -s * 0.12 + h * s * 0.07, s * 0.04, -Math.PI / 2, Math.PI / 2); c.stroke(); }
      c.restore();
      eli(c, 0, 0, s * 0.3, s * 0.17); net(c, s); c.stroke();
      c.beginPath(); c.arc(s * 0.14, 0, s * 0.12, -1.1, 1.1); net(c, s, 0.012); c.stroke();
      tron(c, s * 0.2, -s * 0.045, s * 0.03); to(c, M.trang, s, 0.01); cham(c, s, 0.21, -0.045, 0.014);
      c.beginPath(); c.moveTo(s * 0.28, s * 0.03); c.quadraticCurveTo(s * 0.36, s * 0.06, s * 0.38, s * 0.14); net(c, s, 0.008); c.stroke();
      c.beginPath(); c.moveTo(s * 0.29, s * 0.0); c.quadraticCurveTo(s * 0.38, s * 0.0, s * 0.42, s * 0.06); c.stroke();
      c.restore();
    },

    // ── TOA: một toa tàu chở khách trên đường ray ──
    toaTau: function (c, s, t) {
      duong(c, s, 0.014, [-0.48, 0.29, 0.48, 0.29]);
      for (var k = 0; k < 9; k += 1) { chuNhat(c, -s * 0.46 + k * s * 0.115, s * 0.29, s * 0.05, s * 0.03, 0); c.fillStyle = M.nau; c.fill(); }
      var lac = Math.sin(t * 7) * s * 0.004;
      c.save(); c.translate(0, lac);
      [-0.47, 0.47].forEach(function (x) { chuNhat(c, s * (x > 0 ? x - 0.04 : x), s * 0.08, s * 0.04, s * 0.03, s * 0.01); to(c, M.den, s, 0.008); });
      chuNhat(c, -s * 0.43, -s * 0.26, s * 0.86, s * 0.06, s * 0.03); to(c, "#2f3a2e", s, 0.016);
      chuNhat(c, -s * 0.42, -s * 0.21, s * 0.84, s * 0.36, s * 0.03); to(c, M.la, s);
      chuNhat(c, -s * 0.42, -s * 0.15, s * 0.84, s * 0.13, 0); c.fillStyle = "#f3e6c8"; c.fill(); net(c, s, 0.01); c.stroke();
      [-0.33, -0.17, 0.1, 0.26].forEach(function (x, i) {
        chuNhat(c, s * x, -s * 0.135, s * 0.11, s * 0.1, s * 0.015); to(c, "#bcd9ec", s, 0.012);
        if (i % 2 === 0) { tron(c, s * (x + 0.055), -s * 0.065, s * 0.03); to(c, "#f1c27d", s, 0.008); c.beginPath(); c.arc(s * (x + 0.055), -s * 0.07, s * 0.032, Math.PI, 0); c.fillStyle = M.den; c.fill(); }
      });
      chuNhat(c, -s * 0.04, -s * 0.15, s * 0.1, s * 0.27, s * 0.01); to(c, "#2f5f2b", s, 0.012);
      duong(c, s, 0.008, [-0.42, 0.04, 0.42, 0.04], M.nghe);
      chuNhat(c, -s * 0.4, s * 0.13, s * 0.8, s * 0.05, s * 0.01); to(c, "#2f3a2e", s, 0.012);
      c.restore();
      [-0.3, -0.18, 0.18, 0.3].forEach(function (x) {
        tron(c, s * x, s * 0.22, s * 0.055); to(c, "#4a4a4a", s, 0.014);
        var a = t * 4; duong(c, s, 0.008, [x, 0.22, x + Math.cos(a) * 0.04, 0.22 + Math.sin(a) * 0.04], M.xam);
        cham(c, s, x, 0.22, 0.012, M.nghe);
      });
    },

    // ── THUỐC: lọ thuốc có chữ thập đỏ và vỉ thuốc con nhộng ──
    viThuoc: function (c, s) {
      chuNhat(c, -s * 0.38, -s * 0.22, s * 0.24, s * 0.44, s * 0.04); to(c, "#b36a2a", s);
      chuNhat(c, -s * 0.36, -s * 0.33, s * 0.2, s * 0.12, s * 0.02); to(c, M.trang, s, 0.014);
      for (var g = 0; g < 4; g += 1) duong(c, s, 0.006, [-0.34 + g * 0.05, -0.32, -0.34 + g * 0.05, -0.22]);
      chuNhat(c, -s * 0.36, -s * 0.12, s * 0.2, s * 0.18, s * 0.01); to(c, M.trang, s, 0.012);
      chuNhat(c, -s * 0.285, -s * 0.09, s * 0.05, s * 0.12, 0); c.fillStyle = M.son; c.fill();
      chuNhat(c, -s * 0.32, -s * 0.055, s * 0.12, s * 0.05, 0); c.fill();
      bong(c, s, -0.33, 0.12, 0.02, 0.06);
      c.save(); c.translate(s * 0.14, s * 0.1); c.rotate(-0.16);
      chuNhat(c, -s * 0.26, -s * 0.18, s * 0.52, s * 0.34, s * 0.04); to(c, "#d9dde3", s);
      duong(c, s, 0.006, [-0.24, -0.01, 0.24, -0.01], "rgba(29,21,16,0.35)");
      for (var h = 0; h < 2; h += 1) for (var k = 0; k < 4; k += 1) {
        var x = -s * 0.18 + k * s * 0.12, y = -s * 0.09 + h * s * 0.16;
        c.save(); c.translate(x, y); c.rotate(0.5);
        if (h === 1 && k === 3) { eli(c, 0, 0, s * 0.045, s * 0.03); c.strokeStyle = "rgba(29,21,16,0.4)"; c.lineWidth = s * 0.006; c.stroke(); c.restore(); continue; } // ô đã bóc
        chuNhat(c, -s * 0.05, -s * 0.024, s * 0.05, s * 0.048, s * 0.024); to(c, M.son, s, 0.01);
        chuNhat(c, 0, -s * 0.024, s * 0.05, s * 0.048, s * 0.024); to(c, M.nghe, s, 0.01);
        c.restore();
      }
      c.restore();
    },

    // ── BÓ: bó hoa giấy kraft, nơ đỏ ──
    boHoa: function (c, s, t) {
      [[-0.2, -0.16, -0.6], [0.2, -0.14, 0.6], [-0.08, -0.04, -0.3], [0.1, -0.02, 0.4]].forEach(function (l) {
        c.save(); c.translate(s * l[0], s * l[1]); c.rotate(l[2]); eli(c, 0, -s * 0.06, s * 0.04, s * 0.1); to(c, M.la, s, 0.012); c.restore();
      });
      bongHoa(c, s, -0.17, -0.24, 0.1, "#e77f94", t, 0);
      bongHoa(c, s, 0.16, -0.25, 0.1, M.son, t, 1);
      bongHoa(c, s, 0, -0.36, 0.11, "#f6e3b8", t, 2);
      bongHoa(c, s, -0.02, -0.15, 0.1, "#c8352b", t, 3);
      c.beginPath(); c.moveTo(-s * 0.26, -s * 0.1); c.lineTo(s * 0.26, -s * 0.1); c.lineTo(s * 0.04, s * 0.42); c.lineTo(-s * 0.04, s * 0.42); c.closePath(); to(c, "#d9b27c", s);
      c.beginPath(); c.moveTo(-s * 0.26, -s * 0.1); c.lineTo(s * 0.26, -s * 0.1); c.lineTo(s * 0.04, s * 0.42); c.lineTo(-s * 0.04, s * 0.42); c.closePath();
      vachKhac(c, s, -s * 0.26, -s * 0.1, s * 0.26, s * 0.42, s * 0.06);
      duong(c, s, 0.008, [-0.12, -0.1, 0.0, 0.42], "rgba(29,21,16,0.4)");
      var bay = Math.sin(t * 2) * 0.03;
      [-1, 1].forEach(function (d) {
        c.beginPath(); c.moveTo(0, s * 0.12); c.quadraticCurveTo(d * s * 0.16, s * (0.0 + bay), d * s * 0.14, s * 0.16); c.closePath(); to(c, M.son, s, 0.012);
        c.beginPath(); c.moveTo(0, s * 0.13); c.lineTo(d * s * 0.08, s * (0.3 + bay)); c.lineTo(d * s * 0.04, s * 0.3); c.closePath(); to(c, M.son, s, 0.01);
      });
      tron(c, 0, s * 0.13, s * 0.03); to(c, "#9c241c", s, 0.01);
    },

    // ── BỘT: bao bột mì miệng mở, gáo xúc bột, bụi bột bay ──
    baoBot: function (c, s, t) {
      for (var k = 0; k < 5; k += 1) {
        var p = (t * 0.35 + k / 5) % 1;
        tron(c, s * (-0.12 + k * 0.06 + Math.sin(t + k) * 0.02), -s * (0.22 + p * 0.22), s * (0.02 + p * 0.03)); c.fillStyle = "rgba(255,255,255," + (0.9 - p * 0.9) + ")"; c.fill();
      }
      c.beginPath(); c.moveTo(-s * 0.26, -s * 0.12); c.quadraticCurveTo(-s * 0.36, s * 0.16, -s * 0.28, s * 0.4); c.lineTo(s * 0.2, s * 0.4); c.quadraticCurveTo(s * 0.28, s * 0.16, s * 0.18, -s * 0.12); c.closePath(); to(c, "#d8c39a", s);
      c.beginPath(); c.moveTo(-s * 0.26, -s * 0.12); c.quadraticCurveTo(-s * 0.36, s * 0.16, -s * 0.28, s * 0.4); c.lineTo(s * 0.2, s * 0.4); c.quadraticCurveTo(s * 0.28, s * 0.16, s * 0.18, -s * 0.12); c.closePath();
      c.save(); c.clip(); c.strokeStyle = "rgba(122,75,37,0.25)"; c.lineWidth = s * 0.006;
      for (var x = -0.4; x < 0.3; x += 0.035) { c.beginPath(); c.moveTo(s * x, -s * 0.2); c.lineTo(s * x, s * 0.45); c.stroke(); }
      for (var y = -0.15; y < 0.45; y += 0.035) { c.beginPath(); c.moveTo(-s * 0.4, s * y); c.lineTo(s * 0.3, s * y); c.stroke(); }
      c.restore();
      // Hình bông lúa mì in màu chàm trên bao
      c.save(); c.translate(-s * 0.04, s * 0.15);
      duong(c, s, 0.01, [0, 0.14, 0, -0.1], M.cham);
      for (var h = 0; h < 4; h += 1) { eli(c, -s * 0.03, -s * (0.06 - h * 0.05), s * 0.02, s * 0.035, -0.5); c.fillStyle = M.cham; c.fill(); eli(c, s * 0.03, -s * (0.06 - h * 0.05), s * 0.02, s * 0.035, 0.5); c.fill(); }
      c.restore();
      eli(c, -s * 0.04, -s * 0.12, s * 0.22, s * 0.06); to(c, "#c4ad80", s, 0.016);
      c.beginPath(); c.moveTo(-s * 0.22, -s * 0.12); c.quadraticCurveTo(-s * 0.04, -s * 0.3, s * 0.14, -s * 0.12); c.closePath(); to(c, "#fbfaf6", s, 0.014);
      // Gáo gỗ xúc bột
      c.save(); c.translate(s * 0.3, s * 0.18); c.rotate(-0.5);
      chi(c, s, [0, 0, 0, -0.22], "#a66a35", 0.03);
      eli(c, 0, s * 0.06, s * 0.08, s * 0.06); to(c, "#a66a35", s, 0.014);
      eli(c, 0, s * 0.045, s * 0.065, s * 0.035); to(c, "#fbfaf6", s, 0.008);
      c.restore();
    },

    // ── BÁO: con báo hoa mai đang bước, đốm hoa ──
    conBao: function (c, s, t) {
      var buoc = Math.sin(t * 3) * 0.03, VANG = "#e8b04a";
      c.beginPath(); c.moveTo(-s * 0.28, -s * 0.02); c.bezierCurveTo(-s * 0.42, -s * 0.02, -s * 0.46, -s * 0.22, -s * (0.38 + buoc), -s * 0.32);
      c.strokeStyle = M.den; c.lineWidth = s * 0.07; c.lineCap = "round"; c.stroke(); c.strokeStyle = VANG; c.lineWidth = s * 0.046; c.stroke();
      [[-0.2, 1], [-0.1, -1], [0.14, -1], [0.22, 1]].forEach(function (l) {
        chi(c, s, [l[0], 0.06, l[0] + l[1] * buoc, 0.34], l[1] > 0 ? "#d39a38" : VANG, 0.06);
        eli(c, s * (l[0] + l[1] * buoc + 0.015), s * 0.36, s * 0.04, s * 0.022); to(c, VANG, s, 0.01);
      });
      eli(c, -s * 0.02, s * 0.02, s * 0.29, s * 0.14); to(c, VANG, s);
      eli(c, -s * 0.02, s * 0.1, s * 0.22, s * 0.05); c.fillStyle = "#f6e3b8"; c.fill();
      [[-0.2, -0.04], [-0.1, -0.07], [0.0, -0.03], [0.1, -0.06], [-0.15, 0.04], [0.05, 0.04], [0.16, -0.01], [-0.25, 0.0], [-0.05, 0.0]].forEach(function (p) {
        c.beginPath(); c.arc(s * p[0], s * p[1], s * 0.022, 0.3, HAI_PI - 0.6); c.strokeStyle = M.den; c.lineWidth = s * 0.011; c.stroke(); cham(c, s, p[0], p[1], 0.008, "#a8661c");
      });
      eli(c, -s * 0.02, s * 0.02, s * 0.29, s * 0.14); net(c, s); c.stroke();
      // Đầu
      c.save(); c.translate(s * 0.3, -s * 0.1); c.rotate(Math.sin(t * 1.5) * 0.04);
      [[-0.07, -0.09], [0.06, -0.1]].forEach(function (e) { tron(c, s * e[0], s * e[1], s * 0.035); to(c, VANG, s, 0.012); cham(c, s, e[0], e[1], 0.016, "#5c3517"); });
      tron(c, 0, 0, s * 0.11); to(c, VANG, s);
      [[-0.06, -0.05], [0.0, -0.07], [-0.08, 0.02]].forEach(function (p) { cham(c, s, p[0], p[1], 0.012); });
      eli(c, s * 0.06, s * 0.04, s * 0.06, s * 0.045); to(c, "#f6e3b8", s, 0.01);
      c.beginPath(); c.moveTo(s * 0.08, s * 0.015); c.lineTo(s * 0.115, s * 0.015); c.lineTo(s * 0.097, s * 0.04); c.closePath(); c.fillStyle = M.den; c.fill();
      tron(c, s * 0.035, -s * 0.03, s * 0.022); to(c, "#d8e26a", s, 0.008); cham(c, s, 0.04, -0.03, 0.01);
      for (var r = 0; r < 2; r += 1) duong(c, s, 0.005, [0.1, 0.05 + r * 0.015, 0.18, 0.04 + r * 0.03]);
      c.restore();
    },

    // ── CÁO: con cáo cam ngồi, ngực trắng, đuôi xù chóp trắng ──
    conCao: function (c, s, t) {
      var ve = Math.sin(t * 1.8) * 0.04, CAM = "#e07b2a";
      c.beginPath(); c.moveTo(s * 0.06, s * 0.38); c.bezierCurveTo(s * 0.4, s * 0.42, s * (0.46 + ve), s * 0.12, s * (0.34 + ve), -s * 0.02);
      c.bezierCurveTo(s * (0.3 + ve), s * 0.12, s * 0.22, s * 0.24, s * 0.06, s * 0.26); c.closePath(); to(c, CAM, s);
      c.beginPath(); c.moveTo(s * (0.34 + ve), -s * 0.02); c.quadraticCurveTo(s * (0.42 + ve), s * 0.04, s * (0.41 + ve), s * 0.12); c.quadraticCurveTo(s * (0.34 + ve), s * 0.08, s * (0.31 + ve), s * 0.08); c.closePath(); to(c, M.trang, s, 0.012);
      c.beginPath(); c.moveTo(-s * 0.12, -s * 0.06); c.quadraticCurveTo(-s * 0.24, s * 0.22, -s * 0.18, s * 0.4); c.lineTo(s * 0.16, s * 0.4); c.quadraticCurveTo(s * 0.22, s * 0.22, s * 0.12, -s * 0.06); c.closePath(); to(c, CAM, s);
      c.beginPath(); c.moveTo(-s * 0.07, -s * 0.04); c.quadraticCurveTo(-s * 0.1, s * 0.16, 0, s * 0.26); c.quadraticCurveTo(s * 0.1, s * 0.16, s * 0.07, -s * 0.04); c.closePath(); to(c, M.trang, s, 0.012);
      [-0.07, 0.07].forEach(function (x) { chi(c, s, [x, 0.24, x, 0.38], "#3a2414", 0.05); });
      // Đầu: mặt tam giác, tai nhọn, má trắng
      c.save(); c.translate(0, -s * 0.16); c.rotate(Math.sin(t * 1.1) * 0.05);
      [-1, 1].forEach(function (d) {
        c.beginPath(); c.moveTo(d * s * 0.05, -s * 0.08); c.lineTo(d * s * 0.15, -s * 0.28); c.lineTo(d * s * 0.19, -s * 0.04); c.closePath(); to(c, CAM, s, 0.016);
        c.beginPath(); c.moveTo(d * s * 0.09, -s * 0.08); c.lineTo(d * s * 0.145, -s * 0.21); c.lineTo(d * s * 0.165, -s * 0.07); c.closePath(); c.fillStyle = "#3a2414"; c.fill();
      });
      c.beginPath(); c.moveTo(-s * 0.2, -s * 0.06); c.quadraticCurveTo(0, -s * 0.16, s * 0.2, -s * 0.06); c.quadraticCurveTo(s * 0.14, s * 0.06, 0, s * 0.14); c.quadraticCurveTo(-s * 0.14, s * 0.06, -s * 0.2, -s * 0.06); c.closePath(); to(c, CAM, s);
      c.beginPath(); c.moveTo(-s * 0.18, -s * 0.02); c.quadraticCurveTo(-s * 0.06, s * 0.0, 0, s * 0.14); c.quadraticCurveTo(s * 0.06, s * 0.0, s * 0.18, -s * 0.02); c.quadraticCurveTo(s * 0.1, s * 0.08, 0, s * 0.14); c.quadraticCurveTo(-s * 0.1, s * 0.08, -s * 0.18, -s * 0.02); c.closePath(); to(c, M.trang, s, 0.01);
      [-0.07, 0.07].forEach(function (x) { eli(c, s * x, -s * 0.04, s * 0.016, s * 0.022); c.fillStyle = M.den; c.fill(); cham(c, s, x + 0.005, -0.048, 0.006, "#ffffff"); });
      eli(c, 0, s * 0.125, s * 0.025, s * 0.018); c.fillStyle = M.den; c.fill();
      c.restore();
    },
  };

  Object.keys(HINH).forEach(function (k) { VT.HINH[k] = HINH[k]; });

  var CAU = {
    "dien-tim": ["cotDien", "timDap"], "mat-ca": ["matTo", "caChep"], "toa-thuoc": ["toaTau", "viThuoc"],
    "bo-bot": ["boHoa", "baoBot"], "bao-cao": ["conBao", "conCao"],
  };
  Object.keys(CAU).forEach(function (k) { VT.CAU[k] = CAU[k]; });
})(window);
