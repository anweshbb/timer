import React, { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShoppingBag,
  Send,
  Copy,
  Check,
  Phone,
  MapPin,
  User,
  MessageSquare,
  Sparkles,
  HelpCircle,
  Timer,
  Hourglass,
  TimerReset,
} from 'lucide-react';
import { CartItem, CustomerOrderInfo } from '../types/shop';
import { ThemeMode } from './Header';
import {
  buildWhatsAppUrl,
  generateWhatsAppOrderMessage,
} from '../utils/whatsapp';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  theme: ThemeMode;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  theme,
}) => {
  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  const [copied, setCopied] = useState<boolean>(false);
  const [orderSent, setOrderSent] = useState<boolean>(false);

  // Customer order info
  const [customerInfo, setCustomerInfo] = useState<CustomerOrderInfo>(() => {
    try {
      const saved = localStorage.getItem('chronos_customer_info');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      customerName: '',
      phone: '',
      address: '',
      notes: '',
      sellerWhatsApp: '1234567890', // Default store recipient, user can change to their own phone
    };
  });

  const [showRecipientPhoneEdit, setShowRecipientPhoneEdit] = useState<boolean>(false);

  if (!isOpen) return null;

  const isLight = theme === 'light';
  const isOled = theme === 'oled';

  const subtotal = cart.reduce((sum, i) => sum + i.item.price * i.quantity, 0);
  const totalCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const handleInfoChange = (field: keyof CustomerOrderInfo, val: string) => {
    const updated = { ...customerInfo, [field]: val };
    setCustomerInfo(updated);
    try {
      localStorage.setItem('chronos_customer_info', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const whatsappUrl = buildWhatsAppUrl(cart, customerInfo);
  const previewMessage = generateWhatsAppOrderMessage(cart, customerInfo);

  const handleCopy = () => {
    navigator.clipboard.writeText(previewMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const getItemIcon = (iconName: string) => {
    switch (iconName) {
      case 'hourglass':
        return <Hourglass className="w-5 h-5 text-amber-400" />;
      case 'stopwatch':
        return <TimerReset className="w-5 h-5 text-emerald-400" />;
      default:
        return <Timer className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div
        className={`w-full max-w-xl max-h-[92vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-all ${
          isLight
            ? 'bg-white border-slate-200 text-slate-800'
            : isOled
            ? 'bg-neutral-950 border-neutral-800 text-neutral-100'
            : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between shrink-0 ${
            isLight ? 'border-slate-200 bg-slate-50/50' : 'border-slate-800 bg-slate-950/40'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold">
                {step === 'cart' ? 'Shopping Cart' : 'Checkout & WhatsApp Order'}
              </h3>
              <p className="text-xs text-slate-400">
                {step === 'cart'
                  ? `${totalCount} item${totalCount !== 1 ? 's' : ''} in cart`
                  : 'Direct WhatsApp order dispatch'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {step === 'cart' && cart.length > 0 && (
              <button
                onClick={onClearCart}
                className="text-xs text-slate-400 hover:text-rose-400 px-2 py-1 rounded-md transition-colors"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg border transition-colors ${
                isLight
                  ? 'border-slate-200 hover:bg-slate-100 text-slate-600'
                  : 'border-slate-800 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {step === 'cart' ? (
            /* Cart Items List */
            cart.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center bg-slate-800/40 border border-slate-700/50 text-slate-400">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <h4 className="text-base font-semibold">Your cart is empty</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Add some of our tactile desk timers or precision chronographs to get started.
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                >
                  Browse Shop Items
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((cartItem) => {
                  const { item, quantity } = cartItem;
                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-xl border flex items-center gap-3 transition-colors ${
                        isLight
                          ? 'bg-slate-50/70 border-slate-200'
                          : 'bg-slate-950/50 border-slate-800/70'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-center shrink-0">
                        {getItemIcon(item.iconName)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-semibold truncate text-slate-900 dark:text-slate-100">
                          {item.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-mono font-medium text-indigo-400">
                            ${item.price.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-slate-400">each</span>
                        </div>
                      </div>

                      {/* Quantity Stepper */}
                      <div
                        className={`flex items-center gap-1.5 border rounded-lg p-0.5 ${
                          isLight
                            ? 'bg-white border-slate-200'
                            : 'bg-slate-900 border-slate-800'
                        }`}
                      >
                        <button
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 text-xs transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-mono text-xs font-semibold tabular-nums">
                          {quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 text-xs transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Item Total */}
                      <div className="text-right w-16 shrink-0">
                        <span className="font-mono text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                          ${(item.price * quantity).toFixed(2)}
                        </span>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-slate-400 hover:text-rose-400 p-1 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}

                {/* Pricing Summary */}
                <div
                  className={`p-4 rounded-xl border space-y-2 text-xs ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-700'
                      : 'bg-slate-950/40 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex justify-between">
                    <span className="text-slate-400">Items Subtotal</span>
                    <span className="font-mono font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Shipping</span>
                    <span className="text-emerald-500 font-medium">Free Express</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between text-sm font-bold">
                    <span>Estimated Total</span>
                    <span className="font-mono text-indigo-400">${subtotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )
          ) : (
            /* Checkout Step: Customer details & WhatsApp configuration */
            <div className="space-y-4">
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                  isLight
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300'
                }`}
              >
                <Send className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>
                  When you proceed, an order summary will open directly in WhatsApp ready to send to
                  the store owner!
                </span>
              </div>

              {/* Form Fields */}
              <div className="space-y-3">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-1">
                    <User className="w-3.5 h-3.5" />
                    <span>Your Full Name *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Morgan"
                    value={customerInfo.customerName}
                    onChange={(e) => handleInfoChange('customerName', e.target.value)}
                    className={`w-full px-3 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-900'
                        : 'bg-slate-950/60 border-slate-800 text-slate-100'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-1">
                      <Phone className="w-3.5 h-3.5" />
                      <span>Your Phone Number</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. +1 555 123 4567"
                      value={customerInfo.phone}
                      onChange={(e) => handleInfoChange('phone', e.target.value)}
                      className={`w-full px-3 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        isLight
                          ? 'bg-slate-50 border-slate-200 text-slate-900'
                          : 'bg-slate-950/60 border-slate-800 text-slate-100'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Shipping Address / City</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 742 Evergreen Terrace, Springfield"
                      value={customerInfo.address}
                      onChange={(e) => handleInfoChange('address', e.target.value)}
                      className={`w-full px-3 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        isLight
                          ? 'bg-slate-50 border-slate-200 text-slate-900'
                          : 'bg-slate-950/60 border-slate-800 text-slate-100'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Special Notes or Instructions</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Please include gift packaging, deliver before 5 PM"
                    value={customerInfo.notes}
                    onChange={(e) => handleInfoChange('notes', e.target.value)}
                    className={`w-full px-3 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-900'
                        : 'bg-slate-950/60 border-slate-800 text-slate-100'
                    }`}
                  />
                </div>

                {/* Recipient WhatsApp Phone setting */}
                <div
                  className={`p-3 rounded-xl border text-xs ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">
                      Destination WhatsApp Number: <strong className="text-slate-200">{customerInfo.sellerWhatsApp || 'Not set'}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowRecipientPhoneEdit(!showRecipientPhoneEdit)}
                      className="text-indigo-400 hover:text-indigo-300 font-medium ml-2"
                    >
                      {showRecipientPhoneEdit ? 'Done' : 'Change Phone'}
                    </button>
                  </div>
                  {showRecipientPhoneEdit && (
                    <div className="mt-2.5 pt-2.5 border-t border-slate-800 space-y-1">
                      <label className="block text-[11px] text-slate-400">
                        Enter seller phone number with country code (e.g. 15551234567). Put your own number to test!
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 15551234567"
                        value={customerInfo.sellerWhatsApp}
                        onChange={(e) => handleInfoChange('sellerWhatsApp', e.target.value)}
                        className={`w-full px-2.5 py-1.5 text-xs rounded-lg border font-mono ${
                          isLight
                            ? 'bg-white border-slate-200 text-slate-900'
                            : 'bg-slate-900 border-slate-700 text-slate-100'
                        }`}
                      />
                    </div>
                  )}
                </div>

                {/* Live Message Preview */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-slate-400">
                      WhatsApp Message Preview
                    </label>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                    </button>
                  </div>
                  <pre
                    className={`p-3 rounded-xl border text-[11px] font-mono whitespace-pre-wrap overflow-x-auto max-h-36 ${
                      isLight
                        ? 'bg-slate-100 border-slate-200 text-slate-800'
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    {previewMessage}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div
          className={`px-5 py-4 border-t flex items-center justify-between gap-3 shrink-0 ${
            isLight ? 'border-slate-200 bg-slate-50/50' : 'border-slate-800 bg-slate-950/40'
          }`}
        >
          {step === 'cart' ? (
            <>
              <button
                onClick={onClose}
                className={`px-4 py-2 rounded-xl border text-xs font-medium transition-colors ${
                  isLight
                    ? 'border-slate-200 text-slate-600 hover:bg-slate-100'
                    : 'border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                Continue Shopping
              </button>

              <button
                disabled={cart.length === 0}
                onClick={() => setStep('checkout')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep('cart')}
                className={`px-4 py-2 rounded-xl border text-xs font-medium transition-colors ${
                  isLight
                    ? 'border-slate-200 text-slate-600 hover:bg-slate-100'
                    : 'border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                Back to Cart
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className={`px-3 py-2 rounded-xl border text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    copied
                      ? 'border-emerald-500 text-emerald-400'
                      : isLight
                      ? 'border-slate-200 text-slate-700 hover:bg-slate-100'
                      : 'border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                {/* Direct WhatsApp Action Link */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOrderSent(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-bold text-xs transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-[#25D366]"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send to WhatsApp</span>
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
