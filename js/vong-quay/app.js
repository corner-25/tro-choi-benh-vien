/* Điều phối trang Vòng quay may mắn. Dữ liệu người dùng chỉ vào DOM bằng textContent. */
(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };
  var KHOA = "vong-quay";
  var TOI_DA_DOT_BIEN = 2;
  var MAU_QUA = [
    "Phần quà Đặc biệt", "Voucher chăm sóc sức khỏe", "Bình giữ nhiệt cao cấp",
    "Túi vải kỷ niệm hội nghị", "Sổ tay và bút ký", "Quà tặng từ Công đoàn",
    "Ô dù chống nắng", "Phiếu mua hàng siêu thị",
  ];
  var MAU_KHU = [
    "Khu A – Hàng ghế đầu trái", "Khu B – Hàng ghế đầu phải",
    "Khu C – Hàng ghế giữa trái", "Khu D – Hàng ghế giữa phải",
    "Khu E – Hàng ghế cuối trái", "Khu F – Hàng ghế cuối phải",
  ];
  var MO_TA_CHE_DO = {
    thuong: "Quay chọn 1 ô mỗi lượt (hoặc 2–3 kim quay nhanh); hỗ trợ loại ô đã trúng và tối đa 2 lần nổ Ô Đột biến sân khấu.",
    "so-hai-chang": "Quay toàn bộ 300+ đại biểu từ danh sách chung: Chặng 1 chọn đầu số (00_..31_), lật đĩa 3D sang Chặng 2 chỉ còn số cuối 0–9 cỡ chữ khổng lồ.",
    "hai-nhip": "Nhịp 1 quay chọn Khoa/Phòng để tập thể cùng cổ vũ; đĩa tự lật 3D nạp danh sách đại biểu khoa đó để Nhịp 2 chốt người nhận quà.",
    "sinh-ton": "Dành cho 4–6 đơn vị tranh Giải Đặc Biệt: mỗi lượt chốt 1 đội nhận Quà đồng hành, các đội ở lại bước tiếp tới trận 50–50 chốt Quán quân.",
  };
  var MO_TA_SO_KIM = {
    1: "1 kim chuẩn sân khấu: hỗ trợ Sát nút, khung ngắm Photo-Finish, Ống kính 2.4× và Ô Đột biến.",
    2: "2 kim đối xứng 180°: chốt nhanh 2 ô khác nhau trong 1 lượt quay (chỉ áp dụng ở chế độ Quay từng lượt).",
    3: "3 kim tam giác 120°: chốt nhanh 3 ô khác nhau trong 1 lượt quay (chỉ áp dụng ở chế độ Quay từng lượt).",
  };

  var tt = {
    muc: [],
    ketQua: [],
    cauHinh: { loaiDaTrung: true, cheDo: "thuong", satNut: true, dotBien: false, soKim: 1 },
  };
  var giaiDoan = "chuan-bi";
  var vong = null;
  var ketQuaHienTai = null;
  var nhipHienTai = 1;
  var donViDangChon = "";
  var danhSachNhip2 = [];
  var choVeNhip1 = false;

  // Trạng thái riêng cho chế độ Quay 300+ đại biểu (2 chặng Đầu số -> Số cuối)
  var changSo = 1;
  var daiBieuDich = null;
  var dauSoDangChon = "";
  var danhSachSoCuoi = [];
  var choVeChang1 = false;

  var dangLatDia = false;
  var heSoThuong = 1;
  var luotKepCon = 0;
  var boHenGio = [];

  function henGio(fn, ms) {
    var id = setTimeout(function () {
      boHenGio = boHenGio.filter(function (x) { return x !== id; });
      fn();
    }, ms);
    boHenGio.push(id);
    return id;
  }

  function xoaHenGio() {
    boHenGio.forEach(function (id) { clearTimeout(id); });
    boHenGio = [];
  }

  function taoId() {
    var r = Math.floor(window.VongQuay.rngMatMa()() * 1e6).toString(36);
    return "vq" + Date.now().toString(36) + r;
  }

  function lucHienTai() {
    return new Date().toLocaleString("vi-VN", { hour12: false });
  }

  function bao(loai, chu) {
    var k = $("trang-thai-vq");
    k.className = "trang-thai " + loai;
    k.textContent = "";
    var p = document.createElement("p");
    p.textContent = chu;
    k.appendChild(p);
  }

  function cheDoHienTai() {
    var cd = tt.cauHinh.cheDo;
    if (cd === "so-hai-chang" || cd === "hai-nhip" || cd === "sinh-ton") return cd;
    return "thuong";
  }

  function soKimHienTai() {
    if (cheDoHienTai() !== "thuong") return 1;
    var k = Number(tt.cauHinh.soKim);
    return (k === 2 || k === 3) ? k : 1;
  }

  function layNguoiChoiChung() {
    return window.LuuTru.docDanhSach().nguoiChoi || [];
  }

  function conLaiThuong() {
    return window.VongQuay.mucConLai(tt.muc, tt.ketQua, tt.cauHinh.loaiDaTrung);
  }

  function conLaiSinhTon() {
    return window.VongQuay.mucConLai(tt.muc, tt.ketQua, true);
  }

  function dsSoKhaDung() {
    return window.VongQuay.taoDanhSachSo(layNguoiChoiChung(), tt.ketQua);
  }

  function conLaiDonViHaiNhip() {
    if (!tt.cauHinh.loaiDaTrung) return tt.muc.slice();
    var da = new Set();
    tt.ketQua.forEach(function (k) {
      if (!k || k.trangThai === "huy" || k.loai === "dot-bien") return;
      if (k.donVi) da.add(String(k.donVi).toLowerCase());
      if (k.muc) da.add(String(k.muc).toLowerCase());
    });
    return tt.muc.filter(function (m) { return !da.has(String(m).toLowerCase()); });
  }

  function nguoiConLaiTrongKhoa(donVi) {
    var ds = window.VongQuay.layNguoiTheoDonVi(layNguoiChoiChung(), donVi);
    var daMa = new Set();
    var daTen = new Set();
    tt.ketQua.forEach(function (k) {
      if (!k || k.trangThai === "huy") return;
      if (k.ma) daMa.add(String(k.ma).toLowerCase());
      if (k.ten) daTen.add(String(k.ten).toLowerCase());
    });
    return ds.filter(function (n) {
      if (n.ma && daMa.has(n.ma.toLowerCase())) return false;
      if (!n.ma && n.ten && daTen.has(n.ten.toLowerCase())) return false;
      return true;
    });
  }

  function layDotBienDaNo() {
    var ds = [];
    tt.ketQua.forEach(function (k) {
      if (k && k.trangThai !== "huy" && k.loai === "dot-bien" && k.maDotBien) {
        ds.push(k.maDotBien);
      }
    });
    return ds;
  }

  function conLai() {
    var cd = cheDoHienTai();
    if (cd === "so-hai-chang") return dsSoKhaDung();
    if (cd === "sinh-ton") return conLaiSinhTon();
    if (cd === "hai-nhip") return conLaiDonViHaiNhip();
    return conLaiThuong();
  }

  function dsTrenVongHienTai() {
    var cd = cheDoHienTai();
    if (cd === "so-hai-chang") {
      if (changSo === 2) {
        return danhSachSoCuoi.map(function (x) {
          return {
            nhan: x.soCuoi,
            so: x.so,
            dauSo: x.dauSo,
            soCuoi: x.soCuoi,
            loai: "thuong",
            maDotBien: null,
            nguoi: x.nguoi,
          };
        });
      }
      var dsDauSo = window.VongQuay.layDauSoTuDanhSachSo(dsSoKhaDung());
      return dsDauSo.map(function (d) {
        return {
          nhan: d.nhan,
          dauSo: d.dauSo,
          soLuong: d.soLuong,
          loai: "thuong",
          maDotBien: null,
        };
      });
    }

    if (cd === "hai-nhip" && nhipHienTai === 2) {
      return danhSachNhip2.map(function (n) {
        return {
          nhan: window.VongQuay.rutGonTenTrenNan(n.ten, n.ma),
          tenDayDu: n.nhan,
          loai: "thuong",
          maDotBien: null,
          nguoi: n,
        };
      });
    }

    var ds = conLai();
    if (cd === "thuong" && soKimHienTai() === 1 && tt.cauHinh.dotBien && ds.length >= 2 && ds.length <= 24) {
      var daNo = layDotBienDaNo();
      if (daNo.length < TOI_DA_DOT_BIEN) {
        return window.VongQuay.tronDotBien(ds, { loaiBoMa: daNo });
      }
    }
    return ds.map(function (s) {
      return { nhan: s, loai: "thuong", maDotBien: null };
    });
  }

  function layNhanTrucTam(dsVong) {
    var cd = cheDoHienTai();
    if (cd === "so-hai-chang") {
      if (changSo === 2 && dauSoDangChon !== "") return dauSoDangChon + "_";
      return String(dsVong.length);
    }
    if (cd === "hai-nhip") {
      return nhipHienTai === 2 ? "N2" : String(dsVong.length);
    }
    if (cd === "sinh-ton") {
      var con = conLaiSinhTon().length;
      return con === 2 ? "50–50" : String(con);
    }
    if (heSoThuong === 2) return "×2";
    if (luotKepCon > 0) return "+" + luotKepCon;
    return String(dsVong.length);
  }

  function kiemTraGoiYCheDo() {
    var cd = cheDoHienTai();
    var soKim = soKimHienTai();
    $("mo-ta-che-do").textContent = MO_TA_CHE_DO[cd];
    $("chon-so-kim").disabled = cd !== "thuong";
    if (cd !== "thuong") $("chon-so-kim").value = "1";
    else $("chon-so-kim").value = String(soKim);
    $("mo-ta-so-kim").textContent = cd === "thuong"
      ? MO_TA_SO_KIM[soKim]
      : "Chế độ này luôn dùng 1 kim chuẩn để đảm bảo rõ ràng từng nhịp trên sân khấu.";

    $("o-dot-bien").disabled = cd !== "thuong" || soKim > 1;
    $("o-sat-nut").disabled = soKim > 1;
    $("o-loai-trung").disabled = cd === "sinh-ton" || cd === "so-hai-chang";

    if (cd === "so-hai-chang") {
      var dsSo = dsSoKhaDung();
      var dsDau = window.VongQuay.layDauSoTuDanhSachSo(dsSo);
      if (dsSo.length < 2) {
        bao("canh-bao", "Chế độ Quay 300+ đại biểu cần ít nhất 2 đại biểu khả dụng trong danh sách chung (nạp tại trang Cổng trò chơi).");
      } else {
        bao("ok", "Sẵn sàng Quay 2 chặng số cho " + dsSo.length + " đại biểu khả dụng (" + dsDau.length + " đầu số trên đĩa Chặng 1).");
      }
    } else if (cd === "sinh-ton" && tt.muc.length > 12) {
      bao("canh-bao", "Chế độ Chung kết Sinh tồn khuyến nghị 4–6 đơn vị (tối đa 12) để giữ nhịp gọn trong 2–3 phút.");
    } else if (cd === "hai-nhip") {
      var nc = layNguoiChoiChung();
      var dv = window.VongQuay.layDonViTuDanhSach(nc);
      if (!nc.length || dv.length < 2) {
        bao("canh-bao", "Chế độ Quay 2 nhịp cần danh sách người chơi dùng chung có cột Đơn vị (nạp tại trang Cổng trò chơi).");
      } else {
        bao("ok", "Sẵn sàng Quay 2 nhịp với " + dv.length + " đơn vị và " + nc.length + " đại biểu trong danh sách chung.");
      }
    } else if (cd === "thuong" && soKim > 1 && conLaiThuong().length < soKim) {
      bao("canh-bao", "Cần ít nhất " + soKim + " ô còn trên vòng để quay đồng thời " + soKim + " kim.");
    }
  }

  function napDaLuu() {
    var d = window.LuuTru.doc(KHOA);
    if (d) {
      tt.muc = Array.isArray(d.muc) ? d.muc.filter(function (m) { return typeof m === "string" && m.trim(); }) : [];
      tt.ketQua = Array.isArray(d.ketQua) ? d.ketQua : [];
      tt.cauHinh = Object.assign({ loaiDaTrung: true, cheDo: "thuong", satNut: true, dotBien: false, soKim: 1 }, d.cauHinh || {});
    }
    if (!tt.muc.length) {
      var dv = window.VongQuay.layDonViTuDanhSach(layNguoiChoiChung());
      tt.muc = dv.length >= 2 ? dv : MAU_QUA.slice();
    }
    $("o-danh-sach-muc").value = tt.muc.join("\n");
    $("chon-che-do").value = cheDoHienTai();
    $("chon-so-kim").value = String(soKimHienTai());
    $("o-loai-trung").checked = tt.cauHinh.loaiDaTrung !== false;
    $("o-sat-nut").checked = tt.cauHinh.satNut !== false;
    $("o-dot-bien").checked = Boolean(tt.cauHinh.dotBien);
    var ten = window.LuuTru.docTenSuKien();
    document.querySelectorAll(".ten-su-kien").forEach(function (el) { el.textContent = ten; });
    kiemTraGoiYCheDo();
  }

  function luu() {
    window.LuuTru.ghi(KHOA, tt);
    capNhatTongKet();
  }

  function capNhatTongKet() {
    var cd = cheDoHienTai();
    var da = tt.ketQua.filter(function (k) { return k && k.trangThai !== "huy" && k.loai !== "dot-bien"; }).length;
    var tong = cd === "so-hai-chang" ? layNguoiChoiChung().length : tt.muc.length;
    var con = conLai().length;
    var toiThieu = cd === "thuong" ? Math.max(2, soKimHienTai()) : 2;
    $("so-tong").textContent = String(tong);
    $("so-con").textContent = String(con);
    $("so-da-quay").textContent = String(da);
    $("nut-vao").disabled = con < toiThieu;
  }

  function capNhatNhanSanKhau() {
    var cd = cheDoHienTai();
    var nhanCheDo = $("vq-che-do-nhan");
    var nhanHieuUng = $("vq-hieu-ung-nhan");
    nhanCheDo.className = "vq-nhan-che-do";

    if (cd === "so-hai-chang") {
      nhanCheDo.hidden = false;
      if (changSo === 2 && dauSoDangChon !== "") {
        nhanCheDo.classList.add("la-nhip-2");
        nhanCheDo.textContent = "CHẶNG 2 · SỐ CUỐI · ĐẦU SỐ " + dauSoDangChon + "_";
      } else {
        nhanCheDo.textContent = "CHẶNG 1 · ĐẦU SỐ (300+ ĐẠI BIỂU)";
      }
    } else if (cd === "hai-nhip") {
      nhanCheDo.hidden = false;
      if (nhipHienTai === 2 && donViDangChon) {
        nhanCheDo.classList.add("la-nhip-2");
        nhanCheDo.textContent = "NHỊP 2 · " + donViDangChon.toUpperCase();
      } else {
        nhanCheDo.textContent = "NHỊP 1 · CHỌN KHOA / PHÒNG";
      }
    } else if (cd === "sinh-ton") {
      var con = conLaiSinhTon().length;
      nhanCheDo.hidden = false;
      nhanCheDo.classList.add("la-sinh-ton");
      if (con === 2) nhanCheDo.textContent = "CHUNG KẾT GIẢI ĐẶC BIỆT · 50% – 50%";
      else if (con <= 1) nhanCheDo.textContent = "CHUNG KẾT GIẢI ĐẶC BIỆT · ĐÃ CHỐT QUÁN QUÂN";
      else nhanCheDo.textContent = "CHUNG KẾT GIẢI ĐẶC BIỆT · CÒN " + con + " ĐỘI";
    } else if (soKimHienTai() > 1) {
      nhanCheDo.hidden = false;
      nhanCheDo.textContent = "QUAY NHANH · " + soKimHienTai() + " KIM ĐỒNG THỜI";
    } else {
      nhanCheDo.hidden = true;
      nhanCheDo.textContent = "";
    }

    var dsHieuUng = [];
    if (heSoThuong === 2) dsHieuUng.push("×2 QUÀ LƯỢT NÀY");
    if (luotKepCon > 0) dsHieuUng.push("QUAY KÉP · CÒN " + luotKepCon + " LƯỢT PHỤ");
    if (dsHieuUng.length) {
      nhanHieuUng.hidden = false;
      nhanHieuUng.textContent = dsHieuUng.join(" · ");
    } else {
      nhanHieuUng.hidden = true;
      nhanHieuUng.textContent = "";
    }
  }

  function dinhDangNhanTicker(o) {
    if (!o) return "";
    var goc = o.goc || o;
    var cd = cheDoHienTai();
    if (cd === "so-hai-chang" && changSo === 2 && goc.so) {
      return "Số " + goc.so;
    }
    if (cd === "hai-nhip" && nhipHienTai === 2 && goc.nguoi) {
      return goc.nguoi.ten + (goc.nguoi.ma ? " · " + goc.nguoi.ma : "");
    }
    return String(goc.nhan || o.nhan || "");
  }

  function capNhatTicker(tenO, truoc, sau) {
    var el = $("vq-ticker-ten");
    el.textContent = tenO;
    if (truoc !== undefined) $("vq-ticker-truoc").textContent = truoc || "";
    if (sau !== undefined) $("vq-ticker-sau").textContent = sau || "";
    el.classList.remove("nhay");
    requestAnimationFrame(function () { el.classList.add("nhay"); });
  }

  function datSatNutTicker(bat) {
    var dangBat = Boolean(bat);
    $("vq-ticker").classList.toggle("sat-nut", dangBat);
    $("vq-ticker-sat-nut").hidden = !dangBat;
    $("man-san-khau").classList.toggle("dang-sat-nut", dangBat);
  }

  function datDotBienTicker(bat) {
    $("vq-ticker").classList.toggle("dot-bien", Boolean(bat));
  }

  function veLichSu() {
    var ol = $("vq-ds-kq");
    ol.textContent = "";
    tt.ketQua.slice().reverse().forEach(function (k, idx) {
      var li = document.createElement("li");
      if (k.trangThai === "huy") li.className = "da-huy";
      var stt = document.createElement("span");
      stt.className = "vq-stt";
      stt.textContent = "#" + (tt.ketQua.length - idx);

      var hop = document.createElement("div");
      hop.className = "vq-muc-hop";
      var ten = document.createElement("span");
      ten.className = "vq-muc";
      ten.textContent = k.muc || "";
      hop.appendChild(ten);

      var dongPhu = [];
      if (k.donVi) dongPhu.push(k.donVi);
      if (k.vaiTro === "quan-quan") dongPhu.push("Quán quân Giải Đặc Biệt");
      else if (k.vaiTro === "khuyen-khich") dongPhu.push("Quà đồng hành");
      else if (k.heSo === 2) dongPhu.push("×2 Quà");
      else if (k.loai === "dot-bien") dongPhu.push("Ô Đột biến");
      if (dongPhu.length) {
        var phu = document.createElement("span");
        phu.className = "vq-muc-phu";
        phu.textContent = dongPhu.join(" · ");
        hop.appendChild(phu);
      }

      var gio = document.createElement("span");
      gio.className = "vq-gio";
      gio.textContent = k.trangThai === "huy" ? "Đã hủy" : String(k.luc || "").split(" ")[0];
      li.append(stt, hop, gio);
      ol.appendChild(li);
    });
  }

  function capNhatNutQuay() {
    var cd = cheDoHienTai();
    var ban = (vong && vong.dangQuay()) || dangLatDia;
    var chuNut = "Quay vòng";
    var khoaNut = ban;
    var nutVe1 = $("nut-ve-nhip-1");

    if (cd === "so-hai-chang") {
      if (changSo === 2 && !choVeChang1) {
        chuNut = "Quay chốt số cuối";
        khoaNut = ban || danhSachSoCuoi.length === 0;
      } else {
        chuNut = choVeChang1 ? "Quay đại biểu tiếp" : "Quay chọn đầu số";
        khoaNut = ban || dsSoKhaDung().length === 0;
      }
      nutVe1.textContent = "Về Chặng 1 chọn đầu số";
      nutVe1.hidden = ban || changSo !== 2;
    } else if (cd === "hai-nhip") {
      if (nhipHienTai === 2 && !choVeNhip1) {
        chuNut = "Quay chốt đại biểu";
        khoaNut = ban || danhSachNhip2.length === 0;
      } else {
        chuNut = choVeNhip1 ? "Quay chọn khoa tiếp" : "Quay chọn khoa";
        khoaNut = ban || conLaiDonViHaiNhip().length === 0;
      }
      nutVe1.textContent = "Về Nhịp 1 chọn khoa";
      nutVe1.hidden = ban || nhipHienTai !== 2;
    } else if (cd === "sinh-ton") {
      var con = conLaiSinhTon().length;
      chuNut = con === 2 ? "Quay chung kết 50–50" : "Quay chốt Quà đồng hành";
      khoaNut = ban || con <= 1;
      nutVe1.hidden = true;
    } else {
      var soKim = soKimHienTai();
      if (soKim > 1) {
        chuNut = "Quay " + soKim + " kim đồng thời";
        khoaNut = ban || conLaiThuong().length < soKim;
      } else {
        chuNut = luotKepCon > 0 ? "Quay lượt phụ" : (heSoThuong === 2 ? "Quay lượt ×2 Quà" : "Quay vòng");
        khoaNut = ban || conLaiThuong().length === 0;
      }
      nutVe1.hidden = true;
    }

    $("nut-quay-chu").textContent = chuNut;
    $("nut-quay").disabled = khoaNut;
    $("nut-huy").hidden = !ketQuaHienTai || ban;
  }

  function capNhatSanKhau(boQuaNapVong) {
    var cd = cheDoHienTai();
    var dsVong = dsTrenVongHienTai();
    if (cd === "so-hai-chang") {
      if (changSo === 2) {
        $("sk-con").textContent = String(danhSachSoCuoi.length);
        $("sk-con-nhan").textContent = "số cuối của đầu " + dauSoDangChon + "_";
      } else {
        $("sk-con").textContent = String(dsSoKhaDung().length);
        $("sk-con-nhan").textContent = "đại biểu khả dụng";
      }
    } else if (cd === "hai-nhip" && nhipHienTai === 2) {
      $("sk-con").textContent = String(danhSachNhip2.length);
      $("sk-con-nhan").textContent = "đại biểu của " + donViDangChon;
    } else if (cd === "sinh-ton") {
      $("sk-con").textContent = String(conLaiSinhTon().length);
      $("sk-con-nhan").textContent = "đội tranh Giải Đặc Biệt";
    } else {
      $("sk-con").textContent = String(conLai().length);
      $("sk-con-nhan").textContent = "ô còn trên vòng";
    }

    if (vong) {
      vong.datSoKim(soKimHienTai());
      if (boQuaNapVong) {
        vong.datTrangThaiTruc(layNhanTrucTam(dsVong));
      } else {
        vong.datMuc(dsVong, { trangThaiTruc: layNhanTrucTam(dsVong) });
      }
    }
    capNhatNhanSanKhau();
    capNhatNutQuay();
    veLichSu();
  }

  function latDia3D(sauKhiUp, sauKhiMo) {
    var khung = $("vq-khung-lat");
    dangLatDia = true;
    capNhatNutQuay();
    if (window.AmThanh && window.AmThanh.moManh) window.AmThanh.moManh();

    khung.classList.remove("dang-lat-vao", "dang-mo-ra");
    khung.classList.add("dang-lat-ra");

    henGio(function () {
      if (sauKhiUp) sauKhiUp();
      khung.classList.remove("dang-lat-ra");
      khung.classList.add("dang-lat-vao");

      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          khung.classList.remove("dang-lat-vao");
          khung.classList.add("dang-mo-ra");
          henGio(function () {
            khung.classList.remove("dang-mo-ra");
            dangLatDia = false;
            capNhatNutQuay();
            if (sauKhiMo) sauKhiMo();
          }, 260);
        });
      });
    }, 180);
  }

  function veNhipMot(tuDongQuay) {
    if ((vong && vong.dangQuay()) || dangLatDia) return;
    xoaHenGio();
    $("vq-vinh-danh").hidden = true;
    $("man-san-khau").classList.remove("dang-thang", "dang-sat-nut");
    datSatNutTicker(false);
    datDotBienTicker(false);
    latDia3D(function () {
      nhipHienTai = 1;
      donViDangChon = "";
      danhSachNhip2 = [];
      choVeNhip1 = false;
      capNhatSanKhau();
      capNhatTicker("Sẵn sàng chọn khoa", "", "");
      $("vq-kq-chu").textContent = "Nhịp 1 · Chọn Khoa";
      $("vq-kq-phu").textContent = "Bấm Space hoặc nút Quay chọn khoa để bắt đầu";
      $("vq-ket-qua").classList.remove("trung");
    }, function () {
      if (tuDongQuay) quay();
    });
  }

  function veChangMot(tuDongQuay) {
    if ((vong && vong.dangQuay()) || dangLatDia) return;
    xoaHenGio();
    $("vq-vinh-danh").hidden = true;
    $("man-san-khau").classList.remove("dang-thang", "dang-sat-nut");
    datSatNutTicker(false);
    datDotBienTicker(false);
    latDia3D(function () {
      changSo = 1;
      daiBieuDich = null;
      dauSoDangChon = "";
      danhSachSoCuoi = [];
      choVeChang1 = false;
      capNhatSanKhau();
      capNhatTicker("Sẵn sàng quay Chặng 1 · Chọn đầu số", "", "");
      $("vq-kq-chu").textContent = "Chặng 1 · Chọn đầu số";
      $("vq-kq-phu").textContent = "Bấm Space hoặc nút Quay chọn đầu số để bắt đầu";
      $("vq-ket-qua").classList.remove("trung");
    }, function () {
      if (tuDongQuay) quay();
    });
  }

  function vaoSanKhau() {
    if ($("nut-vao").disabled) return;
    xoaHenGio();
    window.AmThanh.moKhoa();
    giaiDoan = "san-khau";
    nhipHienTai = 1;
    donViDangChon = "";
    danhSachNhip2 = [];
    choVeNhip1 = false;
    changSo = 1;
    daiBieuDich = null;
    dauSoDangChon = "";
    danhSachSoCuoi = [];
    choVeChang1 = false;
    dangLatDia = false;
    heSoThuong = 1;
    luotKepCon = 0;

    $("man-chuan-bi").hidden = true;
    $("man-san-khau").hidden = false;
    $("man-san-khau").classList.remove("dang-quay", "dang-sat-nut", "dang-thang");
    $("vq-vinh-danh").hidden = true;
    datSatNutTicker(false);
    datDotBienTicker(false);

    if (!vong) {
      vong = window.VeVong.tao($("vong-canvas"), window.AmThanh, function (tenO, objO, oKe) {
        var giua = dinhDangNhanTicker(objO || { nhan: tenO });
        var truoc = oKe && oKe.truoc ? dinhDangNhanTicker(oKe.truoc) : "";
        var sau = oKe && oKe.sau ? dinhDangNhanTicker(oKe.sau) : "";
        capNhatTicker(giua || tenO, truoc, sau);
      });
    }
    ketQuaHienTai = null;
    $("vq-ket-qua").classList.remove("trung");
    var cd = cheDoHienTai();
    $("vq-kq-chu").textContent = cd === "so-hai-chang" ? "Chặng 1 · Chọn đầu số" : "Sẵn sàng quay";
    $("vq-kq-phu").textContent = "Bấm Space hoặc nút Quay vòng để bắt đầu";
    capNhatTicker(cd === "so-hai-chang" ? "Sẵn sàng quay Chặng 1 · Chọn đầu số" : "Sẵn sàng quay", "", "");
    capNhatSanKhau();
  }

  function veChuanBi() {
    if ((vong && vong.dangQuay()) || dangLatDia) return;
    if (!$("vq-vinh-danh").hidden) { $("vq-vinh-danh").hidden = true; return; }
    xoaHenGio();
    if (vong) vong.dung();
    $("man-san-khau").classList.remove("dang-quay", "dang-sat-nut", "dang-thang");
    datSatNutTicker(false);
    datDotBienTicker(false);
    giaiDoan = "chuan-bi";
    $("man-san-khau").hidden = true;
    $("man-chuan-bi").hidden = false;
    capNhatTongKet();
    kiemTraGoiYCheDo();
  }

  function moBangVinhDanh(thongTin) {
    var the = $("vq-vd-the");
    the.classList.remove("la-quan-quan", "la-dot-bien");
    if (thongTin.lop) the.classList.add(thongTin.lop);

    $("vq-vd-nhan").textContent = thongTin.nhan || "Chúc mừng kết quả lượt quay";
    var capTren = $("vq-vd-cap-tren");
    if (thongTin.capTren) {
      capTren.hidden = false;
      capTren.textContent = thongTin.capTren;
    } else {
      capTren.hidden = true;
      capTren.textContent = "";
    }

    var elTen = $("vq-vd-ten");
    var elDaKim = $("vq-vd-da-kim");
    elDaKim.textContent = "";
    if (Array.isArray(thongTin.dsDaKim) && thongTin.dsDaKim.length > 1) {
      elTen.hidden = true;
      elTen.textContent = "";
      elDaKim.hidden = false;
      thongTin.dsDaKim.forEach(function (tenKim, idx) {
        var theKim = document.createElement("div");
        theKim.className = "vq-vd-kim-the";
        var nhanKim = document.createElement("span");
        nhanKim.className = "vq-vd-kim-so kim-" + (idx + 1);
        nhanKim.textContent = "KIM " + (idx + 1);
        var chuKim = document.createElement("p");
        chuKim.className = "vq-vd-kim-ten";
        chuKim.textContent = tenKim;
        theKim.append(nhanKim, chuKim);
        elDaKim.appendChild(theKim);
      });
    } else {
      elDaKim.hidden = true;
      elTen.hidden = false;
      elTen.textContent = thongTin.ten || "";
    }

    $("vq-vd-phu").textContent = thongTin.phu || "";
    $("nut-vd-tiep-chu").textContent = thongTin.chuNutTiep || "Quay lượt tiếp";
    $("nut-vd-tiep").disabled = Boolean(thongTin.khoaNutTiep);
    $("nut-vd-huy").hidden = Boolean(thongTin.anNutHuy);
    $("vq-vinh-danh").hidden = false;
  }

  function timNguoiTrungTruoc() {
    for (var i = tt.ketQua.length - 1; i >= 0; i -= 1) {
      var k = tt.ketQua[i];
      if (k && k.trangThai !== "huy" && k.loai !== "dot-bien") return k.muc;
    }
    return "";
  }

  function chotKetQuaDaKim(dsOTrung) {
    var luc = lucHienTai();
    var tenSuKien = window.LuuTru.docTenSuKien();
    var nhomId = taoId();
    var dsTen = [];
    var kqCuoi = null;

    dsOTrung.forEach(function (o, idx) {
      var kq = {
        id: taoId(),
        nhomId: nhomId,
        muc: o.nhan,
        cheDo: "thuong",
        loai: "thuong",
        ghiChu: "Kim " + (idx + 1) + "/" + dsOTrung.length,
        luc: luc,
        trangThai: "trung",
      };
      tt.ketQua.push(kq);
      dsTen.push(o.nhan);
      kqCuoi = kq;
    });

    ketQuaHienTai = kqCuoi;
    luu();

    $("vq-ket-qua").classList.add("trung");
    $("vq-kq-chu").textContent = dsTen.join(" · ");
    $("vq-kq-phu").textContent = "Chốt đồng thời " + dsTen.length + " kim · " + luc;
    capNhatTicker(dsTen.join(" · "), "", "");
    capNhatSanKhau(true);

    henGio(function () {
      window.AmThanh.trung(true);
      window.Phao.banHaiBen($("phao-vong"), 1.7);
    }, 220);

    henGio(function () {
      if (giaiDoan !== "san-khau" || !ketQuaHienTai || ketQuaHienTai.id !== kqCuoi.id) return;
      moBangVinhDanh({
        nhan: "CHÚC MỪNG " + dsTen.length + " KẾT QUẢ ĐỒNG THỜI",
        dsDaKim: dsTen,
        phu: tenSuKien + " · " + luc,
        chuNutTiep: "Quay lượt tiếp",
        khoaNutTiep: conLaiThuong().length < soKimHienTai(),
      });
    }, 1250);
  }

  function chotKetQuaThuong(oTrung) {
    var luc = lucHienTai();
    var tenSuKien = window.LuuTru.docTenSuKien();

    if (oTrung.loai === "dot-bien") {
      var chiDanMc = "";
      if (oTrung.maDotBien === "nhan-doi") {
        heSoThuong = 2;
        chiDanMc = "Lượt kế tiếp nhận 2 suất quà";
      } else if (oTrung.maDotBien === "tang-ban") {
        var nguoiTruoc = timNguoiTrungTruoc();
        chiDanMc = nguoiTruoc
          ? "Mời " + nguoiTruoc + " tặng thêm 1 phần quà cho đồng nghiệp ngồi cạnh"
          : "Lượt kế tiếp tặng kèm 1 phần quà cho đồng nghiệp ngồi cạnh";
      } else if (oTrung.maDotBien === "quay-kep") {
        luotKepCon += 1;
        chiDanMc = "Tặng thêm 1 lượt quay phụ";
      }

      var kqDb = {
        id: taoId(),
        muc: oTrung.nhan,
        cheDo: "thuong",
        loai: "dot-bien",
        maDotBien: oTrung.maDotBien,
        ghiChu: chiDanMc,
        luc: luc,
        trangThai: "trung",
      };
      tt.ketQua.push(kqDb);
      ketQuaHienTai = kqDb;
      luu();

      datDotBienTicker(true);
      capNhatTicker(kqDb.muc + " — " + chiDanMc, "", "");
      $("vq-ket-qua").classList.add("trung");
      $("vq-kq-chu").textContent = kqDb.muc;
      $("vq-kq-phu").textContent = chiDanMc;
      capNhatSanKhau(true);

      henGio(function () {
        window.AmThanh.trung(true);
        window.Phao.banHaiBen($("phao-vong"), 1.5);
      }, 220);

      henGio(function () {
        if (giaiDoan !== "san-khau" || !ketQuaHienTai || ketQuaHienTai.id !== kqDb.id) return;
        moBangVinhDanh({
          lop: "la-dot-bien",
          nhan: "Ô ĐỘT BIẾN SÂN KHẤU",
          capTren: "LỆNH DÀNH CHO MC",
          ten: kqDb.muc,
          phu: chiDanMc,
          chuNutTiep: "Quay lượt kế tiếp",
          khoaNutTiep: conLaiThuong().length === 0,
        });
      }, 1300);
      return;
    }

    var heSoLuot = heSoThuong;
    heSoThuong = 1;
    if (luotKepCon > 0) luotKepCon -= 1;

    var kq = {
      id: taoId(),
      muc: oTrung.nhan,
      cheDo: "thuong",
      loai: "thuong",
      heSo: heSoLuot,
      ghiChu: heSoLuot === 2 ? "Nhân đôi phần quà (×2)" : "",
      luc: luc,
      trangThai: "trung",
    };
    tt.ketQua.push(kq);
    ketQuaHienTai = kq;
    luu();

    $("vq-ket-qua").classList.add("trung");
    $("vq-kq-chu").textContent = kq.muc;
    $("vq-kq-phu").textContent = (heSoLuot === 2 ? "×2 Quà · " : "") + "Lượt " + tt.ketQua.length + " · " + kq.luc;
    capNhatSanKhau(true);

    henGio(function () {
      window.AmThanh.trung(true);
      window.Phao.banHaiBen($("phao-vong"), heSoLuot === 2 ? 1.85 : 1.5);
    }, 220);

    henGio(function () {
      if (giaiDoan !== "san-khau" || !ketQuaHienTai || ketQuaHienTai.id !== kq.id) return;
      moBangVinhDanh({
        nhan: "Chúc mừng kết quả lượt quay",
        capTren: heSoLuot === 2 ? "NHÂN ĐÔI PHẦN QUÀ (×2)" : "",
        ten: kq.muc,
        phu: tenSuKien + " · Lượt " + tt.ketQua.length + " · " + kq.luc,
        chuNutTiep: luotKepCon > 0 ? "Quay lượt phụ" : "Quay lượt tiếp",
        khoaNutTiep: conLaiThuong().length === 0,
      });
    }, 1300);
  }

  function chotDaiBieuSoHaiChang(nguoi, ghiChuThem) {
    var luc = lucHienTai();
    var tenSuKien = window.LuuTru.docTenSuKien();
    var nhanDayDu = "Số " + nguoi.so + " · " + nguoi.ten + (nguoi.ma ? " (" + nguoi.ma + ")" : "");
    var chiTietPhu = [];
    chiTietPhu.push("STT " + nguoi.so);
    if (nguoi.ma) chiTietPhu.push("Mã " + nguoi.ma);
    if (nguoi.donVi) chiTietPhu.push(nguoi.donVi);

    var kq = {
      id: taoId(),
      muc: nhanDayDu,
      soThuTu: nguoi.so,
      ten: nguoi.ten,
      ma: nguoi.ma,
      donVi: nguoi.donVi,
      cheDo: "so-hai-chang",
      loai: "so-hai-chang",
      ghiChu: ghiChuThem || ("STT " + nguoi.so + (nguoi.ma ? " · " + nguoi.ma : "")),
      luc: luc,
      trangThai: "trung",
    };
    tt.ketQua.push(kq);
    ketQuaHienTai = kq;
    choVeChang1 = true;
    daiBieuDich = null;
    luu();

    capNhatTicker("Số " + nguoi.so + " · " + nguoi.ten, "", "");
    $("vq-ket-qua").classList.add("trung");
    $("vq-kq-chu").textContent = nguoi.ten;
    $("vq-kq-phu").textContent = chiTietPhu.join(" · ");
    capNhatSanKhau(true);

    henGio(function () {
      window.AmThanh.trung(true);
      window.Phao.banHaiBen($("phao-vong"), 1.65);
    }, 220);

    henGio(function () {
      if (giaiDoan !== "san-khau" || !ketQuaHienTai || ketQuaHienTai.id !== kq.id) return;
      moBangVinhDanh({
        nhan: "CHÚC MỪNG ĐẠI BIỂU MAY MẮN",
        capTren: "SỐ " + nguoi.so + (nguoi.donVi ? " · " + nguoi.donVi : ""),
        ten: nguoi.ten + (nguoi.ma ? " · " + nguoi.ma : ""),
        phu: (ghiChuThem ? ghiChuThem + " · " : "") + tenSuKien + " · " + kq.luc,
        chuNutTiep: "Quay đại biểu tiếp",
        khoaNutTiep: dsSoKhaDung().length === 0,
      });
    }, 1250);
  }

  function chotKetQuaSoHaiChang(oTrung) {
    if (changSo === 1) {
      var dauSo = daiBieuDich ? daiBieuDich.dauSo : oTrung.dauSo;
      var dsSo = dsSoKhaDung();
      var dsCuoi = window.VongQuay.laySoCuoiTheoDauSo(dsSo, dauSo);
      dauSoDangChon = dauSo;

      capNhatTicker("CHỐT ĐẦU SỐ: " + dauSo + "_ · Đang mở " + dsCuoi.length + " số cuối…", "", "");
      $("vq-ket-qua").classList.add("trung");
      $("vq-kq-chu").textContent = "Đầu số " + dauSo + "_";
      $("vq-kq-phu").textContent = dsCuoi.length
        ? "Đã chốt Chặng 1 · Đang mở " + dsCuoi.length + " số cuối…"
        : "Không còn đại biểu khả dụng ở đầu số này.";

      henGio(function () {
        window.AmThanh.trung(false);
        window.Phao.banHaiBen($("phao-vong"), 0.85);
      }, 220);

      if (!dsCuoi.length) {
        capNhatSanKhau(true);
        return;
      }

      henGio(function () {
        if (giaiDoan !== "san-khau") return;
        $("man-san-khau").classList.remove("dang-thang");
        latDia3D(function () {
          changSo = 2;
          danhSachSoCuoi = dsCuoi;
          choVeChang1 = false;
          capNhatSanKhau();
          capNhatTicker("Chặng 2 · Đầu số " + dauSoDangChon + "_ · Chọn số cuối", "", "");
          $("vq-kq-chu").textContent = "Đầu số " + dauSoDangChon + "_";
          $("vq-kq-phu").textContent = dsCuoi.length === 1
            ? "Chỉ còn 1 đại biểu duy nhất ở đầu số " + dauSoDangChon + "_"
            : "Đã nạp " + dsCuoi.length + " số cuối · Bấm Space để chốt đích danh!";
        }, function () {
          if (dsCuoi.length === 1) {
            $("man-san-khau").classList.add("dang-thang");
            chotDaiBieuSoHaiChang(dsCuoi[0].nguoi, "Số cuối duy nhất của đầu số " + dauSoDangChon + "_");
          }
        });
      }, 950);
      return;
    }

    var nguoiChot = daiBieuDich || (oTrung && oTrung.nguoi);
    if (nguoiChot) chotDaiBieuSoHaiChang(nguoiChot, "");
  }

  function chotDaiBieuNhip2(nguoi, ghiChuThem) {
    var luc = lucHienTai();
    var tenSuKien = window.LuuTru.docTenSuKien();
    var nhanTen = nguoi.ma ? nguoi.ten + " (" + nguoi.ma + ")" : nguoi.ten;
    var kq = {
      id: taoId(),
      muc: nhanTen,
      ten: nguoi.ten,
      ma: nguoi.ma,
      donVi: donViDangChon,
      cheDo: "hai-nhip",
      loai: "hai-nhip",
      ghiChu: ghiChuThem || ("Nhịp 1: " + donViDangChon),
      luc: luc,
      trangThai: "trung",
    };
    tt.ketQua.push(kq);
    ketQuaHienTai = kq;
    choVeNhip1 = true;
    luu();

    capNhatTicker(nguoi.ten + (nguoi.ma ? " · " + nguoi.ma : ""), "", "");
    $("vq-ket-qua").classList.add("trung");
    $("vq-kq-chu").textContent = nguoi.ten;
    $("vq-kq-phu").textContent = donViDangChon + (nguoi.ma ? " · Mã " + nguoi.ma : "");
    capNhatSanKhau(true);

    henGio(function () {
      window.AmThanh.trung(true);
      window.Phao.banHaiBen($("phao-vong"), 1.6);
    }, 220);

    henGio(function () {
      if (giaiDoan !== "san-khau" || !ketQuaHienTai || ketQuaHienTai.id !== kq.id) return;
      moBangVinhDanh({
        nhan: "CHÚC MỪNG ĐẠI BIỂU MAY MẮN",
        capTren: donViDangChon,
        ten: nguoi.ten + (nguoi.ma ? " · " + nguoi.ma : ""),
        phu: (ghiChuThem ? ghiChuThem + " · " : "") + tenSuKien + " · " + kq.luc,
        chuNutTiep: "Quay chọn khoa tiếp",
        khoaNutTiep: conLaiDonViHaiNhip().length === 0,
      });
    }, 1300);
  }

  function chotKetQuaHaiNhip(oTrung) {
    if (nhipHienTai === 1) {
      donViDangChon = oTrung.nhan;
      var dsNguoi = nguoiConLaiTrongKhoa(donViDangChon);

      $("vq-ket-qua").classList.add("trung");
      $("vq-kq-chu").textContent = donViDangChon;
      $("vq-kq-phu").textContent = dsNguoi.length
        ? "Đã chốt Nhịp 1 · Đang lật đĩa nạp " + dsNguoi.length + " đại biểu…"
        : "Không tìm thấy đại biểu khả dụng thuộc khoa này trong danh sách chung.";

      henGio(function () {
        window.AmThanh.trung(false);
        window.Phao.banHaiBen($("phao-vong"), 0.9);
      }, 220);

      if (!dsNguoi.length) {
        capNhatSanKhau(true);
        return;
      }

      henGio(function () {
        if (giaiDoan !== "san-khau") return;
        $("man-san-khau").classList.remove("dang-thang");
        latDia3D(function () {
          nhipHienTai = 2;
          danhSachNhip2 = dsNguoi;
          choVeNhip1 = false;
          capNhatSanKhau();
          capNhatTicker("Nhịp 2 · " + donViDangChon, "", "");
          $("vq-kq-chu").textContent = donViDangChon;
          $("vq-kq-phu").textContent = dsNguoi.length === 1
            ? "Đại biểu duy nhất còn lại của " + donViDangChon
            : "Đã nạp " + dsNguoi.length + " đại biểu · Bấm Space để chốt người nhận quà!";
        }, function () {
          if (dsNguoi.length === 1) {
            $("man-san-khau").classList.add("dang-thang");
            chotDaiBieuNhip2(dsNguoi[0], "Đại biểu duy nhất còn lại của " + donViDangChon);
          }
        });
      }, 1100);
      return;
    }

    var nguoi = oTrung.nguoi || { ten: oTrung.nhan, ma: "" };
    chotDaiBieuNhip2(nguoi, "");
  }

  function chotKetQuaSinhTon(oTrung) {
    var luc = lucHienTai();
    var tenSuKien = window.LuuTru.docTenSuKien();
    var doiDongHanh = oTrung.nhan;
    var idDongHanh = taoId();
    var conTruoc = conLaiSinhTon().length;

    var kqDongHanh = {
      id: idDongHanh,
      muc: doiDongHanh,
      cheDo: "sinh-ton",
      loai: "sinh-ton",
      vaiTro: "khuyen-khich",
      ghiChu: "Quà đồng hành (còn " + Math.max(0, conTruoc - 1) + " đội vào Chung kết Giải Đặc Biệt)",
      luc: luc,
      trangThai: "trung",
    };
    tt.ketQua.push(kqDongHanh);

    var conSau = conLaiSinhTon();
    if (conSau.length === 1) {
      var quanQuan = conSau[0];
      var kqQuanQuan = {
        id: taoId(),
        capId: idDongHanh,
        muc: quanQuan,
        cheDo: "sinh-ton",
        loai: "sinh-ton",
        vaiTro: "quan-quan",
        ghiChu: "Quán quân Chung kết Giải Đặc Biệt",
        luc: luc,
        trangThai: "trung",
      };
      tt.ketQua.push(kqQuanQuan);
      ketQuaHienTai = kqQuanQuan;
      luu();

      capNhatTicker("QUÁN QUÂN GIẢI ĐẶC BIỆT: " + quanQuan, "", "");
      $("vq-ket-qua").classList.add("trung");
      $("vq-kq-chu").textContent = quanQuan;
      $("vq-kq-phu").textContent = "QUÁN QUÂN GIẢI ĐẶC BIỆT · " + doiDongHanh + " nhận Quà đồng hành";
      capNhatSanKhau(true);

      henGio(function () {
        window.AmThanh.trung(true);
        window.Phao.banHaiBen($("phao-vong"), 2.0);
      }, 220);

      henGio(function () {
        if (giaiDoan !== "san-khau" || !ketQuaHienTai || ketQuaHienTai.id !== kqQuanQuan.id) return;
        moBangVinhDanh({
          lop: "la-quan-quan",
          nhan: "QUÁN QUÂN CHUNG KẾT GIẢI ĐẶC BIỆT",
          capTren: "ĐỘI TRỤ LẠI SAU CÙNG",
          ten: quanQuan,
          phu: doiDongHanh + " nhận Quà đồng hành · " + tenSuKien,
          chuNutTiep: "Đã hoàn tất chung kết",
          khoaNutTiep: true,
        });
      }, 1300);
      return;
    }

    // Còn >= 2 đội: KHÔNG bật lớp phủ #vq-vinh-danh; cập nhật bảng phải + Ticker rồi lật đĩa phình nan dần
    ketQuaHienTai = kqDongHanh;
    luu();

    capNhatTicker("CHỐT QUÀ ĐỒNG HÀNH: " + doiDongHanh + " · Còn " + conSau.length + " đội", "", "");
    $("vq-ket-qua").classList.add("trung");
    $("vq-kq-chu").textContent = doiDongHanh;
    $("vq-kq-phu").textContent = "CHỐT QUÀ ĐỒNG HÀNH · Còn " + conSau.length + " đội vào Chung kết Giải Đặc Biệt";
    capNhatSanKhau(true);

    henGio(function () {
      window.AmThanh.trung(false);
      window.Phao.banHaiBen($("phao-vong"), 0.85);
    }, 220);

    henGio(function () {
      if (giaiDoan !== "san-khau" || !ketQuaHienTai || ketQuaHienTai.id !== kqDongHanh.id) return;
      $("man-san-khau").classList.remove("dang-thang");
      latDia3D(function () {
        capNhatSanKhau();
        var tieuDeKe = conSau.length === 2
          ? "TRẬN CHUNG KẾT 50–50 · " + conSau[0] + " vs " + conSau[1]
          : "Còn " + conSau.length + " đội tranh Giải Đặc Biệt · Bấm Space để quay tiếp";
        capNhatTicker(tieuDeKe, "", "");
      });
    }, 1250);
  }

  function quay() {
    if (!vong || vong.dangQuay() || dangLatDia) return;
    var cd = cheDoHienTai();

    if (cd === "so-hai-chang" && choVeChang1) {
      if (!dsSoKhaDung().length) {
        window.alert("Không còn đại biểu khả dụng trong danh sách chung.");
        return;
      }
      veChangMot(true);
      return;
    }

    if (cd === "hai-nhip" && choVeNhip1) {
      if (!conLaiDonViHaiNhip().length) {
        window.alert("Không còn đơn vị nào trên vòng quay.");
        return;
      }
      veNhipMot(true);
      return;
    }

    xoaHenGio();
    $("vq-vinh-danh").hidden = true;
    var dsVong = dsTrenVongHienTai();
    if (!dsVong.length) {
      window.alert("Không còn ô nào trên vòng quay.");
      return;
    }
    if (cd === "sinh-ton" && dsVong.length <= 1) {
      window.alert("Chung kết Giải Đặc Biệt đã có Quán quân. Xóa lịch sử để bắt đầu lượt mới.");
      return;
    }

    var soKim = soKimHienTai();
    if (cd === "thuong" && soKim > 1 && dsVong.length < soKim) {
      window.alert("Cần ít nhất " + soKim + " ô còn trên vòng để quay " + soKim + " kim đồng thời.");
      return;
    }

    var chiSoDich = -1;
    var oDich = null;

    if (cd === "so-hai-chang") {
      if (changSo === 1) {
        var dsSo = dsSoKhaDung();
        var chonNguoi = window.VongQuay.bocMuc(dsSo);
        if (!chonNguoi) return;
        daiBieuDich = chonNguoi.muc;
        for (var i = 0; i < dsVong.length; i += 1) {
          if (dsVong[i].dauSo === daiBieuDich.dauSo) {
            chiSoDich = i;
            oDich = dsVong[i];
            break;
          }
        }
        if (chiSoDich < 0) return;
      } else {
        if (daiBieuDich) {
          for (var j = 0; j < dsVong.length; j += 1) {
            if (dsVong[j].so === daiBieuDich.so) {
              chiSoDich = j;
              oDich = dsVong[j];
              break;
            }
          }
        }
        if (chiSoDich < 0) {
          var chonCuoi = window.VongQuay.bocMuc(dsVong);
          if (!chonCuoi) return;
          chiSoDich = chonCuoi.chiSo;
          oDich = chonCuoi.muc;
          daiBieuDich = oDich.nguoi || null;
        }
      }
    } else {
      var chon = window.VongQuay.bocMuc(dsVong);
      if (!chon) return;
      chiSoDich = chon.chiSo;
      oDich = chon.muc;
    }

    ketQuaHienTai = null;
    datSatNutTicker(false);
    datDotBienTicker(false);
    $("vq-ket-qua").classList.remove("trung");
    if (cd === "so-hai-chang") {
      $("vq-kq-chu").textContent = changSo === 2 ? "Đang chốt số cuối…" : "Đang quay chọn đầu số…";
      $("vq-kq-phu").textContent = changSo === 2 ? "Đầu số " + dauSoDangChon + "_" : "Toàn bộ đại biểu danh sách chung";
    } else {
      $("vq-kq-chu").textContent = cd === "sinh-ton" && dsVong.length <= 3 ? "Đang quay chung kết…" : "Đang quay…";
      $("vq-kq-phu").textContent = cd === "hai-nhip" && nhipHienTai === 2 ? donViDangChon : "";
    }
    $("man-san-khau").classList.remove("dang-thang", "dang-sat-nut");
    $("man-san-khau").classList.add("dang-quay");
    $("nut-quay").disabled = true;
    $("nut-huy").hidden = true;
    $("nut-ve-nhip-1").hidden = true;

    vong.datSoKim(soKim);
    vong.datMuc(dsVong, { trangThaiTruc: layNhanTrucTam(dsVong) });

    var tuyChonQuay = {
      soKim: soKim,
      satNut: soKim === 1 && tt.cauHinh.satNut !== false,
      onPhaSatNut: function () {
        datSatNutTicker(true);
      },
    };
    if (cd === "sinh-ton") {
      if (dsVong.length <= 3) {
        tuyChonQuay.tongThoiGian = 6500;
        if (window.AmThanh && window.AmThanh.trongDon) window.AmThanh.trongDon(1100);
      } else {
        tuyChonQuay.tongThoiGian = 3200;
        tuyChonQuay.soVong = 5;
      }
    } else if (cd === "so-hai-chang" && changSo === 1) {
      tuyChonQuay.tongThoiGian = 5400;
    }

    vong.quayToi(chiSoDich, tuyChonQuay).then(function (kqQuay) {
      if (giaiDoan !== "san-khau") return;
      $("man-san-khau").classList.remove("dang-quay", "dang-sat-nut");
      $("man-san-khau").classList.add("dang-thang");
      datSatNutTicker(false);

      if (cd === "so-hai-chang") {
        chotKetQuaSoHaiChang(oDich);
      } else if (cd === "hai-nhip") {
        chotKetQuaHaiNhip(oDich);
      } else if (cd === "sinh-ton") {
        chotKetQuaSinhTon(oDich);
      } else if (soKim > 1 && kqQuay && Array.isArray(kqQuay.cacChiSo) && kqQuay.cacChiSo.length > 1) {
        var dsTrung = kqQuay.cacChiSo.map(function (idx) { return dsVong[idx]; }).filter(Boolean);
        chotKetQuaDaKim(dsTrung);
      } else {
        chotKetQuaThuong(oDich);
      }
    });
  }

  function huyKetQua() {
    if (!ketQuaHienTai || (vong && vong.dangQuay()) || dangLatDia) return;
    if (!window.confirm("Hủy kết quả \"" + ketQuaHienTai.muc + "\"?")) return;
    xoaHenGio();
    var idHuy = ketQuaHienTai.id;
    var capIdHuy = ketQuaHienTai.capId || null;
    var nhomIdHuy = ketQuaHienTai.nhomId || null;

    tt.ketQua = tt.ketQua.map(function (k) {
      if (k.id === idHuy || (capIdHuy && k.id === capIdHuy) || (nhomIdHuy && k.nhomId === nhomIdHuy)) {
        return Object.assign({}, k, { trangThai: "huy" });
      }
      return k;
    });

    var cd = cheDoHienTai();
    if (cd === "hai-nhip" && nhipHienTai === 2 && donViDangChon) {
      danhSachNhip2 = nguoiConLaiTrongKhoa(donViDangChon);
      choVeNhip1 = false;
    } else if (cd === "so-hai-chang" && changSo === 2 && dauSoDangChon !== "") {
      danhSachSoCuoi = window.VongQuay.laySoCuoiTheoDauSo(dsSoKhaDung(), dauSoDangChon);
      choVeChang1 = false;
      daiBieuDich = null;
    }

    ketQuaHienTai = null;
    $("vq-vinh-danh").hidden = true;
    $("man-san-khau").classList.remove("dang-thang", "dang-sat-nut");
    datSatNutTicker(false);
    datDotBienTicker(false);
    luu();
    $("vq-ket-qua").classList.remove("trung");
    $("vq-kq-chu").textContent = "Đã hủy kết quả vừa quay";
    $("vq-kq-phu").textContent = "";
    capNhatSanKhau();
  }

  function toanManHinh() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(function () {});
    else document.exitFullscreen();
  }

  function ganSuKien() {
    $("o-danh-sach-muc").addEventListener("input", function () {
      tt.muc = window.VongQuay.docMucTuVanBan($("o-danh-sach-muc").value);
      luu();
      kiemTraGoiYCheDo();
    });
    $("nut-lay-don-vi").addEventListener("click", function () {
      var dv = window.VongQuay.layDonViTuDanhSach(layNguoiChoiChung());
      if (dv.length < 2) {
        bao("canh-bao", "Danh sách người chơi chung chưa có đủ từ 2 đơn vị trở lên. Nạp danh sách ở trang chủ trước.");
        return;
      }
      tt.muc = dv;
      $("o-danh-sach-muc").value = dv.join("\n");
      luu();
      bao("ok", "Đã nạp " + dv.length + " đơn vị từ danh sách chung.");
    });
    $("nut-mau-qua").addEventListener("click", function () {
      tt.muc = MAU_QUA.slice();
      $("o-danh-sach-muc").value = tt.muc.join("\n");
      luu();
      bao("ok", "Đã nạp " + tt.muc.length + " phần thưởng mẫu.");
    });
    $("nut-mau-khu").addEventListener("click", function () {
      tt.muc = MAU_KHU.slice();
      $("o-danh-sach-muc").value = tt.muc.join("\n");
      luu();
      bao("ok", "Đã nạp " + tt.muc.length + " khu vực hội trường.");
    });

    $("chon-che-do").addEventListener("change", function () {
      tt.cauHinh.cheDo = $("chon-che-do").value;
      luu();
      kiemTraGoiYCheDo();
    });
    $("chon-so-kim").addEventListener("change", function () {
      var k = Number($("chon-so-kim").value);
      tt.cauHinh.soKim = (k === 2 || k === 3) ? k : 1;
      luu();
      kiemTraGoiYCheDo();
    });
    $("o-loai-trung").addEventListener("change", function () {
      tt.cauHinh.loaiDaTrung = $("o-loai-trung").checked;
      luu();
    });
    $("o-sat-nut").addEventListener("change", function () {
      tt.cauHinh.satNut = $("o-sat-nut").checked;
      luu();
    });
    $("o-dot-bien").addEventListener("change", function () {
      tt.cauHinh.dotBien = $("o-dot-bien").checked;
      luu();
    });
    $("o-am-thanh").addEventListener("change", function () {
      if ($("o-am-thanh").checked !== window.AmThanh.dangBat()) window.AmThanh.batTat();
    });

    $("nut-vao").addEventListener("click", vaoSanKhau);
    $("nut-ve").addEventListener("click", veChuanBi);
    $("nut-quay").addEventListener("click", quay);
    $("nut-ve-nhip-1").addEventListener("click", function () {
      if (cheDoHienTai() === "so-hai-chang") veChangMot(false);
      else veNhipMot(false);
    });
    $("nut-huy").addEventListener("click", huyKetQua);
    $("nut-vd-tiep").addEventListener("click", quay);
    $("nut-vd-dong").addEventListener("click", function () { $("vq-vinh-danh").hidden = true; });
    $("nut-vd-huy").addEventListener("click", huyKetQua);

    $("nut-xuat").addEventListener("click", function () {
      if (!tt.ketQua.length) { window.alert("Chưa có kết quả để xuất."); return; }
      window.LuuTru.taiCsv(
        window.VongQuay.dongXuatChiTiet(tt.ketQua),
        "ket-qua-vong-quay-" + new Date().toISOString().slice(0, 10) + ".csv"
      );
    });
    $("nut-in-bien-ban").addEventListener("click", function () {
      if (!tt.ketQua.length) { window.alert("Chưa có kết quả để in biên bản."); return; }
      var bang = window.VongQuay.dongXuatChiTiet(tt.ketQua);
      window.BienBan.in({
        tenTro: "Vòng quay may mắn",
        tenSuKien: window.LuuTru.docTenSuKien(),
        tomTat: "Tổng số " + tt.ketQua.length + " lượt ghi nhận",
        cot: bang[0],
        dong: bang.slice(1),
        ghiChu: "Ô trúng thưởng, đại biểu, tỷ lệ sát nút và số vòng quay được chọn ngẫu nhiên bằng nguồn mật mã trình duyệt (crypto.getRandomValues).",
      });
    });
    $("nut-lam-lai").addEventListener("click", function () {
      if (!tt.ketQua.length || !window.confirm("Xóa " + tt.ketQua.length + " kết quả vòng quay?")) return;
      tt.ketQua = [];
      heSoThuong = 1;
      luotKepCon = 0;
      luu();
      kiemTraGoiYCheDo();
      bao("ok", "Đã xóa lịch sử quay.");
    });

    window.addEventListener("resize", function () { if (vong && giaiDoan === "san-khau") vong.ve(); });
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
        if (!$("vq-vinh-danh").hidden) {
          if (!$("nut-vd-tiep").disabled) quay();
        } else if (!$("nut-quay").disabled) {
          quay();
        }
      } else if (e.key === "Escape") {
        veChuanBi();
      }
    });
  }

  napDaLuu();
  ganSuKien();
  capNhatTongKet();
})();
