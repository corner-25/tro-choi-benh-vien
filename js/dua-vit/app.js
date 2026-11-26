/* Đua vịt — điều phối màn hình: chuẩn bị → đếm ngược → đua → công bố kết quả.
 * Hỗ trợ 3 chế độ: Đua cá nhân, Đua theo bảng (Vòng loại → Chung kết), Đua theo đơn vị (có thể đua tiếp vòng 2 trong đơn vị thắng).
 * Danh sách người chơi lấy từ danh sách dùng chung của cổng trò chơi (trang chủ). */
(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };
  var KHOA = "dua-vit";
  var TEN_NHAN_VAT = { vit: "vịt", "khinh-khi-cau": "khinh khí cầu", "thuyen-rong": "thuyền rồng" };

  var danhSach = [];
  var tt = { cauHinh: {}, daThang: [], lichSu: [], bangDau: null };
  var giaiDoan = "chuan-bi"; // chuan-bi | dua | cong-bo | xong
  var donViVongHai = null; // nếu MC chọn đua vòng 2 trong đơn vị vừa thắng

  // ── Trạng thái và lưu trữ ──
  function napDaLuu() {
    danhSach = window.LuuTru.docDanhSach().nguoiChoi;
    var d = window.LuuTru.doc(KHOA);
    if (d) {
      tt = {
        cauHinh: d.cauHinh || {},
        daThang: Array.isArray(d.daThang) ? d.daThang : [],
        lichSu: Array.isArray(d.lichSu) ? d.lichSu : [],
        bangDau: d.bangDau && Array.isArray(d.bangDau.cacBang) ? d.bangDau : null,
      };
    }
    if (tt.cauHinh.cheDo) $("o-che-do").value = tt.cauHinh.cheDo;
    if (tt.cauHinh.boiCanh) $("o-boi-canh").value = tt.cauHinh.boiCanh;
    if (tt.cauHinh.thoiGian) $("o-thoi-gian").value = String(tt.cauHinh.thoiGian);
    if (tt.cauHinh.soThang) $("o-so-thang").value = String(tt.cauHinh.soThang);
    if (tt.cauHinh.soBang) $("o-so-bang").value = String(tt.cauHinh.soBang);
    if (typeof tt.cauHinh.loaiThang === "boolean") $("o-loai-thang").checked = tt.cauHinh.loaiThang;
    if (typeof tt.cauHinh.suKienBenhVien === "boolean") $("o-su-kien-bv").checked = tt.cauHinh.suKienBenhVien;
    if (typeof tt.cauHinh.vitCuoi === "boolean") $("o-vit-cuoi").checked = tt.cauHinh.vitCuoi;
    $("ten-su-kien").textContent = window.LuuTru.docTenSuKien();
  }

  function docCauHinh() {
    tt.cauHinh = {
      cheDo: $("o-che-do").value || "ca-nhan",
      boiCanh: $("o-boi-canh").value || "vit",
      thoiGian: Number($("o-thoi-gian").value) || 30,
      soThang: Number($("o-so-thang").value) || 3,
      soBang: Number($("o-so-bang").value) || 6,
      loaiThang: $("o-loai-thang").checked,
      suKienBenhVien: $("o-su-kien-bv").checked,
      vitCuoi: $("o-vit-cuoi").checked,
    };
    return tt.cauHinh;
  }

  function luu() { docCauHinh(); window.LuuTru.ghi(KHOA, tt); capNhatTongKet(); }

  function nguoiConDua() {
    if (!tt.cauHinh.loaiThang) return danhSach.slice();
    var da = new Set(tt.daThang.map(function (m) { return m.toUpperCase(); }));
    return danhSach.filter(function (n) { return !da.has(n.ma.toUpperCase()); });
  }

  function donViConDua() {
    var dsDv = window.Dua.danhSachDonVi(danhSach);
    if (!tt.cauHinh.loaiThang) return dsDv;
    var da = new Set(tt.daThang.map(function (m) { return m.toUpperCase(); }));
    return dsDv.filter(function (d) { return !da.has(d.ma.toUpperCase()); });
  }

  function taoBangDauMoi() {
    var ds = nguoiConDua();
    if (ds.length < 4) { tt.bangDau = null; return; }
    var cacBang = window.Dua.chiaBang(ds, tt.cauHinh.soBang);
    tt.bangDau = { cacBang: cacBang, daXong: 0, chungKet: [], xongChungKet: false };
  }

  function damBaoBangDau() {
    if (tt.cauHinh.cheDo !== "theo-bang") return;
    if (!tt.bangDau || !tt.bangDau.cacBang.length || tt.bangDau.xongChungKet) taoBangDauMoi();
  }

  function tenLuotBangDau() {
    if (!tt.bangDau) return "";
    if (tt.bangDau.daXong < tt.bangDau.cacBang.length) {
      return "Vòng loại · Bảng " + (tt.bangDau.daXong + 1) + "/" + tt.bangDau.cacBang.length;
    }
    return "Vòng Chung kết";
  }

  function capNhatTrangThaiBang() {
    var laBang = tt.cauHinh.cheDo === "theo-bang";
    $("khung-so-bang").hidden = !laBang;
    $("khung-bang-dau").hidden = !laBang || danhSach.length < 4;
    if (!laBang) return;
    if (!tt.bangDau || !tt.bangDau.cacBang.length) taoBangDauMoi();
    var p = $("tien-do-bang");
    p.textContent = "";
    if (!tt.bangDau) { p.textContent = "Cần ít nhất 4 người chơi để chia bảng."; return; }
    var soBang = tt.bangDau.cacBang.length;
    if (tt.bangDau.xongChungKet) {
      p.textContent = "Đã hoàn thành vòng Chung kết. Bấm Chia bảng mới để bắt đầu giải mới.";
    } else if (tt.bangDau.daXong < soBang) {
      var bangTiep = tt.bangDau.cacBang[tt.bangDau.daXong];
      p.append(
        document.createTextNode("Sắp đua: "),
        taoChuDam("Bảng " + (tt.bangDau.daXong + 1) + "/" + soBang),
        document.createTextNode(" (" + bangTiep.length + " vịt). Đã vào chung kết: " + tt.bangDau.chungKet.length + " người.")
      );
    } else {
      p.append(
        document.createTextNode("Đã xong " + soBang + " bảng vòng loại. Sẵn sàng "),
        taoChuDam("Vòng Chung kết"),
        document.createTextNode(" với " + tt.bangDau.chungKet.length + " đại biểu xuất sắc nhất!")
      );
    }
  }

  function taoChuDam(chu) { var b = document.createElement("b"); b.textContent = chu; return b; }

  function capNhatTongKet() {
    docCauHinh();
    var con = tt.cauHinh.cheDo === "don-vi" ? donViConDua().length : nguoiConDua().length;
    $("so-nguoi").textContent = String(danhSach.length);
    $("so-con").textContent = String(con);
    $("so-thang").textContent = String(tt.daThang.length);
    $("goi-y-danh-sach").hidden = danhSach.length > 0;

    var goiYDonVi = $("goi-y-don-vi");
    if (tt.cauHinh.cheDo === "don-vi" && danhSach.length > 0 && donViConDua().length < 2) {
      goiYDonVi.hidden = false;
      goiYDonVi.textContent = "Cần ít nhất 2 đơn vị (cột Đơn vị trong danh sách) còn được đua.";
    } else {
      goiYDonVi.hidden = true;
    }

    capNhatTrangThaiBang();
    var duDieuKien = con >= 2;
    if (tt.cauHinh.cheDo === "theo-bang") {
      duDieuKien = Boolean(tt.bangDau && !tt.bangDau.xongChungKet && (
        tt.bangDau.daXong < tt.bangDau.cacBang.length || tt.bangDau.chungKet.length >= 2
      ));
    }
    $("nut-bat-dau").disabled = !duDieuKien;
    var nhanNut = $("nut-bat-dau").querySelector("span");
    if (tt.cauHinh.cheDo === "theo-bang" && tt.bangDau && !tt.bangDau.xongChungKet) {
      nhanNut.textContent = "Bắt đầu " + tenLuotBangDau();
    } else if (tt.cauHinh.cheDo === "don-vi") {
      nhanNut.textContent = "Bắt đầu đua theo đơn vị";
    } else {
      nhanNut.textContent = "Bắt đầu đua";
    }
  }

  // ── Cuộc đua ──
  var luot = null, nguoiTrongLuot = [], soThangLuot = 0, luotHienTai = 0, nhanLuotHienTai = "", loaiLuotHienTai = "ca-nhan";

  function chonDanhSachLuot() {
    if (donViVongHai) {
      var dsTrongDv = nguoiConDua().filter(function (n) {
        return String(n.donVi || "").trim().toLowerCase() === donViVongHai.toLowerCase();
      });
      return { ds: dsTrongDv, nhan: "Vòng 2 · " + donViVongHai, loai: "vong-2-don-vi" };
    }
    if (tt.cauHinh.cheDo === "don-vi") {
      return { ds: donViConDua(), nhan: "Đua theo đơn vị", loai: "don-vi" };
    }
    if (tt.cauHinh.cheDo === "theo-bang") {
      damBaoBangDau();
      if (!tt.bangDau) return { ds: [], nhan: "", loai: "theo-bang" };
      if (tt.bangDau.daXong < tt.bangDau.cacBang.length) {
        var idx = tt.bangDau.daXong;
        return { ds: tt.bangDau.cacBang[idx], nhan: "Vòng loại · Bảng " + (idx + 1) + "/" + tt.bangDau.cacBang.length, loai: "vong-loai" };
      }
      return { ds: tt.bangDau.chungKet.slice(), nhan: "Vòng Chung kết", loai: "chung-ket" };
    }
    return { ds: nguoiConDua(), nhan: "Lượt " + (tt.lichSu.length + 1), loai: "ca-nhan" };
  }

  function batDau() {
    if (giaiDoan !== "chuan-bi" && giaiDoan !== "xong") return;
    luu();
    var chon = chonDanhSachLuot();
    var dsLuot = chon.ds;
    if (dsLuot.length < 2) {
      donViVongHai = null;
      window.alert("Cần ít nhất 2 vịt còn được đua trong lượt này.");
      return;
    }
    window.AmThanh.moKhoa();
    nguoiTrongLuot = dsLuot;
    soThangLuot = Math.min(tt.cauHinh.soThang, dsLuot.length);
    luotHienTai = tt.lichSu.length + 1;
    nhanLuotHienTai = chon.nhan;
    loaiLuotHienTai = chon.loai;
    donViVongHai = null;

    var cuocDua = window.Dua.taoCuocDua(dsLuot.length, { thoiGian: tt.cauHinh.thoiGian, soNguoiThang: soThangLuot });
    hienMan("dua");
    if (!luot) luot = window.LuotDua.tao(window.Ve.taoBoVe($("san")), window.AmThanh);
    $("dua-ten").textContent = window.LuuTru.docTenSuKien();
    var moTaThang = loaiLuotHienTai === "vong-loai"
      ? soThangLuot + " người vào Chung kết"
      : (loaiLuotHienTai === "don-vi" ? soThangLuot + " đơn vị về đích đầu tiên" : soThangLuot + " người về đích đầu tiên thắng");
    $("dua-luot").textContent = nhanLuotHienTai + " · " + dsLuot.length + " " + (TEN_NHAN_VAT[tt.cauHinh.boiCanh] || "vịt") + " · " + moTaThang;
    giaiDoan = "dua";
    luot.chay(cuocDua, dsLuot, soThangLuot, function () { ketThuc(cuocDua); }, { suKienBenhVien: tt.cauHinh.suKienBenhVien, boiCanh: tt.cauHinh.boiCanh });
  }

  function ketThuc(cuocDua) {
    giaiDoan = "cong-bo";
    window.AmThanh.dungNhac();
    // Chỉ lấy đúng số người thắng: vịt về đích trong lúc chờ công bố không được tính.
    var ketQua = cuocDua.thuTuVeDich().slice(0, soThangLuot).map(function (chiSo, i) {
      var n = nguoiTrongLuot[chiSo];
      return { hang: i + 1, ma: n.ma, ten: n.ten, donVi: n.donVi };
    });

    var vitCuoi = null;
    if (tt.cauHinh.vitCuoi && nguoiTrongLuot.length > soThangLuot) {
      var idxCuoi = window.Dua.vitVeCuoi(cuocDua);
      if (idxCuoi >= 0 && ketQua.every(function (k) { return k.ma !== nguoiTrongLuot[idxCuoi].ma; })) {
        var nc = nguoiTrongLuot[idxCuoi];
        vitCuoi = { ma: nc.ma, ten: nc.ten, donVi: nc.donVi };
      }
    }

    var luc = new Date().toLocaleString("vi-VN", { hour12: false });
    tt.lichSu.push({ luot: luotHienTai, nhanLuot: nhanLuotHienTai, luc: luc, soVit: nguoiTrongLuot.length, ketQua: ketQua, vitCuoi: vitCuoi });

    if (loaiLuotHienTai === "vong-loai" && tt.bangDau) {
      ketQua.forEach(function (k) {
        if (!tt.bangDau.chungKet.some(function (x) { return x.ma === k.ma; })) {
          tt.bangDau.chungKet.push({ ma: k.ma, ten: k.ten, donVi: k.donVi });
        }
      });
      tt.bangDau.daXong += 1;
    } else if (loaiLuotHienTai === "chung-ket" && tt.bangDau) {
      tt.bangDau.xongChungKet = true;
      ketQua.forEach(function (k) { if (tt.daThang.indexOf(k.ma) < 0) tt.daThang.push(k.ma); });
    } else {
      ketQua.forEach(function (k) { if (tt.daThang.indexOf(k.ma) < 0) tt.daThang.push(k.ma); });
    }
    luu();

    $("kq-luot").textContent = window.LuuTru.docTenSuKien() + " · " + nhanLuotHienTai;
    $("kq-tieu-de").textContent = loaiLuotHienTai === "vong-loai" ? "Giành vé vào Chung kết" : (loaiLuotHienTai === "don-vi" ? "Đơn vị về đích đầu tiên" : "Về đích đầu tiên");
    $("nut-tiep").disabled = true;

    var nutVongHai = $("nut-vong-hai");
    if (loaiLuotHienTai === "don-vi" && ketQua.length > 0) {
      var tenDvThang = ketQua[0].ten;
      var soThanhVien = nguoiConDua().filter(function (n) { return String(n.donVi || "").trim().toLowerCase() === tenDvThang.toLowerCase(); }).length;
      if (soThanhVien >= 2) {
        nutVongHai.hidden = false;
        nutVongHai.dataset.donVi = tenDvThang;
        nutVongHai.textContent = "Đua vòng 2 trong " + tenDvThang + " (" + soThanhVien + " vịt)";
      } else {
        nutVongHai.hidden = true;
      }
    } else {
      nutVongHai.hidden = true;
    }

    hienMan("ket-qua", true);
    window.KetQua.congBo($("kq-danh-sach"), ketQua, window.AmThanh, function () { window.Phao.ban($("phao-giay"), 1.6, 0.42); }, function () {
      giaiDoan = "xong";
      var tiepSpan = $("nut-tiep").querySelector("span");
      if (tt.cauHinh.cheDo === "theo-bang" && tt.bangDau && !tt.bangDau.xongChungKet) {
        tiepSpan.textContent = "Đua " + tenLuotBangDau();
        $("nut-tiep").disabled = false;
      } else {
        tiepSpan.textContent = "Đua lượt tiếp";
        var con = tt.cauHinh.cheDo === "don-vi" ? donViConDua().length : nguoiConDua().length;
        $("nut-tiep").disabled = con < 2;
      }
      if (!$("nut-tiep").disabled) $("nut-tiep").focus();
    }, vitCuoi);
  }

  function veChuanBi() {
    if (giaiDoan === "dua") {
      if (!window.confirm("Dừng lượt đua đang chạy? Lượt này sẽ không được tính.")) return;
      if (luot) luot.dung();
    }
    donViVongHai = null;
    giaiDoan = "chuan-bi";
    window.AmThanh.dungNhac();
    hienMan("chuan-bi");
    capNhatTongKet();
  }

  function hienMan(ten, giuDua) {
    $("man-chuan-bi").hidden = ten !== "chuan-bi";
    $("man-dua").hidden = !(ten === "dua" || giuDua);
    $("man-ket-qua").hidden = ten !== "ket-qua";
  }

  function toanManHinh() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(function () {});
    else document.exitFullscreen();
  }

  function xuatCsv() {
    if (!tt.lichSu.length) { window.alert("Chưa có lượt đua nào để xuất."); return; }
    var dong = [["Lượt", "Vòng đấu", "Thời gian", "Hạng", "Mã nhân viên", "Họ tên", "Đơn vị", "Số vịt tham gia"]];
    tt.lichSu.forEach(function (l) {
      l.ketQua.forEach(function (k) { dong.push([l.luot, l.nhanLuot || ("Lượt " + l.luot), l.luc, k.hang, k.ma, k.ten, k.donVi, l.soVit]); });
      if (l.vitCuoi) dong.push([l.luot, l.nhanLuot || ("Lượt " + l.luot), l.luc, "Vịt về cuối", l.vitCuoi.ma, l.vitCuoi.ten, l.vitCuoi.donVi, l.soVit]);
    });
    window.LuuTru.taiCsv(dong, "ket-qua-dua-vit-" + new Date().toISOString().slice(0, 10) + ".csv");
  }

  function inBienBan() {
    if (!tt.lichSu.length) { window.alert("Chưa có lượt đua nào để in biên bản."); return; }
    var dong = [];
    tt.lichSu.forEach(function (l) {
      l.ketQua.forEach(function (k) {
        dong.push([l.nhanLuot || ("Lượt " + l.luot), l.luc, "Hạng " + k.hang, k.ma, k.ten, k.donVi || ""]);
      });
      if (l.vitCuoi) {
        dong.push([l.nhanLuot || ("Lượt " + l.luot), l.luc, "Vịt về cuối", l.vitCuoi.ma, l.vitCuoi.ten, l.vitCuoi.donVi || ""]);
      }
    });
    if ($("hop-lich-su").open) $("hop-lich-su").close();
    window.BienBan.in({
      tenTro: "Đua vịt",
      tenSuKien: window.LuuTru.docTenSuKien(),
      tomTat: "Tổng số " + tt.lichSu.length + " lượt đua · " + dong.length + " kết quả được ghi nhận",
      cot: ["Lượt / Vòng", "Thời gian", "Kết quả", "Mã nhân viên", "Họ và tên", "Đơn vị"],
      dong: dong,
      ghiChu: "Kết quả được ghi nhận ngẫu nhiên trực tiếp theo thứ tự qua vạch đích trên hệ thống.",
    });
  }

  // ── Gắn sự kiện ──
  function ganSuKien() {
    ["o-che-do", "o-boi-canh", "o-thoi-gian", "o-so-thang", "o-so-bang", "o-loai-thang", "o-su-kien-bv", "o-vit-cuoi"].forEach(function (id) {
      $(id).addEventListener("change", function () {
        if (id === "o-so-bang") taoBangDauMoi();
        luu();
      });
    });
    $("nut-chia-bang").addEventListener("click", function () {
      if (tt.bangDau && tt.bangDau.daXong > 0 && !tt.bangDau.xongChungKet) {
        if (!window.confirm("Đang đua dở vòng bảng. Chia lại bảng mới từ đầu?")) return;
      }
      taoBangDauMoi();
      luu();
    });
    $("o-am-thanh").addEventListener("change", function () { if ($("o-am-thanh").checked !== window.AmThanh.dangBat()) window.AmThanh.batTat(); });
    $("nut-bat-dau").addEventListener("click", batDau);
    $("nut-tiep").addEventListener("click", batDau);
    $("nut-vong-hai").addEventListener("click", function () {
      var dv = $("nut-vong-hai").dataset.donVi;
      if (!dv) return;
      donViVongHai = dv;
      batDau();
    });
    $("nut-ve").addEventListener("click", veChuanBi);
    $("nut-lich-su").addEventListener("click", function () { window.KetQua.veLichSu($("ls-noi-dung"), tt.lichSu); $("hop-lich-su").showModal(); });
    $("nut-dong-ls").addEventListener("click", function () { $("hop-lich-su").close(); });
    $("nut-xuat").addEventListener("click", xuatCsv);
    $("nut-in-bien-ban").addEventListener("click", inBienBan);
    $("nut-lam-lai").addEventListener("click", function () {
      if (!window.confirm("Xóa lịch sử " + tt.lichSu.length + " lượt đua và cho mọi người đua lại từ đầu? Nên tải file kết quả trước.")) return;
      tt.daThang = []; tt.lichSu = []; tt.bangDau = null;
      luu();
    });

    window.addEventListener("resize", function () { if (luot) luot.coGian(); });
    document.addEventListener("keydown", function (e) {
      var dangGo = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
      if (dangGo || $("hop-lich-su").open) return;
      if (e.code === "Space") {
        e.preventDefault();
        if (giaiDoan === "chuan-bi" && !$("nut-bat-dau").disabled) batDau();
        else if (giaiDoan === "xong" && !$("nut-tiep").disabled) batDau();
      } else if (e.key === "f" || e.key === "F") toanManHinh();
      else if (e.key === "m" || e.key === "M") { var bat = window.AmThanh.batTat(); $("o-am-thanh").checked = bat; }
      else if ((e.key === "p" || e.key === "P") && giaiDoan === "dua" && luot) luot.tamDungChuyen();
      else if (e.key === "Escape" && giaiDoan !== "chuan-bi") veChuanBi();
    });
  }

  napDaLuu();
  ganSuKien();
  capNhatTongKet();
})();
