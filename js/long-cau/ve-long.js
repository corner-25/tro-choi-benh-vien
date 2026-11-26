/* Lồng cầu đồng quay tay – kiểu lồng xổ số kiến thiết Việt Nam, dựng 3D trên Canvas 2D.
 *
 * Lồng cầu: khung nan đồng xoay quanh trục ngang (kinh tuyến xoay thật theo góc quay, vĩ tuyến cố định),
 * tay quay bên phải, hai cột đỡ, bệ sơn mài xanh viền vàng có huy hiệu UMC.
 * Quả cầu: va chạm 2D trong lòng lồng; nan lồng kéo quả cầu lên theo chiều quay rồi rơi xuống, quay càng nhanh càng đảo.
 * Hiệu ứng: tia sáng sau lồng, đốm sáng bokeh bay lên, vệt mờ chuyển động, cửa lồng mở, quả cầu rơi theo ống
 * kính vào chén vàng, rồi bay lên phóng to thành "quả cầu ánh sáng" mang mã trúng, kèm vòng sóng và tia lóe.
 *
 * Giữ nguyên giao diện lập trình cũ: tao(canvas, amThanh) → { napDanhSach, bocToi, dangBoc, dung }.
 * Pha báo về qua onPha: "thoi" (quay lồng) → "hut-hut" (suýt rơi, chỉ khi bật cao trào) → "hut" (cửa mở) → "xong". */
