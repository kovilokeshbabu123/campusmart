import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  Check,
  CheckCircle2,
  CreditCard,
  MapPin,
  MessageSquare,
  PackageCheck,
  Phone,
  PlusCircle,
  Search,
  ShoppingBag,
  Trash2,
  UserCheck,
  X,
} from 'lucide-react';
import {
  CAMPUS_PICKUP_SPOTS,
  CampusOrder,
  ListingMode,
  MARKETPLACE_CATEGORIES,
  MARKETPLACE_ITEMS,
  MarketplaceCategory,
  MarketplaceItem,
  PICKUP_TIME_SLOTS,
  PaymentMethod,
  StudentRegistration,
  buildOrderSmsMessage,
  buildSellerListingSmsMessage,
  buildSmsUri,
  calculateCartTotal,
  filterMarketplaceItems,
  validateAndCreateOrder,
} from '../video/timeline';
import { PaymentQrCode } from './PaymentQrCode';
import { SellItemPanel } from './SellItemPanel';
import { SmsAlertAction } from './SmsAlertAction';
import { StudentIdCardPanel } from './StudentIdCardPanel';
import { StudentRegistrationPanel } from './StudentRegistrationPanel';

const CART_STORAGE_KEY = 'campusmart_vemu_cart_v1';
const ORDERS_STORAGE_KEY = 'campusmart_vemu_orders_v1';
const STUDENT_STORAGE_KEY = 'campusmart_vemu_student_v1';
const LISTINGS_STORAGE_KEY = 'campusmart_vemu_listings_v1';

interface MarketplacePreviewProps {
  externalPanelRequest?: {
    panel: 'sell' | 'register' | 'idcard' | 'checkout' | 'orders';
    nonce: number;
  } | null;
  studentProfile?: StudentRegistration | null;
  onStudentProfileChange?: (profile: StudentRegistration | null) => void;
}

