const fs = require("fs");
const path = require("path");

// sesuaikan ke struktur Anda (kalau folder faq ada di data/faq ubah di sini)
const faqDir = path.join(__dirname, "../faq");

module.exports = async (msg) => {
  try {
    const raw = (msg.body || "").trim();
    console.log("📩 Raw:", raw);

    // ambil bagian setelah "!deletecategory"
    const m = raw.match(/^!deletecategory\b\s*(.*)$/i);
    if (!m || !m[1]) {
      console.warn("⚠️ Format tidak sesuai pola !deletecategory");
      return msg.reply("❌ Format: !deletecategory NamaKategori");
    }

    const catNameRaw = m[1].trim();
    if (!catNameRaw) {
      console.warn("⚠️ Nama kategori kosong");
      return msg.reply("❌ Format: !deletecategory NamaKategori");
    }

    const catName = catNameRaw.toLowerCase();
    const deletePath = path.join(faqDir, `${catName}.json`);

    console.log("📂 Kategori:", catName);
    console.log("📂 Path file yang akan dihapus:", deletePath);

    if (!fs.existsSync(deletePath)) {
      console.error("❌ File kategori tidak ada:", deletePath);
      return msg.reply("❌ Kategori tidak ditemukan!");
    }

    fs.unlinkSync(deletePath);
    console.log("🗑️ File berhasil dihapus:", deletePath);

    return msg.reply(`✅ Kategori *${catNameRaw}* berhasil dihapus!`);
  } catch (err) {
    console.error("🔥 Error deleteCategory:", err);
    return msg.reply(
      "❌ Terjadi error saat menghapus kategori. Cek console untuk detail."
    );
  }
};
