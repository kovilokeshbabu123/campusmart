import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import {
  BadgeCheck,
  CreditCard,
  Download,
  Phone,
  QrCode,
  Upload,
  X,
} from 'lucide-react';
import {
  BLOOD_GROUPS,
  BRAND_ASSETS,
  CAMPUS_STAY_OPTIONS,
  CampusStayOption,
  STUDY_YEARS,
  StudentRegistration,
  VEMU_DEPARTMENTS,
  buildIdCardSmsMessage,
  buildStudentIdCardPayload,
  validateAndRegisterStudent,
} from '../video/timeline';
import { SmsAlertAction } from './SmsAlertAction';

interface StudentIdCardPanelProps {
  profile: StudentRegistration | null;
  onSave: (profile: StudentRegistration) => void;
  onClear: () => void;
  onClose: () => void;
}

function getInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return 'VE';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function StudentIdCardPanel({
  profile,
  onSave,
  onClear,
  onClose,
}: StudentIdCardPanelProps) {
  const [fullName, setFullName] = useState(profile?.fullName ?? '');
  const [rollNumber, setRollNumber] = useState(profile?.rollNumber ?? '');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phoneNumber ?? '');
  const [department, setDepartment] = useState(profile?.department ?? VEMU_DEPARTMENTS[0]);
  const [yearOfStudy, setYearOfStudy] = useState(profile?.yearOfStudy ?? STUDY_YEARS[2]);
  const [upiNumber, setUpiNumber] = useState(profile?.upiNumber ?? '');
  const [bloodGroup, setBloodGroup] = useState(profile?.bloodGroup ?? BLOOD_GROUPS[0]);
  const [campusStay, setCampusStay] = useState<CampusStayOption>(
    profile?.campusStay ?? CAMPUS_STAY_OPTIONS[0],
  );
  const [photoDataUrl, setPhotoDataUrl] = useState(profile?.photoDataUrl ?? '');
  const [smsAlertsEnabled, setSmsAlertsEnabled] = useState(profile?.smsAlertsEnabled ?? true);
  const [cardSide, setCardSide] = useState<'front' | 'back'>('front');
  const [error, setError] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName);
      setRollNumber(profile.rollNumber);
      setPhoneNumber(profile.phoneNumber);
      setDepartment(profile.department);
      setYearOfStudy(profile.yearOfStudy);
      setUpiNumber(profile.upiNumber);
      setBloodGroup(profile.bloodGroup ?? BLOOD_GROUPS[0]);
      setCampusStay(profile.campusStay ?? CAMPUS_STAY_OPTIONS[0]);
      setPhotoDataUrl(profile.photoDataUrl ?? '');
      setSmsAlertsEnabled(profile.smsAlertsEnabled ?? true);
    }
  }, [profile]);

  const previewProfile: StudentRegistration = useMemo(() => {
    if (profile && fullName.trim() === '') {
      return profile;
    }
    return {
      fullName: fullName.trim() || 'VEMU Student',
      rollNumber: rollNumber.trim().toUpperCase() || '234M1A0542',
      phoneNumber: phoneNumber.trim() || '9876543210',
      department,
      yearOfStudy,
      upiNumber: upiNumber.trim() || '9876543210@ybl',
      bloodGroup,
      campusStay,
      photoDataUrl: photoDataUrl || undefined,
      registeredAt: profile?.registeredAt ?? new Date().toISOString(),
    };
  }, [
    profile,
    fullName,
    rollNumber,
    phoneNumber,
    department,
    yearOfStudy,
    upiNumber,
    bloodGroup,
    campusStay,
    photoDataUrl,
  ]);

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : undefined;

  const idMeta = useMemo(
    () => buildStudentIdCardPayload(previewProfile, currentOrigin),
    [previewProfile, currentOrigin],
  );

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(idMeta.qrPayload, {
      width: 240,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#064E3B',
        light: '#FFFFFF',
      },
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl('');
      });
    return () => {
      cancelled = true;
    };
  }, [idMeta.qrPayload]);

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Select a valid image file (PNG or JPG) for your student ID photo.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoDataUrl(reader.result);
        setError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const res = validateAndRegisterStudent({
      fullName,
      rollNumber,
      phoneNumber,
      department,
      yearOfStudy,
      upiNumber,
      bloodGroup,
      campusStay,
      photoDataUrl,
      smsAlertsEnabled,
    });
    if (!res.ok) {
      setError(res.error);
      setSavedNotice(null);
      return;
    }
    setError(null);
    onSave(res.profile);
    setSavedNotice(
      `Issued Digital VEMU ID Card ${buildStudentIdCardPayload(res.profile, currentOrigin).cardId} for ${res.profile.fullName}.`,
    );
  };

  const handleDownloadCard = async () => {
    const target = profile ?? previewProfile;
    const targetMeta = buildStudentIdCardPayload(target, currentOrigin);

    const canvas = document.createElement('canvas');
    canvas.width = 960;
    canvas.height = 580;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background card surface (crisp white + emerald header strip)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 960, 580);

    ctx.fillStyle = '#064E3B';
    ctx.fillRect(0, 0, 960, 148);

    ctx.fillStyle = '#10B981';
    ctx.fillRect(0, 148, 960, 6);

    // Header text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('VEMU INSTITUTE OF TECHNOLOGY', 152, 64);

    ctx.fillStyle = '#A7F3D0';
    ctx.font = '600 18px sans-serif';
    ctx.fillText('Autonomous Institution · P. Kothakota · Student ID Card', 152, 98);

    ctx.fillStyle = '#ECFDF5';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(targetMeta.cardId, 152, 128);

    // Load & draw official VEMU emblem safely
    await new Promise<void>((resolve) => {
      const emblem = new Image();
      emblem.crossOrigin = 'anonymous';
      emblem.onload = () => {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(36, 28, 92, 92);
        ctx.drawImage(emblem, 42, 34, 80, 80);
        resolve();
      };
      emblem.onerror = () => resolve();
      emblem.src = BRAND_ASSETS.officialEmblem;
    });

    // Portrait frame
    ctx.fillStyle = '#ECFDF5';
    ctx.fillRect(36, 192, 176, 212);
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 3;
    ctx.strokeRect(36, 192, 176, 212);

    if (target.photoDataUrl) {
      await new Promise<void>((resolve) => {
        const avatar = new Image();
        avatar.onload = () => {
          ctx.drawImage(avatar, 40, 196, 168, 204);
          resolve();
        };
        avatar.onerror = () => resolve();
        avatar.src = target.photoDataUrl!;
      });
    } else {
      ctx.fillStyle = '#065F46';
      ctx.font = 'bold 56px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(getInitials(target.fullName), 124, 314);
      ctx.textAlign = 'left';
    }

    // Student details
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 34px sans-serif';
    ctx.fillText(target.fullName, 244, 232);

    ctx.fillStyle = '#047857';
    ctx.font = 'bold 22px monospace';
    ctx.fillText(`Roll No: ${target.rollNumber}`, 244, 272);

    ctx.fillStyle = '#334155';
    ctx.font = '600 20px sans-serif';
    ctx.fillText(`${target.department} · ${target.yearOfStudy}`, 244, 310);
    ctx.fillText(`Phone: +91 ${target.phoneNumber}`, 244, 346);
    ctx.fillText(`Campus Stay: ${target.campusStay ?? 'Day Scholar'} · Blood: ${target.bloodGroup ?? 'O+'}`, 244, 382);
    ctx.fillText(`Payment UPI: ${target.upiNumber}`, 244, 418);

    // QR box on right
    if (qrDataUrl) {
      await new Promise<void>((resolve) => {
        const qrImg = new Image();
        qrImg.onload = () => {
          ctx.strokeStyle = '#CBD5E1';
          ctx.lineWidth = 2;
          ctx.strokeRect(728, 194, 192, 192);
          ctx.drawImage(qrImg, 738, 204, 172, 172);
          resolve();
        };
        qrImg.onerror = () => resolve();
        qrImg.src = qrDataUrl;
      });
    }

    ctx.fillStyle = '#475569';
    ctx.font = '600 15px monospace';
    ctx.fillText('SCAN TO VERIFY', 756, 410);

    // Bottom footer band
    ctx.fillStyle = '#F1F5F9';
    ctx.fillRect(0, 488, 960, 92);
    ctx.fillStyle = '#065F46';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('CampusMart Verified Student Identity', 36, 542);
    ctx.fillStyle = '#475569';
    ctx.font = '600 17px monospace';
    ctx.fillText(`Valid Academic Term: ${targetMeta.academicValidity}`, 616, 542);

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `${targetMeta.cardId}.png`;
    link.click();
  };

  return (
    <div
      data-testid="student-id-card-panel"
      className="mb-8 bg-white border border-emerald-300 rounded-2xl p-6 shadow-sm"
    >
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h3 className="font-display font-bold text-lg text-slate-900">
            VEMU Digital Student ID Card
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Generate your official QR-verified campus ID card for CampusMart pickups, college
            events, and block access.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close student ID card panel"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
        {/* Left: Student ID Card Details Form */}
        <form noValidate onSubmit={handleSubmit} className="lg:col-span-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="idcard-full-name"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Full Student Name
              </label>
              <input
                id="idcard-full-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Lokesh Babu"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label
                htmlFor="idcard-roll-number"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                VEMU Roll Number
              </label>
              <input
                id="idcard-roll-number"
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
                htmlFor="idcard-department"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Department
              </label>
              <select
                id="idcard-department"
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
                htmlFor="idcard-year"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Year of Study
              </label>
              <select
                id="idcard-year"
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
                htmlFor="idcard-blood-group"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Blood Group
              </label>
              <select
                id="idcard-blood-group"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="idcard-campus-stay"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Campus Stay
              </label>
              <select
                id="idcard-campus-stay"
                value={campusStay}
                onChange={(e) => setCampusStay(e.target.value as CampusStayOption)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                {CAMPUS_STAY_OPTIONS.map((stay) => (
                  <option key={stay} value={stay}>
                    {stay}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="idcard-phone-number"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="idcard-phone-number"
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
                htmlFor="idcard-upi-number"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Payment UPI Number / UPI ID
              </label>
              <div className="relative">
                <QrCode className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="idcard-upi-number"
                  type="text"
                  value={upiNumber}
                  onChange={(e) => setUpiNumber(e.target.value)}
                  placeholder="9876543210 or name@ybl"
                  className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <label
              htmlFor="idcard-photo-upload"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-300 hover:border-emerald-600 bg-white text-xs font-semibold text-slate-700 cursor-pointer whitespace-nowrap"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-700" />
              <span>{photoDataUrl ? 'Change Student Photo' : 'Upload ID Photo (Optional)'}</span>
              <input
                id="idcard-photo-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="sr-only"
              />
            </label>

            {photoDataUrl && (
              <button
                type="button"
                onClick={() => setPhotoDataUrl('')}
                className="text-xs font-semibold text-slate-500 hover:text-rose-600 cursor-pointer"
              >
                Remove Photo
              </button>
            )}
          </div>

          <label
            htmlFor="idcard-sms-alerts"
            className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-700 cursor-pointer"
          >
            <input
              id="idcard-sms-alerts"
              type="checkbox"
              checked={smsAlertsEnabled}
              onChange={(e) => setSmsAlertsEnabled(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600"
            />
            <span>
              Link <strong className="font-semibold text-slate-900">+91 mobile number</strong> for
              Student ID Card verification &amp; CampusMart order SMS updates.
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

          {savedNotice && (
            <p
              data-testid="idcard-issued-notice"
              className="text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2"
            >
              {savedNotice}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-display font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
            >
              <CreditCard className="w-4 h-4" />
              <span>
                {profile ? 'Update VEMU Student ID Card' : 'Issue VEMU Student ID Card'}
              </span>
            </button>

            {profile && (
              <button
                type="button"
                onClick={() => {
                  onClear();
                  setSavedNotice(null);
                }}
                className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                Clear ID Card
              </button>
            )}
          </div>
        </form>

        {/* Right: Digital VEMU Student ID Card Live Preview */}
        <div className="lg:col-span-6 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between gap-3">
            <div
              className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg"
              role="group"
              aria-label="Toggle student ID card side"
            >
              <button
                type="button"
                onClick={() => setCardSide('front')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  cardSide === 'front'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Front Side
              </button>
              <button
                type="button"
                onClick={() => setCardSide('back')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  cardSide === 'back'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Back Side
              </button>
            </div>

            <button
              type="button"
              onClick={handleDownloadCard}
              disabled={!profile}
              data-testid="download-idcard-btn"
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap ${
                profile
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:border-emerald-600 cursor-pointer'
                  : 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download ID PNG</span>
            </button>
          </div>

          {/* Physical-Proportion Digital ID Card */}
          <div
            data-testid="vemu-student-id-card"
            className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm"
          >
            {cardSide === 'front' ? (
              <div>
                {/* Institutional Header Band */}
                <div className="bg-emerald-950 text-white px-5 py-4 border-b-4 border-emerald-500 flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-lg bg-white p-1 shrink-0 flex items-center justify-center">
                    <img
                      src={BRAND_ASSETS.officialEmblem}
                      alt="Official VEMU Institute of Technology emblem"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-display font-bold text-sm sm:text-base tracking-tight truncate">
                      VEMU INSTITUTE OF TECHNOLOGY
                    </p>
                    <p className="text-xs text-emerald-200 truncate">
                      Autonomous Institution · P. Kothakota · Student ID Card
                    </p>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex flex-col sm:flex-row items-start justify-between gap-5">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="w-24 h-28 rounded-xl border border-emerald-200 bg-emerald-50 shrink-0 overflow-hidden flex items-center justify-center">
                      {previewProfile.photoDataUrl ? (
                        <img
                          src={previewProfile.photoDataUrl}
                          alt={`${previewProfile.fullName} portrait`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="font-display font-bold text-2xl text-emerald-800">
                          {getInitials(previewProfile.fullName)}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 space-y-1.5">
                      <p className="text-[11px] font-mono font-semibold text-emerald-700">
                        {idMeta.cardId}
                      </p>
                      <h4 className="font-display font-bold text-lg text-slate-900 leading-snug">
                        {previewProfile.fullName}
                      </h4>
                      <p className="font-mono font-bold text-xs text-slate-800">
                        Roll No: {previewProfile.rollNumber}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600">
                        <span>{previewProfile.department}</span>
                        <span aria-hidden="true">·</span>
                        <span>{previewProfile.yearOfStudy}</span>
                        <span aria-hidden="true">·</span>
                        <span>{previewProfile.campusStay ?? CAMPUS_STAY_OPTIONS[0]}</span>
                      </div>
                      <div className="pt-1 space-y-0.5 text-xs text-slate-600">
                        <p className="font-mono">Phone: +91 {previewProfile.phoneNumber}</p>
                        <p className="font-mono text-emerald-800">
                          UPI: {previewProfile.upiNumber}
                        </p>
                        <p>Blood Group: {previewProfile.bloodGroup ?? BLOOD_GROUPS[0]}</p>
                      </div>
                    </div>
                  </div>

                  {/* Verification QR Code */}
                  <div className="flex flex-col items-center shrink-0 self-center sm:self-start">
                    <div className="w-24 h-24 rounded-xl border border-slate-200 bg-white p-1.5 flex items-center justify-center">
                      {qrDataUrl ? (
                        <img
                          src={qrDataUrl}
                          alt={`Student ID verification QR for ${idMeta.cardId}`}
                          width={84}
                          height={84}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-[10px] text-slate-500">QR...</span>
                      )}
                    </div>
                    <span className="mt-1.5 text-[10px] font-mono font-semibold text-slate-500">
                      SCAN TO VERIFY
                    </span>
                    <a
                      href={idMeta.qrPayload}
                      data-testid="verify-idcard-link"
                      className="mt-0.5 text-[10px] font-semibold text-emerald-700 hover:underline whitespace-nowrap"
                    >
                      Open Verify Page
                    </a>
                  </div>
                </div>

                {/* Card Footer Strip */}
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 text-xs">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-800">
                    <BadgeCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    {profile ? 'Verified VEMU Student Member' : 'Draft Preview — Save to Issue'}
                  </span>
                  <span className="font-mono text-slate-600">
                    Valid {idMeta.academicValidity}
                  </span>
                </div>
              </div>
            ) : (
              <div data-testid="vemu-student-id-card-back">
                <div className="bg-emerald-950 text-white px-5 py-4 border-b-4 border-emerald-500 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-display font-bold text-sm tracking-tight">
                      CAMPUSMART · VEMU VERIFICATION BACK
                    </p>
                    <p className="text-xs text-emerald-200">
                      P. Kothakota, Tirupati–Chittoor Highway, Chittoor (Dt), AP - 517 112
                    </p>
                  </div>
                  <span className="font-mono text-xs text-emerald-300 shrink-0">
                    {idMeta.cardId}
                  </span>
                </div>

                <div className="p-5 space-y-4 text-xs text-slate-600 leading-relaxed">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">Campus Pickup Authorization</p>
                      <p className="mt-1">
                        Present this digital ID at H&amp;S Block 1, ECE &amp; EEE Block 2, CSE
                        Block 4, Pharmacy Block 9, Cafeteria, or Hostel gates to collect marketplace
                        orders and verify event passes.
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Emergency &amp; UPI Details</p>
                      <p className="mt-1 font-mono text-slate-800">
                        Holder: {previewProfile.fullName} ({previewProfile.rollNumber})
                      </p>
                      <p className="font-mono text-slate-800">
                        Contact: +91 {previewProfile.phoneNumber} · Blood:{' '}
                        {previewProfile.bloodGroup ?? BLOOD_GROUPS[0]}
                      </p>
                      <p className="font-mono text-emerald-800">
                        Linked UPI: {previewProfile.upiNumber}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-4">
                    <span className="font-mono text-[11px] text-slate-500 truncate">
                      {idMeta.qrPayload}
                    </span>
                    <span className="font-semibold text-emerald-800 shrink-0">
                      Principal / CampusMart Desk
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {profile && profile.smsAlertsEnabled !== false ? (
            <SmsAlertAction
              phoneNumber={profile.phoneNumber}
              message={buildIdCardSmsMessage(profile, idMeta.qrPayload)}
              buttonLabel="Send ID Card SMS"
            />
          ) : (
            <p className="text-xs text-slate-500">
              Note: Issue your ID Card with SMS Alerts linked to receive or send your VEMU ID card
              verification link via mobile SMS.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
