import React from 'react';
import { School, MiddleSchool, UserPrefs, DetailTabType } from '../types';
import { shortenSchoolName, formatNumber, getDistanceText, getKakaoRouteUrl } from '../utils/geo';
import { INTEREST_FIELDS } from '../constants';
import { Navigation, Plus, Check, ArrowUpRight, School as SchoolIcon, Users, ChevronDown, ChevronUp } from 'lucide-react';

interface SchoolCardProps {
  school: School;
  originMiddle?: MiddleSchool | null;
  prefs: UserPrefs;
  onToggleWishlist: (schoolId: number) => void;
  onToggleCompare: (schoolId: number) => void;
  onOpenDetail: (schoolId: number, tab?: DetailTabType) => void;
}

export const SchoolCard: React.FC<SchoolCardProps> = ({
  school,
  originMiddle,
  prefs,
  onToggleWishlist,
  onToggleCompare,
  onOpenDetail,
}) => {
  const [showAdmissionsDetail, setShowAdmissionsDetail] = React.useState(false);

  const delta = school.quota - school.quota2026;
  const isAdded = prefs.wishlist.includes(school.id);
  const isCompared = prefs.compare.includes(school.id);
  const distText = getDistanceText(school, originMiddle, prefs.distance);
  const kakaoUrl = getKakaoRouteUrl(school, originMiddle);
  const adm2026 = school.admissions.find((x) => x.year === 2026);

  // Filter interest groups
  const selectedFieldDefs = INTEREST_FIELDS.filter((f) => prefs.fields.includes(f.id));

  const getMatchedSubjects = (fieldPattern: RegExp) => {
    const subjects = Array.from(
      new Set(
        school.achievement
          .filter((x) => x.grade > 1)
          .map((x) => x.subject.replace(/\s*\([\d.]+\)$/, ''))
      )
    ).filter((name) => fieldPattern.test(name));
    return subjects;
  };

  const allButtons: { key: DetailTabType; label: string }[] = [
    { key: 'curriculum', label: '선택과목' },
    { key: 'assessment', label: '평가 방식' },
    { key: 'achievement', label: '성취도' },
    { key: 'graduates', label: '졸업 후 진로' },
  ];
  const interestButtons = allButtons.filter((btn) => prefs.interests.includes(btn.key));

  return (
    <article
      className={`relative bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between p-5 hover:shadow-md ${
        isAdded
          ? 'border-[#ed8200] ring-1 ring-[#ed8200]/30 shadow-xs'
          : 'border-[#ebdcc9] hover:border-[#dfc9b2]'
      }`}
    >
      <div>
        {/* Title row & Compare Checkbox */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <button
            type="button"
            onClick={() => onOpenDetail(school.id, 'overview')}
            className="text-left group"
          >
            <h3 className="font-extrabold text-lg sm:text-xl text-[#261d14] group-hover:text-[#ed8200] transition-colors flex items-center gap-1.5">
              <span>{shortenSchoolName(school.name)}</span>
              <span className="text-xs font-normal text-[#8f7962] group-hover:text-[#ed8200]">
                ({school.name})
              </span>
            </h3>
          </button>

          <label className="flex items-center gap-1.5 text-xs text-[#6e5842] cursor-pointer select-none py-1 px-2 rounded-lg hover:bg-[#fcf8f2] border border-transparent hover:border-[#ebdcc9] transition-colors">
            <input
              type="checkbox"
              checked={isCompared}
              onChange={() => onToggleCompare(school.id)}
              className="w-3.5 h-3.5 text-[#ed8200] rounded border-[#d4beaa] focus:ring-[#ed8200]"
            />
            <span className="font-semibold">비교</span>
          </label>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
              school.girls
                ? 'bg-[#ffebee] text-[#c62828] border border-[#ffcdd2]'
                : 'bg-[#edf4fb] text-[#1976d2] border border-[#bbdefb]'
            }`}
          >
            {school.girls ? '여고' : '남녀공학'}
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-[#f5ede2] text-[#6b553e] border border-[#ebdcc9]">
            {school.ownership}
          </span>
          {school.name === '수주고등학교' && (
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-[#fff8e1] text-[#b78103] border border-[#ffe082]">
              자율형 공립고
            </span>
          )}
          {prefs.distance && originMiddle && (
            <a
              href={kakaoUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="카카오맵 대중교통 길찾기 새창"
              className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-semibold bg-[#fdf5eb] text-[#b85e00] border border-[#f5dfc3] hover:bg-[#faebd9] transition-colors"
            >
              <Navigation className="w-3 h-3 text-[#ed8200]" />
              <span>{distText}</span>
              <ArrowUpRight className="w-3 h-3 opacity-60" />
            </a>
          )}
        </div>

        {/* Address */}
        <p className="text-xs text-[#7e6954] mb-3.5 line-clamp-1">
          {school.address.replace('경기도 부천시 ', '')}
        </p>

        {/* Quota Metrics Grid */}
        <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-[#faf6f0] border border-[#ede0ce] mb-3">
          <div>
            <span className="text-[11px] text-[#78634d] block font-medium">
              2027 모집정원
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <strong className="text-lg font-black text-[#261d14]">
                {formatNumber(school.quota, 0)}
              </strong>
              <span className="text-xs text-[#78634d]">명</span>
              {school.classes2027 && (
                <span className="text-[11px] text-[#917d68] ml-1">
                  ({school.classes2027}학급)
                </span>
              )}
            </div>
          </div>
          <div>
            <span className="text-[11px] text-[#78634d] block font-medium">
              2026 모집정원
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <strong className="text-base font-bold text-[#5c4a37]">
                {formatNumber(school.quota2026, 0)}
              </strong>
              <span className="text-xs text-[#78634d]">명</span>
            </div>
          </div>
        </div>

        {/* Quota Delta text */}
        <div className="flex items-center justify-between text-xs text-[#6e5944] mb-3 px-1">
          <span>지난해와 비교:</span>
          <span
            className={`font-bold px-2 py-0.5 rounded-md ${
              delta > 0
                ? 'bg-emerald-50 text-emerald-700'
                : delta < 0
                ? 'bg-rose-50 text-rose-700'
                : 'bg-stone-100 text-stone-600'
            }`}
          >
            {delta === 0
              ? '변동 없음'
              : `${Math.abs(delta)}명 ${delta > 0 ? '증가 ↑' : '감소 ↓'}`}
          </span>
        </div>

        {/* Matching field subjects preview (if user selected interest fields) */}
        {selectedFieldDefs.length > 0 && (
          <div className="space-y-2 p-3 bg-[#fdfaf5] border border-[#ebdcc9] rounded-xl mb-3 text-xs">
            <span className="font-bold text-[#8a4b00] text-[11px] block">관심 분야 관련 수강 과목 (2026 공시 기준)</span>
            {selectedFieldDefs.map((field) => {
              const matched = getMatchedSubjects(field.pattern);
              return (
                <div key={field.id} className="text-xs">
                  <div className="flex items-center justify-between text-[#594735] font-semibold text-[11px]">
                    <span>{field.label}</span>
                    <span className="text-[#a18871]">{matched.length}개 확인</span>
                  </div>
                  {matched.length > 0 ? (
                    <p className="text-[11px] text-[#715c46] line-clamp-2 mt-0.5">
                      {matched.slice(0, 4).join(' · ')}
                      {matched.length > 4 && ` 외 ${matched.length - 4}개`}
                    </p>
                  ) : (
                    <p className="text-[11px] text-[#a6927d] italic">공시 과목 없음</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Interest quick shortcuts */}
        {interestButtons.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {interestButtons.map((btn) => (
              <button
                key={btn.key}
                type="button"
                onClick={() => onOpenDetail(school.id, btn.key)}
                className="text-[11px] font-semibold text-[#8a4b00] bg-[#fbf3e6] hover:bg-[#f6e5ce] px-2.5 py-1 rounded-lg border border-[#f2ddc2] transition-colors flex items-center gap-1"
              >
                <span>{btn.label}</span>
                <span className="text-[#c46900]">›</span>
              </button>
            ))}
          </div>
        )}

        {/* Collapsible 2026 actual admissions intake */}
        <div className="mb-4 text-xs">
          <button
            type="button"
            onClick={() => setShowAdmissionsDetail(!showAdmissionsDetail)}
            className="flex items-center gap-1 text-[#8f7962] hover:text-[#523e2a] text-[11px] font-medium py-1"
          >
            <span>2026학년도 실제 입학생 보기</span>
            {showAdmissionsDetail ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
          {showAdmissionsDetail && (
            <div className="mt-1 p-2.5 bg-[#f5ede2] rounded-lg text-[#5a4735] text-[11px] animate-in fade-in duration-150">
              <p>
                <strong>2026학년도 실제 입학생: {formatNumber(adm2026?.total || 0, 0)}명</strong>
                {adm2026 && !school.girls && (
                  <span className="ml-1 text-[#78634d]">
                    (남 {adm2026.male} · 여 {adm2026.female})
                  </span>
                )}
              </p>
              <p className="text-[#8c745c] mt-0.5">※ 실제 입학 인원은 전형 및 결원 충원 등에 따라 모집정원과 다를 수 있습니다.</p>
            </div>
          )}
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="pt-3 border-t border-[#f0e4d4] flex items-center gap-2">
        <button
          type="button"
          onClick={() => onOpenDetail(school.id, 'overview')}
          className="flex-1 py-2 text-xs font-bold text-[#69543f] hover:text-[#2c2217] bg-[#f7efe4] hover:bg-[#ede0ce] rounded-xl transition-colors text-center"
        >
          학교 정보 보기
        </button>
        <button
          type="button"
          onClick={() => onToggleWishlist(school.id)}
          className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs ${
            isAdded
              ? 'bg-[#ed8200] text-white hover:bg-[#cf7200]'
              : 'bg-white text-[#b85e00] hover:bg-[#fff7ee] border border-[#e8d5be]'
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>지망표 담김</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>지망표 추가</span>
            </>
          )}
        </button>
      </div>
    </article>
  );
};
