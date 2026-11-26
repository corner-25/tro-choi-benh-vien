/* Điều phối sân khấu Mở Hộp Bí Ẩn 3D: vali nắp 2 mặt, diễn hoạt 3 bước, chặng khựng 35 độ,
 * Canvas 2D tia sáng & sóng xung kích, âm thanh sân khấu Web Audio, đặc quyền thật,
 * bốc đại biểu và xuất CSV / In biên bản. Dữ liệu người dùng chỉ vào DOM bằng textContent. */
(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };
  var KHOA = "hop-bi-an";

  var tt = {
    quaGoc: [],
    hop: [],
    heSoNhan: 1,
    luotMoThem: 0,
    daiBieu: null,
    lichSu: [],
  };

  var giaiDoan = "chuan-bi";
  var hopDangChon = -1;
  var dangBat = false;
  var daDoiTrongLuot = false;
  var thongBaoTicker = "";
  var nhanTickerTam = "";
  var boHenGio = [];

  var dangBocDaiBieu = false;
  var idCuonDaiBieu = null;
  var idChotDaiBieu = null;

  function so2ChuSo(n) {
    return String(n).padStart(2, "0");
  }

  function giamChuyenDong() {
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  function henGio(fn, ms) {
    var id = setTimeout(function () {
      boHenGio = boHenGio.filter(function (x) { return x !== id; });
      fn();
    }, ms);
    boHenGio.push(id);
    return id;
  }

  function huyHenGio() {
    boHenGio.forEach(function (id) { clearTimeout(id); });
    boHenGio = [];
  }

  function huyCuonDaiBieu() {
    if (idCuonDaiBieu) { clearInterval(idCuonDaiBieu); idCuonDaiBieu = null; }
    if (idChotDaiBieu) { clearTimeout(idChotDaiBieu); idChotDaiBieu = null; }
    dangBocDaiBieu = false;
    var tk = $("hb-ticker");
    if (tk) tk.classList.remove("dang-quay");
  }

  function dinhDangDaiBieu(db) {
    if (!db) return "";
    var ten = String(db.ten || "").trim();
    var dv = String(db.donVi || "").trim();
    if (ten && dv) return ten + " · " + dv;
    return ten || dv || String(db.ma || "");
  }

  /* ── Âm thanh Web Audio cục bộ (chỉ phát khi công tắc M đang bật) ── */
  var acRieng = null;

  function layAudio() {
    if (!window.AmThanh || !window.AmThanh.dangBat()) return null;
    try {
      if (!acRieng) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        acRieng = new AC();
      }
      if (acRieng.state === "suspended") acRieng.resume();
      return acRieng;
    } catch (e) {
      return null;
    }
  }

  function phatChotHop() {
    var a = layAudio();
    if (!a) return;
    var t0 = a.currentTime;
    [
      { tre: 0, f1: 1680, f2: 880, dai: 0.048, am: 0.16 },
      { tre: 0.11, f1: 1180, f2: 420, dai: 0.068, am: 0.2 },
    ].forEach(function (c) {
      var o = a.createOscillator();
      var f = a.createBiquadFilter();
      var g = a.createGain();
      o.type = "square";
      o.frequency.setValueAtTime(c.f1, t0 + c.tre);
      o.frequency.exponentialRampToValueAtTime(c.f2, t0 + c.tre + c.dai);
      f.type = "bandpass";
      f.frequency.value = 1400;
      f.Q.value = 2.4;
      g.gain.setValueAtTime(0.0001, t0 + c.tre);
      g.gain.exponentialRampToValueAtTime(c.am, t0 + c.tre + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + c.tre + c.dai);
      o.connect(f); f.connect(g); g.connect(a.destination);
      o.start(t0 + c.tre);
      o.stop(t0 + c.tre + c.dai + 0.02);
    });
  }

  function phatTrongTangToc(ms) {
    var a = layAudio();
    if (!a) return;
    var tong = Math.max(400, ms || 740) / 1000;
    var soNhip = 14;
    var t0 = a.currentTime;
    for (var i = 0; i < soNhip; i += 1) {
      var p = i / (soNhip - 1);
      var tre = Math.pow(p, 0.65) * tong;
      var o = a.createOscillator();
      var g = a.createGain();
      o.type = "triangle";
      var tanSo = 135 + p * 210;
      o.frequency.setValueAtTime(tanSo, t0 + tre);
      o.frequency.exponentialRampToValueAtTime(tanSo * 0.72, t0 + tre + 0.065);
      var am = 0.07 + p * 0.12;
      g.gain.setValueAtTime(0.0001, t0 + tre);
      g.gain.exponentialRampToValueAtTime(am, t0 + tre + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + tre + 0.07);
      o.connect(g); g.connect(a.destination);
      o.start(t0 + tre);
      o.stop(t0 + tre + 0.085);
    }
  }

  function phatNhipTim(ms) {
    var a = layAudio();
    if (!a) return;
    var tong = Math.max(600, ms || 1100) / 1000;
    var t0 = a.currentTime;
    var moc = [0.04, 0.19, Math.min(0.56, tong * 0.52), Math.min(0.71, tong * 0.66)];
    moc.forEach(function (tre, idx) {
      var laChinh = idx % 2 === 0;
      var o = a.createOscillator();
      var g = a.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(laChinh ? 68 : 58, t0 + tre);
      o.frequency.exponentialRampToValueAtTime(laChinh ? 48 : 42, t0 + tre + 0.16);
      g.gain.setValueAtTime(0.0001, t0 + tre);
      g.gain.exponentialRampToValueAtTime(laChinh ? 0.3 : 0.22, t0 + tre + 0.025);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + tre + 0.18);
      o.connect(g); g.connect(a.destination);
      o.start(t0 + tre);
      o.stop(t0 + tre + 0.2);
    });
  }

  function phatBatNapHoi() {
    var a = layAudio();
    if (!a) return;
    var t0 = a.currentTime;
    var dai = 0.18;
    var soMau = Math.floor(a.sampleRate * dai);
    var buf = a.createBuffer(1, soMau, a.sampleRate);
    var duLieu = buf.getChannelData(0);
    for (var i = 0; i < soMau; i += 1) {
      duLieu[i] = (Math.random() * 2 - 1) * (1 - i / soMau);
    }
    var src = a.createBufferSource();
    src.buffer = buf;
    var f = a.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.setValueAtTime(620, t0);
    f.frequency.exponentialRampToValueAtTime(2400, t0 + dai);
    f.Q.value = 1.6;
    var g = a.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.22, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dai);
    src.connect(f); f.connect(g); g.connect(a.destination);
    src.start(t0);
    src.stop(t0 + dai + 0.02);

    var o = a.createOscillator();
    var go = a.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(260, t0);
    o.frequency.exponentialRampToValueAtTime(540, t0 + 0.09);
    go.gain.setValueAtTime(0.0001, t0);
    go.gain.exponentialRampToValueAtTime(0.16, t0 + 0.015);
    go.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.11);
    o.connect(go); go.connect(a.destination);
    o.start(t0);
    o.stop(t0 + 0.12);
  }

  function phatDacQuyen() {
    var a = layAudio();
    if (!a) return;
    var t0 = a.currentTime;
    [523, 659, 784, 1047, 1319, 1568].forEach(function (tanSo, i) {
      var o = a.createOscillator();
      var g = a.createGain();
      var tre = i * 0.075;
      var dai = i === 5 ? 0.55 : 0.2;
      o.type = "triangle";
      o.frequency.setValueAtTime(tanSo, t0 + tre);
      g.gain.setValueAtTime(0.0001, t0 + tre);
      g.gain.exponentialRampToValueAtTime(0.2, t0 + tre + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + tre + dai);
      o.connect(g); g.connect(a.destination);
      o.start(t0 + tre);
      o.stop(t0 + tre + dai + 0.03);
    });
  }

  /* ── Canvas 2D Tia sáng rẻ quạt & Sóng xung kích trên nền sáng ── */
  var canvasTia = {
    raf: 0,
    cheDo: "tat",
    loaiGiai: "thuong",
    goc: 0,
    mocBung: 0,
    hat: [],
    vong: [],
    cuoiFrame: 0,
  };

  function dungCanvasTia() {
    if (canvasTia.raf) {
      cancelAnimationFrame(canvasTia.raf);
      canvasTia.raf = 0;
    }
    canvasTia.cheDo = "tat";
    canvasTia.hat = [];
    canvasTia.vong = [];
    var c = $("hb-tia-canvas");
    if (c) {
      var ctx = c.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, c.width, c.height);
    }
  }

  function datCheDoCanvas(cheDo, loaiGiai) {
    if (giamChuyenDong()) {
      dungCanvasTia();
      return;
    }
    canvasTia.cheDo = cheDo;
    if (loaiGiai) canvasTia.loaiGiai = loaiGiai;
    if (cheDo === "bung") {
      var bayGio = performance.now();
      canvasTia.mocBung = bayGio;
      var laDacBiet = loaiGiai === "dac-biet" || loaiGiai === "dac-quyen";
      canvasTia.vong = [
        { tre: 0, mau: laDacBiet ? "101,163,13" : "11,79,214", day: 10 },
        { tre: 120, mau: laDacBiet ? "132,204,22" : "56,189,248", day: 7 },
      ];
      for (var i = 0; i < 28; i += 1) {
        var goc = (Math.PI * 2 * i) / 28 + (Math.random() - 0.5) * 0.2;
        var v = 180 + Math.random() * 260;
        canvasTia.hat.push({
          x: 0, y: 0,
          vx: Math.cos(goc) * v,
          vy: Math.sin(goc) * v,
          r: 2.5 + Math.random() * 4,
          tuoi: 0,
          toiDa: 0.75 + Math.random() * 0.45,
          mau: i % 2 === 0 ? "11,79,214" : "101,163,13",
        });
      }
    }
    if (!canvasTia.raf) {
      canvasTia.cuoiFrame = performance.now();
      canvasTia.raf = requestAnimationFrame(veCanvasTia);
    }
  }

  function veCanvasTia(t) {
    var c = $("hb-tia-canvas");
    if (!c || $("hb-san-mo").hidden || canvasTia.cheDo === "tat") {
      dungCanvasTia();
      return;
    }
    var W = c.clientWidth;
    var H = c.clientHeight;
    if (!W || !H) {
      canvasTia.raf = requestAnimationFrame(veCanvasTia);
      return;
    }
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var rw = Math.round(W * dpr);
    var rh = Math.round(H * dpr);
    if (c.width !== rw || c.height !== rh) {
      c.width = rw;
      c.height = rh;
    }
    var ctx = c.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    var dt = Math.min(0.05, (t - canvasTia.cuoiFrame) / 1000);
    canvasTia.cuoiFrame = t;

    var tamX = W * 0.5;
    var tamY = H * 0.52;
    var banKinh = Math.hypot(W, H) * 0.65;

    /* 14 tia sáng rẻ quạt xoay sau vali */
    var tocDoQuay = canvasTia.cheDo === "khung" ? 0.55 : canvasTia.cheDo === "gong" ? 0.36 : 0.16;
    canvasTia.goc += dt * tocDoQuay;

    var doDamTia = canvasTia.cheDo === "khung" ? 1.35
      : canvasTia.cheDo === "gong" ? 1.1
      : canvasTia.cheDo === "bung" ? 1.45
      : 0.65;
    var soTia = 14;
    var buocGoc = (Math.PI * 2) / soTia;
    var doRongTia = buocGoc * 0.36;

    ctx.save();
    ctx.translate(tamX, tamY);
    for (var i = 0; i < soTia; i += 1) {
      var a1 = canvasTia.goc + i * buocGoc;
      var a2 = a1 + doRongTia;
      var grad = ctx.createRadialGradient(0, 0, 40, 0, 0, banKinh);
      var laXanh = i % 2 === 0;
      var alpha = (laXanh ? 0.1 : 0.14) * doDamTia;
      var mauRgb = laXanh ? "11,79,214" : "132,204,22";
      grad.addColorStop(0, "rgba(" + mauRgb + "," + Math.min(0.32, alpha * 1.4) + ")");
      grad.addColorStop(0.55, "rgba(" + mauRgb + "," + Math.min(0.18, alpha * 0.7) + ")");
      grad.addColorStop(1, "rgba(" + mauRgb + ",0)");
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, banKinh, a1, a2);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
    }

    /* Hạt sáng bay lên từ khe hộp khi gồng / khựng */
    if (canvasTia.cheDo === "gong" || canvasTia.cheDo === "khung") {
      var tanSuat = canvasTia.cheDo === "khung" ? 2 : 1;
      for (var k = 0; k < tanSuat; k += 1) {
        if (canvasTia.hat.length < 90 && Math.random() < 0.75) {
          canvasTia.hat.push({
            x: (Math.random() - 0.5) * 380,
            y: 45 + (Math.random() - 0.5) * 20,
            vx: (Math.random() - 0.5) * 55,
            vy: -(90 + Math.random() * 140),
            r: 2 + Math.random() * 3.5,
            tuoi: 0,
            toiDa: 0.7 + Math.random() * 0.5,
            mau: Math.random() < 0.5 ? "11,79,214" : "101,163,13",
          });
        }
      }
    }

    for (var j = canvasTia.hat.length - 1; j >= 0; j -= 1) {
      var h = canvasTia.hat[j];
      h.tuoi += dt;
      if (h.tuoi >= h.toiDa) {
        canvasTia.hat.splice(j, 1);
        continue;
      }
      h.x += h.vx * dt;
      h.y += h.vy * dt;
      var aHat = Math.max(0, 1 - h.tuoi / h.toiDa);
      ctx.beginPath();
      ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(" + h.mau + "," + (aHat * 0.85) + ")";
      ctx.fill();
    }

    /* 2 vòng sóng xung kích bung ra toàn màn hình */
    if (canvasTia.vong.length) {
      var conVong = false;
      for (var v = 0; v < canvasTia.vong.length; v += 1) {
        var sg = canvasTia.vong[v];
        var tuoiMs = t - canvasTia.mocBung - sg.tre;
        if (tuoiMs < 0) { conVong = true; continue; }
        var tienDo = tuoiMs / 820;
        if (tienDo >= 1) continue;
        conVong = true;
        var ease = 1 - Math.pow(1 - tienDo, 3);
        var rVong = 60 + ease * banKinh * 1.15;
        var aVong = Math.max(0, (1 - tienDo) * 0.78);
        ctx.beginPath();
        ctx.arc(0, 0, rVong, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(" + sg.mau + "," + aVong + ")";
        ctx.lineWidth = Math.max(1.5, sg.day * (1 - tienDo * 0.7));
        ctx.stroke();
      }
      if (!conVong) canvasTia.vong = [];
    }
    ctx.restore();

    canvasTia.raf = requestAnimationFrame(veCanvasTia);
  }

  /* ── Quản lý trạng thái & Lưu trữ ── */
  function bao(loai, chu) {
    var k = $("trang-thai-hb");
    k.className = "trang-thai " + loai;
    k.textContent = "";
    var p = document.createElement("p");
    p.textContent = chu;
    k.appendChild(p);
  }

  function datLaiVanMoi(dsQua) {
    huyCuonDaiBieu();
    huyHenGio();
    tt.quaGoc = dsQua.slice();
    tt.hop = window.HopBiAn.xaoHop(tt.quaGoc);
    tt.heSoNhan = 1;
    tt.luotMoThem = 0;
    tt.daiBieu = null;
    tt.lichSu = [];
    daDoiTrongLuot = false;
    thongBaoTicker = "";
    nhanTickerTam = "";
  }

  function napDaLuu() {
    var d = window.LuuTru.doc(KHOA);
    if (d && Array.isArray(d.hop) && d.hop.length) {
      tt.quaGoc = Array.isArray(d.quaGoc) ? d.quaGoc : d.hop.map(function (h) { return { ten: h.ten, loai: h.loai }; });
      tt.hop = d.hop;
      tt.heSoNhan = typeof d.heSoNhan === "number" && d.heSoNhan >= 1 ? d.heSoNhan : 1;
      tt.luotMoThem = typeof d.luotMoThem === "number" && d.luotMoThem >= 0 ? d.luotMoThem : 0;
      tt.daiBieu = d.daiBieu && typeof d.daiBieu === "object" ? d.daiBieu : null;
      tt.lichSu = Array.isArray(d.lichSu) ? d.lichSu : [];
    } else {
      datLaiVanMoi(window.HopBiAn.BO_MAU_12);
    }
    $("o-ds-qua").value = tt.quaGoc.map(function (q) { return q.ten; }).join("\n");
    var ten = window.LuuTru.docTenSuKien();
    document.querySelectorAll(".ten-su-kien").forEach(function (el) { el.textContent = ten; });
  }

  function luu() {
    window.LuuTru.ghi(KHOA, tt);
    capNhatTongKet();
  }

  function capNhatTongKet() {
    var chua = tt.hop.filter(function (h) { return !h.daMo; }).length;
    $("so-hop").textContent = String(tt.hop.length);
    $("so-chua-mo").textContent = String(chua);
    $("nut-vao").disabled = tt.hop.length < 2;
  }

  /* ── Broadcast Ticker, Đồng hồ tỷ lệ & Bảng gom nhóm chữ lớn ── */
  function capNhatTicker() {
    if (dangBocDaiBieu) return;
    var hopTk = $("hb-ticker");
    var nhan = $("hb-ticker-nhan");
    var chu = $("hb-ticker-chu");
    var soChuaMo = tt.hop.filter(function (h) { return !h.daMo; }).length;

    hopTk.classList.remove("dac-quyen", "dang-quay");

    if ((tt.heSoNhan > 1 || tt.luotMoThem > 0) && soChuaMo > 0) {
      hopTk.classList.add("dac-quyen");
      var phan = [];
      if (tt.heSoNhan > 1) phan.push("NHÂN x" + tt.heSoNhan + " PHẦN QUÀ cho hộp kế tiếp");
      if (tt.luotMoThem > 0) phan.push("LƯỢT THƯỞNG NỐI TIẾP (còn " + tt.luotMoThem + " hộp nữa)");
      if (tt.daiBieu) phan.push(dinhDangDaiBieu(tt.daiBieu));
      nhan.textContent = "ĐẶC QUYỀN";
      chu.textContent = phan.join(" · ");
      return;
    }

    if (tt.daiBieu) {
      nhan.textContent = "ĐẠI BIỂU";
      chu.textContent = dinhDangDaiBieu(tt.daiBieu) + " — Mời chọn một số hộp trên màn hình!";
      return;
    }

    if (thongBaoTicker) {
      nhan.textContent = nhanTickerTam || "THÔNG BÁO";
      chu.textContent = thongBaoTicker;
      return;
    }

    if (soChuaMo === 0) {
      nhan.textContent = "HOÀN TẤT";
      chu.textContent = "Tất cả các hộp đã mở — Chúc mừng các đại biểu trúng thưởng!";
      return;
    }

    nhan.textContent = "SÂN KHẤU";
    chu.textContent = "Mời đại biểu hô chọn một số hộp trên màn hình — bấm R để bốc ngẫu nhiên đại biểu.";
  }

  function datThongBaoTicker(nhan, noiDung) {
    nhanTickerTam = nhan || "THÔNG BÁO";
    thongBaoTicker = noiDung || "";
    capNhatTicker();
  }

  function veTyLeDacBiet() {
    var tl = window.HopBiAn.tinhTyLeDacBiet(tt.hop);
    var khung = $("hb-ty-le-db");
    var nhanCao = $("hb-ty-le-nhan");
    var soEl = $("hb-ty-le-so");

    khung.classList.remove("cao", "da-het");
    if (tl.soDacBietCon <= 0) {
      khung.classList.add("da-het");
      nhanCao.hidden = true;
      soEl.textContent = tl.soCon > 0 ? ("0 / " + tl.soCon + " (Đã mở)") : "Đã mở hết hộp";
      return;
    }
    soEl.textContent = tl.soDacBietCon + " / " + tl.soCon + " (" + tl.phanTram + "%)";
    if (tl.cao) {
      khung.classList.add("cao");
      nhanCao.hidden = false;
    } else {
      nhanCao.hidden = true;
    }
  }

  function veBangGiai() {
    veTyLeDacBiet();
    var ol = $("hb-ds-giai");
    ol.textContent = "";
    var nhomGiai = window.HopBiAn.gomNhomGiai(tt.hop);
    nhomGiai.forEach(function (g) {
      var li = document.createElement("li");
      li.className = g.loai + (g.daMoHet ? " da-mo" : "");
      var ten = document.createElement("span");
      ten.className = "hb-giai-ten";
      ten.textContent = g.ten;
      var dem = document.createElement("span");
      dem.className = "hb-giai-dem";
      dem.textContent = g.conLai + "/" + g.tong;
      li.append(ten, dem);
      ol.appendChild(li);
    });
  }

  function veSanKhau() {
    var luoi = $("hb-luoi");
    luoi.textContent = "";
    luoi.classList.toggle("nhieu-hop", tt.hop.length > 16);
    var soChuaMo = tt.hop.filter(function (h) { return !h.daMo; }).length;
    $("sk-chua-mo").textContent = String(soChuaMo);

    tt.hop.forEach(function (h, idx) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "hop-nut" + (h.daMo ? " da-mo " + h.loai : "");
      b.disabled = h.daMo;

      var than = document.createElement("div");
      than.className = "hop-than";
      var so = document.createElement("span");
      so.className = "hop-so";
      so.textContent = so2ChuSo(h.so);
      than.appendChild(so);

      if (h.daMo) {
        var q = document.createElement("span");
        q.className = "hop-qua";
        q.textContent = h.ten;
        than.appendChild(q);
        if (h.heSo && h.heSo > 1) {
          var x2 = document.createElement("span");
          x2.className = "hop-x2";
          x2.textContent = "x" + h.heSo;
          than.appendChild(x2);
        }
      } else {
        var nh = document.createElement("span");
        nh.className = "hop-nhan";
        nh.textContent = "CHỌN HỘP";
        than.appendChild(nh);
      }
      b.appendChild(than);
      b.addEventListener("click", function () { chonHop(idx); });
      luoi.appendChild(b);
    });

    veBangGiai();
    capNhatTicker();
  }

  /* ── Mở hộp 3 bước + Chặng khựng 35° + Đổi hộp mù 1 lần ── */
  function chonHop(idx) {
    if (dangBocDaiBieu) return;
    var h = tt.hop[idx];
    if (!h || h.daMo || dangBat) return;
    huyHenGio();
    hopDangChon = idx;
    var soChuaMo = tt.hop.filter(function (x) { return !x.daMo; }).length;

    $("hb-nap-so").textContent = so2ChuSo(h.so);
    /* Giữ lòng hộp trung tính và chưa gán nội dung giải để tuyệt đối không lộ màu ở góc khựng 35 độ */
    $("hb-noi-dung").textContent = "";
    $("hb-huy-hieu-x2").hidden = true;
    $("hb-phu-chu").hidden = true;
    $("hb-phu-chu").textContent = "";
    $("hb-day-hop").className = "hb-day-hop";
    $("hb-hop-lon").className = "hb-hop-lon";

    var tenDb = tt.daiBieu ? (" · " + dinhDangDaiBieu(tt.daiBieu)) : "";
    $("hb-goi-y-mo").textContent = "Hộp số " + so2ChuSo(h.so) + tenDb + " — Chốt mở hay đổi hộp khác?";
    $("nut-bat-nap").disabled = false;
    $("nut-bat-nap").hidden = false;
    $("nut-doi-hop").hidden = daDoiTrongLuot || soChuaMo < 2;
    $("nut-doi-hop").disabled = false;
    $("nut-dong-hop").disabled = false;
    $("hb-san-mo").hidden = false;

    datCheDoCanvas("cho");
    window.AmThanh.denQuet(true);
  }

  function doiHopKhac() {
    if (dangBat || hopDangChon < 0 || daDoiTrongLuot) return;
    daDoiTrongLuot = true;
    dongHop();
    var tenDb = tt.daiBieu ? dinhDangDaiBieu(tt.daiBieu) : "";
    datThongBaoTicker(
      "ĐỔI HỘP",
      tenDb
        ? ("Hội trường đổi số — mời " + tenDb + " chọn lại hộp khác!")
        : "Hội trường đổi số — mời chọn lại hộp khác!"
    );
    window.AmThanh.denQuet(false);
  }

  function moTungHop(h) {
    dangBat = false;
    daDoiTrongLuot = false;
    h.daMo = true;

    var dacQuyen = window.HopBiAn.loaiDacQuyen(h.ten);
    var laDacQuyen = h.loai === "dac-quyen" || dacQuyen !== null;
    var heSoApDung = 1;
    if (!laDacQuyen && tt.heSoNhan > 1) {
      heSoApDung = tt.heSoNhan;
      h.heSo = heSoApDung;
      tt.heSoNhan = 1;
    } else {
      h.heSo = 1;
    }

    var soConSauMo = tt.hop.filter(function (x) { return !x.daMo; }).length;
    var ghiChuPhu = "";

    if (dacQuyen === "nhan-doi") {
      tt.heSoNhan = (tt.heSoNhan || 1) * 2;
      ghiChuPhu = soConSauMo === 0
        ? ("Hộp cuối cùng — Ban Tổ chức ghi nhận đặc quyền Nhân đôi x" + tt.heSoNhan + "!")
        : ("KÍCH HOẠT: Hộp mở kế tiếp tự động nhân x" + tt.heSoNhan + " phần quà!");
    } else if (dacQuyen === "mo-them") {
      tt.luotMoThem = (tt.luotMoThem || 0) + 1;
      ghiChuPhu = soConSauMo === 0
        ? "Đã mở hết tất cả hộp — Ban Tổ chức ghi nhận đặc quyền Mở thêm!"
        : "LƯỢT THƯỞNG NỐI TIẾP: Mời đại biểu chọn mở thêm ngay 1 hộp nữa!";
    } else {
      if (heSoApDung > 1) {
        ghiChuPhu = "Áp dụng đặc quyền Nhân đôi — nhận x" + heSoApDung + " phần quà!";
      }
      if (tt.luotMoThem > 0) {
        tt.luotMoThem = Math.max(0, tt.luotMoThem - 1);
        if (soConSauMo > 0 && tt.luotMoThem > 0) {
          ghiChuPhu = (ghiChuPhu ? ghiChuPhu + " · " : "") + "Vẫn còn " + tt.luotMoThem + " lượt mở thêm nối tiếp!";
        } else if (!ghiChuPhu) {
          ghiChuPhu = "Đã hoàn thành lượt thưởng nối tiếp!";
        }
      }
    }

    var dbHienTai = tt.daiBieu;
    var thoiGian = new Date().toLocaleTimeString("vi-VN", { hour12: false });
    tt.lichSu.push({
      thuTu: tt.lichSu.length + 1,
      soHop: so2ChuSo(h.so),
      tenGiai: h.ten,
      heSo: heSoApDung,
      ma: dbHienTai ? (dbHienTai.ma || "") : "",
      ten: dbHienTai ? (dbHienTai.ten || "") : "",
      donVi: dbHienTai ? (dbHienTai.donVi || "") : "",
      thoiGian: thoiGian,
    });

    /* Giữ tên đại biểu nếu còn lượt thưởng mở thêm; ngược lại xóa để không gán nhầm lượt sau */
    var giuDaiBieu = soConSauMo > 0 && (dacQuyen === "mo-them" || tt.luotMoThem > 0);
    if (!giuDaiBieu) tt.daiBieu = null;

    thongBaoTicker = "";
    nhanTickerTam = "";
    if (soConSauMo === 0 && (dacQuyen === "nhan-doi" || dacQuyen === "mo-them")) {
      nhanTickerTam = "ĐẶC QUYỀN";
      thongBaoTicker = ghiChuPhu;
    }

    $("hb-noi-dung").textContent = h.ten;
    if (heSoApDung > 1) {
      $("hb-huy-hieu-x2").textContent = "x" + heSoApDung;
      $("hb-huy-hieu-x2").hidden = false;
    } else {
      $("hb-huy-hieu-x2").hidden = true;
    }
    if (ghiChuPhu) {
      $("hb-phu-chu").textContent = ghiChuPhu;
      $("hb-phu-chu").hidden = false;
    } else {
      $("hb-phu-chu").hidden = true;
    }

    var lopDay = "hb-day-hop da-quet";
    if (h.loai === "dac-biet" || h.loai === "dac-quyen") lopDay += " dac-biet";
    else if (h.loai === "cao") lopDay += " cao";
    $("hb-day-hop").className = lopDay;

    var hopLon = $("hb-hop-lon");
    hopLon.classList.remove("bat-chot", "rung", "khung-nap");
    hopLon.classList.add("da-bat");

    $("nut-bat-nap").hidden = true;
    $("nut-doi-hop").hidden = true;
    $("nut-dong-hop").disabled = false;

    var chuDb = dbHienTai ? (" — " + dinhDangDaiBieu(dbHienTai)) : "";
    $("hb-goi-y-mo").textContent = "Hộp số " + so2ChuSo(h.so) + " đã mở!" + chuDb;

    phatBatNapHoi();
    if (h.loai === "dac-biet" || h.loai === "cao" || h.loai === "dac-quyen") {
      datCheDoCanvas("bung", h.loai);
      if (laDacQuyen) phatDacQuyen();
      else window.AmThanh.trung(h.loai === "dac-biet");
      window.Phao.banHaiBen($("phao-hop"), h.loai === "dac-biet" ? 1.8 : 1.25);
    } else {
      datCheDoCanvas("cho");
      window.AmThanh.latDapAn();
      window.Phao.ban($("phao-hop"), 0.85, 0.42);
    }

    luu();
    veSanKhau();
  }

  function batNap() {
    if (hopDangChon < 0 || dangBat) return;
    var h = tt.hop[hopDangChon];
    if (!h || h.daMo) return;

    huyHenGio();
    dangBat = true;
    $("nut-bat-nap").disabled = true;
    $("nut-doi-hop").hidden = true;
    $("nut-dong-hop").disabled = true;

    if (giamChuyenDong()) {
      moTungHop(h);
      return;
    }

    var canKhung = window.HopBiAn.coCanKhungNap(tt.hop);
    var hopLon = $("hb-hop-lon");

    /* Bước 1 (0ms): Bật 2 chốt khóa kim loại */
    hopLon.classList.add("bat-chot");
    $("hb-goi-y-mo").textContent = "Bật chốt khóa hộp số " + so2ChuSo(h.so) + "...";
    phatChotHop();

    /* Bước 2 (220ms): Gồng áp suất + trống dồn tăng tốc + tia sáng rẻ quạt */
    henGio(function () {
      hopLon.classList.add("rung");
      $("hb-goi-y-mo").textContent = "Hộp số " + so2ChuSo(h.so) + " — Cả hội trường cùng đếm 3 – 2 – 1!";
      datCheDoCanvas("gong");
      phatTrongTangToc(canKhung ? 700 : 760);
    }, 220);

    if (canKhung) {
      /* Chặng nước rút: khựng nắp ở 35 độ trong 1.1s kèm nhịp tim */
      henGio(function () {
        hopLon.classList.remove("rung");
        hopLon.classList.add("khung-nap");
        $("hb-goi-y-mo").textContent = "Khoan đã! Hộp số " + so2ChuSo(h.so) + " đang hé mở...";
        datCheDoCanvas("khung");
        phatNhipTim(1100);
      }, 920);

      henGio(function () {
        moTungHop(h);
      }, 2020);
    } else {
      henGio(function () {
        moTungHop(h);
      }, 980);
    }
  }

  function dongHop() {
    if (dangBat) return;
    huyHenGio();
    dungCanvasTia();
    hopDangChon = -1;
    $("hb-san-mo").hidden = true;
  }

  /* ── Bốc Đại biểu tùy chọn (R) ── */
  function bocDaiBieuNgauNhien() {
    if (giaiDoan !== "san-khau" || !$("hb-san-mo").hidden || dangBat || dangBocDaiBieu) return;
    var ds = window.LuuTru.docDanhSach().nguoiChoi;
    if (!ds || !ds.length) {
      datThongBaoTicker("THÔNG BÁO", "Chưa nạp danh sách đại biểu ở trang chủ — mời đại biểu hô tự do!");
      return;
    }

    var dsDaTrungMa = tt.lichSu.map(function (x) { return x.ma; }).filter(Boolean);
    var nguoiChon = window.HopBiAn.bocDaiBieu(ds, dsDaTrungMa);
    if (!nguoiChon) return;

    window.AmThanh.moKhoa();
    if (giamChuyenDong()) {
      tt.daiBieu = nguoiChon;
      thongBaoTicker = "";
      luu();
      capNhatTicker();
      window.AmThanh.denQuet(true);
      return;
    }

    dangBocDaiBieu = true;
    var hopTk = $("hb-ticker");
    var nhan = $("hb-ticker-nhan");
    var chu = $("hb-ticker-chu");
    hopTk.classList.remove("dac-quyen");
    hopTk.classList.add("dang-quay");
    nhan.textContent = "ĐANG BỐC";

    var chiSo = 0;
    idCuonDaiBieu = setInterval(function () {
      var mau = ds[(chiSo * 7 + Math.floor(Math.random() * ds.length)) % ds.length];
      chu.textContent = dinhDangDaiBieu(mau);
      window.AmThanh.soChay();
      chiSo += 1;
    }, 75);

    idChotDaiBieu = setTimeout(function () {
      huyCuonDaiBieu();
      tt.daiBieu = nguoiChon;
      thongBaoTicker = "";
      luu();
      capNhatTicker();
      window.AmThanh.denQuet(true);
    }, 1100);
  }

  /* ── Xuất CSV & In Biên bản A4 ── */
  function xuatCsv() {
    if (!tt.lichSu.length) {
      datThongBaoTicker("THÔNG BÁO", "Chưa có hộp nào được mở để xuất file CSV.");
      return;
    }
    var dong = [
      ["STT", "Số hộp", "Phần thưởng", "Hệ số", "Mã NV", "Họ và tên", "Đơn vị", "Thời gian"],
    ];
    tt.lichSu.forEach(function (item, idx) {
      dong.push([
        String(idx + 1),
        item.soHop,
        item.tenGiai,
        "x" + (item.heSo || 1),
        item.ma || "",
        item.ten || "",
        item.donVi || "",
        item.thoiGian || "",
      ]);
    });
    var ngay = new Date().toISOString().slice(0, 10);
    window.LuuTru.taiCsv(dong, "mo-hop-bi-an-" + ngay + ".csv");
    datThongBaoTicker("XUẤT CSV", "Đã tải xuống kết quả " + tt.lichSu.length + " hộp đã mở.");
  }

  function inBienBan() {
    if (!tt.lichSu.length) {
      datThongBaoTicker("THÔNG BÁO", "Chưa có hộp nào được mở để in biên bản.");
      return;
    }
    if (!window.BienBan || typeof window.BienBan.in !== "function") return;
    window.BienBan.in({
      tenTro: "Mở Hộp Bí Ẩn",
      tenSuKien: window.LuuTru.docTenSuKien(),
      tomTat: "Đã mở " + tt.lichSu.length + " / " + tt.hop.length + " hộp",
      cot: ["STT", "Số hộp", "Phần thưởng", "Hệ số", "Mã NV", "Họ và tên", "Đơn vị", "Thời gian"],
      dong: tt.lichSu.map(function (item, idx) {
        return [
          String(idx + 1),
          "#" + item.soHop,
          item.tenGiai,
          "x" + (item.heSo || 1),
          item.ma || "",
          item.ten || "",
          item.donVi || "",
          item.thoiGian || "",
        ];
      }),
      ghiChu: "Các phần thưởng và đại biểu được xáo trộn, bốc ngẫu nhiên bằng thuật toán mật mã (crypto.getRandomValues).",
    });
  }

  /* ── Điều hướng màn hình ── */
  function vaoSanKhau() {
    if ($("nut-vao").disabled) return;
    window.AmThanh.moKhoa();
    giaiDoan = "san-khau";
    $("man-chuan-bi").hidden = true;
    $("man-san-khau").hidden = false;
    $("hb-san-mo").hidden = true;
    veSanKhau();
  }

  function veChuanBi() {
    if (dangBat) return;
    if (!$("hb-san-mo").hidden) { dongHop(); return; }
    huyCuonDaiBieu();
    huyHenGio();
    dungCanvasTia();
    giaiDoan = "chuan-bi";
    $("man-san-khau").hidden = true;
    $("man-chuan-bi").hidden = false;
    capNhatTongKet();
  }

  function toanManHinh() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(function () {});
    else document.exitFullscreen();
  }

  function ganSuKien() {
    $("o-ds-qua").addEventListener("change", function () {
      var ds = window.HopBiAn.docQuaTuVanBan($("o-ds-qua").value);
      if (ds.length < 2) { bao("loi", "Cần ít nhất 2 phần thưởng để tạo hộp."); return; }
      datLaiVanMoi(ds);
      luu();
      bao("ok", "Đã xáo trộn " + ds.length + " hộp mới.");
    });

    $("nut-mau-12").addEventListener("click", function () {
      datLaiVanMoi(window.HopBiAn.BO_MAU_12);
      $("o-ds-qua").value = tt.quaGoc.map(function (q) { return q.ten; }).join("\n");
      luu();
      bao("ok", "Đã nạp và xáo trộn bộ 12 hộp tiêu chuẩn.");
    });

    $("nut-xao-lai").addEventListener("click", function () {
      datLaiVanMoi(tt.quaGoc);
      luu();
      bao("ok", "Đã xáo trộn lại toàn bộ hộp.");
    });

    $("nut-xao-sk").addEventListener("click", function () {
      if (dangBat) return;
      if (!window.confirm("Xáo trộn lại toàn bộ các hộp cho ván mới?")) return;
      datLaiVanMoi(tt.quaGoc);
      luu();
      veSanKhau();
    });

    $("o-am-thanh").addEventListener("change", function () {
      if ($("o-am-thanh").checked !== window.AmThanh.dangBat()) window.AmThanh.batTat();
    });

    $("nut-vao").addEventListener("click", vaoSanKhau);
    $("nut-ve").addEventListener("click", veChuanBi);
    $("nut-bat-nap").addEventListener("click", batNap);
    $("nut-doi-hop").addEventListener("click", doiHopKhac);
    $("nut-dong-hop").addEventListener("click", dongHop);
    $("nut-boc-dai-bieu").addEventListener("click", bocDaiBieuNgauNhien);
    $("nut-xuat-csv").addEventListener("click", xuatCsv);
    $("nut-in-bien-ban").addEventListener("click", inBienBan);

    document.addEventListener("keydown", function (e) {
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
      if (e.key === "f" || e.key === "F") { toanManHinh(); return; }
      if (e.key === "m" || e.key === "M") { $("o-am-thanh").checked = window.AmThanh.batTat(); return; }
      if (giaiDoan === "chuan-bi") {
        if (e.code === "Space" && !$("nut-vao").disabled) { e.preventDefault(); vaoSanKhau(); }
        return;
      }
      if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        bocDaiBieuNgauNhien();
        return;
      }
      if (e.code === "Space" && !$("hb-san-mo").hidden && !$("nut-bat-nap").hidden && !$("nut-bat-nap").disabled) {
        e.preventDefault();
        batNap();
      } else if (e.key === "Escape") {
        veChuanBi();
      }
    });
  }

  napDaLuu();
  ganSuKien();
  capNhatTongKet();
})();
