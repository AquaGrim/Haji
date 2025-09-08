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
  // Daftar kategori dalam urutan yang diinginkan
  const categoryOrder = [
    "kuota",
    "biaya",
    "syarat",
    "perjalanan",
    "kesehatan",
    "ibadah",
    "lain",
  ];

  // Membaca semua file dari folder faq
  const files = fs.readdirSync(path.join(__dirname, "../faq"));

  // Memfilter hanya file yang sesuai dengan kategori yang diinginkan
  const categories = categoryOrder
    .map((cat) => {
      const fileName = `faq_${cat}.json`;
      if (files.includes(fileName)) {
        return fileName;
      }
      return null;
    })
    .filter(Boolean);

  // Membuat teks menu dengan emoji dan format yang rapi
  const menuText = categories
    .map((file, i) => {
      const categoryName = file.replace("faq_", "").replace(".json", "");
      // Menyesuaikan emoji dan format teks untuk setiap kategori
      switch (categoryName) {
        case "kuota":
          return `1️⃣ Kuota & Pendaftaran`;
        case "biaya":
          return `2️⃣ Biaya & Pembayaran`;
        case "syarat":
          return `3️⃣ Syarat & Ketentuan`;
        case "perjalanan":
          return `4️⃣ Perjalanan & Fasilitas`;
        case "kesehatan":
          return `5️⃣ Kesehatan & Vaksinasi`;
        case "ibadah":
          return `6️⃣ Ibadah & Manasik`;
        case "lain":
          return `7️⃣ Lain-lain`;
        default:
          return `${i + 1}️⃣ ${categoryName}`;
      }
    })
    .join("\n");

  userState[msg.from] = { step: "main" };
  saveState();

  client.sendMessage(
    msg.from,
    `📌 *Selamat datang di Layanan Informasi Haji & Umrah*\nPilih kategori:\n\n${menuText}\n\nKetik *angka pilihan Anda*`
  );
}

function handleMenuInput(client, msg, text) {
  const state = userState[msg.from];
  if (!state) return showMainMenu(client, msg);

  if (state.step === "main") {
    const categoryOrder = [
      "kuota",
      "biaya",
      "syarat",
      "perjalanan",
      "kesehatan",
      "ibadah",
      "lain",
    ];

    const files = fs.readdirSync(path.join(__dirname, "../faq"));
    const categories = categoryOrder
      .map((cat) => {
        const fileName = `faq_${cat}.json`;
        if (files.includes(fileName)) {
          return fileName;
        }
        return null;
      })
      .filter(Boolean);

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

    userState[msg.from] = {
      step: "category",
      file: selectedFile,
    };
    saveState();

    // Menampilkan nama kategori yang sesuai
    const categoryName = selectedFile.replace("faq_", "").replace(".json", "");
    let displayCategory;
    switch (categoryName) {
      case "kuota":
        displayCategory = "Kuota & Pendaftaran";
        break;
      case "biaya":
        displayCategory = "Biaya & Pembayaran";
        break;
      case "syarat":
        displayCategory = "Syarat & Ketentuan";
        break;
      case "perjalanan":
        displayCategory = "Perjalanan & Fasilitas";
        break;
      case "kesehatan":
        displayCategory = "Kesehatan & Vaksinasi";
        break;
      case "ibadah":
        displayCategory = "Ibadah & Manasik";
        break;
      case "lain":
        displayCategory = "Lain-lain";
        break;
      default:
        displayCategory = categoryName;
    }

    client.sendMessage(
      msg.from,
      `📂 *Kategori: ${displayCategory}*\n\n${faqList}\n\nKetik *angka pertanyaan* atau ketik *0 untuk kembali ke menu utama*`
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

module.exports = {
  showMainMenu,
  handleMenuInput,
  isInMenu,
};
