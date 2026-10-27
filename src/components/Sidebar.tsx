import React from 'react';
import { MiddleSchool, UserPrefs, GenderType } from '../types';
import { INTEREST_SHORTCUTS, INTEREST_FIELDS } from '../constants';
import { SlidersHorizontal, MapPin, Sparkles, Navigation, X, Check } from 'lucide-react';

interface SidebarProps {
  prefs: UserPrefs;
  middles: MiddleSchool[];
  onUpdatePrefs: (updated: Partial<UserPrefs>) => void;
  onOpenWishlist: () => void;
  isCompact?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  prefs,
  middles,
  onUpdatePrefs,
  onOpenWishlist,
}) => {
  const [isOpen, setIsOpen] = React.useState(true);

  const toggleGender = (gender: GenderType) => {
    onUpdatePrefs({ gender });
  };

  const handleOriginChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdatePrefs({ origin: e.target.value });
  };

  const toggleInterest = (id: string) => {
    const next = prefs.interests.includes(id)
      ? prefs.interests.filter((x) => x !== id)
      : [...prefs.interests, id];
    onUpdatePrefs({ interests: next });
  };

  const toggleField = (fieldId: string) => {
    const next = prefs.fields.includes(fieldId)
      ? prefs.fields.filter((x) => x !== fieldId)
      : [...prefs.fields, fieldId];
    onUpdatePrefs({ fields: next });
  };

  const clearFields = () => {
    onUpdatePrefs({ fields: [] });
  };

  return (
    <aside className="bg-white/90 backdrop-blur-xs rounded-2xl border border-[#ebdcc9] p-5 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#f0e4d4]">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#ed8200]" />
          <h2 className="font-extrabold text-sm sm:text-base text-[#2c2217]">
            학교 찾기 맞춤 설정
          </h2>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-[#fdf5eb] text-[#b85e00] border border-[#f5dfc3]">
          {prefs.gender === 'male' ? '남학생 · 20개교' : '여학생 · 22개교'}
        </span>
      </div>

      {/* 1. Student Gender Segmented Switch */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-[#5c4936] block">학생 구분</label>
        <div className="grid grid-cols-2 p-1 bg-[#f7efe4] rounded-xl border border-[#ebdcc9]">
          <button
            type="button"
            onClick={() => toggleGender('female')}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              prefs.gender === 'female'
                ? 'bg-white text-[#b85e00] shadow-xs'
                : 'text-[#7e6954] hover:text-[#2c2217]'
            }`}
          >
            여학생 (22개교)
          </button>
          <button
            type="button"
            onClick={() => toggleGender('male')}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              prefs.gender === 'male'
                ? 'bg-white text-[#b85e00] shadow-xs'
                : 'text-[#7e6954] hover:text-[#2c2217]'
            }`}
          >
            남학생 (20개교)
          </button>
        </div>
      </div>

      {/* 2. Middle School Selector & Distance Toggle */}
      <div className="space-y-2.5">
        <label htmlFor="origin-select" className="text-xs font-bold text-[#5c4936] flex items-center justify-between">
          <span>다니는 중학교 (출발지)</span>
          {prefs.origin && (
            <button
              onClick={() => onUpdatePrefs({ origin: '' })}
              className="text-[11px] text-[#9c8267] hover:text-[#ed8200] font-normal"
            >
              선택 해제
            </button>
          )}
        </label>
        <div className="relative">
          <select
            id="origin-select"
            value={prefs.origin}
            onChange={handleOriginChange}
            className="w-full bg-[#faf7f2] border border-[#ebdcc9] hover:border-[#d9c4ad] focus:border-[#ed8200] focus:ring-2 focus:ring-[#ed8200]/20 rounded-xl px-3 py-2.5 text-xs text-[#2c2217] font-medium appearance-none cursor-pointer"
          >
            <option value="">중학교를 선택해 주세요</option>
            {middles.map((m) => (
              <option key={m.name} value={m.name}>
                {m.name}
              </option>
            ))}
          </select>
          <MapPin className="w-4 h-4 text-[#b85e00] absolute right-3 top-3 pointer-events-none" />
        </div>

        {/* Distance Checkbox */}
        <label className="flex items-center gap-2 pt-1 text-xs text-[#4b3c2c] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={prefs.distance}
            onChange={(e) => onUpdatePrefs({ distance: e.target.checked })}
            className="w-4 h-4 rounded text-[#ed8200] focus:ring-[#ed8200] border-[#d8c3ad]"
          />
          <span className="font-medium">학교까지 직선거리 표시</span>
        </label>
        <p className="text-[11px] text-[#8e7862] leading-relaxed">
          중학교 좌표 기준 직선거리입니다. 실제 이동시간은 각 학교 카카오맵 길찾기로 확인해 메모할 수 있습니다.
        </p>
      </div>

      {/* 3. Interest Focus Shortcuts */}
      <div className="space-y-2 pt-1 border-t border-[#f0e4d4]">
        <label className="text-xs font-bold text-[#5c4936] block">
          카드에서 먼저 볼 항목 (복수 선택)
        </label>
        <div className="flex flex-wrap gap-1.5">
          {INTEREST_SHORTCUTS.map((item) => {
            const active = prefs.interests.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleInterest(item.id)}
                className={`px-2.5 py-1.5 text-xs rounded-lg font-medium transition-all ${
                  active
                    ? 'bg-[#ed8200] text-white shadow-xs font-semibold'
                    : 'bg-[#faf5ee] text-[#6e5842] hover:bg-[#f2e6d6] border border-[#ebdcc9]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Interest Fields (Field Compare) */}
      <div className="space-y-2.5 pt-1 border-t border-[#f0e4d4]">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[#5c4936] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#ed8200]" />
            <span>관심 학과·분야 (과목 매칭)</span>
          </label>
          {prefs.fields.length > 0 && (
            <button
              onClick={clearFields}
              className="text-[11px] text-[#9c8267] hover:text-[#ed8200]"
            >
              전체 해제
            </button>
          )}
        </div>
        <p className="text-[11px] text-[#8e7862]">
          선택한 진로 분야의 수강 과목을 학교 카드 및 비교표에서 즉시 대조합니다.
        </p>
        <div className="flex flex-wrap gap-1.5">
          {INTEREST_FIELDS.map((field) => {
            const active = prefs.fields.includes(field.id);
            return (
              <button
                key={field.id}
                type="button"
                onClick={() => toggleField(field.id)}
                className={`px-2.5 py-1.5 text-xs rounded-lg font-medium transition-all ${
                  active
                    ? 'bg-[#2a2016] text-white shadow-xs font-semibold'
                    : 'bg-[#faf5ee] text-[#6e5842] hover:bg-[#f2e6d6] border border-[#ebdcc9]'
                }`}
              >
                {active && <Check className="w-3 h-3 inline mr-1" />}
                {field.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Wishlist Quick Card Link */}
      <div className="pt-2 border-t border-[#f0e4d4]">
        <div className="bg-[#fff9f0] border border-[#f5e0c6] rounded-xl p-3.5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-[#8a4b00]">
              내 지망표 ({prefs.wishlist.length}개교 담김)
            </p>
            <p className="text-[11px] text-[#8e7862] mt-0.5">
              순위 정리 및 이미지·PDF 저장
            </p>
          </div>
          <button
            onClick={onOpenWishlist}
            className="px-3 py-1.5 bg-[#ed8200] hover:bg-[#cf7200] text-white text-xs font-bold rounded-lg shadow-xs transition-colors shrink-0"
          >
            보기 →
          </button>
        </div>
      </div>
    </aside>
  );
};
