/* Điều phối sân khấu Đoán con số bệnh viện: cụm ô lật từng chữ số + thước đo Radar trực quan.
 * Dữ liệu người dùng chỉ vào DOM bằng textContent. */
(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };
  var KHOA = "doan-so";
  var TEN_KHU = ["Khu A", "Khu B", "Khu C", "Khu D"];
  var MAU_KHU = ["#0b4fd6", "#d97706", "#0f766e", "#4f46e5"];

  var tt = { cauHoi: [], cauHinh: { soKhu: 4 }, diem: [0, 0, 0, 0] };
  var giaiDoan = "chuan-bi";
  var viTri = 0;
  var dangChaySo = false;
  var daLat = false;
  var duDoanHienTai = ["", "", "", ""];
  var thuoc = null;

  function bao(loai, chu) {
    var k = $("trang-thai-dso");
    k.className = "trang-thai " + loai;
    k.textContent = "";
    var p = document.createElement("p"); p.textContent = chu; k.appendChild(p);
  }

  function napDaLuu() {
    var d = window.LuuTru.doc(KHOA);
    if (d) {
      tt.cauHoi = Array.isArray(d.cauHoi) ? d.cauHoi.map(window.DoanSo.chuanHoaCau) : [];
      tt.cauHinh = Object.assign({ soKhu: 4 }, d.cauHinh || {});
      tt.diem = Array.isArray(d.diem) && d.diem.length === 4 ? d.diem : [0, 0, 0, 0];
    }
    if (!tt.cauHoi.length) tt.cauHoi = window.DoanSo.boMau();
    $("o-so-khu").value = String(tt.cauHinh.soKhu);
    var ten = window.LuuTru.docTenSuKien();
    document.querySelectorAll(".ten-su-kien").forEach(function (el) { el.textContent = ten; });
  }

  function luu() { window.LuuTru.ghi(KHOA, tt); capNhatTongKet(); }

  function capNhatTongKet() {
    $("so-cau").textContent = String(tt.cauHoi.length);
    $("so-khu-tk").textContent = String(tt.cauHinh.soKhu);
    $("nut-vao").disabled = !tt.cauHoi.length;
  }

  function veDanhSach() {
    var ol = $("ds-cau-so");
    ol.textContent = "";
    tt.cauHoi.forEach(function (c, i) {
      var li = document.createElement("li"); li.className = "cs-dong";
      var dau = document.createElement("div"); dau.className = "cs-dau";
      var stt = document.createElement("span"); stt.className = "cs-stt"; stt.textContent = "Câu " + (i + 1);
      var xoa = document.createElement("button"); xoa.type = "button"; xoa.className = "nut-nho nut-xoa"; xoa.textContent = "×";
      xoa.addEventListener("click", function () { tt.cauHoi.splice(i, 1); luu(); veDanhSach(); });
      dau.append(stt, xoa);

      var oCau = document.createElement("input"); oCau.type = "text"; oCau.value = c.cauHoi; oCau.placeholder = "Nội dung câu hỏi";
      oCau.addEventListener("change", function () { c.cauHoi = oCau.value.trim() || "Câu hỏi"; luu(); });

      var hang = document.createElement("div"); hang.className = "cs-hang-so";
      var oSo = document.createElement("input"); oSo.type = "number"; oSo.min = "0"; oSo.value = String(c.dapAn); oSo.placeholder = "Đáp án số nguyên";
      oSo.addEventListener("change", function () { c.dapAn = Math.max(0, Math.round(Number(oSo.value) || 0)); luu(); });
      var oDv = document.createElement("input"); oDv.type = "text"; oDv.value = c.donVi; oDv.placeholder = "Đơn vị (vd: lượt khám, người…)";
      oDv.addEventListener("change", function () { c.donVi = oDv.value.trim(); luu(); });
      hang.append(oSo, oDv);

      var oGc = document.createElement("input"); oGc.type = "text"; oGc.value = c.ghiChu; oGc.placeholder = "Ghi chú giải thích (hiện sau khi lật đáp án)";
      oGc.addEventListener("change", function () { c.ghiChu = oGc.value.trim(); luu(); });

      li.append(dau, oCau, hang, oGc);
      ol.appendChild(li);
    });
  }

  function layMangDoan() {
    var so = tt.cauHinh.soKhu || 0;
    var ds = [];
    for (var k = 0; k < so; k += 1) {
      var val = duDoanHienTai[k];
      ds.push({ ten: TEN_KHU[k], giaTri: val === "" || val == null ? null : Number(val) });
    }
    return ds;
  }

  /** Tạo dãy ô chữ số cơ khí ứng với định dạng đáp án (ẩn bằng dấu ? trước khi lật). */
  function dungBangO(soDich, an) {
    var chuoi = window.DoanSo.dinhDangSo(soDich);
    var khung = $("sk-cac-o");
    khung.textContent = "";
    var oSo = [];
    chuoi.split("").forEach(function (ch) {
      if (ch === ".") {
        var dot = document.createElement("span");
        dot.className = "o-dau-cham";
        dot.textContent = ".";
        khung.appendChild(dot);
      } else {
        var box = document.createElement("div");
        box.className = "o-chu-so";
        var sp = document.createElement("span");
        sp.textContent = an ? "?" : ch;
        box.appendChild(sp);
        khung.appendChild(box);
        oSo.push({ box: box, sp: sp, kyTu: ch });
      }
    });
    return oSo;
  }

  function veCacKhu(ketQuaSoSanh) {
    var khung = $("sk-cac-khu");
    khung.textContent = "";
    var so = tt.cauHinh.soKhu || 0;
    khung.hidden = !so;
    $("sk-khung-thuoc").hidden = !so;
    for (var i = 0; i < so; i += 1) {
      (function (idx) {
        var thang = ketQuaSoSanh && ketQuaSoSanh.thang.indexOf(idx) >= 0;
        var o = document.createElement("div"); o.className = "khu-o" + (thang ? " gan-nhat" : "");
        var dau = document.createElement("div"); dau.className = "khu-dau";
        var ten = document.createElement("span"); ten.className = "khu-ten";
        var cham = document.createElement("span"); cham.className = "khu-cham"; cham.style.background = MAU_KHU[idx];
        ten.append(cham, document.createTextNode(TEN_KHU[idx]));
        var diem = document.createElement("span"); diem.className = "khu-diem"; diem.textContent = (tt.diem[idx] || 0) + " điểm";
        dau.append(ten, diem);

        var nhap = document.createElement("input"); nhap.type = "number"; nhap.className = "khu-nhap"; nhap.placeholder = "Nhập số đoán";
        nhap.value = duDoanHienTai[idx];
        nhap.disabled = daLat || dangChaySo;
        nhap.addEventListener("input", function () {
          duDoanHienTai[idx] = nhap.value;
          if (thuoc) thuoc.capNhatDoan(layMangDoan());
        });

        var lech = document.createElement("p"); lech.className = "khu-lech";
        if (ketQuaSoSanh) {
          var ct = ketQuaSoSanh.chiTiet[idx];
          if (ct && ct.giaTri !== null) {
            lech.textContent = ct.lech === 0
              ? "Chính xác tuyệt đối! (+10 điểm)"
              : ("Lệch " + window.DoanSo.dinhDangSo(ct.lech) + (thang ? " · Gần nhất! (+10 điểm)" : ""));
          } else {
            lech.textContent = "Chưa nhập số đoán";
          }
        }
        o.append(dau, nhap, lech);
        khung.appendChild(o);
      })(i);
    }
    if (thuoc) thuoc.capNhatDoan(layMangDoan());
  }

  function chonCau(i) {
    if (dangChaySo || i < 0 || i >= tt.cauHoi.length) return;
    viTri = i;
    daLat = false;
    duDoanHienTai = ["", "", "", ""];
    var c = tt.cauHoi[viTri];
    $("sk-chi-so").textContent = "Câu " + (viTri + 1) + " / " + tt.cauHoi.length;
    $("sk-cau-hoi").textContent = c.cauHoi;
    $("sk-bang-so").classList.remove("da-mo");
    dungBangO(c.dapAn, true);
    $("sk-don-vi").textContent = c.donVi || "";
    $("sk-ghi-chu").hidden = true;
    $("nut-truoc").disabled = viTri === 0;
    $("nut-sau").disabled = viTri >= tt.cauHoi.length - 1;
    $("nut-lat").disabled = false;
    if (thuoc) thuoc.datLai();
    veCacKhu(null);
  }

  /** Quay từng ô chữ số cơ khí từ trái sang phải đồng bộ với tia quét Radar, chốt từng số rồi phát sóng radar. */
  function latDapAn() {
    if (dangChaySo || daLat) return;
    var c = tt.cauHoi[viTri];
    if (!c) return;
    dangChaySo = true;
    $("nut-lat").disabled = true;
    veCacKhu(null);
    if (thuoc) thuoc.batDauQuet();

    var cacO = dungBangO(c.dapAn, false);
    cacO.forEach(function (o) { o.box.classList.add("dang-quay"); });

    var moc = performance.now();
    var thoiGianChot = cacO.map(function (_, i) {
      var cuoi = i === cacO.length - 1;
      return 900 + i * 380 + (cuoi ? 650 : 0);
    });
    var daChot = cacO.map(function () { return false; });
    var tickCuoi = 0;

    requestAnimationFrame(function buoc(t) {
      var qua = t - moc;
      var xongHet = true;
      for (var i = 0; i < cacO.length; i += 1) {
        if (daChot[i]) continue;
        if (qua >= thoiGianChot[i]) {
          daChot[i] = true;
          cacO[i].sp.textContent = cacO[i].kyTu;
          cacO[i].box.classList.remove("dang-quay");
          cacO[i].box.classList.add("da-chot");
          window.AmThanh.cach(i === cacO.length - 1);
        } else {
          xongHet = false;
          cacO[i].sp.textContent = String(Math.floor(Math.random() * 10));
        }
      }
      if (!xongHet) {
        if (t - tickCuoi > 85) {
          tickCuoi = t;
          window.AmThanh.radarQuet(Math.min(1, qua / thoiGianChot[thoiGianChot.length - 1]));
        }
        requestAnimationFrame(buoc);
        return;
      }

      dangChaySo = false;
      daLat = true;
      $("sk-bang-so").classList.add("da-mo");
      $("sk-ghi-chu").hidden = !c.ghiChu;
      $("sk-ghi-chu").textContent = c.ghiChu || "";
      window.AmThanh.latDapAn();
      window.Phao.banHaiBen($("phao-dso"), 1.35);

      var so = tt.cauHinh.soKhu || 0;
      if (so > 0) {
        var dsDoan = layMangDoan();
        var kq = window.DoanSo.timDoiGanNhat(c.dapAn, dsDoan);
        kq.thang.forEach(function (idx) { tt.diem[idx] = (tt.diem[idx] || 0) + 10; });
        luu();
        veCacKhu(kq);
        if (thuoc) thuoc.chotDapAn(c.dapAn, kq.thang);
      }
    });
  }

  function vaoSanKhau() {
    if (!tt.cauHoi.length) return;
    window.AmThanh.moKhoa();
    giaiDoan = "san-khau";
    $("man-chuan-bi").hidden = true;
    $("man-san-khau").hidden = false;
    if (!thuoc) thuoc = window.VeThuoc.tao($("thuoc-canvas"));
    chonCau(0);
  }

  function veChuanBi() {
    if (dangChaySo) return;
    if (thuoc) thuoc.dung();
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
    $("nut-them-cau").addEventListener("click", function () {
      tt.cauHoi.push(window.DoanSo.chuanHoaCau({ cauHoi: "Câu hỏi mới", dapAn: 100, donVi: "" }));
      luu(); veDanhSach();
    });
    $("nut-nap-mau").addEventListener("click", function () {
      if (!tt.cauHoi.length || window.confirm("Thay danh sách câu hỏi hiện tại bằng bộ mẫu?")) {
        tt.cauHoi = window.DoanSo.boMau();
        luu(); veDanhSach();
        bao("ok", "Đã nạp bộ câu hỏi con số mẫu.");
      }
    });
    $("o-so-khu").addEventListener("change", function () { tt.cauHinh.soKhu = Number($("o-so-khu").value) || 0; luu(); });
    $("o-am-thanh").addEventListener("change", function () { if ($("o-am-thanh").checked !== window.AmThanh.dangBat()) window.AmThanh.batTat(); });
    $("nut-dat-lai-diem").addEventListener("click", function () { tt.diem = [0, 0, 0, 0]; luu(); bao("ok", "Đã đặt lại điểm các khu vực về 0."); });
    $("nut-vao").addEventListener("click", vaoSanKhau);
    $("nut-ve").addEventListener("click", veChuanBi);
    $("nut-truoc").addEventListener("click", function () { chonCau(viTri - 1); });
    $("nut-sau").addEventListener("click", function () { chonCau(viTri + 1); });
    $("nut-lat").addEventListener("click", latDapAn);

    document.addEventListener("keydown", function (e) {
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
      if (e.key === "f" || e.key === "F") { toanManHinh(); return; }
      if (e.key === "m" || e.key === "M") { $("o-am-thanh").checked = window.AmThanh.batTat(); return; }
      if (giaiDoan === "chuan-bi") {
        if (e.code === "Space" && !$("nut-vao").disabled) { e.preventDefault(); vaoSanKhau(); }
        return;
      }
      if (e.code === "Space" || e.key === "Enter") {
        e.preventDefault();
        if (!daLat) latDapAn();
        else if (viTri < tt.cauHoi.length - 1) chonCau(viTri + 1);
      } else if (e.key === "ArrowLeft") chonCau(viTri - 1);
      else if (e.key === "ArrowRight") chonCau(viTri + 1);
      else if (e.key === "Escape") veChuanBi();
    });
  }

  napDaLuu();
  veDanhSach();
  ganSuKien();
  capNhatTongKet();
})();
