/* Vẽ nhân vật đua: vịt UMC, khinh khí cầu UMC, thuyền rồng Việt; vệt sóng, hạt bọt, vòng gợn.
 *
 * Mỗi nhân vật được vẽ MỘT LẦN vào canvas đệm (sprite) theo kích thước, tông màu, khung hình,
 * rồi mỗi khung hình chỉ drawImage lại. Nhờ vậy vẽ được chi tiết (biểu tượng UMC, vảy rồng, đội chèo)
 * mà 300+ nhân vật vẫn mượt. Biểu tượng UMC lấy từ window.UMC (js/chung/umc-logo.js). */
(function (root) {
  "use strict";

  var PHAN_GIAI = 2.6;      // sprite vẽ to hơn kích thước hiển thị để còn nét khi zoom và màn hình độ phân giải cao
  var SO_KHUNG_CHEO = 8;    // số khung hình nhịp chèo của thuyền rồng
  var XANH_UMC = "#2457a8", NGOC_UMC = "#4fc6f0";
  var boNho = new Map();

  function logoSan() { return root.UMC && root.UMC.san(root.UMC.lon); }

  /** Lấy sprite từ bộ nhớ hoặc vẽ mới. rong/cao/goc tính theo đơn vị s (kích thước nhân vật). */
  function laySprite(khoa, s, rong, cao, gocX, gocY, ve) {
    var k = khoa + "|" + Math.round(s) + "|" + (logoSan() ? 1 : 0);
    var c = boNho.get(k);
    if (c) return c;
    c = document.createElement("canvas");
    c.width = Math.ceil(rong * s * PHAN_GIAI); c.height = Math.ceil(cao * s * PHAN_GIAI);
    var g = c.getContext("2d");
    g.scale(PHAN_GIAI, PHAN_GIAI);
    g.translate(gocX * s, gocY * s);
    ve(g, s);
    c.meta = { rong: rong, cao: cao, gocX: gocX, gocY: gocY };
    if (boNho.size > 400) boNho.clear();
    boNho.set(k, c);
    return c;
  }

  function inSprite(ctx, c, x, y, s, nghieng) {
    var m = c.meta;
    ctx.save();
    ctx.translate(x, y);
    if (nghieng) ctx.rotate(nghieng);
    ctx.drawImage(c, -m.gocX * s, -m.gocY * s, m.rong * s, m.cao * s);
    ctx.restore();
  }

  /** Huy hiệu tròn trắng có biểu tượng UMC. */
  function huyHieu(g, x, y, r, vien) {
    g.save();
    g.fillStyle = "#ffffff";
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    g.lineWidth = Math.max(0.8, r * 0.14); g.strokeStyle = vien || XANH_UMC; g.stroke();
    if (logoSan()) {
      var a = r * 1.3;
      g.beginPath(); g.arc(x, y, r * 0.86, 0, Math.PI * 2); g.clip();
      g.drawImage(root.UMC.lon, x - a / 2, y - a / 2, a, a);
    }
    g.restore();
  }

  // ───────────────────────── Vịt UMC ─────────────────────────
  var TONG_VIT = [
    ["#ffe27a", "#f2b632"], ["#fff1b8", "#e9c46a"], ["#ffd166", "#e09f3e"],
    ["#f6f1e7", "#cdbfa6"], ["#ffc98b", "#e48f45"], ["#ffe9a3", "#d9a441"],
  ];

  function veVitVao(g, s, tong) {
    var mau = TONG_VIT[tong % TONG_VIT.length];
    g.fillStyle = "rgba(0,0,0,0.26)";
    g.beginPath(); g.ellipse(-s * 0.04, s * 0.36, s * 0.52, s * 0.1, 0, 0, Math.PI * 2); g.fill();
    var gr = g.createLinearGradient(0, -s * 0.2, 0, s * 0.38);
    gr.addColorStop(0, mau[0]); gr.addColorStop(1, mau[1]);
    g.fillStyle = gr;
    g.beginPath();
    g.moveTo(-s * 0.55, s * 0.02);
    g.quadraticCurveTo(-s * 0.62, -s * 0.2, -s * 0.38, -s * 0.12);
    g.quadraticCurveTo(-s * 0.05, -s * 0.06, s * 0.12, -s * 0.06);
    g.quadraticCurveTo(s * 0.45, -s * 0.02, s * 0.42, s * 0.14);
    g.quadraticCurveTo(s * 0.36, s * 0.36, 0, s * 0.36);
    g.quadraticCurveTo(-s * 0.48, s * 0.36, -s * 0.55, s * 0.02);
    g.fill();
    var gh = g.createRadialGradient(s * 0.22, -s * 0.42, s * 0.02, s * 0.26, -s * 0.32, s * 0.26);
    gh.addColorStop(0, mau[0]); gh.addColorStop(1, mau[1]);
    g.fillStyle = gh; g.beginPath(); g.arc(s * 0.26, -s * 0.3, s * 0.21, 0, Math.PI * 2); g.fill();
    // Khăn quàng xanh UMC ở cổ, đuôi khăn bay về sau
    g.fillStyle = XANH_UMC;
    g.beginPath(); g.ellipse(s * 0.2, -s * 0.1, s * 0.17, s * 0.055, -0.25, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.moveTo(s * 0.08, -s * 0.1); g.quadraticCurveTo(-s * 0.06, -s * 0.12, -s * 0.12, -s * 0.2);
    g.lineTo(-s * 0.04, -s * 0.06); g.closePath(); g.fill();
    g.fillStyle = NGOC_UMC; g.fillRect(s * 0.06, -s * 0.115, s * 0.26, s * 0.018);
    // Mỏ
    g.fillStyle = "#ff8a1f";
    g.beginPath(); g.moveTo(s * 0.42, -s * 0.33); g.quadraticCurveTo(s * 0.66, -s * 0.31, s * 0.62, -s * 0.22);
    g.quadraticCurveTo(s * 0.52, -s * 0.17, s * 0.42, -s * 0.2); g.closePath(); g.fill();
    // Ánh sáng lưng
    g.fillStyle = "rgba(255,255,255,0.45)";
    g.beginPath(); g.ellipse(-s * 0.3, -s * 0.06, s * 0.13, s * 0.035, -0.1, 0, Math.PI * 2); g.fill();
    // Mắt
    g.fillStyle = "#111"; g.beginPath(); g.arc(s * 0.32, -s * 0.36, s * 0.04, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#fff"; g.beginPath(); g.arc(s * 0.335, -s * 0.375, s * 0.013, 0, Math.PI * 2); g.fill();
    // Huy hiệu UMC trên cánh
    huyHieu(g, -s * 0.16, s * 0.14, s * 0.125);
  }

  function veVit(ctx, x, y, s, tong, nghieng) {
    var c = laySprite("vit|" + (tong % TONG_VIT.length), s, 1.4, 1.0, 0.68, 0.55, function (g, ss) { veVitVao(g, ss, tong); });
    inSprite(ctx, c, x, y, s, nghieng);
  }

  // ───────────────────────── Khinh khí cầu UMC ─────────────────────────
  // Múi xen kẽ xanh UMC – trắng, thêm một màu nhấn riêng từng quả để phân biệt trong đàn.
  var NHAN_CAU = ["#4fc6f0", "#d4ff3a", "#f59e0b", "#ef4444", "#10b981", "#a78bfa"];
  var MAU_MUI = ["x", "t", "n", "x", "t", "x", "n", "t", "x"]; // x: xanh UMC, t: trắng (múi giữa mang huy hiệu), n: màu nhấn

  function duongVoCau(g, s) {
    g.beginPath();
    g.moveTo(-s * 0.1, s * 0.08);
    g.bezierCurveTo(-s * 0.3, -s * 0.05, -s * 0.42, -s * 0.2, -s * 0.4, -s * 0.42);
    g.bezierCurveTo(-s * 0.38, -s * 0.68, -s * 0.2, -s * 0.8, 0, -s * 0.8);
    g.bezierCurveTo(s * 0.2, -s * 0.8, s * 0.38, -s * 0.68, s * 0.4, -s * 0.42);
    g.bezierCurveTo(s * 0.42, -s * 0.2, s * 0.3, -s * 0.05, s * 0.1, s * 0.08);
    g.closePath();
  }

  function veCauVao(g, s, tong) {
    var nhan = NHAN_CAU[tong % NHAN_CAU.length];
    // Dây và giỏ mây
    g.strokeStyle = "rgba(60,40,20,0.75)"; g.lineWidth = Math.max(0.7, s * 0.012);
    g.beginPath();
    g.moveTo(-s * 0.1, s * 0.08); g.lineTo(-s * 0.08, s * 0.26);
    g.moveTo(s * 0.1, s * 0.08); g.lineTo(s * 0.08, s * 0.26);
    g.moveTo(-s * 0.03, s * 0.09); g.lineTo(-s * 0.03, s * 0.26);
    g.moveTo(s * 0.03, s * 0.09); g.lineTo(s * 0.03, s * 0.26);
    g.stroke();
    var gr = g.createLinearGradient(0, s * 0.26, 0, s * 0.4);
    gr.addColorStop(0, "#b7793b"); gr.addColorStop(1, "#7c4a1e");
    g.fillStyle = gr;
    g.beginPath(); g.moveTo(-s * 0.1, s * 0.26); g.lineTo(s * 0.1, s * 0.26); g.lineTo(s * 0.085, s * 0.4); g.lineTo(-s * 0.085, s * 0.4); g.closePath(); g.fill();
    g.strokeStyle = "rgba(60,30,10,0.45)"; g.lineWidth = Math.max(0.5, s * 0.008);
    for (var k = 1; k < 4; k += 1) { g.beginPath(); g.moveTo(-s * 0.095, s * (0.26 + k * 0.035)); g.lineTo(s * 0.095, s * (0.26 + k * 0.035)); g.stroke(); }
    g.fillStyle = "#5b3410"; g.fillRect(-s * 0.11, s * 0.25, s * 0.22, s * 0.025);

    // Vỏ cầu: các múi dọc thu hẹp về hai mép như mặt cầu
    g.save();
    duongVoCau(g, s); g.clip();
    var MUI = 9;
    for (var i = 0; i < MUI; i += 1) {
      var a0 = -Math.PI / 2 + (i / MUI) * Math.PI, a1 = -Math.PI / 2 + ((i + 1) / MUI) * Math.PI;
      var x0 = Math.sin(a0) * s * 0.42, x1 = Math.sin(a1) * s * 0.42;
      g.fillStyle = MAU_MUI[i] === "x" ? XANH_UMC : MAU_MUI[i] === "n" ? nhan : "#ffffff";
      g.fillRect(x0, -s * 0.85, x1 - x0 + 0.5, s);
    }
    // Đổ bóng khối: sáng trên trái, tối mép phải
    var sang = g.createRadialGradient(-s * 0.16, -s * 0.56, s * 0.02, 0, -s * 0.4, s * 0.5);
    sang.addColorStop(0, "rgba(255,255,255,0.55)"); sang.addColorStop(0.45, "rgba(255,255,255,0)");
    sang.addColorStop(1, "rgba(10,25,60,0.38)");
    g.fillStyle = sang; g.fillRect(-s * 0.45, -s * 0.85, s * 0.9, s);
    // Viền dải ngang ở cổ cầu
    g.fillStyle = XANH_UMC; g.fillRect(-s * 0.4, -s * 0.04, s * 0.8, s * 0.05);
    g.fillStyle = nhan; g.fillRect(-s * 0.4, -s * 0.06, s * 0.8, s * 0.018);
    g.restore();
    // Huy hiệu UMC lớn giữa thân cầu
    huyHieu(g, 0, -s * 0.44, s * 0.17);
  }

  function veKhinhKhiCau(ctx, x, y, s, tong, nghieng, dangBut) {
    var c = laySprite("cau|" + (tong % NHAN_CAU.length), s, 1.0, 1.35, 0.5, 0.88, function (g, ss) { veCauVao(g, ss, tong); });
    inSprite(ctx, c, x, y, s, nghieng * 0.6);
    // Ngọn lửa đốt: vẽ động, chập chờn khi bứt tốc
    if (dangBut) {
      var cao = s * (0.14 + Math.random() * 0.06);
      ctx.save(); ctx.translate(x, y); ctx.rotate(nghieng * 0.6);
      var gl = ctx.createRadialGradient(0, s * 0.2, 0, 0, s * 0.2, cao * 0.9);
      gl.addColorStop(0, "rgba(255,255,220,0.95)"); gl.addColorStop(0.4, "rgba(255,170,40,0.85)"); gl.addColorStop(1, "rgba(255,80,0,0)");
      ctx.fillStyle = gl;
      ctx.beginPath(); ctx.ellipse(0, s * 0.19, s * 0.035, cao * 0.55, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  }

  // ───────────────────────── Thuyền rồng Việt ─────────────────────────
  // Thân sơn mài (đỏ son, xanh UMC, ngọc, đen then) viền vàng, vảy rồng; đầu rồng phong cách Lý–Trần
  // (thân uốn chữ S, bờm lửa, sừng, râu); đuôi xoắn; đội chèo áo xanh UMC khăn đỏ; tay trống; cờ UMC ở đuôi.
  var TONG_THUYEN = [
    ["#c81e1e", "#7a1010"], ["#2457a8", "#122d5e"], ["#0f766e", "#073b36"],
    ["#1f1a17", "#000000"], ["#b45309", "#6b2c06"], ["#9f1239", "#4c0519"],
  ];
  var VANG = "#f2c14e", VANG_DAM = "#b8860b", DO_SON = "#d62828";

  function duongThan(g, s) {
    g.beginPath();
    g.moveTo(-s * 0.86, -s * 0.08);
    g.quadraticCurveTo(-s * 0.7, s * 0.02, -s * 0.5, s * 0.06);
    g.lineTo(s * 0.48, s * 0.06);
    g.quadraticCurveTo(s * 0.66, s * 0.04, s * 0.78, -s * 0.04);
    g.quadraticCurveTo(s * 0.66, s * 0.22, s * 0.36, s * 0.27);
    g.lineTo(-s * 0.42, s * 0.27);
    g.quadraticCurveTo(-s * 0.72, s * 0.22, -s * 0.86, -s * 0.08);
    g.closePath();
  }

  function veDauRong(g, s) {
    // Cổ uốn chữ S vươn lên từ mũi thuyền
    g.lineCap = "round"; g.lineJoin = "round";
    g.strokeStyle = VANG_DAM; g.lineWidth = s * 0.11;
    g.beginPath(); g.moveTo(s * 0.7, s * 0.0); g.bezierCurveTo(s * 0.86, -s * 0.06, s * 0.7, -s * 0.28, s * 0.86, -s * 0.38); g.stroke();
    g.strokeStyle = VANG; g.lineWidth = s * 0.075;
    g.beginPath(); g.moveTo(s * 0.7, s * 0.0); g.bezierCurveTo(s * 0.86, -s * 0.06, s * 0.7, -s * 0.28, s * 0.86, -s * 0.38); g.stroke();
    // Vảy trên cổ
    g.fillStyle = DO_SON;
    [[0.78, -0.08], [0.77, -0.18], [0.8, -0.28]].forEach(function (p) { g.beginPath(); g.arc(s * p[0], s * p[1], s * 0.018, 0, Math.PI * 2); g.fill(); });
    // Bờm lửa sau gáy
    g.fillStyle = DO_SON;
    [[0.78, -0.42, -0.9], [0.76, -0.36, -1.3], [0.75, -0.3, -1.7]].forEach(function (p) {
      g.save(); g.translate(s * p[0], s * p[1]); g.rotate(p[2]);
      g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(s * 0.1, -s * 0.02, s * 0.13, -s * 0.09); g.quadraticCurveTo(s * 0.06, -s * 0.03, 0, s * 0.03); g.fill();
      g.restore();
    });
    // Đầu: mõm dài, hàm há
    var gh = g.createLinearGradient(s * 0.82, -s * 0.5, s * 1.04, -s * 0.36);
    gh.addColorStop(0, "#ffe08a"); gh.addColorStop(1, VANG_DAM);
    g.fillStyle = gh;
    g.beginPath();
    g.moveTo(s * 0.8, -s * 0.45);
    g.quadraticCurveTo(s * 0.9, -s * 0.52, s * 1.02, -s * 0.47);   // trán → mõm trên
    g.lineTo(s * 1.05, -s * 0.42);
    g.lineTo(s * 0.94, -s * 0.41);                                  // miệng há
    g.lineTo(s * 1.02, -s * 0.36);                                  // hàm dưới
    g.quadraticCurveTo(s * 0.9, -s * 0.31, s * 0.82, -s * 0.34);
    g.closePath(); g.fill();
    g.strokeStyle = VANG_DAM; g.lineWidth = Math.max(0.6, s * 0.01); g.stroke();
    // Sừng nhánh
    g.strokeStyle = VANG_DAM; g.lineWidth = s * 0.022;
    g.beginPath(); g.moveTo(s * 0.86, -s * 0.48); g.quadraticCurveTo(s * 0.8, -s * 0.6, s * 0.72, -s * 0.62); g.stroke();
    g.beginPath(); g.moveTo(s * 0.81, -s * 0.57); g.lineTo(s * 0.84, -s * 0.63); g.stroke();
    // Râu rồng uốn
    g.strokeStyle = DO_SON; g.lineWidth = s * 0.014;
    g.beginPath(); g.moveTo(s * 1.0, -s * 0.44); g.bezierCurveTo(s * 1.1, -s * 0.5, s * 1.08, -s * 0.6, s * 1.14, -s * 0.62); g.stroke();
    // Mắt
    g.fillStyle = "#ffffff"; g.beginPath(); g.arc(s * 0.9, -s * 0.45, s * 0.026, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#111"; g.beginPath(); g.arc(s * 0.905, -s * 0.45, s * 0.013, 0, Math.PI * 2); g.fill();
    // Ngọc trước miệng
    var gn = g.createRadialGradient(s * 1.08, -s * 0.4, 0, s * 1.08, -s * 0.4, s * 0.04);
    gn.addColorStop(0, "#fff7d6"); gn.addColorStop(1, DO_SON);
    g.fillStyle = gn; g.beginPath(); g.arc(s * 1.08, -s * 0.39, s * 0.032, 0, Math.PI * 2); g.fill();
  }

  function veDuoiRong(g, s) {
    g.lineCap = "round";
    g.strokeStyle = VANG_DAM; g.lineWidth = s * 0.08;
    g.beginPath(); g.moveTo(-s * 0.82, -s * 0.06); g.bezierCurveTo(-s * 0.98, -s * 0.18, -s * 0.9, -s * 0.36, -s * 1.0, -s * 0.44); g.stroke();
    g.strokeStyle = VANG; g.lineWidth = s * 0.05;
    g.beginPath(); g.moveTo(-s * 0.82, -s * 0.06); g.bezierCurveTo(-s * 0.98, -s * 0.18, -s * 0.9, -s * 0.36, -s * 1.0, -s * 0.44); g.stroke();
    // Vây đuôi hình ngọn lửa
    g.fillStyle = DO_SON;
    g.beginPath(); g.moveTo(-s * 1.0, -s * 0.44);
    g.quadraticCurveTo(-s * 1.12, -s * 0.5, -s * 1.08, -s * 0.62);
    g.quadraticCurveTo(-s * 1.0, -s * 0.54, -s * 0.94, -s * 0.6);
    g.quadraticCurveTo(-s * 0.94, -s * 0.5, -s * 1.0, -s * 0.44); g.fill();
  }

  /** Mái chèo: vẽ SAU thân thuyền để thấy cán chèo vắt qua mạn và lưỡi chèo nhúng nước. */
  function veMaiCheo(g, s, x, pha) {
    var goc = 0.5 + Math.sin(pha) * 0.55;
    var vaiX = x + s * 0.02, vaiY = -s * 0.05;
    var dx = Math.sin(goc) * s * 0.42, dy = Math.cos(goc) * s * 0.42;
    g.strokeStyle = "#8a5a2b"; g.lineWidth = s * 0.02; g.lineCap = "round";
    g.beginPath(); g.moveTo(vaiX + dx * 0.12, vaiY - dy * 0.12); g.lineTo(vaiX - dx, vaiY + dy); g.stroke();
    g.fillStyle = VANG;
    g.save(); g.translate(vaiX - dx, vaiY + dy); g.rotate(-goc);
    g.beginPath(); g.ellipse(0, 0, s * 0.026, s * 0.06, 0, 0, Math.PI * 2); g.fill(); g.restore();
  }

  function veNguoiCheo(g, s, x, pha, laTrong) {
    // Thân áo xanh UMC
    g.fillStyle = XANH_UMC;
    g.save(); g.translate(x, s * 0.03); g.rotate(laTrong ? 0 : -0.25 + Math.sin(pha) * 0.2);
    g.beginPath(); g.ellipse(0, -s * 0.06, s * 0.045, s * 0.07, 0, 0, Math.PI * 2); g.fill();
    // Đầu, khăn đỏ
    g.fillStyle = "#f1c27d"; g.beginPath(); g.arc(0, -s * 0.15, s * 0.035, 0, Math.PI * 2); g.fill();
    g.fillStyle = DO_SON; g.fillRect(-s * 0.036, -s * 0.172, s * 0.072, s * 0.016);
    g.restore();
  }

  function veThuyenVao(g, s, tong, khung) {
    var mau = TONG_THUYEN[tong % TONG_THUYEN.length];
    var pha = (khung / SO_KHUNG_CHEO) * Math.PI * 2;
    // Bóng nước
    g.fillStyle = "rgba(0,30,25,0.25)";
    g.beginPath(); g.ellipse(-s * 0.04, s * 0.3, s * 0.88, s * 0.08, 0, 0, Math.PI * 2); g.fill();
    veDuoiRong(g, s);
    // Tay trống và trống đồng ở đuôi
    var go = Math.sin(pha * 2) * 0.5;
    g.fillStyle = XANH_UMC;
    g.beginPath(); g.ellipse(-s * 0.68, -s * 0.06, s * 0.045, s * 0.075, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#f1c27d"; g.beginPath(); g.arc(-s * 0.68, -s * 0.16, s * 0.035, 0, Math.PI * 2); g.fill();
    g.fillStyle = DO_SON; g.fillRect(-s * 0.716, -s * 0.182, s * 0.072, s * 0.016);
    g.strokeStyle = "#7c4a1e"; g.lineWidth = s * 0.016; g.lineCap = "round";
    g.beginPath(); g.moveTo(-s * 0.65, -s * 0.09); g.lineTo(-s * 0.58 + go * s * 0.04, -s * 0.2 + go * s * 0.08); g.stroke();
    var gt = g.createLinearGradient(0, -s * 0.12, 0, s * 0.02);
    gt.addColorStop(0, "#e85d3a"); gt.addColorStop(1, "#8a1c0e");
    g.fillStyle = gt; g.beginPath(); g.ellipse(-s * 0.55, -s * 0.04, s * 0.06, s * 0.07, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = VANG; g.beginPath(); g.ellipse(-s * 0.55, -s * 0.105, s * 0.06, s * 0.016, 0, 0, Math.PI * 2); g.fill();
    // Cờ UMC phấp phới ở đuôi
    g.strokeStyle = "#5b3410"; g.lineWidth = s * 0.012;
    g.beginPath(); g.moveTo(-s * 0.8, -s * 0.04); g.lineTo(-s * 0.8, -s * 0.62); g.stroke();
    var song = Math.sin(pha) * s * 0.025;
    g.fillStyle = "#ffffff";
    g.beginPath(); g.moveTo(-s * 0.8, -s * 0.62);
    g.quadraticCurveTo(-s * 0.68, -s * 0.64 + song, -s * 0.56, -s * 0.6);
    g.lineTo(-s * 0.56, -s * 0.42);
    g.quadraticCurveTo(-s * 0.68, -s * 0.44 - song, -s * 0.8, -s * 0.42); g.closePath(); g.fill();
    g.strokeStyle = XANH_UMC; g.lineWidth = Math.max(0.6, s * 0.01); g.stroke();
    if (logoSan()) g.drawImage(root.UMC.lon, -s * 0.74, -s * 0.6, s * 0.14, s * 0.14);
    // Đội chèo (sau thân thuyền nên vẽ trước mạn)
    for (var i = 0; i < 6; i += 1) veNguoiCheo(g, s, -s * 0.38 + i * s * 0.15, pha, false);
    // Thân sơn mài
    duongThan(g, s);
    var gth = g.createLinearGradient(0, s * 0.0, 0, s * 0.27);
    gth.addColorStop(0, mau[0]); gth.addColorStop(1, mau[1]);
    g.fillStyle = gth; g.fill();
    // Vảy rồng vàng trên mạn
    g.save(); duongThan(g, s); g.clip();
    g.strokeStyle = "rgba(242,193,78,0.55)"; g.lineWidth = Math.max(0.6, s * 0.012);
    for (var hang = 0; hang < 2; hang += 1) {
      for (var vx = -s * 0.8 + hang * s * 0.04; vx < s * 0.72; vx += s * 0.08) {
        g.beginPath(); g.arc(vx, s * (0.13 + hang * 0.06), s * 0.04, 0, Math.PI); g.stroke();
      }
    }
    g.restore();
    // Viền mạn vàng
    g.strokeStyle = VANG; g.lineWidth = s * 0.03; g.lineCap = "round";
    g.beginPath(); g.moveTo(-s * 0.84, -s * 0.06); g.quadraticCurveTo(-s * 0.7, s * 0.04, -s * 0.5, s * 0.07); g.lineTo(s * 0.48, s * 0.07); g.quadraticCurveTo(s * 0.66, s * 0.05, s * 0.76, -s * 0.03); g.stroke();
    // Huy hiệu UMC ở mũi thuyền
    huyHieu(g, s * 0.52, s * 0.15, s * 0.07, VANG);
    for (var m = 0; m < 6; m += 1) veMaiCheo(g, s, -s * 0.38 + m * s * 0.15, pha);
    veDauRong(g, s);
  }

  function veThuyenRong(ctx, x, y, s, tong, t, dangBut) {
    var nhip = (dangBut ? 3.2 : 1.9) * t + tong * 0.37;
    var khung = Math.floor(((nhip % 1) + 1) % 1 * SO_KHUNG_CHEO);
    var c = laySprite("thuyen|" + (tong % TONG_THUYEN.length) + "|" + khung, s, 2.32, 1.15, 1.16, 0.78, function (g, ss) { veThuyenVao(g, ss, tong, khung); });
    inSprite(ctx, c, x, y, s, 0);
  }

  // ───────────────────────── Vệt sóng, hạt ─────────────────────────
  /** Vệt sóng hình chữ V phía sau, dài theo tốc độ. */
  function veVetSong(ctx, x, y, s, tocDo) {
    var dai = s * (0.8 + Math.min(2.2, tocDo * 1.4));
    var g = ctx.createLinearGradient(x - s * 0.4, 0, x - s * 0.4 - dai, 0);
    g.addColorStop(0, "rgba(220,245,255,0.55)"); g.addColorStop(1, "rgba(220,245,255,0)");
    ctx.strokeStyle = g; ctx.lineWidth = Math.max(1.5, s * 0.05); ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x - s * 0.35, y + s * 0.2); ctx.quadraticCurveTo(x - s * 0.4 - dai * 0.5, y + s * 0.22, x - s * 0.4 - dai, y + s * 0.02);
    ctx.moveTo(x - s * 0.35, y + s * 0.3); ctx.quadraticCurveTo(x - s * 0.4 - dai * 0.5, y + s * 0.42, x - s * 0.4 - dai, y + s * 0.6);
    ctx.stroke();
  }

  /** Hệ hạt: bọt nước khi bứt tốc, vòng gợn khi chững lại hoặc rơi vào xoáy. */
  function taoHat() {
    var hat = [];
    return {
      bot: function (x, y, s, so) {
        for (var i = 0; i < so; i += 1) hat.push({ loai: "bot", x: x - s * 0.4, y: y + s * 0.2, vx: -(1 + Math.random() * 2.5) * s * 0.06, vy: -(0.5 + Math.random() * 1.8) * s * 0.06, song: 0, tho: 0.55 + Math.random() * 0.35, r: 1.5 + Math.random() * s * 0.05 });
      },
      gon: function (x, y, s, mau) { hat.push({ loai: "gon", x: x, y: y + s * 0.3, song: 0, tho: 0.9, r: s * 0.3, mau: mau }); },
      capNhatVaVe: function (ctx, dt) {
        var con = [];
        for (var i = 0; i < hat.length; i += 1) {
          var h = hat[i];
          h.song += dt;
          if (h.song >= h.tho) continue;
          var a = 1 - h.song / h.tho;
          if (h.loai === "bot") {
            h.x += h.vx * dt * 60; h.y += h.vy * dt * 60; h.vy += 0.35 * dt * 60;
            ctx.fillStyle = "rgba(235,250,255," + (0.85 * a) + ")"; ctx.beginPath(); ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2); ctx.fill();
          } else {
            ctx.strokeStyle = "rgba(" + h.mau + "," + (0.7 * a) + ")"; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.ellipse(h.x, h.y, h.r * (1 + h.song * 2.2), h.r * 0.35 * (1 + h.song * 2.2), 0, 0, Math.PI * 2); ctx.stroke();
          }
          con.push(h);
        }
        hat = con.length > 1500 ? con.slice(-1500) : con;
      },
      xoa: function () { hat = []; },
    };
  }

  root.VeVit = { veVit: veVit, veKhinhKhiCau: veKhinhKhiCau, veThuyenRong: veThuyenRong, veVetSong: veVetSong, taoHat: taoHat };
})(window);
