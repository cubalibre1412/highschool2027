import React from 'react';
import { School, MiddleSchool, UserPrefs, DetailTabType, SchoolSortType } from '../types';
import { calculateDistance } from '../utils/geo';
import { Sidebar } from './Sidebar';
import { SchoolCard } from './SchoolCard';
import { Search, ArrowUpDown, Sparkles, HelpCircle, CheckCircle, ChevronRight, Layers } from 'lucide-react';

interface SchoolsViewProps {
  schools: School[];
  middles: MiddleSchool[];
  prefs: UserPrefs;
  originMiddle?: MiddleSchool | null;
  onUpdatePrefs: (updated: Partial<UserPrefs>) => void;
  onToggleWishlist: (schoolId: number) => void;
  onToggleCompare: (schoolId: number) => void;
  onOpenDetail: (schoolId: number, tab?: DetailTabType) => void;
  onOpenWishlist: () => void;
}

export const SchoolsView: React.FC<SchoolsViewProps> = ({
  schools,
  middles,
  prefs,
  originMiddle,
  onUpdatePrefs,
  onToggleWishlist,
  onToggleCompare,
  onOpenDetail,
  onOpenWishlist,
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  // Filter eligible schools (male cannot apply to girls schools)
  const eligibleSchools = schools.filter(
    (s) => prefs.gender !== 'male' || !s.girls
  );

  // Search filter (school name, address, subjects)
  const filteredSchools = eligibleSchools.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const nameMatch = s.name.toLowerCase().includes(q);
    const addrMatch = s.address.toLowerCase().includes(q);
    const subjMatch = s.achievement.some((a) => a.subject.toLowerCase().includes(q));
    return nameMatch || addrMatch || subjMatch;
  });

  // Sort schools
  const sortedSchools = [...filteredSchools].sort((a, b) => {
    if (prefs.schoolSort === 'distance' && prefs.distance && originMiddle) {
      const distA = calculateDistance(a, originMiddle) ?? 999;
      const distB = calculateDistance(b, originMiddle) ?? 999;
      return distA - distB;
    }
    if (prefs.schoolSort === 'change') {
      const deltaA = a.quota - a.quota2026;
      const deltaB = b.quota - b.quota2026;
      return deltaB - deltaA; // highest growth first
    }
    // Default: name sort
    return a.name.localeCompare(b.name, 'ko');
  });

  return (
    <div className="space-y-8">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#fff7ec] via-[#fffbf6] to-[#fbf1e3] border border-[#f0deca] p-6 sm:p-10 shadow-sm">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/80 backdrop-blur-xs rounded-full border border-[#ebd5bc] text-xs font-bold text-[#b85e00] shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#ed8200]" />
            <span>2027학년도 부천 일반고 신입생 배정 안내</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-[#261d13] tracking-tight leading-tight">
            부천 고등학교 한눈에
            <span className="block text-lg sm:text-2xl font-bold text-[#8a5d35] mt-1.5 font-sans">
              학교 비교부터 나만의 지망표 완성까지
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-[#69543e] leading-relaxed max-w-2xl">
            부천 22개 일반고의 2027 공식 모집정원(4,836명), 중학교 기준 통학거리, 개설 선택과목 및 학업성취도를 한자리에서 비교하고, 수험생과 가족이 함께 검토할 수 있는 참고용 지망표를 완성하세요.
          </p>

          {/* 3 Steps Guide Visual Indicator */}
          <div className="pt-2">
            <div className="grid grid-cols-3 gap-2 sm:gap-4 p-3 bg-white/70 backdrop-blur-xs rounded-2xl border border-[#ebdcc9] max-w-xl">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#ed8200] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  1
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-[#3d2e1f]">
                  학교 살펴보기
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#faecd8] text-[#8a4b00] flex items-center justify-center font-bold text-xs shrink-0">
                  2
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-[#5c4936]">
                  관심 학교 비교
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#faecd8] text-[#8a4b00] flex items-center justify-center font-bold text-xs shrink-0">
                  3
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-[#5c4936]">
                  지망표 저장
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Ambient watermark pattern */}
        <div className="absolute right-4 bottom-2 opacity-15 pointer-events-none hidden lg:block">
          <img
            src="/brand/jinnmath-logo.jpg"
            alt="진수학 워터마크"
            className="w-56 h-56 object-contain rounded-3xl"
          />
        </div>
      </section>

      {/* Main Workspace (Sidebar + Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Filter Sidebar */}
        <div className="lg:col-span-4 xl:col-span-3.5 space-y-6">
          <Sidebar
            prefs={prefs}
            middles={middles}
            onUpdatePrefs={onUpdatePrefs}
            onOpenWishlist={onOpenWishlist}
          />
        </div>

        {/* Right School Grid Area */}
        <div className="lg:col-span-8 xl:col-span-8.5 space-y-6">
          {/* Toolbar (Count, Search, Sort) */}
          <div className="bg-white/80 backdrop-blur-xs rounded-2xl border border-[#ebdcc9] p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-[#261d13] flex items-center gap-2">
                <span>학교 목록</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-[#fdf5eb] text-[#ed8200] border border-[#f5dfc3]">
                  {sortedSchools.length}개교
                </span>
              </h2>
              <span className="text-xs text-[#8c745c] hidden sm:inline">
                · {prefs.gender === 'male' ? '남학생 20개교 대상' : '여학생 22개교 대상'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Search input */}
              <div className="relative flex-1 sm:w-56">
                <input
                  type="search"
                  placeholder="학교명·동네·과목 검색"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#faf7f2] border border-[#ebdcc9] rounded-xl px-3 py-2 pl-8 text-xs font-medium focus:ring-2 focus:ring-[#ed8200] focus:border-[#ed8200]"
                />
                <Search className="w-3.5 h-3.5 text-[#8c745c] absolute left-2.5 top-2.5 pointer-events-none" />
              </div>

              {/* Sort selector */}
              <div className="relative">
                <select
                  value={prefs.schoolSort}
                  onChange={(e) =>
                    onUpdatePrefs({ schoolSort: e.target.value as SchoolSortType })
                  }
                  aria-label="학교 정렬 기준"
                  className="bg-[#faf7f2] border border-[#ebdcc9] rounded-xl px-3 py-2 pr-7 text-xs font-bold text-[#261d13] appearance-none cursor-pointer focus:ring-2 focus:ring-[#ed8200]"
                >
                  <option value="name">가나다순</option>
                  <option value="distance" disabled={!prefs.distance || !originMiddle}>
                    거리 가까운 순 {(!prefs.distance || !originMiddle) && '(중학교 미선택)'}
                  </option>
                  <option value="change">정원 많이 늘어난 순</option>
                </select>
                <ArrowUpDown className="w-3.5 h-3.5 text-[#8c745c] absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Status guideline bar */}
          <div className="px-1 text-xs text-[#7e6954] flex items-center justify-between">
            <p>
              비교할 학교의 <strong>[비교]</strong> 상자를 체크하거나(최대 4개교), <strong>[지망표 추가]</strong>를 눌러 순위를 구성해 보세요.
            </p>
            {prefs.fields.length > 0 && (
              <span className="text-[11px] font-bold text-[#b85e00] hidden md:inline">
                관심분야 {prefs.fields.length}개 과목 매칭 중
              </span>
            )}
          </div>

          {/* School Cards Grid */}
          {sortedSchools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {sortedSchools.map((s) => (
                <SchoolCard
                  key={s.id}
                  school={s}
                  originMiddle={originMiddle}
                  prefs={prefs}
                  onToggleWishlist={onToggleWishlist}
                  onToggleCompare={onToggleCompare}
                  onOpenDetail={onOpenDetail}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#ebdcc9] p-12 text-center space-y-3">
              <p className="text-base font-bold text-[#261d13]">
                검색 조건에 맞는 학교가 없습니다.
              </p>
              <p className="text-xs text-[#8c745c]">
                다른 검색어를 입력하시거나, 좌측 설정에서 필터를 초기화해 보세요.
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 px-4 py-2 bg-[#faf3e8] hover:bg-[#f3e3ce] text-[#b85e00] font-bold text-xs rounded-xl transition-colors"
              >
                검색어 지우기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
