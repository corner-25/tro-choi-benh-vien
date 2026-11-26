/* Vẽ câu đố Đuổi hình bắt chữ theo phong cách tranh Đông Hồ: nét viền đen đậm, màu son – nghệ – chàm – lá
 * trên nền giấy điệp óng ánh, khung gỗ. Hình được che bằng các mảnh gỗ khắc lật dần; lật đáp án thì đóng dấu son.
 *
 * tao(canvas) → { coCanh(id), datCau(canhId, anh), moMot(), moHet(), conManh(), dongDau(), dung() }.
 * canhId dạng "tranh:<tên>" (xem bảng CAU). Ảnh riêng (data URL) thì vẽ ảnh thay cho hai hình. */
(function (root) {
  "use strict";

  var MAU = {
    giay: "#f3e6c8", den: "#1d1510", son: "#c8352b", nghe: "#e5a823", cham: "#2c4a85",
    la: "#3f7a3a", hong: "#ec9b7d", nau: "#7a4b25", trang: "#fbf6ea", xam: "#8c8577", bang: "#cfe6f5",
  };
  var COT = 4, HANG = 3, TG_LAT = 0.42;
  var HAI_PI = Math.PI * 2;

  // ───────── Nét vẽ kiểu khắc gỗ ─────────
  function net(c, s, day) { c.lineWidth = Math.max(2, s * (day || 0.022)); c.strokeStyle = MAU.den; c.lineJoin = "round"; c.lineCap = "round"; }
  function to(c, mau, s, day) { c.fillStyle = mau; c.fill(); net(c, s, day); c.stroke(); }
  function vachKhac(c, s, x0, y0, x1, y1, buoc) {
    c.save(); c.clip();
    c.strokeStyle = "rgba(29,21,16,0.28)"; c.lineWidth = Math.max(1, s * 0.006);
    for (var x = x0; x < x1 + (y1 - y0); x += buoc) { c.beginPath(); c.moveTo(x, y0); c.lineTo(x - (y1 - y0), y1); c.stroke(); }
    c.restore();
  }
  function eli(c, x, y, rx, ry, rot) { c.beginPath(); c.ellipse(x, y, rx, ry, rot || 0, 0, HAI_PI); }
  function tron(c, x, y, r) { c.beginPath(); c.arc(x, y, r, 0, HAI_PI); }
  function chuNhat(c, x, y, w, h, r) {
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }

  // ───────── Các hình (vẽ quanh gốc 0,0 trong ô cạnh s) ─────────
  var HINH = {
    cong: function (c, s, t) {
      for (var k = 0; k < 9; k += 1) {
        var a = -Math.PI * 0.92 + (k / 8) * Math.PI * 0.84 + Math.sin(t * 1.5 + k) * 0.02;
        var fx = Math.cos(a) * s * 0.33, fy = s * 0.08 + Math.sin(a) * s * 0.36;
        c.save(); c.translate(fx, fy); c.rotate(a + Math.PI / 2);
        eli(c, 0, 0, s * 0.07, s * 0.15); to(c, MAU.la, s, 0.016);
        eli(c, 0, -s * 0.06, s * 0.035, s * 0.045); to(c, MAU.nghe, s, 0.012);
        tron(c, 0, -s * 0.06, s * 0.018); c.fillStyle = MAU.cham; c.fill();
        c.restore();
      }
      c.beginPath(); c.moveTo(-s * 0.02, s * 0.32); c.quadraticCurveTo(-s * 0.16, s * 0.12, -s * 0.02, -s * 0.02);
      c.quadraticCurveTo(s * 0.1, s * 0.12, s * 0.04, s * 0.32); c.closePath(); to(c, MAU.cham, s);
      c.beginPath(); c.moveTo(-s * 0.01, s * 0.02); c.quadraticCurveTo(-s * 0.04, -s * 0.12, s * 0.03, -s * 0.2); c.lineWidth = s * 0.05; c.strokeStyle = MAU.cham; c.stroke();
      net(c, s, 0.012); c.stroke();
      tron(c, s * 0.04, -s * 0.22, s * 0.045); to(c, MAU.cham, s);
      for (var m = -1; m <= 1; m += 1) { c.beginPath(); c.moveTo(s * 0.04, -s * 0.26); c.lineTo(s * (0.04 + m * 0.03), -s * 0.34); net(c, s, 0.01); c.stroke(); tron(c, s * (0.04 + m * 0.03), -s * 0.35, s * 0.012); c.fillStyle = MAU.nghe; c.fill(); }
      c.beginPath(); c.moveTo(s * 0.085, -s * 0.23); c.lineTo(s * 0.13, -s * 0.215); c.lineTo(s * 0.085, -s * 0.2); to(c, MAU.nghe, s, 0.01);
      tron(c, s * 0.055, -s * 0.23, s * 0.01); c.fillStyle = MAU.trang; c.fill();
      [-0.03, 0.03].forEach(function (x) { c.beginPath(); c.moveTo(s * x, s * 0.32); c.lineTo(s * x, s * 0.42); net(c, s, 0.014); c.stroke(); });
    },
    tau: function (c, s, t) {
      c.beginPath(); c.moveTo(-s * 0.48, s * 0.27); c.lineTo(s * 0.48, s * 0.27); net(c, s, 0.016); c.stroke();
      for (var p = 0; p < 3; p += 1) {
        var r = ((t * 0.6 + p * 0.33) % 1);
        tron(c, s * 0.28 + r * s * 0.08, -s * 0.16 - r * s * 0.3, s * (0.04 + r * 0.06)); c.fillStyle = "rgba(251,246,234," + (0.9 - r * 0.7) + ")"; c.fill(); net(c, s, 0.008); c.globalAlpha = 1 - r; c.stroke(); c.globalAlpha = 1;
      }
      chuNhat(c, -s * 0.48, -s * 0.02, s * 0.28, s * 0.22, s * 0.03); to(c, MAU.cham, s); vachKhac(c, s, -s * 0.48, -s * 0.02, -s * 0.2, s * 0.2, s * 0.05);
      chuNhat(c, -s * 0.48, -s * 0.02, s * 0.28, s * 0.22, s * 0.03); net(c, s); c.stroke();
      chuNhat(c, -s * 0.16, -s * 0.02, s * 0.28, s * 0.22, s * 0.03); to(c, MAU.nghe, s);
      chuNhat(c, s * 0.16, -s * 0.06, s * 0.3, s * 0.26, s * 0.03); to(c, MAU.son, s);
      chuNhat(c, s * 0.18, -s * 0.2, s * 0.14, s * 0.16, s * 0.02); to(c, MAU.son, s);
      chuNhat(c, s * 0.21, -s * 0.16, s * 0.08, s * 0.07, s * 0.01); to(c, MAU.trang, s, 0.012);
      chuNhat(c, s * 0.36, -s * 0.16, s * 0.06, s * 0.1, s * 0.01); to(c, MAU.den, s, 0.012);
      [-0.42, -0.26, -0.1, 0.06, 0.22, 0.38].forEach(function (x) {
        tron(c, s * x, s * 0.22, s * 0.05); to(c, MAU.den, s, 0.012);
        var a = -t * 4;
        c.beginPath(); c.moveTo(s * x, s * 0.22); c.lineTo(s * x + Math.cos(a) * s * 0.045, s * 0.22 + Math.sin(a) * s * 0.045); c.strokeStyle = MAU.nghe; c.lineWidth = s * 0.012; c.stroke();
      });
    },
    xeTang: function (c, s, t) {
      chuNhat(c, -s * 0.44, s * 0.08, s * 0.88, s * 0.18, s * 0.09); to(c, MAU.den, s);
      for (var k = 0; k < 6; k += 1) { tron(c, -s * 0.34 + k * s * 0.136, s * 0.17, s * 0.05); to(c, MAU.xam, s, 0.012); }
      c.beginPath(); c.moveTo(-s * 0.4, s * 0.09); c.lineTo(-s * 0.32, -s * 0.06); c.lineTo(s * 0.34, -s * 0.06); c.lineTo(s * 0.42, s * 0.09); c.closePath(); to(c, MAU.la, s);
      c.beginPath(); c.moveTo(-s * 0.4, s * 0.09); c.lineTo(-s * 0.32, -s * 0.06); c.lineTo(s * 0.34, -s * 0.06); c.lineTo(s * 0.42, s * 0.09); c.closePath(); vachKhac(c, s, -s * 0.4, -s * 0.06, s * 0.42, s * 0.09, s * 0.06);
      c.beginPath(); c.ellipse(-s * 0.02, -s * 0.06, s * 0.2, s * 0.14, 0, Math.PI, HAI_PI); c.closePath(); to(c, MAU.la, s);
      chuNhat(c, s * 0.15, -s * 0.14, s * 0.36, s * 0.05, s * 0.02); to(c, MAU.la, s);
      tron(c, -s * 0.02, -s * 0.12, s * 0.04); to(c, MAU.son, s, 0.012);
    },
    ca: function (c, s, t) {
      for (var k = 0; k < 3; k += 1) {
        var y = -s * 0.3 - ((t * 0.5 + k / 3) % 1) * s * 0.12;
        c.beginPath(); c.moveTo(-s * 0.08 + k * s * 0.08, y + s * 0.08); c.bezierCurveTo(-s * 0.12 + k * s * 0.08, y + s * 0.03, -s * 0.04 + k * s * 0.08, y - s * 0.02, -s * 0.08 + k * s * 0.08, y - s * 0.07);
        c.strokeStyle = "rgba(29,21,16,0.45)"; c.lineWidth = s * 0.012; c.stroke();
      }
      c.beginPath(); c.arc(s * 0.22, s * 0.02, s * 0.11, -Math.PI / 2, Math.PI / 2); net(c, s, 0.05); c.stroke(); c.strokeStyle = MAU.trang; c.lineWidth = s * 0.025; c.stroke();
      c.beginPath(); c.moveTo(-s * 0.22, -s * 0.18); c.lineTo(-s * 0.19, s * 0.28); c.quadraticCurveTo(0, s * 0.34, s * 0.19, s * 0.28); c.lineTo(s * 0.22, -s * 0.18); c.closePath(); to(c, MAU.trang, s);
      eli(c, 0, -s * 0.18, s * 0.22, s * 0.06); to(c, MAU.cham, s);
      eli(c, 0, -s * 0.18, s * 0.17, s * 0.035); to(c, MAU.trang, s, 0.01);
      for (var p = 0; p < 5; p += 1) { var a = (p / 5) * HAI_PI; eli(c, Math.cos(a) * s * 0.05, s * 0.06 + Math.sin(a) * s * 0.05, s * 0.035, s * 0.02, a); to(c, MAU.son, s, 0.01); }
      tron(c, 0, s * 0.06, s * 0.02); to(c, MAU.nghe, s, 0.008);
    },
    thang: function (c, s) {
      c.save(); c.rotate(0.18);
      [-0.13, 0.13].forEach(function (x) { chuNhat(c, s * x - s * 0.03, -s * 0.44, s * 0.06, s * 0.88, s * 0.02); to(c, MAU.nau, s); });
      for (var k = 0; k < 6; k += 1) { chuNhat(c, -s * 0.12, -s * 0.36 + k * s * 0.14, s * 0.24, s * 0.04, s * 0.01); to(c, MAU.nghe, s, 0.014); }
      c.restore();
    },
    banhRang: function (c, s, t) {
      function rang(x, y, R, so, goc, mau) {
        c.save(); c.translate(x, y); c.rotate(goc);
        c.beginPath();
        for (var i = 0; i < so * 2; i += 1) { var a = (i / (so * 2)) * HAI_PI, rr = i % 2 ? R * 0.78 : R; c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); c.lineTo(Math.cos(a + Math.PI / so) * rr, Math.sin(a + Math.PI / so) * rr); }
        c.closePath(); to(c, mau, s);
        tron(c, 0, 0, R * 0.3); to(c, MAU.giay, s);
        c.restore();
      }
      rang(-s * 0.12, -s * 0.06, s * 0.27, 10, t * 0.7, MAU.xam);
      rang(s * 0.24, s * 0.22, s * 0.17, 7, -t * 1.1 + 0.2, MAU.nghe);
    },
    tangBang: function (c, s, t) {
      c.beginPath(); c.moveTo(-s * 0.48, s * 0.18); c.lineTo(s * 0.48, s * 0.18); c.lineTo(s * 0.48, s * 0.4); c.lineTo(-s * 0.48, s * 0.4); c.closePath(); c.fillStyle = "rgba(44,74,133,0.35)"; c.fill();
      for (var k = 0; k < 4; k += 1) { c.beginPath(); c.moveTo(-s * 0.44 + k * s * 0.24, s * 0.24 + Math.sin(t * 2 + k) * s * 0.01); c.quadraticCurveTo(-s * 0.38 + k * s * 0.24, s * 0.2, -s * 0.32 + k * s * 0.24, s * 0.24); net(c, s, 0.01); c.stroke(); }
      c.beginPath(); c.moveTo(-s * 0.36, s * 0.2); c.lineTo(-s * 0.22, -s * 0.12); c.lineTo(-s * 0.06, -s * 0.38); c.lineTo(s * 0.08, -s * 0.18); c.lineTo(s * 0.2, -s * 0.3); c.lineTo(s * 0.36, s * 0.2); c.closePath(); to(c, MAU.bang, s);
      c.beginPath(); c.moveTo(-s * 0.06, -s * 0.38); c.lineTo(-s * 0.02, s * 0.2); c.moveTo(s * 0.08, -s * 0.18); c.lineTo(s * 0.12, s * 0.2); c.moveTo(-s * 0.22, -s * 0.12); c.lineTo(-s * 0.16, s * 0.2); net(c, s, 0.012); c.stroke();
      c.fillStyle = "rgba(255,255,255,0.8)"; c.beginPath(); c.moveTo(-s * 0.06, -s * 0.32); c.lineTo(-s * 0.15, -s * 0.12); c.lineTo(-s * 0.08, -s * 0.12); c.closePath(); c.fill();
    },
    gacNai: function (c, s) {
      function gac(dau) {
        c.beginPath(); c.moveTo(dau * s * 0.08, -s * 0.05); c.quadraticCurveTo(dau * s * 0.3, -s * 0.2, dau * s * 0.28, -s * 0.44);
        c.moveTo(dau * s * 0.2, -s * 0.16); c.lineTo(dau * s * 0.38, -s * 0.24);
        c.moveTo(dau * s * 0.26, -s * 0.3); c.lineTo(dau * s * 0.4, -s * 0.4);
        c.moveTo(dau * s * 0.27, -s * 0.38); c.lineTo(dau * s * 0.18, -s * 0.46);
        c.strokeStyle = MAU.den; c.lineWidth = s * 0.06; c.stroke(); c.strokeStyle = MAU.nau; c.lineWidth = s * 0.035; c.stroke();
      }
      gac(-1); gac(1);
      c.beginPath(); c.moveTo(-s * 0.12, -s * 0.08); c.quadraticCurveTo(-s * 0.16, s * 0.2, 0, s * 0.36); c.quadraticCurveTo(s * 0.16, s * 0.2, s * 0.12, -s * 0.08); c.quadraticCurveTo(0, -s * 0.14, -s * 0.12, -s * 0.08); to(c, MAU.hong, s);
      eli(c, -s * 0.17, -s * 0.06, s * 0.08, s * 0.035, -0.4); to(c, MAU.hong, s, 0.014); eli(c, s * 0.17, -s * 0.06, s * 0.08, s * 0.035, 0.4); to(c, MAU.hong, s, 0.014);
      tron(c, -s * 0.05, s * 0.04, s * 0.02); c.fillStyle = MAU.den; c.fill(); tron(c, s * 0.05, s * 0.04, s * 0.02); c.fill();
      eli(c, 0, s * 0.3, s * 0.05, s * 0.035); to(c, MAU.den, s, 0.01);
    },
    ongNuoc: function (c, s, t) {
      c.beginPath(); c.moveTo(-s * 0.42, -s * 0.18); c.lineTo(s * 0.12, -s * 0.18); c.quadraticCurveTo(s * 0.2, -s * 0.18, s * 0.2, -s * 0.1); c.lineTo(s * 0.2, s * 0.12);
      c.strokeStyle = MAU.den; c.lineWidth = s * 0.16; c.stroke(); c.strokeStyle = MAU.xam; c.lineWidth = s * 0.12; c.stroke();
      c.strokeStyle = "rgba(255,255,255,0.5)"; c.lineWidth = s * 0.025; c.beginPath(); c.moveTo(-s * 0.4, -s * 0.21); c.lineTo(s * 0.1, -s * 0.21); c.stroke();
      [[-0.2, -0.18, 0], [0.2, 0.04, Math.PI / 2]].forEach(function (k) { c.save(); c.translate(s * k[0], s * k[1]); c.rotate(k[2]); chuNhat(c, -s * 0.04, -s * 0.1, s * 0.08, s * 0.2, s * 0.015); to(c, MAU.nghe, s, 0.014); c.restore(); });
      var r = (t * 0.9) % 1;
      c.beginPath(); c.moveTo(s * 0.2, s * 0.18 + r * s * 0.22); c.quadraticCurveTo(s * 0.25, s * 0.26 + r * s * 0.22, s * 0.2, s * 0.28 + r * s * 0.22); c.quadraticCurveTo(s * 0.15, s * 0.26 + r * s * 0.22, s * 0.2, s * 0.18 + r * s * 0.22); to(c, "#7fb6e8", s, 0.012);
    },
    caiTai: function (c, s, t) {
      c.beginPath(); c.moveTo(-s * 0.02, -s * 0.36); c.bezierCurveTo(s * 0.3, -s * 0.38, s * 0.32, s * 0.04, s * 0.12, s * 0.16);
      c.bezierCurveTo(s * 0.02, s * 0.24, s * 0.08, s * 0.38, -s * 0.06, s * 0.38); c.bezierCurveTo(-s * 0.2, s * 0.38, -s * 0.2, s * 0.2, -s * 0.14, s * 0.1);
      c.bezierCurveTo(-s * 0.24, -s * 0.06, -s * 0.24, -s * 0.34, -s * 0.02, -s * 0.36); to(c, MAU.hong, s);
      c.beginPath(); c.moveTo(-s * 0.04, -s * 0.22); c.bezierCurveTo(s * 0.16, -s * 0.24, s * 0.16, -s * 0.02, s * 0.02, s * 0.06); c.bezierCurveTo(-s * 0.06, s * 0.1, -s * 0.02, s * 0.2, -s * 0.08, s * 0.22); net(c, s, 0.014); c.stroke();
      // Sóng âm truyền tới tai từ bên trái
      for (var k = 0; k < 3; k += 1) {
        var pha = (t * 0.8 + k / 3) % 1, r = s * (0.08 + (1 - pha) * 0.22);
        c.beginPath(); c.arc(-s * 0.2, -s * 0.02, r, Math.PI - 0.6, Math.PI + 0.6);
        c.strokeStyle = "rgba(200,53,43," + (0.2 + pha * 0.7) + ")"; c.lineWidth = s * 0.02; c.stroke();
      }
    },
    amSieu: function (c, s, t) {
      for (var f = 0; f < 3; f += 1) { var h = s * (0.08 + 0.03 * Math.sin(t * 9 + f * 2)); c.beginPath(); c.moveTo(-s * 0.1 + f * s * 0.1, s * 0.34); c.quadraticCurveTo(-s * 0.13 + f * s * 0.1, s * 0.3 - h * 0.5, -s * 0.1 + f * s * 0.1, s * 0.3 - h); c.quadraticCurveTo(-s * 0.07 + f * s * 0.1, s * 0.3 - h * 0.5, -s * 0.1 + f * s * 0.1, s * 0.34); to(c, f % 2 ? MAU.nghe : MAU.son, s, 0.01); }
      chuNhat(c, -s * 0.24, s * 0.34, s * 0.48, s * 0.1, s * 0.02); to(c, MAU.nau, s); vachKhac(c, s, -s * 0.24, s * 0.34, s * 0.24, s * 0.44, s * 0.04);
      c.beginPath(); c.moveTo(s * 0.18, -s * 0.02); c.quadraticCurveTo(s * 0.36, -s * 0.04, s * 0.42, -s * 0.16); c.lineTo(s * 0.38, -s * 0.18); c.quadraticCurveTo(s * 0.32, -s * 0.1, s * 0.18, -s * 0.08); to(c, MAU.nau, s);
      c.beginPath(); c.moveTo(-s * 0.18, -s * 0.06); c.lineTo(-s * 0.36, -s * 0.08); net(c, s, 0.045); c.stroke(); c.strokeStyle = MAU.nau; c.lineWidth = s * 0.025; c.stroke();
      eli(c, 0, s * 0.08, s * 0.26, s * 0.24); to(c, "#9a5b2c", s); vachKhac(c, s, -s * 0.26, -s * 0.16, s * 0.26, s * 0.32, s * 0.05); eli(c, 0, s * 0.08, s * 0.26, s * 0.24); net(c, s); c.stroke();
      eli(c, 0, -s * 0.14, s * 0.15, s * 0.04); to(c, MAU.nau, s, 0.016); tron(c, 0, -s * 0.2, s * 0.035); to(c, MAU.nau, s, 0.012);
      for (var k = 0; k < 2; k += 1) { var y = -s * 0.26 - ((t * 0.4 + k * 0.5) % 1) * s * 0.18; c.beginPath(); c.moveTo(s * 0.42, y + s * 0.06); c.bezierCurveTo(s * 0.38, y, s * 0.46, y - s * 0.04, s * 0.42, y - s * 0.1); c.strokeStyle = "rgba(29,21,16,0.4)"; c.lineWidth = s * 0.012; c.stroke(); }
    },
    notNhac: function (c, s, t) {
      var nay = Math.sin(t * 3) * s * 0.03;
      c.save(); c.translate(0, nay);
      c.beginPath(); c.moveTo(-s * 0.1, s * 0.18); c.lineTo(-s * 0.1, -s * 0.3); c.lineTo(s * 0.24, -s * 0.38); c.lineTo(s * 0.24, s * 0.1); net(c, s, 0.04); c.stroke();
      c.beginPath(); c.moveTo(-s * 0.1, -s * 0.3); c.lineTo(s * 0.24, -s * 0.38); c.lineTo(s * 0.24, -s * 0.28); c.lineTo(-s * 0.1, -s * 0.2); c.closePath(); c.fillStyle = MAU.den; c.fill();
      eli(c, -s * 0.18, s * 0.2, s * 0.1, s * 0.075, -0.4); to(c, MAU.son, s);
      eli(c, s * 0.16, s * 0.12, s * 0.1, s * 0.075, -0.4); to(c, MAU.son, s);
      c.restore();
    },
    canPhong: function (c, s) {
      c.beginPath(); c.moveTo(-s * 0.4, -s * 0.06); c.lineTo(0, -s * 0.38); c.lineTo(s * 0.4, -s * 0.06); c.closePath(); to(c, MAU.son, s);
      c.beginPath(); c.moveTo(-s * 0.4, -s * 0.06); c.lineTo(0, -s * 0.38); c.lineTo(s * 0.4, -s * 0.06); c.closePath(); vachKhac(c, s, -s * 0.4, -s * 0.38, s * 0.4, -s * 0.06, s * 0.05);
      chuNhat(c, -s * 0.32, -s * 0.06, s * 0.64, s * 0.44, s * 0.01); to(c, MAU.trang, s);
      chuNhat(c, -s * 0.08, s * 0.08, s * 0.16, s * 0.3, s * 0.01); to(c, MAU.cham, s);
      tron(c, s * 0.05, s * 0.24, s * 0.012); c.fillStyle = MAU.nghe; c.fill();
      [-0.22, 0.22].forEach(function (x) { chuNhat(c, s * x - s * 0.07, s * 0.04, s * 0.14, s * 0.12, s * 0.01); to(c, MAU.nghe, s, 0.014); c.beginPath(); c.moveTo(s * x, s * 0.04); c.lineTo(s * x, s * 0.16); net(c, s, 0.01); c.stroke(); });
    },
    gaMo: function (c, s, t) {
      var mo = Math.max(0, Math.sin(t * 6)) * 0.35;
      [[-0.32, 0.36], [-0.24, 0.39], [-0.36, 0.4], [-0.18, 0.37]].forEach(function (h) { eli(c, s * h[0], s * h[1], s * 0.018, s * 0.011); c.fillStyle = MAU.nghe; c.fill(); });
      [[0.02, 0.06], [0.1, 0.08]].forEach(function (l) { c.beginPath(); c.moveTo(s * l[0], s * 0.2); c.lineTo(s * l[1], s * 0.38); c.lineTo(s * (l[1] + 0.05), s * 0.4); net(c, s, 0.016); c.strokeStyle = MAU.nghe; c.stroke(); });
      c.beginPath(); c.moveTo(s * 0.34, -s * 0.12); c.quadraticCurveTo(s * 0.46, -s * 0.2, s * 0.42, s * 0.02); c.lineTo(s * 0.3, s * 0.02); to(c, MAU.cham, s);
      eli(c, s * 0.06, s * 0.06, s * 0.28, s * 0.18); to(c, MAU.nghe, s); vachKhac(c, s, -s * 0.22, -s * 0.12, s * 0.34, s * 0.24, s * 0.05); eli(c, s * 0.06, s * 0.06, s * 0.28, s * 0.18); net(c, s); c.stroke();
      eli(c, s * 0.08, s * 0.04, s * 0.14, s * 0.08, -0.2); to(c, MAU.son, s, 0.014);
      c.save(); c.translate(-s * 0.16, -s * 0.02); c.rotate(mo + 0.5);
      c.beginPath(); c.moveTo(0, 0); c.lineTo(-s * 0.06, s * 0.12); net(c, s, 0.08); c.strokeStyle = MAU.nghe; c.stroke();
      tron(c, -s * 0.07, s * 0.16, s * 0.07); to(c, MAU.nghe, s);
      c.beginPath(); c.moveTo(-s * 0.06, s * 0.09); c.quadraticCurveTo(-s * 0.04, s * 0.04, -s * 0.0, s * 0.1); c.quadraticCurveTo(-s * 0.02, s * 0.06, -s * 0.02, s * 0.11); to(c, MAU.son, s, 0.01);
      c.beginPath(); c.moveTo(-s * 0.12, s * 0.2); c.lineTo(-s * 0.15, s * 0.27); c.lineTo(-s * 0.09, s * 0.22); to(c, MAU.son, s, 0.01);
      tron(c, -s * 0.09, s * 0.15, s * 0.012); c.fillStyle = MAU.den; c.fill();
      c.restore();
    },
    vienThuoc: function (c, s, t) {
      c.save(); c.rotate(-0.5 + Math.sin(t) * 0.05);
      chuNhat(c, -s * 0.34, -s * 0.12, s * 0.34, s * 0.24, s * 0.12); to(c, MAU.son, s);
      chuNhat(c, 0, -s * 0.12, s * 0.34, s * 0.24, s * 0.12); to(c, MAU.trang, s);
      c.fillStyle = "rgba(255,255,255,0.6)"; chuNhat(c, -s * 0.26, -s * 0.08, s * 0.18, s * 0.04, s * 0.02); c.fill();
      c.restore();
      tron(c, s * 0.22, s * 0.26, s * 0.12); to(c, MAU.nghe, s);
      c.beginPath(); c.moveTo(s * 0.12, s * 0.26); c.lineTo(s * 0.32, s * 0.26); net(c, s, 0.014); c.stroke();
    },
    duaBo: function (c, s) {
      c.beginPath(); c.moveTo(-s * 0.42, -s * 0.02); c.arc(-s * 0.1, -s * 0.02, s * 0.32, Math.PI, 0, true); c.closePath(); to(c, MAU.la, s);
      c.beginPath(); c.moveTo(-s * 0.37, -s * 0.02); c.arc(-s * 0.1, -s * 0.02, s * 0.27, Math.PI, 0, true); c.closePath(); to(c, MAU.son, s, 0.014);
      for (var k = 0; k < 7; k += 1) { var a = 0.4 + (k / 6) * (Math.PI - 0.8); eli(c, -s * 0.1 + Math.cos(a) * s * 0.16, -s * 0.02 + Math.sin(a) * s * 0.14, s * 0.014, s * 0.024, a); c.fillStyle = MAU.den; c.fill(); }
      c.save(); c.translate(s * 0.26, -s * 0.2); c.rotate(-0.7);
      c.beginPath(); c.moveTo(-s * 0.04, -s * 0.28); c.lineTo(s * 0.05, -s * 0.28); c.quadraticCurveTo(s * 0.06, -s * 0.1, 0, 0); c.lineTo(-s * 0.04, 0); c.closePath(); to(c, "#d9dde3", s);
      chuNhat(c, -s * 0.05, 0, s * 0.1, s * 0.2, s * 0.02); to(c, MAU.nau, s);
      c.restore();
    },
    trucThang: function (c, s, t) {
      var cq = Math.cos(t * 18);
      c.beginPath(); c.moveTo(-s * 0.42 * cq, -s * 0.22); c.lineTo(s * 0.42 * cq, -s * 0.22); net(c, s, 0.035); c.stroke();
      c.beginPath(); c.moveTo(0, -s * 0.22); c.lineTo(0, -s * 0.12); net(c, s, 0.03); c.stroke();
      c.beginPath(); c.moveTo(s * 0.1, 0); c.lineTo(s * 0.44, -s * 0.06); c.lineTo(s * 0.44, s * 0.02); c.lineTo(s * 0.1, s * 0.08); c.closePath(); to(c, MAU.cham, s);
      c.save(); c.translate(s * 0.44, -s * 0.06); c.rotate(t * 18); c.beginPath(); c.moveTo(-s * 0.07, 0); c.lineTo(s * 0.07, 0); net(c, s, 0.02); c.stroke(); c.restore();
      eli(c, -s * 0.06, s * 0.0, s * 0.22, s * 0.14); to(c, MAU.cham, s); vachKhac(c, s, -s * 0.28, -s * 0.14, s * 0.16, s * 0.14, s * 0.05); eli(c, -s * 0.06, 0, s * 0.22, s * 0.14); net(c, s); c.stroke();
      c.beginPath(); c.moveTo(-s * 0.26, s * 0.0); c.quadraticCurveTo(-s * 0.24, -s * 0.12, -s * 0.08, -s * 0.12); c.lineTo(-s * 0.08, s * 0.0); c.closePath(); to(c, MAU.bang, s, 0.014);
      [-0.16, 0.06].forEach(function (x) { c.beginPath(); c.moveTo(s * x, s * 0.12); c.lineTo(s * x, s * 0.2); net(c, s, 0.016); c.stroke(); });
      c.beginPath(); c.moveTo(-s * 0.26, s * 0.2); c.lineTo(s * 0.14, s * 0.2); net(c, s, 0.03); c.stroke();
      tron(c, -s * 0.04, s * 0.04, s * 0.035); to(c, MAU.trang, s, 0.012);
      c.beginPath(); c.moveTo(-s * 0.06, s * 0.04); c.lineTo(-s * 0.02, s * 0.04); c.moveTo(-s * 0.04, s * 0.02); c.lineTo(-s * 0.04, s * 0.06); c.strokeStyle = MAU.son; c.lineWidth = s * 0.012; c.stroke();
    },
    trangDem: function (c, s, t) {
      tron(c, 0, 0, s * 0.42); to(c, MAU.cham, s); vachKhac(c, s, -s * 0.42, -s * 0.42, s * 0.42, s * 0.42, s * 0.06); tron(c, 0, 0, s * 0.42); net(c, s); c.stroke();
      c.beginPath(); c.arc(-s * 0.04, -s * 0.02, s * 0.22, 0, HAI_PI); c.arc(s * 0.06, -s * 0.08, s * 0.19, 0, HAI_PI, true); c.fillStyle = MAU.nghe; c.fill(); net(c, s, 0.016); c.stroke();
      [[0.22, -0.22], [0.26, 0.12], [-0.26, 0.2], [0.04, 0.28]].forEach(function (p, i) {
        var r = s * (0.03 + 0.012 * Math.sin(t * 3 + i));
        c.beginPath(); for (var k = 0; k < 8; k += 1) { var a = (k / 8) * HAI_PI, rr = k % 2 ? r * 0.4 : r; c.lineTo(s * p[0] + Math.cos(a) * rr, s * p[1] + Math.sin(a) * rr); } c.closePath(); c.fillStyle = MAU.trang; c.fill();
      });
    },
    daiBang: function (c, s, t) {
      var vo = Math.sin(t * 2) * 0.06;
      [-1, 1].forEach(function (d) {
        c.save(); c.scale(d, 1); c.rotate(vo);
        c.beginPath(); c.moveTo(s * 0.06, -s * 0.04); c.quadraticCurveTo(s * 0.3, -s * 0.34, s * 0.48, -s * 0.24);
        for (var k = 0; k < 4; k += 1) {
          c.lineTo(s * (0.44 - k * 0.07), -s * (0.14 - k * 0.04)); // răng lông cánh
          c.lineTo(s * (0.4 - k * 0.07), -s * (0.18 - k * 0.04));
        }
        c.lineTo(s * 0.06, s * 0.08); c.closePath(); to(c, MAU.nau, s);
        c.restore();
      });
      eli(c, 0, s * 0.1, s * 0.11, s * 0.2); to(c, MAU.nau, s); vachKhac(c, s, -s * 0.11, -s * 0.1, s * 0.11, s * 0.3, s * 0.04); eli(c, 0, s * 0.1, s * 0.11, s * 0.2); net(c, s); c.stroke();
      tron(c, 0, -s * 0.14, s * 0.09); to(c, MAU.trang, s);
      c.beginPath(); c.moveTo(s * 0.06, -s * 0.15); c.quadraticCurveTo(s * 0.16, -s * 0.15, s * 0.13, -s * 0.07); c.lineTo(s * 0.06, -s * 0.1); c.closePath(); to(c, MAU.nghe, s, 0.012);
      tron(c, s * 0.03, -s * 0.16, s * 0.014); c.fillStyle = MAU.den; c.fill();
      c.beginPath(); c.moveTo(-s * 0.06, s * 0.28); c.lineTo(0, s * 0.4); c.lineTo(s * 0.06, s * 0.28); c.closePath(); to(c, MAU.nau, s, 0.014);
    },
    bieuDo: function (c, s, t) {
      c.beginPath(); c.moveTo(-s * 0.4, -s * 0.38); c.lineTo(-s * 0.4, s * 0.34); c.lineTo(s * 0.42, s * 0.34); net(c, s, 0.03); c.stroke();
      [[0.14, MAU.cham], [0.3, MAU.la], [0.44, MAU.nghe], [0.6, MAU.son]].forEach(function (b, i) {
        var h = s * b[0] * (0.92 + 0.08 * Math.sin(t * 2 + i));
        chuNhat(c, -s * 0.3 + i * s * 0.18, s * 0.34 - h, s * 0.12, h, s * 0.01); to(c, b[1], s, 0.016);
      });
      c.beginPath(); c.moveTo(-s * 0.3, s * 0.06); c.lineTo(-s * 0.08, -s * 0.04); c.lineTo(s * 0.08, s * 0.0); c.lineTo(s * 0.34, -s * 0.3);
      c.strokeStyle = MAU.den; c.lineWidth = s * 0.05; c.stroke(); c.strokeStyle = MAU.trang; c.lineWidth = s * 0.025; c.stroke();
      c.beginPath(); c.moveTo(s * 0.36, -s * 0.36); c.lineTo(s * 0.38, -s * 0.22); c.lineTo(s * 0.25, -s * 0.28); c.closePath(); to(c, MAU.trang, s, 0.014);
    },
  };

  var CAU = {
    "cong-doan": ["cong", "tau"], "tang-ca": ["xeTang", "ca"], "thang-may": ["thang", "banhRang"],
    "bang-gac": ["tangBang", "gacNai"], "ong-nghe": ["ongNuoc", "caiTai"], "sieu-am": ["amSieu", "notNhac"],
    "phong-mo": ["canPhong", "gaMo"], "thuoc-bo": ["vienThuoc", "duaBo"], "truc-dem": ["trucThang", "trangDem"],
    "dai-bieu": ["daiBang", "bieuDo"],
  };

  function tao(canvas) {
    var ctx = canvas.getContext("2d");
    var W = 0, H = 0, t = 0, raf = 0, chay = false, tTruoc = 0;
    var hinh = null, anh = null, manh = [], dau = null, diep = [];

    function coCanh(id) { return typeof id === "string" && id.indexOf("tranh:") === 0 && Boolean(CAU[id.slice(6)]); }

    function kichThuoc() {
      var dpr = Math.min(root.devicePixelRatio || 1, 2);
      var w = canvas.clientWidth || 760, h = canvas.clientHeight || 428;
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      W = w; H = h;
    }

    function vungTrong() { var le = Math.max(14, W * 0.028); return { x: le, y: le, w: W - le * 2, h: H - le * 2, le: le }; }

    function veGiay(v) {
      var g = ctx.createRadialGradient(W * 0.5, H * 0.45, W * 0.1, W * 0.5, H * 0.5, W * 0.7);
      g.addColorStop(0, "#f8eed6"); g.addColorStop(1, "#e9d6ab");
      ctx.fillStyle = g; ctx.fillRect(v.x, v.y, v.w, v.h);
      // Sớ giấy dó
      ctx.strokeStyle = "rgba(122,75,37,0.06)"; ctx.lineWidth = 1;
      for (var k = 0; k < 40; k += 1) { var y = v.y + ((k * 53) % v.h); ctx.beginPath(); ctx.moveTo(v.x, y); ctx.bezierCurveTo(v.x + v.w * 0.3, y + 6, v.x + v.w * 0.6, y - 6, v.x + v.w, y + 3); ctx.stroke(); }
      // Vảy điệp óng ánh
      if (!diep.length) for (var i = 0; i < 160; i += 1) diep.push({ x: Math.random(), y: Math.random(), p: Math.random() * 6, r: 0.6 + Math.random() * 1.4 });
      diep.forEach(function (d) {
        var a = Math.max(0, Math.sin(t * 1.6 + d.p)) * 0.75;
        ctx.fillStyle = "rgba(255,255,255," + a + ")";
        ctx.beginPath(); ctx.arc(v.x + d.x * v.w, v.y + d.y * v.h, d.r, 0, HAI_PI); ctx.fill();
      });
    }

    function veKhung(v) {
      ctx.fillStyle = "#3b2414"; ctx.fillRect(0, 0, W, v.le); ctx.fillRect(0, H - v.le, W, v.le); ctx.fillRect(0, 0, v.le, H); ctx.fillRect(W - v.le, 0, v.le, H);
      ctx.strokeStyle = "#a9752f"; ctx.lineWidth = 2; ctx.strokeRect(v.le * 0.35, v.le * 0.35, W - v.le * 0.7, H - v.le * 0.7);
      ctx.strokeStyle = MAU.son; ctx.lineWidth = 3; ctx.strokeRect(v.x + 6, v.y + 6, v.w - 12, v.h - 12);
      ctx.strokeStyle = MAU.den; ctx.lineWidth = 1; ctx.strokeRect(v.x + 11, v.y + 11, v.w - 22, v.h - 22);
      [[v.x + 6, v.y + 6], [v.x + v.w - 6, v.y + 6], [v.x + 6, v.y + v.h - 6], [v.x + v.w - 6, v.y + v.h - 6]].forEach(function (p) {
        ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate(Math.PI / 4);
        ctx.fillStyle = MAU.son; ctx.fillRect(-7, -7, 14, 14); ctx.strokeStyle = MAU.nghe; ctx.lineWidth = 1.5; ctx.strokeRect(-4, -4, 8, 8);
        ctx.restore();
      });
    }

    function veNoiDung(v) {
      if (anh) {
        if (!anh.complete || !anh.naturalWidth) return;
        var tl = Math.min((v.w - 40) / anh.naturalWidth, (v.h - 40) / anh.naturalHeight);
        var w = anh.naturalWidth * tl, h = anh.naturalHeight * tl;
        ctx.drawImage(anh, v.x + (v.w - w) / 2, v.y + (v.h - h) / 2, w, h);
        return;
      }
      if (!hinh) return;
      var s = Math.min(v.h * 0.7, v.w * 0.36);
      var cy = v.y + v.h * 0.52;
      [[0.29, hinh[0]], [0.71, hinh[1]]].forEach(function (p, i) {
        var nho = 1 + Math.sin(t * 1.4 + i * 1.7) * 0.012;
        ctx.save(); ctx.translate(v.x + v.w * p[0], cy); ctx.scale(nho, nho);
        // Bóng mực in loang dưới hình
        ctx.fillStyle = "rgba(122,75,37,0.12)"; ctx.beginPath(); ctx.ellipse(0, s * 0.46, s * 0.4, s * 0.05, 0, 0, HAI_PI); ctx.fill();
        HINH[p[1]](ctx, s, t);
        ctx.restore();
      });
      // Dấu cộng nét bút lông son
      var cx = v.x + v.w * 0.5, r = s * 0.09;
      ctx.strokeStyle = MAU.son; ctx.lineCap = "round"; ctx.lineWidth = r * 0.45;
      ctx.beginPath(); ctx.moveTo(cx - r, cy); ctx.quadraticCurveTo(cx, cy - r * 0.15, cx + r, cy + r * 0.05); ctx.moveTo(cx, cy - r); ctx.quadraticCurveTo(cx + r * 0.1, cy, cx - r * 0.05, cy + r); ctx.stroke();
    }

    /** Mặt một mảnh che: viền gỗ, mặt giấy điệp sáng, giữa là biểu tượng Bệnh viện (window.UMC). */
    function veMatManh(w, h) {
      ctx.fillStyle = "#4a2a12"; ctx.fillRect(-w / 2 - 0.5, -h / 2 - 0.5, w + 1, h + 1); // phủ kín khe giữa các mảnh để không lộ hình
      var g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
      g.addColorStop(0, "#fffaf0"); g.addColorStop(1, "#eedfbd");
      ctx.fillStyle = g; ctx.fillRect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 8);
      ctx.strokeStyle = "rgba(200,53,43,0.55)"; ctx.lineWidth = 1.5; ctx.strokeRect(-w / 2 + 9, -h / 2 + 9, w - 18, h - 18);
      var a = Math.min(w, h) * 0.58;
      if (root.UMC && root.UMC.san(root.UMC.lon)) {
        ctx.drawImage(root.UMC.lon, -a / 2, -a / 2, a, a);
        return;
      }
      // Ảnh biểu tượng chưa nạp xong: tạm vẽ hoa thị son
      var r = a * 0.28;
      ctx.fillStyle = MAU.son;
      for (var p = 0; p < 4; p += 1) { ctx.save(); ctx.rotate((p * Math.PI) / 2); ctx.beginPath(); ctx.ellipse(0, -r * 0.6, r * 0.38, r * 0.6, 0, 0, HAI_PI); ctx.fill(); ctx.restore(); }
    }

    function veManh(v, dt) {
      var w = v.w / COT, h = v.h / HANG;
      manh.forEach(function (m) {
        if (m.mo >= 1) return;
        if (m.dangMo) m.mo = Math.min(1, m.mo + dt / TG_LAT);
        var co = Math.cos(m.mo * Math.PI);
        if (co <= 0) return;
        var x = v.x + m.c * w, y = v.y + m.h * h;
        ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.scale(co, 1 - (1 - co) * 0.06);
        veMatManh(w, h);
        ctx.restore();
      });
    }

    function veDau(v, dt) {
      if (!dau) return;
      dau.t += dt;
      var p = Math.min(1, dau.t / 0.32), tl = 2.2 - 1.2 * (1 - Math.pow(1 - p, 3));
      var cx = v.x + v.w - v.w * 0.14, cy = v.y + v.h * 0.24, a = Math.min(v.w, v.h) * 0.13;
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.2); ctx.scale(tl, tl); ctx.globalAlpha = Math.min(1, p * 1.4) * 0.92;
      ctx.fillStyle = MAU.son; ctx.fillRect(-a, -a, a * 2, a * 2);
      ctx.strokeStyle = "#f8eed6"; ctx.lineWidth = a * 0.07; ctx.strokeRect(-a * 0.82, -a * 0.82, a * 1.64, a * 1.64);
      ctx.fillStyle = "#f8eed6"; ctx.font = "900 " + Math.round(a * 0.46) + "px Georgia, 'Times New Roman', serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("ĐÚNG", 0, a * 0.04);
      ctx.restore();
      if (p >= 1 && !dau.vang) {
        dau.vang = true;
        dau.giot = [];
        for (var k = 0; k < 18; k += 1) { var g = Math.random() * HAI_PI, d = a * (1.2 + Math.random() * 0.9); dau.giot.push({ x: cx + Math.cos(g) * d, y: cy + Math.sin(g) * d, r: 1 + Math.random() * 3.5 }); }
      }
      if (dau.giot) dau.giot.forEach(function (g) { ctx.fillStyle = "rgba(200,53,43,0.75)"; ctx.beginPath(); ctx.arc(g.x, g.y, g.r, 0, HAI_PI); ctx.fill(); });
    }

    function ve(dt) {
      kichThuoc();
      var v = vungTrong();
      if (v.w < 40 || v.h < 40) return; // khung chưa có kích thước (đang chuyển màn): bỏ qua khung hình này
      ctx.clearRect(0, 0, W, H);
      veGiay(v);
      veNoiDung(v);
      veManh(v, dt);
      veKhung(v);
      veDau(v, dt);
    }

    function batVongLap() {
      if (chay) return;
      chay = true; tTruoc = performance.now();
      (function lap(tg) {
        if (!chay) return;
        var dt = Math.min(0.05, (tg - tTruoc) / 1000) || 0.016;
        tTruoc = tg; t += dt;
        ve(dt);
        raf = requestAnimationFrame(lap);
      })(tTruoc);
    }

    return {
      coCanh: coCanh,
      datCau: function (canhId, anhUrl) {
        hinh = coCanh(canhId) ? CAU[canhId.slice(6)] : null;
        anh = null;
        if (anhUrl) { anh = new Image(); anh.src = anhUrl; }
        manh = [];
        for (var h = 0; h < HANG; h += 1) for (var c = 0; c < COT; c += 1) manh.push({ c: c, h: h, mo: 0, dangMo: false });
        dau = null;
        batVongLap();
      },
      /** Mở ngẫu nhiên một mảnh còn che. Trả false khi đã mở hết. */
      moMot: function () {
        var dong = manh.filter(function (m) { return !m.dangMo; });
        if (!dong.length) return false;
        dong[Math.floor(Math.random() * dong.length)].dangMo = true;
        return true;
      },
      moHet: function () { manh.forEach(function (m, i) { if (!m.dangMo) setTimeout(function () { m.dangMo = true; }, i * 45); }); },
      conManh: function () { return manh.filter(function (m) { return !m.dangMo; }).length; },
      dongDau: function () { dau = { t: 0 }; },
      dung: function () { chay = false; if (raf) { cancelAnimationFrame(raf); raf = 0; } },
    };
  }

  // HINH và CAU là đối tượng mở: js/duoi-hinh/hinh-them.js thêm hình và câu mới vào đây (nạp sau file này).
  root.VeTranh = { tao: tao, CAU: CAU, HINH: HINH, MAU: MAU, but: { net: net, to: to, vachKhac: vachKhac, eli: eli, tron: tron, chuNhat: chuNhat } };
})(window);
