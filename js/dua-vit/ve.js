/* Dựng cảnh đường đua: camera bám nhóm dẫn đầu, zoom khi nước rút và khi chụp ảnh về đích, hiệu ứng hạt. */
(function (root) {
  "use strict";

  var VN = root.VeNen, VV = root.VeVit;
  var MAU_HANG = ["#65a30d", "#d4a017", "#c2763a"];
  var HUD_TREN = 104, HUD_DUOI = 92;

  function taoBoVe(canvas) {
    var ctx = canvas.getContext("2d");
    var W = 0, H = 0, dpr = 1;
    var cam = { x: 0, y: 0, z: 1 };
    var t = 0, chop = 0;
    var hat = VV.taoHat();
    var cd = null;

    function coGian() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    }

    function hinhHoc() {
      var tren = HUD_TREN, duoi = H - HUD_DUOI;
      // Lề trong lòng sông: phía trên chừa chỗ cho đầu vịt và nhãn mốc khoảng cách, phía dưới cho bóng nước.
      var leTren = 52, leDuoi = 14;
      // Chừa vùng bảng dẫn đầu bên phải để vạch đích và nhóm dẫn đầu không bị che ở khung 1280×720.
      var vungBang = W > 900 ? Math.min(320, W * 0.27) + 36 : 0;
      var neoX = Math.max(W * 0.42, (W - vungBang) * 0.72);
      return { tren: tren, duoi: duoi, lanTren: tren + leTren, lanDuoi: duoi - leDuoi, dai: Math.max(W * 4.2, 4600), neoX: neoX, neoY: (tren + duoi) / 2 };
    }

    function chuanBi(cuocDua) {
      cd = cuocDua; hat.xoa(); chop = 0;
      var h = hinhHoc();
      cam = { x: h.neoX - 140, y: h.neoY, z: 1 };
    }

    function kichThuocVit(h) { return Math.min(64, ((h.lanDuoi - h.lanTren) / cd.soLan) * 1.0); }

    function viTriVit(v, h) {
      var caoLan = (h.lanDuoi - h.lanTren) / cd.soLan;
      return { x: v.viTri * h.dai, y: h.lanTren + (v.lan + 0.5) * caoLan + v.doLech * caoLan * 0.3 };
    }

    /** Nhận sự kiện từ mô phỏng để bắn hạt. */
    function suKien(ds) {
      var h = hinhHoc(), s = kichThuocVit(h);
      ds.forEach(function (e) {
        var p = viTriVit(cd.vit[e.chiSo], h);
        if (e.loai === "but" || e.loai === "vao-xiet") hat.bot(p.x, p.y, s, e.loai === "but" ? 14 : 8);
        else if (e.loai === "cham") hat.gon(p.x, p.y, s, "243,246,251");
        else if (e.loai === "vao-xoay") hat.gon(p.x, p.y, s, "255,90,95");
      });
    }

    function nhayDich() { chop = 1; }

    function capNhatCamera(h, top, che, dt) {
      // Tiêu điểm: trung bình vị trí 3 con đầu để thấy được cuộc tranh chấp.
      var tx = 0, ty = 0, n = 0;
      top.slice(0, 3).forEach(function (i) { var p = viTriVit(cd.vit[i], h); tx += p.x; ty += p.y; n += 1; });
      tx = n ? tx / n : 0; ty = n ? ty / n : h.neoY;
      cam.z += ((che.zoom || 1) - cam.z) * Math.min(1, dt * 2.2);
      // Đầu cuộc đua thấy vạch xuất phát; cuối cuộc đua vạch đích dừng ở điểm neo (khoảng 56% bề ngang).
      var xMuc = Math.max(h.neoX / cam.z - 140, Math.min(tx, h.dai));
      var yMuc = h.neoY + (ty - h.neoY) * Math.min(1, (cam.z - 1) * 1.6);
      var nuaCao = (h.neoY - h.tren + 30) / cam.z;
      yMuc = Math.max(h.tren - 30 + nuaCao, Math.min(yMuc, h.duoi + 30 - nuaCao));
      cam.x += (xMuc - cam.x) * Math.min(1, dt * 3.2);
      cam.y += (yMuc - cam.y) * Math.min(1, dt * 3.2);
    }

    /** che: { zoom, anhVeDich } do app điều khiển. */
    function ve(nhan, top, dt, che) {
      t += dt;
      var h = hinhHoc();
      var s = kichThuocVit(h);
      capNhatCamera(h, top, che, dt);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#eef3f8"; ctx.fillRect(0, 0, W, H);
      ctx.save();
      ctx.translate(h.neoX, h.neoY); ctx.scale(cam.z, cam.z); ctx.translate(-cam.x, -cam.y);
      var b = {
        tren: h.tren, duoi: h.duoi, lanTren: h.lanTren, lanDuoi: h.lanDuoi, xTrai: cam.x - h.neoX / cam.z, rong: W / cam.z,
        wx: function (p) { return p * h.dai; },
      };
      VN.veBo(ctx, b);
      VN.veNuoc(ctx, b, b.xTrai, t, che.boiCanh);
      if (che.boiCanh !== "khinh-khi-cau") VN.vePhao(ctx, b, cd.soLan);
      VN.veDiaHinh(ctx, b, cd.diaHinh, cd.soLan, t, Boolean(che.suKienBenhVien));
      VN.veMoc(ctx, b, cd.nuocRut);

      var hien = [];
      for (var j = 0; j < cd.vit.length; j += 1) {
        var p = viTriVit(cd.vit[j], h);
        if (p.x < b.xTrai - s * 3 || p.x > b.xTrai + b.rong + s) continue;
        hien.push({ j: j, x: p.x, y: p.y });
      }
      hien.sort(function (a, c) { return a.y - c.y; });
      var vanTocChuan = 1 / 30;
      hien.forEach(function (d) {
        var v = cd.vit[d.j];
        var nhun = Math.sin(t * 6 + d.j * 1.3) * s * 0.035;
        if (che.boiCanh !== "khinh-khi-cau") VV.veVetSong(ctx, d.x, d.y + nhun, s, v.vanTocHienTai / vanTocChuan);
        if (che.boiCanh === "khinh-khi-cau") {
          VV.veKhinhKhiCau(ctx, d.x, d.y + nhun, s, d.j, Math.sin(t * 2.5 + d.j) * 0.06, v.suKien === "but");
        } else if (che.boiCanh === "thuyen-rong") {
          VV.veThuyenRong(ctx, d.x, d.y + nhun, s, d.j, t, v.suKien === "but");
        } else {
          VV.veVit(ctx, d.x, d.y + nhun, s, d.j, v.suKien === "but" ? 0.08 : Math.sin(t * 3 + d.j) * 0.04);
        }
        d.y2 = d.y + nhun;
      });
      hat.capNhatVaVe(ctx, dt);

      // Nhãn mã cho nhóm dẫn đầu: xếp tránh chồng nhau theo thứ tự ưu tiên từ hạng 1, rồi vẽ hạng cao lên trên cùng.
      var vt = top.indexOf.bind(top);
      var cacNhan = hien.filter(function (d) { return vt(d.j) >= 0; })
        .sort(function (a, c) { return vt(a.j) - vt(c.j); })
        .map(function (d) { return { d: d, hang: vt(d.j), chu: nhan(d.j) }; });
      var oDaDat = [];
      var co = Math.max(15, Math.min(22, s * 0.34));
      ctx.font = "700 " + co + "px ui-monospace, 'SF Mono', Menlo, Consolas, monospace";
      cacNhan.forEach(function (item) {
        var w = ctx.measureText(item.chu).width + 18, hh = co + 12;
        var bx = item.d.x - w / 2;
        // Khinh khí cầu cao hơn vịt: nhãn đặt trên đỉnh cầu; thuyền rồng có đầu rồng vươn cao.
        var deNhan = che.boiCanh === "khinh-khi-cau" ? 0.92 : che.boiCanh === "thuyen-rong" ? 0.72 : 0.62;
        var byGoc = Math.max(h.tren + 6, item.d.y2 - s * deNhan - hh);
        var by = byGoc;
        var buocDich = [0, -(hh + 4), hh + 4, -(hh + 4) * 2, (hh + 4) * 2];
        for (var m = 0; m < buocDich.length; m += 1) {
          var thu = Math.max(h.tren + 6, Math.min(h.duoi - hh - 6, byGoc + buocDich[m]));
          var chong = false;
          for (var k = 0; k < oDaDat.length; k += 1) {
            var o = oDaDat[k];
            if (bx < o.x + o.w + 4 && bx + w + 4 > o.x && thu < o.y + o.h + 2 && thu + hh + 2 > o.y) { chong = true; break; }
          }
          if (!chong) { by = thu; break; }
        }
        item.bx = bx; item.by = by; item.w = w; item.hh = hh; item.co = co;
        oDaDat.push({ x: bx, y: by, w: w, h: hh });
      });
      cacNhan.reverse().forEach(function (item) {
        veNhan(item.d.x, item.d.y2, item.chu, item.bx, item.by, item.w, item.hh, item.co, item.hang);
      });
      ctx.restore();

      veLopPhu(che);
    }

    function veNhan(x, yVit, chu, bx, by, w, hh, co, hang) {
      ctx.font = "700 " + co + "px ui-monospace, 'SF Mono', Menlo, Consolas, monospace";
      var nen = hang === 0 ? "#d4ff3a" : "rgba(255,255,255,0.96)";
      ctx.fillStyle = nen; VN.roundRect(ctx, bx, by, w, hh, 6); ctx.fill();
      ctx.strokeStyle = hang === 0 ? "#65a30d" : "rgba(12,19,34,0.18)"; ctx.lineWidth = hang === 0 ? 2 : 1; ctx.stroke();
      var coVach = hang > 0 && hang < 3;
      if (coVach) { ctx.fillStyle = MAU_HANG[hang]; ctx.fillRect(bx, by + 4, 4, hh - 8); }
      ctx.fillStyle = "#0c1322";
      ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(chu, bx + w / 2 + (coVach ? 2 : 0), by + hh / 2 + 1);
      if (Math.abs(yVit - (by + hh)) < 90) {
        ctx.fillStyle = nen; ctx.beginPath(); ctx.moveTo(x - 5, by + hh); ctx.lineTo(x + 5, by + hh); ctx.lineTo(x, by + hh + 6); ctx.fill();
      }
    }

    /** Lớp phủ màn hình: viền tối và khung ngắm khi chụp ảnh về đích, chớp sáng khi có vịt qua vạch. */
    function veLopPhu(che) {
      if (che.anhVeDich > 0.01) {
        var a = che.anhVeDich;
        var g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.25, W / 2, H / 2, Math.max(W, H) * 0.7);
        g.addColorStop(0, "rgba(12,19,34,0)"); g.addColorStop(1, "rgba(12,19,34," + (0.4 * a) + ")");
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = "rgba(255,255,255," + (0.9 * a) + ")"; ctx.lineWidth = 3;
        var m = 40, l = 46;
        [[m, HUD_TREN + m, 1, 1], [W - m, HUD_TREN + m, -1, 1], [m, H - HUD_DUOI - m, 1, -1], [W - m, H - HUD_DUOI - m, -1, -1]].forEach(function (c) {
          ctx.beginPath(); ctx.moveTo(c[0], c[1] + l * c[3]); ctx.lineTo(c[0], c[1]); ctx.lineTo(c[0] + l * c[2], c[1]); ctx.stroke();
        });
      }
      if (chop > 0.01) { ctx.fillStyle = "rgba(255,255,255," + (0.35 * chop) + ")"; ctx.fillRect(0, 0, W, H); chop *= 0.86; }
    }

    coGian();
    return { ve: ve, coGian: coGian, chuanBi: chuanBi, suKien: suKien, nhayDich: nhayDich };
  }

  /** Thanh tiến độ cả đàn: mỗi con một chấm, 3 con đầu có màu riêng. */
  function veTienDo(canvas, vit, top, nuocRut) {
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = canvas.clientWidth, H = canvas.clientHeight;
    if (canvas.width !== Math.round(W * dpr)) { canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    var y = H / 2;
    ctx.fillStyle = "rgba(12,19,34,0.12)"; ctx.fillRect(0, y - 1, W, 2);
    ctx.fillStyle = "#a3d10f"; ctx.fillRect(nuocRut * W, y - 1, W * (1 - nuocRut), 2);
    ctx.fillStyle = "rgba(217,145,0,0.6)";
    for (var i = 0; i < vit.length; i += 1) ctx.fillRect(Math.min(1, vit[i].viTri) * W - 1, y - 6 + (i % 6) * 2, 2, 2);
    top.forEach(function (j, k) {
      ctx.fillStyle = MAU_HANG[k]; ctx.beginPath(); ctx.arc(Math.min(1, vit[j].viTri) * W, y, k === 0 ? 6 : 5, 0, Math.PI * 2); ctx.fill();
    });
  }

  root.Ve = { taoBoVe: taoBoVe, veTienDo: veTienDo, HUD_TREN: HUD_TREN, HUD_DUOI: HUD_DUOI };
})(window);
