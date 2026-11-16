import { FormEvent, useEffect, useState } from 'react';
import { Phone, QrCode, Tag, X } from 'lucide-react';
import {
  CAMPUS_PICKUP_SPOTS,
  ITEM_CONDITIONS,
  ListingMode,
  MARKETPLACE_CATEGORIES,
  MarketplaceCategory,
  MarketplaceItem,
  StudentRegistration,
  validateAndCreateListing,
} from '../video/timeline';

interface SellItemPanelProps {
  profile: StudentRegistration | null;
  onPublish: (item: MarketplaceItem) => void;
  onClose: () => void;
}

const SELL_CATEGORIES = MARKETPLACE_CATEGORIES.filter(
  (c): c is Exclude<MarketplaceCategory, 'All'> => c !== 'All',
);

export function SellItemPanel({ profile, onPublish, onClose }: SellItemPanelProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Exclude<MarketplaceCategory, 'All'>>(SELL_CATEGORIES[0]);
  const [mode, setMode] = useState<ListingMode>('Buy');
  const [priceInput, setPriceInput] = useState('75');
  const [condition, setCondition] = useState<string>(ITEM_CONDITIONS[1]);
  const [pickupSpot, setPickupSpot] = useState<string>(CAMPUS_PICKUP_SPOTS[0]);
  const [seller, setSeller] = useState(profile?.fullName ?? '');
  const [department, setDepartment] = useState(
    profile ? `${profile.department} · ${profile.yearOfStudy}` : 'CSE · 3rd Year',
  );
  const [sellerPhone, setSellerPhone] = useState(profile?.phoneNumber ?? '');
  const [sellerUpiNumber, setSellerUpiNumber] = useState(profile?.upiNumber ?? '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setSeller((prev) => prev || profile.fullName);
      setDepartment(`${profile.department} · ${profile.yearOfStudy}`);
      setSellerPhone((prev) => prev || profile.phoneNumber);
      setSellerUpiNumber((prev) => prev || profile.upiNumber);
    }
  }, [profile]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const res = validateAndCreateListing({
      title,
      category,
      mode,
      priceInr: Number(priceInput),
      department,
      condition,
      seller,
      pickupSpot,
      sellerPhone,
      sellerUpiNumber,
    });

    if (!res.ok) {
      setError(res.error);
      return;
    }

    setError(null);
    onPublish(res.item);
    setTitle('');
    setPriceInput('75');
  };

  return (
    <div
      data-testid="sell-panel"
      className="mb-8 bg-white border border-emerald-300 rounded-2xl p-6 shadow-sm"
    >
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h3 className="font-display font-bold text-lg text-slate-900">
            Sell or Share on CampusMart VEMU
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            List textbooks, electronics, lab aprons, drafters, or stationery for fellow VEMU
            students (₹20–₹100 campus pricing).
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close sell item panel"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form noValidate onSubmit={handleSubmit} className="pt-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <label htmlFor="sell-title" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Item Title
            </label>
            <input
              id="sell-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Engineering Physics Lab Manual & Record"
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label
              htmlFor="sell-category"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Category
            </label>
            <select
              id="sell-category"
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as Exclude<MarketplaceCategory, 'All'>)
              }
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              {SELL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <span className="block text-xs font-semibold text-slate-700 mb-1.5">Listing Type</span>
            <div
              className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg"
              role="group"
              aria-label="Select listing type"
            >
              {(['Buy', 'Exchange', 'Donate'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`px-2 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    mode === m
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  {m === 'Buy' ? 'Sell' : m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="sell-price" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Price (₹20 – ₹100)
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="sell-price"
                type="number"
                min={20}
                max={100}
                step={5}
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="sell-condition"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Condition
            </label>
            <select
              id="sell-condition"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              {ITEM_CONDITIONS.map((cond) => (
                <option key={cond} value={cond}>
                  {cond}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="sell-pickup-spot"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Campus Pickup Point
            </label>
            <select
              id="sell-pickup-spot"
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-slate-100">
          <div>
            <label
              htmlFor="sell-seller-name"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Seller Name
            </label>
            <input
              id="sell-seller-name"
              type="text"
              value={seller}
              onChange={(e) => setSeller(e.target.value)}
              placeholder="e.g. Lokesh Babu"
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label
              htmlFor="sell-department"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Department &amp; Year
            </label>
            <input
              id="sell-department"
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. CSE · 3rd Year"
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label
              htmlFor="sell-phone-number"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Seller Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="sell-phone-number"
                type="tel"
                value={sellerPhone}
                onChange={(e) => setSellerPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="sell-upi-number"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Seller Payment UPI Number
            </label>
            <div className="relative">
              <QrCode className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="sell-upi-number"
                type="text"
                value={sellerUpiNumber}
                onChange={(e) => setSellerUpiNumber(e.target.value)}
                placeholder="9876543210 or name@ybl"
                className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2"
          >
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <p className="text-xs text-slate-500">
            Published listings appear immediately in the VEMU CampusMart catalog for student pickup.
          </p>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-display font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
          >
            Publish Item to Marketplace
          </button>
        </div>
      </form>
    </div>
  );
}