(function (root) {
  "use strict";

  var HAI_PI = Math.PI * 2;
  var SO_BONG_TOI_DA = 46;
  var MAU_CAU = ["#0b4fd6", "#e53935", "#0f9d8a", "#f59e0b", "#7c3aed", "#0284c7", "#65a30d", "#db2777"];
  var MAU_CAU_VANG = ["#d4a017", "#c48a12", "#e0b13a", "#b8860b"];
  var TG_QUAY = 2600, TG_SUYT = 1500, TG_RA = 2600;
  var NGHIENG = 0.38; // nhìn lồng hơi từ trên xuống

  function giamChuyenDong() {
    return Boolean(root.matchMedia && root.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }
  function eio(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function eo(t) { return 1 - Math.pow(1 - t, 3); }
  function kep(x) { return Math.max(0, Math.min(1, x)); }

  function tao(canvas, amThanh) {
    var ctx = canvas.getContext("2d");
    var W = 520, u = 5.2;
    var bong = [], bokeh = [], tiaLoe = [], vongSong = [];
    var giaiDoan = "nghi", moc = 0, maTrung = "", cheDoCaoTrao = false, cheDoCauVang = false;
    var onPhaCb = null, onXongBoc = null;
    var gocLong = 0, omega = 0.5, gocTia = 0, sangTia = 0.35;
    var bongChon = null, bongSuyt = null, cuaMo = 0;
    var anhHung = null; // quả cầu trúng phóng to: { mau, ma, x, y, r, tuoi }
    var raf = 0, tTruoc = performance.now(), dangHien = false, tickQuay = 0;
    var daBaoSuyt = false, daBaoRa = false, daBaoCham = false, daBaoXong = false;

    function goi(ten) {
      if (!amThanh || typeof amThanh[ten] !== "function") return;
      try { amThanh[ten].apply(amThanh, Array.prototype.slice.call(arguments, 1)); } catch (e) { /* âm thanh lỗi không chặn hình */ }
    }
    function baoPha(pha) { if (typeof onPhaCb === "function") { try { onPhaCb(pha); } catch (e) { /* bỏ qua lỗi callback */ } } }

    function kichThuoc() {
      var dpr = Math.min(root.devicePixelRatio || 1, 2);
      var w = canvas.clientWidth || 520, h = canvas.clientHeight || 520;
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      W = Math.min(w, h); u = W / 100;
      ctx.translate((w - W) / 2, (h - W) / 2);
    }

    function tam() { return { x: 50 * u, y: 40 * u, R: 27 * u }; }
    function banKinhBong() { return 27 * u * 0.088; }

    // ───────── Quả cầu và va chạm ─────────
    function taoBong(dsMa, cauVang) {
      var t = tam();
      var ds = dsMa.slice();
      for (var i = ds.length - 1; i > 0; i -= 1) { var j = Math.floor(Math.random() * (i + 1)); var tg = ds[i]; ds[i] = ds[j]; ds[j] = tg; }
      ds = ds.slice(0, SO_BONG_TOI_DA);
      var mau = cauVang ? MAU_CAU_VANG : MAU_CAU;
      bong = ds.map(function (ma, k) {
        var a = Math.random() * HAI_PI, d = Math.random() * t.R * 0.6;
        return { ma: String(ma), mau: mau[k % mau.length], x: t.x + Math.cos(a) * d, y: t.y + t.R * 0.3 + Math.sin(a) * d * 0.4, vx: 0, vy: 0, vet: [], kichBan: null };
      });
    }

    function vatLy(dt) {
      var t = tam(), r = banKinhBong(), Rt = t.R * 0.9 - r;
      var g = 160 * u;
      var cacBong = bong.filter(function (b) { return !b.kichBan && !b.anDi; });
      for (var i = 0; i < cacBong.length; i += 1) {
        var b = cacBong[i];
        b.vy += g * dt;
        if (omega > 3 && Math.random() < 0.02) { b.vx += (Math.random() - 0.5) * 60 * u; b.vy -= Math.random() * 40 * u; }
        b.x += b.vx * dt; b.y += b.vy * dt;
        var dx = b.x - t.x, dy = b.y - t.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
        if (d > Rt) {
          var nx = dx / d, ny = dy / d;
          b.x = t.x + nx * Rt; b.y = t.y + ny * Rt;
          var vn = b.vx * nx + b.vy * ny;
          var tx = -ny, ty = nx;
          var vt = b.vx * tx + b.vy * ty;
          if (vn > 0) vn = -vn * 0.45;
          vt += (omega * Rt - vt) * Math.min(1, 6 * dt) * 0.55; // nan lồng kéo quả cầu theo chiều quay
          b.vx = vn * nx + vt * tx; b.vy = vn * ny + vt * ty;
        }
      }
      var hai = 2 * r;
      for (var a = 0; a < cacBong.length; a += 1) {
        for (var c = a + 1; c < cacBong.length; c += 1) {
          var p = cacBong[a], q = cacBong[c];
          var ex = q.x - p.x, ey = q.y - p.y, dd = ex * ex + ey * ey;
          if (dd >= hai * hai || dd === 0) continue;
          var dl = Math.sqrt(dd), nx2 = ex / dl, ny2 = ey / dl, chong = (hai - dl) / 2;
          p.x -= nx2 * chong; p.y -= ny2 * chong; q.x += nx2 * chong; q.y += ny2 * chong;
          var vr = (q.vx - p.vx) * nx2 + (q.vy - p.vy) * ny2;
          if (vr < 0) { var j2 = -vr * 0.8; p.vx -= j2 * nx2; p.vy -= j2 * ny2; q.vx += j2 * nx2; q.vy += j2 * ny2; }
        }
      }
      bong.forEach(function (b) { b.vet.unshift({ x: b.x, y: b.y }); if (b.vet.length > 4) b.vet.pop(); });
    }

    function veMotBong(x, y, r, mau, ma, doMo) {
      ctx.save();
      ctx.globalAlpha = doMo == null ? 1 : doMo;
      var g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
      g.addColorStop(0, "#ffffff"); g.addColorStop(0.25, mau); g.addColorStop(1, "#0a1330");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, HAI_PI); ctx.fill();
      if (r > 9) {
        ctx.fillStyle = "rgba(255,255,255,0.92)";
        ctx.beginPath(); ctx.ellipse(x, y, r * 0.62, r * 0.42, 0, 0, HAI_PI); ctx.fill();
        ctx.fillStyle = "#0c1322";
        ctx.font = "800 " + Math.round(r * 0.52) + "px ui-monospace, Menlo, Consolas, monospace";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(ma.slice(-3), x, y + r * 0.04);
      }
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.beginPath(); ctx.ellipse(x - r * 0.38, y - r * 0.45, r * 0.22, r * 0.12, -0.6, 0, HAI_PI); ctx.fill();
      ctx.restore();
    }

    // ───────── Khung lồng 3D ─────────
    function chieu(X, Y, Z, t) {
      return { x: t.x + X, y: t.y + Y * Math.cos(NGHIENG) - Z * Math.sin(NGHIENG), z: Y * Math.sin(NGHIENG) + Z * Math.cos(NGHIENG) };
    }

    function veVong(diem, matTruoc) {
      ctx.beginPath();
      var dangVe = false;
      for (var i = 0; i < diem.length; i += 1) {
        var p = diem[i];
        if (matTruoc ? p.z >= 0 : p.z < 0) { if (!dangVe) { ctx.moveTo(p.x, p.y); dangVe = true; } else ctx.lineTo(p.x, p.y); }
        else dangVe = false;
      }
      ctx.stroke();
    }

    function diemKinhTuyen(phi, t) {
      var ds = [];
      for (var k = 0; k <= 48; k += 1) {
        var th = (k / 48) * HAI_PI;
        ds.push(chieu(t.R * Math.cos(th), t.R * Math.sin(th) * Math.cos(phi), t.R * Math.sin(th) * Math.sin(phi), t));
      }
      return ds;
    }
    function diemViTuyen(alpha, t) {
      var ds = [], X = t.R * Math.cos(alpha), rho = t.R * Math.sin(alpha);
      for (var k = 0; k <= 48; k += 1) { var be = (k / 48) * HAI_PI; ds.push(chieu(X, rho * Math.cos(be), rho * Math.sin(be), t)); }
      return ds;
    }

    function veKhung(t, matTruoc, doMo) {
      ctx.save();
      ctx.globalAlpha = doMo;
      ctx.lineCap = "round";
      ctx.strokeStyle = matTruoc ? "#ffd977" : "rgba(214,170,74,0.45)";
      ctx.lineWidth = matTruoc ? 0.55 * u : 0.35 * u;
      if (matTruoc) { ctx.shadowColor = "rgba(255,210,110,0.65)"; ctx.shadowBlur = 1.2 * u; }
      for (var m = 0; m < 8; m += 1) veVong(diemKinhTuyen(gocLong + (m * Math.PI) / 8, t), matTruoc);
      ctx.lineWidth = matTruoc ? 0.8 * u : 0.45 * u;
      [Math.PI / 2, Math.PI / 2 - 0.62, Math.PI / 2 + 0.62].forEach(function (al) { veVong(diemViTuyen(al, t), matTruoc); });
      ctx.restore();
    }

    function veTrucVaGia(t) {
      var yTruc = t.y, trai = t.x - t.R - 5 * u, phai = t.x + t.R + 5 * u, dayBe = 79 * u;
      ctx.lineCap = "round";
      [[trai, -1], [phai, 1]].forEach(function (c) {
        var gr = ctx.createLinearGradient(c[0] - 2 * u, 0, c[0] + 2 * u, 0);
        gr.addColorStop(0, "#8a6416"); gr.addColorStop(0.5, "#ffe39a"); gr.addColorStop(1, "#8a6416");
        ctx.strokeStyle = gr; ctx.lineWidth = 2.4 * u;
        ctx.beginPath(); ctx.moveTo(c[0], yTruc); ctx.quadraticCurveTo(c[0] + c[1] * 4 * u, (yTruc + dayBe) / 2, c[0] - c[1] * 3 * u, dayBe); ctx.stroke();
      });
      var gt = ctx.createLinearGradient(0, yTruc - u, 0, yTruc + u);
      gt.addColorStop(0, "#ffe39a"); gt.addColorStop(1, "#8a6416");
      ctx.strokeStyle = gt; ctx.lineWidth = 1.6 * u;
      ctx.beginPath(); ctx.moveTo(trai, yTruc); ctx.lineTo(t.x - t.R, yTruc); ctx.moveTo(t.x + t.R, yTruc); ctx.lineTo(phai + 3 * u, yTruc); ctx.stroke();
      [t.x - t.R, t.x + t.R].forEach(function (x) {
        var gm = ctx.createRadialGradient(x - u, yTruc - u, 0, x, yTruc, 3 * u);
        gm.addColorStop(0, "#fff3c4"); gm.addColorStop(1, "#9a7019");
        ctx.fillStyle = gm; ctx.beginPath(); ctx.arc(x, yTruc, 2.6 * u, 0, HAI_PI); ctx.fill();
      });
      // Tay quay: bánh xe có nan quay theo lồng, núm cầm màu đỏ son
      var cx = phai + 3 * u;
      ctx.strokeStyle = "#e7c063"; ctx.lineWidth = 0.7 * u;
      ctx.beginPath(); ctx.arc(cx, yTruc, 5 * u, 0, HAI_PI); ctx.stroke();
      for (var k = 0; k < 4; k += 1) {
        var a = gocLong + (k * Math.PI) / 2;
        ctx.beginPath(); ctx.moveTo(cx, yTruc); ctx.lineTo(cx + Math.cos(a) * 5 * u, yTruc + Math.sin(a) * 5 * u); ctx.stroke();
      }
      var nx = cx + Math.cos(gocLong) * 5 * u, ny = yTruc + Math.sin(gocLong) * 5 * u;
      ctx.lineWidth = 0.9 * u; ctx.beginPath(); ctx.moveTo(nx, ny); ctx.lineTo(nx + 3 * u, ny); ctx.stroke();
      ctx.fillStyle = "#c81e1e"; ctx.beginPath(); ctx.arc(nx + 3.4 * u, ny, 1.3 * u, 0, HAI_PI); ctx.fill();
    }

    function duongBe() {
      var tren = 78 * u, duoi = 96 * u;
      ctx.beginPath(); ctx.moveTo(22 * u, tren); ctx.lineTo(78 * u, tren); ctx.lineTo(84 * u, duoi); ctx.lineTo(16 * u, duoi); ctx.closePath();
    }

    function veBe() {
      var tren = 78 * u, duoi = 96 * u;
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.beginPath(); ctx.ellipse(50 * u, duoi + u, 34 * u, 2.6 * u, 0, 0, HAI_PI); ctx.fill();
      var g = ctx.createLinearGradient(0, tren, 0, duoi);
      g.addColorStop(0, "#1d3f8f"); g.addColorStop(1, "#0b1a44");
      ctx.fillStyle = g; duongBe(); ctx.fill();
      ctx.strokeStyle = "#e7c063"; ctx.lineWidth = 0.5 * u; ctx.stroke();
      ctx.fillStyle = "#e7c063"; ctx.fillRect(21 * u, tren - 0.8 * u, 58 * u, 1.6 * u);
      // Hoa văn sóng nước truyền thống trên bệ
      ctx.save(); duongBe(); ctx.clip();
      ctx.strokeStyle = "rgba(231,192,99,0.22)"; ctx.lineWidth = 0.3 * u;
      for (var hang = 0, hy = tren + 4 * u; hy < duoi + 3 * u; hy += 3 * u, hang += 1) {
        for (var hx = 14 * u + (hang % 2) * 2 * u; hx < 86 * u; hx += 4 * u) { ctx.beginPath(); ctx.arc(hx, hy, 2 * u, Math.PI, HAI_PI); ctx.stroke(); }
      }
      ctx.restore();
      var hx2 = 50 * u, hy2 = 88 * u, r = 5 * u;
      ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(hx2, hy2, r, 0, HAI_PI); ctx.fill();
      ctx.strokeStyle = "#e7c063"; ctx.lineWidth = 0.5 * u; ctx.stroke();
      if (root.UMC && root.UMC.san(root.UMC.lon)) ctx.drawImage(root.UMC.lon, hx2 - r * 0.72, hy2 - r * 0.72, r * 1.44, r * 1.44);
    }

    function veOngVaChen(t) {
      var x = t.x, y0 = t.y + t.R * 0.93, y1 = 74 * u;
      ctx.fillStyle = "#c99a2e";
      ctx.beginPath(); ctx.moveTo(x - 4 * u, y0 - u); ctx.lineTo(x + 4 * u, y0 - u); ctx.lineTo(x + 2.2 * u, y0 + 2.5 * u); ctx.lineTo(x - 2.2 * u, y0 + 2.5 * u); ctx.closePath(); ctx.fill();
      ctx.save(); ctx.translate(x - 4 * u, y0 - u); ctx.rotate(cuaMo * 1.1);
      ctx.fillStyle = "#ffe39a"; ctx.fillRect(0, -0.5 * u, 8 * u, u); ctx.restore();
      ctx.fillStyle = "rgba(200,235,255,0.16)"; ctx.strokeStyle = "rgba(220,240,255,0.55)"; ctx.lineWidth = 0.3 * u;
      ctx.beginPath(); ctx.rect(x - 2.2 * u, y0 + 2.5 * u, 4.4 * u, y1 - y0 - 2.5 * u); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.fillRect(x - 1.6 * u, y0 + 3 * u, 0.6 * u, y1 - y0 - 4 * u);
      var gc = ctx.createLinearGradient(0, y1, 0, y1 + 4 * u);
      gc.addColorStop(0, "#ffe39a"); gc.addColorStop(1, "#9a7019");
      ctx.fillStyle = gc;
      ctx.beginPath(); ctx.ellipse(x, y1 + u, 6 * u, 1.6 * u, 0, 0, HAI_PI); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x - 6 * u, y1 + u); ctx.quadraticCurveTo(x, y1 + 6 * u, x + 6 * u, y1 + u); ctx.fill();
    }

    // ───────── Nền và ánh sáng ─────────
    function taoBokeh() {
      bokeh = [];
      for (var i = 0; i < 34; i += 1) bokeh.push({ x: Math.random() * 100, y: Math.random() * 100, r: 0.6 + Math.random() * 2.6, v: 1 + Math.random() * 3, mau: ["120,220,255", "212,255,58", "255,215,120"][i % 3], pha: Math.random() * 6 });
    }

    function veNen(dt, tg) {
      var g = ctx.createRadialGradient(50 * u, 40 * u, 4 * u, 50 * u, 46 * u, 72 * u);
      g.addColorStop(0, "#1f56c8"); g.addColorStop(0.45, "#0f2f7a"); g.addColorStop(1, "#071534");
      ctx.fillStyle = g;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(0, 0, 100 * u, 100 * u, 5 * u); else ctx.rect(0, 0, 100 * u, 100 * u);
      ctx.fill();
      ctx.save(); ctx.clip();
      gocTia += dt * (0.08 + omega * 0.03);
      for (var k = 0; k < 14; k += 1) {
        var a = gocTia + (k * HAI_PI) / 14;
        ctx.fillStyle = "rgba(170,220,255," + (0.05 * sangTia) + ")";
        ctx.beginPath(); ctx.moveTo(50 * u, 40 * u); ctx.arc(50 * u, 40 * u, 90 * u, a, a + 0.11); ctx.closePath(); ctx.fill();
      }
      var q = ctx.createRadialGradient(50 * u, 40 * u, 10 * u, 50 * u, 40 * u, 40 * u);
      q.addColorStop(0, "rgba(140,210,255," + (0.28 * sangTia) + ")"); q.addColorStop(1, "rgba(140,210,255,0)");
      ctx.fillStyle = q; ctx.fillRect(0, 0, 100 * u, 100 * u);
      bokeh.forEach(function (b) {
        b.y -= b.v * dt * (1 + omega * 0.25);
        if (b.y < -4) { b.y = 104; b.x = Math.random() * 100; }
        var nhay = 0.55 + 0.45 * Math.sin(tg * 0.002 + b.pha);
        var gb = ctx.createRadialGradient(b.x * u, b.y * u, 0, b.x * u, b.y * u, b.r * u);
        gb.addColorStop(0, "rgba(" + b.mau + "," + (0.45 * nhay) + ")"); gb.addColorStop(1, "rgba(" + b.mau + ",0)");
        ctx.fillStyle = gb; ctx.beginPath(); ctx.arc(b.x * u, b.y * u, b.r * u, 0, HAI_PI); ctx.fill();
      });
      ctx.restore();
    }

    function veHieuUngNo(dt) {
      vongSong = vongSong.filter(function (v) { v.t += dt; return v.t < v.dai; });
      vongSong.forEach(function (v) {
        var p = v.t / v.dai, r = v.r0 + (v.r1 - v.r0) * eo(p);
        ctx.strokeStyle = "rgba(" + v.mau + "," + (1 - p) + ")"; ctx.lineWidth = (1 - p) * 1.2 * u + 0.2 * u;
        ctx.beginPath(); ctx.arc(v.x, v.y, r, 0, HAI_PI); ctx.stroke();
      });
      tiaLoe = tiaLoe.filter(function (s) { s.t += dt; return s.t < s.song; });
      tiaLoe.forEach(function (s) {
        s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 40 * u * dt;
        ctx.strokeStyle = "rgba(" + s.mau + "," + (1 - s.t / s.song) + ")"; ctx.lineWidth = 0.35 * u;
        ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - s.vx * 0.03, s.y - s.vy * 0.03); ctx.stroke();
      });
    }

    function bungTia(x, y, so, manh) {
      for (var i = 0; i < so; i += 1) {
        var a = Math.random() * HAI_PI, v = (20 + Math.random() * 50) * u * (manh || 1);
        tiaLoe.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0, song: 0.6 + Math.random() * 0.6, mau: ["255,226,140", "212,255,58", "180,230,255"][i % 3] });
      }
    }

    function veAnhHung(dt, tg) {
      if (!anhHung) return;
      var h = anhHung, x = h.x, y = h.y, r = h.r;
      h.tuoi += dt;
      ctx.save();
      ctx.translate(x, y); ctx.rotate(tg * 0.0004);
      for (var k = 0; k < 16; k += 1) {
        var a = (k * HAI_PI) / 16;
        ctx.fillStyle = "rgba(255,224,130," + (0.12 + 0.06 * Math.sin(tg * 0.003 + k)) + ")";
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r * 2.1, a, a + 0.09); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
      var q = ctx.createRadialGradient(x, y, r * 0.8, x, y, r * 1.6);
      q.addColorStop(0, "rgba(255,230,150,0.55)"); q.addColorStop(1, "rgba(255,230,150,0)");
      ctx.fillStyle = q; ctx.beginPath(); ctx.arc(x, y, r * 1.6, 0, HAI_PI); ctx.fill();
      var g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.42, r * 0.08, x, y, r);
      g.addColorStop(0, "#ffffff"); g.addColorStop(0.22, h.mau); g.addColorStop(0.85, "#0a1636"); g.addColorStop(1, "#050b1d");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, HAI_PI); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, HAI_PI); ctx.clip();
      ctx.fillStyle = "rgba(255,255,255,0.96)";
      ctx.beginPath(); ctx.ellipse(x, y, r * 1.02, r * 0.34, 0, 0, HAI_PI); ctx.fill();
      var co = Math.min(r * 0.36, (r * 1.7) / Math.max(4, h.ma.length * 0.62));
      ctx.fillStyle = "#0c1322"; ctx.font = "800 " + Math.round(co) + "px ui-monospace, Menlo, Consolas, monospace";
      ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(h.ma, x, y + co * 0.04);
      var quet = ((h.tuoi * 0.6) % 1.6) - 0.3;
      var gs = ctx.createLinearGradient(x - r + quet * 2 * r - r * 0.3, 0, x - r + quet * 2 * r + r * 0.3, 0);
      gs.addColorStop(0, "rgba(255,255,255,0)"); gs.addColorStop(0.5, "rgba(255,255,255,0.35)"); gs.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = gs; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
      ctx.restore();
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.beginPath(); ctx.ellipse(x - r * 0.4, y - r * 0.55, r * 0.2, r * 0.09, -0.6, 0, HAI_PI); ctx.fill();
      ctx.strokeStyle = "rgba(255,226,140,0.9)"; ctx.lineWidth = 0.5 * u; ctx.beginPath(); ctx.arc(x, y, r + 0.6 * u, 0, HAI_PI); ctx.stroke();
    }

    // ───────── Kịch bản bốc ─────────
    function batDauSuyt() {
      var ung = bong.filter(function (b) { return b !== bongChon && !b.kichBan; });
      bongSuyt = ung.length ? ung[Math.floor(Math.random() * ung.length)] : null;
      if (bongSuyt) bongSuyt.kichBan = { tu: { x: bongSuyt.x, y: bongSuyt.y } };
      daBaoSuyt = false;
    }

    function batDauRa() {
      if (bongChon) bongChon.kichBan = { tu: { x: bongChon.x, y: bongChon.y } };
      daBaoRa = false; daBaoCham = false; daBaoXong = false;
    }

    function phaSuyt(p, dt, t, cuaX, cuaY) {
      omega += ((p < 900 ? 1.0 : 6) - omega) * Math.min(1, dt * 3);
      cuaMo = p < 1000 ? Math.min(1, p / 250) : Math.max(0, 1 - (p - 1000) / 200);
      var b = bongSuyt;
      if (!b || !b.kichBan) return;
      var k = kep(p / 1000), dau = b.kichBan.tu;
      if (k < 0.45) { var a = eio(k / 0.45); b.x = dau.x + (cuaX - dau.x) * a; b.y = dau.y + (cuaY - dau.y) * a; }
      else if (k < 0.7) {
        b.y = cuaY + Math.sin(((k - 0.45) / 0.25) * Math.PI) * 2.5 * u;
        if (!daBaoSuyt) { daBaoSuyt = true; goi("satNut"); bungTia(cuaX, cuaY, 14, 0.5); }
      } else { var a3 = eo((k - 0.7) / 0.3); b.x = cuaX + (t.x - cuaX) * a3; b.y = cuaY + (t.y + t.R * 0.2 - cuaY) * a3; }
      if (p >= 1000) { b.kichBan = null; b.vx = 0; b.vy = -40 * u; }
    }

    function phaRa(p, dt, tg, cuaX, cuaY, chenY) {
      omega += (0 - omega) * Math.min(1, dt * 3);
      var c = bongChon;
      if (!c || !c.kichBan) return;
      var tu = c.kichBan.tu;
      if (p < 500) { var e = eio(p / 500); c.x = tu.x + (cuaX - tu.x) * e; c.y = tu.y + (cuaY - tu.y) * e; cuaMo = Math.min(1, p / 300); }
      else if (p < 1050) {
        if (!daBaoRa) { daBaoRa = true; goi("moManh"); bungTia(cuaX, cuaY, 10, 0.4); }
        var r2 = (p - 500) / 550; c.x = cuaX; c.y = cuaY + (chenY - cuaY) * (r2 * r2);
        if (Math.random() < 0.6) tiaLoe.push({ x: c.x + (Math.random() - 0.5) * 2 * u, y: c.y, vx: (Math.random() - 0.5) * 10 * u, vy: -10 * u, t: 0, song: 0.5, mau: "255,226,140" });
      } else if (p < 1400) {
        if (!daBaoCham) { daBaoCham = true; goi("cach", true); vongSong.push({ x: cuaX, y: chenY, r0: 2 * u, r1: 14 * u, t: 0, dai: 0.6, mau: "255,226,140" }); }
        cuaMo = Math.max(0, 1 - (p - 1050) / 300);
        var nay = (p - 1050) / 350; c.x = cuaX; c.y = chenY - Math.abs(Math.sin(nay * Math.PI * 2)) * 3 * u * (1 - nay);
      } else if (p < 2300) {
        // Bay lên, phóng to thành quả cầu ánh sáng
        if (!anhHung) { anhHung = { mau: c.mau, ma: c.ma, x: c.x, y: c.y, r: banKinhBong(), tuoi: 0 }; c.anDi = true; goi("trongDon", 700); }
        var z = eio((p - 1400) / 900);
        anhHung.x = cuaX; anhHung.y = chenY + (47 * u - chenY) * z; anhHung.r = banKinhBong() + (21 * u - banKinhBong()) * z;
        sangTia = 0.6 + z * 0.8;
      } else {
        if (!daBaoXong) {
          daBaoXong = true;
          goi("chupAnh");
          vongSong.push({ x: anhHung.x, y: anhHung.y, r0: anhHung.r, r1: anhHung.r * 2.6, t: 0, dai: 0.9, mau: "212,255,58" });
          vongSong.push({ x: anhHung.x, y: anhHung.y, r0: anhHung.r, r1: anhHung.r * 2, t: 0, dai: 0.7, mau: "255,226,140" });
          bungTia(anhHung.x, anhHung.y, 60, 1.3);
        }
        if (p > TG_RA) {
          giaiDoan = "xong";
          bong = bong.filter(function (b2) { return b2 !== c; });
          bongChon = null;
          baoPha("xong");
          var cb = onXongBoc; onXongBoc = null;
          if (typeof cb === "function") cb();
        }
      }
    }

    function dieuKhien(tg, dt) {
      var t = tam(), p = tg - moc;
      var cuaX = t.x, cuaY = t.y + t.R * 0.86, chenY = 74 * u;
      if (giaiDoan === "nghi" || giaiDoan === "xong") {
        omega += ((giaiDoan === "xong" ? 0.35 : 0.6) - omega) * Math.min(1, dt * 1.5);
        sangTia += (0.4 - sangTia) * Math.min(1, dt * 2);
        cuaMo += (0 - cuaMo) * Math.min(1, dt * 4);
      } else if (giaiDoan === "thoi") {
        omega = 0.6 + 7.4 * eio(kep(p / 900));
        sangTia = 0.4 + 0.6 * kep(p / 900);
        if (p > TG_QUAY) {
          moc = tg;
          if (cheDoCaoTrao) { giaiDoan = "hut-hut"; batDauSuyt(); baoPha("hut-hut"); }
          else { giaiDoan = "hut"; batDauRa(); baoPha("hut"); }
        }
      } else if (giaiDoan === "hut-hut") {
        phaSuyt(p, dt, t, cuaX, cuaY);
        if (p > TG_SUYT) { moc = tg; giaiDoan = "hut"; batDauRa(); baoPha("hut"); }
      } else if (giaiDoan === "hut") {
        phaRa(p, dt, tg, cuaX, cuaY, chenY);
      }
    }

    function ve(tg, dt) {
      kichThuoc();
      dieuKhien(tg, dt);
      gocLong += omega * dt;
      if (giaiDoan === "thoi" || (giaiDoan === "hut-hut" && omega > 3)) {
        tickQuay += omega * dt;
        if (tickQuay > 1.6) { tickQuay = 0; goi("tick"); }
      }
      var buoc = Math.min(dt, 1 / 30) / 2;
      vatLy(buoc); vatLy(buoc);

      var t = tam(), r = banKinhBong();
      var moLong = anhHung ? 0.55 : 1;
      veNen(dt, tg);
      veBe();
      veTrucVaGia(t);
      veOngVaChen(t);
      veKhung(t, false, moLong);
      if (omega > 2.5) bong.forEach(function (b) {
        if (!b.anDi) b.vet.forEach(function (v, i) { veMotBong(v.x, v.y, r * (1 - i * 0.12), b.mau, b.ma, 0.12 * moLong); });
      });
      bong.slice().sort(function (a, b) { return a.y - b.y; }).forEach(function (b) {
        if (!b.anDi) veMotBong(b.x, b.y, r, b.mau, b.ma, b.kichBan ? 1 : moLong);
      });
      veKhung(t, true, moLong);
      ctx.strokeStyle = "rgba(255,255,255," + 0.18 * moLong + ")"; ctx.lineWidth = 1.4 * u;
      ctx.beginPath(); ctx.arc(t.x, t.y, t.R * 0.82, Math.PI * 1.08, Math.PI * 1.42); ctx.stroke();
      veHieuUngNo(dt);
      veAnhHung(dt, tg);
    }

    function batVongLap() {
      if (dangHien) return;
      dangHien = true;
      tTruoc = performance.now();
      (function lap(tg) {
        if (!dangHien) return;
        var dt = Math.min(0.05, (tg - tTruoc) / 1000) || 0.016;
        tTruoc = tg;
        ve(tg, dt);
        raf = requestAnimationFrame(lap);
      })(tTruoc);
    }

    taoBokeh();

    return {
      napDanhSach: function (dsMa, tuyChon) {
        var o = tuyChon || {};
        cheDoCauVang = Boolean(o.cauVang);
        taoBong(dsMa, cheDoCauVang);
        if (!o.giuKetQua) { giaiDoan = "nghi"; maTrung = ""; anhHung = null; vongSong = []; }
        batVongLap();
      },
      bocToi: function (ma, onXong, tuyChon) {
        var o = tuyChon || {};
        maTrung = String(ma || "");
        cheDoCaoTrao = Boolean(o.caoTrao);
        if (typeof o.cauVang === "boolean") cheDoCauVang = o.cauVang;
        onPhaCb = typeof o.onPha === "function" ? o.onPha : null;
        onXongBoc = onXong;
        anhHung = null; vongSong = []; tiaLoe = [];
        // Quả cầu trúng phải nằm trong lồng: nếu mã chưa có trong số cầu đang hiển thị thì đổi nhãn một quả.
        bongChon = null;
        for (var i = 0; i < bong.length; i += 1) if (bong[i].ma === maTrung) { bongChon = bong[i]; break; }
        if (!bongChon && bong.length) { bongChon = bong[Math.floor(Math.random() * bong.length)]; bongChon.ma = maTrung; }
        if (!bongChon) { var t = tam(); bongChon = { ma: maTrung, mau: MAU_CAU[0], x: t.x, y: t.y, vx: 0, vy: 0, vet: [], kichBan: null }; bong.push(bongChon); }
        giaiDoan = "thoi";
        moc = performance.now();
        if (giamChuyenDong()) moc -= TG_QUAY * 0.7;
        goi("trongDon", TG_QUAY);
        baoPha("thoi");
        batVongLap();
      },
      dangBoc: function () { return giaiDoan === "thoi" || giaiDoan === "hut-hut" || giaiDoan === "hut"; },
      dung: function () { dangHien = false; if (raf) { cancelAnimationFrame(raf); raf = 0; } },
    };
  }

  root.VeLong = { tao: tao };
})(window);
