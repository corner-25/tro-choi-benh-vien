const { test } = require("node:test");
const assert = require("node:assert/strict");
const DanhSach = require("../js/chung/danh-sach.js");
const Dua = require("../js/dua-vit/dua.js");

test("Dán từ Excel có tiêu đề: nhận cột theo tên, bỏ dòng trống", () => {
  const kq = DanhSach.docVanBan("STT\tHọ và tên\tMã NV\tKhoa/Phòng\n1\tNguyễn Văn A\tJ25-001\tKhoa Dược\n\n2\tTrần Thị B\tJ25-002\tKhoa Mắt\n");
  assert.deepEqual(kq.loi, []);
  assert.deepEqual(kq.nguoiChoi, [
    { ma: "J25-001", ten: "Nguyễn Văn A", donVi: "Khoa Dược" },
    { ma: "J25-002", ten: "Trần Thị B", donVi: "Khoa Mắt" },
  ]);
});

test("Không có tiêu đề: lấy Mã, Họ tên, Đơn vị theo thứ tự; nhận CSV dấu phẩy và chấm phẩy", () => {
  assert.equal(DanhSach.docVanBan("A1,Lê C,Khoa X\nA2,Phạm D").nguoiChoi.length, 2);
  assert.deepEqual(DanhSach.docVanBan("A3;Võ E;Phòng Y").nguoiChoi[0], { ma: "A3", ten: "Võ E", donVi: "Phòng Y" });
});

test("Mã trùng (không phân biệt hoa thường) bị bỏ và báo lỗi; thiếu mã báo lỗi; thiếu tên chỉ cảnh báo", () => {
  const kq = DanhSach.docVanBan("Mã nhân viên\tHọ tên\nab1\tNgười 1\nAB1\tNgười 2\n\tNgười 3\nAB4\t");
  assert.deepEqual(kq.nguoiChoi.map((n) => n.ma), ["ab1", "AB4"]);
  assert.equal(kq.loi.length, 2);
  assert.match(kq.loi[0], /trùng/);
  assert.match(kq.loi[1], /thiếu mã/);
  assert.equal(kq.canhBao.length, 1);
});

test("Danh sách trống báo lỗi", () => {
  assert.deepEqual(DanhSach.docVanBan("  \n ").loi, ["Danh sách trống."]);
});

test("Đọc giá trị ô Excel: rich text, công thức, số", () => {
  assert.equal(DanhSach.giaTriO({ richText: [{ text: "Nguyễn " }, { text: "A" }] }), "Nguyễn A");
  assert.equal(DanhSach.giaTriO({ formula: "A1", result: 12345 }), "12345");
  assert.equal(DanhSach.giaTriO(null), "");
});

test("Cuộc đua kết thúc khi đủ số người thắng, thứ hạng không trùng", () => {
  const thang = Dua.chayNhanh(320, { soNguoiThang: 5, rng: Dua.rngHatGiong(1) });
  assert.equal(thang.length, 5);
  assert.equal(new Set(thang).size, 5);
});

test("Cùng hạt giống cho cùng kết quả; khác hạt giống cho kết quả khác", () => {
  const a = Dua.chayNhanh(100, { rng: Dua.rngHatGiong(7) });
  assert.deepEqual(Dua.chayNhanh(100, { rng: Dua.rngHatGiong(7) }), a);
  assert.notDeepEqual(Dua.chayNhanh(100, { rng: Dua.rngHatGiong(8) }), a);
});

test("Thời gian đua của con về nhất gần với thời gian cài đặt", () => {
  const cd = Dua.taoCuocDua(300, { thoiGian: 30, soNguoiThang: 1, rng: Dua.rngHatGiong(3) });
  while (!cd.xong()) cd.buoc(1 / 60);
  const t = cd.thoiGianDaChay();
  assert.ok(t > 20 && t < 40, `thời gian ${t}`);
});

