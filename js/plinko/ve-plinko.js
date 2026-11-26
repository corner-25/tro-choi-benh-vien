/* Mô phỏng vật lý 2D và vẽ sân khấu Thả bi Plinko trên Canvas 2D:
 * thanh ray xe thả đồng bộ 3 cổng + cửa sập cơ khí, rừng chốt phát sáng có sóng gợn,
 * 2 tấm bật lò xo rung tháp, 6 trụ vách ngăn đáy có nảy, mở rộng cửa Đặc biệt 1,35x,
 * Photo-Finish Cận Đích (zoom 1,38x + slow-motion 0,30x) và tổng hợp âm gỗ ngũ cung nội bộ. */
(function (root) {
  "use strict";

  var MAU_BI = ["#0b4fd6", "#d97706", "#0f766e", "#4f46e5", "#e53935", "#0284c7", "#65a30d", "#c2410c"];
  var NGU_CUNG = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51, 1567.98];
  var VI_TRI_CONG = { "trai": 0.24, "giua": 0.50, "phai": 0.76 };

  function roundRect(ctx, x, y, w, h, r) {
    var rad = Math.min(r, w * 0.5, h * 0.5);
    ctx.beginPath();
    ctx.moveTo(x + rad, y);
    ctx.arcTo(x + w, y, x + w, y + h, rad);
    ctx.arcTo(x + w, y + h, x, y + h, rad);
    ctx.arcTo(x, y + h, x, y, rad);
    ctx.arcTo(x, y, x + w, y, rad);
    ctx.closePath();
  }

  /** Bộ tổng hợp âm Web Audio nội bộ riêng cho Plinko (không sửa js/chung/am-thanh.js). */
  function taoAmNoiBo(amThanh) {
    var ac = null;
    var lanGoCuoi = 0;

    function layCtx() {
      if (!amThanh || !amThanh.dangBat()) return null;
      if (!ac) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        try { ac = new AC(); } catch (e) { return null; }
      }
      if (ac.state === "suspended") ac.resume().catch(function () {});
      return ac;
    }

    return {
      moKhoa: function () { layCtx(); },
      goChot: function (yChuanHoa, biDai) {
        var a = layCtx();
        if (!a) return;
        var gio = performance.now();
        if (gio - lanGoCuoi < 36) return;
        lanGoCuoi = gio;
        var tiLe = Math.max(0, Math.min(0.999, (yChuanHoa - 0.12) / 0.72));
        var idx = Math.floor(tiLe * NGU_CUNG.length);
        var f = NGU_CUNG[idx] * (biDai ? 0.94 : 1);
        var t = a.currentTime;
        var o = a.createOscillator();
        var g = a.createGain();
        o.type = "triangle";
        o.frequency.setValueAtTime(f, t);
        o.frequency.exponentialRampToValueAtTime(f * 0.985, t + 0.065);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(biDai ? 0.13 : 0.085, t + 0.006);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.075);
        o.connect(g);
        g.connect(a.destination);
        o.start(t);
        o.stop(t + 0.085);
      },
      batLoXo: function () {
        var a = layCtx();
        if (!a) return;
        var t = a.currentTime;
        var o = a.createOscillator();
        var g = a.createGain();
        o.type = "triangle";
        o.frequency.setValueAtTime(240, t);
        o.frequency.exponentialRampToValueAtTime(760, t + 0.13);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.16, t + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
        o.connect(g);
        g.connect(a.destination);
        o.start(t);
        o.stop(t + 0.18);
      },
      dapVach: function (canhDacBiet) {
        var a = layCtx();
        if (!a) return;
        var t = a.currentTime;
        var o = a.createOscillator();
        var g = a.createGain();
        o.type = canhDacBiet ? "sine" : "triangle";
        o.frequency.setValueAtTime(canhDacBiet ? 988 : 340, t);
        o.frequency.exponentialRampToValueAtTime(canhDacBiet ? 740 : 210, t + 0.08);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(canhDacBiet ? 0.14 : 0.09, t + 0.008);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
        o.connect(g);
        g.connect(a.destination);
        o.start(t);
        o.stop(t + 0.1);
      },
      moCuaSap: function () {
        var a = layCtx();
        if (!a) return;
        var t = a.currentTime;
        var o = a.createOscillator();
        var g = a.createGain();
        o.type = "square";
        o.frequency.setValueAtTime(420, t);
        o.frequency.exponentialRampToValueAtTime(190, t + 0.045);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.05, t + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
        o.connect(g);
        g.connect(a.destination);
        o.start(t);
        o.stop(t + 0.06);
      },
    };
  }

  function tao(canvas, amThanh, onChamO) {
    var ctx = canvas.getContext("2d");
    var oDay = root.Plinko.O_DAY_MAC_DINH;
    var rng = root.Plinko.rngMatMa();
    var amNoiBo = taoAmNoiBo(amThanh);

    var moRongGiua = false;
    var cheDo = "mua-bong";
    var congTha = "ngau-nhien";
    var thap = root.Plinko.taoThap(9, { moRongGiua: false });

    var bi = [];
    var hat = [];
    var songGon = [];
    var sangO = oDay.map(function () { return 0; });
    var chop = 0;
    var rungThap = 0;
    var xXe = 0.5;
    var xMucTieuXe = 0.5;
    var cuaSap = 0;

    var dangChay = false;
    var raf = 0;
    var tTruoc = performance.now();
    var hangCho = [];
    var boDemTha = 0;
    var onXongTatCa = null;
    var onSuKien = null;
    var daBaoXong = true;
    var maTieuDiemCu = "";

    // Camera Photo-Finish Cận Đích
    var tocDoTG = 1;
    var camZoom = 1;
    var camX = 0.5;
    var camY = 0.5;
    var manToiCanCanh = 0;
    var canCanhDangBat = false;
    var giuCanCanh = 0;
    var daPhatCanCanh = false;

    function kichThuoc() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = canvas.clientWidth || 860;
      var h = canvas.clientHeight || 620;
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { w: w, h: h };
    }

    function banTia(x, y, mau, so) {
      for (var i = 0; i < so; i += 1) {
        var g = Math.random() * Math.PI * 2;
        var sp = 1.4 + Math.random() * 4.4;
        hat.push({
          x: x, y: y,
          vx: Math.cos(g) * sp,
          vy: Math.sin(g) * sp - 1.1,
          song: 0,
          tho: 0.34 + Math.random() * 0.24,
          r: 2 + Math.random() * 2.6,
          mau: mau,
        });
      }
      if (hat.length > 360) hat = hat.slice(-360);
    }

    function taoSong(x, y, rDau, rCuoi, mau) {
      songGon.push({ x: x, y: y, rDau: rDau, rCuoi: rCuoi, mau: mau, t: 0, tho: 0.34 });
      if (songGon.length > 60) songGon.shift();
    }

    function chonDichXeChoBi() {
      if (VI_TRI_CONG[congTha] != null) {
        return VI_TRI_CONG[congTha] + (rng() - 0.5) * 0.03;
      }
      return 0.22 + rng() * 0.56;
    }

    function banSuKien(loai, duLieu) {
      if (!onSuKien) return;
      var payload = Object.assign({ loai: loai }, duLieu || {});
      onSuKien(payload);
    }

    function taoBi(nguoi, chiSo) {
      var laBiVang = cheDo === "bi-vang";
      var xTha = Math.max(0.10, Math.min(0.90, xXe + (rng() - 0.5) * 0.03));
      cuaSap = 1;
      amNoiBo.moCuaSap();
      return {
        nguoi: nguoi,
        chiSo: chiSo,
        laBiVang: laBiVang,
        heSoCo: laBiVang ? 1.75 : 1.0,
        mau: laBiVang ? "#f59e0b" : MAU_BI[chiSo % MAU_BI.length],
        x: xTha,
        y: 0.062,
        vx: (rng() - 0.5) * 0.11,
        vy: 0.03,
        r: 0.0155,
        daVaoO: false,
        oChiSo: -1,
        duoi: [],
        daBaoSatDacBiet: false,
        daBaoLoXo: false,
      };
    }

    function capNhatXe(dtRaw, t) {
      cuaSap = Math.max(0, cuaSap - dtRaw * 4.5);
      if (hangCho.length > 0) {
        xXe += (xMucTieuXe - xXe) * Math.min(1, dtRaw * 16);
      } else if (VI_TRI_CONG[congTha] != null) {
        xMucTieuXe = VI_TRI_CONG[congTha];
        xXe += (xMucTieuXe - xXe) * Math.min(1, dtRaw * 10);
      } else {
        var xLuon = 0.5 + 0.24 * Math.sin(t * 0.0022);
        xXe += (xLuon - xXe) * Math.min(1, dtRaw * 5);
      }
    }

    function xuLyVaChamDoanThang(b, W, H, rBall, x1, y1, x2, y2, rDoan, doNay, laCanhDacBiet, obj) {
      var bx = b.x * W;
      var by = b.y * H;
      var dxS = x2 - x1;
      var dyS = y2 - y1;
      var len2 = dxS * dxS + dyS * dyS;
      var proj = len2 > 0.0001 ? ((bx - x1) * dxS + (by - y1) * dyS) / len2 : 0;
      proj = Math.max(0, Math.min(1, proj));
      var px = x1 + proj * dxS;
      var py = y1 + proj * dyS;
      var dx = bx - px;
      var dy = by - py;
      var dist = Math.hypot(dx, dy);
      var minD = rBall + rDoan;
      if (dist >= minD || dist <= 0.0001) return false;

      var nx = dx / dist;
      var ny = dy / dist;
      var chong = minD - dist;
      bx += nx * chong;
      by += ny * chong;
      b.x = bx / W;
      b.y = by / H;

      var vxPx = b.vx * W;
      var vyPx = b.vy * H;
      var dot = vxPx * nx + vyPx * ny;
      if (dot < 0) {
        vxPx -= (1 + doNay) * dot * nx;
        vyPx -= (1 + doNay) * dot * ny;
        // Nếu đập đúng đầu bo tròn trên đỉnh vách ngăn, thêm nhiễu vi mô từ crypto để lắc 1-2 nhịp đầy kịch tính
        if (proj <= 0.08 && Math.abs(nx) < 0.45) {
          vxPx += (rng() - 0.5) * 0.14 * W;
          vyPx = Math.min(vyPx, -Math.max(45, Math.abs(dot) * 0.52));
        }
        b.vx = vxPx / W;
        b.vy = vyPx / H;
        if (obj) obj.sang = 1;
        if (Math.abs(dot) > 26) {
          amNoiBo.dapVach(laCanhDacBiet);
          if (laCanhDacBiet) {
            rungThap = Math.max(rungThap, 1);
            banTia(px, py, "212,255,58", 8);
            taoSong(px, py, rDoan + 2, rDoan + 24, "212,255,58");
            if (!b.daBaoSatDacBiet) {
              b.daBaoSatDacBiet = true;
              banSuKien("sat-dac-biet", { nguoi: b.nguoi });
            }
          } else {
            banTia(px, py, "148,163,184", 4);
          }
        }
      }
      return true;
    }

    function buocVatLy(dtRaw, W, H, t) {
      capNhatXe(dtRaw, t);

      // Giảm rung tháp tắt dần trong ~160ms
      if (rungThap > 0) {
        rungThap = Math.max(0, rungThap - dtRaw / 0.16);
      }

      // Tính trạng thái Photo-Finish Cận Đích trước khi bước vật lý
      var biDangRoi = [];
      for (var biIdx = 0; biIdx < bi.length; biIdx += 1) {
        if (!bi[biIdx].daVaoO) biDangRoi.push(bi[biIdx]);
      }

      var biCuoi = biDangRoi.length === 1 && hangCho.length === 0 ? biDangRoi[0] : null;
      var kichHoatCanCanh = Boolean(
        biCuoi && biCuoi.y > 0.72 && biCuoi.x >= 0.26 && biCuoi.x <= 0.74
      );

      if (kichHoatCanCanh) {
        canCanhDangBat = true;
        giuCanCanh = 0.45;
        if (!daPhatCanCanh) {
          daPhatCanCanh = true;
          if (amThanh) amThanh.trongDon(1200);
          banSuKien("can-canh", { nguoi: biCuoi.nguoi });
        }
        tocDoTG += (0.30 - tocDoTG) * Math.min(1, dtRaw * 11);
        camZoom += (1.38 - camZoom) * Math.min(1, dtRaw * 6.5);
        camX += (biCuoi.x - camX) * Math.min(1, dtRaw * 7.5);
        camY += (biCuoi.y - camY) * Math.min(1, dtRaw * 7.5);
        manToiCanCanh += (0.22 - manToiCanCanh) * Math.min(1, dtRaw * 6);
      } else if (giuCanCanh > 0 && biDangRoi.length === 0 && hangCho.length === 0) {
        giuCanCanh = Math.max(0, giuCanCanh - dtRaw);
        tocDoTG += (0.65 - tocDoTG) * Math.min(1, dtRaw * 6);
        manToiCanCanh += (0.14 - manToiCanCanh) * Math.min(1, dtRaw * 4);
      } else {
        canCanhDangBat = false;
        tocDoTG += (1.0 - tocDoTG) * Math.min(1, dtRaw * 8);
        camZoom += (1.0 - camZoom) * Math.min(1, dtRaw * 5.5);
        camX += (0.5 - camX) * Math.min(1, dtRaw * 5.5);
        camY += (0.5 - camY) * Math.min(1, dtRaw * 5.5);
        manToiCanCanh += (0 - manToiCanCanh) * Math.min(1, dtRaw * 6);
      }

      var dt = dtRaw * tocDoTG;

      // Thả nối tiếp từng quả bi từ hàng chờ, đồng bộ đúng vị trí xe thả xXe
      if (hangCho.length) {
        boDemTha -= dtRaw;
        if (boDemTha <= 0 && Math.abs(xXe - xMucTieuXe) < 0.045) {
          var item = hangCho.shift();
          var quaMoi = taoBi(item.nguoi, item.chiSo);
          bi.push(quaMoi);
          boDemTha = cheDo === "bi-vang" ? 0.92 : 0.18;
          if (hangCho.length > 0) {
            xMucTieuXe = chonDichXeChoBi();
          }
        }
      }

      var M = Math.min(W, H);
      var soBuocCon = 2;
      var subDt = dt / soBuocCon;

      for (var step = 0; step < soBuocCon; step += 1) {
        for (var bIdx = 0; bIdx < bi.length; bIdx += 1) {
          var b = bi[bIdx];
          if (b.daVaoO) continue;

          b.vy += 0.64 * subDt;
          b.vx *= Math.pow(0.993, subDt * 60);
          b.vx = Math.max(-0.95, Math.min(0.95, b.vx));
          b.vy = Math.max(-0.85, Math.min(1.15, b.vy));
          b.x += b.vx * subDt;
          b.y += b.vy * subDt;

          var rBall = Math.max(10, b.r * M * b.heSoCo);
          var leMinX = Math.max(0.045, (0.04 * W + rBall) / W);
          var leMaxX = Math.min(0.955, (0.96 * W - rBall) / W);

          if (b.x < leMinX) { b.x = leMinX; b.vx = Math.abs(b.vx) * 0.62; }
          if (b.x > leMaxX) { b.x = leMaxX; b.vx = -Math.abs(b.vx) * 0.62; }

          var bx = b.x * W;
          var by = b.y * H;

          // Va chạm rừng chốt đinh trong không gian pixel đồng nhất
          for (var i = 0; i < thap.chot.length; i += 1) {
            var c = thap.chot[i];
            var cx = c.x * W;
            var cy = c.y * H;
            var rPin = Math.max(4.5, c.r * M);
            var dx = bx - cx;
            var dy = by - cy;
            var dist = Math.hypot(dx, dy);
            var minD = rBall + rPin;
            if (dist < minD && dist > 0.0001) {
              var nx = dx / dist;
              var ny = dy / dist;
              var chong = minD - dist;
              bx += nx * chong;
              by += ny * chong;
              b.x = bx / W;
              b.y = by / H;
              var vxPx = b.vx * W;
              var vyPx = b.vy * H;
              var dot = vxPx * nx + vyPx * ny;
              if (dot < 0) {
                vxPx -= 1.58 * dot * nx;
                vyPx -= 1.58 * dot * ny;
                // Nhiễu vi mô từ crypto.getRandomValues đảm bảo công bằng tuyệt đối, không kẹt đỉnh chốt
                vxPx += (rng() - 0.5) * 0.11 * W;
                b.vx = vxPx / W;
                b.vy = vyPx / H;
                c.sang = 1;
                banTia(cx, cy, b.laBiVang ? "245,158,11" : "212,255,58", b.laBiVang ? 6 : 4);
                taoSong(cx, cy, rPin, rPin + 16, "212,255,58");
                amNoiBo.goChot(b.y, b.laBiVang);
              }
            }
          }

          // Va chạm 2 tấm bật lò xo giữa tháp
          for (var k = 0; k < thap.loXo.length; k += 1) {
            var lx = thap.loXo[k];
            var lxx = lx.x * W;
            var lxy = lx.y * H;
            var rLx = Math.max(14, lx.r * M);
            var dx2 = bx - lxx;
            var dy2 = by - lxy;
            var d2 = Math.hypot(dx2, dy2);
            var min2 = rBall + rLx;
            if (d2 < min2 && d2 > 0.0001) {
              var nx2 = dx2 / d2;
              var ny2 = dy2 / d2;
              bx += nx2 * (min2 - d2);
              by += ny2 * (min2 - d2);
              b.x = bx / W;
              b.y = by / H;
              b.vx = (nx2 * 0.44 * M) / W + (rng() - 0.5) * 0.12;
              b.vy = Math.min(-0.22, (ny2 * 0.36 * M) / H);
              lx.sang = 1;
              rungThap = Math.max(rungThap, 0.9);
              banTia(lxx, lxy, "16,185,129", 12);
              taoSong(lxx, lxy, rLx, rLx + 28, "16,185,129");
              amNoiBo.batLoXo();
              if (!b.daBaoLoXo) {
                b.daBaoLoXo = true;
                banSuKien("lo-xo", { nguoi: b.nguoi });
              }
            }
          }

          // Va chạm 2 đệm nghiêng rìa
          for (var dIdx = 0; dIdx < thap.demRia.length; dIdx += 1) {
            var dm = thap.demRia[dIdx];
            xuLyVaChamDoanThang(b, W, H, rBall, dm.x1 * W, dm.y1 * H, dm.x2 * W, dm.y2 * H, 5, 0.55, false, dm);
          }

          // Va chạm 6 trụ vách ngăn thẳng đứng có đầu bo tròn ở đáy
          for (var vIdx = 0; vIdx < thap.vachNgan.length; vIdx += 1) {
            var vn = thap.vachNgan[vIdx];
            var rVach = Math.max(4.5, vn.r * M);
            xuLyVaChamDoanThang(
              b, W, H, rBall,
              vn.x * W, vn.yTren * H,
              vn.x * W, vn.yDuoi * H,
              rVach, 0.62, vn.canhDacBiet, vn
            );
          }

          // Chạm đáy vào ô giải thưởng tại y >= 0.915
          if (b.y >= 0.915) {
            b.y = 0.915;
            b.vx = 0;
            b.vy = 0;
            b.daVaoO = true;
            b.oChiSo = root.Plinko.tinhO(b.x, oDay.length, moRongGiua);
            sangO[b.oChiSo] = 1;
            var giai = oDay[b.oChiSo];
            if (giai.bac === 1) {
              chop = 1;
              rungThap = 1;
              banTia(b.x * W, b.y * H, "212,255,58", 28);
              taoSong(b.x * W, b.y * H, 12, 72, "212,255,58");
              if (amThanh) amThanh.trung(true);
            } else {
              banTia(b.x * W, b.y * H, "11,79,214", 10);
              if (amThanh) amThanh.cach(false);
            }
            banSuKien("cham-o", { nguoi: b.nguoi, giai: giai, oChiSo: b.oChiSo });
            if (onChamO) onChamO(b.nguoi, giai, b.oChiSo);
          }
        }
      }

      // Lưu vệt đuôi và xác định bi tiêu điểm đang rơi gần đáy nhất
      var biNoiBat = null;
      var conRoi = 0;
      for (var j = 0; j < bi.length; j += 1) {
        var b2 = bi[j];
        if (!b2.daVaoO) {
          conRoi += 1;
          b2.duoi.push({ x: b2.x, y: b2.y });
          if (b2.duoi.length > (b2.laBiVang ? 14 : 9)) b2.duoi.shift();
          if (!biNoiBat || b2.y > biNoiBat.y) biNoiBat = b2;
        }
      }

      if (biNoiBat && biNoiBat.nguoi.ma !== maTieuDiemCu) {
        maTieuDiemCu = biNoiBat.nguoi.ma;
        banSuKien("tieu-diem", { nguoi: biNoiBat.nguoi });
      }

      if (!hangCho.length && conRoi === 0 && bi.length > 0 && !daBaoXong) {
        daBaoXong = true;
        if (onXongTatCa) onXongTatCa();
      }

      return biNoiBat;
    }

    function veChuNhieuDong(text, cx, cy, maxW, coChu) {
      ctx.font = "900 " + coChu + "px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      if (ctx.measureText(text).width <= maxW) {
        ctx.fillText(text, cx, cy);
        return;
      }
      var tu = text.split(" ");
      var dong1 = text;
      var dong2 = "";
      if (tu.length >= 2) {
        var giua = Math.ceil(tu.length / 2);
        if (tu.length === 3 && tu[0].toUpperCase() === "GIẢI") giua = 1;
        dong1 = tu.slice(0, giua).join(" ");
        dong2 = tu.slice(giua).join(" ");
      }
      var c2 = coChu;
      while (c2 > 13 && (ctx.measureText(dong1).width > maxW || ctx.measureText(dong2).width > maxW)) {
        c2 -= 1;
        ctx.font = "900 " + c2 + "px system-ui, -apple-system, sans-serif";
      }
      if (dong2) {
        var cach = c2 * 0.62;
        ctx.fillText(dong1, cx, cy - cach);
        ctx.fillText(dong2, cx, cy + cach);
      } else {
        ctx.fillText(dong1, cx, cy);
      }
    }

    function ve(t, dtRaw) {
      var kt = kichThuoc();
      var W = kt.w;
      var H = kt.h;
      var M = Math.min(W, H);
      var biNoiBat = buocVatLy(dtRaw, W, H, t);

      ctx.clearRect(0, 0, W, H);

      ctx.save();

      // Áp dụng camera Photo-Finish Cận Đích (kẹp biên để không bao giờ hở nền ngoài)
      if (camZoom > 1.002) {
        var tx = camX * W;
        var ty = camY * H;
        var nuaW = W / (2 * camZoom);
        var nuaH = H / (2 * camZoom);
        tx = Math.max(nuaW, Math.min(W - nuaW, tx));
        ty = Math.max(nuaH, Math.min(H - nuaH, ty));
        ctx.translate(W / 2, H / 2);
        ctx.scale(camZoom, camZoom);
        ctx.translate(-tx, -ty);
      }

      // Rung vi mô tháp (±3px) khi đập lò xo hoặc chạm vách Đặc biệt
      if (rungThap > 0.01) {
        var bienDo = 3 * rungThap;
        ctx.translate((Math.random() - 0.5) * 2 * bienDo, (Math.random() - 0.5) * 2 * bienDo);
      }

      // Nền bảng tháp sáng thể thao
      var gNen = ctx.createLinearGradient(0, 0, 0, H);
      gNen.addColorStop(0, "#ffffff");
      gNen.addColorStop(1, "#e8eff8");
      ctx.fillStyle = gNen;
      roundRect(ctx, 8, 8, W - 16, H - 16, 20);
      ctx.fill();
      ctx.strokeStyle = "rgba(12,19,34,0.14)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Đường dẫn sáng mờ hướng về ô GIẢI ĐẶC BIỆT
      var ranhO = thap.ranhO || root.Plinko.tinhRanhO(oDay.length, moRongGiua);
      var giuaIdx = Math.floor(oDay.length / 2);
      var xDbTrai = ranhO[giuaIdx] * W;
      var xDbPhai = ranhO[giuaIdx + 1] * W;
      var gHanhLang = ctx.createLinearGradient(0, H * 0.55, 0, H * 0.88);
      gHanhLang.addColorStop(0, "rgba(212,255,58,0)");
      gHanhLang.addColorStop(1, moRongGiua ? "rgba(212,255,58,0.22)" : "rgba(212,255,58,0.11)");
      ctx.fillStyle = gHanhLang;
      ctx.fillRect(xDbTrai, H * 0.55, xDbPhai - xDbTrai, H * 0.33);

      // Thanh ray thả bóng ở đỉnh tháp + 3 mốc Cổng Chọn Nhanh
      var yRay = Math.max(22, H * 0.036);
      ctx.fillStyle = "#0c1322";
      roundRect(ctx, W * 0.14, yRay - 5, W * 0.72, 10, 5);
      ctx.fill();

      var danhSachMoc = [
        { ma: "trai", nhan: "[1] TRÁI", x: 0.24 },
        { ma: "giua", nhan: "[2] GIỮA", x: 0.50 },
        { ma: "phai", nhan: "[3] PHẢI", x: 0.76 },
      ];
      danhSachMoc.forEach(function (mc) {
        var chon = congTha === mc.ma;
        var mx = mc.x * W;
        ctx.fillStyle = chon ? "#0c1322" : "rgba(255,255,255,0.92)";
        roundRect(ctx, mx - 40, yRay + 10, 80, 20, 6);
        ctx.fill();
        ctx.strokeStyle = chon ? "#d4ff3a" : "rgba(12,19,34,0.18)";
        ctx.lineWidth = chon ? 2 : 1;
        ctx.stroke();
        ctx.fillStyle = chon ? "#d4ff3a" : "#475569";
        ctx.font = "800 10.5px ui-monospace, Menlo, monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(mc.nhan, mx, yRay + 20);
      });

      // Xe thả bóng đồng bộ xXe + 2 cánh cửa sập cơ khí
      var xePx = xXe * W;
      var rongXe = cheDo === "bi-vang" ? 56 : 46;
      ctx.fillStyle = cheDo === "bi-vang" ? "#f59e0b" : "#d4ff3a";
      roundRect(ctx, xePx - rongXe / 2, yRay - 13, rongXe, 24, 7);
      ctx.fill();
      ctx.strokeStyle = "#0c1322";
      ctx.lineWidth = 2.5;
      ctx.stroke();
      // Đèn báo trên xe
      ctx.fillStyle = "#0c1322";
      ctx.beginPath();
      ctx.arc(xePx, yRay - 1, 4, 0, Math.PI * 2);
      ctx.fill();
      // 2 cánh cửa sập mở xuống khi nhả bi
      var gocMo = cuaSap * 0.95;
      ctx.strokeStyle = "#0c1322";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(xePx - 14, yRay + 11);
      ctx.lineTo(xePx - 14 + Math.cos(gocMo) * 12, yRay + 11 + Math.sin(gocMo) * 12);
      ctx.moveTo(xePx + 14, yRay + 11);
      ctx.lineTo(xePx + 14 - Math.cos(gocMo) * 12, yRay + 11 + Math.sin(gocMo) * 12);
      ctx.stroke();

      // Vẽ 7 ô giải thưởng ở đáy theo ranhO thực tế
      var yO = H * 0.845;
      var caoO = H * 0.128;
      var coChuO = Math.max(15, Math.min(19, Math.round(W * 0.0185)));
      oDay.forEach(function (o, i) {
        var xTrai = ranhO[i] * W + 4;
        var xPhai = ranhO[i + 1] * W - 4;
        var w0 = Math.max(20, xPhai - xTrai);
        sangO[i] *= Math.pow(0.92, dtRaw * 60);
        var laDacBiet = o.bac === 1;
        var yHien = yO - sangO[i] * 5;

        ctx.fillStyle = laDacBiet ? "#d4ff3a" : o.mau;
        roundRect(ctx, xTrai, yHien, w0, caoO, 11);
        ctx.fill();

        if (laDacBiet) {
          // Viền cơ bản + vòng LED chạy đuổi quanh ô GIẢI ĐẶC BIỆT
          ctx.strokeStyle = "#0c1322";
          ctx.lineWidth = 3;
          ctx.stroke();

          ctx.save();
          ctx.setLineDash([10, 8]);
          ctx.lineDashOffset = -t * 0.045;
          ctx.strokeStyle = moRongGiua ? "#0b4fd6" : "#ffffff";
          ctx.lineWidth = 3;
          roundRect(ctx, xTrai + 3, yHien + 3, w0 - 6, caoO - 6, 8);
          ctx.stroke();
          ctx.restore();
        } else if (sangO[i] > 0.08) {
          ctx.strokeStyle = "#d4ff3a";
          ctx.lineWidth = 3.5 * sangO[i];
          ctx.stroke();
        }

        ctx.fillStyle = laDacBiet ? "#0c1322" : "#ffffff";
        veChuNhieuDong(o.ten, xTrai + w0 / 2, yHien + caoO / 2, w0 - 12, laDacBiet ? coChuO : Math.max(15, coChuO - 1));
      });

      // Vẽ 2 đệm nghiêng nhẹ hai bên rìa
      thap.demRia.forEach(function (dm) {
        dm.sang *= Math.pow(0.88, dtRaw * 60);
        ctx.save();
        ctx.strokeStyle = dm.sang > 0.15 ? "#0b4fd6" : "#334155";
        ctx.lineWidth = 8;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(dm.x1 * W, dm.y1 * H);
        ctx.lineTo(dm.x2 * W, dm.y2 * H);
        ctx.stroke();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      });

      // Vẽ 6 trụ vách ngăn đáy thẳng đứng có đầu bo tròn (y = 0.82..0.975)
      thap.vachNgan.forEach(function (vn) {
        vn.sang *= Math.pow(0.86, dtRaw * 60);
        var vx = vn.x * W;
        var y1 = vn.yTren * H;
        var y2 = vn.yDuoi * H;
        var rV = Math.max(4.5, vn.r * M);

        if (vn.sang > 0.05) {
          ctx.beginPath();
          ctx.arc(vx, y1, rV + 12 * vn.sang, 0, Math.PI * 2);
          ctx.fillStyle = vn.canhDacBiet ? ("rgba(212,255,58," + (0.65 * vn.sang) + ")") : ("rgba(11,79,214," + (0.4 * vn.sang) + ")");
          ctx.fill();
        }

        // Thân trụ vách ngăn
        ctx.strokeStyle = vn.canhDacBiet ? "#0c1322" : "#1e293b";
        ctx.lineWidth = rV * 2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(vx, y1);
        ctx.lineTo(vx, y2);
        ctx.stroke();

        // Đầu bo tròn nổi bật trên đỉnh trụ
        ctx.beginPath();
        ctx.arc(vx, y1, rV + 1, 0, Math.PI * 2);
        ctx.fillStyle = vn.sang > 0.15 ? "#d4ff3a" : (vn.canhDacBiet ? "#0b4fd6" : "#475569");
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.6;
        ctx.stroke();
      });

      // Vẽ sóng gợn mảnh khi chốt/lò xo/vách ngăn bị va chạm
      var conSong = [];
      for (var sIdx = 0; sIdx < songGon.length; sIdx += 1) {
        var sg = songGon[sIdx];
        sg.t += dtRaw;
        if (sg.t >= sg.tho) continue;
        var p = sg.t / sg.tho;
        var rHien = sg.rDau + (sg.rCuoi - sg.rDau) * p;
        ctx.beginPath();
        ctx.arc(sg.x, sg.y, rHien, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(" + sg.mau + "," + (0.7 * (1 - p)) + ")";
        ctx.lineWidth = 2 * (1 - p) + 0.5;
        ctx.stroke();
        conSong.push(sg);
      }
      songGon = conSong;

      // Vẽ rừng chốt đinh
      thap.chot.forEach(function (c) {
        c.sang *= Math.pow(0.88, dtRaw * 60);
        var cx = c.x * W;
        var cy = c.y * H;
        var r = Math.max(4.5, c.r * M);
        if (c.sang > 0.05) {
          ctx.beginPath();
          ctx.arc(cx, cy, r + 10 * c.sang, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(212,255,58," + (0.48 * c.sang) + ")";
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = c.sang > 0.2 ? "#d4ff3a" : "#0c1322";
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.6;
        ctx.stroke();
      });

      // Vẽ 2 tấm bật lò xo giữa tháp
      thap.loXo.forEach(function (lx) {
        lx.sang *= Math.pow(0.86, dtRaw * 60);
        var cx = lx.x * W;
        var cy = lx.y * H;
        var r = Math.max(14, lx.r * M) * (1 + lx.sang * 0.26);
        ctx.beginPath();
        ctx.arc(cx, cy, r + 8, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(16,185,129," + (0.2 + lx.sang * 0.4) + ")";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = lx.sang > 0.2 ? "#34d399" : "#10b981";
        ctx.fill();
        ctx.strokeStyle = "#0c1322";
        ctx.lineWidth = 2.6;
        ctx.stroke();
        ctx.fillStyle = "#ffffff";
        ctx.font = "900 11px ui-monospace, Menlo, monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("BẬT", cx, cy + 1);
      });

      // Vẽ các quả bóng và nhãn mã
      bi.forEach(function (b) {
        var r = Math.max(10, b.r * M * b.heSoCo);
        var laNoiBat = biNoiBat === b && !b.daVaoO;

        // Vệt sáng đuôi
        if (!b.daVaoO && b.duoi.length > 1) {
          ctx.beginPath();
          b.duoi.forEach(function (p, idx) {
            if (idx === 0) ctx.moveTo(p.x * W, p.y * H);
            else ctx.lineTo(p.x * W, p.y * H);
          });
          ctx.strokeStyle = b.laBiVang ? "rgba(245,158,11,0.34)" : (laNoiBat ? "rgba(101,163,13,0.38)" : "rgba(11,79,214,0.22)");
          ctx.lineWidth = r * 0.82;
          ctx.lineCap = "round";
          ctx.stroke();
        }

        var bx = b.x * W;
        var by = b.y * H;
        ctx.save();
        ctx.globalAlpha = b.daVaoO ? 0.55 : 1;

        // Vòng hào quang cho quả bi đang rơi nổi bật nhất
        if (laNoiBat) {
          ctx.beginPath();
          ctx.arc(bx, by, r + 6 + Math.sin(t * 0.015) * 2, 0, Math.PI * 2);
          ctx.strokeStyle = b.laBiVang ? "#0b4fd6" : "#65a30d";
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        var gB = ctx.createRadialGradient(bx - r * 0.3, by - r * 0.3, 2, bx, by, r);
        if (b.laBiVang) {
          gB.addColorStop(0, "#fffbeb");
          gB.addColorStop(0.32, "#fde047");
          gB.addColorStop(0.75, "#d97706");
          gB.addColorStop(1, "#78350f");
        } else {
          gB.addColorStop(0, "#ffffff");
          gB.addColorStop(0.28, b.mau);
          gB.addColorStop(1, "#0c1322");
        }
        ctx.fillStyle = gB;
        ctx.beginPath();
        ctx.arc(bx, by, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = b.laBiVang ? "#0c1322" : (laNoiBat ? "#d4ff3a" : "#ffffff");
        ctx.lineWidth = b.laBiVang ? 3 : 2.2;
        ctx.stroke();

        // Nhãn mã nhân viên
        if (!b.daVaoO) {
          var ma = String(b.nguoi.ma || "");
          if (b.laBiVang) {
            // Bi Vàng Chung Kết: in Mã NV cỡ lớn 18-20px tương phản cực cao ngay trên quả bi
            var coMa = ma.length <= 5 ? 20 : 18;
            ctx.font = "900 " + coMa + "px ui-monospace, Menlo, monospace";
            var wmLon = ctx.measureText(ma).width + 14;
            var hLon = coMa + 8;
            ctx.fillStyle = "#ffffff";
            roundRect(ctx, bx - wmLon / 2, by - hLon / 2, wmLon, hLon, 7);
            ctx.fill();
            ctx.strokeStyle = "#0c1322";
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = "#0c1322";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(ma, bx, by + 1);
          } else {
            ctx.font = (laNoiBat ? "900 13px " : "800 11px ") + "ui-monospace, Menlo, monospace";
            var wm = ctx.measureText(ma).width + 12;
            var hNho = laNoiBat ? 20 : 17;
            ctx.fillStyle = laNoiBat ? "#d4ff3a" : "rgba(255,255,255,0.95)";
            roundRect(ctx, bx - wm / 2, by - r - hNho - 4, wm, hNho, 5);
            ctx.fill();
            if (laNoiBat) {
              ctx.strokeStyle = "#0c1322";
              ctx.lineWidth = 1.5;
              ctx.stroke();
            }
            ctx.fillStyle = "#0c1322";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(ma, bx, by - r - hNho / 2 - 3);
          }
        }
        ctx.restore();
      });

      // Hạt tia sáng va chạm
      var conHat = [];
      for (var hIdx = 0; hIdx < hat.length; hIdx += 1) {
        var p = hat[hIdx];
        p.song += dtRaw;
        if (p.song >= p.tho) continue;
        p.x += p.vx * dtRaw * 60;
        p.y += p.vy * dtRaw * 60;
        p.vy += 0.2 * dtRaw * 60;
        var a = 1 - p.song / p.tho;
        ctx.fillStyle = "rgba(" + p.mau + "," + a + ")";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * a, 0, Math.PI * 2);
        ctx.fill();
        conHat.push(p);
      }
      hat = conHat;

      ctx.restore();

      // Lớp phủ màn hình (không bị zoom) cho Photo-Finish Cận Đích
      if (manToiCanCanh > 0.01) {
        var gVig = ctx.createRadialGradient(W / 2, H / 2, M * 0.22, W / 2, H / 2, Math.max(W, H) * 0.72);
        gVig.addColorStop(0, "rgba(12,19,34,0)");
        gVig.addColorStop(1, "rgba(12,19,34," + manToiCanCanh.toFixed(3) + ")");
        ctx.fillStyle = gVig;
        ctx.fillRect(0, 0, W, H);
      }

      if (canCanhDangBat || giuCanCanh > 0.08) {
        var goc = 28;
        var leKhung = 22;
        ctx.save();
        ctx.strokeStyle = "#0c1322";
        ctx.lineWidth = 4;
        ctx.beginPath();
        // 4 góc khung ngắm
        ctx.moveTo(leKhung, leKhung + goc); ctx.lineTo(leKhung, leKhung); ctx.lineTo(leKhung + goc, leKhung);
        ctx.moveTo(W - leKhung - goc, leKhung); ctx.lineTo(W - leKhung, leKhung); ctx.lineTo(W - leKhung, leKhung + goc);
        ctx.moveTo(leKhung, H - leKhung - goc); ctx.lineTo(leKhung, H - leKhung); ctx.lineTo(leKhung + goc, H - leKhung);
        ctx.moveTo(W - leKhung - goc, H - leKhung); ctx.lineTo(W - leKhung, H - leKhung); ctx.lineTo(W - leKhung, H - leKhung - goc);
        ctx.stroke();

        // Nhãn "CẬN CẢNH CHẠM ĐÁY"
        var nhan = "CẬN CẢNH CHẠM ĐÁY";
        ctx.font = "900 14px ui-monospace, Menlo, monospace";
        var wBadge = ctx.measureText(nhan).width + 32;
        var bxBadge = (W - wBadge) / 2;
        var byBadge = 20;
        ctx.fillStyle = "#0c1322";
        roundRect(ctx, bxBadge, byBadge, wBadge, 32, 8);
        ctx.fill();
        ctx.strokeStyle = "#d4ff3a";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = "#d4ff3a";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(nhan, W / 2, byBadge + 16);
        ctx.restore();
      }

      if (chop > 0.01) {
        ctx.fillStyle = "rgba(212,255,58," + (0.32 * chop) + ")";
        ctx.fillRect(0, 0, W, H);
        chop *= 0.86;
      }
    }

    function batVongLap() {
      if (raf) return;
      dangChay = true;
      tTruoc = performance.now();
      (function lap(t) {
        if (!dangChay) { raf = 0; return; }
        var dt = Math.min(0.035, Math.max(0.001, (t - tTruoc) / 1000));
        tTruoc = t;
        ve(t, dt);
        raf = requestAnimationFrame(lap);
      })(tTruoc);
    }

    function taoLaiThap() {
      thap = root.Plinko.taoThap(9, { moRongGiua: moRongGiua });
    }

    return {
      bat: batVongLap,
      datCong: function (cong) {
        congTha = root.Plinko.CONG_THA[cong] ? cong : "ngau-nhien";
        if (VI_TRI_CONG[congTha] != null) xMucTieuXe = VI_TRI_CONG[congTha];
      },
      datMoRong: function (bat) {
        moRongGiua = Boolean(bat);
        taoLaiThap();
      },
      datCheDo: function (cd) {
        cheDo = cd === "bi-vang" ? "bi-vang" : "mua-bong";
      },
      tha: function (dsNguoi, tuyChon, onXong) {
        // Tương thích ngược: tha(dsNguoi, onXong) hoặc tha(dsNguoi, tuyChon, onXong)
        var tc = {};
        var cbXong = onXong;
        if (typeof tuyChon === "function") {
          cbXong = tuyChon;
        } else if (tuyChon && typeof tuyChon === "object") {
          tc = tuyChon;
        }
        if (tc.cheDo) cheDo = tc.cheDo === "bi-vang" ? "bi-vang" : "mua-bong";
        if (tc.congTha) congTha = root.Plinko.CONG_THA[tc.congTha] ? tc.congTha : "ngau-nhien";
        if (typeof tc.moRongGiua === "boolean") {
          moRongGiua = tc.moRongGiua;
          taoLaiThap();
        }
        onSuKien = typeof tc.onSuKien === "function" ? tc.onSuKien : null;

        amNoiBo.moKhoa();
        bi = [];
        songGon = [];
        hangCho = (dsNguoi || []).map(function (n, i) { return { nguoi: n, chiSo: i }; });
        xMucTieuXe = chonDichXeChoBi();
        boDemTha = 0.06;
        onXongTatCa = cbXong || null;
        daBaoXong = false;
        maTieuDiemCu = "";
        canCanhDangBat = false;
        giuCanCanh = 0;
        daPhatCanCanh = false;
        tocDoTG = 1;
        camZoom = 1;
        camX = 0.5;
        camY = 0.5;
        manToiCanCanh = 0;

        banSuKien("xuat-phat", {
          cheDo: cheDo,
          congTha: congTha,
          soBi: hangCho.length,
          nguoi: hangCho[0] ? hangCho[0].nguoi : null,
        });
        batVongLap();
      },
      dangTha: function () { return !daBaoXong; },
      dung: function () {
        dangChay = false;
        if (raf) { cancelAnimationFrame(raf); raf = 0; }
      },
    };
  }

  root.VePlinko = { tao: tao };
})(window);
