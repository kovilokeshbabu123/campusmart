import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BLOOD_GROUPS,
  BRAND_ASSETS,
  CAMPUS_PICKUP_SPOTS,
  CAMPUS_STAY_OPTIONS,
  ITEM_CONDITIONS,
  MARKETPLACE_ITEMS,
  PICKUP_TIME_SLOTS,
  SCENES,
  STUDY_YEARS,
  TOTAL_DURATION,
  VEMU_COLLEGE_EVENTS,
  VEMU_DEPARTMENTS,
  buildEventPassSmsMessage,
  buildIdCardSmsMessage,
  buildMobileAppShareUrl,
  buildMobileInstallSmsMessage,
  buildOrderSmsMessage,
  buildSellerListingSmsMessage,
  buildSmsUri,
  buildStudentIdCardPayload,
  buildUpiPaymentUri,
  calculateCartTotal,
  clamp01,
  detectMobilePlatform,
  filterMarketplaceItems,
  formatTimecode,
  getSceneAtTime,
  getSceneProgress,
  interpolateRange,
  normalizeIndianPhone,
  parseQrVerificationSearch,
  validateAndCreateCollegeEvent,
  validateAndCreateListing,
  validateAndCreateOrder,
  validateAndIssueEventPass,
  validateAndRegisterStudent,
  validateUpiIdentifier,
} from './timeline';

test('total commercial duration stays within 45–60 seconds', () => {
  assert.ok(TOTAL_DURATION >= 45 && TOTAL_DURATION <= 60);
  assert.equal(SCENES.length, 7);
});

test('scenes are strictly contiguous from 0 to TOTAL_DURATION without gaps', () => {
  assert.equal(SCENES[0].startSec, 0);
  for (let i = 0; i < SCENES.length; i += 1) {
    assert.equal(SCENES[i].number, i + 1);
    assert.ok(SCENES[i].endSec > SCENES[i].startSec);
    if (i > 0) {
      assert.equal(SCENES[i].startSec, SCENES[i - 1].endSec);
    }
  }
  assert.equal(SCENES[SCENES.length - 1].endSec, TOTAL_DURATION);
});

test('getSceneAtTime and getSceneProgress resolve exact boundaries', () => {
  assert.equal(getSceneAtTime(0).id, 'scene-1');
  assert.equal(getSceneAtTime(7.99).id, 'scene-1');
  assert.equal(getSceneAtTime(8).id, 'scene-2');
  assert.equal(getSceneAtTime(16).id, 'scene-3');
  assert.equal(getSceneAtTime(23).id, 'scene-4');
  assert.equal(getSceneAtTime(32).id, 'scene-5');
  assert.equal(getSceneAtTime(39).id, 'scene-6');
  assert.equal(getSceneAtTime(46).id, 'scene-7');
  assert.equal(getSceneAtTime(TOTAL_DURATION).id, 'scene-7');

  assert.equal(getSceneProgress(0), 0);
  assert.equal(getSceneProgress(4), 0.5);
  assert.equal(getSceneProgress(TOTAL_DURATION), 1);
});

test('required copy and official reference assets are preserved verbatim', () => {
  assert.equal(SCENES[0].headline, 'VEMU INSTITUTE OF TECHNOLOGY');
  assert.equal(SCENES[1].headline, 'Everything a student needs, right on campus.');
  assert.equal(SCENES[2].headline, 'INTRODUCING CAMPUSMART');
  assert.equal(SCENES[2].subtitle, 'Your Campus. Your Marketplace.');
  assert.equal(SCENES[3].headline, 'BUY SMART. SELL EASY.');
  assert.equal(SCENES[4].headline, 'EXCHANGE MORE. SHARE MORE.');
  assert.equal(SCENES[6].headline, 'CAMPUSMART');
  assert.equal(SCENES[6].subtitle, 'BUY SMART. SELL EASY. SHARE MORE.');

  assert.equal(
    BRAND_ASSETS.campusPhoto,
    '/assets/aistudio/Screenshot_2026-11-15_204909_328cd7ff.png',
  );
  assert.equal(
    BRAND_ASSETS.officialEmblem,
    '/assets/aistudio/Screenshot_2026-11-15_205309_ebc4847c.png',
  );
  assert.equal(
    BRAND_ASSETS.officialBranding,
    '/assets/aistudio/Screenshot_2026-11-15_205327_bfd783fa.png',
  );
});

