/* Logic trò Đoán con số bệnh viện. Thuần, không đụng DOM; dùng được trong trình duyệt và test Node. */
(function (root) {
  "use strict";

  function maMoi() {
    return "s" + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36);
  }

  function chuanHoaCau(c) {
    var so = Number(String(c && c.dapAn != null ? c.dapAn : 0).replace(/[.,\s]/g, ""));
    if (!Number.isFinite(so) || so < 0) so = 0;
    return {
      id: typeof (c && c.id) === "string" && c.id ? c.id.slice(0, 40) : maMoi(),
      cauHoi: String((c && c.cauHoi) || "Câu hỏi con số mới").trim().slice(0, 240),
      dapAn: Math.round(so),
      donVi: String((c && c.donVi) || "").trim().slice(0, 60),
      ghiChu: String((c && c.ghiChu) || "").trim().slice(0, 300),
    };
  }

  /** Định dạng số nguyên theo chuẩn Việt Nam (dấu chấm ngăn cách hàng nghìn). */
  function dinhDangSo(n) {
    var s = Math.round(Number(n) || 0);
    return String(s).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  /**
   * Tìm các khu vực đoán gần đáp án nhất (hỗ trợ đồng hạng).
   * duDoan: [{ ten, giaTri: number | null }]
   */
  function timDoiGanNhat(dapAn, duDoan) {
    var chiTiet = (duDoan || []).map(function (d, i) {
      var hopLe = d && d.giaTri !== null && d.giaTri !== "" && Number.isFinite(Number(d.giaTri));
      var v = hopLe ? Math.round(Number(d.giaTri)) : null;
      return {
        chiSo: i,
        ten: d ? d.ten : ("Khu " + (i + 1)),
        giaTri: v,
        lech: hopLe ? Math.abs(v - dapAn) : Infinity,
      };
    });
    var minLech = chiTiet.reduce(function (m, x) { return Math.min(m, x.lech); }, Infinity);
    var thang = Number.isFinite(minLech)
      ? chiTiet.filter(function (x) { return x.lech === minLech; }).map(function (x) { return x.chiSo; })
      : [];
    return { thang: thang, minLech: Number.isFinite(minLech) ? minLech : null, chiTiet: chiTiet };
  }

  function boMau() {
    return [
      {
        cauHoi: "Năm thành lập tiền thân Bệnh viện Đại học Y Dược TP. Hồ Chí Minh là năm nào?",
        dapAn: 1994,
        donVi: "",
        ghiChu: "Phòng khám Đa khoa trực thuộc Đại học Y Dược TP.HCM ra đời năm 1994.",
      },
      {
        cauHoi: "Số lượt khám ngoại trú trung bình mỗi ngày tại Cơ sở 1 (số liệu minh họa — MC cập nhật số năm nay)?",
        dapAn: 8500,
        donVi: "lượt / ngày",
        ghiChu: "Số liệu mẫu để chạy thử; MC có thể sửa thành con số thực tế trong báo cáo tổng kết năm.",
      },
      {
        cauHoi: "Tổng số ý kiến đóng góp của viên chức – người lao động gửi về Hội nghị (số liệu mẫu)?",
        dapAn: 342,
        donVi: "ý kiến",
        ghiChu: "Thay bằng số liệu tổng hợp ý kiến chính thức của hội nghị để tăng độ gắn kết.",
      },
      {
        cauHoi: "Tổng số khoa, phòng, đơn vị và trung tâm trong toàn bệnh viện (số liệu mẫu)?",
        dapAn: 63,
        donVi: "đơn vị",
        ghiChu: "Số liệu minh họa; MC có thể chỉnh đúng theo cơ cấu tổ chức hiện hành.",
      },
      {
        cauHoi: "Số giường bệnh thực kê phục vụ điều trị nội trú (số liệu mẫu)?",
        dapAn: 1000,
        donVi: "giường bệnh",
        ghiChu: "Số liệu minh họa; cập nhật theo báo cáo hoạt động bệnh viện năm gần nhất.",
      },
    ].map(chuanHoaCau);
  }

  var api = {
    chuanHoaCau: chuanHoaCau,
    dinhDangSo: dinhDangSo,
    timDoiGanNhat: timDoiGanNhat,
    boMau: boMau,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.DoanSo = api;
})(typeof window !== "undefined" ? window : globalThis);
