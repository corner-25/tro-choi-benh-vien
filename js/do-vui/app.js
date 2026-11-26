/* Điều phối sân khấu Đố vui giơ thẻ A/B: hiệu ứng thẻ bay vào, đèn quét trống dồn lật 3D và cột điểm năng lượng.
 * Dữ liệu người dùng chỉ vào DOM bằng textContent. */
(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };
  var KHOA = "do-vui";
  var TEN_DOI_MAC_DINH = ["Khu A", "Khu B", "Khu C", "Khu D"];
  var CHU_VI_VONG = 226.2;

  var tt = { cauHoi: [], cauHinh: { thoiGian: 15, soDoi: 2 }, diem: [0, 0, 0, 0] };
  var giaiDoan = "chuan-bi";
  var viTri = 0;
  var daHienDapAn = false;
  var dangQuetDapAn = false;
  var daLoai5050 = [];
  var demNguocTimer = null;
  var conLaiGiay = 0;
  var doiVuaCong = -1;

  function bao(loai, chu, chiTiet) {
    var k = $("trang-thai-dv");
    k.className = "trang-thai " + loai;
    k.textContent = "";
    var p = document.createElement("p"); p.textContent = chu; k.appendChild(p);
    if (chiTiet && chiTiet.length) {
      var ul = document.createElement("ul");
      chiTiet.slice(0, 6).forEach(function (c) { var li = document.createElement("li"); li.textContent = c; ul.appendChild(li); });
      k.appendChild(ul);
    }
  }

  function napDaLuu() {
    var d = window.LuuTru.doc(KHOA);
    if (d) {
      tt.cauHoi = Array.isArray(d.cauHoi) ? d.cauHoi.map(window.DoVui.chuanHoaCauHoi) : [];
      tt.cauHinh = Object.assign({ thoiGian: 15, soDoi: 2 }, d.cauHinh || {});
      tt.diem = Array.isArray(d.diem) && d.diem.length === 4 ? d.diem : [0, 0, 0, 0];
    }
    if (!tt.cauHoi.length) tt.cauHoi = window.DoVui.boCauHoiMau();
    $("o-gio-cau").value = String(tt.cauHinh.thoiGian);
    $("o-so-doi").value = String(tt.cauHinh.soDoi);
    var ten = window.LuuTru.docTenSuKien();
    document.querySelectorAll(".ten-su-kien").forEach(function (el) { el.textContent = ten; });
  }

  function luu() { window.LuuTru.ghi(KHOA, tt); capNhatTongKet(); }

  function capNhatTongKet() {
    $("so-cau").textContent = String(tt.cauHoi.length);
    $("so-doi-tk").textContent = String(tt.cauHinh.soDoi);
    $("nut-vao").disabled = !tt.cauHoi.length;
  }

  function veDanhSachCauHoi() {
    var ol = $("ds-cau-hoi");
    ol.textContent = "";
    tt.cauHoi.forEach(function (c, i) {
      var li = document.createElement("li"); li.className = "ch-dong";
      var dau = document.createElement("div"); dau.className = "ch-dau";
      var stt = document.createElement("span"); stt.className = "ch-stt"; stt.textContent = "Câu " + (i + 1) + " (" + (c.luaChon.length === 4 ? "A/B/C/D" : "A/B") + ")";
      var dk = document.createElement("div"); dk.className = "ch-dk";
      var len = document.createElement("button"); len.type = "button"; len.className = "nut-nho"; len.textContent = "↑"; len.disabled = i === 0;
      len.addEventListener("click", function () { var t = tt.cauHoi[i]; tt.cauHoi[i] = tt.cauHoi[i - 1]; tt.cauHoi[i - 1] = t; luu(); veDanhSachCauHoi(); });
      var xuong = document.createElement("button"); xuong.type = "button"; xuong.className = "nut-nho"; xuong.textContent = "↓"; xuong.disabled = i === tt.cauHoi.length - 1;
      xuong.addEventListener("click", function () { var t = tt.cauHoi[i]; tt.cauHoi[i] = tt.cauHoi[i + 1]; tt.cauHoi[i + 1] = t; luu(); veDanhSachCauHoi(); });
      var xoa = document.createElement("button"); xoa.type = "button"; xoa.className = "nut-nho nut-xoa"; xoa.textContent = "×";
      xoa.addEventListener("click", function () { tt.cauHoi.splice(i, 1); luu(); veDanhSachCauHoi(); });
      dk.append(len, xuong, xoa);
      dau.append(stt, dk);

      var oCau = document.createElement("input"); oCau.type = "text"; oCau.value = c.cauHoi; oCau.placeholder = "Nội dung câu hỏi";
      oCau.addEventListener("change", function () { c.cauHoi = oCau.value.trim() || "Câu hỏi"; luu(); });

      var luoi = document.createElement("div"); luoi.className = "ch-luoi-o";
      c.luaChon.forEach(function (pa, k) {
        var o = document.createElement("div"); o.className = "ch-o-lua" + (c.dapAn === k ? " la-dung" : "");
        var nutDap = document.createElement("button"); nutDap.type = "button"; nutDap.className = "nhan-dap-an";
        nutDap.textContent = window.DoVui.NHAN[k];
        nutDap.title = "Bấm để đặt làm đáp án đúng";
        nutDap.addEventListener("click", function () { c.dapAn = k; luu(); veDanhSachCauHoi(); });
        var inp = document.createElement("input"); inp.type = "text"; inp.value = pa; inp.placeholder = "Phương án " + window.DoVui.NHAN[k];
        inp.addEventListener("change", function () { c.luaChon[k] = inp.value.trim() || ("Phương án " + window.DoVui.NHAN[k]); luu(); });
        o.append(nutDap, inp);
        luoi.appendChild(o);
      });

      var chan = document.createElement("div"); chan.className = "ch-chan";
      var gt = document.createElement("input"); gt.type = "text"; gt.value = c.giaiThich; gt.placeholder = "Giải thích ngắn hiện sau khi lật đáp án (không bắt buộc)";
      gt.addEventListener("change", function () { c.giaiThich = gt.value.trim(); luu(); });
      chan.appendChild(gt);

      li.append(dau, oCau, luoi, chan);
      ol.appendChild(li);
    });
  }

  // ── Sân khấu ──
  function dungGio() {
    if (demNguocTimer) { clearInterval(demNguocTimer); demNguocTimer = null; }
    $("man-san-khau").classList.remove("sap-het-gio");
  }

  function congDiem(idx, so) {
    tt.diem[idx] = Math.max(0, (tt.diem[idx] || 0) + so);
    doiVuaCong = so > 0 ? idx : -1;
    if (so > 0) window.AmThanh.dung();
    luu();
    veBangDiem();
  }

  function veBangDiem() {
    var khung = $("sk-bang-diem");
    khung.textContent = "";
    var so = tt.cauHinh.soDoi || 0;
    var maxDiem = 10;
    for (var m = 0; m < so; m += 1) if ((tt.diem[m] || 0) > maxDiem) maxDiem = tt.diem[m];
    var coDiem = maxDiem > 0 && tt.diem.slice(0, so).some(function (x) { return x > 0; });

    for (var i = 0; i < so; i += 1) {
      (function (idx) {
        var d = tt.diem[idx] || 0;
        var danDau = coDiem && d === maxDiem;
        var the = document.createElement("div");
        the.className = "doi-the" + (danDau ? " dan-dau" : "") + (doiVuaCong === idx ? " vua-cong" : "");

        var hang = document.createElement("div"); hang.className = "doi-hang";
        var ten = document.createElement("span"); ten.className = "doi-ten"; ten.textContent = TEN_DOI_MAC_DINH[idx];
        hang.appendChild(ten);
        if (danDau) {
          var hh = document.createElement("span"); hh.className = "doi-huy-hieu"; hh.textContent = "DẪN ĐẦU";
          hang.appendChild(hh);
        }

        var diemHang = document.createElement("div"); diemHang.className = "doi-diem-hang";
        var diem = document.createElement("span"); diem.className = "doi-diem"; diem.textContent = String(d);
        var nhom = document.createElement("div"); nhom.className = "doi-nut-nhom";
        var cong = document.createElement("button"); cong.type = "button"; cong.className = "doi-nut"; cong.textContent = "+10";
        cong.addEventListener("click", function () { congDiem(idx, 10); });
        var tru = document.createElement("button"); tru.type = "button"; tru.className = "doi-nut"; tru.textContent = "-5";
        tru.addEventListener("click", function () { congDiem(idx, -5); });
        nhom.append(cong, tru);
        diemHang.append(diem, nhom);

        var thanh = document.createElement("div"); thanh.className = "doi-thanh";
        var ruot = document.createElement("span"); ruot.style.width = Math.round((d / maxDiem) * 100) + "%";
        thanh.appendChild(ruot);

        the.append(hang, diemHang, thanh);
        khung.appendChild(the);
      })(i);
    }
    doiVuaCong = -1;
  }

  function capNhatHienThiGio() {
    var tong = tt.cauHinh.thoiGian || 0;
    var hop = $("sk-vong-gio");
    if (!tong) { hop.hidden = true; return; }
    hop.hidden = false;
    var giay = Math.ceil(conLaiGiay);
    $("sk-dong-ho").textContent = String(giay).padStart(2, "0");
    var tiLe = Math.max(0, Math.min(1, conLaiGiay / tong));
    $("sk-vong-tien").style.strokeDashoffset = String(CHU_VI_VONG * (1 - tiLe));
    var sapHet = Boolean(demNguocTimer) && conLaiGiay > 0 && conLaiGiay <= 5;
    hop.classList.toggle("sap-het", sapHet);
    $("man-san-khau").classList.toggle("sap-het-gio", sapHet);
  }

  function batDauGio() {
    dungGio();
    var tong = tt.cauHinh.thoiGian || 0;
    if (!tong || daHienDapAn || dangQuetDapAn) return;
    conLaiGiay = tong;
    var giayCu = Math.ceil(conLaiGiay);
    window.AmThanh.denQuet(true);
    demNguocTimer = setInterval(function () {
      conLaiGiay = Math.max(0, conLaiGiay - 0.1);
      var giayMoi = Math.ceil(conLaiGiay);
      if (giayMoi !== giayCu && giayMoi <= 5 && giayMoi > 0) window.AmThanh.demNguoc(giayMoi);
      giayCu = giayMoi;
      capNhatHienThiGio();
      if (conLaiGiay <= 0) {
        dungGio();
        capNhatHienThiGio();
        window.AmThanh.sai();
      }
    }, 100);
    capNhatHienThiGio();
  }

  function veChamTienDo() {
    var khung = $("sk-cham");
    khung.textContent = "";
    tt.cauHoi.forEach(function (_, i) {
      var sp = document.createElement("span");
      sp.className = "dv-cham" + (i === viTri ? " dang-xem" : i < viTri ? " da-qua" : "");
      khung.appendChild(sp);
    });
  }

  function veCauHienTai(coHieuUngVao) {
    dungGio();
    var c = tt.cauHoi[viTri];
    if (!c) return;
    $("sk-chi-so").textContent = "Câu " + (viTri + 1) + " / " + tt.cauHoi.length;
    veChamTienDo();

    var hCau = $("sk-cau-hoi");
    hCau.textContent = c.cauHoi;
    if (coHieuUngVao) {
      hCau.classList.remove("moi-vao");
      void hCau.offsetWidth;
      hCau.classList.add("moi-vao");
    }

    var luoi = $("sk-lua-chon");
    luoi.textContent = "";
    c.luaChon.forEach(function (pa, k) {
      var the = document.createElement("div");
      the.className = "dv-the mau-" + k + (coHieuUngVao ? " bay-vao" : "");
      the.dataset.chiSo = String(k);
      if (coHieuUngVao) the.style.setProperty("--tre", (120 + k * 110) + "ms");
      if (daLoai5050.indexOf(k) >= 0 && !daHienDapAn) the.classList.add("bi-loai");
      if (daHienDapAn) the.classList.add(k === c.dapAn ? "la-dung" : "la-sai");
      var chu = document.createElement("span"); chu.className = "the-chu-cai"; chu.textContent = window.DoVui.NHAN[k];
      var nd = document.createElement("span"); nd.className = "the-noi-dung-pa"; nd.textContent = pa;
      the.append(chu, nd);
      luoi.appendChild(the);
    });

    var gt = $("sk-giai-thich");
    gt.hidden = !daHienDapAn || !c.giaiThich;
    gt.textContent = c.giaiThich || "";

    $("nut-truoc").disabled = dangQuetDapAn || viTri === 0;
    $("nut-sau").disabled = dangQuetDapAn || viTri >= tt.cauHoi.length - 1;
    $("nut-5050").hidden = c.luaChon.length < 4;
    $("nut-5050").disabled = dangQuetDapAn || daHienDapAn || daLoai5050.length > 0;
    $("nut-bam-gio").hidden = !tt.cauHinh.thoiGian;
    $("nut-bam-gio").disabled = dangQuetDapAn || daHienDapAn;
    $("nut-dap-an").disabled = dangQuetDapAn || daHienDapAn;

    conLaiGiay = tt.cauHinh.thoiGian || 0;
    capNhatHienThiGio();
    veBangDiem();
  }

  function chonCau(i) {
    if (dangQuetDapAn || i < 0 || i >= tt.cauHoi.length) return;
    viTri = i;
    daHienDapAn = false;
    daLoai5050 = [];
    veCauHienTai(true);
  }

  /** Nhịp hồi hộp 1,15 giây: đèn quét luân phiên giữa các phương án kèm trống dồn rồi lật 3D đáp án đúng. */
  function hienDapAn() {
    if (daHienDapAn || dangQuetDapAn) return;
    var c = tt.cauHoi[viTri];
    if (!c) return;
    dungGio();
    dangQuetDapAn = true;
    $("nut-dap-an").disabled = true;
    $("nut-bam-gio").disabled = true;
    $("nut-5050").disabled = true;

    var cacThe = Array.from($("sk-lua-chon").children).filter(function (el) {
      return daLoai5050.indexOf(Number(el.dataset.chiSo)) < 0;
    });
    window.AmThanh.trongDon(1150);

    var buoc = 0;
    var tongBuoc = 9;
    (function nhay() {
      cacThe.forEach(function (el) { el.classList.remove("dang-quet"); });
      if (buoc < tongBuoc) {
        var el = cacThe[buoc % cacThe.length];
        if (el) el.classList.add("dang-quet");
        window.AmThanh.denQuet(buoc % 2 === 0);
        var cho = 85 + buoc * 14;
        buoc += 1;
        setTimeout(nhay, cho);
      } else {
        dangQuetDapAn = false;
        daHienDapAn = true;
        window.AmThanh.latDapAn();
        window.Phao.banHaiBen($("phao-dv"), 1.2);
        veCauHienTai(false);
      }
    })();
  }

  function dung5050() {
    var c = tt.cauHoi[viTri];
    if (!c || c.luaChon.length < 4 || daHienDapAn || dangQuetDapAn || daLoai5050.length) return;
    daLoai5050 = window.DoVui.loc5050(c);
    window.AmThanh.loai5050();
    veCauHienTai(false);
  }

  function vaoSanKhau() {
    if (!tt.cauHoi.length) return;
    window.AmThanh.moKhoa();
    giaiDoan = "san-khau";
    $("man-chuan-bi").hidden = true;
    $("man-san-khau").hidden = false;
    chonCau(0);
  }

  function veChuanBi() {
    if (dangQuetDapAn) return;
    dungGio();
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
    $("nut-them-ab").addEventListener("click", function () {
      tt.cauHoi.push(window.DoVui.chuanHoaCauHoi({ cauHoi: "Câu hỏi mới", luaChon: ["Phương án A", "Phương án B"], dapAn: 0 }));
      luu(); veDanhSachCauHoi();
    });
    $("nut-them-4").addEventListener("click", function () {
      tt.cauHoi.push(window.DoVui.chuanHoaCauHoi({ cauHoi: "Câu hỏi mới", luaChon: ["Phương án A", "Phương án B", "Phương án C", "Phương án D"], dapAn: 0 }));
      luu(); veDanhSachCauHoi();
    });
    $("nut-cau-mau").addEventListener("click", function () {
      if (!tt.cauHoi.length || window.confirm("Thay bộ câu hỏi hiện tại bằng 8 câu hỏi mẫu về bệnh viện và y tế?")) {
        tt.cauHoi = window.DoVui.boCauHoiMau();
        luu(); veDanhSachCauHoi();
        bao("ok", "Đã nạp 8 câu hỏi mẫu.");
      }
    });
    $("nut-nap-dan").addEventListener("click", function () {
      var kq = window.DoVui.docTuVanBan($("o-dan-cau").value);
      if (!kq.cauHoi.length) { bao("loi", "Chưa đọc được câu hỏi nào.", kq.loi); return; }
      tt.cauHoi = tt.cauHoi.concat(kq.cauHoi);
      $("o-dan-cau").value = "";
      luu(); veDanhSachCauHoi();
      bao(kq.loi.length ? "canh-bao" : "ok", "Đã thêm " + kq.cauHoi.length + " câu hỏi.", kq.loi);
    });
    $("o-gio-cau").addEventListener("change", function () { tt.cauHinh.thoiGian = Number($("o-gio-cau").value) || 0; luu(); });
    $("o-so-doi").addEventListener("change", function () { tt.cauHinh.soDoi = Number($("o-so-doi").value) || 0; luu(); });
    $("o-am-thanh").addEventListener("change", function () { if ($("o-am-thanh").checked !== window.AmThanh.dangBat()) window.AmThanh.batTat(); });
    $("nut-dat-lai-diem").addEventListener("click", function () { tt.diem = [0, 0, 0, 0]; luu(); bao("ok", "Đã đặt điểm các khu vực về 0."); });
    $("nut-vao").addEventListener("click", vaoSanKhau);
    $("nut-ve").addEventListener("click", veChuanBi);
    $("nut-truoc").addEventListener("click", function () { chonCau(viTri - 1); });
    $("nut-sau").addEventListener("click", function () { chonCau(viTri + 1); });
    $("nut-bam-gio").addEventListener("click", batDauGio);
    $("nut-dap-an").addEventListener("click", hienDapAn);
    $("nut-5050").addEventListener("click", dung5050);

    document.addEventListener("keydown", function (e) {
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
      if (e.key === "f" || e.key === "F") { toanManHinh(); return; }
      if (e.key === "m" || e.key === "M") { $("o-am-thanh").checked = window.AmThanh.batTat(); return; }
      if (giaiDoan === "chuan-bi") {
        if (e.code === "Space" && !$("nut-vao").disabled) { e.preventDefault(); vaoSanKhau(); }
        return;
      }
      if (e.code === "Space") {
        e.preventDefault();
        if (!daHienDapAn && !dangQuetDapAn && tt.cauHinh.thoiGian && !demNguocTimer) batDauGio();
        else if (!daHienDapAn && !dangQuetDapAn) hienDapAn();
        else if (daHienDapAn && viTri < tt.cauHoi.length - 1) chonCau(viTri + 1);
      } else if (e.key === "Enter") { e.preventDefault(); hienDapAn(); }
      else if (e.key === "ArrowLeft") chonCau(viTri - 1);
      else if (e.key === "ArrowRight") chonCau(viTri + 1);
      else if (e.key === "Escape") veChuanBi();
      else if (/^[1-4]$/.test(e.key)) {
        var idx = Number(e.key) - 1;
        if (idx < (tt.cauHinh.soDoi || 0)) congDiem(idx, 10);
      }
    });
  }

  napDaLuu();
  veDanhSachCauHoi();
  ganSuKien();
  capNhatTongKet();
})();
