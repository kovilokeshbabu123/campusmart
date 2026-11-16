export const TOTAL_DURATION = 54;

export const BRAND_ASSETS = {
  campusPhoto: '/assets/aistudio/Screenshot_2026-11-15_204909_328cd7ff.png',
  officialEmblem: '/assets/aistudio/Screenshot_2026-11-15_205309_ebc4847c.png',
  officialBranding: '/assets/aistudio/Screenshot_2026-11-15_205327_bfd783fa.png',
} as const;

export type SceneId =
  | 'scene-1'
  | 'scene-2'
  | 'scene-3'
  | 'scene-4'
  | 'scene-5'
  | 'scene-6'
  | 'scene-7';

export interface SceneDefinition {
  id: SceneId;
  number: number;
  title: string;
  startSec: number;
  endSec: number;
  headline: string;
  subtitle: string;
  description: string;
  referenceFocus: string;
}

export const SCENES: readonly SceneDefinition[] = [
  {
    id: 'scene-1',
    number: 1,
    title: 'Real VEMU Campus',
    startSec: 0,
    endSec: 8,
    headline: 'VEMU INSTITUTE OF TECHNOLOGY',
    subtitle: 'P. Kothakota · Morning Campus Aerial',
    description:
      'Aerial sunrise flyover across the actual VEMU Institute of Technology buildings and landscaped lawns with students walking along campus pathways.',
    referenceFocus: 'Reference Image 1 (Campus Photograph)',
  },
  {
    id: 'scene-2',
    number: 2,
    title: 'The Student Marketplace Problem',
    startSec: 8,
    endSec: 16,
    headline: 'Everything a student needs, right on campus.',
    subtitle: 'Connecting demand with unused engineering gear',
    description:
      'Engineering students searching for affordable textbooks, laptops, lab aprons, drafters, calculators, and stationery alongside seniors holding unused materials.',
    referenceFocus: 'Campus Context & Student Need',
  },
  {
    id: 'scene-3',
    number: 3,
    title: 'CampusMart Brand Reveal',
    startSec: 16,
    endSec: 23,
    headline: 'INTRODUCING CAMPUSMART',
    subtitle: 'Your Campus. Your Marketplace.',
    description:
      '3D emerald green-and-white CampusMart emblem reveal paired alongside the preserved official VEMU Institute of Technology emblem as an institutional identity reference.',
    referenceFocus: 'Reference Image 2 (Official Emblem) + CampusMart 3D Mark',
  },
  {
    id: 'scene-4',
    number: 4,
    title: 'Buy and Sell',
    startSec: 23,
    endSec: 32,
    headline: 'BUY SMART. SELL EASY.',
    subtitle: 'Books · Laptops · Lab Aprons · Drafters · Pens · Calculators',
    description:
      'Smooth 3D smartphone marketplace showcase featuring engineering books, laptops, lab aprons, mini drafters, pens & pencils, and scientific calculators.',
    referenceFocus: 'CampusMart Mobile Marketplace UI',
  },
  {
    id: 'scene-5',
    number: 5,
    title: 'Exchange and Donate',
    startSec: 32,
    endSec: 39,
    headline: 'EXCHANGE MORE. SHARE MORE.',
    subtitle: 'Peer-to-peer book swaps & stationery sharing',
    description:
      'Two students exchanging engineering textbooks across campus and a fellow student donating unused stationery kits directly on campus.',
    referenceFocus: 'Peer-to-Peer Campus Sustainability',
  },
  {
    id: 'scene-6',
    number: 6,
    title: 'Website and Android Experience',
    startSec: 39,
    endSec: 46,
    headline: 'WEB & ANDROID PLATFORM',
    subtitle: 'Search · Student Login · Upload · Cart · Order Tracking',
    description:
      'Synchronized laptop web portal and Android app mockups demonstrating verified VEMU student login, product search, instant upload, cart, and campus pickup tracking.',
    referenceFocus: 'Cross-Platform Green & White Ecosystem',
  },
  {
    id: 'scene-7',
    number: 7,
    title: 'Official VEMU Brand Ending',
    startSec: 46,
    endSec: 54,
    headline: 'CAMPUSMART',
    subtitle: 'BUY SMART. SELL EASY. SHARE MORE.',
    description:
      'Return to the actual VEMU campus leading into the official finale combining VEMU emblem, VEMU branding artwork, and the CampusMart identity with a cinematic fade-out.',
    referenceFocus: 'Reference Images 1, 2 & 3 + CampusMart Finale',
  },
] as const;

export type MarketplaceCategory =
  | 'All'
  | 'Engineering Books'
  | 'Laptops & Electronics'
  | 'Lab Aprons'
  | 'Drafters & Drawing Tools'
  | 'Pens & Pencils'
  | 'Calculators & Stationery';

export type ListingMode = 'Buy' | 'Exchange' | 'Donate';

