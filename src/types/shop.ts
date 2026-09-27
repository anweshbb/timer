export interface ShopItem {
  id: string;
  name: string;
  tagline: string;
  price: number;
  rating: number;
  reviewsCount: number;
  badge?: string;
  description: string;
  features: string[];
  category: string;
  iconName: 'timer' | 'hourglass' | 'stopwatch';
  colorGradient: string;
}

export interface CartItem {
  item: ShopItem;
  quantity: number;
}

export interface CustomerOrderInfo {
  customerName: string;
  phone: string;
  address: string;
  notes: string;
  sellerWhatsApp: string;
}

export const SHOP_PRODUCTS: ShopItem[] = [
  {
    id: 'prod-desk-timer',
    name: 'Chronos Rotary Desk Timer',
    tagline: 'Minimalist physical magnetic countdown dial',
    price: 29.00,
    rating: 4.9,
    reviewsCount: 142,
    badge: 'Bestseller',
    description: 'Precision machined aluminum rotary ring with high-contrast LED matrix display. Dual brightness modes, silent vibration alert or acoustic chime.',
    features: ['Precision rotary encoder', 'Magnetic desk mount', 'Silent & chime modes', '45-day battery life'],
    category: 'Hardware',
    iconName: 'timer',
    colorGradient: 'from-indigo-500/20 via-sky-500/10 to-transparent',
  },
  {
    id: 'prod-hourglass',
    name: 'Artisan Glass Hourglass (30m)',
    tagline: 'Hand-blown borosilicate with obsidian magnetic sand',
    price: 39.00,
    rating: 4.8,
    reviewsCount: 88,
    badge: 'Artisan Crafted',
    description: 'A tactile, analog reminder of flowing time. Hand-blown borosilicate glass filled with micronized black magnetic sand for meditative 30-minute focus sprints.',
    features: ['Precision 30-min flow', 'Ultra-durable borosilicate', 'Solid walnut base', 'Zero digital distraction'],
    category: 'Analog',
    iconName: 'hourglass',
    colorGradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
  },
  {
    id: 'prod-chronograph',
    name: 'Mechanical Split-Lap Stopwatch',
    tagline: 'Tactile dual-button stainless steel chronograph',
    price: 79.00,
    rating: 5.0,
    reviewsCount: 64,
    badge: 'Pro Grade',
    description: 'Heavyweight brushed 316L stainless steel casing with satisfying mechanical click switches. Measures 1/100s with dual lap memory and military paracord lanyard.',
    features: ['316L stainless steel body', 'Mechanical tactile switches', 'IP67 water resistant', 'Tactical paracord strap'],
    category: 'Pro Chrono',
    iconName: 'stopwatch',
    colorGradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
  },
];
