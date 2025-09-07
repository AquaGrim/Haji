const fs = require("fs");
const path = require("path");
const faqDir = path.join(__dirname, "../faq");

module.exports = async (msg) => {
  const args = msg.body.split("|"); // format: !addfaq namaKategori|pertanyaan|jawaban
  if (args.length < 3)
    return msg.reply("❌ Format: !addfaq kategori|pertanyaan|jawaban");

  const category = args[0].replace("!addfaq ", "").trim().toLowerCase();
  const question = args[1].trim();
  const answer = args[2].trim();

  const filePath = path.join(faqDir, `${category}.json`);

  if (!fs.existsSync(filePath))
    return msg.reply("❌ Kategori tidak ditemukan!");

  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  data.push({ pertanyaan: question, jawaban: answer });

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  msg.reply(
    `✅ FAQ berhasil ditambahkan ke kategori *${category}*!\n📌 Pertanyaan: ${question}`
  );
};