test('math and formatting helpers handle edge values cleanly', () => {
  assert.equal(clamp01(-0.5), 0);
  assert.equal(clamp01(1.5), 1);
  assert.equal(clamp01(Number.NaN), 0);
  assert.equal(interpolateRange(5, 0, 10, (x) => x), 0.5);
  assert.equal(formatTimecode(0), '00:00.0');
  assert.equal(formatTimecode(16.4), '00:16.4');
  assert.equal(formatTimecode(54), '00:54.0');
});

test('marketplace catalog covers all 6 required student categories and keeps prices in 20–100 range', () => {
  const categories = new Set(MARKETPLACE_ITEMS.map((i) => i.category));
  assert.equal(categories.size, 6);
  assert.equal(MARKETPLACE_ITEMS.length, 12);
  for (const item of MARKETPLACE_ITEMS) {
    assert.ok(
      item.priceInr >= 20 && item.priceInr <= 100,
      `${item.title} price ${item.priceInr} out of 20-100`,
    );
  }
  assert.equal(filterMarketplaceItems(MARKETPLACE_ITEMS, 'Lab Aprons', 'All', '').length, 2);
  assert.equal(filterMarketplaceItems(MARKETPLACE_ITEMS, 'All', 'Donate', '').length, 2);
  assert.equal(filterMarketplaceItems(MARKETPLACE_ITEMS, 'All', 'All', 'casio').length, 1);
});

test('cart total, phone normalization, UPI URI, and campus order validation work cleanly', () => {
  const selected = MARKETPLACE_ITEMS.slice(0, 2);
  assert.equal(calculateCartTotal(selected), 110);
  assert.equal(normalizeIndianPhone('+91 98765-43210'), '9876543210');

  const upi = buildUpiPaymentUri({ amountInr: 95, orderNote: 'VEMU Order 4082' });
  assert.ok(upi.startsWith('upi://pay?pa=campusmart.vemu%40upi'));
  assert.ok(upi.includes('am=95'));

  const missingPhone = validateAndCreateOrder({
    studentName: 'Lokesh Babu',
    rollNumber: '234M1A0542',
    phoneNumber: '1234',
    paymentMethod: 'UPI QR Code',
    pickupSpot: CAMPUS_PICKUP_SPOTS[0],
    timeSlot: PICKUP_TIME_SLOTS[0],
    items: selected,
  });
  assert.equal(missingPhone.ok, false);

  const valid = validateAndCreateOrder({
    studentName: 'Lokesh Babu',
    rollNumber: '234m1a0542',
    phoneNumber: '+91 98765 43210',
    paymentMethod: 'UPI QR Code',
    pickupSpot: CAMPUS_PICKUP_SPOTS[0],
    timeSlot: PICKUP_TIME_SLOTS[1],
    items: selected,
    orderNumberSeed: 4082,
  });
  assert.equal(valid.ok, true);
  if (valid.ok) {
    assert.equal(valid.order.orderId, 'VEMU-4082');
    assert.equal(valid.order.rollNumber, '234M1A0542');
    assert.equal(valid.order.phoneNumber, '9876543210');
    assert.equal(valid.order.paymentMethod, 'UPI QR Code');
    assert.equal(valid.order.totalInr, 110);
  }
});

test('student registration validates roll number, phone, and payment UPI number or UPI ID', () => {
  assert.equal(validateUpiIdentifier('9876543210').ok, true);
  assert.equal(validateUpiIdentifier('lokesh.vemu@ybl').ok, true);
  assert.equal(validateUpiIdentifier('bad-upi').ok, false);

  const badUpi = validateAndRegisterStudent({
    fullName: 'Lokesh Babu',
    rollNumber: '234M1A0542',
    phoneNumber: '9876543210',
    department: VEMU_DEPARTMENTS[0],
    yearOfStudy: STUDY_YEARS[2],
    upiNumber: '123',
  });
  assert.equal(badUpi.ok, false);

  const good = validateAndRegisterStudent({
    fullName: 'Lokesh Babu',
    rollNumber: '234m1a0542',
    phoneNumber: '9876543210',
    department: VEMU_DEPARTMENTS[0],
    yearOfStudy: STUDY_YEARS[2],
    upiNumber: '9876543210@ybl',
  });
  assert.equal(good.ok, true);
  if (good.ok) {
    assert.equal(good.profile.rollNumber, '234M1A0542');
    assert.equal(good.profile.upiNumber, '9876543210@ybl');
  }
});

