import { FormEvent, useEffect, useState } from 'react';
import { Calendar, Phone, QrCode, Tag, Users, X } from 'lucide-react';
import {
  CAMPUS_PICKUP_SPOTS,
  CollegeEvent,
  EVENT_CATEGORIES,
  EventCategory,
  MAX_LISTING_PRICE_INR,
  MIN_LISTING_PRICE_INR,
  StudentRegistration,
  validateAndCreateCollegeEvent,
} from '../video/timeline';

interface AddEventPanelProps {
  profile: StudentRegistration | null;
  onPublish: (event: CollegeEvent) => void;
  onClose: () => void;
}

const CREATABLE_EVENT_CATEGORIES = EVENT_CATEGORIES.filter(
  (cat): cat is Exclude<EventCategory, 'All'> => cat !== 'All',
);

export function AddEventPanel({ profile, onPublish, onClose }: AddEventPanelProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Exclude<EventCategory, 'All'>>(
    CREATABLE_EVENT_CATEGORIES[0],
  );
  const [venue, setVenue] = useState<string>(CAMPUS_PICKUP_SPOTS[2]);
  const [schedule, setSchedule] = useState('');
  const [organizer, setOrganizer] = useState(
    profile ? `${profile.department} Student Club` : '',
  );
  const [passPriceInput, setPassPriceInput] = useState('50');
  const [spotsInput, setSpotsInput] = useState('100');
  const [organizerPhone, setOrganizerPhone] = useState(profile?.phoneNumber ?? '');
  const [organizerUpiNumber, setOrganizerUpiNumber] = useState(profile?.upiNumber ?? '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setOrganizer((prev) => prev || `${profile.department} Student Club`);
      setOrganizerPhone((prev) => prev || profile.phoneNumber);
      setOrganizerUpiNumber((prev) => prev || profile.upiNumber);
    }
  }, [profile]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const res = validateAndCreateCollegeEvent({
      title,
      category,
      venue,
      schedule,
      organizer,
      passPriceInr: Number(passPriceInput),
      spotsAvailable: Number(spotsInput),
      organizerPhone,
      organizerUpiNumber,
    });

    if (!res.ok) {
      setError(res.error);
      return;
    }

    setError(null);
    onPublish(res.event);
    setTitle('');
    setSchedule('');
    setPassPriceInput('50');
    setSpotsInput('100');
  };

  return (
    <div
      data-testid="add-event-panel"
      className="mb-8 bg-white border border-emerald-300 rounded-2xl p-6 shadow-sm"
    >
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h3 className="font-display font-bold text-lg text-slate-900">
            Add VEMU College Event &amp; Pass Tier
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Create a campus workshop, tech fest, cultural night, or club meetup so students can
            issue digital QR entry passes (₹{MIN_LISTING_PRICE_INR}–₹{MAX_LISTING_PRICE_INR}).
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close add event panel"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form noValidate onSubmit={handleSubmit} className="pt-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <label
              htmlFor="add-event-title"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Event Title
            </label>
            <input
              id="add-event-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. AI & Cloud Engineering Bootcamp"
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label
              htmlFor="add-event-category"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Event Category
            </label>
            <select
              id="add-event-category"
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as Exclude<EventCategory, 'All'>)
              }
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              {CREATABLE_EVENT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label
              htmlFor="add-event-venue"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              VEMU Campus Venue
            </label>
            <select
              id="add-event-venue"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
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
              htmlFor="add-event-schedule"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Date &amp; Time
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="add-event-schedule"
                type="text"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                placeholder="e.g. Mon · 2:00 PM – 5:00 PM"
                className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="add-event-price"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Pass Fee (₹{MIN_LISTING_PRICE_INR} – ₹{MAX_LISTING_PRICE_INR})
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="add-event-price"
                type="number"
                min={MIN_LISTING_PRICE_INR}
                max={MAX_LISTING_PRICE_INR}
                step={5}
                value={passPriceInput}
                onChange={(e) => setPassPriceInput(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="add-event-seats"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Available Passes
            </label>
            <div className="relative">
              <Users className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="add-event-seats"
                type="number"
                min={10}
                max={1000}
                value={spotsInput}
                onChange={(e) => setSpotsInput(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
          <div>
            <label
              htmlFor="add-event-organizer"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Organizer / Department Club
            </label>
            <input
              id="add-event-organizer"
              type="text"
              value={organizer}
              onChange={(e) => setOrganizer(e.target.value)}
              placeholder="e.g. Dept. of CSE Coding Club"
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label
              htmlFor="add-event-phone"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Organizer Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="add-event-phone"
                type="tel"
                value={organizerPhone}
                onChange={(e) => setOrganizerPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="add-event-upi"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Organizer Payment UPI Number
            </label>
            <div className="relative">
              <QrCode className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="add-event-upi"
                type="text"
                value={organizerUpiNumber}
                onChange={(e) => setOrganizerUpiNumber(e.target.value)}
                placeholder="9876543210 or club@ybl"
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
            Published events appear immediately in the VEMU College Events list for digital pass
            bookings.
          </p>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-display font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
          >
            Publish College Event
          </button>
        </div>
      </form>
    </div>
  );
}
