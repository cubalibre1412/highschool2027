import React from 'react';
import { School } from '../types';
import { shortenSchoolName } from '../utils/geo';
import { Columns, Trash2, ArrowRight } from 'lucide-react';

interface CompareFloatingBarProps {
  compareIds: number[];
  schools: School[];
  onOpenCompare: () => void;
  onClearCompare: () => void;
  onRemoveCompareItem: (id: number) => void;
}

export const CompareFloatingBar: React.FC<CompareFloatingBarProps> = ({
  compareIds,
  schools,
  onOpenCompare,
  onClearCompare,
  onRemoveCompareItem,
}) => {
  if (compareIds.length === 0) return null;

  const comparedSchools = compareIds
    .map((id) => schools.find((s) => s.id === id))
    .filter(Boolean) as School[];

  const canCompare = comparedSchools.length >= 2;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-full max-w-2xl px-4 animate-in slide-in-from-bottom-3 duration-200">
      <div className="bg-[#2c2217]/95 backdrop-blur-md text-white rounded-2xl shadow-xl p-3 sm:p-4 border border-[#524130] flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Selected School Tags */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto py-1">
          <div className="flex items-center gap-1.5 text-xs text-[#ed8200] font-bold shrink-0">
            <Columns className="w-4 h-4" />
            <span>비교 ({comparedSchools.length}/4):</span>
          </div>
          <div className="flex items-center gap-1.5">
            {comparedSchools.map((s) => (
              <span
                key={s.id}
                className="inline-flex items-center gap-1 bg-[#423323] text-stone-200 text-xs px-2.5 py-1 rounded-lg border border-[#5a4835]"
              >
                <span>{shortenSchoolName(s.name)}</span>
                <button
                  onClick={() => onRemoveCompareItem(s.id)}
                  aria-label={`${s.name} 비교 제거`}
                  className="text-stone-400 hover:text-white ml-0.5"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
          <button
            onClick={onClearCompare}
            title="선택한 비교 학교 모두 지우기"
            className="p-2 text-stone-400 hover:text-stone-200 hover:bg-[#3d2f21] rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenCompare}
            disabled={!canCompare}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all ${
              canCompare
                ? 'bg-[#ed8200] hover:bg-[#ff941a] text-white cursor-pointer'
                : 'bg-stone-700 text-stone-400 cursor-not-allowed'
            }`}
          >
            <span>
              {canCompare ? `${comparedSchools.length}개 학교 비교하기` : '1곳 더 선택해 주세요'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
