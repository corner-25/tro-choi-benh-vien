/* In biên bản kết quả chuẩn A4 (xuất được thành PDF từ hộp thoại in của trình duyệt).
 * Dựng hoàn toàn bằng DOM + textContent, không dùng innerHTML, chạy offline trên file://. */
(function (root) {
  "use strict";

  function the(tag, lop, chu) {
    var el = document.createElement(tag);
    if (lop) el.className = lop;
    if (chu !== undefined) el.textContent = chu;
    return el;
  }

  /**
   * thongTin: {
   *   tenTro: "Đua vịt" | "Quay số trúng thưởng" | ...,
   *   tenSuKien: string,
   *   tomTat: string,
   *   cot: string[],
   *   dong: string[][],
   *   ghiChu?: string
   * }
   */
  function inBienBan(thongTin) {
    if (!thongTin || !Array.isArray(thongTin.dong) || !thongTin.dong.length) {
      window.alert("Chưa có dữ liệu kết quả để in biên bản.");
      return;
    }
    var cu = document.getElementById("vung-in-bien-ban");
    if (cu) cu.remove();

    var vung = the("section", "vung-in-bien-ban");
    vung.id = "vung-in-bien-ban";

    // Quốc hiệu & Đơn vị
    var dau = the("header", "bb-dau");
    var trai = the("div", "bb-don-vi");
    var logo = document.createElement("img");
    logo.src = "assets/logo.png";
    logo.alt = "Bệnh viện Đại học Y Dược TP.HCM";
    logo.className = "bb-logo";
    trai.appendChild(logo);
    trai.appendChild(the("p", "bb-co-quan", "BỆNH VIỆN ĐẠI HỌC Y DƯỢC TP. HỒ CHÍ MINH"));

    var phai = the("div", "bb-quoc-hieu");
    phai.appendChild(the("p", "bb-qh-tren", "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM"));
    phai.appendChild(the("p", "bb-qh-duoi", "Độc lập - Tự do - Hạnh phúc"));
    var bayGio = new Date();
    var ngay = "TP. Hồ Chí Minh, ngày " + String(bayGio.getDate()).padStart(2, "0") +
      " tháng " + String(bayGio.getMonth() + 1).padStart(2, "0") +
      " năm " + bayGio.getFullYear();
    phai.appendChild(the("p", "bb-ngay", ngay));
    dau.append(trai, phai);
    vung.appendChild(dau);

    // Tiêu đề biên bản
    var tieuDe = the("div", "bb-tieu-de");
    tieuDe.appendChild(the("h1", "", "BIÊN BẢN KẾT QUẢ " + String(thongTin.tenTro || "TRÒ CHƠI").toUpperCase()));
    tieuDe.appendChild(the("p", "bb-su-kien", thongTin.tenSuKien || (root.LuuTru ? root.LuuTru.docTenSuKien() : "")));
    var lucIn = bayGio.toLocaleString("vi-VN", { hour12: false });
    tieuDe.appendChild(the("p", "bb-tom-tat", (thongTin.tomTat ? thongTin.tomTat + "  ·  " : "") + "Lập biên bản lúc " + lucIn));
    vung.appendChild(tieuDe);

    // Bảng kết quả
    var bang = the("table", "bb-bang");
    var thead = the("thead");
    var trH = the("tr");
    (thongTin.cot || []).forEach(function (c) { trH.appendChild(the("th", "", c)); });
    thead.appendChild(trH);
    bang.appendChild(thead);

    var tbody = the("tbody");
    thongTin.dong.forEach(function (d) {
      var tr = the("tr");
      d.forEach(function (o) { tr.appendChild(the("td", "", o == null ? "" : String(o))); });
      tbody.appendChild(tr);
    });
    bang.appendChild(tbody);
    vung.appendChild(bang);

    if (thongTin.ghiChu) {
      vung.appendChild(the("p", "bb-ghi-chu", thongTin.ghiChu));
    }

    // Chữ ký xác nhận
    var ky = the("footer", "bb-chu-ky");
    [
      ["ĐẠI DIỆN BAN TỔ CHỨC", "(Ký, ghi rõ họ tên)"],
      ["THƯ KÝ / BAN KIỂM PHIẾU", "(Ký, ghi rõ họ tên)"],
      ["ĐẠI DIỆN CÔNG ĐOÀN", "(Ký, ghi rõ họ tên)"],
    ].forEach(function (m) {
      var o = the("div", "bb-ky-o");
      o.appendChild(the("p", "bb-ky-chuc", m[0]));
      o.appendChild(the("p", "bb-ky-goi-y", m[1]));
      o.appendChild(the("div", "bb-ky-trong"));
      ky.appendChild(o);
    });
    vung.appendChild(ky);

    document.body.appendChild(vung);
    document.body.classList.add("dang-in-bien-ban");

    var donDep = function () {
      document.body.classList.remove("dang-in-bien-ban");
      window.removeEventListener("afterprint", donDep);
    };
    window.addEventListener("afterprint", donDep);
    window.print();
  }

  root.BienBan = { in: inBienBan };
})(window);
