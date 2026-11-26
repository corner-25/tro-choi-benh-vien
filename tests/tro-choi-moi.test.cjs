const { test } = require("node:test");
const assert = require("node:assert/strict");
const VongQuay = require("../js/vong-quay/vong-quay.js");
const DoVui = require("../js/do-vui/do-vui.js");
const DoanSo = require("../js/doan-so/doan-so.js");
const Plinko = require("../js/plinko/plinko.js");
const LongCau = require("../js/long-cau/long-cau.js");
const HopBiAn = require("../js/hop-bi-an/hop-bi-an.js");
const OChu = require("../js/o-chu/o-chu.js");
const DuoiHinh = require("../js/duoi-hinh/duoi-hinh.js");

test("Vòng quay: đọc mục từ văn bản, lọc trùng không phân biệt hoa thường và trích đơn vị", () => {
  assert.deepEqual(VongQuay.docMucTuVanBan("Khoa Dược\n\nkhoa dược\nKhoa Mắt\n  Khoa Cấp cứu  "), ["Khoa Dược", "Khoa Mắt", "Khoa Cấp cứu"]);
  const dv = VongQuay.layDonViTuDanhSach([
    { ma: "1", donVi: "Phòng Hành chính" },
    { ma: "2", donVi: "Khoa Dược" },
    { ma: "3", donVi: "khoa dược" },
    { ma: "4", donVi: "" },
  ]);
  assert.deepEqual(dv, ["Khoa Dược", "Phòng Hành chính"]);
});

test("Vòng quay: lọc mục đã trúng, giữ lại mục bị hủy", () => {
  const tatCa = ["A", "B", "C"];
  const kq = [{ muc: "A", trangThai: "trung" }, { muc: "B", trangThai: "huy" }];
  assert.deepEqual(VongQuay.mucConLai(tatCa, kq, true), ["B", "C"]);
  assert.deepEqual(VongQuay.mucConLai(tatCa, kq, false), ["A", "B", "C"]);
});

test("Vòng quay: tính góc dừng chính xác đúng ô dưới kim chỉ", () => {
  for (const tongSo of [2, 6, 8, 17, 63]) {
    for (let chiSo = 0; chiSo < tongSo; chiSo += 1) {
      const gocDich = VongQuay.tinhGocDung(1.23, chiSo, tongSo, 6, () => 0.5);
      assert.equal(VongQuay.chiSoTaiKim(gocDich, tongSo), chiSo, `sai ô với tongSo=${tongSo}, chiSo=${chiSo}`);
    }
  }
});

test("Vòng quay: bốc ngẫu nhiên đều (chi-square)", () => {
  const muc = Array.from({ length: 8 }, (_, i) => "Ô " + i);
  const dem = new Array(8).fill(0);
  const LUOT = 16000;
  for (let i = 0; i < LUOT; i += 1) dem[VongQuay.bocMuc(muc).chiSo] += 1;
  const kyVong = LUOT / 8;
  const chi2 = dem.reduce((s, d) => s + ((d - kyVong) ** 2) / kyVong, 0);
  // Ngưỡng chi-square 7 bậc tự do, mức ý nghĩa 0,001 là 24,3.
  assert.ok(chi2 < 24.3, `phân bố lệch: ${dem.join(", ")} (chi² = ${chi2.toFixed(1)})`);
});

test("Đố vui: đọc câu hỏi 2 và 4 lựa chọn từ văn bản, báo lỗi dòng sai", () => {
  const vanBan = [
    "Câu hỏi\tA\tB\tĐáp án\tGiải thích",
    "Câu 1?\tĐúng\tSai\tA\tVì A đúng",
    "Câu 2?\tP1\tP2\tP3\tP4\tC\tVì C đúng",
    "Dòng lỗi\tThiếu cột",
  ].join("\n");
  const kq = DoVui.docTuVanBan(vanBan);
  assert.equal(kq.cauHoi.length, 2);
  assert.equal(kq.cauHoi[0].dapAn, 0);
  assert.equal(kq.cauHoi[1].luaChon.length, 4);
  assert.equal(kq.cauHoi[1].dapAn, 2);
  assert.equal(kq.loi.length, 1);
});

