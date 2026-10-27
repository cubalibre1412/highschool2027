import React from 'react';
import { School, MiddleSchool, UserPrefs, DetailTabType } from '../types';
import { shortenSchoolName, formatNumber, formatRate, getKakaoRouteUrl, getDistanceText } from '../utils/geo';
import { INTEREST_FIELDS } from '../constants';
import {
  X,
  MapPin,
  Phone,
  Globe,
  Navigation,
  BookOpen,
  ClipboardList,
  Award,
  GraduationCap,
  FileText,
  Search,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Clock,
  Save,
  CheckCircle2,
  Info,
} from 'lucide-react';

interface SchoolDetailModalProps {
  school: School;
  initialTab?: DetailTabType;
  originMiddle?: MiddleSchool | null;
  prefs: UserPrefs;
  onClose: () => void;
  onSaveTime: (schoolId: number, minutes: number | null) => void;
  onToggleWishlist: (schoolId: number) => void;
}

export const SchoolDetailModal: React.FC<SchoolDetailModalProps> = ({
  school,
  initialTab = 'overview',
  originMiddle,
  prefs,
  onClose,
  onSaveTime,
  onToggleWishlist,
}) => {
  const [activeTab, setActiveTab] = React.useState<DetailTabType>(initialTab);

  // Time recording input
  const [timeInput, setTimeInput] = React.useState<string>(
    prefs.times[school.id] ? String(prefs.times[school.id]) : ''
  );
  const [timeSavedNotice, setTimeSavedNotice] = React.useState(false);

  // Achievement tab states
  const [selectedGrade, setSelectedGrade] = React.useState<number>(1);
  const [subjectQuery, setSubjectQuery] = React.useState<string>('');

  // Document viewer states
  const [docCategory, setDocCategory] = React.useState<string>('교육과정');
  const [selectedDocId, setSelectedDocId] = React.useState<number | null>(null);
  const [docText, setDocText] = React.useState<string>('');
  const [docLoading, setDocLoading] = React.useState<boolean>(false);
  const [docSearchQuery, setDocSearchQuery] = React.useState<string>('');
  const [docPage, setDocPage] = React.useState<number>(0);

  const isAdded = prefs.wishlist.includes(school.id);
  const kakaoUrl = getKakaoRouteUrl(school, originMiddle);
  const distText = getDistanceText(school, originMiddle, prefs.distance);

  // Initialize selected document
  React.useEffect(() => {
    const docs = school.documents.filter((d) =>
      activeTab === 'curriculum' ? d.category === '교육과정' : d.category === '평가계획'
    );
    if (docs.length > 0) {
      setDocCategory(activeTab === 'curriculum' ? '교육과정' : '평가계획');
      const defaultDoc =
        docs.find((d) => d.textUrl && !/학업성적|협의록|학사일정/.test(d.title)) || docs[0];
      setSelectedDocId(defaultDoc.id);
    }
  }, [school, activeTab]);

  // Load document text when selectedDocId changes
  React.useEffect(() => {
    if (!selectedDocId) return;
    const doc = school.documents.find((d) => d.id === selectedDocId);
    if (!doc || !doc.textUrl) {
      setDocText('');
      return;
    }

    setDocLoading(true);
    fetch(doc.textUrl)
      .then((res) => {
        if (!res.ok) throw new Error('Document fetch failed');
        return res.text();
      })
      .then((txt) => {
        setDocText(txt);
        setDocLoading(false);
      })
      .catch(() => {
        setDocText('문서를 불러오지 못했습니다. 학교알리미 원본 첨부파일을 확인해 주세요.');
        setDocLoading(false);
      });
  }, [selectedDocId, school]);

  const handleSaveTravelTime = () => {
    const val = timeInput.trim() === '' ? null : Number(timeInput);
    if (val !== null && (isNaN(val) || val < 1 || val > 300)) {
      alert('통학시간은 1분에서 300분 사이로 입력해 주세요.');
      return;
    }
    onSaveTime(school.id, val);
    setTimeSavedNotice(true);
    setTimeout(() => setTimeSavedNotice(false), 2000);
  };

  // 1st year core achievement subjects
  const coreAchievements = school.achievement.filter(
    (x) => x.grade === 1 && /공통(국어|수학|영어)1/.test(x.subject)
  );

  // Filtered achievement list for chosen grade and search
  const filteredAchievements = school.achievement.filter(
    (x) => x.grade === selectedGrade && x.subject.includes(subjectQuery)
  );

  // Actual subjects in 2nd/3rd grade
  const upperGradeSubjects = Array.from(
    new Set(
      school.achievement
        .filter((x) => x.grade > 1)
        .map((x) => x.subject.replace(/\s*\([\d.]+\)$/, ''))
    )
  );

  const graduateSummary = school.graduates.find((x) => x.gender === '합계');

  // Filtered documents for category
  const categoryDocs = school.documents.filter((d) => d.category === docCategory);
  const currentDoc = school.documents.find((d) => d.id === selectedDocId);

  // Document chunk pagination & search
  const CHUNK_SIZE = 12000;
  const renderDocContent = () => {
    if (docLoading) {
      return (
        <div className="py-12 text-center text-xs text-[#8c745c] animate-pulse">
          공시 원문 텍스트를 불러오고 있습니다…
        </div>
      );
    }
    if (!currentDoc?.textUrl) {
      return (
        <div className="p-6 text-center text-xs text-[#8c745c] bg-[#faf6f0] rounded-xl border border-[#ebdcc9]">
          스캔 의심 부분이 있어 텍스트 자동 추출을 중단했습니다.
          <br />
          아래 학교알리미 공식 첨부파일 링크로 열람하실 수 있습니다.
        </div>
      );
    }
    if (docSearchQuery.trim()) {
      const q = docSearchQuery.trim();
      const hits: string[] = [];
      const cleanPattern = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const rx = new RegExp(cleanPattern, 'gi');
      let m: RegExpExecArray | null;

      while ((m = rx.exec(docText)) && hits.length < 50) {
        const start = Math.max(0, m.index - 120);
        const end = Math.min(docText.length, m.index + m[0].length + 150);
        const snippet = docText.slice(start, end);
        hits.push(snippet);
      }

      if (hits.length === 0) {
        return (
          <div className="p-6 text-center text-xs text-[#8c745c]">
            검색 결과가 없습니다. 다른 단어로 검색해 보세요.
          </div>
        );
      }

      return (
        <div className="space-y-3 font-mono text-xs text-[#3a2f24] leading-relaxed">
          <div className="text-xs font-bold text-[#b85e00] pb-2 border-b border-[#ebdcc9]">
            '{q}' 검색 결과 {hits.length}건
          </div>
          {hits.map((snippet, idx) => (
            <div key={idx} className="p-3 bg-white rounded-lg border border-[#ebdcc9] text-xs">
              <span className="text-[10px] text-[#8c745c] font-bold block mb-1">
                결과 #{idx + 1}
              </span>
              <p className="whitespace-pre-wrap">{snippet}</p>
            </div>
          ))}
        </div>
      );
    }

    const totalPages = Math.ceil(docText.length / CHUNK_SIZE);
    const startIdx = docPage * CHUNK_SIZE;
    const endIdx = (docPage + 1) * CHUNK_SIZE;
    const chunk = docText.slice(startIdx, endIdx);

    return (
      <div className="space-y-3">
        <div className="whitespace-pre-wrap font-mono text-xs text-[#332a20] leading-relaxed select-text p-4 bg-white rounded-xl border border-[#ebdcc9] max-h-96 overflow-y-auto">
          {chunk || '내용이 없습니다.'}
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between text-xs text-[#6e5842] pt-2">
            <button
              disabled={docPage === 0}
              onClick={() => setDocPage((p) => Math.max(0, p - 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-[#ebdcc9] rounded-lg disabled:opacity-40"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>이전 부분</span>
            </button>
            <span className="font-semibold">
              텍스트 {docPage + 1} / {totalPages} 부분
            </span>
            <button
              disabled={docPage >= totalPages - 1}
              onClick={() => setDocPage((p) => Math.min(totalPages - 1, p + 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-[#ebdcc9] rounded-lg disabled:opacity-40"
            >
              <span>다음 부분</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  };

  const tabs: { key: DetailTabType; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: '학교 개요', icon: <Info className="w-4 h-4" /> },
    { key: 'curriculum', label: '과목·교육과정', icon: <BookOpen className="w-4 h-4" /> },
    { key: 'assessment', label: '평가계획', icon: <ClipboardList className="w-4 h-4" /> },
    { key: 'achievement', label: '학업성취도', icon: <Award className="w-4 h-4" /> },
    { key: 'graduates', label: '졸업 후 진로', icon: <GraduationCap className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#fffdfa] rounded-3xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-[#ebdcc9] overflow-hidden">
        {/* Header */}
        <div className="px-5 sm:px-7 py-5 bg-[#fbf5ec] border-b border-[#ebdcc9] shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                    school.girls
                      ? 'bg-[#ffebee] text-[#c62828] border border-[#ffcdd2]'
                      : 'bg-[#edf4fb] text-[#1976d2] border border-[#bbdefb]'
                  }`}
                >
                  {school.girls ? '여학교' : '남녀공학'}
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
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-[#fdf5eb] text-[#b85e00] border border-[#f5dfc3]">
                    {distText}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#261d13]">
                {school.name}
              </h2>
              <p className="text-xs text-[#7d6853] mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#ed8200] shrink-0" />
                <span>{school.address}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onToggleWishlist(school.id)}
                className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                  isAdded
                    ? 'bg-[#ed8200] text-white hover:bg-[#cf7200]'
                    : 'bg-white text-[#b85e00] border border-[#e8d5be] hover:bg-[#fff7ee]'
                }`}
              >
                <span>{isAdded ? '✓ 지망표 담김' : '+ 지망표 추가'}</span>
              </button>
              <button
                onClick={onClose}
                aria-label="상세보기 닫기"
                className="p-2 text-[#7d674f] hover:text-[#261d13] hover:bg-[#ede0ce] rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto mt-4 pt-1 no-scrollbar">
            {tabs.map((tab) => {
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                    active
                      ? 'bg-[#ed8200] text-white shadow-xs'
                      : 'text-[#6b553e] hover:bg-[#f3e7d7]'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* TAB 1: 개요 (Overview) */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Official 2027 Admission Quota Card */}
              <section className="bg-gradient-to-br from-[#fffbf5] to-[#fbf3e6] border border-[#ebd5bc] rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold text-[#b85e00] tracking-wider uppercase">
                    2027학년도 공식 모집 계획
                  </span>
                  <span className="text-xs bg-white text-[#7d674f] px-2.5 py-0.5 rounded-full font-bold border border-[#ebdcc9]">
                    경기도교육청 신입생 전형계획 24쪽
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-white p-3 rounded-xl border border-[#ede0ce]">
                    <span className="text-xs text-[#7d674f] block">2027 모집정원</span>
                    <strong className="text-xl sm:text-2xl font-black text-[#ed8200]">
                      {formatNumber(school.quota, 0)}
                    </strong>
                    <span className="text-xs text-[#7d674f] ml-0.5">명</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-[#ede0ce]">
                    <span className="text-xs text-[#7d674f] block">2027 모집학급</span>
                    <strong className="text-xl sm:text-2xl font-black text-[#261d13]">
                      {school.classes2027 || '—'}
                    </strong>
                    <span className="text-xs text-[#7d674f] ml-0.5">학급</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-[#ede0ce]">
                    <span className="text-xs text-[#7d674f] block">2026 모집정원</span>
                    <strong className="text-xl sm:text-2xl font-bold text-[#5c4a37]">
                      {formatNumber(school.quota2026, 0)}
                    </strong>
                    <span className="text-xs text-[#7d674f] ml-0.5">명</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-[#ede0ce]">
                    <span className="text-xs text-[#7d674f] block">전년 대비 증감</span>
                    <strong
                      className={`text-xl sm:text-2xl font-black ${
                        school.quota - school.quota2026 > 0
                          ? 'text-emerald-600'
                          : school.quota - school.quota2026 < 0
                          ? 'text-rose-600'
                          : 'text-stone-600'
                      }`}
                    >
                      {school.quota - school.quota2026 === 0
                        ? '변동 없음'
                        : `${school.quota - school.quota2026 > 0 ? '+' : ''}${
                            school.quota - school.quota2026
                          }`}
                    </strong>
                    {school.quota - school.quota2026 !== 0 && (
                      <span className="text-xs text-[#7d674f] ml-0.5">명</span>
                    )}
                  </div>
                </div>

                {school.athletes2027 && (
                  <div className="mt-3 p-3 bg-white/80 rounded-xl border border-[#ebd8bf] text-xs text-[#6e5842]">
                    <strong className="text-[#b85e00]">체육특기자 선배정 계획: </strong>
                    <span>
                      {school.athletes2027.sport} {school.athletes2027.planned}명 (정원 내 선발이며, 일반 지원자의 실제 배정 정원과 구분 필요)
                    </span>
                  </div>
                )}
              </section>

              {/* Transit & Personal Travel Time Recording */}
              <section className="bg-white border border-[#ebdcc9] rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm sm:text-base text-[#261d13] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#ed8200]" />
                    <span>통학 거리 및 직접 확인한 통학시간</span>
                  </h3>
                  {originMiddle && (
                    <a
                      href={kakaoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[#ed8200] hover:text-[#b85e00] font-bold"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>카카오맵 대중교통 길찾기 ↗</span>
                    </a>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#faf6f0] rounded-xl border border-[#ede0ce]">
                  <div>
                    <span className="text-xs text-[#78634d] block">
                      {originMiddle ? `${originMiddle.name} 기준 거리` : '출발 중학교'}
                    </span>
                    <strong className="text-base sm:text-lg font-bold text-[#261d13]">
                      {distText}
                    </strong>
                  </div>

                  <div className="flex items-center gap-2">
                    <label htmlFor="travel-time" className="text-xs font-semibold text-[#5c4936]">
                      실제 통학시간:
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        id="travel-time"
                        type="number"
                        min="1"
                        max="300"
                        placeholder="예: 25"
                        value={timeInput}
                        onChange={(e) => setTimeInput(e.target.value)}
                        className="w-20 px-2.5 py-1.5 bg-white border border-[#ebdcc9] rounded-lg text-xs font-bold text-center focus:ring-2 focus:ring-[#ed8200]"
                      />
                      <span className="text-xs text-[#5c4936]">분</span>
                      <button
                        type="button"
                        onClick={handleSaveTravelTime}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#ed8200] hover:bg-[#cf7200] text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>기록</span>
                      </button>
                    </div>
                  </div>
                </div>

                {timeSavedNotice && (
                  <p className="text-xs text-emerald-600 font-bold animate-in fade-in flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>통학시간 기록이 저장되었습니다! 지망표와 내보내기 문서에 반영됩니다.</span>
                  </p>
                )}
              </section>

              {/* School Contact & Links */}
              <section className="bg-white border border-[#ebdcc9] rounded-2xl p-5 shadow-xs space-y-3">
                <h3 className="font-extrabold text-sm sm:text-base text-[#261d13]">
                  학교 연락처 & 공식 링크
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2 p-3 bg-[#faf7f2] rounded-xl border border-[#ebdcc9]">
                    <Phone className="w-4 h-4 text-[#ed8200] shrink-0" />
                    <div>
                      <span className="text-[#8c745c] block">행정실 / 교무실</span>
                      <a href={`tel:${school.phone}`} className="font-bold text-[#261d13] hover:underline">
                        {school.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-[#faf7f2] rounded-xl border border-[#ebdcc9]">
                    <Globe className="w-4 h-4 text-[#ed8200] shrink-0" />
                    <div>
                      <span className="text-[#8c745c] block">학교 공식 홈페이지</span>
                      <a
                        href={school.homepage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-[#b85e00] hover:underline truncate block max-w-xs"
                      >
                        {school.homepage} ↗
                      </a>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href={school.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-[#7e6954] hover:text-[#b85e00] underline"
                  >
                    <span>학교알리미(SchoolInfo) 원문 공시자료 바로가기</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </section>
            </div>
          )}

          {/* TAB 2: 선택과목 & 교육과정 (Curriculum) */}
          {activeTab === 'curriculum' && (
            <div className="space-y-6">
              <div className="p-4 bg-[#fdfaf5] border border-[#f5dfc3] rounded-2xl text-xs text-[#6e5842] leading-relaxed">
                <strong className="text-[#b85e00] font-bold">2026학년도 1학기 공시 교육과정 편제</strong>
                <p className="mt-0.5">
                  실제 2·3학년 성취도 공시에 수강 내역이 등장하는 과목 목록입니다. 2027학년도 신입생의 확정 개설 여부와 학생 선택 묶음은 매 학년도 학교 교육과정 설명회를 확인해 주세요.
                </p>
              </div>

              {/* Upper Grade Subjects Tags */}
              <section className="bg-white border border-[#ebdcc9] rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm sm:text-base text-[#261d13]">
                    실제 수업이 확인되는 과목 ({upperGradeSubjects.length}개)
                  </h3>
                  <span className="text-xs text-[#8c745c]">2·3학년 수강 공시 기준</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {upperGradeSubjects.map((subject) => (
                    <span
                      key={subject}
                      className="text-xs px-2.5 py-1 bg-[#faf4ec] text-[#523e2b] rounded-lg border border-[#ebdcc9] font-medium"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </section>

              {/* In-app Document Viewer for Curriculum */}
              <section className="bg-white border border-[#ebdcc9] rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-[#261d13]">
                      교육과정 공시 원문 읽기
                    </h3>
                    <p className="text-xs text-[#8c745c]">
                      학교가 제출한 교육과정 편성 문서를 앱에서 바로 검색하고 읽습니다.
                    </p>
                  </div>

                  {/* Document Select */}
                  <select
                    value={selectedDocId || ''}
                    onChange={(e) => {
                      setSelectedDocId(Number(e.target.value));
                      setDocPage(0);
                    }}
                    className="bg-[#faf6f0] border border-[#ebdcc9] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#261d13] max-w-xs cursor-pointer"
                  >
                    {categoryDocs.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search Bar for Document */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="search"
                      placeholder="문서 본문 단어 검색 (예: 정보, 인공지능, 제2외국어, 미적분)"
                      value={docSearchQuery}
                      onChange={(e) => setDocSearchQuery(e.target.value)}
                      className="w-full bg-[#faf7f2] border border-[#ebdcc9] rounded-xl px-3.5 py-2 pl-9 text-xs focus:ring-2 focus:ring-[#ed8200]"
                    />
                    <Search className="w-4 h-4 text-[#8c745c] absolute left-3 top-2.5" />
                  </div>
                  {docSearchQuery && (
                    <button
                      onClick={() => setDocSearchQuery('')}
                      className="text-xs text-[#8c745c] hover:text-[#261d13] px-2 py-1"
                    >
                      지우기
                    </button>
                  )}
                </div>

                {/* Document Content View */}
                {renderDocContent()}

                {currentDoc && (
                  <div className="pt-2 border-t border-[#f0e4d4] flex items-center justify-between text-xs text-[#8c745c]">
                    <span>{currentDoc.period} · {currentDoc.status}</span>
                    <a
                      href={currentDoc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-[#b85e00] hover:underline inline-flex items-center gap-1"
                    >
                      <span>학교알리미 원본 첨부파일 열기</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* TAB 3: 평가계획 (Assessment) */}
          {activeTab === 'assessment' && (
            <div className="space-y-6">
              <div className="p-4 bg-[#fdfaf5] border border-[#f5dfc3] rounded-2xl text-xs text-[#6e5842] leading-relaxed">
                <strong className="text-[#b85e00] font-bold">2026학년도 1학년 2학기 국어·수학·영어 평가 비율</strong>
                <p className="mt-0.5">
                  중간·기말 지필평가와 수행평가의 반영 비율입니다. 서답형(서술형·논술형) 지필평가 비율도 함께 확인하세요.
                </p>
              </div>

              {/* Assessment Ratio Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { key: 'korean', label: '공통국어', data: school.assessmentSummary?.korean },
                  { key: 'math', label: '공통수학', data: school.assessmentSummary?.math },
                  { key: 'english', label: '공통영어', data: school.assessmentSummary?.english },
                ].map(({ key, label, data }) => (
                  <div key={key} className="bg-white border border-[#ebdcc9] rounded-2xl p-4 shadow-xs space-y-3">
                    <h4 className="font-extrabold text-sm text-[#261d13] flex items-center justify-between">
                      <span>{label}</span>
                      <span className="text-xs font-normal text-[#8c745c]">
                        {data ? '1학년 2학기' : '미제공'}
                      </span>
                    </h4>

                    {data ? (
                      <div className="space-y-2 text-xs">
                        {/* Stacked bar */}
                        <div className="h-3 w-full bg-stone-100 rounded-full overflow-hidden flex">
                          <div
                            style={{ width: `${data.paper}%` }}
                            className="bg-[#ed8200]"
                            title={`지필평가 ${data.paper}%`}
                          />
                          <div
                            style={{ width: `${data.performance}%` }}
                            className="bg-emerald-500"
                            title={`수행평가 ${data.performance}%`}
                          />
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#ed8200]" />
                            <span className="font-medium">지필 {data.paper}%</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                            <span className="font-medium">수행 {data.performance}%</span>
                          </span>
                        </div>

                        {data.essay > 0 && (
                          <div className="pt-2 border-t border-[#f0e4d4] text-[11px] text-[#7d674f]">
                            지필 중 서술·논술형: <strong>{data.essay}%</strong>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-[#a6927d] italic py-4 text-center">
                        공시 평가계획 요약 없음
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Assessment In-App Document Viewer */}
              <section className="bg-white border border-[#ebdcc9] rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-[#261d13]">
                      교과별 평가계획 원문 보기
                    </h3>
                    <p className="text-xs text-[#8c745c]">
                      과목별 세부 수행평가 영역, 채점 기준, 시기 등을 원문에서 확인합니다.
                    </p>
                  </div>

                  <select
                    value={selectedDocId || ''}
                    onChange={(e) => {
                      setSelectedDocId(Number(e.target.value));
                      setDocPage(0);
                    }}
                    className="bg-[#faf6f0] border border-[#ebdcc9] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#261d13] max-w-xs cursor-pointer"
                  >
                    {categoryDocs.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quick keyword buttons */}
                <div className="flex flex-wrap gap-1.5">
                  {['지필평가', '수행평가', '반영비율', '서술형', '평가 기준'].map((kw) => (
                    <button
                      key={kw}
                      type="button"
                      onClick={() => setDocSearchQuery(kw)}
                      className="px-2.5 py-1 text-xs bg-[#fdf5eb] text-[#b85e00] rounded-lg border border-[#f5dfc3] font-semibold hover:bg-[#faebd9]"
                    >
                      '{kw}' 찾기
                    </button>
                  ))}
                </div>

                {renderDocContent()}
              </section>
            </div>
          )}

          {/* TAB 4: 학업성취도 (Achievement) */}
          {activeTab === 'achievement' && (
            <div className="space-y-6">
              <div className="p-4 bg-[#fdfaf5] border border-[#f5dfc3] rounded-2xl text-xs text-[#6e5842] leading-relaxed">
                <strong className="text-[#b85e00] font-bold">2026학년도 1학기 학업성취도 (2026년 9월 공시)</strong>
                <p className="mt-0.5">
                  A~E는 성취 수준별 학생 비율(%)이며, 평균은 100점 만점 기준 점수입니다. 시험 난도와 수강 학생 구성이 달라 단순 평균 비교만으로 내신 유불리나 학교 수준을 판단할 수 없습니다.
                </p>
              </div>

              {/* 1st Grade Core Subject Cards */}
              <section className="space-y-3">
                <h3 className="font-bold text-sm sm:text-base text-[#261d13]">
                  1학년 핵심 공통과목 성취도
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {coreAchievements.map((rec, i) => (
                    <div
                      key={i}
                      className="bg-white border border-[#ebdcc9] rounded-2xl p-4 shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-sm font-black text-[#261d13]">
                          {rec.subject}
                        </strong>
                        <span className="text-xs px-2 py-0.5 bg-[#fdf5eb] text-[#b85e00] font-bold rounded-md">
                          평균 {rec.mean.toFixed(1)}점
                        </span>
                      </div>

                      {/* Visual A-E stacked bar */}
                      <div className="space-y-1.5">
                        <div className="h-3 w-full bg-stone-100 rounded-full overflow-hidden flex">
                          <div style={{ width: `${rec.A || 0}%` }} className="bg-[#4caf50]" title={`A: ${rec.A}%`} />
                          <div style={{ width: `${rec.B || 0}%` }} className="bg-[#8bc34a]" title={`B: ${rec.B}%`} />
                          <div style={{ width: `${rec.C || 0}%` }} className="bg-[#ffc107]" title={`C: ${rec.C}%`} />
                          <div style={{ width: `${rec.D || 0}%` }} className="bg-[#ff9800]" title={`D: ${rec.D}%`} />
                          <div style={{ width: `${rec.E || 0}%` }} className="bg-[#f44336]" title={`E: ${rec.E}%`} />
                        </div>

                        {/* Percent breakdown */}
                        <div className="grid grid-cols-5 text-center text-[11px] pt-1 border-t border-[#f2e6d6]">
                          <div><span className="text-[#388e3c] font-bold block">A</span>{rec.A ?? '—'}%</div>
                          <div><span className="text-[#689f38] font-bold block">B</span>{rec.B ?? '—'}%</div>
                          <div><span className="text-[#f57f17] font-bold block">C</span>{rec.C ?? '—'}%</div>
                          <div><span className="text-[#e65100] font-bold block">D</span>{rec.D ?? '—'}%</div>
                          <div><span className="text-[#d32f2f] font-bold block">E</span>{rec.E ?? '—'}%</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* All Subjects Table with Grade Filter */}
              <section className="bg-white border border-[#ebdcc9] rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h3 className="font-bold text-sm sm:text-base text-[#261d13]">
                    전체 과목별 성취도 조회
                  </h3>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedGrade}
                      onChange={(e) => setSelectedGrade(Number(e.target.value))}
                      className="bg-[#faf6f0] border border-[#ebdcc9] rounded-xl px-3 py-1.5 text-xs font-bold text-[#261d13] cursor-pointer"
                    >
                      <option value={1}>1학년 과목</option>
                      <option value={2}>2학년 과목</option>
                      <option value={3}>3학년 과목</option>
                    </select>

                    <input
                      type="search"
                      placeholder="과목명 검색 (예: 화학, 독서)"
                      value={subjectQuery}
                      onChange={(e) => setSubjectQuery(e.target.value)}
                      className="bg-[#faf7f2] border border-[#ebdcc9] rounded-xl px-3 py-1.5 text-xs focus:ring-2 focus:ring-[#ed8200]"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-[#ebdcc9]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#f8efe3] border-b border-[#ebdcc9] text-[#5c4a37]">
                        <th className="py-2.5 px-3 font-bold">과목명</th>
                        <th className="py-2.5 px-3 font-bold text-center">평균</th>
                        <th className="py-2.5 px-3 font-bold text-center min-w-32">분포 비율</th>
                        <th className="py-2.5 px-2 font-bold text-center">A(%)</th>
                        <th className="py-2.5 px-2 font-bold text-center">B(%)</th>
                        <th className="py-2.5 px-2 font-bold text-center">C(%)</th>
                        <th className="py-2.5 px-2 font-bold text-center">D(%)</th>
                        <th className="py-2.5 px-2 font-bold text-center">E(%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f2e6d6]">
                      {filteredAchievements.map((rec, idx) => (
                        <tr key={idx} className="hover:bg-[#fdfaf5]">
                          <td className="py-2 px-3 font-semibold text-[#261d13]">
                            {rec.subject}
                          </td>
                          <td className="py-2 px-3 font-bold text-center text-[#ed8200]">
                            {rec.mean.toFixed(1)}
                          </td>
                          <td className="py-2 px-3">
                            <div className="h-2.5 w-full bg-stone-100 rounded-full overflow-hidden flex">
                              <div style={{ width: `${rec.A || 0}%` }} className="bg-[#4caf50]" />
                              <div style={{ width: `${rec.B || 0}%` }} className="bg-[#8bc34a]" />
                              <div style={{ width: `${rec.C || 0}%` }} className="bg-[#ffc107]" />
                              <div style={{ width: `${rec.D || 0}%` }} className="bg-[#ff9800]" />
                              <div style={{ width: `${rec.E || 0}%` }} className="bg-[#f44336]" />
                            </div>
                          </td>
                          <td className="py-2 px-2 text-center">{rec.A ?? '—'}</td>
                          <td className="py-2 px-2 text-center">{rec.B ?? '—'}</td>
                          <td className="py-2 px-2 text-center">{rec.C ?? '—'}</td>
                          <td className="py-2 px-2 text-center">{rec.D ?? '—'}</td>
                          <td className="py-2 px-2 text-center">{rec.E ?? '—'}</td>
                        </tr>
                      ))}
                      {filteredAchievements.length === 0 && (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-xs text-[#8c745c]">
                            해당 학년 및 검색 조건에 맞는 과목이 없습니다.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {/* TAB 5: 졸업 후 진로 (Graduates) */}
          {activeTab === 'graduates' && (
            <div className="space-y-6">
              <div className="p-4 bg-[#fdfaf5] border border-[#f5dfc3] rounded-2xl text-xs text-[#6e5842] leading-relaxed">
                <strong className="text-[#b85e00] font-bold">2025년 학교알리미 공시 졸업생 진로 현황</strong>
                <p className="mt-0.5">
                  진학률은 졸업생의 선택 결과이며, 개별 대학 순위나 수시·정시 전형 결과, 재수 인원은 본 자료에 포함되지 않습니다. 기타 항목 인원 전체를 재수생으로 볼 수는 없습니다.
                </p>
              </div>

              {graduateSummary && (
                <section className="bg-white border border-[#ebdcc9] rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="bg-[#faf6f0] p-3 rounded-xl border border-[#ede0ce]">
                      <span className="text-xs text-[#7d674f] block">총 졸업자</span>
                      <strong className="text-xl sm:text-2xl font-black text-[#261d13]">
                        {graduateSummary.graduates}
                      </strong>
                      <span className="text-xs text-[#7d674f] ml-0.5">명</span>
                    </div>

                    <div className="bg-[#faf6f0] p-3 rounded-xl border border-[#ede0ce]">
                      <span className="text-xs text-[#7d674f] block">4년제 대학교 진학률</span>
                      <strong className="text-xl sm:text-2xl font-black text-[#ed8200]">
                        {formatRate(graduateSummary.university, graduateSummary.graduates)}
                      </strong>
                      <span className="text-[11px] text-[#8c745c] block mt-0.5">
                        {graduateSummary.university}명 (전문대 제외)
                      </span>
                    </div>

                    <div className="bg-[#faf6f0] p-3 rounded-xl border border-[#ede0ce]">
                      <span className="text-xs text-[#7d674f] block">대학 진학률 (전문대 포함)</span>
                      <strong className="text-xl sm:text-2xl font-black text-[#2c2115]">
                        {formatRate(graduateSummary.further_total, graduateSummary.graduates)}
                      </strong>
                      <span className="text-[11px] text-[#8c745c] block mt-0.5">
                        {graduateSummary.further_total}명 (전문·국외 포함)
                      </span>
                    </div>

                    <div className="bg-[#faf6f0] p-3 rounded-xl border border-[#ede0ce]">
                      <span className="text-xs text-[#7d674f] block">전문대학 진학</span>
                      <strong className="text-xl sm:text-2xl font-black text-[#5c4a37]">
                        {graduateSummary.junior_college}
                      </strong>
                      <span className="text-xs text-[#7d674f] ml-0.5">명</span>
                    </div>
                  </div>

                  {/* Visual Proportion Bar */}
                  <div className="space-y-1.5 pt-2">
                    <span className="text-xs font-semibold text-[#5c4a37]">진로 비율</span>
                    <div className="h-4 w-full bg-stone-100 rounded-full overflow-hidden flex">
                      <div
                        style={{
                          width: `${(graduateSummary.university / graduateSummary.graduates) * 100}%`,
                        }}
                        className="bg-[#2e7d32]"
                        title={`대학교: ${graduateSummary.university}명`}
                      />
                      <div
                        style={{
                          width: `${
                            ((graduateSummary.junior_college + graduateSummary.foreign_total) /
                              graduateSummary.graduates) *
                            100
                          }%`,
                        }}
                        className="bg-[#81c784]"
                        title={`전문대·국외: ${graduateSummary.junior_college + graduateSummary.foreign_total}명`}
                      />
                      <div
                        style={{
                          width: `${
                            ((graduateSummary.other + graduateSummary.employed) /
                              graduateSummary.graduates) *
                            100
                          }%`,
                        }}
                        className="bg-[#ffb74d]"
                        title={`기타·취업: ${graduateSummary.other + graduateSummary.employed}명`}
                      />
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[#6e5842] pt-1">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#2e7d32]" />
                        <span>국내 대학교</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#81c784]" />
                        <span>전문대·국외</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ffb74d]" />
                        <span>기타·취업</span>
                      </span>
                    </div>
                  </div>
                </section>
              )}

              {/* Gender Breakdown Table */}
              <section className="bg-white border border-[#ebdcc9] rounded-2xl p-5 shadow-xs space-y-3">
                <h3 className="font-bold text-sm sm:text-base text-[#261d13]">
                  성별 세부 진학 통계
                </h3>
                <div className="overflow-x-auto rounded-xl border border-[#ebdcc9]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#f8efe3] border-b border-[#ebdcc9] text-[#5c4a37]">
                        <th className="py-2.5 px-3 font-bold">성별</th>
                        <th className="py-2.5 px-3 font-bold text-right">졸업자</th>
                        <th className="py-2.5 px-3 font-bold text-right">국내 대학교</th>
                        <th className="py-2.5 px-3 font-bold text-right">전문대학</th>
                        <th className="py-2.5 px-3 font-bold text-right">국외 진학</th>
                        <th className="py-2.5 px-3 font-bold text-right">진학 합계</th>
                        <th className="py-2.5 px-3 font-bold text-right">취업</th>
                        <th className="py-2.5 px-3 font-bold text-right">기타</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f2e6d6]">
                      {school.graduates.map((row, idx) => (
                        <tr
                          key={idx}
                          className={row.gender === '합계' ? 'bg-[#fffaf0] font-bold' : 'hover:bg-[#fdfaf5]'}
                        >
                          <td className="py-2.5 px-3 font-semibold text-[#261d13]">{row.gender}</td>
                          <td className="py-2.5 px-3 text-right">{row.graduates}명</td>
                          <td className="py-2.5 px-3 text-right text-[#ed8200] font-bold">
                            {row.university}명
                          </td>
                          <td className="py-2.5 px-3 text-right">{row.junior_college}명</td>
                          <td className="py-2.5 px-3 text-right">{row.foreign_total}명</td>
                          <td className="py-2.5 px-3 text-right font-bold">{row.further_total}명</td>
                          <td className="py-2.5 px-3 text-right">{row.employed}명</td>
                          <td className="py-2.5 px-3 text-right text-[#8c745c]">{row.other}명</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#fbf5ec] border-t border-[#ebdcc9] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => onToggleWishlist(school.id)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs ${
              isAdded
                ? 'bg-[#ed8200] text-white hover:bg-[#cf7200]'
                : 'bg-white text-[#b85e00] border border-[#e8d5be] hover:bg-[#fff7ee]'
            }`}
          >
            <span>{isAdded ? '✓ 내 지망표에 담김' : '+ 내 지망표에 추가'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#2c2217] hover:bg-[#1a140d] text-white text-xs sm:text-sm font-bold rounded-xl transition-colors shadow-xs"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
