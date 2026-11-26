/* Vẽ nền đường đua: mặt nước có ánh sáng gợn, phao chia làn, dòng xiết, xoáy nước, vạch xuất phát và đích. */
(function (root) {
  "use strict";

  var MAU = {
    nuocSau: "#2a8fd0", nuocGiua: "#45b3e8", nuocNong: "#62c6f0",
    anhSang: "rgba(255, 255, 255, 0.30)", phao: "#ff6b3d", phaoTrang: "#ffffff", day: "rgba(255,255,255,0.55)",
    xiet: "16, 185, 129", xoay: "229, 57, 53", bo: "#cfe8bf", co: "#9fd283",
  };
  var CHIEU_DAI_M = 200; // chiều dài quy ước của đường đua để hiển thị "còn … m"

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  /** Nước hoặc bầu trời tùy theo bối cảnh (vit | khinh-khi-cau | thuyen-rong). */
  function veNuoc(ctx, b, camX, t, boiCanh) {
    var g = ctx.createLinearGradient(0, b.tren, 0, b.duoi);
    if (boiCanh === "khinh-khi-cau") {
      g.addColorStop(0, "#38bdf8"); g.addColorStop(0.55, "#7dd3fc"); g.addColorStop(1, "#e0f2fe");
    } else if (boiCanh === "thuyen-rong") {
      // Sông xanh ngọc thẫm, gợi sông nước miền Bắc ngày hội đua thuyền.
      g.addColorStop(0, "#0b5e57"); g.addColorStop(0.35, "#13867b"); g.addColorStop(0.7, "#1a9e8f"); g.addColorStop(1, "#0b5e57");
    } else {
      g.addColorStop(0, MAU.nuocSau); g.addColorStop(0.35, MAU.nuocGiua); g.addColorStop(0.65, MAU.nuocNong); g.addColorStop(1, MAU.nuocSau);
    }
    ctx.fillStyle = g; ctx.fillRect(b.xTrai, b.tren, b.rong, b.duoi - b.tren);

    ctx.save();
    ctx.beginPath(); ctx.rect(b.xTrai, b.tren, b.rong, b.duoi - b.tren); ctx.clip();
    if (boiCanh === "khinh-khi-cau") {
      // Mây trắng bồng bềnh trôi theo chiều sâu
      var buocMay = 260;
      var batDauMay = Math.floor((b.xTrai - 180) / buocMay) * buocMay;
      for (var mx = batDauMay; mx < b.xTrai + b.rong + 220; mx += buocMay) {
        var idx = Math.abs(Math.round(mx / buocMay));
        var my = b.tren + 70 + ((idx * 137) % Math.max(120, Math.round(b.duoi - b.tren - 140)));
        var dx = mx - (t * 14) % buocMay;
        ctx.fillStyle = "rgba(255,255,255,0.45)";
        ctx.beginPath();
        ctx.arc(dx, my, 32, 0, Math.PI * 2);
        ctx.arc(dx + 28, my - 10, 38, 0, Math.PI * 2);
        ctx.arc(dx + 60, my, 28, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      return;
    }
    if (boiCanh === "thuyen-rong") { veSongNuocCo(ctx, b, camX, t); ctx.restore(); return; }
    ctx.lineCap = "round";
    var buoc = 34;
    for (var y = b.tren + 12, k = 0; y < b.duoi; y += buoc, k += 1) {
      var pha = t * (0.6 + (k % 3) * 0.15) + k * 1.7;
      ctx.strokeStyle = k % 2 ? MAU.anhSang : "rgba(255,255,255,0.16)";
      ctx.lineWidth = 2 + (k % 3);
      ctx.beginPath();
      var batDau = b.xTrai - ((camX * 0.92) % 260) - 260;
      for (var x = batDau; x < b.xTrai + b.rong + 260; x += 18) {
        var yy = y + Math.sin(x * 0.012 + pha) * 6 + Math.sin(x * 0.031 - pha * 1.3) * 3;
        if (x === batDau) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  /** Hoa văn sóng nước truyền thống (vảy cung chồng lớp như trên gốm, chạm khắc đình làng), trôi chậm. */
  function veSongNuocCo(ctx, b, camX, t) {
    var R = 26, buocX = R * 2, buocY = R * 0.9;
    ctx.lineWidth = 2;
    var batDauX = Math.floor((b.xTrai - buocX * 2) / buocX) * buocX;
    for (var hang = 0, y = b.tren + R * 0.6; y < b.duoi + R; y += buocY, hang += 1) {
      var lech = (hang % 2 ? R : 0) + ((t * 10 + hang * 7) % buocX);
      for (var x = batDauX; x < b.xTrai + b.rong + buocX * 2; x += buocX) {
        var cx = x + lech;
        ctx.strokeStyle = "rgba(255,255,255,0.16)";
        ctx.beginPath(); ctx.arc(cx, y, R, Math.PI, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = "rgba(255,255,255,0.09)";
        ctx.beginPath(); ctx.arc(cx, y, R * 0.62, Math.PI, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, y, R * 0.28, Math.PI, Math.PI * 2); ctx.stroke();
      }
    }
    // Ánh nắng lấp lánh rải rác
    ctx.fillStyle = "rgba(255,244,200,0.5)";
    for (var k = 0; k < 40; k += 1) {
      var sx = b.xTrai + ((k * 211 + camX * 0.3) % b.rong + b.rong) % b.rong;
      var sy = b.tren + ((k * 137) % Math.max(1, b.duoi - b.tren));
      var nhay = 0.5 + 0.5 * Math.sin(t * 3 + k);
      ctx.globalAlpha = nhay * 0.7;
      ctx.fillRect(sx, sy, 6, 1.5);
    }
    ctx.globalAlpha = 1;
  }

  /** Bờ sông hai bên (toạ độ thế giới, vẽ trong khung camera). */
  function veBo(ctx, b) {
    var x = b.xTrai - 10, w = b.rong + 20, NGOAI = 600;
    ctx.fillStyle = MAU.bo; ctx.fillRect(x, b.tren - NGOAI, w, NGOAI); ctx.fillRect(x, b.duoi, w, NGOAI);
    var g1 = ctx.createLinearGradient(0, b.tren - 26, 0, b.tren);
    g1.addColorStop(0, "rgba(159,210,131,0)"); g1.addColorStop(1, MAU.co);
    ctx.fillStyle = g1; ctx.fillRect(x, b.tren - 26, w, 26);
    var g2 = ctx.createLinearGradient(0, b.duoi, 0, b.duoi + 26);
    g2.addColorStop(0, MAU.co); g2.addColorStop(1, "rgba(159,210,131,0)");
    ctx.fillStyle = g2; ctx.fillRect(x, b.duoi, w, 26);
    ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.fillRect(x, b.tren - 1, w, 2); ctx.fillRect(x, b.duoi - 1, w, 2);
  }

  /** Dây phao chia làn: chấm phao trắng/cam xen kẽ. */
  function vePhao(ctx, b, soLan) {
    var caoLan = (b.lanDuoi - b.lanTren) / soLan;
    for (var l = 0; l <= soLan; l += 1) {
      var y = b.lanTren + l * caoLan;
      ctx.strokeStyle = MAU.day; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(b.xTrai, y); ctx.lineTo(b.xTrai + b.rong, y); ctx.stroke();
      var batDau = Math.ceil(b.xTrai / 26) * 26;
      for (var x = batDau, k = Math.floor(batDau / 26); x < b.xTrai + b.rong; x += 26, k += 1) {
        ctx.fillStyle = k % 6 === 0 ? MAU.phao : MAU.phaoTrang;
        ctx.globalAlpha = k % 6 === 0 ? 0.9 : 0.45;
        ctx.beginPath(); ctx.arc(x, y, k % 6 === 0 ? 3.2 : 2.2, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  }

  /** Dòng xiết: dải xanh ngọc có mũi tên trôi về phía đích. Xoáy nước: vòng xoắn đỏ quay. */
  function veDiaHinh(ctx, b, diaHinh, soLan, t, suKienBenhVien) {
    var caoLan = (b.lanDuoi - b.lanTren) / soLan;
    diaHinh.forEach(function (z) {
      var x0 = b.wx(z.tu), x1 = b.wx(z.den);
      if (x1 < b.xTrai - 40 || x0 > b.xTrai + b.rong + 40) return;
      var y0 = b.lanTren + z.lanTu * caoLan + 4, y1 = b.lanTren + (z.lanDen + 1) * caoLan - 4;
      if (z.loai === "xiet") {
        var g = ctx.createLinearGradient(x0, 0, x1, 0);
        g.addColorStop(0, "rgba(" + MAU.xiet + ",0)"); g.addColorStop(0.15, "rgba(" + MAU.xiet + ",0.20)");
        g.addColorStop(0.85, "rgba(" + MAU.xiet + ",0.20)"); g.addColorStop(1, "rgba(" + MAU.xiet + ",0)");
        ctx.fillStyle = g; roundRect(ctx, x0, y0, x1 - x0, y1 - y0, 10); ctx.fill();
        ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, y1 - y0); ctx.clip();
        ctx.strokeStyle = "rgba(" + MAU.xiet + ",0.75)"; ctx.lineWidth = 3; ctx.lineJoin = "round";
        var buoc = 46, lech = (t * 120) % buoc, h = Math.min(14, (y1 - y0) / 4);
        for (var y = y0 + caoLan / 2; y < y1; y += caoLan) {
          for (var x = x0 - buoc + lech; x < x1; x += buoc) {
            ctx.beginPath(); ctx.moveTo(x, y - h); ctx.lineTo(x + h, y); ctx.lineTo(x, y + h); ctx.stroke();
          }
        }
        ctx.restore();
        if (suKienBenhVien) {
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          nhanMoc(ctx, (x0 + x1) / 2, y0 + 16, "TIẾP SỨC", "rgba(16,185,129,0.92)", "#ffffff");
        }
      } else {
        var cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, r = Math.min((x1 - x0) / 2, (y1 - y0) / 2) + 6;
        var rg = ctx.createRadialGradient(cx, cy, 2, cx, cy, r);
        rg.addColorStop(0, "rgba(" + MAU.xoay + ",0.35)"); rg.addColorStop(1, "rgba(" + MAU.xoay + ",0)");
        ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "rgba(" + MAU.xoay + ",0.7)"; ctx.lineWidth = 2.5;
        for (var vong = 0; vong < 3; vong += 1) {
          ctx.beginPath();
          for (var a = 0; a < Math.PI * 3; a += 0.15) {
            var rr = (a / (Math.PI * 3)) * r * 0.9;
            var gx = cx + Math.cos(a + t * 2.4 + vong * 2.1) * rr, gy = cy + Math.sin(a + t * 2.4 + vong * 2.1) * rr * 0.75;
            if (a === 0) ctx.moveTo(gx, gy); else ctx.lineTo(gx, gy);
          }
          ctx.stroke();
        }
        if (suKienBenhVien) {
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          nhanMoc(ctx, cx, y0 + 16, "KẸT THANG MÁY", "rgba(229,57,53,0.92)", "#ffffff");
        }
      }
    });
  }

  /** Nhãn trắng nằm trong lòng sông, sát mép trên (thanh thông tin phía trên che mất phần bờ). */
  function nhanMoc(ctx, x, y, chu, mauNen, mauChu) {
    ctx.font = "800 15px system-ui, 'Segoe UI', sans-serif";
    var w = ctx.measureText(chu).width + 18;
    ctx.fillStyle = mauNen; roundRect(ctx, x - w / 2, y - 13, w, 26, 6); ctx.fill();
    ctx.fillStyle = mauChu; ctx.fillText(chu, x, y + 1);
  }

  /** Mốc khoảng cách, vạch xuất phát, vạch nước rút, vạch đích ca-rô. */
  function veMoc(ctx, b, nuocRut) {
    var yNhan = b.tren + 24;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    [0.25, 0.5, 0.75].forEach(function (p) {
      var x = b.wx(p);
      if (x < b.xTrai - 60 || x > b.xTrai + b.rong + 60) return;
      ctx.strokeStyle = "rgba(255,255,255,0.6)"; ctx.setLineDash([2, 10]); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x, b.tren); ctx.lineTo(x, b.duoi); ctx.stroke(); ctx.setLineDash([]);
      nhanMoc(ctx, x, yNhan, Math.round(CHIEU_DAI_M * p) + " m", "rgba(255,255,255,0.92)", "#0c1322");
    });
    var xr = b.wx(nuocRut);
    if (xr > b.xTrai - 60 && xr < b.xTrai + b.rong + 60) {
      ctx.fillStyle = "rgba(212,255,58,0.16)"; ctx.fillRect(xr, b.tren, b.wx(1) - xr, b.duoi - b.tren);
      ctx.strokeStyle = "#a3d10f"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(xr, b.tren); ctx.lineTo(xr, b.duoi); ctx.stroke();
      nhanMoc(ctx, xr, yNhan, "NƯỚC RÚT", "#d4ff3a", "#0c1322");
    }
    var xp = b.wx(0);
    if (xp > b.xTrai - 20 && xp < b.xTrai + b.rong + 20) { ctx.fillStyle = "rgba(255,255,255,0.95)"; ctx.fillRect(xp - 2, b.tren, 4, b.duoi - b.tren); }
    var xd = b.wx(1);
    if (xd > b.xTrai - 60 && xd < b.xTrai + b.rong + 60) {
      var o = 12;
      for (var y = b.tren, k = 0; y < b.duoi; y += o, k += 1) {
        ctx.fillStyle = k % 2 ? "#0c1322" : "#ffffff"; ctx.fillRect(xd, y, o, o);
        ctx.fillStyle = k % 2 ? "#ffffff" : "#0c1322"; ctx.fillRect(xd + o, y, o, o);
      }
      nhanMoc(ctx, xd + o, yNhan, "ĐÍCH · " + CHIEU_DAI_M + " m", "#0c1322", "#ffffff");
    }
  }

  root.VeNen = { veNuoc: veNuoc, veBo: veBo, vePhao: vePhao, veDiaHinh: veDiaHinh, veMoc: veMoc, roundRect: roundRect, CHIEU_DAI_M: CHIEU_DAI_M };
})(window);