test("Đố vui: trợ giúp 50:50 luôn loại đúng 2 đáp án sai và không bao giờ loại đáp án đúng", () => {
  const cau = DoVui.chuanHoaCauHoi({ cauHoi: "Test", luaChon: ["A", "B", "C", "D"], dapAn: 2 });
  for (let i = 0; i < 50; i += 1) {
    const biLoai = DoVui.loc5050(cau);
    assert.equal(biLoai.length, 2);
    assert.notEqual(biLoai[0], biLoai[1]);
    assert.equal(biLoai.includes(2), false);
  }
  assert.deepEqual(DoVui.loc5050({ luaChon: ["A", "B"], dapAn: 0 }), []);
});

test("Đoán con số: định dạng số và tìm khu vực đoán gần nhất (kể cả đồng hạng)", () => {
  assert.equal(DoanSo.dinhDangSo(1994), "1.994");
  assert.equal(DoanSo.dinhDangSo(1250000), "1.250.000");

  const kq1 = DoanSo.timDoiGanNhat(1000, [
    { ten: "Khu A", giaTri: 950 },
    { ten: "Khu B", giaTri: 1020 },
    { ten: "Khu C", giaTri: null },
  ]);
  assert.deepEqual(kq1.thang, [1]);
  assert.equal(kq1.minLech, 20);

  const kqDongHang = DoanSo.timDoiGanNhat(500, [
    { ten: "Khu A", giaTri: 480 },
    { ten: "Khu B", giaTri: 520 },
  ]);
  assert.deepEqual(kqDongHang.thang, [0, 1]);
  assert.equal(kqDongHang.minLech, 20);
});

test("Plinko: chọn người thả không trùng, loại người đã thả và tính đúng ô đáy", () => {
  const ds = Array.from({ length: 30 }, (_, i) => ({ ma: "M" + i, ten: "N" + i, donVi: "K" }));
  const chon = Plinko.chonNguoiTha(ds, ["m0", "M1"], 10, true);
  assert.equal(chon.length, 10);
  assert.equal(new Set(chon.map((x) => x.ma)).size, 10);
  assert.equal(chon.some((x) => x.ma === "M0" || x.ma === "M1"), false);
  assert.equal(Plinko.tinhO(0.5, 7), 3); // ô giữa là Giải Đặc biệt
  assert.equal(Plinko.tinhO(0.05, 7), 0);
  assert.equal(Plinko.tinhO(0.95, 7), 6);
});

test("Lồng cầu: lọc người đã trúng/vắng mặt và bốc ngẫu nhiên đều (chi-square)", () => {
  const ds = Array.from({ length: 8 }, (_, i) => ({ ma: "C" + i, ten: "T" + i }));
  const kq = [{ ma: "c0", trangThai: "trung" }, { ma: "C1", trangThai: "huy" }];
  assert.equal(LongCau.conTrongLong(ds, kq).length, 6);

  const dem = new Map();
  const LUOT = 16000;
  for (let i = 0; i < LUOT; i += 1) {
    const n = LongCau.bocCau(ds);
    dem.set(n.ma, (dem.get(n.ma) || 0) + 1);
  }
  const kyVong = LUOT / 8;
  const chi2 = [...dem.values()].reduce((s, d) => s + ((d - kyVong) ** 2) / kyVong, 0);
  assert.ok(chi2 < 24.3, `Lồng cầu lệch: chi² = ${chi2.toFixed(1)}`);
});

