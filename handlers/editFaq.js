const fs = require("fs");
const path = require("path");

// arahkan sesuai strukturmu
const faqDir = path.join(__dirname, "../faq");

module.exports = async (msg) => {
  try {
    const raw = (msg.body || "").trim();
    console.log("📩 Raw:", raw);

    // ambil hanya bagian setelah "!editfaq"
    const m = raw.match(/^!editfaq\b\s*(.*)$/i);
    if (!m || !m[1]) {
      console.warn("⚠️ Perintah tidak sesuai pola !editfaq");
      return msg.reply(
        "❌ Format: !editfaq NamaKategori | Nomor | PertanyaanBaru | JawabanBaru"
      );
    }

    const argsStr = m[1].trim();
    console.log("🧩 Args after command:", argsStr);

    // split berdasarkan pipa
    const parts = argsStr
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean);
    console.log("🔎 Parts:", parts);

    if (parts.length < 4) {
      console.warn("⚠️ Parts kurang:", parts.length);
      return msg.reply(
        "❌ Format: !editfaq NamaKategori | Nomor | PertanyaanBaru | JawabanBaru"
      );
    }

    // dukung kemungkinan ada ekstra "|" di jawaban → gabung sisanya
    const [catNameRaw, numStrRaw, newQ, ...rest] = parts;
    const newA = rest.join(" | ");
    const catName = catNameRaw.toLowerCase();
    const filePath = path.join(faqDir, `${catName}.json`);

    console.log("📂 Kategori:", catName, "→ file:", filePath);
    console.log("🔢 NumStr:", numStrRaw, "Q:", newQ, "A:", newA);

    if (!fs.existsSync(filePath)) {
      console.error("❌ File kategori tidak ada:", filePath);
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
    console.log("🔢 Index:", index, "Data length:", data.length);

    if (Number.isNaN(index) || index < 0 || index >= data.length) {
      console.warn("⚠️ Nomor tidak valid");
      return msg.reply("❌ Nomor pertanyaan tidak valid!");
    }

    console.log("✏️ Before:", data[index]);
    data[index].pertanyaan = newQ;
    data[index].jawaban = newA;
    console.log("✅ After:", data[index]);

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log("💾 Saved:", filePath);

    return msg.reply(
      `✅ Pertanyaan nomor ${
        index + 1
      } berhasil diedit!\n📌 Pertanyaan baru: ${newQ}`
    );
  } catch (err) {
    console.error("🔥 Uncaught error editFaq:", err);
    return msg.reply(
      "❌ Terjadi error saat mengedit FAQ. Cek console untuk detail."
    );
  }
};
