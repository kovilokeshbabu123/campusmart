import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import QRCode from 'qrcode';
import {
  Check,
  Copy,
  Download,
  MoreVertical,
  PlusSquare,
  Share,
  Smartphone,
  X,
} from 'lucide-react';
import { SmsAlertAction } from './SmsAlertAction';
import {
  MobilePlatform,
  buildMobileAppShareUrl,
  buildMobileInstallSmsMessage,
  normalizeIndianPhone,
} from '../video/timeline';

interface MobileAppInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: MobilePlatform;
  isNativeInstallReady: boolean;
  isInstalled: boolean;
  onTriggerNativeInstall: () => Promise<boolean>;
  initialPhoneNumber?: string;
}

export function MobileAppInstallModal({
  isOpen,
  onClose,
  platform,
  isNativeInstallReady,
  isInstalled,
  onTriggerNativeInstall,
  initialPhoneNumber = '',
}: MobileAppInstallModalProps) {
  const [activeTab, setActiveTab] = useState<'android' | 'ios'>(
    platform === 'ios' ? 'ios' : 'android',
  );
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [smsPhone, setSmsPhone] = useState(initialPhoneNumber);

  const appUrl = buildMobileAppShareUrl(
    typeof window !== 'undefined' ? window.location.origin : undefined,
  );

  useEffect(() => {
    if (initialPhoneNumber && !smsPhone) {
      setSmsPhone(initialPhoneNumber);
    }
  }, [initialPhoneNumber, smsPhone]);

  useEffect(() => {
    setActiveTab(platform === 'ios' ? 'ios' : 'android');
  }, [platform]);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    QRCode.toDataURL(appUrl, {
      width: 148,
      margin: 1,
      color: { dark: '#064e3b', light: '#ffffff' },
    })
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch(() => {
        if (active) setQrDataUrl('');
      });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      active = false;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, appUrl, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const normalizedPhone = normalizeIndianPhone(smsPhone);
  const isPhoneValid = /^[6-9]\d{9}$/.test(normalizedPhone);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-app-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        data-testid="mobile-app-install-modal"
        className="w-full max-w-lg max-h-[92vh] flex flex-col rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden"
      >
        <div className="px-5 py-4 bg-emerald-600 text-white flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src="/pwa-192x192.png"
              alt="CampusMart App Icon"
              className="w-10 h-10 rounded-xl bg-white/10 shrink-0"
            />
            <div className="min-w-0">
              <h2
                id="mobile-app-modal-title"
                className="font-display text-base font-bold tracking-tight truncate"
              >
                Download CampusMart Mobile App
              </h2>
              <p className="text-xs text-emerald-100 truncate">
                Install on Android &amp; iPhone (iOS) · Works Offline
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close mobile app download dialog"
            className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-emerald-500 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {isInstalled && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 text-xs font-medium text-emerald-900">
              CampusMart is already installed and running as a mobile app on this device.
            </div>
          )}

          {/* Platform Selector Tabs */}
          <div
            role="tablist"
            aria-label="Mobile operating system"
            className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 border border-slate-200"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'android'}
              onClick={() => setActiveTab('android')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'android'
                  ? 'bg-white text-emerald-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Android (Chrome)
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'ios'}
              onClick={() => setActiveTab('ios')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'ios'
                  ? 'bg-white text-emerald-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              iPhone &amp; iPad (iOS Safari)
            </button>
          </div>

          {activeTab === 'android' ? (
            <div data-testid="android-install-panel" className="space-y-4">
              {isNativeInstallReady && !isInstalled && (
                <button
                  type="button"
                  onClick={() => {
                    void onTriggerNativeInstall();
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-display font-semibold text-sm transition-colors cursor-pointer shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Install CampusMart App on Android</span>
                </button>
              )}

              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
                <p className="text-xs font-semibold text-slate-900">
                  How to install on Android mobile (Chrome / Edge / Brave):
                </p>
                <ol className="space-y-2.5 text-xs text-slate-700">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-md bg-emerald-600 text-white font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                      1
                    </span>
                    <span>
                      Open CampusMart in <strong>Google Chrome</strong> on your Android phone (or scan the QR code below).
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-md bg-emerald-600 text-white font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                      2
                    </span>
                    <span className="flex items-center gap-1 flex-wrap">
                      Tap the <strong>Install</strong> prompt, or tap the browser menu{' '}
                      <MoreVertical className="w-3.5 h-3.5 inline text-slate-900" /> in the top corner.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-md bg-emerald-600 text-white font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                      3
                    </span>
                    <span>
                      Tap <strong>Install app</strong> (or <strong>Add to Home screen</strong>) to download CampusMart to your app drawer.
                    </span>
                  </li>
                </ol>
              </div>
            </div>
          ) : (
            <div data-testid="ios-install-panel" className="space-y-4">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
                <p className="text-xs font-semibold text-slate-900">
                  How to install on iPhone or iPad (iOS Safari):
                </p>
                <ol className="space-y-2.5 text-xs text-slate-700">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-md bg-emerald-600 text-white font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                      1
                    </span>
                    <span>
                      Open CampusMart in <strong>Safari</strong> on your iPhone or iPad (scan the QR code below with your Camera).
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-md bg-emerald-600 text-white font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                      2
                    </span>
                    <span className="flex items-center gap-1 flex-wrap">
                      Tap the <strong>Share</strong> icon{' '}
                      <Share className="w-3.5 h-3.5 inline text-emerald-700" /> in the bottom Safari toolbar.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-md bg-emerald-600 text-white font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                      3
                    </span>
                    <span className="flex items-center gap-1 flex-wrap">
                      Scroll down and tap{' '}
                      <PlusSquare className="w-3.5 h-3.5 inline text-emerald-700" />{' '}
                      <strong>Add to Home Screen</strong>, then tap <strong>Add</strong>.
                    </span>
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* Scan QR or Send App Link to Mobile */}
          <div className="rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-32 h-32 rounded-xl border border-slate-200 bg-white p-2 flex items-center justify-center shrink-0">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="QR code to open CampusMart mobile app"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Smartphone className="w-8 h-8 text-emerald-600" />
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left">
                <p className="text-xs font-bold text-slate-900">
                  Scan QR on Android or iPhone Camera
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Point your phone camera at this QR code to launch CampusMart on mobile and install it directly onto your home screen.
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:border-emerald-600 text-xs font-semibold text-slate-800 transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Link Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy App Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 space-y-2">
              <label
                htmlFor="mobile-app-sms-phone"
                className="block text-xs font-semibold text-slate-700"
              >
                Or send download link to your mobile via SMS (+91)
              </label>
              <div className="flex flex-col sm:flex-row gap-2 sm:items-start">
                <input
                  id="mobile-app-sms-phone"
                  type="tel"
                  inputMode="numeric"
                  placeholder="10-digit mobile number (e.g. 9876543210)"
                  value={smsPhone}
                  onChange={(e) => setSmsPhone(e.target.value)}
                  className="w-full sm:w-56 px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                />
                {isPhoneValid && (
                  <SmsAlertAction
                    phoneNumber={normalizedPhone}
                    message={buildMobileInstallSmsMessage(appUrl)}
                    buttonLabel="SMS App Link"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
