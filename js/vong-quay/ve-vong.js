/* Vẽ và điều khiển hoạt ảnh Vòng quay may mắn phong cách sân khấu truyền hình trên Canvas 2D:
 * chân đế cúp thể thao + phản chiếu sàn, vành cung đo vận tốc góc, vành 32 đèn LED đa pha,
 * đa kim 1–3 kim đồng thời, ống kính Photo-Finish Loupe 2.4x chữ ngang, Safe-Zoom 1.30x,
 * sunburst 12 tia, sóng xung kích và lọc tần suất âm thanh chống nghẽn loa hội trường. */
(function (root) {
  "use strict";

  var BANG_MAU = [
    ["#0b4fd6", "#083ca6"],
    ["#0f766e", "#0b5751"],
    ["#d97706", "#b45309"],
    ["#0284c7", "#0369a1"],
    ["#4f46e5", "#3730a3"],
    ["#65a30d", "#4d7c0f"],
    ["#ea580c", "#c2410c"],
    ["#1d4ed8", "#1e3a8a"],
  ];
  var MAU_DOT_BIEN = {
    "nhan-doi": { nen: "#d4ff3a", chu: "#0c1322", vienNgoai: "#0c1322", vienTrong: "#ffffff" },
    "tang-ban": { nen: "#e53935", chu: "#ffffff", vienNgoai: "#ffffff", vienTrong: "#d4ff3a" },
    "quay-kep": { nen: "#0c1322", chu: "#d4ff3a", vienNgoai: "#d4ff3a", vienTrong: "#ffffff" },
  };
  var CAU_HINH_KIM = [
    { so: "1", nen: "#d4ff3a", vien: "#0c1322", chu: "#0c1322", chot: "#0c1322" },
    { so: "2", nen: "#38bdf8", vien: "#0b4fd6", chu: "#ffffff", chot: "#0b4fd6" },
    { so: "3", nen: "#fb923c", vien: "#c2410c", chu: "#ffffff", chot: "#c2410c" },
  ];
  var HAI_PI = Math.PI * 2;
  var SO_DEN = 32;
  var SO_TIA = 12;

  function giamChuyenDong() {
    return typeof window !== "undefined" && window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function chuanHoaO(item) {
    if (item && typeof item === "object") {
      return {
        nhan: String(item.nhan || item.muc || ""),
        loai: item.loai === "dot-bien" ? "dot-bien" : "thuong",
        maDotBien: item.maDotBien || null,
        goc: item,
      };
    }
    return { nhan: String(item == null ? "" : item), loai: "thuong", maDotBien: null, goc: item };
  }

  function catChu(ctx, chu, maxW) {
    if (ctx.measureText(chu).width <= maxW) return chu;
    var s = chu;
    while (s.length > 2 && ctx.measureText(s + "…").width > maxW) s = s.slice(0, -1);
    return s + "…";
  }

  function veHinhChuNhatBoGoc(ctx, x, y, w, h, r) {
    var bk = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + bk, y);
    ctx.arcTo(x + w, y, x + w, y + h, bk);
    ctx.arcTo(x + w, y + h, x, y + h, bk);
    ctx.arcTo(x, y + h, x, y, bk);
    ctx.arcTo(x, y, x + w, y, bk);
    ctx.closePath();
  }

  function tao(canvas, amThanh, onQuaO) {
    var ctx = canvas.getContext("2d");
    var goc = 0;
    var vanTocGoc = 0;
    var tienDoQuay = 0;
    var demQuaO = 0;
    var muc = [];
    var dangQuay = false;
    var dangSatNut = false;
    var soKimHienTai = 1;
    var chiSoTrung = -1;
    var cacChiSoTrung = [];
    var thoiDiemThang = 0;
    var trangThaiTruc = "";
    var gocCacKim = [0, 0, 0];
    var vanTocCacKim = [0, 0, 0];
    var zoom = 1;
    var chop = 0;
    var rungViMo = 0;
    var songXungKich = 0;
    var giuLoupe = 0;
    var trangThaiLoupeSatNut = false;
    var tTickCuoi = 0;
    var hat = [];
    var raf = 0;
    var dangHien = false;
    var tTruoc = performance.now();

    function kichThuoc() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = canvas.clientWidth || 560;
      var h = canvas.clientHeight || 560;
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { w: w, h: h };
    }

    function hinhHoc(w, h) {
      return {
        cx: soKimHienTai > 1 ? w / 2 : w / 2 - 22,
        cy: h / 2 - 14,
        R: Math.max(88, Math.min(w, h) / 2 - 64),
      };
    }

    function banTia(x, y, so, gocHuong) {
      if (giamChuyenDong()) return;
      var gocChinh = typeof gocHuong === "number" ? gocHuong : Math.PI;
      for (var i = 0; i < so; i += 1) {
        var ang = gocChinh + (Math.random() - 0.5) * 2.1;
        var sp = 2.6 + Math.random() * 5.8;
        hat.push({
          x: x, y: y,
          vx: Math.cos(ang) * sp,
          vy: Math.sin(ang) * sp - 1.2,
          song: 0,
          tho: 0.35 + Math.random() * 0.38,
          r: 2 + Math.random() * 3.2,
          mau: i % 3 === 0 ? "11,79,214" : (i % 2 ? "212,255,58" : "255,255,255"),
        });
      }
      if (hat.length > 240) hat = hat.slice(-240);
    }

    function veChanDe(cx, cy, R, h, laTrangThaiThang) {
      var dinhTru = cy + R + 12;
      var chanY = Math.min(h - 16, cy + R + 44);
      var rongCo = Math.max(36, R * 0.32);
      var rongBe = Math.max(96, R * 0.84);

      // Bóng phản chiếu sàn hình elip (scaleY 0.22)
      ctx.save();
      ctx.translate(cx, chanY + 5);
      ctx.scale(1, 0.22);
      var rBong = rongBe * 0.78;
      var gSan = ctx.createRadialGradient(0, 0, rBong * 0.1, 0, 0, rBong);
      if (laTrangThaiThang) {
        gSan.addColorStop(0, "rgba(212,255,58,0.44)");
        gSan.addColorStop(0.55, "rgba(11,79,214,0.18)");
        gSan.addColorStop(1, "rgba(12,19,34,0)");
      } else {
        gSan.addColorStop(0, "rgba(11,79,214,0.24)");
        gSan.addColorStop(0.55, "rgba(12,19,34,0.12)");
        gSan.addColorStop(1, "rgba(12,19,34,0)");
      }
      ctx.fillStyle = gSan;
      ctx.beginPath();
      ctx.arc(0, 0, rBong, 0, HAI_PI);
      ctx.fill();
      ctx.restore();

      // Thân trụ cúp thể thao kim loại
      var gTru = ctx.createLinearGradient(cx, dinhTru, cx, chanY + 6);
      gTru.addColorStop(0, "#1b2740");
      gTru.addColorStop(0.55, "#0c1322");
      gTru.addColorStop(1, "#1e293b");
      ctx.beginPath();
      ctx.moveTo(cx - rongCo / 2, dinhTru);
      ctx.lineTo(cx + rongCo / 2, dinhTru);
      ctx.lineTo(cx + rongBe * 0.44, chanY - 4);
      ctx.lineTo(cx - rongBe * 0.44, chanY - 4);
      ctx.closePath();
      ctx.fillStyle = gTru;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.26)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Mặt đế ngang thể thao
      veHinhChuNhatBoGoc(ctx, cx - rongBe / 2, chanY - 6, rongBe, 12, 6);
      ctx.fillStyle = "#0c1322";
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.32)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Vạch nhấn ánh sáng mảnh trên bệ đế
      veHinhChuNhatBoGoc(ctx, cx - rongBe * 0.34, chanY - 2, rongBe * 0.68, 3.5, 2);
      ctx.fillStyle = laTrangThaiThang ? "#d4ff3a" : "#0b4fd6";
      ctx.fill();
    }

    function veVanhTocDo(cx, cy, R) {
      var rToc = R + 25;
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, rToc, 0, HAI_PI);
      ctx.strokeStyle = "rgba(12,19,34,0.09)";
      ctx.lineWidth = 4.5;
      ctx.stroke();

      if (dangQuay && vanTocGoc > 0.06) {
        var tiLe = Math.min(1, vanTocGoc / 28);
        var gocBatDau = -Math.PI / 2;
        var gocKetThuc = gocBatDau + tiLe * HAI_PI;
        var mauCung = tienDoQuay > 0.80 ? "#d4ff3a" : (tienDoQuay > 0.55 ? "#ea580c" : "#0b4fd6");
        ctx.lineCap = "round";
        if (tienDoQuay > 0.80) {
          ctx.beginPath();
          ctx.arc(cx, cy, rToc, gocBatDau, gocKetThuc);
          ctx.strokeStyle = "#0c1322";
          ctx.lineWidth = 7;
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(cx, cy, rToc, gocBatDau, gocKetThuc);
        ctx.strokeStyle = mauCung;
        ctx.lineWidth = 4.5;
        ctx.stroke();
      }
      ctx.restore();
    }

    function veMotNan(i, n, buoc, R, coChu, laTrung, dungBongChu, veChu) {
      var o = muc[i];
      var a0 = i * buoc;
      var a1 = a0 + buoc;
      var banKinh = laTrung ? R + 10 : R;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, banKinh, a0, a1);
      ctx.closePath();

      var mauChu = "#ffffff";
      var laDotBien = o.loai === "dot-bien" && MAU_DOT_BIEN[o.maDotBien];
      if (laDotBien) {
        var db = MAU_DOT_BIEN[o.maDotBien];
        ctx.fillStyle = db.nen;
        mauChu = db.chu;
      } else if (laTrung) {
        var gT = ctx.createRadialGradient(0, 0, banKinh * 0.1, 0, 0, banKinh);
        gT.addColorStop(0, "#f2ff9e");
        gT.addColorStop(1, "#d4ff3a");
        ctx.fillStyle = gT;
        mauChu = "#0c1322";
      } else {
        var idxMau = i % BANG_MAU.length;
        if (i === n - 1 && idxMau === 0 && n > 1) idxMau = 2;
        var cap = BANG_MAU[idxMau];
        var gO = ctx.createRadialGradient(0, 0, R * 0.15, 0, 0, R);
        gO.addColorStop(0, cap[0]);
        gO.addColorStop(1, cap[1]);
        ctx.fillStyle = gO;
      }
      ctx.fill();

      // Đường chia nan sắc nét hoặc viền kép nổi bật cho ô Đột biến / ô Trúng
      if (laTrung) {
        ctx.strokeStyle = "#0c1322";
        ctx.lineWidth = 4.5;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, banKinh - 4.5, a0 + 0.015, a1 - 0.015);
        ctx.strokeStyle = "#d4ff3a";
        ctx.lineWidth = 2.6;
        ctx.stroke();
      } else if (laDotBien) {
        var dbVien = MAU_DOT_BIEN[o.maDotBien];
        ctx.strokeStyle = dbVien.vienNgoai;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, R - 8, a0 + 0.02, a1 - 0.02);
        ctx.strokeStyle = dbVien.vienTrong;
        ctx.lineWidth = 2.4;
        ctx.stroke();
      } else {
        ctx.strokeStyle = "rgba(255,255,255,0.82)";
        ctx.lineWidth = n > 40 ? 1.2 : 2;
        ctx.stroke();
      }

      if (veChu === false) return;

      // Chữ tên ô
      ctx.save();
      ctx.rotate(a0 + buoc / 2);
      ctx.textBaseline = "middle";
      var laSoNgan = o.nhan.length <= 2 && n <= 12;
      var co = laDotBien ? Math.min(26, coChu + 1.5) : (laTrung ? Math.min(32, coChu + 2) : coChu);
      ctx.font = (laDotBien || laTrung || laSoNgan ? "900 " : "800 ") + co + "px system-ui, -apple-system, 'Segoe UI', sans-serif";
      ctx.fillStyle = mauChu;
      if (dungBongChu && !laTrung && !laDotBien) {
        ctx.shadowColor = "rgba(0,0,0,0.28)";
        ctx.shadowBlur = 4;
      }
      if (laSoNgan) {
        ctx.textAlign = "center";
        ctx.fillText(o.nhan, banKinh * 0.64, 0);
      } else {
        ctx.textAlign = "right";
        var chu = catChu(ctx, o.nhan, banKinh * 0.72);
        ctx.fillText(chu, banKinh - 18, 0);
      }
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    function veKhungNgamSatNut(w, h) {
      var pad = 10;
      var dai = Math.min(34, Math.max(22, Math.min(w, h) * 0.055));
      var gocKhung = [
        [pad, pad, 1, 1],
        [w - pad, pad, -1, 1],
        [pad, h - pad, 1, -1],
        [w - pad, h - pad, -1, -1],
      ];

      ctx.save();
      ctx.lineCap = "square";
      ctx.lineJoin = "miter";
      for (var g = 0; g < gocKhung.length; g += 1) {
        var gx = gocKhung[g][0];
        var gy = gocKhung[g][1];
        var sx = gocKhung[g][2];
        var sy = gocKhung[g][3];

        ctx.beginPath();
        ctx.moveTo(gx, gy + sy * dai);
        ctx.lineTo(gx, gy);
        ctx.lineTo(gx + sx * dai, gy);
        ctx.strokeStyle = "#0c1322";
        ctx.lineWidth = 6.5;
        ctx.stroke();

        ctx.strokeStyle = "#d4ff3a";
        ctx.lineWidth = 2.4;
        ctx.stroke();
      }

      // Chip CẬN CẢNH · SÁT NÚT ở góc trên trái (không che tâm đĩa hay kim chỉ)
      var nhanChip = "CẬN CẢNH · SÁT NÚT";
      ctx.font = "900 12px ui-monospace, 'SFMono-Regular', Menlo, monospace";
      var wChu = ctx.measureText(nhanChip).width;
      var chipX = pad + 12;
      var chipY = pad + 10;
      var chipW = wChu + 32;
      var chipH = 26;

      veHinhChuNhatBoGoc(ctx, chipX, chipY, chipW, chipH, 7);
      ctx.fillStyle = "#0c1322";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#d4ff3a";
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(chipX + 12, chipY + chipH / 2, 4, 0, HAI_PI);
      ctx.fillStyle = "#d4ff3a";
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(nhanChip, chipX + 22, chipY + chipH / 2 + 0.5);
      ctx.restore();
    }

    function veTrucTam(cx, cy, rTruc, n, laThang) {
      // Vành ngoài trục tâm
      ctx.beginPath();
      ctx.arc(cx, cy, rTruc + 5, 0, HAI_PI);
      ctx.fillStyle = "#0c1322";
      ctx.fill();

      var gTruc = ctx.createRadialGradient(cx - 6, cy - 6, 4, cx, cy, rTruc);
      gTruc.addColorStop(0, "#ffffff");
      gTruc.addColorStop(1, "#e2e8f0");
      ctx.beginPath();
      ctx.arc(cx, cy, rTruc, 0, HAI_PI);
      ctx.fillStyle = gTruc;
      ctx.fill();

      // Vòng cung tiến độ quay #d4ff3a ôm quanh trục tâm
      var rVong = rTruc - 4.5;
      ctx.beginPath();
      ctx.arc(cx, cy, rVong, 0, HAI_PI);
      ctx.strokeStyle = "rgba(12,19,34,0.14)";
      ctx.lineWidth = 4.5;
      ctx.stroke();

      if (dangQuay && tienDoQuay > 0.005) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, rVong, -Math.PI / 2, -Math.PI / 2 + HAI_PI * Math.min(1, tienDoQuay));
        ctx.strokeStyle = "#0c1322";
        ctx.lineWidth = 6.5;
        ctx.lineCap = "round";
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, rVong, -Math.PI / 2, -Math.PI / 2 + HAI_PI * Math.min(1, tienDoQuay));
        ctx.strokeStyle = "#d4ff3a";
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.stroke();
        ctx.restore();
      } else if (laThang) {
        ctx.beginPath();
        ctx.arc(cx, cy, rVong, 0, HAI_PI);
        ctx.strokeStyle = "#d4ff3a";
        ctx.lineWidth = 4.5;
        ctx.stroke();
      }

      // Lõi hiển thị nhãn trạng thái ngắn (SỐ Ô, ×2, 50–50, N2, đầu số…)
      var rLoi = rTruc * 0.72;
      ctx.beginPath();
      ctx.arc(cx, cy, rLoi, 0, HAI_PI);
      if (dangSatNut) {
        ctx.fillStyle = "#0c1322";
      } else if (laThang) {
        ctx.fillStyle = "#d4ff3a";
      } else {
        ctx.fillStyle = "#ffffff";
      }
      ctx.fill();
      ctx.strokeStyle = dangSatNut ? "#d4ff3a" : "#0b4fd6";
      ctx.lineWidth = 2.2;
      ctx.stroke();

      var chu = trangThaiTruc || (n > 0 ? String(n) : "");
      if (chu) {
        ctx.save();
        var coTruc = chu.length <= 2 ? Math.round(rLoi * 0.78)
          : chu.length <= 4 ? Math.round(rLoi * 0.56)
          : Math.round(rLoi * 0.44);
        coTruc = Math.max(11, Math.min(20, coTruc));
        ctx.font = "900 " + coTruc + "px ui-monospace, 'SFMono-Regular', Menlo, monospace";
        ctx.fillStyle = dangSatNut ? "#d4ff3a" : "#0c1322";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(catChu(ctx, chu, rLoi * 1.72), cx, cy + 0.5);
        ctx.restore();
      }
    }

    function veMotKim(cx, cy, R, gocViTri, gocLac, cauHinh, hienSo) {
      var px = cx + Math.cos(gocViTri) * (R + 16);
      var py = cy + Math.sin(gocViTri) * (R + 16);
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(gocViTri + gocLac);
      if (!dangQuay) {
        ctx.shadowColor = "rgba(12,19,34,0.35)";
        ctx.shadowBlur = 10;
      }
      ctx.beginPath();
      ctx.moveTo(-34, 0);
      ctx.lineTo(10, -20);
      ctx.lineTo(3, 0);
      ctx.lineTo(10, 20);
      ctx.closePath();
      ctx.fillStyle = cauHinh.nen;
      ctx.fill();
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = cauHinh.vien;
      ctx.stroke();
      ctx.shadowBlur = 0;

      if (hienSo) {
        ctx.beginPath();
        ctx.arc(8, 0, 11, 0, HAI_PI);
        ctx.fillStyle = cauHinh.vien;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();
        ctx.save();
        ctx.translate(8, 0);
        ctx.rotate(-(gocViTri + gocLac));
        ctx.font = "900 13px ui-monospace, 'SFMono-Regular', Menlo, monospace";
        ctx.fillStyle = cauHinh.so === "1" ? "#d4ff3a" : "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(cauHinh.so, 0, 0.5);
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(4, 0, 5.5, 0, HAI_PI);
        ctx.fillStyle = cauHinh.chot;
        ctx.fill();
      }
      ctx.restore();
    }

    function veLoupe(w, h, cx, cy, R, n, buoc, laTrangThaiThang, giamCD) {
      var rLoupe = Math.max(66, Math.min(94, R * 0.33));
      var lx = w - rLoupe - 14;
      var ly = rLoupe + 14;
      var alpha = 1;
      if (dangQuay && !giamCD) {
        alpha = Math.max(0, Math.min(1, (tienDoQuay - 0.78) / 0.05));
      } else if (!dangQuay && giuLoupe > 0 && giuLoupe < 0.22 && !giamCD) {
        alpha = Math.max(0, giuLoupe / 0.22);
      }
      if (alpha <= 0.01) return;

      var oHienTai = !dangQuay && chiSoTrung >= 0 ? chiSoTrung : root.VongQuay.chiSoTaiKim(goc, n);
      if (oHienTai < 0 || oHienTai >= n) return;
      var tenO = muc[oHienTai].nhan;

      ctx.save();
      ctx.globalAlpha = alpha;

      // Bóng đổ ống kính
      ctx.beginPath();
      ctx.arc(lx, ly + 4, rLoupe + 4, 0, HAI_PI);
      ctx.fillStyle = "rgba(12,19,34,0.22)";
      ctx.fill();

      // Nội dung phóng đại 2.4x bên trong vòng tròn
      ctx.save();
      ctx.beginPath();
      ctx.arc(lx, ly, rLoupe, 0, HAI_PI);
      ctx.clip();

      ctx.fillStyle = "#f4f6f9";
      ctx.fillRect(lx - rLoupe - 2, ly - rLoupe - 2, (rLoupe + 2) * 2, (rLoupe + 2) * 2);

      // Chuyển hệ tọa độ phóng đại 2.4x quanh vùng mũi kim – chốt – vạch chia
      ctx.translate(lx, ly);
      ctx.scale(2.4, 2.4);
      ctx.translate(-(cx + R - 4), -cy);

      // Cung vành ngoài tối
      ctx.beginPath();
      ctx.arc(cx, cy, R + 19, -0.5, 0.5);
      ctx.arc(cx, cy, R - 2, 0.5, -0.5, true);
      ctx.closePath();
      ctx.fillStyle = "#0c1322";
      ctx.fill();

      // Vẽ các nan quanh ô hiện tại để đảm bảo đầy kín kính ở mọi số ô (2..120)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(goc);
      var phamVi = Math.min(Math.floor((n - 1) / 2), 5);
      var daVe = Object.create(null);
      for (var d = -phamVi; d <= phamVi; d += 1) {
        var idx = ((oHienTai + d) % n + n) % n;
        if (daVe[idx]) continue;
        daVe[idx] = true;
        if (laTrangThaiThang && idx === chiSoTrung) continue;
        veMotNan(idx, n, buoc, R, 11, false, false, false);
      }

      // Chốt kim loại trên các vạch chia nằm trong vùng soi
      for (var d2 = -phamVi; d2 <= phamVi + 1; d2 += 1) {
        var idxC = ((oHienTai + d2) % n + n) % n;
        var angC = idxC * buoc;
        var pxC = Math.cos(angC) * (R - 5);
        var pyC = Math.sin(angC) * (R - 5);
        ctx.beginPath();
        ctx.arc(pxC, pyC, 3.2, 0, HAI_PI);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.strokeStyle = "#0c1322";
        ctx.lineWidth = 1.1;
        ctx.stroke();
      }

      if (laTrangThaiThang && chiSoTrung < n) {
        veMotNan(chiSoTrung, n, buoc, R, 11, true, false, false);
      }
      ctx.restore();

      // Mũi kim phóng đại 2.4x ngay tại ranh giới chốt – vạch chia
      veMotKim(cx, cy, R, 0, gocCacKim[0], CAU_HINH_KIM[0], false);
      ctx.restore();

      // Viền ống kính thể thao 2 lớp
      ctx.beginPath();
      ctx.arc(lx, ly, rLoupe, 0, HAI_PI);
      ctx.lineWidth = 5;
      ctx.strokeStyle = "#0c1322";
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(lx, ly, rLoupe - 3.2, 0, HAI_PI);
      ctx.lineWidth = 2.4;
      ctx.strokeStyle = (!dangQuay || trangThaiLoupeSatNut) ? "#d4ff3a" : "#ffffff";
      ctx.stroke();

      // Huy hiệu nhỏ trên đỉnh kính
      var nhanTopW = 92;
      var nhanTopH = 20;
      veHinhChuNhatBoGoc(ctx, lx - nhanTopW / 2, ly - rLoupe - 10, nhanTopW, nhanTopH, 999);
      ctx.fillStyle = "#0c1322";
      ctx.fill();
      ctx.strokeStyle = "#d4ff3a";
      ctx.lineWidth = 1.8;
      ctx.stroke();
      ctx.font = "900 10.5px ui-monospace, 'SFMono-Regular', Menlo, monospace";
      ctx.fillStyle = "#d4ff3a";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("SOI KIM 2.4×", lx, ly - rLoupe + 0.5);

      // Hộp nhãn ngang 0 rad cỡ 22-26px ngay dưới vòng tròn Loupe
      var coChuHop = tenO.length > 18 ? 22 : (tenO.length > 12 ? 24 : 26);
      ctx.font = "850 " + coChuHop + "px system-ui, -apple-system, 'Segoe UI', sans-serif";
      var maxBoxW = Math.min(w - 20, Math.max(rLoupe * 2 + 44, 244));
      var chuHien = catChu(ctx, tenO, maxBoxW - 28);
      var wChu = ctx.measureText(chuHien).width;
      var hienTrangThai = !dangQuay;
      var chuTrangThai = trangThaiLoupeSatNut ? "SÁT NÚT — CHỐT THẮNG" : "QUA VẠCH RÕ RÀNG";
      var minWTrangThai = hienTrangThai ? 208 : 160;
      var boxW = Math.min(maxBoxW, Math.max(minWTrangThai, wChu + 28));
      var boxH = hienTrangThai ? 66 : 42;
      var boxX = Math.max(10, Math.min(w - boxW - 10, lx - boxW / 2));
      var boxY = Math.min(h - boxH - 10, ly + rLoupe + 8);

      veHinhChuNhatBoGoc(ctx, boxX, boxY, boxW, boxH, 12);
      ctx.fillStyle = "#0c1322";
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#d4ff3a";
      ctx.stroke();

      // Tên ô xoay ngang 0 rad
      ctx.font = "850 " + coChuHop + "px system-ui, -apple-system, 'Segoe UI', sans-serif";
      ctx.fillStyle = hienTrangThai ? "#d4ff3a" : "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(chuHien, boxX + boxW / 2, hienTrangThai ? boxY + 23 : boxY + boxH / 2 + 1);

      // Nhãn trạng thái đơn giản khi dừng (không hiện số đo độ góc)
      if (hienTrangThai) {
        if (trangThaiLoupeSatNut) {
          var pillW = Math.min(boxW - 16, 198);
          veHinhChuNhatBoGoc(ctx, boxX + (boxW - pillW) / 2, boxY + 41, pillW, 19, 999);
          ctx.fillStyle = "#d4ff3a";
          ctx.fill();
          ctx.font = "900 11.5px ui-monospace, 'SFMono-Regular', Menlo, monospace";
          ctx.fillStyle = "#0c1322";
          ctx.fillText(chuTrangThai, boxX + boxW / 2, boxY + 51);
        } else {
          ctx.font = "800 12px ui-monospace, 'SFMono-Regular', Menlo, monospace";
          ctx.fillStyle = "#ffffff";
          ctx.fillText(chuTrangThai, boxX + boxW / 2, boxY + 51);
        }
      }

      ctx.restore();
    }

    function veKhung(t, dt) {
      var kt = kichThuoc();
      var w = kt.w, h = kt.h;
      var giamCD = giamChuyenDong();
      ctx.clearRect(0, 0, w, h);

      if (!dangQuay && giuLoupe > 0) {
        giuLoupe = Math.max(0, giuLoupe - dt);
      }

      // Lò xo đàn hồi cho từng kim chỉ (cho phép vặn sâu tới -0.48 rad khi vấp chốt)
      for (var km = 0; km < 3; km += 1) {
        var luc = -185 * gocCacKim[km] - 17 * vanTocCacKim[km];
        vanTocCacKim[km] += luc * dt;
        gocCacKim[km] += vanTocCacKim[km] * dt;
        if (gocCacKim[km] < -0.48) { gocCacKim[km] = -0.48; if (vanTocCacKim[km] < 0) vanTocCacKim[km] *= -0.2; }
        else if (gocCacKim[km] > 0.28) { gocCacKim[km] = 0.28; if (vanTocCacKim[km] > 0) vanTocCacKim[km] *= -0.2; }
      }

      var hh = hinhHoc(w, h);
      var cx = hh.cx, cy = hh.cy, R = hh.R;
      var n = muc.length;
      var laTrangThaiThang = cacChiSoTrung.length > 0 && !dangQuay;
      var dsGocKim = root.VongQuay.danhSachGocKim(soKimHienTai);

      if (rungViMo > 0.03 && !giamCD) {
        rungViMo *= Math.pow(0.06, dt);
        if (rungViMo < 0.03) rungViMo = 0;
      } else {
        rungViMo = 0;
      }

      ctx.save();
      // Rung vi mô tắt dần (<= 1.5px) khi bật qua chốt cuối ở pha Sát nút
      if (rungViMo > 0 && !giamCD) {
        var rx = (Math.random() * 2 - 1) * rungViMo;
        var ry = (Math.random() * 2 - 1) * rungViMo;
        ctx.translate(rx, ry);
      }

      // Zoom: 1 kim dùng Safe-Zoom 1.30x lệch phải; đa kim dùng zoom toàn cảnh tâm đĩa 1.06x
      var z = giamCD ? 1 : zoom;
      if (z > 1.001) {
        var neoX = soKimHienTai > 1 ? cx : cx + R * 0.42;
        ctx.translate(neoX, cy);
        ctx.scale(z, z);
        ctx.translate(-neoX, -cy);
      }

      // 12 tia hào quang sunburst trong suốt xoay chậm sau đĩa khi chốt thắng
      if (laTrangThaiThang) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(giamCD ? 0 : t * 0.00028);
        var gTia = ctx.createRadialGradient(0, 0, R * 0.72, 0, 0, R + 54);
        gTia.addColorStop(0, "rgba(212,255,58,0.34)");
        gTia.addColorStop(0.68, "rgba(212,255,58,0.16)");
        gTia.addColorStop(1, "rgba(212,255,58,0)");
        ctx.fillStyle = gTia;
        var gocMoiTia = HAI_PI / SO_TIA;
        for (var s = 0; s < SO_TIA; s += 1) {
          var t0 = s * gocMoiTia;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.arc(0, 0, R + 54, t0, t0 + gocMoiTia * 0.45);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }

      // Hào quang nền phía sau vòng quay
      var halo = ctx.createRadialGradient(cx, cy, R * 0.85, cx, cy, R + 38);
      if (laTrangThaiThang) {
        halo.addColorStop(0, "rgba(212,255,58,0.58)");
        halo.addColorStop(1, "rgba(212,255,58,0)");
      } else {
        halo.addColorStop(0, "rgba(11,79,214,0.20)");
        halo.addColorStop(1, "rgba(11,79,214,0)");
      }
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, R + 38, 0, HAI_PI);
      ctx.fill();

      // Chân đế cúp thể thao + bóng phản chiếu sàn mờ
      veChanDe(cx, cy, R, h, laTrangThaiThang);

      // Vành cung đo vận tốc góc ngoài vành 32 LED
      veVanhTocDo(cx, cy, R);

      // Bóng đổ chiều sâu
      ctx.beginPath();
      ctx.arc(cx, cy + 12, R + 18, 0, HAI_PI);
      ctx.fillStyle = "rgba(12,19,34,0.16)";
      ctx.fill();

      // Vành sân khấu ngoài có khối 3D
      var gVanh = ctx.createLinearGradient(cx, cy - R - 20, cx, cy + R + 20);
      gVanh.addColorStop(0, "#24324d");
      gVanh.addColorStop(0.5, "#0c1322");
      gVanh.addColorStop(1, "#1b2740");
      ctx.beginPath();
      ctx.arc(cx, cy, R + 19, 0, HAI_PI);
      ctx.fillStyle = gVanh;
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "rgba(255,255,255,0.28)";
      ctx.stroke();

      // Vành 32 đèn LED đa pha (kèm 2 sóng hội tụ về mũi kim 0 rad trong 550ms khi chốt thắng)
      var phaNhanh = Math.floor((t / 1000) * 20);
      var phaThang = Math.floor((t / 1000) * 8);
      var phaCho = Math.floor((t / 1000) * 3);
      var tSauThang = laTrangThaiThang ? Math.max(0, t - thoiDiemThang) : 9999;
      var dangHoiTuLed = laTrangThaiThang && !giamCD && tSauThang < 550;
      var viTriSongHoiTu = dangHoiTuLed ? (1 - tSauThang / 550) * (SO_DEN / 2) : 0;

      for (var d = 0; d < SO_DEN; d += 1) {
        var gd = (d / SO_DEN) * HAI_PI;
        var dx = cx + Math.cos(gd) * (R + 10);
        var dy = cy + Math.sin(gd) * (R + 10);
        var mauDen = "rgba(255,255,255,0.26)";
        var quongDen = null;
        var banKinhDen = 2.8;

        if (dangHoiTuLed) {
          var kcKim = Math.min(d, SO_DEN - d);
          var lechHoiTu = kcKim - viTriSongHoiTu;
          if (Math.abs(lechHoiTu) <= 2.4) {
            var dauSong = lechHoiTu <= 0.4;
            mauDen = dauSong ? "#d4ff3a" : "#0b4fd6";
            quongDen = dauSong ? "rgba(212,255,58,0.48)" : "rgba(11,79,214,0.48)";
            banKinhDen = 5.0;
          } else if (kcKim > viTriSongHoiTu) {
            mauDen = "rgba(212,255,58,0.62)";
            quongDen = "rgba(212,255,58,0.22)";
            banKinhDen = 3.8;
          }
        } else if (laTrangThaiThang) {
          var chanh = giamCD ? true : (phaThang % 2 === 0);
          mauDen = chanh ? "#d4ff3a" : "#ffffff";
          quongDen = chanh ? "rgba(212,255,58,0.34)" : "rgba(255,255,255,0.35)";
          banKinhDen = 4.6;
        } else if (dangQuay && tienDoQuay <= 0.72) {
          var lechSong = ((d - phaNhanh) % SO_DEN + SO_DEN) % SO_DEN;
          var lechSong2 = ((d - phaNhanh + 16) % SO_DEN + SO_DEN) % SO_DEN;
          if (lechSong < 6 || lechSong2 < 6) {
            var pos = lechSong < 6 ? lechSong : lechSong2;
            var laChanh = pos % 2 === 0;
            mauDen = laChanh ? "#d4ff3a" : "#38bdf8";
            quongDen = laChanh ? "rgba(212,255,58,0.32)" : "rgba(11,79,214,0.42)";
            banKinhDen = 4.4;
          }
        } else if (dangQuay && tienDoQuay > 0.72) {
          if ((d + demQuaO) % 2 === 0 || (dangSatNut && Math.min(d, SO_DEN - d) <= 2)) {
            mauDen = demQuaO % 2 === 0 || dangSatNut ? "#d4ff3a" : "#ffffff";
            quongDen = "rgba(212,255,58,0.34)";
            banKinhDen = dangSatNut ? 4.8 : 4.4;
          }
        } else if ((d + phaCho) % 4 === 0) {
          mauDen = "#d4ff3a";
          quongDen = "rgba(212,255,58,0.24)";
          banKinhDen = 4.0;
        }

        ctx.beginPath();
        ctx.arc(dx, dy, banKinhDen, 0, HAI_PI);
        ctx.fillStyle = mauDen;
        ctx.fill();
        if (quongDen) {
          ctx.beginPath();
          ctx.arc(dx, dy, 8.2, 0, HAI_PI);
          ctx.fillStyle = quongDen;
          ctx.fill();
        }
      }

      if (!n) {
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, HAI_PI);
        ctx.fillStyle = "#e2e8f0";
        ctx.fill();
        ctx.restore();
        return;
      }

      var buoc = HAI_PI / n;
      var toanNhanNgan = muc.every(function (o) { return o.nhan.length <= 3; });
      var coChu;
      if (toanNhanNgan) {
        coChu = n <= 12 ? 29 : n <= 24 ? 20 : n <= 40 ? 15 : 12;
      } else {
        coChu = n <= 8 ? 23 : n <= 12 ? 20 : n <= 16 ? 17.5 : n <= 28 ? 14.5 : n <= 45 ? 12 : 10;
      }
      var dungBongChu = !dangQuay || n <= 16;

      // Vẽ các nan vòng quay (vẽ toàn bộ nan thắng sau cùng để nở bán kính R + 10 nổi lên trên)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(goc);

      for (var i = 0; i < n; i += 1) {
        if (laTrangThaiThang && cacChiSoTrung.indexOf(i) !== -1) continue;
        veMotNan(i, n, buoc, R, coChu, false, dungBongChu, true);
      }

      // Chốt kim loại trên viền trong của mỗi nan
      for (var j = 0; j < n; j += 1) {
        var ang = j * buoc;
        var px = Math.cos(ang) * (R - 5);
        var py = Math.sin(ang) * (R - 5);
        ctx.beginPath();
        ctx.arc(px, py, n > 40 ? 2 : 3.6, 0, HAI_PI);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.strokeStyle = "#0c1322";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      if (laTrangThaiThang) {
        for (var tr = 0; tr < cacChiSoTrung.length; tr += 1) {
          var idxTrung = cacChiSoTrung[tr];
          if (idxTrung >= 0 && idxTrung < n) {
            veMotNan(idxTrung, n, buoc, R, coChu, true, false, true);
          }
        }
      }
      ctx.restore();

      // Lớp ánh sáng phản chiếu kiểu sân khấu truyền hình phủ lên mặt đĩa
      var gBong = ctx.createLinearGradient(cx - R, cy - R, cx + R * 0.7, cy + R * 0.7);
      gBong.addColorStop(0, "rgba(255,255,255,0.24)");
      gBong.addColorStop(0.35, "rgba(255,255,255,0.03)");
      gBong.addColorStop(0.7, "rgba(12,19,34,0.02)");
      gBong.addColorStop(1, "rgba(12,19,34,0.14)");
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, HAI_PI);
      ctx.fillStyle = gBong;
      ctx.fill();

      // Vệt sáng tốc độ khi vòng đang quay nhanh
      if (dangQuay && vanTocGoc > 2.5 && !giamCD) {
        var aToc = Math.min(0.42, (vanTocGoc - 2.5) * 0.06);
        ctx.save();
        ctx.strokeStyle = "rgba(212,255,58," + aToc + ")";
        ctx.lineWidth = 4;
        for (var v = 0; v < 3; v += 1) {
          var gocV = (t * 0.008 + v * 2.1) % HAI_PI;
          ctx.beginPath();
          ctx.arc(cx, cy, R - 10 - v * 16, gocV, gocV + 0.7);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Tia dóng mảnh Photo-Finish từ mũi kim xuyên qua ranh giới nan khi ở pha Sát nút
      if (dangSatNut) {
        ctx.save();
        ctx.setLineDash([7, 5]);
        ctx.beginPath();
        ctx.moveTo(cx + R + 16, cy);
        ctx.lineTo(cx + R * 0.28, cy);
        ctx.strokeStyle = "#0c1322";
        ctx.lineWidth = 3.5;
        ctx.stroke();

        ctx.strokeStyle = "#d4ff3a";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }

      // Trục giữa đồng hồ tiến độ & nhãn trạng thái ngắn
      var rTruc = Math.max(34, R * 0.155);
      veTrucTam(cx, cy, rTruc, n, laTrangThaiThang);

      // Sóng xung kích (shockwave ring) bung ra từ từng đầu kim khi dừng
      if (songXungKich > 0 && !giamCD) {
        songXungKich += dt * 1.55;
        if (songXungKich >= 1) {
          songXungKich = 0;
        } else {
          var alSong = 1 - songXungKich;
          var rSong = 16 + songXungKich * (R * (soKimHienTai > 1 ? 0.56 : 0.88));
          ctx.save();
          for (var sk = 0; sk < dsGocKim.length; sk += 1) {
            var sx = cx + Math.cos(dsGocKim[sk]) * R;
            var sy = cy + Math.sin(dsGocKim[sk]) * R;
            ctx.beginPath();
            ctx.arc(sx, sy, rSong, 0, HAI_PI);
            ctx.strokeStyle = "rgba(212,255,58," + (0.9 * alSong) + ")";
            ctx.lineWidth = 6 * alSong + 1.5;
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(sx, sy, rSong * 0.72, 0, HAI_PI);
            ctx.strokeStyle = "rgba(11,79,214," + (0.55 * alSong) + ")";
            ctx.lineWidth = 3 * alSong + 1;
            ctx.stroke();
          }
          ctx.restore();
        }
      }

      // Hạt tia sáng bắn từ các kim chỉ
      var conHat = [];
      for (var k = 0; k < hat.length; k += 1) {
        var pt = hat[k];
        pt.song += dt;
        if (pt.song >= pt.tho) continue;
        pt.x += pt.vx * dt * 60;
        pt.y += pt.vy * dt * 60;
        pt.vy += 0.25 * dt * 60;
        var al = 1 - pt.song / pt.tho;
        ctx.fillStyle = "rgba(" + pt.mau + "," + al + ")";
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.r * al, 0, HAI_PI);
        ctx.fill();
        conHat.push(pt);
      }
      hat = conHat;

      // Vẽ 1–3 kim chỉ cơ học
      for (var ik = 0; ik < dsGocKim.length; ik += 1) {
        veMotKim(cx, cy, R, dsGocKim[ik], gocCacKim[ik], CAU_HINH_KIM[ik], soKimHienTai > 1);
      }

      ctx.restore();

      // Khung ngắm Photo-Finish 4 góc & chip CẬN CẢNH · SÁT NÚT trên lớp ngoài cùng
      if (dangSatNut) {
        veKhungNgamSatNut(w, h);
      }

      // Ống kính "Photo-Finish Loupe 2.4x" chữ ngang ở hệ tọa độ màn hình (chỉ bật khi 1 kim)
      if (soKimHienTai === 1 && n > 0 && ((dangQuay && tienDoQuay >= 0.78) || giuLoupe > 0)) {
        veLoupe(w, h, cx, cy, R, n, buoc, laTrangThaiThang, giamCD);
      }

      // Chớp sáng toàn khung khi chốt kết quả
      if (chop > 0.01 && !giamCD) {
        ctx.fillStyle = "rgba(255,255,255," + (0.42 * chop) + ")";
        ctx.fillRect(0, 0, w, h);
        chop *= 0.88;
      } else {
        chop = 0;
      }
    }

    function chayNen() {
      if (raf) return;
      dangHien = true;
      tTruoc = performance.now();
      (function lap(t) {
        if (!dangHien) { raf = 0; return; }
        var dt = Math.min(0.05, (t - tTruoc) / 1000);
        tTruoc = t;
        if (!dangQuay) zoom += (1 - zoom) * Math.min(1, dt * 3.6);
        veKhung(t, dt);
        raf = requestAnimationFrame(lap);
      })(tTruoc);
    }

    function datSoKim(k) {
      soKimHienTai = (k === 2 || k === 3) ? k : 1;
      if (soKimHienTai > 1) giuLoupe = 0;
    }

    function datTrangThaiTruc(chu) {
      trangThaiTruc = String(chu == null ? "" : chu);
    }

    function datMuc(ds, tuyChonVe) {
      muc = (ds || []).map(chuanHoaO);
      chiSoTrung = -1;
      cacChiSoTrung = [];
      dangSatNut = false;
      rungViMo = 0;
      songXungKich = 0;
      giuLoupe = 0;
      trangThaiLoupeSatNut = false;
      if (tuyChonVe && typeof tuyChonVe === "object" && tuyChonVe.trangThaiTruc != null) {
        trangThaiTruc = String(tuyChonVe.trangThaiTruc);
      }
      chayNen();
    }

    function taoOke(chiSo) {
      var n = muc.length;
      if (n <= 1 || chiSo < 0 || chiSo >= n) {
        return { truoc: null, sau: null, chiSo: chiSo };
      }
      var truocIdx = (chiSo + 1) % n;
      var sauIdx = (chiSo - 1 + n) % n;
      return { truoc: muc[truocIdx], sau: muc[sauIdx], chiSo: chiSo };
    }

    function quayToi(chiSo, tuyChon) {
      if (dangQuay || !muc.length) {
        return Promise.resolve({ satNut: false, mep: "giua", soVong: 0, cacChiSo: [] });
      }
      var tc = tuyChon || {};
      var soKim = (tc.soKim === 2 || tc.soKim === 3) ? tc.soKim : 1;
      soKimHienTai = soKim;
      var rng = tc.rng || root.VongQuay.rngMatMa();
      var pha;
      if (soKim > 1) {
        var kqDaKim = root.VongQuay.tinhGocDungDaKim(goc, chiSo, muc.length, tc.soVong || 0, soKim, rng);
        pha = {
          gocDich: kqDaKim.gocDich,
          satNut: false,
          mep: "giua",
          soVong: kqDaKim.soVong,
          cacChiSo: kqDaKim.cacChiSo,
        };
      } else {
        var choSatNut = tc.satNut !== false;
        pha = root.VongQuay.tinhPhaDung(goc, chiSo, muc.length, tc.soVong || 0, choSatNut, rng);
        pha.cacChiSo = [chiSo];
      }

      dangQuay = true;
      dangSatNut = false;
      chiSoTrung = -1;
      cacChiSoTrung = [];
      rungViMo = 0;
      songXungKich = 0;
      giuLoupe = 0;
      trangThaiLoupeSatNut = false;
      tienDoQuay = 0;
      demQuaO = 0;
      tTickCuoi = 0;

      var gocDau = goc;
      var gocDich = pha.gocDich;
      var giamCD = giamChuyenDong();
      var tongThoiGian = giamCD ? 1200 : (tc.tongThoiGian || 6400);
      var moc = performance.now();
      var dsGocKim = root.VongQuay.danhSachGocKim(soKim);
      var oTruocCacKim = dsGocKim.map(function (gk) {
        return root.VongQuay.chiSoTaiGoc(goc, muc.length, gk);
      });
      var gocCu = goc;
      var daBaoSatNut = false;
      var daVapChotCuoi = false;
      var buoc = HAI_PI / muc.length;
      var muGiamToc = (soKim === 1 && pha.satNut) ? 4.55 : 4.3;

      return new Promise(function (xong) {
        var kt = kichThuoc();
        var hh = hinhHoc(kt.w, kt.h);
        var cx = hh.cx, cy = hh.cy, R = hh.R;

        function theoDoi(t) {
          if (!dangQuay) {
            dangSatNut = false;
            xong({ satNut: pha.satNut, mep: pha.mep, soVong: pha.soVong, cacChiSo: pha.cacChiSo.slice() });
            return;
          }
          var p = Math.min(1, (t - moc) / tongThoiGian);
          tienDoQuay = p;
          var tienDo = 1 - Math.pow(1 - p, muGiamToc);
          goc = gocDau + (gocDich - gocDau) * tienDo;
          vanTocGoc = Math.abs(goc - gocCu) * 60;
          gocCu = goc;

          // Zoom mượt: 1 kim Safe-Zoom 1.30x; đa kim zoom tâm đĩa tối đa 1.06x
          var bienZoom = soKim > 1 ? 0.06 : 0.30;
          var zoomMuc = p > 0.72 ? 1 + ((p - 0.72) / 0.28) * bienZoom : 1;
          zoom += (zoomMuc - zoom) * 0.12;

          // Pha Sát nút ở 18% cuối (chỉ khi 1 kim): khung ngắm Photo-Finish + trống dồn + âm thanh sát nút
          if (soKim === 1 && pha.satNut && !daBaoSatNut && p >= 0.82) {
            daBaoSatNut = true;
            dangSatNut = true;
            if (amThanh && amThanh.trongDon) amThanh.trongDon(1100);
            if (amThanh && amThanh.satNut) amThanh.satNut();
            if (tc.onPhaSatNut) tc.onPhaSatNut(pha.mep);
          }

          // Hiệu ứng lò xo kim vấp chốt sâu sát mép + rung vi mô tắt dần (<= 1.5px)
          if (soKim === 1 && pha.satNut && !daVapChotCuoi && p >= 0.93) {
            daVapChotCuoi = true;
            vanTocCacKim[0] = -19;
            if (!giamCD) rungViMo = 1.45;
            banTia(cx + R, cy, 12, Math.PI);
          }

          // Cập nhật lò xo & tia hạt cho từng kim phụ khi qua vạch
          for (var km = 1; km < dsGocKim.length; km += 1) {
            var oPhu = root.VongQuay.chiSoTaiGoc(goc, muc.length, dsGocKim[km]);
            if (oPhu !== oTruocCacKim[km]) {
              oTruocCacKim[km] = oPhu;
              vanTocCacKim[km] = -Math.min(15, 5.5 + vanTocGoc * 1.3);
              var gkPhu = dsGocKim[km];
              banTia(cx + Math.cos(gkPhu) * R, cy + Math.sin(gkPhu) * R, p > 0.75 ? 6 : 2, gkPhu + Math.PI);
            }
          }

          // Kim chính (góc 0 rad): điều phối ticker 3 dòng và âm thanh chống nghẽn
          var oHienTai = root.VongQuay.chiSoTaiKim(goc, muc.length);
          if (oHienTai !== oTruocCacKim[0]) {
            oTruocCacKim[0] = oHienTai;
            demQuaO += 1;
            var trongSatNut = soKim === 1 && pha.satNut && p >= 0.82;
            vanTocCacKim[0] = trongSatNut
              ? -Math.min(23, 12 + vanTocGoc * 1.9)
              : -Math.min(16, 6 + vanTocGoc * 1.4);
            banTia(cx + R, cy, p > 0.75 ? 10 : 4, Math.PI);

            // Lọc tần suất âm thanh >= 38ms khi tốc độ cao; luân phiên denQuet & cach ở chặng giảm tốc
            if (amThanh) {
              var tiLeTocDo = 1 - p;
              if (tiLeTocDo > 0.35) {
                if (t - tTickCuoi >= 38) {
                  tTickCuoi = t;
                  amThanh.vongQuayTick();
                }
              } else {
                tTickCuoi = t;
                var oConLai = Math.abs(gocDich - goc) / buoc;
                if (oConLai <= 3.1 && amThanh.cach) amThanh.cach(false);
                else if (amThanh.denQuet) amThanh.denQuet(demQuaO % 2 === 1);
                else amThanh.vongQuayTick();
              }
            }
            if (onQuaO && muc[oHienTai]) {
              onQuaO(muc[oHienTai].nhan, muc[oHienTai].goc || muc[oHienTai], taoOke(oHienTai));
            }
          }

          if (p < 1) {
            requestAnimationFrame(theoDoi);
          } else {
            goc = ((gocDich % HAI_PI) + HAI_PI) % HAI_PI;
            vanTocGoc = 0;
            tienDoQuay = 1;
            dangQuay = false;
            dangSatNut = false;
            cacChiSoTrung = pha.cacChiSo.slice();
            chiSoTrung = pha.cacChiSo[0];
            thoiDiemThang = performance.now();
            if (soKim === 1) {
              giuLoupe = pha.satNut ? 1.4 : 0.9;
              trangThaiLoupeSatNut = Boolean(pha.satNut);
            } else {
              giuLoupe = 0;
              trangThaiLoupeSatNut = false;
            }
            chop = 1;
            songXungKich = 0.001;
            for (var ik = 0; ik < dsGocKim.length; ik += 1) {
              var gkCuoi = dsGocKim[ik];
              banTia(cx + Math.cos(gkCuoi) * R, cy + Math.sin(gkCuoi) * R, soKim > 1 ? 18 : 28, gkCuoi + Math.PI);
            }
            if (amThanh && amThanh.cach) amThanh.cach(true);
            if (onQuaO && muc[chiSoTrung]) {
              onQuaO(muc[chiSoTrung].nhan, muc[chiSoTrung].goc || muc[chiSoTrung], taoOke(chiSoTrung));
            }
            xong({ satNut: pha.satNut, mep: pha.mep, soVong: pha.soVong, cacChiSo: pha.cacChiSo.slice() });
          }
        }
        requestAnimationFrame(theoDoi);
      });
    }

    function dung() {
      dangHien = false;
      dangQuay = false;
      dangSatNut = false;
      rungViMo = 0;
      giuLoupe = 0;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
    }

    return {
      datMuc: datMuc,
      datTrangThaiTruc: datTrangThaiTruc,
      datSoKim: datSoKim,
      quayToi: quayToi,
      ve: function () { chayNen(); },
      dung: dung,
      dangQuay: function () { return dangQuay; },
    };
  }

  root.VeVong = { tao: tao };
})(window);
