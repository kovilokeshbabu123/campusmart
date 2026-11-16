import {
  TOTAL_DURATION,
  clamp01,
  easeInOutCubic,
  easeOutBack,
  easeOutCubic,
  interpolateRange,
  lerp,
} from './timeline';

export interface LoadedBrandImages {
  campusPhoto: HTMLImageElement | null;
  officialEmblem: HTMLImageElement | null;
  officialBranding: HTMLImageElement | null;
}

const VIRTUAL_W = 1920;
const VIRTUAL_H = 1080;

const EMERALD_DARK = '#0D5C2E';
const EMERALD = '#16A34A';
const EMERALD_LIGHT = '#22C55E';
const EMERALD_PALE = '#DCFCE7';
const INK_DARK = '#0B1320';

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null,
  x: number,
  y: number,
  w: number,
  h: number,
  zoom = 1,
  panX = 0,
  panY = 0,
): void {
  if (!img || !img.complete || img.naturalWidth === 0) {
    const grad = ctx.createLinearGradient(x, y, x + w, y + h);
    grad.addColorStop(0, '#0F291E');
    grad.addColorStop(1, '#1A3E2E');
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, w, h);
    return;
  }

  const imgRatio = img.naturalWidth / img.naturalHeight;
  const boxRatio = w / h;
  let drawW = w;
  let drawH = h;
  if (imgRatio > boxRatio) {
    drawH = h * zoom;
    drawW = drawH * imgRatio;
  } else {
    drawW = w * zoom;
    drawH = drawW / imgRatio;
  }

  const offsetX = x + (w - drawW) * 0.5 + panX;
  const offsetY = y + (h - drawH) * 0.5 + panY;
  ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
}

/**
 * Draws a reference image with strict aspect-ratio preservation (contain),
 * zero distortion, zero recoloring, and optional crisp backing card.
 */
function drawPreservedReference(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null,
  cx: number,
  cy: number,
  maxW: number,
  maxH: number,
  frameStyle: 'circle' | 'rounded' | 'rounded-white' | 'none' = 'none',
): void {
  if (!img || !img.complete || img.naturalWidth === 0) return;

  const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight);
  const drawW = img.naturalWidth * scale;
  const drawH = img.naturalHeight * scale;

  ctx.save();
  if (frameStyle === 'circle') {
    const rad = Math.max(drawW, drawH) * 0.5 + 18;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.32)';
    ctx.shadowBlur = 28;
    ctx.shadowOffsetY = 10;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.beginPath();
    ctx.arc(cx, cy, rad - 4, 0, Math.PI * 2);
    ctx.clip();
  } else if (frameStyle === 'rounded-white') {
    const pad = 22;
    const boxSize = Math.max(drawW, drawH) + pad * 2;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.34)';
    ctx.shadowBlur = 32;
    ctx.shadowOffsetY = 12;
    ctx.fillStyle = '#FFFFFF';
    roundRectPath(ctx, cx - boxSize / 2, cy - boxSize / 2, boxSize, boxSize, 32);
    ctx.fill();
    ctx.shadowColor = 'transparent';
  } else if (frameStyle === 'rounded') {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.36)';
    ctx.shadowBlur = 32;
    ctx.shadowOffsetY = 12;
    ctx.fillStyle = '#091E3A';
    roundRectPath(ctx, cx - drawW / 2 - 8, cy - drawH / 2 - 8, drawW + 16, drawH + 16, 22);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    roundRectPath(ctx, cx - drawW / 2, cy - drawH / 2, drawW, drawH, 16);
    ctx.clip();
  }

  ctx.drawImage(img, cx - drawW / 2, cy - drawH / 2, drawW, drawH);
  ctx.restore();
}

/**
 * Distinct CampusMart 3D green-and-white emblem (never overlaps or imitates VEMU crest).
 */
function drawCampusMartMark(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  spinAngle = 0,
  alpha = 1,
): void {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(cx, cy);

  const scaleX = Math.max(0.22, Math.abs(Math.cos(spinAngle)));
  const tiltY = Math.sin(spinAngle) * 0.08;
  ctx.transform(scaleX, tiltY, 0, 1, 0, 0);

  const half = size * 0.5;
  const r = size * 0.24;

  // 3D depth extrusion layer
  ctx.fillStyle = EMERALD_DARK;
  roundRectPath(ctx, -half + 8, -half + 10, size, size, r);
  ctx.fill();

  // Front vibrant green shield/tile
  const tileGrad = ctx.createLinearGradient(-half, -half, half, half);
  tileGrad.addColorStop(0, EMERALD_LIGHT);
  tileGrad.addColorStop(0.55, EMERALD);
  tileGrad.addColorStop(1, EMERALD_DARK);
  ctx.shadowColor = 'rgba(22, 163, 74, 0.38)';
  ctx.shadowBlur = 34;
  ctx.shadowOffsetY = 12;
  ctx.fillStyle = tileGrad;
  roundRectPath(ctx, -half, -half, size, size, r);
  ctx.fill();
  ctx.shadowColor = 'transparent';

  // Crisp inner white border
  ctx.strokeStyle = 'rgba(255,255,255,0.45)';
  ctx.lineWidth = Math.max(2, size * 0.025);
  roundRectPath(ctx, -half + 4, -half + 4, size - 8, size - 8, r - 3);
  ctx.stroke();

  // White geometric shopping tote + open campus roof/book silhouette
  ctx.strokeStyle = '#FFFFFF';
  ctx.fillStyle = '#FFFFFF';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Bag handle arc
  ctx.lineWidth = Math.max(4, size * 0.075);
  ctx.beginPath();
  ctx.arc(0, -size * 0.14, size * 0.16, Math.PI, 0, false);
  ctx.stroke();

  // Crisp white bag body
  const bw = size * 0.52;
  const bh = size * 0.42;
  roundRectPath(ctx, -bw / 2, -size * 0.12, bw, bh, size * 0.09);
  ctx.fill();

  // Green architectural "M / Campus Roof" chevron inside the white bag
  ctx.strokeStyle = EMERALD;
  ctx.lineWidth = Math.max(4, size * 0.065);
  ctx.beginPath();
  ctx.moveTo(-bw * 0.28, size * 0.14);
  ctx.lineTo(-bw * 0.12, -size * 0.01);
  ctx.lineTo(0, size * 0.1);
  ctx.lineTo(bw * 0.12, -size * 0.01);
  ctx.lineTo(bw * 0.28, size * 0.14);
  ctx.stroke();

  ctx.restore();
}

