/* Thước đo khoảng cách trực quan + sóng Radar trên Canvas 2D cho trò Đoán con số bệnh viện.
 * Vẽ trục số hiệu chuẩn, gắn cờ dự đoán của từng khu vực theo thời gian thực,
 * tia quét khi đang lật số, rồi phát sóng radar tỏa ra từ đáp án thật tới khu vực gần nhất. */
(function (root) {
  "use strict";

  var MAU_KHU = ["#0b4fd6", "#d97706", "#0f766e", "#4f46e5"];

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function tao(canvas) {
    var ctx = canvas.getContext("2d");
    var dsDoan = [];
    var dapAn = null;
    var daMo = false;
    var dangQuet = false;
    var mocQuet = 0;
    var mocMo = 0;
    var thang = [];
    var raf = 0;
    var dangChay = false;

    function kichThuoc() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = canvas.clientWidth || 900;
      var h = canvas.clientHeight || 190;
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { w: w, h: h };
    }

    function tinhBien() {
      var vals = dsDoan.filter(function (d) { return d.giaTri !== null; }).map(function (d) { return d.giaTri; });
      if (daMo && dapAn !== null) vals.push(dapAn);
      if (!vals.length) return { min: 0, max: 100 };
      var min = Math.min.apply(null, vals);
      var max = Math.max.apply(null, vals);
      if (min === max) {
        var bu = Math.max(10, Math.round(Math.abs(min) * 0.25) || 50);
        return { min: Math.max(0, min - bu), max: max + bu };
      }
      var le = (max - min) * 0.16;
      return { min: Math.max(0, Math.floor(min - le)), max: Math.ceil(max + le) };
    }

    function veKhung(t) {
      var kt = kichThuoc();
      var W = kt.w, H = kt.h;
      ctx.clearRect(0, 0, W, H);

      var leX = 64;
      var rong = Math.max(100, W - leX * 2);
      var trucY = H * 0.62;
      var bien = tinhBien();
      var tx = function (v) {
        var r = bien.max > bien.min ? (v - bien.min) / (bien.max - bien.min) : 0.5;
        return leX + Math.max(0, Math.min(1, r)) * rong;
      };

      // Thanh nền thước đo kiểu đồ họa thể thao
      ctx.fillStyle = "rgba(12,19,34,0.08)";
      roundRect(ctx, leX, trucY - 5, rong, 10, 5);
      ctx.fill();

      // Các vạch chia đều
      ctx.strokeStyle = "rgba(12,19,34,0.22)";
      ctx.lineWidth = 1.5;
      ctx.font = "700 12px ui-monospace, Menlo, monospace";
      ctx.fillStyle = "#5b6577";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      var soMoc = 5;
      for (var m = 0; m <= soMoc; m += 1) {
        var xMoc = leX + (m / soMoc) * rong;
        var vMoc = Math.round(bien.min + (m / soMoc) * (bien.max - bien.min));
        ctx.beginPath();
        ctx.moveTo(xMoc, trucY - 9);
        ctx.lineTo(xMoc, trucY + 9);
        ctx.stroke();
        ctx.fillText(root.DoanSo.dinhDangSo(vMoc), xMoc, trucY + 14);
      }

      // Tia quét Radar khi đang lật số
      if (dangQuet) {
        var pha = ((t - mocQuet) / 480);
        var xQuet = leX + (0.5 + 0.5 * Math.sin(pha * Math.PI)) * rong;
        var gQ = ctx.createLinearGradient(xQuet - 90, 0, xQuet + 90, 0);
        gQ.addColorStop(0, "rgba(212,255,58,0)");
        gQ.addColorStop(0.5, "rgba(212,255,58,0.65)");
        gQ.addColorStop(1, "rgba(212,255,58,0)");
        ctx.fillStyle = gQ;
        ctx.fillRect(Math.max(leX, xQuet - 90), trucY - 42, 180, 84);
        ctx.strokeStyle = "#65a30d";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(xQuet, trucY - 46);
        ctx.lineTo(xQuet, trucY + 20);
        ctx.stroke();
      }

      // Sóng Radar tỏa ra từ đáp án thật + đường nối tới khu thắng
      if (daMo && dapAn !== null) {
        var xDap = tx(dapAn);
        var tuoi = (t - mocMo) / 1000;

        // Vòng sóng radar lan tỏa liên tục
        for (var wv = 0; wv < 2; wv += 1) {
          var pSong = ((tuoi * 0.75 + wv * 0.5) % 1);
          var rSong = 12 + pSong * Math.min(rong * 0.45, 220);
          ctx.strokeStyle = "rgba(101,163,13," + ((1 - pSong) * 0.65) + ")";
          ctx.lineWidth = 3 * (1 - pSong) + 1;
          ctx.beginPath();
          ctx.arc(xDap, trucY, rSong, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Đoạn nối màu xanh chanh từ đáp án thật tới khu thắng
        thang.forEach(function (idx) {
          var d = dsDoan[idx];
          if (!d || d.giaTri === null) return;
          var xKhu = tx(d.giaTri);
          var tien = Math.min(1, tuoi * 2.2);
          var xDen = xDap + (xKhu - xDap) * tien;
          ctx.strokeStyle = "#65a30d";
          ctx.lineWidth = 6;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(xDap, trucY);
          ctx.lineTo(xDen, trucY);
          ctx.stroke();
        });

        // Cọc mốc đáp án thật
        ctx.strokeStyle = "#0c1322";
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(xDap, trucY + 12);
        ctx.lineTo(xDap, trucY - 58);
        ctx.stroke();

        ctx.fillStyle = "#d4ff3a";
        ctx.beginPath();
        ctx.arc(xDap, trucY, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#0c1322";
        ctx.lineWidth = 3;
        ctx.stroke();

        var nhanDap = "ĐÁP ÁN: " + root.DoanSo.dinhDangSo(dapAn);
        ctx.font = "800 14px ui-monospace, Menlo, monospace";
        var wD = ctx.measureText(nhanDap).width + 20;
        var bxD = Math.max(8, Math.min(W - wD - 8, xDap - wD / 2));
        ctx.fillStyle = "#0c1322";
        roundRect(ctx, bxD, trucY - 88, wD, 30, 8);
        ctx.fill();
        ctx.fillStyle = "#d4ff3a";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(nhanDap, bxD + wD / 2, trucY - 73);
      }

      // Gắn cờ dự đoán của các khu vực (tự phân tầng để không đè nhau)
      var coHopLe = dsDoan.map(function (d, i) {
        return { chiSo: i, ten: d.ten, giaTri: d.giaTri, x: d.giaTri !== null ? tx(d.giaTri) : null };
      }).filter(function (c) { return c.x !== null; }).sort(function (a, b) { return a.x - b.x; });

      var daDat = [];
      coHopLe.forEach(function (c) {
        var laThang = daMo && thang.indexOf(c.chiSo) >= 0;
        var chu = c.ten + " · " + root.DoanSo.dinhDangSo(c.giaTri);
        ctx.font = "800 13px system-ui, sans-serif";
        var wBox = ctx.measureText(chu).width + 18;
        var hBox = 28;
        var bx = Math.max(8, Math.min(W - wBox - 8, c.x - wBox / 2));
        var tang = 0;
        while (tang < 3) {
          var byThu = trucY - 46 - tang * 34;
          var chong = daDat.some(function (o) {
            return bx < o.x + o.w + 6 && bx + wBox + 6 > o.x && Math.abs(byThu - o.y) < 30;
          });
          if (!chong) break;
          tang += 1;
        }
        var by = Math.max(6, trucY - 46 - tang * 34);
        daDat.push({ x: bx, y: by, w: wBox, h: hBox });

        // Chân cờ
        ctx.strokeStyle = laThang ? "#65a30d" : MAU_KHU[c.chiSo % MAU_KHU.length];
        ctx.lineWidth = laThang ? 3.5 : 2;
        ctx.beginPath();
        ctx.moveTo(c.x, trucY);
        ctx.lineTo(c.x, by + hBox);
        ctx.stroke();

        // Chấm tròn trên trục
        ctx.beginPath();
        ctx.arc(c.x, trucY, laThang ? 7 : 5, 0, Math.PI * 2);
        ctx.fillStyle = laThang ? "#d4ff3a" : MAU_KHU[c.chiSo % MAU_KHU.length];
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Hộp nhãn cờ
        ctx.fillStyle = laThang ? "#d4ff3a" : MAU_KHU[c.chiSo % MAU_KHU.length];
        roundRect(ctx, bx, by, wBox, hBox, 8);
        ctx.fill();
        if (laThang) {
          ctx.strokeStyle = "#0c1322";
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        ctx.fillStyle = laThang ? "#0c1322" : "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(chu, bx + wBox / 2, by + hBox / 2 + 1);
      });

      if (!coHopLe.length && !daMo && !dangQuet) {
        ctx.fillStyle = "#5b6577";
        ctx.font = "600 15px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Nhập số dự đoán của các khu vực để ghim cờ trên thước đo trực quan", W / 2, trucY - 34);
      }
    }

    function batVongLap() {
      if (raf) return;
      dangChay = true;
      (function lap(t) {
        if (!dangChay) { raf = 0; return; }
        veKhung(t);
        raf = requestAnimationFrame(lap);
      })(performance.now());
    }

    return {
      capNhatDoan: function (ds) { dsDoan = ds || []; batVongLap(); },
      batDauQuet: function () { dangQuet = true; daMo = false; thang = []; mocQuet = performance.now(); batVongLap(); },
      chotDapAn: function (so, dsThang) { dangQuet = false; daMo = true; dapAn = so; thang = dsThang || []; mocMo = performance.now(); batVongLap(); },
      datLai: function () { dangQuet = false; daMo = false; dapAn = null; thang = []; batVongLap(); },
      dung: function () { dangChay = false; if (raf) { cancelAnimationFrame(raf); raf = 0; } },
    };
  }

  root.VeThuoc = { tao: tao };
})(window);
