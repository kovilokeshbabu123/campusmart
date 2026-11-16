import { useState } from 'react';
import { BRAND_ASSETS } from '../video/timeline';

export function BrandReferencesSection() {
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const markFailed = (key: string) => {
    setFailedImages((prev) => ({ ...prev, [key]: true }));
  };

  return (
    <section id="brand-assets" className="py-14 border-t border-slate-200">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-semibold tracking-wide text-emerald-700">
            03. Official Brand References
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
            VEMU Institute of Technology Assets &amp; CampusMart Identity
          </h2>
        </div>
        <p className="text-sm text-slate-600 max-w-md">
          All three official VEMU Institute of Technology assets are preserved verbatim and kept
          visually distinct from the green-and-white CampusMart brand.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {/* Reference Image 1 */}
        <article className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col">
          <div className="aspect-[16/10] rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
            {failedImages.campus ? (
              <span className="text-xs text-slate-500">VEMU Campus Aerial Photograph</span>
            ) : (
              <img
                src={BRAND_ASSETS.campusPhoto}
                alt="Actual VEMU Institute of Technology campus photograph"
                referrerPolicy="no-referrer"
                onError={() => markFailed('campus')}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="mt-4">
            <p className="text-xs font-mono text-slate-500">Reference 01 · Hero Showcase</p>
            <h3 className="font-display font-bold text-base text-slate-900 mt-1">
              Actual VEMU Campus Environment
            </h3>
            <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
              Preserves the recognizable white academic buildings, lawns, and landscaping at P.
              Kothakota.
            </p>
          </div>
        </article>

        {/* Reference Image 2 */}
        <article className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col">
          <div className="aspect-[16/10] rounded-lg overflow-hidden bg-white border border-slate-100 flex items-center justify-center p-3">
            {failedImages.emblem ? (
              <span className="text-xs text-slate-500">Official VEMU Emblem</span>
            ) : (
              <img
                src={BRAND_ASSETS.officialEmblem}
                alt="Official VEMU Institute of Technology emblem"
                referrerPolicy="no-referrer"
                onError={() => markFailed('emblem')}
                className="max-h-full max-w-full object-contain"
              />
            )}
          </div>
          <div className="mt-4">
            <p className="text-xs font-mono text-slate-500">Reference 02 · Institutional Crest</p>
            <h3 className="font-display font-bold text-base text-slate-900 mt-1">
              Official VEMU Emblem
            </h3>
            <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
              Original gear crest, colors, ESTD: 2008 ribbon, and lettering rendered completely
              unaltered.
            </p>
          </div>
        </article>

        {/* Reference Image 3 */}
        <article className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col">
          <div className="aspect-[16/10] rounded-lg overflow-hidden bg-[#061836] flex items-center justify-center p-2">
            {failedImages.branding ? (
              <span className="text-xs text-slate-200">Official VEMU Branding Artwork</span>
            ) : (
              <img
                src={BRAND_ASSETS.officialBranding}
                alt="Official VEMU Institute of Technology branding artwork"
                referrerPolicy="no-referrer"
                onError={() => markFailed('branding')}
                className="max-h-full max-w-full object-contain"
              />
            )}
          </div>
          <div className="mt-4">
            <p className="text-xs font-mono text-slate-500">Reference 03 · Official Lockup</p>
            <h3 className="font-display font-bold text-base text-slate-900 mt-1">
              Official VEMU Branding Artwork
            </h3>
            <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
              Autonomous Institution lockup and campus address displayed intact for campus trust.
            </p>
          </div>
        </article>

        {/* Separate CampusMart Brand Identity Card */}
        <article className="bg-emerald-950 text-white rounded-xl p-4 flex flex-col justify-between">
          <div className="aspect-[16/10] rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex flex-col items-center justify-center p-4">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-md">
              <svg
                viewBox="0 0 32 32"
                className="w-7 h-7"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M11 11V9a5 5 0 0 1 10 0v2"
                  stroke="#16A34A"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <rect x="6" y="11" width="20" height="15" rx="3" fill="#16A34A" />
                <path
                  d="M10.5 20.5L13.5 16L16 19L18.5 16L21.5 20.5"
                  stroke="#FFFFFF"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="font-display font-extrabold tracking-tight text-lg text-white mt-2">
              CAMPUSMART
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-mono text-emerald-300">Marketplace Identity · Green &amp; White</p>
            <h3 className="font-display font-bold text-base text-white mt-1">
              Distinct CampusMart Brand
            </h3>
            <p className="text-sm text-emerald-100/80 mt-1.5 leading-relaxed">
              Visually independent emerald green &amp; crisp white identity for student commerce.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
