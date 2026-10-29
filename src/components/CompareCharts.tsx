import React from 'react';
import { School, MiddleSchool, UserPrefs } from '../types';
import { shortenSchoolName, calculateDistance } from '../utils/geo';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { BarChart3, TrendingUp, Navigation, GraduationCap, Award } from 'lucide-react';

interface CompareChartsProps {
  schools: School[];
  originMiddle?: MiddleSchool | null;
  prefs: UserPrefs;
}

type ChartCategory = 'quota' | 'commute' | 'graduates' | 'achievement';

export const CompareCharts: React.FC<CompareChartsProps> = ({
  schools,
  originMiddle,
  prefs,
}) => {
  const [selectedChart, setSelectedChart] = React.useState<ChartCategory>('quota');

  if (schools.length < 2) return null;

  // Missing data remains null; a genuine numeric zero remains zero.
  const numberOrNull = (value: unknown): number | null =>
    typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
  const percent = (value: unknown, total: unknown) => {
    const n = numberOrNull(value);
    const d = numberOrNull(total);
    return n !== null && d !== null && d > 0 ? Number((n / d * 100).toFixed(1)) : null;
  };
  const quotaData = schools.map(s => ({
    name: shortenSchoolName(s.name),
    fullName: s.name,
    '2027 모집정원': numberOrNull(s.quota),
    '2026 모집정원': numberOrNull(s.quota2026),
    '2026 실제입학생': numberOrNull(s.admissions.find(x => x.year === 2026)?.total),
  }));
  const commuteData = schools.map(s => {
    const distance = originMiddle ? calculateDistance(s, originMiddle) : null;
    const time = numberOrNull(prefs.times[s.id]);
    return {
      name: shortenSchoolName(s.name),
      fullName: s.name,
      '직선거리(km)': distance !== null && Number.isFinite(distance) ? Number(distance.toFixed(1)) : null,
      '통학시간(분)': time !== null && time >= 1 && time <= 300 ? time : null,
    };
  });
  const graduatesData = schools.map(s => {
    const g = s.graduates.find(x => x.gender === '합계');
    return {
      name: shortenSchoolName(s.name),
      fullName: s.name,
      '국내 대학교 진학률(%)': percent(g?.university, g?.graduates),
      '전문대학 진학률(%)': percent(g?.junior_college, g?.graduates),
      '국외 진학률(%)': percent(g?.foreign_total, g?.graduates),
      '취업 비율(%)': percent(g?.employed, g?.graduates),
      '기타 비율(%)': percent(g?.other, g?.graduates),
    };
  });
  const achievementData = schools.map(s => {
    const mean = (pattern: RegExp) => {
      const record = s.achievement.find(x => x.grade === 1 && pattern.test(x.subject));
      const value = numberOrNull(record?.mean);
      return value === null ? null : Number(value.toFixed(1));
    };
    return {
      name: shortenSchoolName(s.name),
      fullName: s.name,
      '국어 평균(점)': mean(/공통국어1/),
      '수학 평균(점)': mean(/공통수학1/),
      '영어 평균(점)': mean(/공통영어1/),
    };
  });
  const series: Record<ChartCategory, string[]> = {
    quota: ['2027 모집정원', '2026 모집정원', '2026 실제입학생'],
    commute: ['직선거리(km)', '통학시간(분)'],
    graduates: ['국내 대학교 진학률(%)', '전문대학 진학률(%)', '국외 진학률(%)', '취업 비율(%)', '기타 비율(%)'],
    achievement: ['국어 평균(점)', '수학 평균(점)', '영어 평균(점)'],
  };
  const rows = { quota: quotaData, commute: commuteData, graduates: graduatesData, achievement: achievementData }[selectedChart] as unknown as Record<string, string | number | null>[];
  const missingLabel = (key: string) => key === '통학시간(분)' ? '미입력'
    : key === '직선거리(km)' && !originMiddle ? '중학교 미선택' : '자료 없음';
  const displayValue = (value: unknown, key: string) => {
    if (value === null || value === undefined) return missingLabel(key);
    const unit = key.includes('km') ? 'km' : key.includes('분') ? '분'
      : key.includes('%') ? '%' : key.includes('점') ? '점' : '명';
    return `${value}${unit}`;
  };

  const hasChartData = rows.some(row => series[selectedChart].some(key => typeof row[key] === 'number'));

  const chartTabs: { key: ChartCategory; label: string; icon: React.ReactNode }[] = [
    { key: 'quota', label: '모집 정원 비교', icon: <BarChart3 className="w-4 h-4" /> },
    { key: 'commute', label: '통학 거리·시간', icon: <Navigation className="w-4 h-4" /> },
    { key: 'graduates', label: '진학률 지표', icon: <GraduationCap className="w-4 h-4" /> },
    { key: 'achievement', label: '국·수·영 성취도', icon: <Award className="w-4 h-4" /> },
  ];

  return (
    <div className="bg-[#fffdfa] rounded-2xl border border-[#ebdcc9] p-5 sm:p-6 shadow-xs space-y-5">
      {/* Chart Category Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#f0e4d4]">
        <div>
          <h3 className="font-extrabold text-sm sm:text-base text-[#261d13] flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#ed8200]" />
            <span>학교별 주요 지표 비교 차트</span>
          </h3>
          <p className="text-xs text-[#8c745c] mt-0.5">
            선택한 {schools.length}개 학교의 핵심 통계를 시각적으로 한눈에 비교합니다.
          </p>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-[#f7efe4] rounded-xl border border-[#ebdcc9] no-scrollbar">
          {chartTabs.map((tab) => {
            const active = selectedChart === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedChart(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-white text-[#b85e00] shadow-xs'
                    : 'text-[#6e5842] hover:text-[#261d13]'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart Display Area */}
      <div className={hasChartData ? 'w-full h-72 sm:h-80' : 'w-full rounded-xl bg-[#faf5ec] p-6 text-sm text-[#7d674f]'}>
        {!hasChartData && <p role="status">{selectedChart === 'commute'
          ? '중학교를 선택하거나 직접 확인한 통학시간을 입력하면 차트에 표시됩니다.'
          : '선택한 학교에서 확인된 수치가 없습니다. 아래 표에서 자료 제공 여부를 확인해 주세요.'}</p>}
        {/* 1. Quota Chart */}
        {selectedChart === 'quota' && hasChartData && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={quotaData}
              margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0e4d4" />
              <XAxis
                dataKey="name"
                stroke="#6e5842"
                tick={{ fontSize: 12, fontWeight: 700 }}
              />
              <YAxis
                stroke="#6e5842"
                tick={{ fontSize: 11 }}
                domain={[0, 'auto']}
                unit="명"
              />
              <Tooltip filterNull={false} content={({ active, payload }) => {
                const row = payload?.[0]?.payload as Record<string, unknown> | undefined;
                if (!active || !row) return null;
                return <div className="rounded-xl border border-[#ebdcc9] bg-[#fffdfa] p-3 text-xs shadow-md">
                  <p className="font-bold mb-2">{String(row.fullName)}</p>
                  {series[selectedChart].map(key => <p key={key}>{key}: {displayValue(row[key], key)}</p>)}
                </div>;
              }} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="2027 모집정원" fill="#ed8200" radius={[6, 6, 0, 0]} />
              <Bar dataKey="2026 모집정원" fill="#9e856b" radius={[6, 6, 0, 0]} />
              <Bar dataKey="2026 실제입학생" fill="#524130" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* 2. Commute Chart */}
        {selectedChart === 'commute' && hasChartData && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={commuteData}
              margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0e4d4" />
              <XAxis
                dataKey="name"
                stroke="#6e5842"
                tick={{ fontSize: 12, fontWeight: 700 }}
              />
              <YAxis
                yAxisId="left"
                stroke="#ed8200"
                tick={{ fontSize: 11 }}
                domain={[0, 'auto']}
                unit="km"
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#2e7d32"
                tick={{ fontSize: 11 }}
                domain={[0, 'auto']}
                unit="분"
              />
              <Tooltip filterNull={false} content={({ active, payload }) => {
                const row = payload?.[0]?.payload as Record<string, unknown> | undefined;
                if (!active || !row) return null;
                return <div className="rounded-xl border border-[#ebdcc9] bg-[#fffdfa] p-3 text-xs shadow-md">
                  <p className="font-bold mb-2">{String(row.fullName)}</p>
                  {series[selectedChart].map(key => <p key={key}>{key}: {displayValue(row[key], key)}</p>)}
                </div>;
              }} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar
                yAxisId="left"
                dataKey="직선거리(km)"
                fill="#ed8200"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                yAxisId="right"
                dataKey="통학시간(분)"
                fill="#2e7d32"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* 3. Graduates Chart */}
        {selectedChart === 'graduates' && hasChartData && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={graduatesData}
              margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0e4d4" />
              <XAxis
                dataKey="name"
                stroke="#6e5842"
                tick={{ fontSize: 12, fontWeight: 700 }}
              />
              <YAxis
                stroke="#6e5842"
                tick={{ fontSize: 11 }}
                domain={[0, 100]}
                unit="%"
              />
              <Tooltip filterNull={false} content={({ active, payload }) => {
                const row = payload?.[0]?.payload as Record<string, unknown> | undefined;
                if (!active || !row) return null;
                return <div className="rounded-xl border border-[#ebdcc9] bg-[#fffdfa] p-3 text-xs shadow-md">
                  <p className="font-bold mb-2">{String(row.fullName)}</p>
                  {series[selectedChart].map(key => <p key={key}>{key}: {displayValue(row[key], key)}</p>)}
                </div>;
              }} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar
                dataKey="국내 대학교 진학률(%)"
                fill="#2e7d32"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="전문대학 진학률(%)"
                fill="#81c784"
                radius={[6, 6, 0, 0]}
              />
              <Bar dataKey="국외 진학률(%)" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              <Bar dataKey="취업 비율(%)" fill="#ed8200" radius={[6, 6, 0, 0]} />
              <Bar dataKey="기타 비율(%)" fill="#9e856b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* 4. Achievement Chart */}
        {selectedChart === 'achievement' && hasChartData && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={achievementData}
              margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0e4d4" />
              <XAxis
                dataKey="name"
                stroke="#6e5842"
                tick={{ fontSize: 12, fontWeight: 700 }}
              />
              <YAxis
                stroke="#6e5842"
                tick={{ fontSize: 11 }}
                domain={[0, 100]}
                unit="점"
              />
              <Tooltip filterNull={false} content={({ active, payload }) => {
                const row = payload?.[0]?.payload as Record<string, unknown> | undefined;
                if (!active || !row) return null;
                return <div className="rounded-xl border border-[#ebdcc9] bg-[#fffdfa] p-3 text-xs shadow-md">
                  <p className="font-bold mb-2">{String(row.fullName)}</p>
                  {series[selectedChart].map(key => <p key={key}>{key}: {displayValue(row[key], key)}</p>)}
                </div>;
              }} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="국어 평균(점)" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              <Bar dataKey="수학 평균(점)" fill="#ed8200" radius={[6, 6, 0, 0]} />
              <Bar dataKey="영어 평균(점)" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#ebdcc9]" role="region" aria-label="차트 수치와 미입력 안내" tabIndex={0}>
        <table className="w-full text-xs text-left">
          <caption className="text-left p-3 text-[#7d674f]">차트 수치 · 미입력·자료 없음은 막대로 표시하지 않습니다.</caption>
          <thead><tr className="bg-[#f7efe4]"><th scope="col" className="p-3 whitespace-nowrap">학교</th>{series[selectedChart].map(key => <th scope="col" className="p-3 whitespace-nowrap" key={key}>{key}</th>)}</tr></thead>
          <tbody>{rows.map(row => <tr className="border-t border-[#ebdcc9]" key={String(row.fullName)}><th scope="row" className="p-3 whitespace-nowrap">{row.name}</th>{series[selectedChart].map(key => <td className="p-3 whitespace-nowrap" key={key}>{displayValue(row[key], key)}</td>)}</tr>)}</tbody>
        </table>
      </div>
      {/* Dynamic Caption / Guide Note */}
      <div className="pt-2 border-t border-[#f0e4d4] text-[11px] text-[#8c745c] leading-relaxed flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        {selectedChart === 'quota' && (
          <span>
            💡 <strong>2027 모집정원:</strong> 경기도교육청 신입생 전형계획 24쪽 기준 공식 수치입니다.
          </span>
        )}
        {selectedChart === 'commute' && (
          <span>
            💡 <strong>직선거리 vs 통학시간:</strong> 직선거리는 중학교 위치 기준입니다. 통학시간은 각 학교 정보의 카카오맵 길찾기로 확인한 뒤 분 단위로 직접 기록한 시간입니다.</span>
        )}
        {selectedChart === 'graduates' && (
          <span>
            💡 <strong>진학률:</strong> 2025년 공시 기준이며, 분모는 졸업생 총원입니다. 국내 대학교·전문대학·국외 진학·취업·기타를 나눠 표시합니다. 수시·정시와 대학명은 포함되지 않습니다.
          </span>
        )}
        {selectedChart === 'achievement' && (
          <span>
            💡 <strong>1학년 1학기 성취도:</strong> 2026년 9월 학교알리미 공시 기준 100점 만점 평균 점수입니다.
          </span>
        )}
      </div>
    </div>
  );
};
