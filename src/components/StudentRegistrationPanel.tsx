import { FormEvent, useState } from 'react';
import { BadgeCheck, Phone, QrCode, UserCheck, X } from 'lucide-react';
import {
  STUDY_YEARS,
  StudentRegistration,
  VEMU_DEPARTMENTS,
  validateAndRegisterStudent,
} from '../video/timeline';

interface StudentRegistrationPanelProps {
  profile: StudentRegistration | null;
  onSave: (profile: StudentRegistration) => void;
  onClear: () => void;
  onOpenIdCard?: () => void;
  onClose: () => void;
}

export function StudentRegistrationPanel({
  profile,
  onSave,
  onClear,
  onOpenIdCard,
  onClose,
}: StudentRegistrationPanelProps) {
  const [fullName, setFullName] = useState(profile?.fullName ?? '');
  const [rollNumber, setRollNumber] = useState(profile?.rollNumber ?? '');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phoneNumber ?? '');
  const [department, setDepartment] = useState(profile?.department ?? VEMU_DEPARTMENTS[0]);
  const [yearOfStudy, setYearOfStudy] = useState(profile?.yearOfStudy ?? STUDY_YEARS[2]);
  const [upiNumber, setUpiNumber] = useState(profile?.upiNumber ?? '');
  const [smsAlertsEnabled, setSmsAlertsEnabled] = useState(profile?.smsAlertsEnabled ?? true);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const res = validateAndRegisterStudent({
      fullName,
      rollNumber,
      phoneNumber,
      department,
      yearOfStudy,
      upiNumber,
      smsAlertsEnabled,
    });
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setError(null);
    onSave(res.profile);
  };

  return (
    <div
      data-testid="registration-panel"
      className="mb-8 bg-white border border-emerald-300 rounded-2xl p-6 shadow-sm"
    >
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h3 className="font-display font-bold text-lg text-slate-900">
            VEMU Student Registration &amp; Payment UPI
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Register once with your VEMU Roll Number, phone number, and Payment UPI number for faster
            buying, selling, and campus swaps.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close registration panel"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 pt-6">
        <form noValidate onSubmit={handleSubmit} className="lg:col-span-3 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="reg-full-name"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Full Name
              </label>
              <input
                id="reg-full-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Lokesh Babu"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label
                htmlFor="reg-roll-number"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                VEMU Roll Number
              </label>
              <input
                id="reg-roll-number"
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
                htmlFor="reg-department"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Department
              </label>
              <select
                id="reg-department"
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
                htmlFor="reg-year"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Year of Study
              </label>
              <select
                id="reg-year"
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
                htmlFor="reg-phone-number"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="reg-phone-number"
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
                htmlFor="reg-upi-number"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Payment UPI Number / UPI ID
              </label>
              <div className="relative">
                <QrCode className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="reg-upi-number"
                  type="text"
                  value={upiNumber}
                  onChange={(e) => setUpiNumber(e.target.value)}
                  placeholder="9876543210 or name@ybl"
                  className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>
          </div>

          <label
            htmlFor="reg-sms-alerts"
            className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-700 cursor-pointer"
          >
            <input
              id="reg-sms-alerts"
              type="checkbox"
              checked={smsAlertsEnabled}
              onChange={(e) => setSmsAlertsEnabled(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600"
            />
            <span>
              Link my <strong className="font-semibold text-slate-900">+91 mobile number</strong> to
              receive CampusMart SMS alerts for order pickups, seller inquiries, and event passes.
            </span>
          </label>

          {error && (
            <p
              role="alert"
              className="text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2"
            >
              {error}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-display font-semibold text-sm transition-colors cursor-pointer"
            >
              {profile ? 'Update VEMU Registration' : 'Complete VEMU Registration'}
            </button>
            {profile && (
              <button
                type="button"
                onClick={onClear}
                className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
              >
                Remove Profile
              </button>
            )}
          </div>
        </form>

        {/* Right: Student Campus Pass & Payment UPI Summary */}
        <div className="lg:col-span-2 rounded-xl bg-emerald-950 text-white p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 text-xs text-emerald-300 font-semibold">
              <span className="inline-flex items-center gap-1.5">
                <UserCheck className="w-4 h-4" />
                CampusMart Student Pass
              </span>
              <span>VEMU Institute of Technology</span>
            </div>

            {profile ? (
              <div className="mt-5 space-y-3" data-testid="registered-profile-summary">
                <div>
                  <p className="text-xs text-emerald-300/80">Registered Student</p>
                  <p className="font-display font-bold text-xl text-white mt-0.5">
                    {profile.fullName}
                  </p>
                  <p className="text-xs font-mono text-emerald-200 mt-0.5">
                    {profile.rollNumber} · {profile.department} · {profile.yearOfStudy}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/15 space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-emerald-200/80">Phone Number</span>
                    <span className="font-mono font-semibold text-white">
                      +91 {profile.phoneNumber}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-emerald-200/80">Payment UPI Number</span>
                    <span className="font-mono font-semibold text-emerald-300">
                      {profile.upiNumber}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-emerald-200/80">Mobile SMS Alerts</span>
                    <span className="font-semibold text-emerald-300">
                      {profile.smsAlertsEnabled === false
                        ? 'Paused'
                        : `Linked (+91 ${profile.phoneNumber})`}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-5">
                <p className="font-display font-semibold text-base text-white">
                  Instant Checkout &amp; UPI Payouts
                </p>
                <p className="text-xs text-emerald-100/80 mt-2 leading-relaxed">
                  Saving your VEMU student registration automatically prefills your name, roll
                  number, phone number, and Payment UPI number during checkout and item listings.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-3 border-t border-white/15 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-200">
            <span className="inline-flex items-center gap-2">
              <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Verified for P. Kothakota Campus Pickups</span>
            </span>
            {onOpenIdCard && (
              <button
                type="button"
                onClick={onOpenIdCard}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                Open Student ID Card
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
