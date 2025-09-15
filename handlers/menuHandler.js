const fs = require("fs");
const path = require("path");
const { MessageMedia } = require("whatsapp-web.js");

const userStatePath = path.join(__dirname, "../data/userState.json");
let userState = fs.existsSync(userStatePath)
  ? JSON.parse(fs.readFileSync(userStatePath))
  : {};

function saveState() {
  console.log("[DEBUG] Menyimpan state:", userState);
  fs.writeFileSync(userStatePath, JSON.stringify(userState, null, 2));
}

function showMainMenu(client, msg) {
  console.log("[DEBUG] showMainMenu dipanggil oleh:", msg.from);

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
  console.log("[DEBUG] File FAQ ditemukan:", files);

  const categories = categoryOrder
    .map((cat) => {
      const fileName = `faq_${cat}.json`;
      if (files.includes(fileName)) {
        return fileName;
      }
      return null;
    })
    .filter(Boolean);

  console.log("[DEBUG] Kategori valid:", categories);

  const menuText = categories
    .map((file, i) => {
      const categoryName = file.replace("faq_", "").replace(".json", "");
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

  console.log("[DEBUG] Kirim menu utama ke:", msg.from);
  client.sendMessage(
    msg.from,
    `📌 *Selamat datang di Layanan Informasi Haji & Umrah*\nPilih kategori:\n\n${menuText}\n\nKetik *angka pilihan Anda*`
  );
}

async function handleMenuInput(client, msg, text) {
  console.log(
    "[DEBUG] handleMenuInput dipanggil oleh:",
    msg.from,
    "input:",
    text
  );

  const state = userState[msg.from];
  console.log("[DEBUG] State user saat ini:", state);

  if (!state) {
    console.log("[DEBUG] Tidak ada state, tampilkan menu utama.");
    return showMainMenu(client, msg);
  }

  if (state.step === "main") {
    console.log("[DEBUG] User berada di step: main");

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

    console.log("[DEBUG] Pilihan kategori tersedia:", categories);

    const choice = parseInt(text);
    if (isNaN(choice) || choice < 1 || choice > categories.length) {
      console.log("[DEBUG] Pilihan kategori tidak valid:", text);
      return client.sendMessage(
        msg.from,
        "❌ Pilihan tidak valid. Silakan ketik angka yang sesuai."
      );
    }

    const selectedFile = categories[choice - 1];
    console.log("[DEBUG] File kategori dipilih:", selectedFile);

    const faqs = JSON.parse(
      fs.readFileSync(path.join(__dirname, "../faq", selectedFile))
    );

    console.log("[DEBUG] Jumlah pertanyaan dalam kategori:", faqs.length);

    const faqList = faqs
      .map((item, i) => `${i + 1}️⃣ ${item.pertanyaan}`)
      .join("\n");

    userState[msg.from] = {
      step: "category",
      file: selectedFile,
    };
    saveState();

    const categoryName = selectedFile.replace("faq_", "").replace(".json", "");
    console.log("[DEBUG] Nama kategori display:", categoryName);

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
    console.log("[DEBUG] User berada di step: category");

    if (text === "0") {
      console.log("[DEBUG] User memilih kembali ke menu utama.");
      return showMainMenu(client, msg);
    }

    const faqs = JSON.parse(
      fs.readFileSync(path.join(__dirname, "../faq", state.file))
    );

    const choice = parseInt(text);
    if (isNaN(choice) || choice < 1 || choice > faqs.length) {
      console.log("[DEBUG] Pilihan pertanyaan tidak valid:", text);
      return client.sendMessage(
        msg.from,
        "❌ Pilihan tidak valid. Silakan ketik angka yang sesuai."
      );
    }

    const faq = faqs[choice - 1];
    console.log("[DEBUG] FAQ dipilih:", faq);

    // ✅ Jika ada gambar
    if (faq.images && faq.images.length > 0) {
      console.log("[DEBUG] FAQ memiliki gambar:", faq.images);
      for (let i = 0; i < faq.images.length; i++) {
        const imgPath = path.join(__dirname, "../data/images", faq.images[i]);
        console.log("[DEBUG] Cek gambar:", imgPath);

        if (fs.existsSync(imgPath)) {
          try {
            const media = MessageMedia.fromFilePath(imgPath);
            if (i === 0) {
              console.log("[DEBUG] Kirim gambar pertama dengan caption");
              await client.sendMessage(msg.from, media, {
                caption: `📌 *Pertanyaan:* ${faq.pertanyaan}\n✅ *Jawaban:* ${faq.jawaban}\n\nKetik *0 untuk kembali ke kategori* atau *99 untuk kembali ke menu utama*`,
              });
            } else {
              console.log("[DEBUG] Kirim gambar tambahan");
              await client.sendMessage(msg.from, media);
            }
          } catch (err) {
            console.error("[ERROR] Gagal kirim gambar:", err);
          }
        } else {
          console.warn("[WARN] File gambar tidak ditemukan:", imgPath);
        }
      }
    } else {
      console.log("[DEBUG] FAQ tanpa gambar, kirim teks saja");
      client.sendMessage(
        msg.from,
        `📌 *Pertanyaan:* ${faq.pertanyaan}\n✅ *Jawaban:* ${faq.jawaban}\n\nKetik *0 untuk kembali ke kategori* atau *99 untuk kembali ke menu utama*`
      );
    }
  }
}

function isInMenu(user) {
  console.log("[DEBUG] isInMenu cek user:", user);
  return !!userState[user];
}

module.exports = {
  showMainMenu,
  handleMenuInput,
  isInMenu,
};
