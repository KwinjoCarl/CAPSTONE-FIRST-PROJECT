/**
 * Export data to CSV format
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the file to download
 */
export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle values that contain commas, quotes, or newlines
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export data to Excel format (XLSX)
 * Note: This creates a simple Excel-compatible CSV with .xlsx extension
 * For full Excel features, you would need a library like xlsx or exceljs
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the file to download
 */
export const exportToExcel = (data, filename = 'export.xlsx') => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create Excel-compatible CSV content with UTF-8 BOM
  const BOM = '\uFEFF';
  const csvContent = [
    headers.join('\t'), // Header row (tab-separated for Excel)
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        return String(value);
      }).join('\t')
    )
  ].join('\n');

  // Create blob with BOM for proper Excel encoding
  const blob = new Blob([BOM + csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Format data for export by flattening nested objects and formatting dates
 * @param {Array} data - Array of objects to format
 * @param {Object} columnMapping - Optional mapping of internal keys to display names
 * @returns {Array} Formatted data ready for export
 */
export const formatDataForExport = (data, columnMapping = {}) => {
  return data.map(item => {
    const formatted = {};
    
    Object.keys(item).forEach(key => {
      const displayKey = columnMapping[key] || key;
      let value = item[key];
      
      // Format dates
      if (value instanceof Date) {
        value = value.toLocaleDateString();
      } else if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T/)) {
        value = new Date(value).toLocaleDateString();
      }
      
      // Handle arrays
      if (Array.isArray(value)) {
        value = value.join(', ');
      }
      
      // Handle objects (flatten one level)
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        value = JSON.stringify(value);
      }
      
      formatted[displayKey] = value;
    });
    
    return formatted;
  });
};

/**
 * Export table data with custom column selection
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Array of column keys to include
 * @param {string} filename - Name of the file
 * @param {string} format - 'csv' or 'excel'
 */
export const exportTableData = (data, columns, filename, format = 'csv') => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Filter data to only include specified columns
  const filteredData = data.map(row => {
    const filtered = {};
    columns.forEach(col => {
      if (row[col] !== undefined) {
        filtered[col] = row[col];
      }
    });
    return filtered;
  });

  if (format === 'excel') {
    exportToExcel(filteredData, filename);
  } else {
    exportToCSV(filteredData, filename);
  }
};
