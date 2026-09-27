import { CartItem, CustomerOrderInfo } from '../types/shop';

/**
 * Clean phone number for WhatsApp wa.me links (digits only, no +, -, spaces)
 */
export function sanitizeWhatsAppPhone(phone: string): string {
  return phone.replace(/[^\d]/g, '');
}

/**
 * Generate formatted WhatsApp order message string
 */
export function generateWhatsAppOrderMessage(
  cart: CartItem[],
  customerInfo: CustomerOrderInfo
): string {
  const subtotal = cart.reduce((sum, item) => sum + item.item.price * item.quantity, 0);
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const now = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const lines: string[] = [];
  lines.push('🛒 *NEW ORDER REQUEST - CHRONOS*');
  lines.push(`📅 *Date:* ${now}`);
  lines.push('--------------------------------');
  lines.push('👤 *CUSTOMER DETAILS:*');
  lines.push(`• *Name:* ${customerInfo.customerName || 'Guest'}`);
  if (customerInfo.phone) {
    lines.push(`• *Contact Phone:* ${customerInfo.phone}`);
  }
  if (customerInfo.address) {
    lines.push(`• *Shipping Address:* ${customerInfo.address}`);
  }
  if (customerInfo.notes) {
    lines.push(`• *Notes:* ${customerInfo.notes}`);
  }

  lines.push('');
  lines.push(`📦 *ITEMS ORDERED (${totalItemsCount}):*`);
  cart.forEach((cartItem, index) => {
    const itemTotal = (cartItem.item.price * cartItem.quantity).toFixed(2);
    lines.push(
      `${index + 1}. *${cartItem.item.name}*`
    );
    lines.push(
      `    Qty: ${cartItem.quantity} × $${cartItem.item.price.toFixed(2)} = *$${itemTotal}*`
    );
  });

  lines.push('--------------------------------');
  lines.push(`💰 *TOTAL AMOUNT:* *$${subtotal.toFixed(2)}*`);
  lines.push('🚚 *Shipping:* Free Priority Delivery');
  lines.push('--------------------------------');
  lines.push('Please confirm order availability and payment details. Thank you! 🙏');

  return lines.join('\n');
}

/**
 * Build wa.me or WhatsApp API link
 */
export function buildWhatsAppUrl(
  cart: CartItem[],
  customerInfo: CustomerOrderInfo
): string {
  const message = generateWhatsAppOrderMessage(cart, customerInfo);
  const encodedText = encodeURIComponent(message);
  const cleanPhone = sanitizeWhatsAppPhone(customerInfo.sellerWhatsApp);

  if (cleanPhone) {
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
  }
  // If no specific destination phone is configured, opens WhatsApp recipient picker
  return `https://api.whatsapp.com/send?text=${encodedText}`;
}
