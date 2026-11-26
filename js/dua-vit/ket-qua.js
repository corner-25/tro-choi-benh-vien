/* Màn công bố: lật từ hạng thấp lên hạng 1, hạt sáng bung ra khi công bố hạng 1; bảng lịch sử.
 * Chỉ dùng textContent cho dữ liệu người dùng. */
(function (root) {
  "use strict";

  function the(tag, lop, chu) {
    var el = document.createElement(tag);
    if (lop) el.className = lop;
    if (chu !== undefined) el.textContent = chu;
    return el;
  }

  function taoTheNguoiThang(k) {
    var li = the("li", "kq-the hang-" + k.hang + " an-cho");
    var hang = the("span", "kq-hang");
    hang.appendChild(the("small", "", "Hạng"));
    hang.appendChild(document.createTextNode(String(k.hang).padStart(2, "0")));
    li.appendChild(hang);
    var giua = the("div", "kq-giua");
    giua.appendChild(the("span", "kq-ten", k.ten || "(chưa có họ tên)"));
    giua.appendChild(the("span", "kq-phu", k.ma + (k.donVi ? "  ·  " + k.donVi : "")));
    li.appendChild(giua);
    return li;
  }

  function taoTheVitCuoi(k) {
    var li = the("li", "kq-the ve-cuoi an-cho");
    var hang = the("span", "kq-hang");
    hang.appendChild(the("small", "", "Động viên"));
    hang.appendChild(document.createTextNode("CUỐI"));
    li.appendChild(hang);
    var giua = the("div", "kq-giua");
    giua.appendChild(the("span", "kq-ten", k.ten || "(chưa có họ tên)"));
    giua.appendChild(the("span", "kq-phu", k.ma + (k.donVi ? "  ·  " + k.donVi : "") + "  ·  Giải vui vịt về sau cùng"));
    li.appendChild(giua);
    return li;
  }

  /** Lật từng thẻ từ hạng thấp nhất; hạng 1 lật sau một nhịp nghỉ lâu hơn cho hồi hộp. */
  function congBo(ol, ketQua, amThanh, hieuUng, xong, vitCuoi) {
    ol.textContent = "";
    var cacThe = ketQua.map(function (k) { var li = taoTheNguoiThang(k); ol.appendChild(li); return li; });
    var theCuoi = null;
    if (vitCuoi) { theCuoi = taoTheVitCuoi(vitCuoi); ol.appendChild(theCuoi); }
    var thuTu = cacThe.map(function (_, i) { return i; }).reverse();
    var luc = 600;
    thuTu.forEach(function (i, buoc) {
      var laNhat = ketQua[i].hang === 1;
      luc += laNhat && buoc > 0 ? 2200 : buoc === 0 ? 0 : 1400;
      setTimeout(function () {
        cacThe[i].classList.remove("an-cho");
        cacThe[i].classList.add("hien");
        amThanh.congBo(ketQua[i].hang);
        if (laNhat) hieuUng();
        if (buoc === thuTu.length - 1) {
          if (theCuoi) {
            setTimeout(function () {
              theCuoi.classList.remove("an-cho");
              theCuoi.classList.add("hien");
              amThanh.congBo(2);
              setTimeout(xong, 900);
            }, 1300);
          } else {
            setTimeout(xong, 900);
          }
        }
      }, luc);
    });
  }

  function veLichSu(khung, lichSu) {
    khung.textContent = "";
    if (!lichSu.length) { khung.appendChild(the("p", "goi-y", "Chưa có lượt đua nào.")); return; }
    var bang = the("table", "ls-bang");
    var dau = the("thead"); var hd = the("tr");
    ["Lượt", "Thời gian", "Hạng", "Mã nhân viên", "Họ tên", "Đơn vị"].forEach(function (h) { var th = the("th", "", h); th.scope = "col"; hd.appendChild(th); });
    dau.appendChild(hd); bang.appendChild(dau);
    var than = the("tbody");
    lichSu.slice().reverse().forEach(function (l) {
      l.ketQua.forEach(function (k, i) {
        var tr = the("tr", i === 0 ? "ls-dau-luot" : "");
        [i === 0 ? String(l.luot) : "", i === 0 ? l.luc : "", String(k.hang), k.ma, k.ten, k.donVi].forEach(function (v) { tr.appendChild(the("td", "", v)); });
        than.appendChild(tr);
      });
    });
    bang.appendChild(than);
    khung.appendChild(bang);
  }

  root.KetQua = { congBo: congBo, veLichSu: veLichSu };
})(window);
