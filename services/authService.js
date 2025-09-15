const ADMIN_NUMBERS = [
  "6281292744550@c.us",
  "6282225627800@c.us",
  "62831838480040@c.us",
]; // Ganti dengan nomor admin

function isAdmin(number) {
  return ADMIN_NUMBERS.includes(number);
}

module.exports = { isAdmin };