test('sell listing validates ₹20–₹100 price bounds, seller phone, and Payment UPI', () => {
  const tooHigh = validateAndCreateListing({
    title: 'Engineering Physics Lab Manual',
    category: 'Engineering Books',
    mode: 'Buy',
    priceInr: 250,
    department: 'CSE · 3rd Year',
    condition: ITEM_CONDITIONS[1],
    seller: 'Lokesh Babu',
    pickupSpot: CAMPUS_PICKUP_SPOTS[1],
    sellerPhone: '9876543210',
    sellerUpiNumber: '9876543210@ybl',
  });
  assert.equal(tooHigh.ok, false);

  const tooLow = validateAndCreateListing({
    title: 'Engineering Physics Lab Manual',
    category: 'Engineering Books',
    mode: 'Buy',
    priceInr: 15,
    department: 'CSE · 3rd Year',
    condition: ITEM_CONDITIONS[1],
    seller: 'Lokesh Babu',
    pickupSpot: CAMPUS_PICKUP_SPOTS[1],
    sellerPhone: '9876543210',
    sellerUpiNumber: '9876543210@ybl',
  });
  assert.equal(tooLow.ok, false);

  const valid = validateAndCreateListing({
    title: 'Engineering Physics Lab Manual',
    category: 'Engineering Books',
    mode: 'Buy',
    priceInr: 25,
    department: 'CSE · 3rd Year',
    condition: ITEM_CONDITIONS[1],
    seller: 'Lokesh Babu',
    pickupSpot: CAMPUS_PICKUP_SPOTS[1],
    sellerPhone: '+91 98765 43210',
    sellerUpiNumber: '9876543210@ybl',
    idSeed: 'test1',
  });
  assert.equal(valid.ok, true);
  if (valid.ok) {
    assert.equal(valid.item.id, 'user-item-test1');
    assert.equal(valid.item.priceInr, 25);
    assert.equal(valid.item.sellerPhone, '9876543210');
    assert.equal(valid.item.sellerUpiNumber, '9876543210@ybl');
    assert.equal(valid.item.isUserListing, true);
  }
});

test('campus pickup points include all 7 VEMU blocks, cafeteria, and hostels', () => {
  assert.deepEqual(CAMPUS_PICKUP_SPOTS, [
    'H&S Department Block 1',
    'ECE & EEE Department Block 2',
    'CSE Department Block 4',
    'Pharmacy Block 9',
    'Cafeteria',
    'Near Boys Hostel',
    'Near Girls Hostel',
  ]);
  for (const item of MARKETPLACE_ITEMS) {
    assert.ok(
      CAMPUS_PICKUP_SPOTS.includes(item.pickupSpot),
      `${item.title} pickupSpot "${item.pickupSpot}" missing from CAMPUS_PICKUP_SPOTS`,
    );
  }
});

