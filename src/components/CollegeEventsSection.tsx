import { FormEvent, useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import {
  BadgeCheck,
  Calendar,
  CheckCircle2,
  MapPin,
  Phone,
  PlusCircle,
  QrCode,
  Ticket,
  Trash2,
  X,
} from 'lucide-react';
import {
  BRAND_ASSETS,
  CollegeEvent,
  EVENT_CATEGORIES,
  EventCategory,
  EventPassPaymentMethod,
  EventStudentPass,
  STUDY_YEARS,
  StudentRegistration,
  VEMU_COLLEGE_EVENTS,
  VEMU_DEPARTMENTS,
  buildEventPassSmsMessage,
  validateAndIssueEventPass,
} from '../video/timeline';
import { AddEventPanel } from './AddEventPanel';
import { PaymentQrCode } from './PaymentQrCode';
import { SmsAlertAction } from './SmsAlertAction';

const EVENT_PASSES_STORAGE_KEY = 'campusmart_vemu_event_passes_v1';
const CUSTOM_EVENTS_STORAGE_KEY = 'campusmart_vemu_custom_events_v1';

interface CollegeEventsSectionProps {
  studentProfile: StudentRegistration | null;
}

function EventGateQr({ payload, passId }: { payload: string; passId: string }) {
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(payload, {
      width: 220,
      margin: 2,
      color: {
        dark: '#064E3B',
        light: '#FFFFFF',
      },
    })
      .then((url) => {
        if (!cancelled) setQrUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrUrl('');
      });
    return () => {
      cancelled = true;
    };
  }, [payload]);

  return (
    <div className="w-24 h-24 rounded-xl bg-white p-1.5 flex items-center justify-center shrink-0 shadow-sm">
      {qrUrl ? (
        <img
          src={qrUrl}
          alt={`Gate Entry QR Code for ${passId}`}
          width={84}
          height={84}
          className="w-full h-full object-contain"
        />
      ) : (
        <span className="text-[10px] text-slate-500">QR...</span>
      )}
    </div>
  );
}

