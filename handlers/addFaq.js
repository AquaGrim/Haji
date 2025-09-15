const fs = require("fs");
const path = require("path");
const faqDir = path.join(__dirname, "../faq");
const imgDir = path.join(__dirname, "../data/images");

// pastikan folder gambar ada
if (!fs.existsSync(imgDir)) {
  fs.mkdirSync(imgDir, { recursive: true });
}

module.exports = async (msg) => {
  try {
    const raw = (msg.body || "").trim();
    if (!raw.toLowerCase().startsWith("!addfaq")) {
      return; // bukan command
    }

    const args = raw.split("|");
    if (args.length < 3) {
      return msg.reply("❌ Format: !addfaq kategori | pertanyaan | jawaban");
    }

    const category = args[0].replace("!addfaq", "").trim().toLowerCase();
    const question = args[1].trim();
    const answer = args.slice(2).join("|").trim(); // gabung sisanya biar aman

    const filePath = path.join(faqDir, `${category}.json`);
    if (!fs.existsSync(filePath)) {
      return msg.reply("❌ Kategori tidak ditemukan!");
    }

    // load data FAQ
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

    // default tanpa gambar
    let images = [];

    // kalau admin kirim media (foto/file)
    if (msg.hasMedia) {
      const media = await msg.downloadMedia();
      if (media && media.data) {
        // kasih nama unik
        const ext = media.mimetype.split("/")[1] || "jpg";
        const fileName = `${Date.now()}.${ext}`;
        const savePath = path.join(imgDir, fileName);

        // simpan file
        fs.writeFileSync(savePath, media.data, { encoding: "base64" });

        images.push(fileName);
        console.log("📷 Gambar disimpan:", savePath);
      }
    }

    // simpan ke JSON
    data.push({
      pertanyaan: question,
      jawaban: answer,
      images: images
    });

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    msg.reply(
      `✅ FAQ berhasil ditambahkan ke kategori *${category}*!\n📌 Pertanyaan: ${question}${
        images.length ? `\n🖼️ Gambar tersimpan: ${images[0]}` : ""
      }`
    );
  } catch (err) {
    console.error("🔥 Error addfaq:", err);
    msg.reply("❌ Terjadi error saat menambah FAQ. Cek console.");
  }
};
