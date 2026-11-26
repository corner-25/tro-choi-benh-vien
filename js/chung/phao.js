/* Pháo giấy bung từ một hoặc nhiều điểm rồi rơi chậm, tự dừng. Dùng chung cho các trò. */
(function (root) {
  "use strict";

  var MAU = ["132,204,22", "234,179,8", "11,79,214", "20,184,166", "239,68,68", "212,255,58"];

  function chayPhao(canvas, danhSachNguon) {
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = canvas.clientWidth, H = canvas.clientHeight;
    if (!W || !H) return;
    canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var hat = [];
    danhSachNguon.forEach(function (ng) {
      var so = Math.round(140 * (ng.cuongDo || 1));
      var x0 = W * (ng.tamX == null ? 0.5 : ng.tamX);
      var y0 = H * (ng.tamY == null ? 0.42 : ng.tamY);
      for (var i = 0; i < so; i += 1) {
        var goc = ng.gocGiua != null
          ? ng.gocGiua + (Math.random() - 0.5) * (ng.doRong || 1.2)
          : Math.random() * Math.PI * 2;
        var tocDo = 5 + Math.random() * 13 * Math.sqrt(ng.cuongDo || 1);
        hat.push({
          x: x0, y: y0,
          vx: Math.cos(goc) * tocDo,
          vy: Math.sin(goc) * tocDo - (ng.gocGiua != null ? 1.5 : 3.5),
          r: 1.5 + Math.random() * 3.2,
          c: MAU[(i + Math.floor(Math.random() * 3)) % MAU.length],
          dai: Math.random() < 0.55,
          quay: Math.random() * 6,
          vQuay: (Math.random() - 0.5) * 0.3,
          tre: ng.tre || 0,
        });
      }
    });
    var batDau = performance.now();
    (function khung(t) {
      var tuoi = (t - batDau) / 1000;
      ctx.clearRect(0, 0, W, H);
      var con = false;
      for (var i = 0; i < hat.length; i += 1) {
        var h = hat[i];
        var tHat = tuoi - h.tre;
        if (tHat < 0) { con = true; continue; }
        if (tHat > 5.8) continue;
        con = true;
        h.vx *= 0.976;
        h.vy = h.vy * 0.976 + 0.14;
        h.x += h.vx;
        h.y += h.vy;
        h.quay += h.vQuay;
        var alpha = Math.max(0, 1 - tHat / 5.5);
        ctx.fillStyle = "rgba(" + h.c + "," + alpha + ")";
        if (h.dai) {
          ctx.save();
          ctx.translate(h.x, h.y);
          ctx.rotate(h.quay);
          ctx.fillRect(-h.r * 3.2, -h.r * 0.55, h.r * 6.4, h.r * 1.1);
          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      if (con && tuoi < 7) requestAnimationFrame(khung); else ctx.clearRect(0, 0, W, H);
    })(batDau);
  }

  /** cuongDo: 1 bình thường, 2 cho giải lớn. tamY: tỉ lệ chiều cao điểm bung (0-1). */
  function ban(canvas, cuongDo, tamY) {
    chayPhao(canvas, [{ tamX: 0.5, tamY: tamY == null ? 0.42 : tamY, cuongDo: cuongDo || 1 }]);
  }

  /** Bắn pháo 2 bên cánh gà sân khấu kiểu truyền hình lễ trao giải. */
  function banHaiBen(canvas, cuongDo) {
    var cd = cuongDo || 1.2;
    chayPhao(canvas, [
      { tamX: 0.08, tamY: 0.82, gocGiua: -Math.PI * 0.34, doRong: 0.75, cuongDo: cd, tre: 0 },
      { tamX: 0.92, tamY: 0.82, gocGiua: -Math.PI * 0.66, doRong: 0.75, cuongDo: cd, tre: 0.08 },
      { tamX: 0.5, tamY: 0.35, cuongDo: cd * 0.9, tre: 0.22 },
    ]);
  }

  root.Phao = { ban: ban, banHaiBen: banHaiBen };
})(window);
