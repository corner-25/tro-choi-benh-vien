/* Điều phối Đuổi hình bắt chữ – Đời sống Bệnh viện. Dữ liệu người dùng chỉ vào DOM bằng textContent.
 *
 * Mỗi câu: hình bị che bởi 12 mảnh gỗ, lật dần theo đồng hồ ống tre (hoặc MC tự mở).
 * Space: mở hết hình → hiện gợi ý → lật đáp án (đóng dấu son) → câu tiếp. H: gợi ý một chữ cái.
 * Phím 1–4: cộng điểm cho đội đoán đúng (3 điểm khi hình còn che, 2 khi đã mở hết hoặc đã đọc gợi ý, 1 khi đã gợi ý chữ).
 *
 * tt.ds là BỘ CÂU (ngân hàng). Mỗi lượt thi bốc ngẫu nhiên theo tt.cauHinh.deThi = { de, vua, kho, khac }
 * và lưu ở tt.luot = { ids, ketQua: { id: { ten, diem } }, viTri, xong }. N: ghi tên người trả lời; V: vinh danh. */
(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };
  var KHOA = "duoi-hinh";
  var TEN_DOI = ["Đội 1", "Đội 2", "Đội 3", "Đội 4"];

  var SO_CAU_MAC_DINH = 10;
  var PHUT_CHO = [0, 3, 5, 10, 15];
  var tt = { ds: [], cauHinh: { thoiGian: 30, soDoi: 0, deThi: null, phutCho: 5 }, diem: [0, 0, 0, 0], luot: null };
  var maChieu = 0; // tăng mỗi lần đổi câu; việc hẹn giờ của câu cũ thấy mã đã đổi thì bỏ qua
  var chieu = []; // các câu của lượt đang chiếu (lấy từ tt.ds theo tt.luot.ids)
  var giaiDoan = "chuan-bi";
  var viTri = 0;
  var cau = null; // trạng thái câu đang chiếu
  var veTranh = null, veCu = null, hen = 0;

  // ── Lưu trữ ──
  function napDaLuu() {
    var d = window.LuuTru.doc(KHOA);
    if (d && Array.isArray(d.ds) && d.ds.length) {
      tt.ds = d.ds.map(function (c) {
        var ch = window.DuoiHinh.chuanHoa(c);
        ch.anh = window.AnhGiai.hopLe(ch.anh) ? ch.anh : null;
        return ch;
      });
    } else tt.ds = window.DuoiHinh.boMau();
    if (d && d.cauHinh) tt.cauHinh = { thoiGian: [0, 20, 30, 45].indexOf(Number(d.cauHinh.thoiGian)) >= 0 ? Number(d.cauHinh.thoiGian) : 30, soDoi: [0, 2, 3, 4].indexOf(Number(d.cauHinh.soDoi)) >= 0 ? Number(d.cauHinh.soDoi) : 0 };
    if (d && d.cauHinh && d.cauHinh.deThi) tt.cauHinh.deThi = d.cauHinh.deThi;
    tt.cauHinh.phutCho = d && d.cauHinh && PHUT_CHO.indexOf(Number(d.cauHinh.phutCho)) >= 0 ? Number(d.cauHinh.phutCho) : 5;
    $("o-phut-cho").value = String(tt.cauHinh.phutCho);
    if (d && d.luot) tt.luot = docLuot(d.luot);
    if (d && Array.isArray(d.diem)) tt.diem = [0, 1, 2, 3].map(function (i) { return Math.max(0, Math.floor(Number(d.diem[i]) || 0)); });
    $("o-thoi-gian").value = String(tt.cauHinh.thoiGian);
    $("o-so-doi").value = String(tt.cauHinh.soDoi);
    var ten = window.LuuTru.docTenSuKien();
    document.querySelectorAll(".ten-su-kien").forEach(function (el) { el.textContent = ten; });
  }

  /** Ghi số câu sẽ nạp lên nút theo mức độ đang chọn. */
  function capNhatNutMau() {
    var muc = $("o-muc-nap").value, n = window.DuoiHinh.boMau(muc).length;
    $("nut-mau").textContent = "Nạp " + n + " câu" + (muc ? " mức " + window.DuoiHinh.tenMucDo(muc).toLowerCase() : " tranh chơi chữ");
  }

  /** Đọc lượt thi đã lưu, chỉ giữ dữ liệu hợp lệ. */
  function docLuot(l) {
    if (!l || !Array.isArray(l.ids)) return null;
    var ids = l.ids.filter(function (id) { return typeof id === "string"; }).slice(0, 200);
    var ketQua = {};
    ids.forEach(function (id) {
      var kq = l.ketQua && l.ketQua[id];
      var ten = window.DuoiHinh.chuanTen(kq && kq.ten);
      if (ten) ketQua[id] = { ten: ten, diem: Math.min(3, Math.max(0, Math.floor(Number(kq.diem) || 0))) };
    });
    return { ids: ids, ketQua: ketQua, viTri: Math.max(0, Math.floor(Number(l.viTri) || 0)), xong: Boolean(l.xong) };
  }

  /** Các câu của lượt, tra theo id trong bộ câu; câu đã bị xóa khỏi bộ thì bỏ qua. */
  function cauCuaLuot() {
    if (!tt.luot) return [];
    var theoId = {};
    tt.ds.forEach(function (c) { theoId[c.id] = c; });
    return tt.luot.ids.map(function (id) { return theoId[id]; }).filter(Boolean);
  }

  function tongDeThi() { var d = tt.cauHinh.deThi; return d.de + d.vua + d.kho + d.khac; }

  /** Giữ số câu từng mức trong giới hạn bộ câu hiện có; chưa có thiết lập thì chia 10 câu theo tỷ lệ. */
  function kiemDeThi() {
    var coSan = window.DuoiHinh.demTheoMuc(tt.ds), d = tt.cauHinh.deThi, moi = {};
    if (!d) { tt.cauHinh.deThi = window.DuoiHinh.chiaTheoTong(SO_CAU_MAC_DINH, coSan); return; }
    ["de", "vua", "kho", "khac"].forEach(function (m) { moi[m] = Math.min(coSan[m], Math.max(0, Math.floor(Number(d[m]) || 0))); });
    tt.cauHinh.deThi = moi;
  }

  function veDeThi() {
    var coSan = window.DuoiHinh.demTheoMuc(tt.ds), d = tt.cauHinh.deThi;
    ["de", "vua", "kho", "khac"].forEach(function (m) {
      var o = $("o-so-" + m);
      o.max = String(coSan[m]);
      if (document.activeElement !== o) o.value = String(d[m]);
      $("co-" + m).textContent = "có " + coSan[m];
    });
    $("nhom-so-khac").hidden = !coSan.khac;
    var tongCo = coSan.de + coSan.vua + coSan.kho + coSan.khac;
    $("o-tong-cau").max = String(tongCo);
    if (document.activeElement !== $("o-tong-cau")) $("o-tong-cau").value = String(tongDeThi());
    $("co-tong").textContent = "trong " + tongCo + " câu";
  }

  function capNhatBanDieuKhien() {
    var dsLuot = cauCuaLuot();
    var dangDo = tt.luot && !tt.luot.xong && dsLuot.length > 0;
    $("nut-tiep-luot").hidden = !dangDo;
    if (dangDo) $("nut-tiep-luot").textContent = "Chơi tiếp lượt đang dở (câu " + (Math.min(tt.luot.viTri, dsLuot.length - 1) + 1) + " / " + dsLuot.length + ")";
    $("nut-xem-vinh-danh").hidden = !(tt.luot && Object.keys(tt.luot.ketQua).length);
  }

  function luu() {
    kiemDeThi();
    window.LuuTru.ghi(KHOA, tt);
    $("so-cau").textContent = String(tt.ds.length);
    $("nut-vao").disabled = !tongDeThi();
    $("nut-man-cho").disabled = !tongDeThi();
    veDeThi();
    capNhatBanDieuKhien();
  }

  // ── Bàn điều khiển: danh sách câu ──
  function veDanhSach() {
    var ol = $("ds-cau");
    ol.textContent = "";
    tt.ds.forEach(function (c, i) {
      var li = document.createElement("li"); li.className = "dh-dong";
      var dau = document.createElement("div"); dau.className = "dh-dong-dau";
      var stt = document.createElement("span"); stt.className = "dh-stt";
      stt.textContent = "Câu " + (i + 1) + (c.anh ? " · ảnh riêng" : veTranhTam().coCanh(c.canhId) ? " · tranh chơi chữ" : " · hoạt họa");
      var chonMuc = document.createElement("select"); chonMuc.className = "dh-chon-muc";
      chonMuc.setAttribute("aria-label", "Mức độ câu " + (i + 1));
      [["", "Chưa phân loại"], ["de", "Dễ"], ["vua", "Vừa"], ["kho", "Khó"]].forEach(function (m) {
        var op = document.createElement("option"); op.value = m[0]; op.textContent = m[1]; chonMuc.appendChild(op);
      });
      chonMuc.value = c.mucDo || "";
      chonMuc.dataset.muc = c.mucDo || "";
      chonMuc.addEventListener("change", function () { c.mucDo = chonMuc.value; chonMuc.dataset.muc = c.mucDo; luu(); });
      var xoa = document.createElement("button"); xoa.type = "button"; xoa.className = "nut-nho nut-xoa"; xoa.textContent = "×";
      xoa.setAttribute("aria-label", "Xóa câu " + (i + 1));
      xoa.addEventListener("click", function () { tt.ds.splice(i, 1); luu(); veDanhSach(); });
      var phai = document.createElement("div"); phai.className = "dh-dong-phai";
      phai.append(chonMuc, xoa);
      dau.append(stt, phai);
      function o(gt, nhan, ghi) {
        var inp = document.createElement("input"); inp.type = "text"; inp.value = gt; inp.placeholder = nhan; inp.setAttribute("aria-label", nhan + " câu " + (i + 1));
        inp.addEventListener("change", function () { ghi(inp); luu(); });
        return inp;
      }
      var oDa = o(c.dapAn, "Đáp án", function (inp) { c.dapAn = (inp.value.trim() || "ĐÁP ÁN").toUpperCase(); inp.value = c.dapAn; });
      var oGy = o(c.goiY, "Gợi ý", function (inp) { c.goiY = inp.value.trim(); });
      var oGt = o(c.giaiThich, "Giải thích khi lật đáp án", function (inp) { c.giaiThich = inp.value.trim(); });
      var lb = document.createElement("label"); lb.className = "nut nut-vien dh-nut-anh";
      lb.textContent = c.anh ? "Đổi ảnh câu đố" : "Thay bằng ảnh riêng (tùy chọn)";
      var f = document.createElement("input"); f.type = "file"; f.accept = "image/png,image/jpeg,image/webp,image/gif"; f.className = "an-di";
      f.addEventListener("change", function () {
        var file = f.files[0]; f.value = "";
        if (file) window.AnhGiai.thuNho(file).then(function (url) { c.anh = url; luu(); veDanhSach(); }).catch(function (e) { window.alert(e.message); });
      });
      lb.appendChild(f);
      li.append(dau, oDa, oGy, oGt, lb);
      ol.appendChild(li);
    });
  }

  // Bộ vẽ tranh dùng để hỏi coCanh ở bàn điều khiển (chưa cần canvas thật)
  var tamThoi = null;
  function veTranhTam() { return veTranh || tamThoi || (tamThoi = { coCanh: function (id) { return typeof id === "string" && id.indexOf("tranh:") === 0 && Boolean(window.VeTranh.CAU[id.slice(6)]); } }); }

  // ── Sân khấu ──
  function dungOChu(dapAn) {
    var khung = $("sk-o-chu");
    khung.textContent = "";
    var ds = [];
    window.DuoiHinh.demTu(dapAn).forEach(function (t) {
      var nhom = document.createElement("div"); nhom.className = "dh-tu";
      Array.from(t.tu).forEach(function (chu) {
        var o = document.createElement("div"); o.className = "dh-o";
        var mat = document.createElement("span"); mat.className = "dh-o-mat"; mat.textContent = chu;
        o.appendChild(mat);
        nhom.appendChild(o); ds.push(o);
      });
      khung.appendChild(nhom);
    });
    return ds;
  }

  function veBangDoi() {
    var khung = $("bang-doi");
    khung.textContent = "";
    khung.hidden = !tt.cauHinh.soDoi;
    for (var i = 0; i < tt.cauHinh.soDoi; i += 1) {
      (function (i) {
        var b = document.createElement("button"); b.type = "button"; b.className = "dh-doi";
        b.setAttribute("aria-label", TEN_DOI[i] + ": " + tt.diem[i] + " điểm. Bấm để cộng điểm khi đội này đoán đúng.");
        var ten = document.createElement("span"); ten.className = "dh-doi-ten"; ten.textContent = TEN_DOI[i];
        var so = document.createElement("span"); so.className = "dh-doi-diem"; so.textContent = String(tt.diem[i]);
        var phim = document.createElement("kbd"); phim.textContent = String(i + 1);
        b.append(ten, so, phim);
        b.addEventListener("click", function () { chamDiem(i); });
        khung.appendChild(b);
      })(i);
    }
  }

  function chamDiem(i) {
    if (!cau || i >= tt.cauHinh.soDoi || cau.daCham) return;
    cau.daCham = true;
    var d = diemCau();
    tt.diem[i] += d;
    luu(); veBangDoi();
    var chip = $("bang-doi").children[i];
    if (chip) {
      var bay = document.createElement("span"); bay.className = "dh-cong-diem"; bay.textContent = "+" + d;
      chip.appendChild(bay);
      chip.classList.add("vua-cong");
    }
    if (cau.buoc < 2) latDapAn();
  }

  function dungDongHo() { if (hen) { clearInterval(hen); hen = 0; } }

  function chayDongHo() {
    dungDongHo();
    var tre = $("dh-tre");
    var tong = tt.cauHinh.thoiGian;
    $("dh-dong-ho").hidden = !tong;
    if (!tong) return;
    var batDau = performance.now(), daMo = 0, soManh = 12;
    tre.style.transform = "scaleX(1)";
    tre.parentElement.classList.remove("het");
    hen = setInterval(function () {
      var troi = (performance.now() - batDau) / 1000;
      var con = Math.max(0, 1 - troi / tong);
      tre.style.transform = "scaleX(" + con.toFixed(4) + ")";
      tre.parentElement.classList.toggle("gap", con < 0.25);
      var canMo = Math.min(soManh, Math.floor((troi / tong) * soManh) + 1);
      while (daMo < canMo && veTranh && veTranh.conManh() > 0) { veTranh.moMot(); daMo += 1; window.AmThanh.moManh(); }
      if (con <= 0) {
        dungDongHo();
        tre.parentElement.classList.add("het");
        if (veTranh) veTranh.moHet();
        cau.moHetHinh = true;
        window.AmThanh.satNut();
        capNhatNut();
      }
    }, 120);
  }

  /** Điểm của câu: chốt lúc lật đáp án; trước đó tính theo mức đã mở hình, gợi ý. */
  function diemCau() {
    if (cau.diemChot != null) return cau.diemChot;
    return window.DuoiHinh.diemThuong({ moHetHinh: cau.moHetHinh, daGoiY: cau.buoc >= 1, soChuGoiY: cau.chuGoiY.length });
  }

  function veNguoiTraLoi() {
    var kq = tt.luot.ketQua[chieu[viTri].id];
    $("o-ten").value = kq ? kq.ten : "";
    $("sk-da-ghi").textContent = kq ? "Đã ghi: " + kq.ten + " · +" + kq.diem + " điểm" : "";
    $("form-ten").classList.toggle("da-ghi", Boolean(kq));
    var ds = $("ds-ten"), daCo = {};
    ds.textContent = "";
    Object.keys(tt.luot.ketQua).forEach(function (id) {
      var ten = tt.luot.ketQua[id].ten, k = ten.toLocaleLowerCase("vi");
      if (daCo[k]) return;
      daCo[k] = true;
      var op = document.createElement("option"); op.value = ten; ds.appendChild(op);
    });
  }

  /** Ghi (hoặc xóa khi để trống) tên người trả lời đúng câu đang chiếu; chưa lật đáp án thì lật luôn. */
  function ghiTen(tenGo) {
    if (!cau) return;
    var ten = window.DuoiHinh.chuanTen(tenGo), id = chieu[viTri].id;
    var ketQua = Object.assign({}, tt.luot.ketQua);
    if (ten) ketQua[id] = { ten: ten, diem: diemCau() };
    else delete ketQua[id];
    tt.luot = Object.assign({}, tt.luot, { ketQua: ketQua });
    luu();
    veNguoiTraLoi();
    $("o-ten").blur();
    if (ten && cau.buoc < 2) latDapAn();
  }

  function chonCau(idx) {
    if (idx < 0 || idx >= chieu.length) return;
    viTri = idx;
    maChieu += 1;
    tt.luot = Object.assign({}, tt.luot, { viTri: idx });
    luu();
    var c = chieu[viTri];
    var daGhi = tt.luot.ketQua[c.id];
    cau = { buoc: 0, chuGoiY: [], moHetHinh: false, daCham: false, cacO: dungOChu(c.dapAn), diemChot: daGhi ? daGhi.diem : null };
    $("sk-chi-so").textContent = "Câu " + (viTri + 1) + " / " + chieu.length;
    var muc = window.DuoiHinh.tenMucDo(c.mucDo);
    $("sk-muc-do").textContent = muc ? "Mức " + muc.toLowerCase() : "";
    $("sk-muc-do").dataset.muc = c.mucDo || "";
    $("sk-muc-do").hidden = !muc;
    var laTranh = Boolean(c.anh) || veTranh.coCanh(c.canhId);
    if (laTranh) {
      if (veCu) veCu.dung();
      $("dh-canvas").hidden = false; $("dh-canvas-cu").hidden = true;
      veTranh.datCau(c.canhId, c.anh);
      chayDongHo();
    } else {
      // Câu hoạt họa bản cũ: dùng bộ vẽ cũ, không có mảnh che
      veTranh.dung(); dungDongHo();
      $("dh-canvas").hidden = true; $("dh-canvas-cu").hidden = false; $("dh-dong-ho").hidden = true;
      if (!veCu) veCu = window.VeHinh.tao($("dh-canvas-cu"));
      veCu.datCanh(c.canhId, c.anh);
      cau.moHetHinh = true;
    }
    $("sk-goi-y").hidden = true; $("sk-goi-y").textContent = "";
    $("sk-giai-thich").hidden = true; $("sk-giai-thich").textContent = "";
    $("nut-truoc").disabled = viTri === 0;
    $("nut-sau").disabled = viTri >= chieu.length - 1;
    capNhatNut();
    veBangDoi();
    veNguoiTraLoi();
  }

  function capNhatNut() {
    var c = chieu[viTri];
    var nut = $("nut-buoc");
    nut.textContent = "";
    var conChe = !cau.moHetHinh && veTranh && !$("dh-canvas").hidden && veTranh.conManh() > 0;
    var ten = cau.buoc === 0 && conChe ? "Mở hết hình"
      : cau.buoc === 0 && c.goiY ? "Hiện gợi ý"
      : cau.buoc < 2 ? "Lật đáp án"
      : viTri < chieu.length - 1 ? "Câu tiếp" : "Vinh danh";
    nut.appendChild(document.createTextNode(ten + " "));
    var kbd = document.createElement("kbd"); kbd.textContent = "Space"; nut.appendChild(kbd);
    $("nut-chu").disabled = cau.buoc >= 2;
  }

  function latDapAn() {
    var c = chieu[viTri];
    cau.diemChot = diemCau();
    cau.buoc = 2;
    dungDongHo();
    if (veTranh && !$("dh-canvas").hidden) { veTranh.moHet(); veTranh.dongDau(); }
    var ma = maChieu;
    cau.cacO.forEach(function (o, k) { setTimeout(function () { if (ma !== maChieu) return; o.classList.add("hien"); window.AmThanh.vongQuayTick(); }, k * 90); });
    setTimeout(function () {
      if (ma !== maChieu) return; // MC đã sang câu khác: không hiện giải thích của câu cũ
      $("sk-goi-y").hidden = Boolean(c.giaiThich); // giải thích đã chứa đáp án, cất gợi ý cho gọn màn hình
      $("sk-giai-thich").hidden = !c.giaiThich;
      $("sk-giai-thich").textContent = c.giaiThich || "";
      window.AmThanh.latDapAn();
      window.Phao.banHaiBen($("phao-dh"), 1.2);
    }, cau.cacO.length * 90 + 200);
    capNhatNut();
  }

  function tienBuoc() {
    var c = chieu[viTri];
    if (!c || !cau) return;
    var conChe = !cau.moHetHinh && veTranh && !$("dh-canvas").hidden && veTranh.conManh() > 0;
    if (cau.buoc === 0 && conChe) {
      dungDongHo(); veTranh.moHet(); cau.moHetHinh = true; $("dh-dong-ho").classList.add("het");
      window.AmThanh.moManh();
    } else if (cau.buoc === 0 && c.goiY) {
      cau.buoc = 1;
      $("sk-goi-y").hidden = false;
      $("sk-goi-y").textContent = c.goiY;
      window.AmThanh.moManh();
    } else if (cau.buoc < 2) {
      latDapAn();
      return;
    } else if (viTri < chieu.length - 1) {
      chonCau(viTri + 1);
      return;
    } else {
      moVinhDanh();
      return;
    }
    capNhatNut();
  }

  function goiYChu() {
    if (!cau || cau.buoc >= 2) return;
    var k = window.DuoiHinh.chonChuGoiY(chieu[viTri].dapAn, cau.chuGoiY);
    if (k < 0) return;
    cau.chuGoiY.push(k);
    cau.cacO[k].classList.add("goi-y-chu");
    window.AmThanh.vongQuayTick();
  }

  function moSanKhau(tuCau) {
    chieu = cauCuaLuot();
    if (!chieu.length) return;
    window.AmThanh.moKhoa();
    giaiDoan = "san-khau";
    window.VinhDanhDH.an();
    window.ManChoDH.dong();
    $("man-chuan-bi").hidden = true;
    $("man-san-khau").hidden = false;
    if (!veTranh) veTranh = window.VeTranh.tao($("dh-canvas"));
    chonCau(Math.min(tuCau, chieu.length - 1));
  }

  /** Bốc đề mới theo thiết lập rồi mở sân khấu. Lượt đang dở có ghi tên thì hỏi trước khi thay. */
  function batDauLuotMoi() {
    if (!tongDeThi()) return;
    var coKetQua = tt.luot && !tt.luot.xong && Object.keys(tt.luot.ketQua).length;
    if (coKetQua && !window.confirm("Lượt đang dở đã ghi tên người trả lời. Bắt đầu lượt mới sẽ xóa kết quả lượt đó và đưa điểm các đội về 0. Tiếp tục?")) return;
    var de = window.DuoiHinh.taoDeThi(tt.ds, tt.cauHinh.deThi);
    tt.luot = { ids: de.map(function (c) { return c.id; }), ketQua: {}, viTri: 0, xong: false };
    tt.diem = [0, 0, 0, 0];
    luu();
    moSanKhau(0);
  }

  function moVinhDanh() {
    if (!tt.luot) return;
    dungDongHo();
    var dsLuot = cauCuaLuot();
    var ketQua = dsLuot.map(function (c) { return tt.luot.ketQua[c.id] || null; });
    var bang = window.DuoiHinh.xepHangNguoi(ketQua);
    var soDung = ketQua.filter(Boolean).length;
    tt.luot = Object.assign({}, tt.luot, { xong: true });
    luu();
    giaiDoan = "vinh-danh";
    $("man-chuan-bi").hidden = true;
    $("man-san-khau").hidden = true;
    window.VinhDanhDH.hien({
      bang: bang,
      doi: TEN_DOI.slice(0, tt.cauHinh.soDoi).map(function (ten, i) { return { ten: ten, diem: tt.diem[i] }; }),
      tomTat: dsLuot.length + " câu đố · " + soDung + " câu có người trả lời đúng · " + bang.length + " người được ghi tên",
    });
  }

  /** Màn hình chờ chiếu trong lúc khán giả vào chỗ; Space ở đây bắt đầu lượt thi mới. */
  function moManCho() {
    if (!tongDeThi()) return;
    window.AmThanh.moKhoa();
    giaiDoan = "cho";
    $("man-chuan-bi").hidden = true;
    window.ManChoDH.mo({ soCau: tongDeThi(), mucDo: tt.cauHinh.deThi, soDoi: tt.cauHinh.soDoi, thoiGian: tt.cauHinh.thoiGian, phut: tt.cauHinh.phutCho });
  }

  function veChuanBi() {
    window.ManChoDH.dong();
    dungDongHo();
    if (veTranh) veTranh.dung();
    if (veCu) veCu.dung();
    window.VinhDanhDH.an();
    giaiDoan = "chuan-bi";
    $("man-san-khau").hidden = true;
    $("man-chuan-bi").hidden = false;
    luu();
  }

  function toanManHinh() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(function () {});
    else document.exitFullscreen();
  }

  function ganSuKien() {
    $("nut-them").addEventListener("click", function () { tt.ds.push(window.DuoiHinh.chuanHoa({ dapAn: "CÂU ĐỐ MỚI", goiY: "Gợi ý..." })); luu(); veDanhSach(); });
    $("o-muc-nap").addEventListener("change", capNhatNutMau);
    $("nut-mau").addEventListener("click", function () {
      var bo = window.DuoiHinh.boMau($("o-muc-nap").value);
      if (!tt.ds.length || window.confirm("Thay danh sách hiện tại bằng " + bo.length + " câu chơi chữ tranh Đông Hồ?")) { tt.ds = bo; luu(); veDanhSach(); }
    });
    $("nut-xep").addEventListener("click", function () { tt.ds = window.DuoiHinh.xepTheoMucDo(tt.ds); luu(); veDanhSach(); });
    $("nut-mau-cu").addEventListener("click", function () {
      if (!tt.ds.length || window.confirm("Thay danh sách bằng 8 câu hoạt họa bản cũ?")) { tt.ds = window.DuoiHinh.boHoatHoa(); luu(); veDanhSach(); }
    });
    $("o-thoi-gian").addEventListener("change", function () { tt.cauHinh.thoiGian = Number($("o-thoi-gian").value) || 0; luu(); });
    $("o-so-doi").addEventListener("change", function () { tt.cauHinh.soDoi = Number($("o-so-doi").value) || 0; luu(); });
    $("nut-xoa-diem").addEventListener("click", function () { if (window.confirm("Đưa điểm các đội về 0?")) { tt.diem = [0, 0, 0, 0]; luu(); } });
    $("o-am-thanh").addEventListener("change", function () { if ($("o-am-thanh").checked !== window.AmThanh.dangBat()) window.AmThanh.batTat(); });
    $("nut-vao").addEventListener("click", batDauLuotMoi);
    $("nut-man-cho").addEventListener("click", moManCho);
    $("o-phut-cho").addEventListener("change", function () { tt.cauHinh.phutCho = Number($("o-phut-cho").value) || 0; luu(); });
    $("nut-tiep-luot").addEventListener("click", function () { tt.luot = Object.assign({}, tt.luot, { xong: false }); moSanKhau(tt.luot.viTri); });
    $("nut-xem-vinh-danh").addEventListener("click", moVinhDanh);
    $("nut-vinh-danh").addEventListener("click", moVinhDanh);
    $("vd-quay-lai").addEventListener("click", function () { moSanKhau(tt.luot ? tt.luot.viTri : 0); });
    $("vd-ve").addEventListener("click", veChuanBi);
    $("form-ten").addEventListener("submit", function (e) { e.preventDefault(); ghiTen($("o-ten").value); });
    $("o-ten").addEventListener("focus", function () { $("o-ten").select(); });
    $("o-ten").addEventListener("keydown", function (e) { if (e.key === "Escape") { e.stopPropagation(); $("o-ten").blur(); } });
    $("o-tong-cau").addEventListener("change", function () {
      tt.cauHinh.deThi = window.DuoiHinh.chiaTheoTong($("o-tong-cau").value, window.DuoiHinh.demTheoMuc(tt.ds));
      $("o-tong-cau").blur(); luu();
    });
    ["de", "vua", "kho", "khac"].forEach(function (m) {
      $("o-so-" + m).addEventListener("change", function () {
        var moi = Object.assign({}, tt.cauHinh.deThi); moi[m] = Number($("o-so-" + m).value) || 0;
        tt.cauHinh.deThi = moi; $("o-so-" + m).blur(); luu();
      });
    });
    $("nut-ve").addEventListener("click", veChuanBi);
    $("nut-truoc").addEventListener("click", function () { chonCau(viTri - 1); });
    $("nut-sau").addEventListener("click", function () { chonCau(viTri + 1); });
    $("nut-buoc").addEventListener("click", tienBuoc);
    $("nut-chu").addEventListener("click", goiYChu);

    document.addEventListener("keydown", function (e) {
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
      if (e.key === "f" || e.key === "F") { toanManHinh(); return; }
      if (e.key === "m" || e.key === "M") { $("o-am-thanh").checked = window.AmThanh.batTat(); return; }
      if (giaiDoan === "chuan-bi") {
        if (e.code === "Space" && !$("nut-vao").disabled) { e.preventDefault(); batDauLuotMoi(); }
        else if (e.key === "c" || e.key === "C") moManCho();
        return;
      }
      if (giaiDoan === "cho") {
        if (e.code === "Space" || e.key === "Enter") { e.preventDefault(); batDauLuotMoi(); }
        else if (e.key === "+" || e.key === "=") window.ManChoDH.doiPhut(1);
        else if (e.key === "-" || e.key === "_") window.ManChoDH.doiPhut(-1);
        else if (e.key === "Escape") veChuanBi();
        return;
      }
      if (giaiDoan === "vinh-danh") {
        if (e.key === "Escape") veChuanBi();
        return;
      }
      if (e.code === "Space" || e.key === "Enter") { e.preventDefault(); tienBuoc(); }
      else if (e.key === "h" || e.key === "H") goiYChu();
      else if (e.key === "n" || e.key === "N") { e.preventDefault(); $("o-ten").focus(); $("o-ten").select(); }
      else if (e.key === "v" || e.key === "V") moVinhDanh();
      else if (/^[1-4]$/.test(e.key)) chamDiem(Number(e.key) - 1);
      else if (e.key === "ArrowLeft") chonCau(viTri - 1);
      else if (e.key === "ArrowRight") chonCau(viTri + 1);
      else if (e.key === "Escape") veChuanBi();
    });
  }

  napDaLuu();
  capNhatNutMau();
  veDanhSach();
  ganSuKien();
  luu();
})();
