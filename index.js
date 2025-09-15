const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const fs = require("fs");
const path = require("path");
const menuHandler = require("./handlers/menuHandler");
const adminHandler = require("./handlers/adminHandler");

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

const ADMIN_NUMBERS = ["6281292744550@c.us"];

// === LOAD DATA FIRST CHAT ===
const firstChatPath = path.join(__dirname, "data/firstChat.json");
let firstChat =
  fs.existsSync(firstChatPath) && fs.readFileSync(firstChatPath).length > 0
    ? JSON.parse(fs.readFileSync(firstChatPath))
    : {};

function saveFirstChat() {
  fs.writeFileSync(firstChatPath, JSON.stringify(firstChat, null, 2));
}

// === RESET OTOMATIS SETIAP HARI JAM 00:00 ===
function scheduleReset() {
  const now = new Date();
  const msUntilMidnight =
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0) -
    now;

  setTimeout(() => {
    firstChat = {};
    saveFirstChat();
    console.log("♻️ Data firstChat direset untuk hari baru");
    scheduleReset(); // pasang ulang untuk hari berikutnya
  }, msUntilMidnight);
}

client.on("qr", (qr) => qrcode.generate(qr, { small: true }));

client.on("ready", () => {
  console.log("✅ Bot siap berjalan...");
  scheduleReset();
});

client.on("message", async (msg) => {
  const from = msg.from;
  const text = msg.body.trim();
  const isAdmin = ADMIN_NUMBERS.includes(from);

  // === CEK & TAMPILKAN SAMBUTAN JIKA CHAT PERTAMA HARI INI ===
  if (!firstChat[from]) {
    firstChat[from] = true;
    saveFirstChat();
    await client.sendMessage(
      from,
      `🤝 Assalamu’alaikum Wr. Wb. @${
        msg.author || msg.from.replace("@c.us", "")
      }\n` +
        `Selamat datang di layanan *Haji & Umrah* Kementerian Agama Kuansing.\n\n` +
        `Silakan ketik *menu* untuk melihat daftar bantuan yang tersedia.`
    );
  }

  // Jika admin ketik !admin → buka menu admin
  if (isAdmin && text.toLowerCase() === "!admin") {
    return adminHandler.showAdminMenu(client, msg);
  }

  // Jika admin berada di mode admin
  if (isAdmin && adminHandler.isInAdminMode(from)) {
    return adminHandler.handleAdminInput(client, msg, text);
  }

  // Jika user ketik "menu" → tampilkan menu utama
  if (text.toLowerCase() === "menu") {
    return menuHandler.showMainMenu(client, msg);
  }

  // Jika user sedang navigasi menu
  if (menuHandler.isInMenu(from)) {
    return menuHandler.handleMenuInput(client, msg, text);
  }
});

client.initialize();