export interface MarketplaceItem {
  id: string;
  title: string;
  category: Exclude<MarketplaceCategory, 'All'>;
  mode: ListingMode;
  priceInr: number;
  originalPriceInr: number;
  department: string;
  condition: string;
  seller: string;
  pickupSpot: string;
  sellerPhone?: string;
  sellerUpiNumber?: string;
  isUserListing?: boolean;
}

export const MARKETPLACE_CATEGORIES: readonly MarketplaceCategory[] = [
  'All',
  'Engineering Books',
  'Laptops & Electronics',
  'Lab Aprons',
  'Drafters & Drawing Tools',
  'Pens & Pencils',
  'Calculators & Stationery',
];

export const MIN_LISTING_PRICE_INR = 20;
export const MAX_LISTING_PRICE_INR = 100;

export const MARKETPLACE_ITEMS: readonly MarketplaceItem[] = [
  {
    id: 'item-books-ds',
    title: 'Data Structures & Algorithms in C++ (4th Ed.)',
    category: 'Engineering Books',
    mode: 'Buy',
    priceInr: 75,
    originalPriceInr: 720,
    department: 'CSE · 3rd Year',
    condition: 'Like New',
    seller: 'Karthik R.',
    pickupSpot: 'CSE Department Block 4',
  },
  {
    id: 'item-books-m1',
    title: 'Engineering Mathematics-I & II Solved Question Bank',
    category: 'Engineering Books',
    mode: 'Buy',
    priceInr: 35,
    originalPriceInr: 280,
    department: 'H&S · 1st Year',
    condition: 'Clean Notes',
    seller: 'Harika N.',
    pickupSpot: 'H&S Department Block 1',
  },
  {
    id: 'item-laptop-hp',
    title: 'Laptop Cooling Stand, Mouse & USB-C Hub Kit',
    category: 'Laptops & Electronics',
    mode: 'Buy',
    priceInr: 100,
    originalPriceInr: 1450,
    department: 'ECE · Final Year',
    condition: 'Verified Working',
    seller: 'Sneha M.',
    pickupSpot: 'ECE & EEE Department Block 2',
  },
  {
    id: 'item-laptop-otg',
    title: 'Braided USB-C Fast Charging Cable & OTG Adapter',
    category: 'Laptops & Electronics',
    mode: 'Buy',
    priceInr: 40,
    originalPriceInr: 399,
    department: 'CSE · 2nd Year',
    condition: 'Like New',
    seller: 'Bhavya T.',
    pickupSpot: 'Near Girls Hostel',
  },
  {
    id: 'item-apron-lab',
    title: 'White Cotton Engineering Workshop & Chem Lab Apron',
    category: 'Lab Aprons',
    mode: 'Exchange',
    priceInr: 65,
    originalPriceInr: 450,
    department: 'MECH · 2nd Year',
    condition: 'Clean · Size L',
    seller: 'Praveen K.',
    pickupSpot: 'H&S Department Block 1',
  },
  {
    id: 'item-apron-pharmacy',
    title: 'Pharmacy & Chemistry Lab Coat (Clean · Size M)',
    category: 'Lab Aprons',
    mode: 'Buy',
    priceInr: 60,
    originalPriceInr: 480,
    department: 'PHARM · 3rd Year',
    condition: 'Washed & Pressed',
    seller: 'Meghana D.',
    pickupSpot: 'Pharmacy Block 9',
  },
  {
    id: 'item-drafter-omega',
    title: 'Omega Mini Drafter + Drawing Sheet Container Tube',
    category: 'Drafters & Drawing Tools',
    mode: 'Exchange',
    priceInr: 85,
    originalPriceInr: 890,
    department: 'CIVIL · 2nd Year',
    condition: 'Precision Intact',
    seller: 'Divya S.',
    pickupSpot: 'Cafeteria',
  },
  {
    id: 'item-drafter-compass',
    title: 'Engineering Graphics French Curves, Scale & Compass Set',
    category: 'Drafters & Drawing Tools',
    mode: 'Buy',
    priceInr: 45,
    originalPriceInr: 360,
    department: 'MECH · 1st Year',
    condition: 'Complete Kit',
    seller: 'Sai Kiran P.',
    pickupSpot: 'CSE Department Block 4',
  },
  {
    id: 'item-pens-set',
    title: 'Technical Fineliner Pens & 0.5mm Mechanical Pencils Set',
    category: 'Pens & Pencils',
    mode: 'Donate',
    priceInr: 25,
    originalPriceInr: 210,
    department: 'EEE · 4th Year',
    condition: 'Unused Pack',
    seller: 'Rohan V.',
    pickupSpot: 'Near Boys Hostel',
  },
  {
    id: 'item-pens-gel',
    title: 'Blue & Black Gel Exam Pens Pack + Highlighter Set',
    category: 'Pens & Pencils',
    mode: 'Donate',
    priceInr: 20,
    originalPriceInr: 140,
    department: 'ECE · 2nd Year',
    condition: 'Sealed Pack',
    seller: 'Keerthi M.',
    pickupSpot: 'Near Girls Hostel',
  },
  {
    id: 'item-calc-casio',
    title: 'Casio fx-991ES Plus 2nd Edition Scientific Calculator',
    category: 'Calculators & Stationery',
    mode: 'Buy',
    priceInr: 95,
    originalPriceInr: 1295,
    department: 'CSE · 4th Year',
    condition: 'Exam Ready',
    seller: 'Ananya P.',
    pickupSpot: 'Pharmacy Block 9',
  },
  {
    id: 'item-stationery-records',
    title: '200-Page Graph & Lab Record Observation Notebooks (Pack of 3)',
    category: 'Calculators & Stationery',
    mode: 'Buy',
    priceInr: 30,
    originalPriceInr: 210,
    department: 'H&S · 1st Year',
    condition: 'Unused Bundle',
    seller: 'Teja R.',
    pickupSpot: 'Cafeteria',
  },
];

