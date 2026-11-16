import { SCENES, SceneDefinition, formatTimecode } from '../video/timeline';

interface StoryboardSectionProps {
  activeSceneId: string;
  onSelectScene: (scene: SceneDefinition) => void;
}

export function StoryboardSection({ activeSceneId, onSelectScene }: StoryboardSectionProps) {
  return (
    <section id="storyboard" className="py-14 border-t border-slate-200">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-semibold tracking-wide text-emerald-700">
            01. Commercial Storyboard
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
            Seven-Scene 54-Second Breakdown
          </h2>
        </div>
        <p className="text-sm text-slate-600 max-w-md">
          Select any scene below to seek the 16:9 cinema stage directly to that moment.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {SCENES.map((scene) => {
          const isActive = scene.id === activeSceneId;
          return (
            <button
              key={scene.id}
              type="button"
              onClick={() => onSelectScene(scene)}
              aria-current={isActive ? 'step' : undefined}
              className={`text-left p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isActive
                  ? 'bg-emerald-50/70 border-emerald-600 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-emerald-400'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500 font-mono tabular-nums">
                  <span className={isActive ? 'text-emerald-700 font-semibold' : ''}>
                    Scene 0{scene.number}
                  </span>
                  <span>
                    {formatTimecode(scene.startSec).slice(0, 5)} –{' '}
                    {formatTimecode(scene.endSec).slice(0, 5)}
                  </span>
                </div>

                <h3 className="font-display font-bold text-base text-slate-900 mt-2">
                  {scene.title}
                </h3>

                <p className="text-xs font-semibold text-emerald-700 mt-1.5 line-clamp-1">
                  “{scene.headline}”
                </p>

                <p className="text-sm text-slate-600 mt-2 leading-relaxed line-clamp-3">
                  {scene.description}
                </p>
              </div>

              <p className="text-xs text-slate-500 mt-4 pt-3 border-t border-slate-100 truncate">
                {scene.referenceFocus}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
