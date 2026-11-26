/* Màn hình vinh danh cuối lượt Đuổi hình bắt chữ: bục ba người dẫn đầu hiện dần (hạng ba → nhì → nhất),
 * phía dưới là các thứ hạng tiếp theo và điểm các đội. Dữ liệu người dùng chỉ vào DOM bằng textContent. */
(function (root) {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };
  var TEN_HANG = { 1: "Nhất", 2: "Nhì", 3: "Ba" };
  var TRE_BUC = [2400, 1300, 400]; // ms: người hạng nhất hiện sau cùng
  var hen = [];

  function the(tag, lop, chu) {
    var el = document.createElement(tag);
    if (lop) el.className = lop;
    if (chu != null) el.textContent = chu;
    return el;
  }

  function huyHen() { hen.forEach(clearTimeout); hen = []; }
  function sau(ms, fn) { hen.push(setTimeout(fn, ms)); }

  function oBuc(nguoi, viTri) {
    var li = the("li", "vd-o vd-o-" + (viTri + 1));
    var dau = the("p", "vd-dau-son", TEN_HANG[nguoi.hang] || "Hạng " + nguoi.hang);
    var ten = the("p", "vd-ten", nguoi.ten);
    var diem = the("p", "vd-diem");
    diem.append(the("b", null, String(nguoi.diem)), document.createTextNode(" điểm · " + nguoi.soCau + " câu"));
    var be = the("div", "vd-be");
    be.appendChild(the("span", null, String(nguoi.hang)));
    li.append(dau, ten, diem, be);
    return li;
  }

  function dongDs(nguoi) {
    var li = the("li", "vd-dong");
    li.append(the("span", "vd-dong-hang", String(nguoi.hang)), the("span", "vd-dong-ten", nguoi.ten), the("span", "vd-dong-diem", nguoi.diem + " điểm · " + nguoi.soCau + " câu"));
    return li;
  }

  /**
   * Hiện màn vinh danh.
   * duLieu: { bang: kết quả DuoiHinh.xepHangNguoi, doi: [{ ten, diem }], tomTat: chuỗi, amThanh: true/false }
   */
  function hien(duLieu) {
    huyHen();
    var bang = duLieu.bang || [];
    var buc = $("vd-buc"), ds = $("vd-ds"), doi = $("vd-doi");
    buc.textContent = ""; ds.textContent = ""; doi.textContent = "";
    $("vd-tom-tat").textContent = duLieu.tomTat || "";
    $("vd-trong").hidden = bang.length > 0;

    bang.slice(0, 3).forEach(function (nguoi, i) {
      var o = oBuc(nguoi, i);
      buc.appendChild(o);
      sau(TRE_BUC[i], function () {
        o.classList.add("hien");
        if (i === 0) {
          root.Phao.banHaiBen($("phao-vd"), 1.6);
          root.AmThanh.congBo(1);
        } else root.AmThanh.congBo(2);
      });
    });
    bang.slice(3).forEach(function (nguoi, i) {
      var d = dongDs(nguoi);
      ds.appendChild(d);
      sau(2900 + i * 90, function () { d.classList.add("hien"); });
    });
    ds.hidden = bang.length <= 3;

    var cacDoi = (duLieu.doi || []).slice().sort(function (a, b) { return b.diem - a.diem; });
    cacDoi.forEach(function (d, i) {
      var li = the("li", "vd-the-doi" + (i === 0 && d.diem > 0 ? " dan-dau" : ""));
      li.append(the("span", "vd-doi-ten", d.ten), the("span", "vd-doi-diem", String(d.diem)));
      doi.appendChild(li);
    });
    doi.hidden = !cacDoi.length;

    $("man-vinh-danh").hidden = false;
  }

  function an() { huyHen(); $("man-vinh-danh").hidden = true; }

  root.VinhDanhDH = { hien: hien, an: an };
})(window);