export function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function easeOutCubic(t: number): number {
  const x = clamp01(t);
  return 1 - Math.pow(1 - x, 3);
}

export function easeInOutCubic(t: number): number {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export function easeOutBack(t: number): number {
  const x = clamp01(t);
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

export function interpolateRange(
  timeSec: number,
  startSec: number,
  endSec: number,
  easing: (t: number) => number = easeOutCubic,
): number {
  if (endSec <= startSec) return timeSec >= endSec ? 1 : 0;
  return easing(clamp01((timeSec - startSec) / (endSec - startSec)));
}

export function getSceneAtTime(timeSec: number): SceneDefinition {
  const clamped = Math.max(0, Math.min(TOTAL_DURATION, Number.isFinite(timeSec) ? timeSec : 0));
  for (let i = 0; i < SCENES.length; i += 1) {
    const scene = SCENES[i];
    if (clamped < scene.endSec || i === SCENES.length - 1) {
      return scene;
    }
  }
  return SCENES[0];
}

export function getSceneProgress(timeSec: number): number {
  const scene = getSceneAtTime(timeSec);
  const duration = scene.endSec - scene.startSec;
  if (duration <= 0) return 0;
  return clamp01((timeSec - scene.startSec) / duration);
}

export function formatTimecode(seconds: number): string {
  const safe = Math.max(0, Math.min(TOTAL_DURATION, Number.isFinite(seconds) ? seconds : 0));
  const totalTenths = Math.round(safe * 10);
  const totalSeconds = Math.floor(totalTenths / 10);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const tenths = totalTenths % 10;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${tenths}`;
}

export function filterMarketplaceItems(
  items: readonly MarketplaceItem[],
  category: MarketplaceCategory,
  mode: ListingMode | 'All',
  query: string,
): MarketplaceItem[] {
  const q = query.trim().toLowerCase();
  return items.filter((item) => {
    if (category !== 'All' && item.category !== category) return false;
    if (mode !== 'All' && item.mode !== mode) return false;
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.department.toLowerCase().includes(q)
    );
  });
}

export const CAMPUS_PICKUP_SPOTS: readonly string[] = [
  'H&S Department Block 1',
  'ECE & EEE Department Block 2',
  'CSE Department Block 4',
  'Pharmacy Block 9',
  'Cafeteria',
  'Near Boys Hostel',
  'Near Girls Hostel',
];

export const PICKUP_TIME_SLOTS: readonly string[] = [
  'Morning Break · 10:45 AM',
  'Lunch Break · 1:15 PM',
  'After Labs · 4:15 PM',
];

export type PaymentMethod = 'UPI QR Code' | 'Cash on Pickup';

export const CAMPUSMART_UPI_ID = 'campusmart.vemu@upi';

export interface CampusOrder {
  orderId: string;
  studentName: string;
  rollNumber: string;
  phoneNumber: string;
  payerUpiNumber?: string;
  paymentMethod: PaymentMethod;
  pickupSpot: string;
  timeSlot: string;
  items: MarketplaceItem[];
  totalInr: number;
  createdAt: string;
  status: 'Confirmed' | 'Seller Notified' | 'Ready for Pickup';
}

export function calculateCartTotal(items: readonly MarketplaceItem[]): number {
  return items.reduce((sum, item) => sum + item.priceInr, 0);
}

export function normalizeIndianPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.slice(1);
  }
  return digits;
}

export function buildUpiPaymentUri(input: {
  amountInr: number;
  orderNote: string;
  upiId?: string;
}): string {
  const pa = encodeURIComponent(input.upiId ?? CAMPUSMART_UPI_ID);
  const pn = encodeURIComponent('CampusMart VEMU');
  const am = Math.max(0, Math.round(input.amountInr)).toString();
  const tn = encodeURIComponent(input.orderNote);
  return `upi://pay?pa=${pa}&pn=${pn}&am=${am}&cu=INR&tn=${tn}`;
}

export function validateAndCreateOrder(input: {
  studentName: string;
  rollNumber: string;
  phoneNumber: string;
  payerUpiNumber?: string;
  paymentMethod: PaymentMethod;
  pickupSpot: string;
  timeSlot: string;
  items: readonly MarketplaceItem[];
  orderNumberSeed?: number;
}): { ok: true; order: CampusOrder } | { ok: false; error: string } {
  const studentName = input.studentName.trim();
  const rollNumber = input.rollNumber.trim().toUpperCase();
  const phoneNumber = normalizeIndianPhone(input.phoneNumber);
  const payerUpiNumber = input.payerUpiNumber?.trim() || undefined;

  if (input.items.length === 0) {
    return { ok: false, error: 'Add at least one item to your Campus Cart before ordering.' };
  }
  if (studentName.length < 2) {
    return { ok: false, error: 'Enter your full student name to confirm campus pickup.' };
  }
  if (!/^[A-Z0-9]{6,14}$/.test(rollNumber)) {
    return {
      ok: false,
      error: 'Enter a valid VEMU Student Roll Number (e.g. 234M1A0542).',
    };
  }
  if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
    return {
      ok: false,
      error: 'Enter a valid 10-digit student phone number (e.g. 9876543210).',
    };
  }

  const code =
    typeof input.orderNumberSeed === 'number'
      ? String(input.orderNumberSeed).padStart(4, '0')
      : String(1000 + Math.floor(Math.random() * 9000));

  return {
    ok: true,
    order: {
      orderId: `VEMU-${code}`,
      studentName,
      rollNumber,
      phoneNumber,
      ...(payerUpiNumber ? { payerUpiNumber } : {}),
      paymentMethod: input.paymentMethod,
      pickupSpot: input.pickupSpot,
      timeSlot: input.timeSlot,
      items: [...input.items],
      totalInr: calculateCartTotal(input.items),
      createdAt: new Date().toISOString(),
      status: 'Confirmed',
    },
  };
}

export const VEMU_DEPARTMENTS: readonly string[] = [
  'CSE',
  'ECE',
  'EEE',
  'MECH',
  'CIVIL',
  'AI & ML',
  'MCA',
];

export const STUDY_YEARS: readonly string[] = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

export const BLOOD_GROUPS: readonly string[] = [
  'O+',
  'A+',
  'B+',
  'AB+',
  'O-',
  'A-',
  'B-',
  'AB-',
];

export type CampusStayOption = 'Day Scholar' | 'Boys Hostel' | 'Girls Hostel';

export const CAMPUS_STAY_OPTIONS: readonly CampusStayOption[] = [
  'Day Scholar',
  'Boys Hostel',
  'Girls Hostel',
];

export interface StudentRegistration {
  fullName: string;
  rollNumber: string;
  phoneNumber: string;
  department: string;
  yearOfStudy: string;
  upiNumber: string;
  bloodGroup?: string;
  campusStay?: CampusStayOption;
  photoDataUrl?: string;
  smsAlertsEnabled?: boolean;
  registeredAt: string;
}

export interface StudentIdCardMetadata {
  cardId: string;
  academicValidity: string;
  qrPayload: string;
}

export function buildStudentIdCardPayload(
  profile: StudentRegistration,
  baseUrl?: string,
): StudentIdCardMetadata {
  const roll = profile.rollNumber.trim().toUpperCase();
  const cardId = `VEMU-ID-${roll}`;
  const academicValidity = '2025–2027';
  const origin = (
    baseUrl && baseUrl.trim().length > 0 ? baseUrl : 'https://campusmart-vemu.app'
  ).replace(/\/+$/, '');
  const params = new URLSearchParams({
    verify: 'id',
    card: cardId,
    roll,
    name: profile.fullName,
    dept: profile.department,
    year: profile.yearOfStudy,
    phone: profile.phoneNumber,
    upi: profile.upiNumber,
    blood: profile.bloodGroup ?? 'O+',
    stay: profile.campusStay ?? 'Day Scholar',
  });
  const qrPayload = `${origin}/?${params.toString()}`;
  return {
    cardId,
    academicValidity,
    qrPayload,
  };
}

export type QrVerificationData =
  | {
      type: 'id';
      cardId: string;
      rollNumber: string;
      fullName: string;
      department: string;
      yearOfStudy: string;
      phoneNumber: string;
      upiNumber: string;
      bloodGroup: string;
      campusStay: string;
      academicValidity: string;
    }
  | {
      type: 'pass';
      passId: string;
      eventTitle: string;
      venue: string;
      schedule: string;
      passPriceInr: number;
      rollNumber: string;
      studentName: string;
      department: string;
      yearOfStudy: string;
    };

export function parseQrVerificationSearch(search: string): QrVerificationData | null {
  const query = search.startsWith('?') ? search.slice(1) : search;
  if (!query) return null;
  const params = new URLSearchParams(query);
  const mode = params.get('verify');

  if (mode === 'id') {
    const rollNumber = (params.get('roll') ?? '').trim().toUpperCase();
    const fullName = (params.get('name') ?? '').trim();
    if (!rollNumber || !fullName) return null;
    const cardId = (params.get('card') ?? `VEMU-ID-${rollNumber}`).trim();
    return {
      type: 'id',
      cardId,
      rollNumber,
      fullName,
      department: (params.get('dept') ?? 'CSE').trim(),
      yearOfStudy: (params.get('year') ?? '3rd Year').trim(),
      phoneNumber: (params.get('phone') ?? '').trim(),
      upiNumber: (params.get('upi') ?? '').trim(),
      bloodGroup: (params.get('blood') ?? 'O+').trim(),
      campusStay: (params.get('stay') ?? 'Day Scholar').trim(),
      academicValidity: '2025–2027',
    };
  }

  if (mode === 'pass') {
    const passId = (params.get('passId') ?? '').trim();
    const rollNumber = (params.get('roll') ?? '').trim().toUpperCase();
    const eventTitle = (params.get('title') ?? '').trim();
    if (!passId || !rollNumber || !eventTitle) return null;
    const rawPrice = Number(params.get('price') ?? '50');
    return {
      type: 'pass',
      passId,
      eventTitle,
      venue: (params.get('venue') ?? 'CSE Department Block 4').trim(),
      schedule: (params.get('schedule') ?? '').trim(),
      passPriceInr: Number.isFinite(rawPrice) ? rawPrice : 50,
      rollNumber,
      studentName: (params.get('name') ?? '').trim(),
      department: (params.get('dept') ?? 'CSE').trim(),
      yearOfStudy: (params.get('year') ?? '3rd Year').trim(),
    };
  }

  return null;
}

export function validateUpiIdentifier(raw: string): { ok: true; normalized: string } | { ok: false } {
  const trimmed = raw.trim();
  const digits = normalizeIndianPhone(trimmed);
  if (/^[6-9]\d{9}$/.test(digits) && /^\+?[\d\s-]+$/.test(trimmed)) {
    return { ok: true, normalized: digits };
  }
  if (/^[a-zA-Z0-9._-]{2,40}@[a-zA-Z0-9]{2,20}$/.test(trimmed)) {
    return { ok: true, normalized: trimmed.toLowerCase() };
  }
  return { ok: false };
}

export function validateAndRegisterStudent(input: {
  fullName: string;
  rollNumber: string;
  phoneNumber: string;
  department: string;
  yearOfStudy: string;
  upiNumber: string;
  bloodGroup?: string;
  campusStay?: CampusStayOption;
  photoDataUrl?: string;
  smsAlertsEnabled?: boolean;
}): { ok: true; profile: StudentRegistration } | { ok: false; error: string } {
  const fullName = input.fullName.trim();
  const rollNumber = input.rollNumber.trim().toUpperCase();
  const phoneNumber = normalizeIndianPhone(input.phoneNumber);
  const upiCheck = validateUpiIdentifier(input.upiNumber);
  const bloodGroup = input.bloodGroup?.trim() || undefined;
  const campusStay = input.campusStay || undefined;
  const photoDataUrl = input.photoDataUrl?.trim() || undefined;
  const smsAlertsEnabled = input.smsAlertsEnabled ?? true;

  if (fullName.length < 2) {
    return { ok: false, error: 'Enter your full name to register.' };
  }
  if (!/^[A-Z0-9]{6,14}$/.test(rollNumber)) {
    return { ok: false, error: 'Enter a valid VEMU Roll Number (e.g. 234M1A0542).' };
  }
  if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
    return { ok: false, error: 'Enter a valid 10-digit student phone number.' };
  }
  if (!upiCheck.ok) {
    return {
      ok: false,
      error: 'Enter a valid Payment UPI Number (10 digits) or UPI ID (e.g. name@ybl).',
    };
  }

  return {
    ok: true,
    profile: {
      fullName,
      rollNumber,
      phoneNumber,
      department: input.department,
      yearOfStudy: input.yearOfStudy,
      upiNumber: upiCheck.normalized,
      ...(bloodGroup ? { bloodGroup } : {}),
      ...(campusStay ? { campusStay } : {}),
      ...(photoDataUrl ? { photoDataUrl } : {}),
      smsAlertsEnabled,
      registeredAt: new Date().toISOString(),
    },
  };
}

