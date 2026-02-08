import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TestStep } from '../lib/tambo-registry';
import { GripVertical, Trash2, MousePointer, Edit3, Navigation, CheckCircle } from 'lucide-react';

interface TestStepCardProps {
  step: TestStep;
  index: number;
  onUpdate: (id: string, updates: Partial<TestStep>) => void;
  onDelete: (id: string) => void;
}

export function TestStepCard({ step, index, onUpdate, onDelete }: TestStepCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getStepIcon = () => {
    switch (step.type) {
      case 'navigate':
        return <Navigation className="w-5 h-5" />;
      case 'fill':
        return <Edit3 className="w-5 h-5" />;
      case 'click':
        return <MousePointer className="w-5 h-5" />;
      case 'assert':
        return <CheckCircle className="w-5 h-5" />;
    }
  };

  const getStepColor = () => {
    switch (step.type) {
      case 'navigate':
        return 'from-blue-500 to-cyan-500';
      case 'fill':
        return 'from-green-500 to-emerald-500';
      case 'click':
        return 'from-purple-500 to-pink-500';
      case 'assert':
        return 'from-orange-500 to-amber-500';
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="relative pl-14">
      <div
        className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gradient-to-br ${getStepColor()} flex items-center justify-center text-white z-10 border-4 border-slate-950`}
      >
        <span className="text-xs font-bold">{index + 1}</span>
      </div>

      <div className="bg-slate-900 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors shadow-lg">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <button
              {...attributes}
              {...listeners}
              className="mt-1 cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-400 transition-colors"
            >
              <GripVertical className="w-5 h-5" />
            </button>

            <div className={`mt-1 p-2 rounded-lg bg-gradient-to-br ${getStepColor()} bg-opacity-10`}>
              <div className={`bg-gradient-to-br ${getStepColor()} bg-clip-text text-transparent`}>
                {getStepIcon()}
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {step.type}
                </span>
              </div>

              {isEditing ? (
                <input
                  type="text"
                  value={step.description}
                  onChange={(e) =>
                    onUpdate(step.id, { description: e.target.value })
                  }
                  onBlur={() => setIsEditing(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setIsEditing(false);
                  }}
                  autoFocus
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              ) : (
                <p
                  onClick={() => setIsEditing(true)}
                  className="text-slate-200 font-medium cursor-text hover:text-purple-300 transition-colors"
                >
                  {step.description}
                </p>
              )}

              <div className="mt-3 space-y-2">
                {step.params.selector && (
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-500 w-20">Selector:</label>
                    <input
                      type="text"
                      value={step.params.selector}
                      onChange={(e) =>
                        onUpdate(step.id, {
                          params: { ...step.params, selector: e.target.value },
                        })
                      }
                      className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                )}

                {step.params.value && (
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-500 w-20">Value:</label>
                    <input
                      type="text"
                      value={step.params.value}
                      onChange={(e) =>
                        onUpdate(step.id, {
                          params: { ...step.params, value: e.target.value },
                        })
                      }
                      className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                )}

                {step.params.expectedText && (
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-500 w-20">Expected:</label>
                    <input
                      type="text"
                      value={step.params.expectedText}
                      onChange={(e) =>
                        onUpdate(step.id, {
                          params: { ...step.params, expectedText: e.target.value },
                        })
                      }
                      className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => onDelete(step.id)}
              className="mt-1 p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
