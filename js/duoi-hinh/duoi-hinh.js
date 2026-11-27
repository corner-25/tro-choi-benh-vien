/* Logic thuần cho Đuổi hình bắt chữ – Đời sống Bệnh viện. Không đụng DOM; dùng được trong trình duyệt và test Node. */
(function (root) {
  "use strict";

  /** Mức độ câu đố: rỗng nghĩa là chưa phân loại (câu do MC tự thêm). */
  var MUC_DO = { de: "Dễ", vua: "Vừa", kho: "Khó" };
  var THU_TU_MUC = { de: 0, vua: 1, kho: 2 };

  function maMoi() { return "dh" + Date.now().toString(36) + Math.floor(Math.random() * 1e5).toString(36); }

  function chuanHoa(c) {
    return {
      id: typeof (c && c.id) === "string" && c.id ? c.id.slice(0, 40) : maMoi(),
      canhId: String((c && c.canhId) || "tranh:cong-doan").slice(0, 40),
      dapAn: String((c && c.dapAn) || "TRỰC ĐÊM").trim().replace(/\s+/g, " ").toUpperCase().slice(0, 48),
      goiY: String((c && c.goiY) || "").trim().slice(0, 200),
      giaiThich: String((c && c.giaiThich) || "").trim().slice(0, 240),
      anh: (c && typeof c.anh === "string") ? c.anh : null,
      mucDo: MUC_DO[c && c.mucDo] ? c.mucDo : "",
    };
  }

  /** Tách đáp án thành mảng các từ và số chữ cái của từng từ để hiện ô gợi ý độ dài. */
  function demTu(dapAn) {
    return String(dapAn || "").trim().split(/\s+/).filter(Boolean).map(function (tu) {
      return { tu: tu, doDai: tu.length };
    });
  }

  /** Bộ câu hoạt họa minh họa nghĩa (bản cũ), vẫn giữ để dùng lại. */
  function boHoatHoa() {
    return [
      { canhId: "truc-dem", dapAn: "TRỰC ĐÊM", goiY: "2 từ · Nỗi lòng quen thuộc của anh chị em bệnh viện lúc 2 giờ sáng.", giaiThich: "Trăng sao + đồng hồ 2 giờ + tách cà phê nóng + ống nghe: Ca trực đêm bền bỉ vì người bệnh!" },
      { canhId: "ket-thang-may", dapAn: "KẸT THANG MÁY", goiY: "3 từ · Một 'đặc sản' giờ cao điểm sáng thứ Hai ở bệnh viện.", giaiThich: "Cửa thang máy nhấp nháy báo đầy giữa giờ giao ban – ý kiến quen thuộc trong các kỳ hội nghị!" },
      { canhId: "cap-cuu", dapAn: "CẤP CỨU", goiY: "2 từ · Nơi mọi giây phút đều tính bằng nhịp tim.", giaiThich: "Đèn ưu tiên chớp xanh đỏ + nhịp tim ECG chạy nhanh: Khoa Cấp cứu 24/7!" },
      { canhId: "chuyen-doi-so", dapAn: "CHUYỂN ĐỔI SỐ", goiY: "3 từ · Hồ sơ giấy hóa thành dữ liệu thông minh.", giaiThich: "Tập hồ sơ giấy đi qua tia quét thành dãy số 0–1 trên máy tính bảng: Chuyển đổi số y tế!" },
      { canhId: "bac-si-noi-tru", dapAn: "BÁC SĨ NỘI TRÚ", goiY: "4 từ · Vừa làm việc, vừa học, vừa coi bệnh viện như nhà.", giaiThich: "Ống nghe + mái nhà + chiếc giường nằm ngay trong tòa nhà bệnh viện!" },
      { canhId: "tai-kham", dapAn: "TÁI KHÁM", goiY: "2 từ · Lời dặn quen thuộc ở cuối mỗi toa thuốc.", giaiThich: "Tờ lịch lật sang tuần mới kèm mũi tên quay trở lại gặp bác sĩ!" },
      { canhId: "giao-ban", dapAn: "GIAO BAN", goiY: "2 từ · Hoạt động mở đầu mỗi buổi sáng tại các khoa phòng.", giaiThich: "Mặt trời mọc + bàn tròn truyền gậy tiếp sức thông tin ca trực!" },
      { canhId: "phong-mo", dapAn: "PHÒNG MỔ", goiY: "2 từ · Nơi tập trung cao độ dưới ánh đèn không hắt bóng.", giaiThich: "Chùm đèn phẫu thuật rọi sáng cùng đường sóng sinh hiệu đều nhịp!" },
    ].map(chuanHoa);
  }

  /**
   * Bộ câu đố CHƠI CHỮ ĐỒNG ÂM (đúng kiểu đuổi hình bắt chữ): hai hình ghép lại đọc thành một từ của bệnh viện.
   * canhId bắt đầu bằng "tranh:" được vẽ theo phong cách tranh Đông Hồ (js/duoi-hinh/ve-tranh.js).
   */
  function boMau(mucDo) {
    var ds = [
      // ── Dễ: hai hình đọc thẳng ra từ ──
      { mucDo: "de", canhId: "tranh:cong-doan", dapAn: "CÔNG ĐOÀN", goiY: "2 từ · Mái nhà chung của viên chức, người lao động.", giaiThich: "Con CÔNG + ĐOÀN tàu = CÔNG ĐOÀN!" },
      { mucDo: "de", canhId: "tranh:bang-ca", dapAn: "BĂNG CA", goiY: "2 từ · Đưa người bệnh từ xe cứu thương vào khoa.", giaiThich: "Tảng BĂNG trôi + cái CA = BĂNG CA!" },
      { mucDo: "de", canhId: "tranh:truc-dem", dapAn: "TRỰC ĐÊM", goiY: "2 từ · Ca làm việc thức trắng vì người bệnh.", giaiThich: "TRỰC thăng + trăng sáng ban ĐÊM = TRỰC ĐÊM!" },
      { mucDo: "de", canhId: "tranh:bac-si", dapAn: "BÁC SĨ", goiY: "2 từ · Người khoác áo blouse trắng, cầm ống nghe.", giaiThich: "Cháu khoanh tay chào BÁC + quân SĨ trên bàn cờ tướng = BÁC SĨ!" },
      // ── Vừa: phải nghĩ thêm một bước ──
      { mucDo: "vua", canhId: "tranh:sieu-am", dapAn: "SIÊU ÂM", goiY: "2 từ · Nhìn thấy em bé trước khi chào đời.", giaiThich: "SIÊU nhân + nốt nhạc ngân ÂM thanh = SIÊU ÂM!" },
      { mucDo: "vua", canhId: "tranh:dai-bieu", dapAn: "ĐẠI BIỂU", goiY: "2 từ · Những người đang ngồi trong hội trường hôm nay.", giaiThich: "Chim ĐẠI bàng + BIỂU đồ = ĐẠI BIỂU!" },
      { mucDo: "vua", canhId: "tranh:noi-soi", dapAn: "NỘI SOI", goiY: "2 từ · Nhìn tận bên trong dạ dày mà không cần mổ.", giaiThich: "Cháu gọi bà NỘI + kính lúp SOI con bọ rùa = NỘI SOI!" },
      // ── Khó: chơi chữ xa hơn ──
      { mucDo: "kho", canhId: "tranh:noi-tru", dapAn: "NỘI TRÚ", goiY: "2 từ · Bác sĩ trẻ ăn ngủ ở bệnh viện suốt mấy năm học.", giaiThich: "Cháu gọi bà NỘI + đứng TRÚ mưa dưới mái hiên = NỘI TRÚ!" },
      { mucDo: "kho", canhId: "tranh:y-ta", dapAn: "Y TÁ", goiY: "2 từ · Cách gọi quen thuộc của người điều dưỡng.", giaiThich: "Chữ Y + một TÁ trứng (12 quả) = Y TÁ!" },
      { mucDo: "kho", canhId: "tranh:khau-trang", dapAn: "KHẨU TRANG", goiY: "2 từ · Vật bất ly thân của nhân viên y tế.", giaiThich: "KHẨU là cái miệng (chữ Hán 口) + TRANG sách = KHẨU TRANG!" },
    ];
    var loc = MUC_DO[mucDo] ? ds.filter(function (c) { return c.mucDo === mucDo; }) : ds;
    return loc.map(chuanHoa);
  }

  /** Nhãn hiển thị của mức độ ("Dễ", "Vừa", "Khó"), rỗng khi chưa phân loại. */
  function tenMucDo(mucDo) { return MUC_DO[mucDo] || ""; }

  /** Sắp xếp ổn định theo mức độ dễ → khó; câu chưa phân loại giữ chỗ sau cùng. Trả mảng mới. */
  function xepTheoMucDo(ds) {
    return (ds || []).map(function (c, i) { return { c: c, i: i }; }).sort(function (a, b) {
      var x = a.c.mucDo in THU_TU_MUC ? THU_TU_MUC[a.c.mucDo] : 9, y = b.c.mucDo in THU_TU_MUC ? THU_TU_MUC[b.c.mucDo] : 9;
      return x - y || a.i - b.i;
    }).map(function (o) { return o.c; });
  }

  // ── Đề thi: chọn một lượt câu từ bộ câu theo số lượng từng mức ──
  var CAC_MUC = ["de", "vua", "kho", "khac"];
  var TY_LE_MUC = { de: 0.5, vua: 0.3, kho: 0.2, khac: 0 };

  function rngMatMa() {
    var c = (typeof globalThis !== "undefined" && globalThis.crypto) || null;
    if (c && c.getRandomValues) {
      var buf = new Uint32Array(1);
      return function () { c.getRandomValues(buf); return buf[0] / 4294967296; };
    }
    return Math.random;
  }

  function soNguyenKhongAm(x) { var n = Math.floor(Number(x)); return isFinite(n) && n > 0 ? n : 0; }
  function mucCua(c) { return MUC_DO[c && c.mucDo] ? c.mucDo : "khac"; }

  /** Đếm số câu từng mức trong bộ: { de, vua, kho, khac } (khac = chưa phân loại). */
  function demTheoMuc(ds) {
    var dem = { de: 0, vua: 0, kho: 0, khac: 0 };
    (ds || []).forEach(function (c) { dem[mucCua(c)] += 1; });
    return dem;
  }

  /**
   * Chia tổng số câu muốn thi thành số câu từng mức theo tỷ lệ 5 dễ : 3 vừa : 2 khó,
   * không vượt số câu có sẵn; mức nào thiếu thì dồn sang mức còn câu (câu chưa phân loại dùng sau cùng).
   */
  function chiaTheoTong(tong, coSan) {
    var co = {}, chia = {};
    CAC_MUC.forEach(function (m) { co[m] = soNguyenKhongAm(coSan && coSan[m]); chia[m] = 0; });
    var n = Math.min(soNguyenKhongAm(tong), co.de + co.vua + co.kho + co.khac);
    CAC_MUC.forEach(function (m) { chia[m] = Math.min(co[m], Math.floor(n * TY_LE_MUC[m])); });
    var con = n - CAC_MUC.reduce(function (t, m) { return t + chia[m]; }, 0);
    while (con > 0) {
      var tot = null, thieuNhat = -Infinity;
      CAC_MUC.forEach(function (m) {
        if (chia[m] >= co[m]) return;
        var thieu = n * TY_LE_MUC[m] - chia[m];
        if (thieu > thieuNhat) { thieuNhat = thieu; tot = m; }
      });
      chia[tot] += 1; con -= 1;
    }
    return chia;
  }

  /**
   * Tạo đề thi: lấy ngẫu nhiên đúng số câu mỗi mức (tối đa số câu có), xếp dễ → vừa → khó → chưa phân loại.
   * Trả bản sao từng câu, không sửa bộ gốc.
   */
  function taoDeThi(ds, soLuong, rng) {
    var ngauNhien = rng || rngMatMa();
    var de = [];
    CAC_MUC.forEach(function (m) {
      var nhom = (ds || []).filter(function (c) { return mucCua(c) === m; }).slice();
      var lay = Math.min(nhom.length, soNguyenKhongAm(soLuong && soLuong[m]));
      for (var i = 0; i < lay; i += 1) {
        var j = i + Math.floor(ngauNhien() * (nhom.length - i));
        var tam = nhom[i]; nhom[i] = nhom[j]; nhom[j] = tam;
      }
      nhom.slice(0, lay).forEach(function (c) { de.push(Object.assign({}, c)); });
    });
    return de;
  }

  // ── Tên sự kiện ──
  var VC_NLD = /(^|[^\p{L}\p{N}])VC\s*[-–,/&]?\s*NLĐ(?![\p{L}\p{N}])/giu;
  var NLD = /(^|[^\p{L}\p{N}])NLĐ(?![\p{L}\p{N}])/giu;
  /** Viết đầy đủ chữ viết tắt trong tên sự kiện để chiếu: VC-NLĐ → Viên chức, Người lao động; NLĐ → Người lao động. */
  function moRongVietTat(ten) {
    return String(ten == null ? "" : ten)
      .replace(VC_NLD, function (_, truoc) { return truoc + "Viên chức, Người lao động"; })
      .replace(NLD, function (_, truoc) { return truoc + "Người lao động"; });
  }

  // ── Người trả lời và vinh danh ──
  /** Gọn khoảng trắng, tối đa 60 ký tự. */
  function chuanTen(ten) { return String(ten == null ? "" : ten).trim().replace(/\s+/g, " ").slice(0, 60); }

  /**
   * Gộp kết quả từng câu ({ ten, diem } hoặc null) thành bảng xếp hạng người chơi.
   * Tên so khớp không phân biệt hoa thường; điểm bằng nhau thì xét số câu, rồi ai trả lời trước.
   * Đồng điểm và đồng số câu thì đồng hạng (1, 1, 3…).
   */
  function xepHangNguoi(ketQua) {
    var theoKhoa = {}, ds = [];
    (ketQua || []).forEach(function (kq) {
      var ten = chuanTen(kq && kq.ten);
      if (!ten) return;
      var khoa = ten.toLocaleLowerCase("vi");
      if (!theoKhoa[khoa]) { theoKhoa[khoa] = { ten: ten, diem: 0, soCau: 0, thuTu: ds.length }; ds.push(theoKhoa[khoa]); }
      theoKhoa[khoa].diem += soNguyenKhongAm(kq.diem);
      theoKhoa[khoa].soCau += 1;
    });
    ds.sort(function (a, b) { return b.diem - a.diem || b.soCau - a.soCau || a.thuTu - b.thuTu; });
    var bang = [];
    ds.forEach(function (n, i) {
      var truoc = ds[i - 1];
      var dongHang = truoc && truoc.diem === n.diem && truoc.soCau === n.soCau;
      bang.push({ ten: n.ten, diem: n.diem, soCau: n.soCau, hang: dongHang ? bang[i - 1].hang : i + 1 });
    });
    return bang;
  }

  /**
   * Chọn ngẫu nhiên một vị trí chữ cái chưa mở để gợi ý (bỏ qua khoảng trắng).
   * daMo: mảng vị trí đã mở. Trả -1 khi đã mở hết.
   */
  function chonChuGoiY(dapAn, daMo, rng) {
    var mo = new Set(daMo || []);
    var ung = [];
    String(dapAn || "").replace(/\s+/g, "").split("").forEach(function (_, i) { if (!mo.has(i)) ung.push(i); });
    if (!ung.length) return -1;
    return ung[Math.floor((rng || Math.random)() * ung.length)];
  }

  /**
   * Điểm cho đội đoán đúng: 3 điểm khi hình còn che, 2 điểm khi đã mở hết hình hoặc đã đọc gợi ý,
   * 1 điểm khi đã phải gợi ý chữ cái.
   */
  function diemThuong(tinhTrang) {
    var t = tinhTrang || {};
    if (t.soChuGoiY > 0) return 1;
    if (t.moHetHinh || t.daGoiY) return 2;
    return 3;
  }

  var api = { chuanHoa: chuanHoa, demTu: demTu, boMau: boMau, tenMucDo: tenMucDo, xepTheoMucDo: xepTheoMucDo, demTheoMuc: demTheoMuc, chiaTheoTong: chiaTheoTong, taoDeThi: taoDeThi, chuanTen: chuanTen, xepHangNguoi: xepHangNguoi, moRongVietTat: moRongVietTat, boHoatHoa: boHoatHoa, chonChuGoiY: chonChuGoiY, diemThuong: diemThuong };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.DuoiHinh = api;
})(typeof window !== "undefined" ? window : globalThis);
