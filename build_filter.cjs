const fs = require('fs');

let content = fs.readFileSync('c:/Users/felip/Documents/ForcaDIgital/frontTempCliente/frontTempCliente/src/App.jsx', 'utf8');

const targetBlockStart = `      const filteredArray = baseFilteredArray.filter(item => {
        const dateString = item.updated_at || item.created_at;
        if (!dateString) return true;
        const itemDate = new Date(dateString);
        const diffTime = Math.abs(now - itemDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));`;

const targetBlockEnd = `        if (filter.startsWith('date:')) {
          const selectedDate = new Date(filter.split(':')[1]);
          // "A partir de" (since the selected date)
          return itemDate >= selectedDate;
        }
        return true;
      });`;

const newBlock = `      const isDateInRange = (dateString, filterStr) => {
        if (!dateString) return true;
        const itemDate = new Date(dateString);
        const diffTime = Math.abs(now - itemDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (filterStr === 'Hoje') {
          return itemDate.getDate() === now.getDate() && itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
        }
        if (filterStr === '7 Dias') return diffDays <= 7;
        if (filterStr === '30 Dias') return diffDays <= 30;
        if (filterStr === '6 Meses') return diffDays <= 180;
        if (filterStr === '1 Ano') return diffDays <= 365;
        if (filterStr.startsWith('date:')) {
          const selectedDate = new Date(filterStr.split(':')[1]);
          return itemDate >= selectedDate;
        }
        return true;
      };

      const filteredArray = baseFilteredArray.map(item => {
        if (!item.updates || item.updates.length === 0) return item;
        return {
          ...item,
          updates: item.updates.filter(u => isDateInRange(u.created_at || item.updated_at || item.created_at, filter))
        };
      }).filter(item => {
        const dateString = item.updated_at || item.created_at;
        return isDateInRange(dateString, filter);
      });`;

const startIdx = content.indexOf('const filteredArray = baseFilteredArray.filter(item => {');
const endIdx = content.indexOf('return true;\n      });', startIdx) + 'return true;\n      });'.length;

if (startIdx !== -1 && endIdx !== -1) {
  content = content.substring(0, startIdx) + newBlock + content.substring(endIdx);
  fs.writeFileSync('c:/Users/felip/Documents/ForcaDIgital/frontTempCliente/frontTempCliente/src/App.jsx', content);
  console.log('Successfully updated filteredArray logic in App.jsx');
} else {
  console.error('Could not find the target block');
}
