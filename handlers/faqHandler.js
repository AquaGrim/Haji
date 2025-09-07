const fs = require("fs");
const path = require("path");
const { MessageMedia } = require("whatsapp-web.js");

const faqDir = path.join(__dirname, "../faq");
let userStep = {};

module.exports = async (client, msg) => {
  const userId = msg.from;

  // Jika user baru mulai
  if (!userStep[userId]) {
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

  // Pilih kategori
  if (stepData.step === "chooseCategory") {
    const num = parseInt(msg.body);
    if (isNaN(num) || num < 1 || num > stepData.files.length) {
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
    if (isNaN(num) || num < 1 || num > stepData.questions.length) {
      return msg.reply(
        "❌ Pilihan tidak valid. Ketik nomor pertanyaan yang benar."
      );
    }
    const q = stepData.questions[num - 1];
    delete userStep[userId]; // reset step

    // Jika ada gambar di data FAQ
    if (q.images && q.images.length > 0) {
      for (let i = 0; i < q.images.length; i++) {
        const imgPath = path.join(__dirname, "../data/images", q.images[i]);
        if (fs.existsSync(imgPath)) {
          const media = MessageMedia.fromFilePath(imgPath);

          // Gambar pertama pakai caption (jawaban)
          if (i === 0) {
            await client.sendMessage(userId, media, {
              caption: `❓ *${q.question}*\n\n✅ ${q.answer}`,
            });
          } else {
            await client.sendMessage(userId, media);
          }
        } else {
          console.warn(`⚠️ File gambar tidak ditemukan: ${imgPath}`);
        }
      }
      return;
    }

    // Kalau tidak ada gambar → hanya teks
    return client.sendMessage(userId, `❓ *${q.question}*\n\n✅ ${q.answer}`);
  }
};
