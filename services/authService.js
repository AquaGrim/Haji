const ADMIN_NUMBERS = ['6281292744550@c.us']; // Ganti dengan nomor admin

function isAdmin(number) {
    return ADMIN_NUMBERS.includes(number);
}

module.exports = { isAdmin };
