const XLSX = require('xlsx');
const path = require('path');
const file = path.join(__dirname, '..', '..', 'Business Management System', 'BMS-Documentation', 'POSPlus_Product_Import_Template_Populated.xlsx');
const wb = XLSX.readFile(file);
const ws = wb.Sheets['Inventory & Valuation'];
const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
console.log('Inventory rows:', rows.length);
rows.slice(0, 5).forEach((r, i) => console.log(`Row ${i}:`, JSON.stringify(r)));
