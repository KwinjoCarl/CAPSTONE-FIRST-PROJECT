const XLSX = require('xlsx');
const path = require('path');

const file = process.argv[2] || path.join(__dirname, '..', '..', 'Business Management System', 'BMS-Documentation', 'POSPlus_Product_Import_Template_Populated.xlsx');
const wb = XLSX.readFile(file);
console.log('Sheets:', wb.SheetNames);
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
console.log('Total rows:', rows.length);
console.log('\n=== HEADERS ===');
console.log(JSON.stringify(Object.keys(rows[0] || {}), null, 2));
console.log('\n=== FIRST 3 ROWS ===');
rows.slice(0, 3).forEach((r, i) => console.log(`Row ${i + 1}:`, JSON.stringify(r)));
console.log('\n=== LAST ROW ===');
if (rows.length) console.log(JSON.stringify(rows[rows.length - 1]));
