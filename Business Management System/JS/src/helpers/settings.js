// Central application settings store.
// Settings are persisted in localStorage and merged with defaults so new
// keys added later always have a value.

const SETTINGS_KEY = 'bms_app_settings';
const LOCATIONS_KEY = 'bms_locations';
const TAX_RATES_KEY = 'bms_tax_rates';
const PAYMENT_ACCOUNTS_KEY = 'bms_payment_accounts';

// ---------------------------------------------------------------- defaults
export const DEFAULT_SETTINGS = {
  // Business info
  businessName: 'BMS General Dealer',
  ownerName: '',
  taxNumber: '',
  email: '',
  phone: '',
  address: '',

  // Currency & numbers
  currencySymbol: '$',
  currencyPosition: 'before', // 'before' | 'after'
  thousandSeparator: ',',
  decimalSeparator: '.',
  decimals: 2,

  // Product defaults
  defaultAlertQuantity: 10,
  defaultProfitMargin: 25,
  skuPrefix: 'SKU-',
  enableLowStockAlert: true,

  // Invoice / document prefixes
  invoicePrefix: 'INV-',
  invoiceNextNumber: 1,
  purchasePrefix: 'PUR-',
  expensePrefix: 'EXP-',
  adjustmentPrefix: 'ADJ-',

  // Invoice display
  invoiceFooterText: 'Thank you for your business!',
  showCustomerAddress: true,
  showItemSku: true,

  // Sales
  defaultSaleDiscount: 0,
  allowOverselling: false,

  // Barcode
  barcodeType: 'CODE128',
  barcodeShowName: true,
  barcodeShowPrice: true
};

// ------------------------------------------------------------- core helpers
export const getSettings = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    return { ...DEFAULT_SETTINGS, ...stored };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
};

export const saveSettings = (settings) => {
  const merged = { ...getSettings(), ...settings };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
  return merged;
};

export const formatMoney = (amount) => {
  const s = getSettings();
  const num = Number(amount) || 0;
  const fixed = num.toFixed(s.decimals);
  const [intPart, decPart] = fixed.split('.');
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, s.thousandSeparator);
  const body = decPart ? `${grouped}${s.decimalSeparator}${decPart}` : grouped;
  return s.currencyPosition === 'after'
    ? `${body}${s.currencySymbol}`
    : `${s.currencySymbol}${body}`;
};

export const nextInvoiceNumber = () => {
  const s = getSettings();
  const number = `${s.invoicePrefix}${String(s.invoiceNextNumber).padStart(5, '0')}`;
  saveSettings({ invoiceNextNumber: s.invoiceNextNumber + 1 });
  return number;
};

// ------------------------------------------------------------------ lists
const loadList = (key, seed) => {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch { /* fall through */ }
  localStorage.setItem(key, JSON.stringify(seed));
  return seed;
};

// Business Locations -------------------------------------------------------
const DEFAULT_LOCATIONS = [
  { id: 'loc-main', name: 'Main Store', address: '', isDefault: true }
];

export const getLocations = () =>
  loadList(LOCATIONS_KEY, [...DEFAULT_LOCATIONS]);

export const saveLocations = (locations) => {
  localStorage.setItem(LOCATIONS_KEY, JSON.stringify(locations));
  return locations;
};

// Tax Rates ---------------------------------------------------------------
const DEFAULT_TAX_RATES = [
  { id: 'tax-vat', name: 'VAT', rate: 15 },
  { id: 'tax-none', name: 'No Tax', rate: 0 }
];

export const getTaxRates = () =>
  loadList(TAX_RATES_KEY, [...DEFAULT_TAX_RATES]);

export const saveTaxRates = (rates) => {
  localStorage.setItem(TAX_RATES_KEY, JSON.stringify(rates));
  return rates;
};

// Payment Accounts --------------------------------------------------------
const DEFAULT_PAYMENT_ACCOUNTS = [
  { id: 'acct-cash', name: 'Cash', accountNumber: '', type: 'cash', isDefault: true },
  { id: 'acct-bank', name: 'Bank (POS/Transfer)', accountNumber: '', type: 'bank', isDefault: false },
  { id: 'acct-ecocash', name: 'Ecocash', accountNumber: '', type: 'mobile', isDefault: false }
];

export const getPaymentAccounts = () =>
  loadList(PAYMENT_ACCOUNTS_KEY, [...DEFAULT_PAYMENT_ACCOUNTS]);

export const savePaymentAccounts = (accounts) => {
  localStorage.setItem(PAYMENT_ACCOUNTS_KEY, JSON.stringify(accounts));
  return accounts;
};
