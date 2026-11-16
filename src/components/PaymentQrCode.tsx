import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { CAMPUSMART_UPI_ID, buildUpiPaymentUri } from '../video/timeline';

interface PaymentQrCodeProps {
  amountInr: number;
  orderNote: string;
  upiId?: string;
  size?: number;
}

export function PaymentQrCode({
  amountInr,
  orderNote,
  upiId = CAMPUSMART_UPI_ID,
  size = 160,
}: PaymentQrCodeProps) {
  const [dataUrl, setDataUrl] = useState<string>('');
  const effectiveUpiId = upiId.includes('@') ? upiId : `${upiId}@upi`;
  const upiUri = buildUpiPaymentUri({ amountInr, orderNote, upiId: effectiveUpiId });

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(upiUri, {
      width: size * 2,
      margin: 2,
      color: {
        dark: '#0B1320',
        light: '#FFFFFF',
      },
    })
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setDataUrl('');
      });

    return () => {
      cancelled = true;
    };
  }, [upiUri, size]);

  return (
    <div
      data-testid="payment-qr-box"
      className="flex items-center gap-4 p-4 rounded-xl bg-emerald-50/70 border border-emerald-200"
    >
      <div
        className="shrink-0 rounded-lg bg-white p-2 border border-slate-200 shadow-xs flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {dataUrl ? (
          <img
            src={dataUrl}
            alt={`UPI Payment QR Code for ₹${amountInr}`}
            width={size - 16}
            height={size - 16}
            className="w-full h-full object-contain"
          />
        ) : (
          <span className="text-xs text-slate-500">Generating QR...</span>
        )}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold text-emerald-800">
          Scan &amp; Pay via UPI (GPay · PhonePe · Paytm)
        </p>
        <p className="font-mono font-bold text-xl text-slate-900 mt-1 tabular-nums">
          ₹{amountInr.toLocaleString('en-IN')}
        </p>
        <p className="text-xs font-mono text-slate-600 mt-1 truncate">
          UPI ID: {effectiveUpiId}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          {orderNote} · Instant student verification
        </p>
      </div>
    </div>
  );
}
