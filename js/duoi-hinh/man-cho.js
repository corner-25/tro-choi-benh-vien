/* Màn hình chờ của Đuổi hình bắt chữ: chiếu lên máy chiếu trong lúc khán giả vào chỗ.
 * - Câu ví dụ (THANG MÁY, không nằm trong bộ thi) tự chạy lặp: mảnh logo lật dần → hiện đáp án → đóng dấu "ĐÚNG".
 * - Luật chơi 3 bước, thông tin lượt thi (số câu, mức độ, đội), đồng hồ và đếm ngược tới giờ bắt đầu.
 * Dữ liệu chỉ vào DOM bằng textContent. API: window.ManChoDH = { mo(thongTin), dong(), doiPhut(delta) }. */
(function (root) {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };
  var VI_DU = { canhId: "tranh:thang-may", dapAn: "THANG MÁY", giaiThich: "Cái THANG + bánh răng MÁY = THANG MÁY" };
  var NHIP_LAT = 380, CHO_DAP_AN = 900, GIU_DAP_AN = 4200; // ms
  var ve = null, hen = [], dongHo = 0, hetLuc = 0, daBaoHet = false;

  function sau(ms, fn) { hen.push(setTimeout(fn, ms)); }
  function huyHen() { hen.forEach(clearTimeout); hen = []; }
  function hai(so) { return (so < 10 ? "0" : "") + so; }

  // ── Câu ví dụ chạy lặp ──
  function dungOVidu() {
    var khung = $("cho-o-chu");
    khung.textContent = "";
    var cacO = [];
    window.DuoiHinh.demTu(VI_DU.dapAn).forEach(function (t) {
      var nhom = document.createElement("div"); nhom.className = "dh-tu";
      Array.from(t.tu).forEach(function (chu) {
        var o = document.createElement("div"); o.className = "dh-o";
        var mat = document.createElement("span"); mat.className = "dh-o-mat"; mat.textContent = chu;
        o.appendChild(mat); nhom.appendChild(o); cacO.push(o);
      });
      khung.appendChild(nhom);
    });
    return cacO;
  }

  function chayViDu() {
    huyHen();
    var cacO = dungOVidu();
    $("cho-giai-thich").classList.remove("hien");
    $("cho-giai-thich").textContent = VI_DU.giaiThich;
    ve.datCau(VI_DU.canhId, null);
    for (var k = 0; k < 12; k += 1) sau(600 + k * NHIP_LAT, function () { ve.moMot(); });
    var moXong = 600 + 12 * NHIP_LAT + CHO_DAP_AN;
    cacO.forEach(function (o, i) { sau(moXong + i * 110, function () { o.classList.add("hien"); }); });
    var latXong = moXong + cacO.length * 110 + 250;
    sau(latXong, function () { ve.dongDau(); $("cho-giai-thich").classList.add("hien"); });
    sau(latXong + GIU_DAP_AN, chayViDu);
  }

  // ── Đồng hồ và đếm ngược ──
  function capNhatDongHo() {
    var bay = new Date();
    $("cho-gio").textContent = hai(bay.getHours()) + ":" + hai(bay.getMinutes());
    var bang = $("cho-dem");
    if (!hetLuc) { bang.dataset.trangThai = "san-sang"; $("cho-dem-nhan").textContent = "Trò chơi sắp bắt đầu"; $("cho-dem-so").textContent = ""; return; }
    var con = Math.max(0, Math.ceil((hetLuc - Date.now()) / 1000));
    if (con > 0) {
      bang.dataset.trangThai = con <= 60 ? "gap" : "dem";
      $("cho-dem-nhan").textContent = "Bắt đầu sau";
      $("cho-dem-so").textContent = hai(Math.floor(con / 60)) + ":" + hai(con % 60);
      daBaoHet = false;
      return;
    }
    bang.dataset.trangThai = "het";
    $("cho-dem-nhan").textContent = "Mời mọi người cùng chơi!";
    $("cho-dem-so").textContent = "";
    if (!daBaoHet) { daBaoHet = true; root.AmThanh.latDapAn(); }
  }

  /** Thêm hoặc bớt số phút đếm ngược (MC bấm + / −). Hết giờ rồi mà bấm + thì đếm lại từ bây giờ. */
  function doiPhut(delta) {
    var goc = hetLuc && hetLuc > Date.now() ? hetLuc : Date.now();
    var moi = goc + delta * 60000;
    hetLuc = moi - Date.now() > 1000 ? Math.min(moi, Date.now() + 60 * 60000) : 0;
    capNhatDongHo();
  }

  // ── Thông tin lượt thi ──
  function veThongTin(tt) {
    var muc = tt.mucDo || {};
    $("cho-so-cau").textContent = String(tt.soCau);
    var phan = [["de", "dễ"], ["vua", "vừa"], ["kho", "khó"], ["khac", "khác"]]
      .filter(function (m) { return muc[m[0]] > 0; })
      .map(function (m) { return muc[m[0]] + " " + m[1]; });
    $("cho-muc").textContent = phan.join(" · ");
    $("cho-doi").hidden = !tt.soDoi;
    $("cho-doi-so").textContent = String(tt.soDoi || 0);
    $("cho-thoi-gian").textContent = tt.thoiGian ? tt.thoiGian + " giây mỗi câu" : "MC mở hình từng câu";
  }

  /**
   * Mở màn hình chờ.
   * thongTin: { soCau, mucDo: { de, vua, kho, khac }, soDoi, thoiGian, phut, tenSuKien }
   */
  function mo(thongTin) {
    veThongTin(thongTin);
    hetLuc = thongTin.phut > 0 ? Date.now() + thongTin.phut * 60000 : 0;
    daBaoHet = false;
    $("man-cho").hidden = false;
    if (!ve) ve = root.VeTranh.tao($("cho-canvas"));
    chayViDu();
    capNhatDongHo();
    clearInterval(dongHo);
    dongHo = setInterval(capNhatDongHo, 500);
  }

  function dong() {
    huyHen();
    clearInterval(dongHo); dongHo = 0;
    if (ve) ve.dung();
    $("man-cho").hidden = true;
  }

  root.ManChoDH = { mo: mo, dong: dong, doiPhut: doiPhut };
})(window);
