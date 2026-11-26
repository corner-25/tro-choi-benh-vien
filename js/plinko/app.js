/* Điều phối trang Thả bi Plinko. Dữ liệu người dùng chỉ vào DOM bằng textContent. */
(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };
  var KHOA = "plinko";
  var KHOA_NHIP_BL = 1600;
  var SO_BI_MUA_BONG = [5, 10, 15];
  var SO_BI_BI_VANG = [1, 2, 3];

  var danhSach = [];
  var tt = {
    cauHinh: {
      nguon: "ca-nhan",
      cheDo: "mua-bong",
      soBi: 10,
      congTha: "ngau-nhien",
      loaiTrung: true,
      moRongGiua: false,
    },
    daTha: [],
    lichSu: [],
  };

  var giaiDoan = "chuan-bi";
  var thap = null;
  var ketQuaLuot = [];
  var lanBinhLuanCuoi = 0;
  var dangDemNguoc = false;
  var henDemNguoc = 0;
  var daChayLuotDau = false;
  var vinhDanhDangMo = false;

  function capNhatTuyChonSoBi(giuGiaTri) {
    var sel = $("o-so-bi");
    var laBiVang = tt.cauHinh.cheDo === "bi-vang";
    var danhMuc = laBiVang ? SO_BI_BI_VANG : SO_BI_MUA_BONG;
    var macDinh = laBiVang ? 1 : 10;
    var hienTai = giuGiaTri ? Number(tt.cauHinh.soBi) : macDinh;
    if (danhMuc.indexOf(hienTai) < 0) hienTai = macDinh;
    tt.cauHinh.soBi = hienTai;

    sel.textContent = "";
    danhMuc.forEach(function (so) {
      var opt = document.createElement("option");
      opt.value = String(so);
      opt.textContent = laBiVang
        ? (so + " quả Bi Vàng cỡ đại")
        : (so + " quả bóng");
      if (so === hienTai) opt.selected = true;
      sel.appendChild(opt);
    });
  }

  function napDaLuu() {
    danhSach = window.LuuTru.docDanhSach().nguoiChoi;
    var d = window.LuuTru.doc(KHOA);
    if (d) {
      tt.cauHinh = Object.assign({
        nguon: "ca-nhan",
        cheDo: "mua-bong",
        soBi: 10,
        congTha: "ngau-nhien",
        loaiTrung: true,
        moRongGiua: false,
      }, d.cauHinh || {});
      tt.daTha = Array.isArray(d.daTha) ? d.daTha : [];
      tt.lichSu = Array.isArray(d.lichSu) ? d.lichSu : [];
    }
    if (tt.cauHinh.cheDo !== "bi-vang") tt.cauHinh.cheDo = "mua-bong";
    if (!window.Plinko.CONG_THA[tt.cauHinh.congTha]) tt.cauHinh.congTha = "ngau-nhien";

    $("o-nguon").value = tt.cauHinh.nguon;
    $("o-che-do").value = tt.cauHinh.cheDo;
    capNhatTuyChonSoBi(true);
    $("o-loai-trung").checked = tt.cauHinh.loaiTrung !== false;

    var ten = window.LuuTru.docTenSuKien();
    document.querySelectorAll(".ten-su-kien").forEach(function (el) { el.textContent = ten; });
  }

  function luu() {
    window.LuuTru.ghi(KHOA, tt);
    capNhatTongKet();
  }

  function nguonHienTai() {
    if (tt.cauHinh.nguon === "don-vi") return window.Dua.danhSachDonVi(danhSach);
    return danhSach;
  }

  function nguoiCon() {
    return window.Plinko.chonNguoiTha(nguonHienTai(), tt.daTha, 9999, tt.cauHinh.loaiTrung);
  }

  function capNhatTongKet() {
    var con = nguoiCon().length;
    $("so-nguoi").textContent = String(danhSach.length);
    $("so-con").textContent = String(con);
    $("so-luot").textContent = String(tt.lichSu.length);
    $("goi-y-danh-sach").hidden = danhSach.length > 0;
    $("nut-vao").disabled = con < 1;
  }

  function datBinhLuan(suKien, duLieu, batBuoc) {
    var gio = Date.now();
    if (!batBuoc && gio - lanBinhLuanCuoi < KHOA_NHIP_BL) return;
    lanBinhLuanCuoi = gio;

    var phan = window.Plinko.taoCauBinhLuan(suKien, duLieu);
    var p = $("pl-binh-luan");
    var boc = document.createElement("span");
    boc.className = "moi";
    phan.forEach(function (m) {
      if (m.dam) {
        var b = document.createElement("b");
        b.textContent = m.text;
        boc.appendChild(b);
      } else {
        boc.appendChild(document.createTextNode(m.text));
      }
    });
    p.textContent = "";
    p.appendChild(boc);
  }

  function capNhatTheRoi(nguoi, trangThai) {
    var khung = $("pl-the-roi");
    khung.classList.remove("bi-vang", "dac-biet");
    if (trangThai === "dac-biet") khung.classList.add("dac-biet");
    else if (tt.cauHinh.cheDo === "bi-vang") khung.classList.add("bi-vang");

    if (!nguoi) {
      var tenCong = (window.Plinko.CONG_THA[tt.cauHinh.congTha] && window.Plinko.CONG_THA[tt.cauHinh.congTha].ten) || "Ngẫu nhiên";
      $("pl-roi-nhan").textContent = tt.cauHinh.cheDo === "bi-vang" ? "BI VÀNG CHUNG KẾT" : "TIÊU ĐIỂM ĐANG RƠI";
      $("pl-roi-ma").textContent = tenCong.toUpperCase();
      $("pl-roi-ten").textContent = "Sẵn sàng thả bóng";
      $("pl-roi-don-vi").textContent = "Chọn cổng [1] [2] [3] [0] rồi nhấn Space";
      return;
    }

    $("pl-roi-nhan").textContent = trangThai === "dac-biet"
      ? "TRÚNG GIẢI ĐẶC BIỆT"
      : (tt.cauHinh.cheDo === "bi-vang" ? "BI VÀNG ĐANG RƠI" : "ĐANG RƠI GẦN ĐÁY");
    $("pl-roi-ma").textContent = nguoi.ma || "---";
    $("pl-roi-ten").textContent = nguoi.ten || "";
    $("pl-roi-don-vi").textContent = nguoi.donVi || "";
  }

  function capNhatMoRongUI() {
    var bat = Boolean(tt.cauHinh.moRongGiua);
    $("pl-mo-rong").hidden = !bat;
    if (thap) thap.datMoRong(bat);
  }

  function capNhatNutCongUI() {
    var nhom = $("pl-chon-cong");
    var khoa = dangDemNguoc || vinhDanhDangMo || Boolean(thap && thap.dangTha());
    nhom.querySelectorAll("button[data-cong]").forEach(function (btn) {
      var cong = btn.getAttribute("data-cong");
      btn.classList.toggle("dang-chon", cong === tt.cauHinh.congTha);
      btn.disabled = khoa;
    });
  }

  function chonCong(cong) {
    if (!window.Plinko.CONG_THA[cong]) return;
    if (dangDemNguoc || vinhDanhDangMo || (thap && thap.dangTha())) return;
    tt.cauHinh.congTha = cong;
    luu();
    capNhatNutCongUI();
    if (thap) thap.datCong(cong);
    if (!ketQuaLuot.length) capNhatTheRoi(null);
    window.AmThanh.vongQuayTick();
  }

  function veKetQuaLuot() {
    var ol = $("pl-ds-ve");
    ol.textContent = "";
    var sap = ketQuaLuot.slice().sort(function (a, b) { return a.bac - b.bac; });

    // Cập nhật Ô Tiêu Điểm Lượt cho người đạt giải cao nhất
    var hopTd = $("pl-tieu-diem-luot");
    if (sap.length > 0) {
      var dau = sap[0];
      hopTd.hidden = false;
      $("pl-td-giai").textContent = dau.bac === 1 ? "VINH DANH GIẢI ĐẶC BIỆT" : ("DẪN ĐẦU LƯỢT · " + dau.tenGiai.toUpperCase());
      $("pl-td-ten").textContent = dau.ten;
      $("pl-td-ma").textContent = dau.ma;
      $("pl-td-don-vi").textContent = dau.donVi || "";
    } else {
      hopTd.hidden = true;
    }

    sap.forEach(function (k) {
      var li = document.createElement("li");
      if (k.bac === 1) li.className = "dac-biet";
      var ma = document.createElement("span"); ma.className = "pl-ma"; ma.textContent = k.ma;
      var ten = document.createElement("span"); ten.className = "pl-ten"; ten.textContent = k.ten;
      var tag = document.createElement("span"); tag.className = "pl-giai-tag"; tag.textContent = k.tenGiai;
      li.append(ma, ten, tag);
      ol.appendChild(li);
    });
  }

  function moVinhDanh(dsSap) {
    if (!dsSap || !dsSap.length) return;
    var dau = dsSap[0];
    var coDacBiet = dau.bac === 1;
    vinhDanhDangMo = true;

    var the3d = $("pl-the-3d");
    the3d.classList.remove("hien", "dac-biet");
    if (coDacBiet) the3d.classList.add("dac-biet");

    $("pl-vd-hang").textContent = dau.tenGiai;
    $("pl-vd-ten").textContent = dau.ten;
    $("pl-vd-ma").textContent = dau.ma;
    $("pl-vd-don-vi").textContent = dau.donVi || "";

    var cungHang = dsSap.slice(1).filter(function (k) { return k.bac === dau.bac; });
    var elThem = $("pl-vd-them");
    if (cungHang.length > 0) {
      elThem.hidden = false;
      elThem.textContent = "Cùng đạt " + dau.tenGiai + ": " + cungHang.map(function (k) {
        return k.ten + " (" + k.ma + ")";
      }).join(" · ");
    } else {
      elThem.hidden = true;
      elThem.textContent = "";
    }

    $("pl-vinh-danh").hidden = false;
    // Kích hoạt lại animation lật thẻ 3D
    void the3d.offsetWidth;
    the3d.classList.add("hien");

    capNhatNutCongUI();
    window.AmThanh.congBo(coDacBiet ? 1 : 2);
    window.Phao.banHaiBen($("phao-plinko"), coDacBiet ? 1.6 : 1.25);
  }

  function dongVinhDanh() {
    if (!vinhDanhDangMo) return;
    vinhDanhDangMo = false;
    $("pl-vinh-danh").hidden = true;
    $("pl-the-3d").classList.remove("hien");
    capNhatMoRongUI();
    capNhatNutCongUI();
    $("nut-tha").disabled = nguoiCon().length === 0;
  }

  function huyDemNguoc() {
    if (henDemNguoc) {
      clearTimeout(henDemNguoc);
      henDemNguoc = 0;
    }
    dangDemNguoc = false;
    var el = $("pl-dem-nguoc");
    if (el) {
      el.hidden = true;
      el.classList.remove("chay");
    }
  }

  function chayDemNguoc(onXong) {
    huyDemNguoc();
    dangDemNguoc = true;
    capNhatNutCongUI();
    var el = $("pl-dem-nguoc");
    var soEl = $("pl-dem-so");
    var so = 3;

    function buoc() {
      if (!dangDemNguoc) return;
      if (so <= 0) {
        huyDemNguoc();
        onXong();
        return;
      }
      el.hidden = false;
      el.classList.remove("chay");
      soEl.textContent = String(so);
      void el.offsetWidth;
      el.classList.add("chay");
      window.AmThanh.demNguoc(so);
      so -= 1;
      henDemNguoc = setTimeout(buoc, 680);
    }

    buoc();
  }

  function xuLySuKienThap(sk) {
    if (!sk) return;
    if (sk.loai === "tieu-diem" && sk.nguoi) {
      capNhatTheRoi(sk.nguoi);
      return;
    }
    if (sk.loai === "xuat-phat") {
      if (sk.nguoi) capNhatTheRoi(sk.nguoi);
      datBinhLuan("xuat-phat", sk, true);
      return;
    }
    if (sk.loai === "can-canh") {
      if (sk.nguoi) capNhatTheRoi(sk.nguoi);
      datBinhLuan("can-canh", sk, true);
      return;
    }
    if (sk.loai === "lo-xo") {
      datBinhLuan("lo-xo", sk, false);
      return;
    }
    if (sk.loai === "sat-dac-biet") {
      datBinhLuan("sat-dac-biet", sk, false);
      return;
    }
    if (sk.loai === "cham-o") {
      var laDb = sk.giai && sk.giai.bac === 1;
      if (laDb && sk.nguoi) capNhatTheRoi(sk.nguoi, "dac-biet");
      datBinhLuan("cham-o", sk, laDb);
    }
  }

  function vaoSanKhau() {
    if ($("nut-vao").disabled) return;
    window.AmThanh.moKhoa();
    giaiDoan = "san-khau";
    daChayLuotDau = false;
    vinhDanhDangMo = false;
    $("pl-vinh-danh").hidden = true;
    $("man-chuan-bi").hidden = true;
    $("man-san-khau").hidden = false;
    $("sk-con").textContent = String(nguoiCon().length);
    var nhanCheDo = tt.cauHinh.cheDo === "bi-vang" ? "Bi Vàng Chung Kết" : "Mưa bóng";
    $("sk-luot").textContent = "Tháp bóng Plinko · " + nhanCheDo + " · Lượt " + (tt.lichSu.length + 1);
    ketQuaLuot = [];
    veKetQuaLuot();
    capNhatTheRoi(null);
    datBinhLuan("san-sang", {}, true);

    if (!thap) {
      thap = window.VePlinko.tao($("plinko-canvas"), window.AmThanh, function (nguoi, giai) {
        ketQuaLuot.push({ ma: nguoi.ma, ten: nguoi.ten, donVi: nguoi.donVi, tenGiai: giai.ten, bac: giai.bac });
        veKetQuaLuot();
        if (giai.bac === 1) window.Phao.banHaiBen($("phao-plinko"), 1.3);
      });
    }
    thap.datCheDo(tt.cauHinh.cheDo);
    thap.datCong(tt.cauHinh.congTha);
    capNhatMoRongUI();
    capNhatNutCongUI();
    thap.bat();
    $("nut-tha").disabled = nguoiCon().length === 0;
  }

  function veChuanBi() {
    if (vinhDanhDangMo) { dongVinhDanh(); return; }
    if (dangDemNguoc) { huyDemNguoc(); $("nut-tha").disabled = nguoiCon().length === 0; capNhatNutCongUI(); return; }
    if (thap && thap.dangTha()) return;
    if (thap) thap.dung();
    giaiDoan = "chuan-bi";
    $("man-san-khau").hidden = true;
    $("man-chuan-bi").hidden = false;
    capNhatTongKet();
  }

  function thucHienTha(ds) {
    var soLuot = tt.lichSu.length + 1;
    var nhanCheDo = tt.cauHinh.cheDo === "bi-vang" ? "Bi Vàng" : "Mưa bóng";
    $("sk-luot").textContent = "Tháp bóng Plinko · Lượt " + soLuot + " (" + ds.length + " " + nhanCheDo + ")";
    window.AmThanh.xuatPhat();
    capNhatNutCongUI();

    thap.tha(ds, {
      cheDo: tt.cauHinh.cheDo,
      congTha: tt.cauHinh.congTha,
      moRongGiua: Boolean(tt.cauHinh.moRongGiua),
      onSuKien: xuLySuKienThap,
    }, function () {
      var luc = new Date().toLocaleString("vi-VN", { hour12: false });
      var sap = ketQuaLuot.slice().sort(function (a, b) { return a.bac - b.bac; });
      tt.lichSu.push({ luot: soLuot, luc: luc, ketQua: sap });
      ds.forEach(function (n) { if (tt.daTha.indexOf(n.ma) < 0) tt.daTha.push(n.ma); });

      var coDacBiet = sap.some(function (k) { return k.bac === 1; });
      tt.cauHinh.moRongGiua = !coDacBiet;
      luu();
      $("sk-con").textContent = String(nguoiCon().length);

      if (sap.length > 0) {
        capNhatTheRoi(sap[0], coDacBiet ? "dac-biet" : "");
      }

      if (coDacBiet || tt.cauHinh.cheDo === "bi-vang") {
        datBinhLuan("ket-thuc", { nguoi: sap[0], tenGiai: sap[0] ? sap[0].tenGiai : "" }, true);
        moVinhDanh(sap);
      } else {
        capNhatMoRongUI();
        datBinhLuan("mo-rong", {}, true);
        window.Phao.ban($("phao-plinko"), 1, 0.42);
        $("nut-tha").disabled = nguoiCon().length === 0;
        capNhatNutCongUI();
      }
    });
  }

  function thaBong() {
    if (vinhDanhDangMo) { dongVinhDanh(); return; }
    if (!thap || thap.dangTha() || dangDemNguoc) return;
    var ds = window.Plinko.chonNguoiTha(nguonHienTai(), tt.daTha, tt.cauHinh.soBi, tt.cauHinh.loaiTrung);
    if (!ds.length) { window.alert("Không còn người chơi nào chưa thả bóng."); return; }

    ketQuaLuot = [];
    veKetQuaLuot();
    $("nut-tha").disabled = true;

    var canDemNguoc = tt.cauHinh.cheDo === "bi-vang" || !daChayLuotDau;
    daChayLuotDau = true;
    if (canDemNguoc) {
      chayDemNguoc(function () { thucHienTha(ds); });
    } else {
      thucHienTha(ds);
    }
  }

  function toanManHinh() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(function () {});
    else document.exitFullscreen();
  }

  function ganSuKien() {
    $("o-nguon").addEventListener("change", function () {
      tt.cauHinh.nguon = $("o-nguon").value;
      luu();
    });
    $("o-che-do").addEventListener("change", function () {
      tt.cauHinh.cheDo = $("o-che-do").value === "bi-vang" ? "bi-vang" : "mua-bong";
      capNhatTuyChonSoBi(false);
      luu();
    });
    $("o-so-bi").addEventListener("change", function () {
      tt.cauHinh.soBi = Number($("o-so-bi").value) || 10;
      luu();
    });
    $("o-loai-trung").addEventListener("change", function () {
      tt.cauHinh.loaiTrung = $("o-loai-trung").checked;
      luu();
    });
    $("o-am-thanh").addEventListener("change", function () {
      if ($("o-am-thanh").checked !== window.AmThanh.dangBat()) window.AmThanh.batTat();
    });

    $("nut-vao").addEventListener("click", vaoSanKhau);
    $("nut-ve").addEventListener("click", veChuanBi);
    $("nut-tha").addEventListener("click", thaBong);
    $("nut-dong-vinh-danh").addEventListener("click", dongVinhDanh);

    $("pl-chon-cong").addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-cong]");
      if (btn) chonCong(btn.getAttribute("data-cong"));
    });

    $("nut-xuat").addEventListener("click", function () {
      if (!tt.lichSu.length) { window.alert("Chưa có kết quả để xuất."); return; }
      window.LuuTru.taiCsv(window.Plinko.dongXuat(tt.lichSu), "ket-qua-plinko-" + new Date().toISOString().slice(0, 10) + ".csv");
    });
    $("nut-in-bien-ban").addEventListener("click", function () {
      if (!tt.lichSu.length) { window.alert("Chưa có kết quả để in biên bản."); return; }
      var bang = window.Plinko.dongXuat(tt.lichSu);
      window.BienBan.in({
        tenTro: "Thả bi Plinko",
        tenSuKien: window.LuuTru.docTenSuKien(),
        tomTat: "Tổng số " + tt.lichSu.length + " lượt thả · " + (bang.length - 1) + " kết quả",
        cot: bang[0], dong: bang.slice(1),
        ghiChu: "Danh sách bóng thả và độ nảy va chạm dùng nguồn ngẫu nhiên mật mã trình duyệt (crypto.getRandomValues).",
      });
    });
    $("nut-lam-lai").addEventListener("click", function () {
      if (!tt.lichSu.length && !tt.daTha.length && !tt.cauHinh.moRongGiua) return;
      if (!window.confirm("Xóa lịch sử thả bi Plinko và cho mọi người thả lại từ đầu?")) return;
      tt.lichSu = [];
      tt.daTha = [];
      tt.cauHinh.moRongGiua = false;
      luu();
    });

    document.addEventListener("keydown", function (e) {
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
      if (e.key === "f" || e.key === "F") { toanManHinh(); return; }
      if (e.key === "m" || e.key === "M") { $("o-am-thanh").checked = window.AmThanh.batTat(); return; }
      if (giaiDoan === "chuan-bi") {
        if (e.code === "Space" && !$("nut-vao").disabled) { e.preventDefault(); vaoSanKhau(); }
        return;
      }
      if (vinhDanhDangMo) {
        if (e.code === "Space" || e.key === "Escape") { e.preventDefault(); dongVinhDanh(); }
        return;
      }
      if (e.key === "1") { chonCong("trai"); return; }
      if (e.key === "2") { chonCong("giua"); return; }
      if (e.key === "3") { chonCong("phai"); return; }
      if (e.key === "0") { chonCong("ngau-nhien"); return; }
      if (e.code === "Space") { e.preventDefault(); if (!$("nut-tha").disabled) thaBong(); }
      else if (e.key === "Escape") veChuanBi();
    });
  }

  napDaLuu();
  ganSuKien();
  capNhatTongKet();
})();
