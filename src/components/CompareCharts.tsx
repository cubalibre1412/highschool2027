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
  Cell,
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

  // 1. Quota Data: 2026 Quota, 2027 Quota, 2026 Actual Admitted
  const quotaData = schools.map((s) => {
    const adm2026 = s.admissions.find((x) => x.year === 2026);
    return {
      name: shortenSchoolName(s.name),
      fullName: s.name,
      '2027 모집정원': s.quota,
      '2026 모집정원': s.quota2026,
      '2026 실제입학생': adm2026?.total || 0,
      delta: s.quota - s.quota2026,
    };
  });

  // 2. Commute Data: Distance (km) & Confirmed Travel Time (mins)
  const commuteData = schools.map((s) => {
    const d = originMiddle ? calculateDistance(s, originMiddle) : null;
    const recordedTime = prefs.times[s.id] || 0;
    return {
      name: shortenSchoolName(s.name),
      fullName: s.name,
      '직선거리(km)': d !== null ? Number(d.toFixed(1)) : 0,
      '통학시간(분)': recordedTime,
      hasRecordedTime: recordedTime > 0,
    };
  });

  // 3. Graduates Data: 4-yr University Rate (%), Junior College (%), Employment/Other (%)
  const graduatesData = schools.map((s) => {
    const g = s.graduates.find((x) => x.gender === '합계');
    const total = g?.graduates || 1;
    const uniRate = g ? Number(((g.university / total) * 100).toFixed(1)) : 0;
    const juniorRate = g ? Number(((g.junior_college / total) * 100).toFixed(1)) : 0;
    const otherRate = g ? Number((((g.other + g.employed + g.foreign_total) / total) * 100).toFixed(1)) : 0;

    return {
      name: shortenSchoolName(s.name),
      fullName: s.name,
      '4년제 대학교 진학률(%)': uniRate,
      '전문대학 진학률(%)': juniorRate,
      '기타·취업 비율(%)': otherRate,
      totalGrads: g?.graduates || 0,
    };
  });

  // 4. Achievement Data: 1st Grade Core Subjects (국어, 수학, 영어) Mean score & A ratio
  const achievementData = schools.map((s) => {
    const korean = s.achievement.find((x) => x.grade === 1 && /공통국어1/.test(x.subject));
    const math = s.achievement.find((x) => x.grade === 1 && /공통수학1/.test(x.subject));
    const english = s.achievement.find((x) => x.grade === 1 && /공통영어1/.test(x.subject));

    return {
      name: shortenSchoolName(s.name),
      fullName: s.name,
      '국어 평균(점)': korean ? Number(korean.mean.toFixed(1)) : 0,
      '수학 평균(점)': math ? Number(math.mean.toFixed(1)) : 0,
      '영어 평균(점)': english ? Number(english.mean.toFixed(1)) : 0,
      '국어 A비율(%)': korean?.A ?? 0,
      '수학 A비율(%)': math?.A ?? 0,
      '영어 A비율(%)': english?.A ?? 0,
    };
  });

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
      <div className="w-full h-72 sm:h-80">
        {/* 1. Quota Chart */}
        {selectedChart === 'quota' && (
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
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fffdfa',
                  border: '1px solid #ebdcc9',
                  borderRadius: '12px',
                  fontSize: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
                formatter={(value: any, name: any) => [`${value}명`, name]}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="2027 모집정원" fill="#ed8200" radius={[6, 6, 0, 0]} />
              <Bar dataKey="2026 모집정원" fill="#9e856b" radius={[6, 6, 0, 0]} />
              <Bar dataKey="2026 실제입학생" fill="#524130" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* 2. Commute Chart */}
        {selectedChart === 'commute' && (
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
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fffdfa',
                  border: '1px solid #ebdcc9',
                  borderRadius: '12px',
                  fontSize: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
                formatter={(value: any, name: any) => [
                  name.includes('km') ? `${value} km` : `${value} 분`,
                  name,
                ]}
              />
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
        {selectedChart === 'graduates' && (
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
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fffdfa',
                  border: '1px solid #ebdcc9',
                  borderRadius: '12px',
                  fontSize: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
                formatter={(value: any, name: any) => [`${value}%`, name]}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar
                dataKey="4년제 대학교 진학률(%)"
                fill="#2e7d32"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="전문대학 진학률(%)"
                fill="#81c784"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="기타·취업 비율(%)"
                fill="#ffb74d"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* 4. Achievement Chart */}
        {selectedChart === 'achievement' && (
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
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fffdfa',
                  border: '1px solid #ebdcc9',
                  borderRadius: '12px',
                  fontSize: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
                formatter={(value: any, name: any) => [
                  name.includes('%') ? `${value}%` : `${value}점`,
                  name,
                ]}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="국어 평균(점)" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              <Bar dataKey="수학 평균(점)" fill="#ed8200" radius={[6, 6, 0, 0]} />
              <Bar dataKey="영어 평균(점)" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
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
            💡 <strong>직선거리 vs 통학시간:</strong> 직선거리는 중학교 위치 기준이며, 통학시간은 각 학교 정보에서 카카오맵 길찾기로 확인 후 직접 기록한 분 단위 시간입니다.
          </span>
        )}
        {selectedChart === 'graduates' && (
          <span>
            💡 <strong>진학률:</strong> 2025년 공시 기준이며, 분모는 졸업생 총원입니다. (수시/정시 및 특정 대학명은 공시되지 않음)
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
