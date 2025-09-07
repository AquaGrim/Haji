const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const fs = require("fs");
const path = require("path");
const menuHandler = require("./handlers/menuHandler");
const adminHandler = require("./handlers/adminHandler");

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: true },
});

const ADMIN_NUMBERS = ["6281292744550@c.us"]; // Ganti dengan nomor admin WA

client.on("qr", (qr) => qrcode.generate(qr, { small: true }));

client.on("ready", () => {
  console.log("✅ Bot siap berjalan...");
});

client.on("message", async (msg) => {
  const from = msg.from;
  const text = msg.body.trim();
  const isAdmin = ADMIN_NUMBERS.includes(from);

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
