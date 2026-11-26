/* Logic thuần cho trò Lật Ô Chữ "Từ khóa Hội nghị". Không đụng DOM; dùng được trong trình duyệt và test Node. */
(function (root) {
  "use strict";

  var BANG_CHU = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  function maMoi() { return "oc" + Date.now().toString(36) + Math.floor(Math.random() * 1e5).toString(36); }

  /** Quy đổi 1 ký tự tiếng Việt về chữ cái gốc không dấu A-Z (Đ -> D, Ấ -> A, Ư -> U...). */
  function boDauKyTu(c) {
    return String(c || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toUpperCase();
  }

  function chuanHoa(item) {
    return {
      id: typeof (item && item.id) === "string" && item.id ? item.id.slice(0, 40) : maMoi(),
      tuKhoa: String((item && item.tuKhoa) || "TỪ KHÓA").trim().replace(/\s+/g, " ").toUpperCase().slice(0, 48),
      goiY: String((item && item.goiY) || "").trim().slice(0, 220),
      yNghia: String((item && item.yNghia) || "").trim().slice(0, 260),
    };
  }

  /** Trả về danh sách vị trí ký tự khớp với chữ cái không dấu kyTu (A-Z). */
  function doanChu(tuKhoa, kyTu) {
    var goc = boDauKyTu(kyTu).slice(0, 1);
    if (!/^[A-Z]$/.test(goc)) return [];
    var kq = [];
    var s = String(tuKhoa || "");
    for (var i = 0; i < s.length; i += 1) {
      if (boDauKyTu(s[i]) === goc) kq.push(i);
    }
    return kq;
  }

  /** Kiểm tra tất cả chữ cái trong từ khóa đã được lật hay chưa. */
  function daMoHet(tuKhoa, mangDaMo) {
    var s = String(tuKhoa || "");
    var tap = new Set(mangDaMo || []);
    for (var i = 0; i < s.length; i += 1) {
      if (/[A-Z]/.test(boDauKyTu(s[i])) && !tap.has(i)) return false;
    }
    return true;
  }

  function boMau() {
    return [
      {
        tuKhoa: "AN TOÀN NGƯỜI BỆNH",
        goiY: "Nguyên tắc số 1 trong mọi hoạt động khám chữa bệnh và chăm sóc y tế (4 từ).",
        yNghia: "Đặt sự an toàn và quyền lợi của người bệnh làm trung tâm trong từng quy trình chuyên môn.",
      },
      {
        tuKhoa: "CHUYỂN ĐỔI SỐ Y TẾ",
        goiY: "Xu hướng hiện đại hóa bệnh án điện tử, đăng ký thông minh và cải tiến thủ tục (5 từ).",
        yNghia: "Ứng dụng công nghệ để giảm tải công việc giấy tờ cho nhân viên và rút ngắn thời gian chờ cho người bệnh.",
      },
      {
        tuKhoa: "GẮN KẾT ĐỒNG ĐỘI",
        goiY: "Sức mạnh giúp tập thể vượt qua những ca trực căng thẳng và áp lực công việc (4 từ).",
        yNghia: "Tinh thần sẻ chia, hỗ trợ lẫn nhau giữa các khoa, phòng, trung tâm trong toàn bệnh viện.",
      },
      {
        tuKhoa: "TẬN TÂM CHĂM SÓC",
        goiY: "Phẩm chất cốt lõi thể hiện qua nụ cười, lời hỏi thăm và sự chu đáo mỗi ngày (4 từ).",
        yNghia: "Chăm sóc bằng cả chuyên môn vững vàng và trái tim nhân ái của người thầy thuốc.",
      },
      {
        tuKhoa: "ĐỔI MỚI SÁNG TẠO",
        goiY: "Tinh thần liên tục đề xuất sáng kiến cải tiến chất lượng từ viên chức – người lao động (4 từ).",
        yNghia: "Mỗi sáng kiến nhỏ từ thực tế công việc đều góp phần nâng cao chất lượng dịch vụ bệnh viện.",
      },
      {
        tuKhoa: "BỆNH VIỆN HẠNH PHÚC",
        goiY: "Mục tiêu xây dựng môi trường làm việc nhân văn, nơi cả người bệnh và nhân viên đều an tâm (4 từ).",
        yNghia: "Khi nhân viên y tế hạnh phúc và được trân trọng, người bệnh sẽ nhận được sự chăm sóc tốt đẹp nhất.",
      },
    ].map(chuanHoa);
  }

  var api = { BANG_CHU: BANG_CHU, boDauKyTu: boDauKyTu, chuanHoa: chuanHoa, doanChu: doanChu, daMoHet: daMoHet, boMau: boMau };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.OChu = api;
})(typeof window !== "undefined" ? window : globalThis);
