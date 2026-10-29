import React from 'react';
import { School, MiddleSchool, UserPrefs, DetailTabType } from '../types';
import { shortenSchoolName, formatNumber, getDistanceText, getKakaoRouteUrl } from '../utils/geo';
import { INTEREST_FIELDS } from '../constants';
import { Navigation, Plus, Check, ArrowUpRight, Clock, Info } from 'lucide-react';

interface SchoolTableViewProps {
  schools: School[];
  originMiddle?: MiddleSchool | null;
  prefs: UserPrefs;
  onToggleWishlist: (schoolId: number) => void;
  onToggleCompare: (schoolId: number) => void;
  onOpenDetail: (schoolId: number, tab?: DetailTabType) => void;
}

export const SchoolTableView: React.FC<SchoolTableViewProps> = ({
  schools,
  originMiddle,
  prefs,
  onToggleWishlist,
  onToggleCompare,
  onOpenDetail,
}) => {
  const selectedFieldDefs = INTEREST_FIELDS.filter((f) => prefs.fields.includes(f.id));

  const getMatchedSubjectCount = (school: School) => {
    if (selectedFieldDefs.length === 0) return 0;
    const subjects = new Set<string>();
    school.achievement
      .filter((x) => x.grade > 1)
      .forEach((x) => {
        const cleanName = x.subject.replace(/\s*\([\d.]+\)$/, '');
        if (selectedFieldDefs.some((f) => f.pattern.test(cleanName))) {
          subjects.add(cleanName);
        }
      });
    return subjects.size;
  };

  return (
    <div className="bg-white rounded-2xl border border-[#ebdcc9] shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#f8efe3] border-b border-[#ebdcc9] text-[#5c4a37]">
              <th className="py-3 px-3 font-bold text-center w-12">비교</th>
              <th className="py-3 px-3 font-bold">학교명 / 유형</th>
              <th className="py-3 px-3 font-bold">직선거리 / 길찾기</th>
              <th className="py-3 px-3 font-bold text-right">2027 정원</th>
              <th className="py-3 px-3 font-bold text-right">2026 정원</th>
              <th className="py-3 px-3 font-bold text-center">전년 대비</th>
              <th className="py-3 px-3 font-bold text-center">확인 통학시간</th>
              {selectedFieldDefs.length > 0 && (
                <th className="py-3 px-3 font-bold text-center">관심분야 과목</th>
              )}
              <th className="py-3 px-3 font-bold text-center w-28">지망표</th>
              <th className="py-3 px-3 font-bold text-center w-20">상세</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f2e6d6]">
            {schools.map((s, idx) => {
              const delta = s.quota - s.quota2026;
              const isAdded = prefs.wishlist.includes(s.id);
              const isCompared = prefs.compare.includes(s.id);
              const distText = getDistanceText(s, originMiddle, prefs.distance);
              const kakaoUrl = getKakaoRouteUrl(s, originMiddle);
              const confirmedTime = prefs.times[s.id];
              const matchedCount = getMatchedSubjectCount(s);

              return (
                <tr
                  key={s.id}
                  className={`transition-colors hover:bg-[#fffbf5] ${
                    isAdded ? 'bg-[#fff9f0]/70' : ''
                  }`}
                >
                  {/* Compare checkbox */}
                  <td className="py-2.5 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={isCompared}
                      onChange={() => onToggleCompare(s.id)}
                      className="w-3.5 h-3.5 text-[#ed8200] rounded border-[#d4beaa] focus:ring-[#ed8200] cursor-pointer"
                    />
                  </td>

                  {/* School name & badges */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => onOpenDetail(s.id, 'overview')}
                        className="font-black text-xs sm:text-sm text-[#261d13] hover:text-[#ed8200] text-left underline decoration-[#ed8200]/30"
                      >
                        {shortenSchoolName(s.name)}
                      </button>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                          s.girls
                            ? 'bg-[#ffebee] text-[#c62828]'
                            : 'bg-[#edf4fb] text-[#1976d2]'
                        }`}
                      >
                        {s.girls ? '여고' : '공학'}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#f5ede2] text-[#6b553e]">
                        {s.ownership}
                      </span>
                      {s.name === '수주고등학교' && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#fff8e1] text-[#b78103] font-bold">
                          자공고
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#8c745c] block truncate max-w-xs mt-0.5">
                      {s.address.replace('경기도 부천시 ', '')}
                    </span>
                  </td>

                  {/* Distance & Kakao link */}
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    {prefs.distance && originMiddle ? (
                      <a
                        href={kakaoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#b85e00] hover:underline bg-[#fdf5eb] px-2 py-0.5 rounded-md border border-[#f5dfc3]"
                      >
                        <Navigation className="w-3 h-3 text-[#ed8200]" />
                        <span>{distText}</span>
                        <ArrowUpRight className="w-2.5 h-2.5 opacity-60" />
                      </a>
                    ) : (
                      <span className="text-[#a18a73] text-[11px]">중학교 미선택</span>
                    )}
                  </td>

                  {/* 2027 Quota */}
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <strong className="font-black text-sm text-[#ed8200]">
                      {formatNumber(s.quota, 0)}
                    </strong>
                    <span className="text-[11px] text-[#7d674f] ml-0.5">명</span>
                    {s.classes2027 && (
                      <span className="text-[10px] text-[#9c8267] block">
                        ({s.classes2027}학급)
                      </span>
                    )}
                  </td>

                  {/* 2026 Quota */}
                  <td className="py-2.5 px-3 text-right text-[#594735] whitespace-nowrap">
                    <span>{formatNumber(s.quota2026, 0)}</span>
                    <span className="text-[11px] text-[#8c745c] ml-0.5">명</span>
                  </td>

                  {/* Quota Delta */}
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                        delta > 0
                          ? 'bg-emerald-50 text-emerald-700'
                          : delta < 0
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {delta === 0 ? '변동 없음' : `${delta > 0 ? '+' : ''}${delta}명`}
                    </span>
                  </td>

                  {/* Confirmed Travel Time */}
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    {confirmedTime ? (
                      <span className="text-xs font-bold text-[#b85e00] bg-[#fff6eb] px-2 py-0.5 rounded border border-[#f5e0c8]">
                        약 {confirmedTime}분
                      </span>
                    ) : (
                      <button
                        onClick={() => onOpenDetail(s.id, 'overview')}
                        className="text-[11px] text-[#a18a73] hover:text-[#b85e00] underline"
                      >
                        시간 기록
                      </button>
                    )}
                  </td>

                  {/* Matching subjects count if field selected */}
                  {selectedFieldDefs.length > 0 && (
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      {matchedCount > 0 ? (
                        <button
                          onClick={() => onOpenDetail(s.id, 'curriculum')}
                          className="px-2 py-0.5 bg-[#fdfaf5] text-[#b85e00] font-bold rounded border border-[#ebdcc9] hover:bg-[#faebd9]"
                        >
                          {matchedCount}개 과목 확인
                        </button>
                      ) : (
                        <span className="text-[11px] text-[#a6927d] italic">없음</span>
                      )}
                    </td>
                  )}

                  {/* Wishlist Add/Remove button */}
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onToggleWishlist(s.id)}
                      className={`w-full py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-xs ${
                        isAdded
                          ? 'bg-[#ed8200] text-white hover:bg-[#cf7200]'
                          : 'bg-white text-[#b85e00] hover:bg-[#fff7ee] border border-[#e8d5be]'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>담김</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3 stroke-[2.5]" />
                          <span>지망표 추가</span>
                        </>
                      )}
                    </button>
                  </td>

                  {/* Details button */}
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <button
                      onClick={() => onOpenDetail(s.id, 'overview')}
                      className="px-2.5 py-1.5 bg-[#faf5ee] hover:bg-[#ede0ce] text-[#523f2d] font-semibold text-xs rounded-lg transition-colors"
                    >
                      상세
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
