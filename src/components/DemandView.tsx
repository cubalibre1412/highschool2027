import React from 'react';
import { School, AppData, DetailTabType } from '../types';
import { shortenSchoolName, formatNumber, formatRate } from '../utils/geo';
import { Sliders, RefreshCw, AlertCircle, TrendingDown, Users, Scale, ArrowRight } from 'lucide-react';

interface DemandViewProps {
  appData: AppData;
  schools: School[];
  onOpenDetail: (schoolId: number, tab?: DetailTabType) => void;
}

export const DemandView: React.FC<DemandViewProps> = ({
  appData,
  schools,
  onOpenDetail,
}) => {
  const [simMale, setSimMale] = React.useState<number>(100);
  const [simFemale, setSimFemale] = React.useState<number>(100);
  const [simSplit, setSimSplit] = React.useState<number>(50);

  const pop = appData.population;
  const adm2026 = appData.admissions.filter((x) => x.year === 2026);
  const m2026Actual = adm2026.reduce((sum, x) => sum + x.male, 0);
  const f2026Actual = adm2026.reduce((sum, x) => sum + x.female, 0);

  // Baseline projected ratios: (2026 actual / 2025 middle 3rd graders) * 2026 middle 3rd graders
  const pMaleBase = (m2026Actual / pop['2025'].male) * pop['2026'].male;
  const pFemaleBase = (f2026Actual / pop['2025'].female) * pop['2026'].female;

  // With simulation slider adjustment
  const projectedMale = (pMaleBase * simMale) / 100;
  const projectedFemale = (pFemaleBase * simFemale) / 100;
  const projectedTotal = projectedMale + projectedFemale;

  const TOTAL_QUOTA = 4836;
  const COED_QUOTA = 4428;
  const GIRLS_QUOTA = 408;

  // Assumed capacity for male and female
  const assumedMaleQuota = (COED_QUOTA * simSplit) / 100;
  const assumedFemaleQuota = TOTAL_QUOTA - assumedMaleQuota; // includes girls schools 408

  const diffTotal = projectedTotal - TOTAL_QUOTA;
  const diffMale = projectedMale - assumedMaleQuota;
  const diffFemale = projectedFemale - assumedFemaleQuota;

  const resetSim = () => {
    setSimMale(100);
    setSimFemale(100);
    setSimSplit(50);
  };

  const bucheonHigh2026 = appData.admissions.find(
    (x) => x.school === '부천고등학교' && x.year === 2026
  );

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="bg-white rounded-3xl border border-[#ebdcc9] p-6 sm:p-8 shadow-xs">
        <span className="text-xs font-bold text-[#b85e00] tracking-wider uppercase">
          DEMAND & QUOTA ANALYSIS
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-[#261d13] mt-1">
          2027학년도 정원과 예상 인원 시뮬레이터
        </h1>
        <p className="text-xs sm:text-sm text-[#7d674f] mt-1.5 leading-relaxed max-w-3xl">
          전년도 실제 입학생 수와 올해 중3 학생 수를 토대로 부천 일반고 지원 규모를 가늠해 봅니다. 
          지원자의 성별 및 유출입 변수를 직접 조절하며 예상 정원 과부족을 확인하세요. (※ 실제 선발 결과가 아닙니다)
        </p>

        {/* Top 3 KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 bg-[#faf6f0] rounded-2xl border border-[#ede0ce]">
            <span className="text-xs text-[#7d674f] block font-medium">
              2026년 부천 중3 학생수
            </span>
            <strong className="text-2xl sm:text-3xl font-black text-[#261d13] mt-1 block">
              {formatNumber(pop['2026'].total, 0)}명
            </strong>
            <p className="text-xs text-[#8c745c] mt-1">
              남 {formatNumber(pop['2026'].male, 0)} · 여 {formatNumber(pop['2026'].female, 0)} (전년 {formatNumber(pop['2025'].total, 0)}명)
            </p>
          </div>

          <div className="p-4 bg-[#faf6f0] rounded-2xl border border-[#ede0ce]">
            <span className="text-xs text-[#7d674f] block font-medium">
              2026학년도 일반고 실제 입학생
            </span>
            <strong className="text-2xl sm:text-3xl font-black text-[#5c4a37] mt-1 block">
              {formatNumber(m2026Actual + f2026Actual, 0)}명
            </strong>
            <p className="text-xs text-[#8c745c] mt-1">
              남 {formatNumber(m2026Actual, 0)} · 여 {formatNumber(f2026Actual, 0)} (당시 부천고 포함 23개교)
            </p>
          </div>

          <div className="p-4 bg-[#fffaf0] rounded-2xl border border-[#f5dfc3]">
            <span className="text-xs text-[#b85e00] block font-medium">
              2027학년도 부천 일반고 모집정원
            </span>
            <strong className="text-2xl sm:text-3xl font-black text-[#ed8200] mt-1 block">
              {formatNumber(TOTAL_QUOTA, 0)}명
            </strong>
            <p className="text-xs text-[#8c745c] mt-1">
              남녀공학 4,428명 · 여학교 408명 (총 22개교 195학급)
            </p>
          </div>
        </div>
      </div>

      {/* Main Simulation Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive Controls & Real-time Output */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white rounded-2xl border border-[#ebdcc9] p-5 sm:p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0e4d4]">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#ed8200]" />
                <h2 className="font-extrabold text-sm sm:text-base text-[#261d13]">
                  예상 지원 인원 시뮬레이션
                </h2>
              </div>
              <button
                onClick={resetSim}
                className="text-xs text-[#8c745c] hover:text-[#ed8200] flex items-center gap-1 font-semibold"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>기본값 초기화</span>
              </button>
            </div>

            <p className="text-xs text-[#7d674f] leading-relaxed">
              기본 예상치는 <code>2026 실제 입학생 ÷ 2025 중3 × 2026 중3</code> 기준입니다. 
              타 지역 유출입이나 특목·특성화고 진학률 변동에 따라 아래 슬라이더로 조절해 보세요.
            </p>

            {/* Slider: Male Factor */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-[#261d13]">
                <label htmlFor="sim-male">남학생 진학 규모 조정</label>
                <span className="text-[#ed8200]">{simMale}%</span>
              </div>
              <input
                id="sim-male"
                type="range"
                min="85"
                max="115"
                value={simMale}
                onChange={(e) => setSimMale(Number(e.target.value))}
                className="w-full accent-[#ed8200] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-[#9c8267]">
                <span>85% (진학 감소)</span>
                <span>100% (기본값)</span>
                <span>115% (진학 증가)</span>
              </div>
            </div>

            {/* Slider: Female Factor */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-[#261d13]">
                <label htmlFor="sim-female">여학생 진학 규모 조정</label>
                <span className="text-[#ed8200]">{simFemale}%</span>
              </div>
              <input
                id="sim-female"
                type="range"
                min="85"
                max="115"
                value={simFemale}
                onChange={(e) => setSimFemale(Number(e.target.value))}
                className="w-full accent-[#ed8200] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-[#9c8267]">
                <span>85% (진학 감소)</span>
                <span>100% (기본값)</span>
                <span>115% (진학 증가)</span>
              </div>
            </div>

            {/* Projected Total KPI Box */}
            <div className="p-4 bg-gradient-to-br from-[#fffaf0] to-[#fcf4e8] rounded-2xl border border-[#ebd5bc] space-y-2">
              <span className="text-xs text-[#7d674f] block font-semibold">
                시뮬레이션 예상 입학 인원
              </span>
              <div className="flex items-baseline gap-2">
                <strong className="text-2xl sm:text-3xl font-black text-[#261d13]">
                  {formatNumber(Math.round(projectedTotal), 0)}명
                </strong>
                <span className="text-xs text-[#8c745c]">
                  / 총 모집정원 4,836명
                </span>
              </div>
              <p className="text-xs text-[#6e5842]">
                남학생 약 {formatNumber(Math.round(projectedMale), 0)}명 · 여학생 약 {formatNumber(Math.round(projectedFemale), 0)}명
              </p>

              <div className="pt-2 border-t border-[#ebd8bf]">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-extrabold ${
                    diffTotal > 0
                      ? 'bg-rose-100 text-rose-800'
                      : diffTotal < 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-stone-100 text-stone-700'
                  }`}
                >
                  <span>
                    총 정원 대비 {formatNumber(Math.round(Math.abs(diffTotal)), 0)}명{' '}
                    {diffTotal > 0 ? '초과 (경쟁 발생 가능)' : '여유 (정원 미달 가능)'}
                  </span>
                </span>
              </div>
            </div>

            {/* Slider: Co-ed Male Ratio Split */}
            <div className="pt-2 border-t border-[#f0e4d4] space-y-2">
              <div className="flex justify-between text-xs font-bold text-[#261d13]">
                <label htmlFor="sim-split">남녀공학(4,428명) 내 남학생 비율 가정</label>
                <span className="text-[#b85e00] font-black">{simSplit}%</span>
              </div>
              <input
                id="sim-split"
                type="range"
                min="40"
                max="60"
                value={simSplit}
                onChange={(e) => setSimSplit(Number(e.target.value))}
                className="w-full accent-[#ed8200] cursor-pointer"
              />
              <p className="text-[11px] text-[#8c745c]">
                공학 학교의 실제 남녀 배정 비율은 지원 상황에 따라 결정됩니다. (여고 2개교 정원 408명은 여학생 전용)
              </p>
            </div>

            {/* Gender Breakdown Output Table */}
            <div className="overflow-x-auto rounded-xl border border-[#ebdcc9]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#f8efe3] border-b border-[#ebdcc9] text-[#5c4a37]">
                    <th className="py-2.5 px-3 font-bold">성별 구분</th>
                    <th className="py-2.5 px-3 font-bold text-right">예상 수요</th>
                    <th className="py-2.5 px-3 font-bold text-right">가정한 배정정원</th>
                    <th className="py-2.5 px-3 font-bold text-right">정원 과부족</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f2e6d6]">
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-[#261d13]">남학생</td>
                    <td className="py-2.5 px-3 text-right">{formatNumber(Math.round(projectedMale), 0)}명</td>
                    <td className="py-2.5 px-3 text-right">{formatNumber(Math.round(assumedMaleQuota), 0)}명</td>
                    <td className="py-2.5 px-3 text-right font-bold">
                      <span className={diffMale > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                        {diffMale > 0 ? '+' : ''}{formatNumber(Math.round(diffMale), 0)}명
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-[#261d13]">여학생</td>
                    <td className="py-2.5 px-3 text-right">{formatNumber(Math.round(projectedFemale), 0)}명</td>
                    <td className="py-2.5 px-3 text-right">{formatNumber(Math.round(assumedFemaleQuota), 0)}명</td>
                    <td className="py-2.5 px-3 text-right font-bold">
                      <span className={diffFemale > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                        {diffFemale > 0 ? '+' : ''}{formatNumber(Math.round(diffFemale), 0)}명
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Explanations & Raw Data Basis */}
        <div className="lg:col-span-6 space-y-6">
          {/* Quota Comparison Graphic Card */}
          <div className="bg-white rounded-2xl border border-[#ebdcc9] p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm sm:text-base text-[#261d13]">
              부천 일반고 정원은 어떻게 달라졌나요?
            </h3>

            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between text-xs text-[#5c4936] mb-1 font-semibold">
                  <span>2026학년도 모집정원</span>
                  <span>5,037명</span>
                </div>
                <div className="h-4 w-full bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-stone-400 rounded-full w-[80%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-[#ed8200] mb-1 font-bold">
                  <span>2027학년도 모집정원</span>
                  <span>4,836명</span>
                </div>
                <div className="h-4 w-full bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#ed8200] rounded-full w-[76.8%]" />
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#faf6f0] rounded-xl border border-[#ede0ce] text-xs text-[#6e5842] leading-relaxed space-y-2">
              <p className="font-bold text-[#261d13]">
                전체 정원 변화: 총 -201명 감소
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li>
                  <strong>부천고등학교의 과학고 전환:</strong> 2027년 3월 경기북과학고에 이은 전환으로 일반고 선발 대상(168명)에서 제외되었습니다.
                </li>
                <li>
                  <strong>나머지 22개 일반고 합계:</strong> 학급당 인원 조정 등에 따라 33명 순감소했습니다.
                </li>
              </ul>
            </div>
          </div>

          {/* Raw Data Table */}
          <div className="bg-white rounded-2xl border border-[#ebdcc9] p-5 shadow-xs space-y-3">
            <h3 className="font-extrabold text-sm text-[#261d13]">
              계산에 쓰인 원자료 대조표
            </h3>
            <div className="overflow-x-auto rounded-xl border border-[#ebdcc9]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#f8efe3] border-b border-[#ebdcc9] text-[#5c4a37]">
                    <th className="py-2 px-3 font-bold">구분 항목</th>
                    <th className="py-2 px-3 font-bold text-right">남학생</th>
                    <th className="py-2 px-3 font-bold text-right">여학생</th>
                    <th className="py-2 px-3 font-bold text-right">전체 합계</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f2e6d6]">
                  <tr>
                    <td className="py-2 px-3 font-semibold text-[#261d13]">2025년 부천 중3</td>
                    <td className="py-2 px-3 text-right">{formatNumber(pop['2025'].male, 0)}</td>
                    <td className="py-2 px-3 text-right">{formatNumber(pop['2025'].female, 0)}</td>
                    <td className="py-2 px-3 text-right font-bold">{formatNumber(pop['2025'].total, 0)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-[#261d13]">2026년 부천 중3</td>
                    <td className="py-2 px-3 text-right">{formatNumber(pop['2026'].male, 0)}</td>
                    <td className="py-2 px-3 text-right">{formatNumber(pop['2026'].female, 0)}</td>
                    <td className="py-2 px-3 text-right font-bold">{formatNumber(pop['2026'].total, 0)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-[#261d13]">2026 실제 입학생</td>
                    <td className="py-2 px-3 text-right">{formatNumber(m2026Actual, 0)}</td>
                    <td className="py-2 px-3 text-right">{formatNumber(f2026Actual, 0)}</td>
                    <td className="py-2 px-3 text-right font-bold">{formatNumber(m2026Actual + f2026Actual, 0)}</td>
                  </tr>
                  <tr className="bg-[#faf6f0] font-bold">
                    <td className="py-2 px-3 text-[#b85e00]">기준 진학비율</td>
                    <td className="py-2 px-3 text-right">{formatRate(m2026Actual, pop['2025'].male)}</td>
                    <td className="py-2 px-3 text-right">{formatRate(f2026Actual, pop['2025'].female)}</td>
                    <td className="py-2 px-3 text-right">
                      {formatRate(m2026Actual + f2026Actual, pop['2025'].total)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Full 22 Schools Quota Change Table */}
      <section className="bg-white rounded-3xl border border-[#ebdcc9] p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-base sm:text-lg font-black text-[#261d13]">
          부천 관내 고등학교별 2026 vs 2027 모집정원 상세 변화
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-[#ebdcc9]">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-[#f8efe3] border-b border-[#ebdcc9] text-[#5c4a37]">
                <th className="py-3 px-4 font-bold">고등학교명</th>
                <th className="py-3 px-4 font-bold text-center">학교 유형</th>
                <th className="py-3 px-4 font-bold text-right">2026 모집정원</th>
                <th className="py-3 px-4 font-bold text-right">2026 실제 입학생</th>
                <th className="py-3 px-4 font-bold text-right">2027 모집정원</th>
                <th className="py-3 px-4 font-bold text-right">정원 증감</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2e6d6]">
              {schools.map((s) => {
                const delta = s.quota - s.quota2026;
                const adm = s.admissions.find((x) => x.year === 2026);
                return (
                  <tr key={s.id} className="hover:bg-[#fdfaf5]">
                    <td className="py-2.5 px-4 font-bold text-[#261d13]">
                      <button
                        onClick={() => onOpenDetail(s.id, 'overview')}
                        className="hover:text-[#ed8200] underline decoration-[#ed8200]/30 text-left"
                      >
                        {s.name}
                      </button>
                    </td>
                    <td className="py-2.5 px-4 text-center text-xs text-[#7d674f]">
                      {s.girls ? '여학교' : '남녀공학'} · {s.ownership}
                    </td>
                    <td className="py-2.5 px-4 text-right text-[#5c4936]">
                      {formatNumber(s.quota2026, 0)}명
                    </td>
                    <td className="py-2.5 px-4 text-right text-[#5c4936]">
                      {formatNumber(adm?.total || 0, 0)}명
                    </td>
                    <td className="py-2.5 px-4 text-right font-black text-[#ed8200]">
                      {formatNumber(s.quota, 0)}명
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold">
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
                  </tr>
                );
              })}

              {/* Bucheon High School Excluded Note */}
              <tr className="bg-[#fff5f5] text-stone-600">
                <td className="py-2.5 px-4 font-semibold text-rose-800">
                  부천고등학교 (일반고 선발 제외)
                </td>
                <td className="py-2.5 px-4 text-center text-xs text-rose-700">
                  과학고 전환 (남학교)
                </td>
                <td className="py-2.5 px-4 text-right">168명</td>
                <td className="py-2.5 px-4 text-right">
                  {bucheonHigh2026?.total ? `${bucheonHigh2026.total}명` : '—'}
                </td>
                <td className="py-2.5 px-4 text-right font-bold text-stone-500">
                  0명 (일반고)
                </td>
                <td className="py-2.5 px-4 text-right font-bold text-rose-700">
                  -168명
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