test('college events keep pass prices in ₹20–₹100 and issue verified student passes', () => {
  assert.equal(VEMU_COLLEGE_EVENTS.length, 6);
  for (const evt of VEMU_COLLEGE_EVENTS) {
    assert.ok(evt.passPriceInr >= 20 && evt.passPriceInr <= 100);
    assert.ok(CAMPUS_PICKUP_SPOTS.includes(evt.venue));
  }

  const badUpi = validateAndIssueEventPass({
    event: VEMU_COLLEGE_EVENTS[0],
    studentName: 'Lokesh Babu',
    rollNumber: '234M1A0542',
    department: VEMU_DEPARTMENTS[0],
    yearOfStudy: STUDY_YEARS[2],
    phoneNumber: '9876543210',
    upiNumber: 'invalid',
    paymentMethod: 'UPI QR Code',
  });
  assert.equal(badUpi.ok, false);

  const valid = validateAndIssueEventPass({
    event: VEMU_COLLEGE_EVENTS[0],
    studentName: 'Lokesh Babu',
    rollNumber: '234m1a0542',
    department: VEMU_DEPARTMENTS[0],
    yearOfStudy: STUDY_YEARS[2],
    phoneNumber: '+91 98765 43210',
    upiNumber: '9876543210@ybl',
    paymentMethod: 'UPI QR Code',
    passCodeSeed: 4821,
  });
  assert.equal(valid.ok, true);
  if (valid.ok) {
    assert.equal(valid.pass.passId, 'VEMU-PASS-4821');
    assert.equal(valid.pass.rollNumber, '234M1A0542');
    assert.equal(valid.pass.upiNumber, '9876543210@ybl');
    assert.ok(valid.pass.qrPayload.startsWith('https://'));
    assert.ok(valid.pass.qrPayload.includes('VEMU-PASS-4821'));
    const parsedPass = parseQrVerificationSearch(new URL(valid.pass.qrPayload).search);
    assert.equal(parsedPass?.type, 'pass');
    if (parsedPass?.type === 'pass') {
      assert.equal(parsedPass.passId, 'VEMU-PASS-4821');
      assert.equal(parsedPass.rollNumber, '234M1A0542');
    }

    const duplicate = validateAndIssueEventPass({
      event: VEMU_COLLEGE_EVENTS[0],
      studentName: 'Lokesh Babu',
      rollNumber: '234M1A0542',
      department: VEMU_DEPARTMENTS[0],
      yearOfStudy: STUDY_YEARS[2],
      phoneNumber: '9876543210',
      upiNumber: '9876543210@ybl',
      paymentMethod: 'UPI QR Code',
      existingPasses: [valid.pass],
    });
    assert.equal(duplicate.ok, false);
  }
});

test('add college event validates ₹20–₹100 pass price, seats, phone, and Payment UPI', () => {
  const badPrice = validateAndCreateCollegeEvent({
    title: 'AI & Prompt Engineering Bootcamp',
    category: 'Workshop',
    venue: CAMPUS_PICKUP_SPOTS[2],
    schedule: 'Mon · 2:00 PM – 5:00 PM',
    organizer: 'VEMU AI Club',
    passPriceInr: 150,
    spotsAvailable: 80,
    organizerPhone: '9876543210',
    organizerUpiNumber: '9876543210@ybl',
  });
  assert.equal(badPrice.ok, false);

  const valid = validateAndCreateCollegeEvent({
    title: 'AI & Prompt Engineering Bootcamp',
    category: 'Workshop',
    venue: CAMPUS_PICKUP_SPOTS[2],
    schedule: 'Mon · 2:00 PM – 5:00 PM',
    organizer: 'VEMU AI Club',
    passPriceInr: 60,
    spotsAvailable: 80,
    organizerPhone: '+91 98765 43210',
    organizerUpiNumber: '9876543210@ybl',
    idSeed: 'ai1',
  });
  assert.equal(valid.ok, true);
  if (valid.ok) {
    assert.equal(valid.event.id, 'custom-event-ai1');
    assert.equal(valid.event.passPriceInr, 60);
    assert.equal(valid.event.organizerPhone, '9876543210');
    assert.equal(valid.event.organizerUpiNumber, '9876543210@ybl');
    assert.equal(valid.event.isCustomEvent, true);
  }
});

test('student ID card payload builds deterministic card ID and QR data with blood group and campus stay', () => {
  const res = validateAndRegisterStudent({
    fullName: 'Lokesh Babu',
    rollNumber: '234m1a0542',
    phoneNumber: '+91 98765 43210',
    department: VEMU_DEPARTMENTS[0],
    yearOfStudy: STUDY_YEARS[2],
    upiNumber: '9876543210@ybl',
    bloodGroup: BLOOD_GROUPS[0],
    campusStay: CAMPUS_STAY_OPTIONS[1],
  });
  assert.equal(res.ok, true);
  if (res.ok) {
    assert.equal(res.profile.bloodGroup, 'O+');
    assert.equal(res.profile.campusStay, 'Boys Hostel');
    const idMeta = buildStudentIdCardPayload(res.profile, 'https://vemu.campusmart.test');
    assert.equal(idMeta.cardId, 'VEMU-ID-234M1A0542');
    assert.equal(idMeta.academicValidity, '2025–2027');
    assert.ok(idMeta.qrPayload.startsWith('https://vemu.campusmart.test/?verify=id'));

    const parsedId = parseQrVerificationSearch(new URL(idMeta.qrPayload).search);
    assert.equal(parsedId?.type, 'id');
    if (parsedId?.type === 'id') {
      assert.equal(parsedId.cardId, 'VEMU-ID-234M1A0542');
      assert.equal(parsedId.rollNumber, '234M1A0542');
      assert.equal(parsedId.fullName, 'Lokesh Babu');
      assert.equal(parsedId.upiNumber, '9876543210@ybl');
      assert.equal(parsedId.bloodGroup, 'O+');
      assert.equal(parsedId.campusStay, 'Boys Hostel');
    }
  }
});

