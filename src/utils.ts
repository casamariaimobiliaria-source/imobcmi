
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatPercent = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(value / 100);
};

export const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  
  // Fix timezone issue by parsing the parts manually
  // This avoids new Date('YYYY-MM-DD') which defaults to UTC and shifts back 1 day in western timezones
  const parts = dateStr.split('-');
  
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // JS months are 0-based
    const day = parseInt(parts[2], 10);
    
    const date = new Date(year, month, day);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  }

  // Fallback for full ISO strings if necessary
  return new Intl.DateTimeFormat('pt-BR').format(new Date(dateStr));
};

export const generateId = () => Math.random().toString(36).substr(2, 9);
