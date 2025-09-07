const fs = require("fs");
const path = require("path");

const userStatePath = path.join(__dirname, "../data/userState.json");

let userState = fs.existsSync(userStatePath)
  ? JSON.parse(fs.readFileSync(userStatePath))
  : {};

function saveState() {
  fs.writeFileSync(userStatePath, JSON.stringify(userState, null, 2));
}

function showMainMenu(client, msg) {
  const categories = fs
    .readdirSync(path.join(__dirname, "../faq"))
    .map(
      (file, i) => `${i + 1}️⃣ ${file.replace("faq_", "").replace(".json", "")}`
    )
    .join("\n");

  userState[msg.from] = { step: "main" };
  saveState();

  client.sendMessage(
    msg.from,
    `📌 *Selamat datang di Layanan Informasi Haji & Umrah*\nPilih kategori:\n\n${categories}\n\nKetik *angka pilihan Anda*`
  );
}

function handleMenuInput(client, msg, text) {
  const state = userState[msg.from];

  if (!state) return showMainMenu(client, msg);

  if (state.step === "main") {
    const categories = fs.readdirSync(path.join(__dirname, "../faq"));
    const choice = parseInt(text);
    if (isNaN(choice) || choice < 1 || choice > categories.length) {
      return client.sendMessage(
        msg.from,
        "❌ Pilihan tidak valid. Silakan ketik angka yang sesuai."
      );
    }

    const selectedFile = categories[choice - 1];
    const faqs = JSON.parse(
      fs.readFileSync(path.join(__dirname, "../faq", selectedFile))
    );
    const faqList = faqs
      .map((item, i) => `${i + 1}️⃣ ${item.pertanyaan}`)
      .join("\n");

    userState[msg.from] = { step: "category", file: selectedFile };
    saveState();

    client.sendMessage(
      msg.from,
      `📂 *Kategori: ${selectedFile
        .replace("faq_", "")
        .replace(
          ".json",
          ""
        )}*\n\n${faqList}\n\nKetik *angka pertanyaan* atau ketik *0 untuk kembali ke menu utama*`
    );
  } else if (state.step === "category") {
    if (text === "0") {
      return showMainMenu(client, msg);
    }

    const faqs = JSON.parse(
      fs.readFileSync(path.join(__dirname, "../faq", state.file))
    );
    const choice = parseInt(text);
    if (isNaN(choice) || choice < 1 || choice > faqs.length) {
      return client.sendMessage(
        msg.from,
        "❌ Pilihan tidak valid. Silakan ketik angka yang sesuai."
      );
    }

    const faq = faqs[choice - 1];
    client.sendMessage(
      msg.from,
      `📌 *Pertanyaan:* ${faq.pertanyaan}\n✅ *Jawaban:* ${faq.jawaban}\n\nKetik *0 untuk kembali ke kategori* atau *99 untuk kembali ke menu utama*`
    );
  }
}

function isInMenu(user) {
  return !!userState[user];
}

module.exports = { showMainMenu, handleMenuInput, isInMenu };
