export const getWhatsAppLink = (phone: string, message?: string) => {
    if (!phone) return '#';

    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '');

    // If it doesn't start with 55 (Brazil country code) and is a standard Brazilian number (10 or 11 digits)
    if (cleaned.length >= 10 && cleaned.length <= 11 && !cleaned.startsWith('55')) {
        cleaned = '55' + cleaned;
    }

    const url = `https://wa.me/${cleaned}`;
    if (message) {
        return `${url}?text=${encodeURIComponent(message)}`;
    }
    return url;
};
