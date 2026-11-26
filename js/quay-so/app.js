/* Quay số trúng thưởng — bàn điều khiển và sân khấu.
 * Danh sách người chơi lấy từ danh sách dùng chung của cổng trò chơi. Dữ liệu người dùng chỉ vào DOM bằng textContent. */
(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };
  var KHOA = "quay-so";
  var CHE_TEN = "• • • • • •";
  var ID_LOC_LIEN_KE = "loc-lien-ke";
  var ID_LOC_DONG_DOI = "loc-dong-doi";
  var GIAY_CHO_VANG = 5;

  var danhSach = [];
  var tt = { giai: [], ketQua: [], daHien: [], cauHinh: { anTen: true, moiNguoiMotGiai: true, loaiNguoiVang: true, quayNguoc: true, phanhHaiNhip: true } };
  var giaiDoan = "chuan-bi"; // chuan-bi | san-khau
  var chon = 0;
  var dangQuay = false;
  var dungQuayHet = false;
  var trangThaiPhanh = 0; // 0: nghỉ | 1: chờ nhịp 1 | 2: chờ chốt cuộn cuối | 3: đang hãm phanh
  var kichHoatPhanh = null;
  var phienQuay = 0;
  var hienTai = null;
  var daHuyHienTai = null;
  var choQuayBu = false;
  var cheDoBangLat = false;
  var mucHienTam = {}; // id -> 1 (lộ đơn vị) | 2 (chốt họ tên)
  var may = null;
  var demId = 0;
  var henGioBangLat = [];
  var henResize = 0;
  var demChoVang = null; // { id, giayCon, hen }
  var choXacNhanNut = { id: null, hen: 0, nhan: "" };
  var thongBaoSk = "";
  var henThongBaoSk = 0;

  function taoIdKetQua() {
    demId += 1;
    var ngau = Math.floor(window.Quay.rngMatMa()() * 1e6).toString(36);
    return "k" + Date.now().toString(36) + demId.toString(36) + ngau;
  }

  function huyHenGioBangLat() {
    henGioBangLat.forEach(function (id) { clearTimeout(id); });
    henGioBangLat = [];
  }

  function xoaThongBaoSk() {
    if (henThongBaoSk) { clearTimeout(henThongBaoSk); henThongBaoSk = 0; }
    thongBaoSk = "";
  }

  function baoTrangThaiSanKhau(chu) {
    xoaThongBaoSk();
    thongBaoSk = String(chu || "");
    if (!thongBaoSk) return;
    if (cheDoBangLat) tatBangLat();
    veKetQuaHienTai();
    henThongBaoSk = setTimeout(function () {
      thongBaoSk = "";
      henThongBaoSk = 0;
      veKetQuaHienTai();
    }, 4500);
  }

  function huyXacNhanNut(khongVe) {
    if (choXacNhanNut.hen) clearTimeout(choXacNhanNut.hen);
    if (choXacNhanNut.id) {
      var nutCu = $(choXacNhanNut.id);
      if (nutCu) nutCu.classList.remove("cho-xac-nhan-nut");
    }
    choXacNhanNut = { id: null, hen: 0, nhan: "" };
    if (!khongVe && giaiDoan === "san-khau") veSanKhau();
  }

  /** Xác nhận 2 nhịp ngay trên nút sân khấu, tránh hộp thoại trình duyệt; tự hoàn tác sau 4 giây. */
  function xacNhanHaiNhip(nutId, nhanNhac) {
    if (choXacNhanNut.id === nutId) {
      huyXacNhanNut(true);
      return true;
    }
    huyXacNhanNut(true);
    choXacNhanNut.id = nutId;
    choXacNhanNut.nhan = nhanNhac;
    var el = $(nutId);
    if (el) {
      el.classList.add("cho-xac-nhan-nut");
      el.textContent = nhanNhac;
    }
    choXacNhanNut.hen = setTimeout(function () {
      huyXacNhanNut(false);
    }, 4000);
    return false;
  }

  function huyDemChoVang(khongVe) {
    if (demChoVang && demChoVang.hen) clearInterval(demChoVang.hen);
    demChoVang = null;
    if (!khongVe && giaiDoan === "san-khau") veSanKhau();
  }

  // ── Lưu trữ ──
  function napDaLuu() {
    danhSach = window.LuuTru.docDanhSach().nguoiChoi;
    var d = window.LuuTru.doc(KHOA);
    if (d) {
      tt.giai = Array.isArray(d.giai) ? d.giai.map(window.CauHinhGiai.chuanHoa) : [];
      tt.ketQua = Array.isArray(d.ketQua) ? d.ketQua.filter(function (k) { return k && typeof k.ma === "string" && typeof k.giaiId === "string"; }) : [];
      tt.daHien = Array.isArray(d.daHien) ? d.daHien : [];
      tt.cauHinh = Object.assign(tt.cauHinh, d.cauHinh || {});
    }
    $("o-quay-nguoc").checked = tt.cauHinh.quayNguoc !== false;
    $("o-an-ten").checked = tt.cauHinh.anTen !== false;
    $("o-mot-giai").checked = tt.cauHinh.moiNguoiMotGiai !== false;
    $("o-loai-vang").checked = tt.cauHinh.loaiNguoiVang !== false;
    var ten = window.LuuTru.docTenSuKien();
    document.querySelectorAll(".ten-su-kien").forEach(function (el) { el.textContent = ten; });
  }

  function luu() {
    if (!window.LuuTru.ghi(KHOA, tt)) baoGiai("loi", "Không lưu được: bộ nhớ trình duyệt đã đầy (thường do ảnh phần thưởng quá nhiều). Bớt ảnh rồi thử lại.");
    capNhatTongKet();
  }

  function baoGiai(loai, chu) {
    var k = $("trang-thai-giai");
    k.className = "trang-thai " + loai; k.textContent = "";
    var p = document.createElement("p"); p.textContent = chu; k.appendChild(p);
  }

  function long() { return window.Quay.longQuay(danhSach, tt.ketQua, tt.cauHinh); }
  function trungCua(giai) { return tt.ketQua.filter(function (k) { return k.giaiId === giai.id; }); }
  function daQuay(id) { return tt.ketQua.filter(function (k) { return k.giaiId === id && k.trangThai === "trung"; }).length; }
  function dsLocLienKe() { return tt.ketQua.filter(function (k) { return k.giaiId === ID_LOC_LIEN_KE && k.trangThai === "trung"; }); }

  function nguoiTrungDacBiet() {
    if (!tt.giai.length) return null;
    var ds = trungCua(tt.giai[0]).filter(function (k) { return k.trangThai === "trung"; });
    return ds.length ? ds[ds.length - 1] : null;
  }

  function layMucHien(k) {
    if (!k) return 0;
    if (k.trangThai === "huy" || !tt.cauHinh.anTen) return 2;
    if (tt.daHien.indexOf(k.id) >= 0) return 2;
    return mucHienTam[k.id] || 0;
  }

  function tinhTopDonVi(ketQua, toiDa) {
    var dem = {};
    ketQua.forEach(function (k) {
      if (k.trangThai !== "trung") return;
      var dv = k.donVi ? String(k.donVi).trim() : "";
      if (!dv) return;
      dem[dv] = (dem[dv] || 0) + 1;
    });
    return Object.keys(dem).map(function (ten) {
      return { donVi: ten, so: dem[ten] };
    }).sort(function (a, b) {
      return b.so - a.so || a.donVi.localeCompare(b.donVi, "vi");
    }).slice(0, toiDa || 3);
  }

  function capNhatTongKet() {
    $("so-nguoi").textContent = String(danhSach.length);
    $("so-long").textContent = String(long().length);
    $("so-trung").textContent = String(tt.ketQua.filter(function (k) { return k.trangThai === "trung"; }).length);
    $("goi-y-danh-sach").hidden = danhSach.length > 0;
    $("nut-vao").disabled = !danhSach.length || !tt.giai.length;
    var coAnh = tt.giai.some(function (g) { return Boolean(g.anh); });
    $("nut-don-anh").hidden = !coAnh;
    var kb = Math.round(window.LuuTru.dungLuongDaDung() / 1024);
    $("dung-luong-bo-nho").textContent = "Bộ nhớ đang dùng: khoảng " + kb + " KB / 5.000 KB" + (kb > 3500 ? " (gần đầy, nên bớt ảnh)" : "");
  }

  // ── Sân khấu ──
  function capNhatPhaSanKhau() {
    var sk = $("man-san-khau");
    sk.classList.toggle("dang-quay-so", dangQuay && !cheDoBangLat);
    sk.classList.toggle("co-ket-qua", !dangQuay && !cheDoBangLat && Boolean(hienTai || daHuyHienTai));
  }

  function tatBangLat() {
    huyHenGioBangLat();
    cheDoBangLat = false;
    $("sk-bang-lat").hidden = true;
    $("sk-bang-lat").classList.remove("bang-loc-lk", "bang-loc-dd");
    $("sk-bang-lat").textContent = "";
    $("may").hidden = false;
    capNhatPhaSanKhau();
  }

  function datLaiPheu(an) {
    var pheu = $("sk-pheu");
    pheu.classList.remove("sat-nut");
    $("may").classList.remove("sat-nut");
    $("man-san-khau").classList.remove("dang-sat-nut");
    $("pheu-don-vi").textContent = "";
    if (may && typeof may.tatDenPha === "function") may.tatDenPha();
    if (an) pheu.hidden = true;
  }

  function veHuyHieuDonVi(dsUngVien) {
    var khDv = $("pheu-don-vi");
    khDv.textContent = "";
    var daCo = {};
    var danhSachNhan = [];
    for (var i = 0; i < dsUngVien.length && danhSachNhan.length < 3; i += 1) {
      var uv = dsUngVien[i];
      var nhan = uv.donVi && uv.donVi.trim() ? uv.donVi.trim() : uv.ma;
      var khoaNhan = nhan.toLowerCase();
      if (!daCo[khoaNhan]) {
        daCo[khoaNhan] = true;
        danhSachNhan.push(nhan);
      }
    }
    danhSachNhan.forEach(function (nhan) {
      var huyHieu = document.createElement("span");
      huyHieu.className = "pheu-dv";
      huyHieu.textContent = nhan;
      khDv.appendChild(huyHieu);
    });
  }

  function vaoSanKhau() {
    if ($("nut-vao").disabled) return;
    window.AmThanh.moKhoa();
    giaiDoan = "san-khau";
    $("man-chuan-bi").hidden = true;
    $("man-san-khau").hidden = false;
    huyDemChoVang(true);
    huyXacNhanNut(true);
    xoaThongBaoSk();
    tatBangLat();
    datLaiPheu(true);
    trangThaiPhanh = 0;
    kichHoatPhanh = null;
    var soCuon = window.Quay.doDaiMa(danhSach);
    may = window.MayQuay.tao($("may"), window.Quay.boKyTu(danhSach), soCuon, window.AmThanh);
    may.dat(window.Quay.canMa("", soCuon));
    // Mặc định quay từ giải nhỏ nhất còn suất (cuối danh sách) lên giải lớn.
    chon = tt.giai.length - 1;
    for (var i = tt.giai.length - 1; i >= 0; i -= 1) { if (window.Quay.conLai(tt.giai[i], tt.ketQua) > 0) { chon = i; break; } }
    hienTai = null;
    daHuyHienTai = null;
    choQuayBu = false;
    veSanKhau();
  }

  function veChuanBi() {
    if (trangThaiPhanh > 0) {
      phienQuay += 1;
      trangThaiPhanh = 0;
      kichHoatPhanh = null;
      dangQuay = false;
      if (may) {
        var soCuon = window.Quay.doDaiMa(danhSach);
        may.dat(window.Quay.canMa("", soCuon));
      }
    } else if (dangQuay) {
      dungQuayHet = true;
      return;
    }
    huyDemChoVang(true);
    huyXacNhanNut(true);
    xoaThongBaoSk();
    tatBangLat();
    datLaiPheu(true);
    $("man-san-khau").classList.remove("dang-quay-so", "co-ket-qua");
    giaiDoan = "chuan-bi";
    $("man-san-khau").hidden = true;
    $("man-chuan-bi").hidden = false;
    capNhatTongKet();
  }

  function veTab() {
    var nav = $("sk-tab");
    nav.textContent = "";
    tt.giai.forEach(function (g, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "tab" + (i === chon ? " dang-chon" : "") + (window.Quay.conLai(g, tt.ketQua) === 0 ? " xong" : "");
      if (i === chon) b.setAttribute("aria-current", "true");
      var ten = document.createElement("span"); ten.textContent = g.ten;
      var so = document.createElement("span"); so.className = "tab-so"; so.textContent = daQuay(g.id) + "/" + g.soLuong;
      b.append(ten, so);
      b.addEventListener("click", function () { doiGiai(i); });
      nav.appendChild(b);
    });
  }

  function doiGiai(i) {
    if (dangQuay || i < 0 || i >= tt.giai.length) return;
    huyDemChoVang(true);
    huyXacNhanNut(true);
    xoaThongBaoSk();
    tatBangLat();
    datLaiPheu(true);
    chon = i;
    hienTai = null;
    daHuyHienTai = null;
    choQuayBu = false;
    veSanKhau();
  }

  function veNguoiTrung(g) {
    var ol = $("sk-nguoi-trung");
    ol.textContent = "";
    var conAn = false;
    var danhSachHien = trungCua(g);
    if (chon === 0) {
      var lk = dsLocLienKe();
      if (lk.length) danhSachHien = danhSachHien.concat(lk);
    }
    danhSachHien.forEach(function (k) {
      var li = document.createElement("li");
      li.className = k.trangThai === "huy" ? "da-huy" : (hienTai && hienTai.id === k.id ? "moi" : "");
      var ma = document.createElement("span"); ma.className = "nt-ma"; ma.textContent = k.ma;
      var ten = document.createElement("span"); ten.className = "nt-ten";
      var muc = layMucHien(k);
      var an = muc < 2 && k.trangThai !== "huy";
      if (an) conAn = true;
      if (k.trangThai === "huy") ten.textContent = "Đã hủy (vắng mặt)";
      else if (an) ten.textContent = muc === 1 && k.donVi ? k.donVi : CHE_TEN;
      else ten.textContent = k.giaiId === ID_LOC_LIEN_KE ? k.ten + " (Lộc liền kề)" : k.ten;
      li.append(ma, ten);
      if (an) {
        var nut = document.createElement("button"); nut.type = "button"; nut.className = "nut-nho"; nut.textContent = "Hiện";
        nut.setAttribute("aria-label", "Hiện tên người mang mã " + k.ma);
        nut.addEventListener("click", function () { hienTenNgay(k.id); });
        li.appendChild(nut);
      }
      ol.appendChild(li);
    });
    $("nut-hien-tat-ca").hidden = !conAn;
  }

  function capNhatNhanChoVang() {
    var nhan = $("sk-nhan-trang-thai");
    if (!demChoVang) return;
    nhan.hidden = false;
    if (!nhan.classList.contains("cho-xac-nhan")) {
      nhan.className = "sk-nhan-trang-thai cho-xac-nhan";
      nhan.textContent = "";
      var chu = document.createElement("span");
      chu.className = "cho-chu";
      var thanh = document.createElement("span");
      thanh.className = "cho-thanh";
      nhan.append(chu, thanh);
    }
    var chuEl = nhan.querySelector(".cho-chu");
    var thanhEl = nhan.querySelector(".cho-thanh");
    if (chuEl) {
      chuEl.textContent = demChoVang.giayCon > 0
        ? "ĐANG GỌI ĐẠI BIỂU · " + demChoVang.giayCon
        : "HẾT 5 GIÂY — CHỜ MC XÁC NHẬN VẮNG";
    }
    if (thanhEl) {
      thanhEl.style.transform = "scaleX(" + Math.max(0, demChoVang.giayCon / GIAY_CHO_VANG) + ")";
    }
    var nutXn = $("nut-xac-nhan-vang");
    nutXn.hidden = false;
    nutXn.disabled = demChoVang.giayCon > 0;
    nutXn.textContent = demChoVang.giayCon > 0
      ? "Xác nhận vắng (" + demChoVang.giayCon + "s)"
      : "Xác nhận vắng & Chuyển lộc";
    $("nut-co-mat").hidden = false;
    $("nut-huy").hidden = true;
  }

  function veKetQuaHienTai() {
    var khungKq = $("sk-ket-qua");
    var nhan = $("sk-nhan-trang-thai");
    var oMa = $("sk-ma");
    var oDonVi = $("sk-don-vi");
    var oTen = $("sk-ten");

    if (cheDoBangLat) {
      khungKq.hidden = true;
      $("nut-hien-ten").hidden = true;
      $("nut-huy").hidden = true;
      $("nut-co-mat").hidden = true;
      $("nut-xac-nhan-vang").hidden = true;
      return;
    }
    khungKq.hidden = false;

    if (!hienTai && daHuyHienTai) {
      var kh = daHuyHienTai;
      khungKq.classList.add("co", "da-huy");
      nhan.hidden = false;
      if (thongBaoSk) {
        nhan.className = "sk-nhan-trang-thai canh-bao-sk";
        nhan.textContent = thongBaoSk;
      } else {
        nhan.className = "sk-nhan-trang-thai da-huy-nhan";
        nhan.textContent = "VẮNG MẶT — CHUYỂN LỘC";
      }
      oMa.textContent = kh.ma;
      oDonVi.className = "sk-don-vi";
      oDonVi.textContent = kh.donVi || "";
      oTen.className = "sk-ten";
      oTen.textContent = kh.ten;
      $("nut-hien-ten").hidden = true;
      $("nut-huy").hidden = true;
      $("nut-co-mat").hidden = true;
      $("nut-xac-nhan-vang").hidden = true;
      return;
    }

    var k = hienTai;
    khungKq.classList.remove("da-huy");

    if (!k) {
      oMa.textContent = "";
      oDonVi.textContent = "";
      oDonVi.className = "sk-don-vi";
      oTen.textContent = "";
      oTen.className = "sk-ten";
      $("nut-hien-ten").hidden = true;
      $("nut-huy").hidden = true;
      $("nut-co-mat").hidden = true;
      $("nut-xac-nhan-vang").hidden = true;
      if (thongBaoSk) {
        khungKq.classList.add("co");
        nhan.hidden = false;
        nhan.className = "sk-nhan-trang-thai canh-bao-sk";
        nhan.textContent = thongBaoSk;
      } else {
        khungKq.classList.remove("co");
        nhan.hidden = true;
        nhan.className = "sk-nhan-trang-thai";
        nhan.textContent = "";
      }
      return;
    }

    var muc = layMucHien(k);
    var coDonVi = Boolean(k.donVi && k.donVi.trim());
    khungKq.classList.add("co");
    oMa.textContent = k.ma;

    if (muc >= 1 && coDonVi) {
      oDonVi.textContent = k.donVi;
      oDonVi.classList.add("lo-don-vi");
    } else {
      oDonVi.textContent = "";
      oDonVi.classList.remove("lo-don-vi");
    }

    if (muc >= 2) {
      oTen.textContent = k.ten;
      oTen.classList.remove("an");
      oTen.classList.add("chot-ten");
    } else {
      oTen.textContent = CHE_TEN;
      oTen.classList.add("an");
      oTen.classList.remove("chot-ten");
    }

    $("nut-hien-ten").hidden = muc >= 2;
    $("chu-nut-hien").textContent = (muc === 0 && coDonVi) ? "Hiện đơn vị" : "Hiện họ tên";

    if (demChoVang && demChoVang.id === k.id) {
      capNhatNhanChoVang();
    } else {
      $("nut-co-mat").hidden = true;
      $("nut-xac-nhan-vang").hidden = true;
      $("nut-huy").hidden = dangQuay;
      if (thongBaoSk) {
        nhan.hidden = false;
        nhan.className = "sk-nhan-trang-thai canh-bao-sk";
        nhan.textContent = thongBaoSk;
      } else {
        nhan.hidden = true;
        nhan.className = "sk-nhan-trang-thai";
        nhan.textContent = "";
      }
    }
  }

  function veSanKhau() {
    var g = tt.giai[chon];
    if (!g) return;
    var con = window.Quay.conLai(g, tt.ketQua);
    var soLong = long().length;
    var dangChoVang = Boolean(demChoVang);

    $("sk-long").textContent = String(soLong);
    $("sk-ten-giai").textContent = g.ten;
    $("sk-phan-thuong").textContent = g.phanThuong;
    $("sk-con-lai").textContent = con ? "Còn " + con + "/" + g.soLuong + " suất" : "Đã quay đủ " + g.soLuong + " suất";
    var anh = $("sk-anh");
    anh.textContent = "";
    anh.classList.toggle("trong", !g.anh);
    if (g.anh) { var img = new Image(); img.src = g.anh; img.alt = g.phanThuong || g.ten; anh.appendChild(img); }
    veTab();
    veNguoiTrung(g);
    veKetQuaHienTai();
    capNhatPhaSanKhau();

    var nutQuay = $("nut-quay");
    var quayBu = choQuayBu && con > 0 && !dangQuay && !dangChoVang;
    if (trangThaiPhanh === 1) {
      nutQuay.classList.remove("quay-bu", "chot-cuoi");
      nutQuay.classList.add("cho-phanh");
      $("chu-nut-quay").textContent = "Dừng phần đầu";
      nutQuay.disabled = false;
    } else if (trangThaiPhanh === 2) {
      nutQuay.classList.remove("quay-bu", "cho-phanh");
      nutQuay.classList.add("chot-cuoi");
      $("chu-nut-quay").textContent = "CHỐT SỐ CUỐI!";
      nutQuay.disabled = false;
    } else if (trangThaiPhanh === 3) {
      nutQuay.classList.remove("quay-bu", "cho-phanh", "chot-cuoi");
      $("chu-nut-quay").textContent = "Đang chốt...";
      nutQuay.disabled = true;
    } else {
      nutQuay.classList.remove("cho-phanh", "chot-cuoi");
      nutQuay.classList.toggle("quay-bu", quayBu);
      $("chu-nut-quay").textContent = quayBu ? "QUAY BÙ NGAY" : "Quay";
      nutQuay.disabled = dangQuay || con === 0 || dangChoVang;
    }

    var nutQuayBang = $("nut-quay-bang");
    var soQuayBang = Math.min(10, con);
    nutQuayBang.hidden = con < 2;
    nutQuayBang.disabled = dangQuay || con < 2 || soLong === 0 || dangChoVang;
    if (choXacNhanNut.id === "nut-quay-bang") {
      nutQuayBang.classList.add("cho-xac-nhan-nut");
      nutQuayBang.textContent = choXacNhanNut.nhan;
    } else {
      nutQuayBang.classList.remove("cho-xac-nhan-nut");
      nutQuayBang.textContent = "Quay cả bảng (" + soQuayBang + " suất)";
    }

    var nutQuayHet = $("nut-quay-het");
    nutQuayHet.disabled = dangQuay || con === 0 || dangChoVang;
    if (choXacNhanNut.id === "nut-quay-het") {
      nutQuayHet.classList.add("cho-xac-nhan-nut");
      nutQuayHet.textContent = choXacNhanNut.nhan;
    } else {
      nutQuayHet.classList.remove("cho-xac-nhan-nut");
      nutQuayHet.textContent = "Quay hết giải này";
    }

    // Nút Lộc Liền Kề & Lộc Đồng Đội chỉ mở ở Giải Đặc biệt sau khi đã quay đủ và có người trúng
    var gocDb = nguoiTrungDacBiet();
    var coDacBiet = chon === 0 && con === 0 && Boolean(gocDb);

    var nutLk = $("nut-loc-lien-ke");
    var daLk = dsLocLienKe();
    nutLk.hidden = !(coDacBiet && (daLk.length > 0 || soLong > 0));
    nutLk.disabled = dangQuay || dangChoVang;
    if (choXacNhanNut.id === "nut-loc-lien-ke") {
      nutLk.classList.add("cho-xac-nhan-nut");
      nutLk.textContent = choXacNhanNut.nhan;
    } else {
      nutLk.classList.remove("cho-xac-nhan-nut");
      nutLk.textContent = daLk.length ? "Xem Lộc Liền Kề" : "Trao Lộc Liền Kề";
    }

    var nutDd = $("nut-loc-dong-doi");
    var daDd = dsLocDongDoi();
    var coDonViDb = Boolean(gocDb && gocDb.donVi && gocDb.donVi.trim());
    var conCungDv = coDonViDb ? window.Quay.locCungDonVi(long(), gocDb.donVi, gocDb.ma) : [];
    nutDd.hidden = !(coDacBiet && coDonViDb && (daDd.length > 0 || conCungDv.length > 0));
    nutDd.disabled = dangQuay || dangChoVang;
    if (choXacNhanNut.id === "nut-loc-dong-doi") {
      nutDd.classList.add("cho-xac-nhan-nut");
      nutDd.textContent = choXacNhanNut.nhan;
    } else {
      nutDd.classList.remove("cho-xac-nhan-nut");
      nutDd.textContent = daDd.length ? "Xem Lộc Đồng Đội" : "Trao Lộc Đồng Đội";
    }
  }

  /** Quay một suất. nhanh: dùng khi "quay hết giải". Trả Promise<boolean> có quay được hay không. */
  function quayMot(nhanh) {
    var g = tt.giai[chon];
    if (dangQuay || demChoVang || window.Quay.conLai(g, tt.ketQua) === 0) return Promise.resolve(false);
    var lq = long();
    if (!lq.length) { baoTrangThaiSanKhau("Không còn đại biểu nào trong lồng quay."); return Promise.resolve(false); }
    huyXacNhanNut(true);
    xoaThongBaoSk();
    tatBangLat();
    datLaiPheu(true);

    var laQuayBu = choQuayBu && !nhanh;
    var nguoi = window.Quay.boc(lq);
    var soCuon = window.Quay.doDaiMa(danhSach);
    var maCan = window.Quay.canMa(nguoi.ma, soCuon);
    var tongBanDau = lq.length;
    var dungPhanhHaiNhip = !nhanh && tt.cauHinh.phanhHaiNhip !== false && chon <= 1 && soCuon >= 2;
    var maPhien = ++phienQuay;

    // Phân tích thứ tự dừng cuộn (nếu bấm phanh 2 nhịp thì luôn khóa xuôi trái->phải và giữ riêng cuộn cuối)
    var phanTich = dungPhanhHaiNhip
      ? { viTriCoDinh: [], thuTu: Array.from({ length: soCuon }, function (_, i) { return i; }) }
      : window.Quay.phanTichThuTuQuay(lq, soCuon, tt.cauHinh.quayNguoc !== false);
    var thuTuDung = phanTich.thuTu;
    var viTriCoDinh = phanTich.viTriCoDinh;
    var idxCuoi = thuTuDung[thuTuDung.length - 1];

    var mauTruocCuoi = {};
    for (var m = 0; m < thuTuDung.length - 1; m += 1) {
      var vtTruoc = thuTuDung[m];
      mauTruocCuoi[vtTruoc] = maCan.charAt(vtTruoc);
    }
    var ungVienTruocCuoi = soCuon >= 2 ? window.Quay.locTheoViTri(lq, mauTruocCuoi, soCuon) : [];
    var satNutCuoi = !nhanh && !dungPhanhHaiNhip && ungVienTruocCuoi.length >= 2 && ungVienTruocCuoi.length <= 12;

    var mauDaChot = {};
    var soDaDung = 0;

    dangQuay = true;
    trangThaiPhanh = dungPhanhHaiNhip ? 1 : 0;
    kichHoatPhanh = null;
    hienTai = null;
    daHuyHienTai = null;
    choQuayBu = false;
    veSanKhau();

    if (!nhanh) {
      var pheu = $("sk-pheu");
      pheu.hidden = false;
      pheu.classList.remove("sat-nut");
      $("pheu-nhan").textContent = dungPhanhHaiNhip
        ? "Hội trường hô DỪNG — Nhịp 1"
        : (laQuayBu ? "Quay bù cứu giải" : "Đang khoanh vùng");
      $("pheu-so").textContent = "CÒN " + tongBanDau;
      $("pheu-thanh").style.transform = "scaleX(1)";
      $("pheu-don-vi").textContent = "";
    }

    return may.quay(maCan, nhanh, {
      satNutCuoi: satNutCuoi,
      cheDoPhanh: dungPhanhHaiNhip,
      thuTuDung: thuTuDung,
      viTriCoDinh: viTriCoDinh,
      chayDaNgan: laQuayBu,
      trenCanvas: $("hieu-ung-sk"),
      onSanSangPhanh: function (chotNhipTiep) {
        if (maPhien !== phienQuay) return;
        kichHoatPhanh = chotNhipTiep;
        trangThaiPhanh = 1;
        veSanKhau();
      },
      onChuyenNhip: function (nhip) {
        if (maPhien !== phienQuay) return;
        if (nhip === 2) {
          trangThaiPhanh = 2;
          $("may").classList.add("sat-nut");
          $("sk-pheu").classList.add("sat-nut");
          $("man-san-khau").classList.add("dang-sat-nut");
          $("pheu-nhan").textContent = "SỐ CUỐI CHẴN HAY LẺ? — HÔ DỪNG!";
          window.AmThanh.satNut();
          window.AmThanh.trongDon(1400);
          veHuyHieuDonVi(ungVienTruocCuoi);
          veSanKhau();
        } else if (nhip === 3) {
          trangThaiPhanh = 3;
          kichHoatPhanh = null;
          $("pheu-nhan").textContent = "Đang hãm phanh số cuối";
          veSanKhau();
        }
      },
      onDungCuon: function (chiSoCuon, _tienTo, cuoi) {
        if (nhanh || maPhien !== phienQuay) return;
        mauDaChot[chiSoCuon] = maCan.charAt(chiSoCuon);
        soDaDung += 1;
        var khop = window.Quay.locTheoViTri(lq, mauDaChot, soCuon);
        var soCon = khop.length;
        $("pheu-so").textContent = cuoi ? "ĐÃ CHỐT MÃ SỐ" : "CÒN " + soCon;
        $("pheu-thanh").style.transform = "scaleX(" + Math.max(0.03, soCon / Math.max(1, tongBanDau)) + ")";
        if (!cuoi && soDaDung >= thuTuDung.length - 2 && soCon > 0 && soCon <= 12) {
          veHuyHieuDonVi(khop);
        }
        if (!cuoi && soDaDung === thuTuDung.length - 1 && satNutCuoi) {
          $("may").classList.add("sat-nut");
          $("sk-pheu").classList.add("sat-nut");
          $("man-san-khau").classList.add("dang-sat-nut");
          $("pheu-nhan").textContent = "SÁT NÚT — CỔ VŨ NGAY";
          may.batDenPha($("hieu-ung-sk"), idxCuoi);
          window.AmThanh.satNut();
          window.AmThanh.trongDon(1500);
          veHuyHieuDonVi(khop);
        }
        if (cuoi) {
          may.tatDenPha();
          $("may").classList.remove("sat-nut");
          $("man-san-khau").classList.remove("dang-sat-nut");
        }
      },
    }).then(function () {
      if (maPhien !== phienQuay) return false;
      datLaiPheu(true);
      trangThaiPhanh = 0;
      kichHoatPhanh = null;
      var kq = {
        id: taoIdKetQua(),
        giaiId: g.id,
        ma: nguoi.ma,
        ten: nguoi.ten,
        donVi: nguoi.donVi,
        luc: new Date().toLocaleString("vi-VN", { hour12: false }),
        trangThai: "trung",
      };
      tt.ketQua.push(kq);
      luu();
      hienTai = kq;
      dangQuay = false;
      var lon = chon === 0;
      if (nhanh) {
        window.AmThanh.trung(false);
      } else if (!tt.cauHinh.anTen) {
        window.AmThanh.trung(lon);
        window.Phao.banHaiBen($("phao"), lon ? 1.8 : 1.15);
      }
      veSanKhau();
      return true;
    });
  }

  /** Xử lý nút Quay chính và phím Space: bắt đầu lượt quay mới hoặc bấm phanh theo nhịp. */
  function xuLyNutQuay() {
    if ((trangThaiPhanh === 1 || trangThaiPhanh === 2) && typeof kichHoatPhanh === "function") {
      var fn = kichHoatPhanh;
      if (trangThaiPhanh === 1) {
        trangThaiPhanh = 3;
        veSanKhau();
      }
      fn();
      return;
    }
    if (!$("nut-quay").disabled) quayMot(false);
  }

  /** Dựng bảng lật 3D (dùng cho Quay cả bảng 5-10 suất, Lộc Liền Kề và Lộc Đồng Đội). */
  function hienBangLat(tieuDe, phuDe, danhSachThe, tuyChon) {
    huyHenGioBangLat();
    huyDemChoVang(true);
    huyXacNhanNut(true);
    xoaThongBaoSk();
    datLaiPheu(true);
    cheDoBangLat = true;
    hienTai = null;
    daHuyHienTai = null;
    choQuayBu = false;
    $("may").hidden = true;
    $("sk-ket-qua").hidden = true;

    var laLocLienKe = typeof tuyChon === "boolean" ? tuyChon : Boolean(tuyChon && tuyChon.laLocLienKe);
    var laLocDongDoi = Boolean(tuyChon && tuyChon.laLocDongDoi);
    var bang = $("sk-bang-lat");
    bang.textContent = "";
    bang.classList.toggle("bang-loc-lk", laLocLienKe);
    bang.classList.toggle("bang-loc-dd", laLocDongDoi);
    bang.hidden = false;

    var dau = document.createElement("div");
    dau.className = "bang-lat-dau";
    var td = document.createElement("span");
    td.className = "bang-lat-tieu-de";
    td.textContent = tieuDe;
    var pd = document.createElement("span");
    pd.className = "bang-lat-phu";
    pd.textContent = phuDe;
    dau.append(td, pd);
    bang.appendChild(dau);

    var cacThe = danhSachThe.map(function (n) {
      var the = document.createElement("div");
      the.className = "the-lat";
      var oMa = document.createElement("span");
      oMa.className = "lat-ma";
      oMa.textContent = n.ma;
      var ttEl = document.createElement("div");
      ttEl.className = "lat-thong-tin";
      var oTen = document.createElement("span");
      oTen.className = "lat-ten";
      oTen.textContent = n.ten;
      var oDv = document.createElement("span");
      oDv.className = "lat-don-vi";
      oDv.textContent = n.donVi || "";
      ttEl.append(oTen, oDv);
      the.append(oMa, ttEl);
      bang.appendChild(the);
      return the;
    });

    // Dải Top 3 Đơn vị dẫn đầu sau Quay cả bảng
    if (!laLocLienKe && !laLocDongDoi) {
      var topDv = tinhTopDonVi(tt.ketQua, 3);
      if (topDv.length) {
        var daiTop = document.createElement("div");
        daiTop.className = "bang-lat-don-vi";
        var nhanTop = document.createElement("span");
        nhanTop.className = "dv-top-nhan";
        nhanTop.textContent = "Top đơn vị dẫn đầu";
        var dsTop = document.createElement("div");
        dsTop.className = "dv-top-ds";
        topDv.forEach(function (dv, viTri) {
          var muc = document.createElement("span");
          muc.className = "dv-top-muc" + (viTri === 0 ? " hang-nhat" : "");
          var tenDv = document.createElement("span");
          tenDv.textContent = (viTri + 1) + ". " + dv.donVi;
          var soDv = document.createElement("span");
          soDv.className = "dv-top-so";
          soDv.textContent = dv.so + " suất";
          muc.append(tenDv, soDv);
          dsTop.appendChild(muc);
        });
        daiTop.append(nhanTop, dsTop);
        bang.appendChild(daiTop);
      }
    }

    dangQuay = true;
    veSanKhau();

    cacThe.forEach(function (the, idx) {
      var hen = setTimeout(function () {
        the.classList.add("da-lat");
        window.AmThanh.latDapAn();
      }, 120 + idx * 180);
      henGioBangLat.push(hen);
    });

    var henXong = setTimeout(function () {
      dangQuay = false;
      window.AmThanh.trung(Boolean(laLocLienKe || laLocDongDoi || chon === 0));
      window.Phao.banHaiBen($("phao"), (laLocLienKe || laLocDongDoi) ? 1.65 : 1.3);
      veSanKhau();
    }, 120 + Math.max(0, cacThe.length - 1) * 180 + 420);
    henGioBangLat.push(henXong);
  }

  /** Quay cả bảng (tối đa 10 suất trong một lượt) với hiệu ứng lật thẻ 3D. */
  function quayBang() {
    if (dangQuay || demChoVang) return;
    var g = tt.giai[chon];
    var con = window.Quay.conLai(g, tt.ketQua);
    if (con < 2) return;
    var lq = long();
    if (!lq.length) { baoTrangThaiSanKhau("Không còn đại biểu nào trong lồng quay."); return; }
    var soBoc = Math.min(10, con, lq.length);
    if (!xacNhanHaiNhip("nut-quay-bang", "Bấm lần nữa để quay " + soBoc + " suất")) return;

    var dsTrung = window.Quay.bocNhieu(lq, soBoc);
    var luc = new Date().toLocaleString("vi-VN", { hour12: false });
    dsTrung.forEach(function (nguoi) {
      var kq = {
        id: taoIdKetQua(),
        giaiId: g.id,
        ma: nguoi.ma,
        ten: nguoi.ten,
        donVi: nguoi.donVi,
        luc: luc,
        trangThai: "trung",
      };
      tt.ketQua.push(kq);
      if (tt.daHien.indexOf(kq.id) < 0) tt.daHien.push(kq.id);
    });
    luu();
    hienBangLat("Bảng tổng sắp — " + g.ten, soBoc + " đại biểu trúng giải", dsTrung, {});
  }

  /** Vòng phụ Lộc Liền Kề sau khi Giải Đặc biệt quay đủ. */
  function hienLocLienKe() {
    if (dangQuay || demChoVang) return;
    var goc = nguoiTrungDacBiet();
    if (!goc) return;
    var daLk = dsLocLienKe();
    if (!daLk.length) {
      var lq = long();
      var ungVien = window.Quay.timMaLienKe(lq, goc.ma, 2);
      if (!ungVien.length) { baoTrangThaiSanKhau("Không còn đại biểu nào trong lồng quay để trao Lộc Liền Kề."); return; }
      if (!xacNhanHaiNhip("nut-loc-lien-ke", "Bấm lần nữa để trao Lộc (" + ungVien.length + " suất)")) return;
      var luc = new Date().toLocaleString("vi-VN", { hour12: false });
      ungVien.forEach(function (nguoi) {
        var kq = {
          id: taoIdKetQua(),
          giaiId: ID_LOC_LIEN_KE,
          phanThuong: "Quà tri ân mã liền kề Giải Đặc biệt (" + goc.ma + ")",
          ma: nguoi.ma,
          ten: nguoi.ten,
          donVi: nguoi.donVi,
          luc: luc,
          trangThai: "trung",
        };
        tt.ketQua.push(kq);
        if (tt.daHien.indexOf(kq.id) < 0) tt.daHien.push(kq.id);
      });
      luu();
      daLk = dsLocLienKe();
    }
    hienBangLat("Lộc Liền Kề Giải Đặc biệt", "Liền kề mã " + goc.ma, daLk, { laLocLienKe: true });
  }

  /** Vòng phụ Lộc Đồng Đội theo đơn vị sau khi Giải Đặc biệt quay đủ. */
  function hienLocDongDoi() {
    if (dangQuay || demChoVang) return;
    var goc = nguoiTrungDacBiet();
    if (!goc || !goc.donVi || !goc.donVi.trim()) return;
    var daDd = dsLocDongDoi();
    if (!daDd.length) {
      var cungDv = window.Quay.locCungDonVi(long(), goc.donVi, goc.ma);
      if (!cungDv.length) { baoTrangThaiSanKhau("Không còn đại biểu nào cùng đơn vị (" + goc.donVi + ") trong lồng quay."); return; }
      var soTrao = Math.min(3, cungDv.length);
      if (!xacNhanHaiNhip("nut-loc-dong-doi", "Bấm lần nữa để trao Lộc Đồng Đội (" + soTrao + " suất)")) return;
      var ungVien = window.Quay.bocNhieu(cungDv, 3);
      var luc = new Date().toLocaleString("vi-VN", { hour12: false });
      ungVien.forEach(function (nguoi) {
        var kq = {
          id: taoIdKetQua(),
          giaiId: ID_LOC_DONG_DOI,
          phanThuong: "Quà đồng đội cùng đơn vị Giải Đặc biệt (" + goc.donVi + ")",
          ma: nguoi.ma,
          ten: nguoi.ten,
          donVi: nguoi.donVi,
          luc: luc,
          trangThai: "trung",
        };
        tt.ketQua.push(kq);
        if (tt.daHien.indexOf(kq.id) < 0) tt.daHien.push(kq.id);
      });
      luu();
      daDd = dsLocDongDoi();
    }
    hienBangLat("Lộc Đồng Đội — " + goc.donVi, daDd.length + " đại biểu cùng đơn vị Giải Đặc biệt", daDd, { laLocDongDoi: true });
  }

  function quayHet() {
    if (dangQuay || demChoVang) return;
    var g = tt.giai[chon];
    var con = window.Quay.conLai(g, tt.ketQua);
    if (!con) return;
    var lq = long();
    if (!lq.length) { baoTrangThaiSanKhau("Không còn đại biểu nào trong lồng quay."); return; }
    if (!xacNhanHaiNhip("nut-quay-het", "Bấm lần nữa để quay hết " + con + " suất")) return;
    dungQuayHet = false;
    (function tiep() {
      if (dungQuayHet || window.Quay.conLai(g, tt.ketQua) === 0) {
        window.Phao.banHaiBen($("phao"), 1.4);
        return;
      }
      quayMot(true).then(function (duoc) { if (duoc) setTimeout(tiep, 650); });
    })();
  }

  /** Lật danh tính 2 nấc (Enter): Nấc 1 lộ Đơn vị -> Nấc 2 chốt Họ tên + nhạc & pháo hai bên. */
  function hienBuocTiep(id) {
    var k = tt.ketQua.find(function (x) { return x.id === id; });
    if (!k || k.trangThai === "huy") return;
    var muc = layMucHien(k);
    if (muc >= 2) return;
    var coDonVi = Boolean(k.donVi && k.donVi.trim());
    if (muc === 0 && coDonVi) {
      mucHienTam[k.id] = 1;
      window.AmThanh.denQuet(true);
      veSanKhau();
      return;
    }
    mucHienTam[k.id] = 2;
    if (tt.daHien.indexOf(k.id) < 0) tt.daHien.push(k.id);
    luu();
    veSanKhau();
    var lon = chon === 0;
    window.AmThanh.trung(lon);
    window.Phao.banHaiBen($("phao"), lon ? 1.8 : 1.15);
  }

  function hienTenNgay(id) {
    var laHienTai = hienTai && hienTai.id === id;
    var chuaChot = tt.daHien.indexOf(id) < 0;
    mucHienTam[id] = 2;
    if (chuaChot) tt.daHien.push(id);
    luu();
    veSanKhau();
    if (laHienTai && chuaChot) {
      var lon = chon === 0;
      window.AmThanh.trung(lon);
      window.Phao.banHaiBen($("phao"), lon ? 1.8 : 1.15);
    }
  }

  /** Đếm ngược 5 giây tìm đại biểu trên sân khấu; hết 5 giây mới mở khóa nút xác nhận vắng (không tự động hủy). */
  function huyGiai() {
    var k = hienTai;
    if (!k || dangQuay || demChoVang) return;
    huyXacNhanNut(true);
    xoaThongBaoSk();
    demChoVang = { id: k.id, giayCon: GIAY_CHO_VANG, hen: 0 };
    window.AmThanh.denQuet(false);
    veSanKhau();
    demChoVang.hen = setInterval(function () {
      if (!demChoVang) return;
      demChoVang.giayCon = Math.max(0, demChoVang.giayCon - 1);
      if (demChoVang.giayCon > 0) {
        window.AmThanh.denQuet(false);
      } else {
        clearInterval(demChoVang.hen);
        demChoVang.hen = 0;
        window.AmThanh.denQuet(true);
      }
      capNhatNhanChoVang();
    }, 1000);
  }

  function xacNhanCoMat() {
    if (!demChoVang) return;
    huyDemChoVang(false);
  }

  function xacNhanVangMat() {
    if (!demChoVang || demChoVang.giayCon > 0) return;
    var k = hienTai;
    if (!k || k.id !== demChoVang.id) { huyDemChoVang(false); return; }
    huyDemChoVang(true);
    tt.ketQua = tt.ketQua.map(function (x) { return x.id === k.id ? Object.assign({}, x, { trangThai: "huy" }) : x; });
    daHuyHienTai = Object.assign({}, k, { trangThai: "huy" });
    hienTai = null;
    choQuayBu = true;
    luu();
    veSanKhau();
  }

  function toanManHinh() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(function () {});
    else document.exitFullscreen();
  }

  // ── Gắn sự kiện ──
  function ganSuKien() {
    var cauHinhGiai = window.CauHinhGiai.tao($("ds-giai"), function () { return tt.giai; }, function (ds) { tt.giai = ds; luu(); }, daQuay, baoGiai);
    cauHinhGiai.ve();
    $("nut-them-giai").addEventListener("click", cauHinhGiai.them);
    $("nut-giai-mau").addEventListener("click", function () {
      if (tt.ketQua.length) { baoGiai("canh-bao", "Đã có kết quả quay, không thay bộ giải được. Xóa kết quả trước."); return; }
      if (!tt.giai.length || window.confirm("Thay danh sách giải hiện tại bằng bộ giải mẫu?")) cauHinhGiai.dungMau();
    });
    $("nut-don-anh").addEventListener("click", function () {
      if (!window.confirm("Xóa toàn bộ ảnh phần thưởng đã lưu để giải phóng bộ nhớ trình duyệt?")) return;
      cauHinhGiai.donAnh();
      baoGiai("ok", "Đã dọn toàn bộ ảnh phần thưởng.");
    });
    [["o-quay-nguoc", "quayNguoc"], ["o-an-ten", "anTen"], ["o-phanh-hai-nhip", "phanhHaiNhip"], ["o-mot-giai", "moiNguoiMotGiai"], ["o-loai-vang", "loaiNguoiVang"]].forEach(function (c) {
      $(c[0]).addEventListener("change", function () { tt.cauHinh[c[1]] = $(c[0]).checked; luu(); });
    });
    $("o-am-thanh").addEventListener("change", function () { if ($("o-am-thanh").checked !== window.AmThanh.dangBat()) window.AmThanh.batTat(); });
    $("nut-vao").addEventListener("click", vaoSanKhau);
    $("nut-xuat").addEventListener("click", function () {
      if (!tt.ketQua.length) { baoGiai("canh-bao", "Chưa có kết quả để xuất."); return; }
      window.LuuTru.taiCsv(window.Quay.dongXuat(tt.giai, tt.ketQua), "ket-qua-quay-so-" + new Date().toISOString().slice(0, 10) + ".csv");
    });
    $("nut-in-bien-ban").addEventListener("click", function () {
      if (!tt.ketQua.length) { baoGiai("canh-bao", "Chưa có kết quả để in biên bản."); return; }
      var bang = window.Quay.dongXuat(tt.giai, tt.ketQua);
      var soTrung = tt.ketQua.filter(function (k) { return k.trangThai === "trung"; }).length;
      window.BienBan.in({
        tenTro: "Quay số trúng thưởng",
        tenSuKien: window.LuuTru.docTenSuKien(),
        tomTat: "Tổng số " + soTrung + " người trúng giải (" + tt.ketQua.length + " lượt quay)",
        cot: bang[0],
        dong: bang.slice(1),
        ghiChu: "Mã nhân viên được bốc ngẫu nhiên đều bằng nguồn mật mã trình duyệt (crypto.getRandomValues).",
      });
    });
    $("nut-lam-lai").addEventListener("click", function () {
      if (!tt.ketQua.length || !window.confirm("Xóa " + tt.ketQua.length + " kết quả quay số? Nên tải file kết quả trước.")) return;
      tt.ketQua = [];
      tt.daHien = [];
      mucHienTam = {};
      luu();
      baoGiai("ok", "Đã xóa kết quả. Có thể quay lại từ đầu.");
    });
    $("nut-quay").addEventListener("click", function () { quayMot(false); });
    $("nut-quay-bang").addEventListener("click", quayBang);
    $("nut-quay-het").addEventListener("click", quayHet);
    $("nut-loc-lien-ke").addEventListener("click", hienLocLienKe);
    $("nut-hien-ten").addEventListener("click", function () { if (hienTai) hienBuocTiep(hienTai.id); });
    $("nut-hien-tat-ca").addEventListener("click", function () {
      trungCua(tt.giai[chon]).forEach(function (k) {
        mucHienTam[k.id] = 2;
        if (tt.daHien.indexOf(k.id) < 0) tt.daHien.push(k.id);
      });
      luu();
      veSanKhau();
    });
    $("nut-huy").addEventListener("click", huyGiai);
    $("nut-co-mat").addEventListener("click", xacNhanCoMat);
    $("nut-xac-nhan-vang").addEventListener("click", xacNhanVangMat);
    $("nut-ve").addEventListener("click", veChuanBi);

    window.addEventListener("resize", function () {
      if (giaiDoan !== "san-khau" || dangQuay || !may || cheDoBangLat) return;
      clearTimeout(henResize);
      henResize = setTimeout(function () {
        var soCuon = window.Quay.doDaiMa(danhSach);
        var maHien = hienTai ? hienTai.ma : (daHuyHienTai ? daHuyHienTai.ma : "");
        may.dat(window.Quay.canMa(maHien, soCuon));
      }, 120);
    });

    document.addEventListener("keydown", function (e) {
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
      if (e.key === "f" || e.key === "F") { toanManHinh(); return; }
      if (e.key === "m" || e.key === "M") { $("o-am-thanh").checked = window.AmThanh.batTat(); return; }
      if (giaiDoan === "chuan-bi") {
        if (e.code === "Space") { e.preventDefault(); vaoSanKhau(); }
        return;
      }
      if (e.code === "Space") { e.preventDefault(); if (!$("nut-quay").disabled) quayMot(false); }
      else if (e.key === "Enter") { e.preventDefault(); if (hienTai && !cheDoBangLat) hienBuocTiep(hienTai.id); }
      else if (e.key === "ArrowLeft") doiGiai(chon - 1);
      else if (e.key === "ArrowRight") doiGiai(chon + 1);
      else if (e.key === "Escape") veChuanBi();
    });
  }

  napDaLuu();
  ganSuKien();
  capNhatTongKet();
})();
