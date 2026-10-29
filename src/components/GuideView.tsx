import React from 'react';
import { MiddleSchool, AppData } from '../types';
import { TIMELINE_EVENTS } from '../constants';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Download,
  ExternalLink,
  Phone,
  FileText,
  School,
  Clock,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';

interface GuideViewProps {
  appData: AppData;
  originMiddle?: MiddleSchool | null;
  middles: MiddleSchool[];
  onSelectMiddle: (middleName: string) => void;
}

export const GuideView: React.FC<GuideViewProps> = ({
  appData,
  originMiddle,
  middles,
  onSelectMiddle,
}) => {
  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="bg-white rounded-3xl border border-[#ebdcc9] p-6 sm:p-8 shadow-xs">
        <span className="text-xs font-bold text-[#b85e00] tracking-wider uppercase">
          2027 ADMISSION GUIDE & SCHEDULE
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-[#261d13] mt-1">
          2027학년도 부천 일반고 지원 안내 및 일정
        </h1>
        <p className="text-xs sm:text-sm text-[#7d674f] mt-1.5 leading-relaxed max-w-3xl">
          경기도교육청 신입생 전형계획 및 고등학교 입학추첨 배정 방안의 공식 규정을 바탕으로 
          원서 작성 전 반드시 확인해야 할 유의사항과 일정을 정리했습니다.
        </p>
      </div>

      {/* 1. Critical Application Checklist */}
      <section className="bg-gradient-to-br from-[#fffbf5] to-[#fcf5ea] rounded-3xl border border-[#ebd5bc] p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#ed8200]" />
          <h2 className="text-lg sm:text-xl font-black text-[#261d13]">
            원서 내기 전, 꼭 확인하세요! (필수 점검 3가지)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-white rounded-2xl p-5 border border-[#ede0ce] shadow-xs space-y-2">
            <span className="w-7 h-7 rounded-xl bg-[#ed8200] text-white flex items-center justify-center font-black text-xs shadow-xs">
              1
            </span>
            <strong className="text-sm font-bold text-[#261d13] block">
              학교에서 정한 교내 제출일 확인
            </strong>
            <p className="text-xs text-[#6e5842] leading-relaxed">
              공식 교육청 접수는 12월 4일(금)~10일(목) 09:00~17:00입니다. 
              재학생은 담임 선생님의 안내를 따라야 하며, 학교생활기록부 대조 및 서류 취합을 위해 <strong>학교 제출 마감일은 공식 마감일보다 며칠 더 빠를 수 있습니다.</strong>
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#ede0ce] shadow-xs space-y-2">
            <span className="w-7 h-7 rounded-xl bg-[#ed8200] text-white flex items-center justify-center font-black text-xs shadow-xs">
              2
            </span>
            <strong className="text-sm font-bold text-[#261d13] block">
              접수 마감 뒤에는 취소·수정 불가
            </strong>
            <p className="text-xs text-[#6e5842] leading-relaxed">
              12월 10일 오후 5시까지 온라인 전송과 출력된 종이 원서 제출이 모두 완료되어야 합니다. 
              접수된 원서는 어떠한 경우에도 취소하거나 지망 순서를 바꿀 수 없으므로 최종 확인이 필수입니다.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#ede0ce] shadow-xs space-y-2">
            <span className="w-7 h-7 rounded-xl bg-[#ed8200] text-white flex items-center justify-center font-black text-xs shadow-xs">
              3
            </span>
            <strong className="text-sm font-bold text-[#261d13] block">
              원서의 지망 순위와 연락처 재확인
            </strong>
            <p className="text-xs text-[#6e5842] leading-relaxed">
              출력된 원서의 1지망부터 끝지망까지 순서를 보호자와 함께 최종 서명 전 반드시 확인하세요. 
              배정 학교 결과는 입력된 학생 및 보호자 휴대전화 문자로도 발송됩니다.
            </p>
          </div>
        </div>

        <div className="pt-2 text-xs text-[#8c745c] flex items-center justify-between">
          <span>전형료: 없음 (경기도 평준화 일반고) · 재학생은 출신 중학교에서 작성</span>
          <span className="font-semibold text-[#b85e00]">전형계획 8쪽, 37쪽 발췌</span>
        </div>
      </section>

      {/* 2. Procedure & 2027 Timeline Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Procedure */}
        <div className="lg:col-span-6 space-y-6">
          <section className="bg-white rounded-2xl border border-[#ebdcc9] p-6 shadow-xs space-y-5">
            <h2 className="text-base sm:text-lg font-black text-[#261d13] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#ed8200]" />
              <span>부천 고등학교, 이렇게 배정돼요</span>
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3.5 p-3.5 bg-[#faf6f0] rounded-xl border border-[#ede0ce]">
                <div className="w-7 h-7 rounded-xl bg-[#261d13] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1단계
                </div>
                <div className="space-y-1">
                  <strong className="text-sm font-bold text-[#261d13] block">
                    학군 전체 모집정원만큼 선발
                  </strong>
                  <p className="text-xs text-[#6e5842] leading-relaxed">
                    중학교 3개년 내신성적(200점 만점: 교과 150점 + 출결 20점 + 봉사 20점 + 학교활동 10점) 순으로 부천 학군 일반고 입학 배정 대상자를 먼저 선발합니다. 특정 고등학교의 합격선이 아닙니다.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 bg-[#faf6f0] rounded-xl border border-[#ede0ce]">
                <div className="w-7 h-7 rounded-xl bg-[#261d13] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2단계
                </div>
                <div className="space-y-1">
                  <strong className="text-sm font-bold text-[#261d13] block">
                    관내 전체 고등학교 지망 순위 작성
                  </strong>
                  <p className="text-xs text-[#6e5842] leading-relaxed">
                    남학생은 남녀공학 20개교의 순위를 모두 작성하고, 여학생은 남녀공학 20개교와 여고 2개교(부천여고, 소명여고)를 포함한 총 22개교의 순위를 모두 작성합니다.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 bg-[#faf6f0] rounded-xl border border-[#ede0ce]">
                <div className="w-7 h-7 rounded-xl bg-[#261d13] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3단계
                </div>
                <div className="space-y-1">
                  <strong className="text-sm font-bold text-[#261d13] block">
                    지망 순위를 반영한 컴퓨터 추첨 배정
                  </strong>
                  <p className="text-xs text-[#6e5842] leading-relaxed">
                    학교별로 1지망 지원자부터 컴퓨터 추첨으로 충원합니다. 1지망에서 정원이 채워지지 않으면 2지망 지원자 중에서 충원하며, 정원을 초과하면 추첨으로 탈락한 학생은 다음 지망 순위 학교의 남은 자리를 대상으로 재배정됩니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#fff9f0] border border-[#f5dfc3] rounded-xl text-xs text-[#8a4b00] leading-relaxed space-y-1">
              <strong className="font-bold flex items-center gap-1.5 text-[#b85e00]">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>중요: 부천은 구역내 2단계 배정이 없습니다!</span>
              </strong>
              <p>
                수원·성남·안양 등과 달리 부천 학군은 '구역내 배정' 없이 학군 전체 단일 배정 방식입니다. 
                집이나 중학교에서 가깝다고 자동 배정되지 않으므로 <strong>1지망 선택</strong>이 배정 결과에 결정적인 영향을 줍니다.
              </p>
            </div>
          </section>

          {/* Middle School Official Schedule Finder */}
          <section className="bg-white rounded-2xl border border-[#ebdcc9] p-6 shadow-xs space-y-4">
            <h2 className="text-base sm:text-lg font-black text-[#261d13] flex items-center gap-2">
              <School className="w-4 h-4 text-[#ed8200]" />
              <span>부천 중학교별 교육지원청 원서 제출 일정</span>
            </h2>

            <div className="space-y-2">
              <label htmlFor="guide-middle-select" className="text-xs font-semibold text-[#5c4936]">
                재학 중인 중학교 선택:
              </label>
              <select
                id="guide-middle-select"
                value={originMiddle?.name || ''}
                onChange={(e) => onSelectMiddle(e.target.value)}
                className="w-full bg-[#faf7f2] border border-[#ebdcc9] rounded-xl px-3.5 py-2 text-xs font-bold text-[#261d13] cursor-pointer focus:ring-2 focus:ring-[#ed8200]"
              >
                <option value="">중학교를 선택해 주세요</option>
                {middles.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {originMiddle?.applicationSubmission ? (
              <div className="p-4 bg-[#fdfaf5] border border-[#f5dfc3] rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <strong className="text-sm font-bold text-[#261d13]">
                    {originMiddle.name} 교육지원청 접수 일정
                  </strong>
                  <span className="px-2 py-0.5 rounded-full bg-[#ed8200] text-white font-extrabold text-[11px]">
                    {originMiddle.applicationSubmission.date.slice(5)} {originMiddle.applicationSubmission.period}
                  </span>
                </div>
                <p className="text-[#6e5842] leading-relaxed">
                  {originMiddle.applicationSubmission.meaning}
                </p>
                <span className="text-[11px] text-[#8c745c] block pt-1 border-t border-[#f2e6d6]">
                  출처: 2027 신입생 전형계획 12쪽
                </span>
              </div>
            ) : (
              <p className="text-xs text-[#8c745c] italic p-3 bg-[#faf7f2] rounded-xl text-center">
                중학교를 선택하시면 해당 학교의 공식 교육지원청 원서 제출 일정이 표시됩니다.
              </p>
            )}
          </section>
        </div>

        {/* Right: Timeline & Special Cases */}
        <div className="lg:col-span-6 space-y-6">
          {/* Timeline Card */}
          <section className="bg-white rounded-2xl border border-[#ebdcc9] p-6 shadow-xs space-y-4">
            <h2 className="text-base sm:text-lg font-black text-[#261d13] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#ed8200]" />
              <span>2027학년도 고입 주요 공식 일정</span>
            </h2>

            <div className="space-y-3.5 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-[#ebdcc9]">
              {TIMELINE_EVENTS.map((event, idx) => (
                <div key={idx} className="relative flex items-start gap-4 pl-1">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 z-10 shadow-xs ${
                      event.highlight
                        ? 'bg-[#ed8200] text-white ring-4 ring-[#ed8200]/20'
                        : 'bg-white border-2 border-[#ebdcc9] text-[#7d674f]'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[#b85e00] block">
                      {event.date}
                    </span>
                    <strong className="text-sm font-bold text-[#261d13] block">
                      {event.title}
                    </strong>
                    <p className="text-xs text-[#6e5842] leading-relaxed">
                      {event.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-[#8c745c] pt-2 border-t border-[#f0e4d4]">
              출처: 경기도교육청 공고 제2026-1271호 및 2027 전형계획 31~32쪽. 세부 일정은 교육청 공고에 따릅니다.
            </p>
          </section>

          {/* Special Admission Rules Collapsible/Card */}
          <section className="bg-white rounded-2xl border border-[#ebdcc9] p-6 shadow-xs space-y-3">
            <h3 className="text-sm sm:text-base font-extrabold text-[#261d13]">
              별도 신청 대상자 및 특수 배정 안내
            </h3>

            <div className="space-y-2 text-xs text-[#5c4936]">
              <div className="p-3 bg-[#faf7f2] rounded-xl border border-[#ebdcc9]">
                <strong className="text-[#261d13] block font-bold mb-0.5">
                  외고·국제고·자사고 동시지원자
                </strong>
                <span>
                  전기 선발 고등학교에 합격하지 못한 경우를 대비하여 일반고를 2지망부터 작성합니다. 1지망은 해당 특목·자사고로 간주됩니다.
                </span>
              </div>

              <div className="p-3 bg-[#faf7f2] rounded-xl border border-[#ebdcc9]">
                <strong className="text-[#261d13] block font-bold mb-0.5">
                  쌍둥이 및 다자녀 동일교/분리배정
                </strong>
                <span>
                  쌍둥이 학생은 동일교 배정을 희망할 경우 맏이와 지망 순위를 일치시켜 작성합니다. 남녀 쌍둥이는 여학교를 끝지망으로 적는 등 별도 작성 요령이 있습니다.
                </span>
              </div>

              <div className="p-3 bg-[#faf7f2] rounded-xl border border-[#ebdcc9]">
                <strong className="text-[#261d13] block font-bold mb-0.5">
                  체육특기자 및 특수교육대상자
                </strong>
                <span>
                  체육특기자는 심사 승인 후에도 입학원서는 기한 내 반드시 제출해야 합니다. 특수교육대상자는 별도 교육지원청 특수교육운영위원회 심의를 따릅니다.
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* 3. Official Files & Contact Center */}
      <section className="bg-white rounded-3xl border border-[#ebdcc9] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#f0e4d4]">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[#261d13]">공식 원문 자료 내려받기·문의처</h2>
            <p className="text-xs text-[#7d674f] mt-1">
              교육청 전형계획, 학생 배정 방안 및 학교 공개 데이터 원본 파일입니다.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="tel:0326200178"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#fdf5eb] text-[#b85e00] font-bold text-xs rounded-xl border border-[#ebd8bf]"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>부천교육지원청: 032-620-0178</span>
            </a>
            <a
              href="https://satp.goe.go.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#261d13] text-white font-bold text-xs rounded-xl hover:bg-black transition-colors"
            >
              <span>경기도 고등학교 입학전학포털(SATP) ↗</span>
            </a>
          </div>
        </div>

        {/* Document download buttons grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <a
            href="/admission-plan-2027.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-[#faf7f2] hover:bg-[#f5ede2] rounded-2xl border border-[#ebdcc9] transition-all flex flex-col justify-between group"
          >
            <div>
              <FileText className="w-5 h-5 text-[#ed8200] mb-2" />
              <strong className="text-xs sm:text-sm font-bold text-[#261d13] group-hover:text-[#ed8200] block">
                2027 신입생 전형계획 (PDF)
              </strong>
              <p className="text-[11px] text-[#8c745c] mt-1">
                부천 22개교 모집정원(24쪽) 및 일정 포함
              </p>
            </div>
            <span className="text-[11px] text-[#b85e00] font-bold mt-3 flex items-center gap-1">
              <span>문서 열기</span>
              <ExternalLink className="w-3 h-3" />
            </span>
          </a>

          <a
            href="/allocation-2027.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-[#faf7f2] hover:bg-[#f5ede2] rounded-2xl border border-[#ebdcc9] transition-all flex flex-col justify-between group"
          >
            <div>
              <FileText className="w-5 h-5 text-[#ed8200] mb-2" />
              <strong className="text-xs sm:text-sm font-bold text-[#261d13] group-hover:text-[#ed8200] block">
                2027 학생 배정 방안 (PDF)
              </strong>
              <p className="text-[11px] text-[#8c745c] mt-1">
                부천 학군 배정 절차 (37~39쪽)
              </p>
            </div>
            <span className="text-[11px] text-[#b85e00] font-bold mt-3 flex items-center gap-1">
              <span>문서 열기</span>
              <ExternalLink className="w-3 h-3" />
            </span>
          </a>

          <a
            href="/admissions-2027.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-[#faf7f2] hover:bg-[#f5ede2] rounded-2xl border border-[#ebdcc9] transition-all flex flex-col justify-between group"
          >
            <div>
              <FileText className="w-5 h-5 text-[#ed8200] mb-2" />
              <strong className="text-xs sm:text-sm font-bold text-[#261d13] group-hover:text-[#ed8200] block">
                2027 모집 전형 공고 (PDF)
              </strong>
              <p className="text-[11px] text-[#8c745c] mt-1">
                공식 세부 전형요강 전문
              </p>
            </div>
            <span className="text-[11px] text-[#b85e00] font-bold mt-3 flex items-center gap-1">
              <span>문서 열기</span>
              <ExternalLink className="w-3 h-3" />
            </span>
          </a>

          <a
            href="/school-data.xlsx"
            download
            className="p-4 bg-[#faf7f2] hover:bg-[#f5ede2] rounded-2xl border border-[#ebdcc9] transition-all flex flex-col justify-between group"
          >
            <div>
              <Download className="w-5 h-5 text-emerald-600 mb-2" />
              <strong className="text-xs sm:text-sm font-bold text-[#261d13] group-hover:text-emerald-700 block">
                22개교 공개자료 통합 엑셀 (XLSX)
              </strong>
              <p className="text-[11px] text-[#8c745c] mt-1">
                정원·성취도·진학 통계 엑셀 다운로드
              </p>
            </div>
            <span className="text-[11px] text-emerald-700 font-bold mt-3 flex items-center gap-1">
              <span>파일 내려받기</span>
              <Download className="w-3 h-3" />
            </span>
          </a>
        </div>
      </section>
    </div>
  );
};
