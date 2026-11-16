import {
  ArrowLeft,
  BadgeCheck,
  Calendar,
  CreditCard,
  MapPin,
  MessageSquare,
  Phone,
  Ticket,
} from 'lucide-react';
import { BRAND_ASSETS, QrVerificationData, buildSmsUri } from '../video/timeline';

interface QrVerificationViewProps {
  data: QrVerificationData;
  onBackToStorefront: () => void;
}

export function QrVerificationView({ data, onBackToStorefront }: QrVerificationViewProps) {
  return (
    <div
      data-testid="qr-verification-view"
      className="min-h-screen bg-[#F8FAF9] text-slate-900 flex flex-col items-center justify-center px-4 py-10"
    >
      <div className="w-full max-w-lg bg-white border border-emerald-300 rounded-2xl overflow-hidden shadow-sm">
        {/* Institutional Header Band */}
        <div className="bg-emerald-950 text-white px-6 py-5 border-b-4 border-emerald-500 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white p-1.5 shrink-0 flex items-center justify-center">
            <img
              src={BRAND_ASSETS.officialEmblem}
              alt="Official VEMU Institute of Technology emblem"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <p className="font-display font-bold text-base sm:text-lg tracking-tight">
              VEMU INSTITUTE OF TECHNOLOGY
            </p>
            <p className="text-xs text-emerald-200 mt-0.5">
              Autonomous Institution · P. Kothakota · Official QR Verification
            </p>
          </div>
        </div>

        {/* Verification Status Banner */}
        <div className="px-6 py-3.5 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 text-xs font-bold text-emerald-900">
            <BadgeCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            {data.type === 'id'
              ? 'Verified VEMU Student ID Card'
              : 'Verified VEMU College Event Gate Pass'}
          </span>
          <span className="font-mono text-xs font-bold text-emerald-800">
            {data.type === 'id' ? data.cardId : data.passId}
          </span>
        </div>

        {/* Verified Body */}
        {data.type === 'id' ? (
          <div className="p-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-slate-500">Registered Student</p>
                <h1 className="font-display font-extrabold text-2xl text-slate-900 mt-0.5">
                  {data.fullName}
                </h1>
                <p className="font-mono font-bold text-sm text-emerald-700 mt-1">
                  Roll No: {data.rollNumber}
                </p>
              </div>
              <CreditCard className="w-6 h-6 text-emerald-700 shrink-0 mt-1" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 text-xs">
              <div>
                <p className="text-slate-500">Department</p>
                <p className="font-semibold text-slate-900 mt-0.5">{data.department}</p>
              </div>
              <div>
                <p className="text-slate-500">Year of Study</p>
                <p className="font-semibold text-slate-900 mt-0.5">{data.yearOfStudy}</p>
              </div>
              <div>
                <p className="text-slate-500">Campus Stay</p>
                <p className="font-semibold text-slate-900 mt-0.5">{data.campusStay}</p>
              </div>
              <div>
                <p className="text-slate-500">Blood Group</p>
                <p className="font-semibold text-slate-900 mt-0.5">{data.bloodGroup}</p>
              </div>
              {data.phoneNumber && (
                <div>
                  <p className="text-slate-500">Phone Number</p>
                  <div className="flex flex-wrap items-center gap-3 mt-0.5">
                    <a
                      href={`tel:+91${data.phoneNumber}`}
                      className="inline-flex items-center gap-1 font-mono font-semibold text-emerald-700 hover:underline"
                    >
                      <Phone className="w-3 h-3" />
                      <span>+91 {data.phoneNumber}</span>
                    </a>
                    <a
                      href={buildSmsUri(
                        data.phoneNumber,
                        `VEMU ID Verification (${data.cardId}): ${data.fullName} (${data.rollNumber})`,
                      )}
                      className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-emerald-700 hover:underline"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>SMS</span>
                    </a>
                  </div>
                </div>
              )}
              {data.upiNumber && (
                <div>
                  <p className="text-slate-500">Linked Payment UPI</p>
                  <p className="font-mono font-semibold text-slate-900 mt-0.5 break-all">
                    {data.upiNumber}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <span>Authorized for CampusMart Pickups &amp; Events</span>
              <span className="font-mono font-semibold">Valid {data.academicValidity}</span>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-slate-500">College Event</p>
                <h1 className="font-display font-extrabold text-xl text-slate-900 mt-0.5">
                  {data.eventTitle}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-2">
                  {data.schedule && (
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                      {data.schedule}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    {data.venue}
                  </span>
                </div>
              </div>
              <Ticket className="w-6 h-6 text-emerald-700 shrink-0 mt-1" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 text-xs">
              <div>
                <p className="text-slate-500">Pass Holder</p>
                <p className="font-semibold text-slate-900 mt-0.5">{data.studentName}</p>
              </div>
              <div>
                <p className="text-slate-500">VEMU Roll Number</p>
                <p className="font-mono font-bold text-emerald-700 mt-0.5">{data.rollNumber}</p>
              </div>
              <div>
                <p className="text-slate-500">Department &amp; Year</p>
                <p className="font-semibold text-slate-900 mt-0.5">
                  {data.department} · {data.yearOfStudy}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Entry Pass Fee</p>
                <p className="font-mono font-bold text-slate-900 mt-0.5">₹{data.passPriceInr}</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer Action */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-4">
          <span className="text-xs text-slate-500">CampusMart · VEMU Campus Portal</span>
          <button
            type="button"
            onClick={onBackToStorefront}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Open CampusMart</span>
          </button>
        </div>
      </div>
    </div>
  );
}
