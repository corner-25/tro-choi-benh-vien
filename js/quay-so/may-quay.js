/* Máy quay trống cơ khí 3D: mỗi ký tự của mã nhân viên là một cuộn quay bằng CSS transform,
 * hỗ trợ dừng theo thứ tự thông minh (khóa tiền tố tĩnh trước, chốt ngược từ đuôi),
 * đèn chỉ báo từng cuộn, viền 24 LED chạy đuổi, thấu kính vạch ngắm, vi chấn chốt cuối,
 * tia lửa phanh ngang và 2 chùm đèn pha hội tụ trên canvas riêng (#hieu-ung-sk). */
(function (root) {
  "use strict";

  var SO_VONG = 10; // đủ vòng trên/dưới để luôn hé lộ ký tự liền kề
  var SO_LED = 24;

  function giamChuyenDong() {
    return Boolean(root.matchMedia && root.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  /** Vị trí 24 bóng LED chạy quanh viền máy quay: 10 trên, 2 phải, 10 dưới, 2 trái. */
  function viTriLed(chiSo) {
    if (chiSo < 10) return { x: 6 + (chiSo / 9) * 88, y: 0, canh: "tren" };
    if (chiSo < 12) return { x: 100, y: chiSo === 10 ? 33 : 67, canh: "phai" };
    if (chiSo < 22) return { x: 94 - ((chiSo - 12) / 9) * 88, y: 100, canh: "duoi" };
    return { x: 0, y: chiSo === 22 ? 67 : 33, canh: "trai" };
  }

  /** Bộ vẽ sóng xung kích, tia lửa phanh ngang và 2 chùm đèn pha hội tụ trên canvas riêng (không đụng #phao). */
  function taoSongXungKich() {
    var danhSachSong = [];
    var danhSachTia = [];
    var denPha = { bat: false, phanTu: null, batDau: 0 };
    var rafSong = 0;
    var canvasDangDung = null;

    function veDenPha(ctx, W, H, t) {
      if (!denPha.bat || !denPha.phanTu || !canvasDangDung) return;
      var khungCv = canvasDangDung.getBoundingClientRect();
      var khungO = denPha.phanTu.getBoundingClientRect();
      if (!khungCv.width || !khungCv.height || !khungO.width || !khungO.height) return;

      var tx = khungO.left - khungCv.left + khungO.width / 2;
      var ty = khungO.top - khungCv.top + khungO.height / 2;
      var tienDoBat = Math.min(1, Math.max(0, (t - denPha.batDau) / 240));
      var nhip = 0.88 + 0.12 * Math.sin(t * 0.009);
      var cuongDo = tienDoBat * nhip;
      var rongDich = Math.max(khungO.width * 0.92, 76);

      // Chùm sáng trái (xanh dương nhấn) hội tụ vào cuộn quyết định
      ctx.save();
      var gocTraiX = W * 0.06;
      var gocTraiY = -24;
      var grTrai = ctx.createLinearGradient(gocTraiX, gocTraiY, tx, ty + khungO.height * 0.45);
      grTrai.addColorStop(0, "rgba(11, 79, 214, " + (0.14 * cuongDo).toFixed(3) + ")");
      grTrai.addColorStop(0.7, "rgba(11, 79, 214, " + (0.09 * cuongDo).toFixed(3) + ")");
      grTrai.addColorStop(1, "rgba(11, 79, 214, 0)");
      ctx.fillStyle = grTrai;
      ctx.beginPath();
      ctx.moveTo(gocTraiX - 24, gocTraiY);
      ctx.lineTo(gocTraiX + 46, gocTraiY);
      ctx.lineTo(tx + rongDich * 0.72, ty + khungO.height * 0.52);
      ctx.lineTo(tx - rongDich * 0.72, ty - khungO.height * 0.22);
      ctx.closePath();
      ctx.fill();

      // Chùm sáng phải (xanh chanh) hội tụ chéo vào cuộn quyết định
      var gocPhaiX = W * 0.94;
      var gocPhaiY = -24;
      var grPhai = ctx.createLinearGradient(gocPhaiX, gocPhaiY, tx, ty + khungO.height * 0.45);
      grPhai.addColorStop(0, "rgba(212, 255, 58, " + (0.16 * cuongDo).toFixed(3) + ")");
      grPhai.addColorStop(0.65, "rgba(101, 163, 13, " + (0.08 * cuongDo).toFixed(3) + ")");
      grPhai.addColorStop(1, "rgba(212, 255, 58, 0)");
      ctx.fillStyle = grPhai;
      ctx.beginPath();
      ctx.moveTo(gocPhaiX - 46, gocPhaiY);
      ctx.lineTo(gocPhaiX + 24, gocPhaiY);
      ctx.lineTo(tx + rongDich * 0.72, ty - khungO.height * 0.22);
      ctx.lineTo(tx - rongDich * 0.72, ty + khungO.height * 0.52);
      ctx.closePath();
      ctx.fill();

      // Quầng sáng nhẹ quanh tâm cuộn quyết định trên nền sáng
      var banKinh = Math.max(khungO.width, khungO.height) * 0.95;
      var quong = ctx.createRadialGradient(tx, ty, banKinh * 0.12, tx, ty, banKinh);
      quong.addColorStop(0, "rgba(212, 255, 58, " + (0.15 * cuongDo).toFixed(3) + ")");
      quong.addColorStop(0.55, "rgba(11, 79, 214, " + (0.06 * cuongDo).toFixed(3) + ")");
      quong.addColorStop(1, "rgba(11, 79, 214, 0)");
      ctx.fillStyle = quong;
      ctx.beginPath();
      ctx.arc(tx, ty, banKinh, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function chay(t) {
      if (!canvasDangDung) { rafSong = 0; return; }
      var ctx = canvasDangDung.getContext("2d");
      var dpr = Math.min(root.devicePixelRatio || 1, 2);
      var W = canvasDangDung.clientWidth;
      var H = canvasDangDung.clientHeight;
      if (!W || !H) { danhSachSong = []; danhSachTia = []; denPha.bat = false; rafSong = 0; return; }
      if (canvasDangDung.width !== Math.round(W * dpr) || canvasDangDung.height !== Math.round(H * dpr)) {
        canvasDangDung.width = Math.round(W * dpr);
        canvasDangDung.height = Math.round(H * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // 1. Vẽ 2 chùm đèn pha hội tụ (nếu đang bật)
      if (denPha.bat) veDenPha(ctx, W, H, t);

      // 2. Vẽ vòng sóng xung kích
      var conSong = [];
      for (var i = 0; i < danhSachSong.length; i += 1) {
        var s = danhSachSong[i];
        var p = (t - s.batDau) / s.thoiLuong;
        if (p >= 1) continue;
        conSong.push(s);
        var muot = 1 - Math.pow(1 - p, 3);
        var r = s.rDau + (s.rCuoi - s.rDau) * muot;
        var alpha = Math.max(0, 1 - p);
        ctx.save();
        ctx.beginPath();
        ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
        ctx.strokeStyle = s.cuoi
          ? "rgba(212, 255, 58, " + (alpha * 0.95) + ")"
          : "rgba(11, 79, 214, " + (alpha * 0.72) + ")";
        ctx.lineWidth = s.cuoi ? 6 * (1 - p * 0.55) : 3.5 * (1 - p * 0.5);
        ctx.stroke();
        if (s.cuoi) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, r * 0.74, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(11, 79, 214, " + (alpha * 0.8) + ")";
          ctx.lineWidth = 3 * (1 - p * 0.5);
          ctx.stroke();
        }
        ctx.restore();
      }
      danhSachSong = conSong;

      // 3. Vẽ tia lửa phanh ngang dọc vạch ngắm (~360ms)
      var conTia = [];
      for (var j = 0; j < danhSachTia.length; j += 1) {
        var tia = danhSachTia[j];
        var pt = (t - tia.batDau) / tia.thoiLuong;
        if (pt >= 1) continue;
        conTia.push(tia);
        var giam = 1 - Math.pow(1 - pt, 2.4);
        var cx = tia.x + tia.dx * giam;
        var cy = tia.y + tia.dy * giam;
        var chieuDai = tia.dai * (1 - pt * 0.55);
        var doMo = Math.max(0, 1 - pt);
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx - tia.huongX * chieuDai, cy - tia.huongY * chieuDai);
        ctx.strokeStyle = tia.laChanh
          ? "rgba(212, 255, 58, " + (doMo * 0.96) + ")"
          : "rgba(11, 79, 214, " + (doMo * 0.88) + ")";
        ctx.lineWidth = tia.day * (1 - pt * 0.45);
        ctx.lineCap = "round";
        ctx.stroke();
        ctx.restore();
      }
      danhSachTia = conTia;

      if (danhSachSong.length || danhSachTia.length || denPha.bat) {
        rafSong = requestAnimationFrame(chay);
      } else {
        ctx.clearRect(0, 0, W, H);
        rafSong = 0;
      }
    }

    function damBaoVongLap() {
      if (!rafSong) rafSong = requestAnimationFrame(chay);
    }

    function ban(canvas, phanTuCuon, cuoi) {
      if (!canvas || !phanTuCuon || giamChuyenDong()) return;
      var khungCv = canvas.getBoundingClientRect();
      var khungO = phanTuCuon.getBoundingClientRect();
      if (!khungCv.width || !khungCv.height) return;
      canvasDangDung = canvas;
      var tamX = khungO.left - khungCv.left + khungO.width / 2;
      var tamY = khungO.top - khungCv.top + khungO.height / 2;
      var bayGio = performance.now();

      danhSachSong.push({
        x: tamX,
        y: tamY,
        rDau: Math.max(24, Math.min(khungO.width, khungO.height) * 0.36),
        rCuoi: cuoi ? Math.max(khungO.width, khungO.height) * 1.9 : Math.max(khungO.width, khungO.height) * 1.15,
        batDau: bayGio,
        thoiLuong: cuoi ? 640 : 420,
        cuoi: Boolean(cuoi),
      });

      // 10–14 vệt tia lửa phanh ngang dọc vạch ngắm
      var soTia = cuoi ? 14 : 10;
      var bienNgang = Math.max(khungO.width * (cuoi ? 1.55 : 1.05), 88);
      for (var k = 0; k < soTia; k += 1) {
        var phia = k % 2 === 0 ? 1 : -1;
        var gocLech = (Math.random() - 0.5) * 0.34;
        var huongX = phia * Math.cos(gocLech);
        var huongY = Math.sin(gocLech);
        var quangDuong = bienNgang * (0.55 + Math.random() * 0.7);
        var lechDoc = (Math.random() - 0.5) * Math.min(28, khungO.height * 0.22);
        danhSachTia.push({
          x: tamX + phia * (khungO.width * 0.28),
          y: tamY + lechDoc,
          dx: huongX * quangDuong,
          dy: huongY * quangDuong,
          huongX: huongX,
          huongY: huongY,
          dai: cuoi ? (18 + Math.random() * 20) : (12 + Math.random() * 14),
          day: cuoi ? (2.6 + Math.random() * 1.8) : (2 + Math.random() * 1.2),
          laChanh: cuoi ? (k % 3 !== 0) : (k % 2 === 0),
          batDau: bayGio,
          thoiLuong: 330 + Math.random() * 60,
        });
      }

      damBaoVongLap();
    }

    function batDenPha(canvas, phanTuCuon) {
      if (!canvas || !phanTuCuon || giamChuyenDong()) return;
      canvasDangDung = canvas;
      denPha.bat = true;
      denPha.phanTu = phanTuCuon;
      denPha.batDau = performance.now();
      damBaoVongLap();
    }

    function tatDenPha() {
      denPha.bat = false;
      denPha.phanTu = null;
      if (!danhSachSong.length && !danhSachTia.length && canvasDangDung) {
        if (rafSong) { cancelAnimationFrame(rafSong); rafSong = 0; }
        var ctx = canvasDangDung.getContext("2d");
        ctx.clearRect(0, 0, canvasDangDung.width, canvasDangDung.height);
      }
    }

    function dung() {
      danhSachSong = [];
      danhSachTia = [];
      denPha.bat = false;
      denPha.phanTu = null;
      if (rafSong) { cancelAnimationFrame(rafSong); rafSong = 0; }
      if (canvasDangDung) {
        var ctx = canvasDangDung.getContext("2d");
        ctx.clearRect(0, 0, canvasDangDung.width, canvasDangDung.height);
      }
    }

    return { ban: ban, batDenPha: batDenPha, tatDenPha: tatDenPha, dung: dung };
  }

  function tao(khung, boKyTu, soCuon, amThanh) {
    var cuon = [];
    var dsLed = [];
    var rafQuay = 0;
    var danhSachHenGio = [];
    var song = taoSongXungKich();

    khung.textContent = "";
    khung.style.setProperty("--so-cuon", String(soCuon));

    // Viền 24 bóng LED chạy đuổi
    var khungLed = document.createElement("div");
    khungLed.className = "khung-led";
    khungLed.setAttribute("aria-hidden", "true");
    for (var l = 0; l < SO_LED; l += 1) {
      var led = document.createElement("span");
      led.className = "den-led";
      var vt = viTriLed(l);
      led.style.left = vt.x + "%";
      led.style.top = vt.y + "%";
      led.setAttribute("data-canh", vt.canh);
      khungLed.appendChild(led);
      dsLed.push(led);
    }
    khung.appendChild(khungLed);

    // Thấu kính vạch ngắm quang học màu chanh chạy ngang tâm trống quay
    var vachNgam = document.createElement("div");
    vachNgam.className = "vach-ngam";
    vachNgam.setAttribute("aria-hidden", "true");
    khung.appendChild(vachNgam);

    for (var i = 0; i < soCuon; i += 1) {
      var o = document.createElement("div"); o.className = "cuon";
      var den = document.createElement("span");
      den.className = "den-cuon";
      den.setAttribute("aria-hidden", "true");
      var dai = document.createElement("div"); dai.className = "dai";
      for (var v = 0; v < SO_VONG; v += 1) {
        boKyTu.forEach(function (c) {
          var s = document.createElement("span");
          s.textContent = c === " " ? "\u00a0" : c;
          dai.appendChild(s);
        });
      }
      o.append(den, dai);
      khung.appendChild(o);
      cuon.push({ o: o, den: den, dai: dai, viTri: boKyTu.length });
    }

    function caoO() { var s = cuon[0] && cuon[0].dai.firstChild; return s ? s.getBoundingClientRect().height : 0; }
    function chiSo(c) { var idx = boKyTu.indexOf(c); return idx < 0 ? 0 : idx; }

    function huyHieuUngDangChay() {
      if (rafQuay) { cancelAnimationFrame(rafQuay); rafQuay = 0; }
      danhSachHenGio.forEach(function (id) { clearTimeout(id); });
      danhSachHenGio = [];
    }

    function datLedTrangThai(buoc, cheDo) {
      for (var k = 0; k < dsLed.length; k += 1) {
        var el = dsLed[k];
        if (cheDo === "nghi") {
          el.classList.remove("sang", "sang-phu", "chot-led");
        } else if (cheDo === "chot") {
          el.classList.remove("sang-phu");
          el.classList.add("sang", "chot-led");
        } else {
          var laDau = (k % 8) === (buoc % 8);
          var laDuoi = (k % 8) === ((buoc + 7) % 8);
          el.classList.toggle("sang", laDau);
          el.classList.toggle("sang-phu", laDuoi);
          el.classList.remove("chot-led");
        }
      }
    }

    function dat(maCan) {
      huyHieuUngDangChay();
      song.dung();
      khung.classList.remove("dang-quay-may", "sat-nut", "chot-rung");
      datLedTrangThai(0, "nghi");
      var h = caoO();
      var n = boKyTu.length;
      cuon.forEach(function (r, idx) {
        r.viTri = n + chiSo(maCan[idx]);
        r.dai.style.transition = "none";
        r.dai.style.transform = "translateY(" + (-r.viTri * h) + "px)";
        r.o.classList.remove("dang-quay", "vua-dung", "da-khoa", "dang-chot");
        r.den.classList.remove("dang-cho", "da-khoa");
      });
    }

    function kichHoatChotRung() {
      if (giamChuyenDong()) return;
      khung.classList.remove("chot-rung");
      void khung.offsetWidth;
      khung.classList.add("chot-rung");
      var henRung = setTimeout(function () {
        khung.classList.remove("chot-rung");
      }, 260);
      danhSachHenGio.push(henRung);
    }

    /**
     * Quay tới mã đích (đã căn theo số cuộn). Trả Promise xong khi mọi cuộn dừng.
     * tuyChon (tùy chọn): { satNutCuoi, thuTuDung, viTriCoDinh, chayDaNgan, onDungCuon, trenCanvas }.
     */
    function quay(maCan, nhanh, tuyChon) {
      huyHieuUngDangChay();
      song.tatDenPha();
      var tc = tuyChon || {};
      var h = caoO();
      var n = boKyTu.length;
      var conDung = cuon.length;
      var satNutCuoi = Boolean(tc.satNutCuoi && !nhanh);
      var chayDaNgan = Boolean(tc.chayDaNgan && !nhanh);

      // Xác định thứ tự dừng hợp lệ
      var thuTuDung = [];
      if (Array.isArray(tc.thuTuDung) && tc.thuTuDung.length === cuon.length) {
        thuTuDung = tc.thuTuDung.slice();
      } else {
        for (var tIdx = 0; tIdx < cuon.length; tIdx += 1) thuTuDung.push(tIdx);
      }

      var tapCoDinh = {};
      if (!nhanh && Array.isArray(tc.viTriCoDinh)) {
        tc.viTriCoDinh.forEach(function (vt) { tapCoDinh[vt] = true; });
      }

      // Lập lịch thời gian cho từng cuộn theo bacDung trong thuTuDung
      var lich = new Array(cuon.length);
      var dsCoDinh = [];
      var dsBienThien = [];
      for (var b = 0; b < thuTuDung.length; b += 1) {
        var idxCuon = thuTuDung[b];
        var laCuoi = b === thuTuDung.length - 1;
        if (!nhanh && tapCoDinh[idxCuon] && !laCuoi) dsCoDinh.push({ idx: idxCuon, bac: b });
        else dsBienThien.push({ idx: idxCuon, bac: b, cuoi: laCuoi });
      }

      var nenThoiGian = chayDaNgan ? 900 : 1500;
      var buocBienThien = chayDaNgan
        ? Math.min(300, Math.round(750 / Math.max(1, dsBienThien.length - 1)))
        : 320;
      var themCuoi = chayDaNgan ? 750 : 1100;
      var tongThoiGian = 700;

      if (nhanh) {
        for (var bi = 0; bi < thuTuDung.length; bi += 1) {
          var tgNhanh = 700 + bi * 110;
          lich[thuTuDung[bi]] = { bacDung: bi, cuoi: bi === thuTuDung.length - 1, laCoDinh: false, thoiGian: tgNhanh };
          if (tgNhanh > tongThoiGian) tongThoiGian = tgNhanh;
        }
      } else {
        dsCoDinh.forEach(function (m, stt) {
          var tgCd = (chayDaNgan ? 360 : 440) + stt * (chayDaNgan ? 45 : 65);
          lich[m.idx] = { bacDung: m.bac, cuoi: false, laCoDinh: true, thoiGian: tgCd };
          if (tgCd > tongThoiGian) tongThoiGian = tgCd;
        });
        dsBienThien.forEach(function (m, stt) {
          var tgBt = nenThoiGian + stt * buocBienThien + (m.cuoi ? themCuoi + (satNutCuoi ? 1500 : 0) : 0);
          lich[m.idx] = { bacDung: m.bac, cuoi: m.cuoi, laCoDinh: false, thoiGian: tgBt };
          if (tgBt > tongThoiGian) tongThoiGian = tgBt;
        });
      }

      var daKhoa = new Array(cuon.length);
      var idxCuoi = thuTuDung[thuTuDung.length - 1];

      function capNhatDenDangCho() {
        for (var ci = 0; ci < cuon.length; ci += 1) {
          if (!daKhoa[ci]) cuon[ci].den.classList.remove("dang-cho");
        }
        for (var bi2 = 0; bi2 < thuTuDung.length; bi2 += 1) {
          var idTiep = thuTuDung[bi2];
          if (!daKhoa[idTiep]) {
            cuon[idTiep].den.classList.add("dang-cho");
            break;
          }
        }
      }

      khung.classList.remove("chot-rung");
      khung.classList.add("dang-quay-may");

      // Vòng lặp requestAnimationFrame giãn nhịp tick êm loa (ưu tiên vongQuayTick) và LED chạy đuổi
      var batDauMs = performance.now();
      var lanTickCuoi = batDauMs;
      var lanLedCuoi = batDauMs;
      var buocLed = 0;

      function phatTick() {
        if (!amThanh) return;
        if (typeof amThanh.vongQuayTick === "function") amThanh.vongQuayTick();
        else if (typeof amThanh.tick === "function") amThanh.tick();
      }

      function vongLap(t) {
        if (conDung <= 0) { rafQuay = 0; return; }
        var tienDo = Math.min(1, Math.max(0, (t - batDauMs) / Math.max(1, tongThoiGian)));
        var duongCong = Math.pow(tienDo, 2.2);
        var khoangTick = nhanh ? (48 + duongCong * 120) : (48 + duongCong * 245);
        if (t - lanTickCuoi >= khoangTick) {
          phatTick();
          lanTickCuoi = t;
        }
        var khoangLed = nhanh ? (34 + duongCong * 90) : (32 + duongCong * 175);
        if (!giamChuyenDong() && t - lanLedCuoi >= khoangLed) {
          buocLed = (buocLed + 1) % SO_LED;
          datLedTrangThai(buocLed, "chay");
          lanLedCuoi = t;
        }
        rafQuay = requestAnimationFrame(vongLap);
      }
      rafQuay = requestAnimationFrame(vongLap);

      return new Promise(function (xong) {
        cuon.forEach(function (r, idx) {
          var thongTin = lich[idx];
          var batDau = n + (r.viTri % n);
          r.dai.style.transition = "none";
          r.dai.style.transform = "translateY(" + (-batDau * h) + "px)";
          void r.dai.offsetHeight;

          var vongDich = thongTin.laCoDinh
            ? Math.max(2, Math.min(3, SO_VONG - 6))
            : ((nhanh || chayDaNgan) ? Math.max(4, SO_VONG - 4) : SO_VONG - 2);
          var dich = vongDich * n + chiSo(maCan[idx]);

          r.o.classList.remove("vua-dung", "da-khoa", "dang-chot");
          r.den.classList.remove("da-khoa", "dang-cho");
          r.o.classList.add("dang-quay");
          if (cuon.length === 1) r.o.classList.add("dang-chot");

          r.dai.style.transition = "transform " + thongTin.thoiGian + "ms cubic-bezier(0.12, 0.72, 0.22, 1.06)";
          r.dai.style.transform = "translateY(" + (-dich * h) + "px)";

          var hen = setTimeout(function () {
            r.viTri = dich;
            daKhoa[idx] = true;
            r.o.classList.remove("dang-quay", "dang-chot");
            r.o.classList.add("vua-dung", "da-khoa");
            r.den.classList.remove("dang-cho");
            r.den.classList.add("da-khoa");

            if (amThanh && typeof amThanh.cach === "function") amThanh.cach(thongTin.cuoi);
            if (tc.trenCanvas) song.ban(tc.trenCanvas, r.o, thongTin.cuoi);

            conDung -= 1;
            if (conDung === 1 && idxCuoi !== undefined && cuon[idxCuoi]) {
              cuon[idxCuoi].o.classList.add("dang-chot");
            }
            if (conDung > 0) capNhatDenDangCho();

            if (typeof tc.onDungCuon === "function") {
              tc.onDungCuon(idx, maCan.slice(0, idx + 1), thongTin.cuoi, {
                bacDung: thongTin.bacDung,
                laCoDinh: thongTin.laCoDinh,
                phanTuCuon: r.o,
                phanTuCuonCuoi: cuon[idxCuoi] ? cuon[idxCuoi].o : null,
              });
            }

            if (conDung === 0) {
              huyHieuUngDangChay();
              song.tatDenPha();
              khung.classList.remove("dang-quay-may", "sat-nut");
              kichHoatChotRung();
              datLedTrangThai(0, "chot");
              xong();
            }
          }, thongTin.thoiGian);
          danhSachHenGio.push(hen);
        });
        capNhatDenDangCho();
      });
    }

    function batDenPha(canvas, chiSoHoacPhanTu) {
      var pt = typeof chiSoHoacPhanTu === "number"
        ? (cuon[chiSoHoacPhanTu] ? cuon[chiSoHoacPhanTu].o : null)
        : chiSoHoacPhanTu;
      song.batDenPha(canvas, pt);
    }

    function tatDenPha() {
      song.tatDenPha();
    }

    function layPhanTuCuon(idx) {
      return cuon[idx] ? cuon[idx].o : null;
    }

    return {
      dat: dat,
      quay: quay,
      batDenPha: batDenPha,
      tatDenPha: tatDenPha,
      layPhanTuCuon: layPhanTuCuon,
    };
  }

  root.MayQuay = { tao: tao };
})(window);
