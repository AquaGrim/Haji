const fs = require("fs");
const path = require("path");

// arahkan sesuai struktur Anda
const faqDir = path.join(__dirname, "../faq");

module.exports = async (msg) => {
  try {
    const raw = (msg.body || "").trim();
    console.log("📩 Raw:", raw);

    // Ambil teks setelah "!deletefaq"
    const m = raw.match(/^!deletefaq\b\s*(.*)$/i);
    if (!m || !m[1]) {
      console.warn("⚠️ Format tidak sesuai pola !deletefaq");
      return msg.reply("❌ Format: !deletefaq NamaKategori | Nomor");
    }

    const argsStr = m[1].trim();
    console.log("🧩 Args after command:", argsStr);

    const parts = argsStr.split("|").map((p) => p.trim()).filter(Boolean);
    console.log("🔎 Parts:", parts);

    if (parts.length < 2) {
      console.warn("⚠️ Parts kurang:", parts.length);
      return msg.reply("❌ Format: !deletefaq NamaKategori | Nomor");
    }

    const [catNameRaw, numStrRaw] = parts;
    const catName = catNameRaw.toLowerCase();
    const filePath = path.join(faqDir, `${catName}.json`);

    console.log("📂 Kategori:", catName, "→ file:", filePath);

    if (!fs.existsSync(filePath)) {
      console.error("❌ File tidak ditemukan:", filePath);
      return msg.reply("❌ Kategori tidak ditemukan!");
    }

    const rawData = fs.readFileSync(filePath, "utf8");
    console.log("📄 Raw JSON len:", rawData.length);

    let data;
    try {
      data = JSON.parse(rawData);
    } catch (e) {
      console.error("🔥 JSON invalid:", e);
      return msg.reply("❌ File FAQ rusak/JSON tidak valid.");
    }

    const index = parseInt(numStrRaw, 10) - 1;
    console.log("🔢 Index:", index);

    if (!Array.isArray(data)) {
      console.warn("⚠️ Format data bukan array:", data);
      return msg.reply("❌ Format file FAQ tidak sesuai (harus array).");
    }

    if (Number.isNaN(index) || index < 0 || index >= data.length) {
      console.warn("⚠️ Nomor tidak valid:", index);
      return msg.reply("❌ Nomor pertanyaan tidak valid!");
    }

    console.log("🗑️ Pertanyaan yang akan dihapus:", data[index]);
    data.splice(index, 1);

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log("💾 Data tersimpan setelah delete");

    return msg.reply(`✅ Pertanyaan nomor ${numStrRaw} berhasil dihapus!`);
  } catch (err) {
    console.error("🔥 Uncaught error deleteFaq:", err);
    return msg.reply("❌ Terjadi error saat menghapus FAQ. Cek console untuk detail.");
  }
};
