import { useState } from 'react';
import { CheckCircle2, MessageSquare, Smartphone } from 'lucide-react';
import { buildSmsUri, normalizeIndianPhone } from '../video/timeline';

interface SmsAlertActionProps {
  phoneNumber: string;
  message: string;
  buttonLabel?: string;
  theme?: 'light' | 'dark';
}

interface SmsResultState {
  status: 'sent' | 'device-fallback' | 'error';
  detail: string;
  smsUri: string;
}

export function SmsAlertAction({
  phoneNumber,
  message,
  buttonLabel = 'Send SMS Alert',
  theme = 'light',
}: SmsAlertActionProps) {
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SmsResultState | null>(null);

  const digits = normalizeIndianPhone(phoneNumber);
  const smsHref = buildSmsUri(phoneNumber, message);
  const displayPhone = digits.length === 10 ? `+91 ${digits}` : phoneNumber;

  const handleSendSms = async () => {
    setSending(true);
    try {
      const res = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, message }),
      });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        delivered?: boolean;
        provider?: string;
        smsUri?: string;
        error?: string;
      } | null;

      if (!res.ok) {
        setResult({
          status: 'error',
          detail: data?.error ?? 'Could not prepare SMS for this mobile number.',
          smsUri: smsHref,
        });
        return;
      }

      if (data?.delivered) {
        setResult({
          status: 'sent',
          detail: `SMS delivered to ${displayPhone} via ${data.provider}.`,
          smsUri: data.smsUri ?? smsHref,
        });
      } else {
        setResult({
          status: 'device-fallback',
          detail: `SMS linked to ${displayPhone}. Carrier API keys are not set in Secrets yet — tap "Open Phone SMS" to send from your phone now.`,
          smsUri: data?.smsUri ?? smsHref,
        });
      }
    } catch {
      setResult({
        status: 'device-fallback',
        detail: `SMS ready for ${displayPhone}. Tap "Open Phone SMS" to open your device Messages app.`,
        smsUri: smsHref,
      });
    } finally {
      setSending(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div data-testid="sms-alert-action" className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleSendSms}
          disabled={sending}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            isDark
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
          } ${sending ? 'opacity-70 cursor-wait' : ''}`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{sending ? 'Preparing SMS...' : `${buttonLabel} (${displayPhone})`}</span>
        </button>

        <a
          href={smsHref}
          data-testid="open-phone-sms-link"
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap ${
            isDark
              ? 'border-white/25 bg-white/10 text-emerald-100 hover:bg-white/20'
              : 'border-slate-300 bg-white text-slate-800 hover:border-emerald-600'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Open Phone SMS</span>
        </a>
      </div>

      {result && (
        <div
          role={result.status === 'error' ? 'alert' : 'status'}
          data-testid="sms-alert-feedback"
          className={`rounded-lg px-3 py-2 text-xs space-y-1.5 border ${
            result.status === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : isDark
                ? 'bg-white/10 border-emerald-400/40 text-emerald-100'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}
        >
          <p className="font-medium flex items-start gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>{result.detail}</span>
          </p>
          {result.status !== 'error' && (
            <p
              className={`font-mono text-[11px] leading-relaxed break-all ${
                isDark ? 'text-emerald-200/90' : 'text-slate-600'
              }`}
            >
              {message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
