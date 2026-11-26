const { test } = require("node:test");
const assert = require("node:assert/strict");
const Quay = require("../js/quay-so/quay.js");

const ds = [
  { ma: "J25-001", ten: "A", donVi: "X" },
  { ma: "J25-002", ten: "B", donVi: "X" },
  { ma: "p07-188", ten: "C", donVi: "Y" },
  { ma: "N8", ten: "D", donVi: "Y" },
];

test("Số suất còn lại không tính kết quả đã hủy", () => {
  const giai = { id: "g1", soLuong: 3 };
  const kq = [
    { giaiId: "g1", ma: "J25-001", trangThai: "trung" },
    { giaiId: "g1", ma: "J25-002", trangThai: "huy" },
    { giaiId: "g2", ma: "N8", trangThai: "trung" },
  ];
  assert.equal(Quay.conLai(giai, kq), 2);
  assert.equal(Quay.conLai({ id: "g1", soLuong: 1 }, kq), 0);
});

test("Lồng quay loại người đã trúng và người vắng mặt (không phân biệt hoa thường)", () => {
  const kq = [{ giaiId: "g1", ma: "P07-188", trangThai: "trung" }, { giaiId: "g1", ma: "j25-002", trangThai: "huy" }];
  assert.deepEqual(Quay.longQuay(ds, kq).map((n) => n.ma), ["J25-001", "N8"]);
  assert.equal(Quay.longQuay(ds, kq, { moiNguoiMotGiai: false }).length, 3);
  assert.equal(Quay.longQuay(ds, kq, { loaiNguoiVang: false }).length, 3);
});

test("Bốc trong lồng trống trả null", () => {
  assert.equal(Quay.boc([]), null);
});

test("Bốc ngẫu nhiên đều: mỗi người có khả năng như nhau", () => {
  const long = Array.from({ length: 10 }, (_, i) => ({ ma: "M" + i }));
  const dem = new Map();
  const LUOT = 20000;
  for (let i = 0; i < LUOT; i += 1) { const n = Quay.boc(long); dem.set(n.ma, (dem.get(n.ma) || 0) + 1); }
  const kyVong = LUOT / 10;
  const chi2 = [...dem.values()].reduce((s, d) => s + (d - kyVong) ** 2 / kyVong, 0);
  // Ngưỡng chi-square 9 bậc tự do, mức ý nghĩa 0,001 là 27,9.
  assert.ok(chi2 < 27.9, `chi² = ${chi2.toFixed(1)}`);
  assert.equal(dem.size, 10);
});

test("Bộ ký tự cuộn quay gồm ký tự trống, số, chữ, dấu; mã căn phải theo số cuộn", () => {
  assert.deepEqual(Quay.boKyTu(ds), [" ", "0", "1", "2", "5", "7", "8", "J", "N", "P", "-"]);
  assert.equal(Quay.doDaiMa(ds), 7);
  assert.equal(Quay.canMa("n8", 7), "     N8");
  assert.equal(Quay.canMa("J25-001", 7), "J25-001");
});

test("Dòng xuất CSV theo thứ tự giải, ghi rõ trạng thái hủy", () => {
  const giai = [{ id: "g1", ten: "Giải Nhất", phanThuong: "Tai nghe" }, { id: "g2", ten: "Giải Nhì" }];
  const kq = [
    { giaiId: "g2", ma: "N8", ten: "D", donVi: "Y", luc: "t2", trangThai: "trung" },
    { giaiId: "g1", ma: "J25-001", ten: "A", donVi: "X", luc: "t1", trangThai: "huy" },
  ];
  const dong = Quay.dongXuat(giai, kq);
  assert.equal(dong.length, 3);
  assert.deepEqual(dong[1], ["Giải Nhất", "Tai nghe", "J25-001", "A", "X", "t1", "Đã hủy (vắng mặt)"]);
  assert.equal(dong[2][0], "Giải Nhì");
});
