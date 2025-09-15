const fs = require("fs");
const path = require("path");
const { MessageMedia } = require("whatsapp-web.js");

const faqDir = path.join(__dirname, "../faq");
let userStep = {};

module.exports = async (client, msg) => {
  try {
    const userId = msg.from;
    console.log(`📩 Pesan diterima dari ${userId}: ${msg.body}`);

    // Jika user baru mulai
    if (!userStep[userId]) {
      console.log("🟢 User baru, kirim menu utama...");
      const files = fs.readdirSync(faqDir).filter((f) => f.endsWith(".json"));
      let menu = "📖 *Menu FAQ Haji*\n\nPilih kategori dengan kirim nomor:\n";
      files.forEach((file, i) => {
        const data = JSON.parse(fs.readFileSync(path.join(faqDir, file)));
        menu += `${i + 1}. ${data.category}\n`;
      });
      menu += "\nKetik nomor kategori:";
      userStep[userId] = { step: "chooseCategory", files };
      return msg.reply(menu);
    }

    const stepData = userStep[userId];
    console.log(`🔄 Step user ${userId}:`, stepData);

    // Pilih kategori
    if (stepData.step === "chooseCategory") {
      const num = parseInt(msg.body);
      console.log(`➡️ User pilih kategori nomor: ${num}`);

      if (isNaN(num) || num < 1 || num > stepData.files.length) {
        console.warn("❌ Input kategori tidak valid:", msg.body);
        return msg.reply(
          "❌ Pilihan tidak valid. Ketik nomor kategori yang benar."
        );
      }

      const file = stepData.files[num - 1];
      const data = JSON.parse(fs.readFileSync(path.join(faqDir, file)));
      let menu = `📂 *${data.category}*\n\nPilih pertanyaan:\n`;
      data.questions.forEach((q, i) => {
        menu += `${i + 1}. ${q.question}\n`;
      });
      menu += "\nKetik nomor pertanyaan untuk melihat jawaban:";
      userStep[userId] = { step: "chooseQuestion", questions: data.questions };
      return msg.reply(menu);
    }

    // Pilih pertanyaan
    if (stepData.step === "chooseQuestion") {
      const num = parseInt(msg.body);
      console.log(`➡️ User pilih pertanyaan nomor: ${num}`);

      if (isNaN(num) || num < 1 || num > stepData.questions.length) {
        console.warn("❌ Input pertanyaan tidak valid:", msg.body);
        return msg.reply(
          "❌ Pilihan tidak valid. Ketik nomor pertanyaan yang benar."
        );
      }

      const q = stepData.questions[num - 1];
      console.log("✅ Pertanyaan dipilih:", q.question);
      delete userStep[userId]; // reset step

      // Jika ada gambar di data FAQ
      if (q.images && q.images.length > 0) {
        console.log(
          `🖼️ Mengirim ${q.images.length} gambar untuk pertanyaan ini...`
        );
        for (let i = 0; i < q.images.length; i++) {
          const imgPath = path.join(__dirname, "../data/images", q.images[i]);
          console.log(`🔍 Cek gambar: ${imgPath}`);

          if (fs.existsSync(imgPath)) {
            try {
              const media = MessageMedia.fromFilePath(imgPath);
              if (i === 0) {
                console.log("📤 Kirim gambar pertama dengan caption...");
                await client.sendMessage(userId, media, {
                  caption: `❓ *${q.question}*\n\n✅ ${q.answer}`,
                });
              } else {
                console.log("📤 Kirim gambar tambahan tanpa caption...");
                await client.sendMessage(userId, media);
              }
            } catch (err) {
              console.error("❌ Gagal kirim gambar:", err);
            }
          } else {
            console.warn(`⚠️ File gambar tidak ditemukan: ${imgPath}`);
          }
        }
        return;
      }

      // Kalau tidak ada gambar → hanya teks
      console.log("📝 Tidak ada gambar, kirim jawaban teks saja...");
      return client.sendMessage(userId, `❓ *${q.question}*\n\n✅ ${q.answer}`);
    }
  } catch (err) {
    console.error("🔥 Error di handler FAQ:", err);
    return msg.reply("❌ Terjadi kesalahan pada sistem FAQ. Coba lagi nanti.");
  }
};