export function buildSmsUri(phoneNumber: string, message: string): string {
  const digits = normalizeIndianPhone(phoneNumber);
  const e164 = /^[6-9]\d{9}$/.test(digits) ? `+91${digits}` : phoneNumber.trim();
  return `sms:${e164}?body=${encodeURIComponent(message.trim())}`;
}

export function buildOrderSmsMessage(order: CampusOrder): string {
  return `CampusMart VEMU Order #${order.orderId} (${order.paymentMethod}): ₹${order.totalInr} for ${order.items.length} item(s). Pickup: ${order.pickupSpot} (${order.timeSlot}). Student: ${order.studentName} (${order.rollNumber}).`;
}

export function buildEventPassSmsMessage(pass: EventStudentPass): string {
  return `VEMU Event Pass ${pass.passId}: ${pass.eventTitle} · ${pass.schedule} at ${pass.venue}. Fee ₹${pass.passPriceInr} (${pass.paymentMethod}). Holder: ${pass.studentName} (${pass.rollNumber}).`;
}

export function buildIdCardSmsMessage(profile: StudentRegistration, verifyUrl?: string): string {
  const cardId = `VEMU-ID-${profile.rollNumber.trim().toUpperCase()}`;
  const base = `VEMU Student ID ${cardId}: ${profile.fullName} (${profile.rollNumber}) · ${profile.department} ${profile.yearOfStudy}. UPI: ${profile.upiNumber}.`;
  return verifyUrl ? `${base} Verify: ${verifyUrl}` : base;
}

