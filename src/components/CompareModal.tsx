import React from 'react';
import { School, MiddleSchool, UserPrefs, DetailTabType } from '../types';
import { shortenSchoolName, formatNumber, formatRate, getDistanceText } from '../utils/geo';
import { INTEREST_FIELDS } from '../constants';
import { CompareCharts } from './CompareCharts';
import { X, Check, Columns, Sparkles, BookOpen, ExternalLink } from 'lucide-react';

interface CompareModalProps {
  compareIds: number[];
  schools: School[];
  originMiddle?: MiddleSchool | null;
  prefs: UserPrefs;
  onClose: () => void;
  onOpenDetail: (schoolId: number, tab?: DetailTabType) => void;
  onToggleField: (fieldId: string) => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  compareIds,
  schools,
  originMiddle,
  prefs,
  onClose,
  onOpenDetail,
  onToggleField,
}) => {
  const [selectedField, setSelectedField] = React.useState<string>(prefs.fields[0] || 'engineering');

  const comparedSchools = compareIds
    .map((id) => schools.find((s) => s.id === id))
    .filter(Boolean) as School[];

  if (comparedSchools.length < 2) return null;

  const currentFieldDef = INTEREST_FIELDS.find((f) => f.id === selectedField) || INTEREST_FIELDS[0];

  // Get subjects in this field for each school
  const getSubjectsForField = (school: School, pattern: RegExp) => {
    return Array.from(
      new Set(
        school.achievement
          .filter((x) => x.grade > 1)
          .map((x) => x.subject.replace(/\s*\([\d.]+\)$/, ''))
      )
    ).filter((name) => pattern.test(name));
  };

  const schoolSubjectMap = comparedSchools.map((s) => ({
    school: s,
    subjects: getSubjectsForField(s, currentFieldDef.pattern),
  }));

  // Find subjects that exist in ALL compared schools
  const commonSubjects = schoolSubjectMap[0]?.subjects.filter((subj) =>
    schoolSubjectMap.every((item) => item.subjects.includes(subj))
  ) || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-[#fffdfa] rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#ebdcc9] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4.5 bg-[#fbf5ec] border-b border-[#ebdcc9] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#ed8200] text-white rounded-xl shadow-xs">
              <Columns className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#b85e00] tracking-wider uppercase">
                  SIDE BY SIDE COMPARISON
                </span>
                <span className="text-xs bg-white text-[#7d674f] px-2 py-0.5 rounded-full font-bold border border-[#e5d5bf]">
                  {comparedSchools.length}개교 선택
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-[#261d13]">
                학교 나란히 비교하기
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="p-2 text-[#7d674f] hover:text-[#261d13] hover:bg-[#ede0ce] rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-8">
          {/* Visual Comparison Charts Component using Recharts */}
          <CompareCharts
            schools={comparedSchools}
            originMiddle={originMiddle}
            prefs={prefs}
          />

          {/* 1. Core General Comparison Table */}
          <section className="space-y-3">
            <h3 className="font-bold text-sm sm:text-base text-[#2c2115] flex items-center gap-2">
              <span>기본 항목 & 통학·정원 비교</span>
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-[#ebdcc9] bg-white shadow-xs">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-[#f8efe3] border-b border-[#ebdcc9]">
                    <th className="py-3 px-4 font-bold text-[#5c4a37] w-36 sm:w-44 sticky left-0 bg-[#f8efe3] z-10">
                      비교 항목
                    </th>
                    {comparedSchools.map((s) => (
                      <th key={s.id} className="py-3 px-4 font-extrabold text-[#261d13] min-w-36">
                        <button
                          onClick={() => {
                            onClose();
                            onOpenDetail(s.id, 'overview');
                          }}
                          className="hover:text-[#ed8200] text-left underline decoration-[#ed8200]/40 font-black"
                        >
                          {shortenSchoolName(s.name)}
                        </button>
                        <span className="block text-[11px] font-normal text-[#8c745c]">
                          {s.girls ? '여학교' : '남녀공학'} · {s.ownership}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f2e6d6]">
                  {/* Distance */}
                  <tr className="hover:bg-[#fdfaf5]">
                    <td className="py-2.5 px-4 font-semibold text-[#6e5944] sticky left-0 bg-white">
                      직선거리 (출발 중학교)
                    </td>
                    {comparedSchools.map((s) => (
                      <td key={s.id} className="py-2.5 px-4 text-[#2c2115] font-medium">
                        {getDistanceText(s, originMiddle, prefs.distance)}
                      </td>
                    ))}
                  </tr>

                  {/* Directly recorded travel time */}
                  <tr className="hover:bg-[#fdfaf5]">
                    <td className="py-2.5 px-4 font-semibold text-[#6e5944] sticky left-0 bg-white">
                      직접 확인한 편도 시간
                    </td>
                    {comparedSchools.map((s) => (
                      <td key={s.id} className="py-2.5 px-4">
                        {prefs.times[s.id] ? (
                          <span className="font-bold text-[#b85e00] bg-[#fef5ea] px-2 py-0.5 rounded-md">
                            약 {prefs.times[s.id]}분
                          </span>
                        ) : (
                          <span className="text-[#a18a73] italic text-xs">미기록</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* 2027 Quota */}
                  <tr className="hover:bg-[#fdfaf5] bg-[#fffcf7]">
                    <td className="py-2.5 px-4 font-bold text-[#2c2115] sticky left-0 bg-[#fffcf7]">
                      2027 모집정원
                    </td>
                    {comparedSchools.map((s) => (
                      <td key={s.id} className="py-2.5 px-4">
                        <strong className="text-base font-black text-[#ed8200]">
                          {formatNumber(s.quota, 0)}
                        </strong>
                        <span className="text-xs text-[#6e5944] ml-1">명</span>
                        {s.classes2027 && (
                          <span className="text-xs text-[#8c745c] block">
                            ({s.classes2027}학급)
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* 2026 Quota */}
                  <tr className="hover:bg-[#fdfaf5]">
                    <td className="py-2.5 px-4 font-semibold text-[#6e5944] sticky left-0 bg-white">
                      2026 모집정원
                    </td>
                    {comparedSchools.map((s) => (
                      <td key={s.id} className="py-2.5 px-4 text-[#594735]">
                        {formatNumber(s.quota2026, 0)}명
                      </td>
                    ))}
                  </tr>

                  {/* Quota Delta */}
                  <tr className="hover:bg-[#fdfaf5]">
                    <td className="py-2.5 px-4 font-semibold text-[#6e5944] sticky left-0 bg-white">
                      정원 증감 (지난해 대비)
                    </td>
                    {comparedSchools.map((s) => {
                      const delta = s.quota - s.quota2026;
                      return (
                        <td key={s.id} className="py-2.5 px-4 font-bold">
                          <span
                            className={`px-2 py-0.5 rounded text-xs ${
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
                      );
                    })}
                  </tr>

                  {/* 2026 Actual Admissions */}
                  <tr className="hover:bg-[#fdfaf5]">
                    <td className="py-2.5 px-4 font-semibold text-[#6e5944] sticky left-0 bg-white">
                      2026 실제 입학생
                    </td>
                    {comparedSchools.map((s) => {
                      const adm = s.admissions.find((x) => x.year === 2026);
                      return (
                        <td key={s.id} className="py-2.5 px-4 text-[#594735]">
                          {formatNumber(adm?.total || 0, 0)}명
                        </td>
                      );
                    })}
                  </tr>

                  {/* 4-year University Progression */}
                  <tr className="hover:bg-[#fdfaf5]">
                    <td className="py-2.5 px-4 font-semibold text-[#6e5944] sticky left-0 bg-white">
                      4년제 대학교 진학률
                      <span className="block text-[11px] font-normal text-[#917d69]">
                        (전문대 제외 / 졸업자 기준)
                      </span>
                    </td>
                    {comparedSchools.map((s) => {
                      const g = s.graduates.find((x) => x.gender === '합계');
                      return (
                        <td key={s.id} className="py-2.5 px-4">
                          {g ? (
                            <div>
                              <span className="font-extrabold text-[#2c2115]">
                                {formatRate(g.university, g.graduates)}
                              </span>
                              <span className="text-[11px] text-[#8c745c] block">
                                ({g.university}명 / {g.graduates}명)
                              </span>
                            </div>
                          ) : (
                            '—'
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Overall Higher Ed Progression */}
                  <tr className="hover:bg-[#fdfaf5]">
                    <td className="py-2.5 px-4 font-semibold text-[#6e5944] sticky left-0 bg-white">
                      대학 진학률 (전문대 포함)
                    </td>
                    {comparedSchools.map((s) => {
                      const g = s.graduates.find((x) => x.gender === '합계');
                      return (
                        <td key={s.id} className="py-2.5 px-4 font-bold text-[#594735]">
                          {g ? formatRate(g.further_total, g.graduates) : '—'}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Action Link */}
                  <tr className="bg-[#faf5ee]">
                    <td className="py-2.5 px-4 font-semibold text-[#6e5944] sticky left-0 bg-[#faf5ee]">
                      상세 정보 바로가기
                    </td>
                    {comparedSchools.map((s) => (
                      <td key={s.id} className="py-2.5 px-4">
                        <button
                          onClick={() => {
                            onClose();
                            onOpenDetail(s.id, 'overview');
                          }}
                          className="text-xs font-bold text-[#b85e00] hover:text-[#8a4400] underline"
                        >
                          {shortenSchoolName(s.name)} 전체 보기 →
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 2. Field-by-Field Subject Comparison */}
          <section className="space-y-4 pt-4 border-t border-[#ebdcc9]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-[#2c2115] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#ed8200]" />
                  <span>관심 분야별 과목 비교</span>
                </h3>
                <p className="text-xs text-[#7e6954]">
                  선택한 분야의 개설 과목을 학교별로 나란히 대조합니다.
                </p>
              </div>

              {/* Field Select Pills */}
              <div className="flex flex-wrap gap-1.5">
                {INTEREST_FIELDS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedField(f.id)}
                    className={`px-3 py-1.5 text-xs rounded-xl font-bold transition-all ${
                      selectedField === f.id
                        ? 'bg-[#ed8200] text-white shadow-xs'
                        : 'bg-white text-[#6b5641] hover:bg-[#f6ede1] border border-[#ebdcc9]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Common subject banner */}
            {commonSubjects.length > 0 && (
              <div className="p-3 bg-[#e8f5e9] border border-[#c8e6c9] rounded-xl text-xs text-[#2e7d32] flex items-start gap-2">
                <Check className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">함께 확인된 과목: </strong>
                  <span>{commonSubjects.join(', ')}</span>
                  <p className="text-[11px] text-[#388e3c] mt-0.5">
                    비교 중인 모든 학교의 2026학년도 수강 공시 목록에 공통으로 포함되어 있습니다.
                  </p>
                </div>
              </div>
            )}

            {/* Field Table */}
            <div className="overflow-x-auto rounded-2xl border border-[#ebdcc9] bg-white shadow-xs">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-[#f8efe3] border-b border-[#ebdcc9]">
                    <th className="py-3 px-4 font-bold text-[#5c4a37] w-36 sm:w-44 sticky left-0 bg-[#f8efe3]">
                      관심 분야: {currentFieldDef.label}
                    </th>
                    {schoolSubjectMap.map(({ school, subjects }) => (
                      <th key={school.id} className="py-3 px-4 font-bold text-[#261d13] min-w-36">
                        <span>{shortenSchoolName(school.name)}</span>
                        <span className="block text-xs font-semibold text-[#b85e00]">
                          {subjects.length}개 과목 확인
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-4 px-4 font-medium text-[#7d674f] sticky left-0 bg-white align-top">
                      <p className="text-xs">수강 과목 목록</p>
                      <p className="text-[11px] text-[#9c8267] mt-1 leading-relaxed">
                        주요 연계 학과 예시:
                        <br />
                        {currentFieldDef.examples.join(', ')}
                      </p>
                    </td>
                    {schoolSubjectMap.map(({ school, subjects }) => (
                      <td key={school.id} className="py-4 px-4 align-top">
                        {subjects.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {subjects.map((subj) => {
                              const isCommon = commonSubjects.includes(subj);
                              return (
                                <span
                                  key={subj}
                                  className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                                    isCommon
                                      ? 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-300'
                                      : 'bg-[#faf3e8] text-[#5c4935] border border-[#ebd8bf]'
                                  }`}
                                >
                                  {subj}
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-xs text-[#a6927d] italic">
                            공시 확인 과목 없음
                          </span>
                        )}
                        <div className="mt-3">
                          <button
                            onClick={() => {
                              onClose();
                              onOpenDetail(school.id, 'curriculum');
                            }}
                            className="text-[11px] font-semibold text-[#b85e00] hover:underline"
                          >
                            교육과정 전체 보기 →
                          </button>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-xs text-[#8c745c] leading-relaxed">
              ※ 과목 수는 학교 우열을 뜻하지 않습니다. 2026학년도 1학기 2·3학년 성취도 공시에 등장한 실제 과목 기준이며, 2027학년도 신입생의 선택 편성표 및 개설 조건은 학교별 최신 교육과정을 확인해 주세요.
            </p>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#fbf5ec] border-t border-[#ebdcc9] flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#2c2217] hover:bg-[#1a140d] text-white text-xs sm:text-sm font-bold rounded-xl transition-colors shadow-xs"
          >
            비교 창 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
