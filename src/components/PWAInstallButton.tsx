import { useState } from 'react';
import { Download, Smartphone, WifiOff } from 'lucide-react';
import { MobileAppInstallModal } from './MobileAppInstallModal';
import { useOnlineStatus, usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'hero' | 'banner';
  studentPhoneNumber?: string;
}

export function PWAInstallButton({
  variant = 'header',
  studentPhoneNumber = '',
}: PWAInstallButtonProps) {
  const { isNativeInstallReady, isInstalled, platform, install } = usePWAInstall();
  const [modalOpen, setModalOpen] = useState(false);

  // In header utility zone, hide when already running as an installed standalone mobile app
  if (variant === 'header' && isInstalled) {
    return null;
  }

  const handlePrimaryClick = async () => {
    if (variant === 'header' && isNativeInstallReady) {
      const accepted = await install();
      if (accepted) return;
    }
    setModalOpen(true);
  };

  return (
    <>
      {variant === 'header' && (
        <button
          type="button"
          onClick={() => {
            void handlePrimaryClick();
          }}
          data-testid="header-install-app-btn"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-emerald-600 bg-white hover:bg-emerald-50 text-emerald-700 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Download App</span>
          <span className="sm:hidden">App</span>
        </button>
      )}

      {variant === 'hero' && (
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          data-testid="hero-install-app-btn"
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer whitespace-nowrap"
        >
          <Smartphone className="w-4 h-4" />
          <span>Get Android &amp; iOS App</span>
        </button>
      )}

      {variant === 'banner' && (
        <section
          aria-label="Mobile app download for Android and iOS"
          className="mt-8 rounded-2xl bg-white border border-slate-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-xs"
        >
          <div className="flex items-start sm:items-center gap-4">
            <img
              src="/pwa-192x192.png"
              alt="CampusMart Android and iOS App Icon"
              className="w-14 h-14 rounded-2xl shrink-0 border border-emerald-200"
            />
            <div>
              <p className="text-xs font-semibold text-emerald-700">
                Android &amp; iPhone Mobile App
              </p>
              <h2 className="font-display text-lg font-bold text-slate-900 mt-0.5">
                Install CampusMart on Your Phone
              </h2>
              <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
                Add CampusMart to your Android or iOS home screen for instant campus listings, UPI QR checkout, Student ID Card, and Event Passes — even on weak campus Wi-Fi.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {isNativeInstallReady && !isInstalled && (
              <button
                type="button"
                onClick={() => {
                  void install();
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-display font-semibold text-xs transition-colors cursor-pointer whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                <span>Install on Android</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              data-testid="banner-install-app-btn"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:border-emerald-600 text-slate-900 font-display font-semibold text-xs transition-colors cursor-pointer whitespace-nowrap"
            >
              <Smartphone className="w-4 h-4 text-emerald-700" />
              <span>Android &amp; iOS Guide + QR</span>
            </button>
          </div>
        </section>
      )}

      <MobileAppInstallModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        platform={platform}
        isNativeInstallReady={isNativeInstallReady}
        isInstalled={isInstalled}
        onTriggerNativeInstall={install}
        initialPhoneNumber={studentPhoneNumber}
      />
    </>
  );
}

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      data-testid="offline-indicator"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-lg"
    >
      <WifiOff className="w-3.5 h-3.5 shrink-0" />
      <span>Offline Mode — Cached campus pages available</span>
    </div>
  );
}