export function MarketplacePreview({
  externalPanelRequest = null,
  studentProfile: controlledProfile,
  onStudentProfileChange,
}: MarketplacePreviewProps) {
  const [category, setCategory] = useState<MarketplaceCategory>('All');
  const [mode, setMode] = useState<ListingMode | 'All'>('All');
  const [query, setQuery] = useState('');

  const [customListings, setCustomListings] = useState<MarketplaceItem[]>(() => {
    try {
      const raw = localStorage.getItem(LISTINGS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return [];
  });

  const [cartIds, setCartIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return ['item-calc-casio'];
  });

  const [orders, setOrders] = useState<CampusOrder[]>(() => {
    try {
      const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return [];
  });

  const [internalProfile, setInternalProfile] = useState<StudentRegistration | null>(() => {
    try {
      const raw = localStorage.getItem(STUDENT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.rollNumber === 'string' && typeof parsed.upiNumber === 'string') {
          return parsed as StudentRegistration;
        }
      }
    } catch {
      // ignore storage errors
    }
    return null;
  });

  const studentProfile =
    controlledProfile !== undefined ? controlledProfile : internalProfile;
  const setStudentProfile = (profile: StudentRegistration | null) => {
    if (onStudentProfileChange) {
      onStudentProfileChange(profile);
    } else {
      setInternalProfile(profile);
    }
  };

  const [activePanel, setActivePanel] = useState<
    'none' | 'sell' | 'register' | 'idcard' | 'checkout' | 'orders'
  >('none');
  const [publishedBanner, setPublishedBanner] = useState<string | null>(null);
  const [studentName, setStudentName] = useState(() => studentProfile?.fullName ?? '');
  const [rollNumber, setRollNumber] = useState(() => studentProfile?.rollNumber ?? '');
  const [phoneNumber, setPhoneNumber] = useState(() => studentProfile?.phoneNumber ?? '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI QR Code');
  const [pickupSpot, setPickupSpot] = useState<string>(CAMPUS_PICKUP_SPOTS[0]);
  const [timeSlot, setTimeSlot] = useState<string>(PICKUP_TIME_SLOTS[1]);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [latestOrderId, setLatestOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (externalPanelRequest && externalPanelRequest.nonce > 0) {
      setActivePanel(externalPanelRequest.panel);
    }
  }, [externalPanelRequest]);

  useEffect(() => {
    try {
      localStorage.setItem(LISTINGS_STORAGE_KEY, JSON.stringify(customListings));
    } catch {
      // ignore storage errors
    }
  }, [customListings]);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartIds));
    } catch {
      // ignore storage errors
    }
  }, [cartIds]);

  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch {
      // ignore storage errors
    }
  }, [orders]);

  useEffect(() => {
    try {
      if (studentProfile) {
        localStorage.setItem(STUDENT_STORAGE_KEY, JSON.stringify(studentProfile));
      } else {
        localStorage.removeItem(STUDENT_STORAGE_KEY);
      }
    } catch {
      // ignore storage errors
    }
  }, [studentProfile]);

  const allItems = useMemo(
    () => [...customListings, ...MARKETPLACE_ITEMS],
    [customListings],
  );

  const filtered = useMemo(
    () => filterMarketplaceItems(allItems, category, mode, query),
    [allItems, category, mode, query],
  );

  const cartItems = useMemo(
    () => allItems.filter((item) => cartIds.includes(item.id)),
    [allItems, cartIds],
  );

  const cartTotal = useMemo(() => calculateCartTotal(cartItems), [cartItems]);

  const checkoutUpiId = useMemo(() => {
    if (cartItems.length === 1 && cartItems[0].sellerUpiNumber) {
      return cartItems[0].sellerUpiNumber;
    }
    return undefined;
  }, [cartItems]);

  const toggleCart = (id: string) => {
    setCartIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handlePublishListing = (item: MarketplaceItem) => {
    setCustomListings((prev) => [item, ...prev]);
    setCategory('All');
    setMode('All');
    setQuery('');
    setActivePanel('none');
    setPublishedBanner(
      `Listed "${item.title}" for ₹${item.priceInr} (${item.pickupSpot}) in the VEMU marketplace.`,
    );
  };

  const handleRemoveListing = (id: string) => {
    setCustomListings((prev) => prev.filter((item) => item.id !== id));
    setCartIds((prev) => prev.filter((cartId) => cartId !== id));
  };

  const handleSaveProfile = (profile: StudentRegistration) => {
    setStudentProfile(profile);
    setStudentName(profile.fullName);
    setRollNumber(profile.rollNumber);
    setPhoneNumber(profile.phoneNumber);
  };

  const handleClearProfile = () => {
    setStudentProfile(null);
    setStudentName('');
    setRollNumber('');
    setPhoneNumber('');
  };

  const handlePlaceOrder = (e: FormEvent) => {
    e.preventDefault();
    const result = validateAndCreateOrder({
      studentName,
      rollNumber,
      phoneNumber,
      payerUpiNumber: studentProfile?.upiNumber,
      paymentMethod,
      pickupSpot,
      timeSlot,
      items: cartItems,
    });

    if (!result.ok) {
      setOrderError(result.error);
      return;
    }

    setOrderError(null);
    setOrders((prev) => [result.order, ...prev]);
    setCartIds([]);
    setLatestOrderId(result.order.orderId);
    setActivePanel('orders');
  };

  return (
    <section id="marketplace" className="py-14 border-t border-slate-200">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        <div>
          <p className="text-xs font-semibold tracking-wide text-emerald-700">
            01. Interactive Student Marketplace &amp; Ordering
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
            Buy, Sell &amp; Order Campus Essentials
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <label htmlFor="marketplace-search" className="sr-only">
              Search student marketplace items
            </label>
            <input
              id="marketplace-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search books, drafters, calculators..."
              className="pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 w-60"
            />
          </div>

          <div
            className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg"
            role="group"
            aria-label="Filter by listing type"
          >
            {(['All', 'Buy', 'Exchange', 'Donate'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  mode === m
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setActivePanel(activePanel === 'sell' ? 'none' : 'sell')}
            aria-expanded={activePanel === 'sell'}
            data-testid="sell-toggle-btn"
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activePanel === 'sell'
                ? 'bg-emerald-950 text-white border-emerald-950'
                : 'bg-white text-emerald-800 border-emerald-300 hover:border-emerald-600'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Sell Item</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePanel(activePanel === 'register' ? 'none' : 'register')}
            aria-expanded={activePanel === 'register'}
            data-testid="register-toggle-btn"
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activePanel === 'register'
                ? 'bg-emerald-950 text-white border-emerald-950'
                : studentProfile
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:border-emerald-500'
                  : 'bg-white text-slate-800 border-slate-300 hover:border-emerald-600'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>{studentProfile ? `Student: ${studentProfile.rollNumber}` : 'Register'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePanel(activePanel === 'idcard' ? 'none' : 'idcard')}
            aria-expanded={activePanel === 'idcard'}
            data-testid="idcard-toggle-btn"
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activePanel === 'idcard'
                ? 'bg-emerald-950 text-white border-emerald-950'
                : 'bg-white text-slate-800 border-slate-300 hover:border-emerald-600'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>ID Card</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePanel(activePanel === 'checkout' ? 'none' : 'checkout')}
            aria-expanded={activePanel === 'checkout'}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer tabular-nums whitespace-nowrap ${
              activePanel === 'checkout'
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>
              {cartIds.length > 0 ? `Order Now (${cartIds.length} · ₹${cartTotal})` : 'Campus Cart (0)'}
            </span>
          </button>

          {orders.length > 0 && (
            <button
              type="button"
              onClick={() => setActivePanel(activePanel === 'orders' ? 'none' : 'orders')}
              aria-expanded={activePanel === 'orders'}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border text-xs font-semibold transition-colors cursor-pointer tabular-nums whitespace-nowrap ${
                activePanel === 'orders'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-800 border-slate-300 hover:border-emerald-600'
              }`}
            >
              <PackageCheck className="w-4 h-4" />
              <span>My Orders ({orders.length})</span>
            </button>
          )}
        </div>
      </div>

      {publishedBanner && (
        <div
          data-testid="listing-published-banner"
          className="mb-6 flex items-center justify-between gap-4 rounded-xl bg-emerald-50 border border-emerald-300 px-4 py-3 text-xs font-medium text-emerald-900"
        >
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            {publishedBanner}
          </span>
          <button
            type="button"
            onClick={() => setPublishedBanner(null)}
            aria-label="Dismiss listing confirmation"
            className="p-1 rounded-md text-emerald-700 hover:bg-emerald-100 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Sell Item Panel */}
      {activePanel === 'sell' && (
        <SellItemPanel
          profile={studentProfile}
          onPublish={handlePublishListing}
          onClose={() => setActivePanel('none')}
        />
      )}

      {/* VEMU Student Registration & Payment UPI Panel */}
      {activePanel === 'register' && (
        <StudentRegistrationPanel
          profile={studentProfile}
          onSave={handleSaveProfile}
          onClear={handleClearProfile}
          onOpenIdCard={() => setActivePanel('idcard')}
          onClose={() => setActivePanel('none')}
        />
      )}

      {/* VEMU Digital Student ID Card Panel */}
      {activePanel === 'idcard' && (
        <StudentIdCardPanel
          profile={studentProfile}
          onSave={handleSaveProfile}
          onClear={handleClearProfile}
          onClose={() => setActivePanel('none')}
        />
      )}

      {/* Checkout & Order Placement Panel */}
      {activePanel === 'checkout' && (
        <div
          data-testid="checkout-panel"
          className="mb-8 bg-white border border-emerald-300 rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h3 className="font-display font-bold text-lg text-slate-900">
                CampusMart Checkout · Direct VEMU Pickup
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Pay ₹20–₹100 via UPI QR Code or cash on handover with zero delivery fees.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActivePanel('none')}
              aria-label="Close checkout panel"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {cartItems.length === 0 ? (
            <div className="py-8 text-center">
              <p className="font-display font-semibold text-slate-900">Your Campus Cart is empty</p>
              <p className="text-sm text-slate-600 mt-1">
                Select Add to Cart, Request Swap, or Claim Item on any product below to place an order.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6">
              {/* Left: Cart Items + Live UPI Payment QR */}
              <div className="space-y-4">
                <h4 className="font-display font-semibold text-sm text-slate-900">
                  Selected Items ({cartItems.length})
                </h4>
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200"
                    >
                      <div className="min-w-0">
                        <p className="font-display font-semibold text-sm text-slate-900 truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {item.mode} · Seller: {item.seller} ({item.department})
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono font-bold text-sm text-emerald-700 tabular-nums">
                          ₹{item.priceInr}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleCart(item.id)}
                          aria-label={`Remove ${item.title} from cart`}
                          className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {paymentMethod === 'UPI QR Code' && (
                  <div className="space-y-2">
                    <PaymentQrCode
                      amountInr={cartTotal}
                      orderNote={`CampusMart VEMU (${cartItems.length} item${cartItems.length > 1 ? 's' : ''})`}
                      upiId={checkoutUpiId}
                      size={132}
                    />
                    {studentProfile && (
                      <p
                        data-testid="checkout-registered-upi"
                        className="text-xs font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2"
                      >
                        Registered Payer UPI: {studentProfile.upiNumber}
                      </p>
                    )}
                  </div>
                )}

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">Campus Pickup Total</span>
                  <span className="font-mono font-bold text-xl text-slate-900 tabular-nums">
                    ₹{cartTotal}
                  </span>
                </div>
              </div>

              {/* Right: Student Order Form */}
              <form onSubmit={handlePlaceOrder} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="order-student-name"
                      className="block text-xs font-semibold text-slate-700 mb-1.5"
                    >
                      Student Name
                    </label>
                    <input
                      id="order-student-name"
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="e.g. Lokesh Babu"
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="order-roll-number"
                      className="block text-xs font-semibold text-slate-700 mb-1.5"
                    >
                      VEMU Roll Number
                    </label>
                    <input
                      id="order-roll-number"
                      type="text"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      placeholder="e.g. 234M1A0542"
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm font-mono uppercase text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="order-phone-number"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Student Phone Number (for SMS Alerts)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="order-phone-number"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Linked to +91 for instant order pickup SMS receipts.
                  </p>
                </div>

                <div>
                  <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Payment Method
                  </span>
                  <div
                    className="grid grid-cols-2 gap-2"
                    role="group"
                    aria-label="Select payment method"
                  >
                    {(['UPI QR Code', 'Cash on Pickup'] as const).map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                          paymentMethod === method
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-700 border-slate-300 hover:border-emerald-500'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="order-pickup-spot"
                      className="block text-xs font-semibold text-slate-700 mb-1.5"
                    >
                      Campus Pickup Point
                    </label>
                    <select
                      id="order-pickup-spot"
                      value={pickupSpot}
                      onChange={(e) => setPickupSpot(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    >
                      {CAMPUS_PICKUP_SPOTS.map((spot) => (
                        <option key={spot} value={spot}>
                          {spot}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="order-time-slot"
                      className="block text-xs font-semibold text-slate-700 mb-1.5"
                    >
                      Pickup Time Slot
                    </label>
                    <select
                      id="order-time-slot"
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    >
                      {PICKUP_TIME_SLOTS.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {orderError && (
                  <p
                    role="alert"
                    className="text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2"
                  >
                    {orderError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-display font-semibold text-sm transition-colors cursor-pointer"
                >
                  Confirm Campus Order (₹{cartTotal})
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Active Orders & Tracking Panel */}
      {activePanel === 'orders' && (
        <div
          data-testid="orders-panel"
          className="mb-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h3 className="font-display font-bold text-lg text-slate-900">
                Your VEMU Campus Orders ({orders.length})
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Track confirmed student pickups and scan the UPI QR code to settle payment.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActivePanel('none')}
              aria-label="Close orders panel"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4 pt-5">
            {orders.map((order) => (
              <div
                key={order.orderId}
                data-testid="placed-order-card"
                className={`p-4 rounded-xl border space-y-3 ${
                  order.orderId === latestOrderId
                    ? 'bg-emerald-50/70 border-emerald-400'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span className="font-mono font-bold text-sm text-slate-900">
                      Order #{order.orderId}
                    </span>
                    <span className="text-xs text-slate-600">
                      · {order.studentName} ({order.rollNumber})
                    </span>
                    {order.phoneNumber && (
                      <span className="text-xs font-mono text-slate-600">
                        · +91 {order.phoneNumber}
                      </span>
                    )}
                    {order.payerUpiNumber && (
                      <span className="text-xs font-mono text-emerald-700">
                        · UPI: {order.payerUpiNumber}
                      </span>
                    )}
                  </div>
                  <span className="font-mono font-bold text-sm text-emerald-700 tabular-nums">
                    ₹{order.totalInr} · {order.paymentMethod || 'UPI QR Code'} · {order.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    {order.pickupSpot}
                  </span>
                  <span>{order.timeSlot}</span>
                  <span>{order.items.map((i) => i.title).join(', ')}</span>
                </div>

                {(order.paymentMethod ?? 'UPI QR Code') === 'UPI QR Code' && (
                  <PaymentQrCode
                    amountInr={order.totalInr}
                    orderNote={`Order ${order.orderId}`}
                    size={112}
                  />
                )}

                {order.phoneNumber && (
                  <div className="pt-2 border-t border-slate-200/80">
                    <SmsAlertAction
                      phoneNumber={order.phoneNumber}
                      message={buildOrderSmsMessage(order)}
                      buttonLabel="Get Order SMS"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Filter Tabs */}
      <div
        className="flex flex-wrap items-center gap-1.5 mb-6"
        role="group"
        aria-label="Filter by item category"
      >
        {MARKETPLACE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              category === cat
                ? 'bg-emerald-600 text-white'
                : 'bg-white border border-slate-200 text-slate-700 hover:border-emerald-500'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
          <p className="font-display font-semibold text-slate-900">
            No matching campus items found
          </p>
          <p className="text-sm text-slate-600 mt-1">
            Try clearing your search query or switching to All categories.
          </p>
          <button
            type="button"
            onClick={() => {
              setCategory('All');
              setMode('All');
              setQuery('');
            }}
            className="mt-4 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => {
            const inCart = cartIds.includes(item.id);
            return (
              <article
                key={item.id}
                data-testid="marketplace-card"
                className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between hover:border-emerald-400 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                    <span className="font-medium text-emerald-700">{item.category}</span>
                    <span>
                      {item.isUserListing ? `${item.mode} · Student Listing` : item.mode}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-base text-slate-900 mt-2 leading-snug">
                    {item.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-2">
                    <span>{item.department}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.condition}</span>
                    {item.isUserListing && item.sellerPhone && (
                      <>
                        <span aria-hidden="true">·</span>
                        <a
                          href={buildSmsUri(item.sellerPhone, buildSellerListingSmsMessage(item))}
                          className="inline-flex items-center gap-1 font-mono text-emerald-700 hover:underline"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>SMS +91 {item.sellerPhone}</span>
                        </a>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono font-bold text-lg text-slate-900 tabular-nums">
                      ₹{item.priceInr.toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      Pickup: {item.pickupSpot}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleCart(item.id)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                        inCart
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                          : 'bg-emerald-600 text-white hover:bg-emerald-500'
                      }`}
                    >
                      {inCart ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          In Cart
                        </>
                      ) : item.mode === 'Exchange' ? (
                        'Request Swap'
                      ) : item.mode === 'Donate' ? (
                        'Claim Item'
                      ) : (
                        'Add to Cart'
                      )}
                    </button>
                    {inCart && (
                      <button
                        type="button"
                        onClick={() => setActivePanel('checkout')}
                        className="px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Order
                      </button>
                    )}
                    {item.isUserListing && (
                      <button
                        type="button"
                        onClick={() => handleRemoveListing(item.id)}
                        aria-label={`Remove ${item.title} listing`}
                        className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