function drawMorningSunbeams(
  ctx: CanvasRenderingContext2D,
  timeSec: number,
  intensity = 0.38,
): void {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const shift = Math.sin(timeSec * 0.35) * 60;

  // Warm sunrise radial glow top-left
  const sunGrad = ctx.createRadialGradient(340 + shift, 120, 20, 340 + shift, 120, 950);
  sunGrad.addColorStop(0, `rgba(255, 224, 158, ${intensity})`);
  sunGrad.addColorStop(0.4, `rgba(255, 195, 120, ${intensity * 0.42})`);
  sunGrad.addColorStop(1, 'rgba(255, 195, 120, 0)');
  ctx.fillStyle = sunGrad;
  ctx.fillRect(0, 0, VIRTUAL_W, VIRTUAL_H);

  // Diagonal volumetric morning light shafts
  for (let i = 0; i < 4; i += 1) {
    const bx = 180 + i * 310 + shift * 0.6;
    const beamGrad = ctx.createLinearGradient(bx, 0, bx + 420, VIRTUAL_H);
    beamGrad.addColorStop(0, `rgba(255, 238, 194, ${intensity * 0.28})`);
    beamGrad.addColorStop(1, 'rgba(255, 238, 194, 0)');
    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(bx, 0);
    ctx.lineTo(bx + 150, 0);
    ctx.lineTo(bx + 620, VIRTUAL_H);
    ctx.lineTo(bx + 360, VIRTUAL_H);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Draws subtle animated student figures walking along the campus walkways.
 */
function drawWalkingStudents(
  ctx: CanvasRenderingContext2D,
  timeSec: number,
  alpha = 1,
): void {
  ctx.save();
  ctx.globalAlpha *= alpha;

  const walkers = [
    { startX: 620, y: 840, speed: 34, dir: 1, scale: 1.0, shirt: '#FFFFFF', bag: EMERALD },
    { startX: 665, y: 852, speed: 34, dir: 1, scale: 0.96, shirt: '#1E40AF', bag: '#F59E0B' },
    { startX: 1460, y: 790, speed: 28, dir: -1, scale: 0.85, shirt: '#F8FAFC', bag: '#0F172A' },
    { startX: 1120, y: 920, speed: 42, dir: 1, scale: 1.12, shirt: '#16A34A', bag: '#FFFFFF' },
    { startX: 1175, y: 930, speed: 42, dir: 1, scale: 1.08, shirt: '#E2E8F0', bag: '#1E293B' },
    { startX: 1620, y: 880, speed: 30, dir: -1, scale: 0.95, shirt: '#FFFFFF', bag: EMERALD },
  ];

  for (let i = 0; i < walkers.length; i += 1) {
    const w = walkers[i];
    const x = w.startX + w.dir * ((timeSec * w.speed) % 420);
    const stride = Math.sin(timeSec * 6.2 + i * 1.4);
    const bob = Math.abs(stride) * 2.5;
    const s = w.scale;

    ctx.save();
    ctx.translate(x, w.y - bob);
    ctx.scale(s, s);

    // Ground shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.ellipse(0, 26 + bob, 14, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 4.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-2, 4);
    ctx.lineTo(-2 + stride * 7, 24);
    ctx.moveTo(2, 4);
    ctx.lineTo(2 - stride * 7, 24);
    ctx.stroke();

    // Torso
    ctx.fillStyle = w.shirt;
    roundRectPath(ctx, -7, -15, 14, 21, 5);
    ctx.fill();

    // Backpack
    ctx.fillStyle = w.bag;
    roundRectPath(ctx, w.dir > 0 ? -11 : 4, -13, 7, 15, 3);
    ctx.fill();

    // Head
    ctx.fillStyle = '#5C3A21';
    ctx.beginPath();
    ctx.arc(0, -22, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
  ctx.restore();
}

function drawCinematicBarsAndCaption(
  ctx: CanvasRenderingContext2D,
  eyebrow: string,
  title: string,
  subtitle: string,
  progress: number,
  align: 'left' | 'center' = 'left',
  immediate = false,
): void {
  const enter = immediate ? 1 : easeOutCubic(clamp01(progress * 2.8));
  const yOffset = (1 - enter) * 26;

  // Bottom contrast scrim
  const scrim = ctx.createLinearGradient(0, VIRTUAL_H - 360, 0, VIRTUAL_H);
  scrim.addColorStop(0, 'rgba(6, 12, 9, 0)');
  scrim.addColorStop(0.55, 'rgba(6, 12, 9, 0.66)');
  scrim.addColorStop(1, 'rgba(6, 12, 9, 0.92)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, VIRTUAL_H - 360, VIRTUAL_W, 360);

  ctx.save();
  ctx.globalAlpha = enter;

  const baseX = align === 'center' ? VIRTUAL_W / 2 : 112;
  ctx.textAlign = align;

  if (eyebrow) {
    ctx.font = '600 22px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillStyle = '#86EFAC';
    ctx.fillText(eyebrow.toUpperCase(), baseX, VIRTUAL_H - 186 + yOffset);
  }

  ctx.font = '800 58px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(title, baseX, VIRTUAL_H - 118 + yOffset);

  if (subtitle) {
    ctx.font = '500 28px "DM Sans", system-ui, sans-serif';
    ctx.fillStyle = 'rgba(241, 245, 249, 0.88)';
    ctx.fillText(subtitle, baseX, VIRTUAL_H - 68 + yOffset);
  }
  ctx.restore();
}

function drawVectorProductIcon(
  ctx: CanvasRenderingContext2D,
  type: 'book' | 'laptop' | 'apron' | 'drafter' | 'pens' | 'calculator',
  cx: number,
  cy: number,
  scale = 1,
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  if (type === 'book') {
    ctx.fillStyle = '#15803D';
    roundRectPath(ctx, -38, -28, 76, 56, 8);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    roundRectPath(ctx, -32, -22, 28, 44, 3);
    ctx.fill();
    roundRectPath(ctx, 4, -22, 28, 44, 3);
    ctx.fill();
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 2;
    for (let i = -12; i <= 12; i += 8) {
      ctx.beginPath();
      ctx.moveTo(-26, i);
      ctx.lineTo(-10, i);
      ctx.moveTo(10, i);
      ctx.lineTo(26, i);
      ctx.stroke();
    }
  } else if (type === 'laptop') {
    ctx.fillStyle = '#0F172A';
    roundRectPath(ctx, -40, -28, 80, 48, 6);
    ctx.fill();
    ctx.fillStyle = '#DCFCE7';
    roundRectPath(ctx, -34, -22, 68, 36, 3);
    ctx.fill();
    ctx.fillStyle = '#16A34A';
    roundRectPath(ctx, -24, -14, 30, 18, 3);
    ctx.fill();
    ctx.fillStyle = '#334155';
    roundRectPath(ctx, -48, 22, 96, 8, 4);
    ctx.fill();
  } else if (type === 'apron') {
    ctx.fillStyle = '#F8FAFC';
    ctx.strokeStyle = '#16A34A';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-18, -28);
    ctx.lineTo(18, -28);
    ctx.lineTo(28, 30);
    ctx.lineTo(-28, 30);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#DCFCE7';
    roundRectPath(ctx, -14, 2, 28, 18, 4);
    ctx.fill();
  } else if (type === 'drafter') {
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-34, -24);
    ctx.lineTo(4, -6);
    ctx.lineTo(30, -26);
    ctx.stroke();
    ctx.fillStyle = '#16A34A';
    ctx.beginPath();
    ctx.arc(4, -6, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#E2E8F0';
    roundRectPath(ctx, -10, -4, 42, 10, 3);
    ctx.fill();
    roundRectPath(ctx, -10, -4, 10, 36, 3);
    ctx.fill();
  } else if (type === 'pens') {
    ctx.save();
    ctx.rotate(-0.35);
    ctx.fillStyle = '#16A34A';
    roundRectPath(ctx, -14, -32, 10, 56, 3);
    ctx.fill();
    ctx.fillStyle = '#0F172A';
    roundRectPath(ctx, 4, -26, 10, 50, 3);
    ctx.fill();
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.moveTo(-14, 24);
    ctx.lineTo(-9, 35);
    ctx.lineTo(-4, 24);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  } else {
    // calculator
    ctx.fillStyle = '#0F172A';
    roundRectPath(ctx, -26, -34, 52, 68, 8);
    ctx.fill();
    ctx.fillStyle = '#BBF7D0';
    roundRectPath(ctx, -19, -27, 38, 16, 3);
    ctx.fill();
    ctx.fillStyle = '#475569';
    for (let r = 0; r < 3; r += 1) {
      for (let c = 0; c < 3; c += 1) {
        roundRectPath(ctx, -18 + c * 13, -3 + r * 11, 9, 7, 2);
        ctx.fill();
      }
    }
  }

  ctx.restore();
}

// -----------------------------------------------------------------------------
// SCENE 1 (0s - 8s): REAL VEMU CAMPUS
// -----------------------------------------------------------------------------
function renderScene1(
  ctx: CanvasRenderingContext2D,
  t: number,
  images: LoadedBrandImages,
): void {
  const p = clamp01(t / 8);
  const zoom = lerp(1.04, 1.16, easeInOutCubic(p));
  const panX = lerp(-40, 36, easeInOutCubic(p));
  const panY = lerp(12, -16, easeInOutCubic(p));

  drawCoverImage(ctx, images.campusPhoto, 0, 0, VIRTUAL_W, VIRTUAL_H, zoom, panX, panY);
  drawMorningSunbeams(ctx, t, 0.42);
  drawWalkingStudents(ctx, t, easeOutCubic(clamp01(p * 3)));

  // Soft morning floating light motes
  ctx.save();
  for (let i = 0; i < 16; i += 1) {
    const mx = ((i * 197 + t * 24) % VIRTUAL_W);
    const my = ((i * 131 + Math.sin(t + i) * 40) % (VIRTUAL_H * 0.72));
    ctx.fillStyle = 'rgba(255, 244, 214, 0.25)';
    ctx.beginPath();
    ctx.arc(mx, my, 2 + (i % 3), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  drawCinematicBarsAndCaption(
    ctx,
    'Morning at P. Kothakota Campus',
    'VEMU INSTITUTE OF TECHNOLOGY',
    'Autonomous Engineering Campus · Tirupati–Chittoor Highway',
    p,
    'left',
    true,
  );
}

// -----------------------------------------------------------------------------
// SCENE 2 (8s - 16s): THE STUDENT MARKETPLACE PROBLEM
// -----------------------------------------------------------------------------
function renderScene2(
  ctx: CanvasRenderingContext2D,
  t: number,
  images: LoadedBrandImages,
): void {
  const local = t - 8;
  const p = clamp01(local / 8);

  // Softly darkened & blurred campus backdrop
  ctx.save();
  ctx.filter = 'blur(8px) brightness(0.45)';
  drawCoverImage(ctx, images.campusPhoto, -20, -20, VIRTUAL_W + 40, VIRTUAL_H + 40, 1.12, 0, 0);
  ctx.restore();

  // Subtle architectural grid overlay
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  for (let x = 120; x < VIRTUAL_W; x += 160) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, VIRTUAL_H);
    ctx.stroke();
  }
  ctx.restore();

  const cardEnterL = easeOutCubic(interpolateRange(local, 0.3, 1.5));
  const cardEnterR = easeOutCubic(interpolateRange(local, 1.1, 2.3));

  // LEFT PANEL: Students looking for affordable engineering essentials
  ctx.save();
  ctx.globalAlpha = cardEnterL;
  const lx = 110;
  const ly = 120 + (1 - cardEnterL) * 40;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.86)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
  ctx.lineWidth = 2;
  roundRectPath(ctx, lx, ly, 810, 620, 28);
  ctx.fill();
  ctx.stroke();

  ctx.font = '700 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#FCA5A5';
  ctx.fillText('THE CAMPUS CHALLENGE', lx + 48, ly + 62);

  ctx.font = '700 38px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('New Semester Costs Add Up Fast', lx + 48, ly + 114);

  const needs: Array<{
    name: string;
    retail: string;
    icon: 'book' | 'laptop' | 'apron' | 'drafter' | 'pens' | 'calculator';
  }> = [
    { name: 'Engineering Books', retail: '₹720+ new', icon: 'book' },
    { name: 'Laptops & Gear', retail: '₹55,000+', icon: 'laptop' },
    { name: 'Lab Aprons', retail: '₹450 new', icon: 'apron' },
    { name: 'Mini Drafters', retail: '₹890 new', icon: 'drafter' },
    { name: 'Scientific Calculators', retail: '₹1,295 new', icon: 'calculator' },
    { name: 'Pens & Stationery', retail: '₹300+ pack', icon: 'pens' },
  ];

  for (let i = 0; i < needs.length; i += 1) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const itemProgress = easeOutBack(interpolateRange(local, 0.6 + i * 0.22, 1.4 + i * 0.22));
    const ix = lx + 48 + col * 365;
    const iy = ly + 158 + row * 140;

    ctx.save();
    ctx.globalAlpha *= clamp01(itemProgress);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    roundRectPath(ctx, ix, iy, 345, 118, 16);
    ctx.fill();

    drawVectorProductIcon(ctx, needs[i].icon, ix + 56, iy + 59, 0.68);

    ctx.font = '700 21px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#F8FAFC';
    ctx.fillText(needs[i].name, ix + 112, iy + 52);

    ctx.font = '600 18px "JetBrains Mono", monospace';
    ctx.fillStyle = '#F87171';
    ctx.fillText(needs[i].retail, ix + 112, iy + 84);
    ctx.restore();
  }
  ctx.restore();

  // RIGHT PANEL: Senior student with unused books & materials
  ctx.save();
  ctx.globalAlpha = cardEnterR;
  const rx = 1000;
  const ry = 120 + (1 - cardEnterR) * 40;
  ctx.fillStyle = 'rgba(248, 250, 249, 0.96)';
  roundRectPath(ctx, rx, ry, 810, 620, 28);
  ctx.fill();

  ctx.font = '700 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = EMERALD;
  ctx.fillText('UNTAPPED ON-CAMPUS SUPPLY', rx + 48, ry + 62);

  ctx.font = '700 38px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = INK_DARK;
  ctx.fillText('Seniors Have Unused Essentials', rx + 48, ry + 114);

  // Stylized illustration of student desk / stacked unused books & materials
  ctx.fillStyle = EMERALD_PALE;
  roundRectPath(ctx, rx + 48, ry + 158, 714, 280, 20);
  ctx.fill();

  // Stacked books + drafter + apron floating gently
  const floatY = Math.sin(local * 2.2) * 8;
  drawVectorProductIcon(ctx, 'book', rx + 190, ry + 295 + floatY, 1.45);
  drawVectorProductIcon(ctx, 'drafter', rx + 405, ry + 295 - floatY, 1.45);
  drawVectorProductIcon(ctx, 'calculator', rx + 610, ry + 295 + floatY * 0.7, 1.45);

  ctx.font = '600 24px "DM Sans", sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText('Sitting idle in hostels & bags after semester exams.', rx + 48, ry + 492);
  ctx.font = '700 26px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = EMERALD_DARK;
  ctx.fillText('Ready to buy, swap, or share across VEMU blocks.', rx + 48, ry + 542);
  ctx.restore();

  drawCinematicBarsAndCaption(
    ctx,
    'Built For Everyday Engineering Life',
    'Everything a student needs, right on campus.',
    '',
    p,
    'center',
  );
}

// -----------------------------------------------------------------------------
// SCENE 3 (16s - 23s): CAMPUSMART BRAND REVEAL
// -----------------------------------------------------------------------------
function renderScene3(
  ctx: CanvasRenderingContext2D,
  t: number,
  images: LoadedBrandImages,
): void {
  const local = t - 16;
  const p = clamp01(local / 7);

  // Clean architectural emerald-white studio stage
  const bg = ctx.createLinearGradient(0, 0, VIRTUAL_W, VIRTUAL_H);
  bg.addColorStop(0, '#FFFFFF');
  bg.addColorStop(0.65, '#F0FDF4');
  bg.addColorStop(1, '#DCFCE7');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, VIRTUAL_W, VIRTUAL_H);

  // Subtle architectural arcs
  ctx.save();
  ctx.strokeStyle = 'rgba(22, 163, 74, 0.1)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(VIRTUAL_W / 2, 420, 340, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(VIRTUAL_W / 2, 420, 490, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // 3D animated CampusMart emblem rotation into front lockup
  const spinProgress = easeOutCubic(interpolateRange(local, 0.1, 2.2));
  const spinAngle = (1 - spinProgress) * Math.PI * 2;
  const markScale = easeOutBack(interpolateRange(local, 0.0, 1.4));

  drawCampusMartMark(ctx, VIRTUAL_W / 2, 310, 210 * markScale, spinAngle, clamp01(local * 3));

  // Main headline & subtitle
  const textEnter = easeOutCubic(interpolateRange(local, 0.8, 2.0));
  ctx.save();
  ctx.globalAlpha = textEnter;
  ctx.textAlign = 'center';

  ctx.font = '700 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = EMERALD;
  ctx.fillText('INTRODUCING CAMPUSMART', VIRTUAL_W / 2, 488 + (1 - textEnter) * 20);

  ctx.font = '800 84px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = INK_DARK;
  ctx.fillText('CAMPUSMART', VIRTUAL_W / 2, 578 + (1 - textEnter) * 20);

  ctx.font = '500 34px "DM Sans", sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText('Your Campus. Your Marketplace.', VIRTUAL_W / 2, 634 + (1 - textEnter) * 20);
  ctx.restore();

  // Separate Institutional Identity Reference Bar featuring unaltered Reference Image 2
  const refEnter = easeOutCubic(interpolateRange(local, 1.8, 3.2));
  ctx.save();
  ctx.globalAlpha = refEnter;
  const barW = 860;
  const barH = 190;
  const barX = (VIRTUAL_W - barW) / 2;
  const barY = 740 + (1 - refEnter) * 24;

  ctx.shadowColor = 'rgba(15, 23, 42, 0.08)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = '#FFFFFF';
  roundRectPath(ctx, barX, barY, barW, barH, 24);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.08)';
  ctx.lineWidth = 1.5;
  roundRectPath(ctx, barX, barY, barW, barH, 24);
  ctx.stroke();

  // Preserved VEMU Emblem (Reference Image 2)
  drawPreservedReference(ctx, images.officialEmblem, barX + 115, barY + barH / 2, 148, 148, 'none');

  ctx.textAlign = 'left';
  ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#64748B';
  ctx.fillText('INSTITUTIONAL IDENTITY REFERENCE', barX + 225, barY + 64);

  ctx.font = '800 34px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#0F2B6B';
  ctx.fillText('VEMU INSTITUTE OF TECHNOLOGY', barX + 225, barY + 108);

  ctx.font = '500 20px "DM Sans", sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText('P. Kothakota · Official Campus Student Community', barX + 225, barY + 144);
  ctx.restore();
}

