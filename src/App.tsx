import { useEffect, useState } from 'react';
import { ArrowRight, CreditCard, PlusCircle, Ticket, UserCheck } from 'lucide-react';
import { BrandReferencesSection } from './components/BrandReferencesSection';
import { CollegeEventsSection } from './components/CollegeEventsSection';
import { MarketplacePreview } from './components/MarketplacePreview';
import { OfflineIndicator, PWAInstallButton } from './components/PWAInstallButton';
import { QrVerificationView } from './components/QrVerificationView';
import {
  BRAND_ASSETS,
  QrVerificationData,
  StudentRegistration,
  parseQrVerificationSearch,
} from './video/timeline';

const STUDENT_STORAGE_KEY = 'campusmart_vemu_student_v1';

export default function App() {
  const [qrVerification, setQrVerification] = useState<QrVerificationData | null>(() => {
    if (typeof window === 'undefined') return null;
    return parseQrVerificationSearch(window.location.search);
  });

  const [panelRequest, setPanelRequest] = useState<{
    panel: 'sell' | 'register' | 'idcard' | 'checkout' | 'orders';
    nonce: number;
  } | null>(null);

  const [studentProfile, setStudentProfile] = useState<StudentRegistration | null>(() => {
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

  const openMarketplacePanel = (panel: 'sell' | 'register' | 'idcard' | 'checkout' | 'orders') => {
    setPanelRequest((prev) => ({ panel, nonce: (prev?.nonce ?? 0) + 1 }));
    const el = document.getElementById('marketplace');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (qrVerification) {
    return (
      <QrVerificationView
        data={qrVerification}
        onBackToStorefront={() => {
          setQrVerification(null);
          if (typeof window !== 'undefined' && window.history.replaceState) {
            window.history.replaceState({}, '', window.location.pathname);
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-slate-900 flex flex-col">
      {/* 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 bg-[#F8FAF9]/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-8">
          <a
            href="#campus-hero"
            className="font-display text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            CampusMart
          </a>

          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600"
          >
            <a
              href="#campus-hero"
              className="hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0"
            >
              Campus Home
            </a>
            <a
              href="#marketplace"
              className="hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0"
            >
              Marketplace
            </a>
            <a
              href="#college-events"
              className="hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0"
            >
              Event Pass
            </a>
            <a
              href="#brand-assets"
              className="hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0"
            >
              VEMU Identity
            </a>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <PWAInstallButton
              variant="header"
              studentPhoneNumber={studentProfile?.phoneNumber ?? ''}
            />
            <button
              type="button"
              onClick={() => openMarketplacePanel('sell')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Sell an Item</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6">
        {/* Storefront Hero */}
        <section id="campus-hero" className="pt-8 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center">
              <p className="text-xs font-semibold tracking-wide text-emerald-700">
                VEMU Institute of Technology · P. Kothakota
              </p>
              <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mt-2 leading-[1.1] text-balance">
                Buy Smart. Sell Easy. Share More.
              </h1>
              <p className="text-base text-slate-600 mt-4 max-w-xl leading-relaxed">
                Exclusively for VEMU Institute of Technology students — buy, sell, exchange, or
                donate textbooks, laptops, lab aprons, drafters, and calculators at campus prices
                between ₹20 and ₹100.
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-7">
                <button
                  type="button"
                  onClick={() => openMarketplacePanel('sell')}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-display font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Sell an Item</span>
                </button>

                <a
                  href="#marketplace"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-slate-300 hover:border-emerald-600 text-slate-900 font-display font-semibold text-sm transition-colors whitespace-nowrap"
                >
                  <span>Browse Marketplace</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <a
                  href="#college-events"
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors whitespace-nowrap"
                >
                  <Ticket className="w-4 h-4" />
                  <span>College Event Pass</span>
                </a>

                <button
                  type="button"
                  onClick={() => openMarketplacePanel('register')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-emerald-700 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Student Registration &amp; UPI</span>
                </button>

                <button
                  type="button"
                  onClick={() => openMarketplacePanel('idcard')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-emerald-700 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Student ID Card</span>
                </button>

                <PWAInstallButton
                  variant="hero"
                  studentPhoneNumber={studentProfile?.phoneNumber ?? ''}
                />
              </div>

              <div className="mt-7 pt-5 border-t border-slate-200 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">₹20–₹100 Student Pricing</span>
                <span aria-hidden="true">·</span>
                <span>Direct VEMU Campus Pickup</span>
                <span aria-hidden="true">·</span>
                <span>QR Event Passes &amp; UPI Payments</span>
              </div>
            </div>

            <div className="lg:col-span-6 min-w-0">
              <div className="relative w-full h-full lg:min-h-[260px] aspect-[16/10] lg:aspect-auto rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-sm">
                <img
                  src={BRAND_ASSETS.campusPhoto}
                  alt="VEMU Institute of Technology campus in P. Kothakota"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-14 h-14 rounded-xl bg-white p-1.5 shrink-0 flex items-center justify-center shadow-sm">
                      <img
                        src={BRAND_ASSETS.officialEmblem}
                        alt="Official VEMU Institute of Technology emblem"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="min-w-0 text-white">
                      <p className="font-display font-bold text-sm sm:text-base tracking-tight truncate">
                        VEMU INSTITUTE OF TECHNOLOGY
                      </p>
                      <p className="text-xs text-emerald-300 mt-0.5 truncate">
                        CampusMart · Green &amp; White Student Marketplace
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <MarketplacePreview
          externalPanelRequest={panelRequest}
          studentProfile={studentProfile}
          onStudentProfileChange={setStudentProfile}
        />
        <CollegeEventsSection studentProfile={studentProfile} />
        <BrandReferencesSection />
        <PWAInstallButton
          variant="banner"
          studentPhoneNumber={studentProfile?.phoneNumber ?? ''}
        />
      </main>

      <OfflineIndicator />

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white mt-8">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p className="font-medium text-slate-700">
            CampusMart — Exclusively for VEMU Institute of Technology Students
          </p>
          <p>P. Kothakota, Tirupati–Chittoor Highway · Student Marketplace (₹20–₹100)</p>
        </div>
      </footer>
    </div>
  );
}


