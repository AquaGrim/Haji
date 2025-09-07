const fs = require('fs');
const path = require('path');
const faqDir = path.join(__dirname, '../faq');

module.exports = async (msg) => {
    const args = msg.body.split(' ');
    if (!args[1]) return msg.reply('❌ Format: !addcategory NamaKategori');

    const category = args[1].toLowerCase();
    const filePath = path.join(faqDir, `${category}.json`);

    // Buat folder jika belum ada
    if (!fs.existsSync(faqDir)) {
        fs.mkdirSync(faqDir, { recursive: true });
    }

    if (fs.existsSync(filePath)) return msg.reply('⚠️ Kategori sudah ada!');

    // Buat file baru dengan format array kosong
    fs.writeFileSync(filePath, JSON.stringify([], null, 2));

    msg.reply(`✅ Kategori *${args[1]}* berhasil ditambahkan dengan format array!`);
};