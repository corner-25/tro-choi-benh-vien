/* Điều phối sân khấu Ngày ấy – Bây giờ:
 * lưới 9 mảnh ghép lật 3D, rèm quét so sánh Trước – Sau tương tác, chớp máy ảnh và ảnh minh họa mẫu vẽ Canvas.
 * Dữ liệu người dùng chỉ vào DOM bằng textContent; ảnh tải lên qua AnhGiai.hopLe. */
(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };
  var KHOA = "ngay-ay-bay-gio";

  var tt = { vong: [], cauHinh: { manhGhep: true } };
  var giaiDoan = "chuan-bi";
  var viTri = 0;
  var buocHien = 0;
  var manhDaMo = [];
  var anhMauCache = {};

  function maMoi() { return "na" + Date.now().toString(36) + Math.floor(Math.random() * 1e5).toString(36); }

  function chuanHoa(v) {
    return {
      id: typeof (v && v.id) === "string" && v.id ? v.id.slice(0, 40) : maMoi(),
      mauId: typeof (v && v.mauId) === "string" ? v.mauId : "",
      cauHoi: String((v && v.cauHoi) || "Đây là cột mốc hoặc địa điểm nào của bệnh viện?").trim().slice(0, 200),
      goiY1: String((v && v.goiY1) || "").trim().slice(0, 180),
      goiY2: String((v && v.goiY2) || "").trim().slice(0, 180),
      nam: String((v && v.nam) || "").trim().slice(0, 40),
      diaDiem: String((v && v.diaDiem) || "").trim().slice(0, 160),
      cauChuyen: String((v && v.cauChuyen) || "").trim().slice(0, 320),
      anhXua: window.AnhGiai.hopLe(v && v.anhXua) ? v.anhXua : null,
      anhNay: window.AnhGiai.hopLe(v && v.anhNay) ? v.anhNay : null,
    };
  }

  /** Vẽ hình minh họa kiến trúc/sự kiện chất lượng cao cho bộ mẫu (khi MC chưa gắn ảnh tư liệu thật). */
  function taoAnhMinhHoa(mauId, laNay) {
    var khoa = (mauId || "co-so") + ":" + (laNay ? "nay" : "xua");
    if (anhMauCache[khoa]) return anhMauCache[khoa];
    var c = document.createElement("canvas");
    c.width = 960; c.height = 600;
    var ctx = c.getContext("2d");

    // Nền bầu trời / hội trường
    var g = ctx.createLinearGradient(0, 0, 0, 600);
    if (!laNay) {
      g.addColorStop(0, "#d6c5a7"); g.addColorStop(1, "#ede3cf");
    } else {
      g.addColorStop(0, "#38bdf8"); g.addColorStop(0.65, "#bae6fd"); g.addColorStop(1, "#f0f9ff");
    }
    ctx.fillStyle = g; ctx.fillRect(0, 0, 960, 600);

    // Mặt đất / đường phố
    ctx.fillStyle = laNay ? "#e2e8f0" : "#b8a68a";
    ctx.fillRect(0, 450, 960, 150);

    if (mauId === "hoi-nghi") {
      // Sân khấu hội trường xưa vs nay
      ctx.fillStyle = laNay ? "#0c1322" : "#5c4a38";
      ctx.fillRect(90, 95, 780, 320);
      ctx.fillStyle = laNay ? "#0b4fd6" : "#8c765c";
      ctx.fillRect(115, 120, 730, 270);
      // Tia đèn sân khấu hiện đại
      if (laNay) {
        ctx.fillStyle = "rgba(212,255,58,0.22)";
        ctx.beginPath(); ctx.moveTo(220, 95); ctx.lineTo(120, 450); ctx.lineTo(360, 450); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(740, 95); ctx.lineTo(600, 450); ctx.lineTo(840, 450); ctx.closePath(); ctx.fill();
      }
      ctx.fillStyle = laNay ? "#d4ff3a" : "#f5ebd6";
      ctx.font = "800 44px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(laNay ? "HỘI NGHỊ ĐẠI BIỂU 2026" : "HỘI NGHỊ VIÊN CHỨC XƯA", 480, 245);
      ctx.fillStyle = "#ffffff";
      ctx.font = "600 22px system-ui, sans-serif";
      ctx.fillText(laNay ? "Màn hình LED toàn cảnh · Kết nối 300+ đại biểu" : "Phông vải treo tường · Kỷ niệm những mùa đầu tiên", 480, 295);
      // Hàng ghế khán giả
      for (var r = 0; r < 3; r += 1) {
        for (var k = 0; k < 14; k += 1) {
          ctx.fillStyle = laNay ? "#1e3a8a" : "#78634c";
          ctx.fillRect(70 + k * 60, 468 + r * 38, 42, 24);
        }
      }
    } else if (mauId === "kham-benh") {
      // Khu tiếp đón khám bệnh: bàn sổ giấy vs sảnh ki-ốt số hóa
      ctx.fillStyle = laNay ? "#ffffff" : "#e6dac4";
      ctx.fillRect(80, 120, 800, 330);
      ctx.fillStyle = laNay ? "#0b4fd6" : "#6e5a44";
      ctx.fillRect(80, 120, 800, 56);
      ctx.fillStyle = "#ffffff";
      ctx.font = "800 26px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(laNay ? "KHU KHÁM BỆNH THÔNG MINH – ĐĂNG KÝ TỰ ĐỘNG" : "QUẦY PHÁT SỐ THỨ TỰ BẰNG GIẤY", 480, 157);
      for (var q = 0; q < 4; q += 1) {
        var xq = 140 + q * 185;
        ctx.fillStyle = laNay ? "#0c1322" : "#9c876c";
        ctx.fillRect(xq, 240, 120, 180);
        ctx.fillStyle = laNay ? "#d4ff3a" : "#f5ebd6";
        ctx.fillRect(xq + 16, 260, 88, 66);
      }
    } else {
      // Tòa nhà bệnh viện 1994 thấp tầng vs 2026 hiện đại cao tầng
      if (!laNay) {
        ctx.fillStyle = "#e8dcc4"; ctx.fillRect(210, 240, 540, 210);
        ctx.fillStyle = "#8c5239";
        ctx.beginPath(); ctx.moveTo(180, 240); ctx.lineTo(480, 150); ctx.lineTo(780, 240); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#6b5a46";
        for (var wx = 0; wx < 6; wx += 1) {
          ctx.fillRect(255 + wx * 78, 275, 44, 58);
          ctx.fillRect(255 + wx * 78, 360, 44, 58);
        }
      } else {
        ctx.fillStyle = "#ffffff"; ctx.fillRect(240, 90, 480, 360);
        ctx.fillStyle = "#0b4fd6"; ctx.fillRect(240, 90, 480, 38);
        for (var fl = 0; fl < 6; fl += 1) {
          ctx.fillStyle = fl % 2 === 0 ? "#60a5fa" : "#38bdf8";
          ctx.fillRect(272, 148 + fl * 46, 416, 28);
        }
        // Chữ thập y tế màu xanh chanh
        ctx.fillStyle = "#d4ff3a";
        ctx.fillRect(468, 96, 24, 26);
        ctx.fillStyle = "#0c1322";
        ctx.fillRect(477, 100, 6, 18); ctx.fillRect(471, 106, 18, 6);
      }
      // Hàng cây hai bên
      [120, 840].forEach(function (cx) {
        ctx.fillStyle = laNay ? "#15803d" : "#786c4f";
        ctx.beginPath(); ctx.arc(cx, 370, 52, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = laNay ? "#78350f" : "#5c4d3c";
        ctx.fillRect(cx - 10, 415, 20, 35);
      });
    }

    // Đóng dấu năm góc dưới
    ctx.fillStyle = laNay ? "rgba(12,19,34,0.82)" : "rgba(74,57,38,0.82)";
    ctx.fillRect(32, 526, 220, 44);
    ctx.fillStyle = laNay ? "#d4ff3a" : "#f5ebd6";
    ctx.font = "800 22px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(laNay ? "HÌNH MẪU · 2026" : "ẢNH MẪU · XƯA", 50, 555);

    var url = c.toDataURL("image/jpeg", 0.86);
    anhMauCache[khoa] = url;
    return url;
  }

  function boMau() {
    return [
      {
        mauId: "co-so",
        cauHoi: "Cột mốc khởi đầu này diễn ra vào năm nào trên trục đường Hồng Bàng?",
        goiY1: "Bắt đầu từ một Phòng khám Đa khoa trực thuộc Đại học Y Dược TP.HCM.",
        goiY2: "Dấu mốc mở ra hành trình hơn 30 năm phát triển thành tòa nhà hiện đại hôm nay.",
        nam: "Năm 1994",
        diaDiem: "Thành lập Phòng khám Đa khoa – tiền thân Bệnh viện",
        cauChuyen: "Từ cơ sở nhỏ ban đầu năm 1994, bệnh viện đã vươn mình trở thành trung tâm y khoa chuyên sâu hàng đầu.",
      },
      {
        mauId: "kham-benh",
        cauHoi: "Khu vực quen thuộc nào nơi hàng nghìn người bệnh ghé thăm mỗi sáng?",
        goiY1: "Ngày xưa lấy số thứ tự bằng phiếu giấy, nay đăng ký thông minh và thanh toán không tiền mặt.",
        goiY2: "Đón tiếp trung bình hàng nghìn lượt khám ngoại trú mỗi ngày.",
        nam: "Khu Khám bệnh",
        diaDiem: "Cơ sở 1 – 215 Hồng Bàng, TP. Hồ Chí Minh",
        cauChuyen: "Chuyển đổi số đã giúp rút ngắn thời gian chờ đợi và mang lại sự thoải mái hơn cho người bệnh lớn tuổi.",
      },
      {
        mauId: "hoi-nghi",
        cauHoi: "Sự kiện truyền thống gắn kết tập thể hằng năm nào trong hình ảnh này?",
        goiY1: "Quy tụ hơn 300 đại biểu đại diện cho các khoa, phòng, trung tâm toàn bệnh viện.",
        goiY2: "Nơi tập thể cùng đóng góp ý kiến xây dựng môi trường làm việc tốt hơn.",
        nam: "Hội nghị Đại biểu VC-NLĐ",
        diaDiem: "Hội trường lớn Bệnh viện Đại học Y Dược TP.HCM",
        cauChuyen: "Mỗi mùa hội nghị là dịp tri ân những đóng góp thầm lặng và lan tỏa tinh thần đồng đội của người thầy thuốc.",
      },
    ].map(chuanHoa);
  }

  function bao(loai, chu) {
    var k = $("trang-thai-na");
    k.className = "trang-thai " + loai;
    k.textContent = "";
    var p = document.createElement("p"); p.textContent = chu; k.appendChild(p);
  }

  function napDaLuu() {
    var d = window.LuuTru.doc(KHOA);
    if (d) {
      if (Array.isArray(d.vong)) tt.vong = d.vong.map(chuanHoa);
      tt.cauHinh = Object.assign({ manhGhep: true }, d.cauHinh || {});
    }
    if (!tt.vong.length) tt.vong = boMau();
    $("o-manh-ghep").checked = tt.cauHinh.manhGhep !== false;
    var ten = window.LuuTru.docTenSuKien();
    document.querySelectorAll(".ten-su-kien").forEach(function (el) { el.textContent = ten; });
  }

  function luu() {
    if (!window.LuuTru.ghi(KHOA, tt)) bao("loi", "Không lưu được: bộ nhớ trình duyệt đầy (hãy bớt ảnh rồi thử lại).");
    capNhatTongKet();
  }

  function capNhatTongKet() {
    $("so-vong").textContent = String(tt.vong.length);
    $("nut-vao").disabled = !tt.vong.length;
    $("nut-don-anh").hidden = !tt.vong.some(function (v) { return v.anhXua || v.anhNay; });
  }

  function taoOChonAnh(nhan, anh, onChon) {
    var lb = document.createElement("label"); lb.className = "kn-o-anh";
    if (anh) { var img = new Image(); img.src = anh; img.alt = ""; lb.appendChild(img); }
    var sp = document.createElement("span"); sp.textContent = anh ? nhan + " (bấm để đổi)" : "+ Tải " + nhan;
    var f = document.createElement("input"); f.type = "file"; f.accept = "image/png,image/jpeg,image/webp,image/gif"; f.className = "an-di";
    f.addEventListener("change", function () {
      var file = f.files[0]; f.value = "";
      if (!file) return;
      window.AnhGiai.thuNho(file).then(onChon).catch(function (e) { bao("loi", e.message); });
    });
    lb.append(sp, f);
    return lb;
  }

  function veDanhSach() {
    var ol = $("ds-ky-niem");
    ol.textContent = "";
    tt.vong.forEach(function (v, i) {
      var li = document.createElement("li"); li.className = "kn-dong";
      var dau = document.createElement("div"); dau.className = "kn-dau";
      var stt = document.createElement("span"); stt.className = "kn-stt"; stt.textContent = "Vòng " + (i + 1);
      var xoa = document.createElement("button"); xoa.type = "button"; xoa.className = "nut-nho nut-xoa"; xoa.textContent = "×";
      xoa.addEventListener("click", function () { tt.vong.splice(i, 1); luu(); veDanhSach(); });
      dau.append(stt, xoa);

      var anhHang = document.createElement("div"); anhHang.className = "kn-anh-hang";
      anhHang.append(
        taoOChonAnh("Ảnh Ngày ấy", v.anhXua, function (url) { v.anhXua = url; luu(); veDanhSach(); }),
        taoOChonAnh("Ảnh Bây giờ", v.anhNay, function (url) { v.anhNay = url; luu(); veDanhSach(); })
      );

      var oCau = document.createElement("input"); oCau.type = "text"; oCau.value = v.cauHoi; oCau.placeholder = "Câu hỏi dẫn dắt";
      oCau.addEventListener("change", function () { v.cauHoi = oCau.value.trim() || "Câu hỏi"; luu(); });
      var oG1 = document.createElement("input"); oG1.type = "text"; oG1.value = v.goiY1; oG1.placeholder = "Gợi ý 1";
      oG1.addEventListener("change", function () { v.goiY1 = oG1.value.trim(); luu(); });
      var oG2 = document.createElement("input"); oG2.type = "text"; oG2.value = v.goiY2; oG2.placeholder = "Gợi ý 2";
      oG2.addEventListener("change", function () { v.goiY2 = oG2.value.trim(); luu(); });

      var hai = document.createElement("div"); hai.className = "kn-hai-cot";
      var oNam = document.createElement("input"); oNam.type = "text"; oNam.value = v.nam; oNam.placeholder = "Năm / Mốc";
      oNam.addEventListener("change", function () { v.nam = oNam.value.trim(); luu(); });
      var oDd = document.createElement("input"); oDd.type = "text"; oDd.value = v.diaDiem; oDd.placeholder = "Đáp án địa điểm / sự kiện";
      oDd.addEventListener("change", function () { v.diaDiem = oDd.value.trim(); luu(); });
      hai.append(oNam, oDd);

      var oCh = document.createElement("input"); oCh.type = "text"; oCh.value = v.cauChuyen; oCh.placeholder = "Câu chuyện / kỷ niệm ngắn";
      oCh.addEventListener("change", function () { v.cauChuyen = oCh.value.trim(); luu(); });

      li.append(dau, anhHang, oCau, oG1, oG2, hai, oCh);
      ol.appendChild(li);
    });
  }

  // ── Sân khấu ──
  function datViTriRem(phanTram) {
    var p = Math.max(0, Math.min(100, phanTram));
    $("sk-lop-nay-boc").style.setProperty("--cat", p + "%");
    $("sk-rem").style.setProperty("--cat", p + "%");
    $("sk-keo-rem").value = String(Math.round(p));
  }

  function chayQuetRem() {
    var moc = performance.now();
    var thoiGian = 1400;
    requestAnimationFrame(function buoc(t) {
      var p = Math.min(1, (t - moc) / thoiGian);
      // Quét từ phải sang 100% -> 18% rồi dừng cân đối ở 48% để thấy cả Ngày ấy & Bây giờ
      var viTriCat = p < 0.65
        ? 100 - (p / 0.65) * 86
        : 14 + ((p - 0.65) / 0.35) * 34;
      datViTriRem(viTriCat);
      if (p < 1) requestAnimationFrame(buoc);
    });
  }

  function nhayChop() {
    var c = $("sk-chop");
    c.classList.remove("nhay");
    void c.offsetWidth;
    c.classList.add("nhay");
  }

  function moManh(idx) {
    if (idx < 0 || idx > 8 || manhDaMo[idx]) return;
    manhDaMo[idx] = true;
    var el = $("sk-luoi-manh").children[idx];
    if (el) el.classList.add("da-mo");
    window.AmThanh.moManh();
    capNhatTrangThaiAnh();
  }

  function moNgauNhien(soLuong) {
    var con = [];
    for (var i = 0; i < 9; i += 1) if (!manhDaMo[i]) con.push(i);
    if (!con.length) return;
    var n = Math.min(soLuong || 1, con.length);
    for (var k = 0; k < n; k += 1) {
      var r = Math.floor(Math.random() * con.length);
      var idx = con.splice(r, 1)[0];
      moManh(idx);
    }
  }

  function moHetManh() {
    for (var i = 0; i < 9; i += 1) {
      manhDaMo[i] = true;
      var el = $("sk-luoi-manh").children[i];
      if (el) el.classList.add("da-mo");
    }
    capNhatTrangThaiAnh();
  }

  function dungLuoiManh() {
    var luoi = $("sk-luoi-manh");
    luoi.textContent = "";
    var batManh = tt.cauHinh.manhGhep !== false;
    luoi.hidden = !batManh;
    manhDaMo = new Array(9).fill(!batManh);
    if (!batManh) return;
    for (var i = 0; i < 9; i += 1) {
      (function (idx) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "na-manh";
        b.textContent = String(idx + 1);
        b.setAttribute("aria-label", "Mở mảnh số " + (idx + 1));
        b.addEventListener("click", function () { moManh(idx); });
        luoi.appendChild(b);
      })(i);
    }
  }

  function capNhatTrangThaiAnh() {
    var daMo = buocHien >= 3;
    var soDaMo = manhDaMo.filter(Boolean).length;
    var con = 9 - soDaMo;
    $("nut-mo-manh").hidden = daMo || con === 0;
    $("nut-mo-het-manh").hidden = daMo || con === 0;
    $("nut-quet-lai").hidden = !daMo;
    $("sk-trang-thai-anh").textContent = daMo
      ? "Kéo thanh ánh sáng ngang qua ảnh để so sánh Ngày ấy ↔ Bây giờ"
      : (con > 0 ? "Đã mở " + soDaMo + "/9 mảnh · Bấm ô số hoặc phím 1–9 để lật mảnh" : "Đã mở trọn bức ảnh Ngày ấy");
  }

  function veMoc() {
    var khung = $("sk-moc-ds");
    khung.textContent = "";
    tt.vong.forEach(function (_, i) {
      var sp = document.createElement("span");
      sp.className = "na-moc" + (i === viTri ? " dang-xem" : i < viTri ? " da-qua" : "");
      khung.appendChild(sp);
    });
  }

  function napVong(idx) {
    viTri = idx;
    buocHien = 0;
    var v = tt.vong[viTri];
    if (!v) return;
    var anhXua = v.anhXua || taoAnhMinhHoa(v.mauId || "co-so", false);
    var anhNay = v.anhNay || (!v.anhXua ? taoAnhMinhHoa(v.mauId || "co-so", true) : null);
    $("sk-img-xua").src = anhXua;
    if (anhNay) $("sk-img-nay").src = anhNay;
    $("sk-lop-nay-boc").hidden = true;
    $("sk-nhan-nay").hidden = true;
    $("sk-rem").hidden = true;
    $("sk-keo-rem").hidden = true;
    dungLuoiManh();
    // Mở sẵn 1 mảnh trung tâm để khán giả có manh mối đầu tiên ngay khi vào vòng
    if (tt.cauHinh.manhGhep !== false) moManh(4);
    veSanKhau();
  }

  function veSanKhau() {
    var v = tt.vong[viTri];
    if (!v) return;
    $("sk-chi-so").textContent = "Vòng " + (viTri + 1) + " / " + tt.vong.length;
    veMoc();
    $("sk-cau-hoi").textContent = v.cauHoi;

    var ul = $("sk-goi-y");
    ul.textContent = "";
    if (buocHien >= 1 && v.goiY1) {
      var li1 = document.createElement("li"); li1.textContent = "Gợi ý 1: " + v.goiY1; ul.appendChild(li1);
    }
    if (buocHien >= 2 && v.goiY2) {
      var li2 = document.createElement("li"); li2.textContent = "Gợi ý 2: " + v.goiY2; ul.appendChild(li2);
    }

    var daMo = buocHien >= 3;
    $("sk-dap-an").hidden = !daMo;
    if (daMo) {
      $("sk-nam").textContent = v.nam || "Đáp án";
      $("sk-dia-diem").textContent = v.diaDiem || "";
      $("sk-chuyen").textContent = v.cauChuyen || "";
    }

    $("nut-truoc").disabled = viTri === 0;
    $("nut-sau").disabled = viTri >= tt.vong.length - 1;
    var nutBuoc = $("nut-buoc");
    nutBuoc.textContent = "";
    var tenBuoc = buocHien === 0 && v.goiY1 ? "Mở gợi ý 1 "
      : buocHien <= 1 && v.goiY2 ? "Mở gợi ý 2 "
      : buocHien < 3 ? "Lật đáp án & So sánh "
      : viTri < tt.vong.length - 1 ? "Sang vòng tiếp " : "Đã xong vòng cuối ";
    nutBuoc.appendChild(document.createTextNode(tenBuoc));
    var kbd = document.createElement("kbd"); kbd.textContent = "Space"; nutBuoc.appendChild(kbd);
    nutBuoc.disabled = buocHien >= 3 && viTri >= tt.vong.length - 1;
    capNhatTrangThaiAnh();
  }

  function tienBuoc() {
    var v = tt.vong[viTri];
    if (!v) return;
    if (buocHien === 0 && v.goiY1) {
      buocHien = 1;
      moNgauNhien(2);
      veSanKhau();
    } else if (buocHien <= 1 && v.goiY2) {
      buocHien = 2;
      moNgauNhien(2);
      veSanKhau();
    } else if (buocHien < 3) {
      buocHien = 3;
      moHetManh();
      nhayChop();
      window.AmThanh.chupAnh();
      setTimeout(function () { window.AmThanh.latDapAn(); }, 180);
      window.Phao.banHaiBen($("phao-na"), 1.25);

      var coAnhNay = Boolean(v.anhNay || !v.anhXua);
      if (coAnhNay) {
        $("sk-lop-nay-boc").hidden = false;
        $("sk-nhan-nay").hidden = false;
        $("sk-rem").hidden = false;
        $("sk-keo-rem").hidden = false;
        datViTriRem(100);
        setTimeout(chayQuetRem, 280);
      }
      veSanKhau();
    } else if (viTri < tt.vong.length - 1) {
      napVong(viTri + 1);
    }
  }

  function vaoSanKhau() {
    if (!tt.vong.length) return;
    window.AmThanh.moKhoa();
    giaiDoan = "san-khau";
    $("man-chuan-bi").hidden = true;
    $("man-san-khau").hidden = false;
    napVong(0);
  }

  function veChuanBi() {
    giaiDoan = "chuan-bi";
    $("man-san-khau").hidden = true;
    $("man-chuan-bi").hidden = false;
    capNhatTongKet();
  }

  function toanManHinh() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(function () {});
    else document.exitFullscreen();
  }

  function ganSuKien() {
    $("nut-them-vong").addEventListener("click", function () { tt.vong.push(chuanHoa({})); luu(); veDanhSach(); });
    $("nut-nap-mau").addEventListener("click", function () {
      if (!tt.vong.length || window.confirm("Thay danh sách hiện tại bằng bộ gợi nhớ mẫu?")) {
        tt.vong = boMau(); luu(); veDanhSach(); bao("ok", "Đã nạp bộ mẫu Ngày ấy – Bây giờ.");
      }
    });
    $("nut-don-anh").addEventListener("click", function () {
      if (!window.confirm("Xóa toàn bộ ảnh đã tải trong trò Ngày ấy – Bây giờ?")) return;
      tt.vong.forEach(function (v) { v.anhXua = null; v.anhNay = null; });
      luu(); veDanhSach(); bao("ok", "Đã dọn toàn bộ ảnh.");
    });
    $("o-manh-ghep").addEventListener("change", function () { tt.cauHinh.manhGhep = $("o-manh-ghep").checked; luu(); });
    $("o-am-thanh").addEventListener("change", function () { if ($("o-am-thanh").checked !== window.AmThanh.dangBat()) window.AmThanh.batTat(); });
    $("nut-vao").addEventListener("click", vaoSanKhau);
    $("nut-ve").addEventListener("click", veChuanBi);
    $("nut-buoc").addEventListener("click", tienBuoc);
    $("nut-truoc").addEventListener("click", function () { if (viTri > 0) napVong(viTri - 1); });
    $("nut-sau").addEventListener("click", function () { if (viTri < tt.vong.length - 1) napVong(viTri + 1); });
    $("nut-mo-manh").addEventListener("click", function () { moNgauNhien(1); });
    $("nut-mo-het-manh").addEventListener("click", function () { moHetManh(); window.AmThanh.moManh(); });
    $("nut-quet-lai").addEventListener("click", chayQuetRem);
    $("sk-keo-rem").addEventListener("input", function () { datViTriRem(Number($("sk-keo-rem").value)); });

    document.addEventListener("keydown", function (e) {
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
      if (e.key === "f" || e.key === "F") { toanManHinh(); return; }
      if (e.key === "m" || e.key === "M") { $("o-am-thanh").checked = window.AmThanh.batTat(); return; }
      if (giaiDoan === "chuan-bi") {
        if (e.code === "Space" && !$("nut-vao").disabled) { e.preventDefault(); vaoSanKhau(); }
        return;
      }
      if (e.code === "Space" || e.key === "Enter") { e.preventDefault(); tienBuoc(); }
      else if (e.key === "ArrowLeft" && viTri > 0) napVong(viTri - 1);
      else if (e.key === "ArrowRight" && viTri < tt.vong.length - 1) napVong(viTri + 1);
      else if (/^[1-9]$/.test(e.key) && buocHien < 3) moManh(Number(e.key) - 1);
      else if (e.key === "Escape") veChuanBi();
    });
  }

  napDaLuu();
  veDanhSach();
  ganSuKien();
  capNhatTongKet();
})();