export function buildSellerListingSmsMessage(item: MarketplaceItem): string {
  return `Hi ${item.seller}, I saw "${item.title}" (₹${item.priceInr}) on CampusMart VEMU for pickup at ${item.pickupSpot}. Is it still available?`;
}

export const ITEM_CONDITIONS: readonly string[] = [
  'Unused / Brand New',
  'Like New',
  'Good Condition',
  'Verified Working',
  'Exam Ready',
];

export function validateAndCreateListing(input: {
  title: string;
  category: Exclude<MarketplaceCategory, 'All'>;
  mode: ListingMode;
  priceInr: number;
  department: string;
  condition: string;
  seller: string;
  pickupSpot: string;
  sellerPhone: string;
  sellerUpiNumber: string;
  idSeed?: string;
}): { ok: true; item: MarketplaceItem } | { ok: false; error: string } {
  const title = input.title.trim();
  const seller = input.seller.trim();
  const department = input.department.trim();
  const condition = input.condition.trim();
  const sellerPhone = normalizeIndianPhone(input.sellerPhone);
  const upiCheck = validateUpiIdentifier(input.sellerUpiNumber);
  const priceInr = Math.round(Number(input.priceInr));

  if (title.length < 3) {
    return { ok: false, error: 'Enter a descriptive item title (at least 3 characters).' };
  }
  if (
    !Number.isFinite(priceInr) ||
    priceInr < MIN_LISTING_PRICE_INR ||
    priceInr > MAX_LISTING_PRICE_INR
  ) {
    return {
      ok: false,
      error: `CampusMart item prices must stay between ₹${MIN_LISTING_PRICE_INR} and ₹${MAX_LISTING_PRICE_INR}.`,
    };
  }
  if (condition.length < 2) {
    return { ok: false, error: 'Select or enter the condition of your item.' };
  }
  if (seller.length < 2) {
    return { ok: false, error: 'Enter your student name as the seller.' };
  }
  if (department.length < 2) {
    return { ok: false, error: 'Enter your department and year (e.g. CSE · 3rd Year).' };
  }
  if (!/^[6-9]\d{9}$/.test(sellerPhone)) {
    return { ok: false, error: 'Enter a valid 10-digit seller phone number.' };
  }
  if (!upiCheck.ok) {
    return {
      ok: false,
      error: 'Enter a valid Payment UPI Number (10 digits) or UPI ID (e.g. name@ybl) to receive payments.',
    };
  }

  const idSuffix = input.idSeed ?? `${Date.now().toString(36)}-${Math.floor(Math.random() * 900 + 100)}`;

  return {
    ok: true,
    item: {
      id: `user-item-${idSuffix}`,
      title,
      category: input.category,
      mode: input.mode,
      priceInr,
      originalPriceInr: priceInr * 6,
      department,
      condition,
      seller,
      pickupSpot: input.pickupSpot,
      sellerPhone,
      sellerUpiNumber: upiCheck.normalized,
      isUserListing: true,
    },
  };
}

