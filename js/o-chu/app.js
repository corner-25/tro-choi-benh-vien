/* Điều phối sân khấu Lật Ô Chữ 3D. Dữ liệu người dùng chỉ vào DOM bằng textContent. */
(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };
  var KHOA = "o-chu";

  var tt = { ds: [] };
  var giaiDoan = "chuan-bi";
  var viTri = 0;
  var daMo = [];
  var chuDaDoan = {};
  var oDom = {};
  var daXong = false;

  function napDaLuu() {
    var d = window.LuuTru.doc(KHOA);
    if (d && Array.isArray(d.ds) && d.ds.length) tt.ds = d.ds.map(window.OChu.chuanHoa);
    else tt.ds = window.OChu.boMau();
    var ten = window.LuuTru.docTenSuKien();
    document.querySelectorAll(".ten-su-kien").forEach(function (el) { el.textContent = ten; });
  }

  function luu() { window.LuuTru.ghi(KHOA, tt); $("so-tu").textContent = String(tt.ds.length); $("nut-vao").disabled = !tt.ds.length; }

  function veDanhSach() {
    var ol = $("ds-tu-khoa");
    ol.textContent = "";
    tt.ds.forEach(function (item, i) {
      var li = document.createElement("li"); li.className = "oc-dong";
      var dau = document.createElement("div"); dau.className = "oc-dong-dau";
      var stt = document.createElement("span"); stt.className = "oc-stt"; stt.textContent = "Từ khóa " + (i + 1);
      var xoa = document.createElement("button"); xoa.type = "button"; xoa.className = "nut-nho nut-xoa"; xoa.textContent = "×";
      xoa.addEventListener("click", function () { tt.ds.splice(i, 1); luu(); veDanhSach(); });
      dau.append(stt, xoa);

      var oTu = document.createElement("input"); oTu.type = "text"; oTu.value = item.tuKhoa; oTu.placeholder = "Từ khóa (tiếng Việt có dấu)";
      oTu.addEventListener("change", function () { item.tuKhoa = (oTu.value.trim() || "TỪ KHÓA").toUpperCase(); oTu.value = item.tuKhoa; luu(); });
      var oGoiY = document.createElement("input"); oGoiY.type = "text"; oGoiY.value = item.goiY; oGoiY.placeholder = "Gợi ý chiếu cho khán giả";
      oGoiY.addEventListener("change", function () { item.goiY = oGoiY.value.trim(); luu(); });
      var oYN = document.createElement("input"); oYN.type = "text"; oYN.value = item.yNghia; oYN.placeholder = "Thông điệp hiện sau khi giải xong";
      oYN.addEventListener("change", function () { item.yNghia = oYN.value.trim(); luu(); });

      li.append(dau, oTu, oGoiY, oYN);
      ol.appendChild(li);
    });
  }

  function veBanPhim() {
    var khung = $("sk-phim");
    khung.textContent = "";
    window.OChu.BANG_CHU.forEach(function (ch) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "phim-chu" + (chuDaDoan[ch] ? " " + chuDaDoan[ch] : "");
      b.textContent = ch;
      b.disabled = Boolean(chuDaDoan[ch]) || daXong;
      b.addEventListener("click", function () { chonChu(ch); });
      khung.appendChild(b);
    });
  }

  function capNhatThongKe() {
    var item = tt.ds[viTri];
    if (!item) return;
    var tongChu = 0;
    for (var i = 0; i < item.tuKhoa.length; i += 1) if (/[A-Z]/.test(window.OChu.boDauKyTu(item.tuKhoa[i]))) tongChu += 1;
    $("sk-thong-ke").textContent = "Đã mở " + daMo.length + " / " + tongChu + " chữ cái";
  }

  function chonTu(idx) {
    if (idx < 0 || idx >= tt.ds.length) return;
    viTri = idx;
    daMo = [];
    chuDaDoan = {};
    oDom = {};
    daXong = false;
    var item = tt.ds[viTri];
    $("sk-chi-so").textContent = "Từ khóa " + (viTri + 1) + " / " + tt.ds.length;
    $("sk-goi-y").textContent = item.goiY || "Đoán từ khóa bí mật của hội nghị!";
    $("sk-y-nghia").hidden = true;
    $("nut-truoc").disabled = viTri === 0;
    $("nut-sau").disabled = viTri >= tt.ds.length - 1;
    $("nut-giai").disabled = false;

    var bang = $("sk-bang");
    bang.textContent = "";
    var s = item.tuKhoa;
    var idxGoc = 0;
    s.split(" ").forEach(function (tu, tIdx) {
      if (tIdx > 0) idxGoc += 1; // khoảng trắng
      var nhom = document.createElement("div"); nhom.className = "oc-tu";
      for (var k = 0; k < tu.length; k += 1) {
        var ch = tu[k];
        var o = document.createElement("div"); o.className = "oc-o";
        var truoc = document.createElement("div"); truoc.className = "oc-mat oc-truoc";
        var sau = document.createElement("div"); sau.className = "oc-mat oc-sau"; sau.textContent = ch;
        o.append(truoc, sau);
        if (!/[A-Z]/.test(window.OChu.boDauKyTu(ch))) o.classList.add("da-mo");
        oDom[idxGoc] = o;
        nhom.appendChild(o);
        idxGoc += 1;
      }
      bang.appendChild(nhom);
    });
    capNhatThongKe();
    veBanPhim();
  }

  function hoanThanh() {
    if (daXong) return;
    daXong = true;
    var item = tt.ds[viTri];
    $("sk-y-nghia").hidden = !item.yNghia;
    $("sk-y-nghia").textContent = item.yNghia || "";
    $("nut-giai").disabled = true;
    veBanPhim();
    window.AmThanh.trung(true);
    window.Phao.banHaiBen($("phao-oc"), 1.5);
  }

  function chonChu(ch) {
    if (daXong || chuDaDoan[ch]) return;
    var item = tt.ds[viTri];
    var khop = window.OChu.doanChu(item.tuKhoa, ch);
    if (!khop.length) {
      chuDaDoan[ch] = "truot";
      window.AmThanh.sai();
      veBanPhim();
      return;
    }
    chuDaDoan[ch] = "trung";
    veBanPhim();
    khop.forEach(function (pos, step) {
      if (daMo.indexOf(pos) < 0) daMo.push(pos);
      setTimeout(function () {
        var o = oDom[pos];
        if (o) { o.classList.add("da-mo", "vua-lat"); setTimeout(function () { o.classList.remove("vua-lat"); }, 700); }
        window.AmThanh.moManh();
        capNhatThongKe();
        if (step === khop.length - 1 && window.OChu.daMoHet(item.tuKhoa, daMo)) {
          setTimeout(hoanThanh, 320);
        }
      }, step * 150);
    });
  }

  function giaiToanBo() {
    if (daXong) return;
    var item = tt.ds[viTri];
    var chua = [];
    for (var i = 0; i < item.tuKhoa.length; i += 1) {
      if (/[A-Z]/.test(window.OChu.boDauKyTu(item.tuKhoa[i])) && daMo.indexOf(i) < 0) chua.push(i);
    }
    chua.forEach(function (pos, step) {
      daMo.push(pos);
      setTimeout(function () {
        var o = oDom[pos];
        if (o) o.classList.add("da-mo", "vua-lat");
        window.AmThanh.vongQuayTick();
        capNhatThongKe();
      }, step * 65);
    });
    setTimeout(hoanThanh, chua.length * 65 + 220);
  }

  function vaoSanKhau() {
    if (!tt.ds.length) return;
    window.AmThanh.moKhoa();
    giaiDoan = "san-khau";
    $("man-chuan-bi").hidden = true;
    $("man-san-khau").hidden = false;
    chonTu(0);
  }

  function veChuanBi() {
    giaiDoan = "chuan-bi";
    $("man-san-khau").hidden = true;
    $("man-chuan-bi").hidden = false;
  }

  function toanManHinh() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(function () {});
    else document.exitFullscreen();
  }

  function ganSuKien() {
    $("nut-them").addEventListener("click", function () { tt.ds.push(window.OChu.chuanHoa({ tuKhoa: "TỪ KHÓA MỚI", goiY: "Gợi ý..." })); luu(); veDanhSach(); });
    $("nut-mau").addEventListener("click", function () {
      if (!tt.ds.length || window.confirm("Thay danh sách bằng 6 từ khóa mẫu hội nghị?")) { tt.ds = window.OChu.boMau(); luu(); veDanhSach(); }
    });
    $("o-am-thanh").addEventListener("change", function () { if ($("o-am-thanh").checked !== window.AmThanh.dangBat()) window.AmThanh.batTat(); });
    $("nut-vao").addEventListener("click", vaoSanKhau);
    $("nut-ve").addEventListener("click", veChuanBi);
    $("nut-truoc").addEventListener("click", function () { chonTu(viTri - 1); });
    $("nut-sau").addEventListener("click", function () { chonTu(viTri + 1); });
    $("nut-giai").addEventListener("click", giaiToanBo);

    document.addEventListener("keydown", function (e) {
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
      if (e.key === "Escape") { if (giaiDoan === "san-khau") veChuanBi(); return; }
      if (giaiDoan === "chuan-bi") {
        if (e.code === "Space" && !$("nut-vao").disabled) { e.preventDefault(); vaoSanKhau(); }
        return;
      }
      if (e.key === "Enter") { e.preventDefault(); giaiToanBo(); }
      else if (e.key === "ArrowLeft") chonTu(viTri - 1);
      else if (e.key === "ArrowRight") chonTu(viTri + 1);
      else if (/^[a-zA-Z]$/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
        chonChu(e.key.toUpperCase());
      }
    });
  }

  napDaLuu();
  veDanhSach();
  ganSuKien();
  luu();
})();
