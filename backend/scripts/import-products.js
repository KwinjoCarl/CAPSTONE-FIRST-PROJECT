// One-time product import from the POSPlus Excel template.
// - Inserts rows into MySQL `products` table
// - Writes Add-Product-shaped JSON to the frontend public folder so the
//   Products list (localStorage-backed) can be seeded with the same data.
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');
require('dotenv').config();

const FILE = path.join(__dirname, '..', '..', 'Business Management System', 'BMS-Documentation', 'POSPlus_Product_Import_Template_Populated.xlsx');
const OUT_JSON = path.join(__dirname, '..', '..', 'Business Management System', 'JS', 'public', 'imported-products.json');

const SKU_PREFIX = 'SKU-';
const ALERT_QTY = 15;
const DEFAULT_MARGIN = 25; // mirrors settings.js defaultProfitMargin

const num = (v) => {
  const n = parseFloat(String(v ?? '').replace(/[^0-9.\-]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

async function main() {
  const wb = XLSX.readFile(FILE);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const grid = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', raw: true });

  // Locate the real header row (contains "Product Name")
  const headerIdx = grid.findIndex((r) => String(r[0] || '').includes('Product Name'));
  if (headerIdx === -1) throw new Error('Header row not found');

  const products = [];
  for (const r of grid.slice(headerIdx + 1)) {
    const name = String(r[0] || '').trim();
    if (!name) continue;
    if (/populated products/i.test(name)) continue; // summary row

    const purchase = num(r[10]);
    const margin = num(r[11]) || DEFAULT_MARGIN;
    const selling = +(purchase * (1 + margin / 100)).toFixed(2);

    products.push({
      // MySQL / API shape
      name,
      sku: String(r[1] || '').trim(),
      category: String(r[4] || '').trim() || null,
      brand: String(r[3] || '').trim() || null,
      unit: String(r[2] || '').trim() || 'Pieces',
      purchase_price: purchase,
      selling_price: selling,
      current_stock: 0,
      opening_stock: 0,
      alert_quantity: ALERT_QTY,
      // Add-Product / localStorage shape
      subCategory: String(r[5] || '').trim(),
      manageStock: true,
      weight: num(r[7]) || '',
      notForSelling: /^yes$/i.test(String(r[8] || '').trim()),
      productType: String(r[9] || 'Single').trim().toLowerCase() || 'single',
      margin
    });
  }

  console.log(`Parsed ${products.length} products from Excel`);

  // ---- MySQL insert ----
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  const [existing] = await conn.query('SELECT sku FROM products');
  const usedSkus = new Set(existing.map((r) => r.sku));
  let seq = 1;
  const nextSku = () => {
    let sku;
    do { sku = `${SKU_PREFIX}${String(seq++).padStart(5, '0')}`; } while (usedSkus.has(sku));
    usedSkus.add(sku);
    return sku;
  };

  let inserted = 0, skipped = 0;
  for (const p of products) {
    const sku = p.sku || nextSku();
    try {
      await conn.query(
        `INSERT INTO products (name, sku, category, brand, unit, purchase_price, selling_price, current_stock, opening_stock, alert_quantity)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.name, sku, p.category, p.brand, p.unit, p.purchase_price, p.selling_price, p.current_stock, p.opening_stock, p.alert_quantity]
      );
      p.sku = sku;
      inserted++;
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') { skipped++; console.log(`  skip (dup sku ${sku}): ${p.name}`); }
      else throw e;
    }
  }
  console.log(`MySQL: inserted ${inserted}, skipped ${skipped}`);

  // ---- localStorage seed file (Add Product shape) ----
  const lsProducts = products.map((p, i) => ({
    id: `imp-${Date.now()}-${i}`,
    name: p.name,
    sku: p.sku,
    unit: p.unit,
    brand: p.brand || '',
    category: p.category || '',
    subCategory: p.subCategory,
    manageStock: p.manageStock,
    alertQuantity: ALERT_QTY,
    weight: p.weight,
    notForSelling: p.notForSelling,
    productType: p.productType,
    purchasePrice: p.purchase_price,
    margin: p.margin,
    sellingPrice: p.selling_price,
    currentStock: 0,
    image: '',
    tax: '',
    status: 'Active',
    createdAt: new Date().toISOString()
  }));
  fs.writeFileSync(OUT_JSON, JSON.stringify(lsProducts, null, 2));
  console.log(`Wrote ${lsProducts.length} products -> ${OUT_JSON}`);

  await conn.end();
}

main().catch((e) => { console.error('Import failed:', e); process.exit(1); });