export type EventCategory =
  | 'All'
  | 'Technical'
  | 'Workshop'
  | 'Cultural'
  | 'Symposium'
  | 'Sports'
  | 'Campus Club';

export interface CollegeEvent {
  id: string;
  title: string;
  category: Exclude<EventCategory, 'All'>;
  venue: string;
  schedule: string;
  organizer: string;
  passPriceInr: number;
  spotsAvailable: number;
  organizerPhone?: string;
  organizerUpiNumber?: string;
  isCustomEvent?: boolean;
}

export const EVENT_CATEGORIES: readonly EventCategory[] = [
  'All',
  'Technical',
  'Workshop',
  'Cultural',
  'Symposium',
  'Sports',
  'Campus Club',
];

export const VEMU_COLLEGE_EVENTS: readonly CollegeEvent[] = [
  {
    id: 'event-techfest-hack',
    title: 'VEMU TechFest — Hackathon & Coding Sprint',
    category: 'Technical',
    venue: 'CSE Department Block 4',
    schedule: 'Fri · 9:30 AM – 4:30 PM',
    organizer: 'Dept. of CSE & AI&ML',
    passPriceInr: 50,
    spotsAvailable: 120,
  },
  {
    id: 'event-circuitronix',
    title: 'Circuitronix Robotics & Embedded IoT Expo',
    category: 'Workshop',
    venue: 'ECE & EEE Department Block 2',
    schedule: 'Sat · 10:00 AM – 3:00 PM',
    organizer: 'Dept. of ECE & EEE',
    passPriceInr: 40,
    spotsAvailable: 85,
  },
  {
    id: 'event-cultural-night',
    title: 'VEMU Annual Cultural Fest & Music Night',
    category: 'Cultural',
    venue: 'H&S Department Block 1',
    schedule: 'Sat · 5:30 PM – 9:00 PM',
    organizer: 'Student Cultural Council',
    passPriceInr: 80,
    spotsAvailable: 300,
  },
  {
    id: 'event-pharmanova',
    title: 'PharmaNova Science & Innovation Symposium',
    category: 'Symposium',
    venue: 'Pharmacy Block 9',
    schedule: 'Thu · 10:00 AM – 2:00 PM',
    organizer: 'VEMU Pharmacy Wing',
    passPriceInr: 30,
    spotsAvailable: 90,
  },
  {
    id: 'event-sports-meet',
    title: 'Inter-Department Cricket & Athletics Meet',
    category: 'Sports',
    venue: 'Near Boys Hostel',
    schedule: 'Sun · 8:00 AM – 5:00 PM',
    organizer: 'VEMU Sports Club',
    passPriceInr: 25,
    spotsAvailable: 160,
  },
  {
    id: 'event-startup-cafe',
    title: 'Campus Founders & Placement Prep Meetup',
    category: 'Campus Club',
    venue: 'Cafeteria',
    schedule: 'Wed · 2:00 PM – 4:30 PM',
    organizer: 'VEMU Entrepreneurship Cell',
    passPriceInr: 20,
    spotsAvailable: 60,
  },
];