test('mobile SMS linking and sms: deep-link builders format +91 numbers and receipts cleanly', () => {
  const smsHref = buildSmsUri('+91 98765 43210', 'VEMU Order #VEMU-4082 confirmed');
  assert.ok(smsHref.startsWith('sms:+919876543210?body='));
  assert.ok(decodeURIComponent(smsHref).includes('VEMU-4082'));

  const studentRes = validateAndRegisterStudent({
    fullName: 'Lokesh Babu',
    rollNumber: '234M1A0542',
    phoneNumber: '9876543210',
    department: VEMU_DEPARTMENTS[0],
    yearOfStudy: STUDY_YEARS[2],
    upiNumber: '9876543210@ybl',
    smsAlertsEnabled: true,
  });
  assert.equal(studentRes.ok, true);
  if (studentRes.ok) {
    assert.equal(studentRes.profile.smsAlertsEnabled, true);
    const idSms = buildIdCardSmsMessage(studentRes.profile, 'https://vemu.campusmart.test/?verify=id');
    assert.ok(idSms.includes('VEMU-ID-234M1A0542'));
    assert.ok(idSms.includes('https://vemu.campusmart.test/?verify=id'));
  }

  const orderRes = validateAndCreateOrder({
    studentName: 'Lokesh Babu',
    rollNumber: '234M1A0542',
    phoneNumber: '9876543210',
    paymentMethod: 'UPI QR Code',
    pickupSpot: CAMPUS_PICKUP_SPOTS[2],
    timeSlot: PICKUP_TIME_SLOTS[0],
    items: [MARKETPLACE_ITEMS[0]],
    orderNumberSeed: 5120,
  });
  assert.equal(orderRes.ok, true);
  if (orderRes.ok) {
    const orderSms = buildOrderSmsMessage(orderRes.order);
    assert.ok(orderSms.includes('#VEMU-5120'));
    assert.ok(orderSms.includes('CSE Department Block 4'));
  }

  const passRes = validateAndIssueEventPass({
    event: VEMU_COLLEGE_EVENTS[0],
    studentName: 'Lokesh Babu',
    rollNumber: '234M1A0542',
    department: VEMU_DEPARTMENTS[0],
    yearOfStudy: STUDY_YEARS[2],
    phoneNumber: '9876543210',
    upiNumber: '9876543210@ybl',
    paymentMethod: 'UPI QR Code',
    passCodeSeed: 9011,
  });
  assert.equal(passRes.ok, true);
  if (passRes.ok) {
    const passSms = buildEventPassSmsMessage(passRes.pass);
    assert.ok(passSms.includes('VEMU-PASS-9011'));
    assert.ok(passSms.includes('VEMU TechFest'));
  }

  const sellerSms = buildSellerListingSmsMessage(MARKETPLACE_ITEMS[0]);
  assert.ok(sellerSms.includes(MARKETPLACE_ITEMS[0].seller));
  assert.ok(sellerSms.includes(MARKETPLACE_ITEMS[0].pickupSpot));
});

test('mobile app platform detection and Android/iOS install link helpers work accurately', () => {
  assert.equal(
    detectMobilePlatform('Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/126.0 Mobile'),
    'android',
  );
  assert.equal(
    detectMobilePlatform('Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1'),
    'ios',
  );
  assert.equal(
    detectMobilePlatform('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15', 5),
    'ios',
  );
  assert.equal(
    detectMobilePlatform('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/126.0', 0),
    'desktop',
  );

  const shareUrl = buildMobileAppShareUrl('https://campusmart.vemu.edu.in/');
  assert.equal(shareUrl, 'https://campusmart.vemu.edu.in/');
  assert.equal(buildMobileAppShareUrl(''), 'https://campusmart-vemu.app/');

  const installSms = buildMobileInstallSmsMessage(shareUrl);
  assert.ok(installSms.includes('Android'));
  assert.ok(installSms.includes('iPhone'));
  assert.ok(installSms.includes(shareUrl));
});
