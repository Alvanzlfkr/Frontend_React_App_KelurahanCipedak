import jsPDF from "jspdf";

const generateSuratPeminjamanPDF = (data) => {
  const getHariTanggal = (tanggal) => {
    if (!tanggal) return "";

    const hariMap = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];

    const d = new Date(tanggal); // tanggal sekarang sudah ISO / Date
    const hari = hariMap[d.getDay()];

    const tgl = d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    return `${hari}, ${tgl}`;
  };

  // ================= PAGE SETUP (F4) =================
  const doc = new jsPDF("p", "mm", [210, 330]);
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const marginX = 20;
  const marginTop = 20;
  const marginBottom = 20;

  let y = marginTop;

  // ================= UTIL =================
  const checkPageBreak = (space = 10) => {
    if (y + space > pageHeight - marginBottom) {
      doc.addPage();
      y = marginTop;
    }
  };

  const drawLineField = (label, value) => {
    checkPageBreak(8);
    y += 6;
    doc.text(label, marginX, y);
    doc.text(":", 60, y);
    doc.text(value || "", 65, y);
    doc.line(65, y + 1, pageWidth - marginX, y + 1);
  };

  const drawMultiLineField = (label, value, maxWidth = 120) => {
    checkPageBreak(12);
    y += 6;
    doc.text(label, marginX, y);
    doc.text(":", 60, y);

    const lines = doc.splitTextToSize(value || "", maxWidth);
    lines.forEach((line, i) => {
      if (i > 0) {
        y += 6;
        checkPageBreak(8);
      }
      doc.text(line, 65, y);
      doc.line(65, y + 1, pageWidth - marginX, y + 1);
    });
  };

  // ================= HEADER =================
  doc.setFont("times", "bold");
  doc.setFontSize(12);
  doc.text("BLANKO PEMINJAMAN PRASARANA DAN SARANA", pageWidth / 2, y, {
    align: "center",
  });
  y += 6;
  doc.text("KELURAHAN CIPEDAK", pageWidth / 2, y, { align: "center" });
  y += 6;
  doc.text("TAHUN 2025", pageWidth / 2, y, { align: "center" });

  y += 4;
  doc.line(marginX, y, pageWidth - marginX, y);

  // ================= TUJUAN =================
  y += 10;
  doc.setFont("times", "normal");
  doc.setFontSize(11);

  doc.text("Kepada Yth,", marginX, y);
  y += 5;
  doc.text("Lurah Cipedak", marginX, y);
  y += 5;
  doc.text("Kecamatan Jagakarsa", marginX, y);
  y += 5;
  doc.text("Di Jakarta", marginX, y);

  // ================= IDENTITAS =================
  y += 10;
  doc.text("Yang bertanda tangan di bawah ini :", marginX, y);

  drawLineField("Nama", data.nama);
  drawLineField("Jabatan", data.jabatan);
  drawLineField("No NIP/KTP", data.nik);
  drawMultiLineField("Alamat", data.alamat);
  drawLineField("No Telp/Hp", data.telp);

  // ================= PERMOHONAN =================
  y += 10;

  const lines = [
    `Dengan ini mengajukan permohonan peminjaman alat / tempat untuk keperluan kegiatan ${data.keperluan} Pada:`,
  ];

  doc.text(lines, marginX, y, { maxWidth: pageWidth - marginX * 2 });

  // update Y
  y += lines.length * 6;

  y += 8;
  doc.text("Hari / Tanggal", marginX, y);
  doc.text(":", 60, y);
  doc.text(getHariTanggal(data.tanggal_pinjam), 65, y);

  y += 6;
  doc.text("Waktu", marginX, y);
  doc.text(":", 60, y);
  doc.text(data.waktu || "", 65, y);

  // ================= ALAT =================
  y += 10;
  doc.text(
    "Adapun alat / perlengkapan yang dibutuhkan sebagai berikut :",
    marginX,
    y
  );

  const items = data.alat?.length ? data.alat.slice(0, 5) : [""]; // batasi 5 item

  items.forEach((item, idx) => {
    checkPageBreak(10);
    const lines = doc.splitTextToSize(item, pageWidth - 50);

    lines.forEach((line, i) => {
      y += 6;
      doc.text(i === 0 ? `${idx + 1}.` : "", 22, y);
      doc.text(line, 30, y);
      doc.line(30, y + 1, pageWidth - marginX, y + 1);
    });
  });

  // ================= PENGEMBALIAN =================
  y += 10;
  doc.text(
    "Peminjaman alat / tempat akan dikembalikan pada tanggal",
    marginX,
    y
  );
  doc.text(":", 120, y);
  doc.text(data.tanggal_kembali || "", 125, y);

  // ================= PENUTUP =================
  y += 10;
  doc.text(
    "Demikian surat peminjaman ini kami sampaikan atas perhatian dan kerjasamanya kami ucapkan terima kasih.",
    marginX,
    y,
    { maxWidth: pageWidth - marginX * 2 }
  );

  // ================= TTD PEMOHON =================
  checkPageBreak(90);

  // ================= TTD PEMOHON =================
  y += 15;

  const ttdAreaX = pageWidth - 75; // kiri area tanda tangan
  const ttdAreaWidth = 50; // lebar area tanda tangan

  // Format tanggal
  const tglPinjam = new Date(data.tanggal_pinjam);
  const tanggalFormat = tglPinjam.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // Hitung posisi tengah untuk tanggal
  const xTanggal =
    ttdAreaX +
    ttdAreaWidth / 2 -
    doc.getTextWidth(`Jakarta, ${tanggalFormat}`) / 2;
  doc.text(`Jakarta, ${tanggalFormat}`, xTanggal, y);

  y += 6;

  // Posisi tengah untuk "Pemohon"
  const xPemohon =
    ttdAreaX + ttdAreaWidth / 2 - doc.getTextWidth("Pemohon") / 2;
  doc.text("Pemohon", xPemohon, y);

  y += 25;

  // Posisi tengah untuk nama
  const namaPemohon = `( ${data.nama} )`;
  const xNama = ttdAreaX + ttdAreaWidth / 2 - doc.getTextWidth(namaPemohon) / 2;
  doc.text(namaPemohon, xNama, y);
  // ================= PEJABAT =================
  const baseY = y + 15; // posisi awal Pejabat

  // Teks Mengetahui
  doc.text("Mengetahui,", marginX + 10, baseY);
  doc.text("Lurah Cipedak", marginX + 8, baseY + 6);

  // Garis tanda tangan
  const tandaTanganY = baseY + 30;
  const tandaTanganX = marginX; // posisi kiri garis tanda tangan

  doc.text(
    "(.......................................)",
    tandaTanganX,
    tandaTanganY
  );

  // NIP di bawah tanda tangan, kiri
  const nipText = "NIP. .................................";
  const nipX = tandaTanganX; // kiri garis tanda tangan
  const nipY = tandaTanganY + 8; // jarak dari garis tanda tangan
  doc.text(nipText, nipX, nipY);

  // ================= KOTAK PEJABAT =================
  const boxY = baseY - 6;
  const boxHeight = 45;
  const boxX = 70;
  const rightBoxX = boxX + 70;

  // PLT Sekretaris
  doc.rect(boxX, boxY, 70, boxHeight);
  doc.text("Plt. Sekretaris", boxX + 25, boxY + 5);
  doc.text("Kelurahan Cipedak", boxX + 20, boxY + 11);

  doc.text("(.........................................)", boxX + 15, boxY + 36);
  doc.text("NIP. ....................................", boxX + 14, boxY + 42);

  // Setuju / Tidak
  doc.rect(rightBoxX, boxY, 50, boxHeight);

  // garis horizontal pemisah header
  doc.line(rightBoxX, boxY + 15, rightBoxX + 50, boxY + 15);

  // garis vertikal pembagi kolom
  const dividerX = rightBoxX + 20; // Setuju 20mm, Tidak Setuju 30mm
  doc.line(dividerX, boxY, dividerX, boxY + 15);

  // ================= TEXT =================
  doc.text("Setuju", rightBoxX + 5, boxY + 5);
  doc.text("Tidak Setuju", dividerX + 5, boxY + 5);
  doc.text("Catatan", rightBoxX + 20, boxY + 20);

  // ================= GARIS BAWAH =================
  // garis bawah Setuju + Tidak Setuju (nyambung)
  doc.line(rightBoxX, boxY + 7, rightBoxX + 50, boxY + 7);

  // garis bawah Catatan
  doc.line(rightBoxX, boxY + 22, rightBoxX + 50, boxY + 22);

  y += 65;
  const labelX = marginX; // posisi "CATATAN :"
  const valueX = marginX + 35; // posisi isi catatan (geser kanan)
  const maxWidth = pageWidth - valueX - marginX;

  // judul catatan
  doc.text("CATATAN :", labelX, y);

  // isi catatan baris 1
  doc.text(
    "*Kerusakan atau kehilangan alat-alat, saya sanggup mengganti dengan yang sama.",
    valueX,
    y,
    { maxWidth }
  );

  y += 6;

  // isi catatan baris 2
  doc.text(
    "*Untuk peminjaman tabung oksigen, pengembalian wajib mengisi ulang.",
    valueX,
    y,
    { maxWidth }
  );

  y += 6;

  // isi catatan baris 3
  doc.text("*Lampirkan Fotocopy KTP.", valueX, y);
  // ================= SAVE =================
  doc.save(`Blanko-Peminjaman-${data.nama}.pdf`);
};

export default generateSuratPeminjamanPDF;