export type EventPassPaymentMethod = 'UPI QR Code' | 'Pay at Event Desk';

export interface EventStudentPass {
  passId: string;
  eventId: string;
  eventTitle: string;
  venue: string;
  schedule: string;
  passPriceInr: number;
  studentName: string;
  rollNumber: string;
  department: string;
  yearOfStudy: string;
  phoneNumber: string;
  upiNumber: string;
  paymentMethod: EventPassPaymentMethod;
  issuedAt: string;
  qrPayload: string;
}

export function validateAndIssueEventPass(input: {
  event: CollegeEvent;
  studentName: string;
  rollNumber: string;
  department: string;
  yearOfStudy: string;
  phoneNumber: string;
  upiNumber: string;
  paymentMethod: EventPassPaymentMethod;
  existingPasses?: readonly EventStudentPass[];
  passCodeSeed?: number;
  baseUrl?: string;
}): { ok: true; pass: EventStudentPass } | { ok: false; error: string } {
  const studentName = input.studentName.trim();
  const rollNumber = input.rollNumber.trim().toUpperCase();
  const phoneNumber = normalizeIndianPhone(input.phoneNumber);
  const upiCheck = validateUpiIdentifier(input.upiNumber);

  if (studentName.length < 2) {
    return { ok: false, error: 'Enter your full student name to issue an event pass.' };
  }
  if (!/^[A-Z0-9]{6,14}$/.test(rollNumber)) {
    return { ok: false, error: 'Enter a valid VEMU Roll Number (e.g. 234M1A0542).' };
  }
  if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
    return { ok: false, error: 'Enter a valid 10-digit student phone number.' };
  }
  if (!upiCheck.ok) {
    return {
      ok: false,
      error: 'Enter a valid Payment UPI Number (10 digits) or UPI ID (e.g. name@ybl).',
    };
  }

  const alreadyIssued = input.existingPasses?.some(
    (p) => p.eventId === input.event.id && p.rollNumber === rollNumber,
  );
  if (alreadyIssued) {
    return {
      ok: false,
      error: `A student pass for "${input.event.title}" is already issued for ${rollNumber}.`,
    };
  }

  const code =
    typeof input.passCodeSeed === 'number'
      ? String(input.passCodeSeed).padStart(4, '0')
      : String(1000 + Math.floor(Math.random() * 9000));
  const passId = `VEMU-PASS-${code}`;
  const origin = (
    input.baseUrl && input.baseUrl.trim().length > 0
      ? input.baseUrl
      : 'https://campusmart-vemu.app'
  ).replace(/\/+$/, '');
  const params = new URLSearchParams({
    verify: 'pass',
    passId,
    title: input.event.title,
    venue: input.event.venue,
    schedule: input.event.schedule,
    price: String(input.event.passPriceInr),
    roll: rollNumber,
    name: studentName,
    dept: input.department,
    year: input.yearOfStudy,
  });
  const qrPayload = `${origin}/?${params.toString()}`;

  return {
    ok: true,
    pass: {
      passId,
      eventId: input.event.id,
      eventTitle: input.event.title,
      venue: input.event.venue,
      schedule: input.event.schedule,
      passPriceInr: input.event.passPriceInr,
      studentName,
      rollNumber,
      department: input.department,
      yearOfStudy: input.yearOfStudy,
      phoneNumber,
      upiNumber: upiCheck.normalized,
      paymentMethod: input.paymentMethod,
      issuedAt: new Date().toISOString(),
      qrPayload,
    },
  };
}

