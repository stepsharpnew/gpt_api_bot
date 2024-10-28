const fs = require('fs');
const path = require('path');

function logToFile(message) {
    const filePath = path.join(__dirname, '../log.txt');
    fs.appendFileSync(filePath, `${message}\n`);
}

module.exports = {logToFile}