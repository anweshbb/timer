import React, { useState } from 'react';
import {
  ShoppingBag,
  Check,
  Plus,
  Minus,
  Star,
  ShieldCheck,
  Truck,
  MessageCircle,
  Timer,
  Hourglass,
  TimerReset,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { ShopItem, SHOP_PRODUCTS } from '../types/shop';
import { ThemeMode } from './Header';

interface ShopViewProps {
  theme: ThemeMode;
  onAddToCart: (item: ShopItem, quantity: number) => void;
  onOpenCart: () => void;
  cartCount: number;
  cartTotal: number;
}

export const ShopView: React.FC<ShopViewProps> = ({
  theme,
  onAddToCart,
  onOpenCart,
  cartCount,
  cartTotal,
}) => {
  const [quantities, setQuantities] = useState<{ [id: string]: number }>({
    'prod-desk-timer': 1,
    'prod-hourglass': 1,
    'prod-chronograph': 1,
  });

  const [addedItemIds, setAddedItemIds] = useState<{ [id: string]: boolean }>({});

  const isLight = theme === 'light';
  const isOled = theme === 'oled';

  const updateQty = (id: string, delta: number) => {
    setQuantities((prev) => {
      const cur = prev[id] || 1;
      const next = Math.max(1, Math.min(20, cur + delta));
      return { ...prev, [id]: next };
    });
  };

  const handleAdd = (product: ShopItem) => {
    const qty = quantities[product.id] || 1;
    onAddToCart(product, qty);
    setAddedItemIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  const getProductIcon = (iconName: string) => {
    switch (iconName) {
      case 'hourglass':
        return <Hourglass className="w-12 h-12 text-amber-400 group-hover:scale-110 transition-transform duration-300" />;
      case 'stopwatch':
        return <TimerReset className="w-12 h-12 text-emerald-400 group-hover:scale-110 transition-transform duration-300" />;
      default:
        return <Timer className="w-12 h-12 text-indigo-400 group-hover:scale-110 transition-transform duration-300" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Shop Header Banner */}
      <section
        className={`relative overflow-hidden rounded-2xl border p-6 sm:p-8 transition-colors ${
          isLight
            ? 'bg-white border-slate-200/90 shadow-xs'
            : isOled
            ? 'bg-black border-neutral-900'
            : 'bg-slate-900/60 border-slate-800/80 backdrop-blur-xs'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                Chronos Hardware & Desk Tools
              </span>
              <span className="text-xs text-slate-400">· 3 Handcrafted Editions</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Tactile Timepieces & Focus Tools
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Elevate your workspace with physical precision timers. Select items below and checkout
              directly to WhatsApp with zero friction.
            </p>
          </div>

          {cartCount > 0 && (
            <button
              onClick={onOpenCart}
              className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-md shrink-0"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>View Cart ({cartCount})</span>
              <span className="font-mono text-indigo-200">· ${cartTotal.toFixed(2)}</span>
            </button>
          )}
        </div>
      </section>

      {/* 3 Featured Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SHOP_PRODUCTS.map((product) => {
          const qty = quantities[product.id] || 1;
          const isJustAdded = addedItemIds[product.id];

          return (
            <div
              key={product.id}
              className={`group rounded-2xl border flex flex-col justify-between overflow-hidden transition-all duration-200 hover:shadow-lg ${
                isLight
                  ? 'bg-white border-slate-200/90 hover:border-slate-300'
                  : isOled
                  ? 'bg-neutral-950 border-neutral-900 hover:border-neutral-800'
                  : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 backdrop-blur-xs'
              }`}
            >
              <div>
                {/* Visual Card Artwork */}
                <div
                  className={`h-48 relative flex items-center justify-center bg-gradient-to-b ${product.colorGradient} border-b ${
                    isLight ? 'border-slate-100' : 'border-slate-800/60'
                  }`}
                >
                  {/* Badge */}
                  {product.badge && (
                    <span className="absolute top-3.5 left-3.5 text-[11px] font-semibold tracking-wider px-2.5 py-0.5 rounded-md uppercase bg-slate-900/80 text-white border border-slate-700/60 shadow-xs">
                      {product.badge}
                    </span>
                  )}

                  <span className="absolute top-3.5 right-3.5 text-xs font-mono font-medium text-slate-400">
                    {product.category}
                  </span>

                  {/* Artwork Center */}
                  <div className="w-24 h-24 rounded-2xl bg-slate-950/40 border border-slate-800 flex items-center justify-center shadow-inner">
                    {getProductIcon(product.iconName)}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  {/* Rating & Review */}
                  <div className="flex items-center gap-1.5 text-xs text-amber-400">
                    <div className="flex items-center">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {product.rating}
                    </span>
                    <span className="text-slate-400">({product.reviewsCount})</span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-400 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{product.tagline}</p>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">{product.description}</p>

                  {/* Feature Bullets */}
                  <ul className="space-y-1 pt-1">
                    {product.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-slate-400">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bottom Actions */}
              <div
                className={`p-5 pt-3 border-t space-y-3 ${
                  isLight ? 'border-slate-100 bg-slate-50/40' : 'border-slate-800/60 bg-slate-950/30'
                }`}
              >
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Price</span>
                    <span className="font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>

                  {/* Quantity Stepper */}
                  <div
                    className={`flex items-center gap-1 border rounded-lg p-0.5 ${
                      isLight
                        ? 'bg-white border-slate-200'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <button
                      onClick={() => updateQty(product.id, -1)}
                      className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:text-slate-200 text-xs transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-mono text-xs font-semibold tabular-nums">
                      {qty}
                    </span>
                    <button
                      onClick={() => updateQty(product.id, 1)}
                      className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:text-slate-200 text-xs transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => handleAdd(product)}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-xs ${
                    isJustAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  {isJustAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Cart · ${(product.price * qty).toFixed(2)}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* WhatsApp Checkout How It Works Info */}
      <section
        className={`p-6 rounded-2xl border transition-colors ${
          isLight
            ? 'bg-white border-slate-200/90 shadow-xs'
            : isOled
            ? 'bg-black border-neutral-900'
            : 'bg-slate-900/60 border-slate-800/80 backdrop-blur-xs'
        }`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 flex items-center justify-center text-[#25D366] shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Instant WhatsApp Checkout & Confirmation
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                No credit card forms required. When you click checkout, your order list and details are
                formatted automatically into a WhatsApp chat with the seller for immediate confirmation.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Truck className="w-4 h-4 text-sky-400" />
              <span>Worldwide Shipping</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Direct Guarantee</span>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Bottom Cart Bar (if user has items) */}
      {cartCount > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-lg animate-bounce-in">
          <div
            className={`p-3.5 sm:p-4 rounded-2xl border shadow-2xl flex items-center justify-between gap-3 ${
              isLight
                ? 'bg-white/95 border-slate-300 text-slate-900 shadow-slate-300/60 backdrop-blur-md'
                : 'bg-slate-900/95 border-slate-700 text-white shadow-black/80 backdrop-blur-md'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs font-mono shadow-sm">
                {cartCount}
              </div>
              <div>
                <span className="text-xs font-semibold block">Your Cart</span>
                <span className="font-mono text-sm font-bold text-indigo-400">
                  ${cartTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={onOpenCart}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md"
            >
              <span>View Cart & Checkout</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