export function validateAndCreateCollegeEvent(input: {
  title: string;
  category: Exclude<EventCategory, 'All'>;
  venue: string;
  schedule: string;
  organizer: string;
  passPriceInr: number;
  spotsAvailable: number;
  organizerPhone: string;
  organizerUpiNumber: string;
  idSeed?: string;
}): { ok: true; event: CollegeEvent } | { ok: false; error: string } {
  const title = input.title.trim();
  const schedule = input.schedule.trim();
  const organizer = input.organizer.trim();
  const passPriceInr = Math.round(Number(input.passPriceInr));
  const spotsAvailable = Math.round(Number(input.spotsAvailable));
  const organizerPhone = normalizeIndianPhone(input.organizerPhone);
  const upiCheck = validateUpiIdentifier(input.organizerUpiNumber);

  if (title.length < 3) {
    return { ok: false, error: 'Enter a clear college event title (at least 3 characters).' };
  }
  if (schedule.length < 3) {
    return { ok: false, error: 'Enter the event date and time (e.g. Mon · 2:00 PM – 5:00 PM).' };
  }
  if (organizer.length < 2) {
    return { ok: false, error: 'Enter the organizing department or student club name.' };
  }
  if (
    !Number.isFinite(passPriceInr) ||
    passPriceInr < MIN_LISTING_PRICE_INR ||
    passPriceInr > MAX_LISTING_PRICE_INR
  ) {
    return {
      ok: false,
      error: `Event pass price must stay between ₹${MIN_LISTING_PRICE_INR} and ₹${MAX_LISTING_PRICE_INR}.`,
    };
  }
  if (!Number.isFinite(spotsAvailable) || spotsAvailable < 10 || spotsAvailable > 1000) {
    return { ok: false, error: 'Enter available passes between 10 and 1000.' };
  }
  if (!/^[6-9]\d{9}$/.test(organizerPhone)) {
    return { ok: false, error: 'Enter a valid 10-digit organizer phone number.' };
  }
  if (!upiCheck.ok) {
    return {
      ok: false,
      error: 'Enter a valid organizer Payment UPI Number (10 digits) or UPI ID (e.g. club@ybl).',
    };
  }

  const suffix = input.idSeed ?? `${Date.now().toString(36)}-${Math.floor(Math.random() * 900 + 100)}`;

  return {
    ok: true,
    event: {
      id: `custom-event-${suffix}`,
      title,
      category: input.category,
      venue: input.venue,
      schedule,
      organizer,
      passPriceInr,
      spotsAvailable,
      organizerPhone,
      organizerUpiNumber: upiCheck.normalized,
      isCustomEvent: true,
    },
  };
}

export type MobilePlatform = 'android' | 'ios' | 'desktop';

export function detectMobilePlatform(userAgent: string, maxTouchPoints = 0): MobilePlatform {
  const ua = userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) {
    return 'ios';
  }
  if (/macintosh/.test(ua) && maxTouchPoints > 1) {
    return 'ios';
  }
  if (/android/.test(ua)) {
    return 'android';
  }
  return 'desktop';
}

export function buildMobileAppShareUrl(baseOrigin?: string): string {
  if (baseOrigin && /^https?:\/\//i.test(baseOrigin.trim())) {
    return `${baseOrigin.trim().replace(/\/+$/, '')}/`;
  }
  return 'https://campusmart-vemu.app/';
}

export function buildMobileInstallSmsMessage(appUrl: string): string {
  return `CampusMart VEMU Student App — open on Android (Chrome > Install app) or iPhone (Safari > Share > Add to Home Screen): ${appUrl}`;
}
