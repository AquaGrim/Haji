const addCategory = require("./addCategory");
const deleteCategory = require("./deleteCategory");
const addFaq = require("./addFaq");
const editFaq = require("./editFaq");
const deleteFaq = require("./deleteFaq");

const adminSessions = new Map();

/**
 * Tampilkan menu admin
 */
function showAdminMenu(client, msg) {
  adminSessions.set(msg.from, true);
  client.sendMessage(
    msg.from,
    `
📌 *Menu Admin*
1. !addcategory [nama_kategori]
2. !deletecategory [nama_kategori]
3. !addfaq [kategori] | [pertanyaan] | [jawaban]
4. !editfaq [kategori] | [index] | [pertanyaan] | [jawaban]
5. !deletefaq [kategori] | [index]
Ketik *exit* untuk keluar dari mode admin.
  `
  );
}

/**
 * Cek apakah user sedang dalam mode admin
 */
function isInAdminMode(adminNumber) {
  return adminSessions.has(adminNumber);
}

/**
 * Tangani input admin
 */
async function handleAdminInput(client, msg, text) {
  if (text.toLowerCase() === "exit") {
    adminSessions.delete(msg.from);
    return client.sendMessage(msg.from, "✅ Anda keluar dari mode admin.");
  }

  const command = text.split(" ")[0].toLowerCase();

  switch (command) {
    case "!addcategory":
      await addCategory(msg);
      break;
    case "!deletecategory":
      await deleteCategory(msg);
      break;
    case "!addfaq":
      await addFaq(msg);
      break;
    case "!editfaq":
      await editFaq(msg);
      break;
    case "!deletefaq":
      await deleteFaq(msg);
      break;
    default:
      msg.reply("⚠️ Perintah admin tidak dikenali.");
  }
}

module.exports = {
  showAdminMenu,
  isInAdminMode,
  handleAdminInput,
};
