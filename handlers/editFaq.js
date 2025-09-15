const fs = require("fs");
const path = require("path");
const faqDir = path.join(__dirname, "../faq");
const imgDir = path.join(__dirname, "../images");

// pastikan folder gambar ada
if (!fs.existsSync(imgDir)) {
  fs.mkdirSync(imgDir, { recursive: true });
}

module.exports = async (msg) => {
  try {
    const raw = (msg.body || "").trim();
    if (!raw.toLowerCase().startsWith("!editfaq")) {
      return; // bukan command
    }

    // Format: !editfaq kategori | nomor | pertanyaan baru | jawaban baru
    const m = raw.match(/^!editfaq\b\s*(.*)$/i);
    if (!m || !m[1]) {
      return msg.reply("❌ Format: !editfaq kategori | nomor | pertanyaan | jawaban");
    }

    const parts = m[1]
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean);

    if (parts.length < 4) {
      return msg.reply("❌ Format: !editfaq kategori | nomor | pertanyaan | jawaban");
    }

    const [catNameRaw, numStrRaw, newQ, ...rest] = parts;
    const newA = rest.join(" | ");
    const catName = catNameRaw.toLowerCase();
    const index = parseInt(numStrRaw, 10) - 1;
    const filePath = path.join(faqDir, `${catName}.json`);

    if (!fs.existsSync(filePath)) {
      return msg.reply("❌ Kategori tidak ditemukan!");
    }

    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

    if (Number.isNaN(index) || index < 0 || index >= data.length) {
      return msg.reply("❌ Nomor pertanyaan tidak valid!");
    }

    // update pertanyaan & jawaban
    data[index].pertanyaan = newQ;
    data[index].jawaban = newA;

    // cek apakah ada media baru
    if (msg.hasMedia) {
      const media = await msg.downloadMedia();
      if (media && media.data) {
        const ext = media.mimetype.split("/")[1] || "jpg";
        const fileName = `${Date.now()}.${ext}`;
        const savePath = path.join(imgDir, fileName);

        fs.writeFileSync(savePath, media.data, { encoding: "base64" });

        // kalau data sudah ada images → replace
        if (Array.isArray(data[index].images) && data[index].images.length > 0) {
          data[index].images[0] = fileName;
        } else {
          data[index].images = [fileName];
        }

        console.log("📷 Gambar baru disimpan:", savePath);
      }
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    return msg.reply(
      `✅ Pertanyaan nomor ${index + 1} berhasil diedit!\n📌 Pertanyaan baru: ${newQ}`
    );
  } catch (err) {
    console.error("🔥 Error editfaq:", err);
    return msg.reply("❌ Terjadi error saat mengedit FAQ. Cek console.");
  }
};
