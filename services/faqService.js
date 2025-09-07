const fs = require('fs');
const path = require('path');

const FAQ_DIR = path.join(__dirname, '../faq');

function getFaqCategories() {
    const files = fs.readdirSync(FAQ_DIR);
    return files.map(file => {
        const data = JSON.parse(fs.readFileSync(path.join(FAQ_DIR, file), 'utf-8'));
        return { file, kategori: data.kategori };
    });
}

function getFaqByCategory(fileName) {
    const filePath = path.join(FAQ_DIR, fileName);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return data.faq;
}

function addFaq(fileName, pertanyaan, jawaban) {
    const filePath = path.join(FAQ_DIR, fileName);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    data.faq.push({ pertanyaan, jawaban });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// ✅ Tambah kategori baru
function addCategory(namaKategori) {
    const fileName = `faq_${namaKategori.toLowerCase().replace(/\s+/g, '_')}.json`;
    const filePath = path.join(FAQ_DIR, fileName);

    if (fs.existsSync(filePath)) {
        return false; // kategori sudah ada
    }

    const newCategory = {
        kategori: namaKategori,
        faq: []
    };

    fs.writeFileSync(filePath, JSON.stringify(newCategory, null, 2));
    return true;
}

// ✅ Hapus pertanyaan
function deleteFaq(fileName, index) {
    const filePath = path.join(FAQ_DIR, fileName);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    if (index < 0 || index >= data.faq.length) return false;

    data.faq.splice(index, 1);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
}

// ✅ Edit pertanyaan
function editFaq(fileName, index, pertanyaanBaru, jawabanBaru) {
    const filePath = path.join(FAQ_DIR, fileName);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    if (index < 0 || index >= data.faq.length) return false;

    data.faq[index] = { pertanyaan: pertanyaanBaru, jawaban: jawabanBaru };
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
}

module.exports = { getFaqCategories, getFaqByCategory, addFaq, addCategory, deleteFaq, editFaq };