test("Hộp Bí Ẩn: xáo trộn đủ tất cả phần thưởng và phân loại chính xác", () => {
  const hop = HopBiAn.xaoHop(HopBiAn.BO_MAU_12);
  assert.equal(hop.length, 12);
  assert.deepEqual(hop.map((h) => h.so), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  assert.equal(hop.filter((h) => h.loai === "dac-biet").length, 1);
  assert.equal(HopBiAn.phanLoai("Giải Đặc Biệt"), "dac-biet");
  assert.equal(HopBiAn.phanLoai("Nhân đôi phần quà"), "dac-quyen");
});

test("Lật Ô Chữ & Đuổi hình bắt chữ: khớp tiếng Việt có dấu không cần gõ dấu", () => {
  const tu = "ĐỔI MỚI SÁNG TẠO";
  assert.deepEqual(OChu.doanChu(tu, "D"), [0]);
  assert.deepEqual(OChu.doanChu(tu, "O"), [1, 5, 15]);
  assert.deepEqual(OChu.doanChu(tu, "A"), [9, 14]);
  assert.equal(OChu.daMoHet("AN", [0, 1]), true);
  assert.equal(OChu.daMoHet("AN", [0]), false);

  const dh = DuoiHinh.demTu("KẸT THANG MÁY");
  assert.deepEqual(dh.map((x) => x.doDai), [3, 5, 3]);
  assert.equal(DuoiHinh.boMau().length, 10);
  assert.equal(DuoiHinh.boHoatHoa().length, 8);
});

test("Đuổi hình bắt chữ: bộ mẫu là câu chơi chữ, gợi ý chữ cái không trùng, điểm giảm dần theo gợi ý", () => {
  assert.ok(DuoiHinh.boMau().every((c) => c.canhId.startsWith("tranh:") && c.giaiThich.includes("=")));
  const daMo = [];
  for (let i = 0; i < 8; i += 1) { const k = DuoiHinh.chonChuGoiY("CÔNG ĐOÀN", daMo); assert.ok(k >= 0 && k < 8 && !daMo.includes(k)); daMo.push(k); }
  assert.equal(DuoiHinh.chonChuGoiY("CÔNG ĐOÀN", daMo), -1);
  assert.equal(DuoiHinh.diemThuong({}), 3);
  assert.equal(DuoiHinh.diemThuong({ moHetHinh: true }), 2);
  assert.equal(DuoiHinh.diemThuong({ daGoiY: true }), 2);
  assert.equal(DuoiHinh.diemThuong({ daGoiY: true, soChuGoiY: 2 }), 1);
});

test("Đuổi hình bắt chữ: 10 câu chia 3 mức, không trùng tranh, xếp dễ → khó, lọc được theo mức", () => {
  const bo = DuoiHinh.boMau();
  assert.deepEqual(bo.map((c) => c.dapAn), ["CÔNG ĐOÀN", "BĂNG CA", "TRỰC ĐÊM", "BÁC SĨ", "SIÊU ÂM", "ĐẠI BIỂU", "NỘI SOI", "NỘI TRÚ", "Y TÁ", "KHẨU TRANG"]);
  assert.equal(new Set(bo.map((c) => c.canhId)).size, bo.length);
  assert.equal(new Set(bo.map((c) => c.dapAn)).size, bo.length);
  assert.ok(bo.every((c) => ["de", "vua", "kho"].includes(c.mucDo)));
  const thuTu = { de: 0, vua: 1, kho: 2 };
  for (let i = 1; i < bo.length; i += 1) assert.ok(thuTu[bo[i - 1].mucDo] <= thuTu[bo[i].mucDo], "lệch thứ tự ở câu " + (i + 1));
  assert.deepEqual(["de", "vua", "kho"].map((m) => DuoiHinh.boMau(m).length), [4, 3, 3]);
  assert.ok(DuoiHinh.boMau("kho").every((c) => c.mucDo === "kho"));
  assert.equal(DuoiHinh.boMau("la-lam").length, 10); // mức lạ → trả cả bộ
  // Mức độ lạ bị bỏ, câu tự thêm chưa phân loại
  assert.equal(DuoiHinh.chuanHoa({ mucDo: "<script>" }).mucDo, "");
  assert.equal(DuoiHinh.tenMucDo("vua"), "Vừa");
  // Xếp lại không làm đổi mảng gốc; câu chưa phân loại xuống cuối, giữ thứ tự ổn định
  const goc = [{ mucDo: "kho", id: "a" }, { mucDo: "", id: "b" }, { mucDo: "de", id: "c" }, { mucDo: "de", id: "d" }];
  assert.deepEqual(DuoiHinh.xepTheoMucDo(goc).map((c) => c.id), ["c", "d", "a", "b"]);
  assert.deepEqual(goc.map((c) => c.id), ["a", "b", "c", "d"]);
});

test("Đuổi hình bắt chữ: chia tổng số câu theo mức, không vượt số câu có sẵn", () => {
  const coSan = { de: 12, vua: 9, kho: 4, khac: 0 };
  const c10 = DuoiHinh.chiaTheoTong(10, coSan);
  assert.equal(c10.de + c10.vua + c10.kho + c10.khac, 10);
  assert.ok(c10.de >= c10.vua && c10.vua >= c10.kho && c10.kho >= 1, JSON.stringify(c10));
  // Hết câu khó thì dồn sang mức khác; quá tổng có sẵn thì lấy tối đa
  const c24 = DuoiHinh.chiaTheoTong(24, coSan);
  assert.ok(c24.kho <= 4 && c24.de <= 12 && c24.vua <= 9);
  assert.equal(c24.de + c24.vua + c24.kho, 24);
  assert.deepEqual(DuoiHinh.chiaTheoTong(99, coSan), { de: 12, vua: 9, kho: 4, khac: 0 });
  assert.deepEqual(DuoiHinh.chiaTheoTong(0, coSan), { de: 0, vua: 0, kho: 0, khac: 0 });
  assert.deepEqual(DuoiHinh.chiaTheoTong(-3, coSan), { de: 0, vua: 0, kho: 0, khac: 0 });
  // Bộ chỉ có câu chưa phân loại
  assert.deepEqual(DuoiHinh.chiaTheoTong(3, { de: 0, vua: 0, kho: 0, khac: 5 }), { de: 0, vua: 0, kho: 0, khac: 3 });
  assert.deepEqual(DuoiHinh.demTheoMuc(DuoiHinh.boMau()), { de: 4, vua: 3, kho: 3, khac: 0 });
  assert.deepEqual(DuoiHinh.chiaTheoTong(10, DuoiHinh.demTheoMuc(DuoiHinh.boMau())), { de: 4, vua: 3, kho: 3, khac: 0 });
});

test("Đuổi hình bắt chữ: tạo đề thi đúng số câu mỗi mức, không trùng, xếp dễ → khó, không sửa bộ gốc", () => {
  const bo = DuoiHinh.boMau();
  const goc = JSON.stringify(bo);
  const de = DuoiHinh.taoDeThi(bo, { de: 3, vua: 2, kho: 1 });
  assert.equal(de.length, 6);
  assert.deepEqual(de.map((c) => c.mucDo), ["de", "de", "de", "vua", "vua", "kho"]);
  assert.equal(new Set(de.map((c) => c.canhId)).size, 6);
  assert.equal(JSON.stringify(bo), goc);
  de[0].dapAn = "ĐÃ SỬA";
  assert.equal(JSON.stringify(bo), goc);
  // Xin nhiều hơn số có: lấy hết số có; số lạ coi như 0
  assert.equal(DuoiHinh.taoDeThi(bo, { kho: 50, de: "abc", vua: -2 }).length, 3);
  // Ngẫu nhiên: rng cố định cho kết quả lặp lại được
  const rng = () => 0;
  assert.deepEqual(DuoiHinh.taoDeThi(bo, { de: 2 }, rng).map((c) => c.id), DuoiHinh.taoDeThi(bo, { de: 2 }, rng).map((c) => c.id));
});

test("Đuổi hình bắt chữ: chuẩn hóa tên người trả lời và xếp hạng vinh danh", () => {
  assert.equal(DuoiHinh.chuanTen("  nguyễn   văn  An "), "nguyễn văn An");
  assert.equal(DuoiHinh.chuanTen("x".repeat(100)).length, 60);
  assert.equal(DuoiHinh.chuanTen(null), "");
  const ketQua = [
    { ten: "Lan", diem: 3 }, null, { ten: "Minh", diem: 2 }, { ten: "lan", diem: 1 },
    { ten: "Hùng", diem: 3 }, { ten: "  ", diem: 3 }, { ten: "Minh", diem: 2 }, { ten: "Tú", diem: 1 },
  ];
  const bang = DuoiHinh.xepHangNguoi(ketQua);
  assert.deepEqual(bang.map((n) => [n.ten, n.diem, n.soCau, n.hang]), [
    ["Lan", 4, 2, 1], ["Minh", 4, 2, 1], ["Hùng", 3, 1, 3], ["Tú", 1, 1, 4],
  ]);
  assert.deepEqual(DuoiHinh.xepHangNguoi([]), []);
});
