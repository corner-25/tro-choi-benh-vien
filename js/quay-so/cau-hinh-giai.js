/* Danh sách giải trên bàn điều khiển: sửa tên, phần thưởng, số lượng, ảnh; thêm, xóa, đổi thứ tự. */
(function (root) {
  "use strict";

  var GIAI_MAU = [
    { ten: "Giải Đặc biệt", phanThuong: "", soLuong: 1 },
    { ten: "Giải Nhất", phanThuong: "", soLuong: 2 },
    { ten: "Giải Nhì", phanThuong: "", soLuong: 3 },
    { ten: "Giải Ba", phanThuong: "", soLuong: 5 },
    { ten: "Giải Khuyến khích", phanThuong: "", soLuong: 10 },
  ];

  function maMoi() { return "g" + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36); }

  function chuanHoa(g) {
    return {
      id: typeof g.id === "string" && /^[a-z0-9]{1,40}$/i.test(g.id) ? g.id : maMoi(),
      ten: String(g.ten || "Giải").slice(0, 60),
      phanThuong: String(g.phanThuong || "").slice(0, 120),
      soLuong: Math.max(1, Math.min(500, Math.floor(Number(g.soLuong) || 1))),
      anh: root.AnhGiai.hopLe(g.anh) ? g.anh : null,
    };
  }

  /**
   * khung: <ol>. layDs()/ghiDs(ds): đọc và lưu danh sách giải. daQuay(id): số người đã trúng giải đó
   * (giải đã có người trúng thì không xóa được, chỉ sửa). bao(loai, chu): thông báo.
   */
  function tao(khung, layDs, ghiDs, daQuay, bao) {
    function the(tag, lop) { var el = document.createElement(tag); if (lop) el.className = lop; return el; }

    function ve() {
      var ds = layDs();
      khung.textContent = "";
      ds.forEach(function (g, i) {
        var li = the("li", "giai-dong");
        var khungAnh = the("div", "giai-anh-khung");
        var o = the("label", "giai-anh");
        o.title = "Chọn ảnh phần thưởng";
        if (g.anh) { var img = new Image(); img.src = g.anh; img.alt = ""; o.appendChild(img); }
        else { var p = the("span"); p.textContent = "Ảnh"; o.appendChild(p); }
        var file = document.createElement("input"); file.type = "file"; file.accept = "image/png,image/jpeg,image/webp,image/gif"; file.className = "an-di";
        file.setAttribute("aria-label", "Ảnh phần thưởng của " + g.ten);
        file.addEventListener("change", function () {
          var f = file.files[0]; file.value = "";
          root.AnhGiai.thuNho(f).then(function (anh) { capNhat(i, { anh: anh }); }).catch(function (e) { bao("loi", e.message); });
        });
        o.appendChild(file);
        khungAnh.appendChild(o);
        if (g.anh) {
          var boAnh = the("button", "nut-bo-anh");
          boAnh.type = "button";
          boAnh.textContent = "Bỏ ảnh";
          boAnh.setAttribute("aria-label", "Xóa ảnh phần thưởng của " + g.ten);
          boAnh.addEventListener("click", function () { capNhat(i, { anh: null }); });
          khungAnh.appendChild(boAnh);
        }

        var ten = the("input", "giai-ten"); ten.type = "text"; ten.maxLength = 60; ten.value = g.ten; ten.setAttribute("aria-label", "Tên giải");
        ten.addEventListener("change", function () { capNhat(i, { ten: ten.value.trim() || "Giải" }); });
        var pt = the("input", "giai-phan-thuong"); pt.type = "text"; pt.maxLength = 120; pt.value = g.phanThuong; pt.placeholder = "Phần thưởng, ví dụ: Tai nghe không dây"; pt.setAttribute("aria-label", "Phần thưởng");
        pt.addEventListener("change", function () { capNhat(i, { phanThuong: pt.value.trim() }); });
        var sl = the("input", "giai-so"); sl.type = "number"; sl.min = "1"; sl.max = "500"; sl.value = String(g.soLuong); sl.setAttribute("aria-label", "Số lượng");
        sl.addEventListener("change", function () {
          var so = Math.max(1, Math.min(500, Math.floor(Number(sl.value) || 1)));
          var da = daQuay(g.id);
          if (so < da) { bao("canh-bao", g.ten + " đã có " + da + " người trúng, số lượng không thể nhỏ hơn " + da + "."); so = da; }
          capNhat(i, { soLuong: so });
        });

        var giua = the("div", "giai-giua");
        giua.append(ten, pt);
        var dk = the("div", "giai-dk");
        var len = the("button", "nut-nho"); len.type = "button"; len.textContent = "↑"; len.disabled = i === 0; len.setAttribute("aria-label", "Đưa " + g.ten + " lên");
        len.addEventListener("click", function () { doiCho(i, i - 1); });
        var xuong = the("button", "nut-nho"); xuong.type = "button"; xuong.textContent = "↓"; xuong.disabled = i === ds.length - 1; xuong.setAttribute("aria-label", "Đưa " + g.ten + " xuống");
        xuong.addEventListener("click", function () { doiCho(i, i + 1); });
        var xoa = the("button", "nut-nho nut-xoa"); xoa.type = "button"; xoa.textContent = "×"; xoa.setAttribute("aria-label", "Xóa " + g.ten);
        xoa.addEventListener("click", function () {
          if (daQuay(g.id) > 0) { bao("canh-bao", g.ten + " đã có người trúng, không xóa được. Xóa kết quả trước nếu muốn bỏ giải này."); return; }
          ghiDs(layDs().filter(function (_, k) { return k !== i; })); ve();
        });
        dk.append(len, xuong, xoa);
        var soKhung = the("label", "giai-so-khung"); var nhan = the("span"); nhan.textContent = "Số lượng"; soKhung.append(nhan, sl);
        li.append(khungAnh, giua, soKhung, dk);
        khung.appendChild(li);
      });
    }

    function capNhat(i, thayDoi) {
      var ds = layDs().map(function (g, k) { return k === i ? chuanHoa(Object.assign({}, g, thayDoi)) : g; });
      ghiDs(ds); ve();
    }

    function doiCho(a, b) {
      var ds = layDs().slice();
      var t = ds[a]; ds[a] = ds[b]; ds[b] = t;
      ghiDs(ds); ve();
    }

    return {
      ve: ve,
      them: function () { ghiDs(layDs().concat([chuanHoa({ ten: "Giải mới", soLuong: 1 })])); ve(); },
      dungMau: function () { ghiDs(GIAI_MAU.map(chuanHoa)); ve(); },
      donAnh: function () { ghiDs(layDs().map(function (g) { return Object.assign({}, g, { anh: null }); })); ve(); },
    };
  }

  root.CauHinhGiai = { tao: tao, chuanHoa: chuanHoa };
})(window);
