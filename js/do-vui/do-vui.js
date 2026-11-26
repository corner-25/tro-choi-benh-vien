/* Logic trò Đố vui giơ thẻ A/B (hỗ trợ 2 lựa chọn A/B hoặc 4 lựa chọn A/B/C/D kèm trợ giúp 50:50).
 * Thuần, không đụng DOM; dùng được trong trình duyệt và test Node. */
(function (root) {
  "use strict";

  var NHAN = ["A", "B", "C", "D"];

  function rngMatMa() {
    var c = (typeof globalThis !== "undefined" && globalThis.crypto) || null;
    if (c && c.getRandomValues) {
      var buf = new Uint32Array(1);
      return function () { c.getRandomValues(buf); return buf[0] / 4294967296; };
    }
    return Math.random;
  }

  function maMoi() {
    return "q" + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36);
  }

  function chuanHoaCauHoi(c) {
    var ds = Array.isArray(c && c.luaChon) ? c.luaChon.map(function (s) { return String(s || "").trim().slice(0, 140); }).filter(Boolean) : [];
    if (ds.length < 2) ds = ["Phương án A", "Phương án B"];
    if (ds.length > 4) ds = ds.slice(0, 4);
    var dapAn = Number(c && c.dapAn);
    if (!Number.isInteger(dapAn) || dapAn < 0 || dapAn >= ds.length) dapAn = 0;
    return {
      id: typeof (c && c.id) === "string" && c.id ? c.id.slice(0, 40) : maMoi(),
      cauHoi: String((c && c.cauHoi) || "Câu hỏi mới").trim().slice(0, 260),
      luaChon: ds,
      dapAn: dapAn,
      giaiThich: String((c && c.giaiThich) || "").trim().slice(0, 320),
    };
  }

  /**
   * Đọc câu hỏi dán từ Excel/văn bản (ngăn cách bằng Tab hoặc dấu chấm phẩy):
   * - Dạng 2 lựa chọn: Câu hỏi | A | B | Đáp án (A/B) | [Giải thích]
   * - Dạng 4 lựa chọn: Câu hỏi | A | B | C | D | Đáp án (A/B/C/D) | [Giải thích]
   */
  function docTuVanBan(text) {
    var ketQua = [];
    var loi = [];
    String(text || "").split(/\r?\n/).forEach(function (dong, idx) {
      if (!dong.trim()) return;
      var o = (dong.indexOf("\t") >= 0 ? dong.split("\t") : dong.split(";")).map(function (s) { return s.trim(); });
      if (idx === 0 && /^c[aâ]u h[oỏ]i/i.test(o[0])) return;
      if (o.length < 4) { loi.push("Dòng " + (idx + 1) + ": cần ít nhất 4 cột (Câu hỏi, A, B, Đáp án)."); return; }
      var luaChon, chuDapAn, giaiThich;
      if (o.length >= 6 && /^[ABCDabcd1234]$/.test(o[5])) {
        luaChon = [o[1], o[2], o[3], o[4]];
        chuDapAn = o[5];
        giaiThich = o[6] || "";
      } else {
        luaChon = [o[1], o[2]];
        chuDapAn = o[3];
        giaiThich = o[4] || "";
      }
      var maDap = chuDapAn.toUpperCase();
      var dapAn = NHAN.indexOf(maDap);
      if (dapAn < 0) {
        var so = Number(maDap);
        if (so >= 1 && so <= luaChon.length) dapAn = so - 1;
      }
      if (dapAn < 0 || dapAn >= luaChon.length) {
        loi.push("Dòng " + (idx + 1) + ": đáp án \"" + chuDapAn + "\" không hợp lệ.");
        return;
      }
      ketQua.push(chuanHoaCauHoi({ cauHoi: o[0], luaChon: luaChon, dapAn: dapAn, giaiThich: giaiThich }));
    });
    return { cauHoi: ketQua, loi: loi };
  }

  /** Trợ giúp 50:50: trả về danh sách 2 chỉ số đáp án sai bị ẩn (chỉ dùng cho câu 4 lựa chọn). */
  function loc5050(cauHoi, rng) {
    if (!cauHoi || !Array.isArray(cauHoi.luaChon) || cauHoi.luaChon.length < 4) return [];
    var sai = [];
    for (var i = 0; i < cauHoi.luaChon.length; i += 1) if (i !== cauHoi.dapAn) sai.push(i);
    var r = rng || rngMatMa();
    // Xáo trộn Fisher-Yates
    for (var j = sai.length - 1; j > 0; j -= 1) {
      var k = Math.floor(r() * (j + 1));
      var t = sai[j]; sai[j] = sai[k]; sai[k] = t;
    }
    return sai.slice(0, 2).sort(function (a, b) { return a - b; });
  }

  /** Xếp hạng các khu vực theo điểm giảm dần. */
  function xepHangDoi(cacDoi) {
    return (cacDoi || []).slice().sort(function (a, b) { return b.diem - a.diem; });
  }

  function boCauHoiMau() {
    return [
      {
        cauHoi: "Bệnh viện Đại học Y Dược TP. Hồ Chí Minh có tiền thân là Phòng khám Đa khoa thành lập vào năm nào?",
        luaChon: ["Năm 1994", "Năm 2000"],
        dapAn: 0,
        giaiThich: "Phòng khám Đa khoa trực thuộc Đại học Y Dược TP.HCM được thành lập năm 1994, đánh dấu chặng đường hơn 30 năm phát triển.",
      },
      {
        cauHoi: "Trong quy trình an toàn người bệnh của WHO, thời điểm nào sau đây thuộc 5 thời điểm vệ sinh tay?",
        luaChon: ["Trước khi tiếp xúc người bệnh", "Chỉ cần sau khi kết thúc ca trực"],
        dapAn: 0,
        giaiThich: "Vệ sinh tay trước khi tiếp xúc người bệnh là thời điểm đầu tiên trong 5 thời điểm vàng phòng ngừa nhiễm khuẩn bệnh viện.",
      },
      {
        cauHoi: "Theo khuyến nghị, người trưởng thành nên ngủ trung bình bao nhiêu giờ mỗi đêm để phục hồi sức khỏe tốt nhất?",
        luaChon: ["Từ 7 đến 9 giờ", "Từ 4 đến 5 giờ"],
        dapAn: 0,
        giaiThich: "Ngủ đủ 7–9 giờ mỗi đêm giúp tăng cường miễn dịch, cải thiện trí nhớ và giảm nguy cơ bệnh tim mạch.",
      },
      {
        cauHoi: "Màu chủ đạo trên biểu trưng (logo) Bệnh viện Đại học Y Dược TP.HCM là màu gì?",
        luaChon: ["Xanh dương", "Đỏ tươi", "Vàng nghệ", "Tím đậm"],
        dapAn: 0,
        giaiThich: "Màu xanh dương biểu trưng cho niềm tin, tri thức hàn lâm và sự tận tâm trong chăm sóc sức khỏe.",
      },
      {
        cauHoi: "Trong Hội nghị Đại biểu Viên chức – Người lao động, khẩu hiệu gắn kết tinh thần chung thường nhấn mạnh điều gì?",
        luaChon: ["Lấy người bệnh làm trung tâm – Đồng hành cùng nhân viên y tế", "Chỉ tập trung tăng số lượng thiết bị"],
        dapAn: 0,
        giaiThich: "Chất lượng chăm sóc người bệnh bền vững luôn đi cùng sự quan tâm, gắn bó và phát triển của đội ngũ viên chức, người lao động.",
      },
      {
        cauHoi: "Biện pháp đơn giản nhất giúp giảm mỏi mắt khi làm việc lâu với máy tính (quy tắc 20-20-20) là gì?",
        luaChon: ["Mỗi 20 phút nhìn xa 20 feet (~6 m) trong 20 giây", "Mỗi 20 phút chớp mắt 20 lần rồi nhìn gần màn hình"],
        dapAn: 0,
        giaiThich: "Quy tắc 20-20-20 giúp cơ điều tiết của mắt được thư giãn, giảm khô mắt và căng thẳng thị giác.",
      },
      {
        cauHoi: "Cơ sở 1 của Bệnh viện Đại học Y Dược TP. Hồ Chí Minh tọa lạc trên tuyến đường nào?",
        luaChon: ["Đường Hồng Bàng", "Đường Nguyễn Trãi", "Đường Võ Văn Kiệt", "Đường Lê Hồng Phong"],
        dapAn: 0,
        giaiThich: "Cơ sở 1 nằm tại số 215 Hồng Bàng, Phường 11, Quận 5 (nay thuộc khu vực trung tâm y tế lớn của TP.HCM).",
      },
      {
        cauHoi: "Để giữ huyết áp ổn định, lượng muối ăn khuyến nghị tối đa mỗi ngày cho người trưởng thành (theo WHO) là bao nhiêu?",
        luaChon: ["Dưới 5 gam (khoảng 1 muỗng cà phê nhỏ)", "Khoảng 15 gam mỗi ngày"],
        dapAn: 0,
        giaiThich: "Giảm muối xuống dưới 5 gam mỗi ngày giúp giảm rõ rệt nguy cơ tăng huyết áp và đột quỵ.",
      },
    ].map(chuanHoaCauHoi);
  }

  var api = {
    NHAN: NHAN,
    chuanHoaCauHoi: chuanHoaCauHoi,
    docTuVanBan: docTuVanBan,
    loc5050: loc5050,
    xepHangDoi: xepHangDoi,
    boCauHoiMau: boCauHoiMau,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.DoVui = api;
})(typeof window !== "undefined" ? window : globalThis);