test("Công bằng: vị trí trong danh sách không ảnh hưởng khả năng thắng", () => {
  const SO_VIT = 8;
  const LUOT = 4000;
  const dem = new Array(SO_VIT).fill(0);
  const rng = Dua.rngHatGiong(2026);
  for (let i = 0; i < LUOT; i += 1) dem[Dua.chayNhanh(SO_VIT, { soNguoiThang: 1, thoiGian: 6, rng })[0]] += 1;
  const kyVong = LUOT / SO_VIT;
  const chiBinhPhuong = dem.reduce((s, d) => s + ((d - kyVong) ** 2) / kyVong, 0);
  // Ngưỡng chi-square 7 bậc tự do, mức ý nghĩa 0,001 là 24,3.
  assert.ok(chiBinhPhuong < 24.3, `phân bố người thắng lệch: ${dem.join(", ")} (chi² = ${chiBinhPhuong.toFixed(1)})`);
});

test("Làn bơi bốc ngẫu nhiên, chia đều các làn; có dòng xiết và xoáy nước", () => {
  const cd = Dua.taoCuocDua(100, { soLan: 10, rng: Dua.rngHatGiong(11) });
  const dem = new Array(10).fill(0);
  cd.vit.forEach((v) => { dem[v.lan] += 1; });
  assert.deepEqual(dem, new Array(10).fill(10));
  assert.notDeepEqual(cd.vit.slice(0, 10).map((v) => v.lan), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  assert.equal(cd.diaHinh.filter((z) => z.loai === "xiet").length, 3);
  assert.equal(cd.diaHinh.filter((z) => z.loai === "xoay").length, 3);
});

test("Cuộc đua có nhiều lần đổi ngôi dẫn đầu (trung bình từ 4 lần trở lên)", () => {
  let tong = 0;
  const LUOT = 30;
  for (let i = 0; i < LUOT; i += 1) {
    const cd = Dua.taoCuocDua(300, { thoiGian: 30, soNguoiThang: 1, rng: Dua.rngHatGiong(100 + i) });
    while (!cd.xong()) tong += cd.buoc(1 / 60).suKien.filter((s) => s.loai === "doi-ngoi").length;
  }
  assert.ok(tong / LUOT >= 4, `trung bình ${tong / LUOT} lần đổi ngôi`);
});

test("Chia bảng: chia đều danh sách, đủ tất cả người chơi và không trùng lặp", () => {
  const ds = Array.from({ length: 320 }, (_, i) => ({ ma: "M" + i, ten: "Người " + i, donVi: "Khoa " + (i % 6) }));
  const bang = Dua.chiaBang(ds, 6, Dua.rngHatGiong(42));
  assert.equal(bang.length, 6);
  const kichThuoc = bang.map((b) => b.length);
  assert.ok(Math.max(...kichThuoc) - Math.min(...kichThuoc) <= 1);
  const tatCa = bang.flat().map((n) => n.ma);
  assert.equal(tatCa.length, 320);
  assert.equal(new Set(tatCa).size, 320);
});

test("Danh sách đơn vị: gom duy nhất (không phân biệt hoa thường), đếm số thành viên và tìm vịt về cuối", () => {
  const ds = [
    { ma: "1", ten: "A", donVi: "Khoa Dược" },
    { ma: "2", ten: "B", donVi: "khoa dược" },
    { ma: "3", ten: "C", donVi: "Khoa Cấp cứu" },
    { ma: "4", ten: "D", donVi: "" },
  ];
  const dv = Dua.danhSachDonVi(ds);
  assert.equal(dv.length, 2);
  assert.equal(dv[0].ten, "Khoa Cấp cứu");
  assert.equal(dv[0].soNguoi, 1);
  assert.equal(dv[1].ten, "Khoa Dược");
  assert.equal(dv[1].soNguoi, 2);

  const cd = Dua.taoCuocDua(20, { soNguoiThang: 3, thoiGian: 8, rng: Dua.rngHatGiong(5) });
  while (!cd.xong()) cd.buoc(1 / 60);
  const cuoi = Dua.vitVeCuoi(cd);
  assert.ok(cuoi >= 0 && cuoi < 20);
  assert.equal(cd.thuTuVeDich().slice(0, 3).includes(cuoi), false);
});
