/* Thêm hình và câu đố chơi chữ cho Đuổi hình bắt chữ, cùng phong cách tranh Đông Hồ với ve-tranh.js.
 * Nạp SAU ve-tranh.js: ghi thêm vào VeTranh.HINH (hình) và VeTranh.CAU (câu = [hình trái, hình phải]).
 * Mỗi hình vẽ quanh gốc (0,0) trong ô cạnh s; t là thời gian (giây) cho chuyển động nhẹ. */
(function (root) {
  "use strict";

  var VT = root.VeTranh;
  if (!VT) return;
  var M = VT.MAU, B = VT.but;
  var to = B.to, net = B.net, eli = B.eli, tron = B.tron, chuNhat = B.chuNhat, vachKhac = B.vachKhac;
  var HAI_PI = Math.PI * 2;

  function sao(c, x, y, r, canh) {
    c.beginPath();
    for (var k = 0; k < canh * 2; k += 1) { var a = (k / (canh * 2)) * HAI_PI - Math.PI / 2, rr = k % 2 ? r * 0.42 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    c.closePath();
  }
  function duongNet(c, s, day, mau, diem) {
    c.beginPath(); c.moveTo(s * diem[0], s * diem[1]);
    for (var i = 2; i < diem.length; i += 2) c.lineTo(s * diem[i], s * diem[i + 1]);
    net(c, s, day); if (mau) c.strokeStyle = mau; c.stroke();
  }
  function mat(c, s, x, y) { tron(c, s * x, s * y, s * 0.014); c.fillStyle = M.den; c.fill(); }

  var HINH = {
    traiTim: function (c, s, t) {
      var p = 1 + Math.max(0, Math.sin(t * 5)) * 0.06;
      c.save(); c.scale(p, p);
      c.beginPath(); c.moveTo(0, s * 0.34);
      c.bezierCurveTo(-s * 0.46, s * 0.02, -s * 0.34, -s * 0.38, 0, -s * 0.16);
      c.bezierCurveTo(s * 0.34, -s * 0.38, s * 0.46, s * 0.02, 0, s * 0.34); to(c, M.son, s);
      c.beginPath(); c.moveTo(0, s * 0.34); c.bezierCurveTo(-s * 0.46, s * 0.02, -s * 0.34, -s * 0.38, 0, -s * 0.16); c.bezierCurveTo(s * 0.34, -s * 0.38, s * 0.46, s * 0.02, 0, s * 0.34);
      vachKhac(c, s, -s * 0.4, -s * 0.36, s * 0.4, s * 0.34, s * 0.06);
      eli(c, -s * 0.17, -s * 0.12, s * 0.07, s * 0.035, -0.6); c.fillStyle = "rgba(255,255,255,0.7)"; c.fill();
      c.restore();
    },
    luaMach: function (c, s, t) {
      [-0.16, 0, 0.16].forEach(function (x, i) {
        var lac = Math.sin(t * 1.5 + i) * 0.04;
        c.save(); c.translate(s * x, s * 0.42); c.rotate((i - 1) * 0.18 + lac);
        duongNet(c, s, 0.018, M.la, [0, 0, 0, -0.5]);
        for (var k = 0; k < 6; k += 1) {
          eli(c, -s * 0.035, -s * (0.52 + k * 0.06), s * 0.03, s * 0.05, -0.5); to(c, M.nghe, s, 0.01);
          eli(c, s * 0.035, -s * (0.52 + k * 0.06), s * 0.03, s * 0.05, 0.5); to(c, M.nghe, s, 0.01);
        }
        eli(c, 0, -s * 0.9, s * 0.028, s * 0.05); to(c, M.nghe, s, 0.01);
        c.beginPath(); c.moveTo(0, -s * 0.18); c.quadraticCurveTo(s * 0.14, -s * 0.24, s * 0.16, -s * 0.36); c.quadraticCurveTo(s * 0.06, -s * 0.24, 0, -s * 0.22); to(c, M.la, s, 0.01);
        c.restore();
      });
    },
    bacCap: function (c, s) {
      for (var k = 0; k < 4; k += 1) {
        chuNhat(c, -s * 0.4 + k * s * 0.2, s * 0.36 - (k + 1) * s * 0.17, s * (0.8 - k * 0.2), s * 0.17, s * 0.01);
        to(c, k % 2 ? "#a66a35" : M.nau, s);
      }
      chuNhat(c, -s * 0.4, s * 0.36 - s * 0.68, s * 0.8, s * 0.68, 0); vachKhac(c, s, -s * 0.4, -s * 0.32, s * 0.4, s * 0.36, s * 0.07);
      duongNet(c, s, 0.02, null, [-0.36, 0.1, 0.24, -0.5]);
      [-0.36, -0.16, 0.04, 0.24].forEach(function (x, i) { duongNet(c, s, 0.014, null, [x, 0.1 - i * 0.2, x, 0.19 - i * 0.17]); });
    },
    phaoCuu: function (c, s, t) {
      c.save(); c.rotate(Math.sin(t * 1.2) * 0.06);
      tron(c, 0, 0, s * 0.36); to(c, M.trang, s);
      for (var k = 0; k < 4; k += 1) {
        var a = (k / 4) * HAI_PI + Math.PI / 8;
        c.beginPath(); c.arc(0, 0, s * 0.36, a, a + Math.PI / 4); c.arc(0, 0, s * 0.18, a + Math.PI / 4, a, true); c.closePath(); to(c, M.son, s, 0.014);
      }
      tron(c, 0, 0, s * 0.18); to(c, M.giay, s);
      for (var d = 0; d < 4; d += 1) { var b = (d / 4) * HAI_PI; c.beginPath(); c.arc(0, 0, s * 0.27, b - 0.25, b + 0.25); net(c, s, 0.018); c.strokeStyle = M.nau; c.stroke(); }
      c.restore();
    },
    conTho: function (c, s, t) {
      var vay = Math.sin(t * 4) * 0.06;
      [[-0.08, -0.06], [0.08, 0.06]].forEach(function (p) {
        c.save(); c.translate(s * p[0], -s * 0.16); c.rotate(p[1] + vay);
        eli(c, 0, -s * 0.2, s * 0.06, s * 0.2); to(c, M.trang, s); eli(c, 0, -s * 0.2, s * 0.03, s * 0.14); c.fillStyle = M.hong; c.fill();
        c.restore();
      });
      eli(c, -s * 0.02, s * 0.22, s * 0.26, s * 0.18); to(c, M.trang, s);
      tron(c, s * 0.24, s * 0.3, s * 0.06); to(c, M.trang, s, 0.014);
      tron(c, 0, -s * 0.04, s * 0.16); to(c, M.trang, s);
      mat(c, s, -0.05, -0.07); mat(c, s, 0.06, -0.07);
      eli(c, 0, 0, s * 0.025, s * 0.018); c.fillStyle = M.hong; c.fill();
      duongNet(c, s, 0.008, null, [0.03, 0.0, 0.16, -0.02]); duongNet(c, s, 0.008, null, [-0.03, 0.0, -0.16, -0.02]);
      c.save(); c.translate(-s * 0.24, s * 0.3); c.rotate(-0.6);
      c.beginPath(); c.moveTo(0, -s * 0.16); c.lineTo(s * 0.05, 0); c.lineTo(-s * 0.05, 0); c.closePath(); to(c, "#e8792a", s, 0.012);
      c.restore();
    },
    vong: function (c, s, t) {
      var du = Math.sin(t * 1.6) * s * 0.03;
      [-0.44, 0.44].forEach(function (x) { chuNhat(c, s * x - s * 0.025, -s * 0.34, s * 0.05, s * 0.74, s * 0.01); to(c, M.nau, s); });
      c.beginPath(); c.moveTo(-s * 0.42, -s * 0.2); c.quadraticCurveTo(du, s * 0.3, s * 0.42, -s * 0.2);
      c.quadraticCurveTo(du, s * 0.18, -s * 0.42, -s * 0.2); to(c, M.son, s);
      c.beginPath(); c.moveTo(-s * 0.42, -s * 0.2); c.quadraticCurveTo(du, s * 0.3, s * 0.42, -s * 0.2); c.quadraticCurveTo(du, s * 0.18, -s * 0.42, -s * 0.2);
      vachKhac(c, s, -s * 0.42, -s * 0.2, s * 0.42, s * 0.3, s * 0.05);
      eli(c, du + s * 0.04, s * 0.06, s * 0.18, s * 0.06, 0.05); to(c, M.cham, s, 0.016);
      tron(c, du - s * 0.2, s * 0.0, s * 0.07); to(c, "#f1c27d", s, 0.016);
      duongNet(c, s, 0.01, null, [(du / s) - 0.23, 0.0, (du / s) - 0.2, 0.0]);
      for (var z = 0; z < 3; z += 1) {
        var y = -s * 0.12 - ((t * 0.5 + z / 3) % 1) * s * 0.3;
        c.fillStyle = "rgba(29,21,16," + (0.8 - ((t * 0.5 + z / 3) % 1) * 0.7) + ")"; c.font = "700 " + Math.round(s * (0.06 + z * 0.02)) + "px Georgia, serif";
        c.fillText("z", du - s * 0.16 + z * s * 0.06, y);
      }
    },
    buNhin: function (c, s, t) {
      var lac = Math.sin(t * 1.3) * 0.04;
      c.save(); c.rotate(lac);
      chuNhat(c, -s * 0.025, -s * 0.2, s * 0.05, s * 0.62, s * 0.01); to(c, M.nau, s);
      chuNhat(c, -s * 0.36, -s * 0.06, s * 0.72, s * 0.045, s * 0.01); to(c, M.nau, s);
      c.beginPath(); c.moveTo(-s * 0.2, -s * 0.06); c.lineTo(s * 0.2, -s * 0.06); c.lineTo(s * 0.16, s * 0.26); c.lineTo(-s * 0.16, s * 0.26); c.closePath(); to(c, M.cham, s);
      chuNhat(c, -s * 0.1, s * 0.04, s * 0.08, s * 0.08, 0); to(c, M.son, s, 0.012);
      [-0.38, 0.38].forEach(function (x) { for (var k = -1; k <= 1; k += 1) duongNet(c, s, 0.01, M.nghe, [x * 0.95, -0.04, x * 1.08, -0.04 + k * 0.05]); });
      tron(c, 0, -s * 0.22, s * 0.1); to(c, "#e8d29a", s);
      mat(c, s, -0.035, -0.23); mat(c, s, 0.035, -0.23);
      duongNet(c, s, 0.01, null, [-0.04, -0.18, 0.04, -0.18]);
      // Nón lá
      c.beginPath(); c.moveTo(-s * 0.24, -s * 0.28); c.lineTo(0, -s * 0.46); c.lineTo(s * 0.24, -s * 0.28); c.closePath(); to(c, "#e9d08c", s);
      [-0.12, 0, 0.12].forEach(function (x) { duongNet(c, s, 0.006, null, [0, -0.45, x * 1.6, -0.29]); });
      c.restore();
    },
    duaPhep: function (c, s, t) {
      c.save(); c.rotate(-0.6);
      chuNhat(c, -s * 0.03, -s * 0.36, s * 0.06, s * 0.7, s * 0.02); to(c, M.den, s);
      chuNhat(c, -s * 0.03, -s * 0.36, s * 0.06, s * 0.12, s * 0.02); to(c, M.trang, s, 0.014);
      c.restore();
      for (var k = 0; k < 5; k += 1) {
        var a = (k / 5) * HAI_PI + t * 0.8, r = s * (0.06 + 0.02 * Math.sin(t * 4 + k));
        sao(c, -s * 0.22 + Math.cos(a) * s * 0.16, -s * 0.28 + Math.sin(a) * s * 0.12, r, 5); to(c, k % 2 ? M.nghe : M.trang, s, 0.01);
      }
    },
    phongBi: function (c, s) {
      c.save(); c.rotate(-0.08);
      chuNhat(c, -s * 0.4, -s * 0.24, s * 0.8, s * 0.5, s * 0.02); to(c, M.trang, s);
      duongNet(c, s, 0.014, null, [-0.4, -0.24, 0, 0.06, 0.4, -0.24]);
      duongNet(c, s, 0.01, null, [-0.4, 0.26, -0.1, 0.02]); duongNet(c, s, 0.01, null, [0.4, 0.26, 0.1, 0.02]);
      chuNhat(c, s * 0.18, -s * 0.2, s * 0.16, s * 0.18, s * 0.01); to(c, M.son, s, 0.012);
      tron(c, s * 0.26, -s * 0.11, s * 0.04); c.fillStyle = M.nghe; c.fill();
      for (var k = 0; k < 3; k += 1) { c.beginPath(); c.moveTo(-s * 0.02, -s * (0.16 - k * 0.04)); c.quadraticCurveTo(s * 0.06, -s * (0.19 - k * 0.04), s * 0.14, -s * (0.16 - k * 0.04)); net(c, s, 0.006); c.stroke(); }
      c.restore();
    },
    xeDap: function (c, s, t) {
      [-0.26, 0.26].forEach(function (x) {
        tron(c, s * x, s * 0.16, s * 0.17); net(c, s, 0.024); c.stroke();
        for (var k = 0; k < 4; k += 1) { var a = -t * 3 + (k * Math.PI) / 4; duongNet(c, s, 0.006, M.xam, [x + Math.cos(a) * 0.16, 0.16 + Math.sin(a) * 0.16, x - Math.cos(a) * 0.16, 0.16 - Math.sin(a) * 0.16]); }
      });
      c.beginPath(); c.moveTo(-s * 0.26, s * 0.16); c.lineTo(-s * 0.06, -s * 0.06); c.lineTo(s * 0.2, -s * 0.06); c.lineTo(s * 0.26, s * 0.16);
      c.moveTo(-s * 0.06, -s * 0.06); c.lineTo(s * 0.02, s * 0.16); c.lineTo(s * 0.2, -s * 0.06);
      c.strokeStyle = M.den; c.lineWidth = s * 0.05; c.stroke(); c.strokeStyle = M.son; c.lineWidth = s * 0.03; c.stroke();
      duongNet(c, s, 0.024, null, [0.2, -0.06, 0.16, -0.2, 0.26, -0.22]);
      eli(c, -s * 0.08, -s * 0.1, s * 0.07, s * 0.025); to(c, M.den, s, 0.01);
      tron(c, s * 0.02, s * 0.16, s * 0.035); to(c, M.nghe, s, 0.012);
    },
    chenCham: function (c, s) {
      c.beginPath(); c.moveTo(-s * 0.34, -s * 0.02); c.quadraticCurveTo(-s * 0.3, s * 0.3, 0, s * 0.32); c.quadraticCurveTo(s * 0.3, s * 0.3, s * 0.34, -s * 0.02); c.closePath(); to(c, M.trang, s);
      c.beginPath(); c.moveTo(-s * 0.34, -s * 0.02); c.quadraticCurveTo(-s * 0.3, s * 0.3, 0, s * 0.32); c.quadraticCurveTo(s * 0.3, s * 0.3, s * 0.34, -s * 0.02); c.closePath();
      c.save(); c.clip(); c.strokeStyle = M.cham; c.lineWidth = s * 0.03;
      for (var k = 0; k < 4; k += 1) { c.beginPath(); c.arc(-s * 0.24 + k * s * 0.16, s * 0.1, s * 0.06, 0, Math.PI); c.stroke(); }
      c.restore();
      eli(c, 0, -s * 0.02, s * 0.34, s * 0.08); to(c, M.trang, s);
      eli(c, 0, -s * 0.01, s * 0.28, s * 0.055); to(c, "#c27a2c", s, 0.012);
      [[-0.1, -0.02], [0.04, -0.03], [0.14, 0.0], [-0.02, 0.01]].forEach(function (p) { tron(c, s * p[0], s * p[1], s * 0.02); to(c, M.son, s, 0.006); });
      duongNet(c, s, 0.022, M.nau, [0.1, -0.06, 0.44, -0.4]); duongNet(c, s, 0.022, M.nau, [0.16, -0.04, 0.48, -0.34]);
    },
    baNoi: function (c, s, t) {
      c.beginPath(); c.moveTo(-s * 0.3, s * 0.42); c.quadraticCurveTo(-s * 0.3, s * 0.1, 0, s * 0.08); c.quadraticCurveTo(s * 0.3, s * 0.1, s * 0.3, s * 0.42); c.closePath(); to(c, M.nau, s);
      duongNet(c, s, 0.012, null, [0, 0.1, 0, 0.42]);
      tron(c, 0, -s * 0.1, s * 0.17); to(c, "#f1c27d", s);
      // Tóc bạc, khăn vấn
      c.beginPath(); c.arc(0, -s * 0.12, s * 0.17, Math.PI * 1.05, Math.PI * 1.95); c.lineTo(s * 0.16, -s * 0.16); c.quadraticCurveTo(0, -s * 0.2, -s * 0.16, -s * 0.16); c.closePath(); to(c, "#e8e4dc", s, 0.014);
      eli(c, 0, -s * 0.3, s * 0.2, s * 0.06); to(c, M.son, s, 0.014);
      // Kính lão, nụ cười
      [-0.06, 0.06].forEach(function (x) { tron(c, s * x, -s * 0.1, s * 0.04); net(c, s, 0.01); c.stroke(); mat(c, s, x, -0.1); });
      duongNet(c, s, 0.01, null, [-0.02, -0.1, 0.02, -0.1]);
      c.beginPath(); c.arc(0, -s * 0.02, s * 0.06, 0.2, Math.PI - 0.2); net(c, s, 0.01); c.stroke();
      eli(c, -s * 0.11, -s * 0.03, s * 0.03, s * 0.018); c.fillStyle = "rgba(200,53,43,0.35)"; c.fill();
      eli(c, s * 0.11, -s * 0.03, s * 0.03, s * 0.018); c.fill();
    },
    truMua: function (c, s, t) {
      for (var k = 0; k < 9; k += 1) {
        var x = -s * 0.44 + k * s * 0.11, y = -s * 0.46 + (((t * 0.9 + k * 0.37) % 1) * s * 0.9);
        if (Math.abs(x) < s * 0.32 && y > -s * 0.2) continue; // dưới ô không có mưa
        duongNet(c, s, 0.01, "#4d7cc4", [x / s, y / s, x / s - 0.02, y / s + 0.07]);
      }
      c.beginPath(); c.moveTo(-s * 0.36, -s * 0.12); c.quadraticCurveTo(0, -s * 0.56, s * 0.36, -s * 0.12);
      for (var n = 0; n < 4; n += 1) c.quadraticCurveTo(s * (0.27 - n * 0.18), -s * 0.18, s * (0.18 - n * 0.18), -s * 0.12);
      c.closePath(); to(c, M.cham, s); vachKhac(c, s, -s * 0.36, -s * 0.38, s * 0.36, -s * 0.12, s * 0.06);
      duongNet(c, s, 0.02, null, [0, -0.36, 0, 0.12, -0.05, 0.16]);
      tron(c, s * 0.08, s * 0.0, s * 0.07); to(c, "#f1c27d", s, 0.014);
      c.beginPath(); c.moveTo(-s * 0.02, s * 0.36); c.lineTo(s * 0.0, s * 0.08); c.lineTo(s * 0.16, s * 0.08); c.lineTo(s * 0.18, s * 0.36); c.closePath(); to(c, M.la, s, 0.016);
    },
    kinhLup: function (c, s, t) {
      c.save(); c.translate(Math.sin(t * 1.2) * s * 0.03, 0);
      c.save(); c.translate(s * 0.13, s * 0.13); c.rotate(-0.75); chuNhat(c, -s * 0.045, 0, s * 0.09, s * 0.34, s * 0.03); to(c, M.nau, s); c.restore();
      tron(c, -s * 0.06, -s * 0.06, s * 0.24); to(c, M.nghe, s);
      tron(c, -s * 0.06, -s * 0.06, s * 0.18); to(c, M.bang, s, 0.014);
      c.beginPath(); c.arc(-s * 0.06, -s * 0.06, s * 0.13, Math.PI * 1.1, Math.PI * 1.5); c.strokeStyle = "rgba(255,255,255,0.9)"; c.lineWidth = s * 0.03; c.stroke();
      c.restore();
    },
    ongBac: function (c, s) {
      c.beginPath(); c.moveTo(-s * 0.3, s * 0.42); c.quadraticCurveTo(-s * 0.3, s * 0.12, 0, s * 0.1); c.quadraticCurveTo(s * 0.3, s * 0.12, s * 0.3, s * 0.42); c.closePath(); to(c, M.den, s);
      duongNet(c, s, 0.012, M.nghe, [0.0, 0.12, 0.0, 0.42]);
      tron(c, 0, -s * 0.1, s * 0.16); to(c, "#f1c27d", s);
      // Râu bạc dài
      c.beginPath(); c.moveTo(-s * 0.1, -s * 0.02); c.quadraticCurveTo(-s * 0.08, s * 0.24, 0, s * 0.3); c.quadraticCurveTo(s * 0.08, s * 0.24, s * 0.1, -s * 0.02); c.quadraticCurveTo(0, s * 0.02, -s * 0.1, -s * 0.02); to(c, "#f3f0ea", s, 0.014);
      mat(c, s, -0.05, -0.12); mat(c, s, 0.05, -0.12);
      duongNet(c, s, 0.01, null, [-0.08, -0.17, -0.02, -0.16]); duongNet(c, s, 0.01, null, [0.08, -0.17, 0.02, -0.16]);
      // Khăn xếp
      eli(c, 0, -s * 0.24, s * 0.19, s * 0.08); to(c, M.cham, s);
      for (var k = 0; k < 3; k += 1) { c.beginPath(); c.ellipse(0, -s * (0.2 + k * 0.035), s * 0.18, s * 0.03, 0, Math.PI * 1.05, Math.PI * 1.95); net(c, s, 0.008); c.stroke(); }
    },
    quanSi: function (c, s) {
      eli(c, 0, s * 0.1, s * 0.34, s * 0.12); to(c, "#b07a3e", s);
      chuNhat(c, -s * 0.34, -s * 0.12, s * 0.68, s * 0.22, 0); c.fillStyle = "#b07a3e"; c.fill();
      duongNet(c, s, 0.02, null, [-0.34, -0.12, -0.34, 0.1]); duongNet(c, s, 0.02, null, [0.34, -0.12, 0.34, 0.1]);
      eli(c, 0, -s * 0.12, s * 0.34, s * 0.3 * 0.42); to(c, "#f3dfb3", s);
      eli(c, 0, -s * 0.12, s * 0.27, s * 0.1); net(c, s, 0.014); c.strokeStyle = M.son; c.stroke();
      // Chữ 士 (Sĩ) màu son
      c.save(); c.translate(0, -s * 0.12); c.scale(1, 0.42);
      c.strokeStyle = M.son; c.lineWidth = s * 0.03; c.lineCap = "round";
      c.beginPath(); c.moveTo(-s * 0.13, -s * 0.06); c.lineTo(s * 0.13, -s * 0.06); c.moveTo(0, -s * 0.16); c.lineTo(0, s * 0.14); c.moveTo(-s * 0.08, s * 0.14); c.lineTo(s * 0.08, s * 0.14); c.stroke();
      c.restore();
    },
    hoaHoi: function (c, s, t) {
      c.save(); c.rotate(t * 0.15);
      for (var k = 0; k < 8; k += 1) {
        c.save(); c.rotate((k / 8) * HAI_PI);
        c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(s * 0.09, -s * 0.16, 0, -s * 0.36); c.quadraticCurveTo(-s * 0.09, -s * 0.16, 0, 0); to(c, "#8a4b20", s, 0.014);
        eli(c, 0, -s * 0.2, s * 0.025, s * 0.045); c.fillStyle = "#e0b46a"; c.fill();
        c.restore();
      }
      tron(c, 0, 0, s * 0.05); to(c, "#5c2f12", s, 0.012);
      c.restore();
    },
    cuTa: function (c, s, t) {
      var nang = Math.sin(t * 2) * s * 0.03;
      c.save(); c.translate(0, nang);
      duongNet(c, s, 0.03, M.den, [-0.42, -0.3, 0.42, -0.3]);
      [-0.38, 0.38].forEach(function (x) { chuNhat(c, s * x - s * 0.04, -s * 0.42, s * 0.08, s * 0.24, s * 0.02); to(c, M.son, s, 0.014); });
      duongNet(c, s, 0.035, "#f1c27d", [-0.12, -0.3, -0.1, -0.08]); duongNet(c, s, 0.035, "#f1c27d", [0.12, -0.3, 0.1, -0.08]);
      c.restore();
      tron(c, 0, -s * 0.12, s * 0.08); to(c, "#f1c27d", s, 0.016);
      mat(c, s, -0.03, -0.13); mat(c, s, 0.03, -0.13);
      c.beginPath(); c.moveTo(-s * 0.12, -s * 0.04); c.lineTo(s * 0.12, -s * 0.04); c.lineTo(s * 0.08, s * 0.18); c.lineTo(-s * 0.08, s * 0.18); c.closePath(); to(c, M.cham, s);
      duongNet(c, s, 0.035, M.den, [-0.06, 0.18, -0.14, 0.42]); duongNet(c, s, 0.035, M.den, [0.06, 0.18, 0.14, 0.42]);
    },
    chuY: function (c, s) {
      c.beginPath(); c.moveTo(-s * 0.04, s * 0.42); c.lineTo(-s * 0.04, s * 0.02); c.lineTo(-s * 0.26, -s * 0.34); c.lineTo(-s * 0.18, -s * 0.38); c.lineTo(0, -s * 0.08);
      c.lineTo(s * 0.18, -s * 0.38); c.lineTo(s * 0.26, -s * 0.34); c.lineTo(s * 0.04, s * 0.02); c.lineTo(s * 0.04, s * 0.42); c.closePath(); to(c, M.nau, s);
      c.beginPath(); c.moveTo(-s * 0.04, s * 0.42); c.lineTo(-s * 0.04, s * 0.02); c.lineTo(-s * 0.26, -s * 0.34); c.lineTo(-s * 0.18, -s * 0.38); c.lineTo(0, -s * 0.08); c.lineTo(s * 0.18, -s * 0.38); c.lineTo(s * 0.26, -s * 0.34); c.lineTo(s * 0.04, s * 0.02); c.lineTo(s * 0.04, s * 0.42); c.closePath();
      vachKhac(c, s, -s * 0.26, -s * 0.38, s * 0.26, s * 0.42, s * 0.05);
      duongNet(c, s, 0.016, M.son, [-0.22, -0.34, -0.02, -0.08, 0.02, -0.08, 0.22, -0.34]);
    },
    khayTrung: function (c, s) {
      chuNhat(c, -s * 0.42, -s * 0.06, s * 0.84, s * 0.32, s * 0.04); to(c, "#c9b089", s);
      chuNhat(c, -s * 0.42, -s * 0.06, s * 0.84, s * 0.32, s * 0.04); vachKhac(c, s, -s * 0.42, -s * 0.06, s * 0.42, s * 0.26, s * 0.05);
      for (var h = 0; h < 2; h += 1) for (var k = 0; k < 6; k += 1) {
        eli(c, -s * 0.34 + k * s * 0.136, -s * 0.06 - h * s * 0.13, s * 0.055, s * 0.07); to(c, h ? "#f7e7c6" : "#f2dbb0", s, 0.012);
      }
    },
    mieng: function (c, s) {
      c.beginPath(); c.moveTo(-s * 0.38, 0); c.quadraticCurveTo(-s * 0.2, -s * 0.2, 0, -s * 0.1); c.quadraticCurveTo(s * 0.2, -s * 0.2, s * 0.38, 0);
      c.quadraticCurveTo(0, s * 0.36, -s * 0.38, 0); to(c, M.son, s);
      c.beginPath(); c.moveTo(-s * 0.28, -s * 0.02); c.quadraticCurveTo(0, s * 0.02, s * 0.28, -s * 0.02); c.quadraticCurveTo(0, s * 0.2, -s * 0.28, -s * 0.02); to(c, M.trang, s, 0.012);
      for (var k = -2; k <= 2; k += 1) duongNet(c, s, 0.008, null, [k * 0.09, 0.0, k * 0.09, 0.07]);
      eli(c, -s * 0.14, -s * 0.12, s * 0.06, s * 0.02, -0.3); c.fillStyle = "rgba(255,255,255,0.55)"; c.fill();
    },
    trangSach: function (c, s, t) {
      chuNhat(c, -s * 0.44, -s * 0.24, s * 0.88, s * 0.52, s * 0.03); to(c, M.cham, s);
      [-1, 1].forEach(function (d) {
        c.beginPath(); c.moveTo(0, -s * 0.2); c.quadraticCurveTo(d * s * 0.2, -s * 0.28, d * s * 0.4, -s * 0.22); c.lineTo(d * s * 0.4, s * 0.22);
        c.quadraticCurveTo(d * s * 0.2, s * 0.16, 0, s * 0.24); c.closePath(); to(c, M.trang, s);
        for (var k = 0; k < 5; k += 1) duongNet(c, s, 0.006, "rgba(29,21,16,0.55)", [d * 0.06, -0.12 + k * 0.07, d * 0.34, -0.14 + k * 0.07]);
      });
      var lat = (Math.sin(t * 1.4) + 1) / 2;
      c.beginPath(); c.moveTo(0, -s * 0.2); c.quadraticCurveTo(s * 0.12 * lat, -s * 0.3, s * 0.3 * lat, -s * 0.24); c.lineTo(s * 0.3 * lat, s * 0.2); c.quadraticCurveTo(s * 0.12 * lat, s * 0.14, 0, s * 0.24); c.closePath(); to(c, "#fffaf0", s, 0.012);
    },
  };

  Object.keys(HINH).forEach(function (k) { VT.HINH[k] = HINH[k]; });

  var CAU = {
    "tim-mach": ["traiTim", "luaMach"], "cap-cuu": ["bacCap", "phaoCuu"], "bang-ca": ["tangBang", "ca"],
    "ca-truc": ["ca", "trucThang"], "may-tho": ["banhRang", "conTho"], "nghi-bu": ["vong", "buNhin"],
    "nghi-phep": ["vong", "duaPhep"], "gui-xe": ["phongBi", "xeDap"], "cham-cong": ["chenCham", "cong"],
    "noi-tru": ["baNoi", "truMua"], "noi-soi": ["baNoi", "kinhLup"], "bac-si": ["ongBac", "quanSi"],
    "hoi-suc": ["hoaHoi", "cuTa"], "y-ta": ["chuY", "khayTrung"], "khau-trang": ["mieng", "trangSach"],
  };
  Object.keys(CAU).forEach(function (k) { VT.CAU[k] = CAU[k]; });
})(window);
