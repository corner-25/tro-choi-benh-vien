/* Vẽ hoạt họa sống động 60fps trên Canvas 2D cho 8 câu Đuổi hình bắt chữ – Đời sống Bệnh viện. */
(function (root) {
  "use strict";

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  function tao(canvas) {
    var ctx = canvas.getContext("2d");
    var canhId = "truc-dem";
    var anhTuyChon = null;
    var imgObj = null;
    var raf = 0;
    var dangChay = false;

    function kichThuoc() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = canvas.clientWidth || 720;
      var h = canvas.clientHeight || 420;
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { w: w, h: h };
    }

    function veCanh(t, W, H) {
      ctx.clearRect(0, 0, W, H);
      if (anhTuyChon && imgObj && imgObj.complete) {
        var r = Math.min(W / imgObj.naturalWidth, H / imgObj.naturalHeight);
        var dw = imgObj.naturalWidth * r, dh = imgObj.naturalHeight * r;
        ctx.fillStyle = "#f8fafc"; ctx.fillRect(0, 0, W, H);
        ctx.drawImage(imgObj, (W - dw) / 2, (H - dh) / 2, dw, dh);
        return;
      }

      var s = t / 1000;
      var cx = W / 2, cy = H / 2;

      if (canhId === "truc-dem") {
        // Trăng khuyết + đồng hồ 2h sáng + tách cà phê bốc khói
        var g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, "#1e293b"); g.addColorStop(1, "#0f172a");
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        // Sao lấp lánh
        for (var i = 0; i < 16; i += 1) {
          var al = 0.35 + 0.65 * Math.abs(Math.sin(s * 2 + i * 1.7));
          ctx.fillStyle = "rgba(255,255,255," + al + ")";
          ctx.beginPath(); ctx.arc(((i * 97) % (W - 60)) + 30, ((i * 53) % (H * 0.45)) + 24, 2.5, 0, Math.PI * 2); ctx.fill();
        }
        // Trăng khuyết vàng
        ctx.fillStyle = "#fde047"; ctx.beginPath(); ctx.arc(W * 0.2, H * 0.28, 42, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#192338"; ctx.beginPath(); ctx.arc(W * 0.2 + 16, H * 0.28 - 8, 36, 0, Math.PI * 2); ctx.fill();
        // Đồng hồ 02:00 đang tích tắc
        ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(cx, cy, 74, 0, Math.PI * 2); ctx.fill();
        ctx.lineWidth = 6; ctx.strokeStyle = "#d4ff3a"; ctx.stroke();
        ctx.strokeStyle = "#0c1322"; ctx.lineWidth = 5; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + 32, cy - 22); ctx.stroke();
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy - 52); ctx.stroke();
        ctx.strokeStyle = "#e53935"; ctx.lineWidth = 2;
        var kim = (s * 2.5) % (Math.PI * 2);
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(kim) * 56, cy + Math.sin(kim) * 56); ctx.stroke();
        // Tách cà phê bốc khói bên phải
        var kx = W * 0.78, ky = H * 0.6;
        ctx.fillStyle = "#ffffff"; roundRect(ctx, kx - 34, ky - 22, 68, 56, 12); ctx.fill();
        ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(kx + 36, ky + 4, 15, -Math.PI / 2, Math.PI / 2); ctx.stroke();
        ctx.strokeStyle = "rgba(212,255,58,0.8)"; ctx.lineWidth = 3;
        for (var sm = -1; sm <= 1; sm += 1) {
          ctx.beginPath();
          ctx.moveTo(kx + sm * 14, ky - 32);
          ctx.quadraticCurveTo(kx + sm * 14 + Math.sin(s * 4 + sm) * 10, ky - 56, kx + sm * 14, ky - 80);
          ctx.stroke();
        }
      } else if (canhId === "ket-thang-may") {
        ctx.fillStyle = "#e2e8f0"; ctx.fillRect(0, 0, W, H);
        // Khung thang máy
        ctx.fillStyle = "#0c1322"; roundRect(ctx, cx - 150, 74, 300, H - 104, 14); ctx.fill();
        // Màn hình số tầng nhấp nháy đỏ
        ctx.fillStyle = "#1e293b"; roundRect(ctx, cx - 72, 24, 144, 40, 8); ctx.fill();
        var nhay = Math.floor(s * 3) % 2 === 0;
        ctx.fillStyle = nhay ? "#ef4444" : "#d4ff3a";
        ctx.font = "900 22px ui-monospace, monospace"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(nhay ? "ĐẦY!" : "TẦNG 05", cx, 45);
        // 2 cánh cửa thép rung kẹt hờ
        var khe = 16 + Math.abs(Math.sin(s * 9)) * 18;
        ctx.fillStyle = "#94a3b8";
        ctx.fillRect(cx - 134, 90, 134 - khe, H - 136);
        ctx.fillRect(cx + khe, 90, 134 - khe, H - 136);
        ctx.strokeStyle = "#0c1322"; ctx.lineWidth = 3;
        ctx.strokeRect(cx - 134, 90, 134 - khe, H - 136);
        ctx.strokeRect(cx + khe, 90, 134 - khe, H - 136);
        // Nút bấm mũi tên
        ctx.fillStyle = "#ffffff"; roundRect(ctx, cx + 174, cy - 36, 42, 76, 8); ctx.fill();
        ctx.fillStyle = "#ef4444"; ctx.beginPath(); ctx.arc(cx + 195, cy - 14, 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#0b4fd6"; ctx.beginPath(); ctx.arc(cx + 195, cy + 16, 10, 0, Math.PI * 2); ctx.fill();
      } else if (canhId === "cap-cuu") {
        ctx.fillStyle = "#f1f5f9"; ctx.fillRect(0, 0, W, H);
        // Đèn chớp xanh đỏ ưu tiên
        var doSang = Math.floor(s * 6) % 2 === 0;
        ctx.fillStyle = doSang ? "rgba(239,68,68,0.22)" : "rgba(11,79,214,0.22)";
        ctx.beginPath(); ctx.arc(cx, H * 0.25, 110, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = doSang ? "#ef4444" : "#991b1b"; roundRect(ctx, cx - 72, H * 0.16, 68, 36, 10); ctx.fill();
        ctx.fillStyle = !doSang ? "#0b4fd6" : "#1e3a8a"; roundRect(ctx, cx + 4, H * 0.16, 68, 36, 10); ctx.fill();
        // Chữ thập đỏ đậm
        ctx.fillStyle = "#ef4444";
        roundRect(ctx, cx - 22, cy - 28, 44, 118, 8); ctx.fill();
        roundRect(ctx, cx - 59, cy + 9, 118, 44, 8); ctx.fill();
        // Đường sóng nhịp tim ECG chạy ngang
        ctx.strokeStyle = "#0b4fd6"; ctx.lineWidth = 4;
        ctx.beginPath();
        for (var x = 30; x < W - 30; x += 6) {
          var p = ((x + s * 220) % 160) / 160;
          var y = H * 0.84 + (p > 0.42 && p < 0.48 ? -44 : p >= 0.48 && p < 0.54 ? 26 : 0);
          if (x === 30) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else if (canhId === "chuyen-doi-so") {
        ctx.fillStyle = "#f0f9ff"; ctx.fillRect(0, 0, W, H);
        // Tập hồ sơ giấy bên trái
        ctx.fillStyle = "#fde68a"; roundRect(ctx, W * 0.12, cy - 68, 120, 146, 10); ctx.fill();
        ctx.strokeStyle = "#b45309"; ctx.lineWidth = 3; ctx.stroke();
        for (var l = 0; l < 5; l += 1) { ctx.fillStyle = "#92400e"; ctx.fillRect(W * 0.12 + 20, cy - 40 + l * 22, 80, 6); }
        // Dòng số 0-1 bay từ trái sang phải
        ctx.font = "900 22px ui-monospace, monospace"; ctx.fillStyle = "#0b4fd6";
        for (var b = 0; b < 8; b += 1) {
          var bx = W * 0.32 + ((s * 140 + b * 42) % (W * 0.34));
          var by = cy + Math.sin(b * 2.1 + s * 4) * 34;
          ctx.fillText(b % 2 === 0 ? "1" : "0", bx, by);
        }
        // Màn hình máy tính bảng sáng bên phải
        ctx.fillStyle = "#0c1322"; roundRect(ctx, W * 0.70, cy - 80, 150, 168, 16); ctx.fill();
        ctx.fillStyle = "#d4ff3a"; roundRect(ctx, W * 0.70 + 14, cy - 62, 122, 130, 8); ctx.fill();
        ctx.fillStyle = "#0c1322"; ctx.font = "900 26px ui-monospace, monospace"; ctx.textAlign = "center";
        ctx.fillText("100%", W * 0.70 + 75, cy + 8);
      } else if (canhId === "bac-si-noi-tru") {
        ctx.fillStyle = "#eef6ff"; ctx.fillRect(0, 0, W, H);
        // Ngôi nhà bệnh viện có mái
        ctx.fillStyle = "#ffffff"; roundRect(ctx, cx - 150, cy - 40, 300, 175, 12); ctx.fill();
        ctx.strokeStyle = "#0b4fd6"; ctx.lineWidth = 4; ctx.stroke();
        ctx.fillStyle = "#0b4fd6";
        ctx.beginPath(); ctx.moveTo(cx - 175, cy - 38); ctx.lineTo(cx, cy - 138); ctx.lineTo(cx + 175, cy - 38); ctx.closePath(); ctx.fill();
        // Chữ thập trên mái
        ctx.fillStyle = "#d4ff3a"; ctx.fillRect(cx - 8, cy - 102, 16, 44); ctx.fillRect(cx - 22, cy - 88, 44, 16);
        // Chiếc giường nhỏ bên trong nhà + dấu Zzz bay lên
        ctx.fillStyle = "#0f766e"; roundRect(ctx, cx - 90, cy + 54, 180, 34, 8); ctx.fill();
        ctx.fillStyle = "#ffffff"; roundRect(ctx, cx - 80, cy + 36, 46, 22, 8); ctx.fill();
        ctx.fillStyle = "#0b4fd6"; ctx.font = "900 28px ui-monospace, monospace";
        var dy = (s * 28) % 45;
        ctx.fillText("Z", cx + 40, cy + 20 - dy);
        ctx.fillText("z", cx + 62, cy - 4 - dy);
      } else if (canhId === "tai-kham") {
        ctx.fillStyle = "#f0fdf4"; ctx.fillRect(0, 0, W, H);
        // Tờ lịch bên trái
        ctx.fillStyle = "#ffffff"; roundRect(ctx, W * 0.16, cy - 72, 150, 150, 14); ctx.fill();
        ctx.strokeStyle = "#0c1322"; ctx.lineWidth = 3; ctx.stroke();
        ctx.fillStyle = "#ef4444"; roundRect(ctx, W * 0.16, cy - 72, 150, 42, 12); ctx.fill();
        ctx.fillStyle = "#0c1322"; ctx.font = "900 54px ui-monospace, monospace"; ctx.textAlign = "center";
        ctx.fillText("14", W * 0.16 + 75, cy + 32);
        // Mũi tên vòng lặp quay xanh quay đều
        ctx.save(); ctx.translate(cx + 20, cy); ctx.rotate(s * 1.4);
        ctx.strokeStyle = "#0f766e"; ctx.lineWidth = 10; ctx.lineCap = "round";
        ctx.beginPath(); ctx.arc(0, 0, 52, 0.4, Math.PI * 1.75); ctx.stroke();
        ctx.restore();
        // Ống nghe bên phải
        ctx.strokeStyle = "#0b4fd6"; ctx.lineWidth = 8;
        ctx.beginPath(); ctx.arc(W * 0.78, cy - 10, 42, 0, Math.PI); ctx.stroke();
        ctx.beginPath(); ctx.arc(W * 0.78, cy + 56, 20, 0, Math.PI * 2); ctx.fillStyle = "#d4ff3a"; ctx.fill(); ctx.stroke();
      } else if (canhId === "giao-ban") {
        var gg = ctx.createLinearGradient(0, 0, 0, H);
        gg.addColorStop(0, "#fef3c7"); gg.addColorStop(1, "#e0f2fe");
        ctx.fillStyle = gg; ctx.fillRect(0, 0, W, H);
        // Mặt trời sáng 7h
        ctx.fillStyle = "#f59e0b"; ctx.beginPath(); ctx.arc(cx, H * 0.24, 36 + Math.sin(s * 3) * 4, 0, Math.PI * 2); ctx.fill();
        // Bàn tròn giao ban + 6 điểm đại biểu truyền sóng vòng tròn
        ctx.fillStyle = "#0c1322"; ctx.beginPath(); ctx.ellipse(cx, cy + 44, 145, 62, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#d4ff3a"; ctx.font = "900 22px ui-monospace, monospace"; ctx.textAlign = "center"; ctx.fillText("07:00", cx, cy + 50);
        var dangNoi = Math.floor(s * 2) % 6;
        for (var p = 0; p < 6; p += 1) {
          var ag = (p / 6) * Math.PI * 2;
          var px = cx + Math.cos(ag) * 185, py = cy + 44 + Math.sin(ag) * 86;
          ctx.fillStyle = p === dangNoi ? "#d4ff3a" : "#0b4fd6";
          ctx.beginPath(); ctx.arc(px, py, p === dangNoi ? 24 : 18, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = "#0c1322"; ctx.lineWidth = 3; ctx.stroke();
        }
      } else {
        // Phòng mổ: chùm đèn phẫu thuật rọi sáng
        ctx.fillStyle = "#0f172a"; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "rgba(212,255,58,0.18)";
        ctx.beginPath(); ctx.moveTo(cx - 75, 90); ctx.lineTo(cx - 210, H - 30); ctx.lineTo(cx + 210, H - 30); ctx.lineTo(cx + 75, 90); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#ffffff"; roundRect(ctx, cx - 95, 56, 190, 38, 18); ctx.fill();
        for (var l2 = -2; l2 <= 2; l2 += 1) {
          ctx.fillStyle = "#d4ff3a"; ctx.beginPath(); ctx.arc(cx + l2 * 32, 82, 9, 0, Math.PI * 2); ctx.fill();
        }
        ctx.strokeStyle = "#d4ff3a"; ctx.lineWidth = 4;
        ctx.beginPath();
        for (var x2 = 80; x2 < W - 80; x2 += 6) {
          var ph = ((x2 + s * 180) % 140) / 140;
          var y2 = H * 0.72 + (ph > 0.45 && ph < 0.5 ? -36 : ph >= 0.5 && ph < 0.55 ? 20 : 0);
          if (x2 === 80) ctx.moveTo(x2, y2); else ctx.lineTo(x2, y2);
        }
        ctx.stroke();
      }
    }

    function batVongLap() {
      if (raf) return;
      dangChay = true;
      (function lap(t) {
        if (!dangChay) { raf = 0; return; }
        var kt = kichThuoc();
        veCanh(t, kt.w, kt.h);
        raf = requestAnimationFrame(lap);
      })(performance.now());
    }

    return {
      datCanh: function (id, anh) {
        canhId = id || "truc-dem";
        anhTuyChon = anh || null;
        if (anhTuyChon) { imgObj = new Image(); imgObj.src = anhTuyChon; }
        else imgObj = null;
        batVongLap();
      },
      dung: function () { dangChay = false; if (raf) { cancelAnimationFrame(raf); raf = 0; } },
    };
  }

  root.VeHinh = { tao: tao };
})(window);