export function CollegeEventsSection({ studentProfile }: CollegeEventsSectionProps) {
  const [category, setCategory] = useState<EventCategory>('All');
  const [passes, setPasses] = useState<EventStudentPass[]>(() => {
    try {
      const raw = localStorage.getItem(EVENT_PASSES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return [];
  });

  const [customEvents, setCustomEvents] = useState<CollegeEvent[]>(() => {
    try {
      const raw = localStorage.getItem(CUSTOM_EVENTS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return [];
  });

  const [selectedEvent, setSelectedEvent] = useState<CollegeEvent | null>(null);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [eventBanner, setEventBanner] = useState<string | null>(null);
  const [showPasses, setShowPasses] = useState(false);

  const [studentName, setStudentName] = useState(studentProfile?.fullName ?? '');
  const [rollNumber, setRollNumber] = useState(studentProfile?.rollNumber ?? '');
  const [department, setDepartment] = useState(studentProfile?.department ?? VEMU_DEPARTMENTS[0]);
  const [yearOfStudy, setYearOfStudy] = useState(studentProfile?.yearOfStudy ?? STUDY_YEARS[2]);
  const [phoneNumber, setPhoneNumber] = useState(studentProfile?.phoneNumber ?? '');
  const [upiNumber, setUpiNumber] = useState(studentProfile?.upiNumber ?? '');
  const [paymentMethod, setPaymentMethod] = useState<EventPassPaymentMethod>('UPI QR Code');
  const [error, setError] = useState<string | null>(null);
  const [latestPassId, setLatestPassId] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(CUSTOM_EVENTS_STORAGE_KEY, JSON.stringify(customEvents));
    } catch {
      // ignore storage errors
    }
  }, [customEvents]);

  useEffect(() => {
    try {
      localStorage.setItem(EVENT_PASSES_STORAGE_KEY, JSON.stringify(passes));
    } catch {
      // ignore storage errors
    }
  }, [passes]);

  useEffect(() => {
    if (studentProfile) {
      setStudentName((prev) => prev || studentProfile.fullName);
      setRollNumber((prev) => prev || studentProfile.rollNumber);
      setDepartment(studentProfile.department);
      setYearOfStudy(studentProfile.yearOfStudy);
      setPhoneNumber((prev) => prev || studentProfile.phoneNumber);
      setUpiNumber((prev) => prev || studentProfile.upiNumber);
    }
  }, [studentProfile]);

  const allEvents = useMemo(
    () => [...customEvents, ...VEMU_COLLEGE_EVENTS],
    [customEvents],
  );

  const filteredEvents = useMemo(
    () =>
      category === 'All'
        ? allEvents
        : allEvents.filter((evt) => evt.category === category),
    [allEvents, category],
  );

  const handleOpenPassForm = (evt: CollegeEvent) => {
    setSelectedEvent(evt);
    setShowAddEvent(false);
    setError(null);
  };

  const handlePublishEvent = (newEvent: CollegeEvent) => {
    setCustomEvents((prev) => [newEvent, ...prev]);
    setCategory('All');
    setShowAddEvent(false);
    setEventBanner(
      `Published "${newEvent.title}" (₹${newEvent.passPriceInr} · ${newEvent.venue}) — students can now get passes below.`,
    );
  };

  const handleRemoveCustomEvent = (eventId: string) => {
    setCustomEvents((prev) => prev.filter((evt) => evt.id !== eventId));
    if (selectedEvent?.id === eventId) {
      setSelectedEvent(null);
    }
  };

  const handleIssuePass = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    const result = validateAndIssueEventPass({
      event: selectedEvent,
      studentName,
      rollNumber,
      department,
      yearOfStudy,
      phoneNumber,
      upiNumber,
      paymentMethod,
      existingPasses: passes,
      baseUrl: typeof window !== 'undefined' ? window.location.origin : undefined,
    });

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setError(null);
    setPasses((prev) => [result.pass, ...prev]);
    setLatestPassId(result.pass.passId);
    setSelectedEvent(null);
    setShowPasses(true);
  };

  const handleCancelPass = (passId: string) => {
    setPasses((prev) => prev.filter((p) => p.passId !== passId));
  };

  return (
    <section id="college-events" className="py-14 border-t border-slate-200">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        <div>
          <p className="text-xs font-semibold tracking-wide text-emerald-700">
            02. VEMU College Events &amp; Student Pass
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
            Digital Student Pass for Campus Events
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setShowAddEvent((prev) => !prev);
              setSelectedEvent(null);
            }}
            aria-expanded={showAddEvent}
            data-testid="add-event-toggle-btn"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              showAddEvent
                ? 'bg-emerald-950 text-white border-emerald-950'
                : 'bg-white text-emerald-800 border-emerald-300 hover:border-emerald-600'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Event</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPasses((prev) => !prev)}
            aria-expanded={showPasses}
            data-testid="toggle-event-passes-btn"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-semibold transition-colors cursor-pointer tabular-nums whitespace-nowrap ${
              showPasses
                ? 'bg-emerald-950 text-white border-emerald-950'
                : 'bg-white text-slate-800 border-slate-300 hover:border-emerald-600'
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>My Event Passes ({passes.length})</span>
          </button>
        </div>
      </div>

      {eventBanner && (
        <div
          data-testid="event-published-banner"
          className="mb-6 flex items-center justify-between gap-4 rounded-xl bg-emerald-50 border border-emerald-300 px-4 py-3 text-xs font-medium text-emerald-900"
        >
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            {eventBanner}
          </span>
          <button
            type="button"
            onClick={() => setEventBanner(null)}
            aria-label="Dismiss event confirmation"
            className="p-1 rounded-md text-emerald-700 hover:bg-emerald-100 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {showAddEvent && (
        <AddEventPanel
          profile={studentProfile}
          onPublish={handlePublishEvent}
          onClose={() => setShowAddEvent(false)}
        />
      )}

      {/* Category Filter */}
      <div
        className="flex flex-wrap items-center gap-1.5 mb-6"
        role="group"
        aria-label="Filter college events by category"
      >
        {EVENT_CATEGORIES.map((cat) => (
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

      {/* Issue Event Pass Form */}
      {selectedEvent && (
        <div
          data-testid="event-pass-form"
          className="mb-8 bg-white border border-emerald-300 rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h3 className="font-display font-bold text-lg text-slate-900">
                Issue VEMU Event Student Pass · {selectedEvent.title}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                {selectedEvent.schedule} · {selectedEvent.venue} · Entry Pass ₹
                {selectedEvent.passPriceInr}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedEvent(null)}
              aria-label="Close event pass form"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6">
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <p className="text-xs font-semibold text-emerald-700">{selectedEvent.category}</p>
                <p className="font-display font-bold text-base text-slate-900">
                  {selectedEvent.title}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                    {selectedEvent.schedule}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    {selectedEvent.venue}
                  </span>
                </div>
              </div>

              {paymentMethod === 'UPI QR Code' && (
                <PaymentQrCode
                  amountInr={selectedEvent.passPriceInr}
                  orderNote={`Event Pass: ${selectedEvent.title}`}
                  upiId={selectedEvent.organizerUpiNumber}
                  size={132}
                />
              )}
            </div>

            <form noValidate onSubmit={handleIssuePass} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="event-student-name"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Student Name
                  </label>
                  <input
                    id="event-student-name"
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Lokesh Babu"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label
                    htmlFor="event-roll-number"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    VEMU Roll Number
                  </label>
                  <input
                    id="event-roll-number"
                    type="text"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="e.g. 234M1A0542"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm font-mono uppercase text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="event-department"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Department
                  </label>
                  <select
                    id="event-department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    {VEMU_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="event-year"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Year of Study
                  </label>
                  <select
                    id="event-year"
                    value={yearOfStudy}
                    onChange={(e) => setYearOfStudy(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    {STUDY_YEARS.map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="event-phone-number"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="event-phone-number"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="event-upi-number"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Payment UPI Number / UPI ID
                  </label>
                  <div className="relative">
                    <QrCode className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="event-upi-number"
                      type="text"
                      value={upiNumber}
                      onChange={(e) => setUpiNumber(e.target.value)}
                      placeholder="9876543210 or name@ybl"
                      className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>
              </div>

              <div>
                <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Pass Payment Method
                </span>
                <div
                  className="grid grid-cols-2 gap-2"
                  role="group"
                  aria-label="Select event pass payment method"
                >
                  {(['UPI QR Code', 'Pay at Event Desk'] as const).map((method) => (
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

              {error && (
                <p
                  role="alert"
                  className="text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-display font-semibold text-sm transition-colors cursor-pointer"
              >
                Issue Student Event Pass (₹{selectedEvent.passPriceInr})
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Issued Digital Student Event Passes */}
      {showPasses && (
        <div
          data-testid="issued-passes-list"
          className="mb-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h3 className="font-display font-bold text-lg text-slate-900">
                Your VEMU Digital Event Passes ({passes.length})
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Present the QR gate pass below at the event block entrance for instant VEMU
                verification.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowPasses(false)}
              aria-label="Close event passes panel"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {passes.length === 0 ? (
            <div className="py-8 text-center">
              <p className="font-display font-semibold text-slate-900">No event passes issued yet</p>
              <p className="text-sm text-slate-600 mt-1">
                Select Get Student Pass on any VEMU college event below to generate your digital QR
                gate pass.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-5">
              {passes.map((pass) => (
                <div
                  key={pass.passId}
                  data-testid="issued-event-pass"
                  className={`rounded-2xl p-5 bg-emerald-950 text-white flex flex-col justify-between gap-4 border ${
                    pass.passId === latestPassId ? 'border-emerald-400' : 'border-emerald-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-lg bg-white p-1 shrink-0 flex items-center justify-center">
                        <img
                          src={BRAND_ASSETS.officialEmblem}
                          alt="Official VEMU Institute of Technology emblem"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold tracking-wide text-emerald-300 truncate">
                          VEMU INSTITUTE OF TECHNOLOGY · EVENT PASS
                        </p>
                        <p className="font-mono font-bold text-sm text-white mt-0.5">
                          {pass.passId}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCancelPass(pass.passId)}
                      aria-label={`Cancel pass for ${pass.eventTitle}`}
                      className="p-1.5 rounded-lg text-emerald-200 hover:text-rose-300 hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-2 border-t border-white/15">
                    <div className="min-w-0 space-y-1.5">
                      <h4 className="font-display font-bold text-base text-white leading-snug">
                        {pass.eventTitle}
                      </h4>
                      <p className="text-xs text-emerald-200">
                        {pass.schedule} · {pass.venue}
                      </p>
                      <div className="pt-2 space-y-1 text-xs">
                        <p className="font-semibold text-white">
                          {pass.studentName} ·{' '}
                          <span className="font-mono text-emerald-300">{pass.rollNumber}</span>
                        </p>
                        <p className="text-emerald-200/90">
                          {pass.department} · {pass.yearOfStudy} · +91 {pass.phoneNumber}
                        </p>
                        <p className="font-mono text-emerald-300">
                          UPI: {pass.upiNumber} · ₹{pass.passPriceInr} ({pass.paymentMethod})
                        </p>
                      </div>
                    </div>

                    <EventGateQr payload={pass.qrPayload} passId={pass.passId} />
                  </div>

                  <div className="pt-2 border-t border-white/15 flex items-center justify-between text-xs text-emerald-300">
                    <span className="inline-flex items-center gap-1.5">
                      <BadgeCheck className="w-4 h-4 text-emerald-400" />
                      Verified Student Entry Pass
                    </span>
                    <span className="font-mono">Gate Check Ready</span>
                  </div>

                  {pass.phoneNumber && (
                    <div className="pt-2 border-t border-white/15">
                      <SmsAlertAction
                        phoneNumber={pass.phoneNumber}
                        message={buildEventPassSmsMessage(pass)}
                        buttonLabel="Get Pass SMS"
                        theme="dark"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* College Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEvents.map((evt) => {
          const existingPass = passes.find((p) => p.eventId === evt.id);
          return (
            <article
              key={evt.id}
              data-testid="college-event-card"
              className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between hover:border-emerald-400 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                  <span className="font-medium text-emerald-700">
                    {evt.isCustomEvent ? `${evt.category} · Campus Event` : evt.category}
                  </span>
                  <span>{evt.schedule}</span>
                </div>

                <h3 className="font-display font-bold text-base text-slate-900 mt-2 leading-snug">
                  {evt.title}
                </h3>

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-2">
                  <span>{evt.organizer}</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">{evt.spotsAvailable} passes</span>
                  {evt.isCustomEvent && evt.organizerPhone && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-slate-600">+91 {evt.organizerPhone}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono font-bold text-lg text-slate-900 tabular-nums">
                    ₹{evt.passPriceInr}
                  </p>
                  <p className="text-xs text-slate-500 truncate">Venue: {evt.venue}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {existingPass ? (
                    <button
                      type="button"
                      onClick={() => setShowPasses(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>View Pass</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenPassForm(evt)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>Get Student Pass</span>
                    </button>
                  )}
                  {evt.isCustomEvent && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomEvent(evt.id)}
                      aria-label={`Remove ${evt.title} event`}
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
    </section>
  );
}
