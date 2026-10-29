import React from 'react';
import { School, MiddleSchool, UserPrefs, DetailTabType, SchoolSortType } from '../types';
import { calculateDistance } from '../utils/geo';
import { Sidebar } from './Sidebar';
import { SchoolCard } from './SchoolCard';
import { SchoolTableView } from './SchoolTableView';
import { Search, ArrowUpDown, Sparkles, Table, LayoutGrid, List } from 'lucide-react';

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
  const [viewMode, setViewMode] = React.useState<'table' | 'compact' | 'cards'>('table');

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
    <div className="space-y-5">
      {/* Compact Sleek Hero Banner Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#fff7ec] via-[#fffbf6] to-[#fbf1e3] border border-[#f0deca] p-4 sm:p-5 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/90 rounded-full border border-[#ebd5bc] text-[11px] font-bold text-[#b85e00] shadow-2xs">
              <Sparkles className="w-3 h-3 text-[#ed8200]" />
              <span>2027학년도 부천 일반고 신입생 배정 가이드</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#261d13] tracking-tight">
              부천 고등학교 한눈에 비교하기
            </h1>
            <p className="text-xs text-[#69543e] leading-snug">
              22개 일반고의 2027 공식 모집정원(4,836명), 중학교 통학거리, 개설 선택과목 및 학업성취도를 한눈에 비교하고 나만의 지망표를 완성하세요.
            </p>
          </div>

          {/* 3 Steps Guide Visual Indicator (Compact) */}
          <div className="flex items-center gap-2 p-2 bg-white/80 backdrop-blur-xs rounded-xl border border-[#ebdcc9] shrink-0 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-[#3d2e1f]">
              <span className="w-5 h-5 rounded-full bg-[#ed8200] text-white flex items-center justify-center text-[10px] shadow-2xs">
                1
              </span>
              <span className="text-[11px]">학교비교</span>
            </div>
            <span className="text-[#c7b39f]">›</span>
            <div className="flex items-center gap-1.5 font-bold text-[#5c4936]">
              <span className="w-5 h-5 rounded-full bg-[#faecd8] text-[#8a4b00] flex items-center justify-center text-[10px]">
                2
              </span>
              <span className="text-[11px]">지망담기</span>
            </div>
            <span className="text-[#c7b39f]">›</span>
            <div className="flex items-center gap-1.5 font-bold text-[#5c4936]">
              <span className="w-5 h-5 rounded-full bg-[#faecd8] text-[#8a4b00] flex items-center justify-center text-[10px]">
                3
              </span>
              <span className="text-[11px]">지망표저장</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Workspace (Sticky Sidebar + Content) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Filter Sidebar (Sticky on PC so Academy Intro and controls are always visible!) */}
        <div className="lg:col-span-4 xl:col-span-3.5 space-y-4 lg:sticky lg:top-4">
          <Sidebar
            prefs={prefs}
            middles={middles}
            onUpdatePrefs={onUpdatePrefs}
            onOpenWishlist={onOpenWishlist}
          />
        </div>

        {/* Right School Content Area */}
        <div className="lg:col-span-8 xl:col-span-8.5 space-y-3.5">
          {/* Toolbar (Count, Search, Sort, ViewMode Switcher) */}
          <div className="bg-white/95 backdrop-blur-xs rounded-2xl border border-[#ebdcc9] p-3 sm:p-3.5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Left: Count & Status */}
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-[#261d13] flex items-center gap-1.5">
                <span>학교 목록</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-[#fdf5eb] text-[#ed8200] border border-[#f5dfc3]">
                  {sortedSchools.length}개교
                </span>
              </h2>
              <span className="text-[11px] text-[#8c745c] hidden sm:inline">
                · {prefs.gender === 'male' ? '남학생 20개교' : '여학생 22개교'}
              </span>
            </div>

            {/* Right: Search + Sort + View Mode Toggle */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Search input */}
              <div className="relative flex-1 sm:w-44">
                <input
                  type="search"
                  placeholder="학교·동네·과목 검색"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#faf7f2] border border-[#ebdcc9] rounded-xl px-2.5 py-1.5 pl-7 text-xs font-medium focus:ring-2 focus:ring-[#ed8200] focus:border-[#ed8200]"
                />
                <Search className="w-3.5 h-3.5 text-[#8c745c] absolute left-2 top-2 pointer-events-none" />
              </div>

              {/* Sort selector */}
              <div className="relative">
                <select
                  value={prefs.schoolSort}
                  onChange={(e) =>
                    onUpdatePrefs({ schoolSort: e.target.value as SchoolSortType })
                  }
                  aria-label="학교 정렬 기준"
                  className="bg-[#faf7f2] border border-[#ebdcc9] rounded-xl px-2.5 py-1.5 pr-6 text-xs font-bold text-[#261d13] appearance-none cursor-pointer focus:ring-2 focus:ring-[#ed8200]"
                >
                  <option value="name">가나다순</option>
                  <option value="distance" disabled={!prefs.distance || !originMiddle}>
                    거리 가까운 순 {(!prefs.distance || !originMiddle) && '(중학교 미선택)'}
                  </option>
                  <option value="change">정원 증가순</option>
                </select>
                <ArrowUpDown className="w-3 h-3 text-[#8c745c] absolute right-2 top-2 pointer-events-none" />
              </div>

              {/* View Mode Toggle (Table / Compact / Cards) */}
              <div className="flex items-center bg-[#f5ede2] p-0.5 rounded-xl border border-[#e5d4c0]">
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  title="한눈에 표로 보기 (추천 - 스크롤 없이 비교)"
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    viewMode === 'table'
                      ? 'bg-white text-[#b85e00] shadow-xs'
                      : 'text-[#7e6954] hover:text-[#2c2217]'
                  }`}
                >
                  <Table className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">표로 보기</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('compact')}
                  title="컴팩트 카드 (화면 넓게 보기)"
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    viewMode === 'compact'
                      ? 'bg-white text-[#b85e00] shadow-xs'
                      : 'text-[#7e6954] hover:text-[#2c2217]'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">컴팩트</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  title="상세 카드 보기"
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    viewMode === 'cards'
                      ? 'bg-white text-[#b85e00] shadow-xs'
                      : 'text-[#7e6954] hover:text-[#2c2217]'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">상세</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Notice Tip */}
          <div className="px-1 text-[11px] text-[#7e6954] flex items-center justify-between">
            <p>
              💡 {viewMode === 'table' ? '표에서 바로 비교 체크박스를 선택하거나 지망표에 담을 수 있습니다.' : '학교 카드의 [비교] 또는 [지망표 추가]를 눌러 맞춤 계획을 세워보세요.'}
            </p>
            {prefs.fields.length > 0 && (
              <span className="text-[11px] font-bold text-[#b85e00] hidden md:inline">
                관심분야 {prefs.fields.length}개 과목 매칭 중
              </span>
            )}
          </div>

          {/* Render according to View Mode */}
          {sortedSchools.length > 0 ? (
            viewMode === 'table' ? (
              <SchoolTableView
                schools={sortedSchools}
                originMiddle={originMiddle}
                prefs={prefs}
                onToggleWishlist={onToggleWishlist}
                onToggleCompare={onToggleCompare}
                onOpenDetail={onOpenDetail}
              />
            ) : viewMode === 'compact' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
                {sortedSchools.map((s) => (
                  <SchoolCard
                    key={s.id}
                    school={s}
                    originMiddle={originMiddle}
                    prefs={prefs}
                    compact={true}
                    onToggleWishlist={onToggleWishlist}
                    onToggleCompare={onToggleCompare}
                    onOpenDetail={onOpenDetail}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sortedSchools.map((s) => (
                  <SchoolCard
                    key={s.id}
                    school={s}
                    originMiddle={originMiddle}
                    prefs={prefs}
                    compact={false}
                    onToggleWishlist={onToggleWishlist}
                    onToggleCompare={onToggleCompare}
                    onOpenDetail={onOpenDetail}
                  />
                ))}
              </div>
            )
          ) : (
            <div className="bg-white rounded-2xl border border-[#ebdcc9] p-10 text-center space-y-3">
              <p className="text-base font-bold text-[#261d13]">
                검색 조건에 맞는 학교가 없습니다.
              </p>
              <p className="text-xs text-[#8c745c]">다른 검색어를 입력하시거나 왼쪽 설정에서 필터를 확인해 보세요.</p>
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