// -----------------------------------------------------------------------------
// SCENE 4 (23s - 32s): BUY AND SELL
// -----------------------------------------------------------------------------
function renderScene4(ctx: CanvasRenderingContext2D, t: number): void {
  const local = t - 23;
  const p = clamp01(local / 9);

  // Clean crisp light-studio background with subtle emerald top-right glow
  ctx.fillStyle = '#F8FAF9';
  ctx.fillRect(0, 0, VIRTUAL_W, VIRTUAL_H);
  const glow = ctx.createRadialGradient(1500, 220, 40, 1500, 220, 900);
  glow.addColorStop(0, 'rgba(22, 163, 74, 0.14)');
  glow.addColorStop(1, 'rgba(22, 163, 74, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, VIRTUAL_W, VIRTUAL_H);

  // Left: Sleek Smartphone Mockup running CampusMart Mobile UI
  const phoneEnter = easeOutCubic(interpolateRange(local, 0, 1.1));
  const px = 140;
  const py = 100 + (1 - phoneEnter) * 60;
  const pw = 420;
  const ph = 780;

  ctx.save();
  ctx.globalAlpha = phoneEnter;
  ctx.shadowColor = 'rgba(15, 23, 42, 0.22)';
  ctx.shadowBlur = 45;
  ctx.shadowOffsetY = 20;
  ctx.fillStyle = '#0F172A';
  roundRectPath(ctx, px, py, pw, ph, 54);
  ctx.fill();
  ctx.shadowColor = 'transparent';

  // Inner phone screen
  ctx.save();
  roundRectPath(ctx, px + 14, py + 14, pw - 28, ph - 28, 42);
  ctx.clip();
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(px + 14, py + 14, pw - 28, ph - 28);

  // Phone App Header (Green & White)
  ctx.fillStyle = EMERALD;
  ctx.fillRect(px + 14, py + 14, pw - 28, 126);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 26px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('CampusMart', px + 40, py + 76);
  ctx.font = '500 16px "DM Sans", sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.88)';
  ctx.fillText('VEMU Student Marketplace', px + 40, py + 104);

  // Search bar in phone
  ctx.fillStyle = '#F1F5F9';
  roundRectPath(ctx, px + 34, py + 158, pw - 68, 46, 12);
  ctx.fill();
  ctx.font = '500 16px "DM Sans", sans-serif';
  ctx.fillStyle = '#64748B';
  ctx.fillText('Search books, drafters, laptops...', px + 52, py + 187);

  // Smooth vertical scrolling feed inside smartphone
  const scrollOffset = Math.sin(p * Math.PI) * 140;
  const feedItems = [
    { name: 'Data Structures Book', price: '₹75', tag: 'CSE · Like New', icon: 'book' as const },
    { name: 'Casio fx-991ES Calc', price: '₹95', tag: 'Exam Ready', icon: 'calculator' as const },
    { name: 'Omega Mini Drafter', price: '₹85', tag: 'Civil / Mech', icon: 'drafter' as const },
    { name: 'Cotton Lab Apron', price: '₹65', tag: 'Workshop L', icon: 'apron' as const },
  ];

  for (let i = 0; i < feedItems.length; i += 1) {
    const fy = py + 226 + i * 136 - scrollOffset;
    if (fy < py + 140 || fy > py + ph - 40) continue;
    ctx.fillStyle = '#F8FAFC';
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1.5;
    roundRectPath(ctx, px + 34, fy, pw - 68, 118, 18);
    ctx.fill();
    ctx.stroke();

    drawVectorProductIcon(ctx, feedItems[i].icon, px + 88, fy + 59, 0.65);

    ctx.font = '700 19px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = INK_DARK;
    ctx.fillText(feedItems[i].name, px + 142, fy + 46);

    ctx.font = '500 15px "DM Sans", sans-serif';
    ctx.fillStyle = '#64748B';
    ctx.fillText(feedItems[i].tag, px + 142, fy + 74);

    ctx.font = '700 20px "JetBrains Mono", monospace';
    ctx.fillStyle = EMERALD;
    ctx.fillText(feedItems[i].price, px + 142, fy + 102);
  }

  // Animated "+ Sell Item" floating button at bottom of phone
  ctx.fillStyle = EMERALD;
  roundRectPath(ctx, px + 95, py + ph - 96, 230, 52, 26);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.font = '700 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('+ Upload Listing', px + pw / 2, py + ph - 64);
  ctx.textAlign = 'left';
  ctx.restore();
  ctx.restore();

  // Right: 6 Realistic Product Cards covering every requested category
  const cards: Array<{
    title: string;
    cat: string;
    price: string;
    icon: 'book' | 'laptop' | 'apron' | 'drafter' | 'pens' | 'calculator';
  }> = [
    { title: 'Engineering Books', cat: 'All Branches · Sem 1–8', price: '₹55 – ₹95', icon: 'book' },
    { title: 'Laptops & Electronics', cat: 'Student Tech & Kits', price: '₹75 – ₹100', icon: 'laptop' },
    { title: 'Lab Aprons', cat: 'Workshop & Chemistry', price: '₹50 – ₹80', icon: 'apron' },
    { title: 'Drafters & Drawing Tools', cat: 'Mini Drafters & Tubes', price: '₹65 – ₹95', icon: 'drafter' },
    { title: 'Pens & Pencils', cat: 'Technical & Fineliner Sets', price: '₹50 – ₹75', icon: 'pens' },
    { title: 'Calculators & Stationery', cat: 'Casio Scientific & Kits', price: '₹60 – ₹100', icon: 'calculator' },
  ];

  // Top Header on Right
  ctx.save();
  ctx.font = '700 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = EMERALD;
  ctx.fillText('VERIFIED CAMPUS CATEGORIES', 650, 128);
  ctx.font = '800 56px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = INK_DARK;
  ctx.fillText('BUY SMART. SELL EASY.', 650, 192);
  ctx.restore();

  for (let i = 0; i < cards.length; i += 1) {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const delay = 0.4 + i * 0.32;
    const enter = easeOutBack(interpolateRange(local, delay, delay + 0.9));
    const cx = 650 + col * 392;
    const cy = 248 + row * 316 + (1 - enter) * 40;

    ctx.save();
    ctx.globalAlpha = clamp01(enter);
    ctx.shadowColor = 'rgba(15, 23, 42, 0.08)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = '#FFFFFF';
    roundRectPath(ctx, cx, cy, 364, 286, 22);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1.5;
    roundRectPath(ctx, cx, cy, 364, 286, 22);
    ctx.stroke();

    // Soft green illustration stage inside card
    ctx.fillStyle = '#F0FDF4';
    roundRectPath(ctx, cx + 18, cy + 18, 328, 134, 14);
    ctx.fill();
    drawVectorProductIcon(ctx, cards[i].icon, cx + 182, cy + 85, 1.05);

    ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = INK_DARK;
    ctx.fillText(cards[i].title, cx + 22, cy + 190);

    ctx.font = '500 17px "DM Sans", sans-serif';
    ctx.fillStyle = '#64748B';
    ctx.fillText(cards[i].cat, cx + 22, cy + 222);

    ctx.font = '700 21px "JetBrains Mono", monospace';
    ctx.fillStyle = EMERALD;
    ctx.fillText(cards[i].price, cx + 22, cy + 258);
    ctx.restore();
  }
}

// -----------------------------------------------------------------------------
// SCENE 5 (32s - 39s): EXCHANGE AND DONATE
// -----------------------------------------------------------------------------
function renderScene5(ctx: CanvasRenderingContext2D, t: number): void {
  const local = t - 32;
  const p = clamp01(local / 7);

  // Warm emerald-and-white gradient canvas
  const bg = ctx.createLinearGradient(0, 0, VIRTUAL_W, VIRTUAL_H);
  bg.addColorStop(0, '#072414');
  bg.addColorStop(1, '#0F3D22');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, VIRTUAL_W, VIRTUAL_H);

  // Subtle ambient glow
  const glow = ctx.createRadialGradient(VIRTUAL_W / 2, 460, 80, VIRTUAL_W / 2, 460, 780);
  glow.addColorStop(0, 'rgba(34, 197, 94, 0.24)');
  glow.addColorStop(1, 'rgba(34, 197, 94, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, VIRTUAL_W, VIRTUAL_H);

  const enter = easeOutCubic(interpolateRange(local, 0, 1.1));

  // LEFT CARD: Two students exchanging engineering books
  ctx.save();
  ctx.globalAlpha = enter;
  const lx = 110;
  const ly = 120;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
  roundRectPath(ctx, lx, ly, 810, 620, 28);
  ctx.fill();

  ctx.font = '700 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = EMERALD;
  ctx.fillText('DIRECT PEER EXCHANGE', lx + 48, ly + 62);
  ctx.font = '700 36px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = INK_DARK;
  ctx.fillText('Swap Engineering Textbooks', lx + 48, ly + 110);

  // Student A & Student B avatars + curved exchange arcs
  const swapPhase = (local * 0.55) % 1;
  const arcX1 = lerp(lx + 210, lx + 600, easeInOutCubic(swapPhase));
  const arcY1 = ly + 310 - Math.sin(swapPhase * Math.PI) * 110;
  const arcX2 = lerp(lx + 600, lx + 210, easeInOutCubic(swapPhase));
  const arcY2 = ly + 360 + Math.sin(swapPhase * Math.PI) * 90;

  // Dashed orbital exchange guide
  ctx.strokeStyle = 'rgba(22, 163, 74, 0.28)';
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.ellipse(lx + 405, ly + 335, 210, 95, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Student A Badge
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.arc(lx + 185, ly + 335, 62, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('2nd Yr', lx + 185, ly + 342);

  // Student B Badge
  ctx.fillStyle = EMERALD;
  ctx.beginPath();
  ctx.arc(lx + 625, ly + 335, 62, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('3rd Yr', lx + 625, ly + 342);
  ctx.textAlign = 'left';

  // Moving Books along swap arcs
  drawVectorProductIcon(ctx, 'book', arcX1, arcY1, 0.72);
  drawVectorProductIcon(ctx, 'book', arcX2, arcY2, 0.72);

  ctx.font = '600 22px "DM Sans", sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText('Zero commission · Hand-to-hand exchange at Main Block', lx + 48, ly + 560);
  ctx.restore();

  // RIGHT CARD: Student sharing unused stationery with a fellow student
  ctx.save();
  ctx.globalAlpha = enter;
  const rx = 1000;
  const ry = 120;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
  roundRectPath(ctx, rx, ry, 810, 620, 28);
  ctx.fill();

  ctx.font = '700 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = EMERALD;
  ctx.fillText('CAMPUS DONATION DRIVE', rx + 48, ry + 62);
  ctx.font = '700 36px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = INK_DARK;
  ctx.fillText('Share Unused Stationery', rx + 48, ry + 110);

  // Gift/Share bridge
  ctx.fillStyle = '#F0FDF4';
  roundRectPath(ctx, rx + 48, ry + 165, 714, 300, 22);
  ctx.fill();

  const shareTravel = easeInOutCubic((local * 0.45) % 1);
  const giftX = lerp(rx + 210, rx + 600, shareTravel);
  const giftY = ry + 315 - Math.sin(shareTravel * Math.PI) * 55;

  ctx.strokeStyle = EMERALD;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(rx + 210, ry + 320);
  ctx.lineTo(rx + 600, ry + 320);
  ctx.stroke();

  drawVectorProductIcon(ctx, 'pens', giftX - 36, giftY, 0.88);
  drawVectorProductIcon(ctx, 'drafter', giftX + 38, giftY, 0.78);

  ctx.fillStyle = EMERALD;
  ctx.beginPath();
  ctx.arc(rx + 170, ry + 320, 44, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.arc(rx + 640, ry + 320, 44, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.font = '700 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Senior', rx + 170, ry + 326);
  ctx.fillText('Junior', rx + 640, ry + 326);
  ctx.textAlign = 'left';

  ctx.font = '600 22px "DM Sans", sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText('Pass forward pens, pencils, drafters & exam kits for ₹0', rx + 48, ry + 560);
  ctx.restore();

  drawCinematicBarsAndCaption(
    ctx,
    'Sustainable Student Community',
    'EXCHANGE MORE. SHARE MORE.',
    '',
    p,
    'center',
  );
}

// -----------------------------------------------------------------------------
// SCENE 6 (39s - 46s): WEBSITE AND ANDROID EXPERIENCE
// -----------------------------------------------------------------------------
function renderScene6(ctx: CanvasRenderingContext2D, t: number): void {
  const local = t - 39;
  const p = clamp01(local / 7);

  // Clean crisp light background
  ctx.fillStyle = '#F8FAF9';
  ctx.fillRect(0, 0, VIRTUAL_W, VIRTUAL_H);

  // Top Header
  ctx.save();
  ctx.font = '700 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = EMERALD;
  ctx.fillText('CROSS-PLATFORM CAMPUS EXPERIENCE', 110, 92);
  ctx.font = '800 50px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = INK_DARK;
  ctx.fillText('CampusMart Website & Android App', 110, 152);
  ctx.restore();

  const enter = easeOutCubic(interpolateRange(local, 0, 1.0));

  // LEFT: Premium Laptop Mockup (Web Marketplace: Search, Login, Upload, Cart)
  ctx.save();
  ctx.globalAlpha = enter;
  const lx = 110;
  const ly = 210 + (1 - enter) * 35;
  const lw = 1120;
  const lh = 660;

  // Laptop Bezel
  ctx.shadowColor = 'rgba(15, 23, 42, 0.22)';
  ctx.shadowBlur = 42;
  ctx.shadowOffsetY = 16;
  ctx.fillStyle = '#0F172A';
  roundRectPath(ctx, lx, ly, lw, lh, 28);
  ctx.fill();
  ctx.shadowColor = 'transparent';

  // Laptop Base Lip
  ctx.fillStyle = '#334155';
  roundRectPath(ctx, lx - 48, ly + lh - 10, lw + 96, 26, 12);
  ctx.fill();

  // Laptop Screen Content
  ctx.save();
  roundRectPath(ctx, lx + 20, ly + 20, lw - 40, lh - 46, 16);
  ctx.clip();
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(lx + 20, ly + 20, lw - 40, lh - 46);

  // Web Navbar (Green & White)
  ctx.fillStyle = EMERALD;
  ctx.fillRect(lx + 20, ly + 20, lw - 40, 74);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('CampusMart Web', lx + 52, ly + 66);

  // Animated Search Input
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  roundRectPath(ctx, lx + 310, ly + 36, 410, 42, 10);
  ctx.fill();
  const fullQuery = 'Casio fx-991ES & Mini Drafter';
  const charCount = Math.floor(clamp01(local / 2.6) * fullQuery.length);
  ctx.font = '500 17px "DM Sans", sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText(fullQuery.slice(0, charCount) || 'Search campus items...', lx + 330, ly + 63);

  // Student Login Verified Chip
  ctx.fillStyle = '#0D5C2E';
  roundRectPath(ctx, lx + 748, ly + 36, 230, 42, 10);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('VEMU ID: 234M1A0542', lx + 766, ly + 62);

  // Cart indicator
  ctx.fillStyle = '#FFFFFF';
  roundRectPath(ctx, lx + 994, ly + 36, 86, 42, 10);
  ctx.fill();
  ctx.fillStyle = EMERALD_DARK;
  ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Cart (2)', lx + 1006, ly + 62);

  // Web Body Columns: Product Upload Card + Cart Summary
  ctx.fillStyle = '#F8FAF9';
  roundRectPath(ctx, lx + 48, ly + 120, 620, 480, 18);
  ctx.fill();
  ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = INK_DARK;
  ctx.fillText('Quick Product Upload', lx + 78, ly + 166);

  // Upload fields
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 1.5;
  roundRectPath(ctx, lx + 78, ly + 190, 560, 54, 12);
  ctx.fill();
  ctx.stroke();
  ctx.font = '500 18px "DM Sans", sans-serif';
  ctx.fillStyle = '#0F172A';
  ctx.fillText('Title: Engineering Mechanics Textbook (Unused)', lx + 98, ly + 224);

  ctx.fillStyle = '#FFFFFF';
  roundRectPath(ctx, lx + 78, ly + 264, 270, 54, 12);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#0F172A';
  ctx.fillText('Price: ₹75 · Buy / Swap', lx + 98, ly + 298);

  ctx.fillStyle = '#FFFFFF';
  roundRectPath(ctx, lx + 368, ly + 264, 270, 54, 12);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#0F172A';
  ctx.fillText('Pickup: Main Block Lawn', lx + 388, ly + 298);

  // Preview card inside upload
  ctx.fillStyle = '#DCFCE7';
  roundRectPath(ctx, lx + 78, ly + 344, 560, 146, 16);
  ctx.fill();
  drawVectorProductIcon(ctx, 'book', lx + 155, ly + 417, 0.95);
  ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = EMERALD_DARK;
  ctx.fillText('Ready to Publish to VEMU Campus', lx + 235, ly + 408);
  ctx.font = '500 17px "DM Sans", sans-serif';
  ctx.fillStyle = '#166534';
  ctx.fillText('Instant visibility for 3,000+ students', lx + 235, ly + 442);

  // Publish Button
  ctx.fillStyle = EMERALD;
  roundRectPath(ctx, lx + 78, ly + 514, 250, 52, 12);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Publish Listing', lx + 132, ly + 547);

  // Web Right Column: Shopping Cart
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#E2E8F0';
  roundRectPath(ctx, lx + 694, ly + 120, 386, 480, 18);
  ctx.fill();
  ctx.stroke();
  ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = INK_DARK;
  ctx.fillText('Campus Cart', lx + 722, ly + 166);

  const cartRows = [
    { name: 'Casio fx-991ES Calc', price: '₹95', icon: 'calculator' as const },
    { name: 'Omega Mini Drafter', price: '₹85', icon: 'drafter' as const },
  ];
  for (let i = 0; i < cartRows.length; i += 1) {
    const cy = ly + 198 + i * 112;
    ctx.fillStyle = '#F8FAF9';
    roundRectPath(ctx, lx + 720, cy, 334, 92, 14);
    ctx.fill();
    drawVectorProductIcon(ctx, cartRows[i].icon, lx + 764, cy + 46, 0.55);
    ctx.font = '700 17px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = INK_DARK;
    ctx.fillText(cartRows[i].name, lx + 812, cy + 40);
    ctx.font = '700 18px "JetBrains Mono", monospace';
    ctx.fillStyle = EMERALD;
    ctx.fillText(cartRows[i].price, lx + 812, cy + 68);
  }

  ctx.font = '700 22px "JetBrains Mono", monospace';
  ctx.fillStyle = INK_DARK;
  ctx.fillText('Total: ₹180', lx + 722, ly + 474);
  ctx.fillStyle = EMERALD;
  roundRectPath(ctx, lx + 720, ly + 506, 334, 54, 14);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Confirm Campus Pickup', lx + 780, ly + 540);
  ctx.restore();
  ctx.restore();

  // RIGHT: Sleek Android Smartphone Mockup showing Live Order Tracking
  ctx.save();
  ctx.globalAlpha = enter;
  const ax = 1320;
  const ay = 160 + (1 - enter) * 45;
  const aw = 470;
  const ah = 760;

  ctx.shadowColor = 'rgba(15, 23, 42, 0.25)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 18;
  ctx.fillStyle = '#0F172A';
  roundRectPath(ctx, ax, ay, aw, ah, 46);
  ctx.fill();
  ctx.shadowColor = 'transparent';

  ctx.save();
  roundRectPath(ctx, ax + 14, ay + 14, aw - 28, ah - 28, 36);
  ctx.clip();
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(ax + 14, ay + 14, aw - 28, ah - 28);

  // Android Header
  ctx.fillStyle = EMERALD;
  ctx.fillRect(ax + 14, ay + 14, aw - 28, 118);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('ANDROID APP · ORDER TRACKING', ax + 42, ay + 64);
  ctx.font = '800 28px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Order #VEMU-4082', ax + 42, ay + 104);

  // Order Tracking Progress Steps
  const activeStep = Math.min(3, Math.floor(p * 3.8));
  const steps = [
    { title: 'Student Login Verified', desc: 'VEMU Campus ID Confirmed' },
    { title: 'Seller Accepted Request', desc: 'Casio Calculator + Drafter' },
    { title: 'Meetup at Main Block', desc: 'Today · 1:15 PM Lunch Break' },
    { title: 'Handover Completed', desc: 'Zero Delivery Fees' },
  ];

  for (let i = 0; i < steps.length; i += 1) {
    const sy = ay + 178 + i * 124;
    const done = i <= activeStep;

    if (i < steps.length - 1) {
      ctx.strokeStyle = i < activeStep ? EMERALD : '#E2E8F0';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(ax + 68, sy + 24);
      ctx.lineTo(ax + 68, sy + 116);
      ctx.stroke();
    }

    ctx.fillStyle = done ? EMERALD : '#E2E8F0';
    ctx.beginPath();
    ctx.arc(ax + 68, sy + 12, 18, 0, Math.PI * 2);
    ctx.fill();

    if (done) {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(ax + 60, sy + 12);
      ctx.lineTo(ax + 66, sy + 18);
      ctx.lineTo(ax + 77, sy + 6);
      ctx.stroke();
    }

    ctx.font = '700 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = done ? INK_DARK : '#94A3B8';
    ctx.fillText(steps[i].title, ax + 106, sy + 10);

    ctx.font = '500 16px "DM Sans", sans-serif';
    ctx.fillStyle = done ? '#475569' : '#94A3B8';
    ctx.fillText(steps[i].desc, ax + 106, sy + 38);
  }
  ctx.restore();
  ctx.restore();
}

// -----------------------------------------------------------------------------
// SCENE 7 (46s - 54s): OFFICIAL VEMU BRAND ENDING
// -----------------------------------------------------------------------------
function renderScene7(
  ctx: CanvasRenderingContext2D,
  t: number,
  images: LoadedBrandImages,
): void {
  const local = t - 46;
  const p = clamp01(local / 8);

  // Return to actual VEMU campus from Reference Image 1
  const zoom = lerp(1.12, 1.0, easeOutCubic(p));
  drawCoverImage(ctx, images.campusPhoto, 0, 0, VIRTUAL_W, VIRTUAL_H, zoom, 0, 0);
  drawMorningSunbeams(ctx, t, 0.35);

  // Smooth transition into prestige dark emerald-navy cinematic overlay for finale lockup
  const overlayAlpha = lerp(0.28, 0.88, easeInOutCubic(interpolateRange(local, 0.6, 2.4)));
  ctx.fillStyle = `rgba(7, 22, 18, ${overlayAlpha})`;
  ctx.fillRect(0, 0, VIRTUAL_W, VIRTUAL_H);

  const lockupEnter = easeOutCubic(interpolateRange(local, 1.0, 2.5));
  ctx.save();
  ctx.globalAlpha = lockupEnter;

  // Left: Official VEMU Emblem (Reference Image 2, unaltered)
  drawPreservedReference(
    ctx,
    images.officialEmblem,
    360,
    390 + (1 - lockupEnter) * 24,
    300,
    300,
    'rounded-white',
  );

  // Center: Prominent CampusMart green-and-white mark (visually distinct)
  drawCampusMartMark(
    ctx,
    VIRTUAL_W / 2,
    360 + (1 - lockupEnter) * 20,
    240,
    0,
    lockupEnter,
  );

  // Right: Official VEMU Branding Artwork (Reference Image 3, unaltered)
  drawPreservedReference(
    ctx,
    images.officialBranding,
    1560,
    390 + (1 - lockupEnter) * 24,
    340,
    470,
    'rounded',
  );

  // Labels clarifying distinct identities
  ctx.textAlign = 'center';
  ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#CBD5E1';
  ctx.fillText('OFFICIAL VEMU EMBLEM', 360, 618);
  ctx.fillText('OFFICIAL VEMU IDENTITY', 1560, 666);

  // Final required text stack centered prominently
  ctx.font = '800 88px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('CAMPUSMART', VIRTUAL_W / 2, 622);

  ctx.font = '700 38px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#86EFAC';
  ctx.fillText('BUY SMART. SELL EASY. SHARE MORE.', VIRTUAL_W / 2, 704);

  // Crisp green divider rule
  ctx.fillStyle = EMERALD;
  roundRectPath(ctx, VIRTUAL_W / 2 - 220, 744, 440, 4, 2);
  ctx.fill();

  ctx.font = '700 28px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#F8FAFC';
  ctx.fillText(
    'EXCLUSIVELY FOR VEMU INSTITUTE OF TECHNOLOGY STUDENTS',
    VIRTUAL_W / 2,
    808,
  );
  ctx.restore();

  // Beautiful cinematic fade-out at the end (52.2s - 54.0s)
  if (t > TOTAL_DURATION - 1.8) {
    const fadeOut = easeInOutCubic(clamp01((t - (TOTAL_DURATION - 1.8)) / 1.8));
    ctx.fillStyle = `rgba(4, 9, 7, ${fadeOut})`;
    ctx.fillRect(0, 0, VIRTUAL_W, VIRTUAL_H);
  }
}

/**
 * Renders an exact deterministic 16:9 frame at timestamp `timeSec`.
 */
export function drawCommercialFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  timeSec: number,
  images: LoadedBrandImages,
): void {
  const t = Math.max(0, Math.min(TOTAL_DURATION, timeSec));
  ctx.save();
  ctx.clearRect(0, 0, width, height);
  ctx.scale(width / VIRTUAL_W, height / VIRTUAL_H);

  if (t < 8) {
    renderScene1(ctx, t, images);
  } else if (t < 16) {
    renderScene2(ctx, t, images);
  } else if (t < 23) {
    renderScene3(ctx, t, images);
  } else if (t < 32) {
    renderScene4(ctx, t);
  } else if (t < 39) {
    renderScene5(ctx, t);
  } else if (t < 46) {
    renderScene6(ctx, t);
  } else {
    renderScene7(ctx, t, images);
  }

  // Subtle cross-dissolve curtain on scene transitions (first 0.35s of scenes 2-7)
  const boundaries = [8, 16, 23, 32, 39, 46];
  for (const b of boundaries) {
    const dist = Math.abs(t - b);
    if (dist < 0.28) {
      const dip = (1 - dist / 0.28) * 0.42;
      ctx.fillStyle = `rgba(6, 12, 9, ${dip})`;
      ctx.fillRect(0, 0, VIRTUAL_W, VIRTUAL_H);
    }
  }

  ctx.restore();
}
