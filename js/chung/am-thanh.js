/* Âm thanh tạo bằng Web Audio, không cần file nhạc. Bật/tắt bằng phím M. */
(function (root) {
  "use strict";

  var ac = null;
  var bat = true;
  var nhacNen = null;

  function ctx() {
    if (!ac) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ac = new AC();
    }
    if (ac.state === "suspended") ac.resume();
    return ac;
  }

  function not(tanSo, batDau, dai, kieu, am) {
    var a = ctx(); if (!a || !bat) return;
    var o = a.createOscillator(), g = a.createGain();
    o.type = kieu || "sine"; o.frequency.value = tanSo;
    var t = a.currentTime + (batDau || 0);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(am || 0.18, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dai);
    o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + dai + 0.05);
  }

  function quac(batDau) {
    var a = ctx(); if (!a || !bat) return;
    var o = a.createOscillator(), g = a.createGain(), f = a.createBiquadFilter();
    var t = a.currentTime + (batDau || 0);
    o.type = "sawtooth"; o.frequency.setValueAtTime(620, t); o.frequency.exponentialRampToValueAtTime(360, t + 0.18);
    f.type = "bandpass"; f.frequency.value = 1100; f.Q.value = 4;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.25, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    o.connect(f); f.connect(g); g.connect(a.destination); o.start(t); o.stop(t + 0.25);
  }

  var api = {
    batTat: function () { bat = !bat; if (!bat) api.dungNhac(); return bat; },
    dangBat: function () { return bat; },
    moKhoa: function () { ctx(); },
    demNguoc: function (so) { not(so > 0 ? 660 : 990, 0, so > 0 ? 0.25 : 0.6, "square", 0.12); },
    xuatPhat: function () { quac(0); quac(0.22); },
    veDich: function () { [523, 659, 784].forEach(function (f, i) { not(f, i * 0.09, 0.35, "triangle", 0.2); }); },
    congBo: function (hang) {
      if (hang === 1) [523, 659, 784, 1047, 784, 1047].forEach(function (f, i) { not(f, i * 0.14, i === 5 ? 0.9 : 0.3, "triangle", 0.22); });
      else [440, 554].forEach(function (f, i) { not(f, i * 0.12, 0.3, "triangle", 0.18); });
    },
    nuocRut: function () { [659, 784, 988].forEach(function (f, i) { not(f, i * 0.07, 0.18, "square", 0.07); }); },
    satNut: function () { not(220, 0, 0.6, "sine", 0.18); not(330, 0.05, 0.6, "sine", 0.12); },
    tick: function () { not(1800 + Math.random() * 300, 0, 0.03, "square", 0.025); },
    cach: function (cuoi) { not(cuoi ? 180 : 260, 0, cuoi ? 0.25 : 0.12, "square", cuoi ? 0.16 : 0.1); },
    trung: function (lon) {
      var giai = lon ? [523, 659, 784, 1047, 1319] : [659, 784, 1047];
      giai.forEach(function (f, i) { not(f, i * 0.11, i === giai.length - 1 ? 0.8 : 0.25, "triangle", 0.2); });
    },
    dung: function () {
      [523, 659, 784, 1047].forEach(function (f, i) { not(f, i * 0.08, i === 3 ? 0.55 : 0.18, "triangle", 0.2); });
    },
    sai: function () {
      not(240, 0, 0.22, "sawtooth", 0.1);
      not(180, 0.16, 0.32, "sawtooth", 0.1);
    },
    vongQuayTick: function () {
      not(1100 + Math.random() * 180, 0, 0.032, "triangle", 0.08);
    },
    soChay: function () {
      not(880 + Math.random() * 240, 0, 0.025, "sine", 0.035);
    },
    latDapAn: function () {
      [392, 523, 659, 784, 1047].forEach(function (f, i) { not(f, i * 0.08, i === 4 ? 0.75 : 0.22, "triangle", 0.2); });
    },
    moManh: function () {
      not(520, 0, 0.08, "triangle", 0.14);
      not(780, 0.05, 0.12, "sine", 0.12);
    },
    chupAnh: function () {
      not(1400, 0, 0.035, "square", 0.09);
      not(620, 0.04, 0.07, "triangle", 0.11);
    },
    denQuet: function (cao) {
      not(cao ? 720 : 540, 0, 0.06, "triangle", 0.09);
    },
    trongDon: function (thoiGianMs) {
      var tong = Math.max(400, thoiGianMs || 1100);
      var buoc = 12;
      for (var i = 0; i < buoc; i += 1) {
        var t = (i / buoc) * (tong / 1000);
        not(140 + i * 16, t, 0.07, "triangle", 0.08 + (i / buoc) * 0.09);
      }
    },
    radarQuet: function (tienDo) {
      not(320 + (tienDo || 0) * 520, 0, 0.055, "sine", 0.06);
    },
    loai5050: function () {
      [520, 410, 310, 220].forEach(function (f, i) { not(f, i * 0.07, 0.14, "sawtooth", 0.08); });
    },
    batNhac: function () {
      api.dungNhac();
      var giai = [392, 494, 587, 494, 440, 523, 659, 523];
      var i = 0;
      nhacNen = setInterval(function () {
        not(giai[i % giai.length], 0, 0.16, "triangle", 0.06);
        if (i % 4 === 0) not(196, 0, 0.2, "sine", 0.08);
        i += 1;
      }, 190);
    },
    dungNhac: function () { if (nhacNen) { clearInterval(nhacNen); nhacNen = null; } },
  };
  root.AmThanh = api;
})(window);
