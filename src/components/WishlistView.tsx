import React from 'react';
import { School, MiddleSchool, UserPrefs, DetailTabType } from '../types';
import { shortenSchoolName, formatNumber, getDistanceText, getKakaoRouteUrl } from '../utils/geo';
import { generateWishlistImages, downloadWishlistCSV, downloadJSONBackup } from '../utils/export';
import {
  Bookmark,
  ArrowUp,
  ArrowDown,
  Trash2,
  FileDown,
  Printer,
  FileSpreadsheet,
  Upload,
  Download,
  Navigation,
  Clock,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ListPlus,
  Plus,
} from 'lucide-react';

interface WishlistViewProps {
  schools: School[];
  middles: MiddleSchool[];
  prefs: UserPrefs;
  originMiddle?: MiddleSchool | null;
  onUpdatePrefs: (updated: Partial<UserPrefs>) => void;
  onOpenDetail: (schoolId: number, tab?: DetailTabType) => void;
  onGoToSchools: () => void;
  onToast: (msg: string) => void;
}

export const WishlistView: React.FC<WishlistViewProps> = ({
  schools,
  middles,
  prefs,
  originMiddle,
  onUpdatePrefs,
  onOpenDetail,
  onGoToSchools,
  onToast,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isExportingImage, setIsExportingImage] = React.useState(false);

  const totalEligibleCount = prefs.gender === 'male' ? 20 : 22;

  // Chosen schools in wishlist order
  const chosenSchools = prefs.wishlist
    .map((id) => schools.find((s) => s.id === id))
    .filter(Boolean) as School[];

  // Reorder up
  const moveUp = (index: number) => {
    if (index === 0) return;
    const nextList = [...prefs.wishlist];
    [nextList[index - 1], nextList[index]] = [nextList[index], nextList[index - 1]];
    onUpdatePrefs({ wishlist: nextList });
  };

  // Reorder down
  const moveDown = (index: number) => {
    if (index >= prefs.wishlist.length - 1) return;
    const nextList = [...prefs.wishlist];
    [nextList[index + 1], nextList[index]] = [nextList[index], nextList[index + 1]];
    onUpdatePrefs({ wishlist: nextList });
  };

  // Remove from wishlist
  const removeSchool = (schoolId: number) => {
    const nextList = prefs.wishlist.filter((id) => id !== schoolId);
    onUpdatePrefs({ wishlist: nextList });
    onToast('지망표에서 제외했습니다.');
  };

  // Update note for school
  const handleNoteChange = (schoolId: number, note: string) => {
    const nextNotes = { ...prefs.notes, [schoolId]: note };
    onUpdatePrefs({ notes: nextNotes });
  };

  // Update transit time
  const handleTimeChange = (schoolId: number, val: string) => {
    const num = val.trim() === '' ? undefined : Number(val);
    const nextTimes = { ...prefs.times };
    if (num && !isNaN(num) && num >= 1 && num <= 300) {
      nextTimes[schoolId] = Math.round(num);
    } else {
      delete nextTimes[schoolId];
    }
    onUpdatePrefs({ times: nextTimes });
  };

  // Fill remaining schools in alphabetical order
  const handleFillRemaining = () => {
    const eligible = schools.filter((s) => prefs.gender !== 'male' || !s.girls);
    const remaining = eligible
      .filter((s) => !prefs.wishlist.includes(s.id))
      .sort((a, b) => a.name.localeCompare(b.name, 'ko'));

    const nextList = [...prefs.wishlist, ...remaining.map((s) => s.id)];
    onUpdatePrefs({ wishlist: nextList });
    onToast(`남은 ${remaining.length}개교를 가나다순으로 채웠습니다. 순서를 검토해 주세요.`);
  };

  // Export as Image (JPG / PNG)
  const handleSaveImage = async () => {
    if (chosenSchools.length === 0) return;
    try {
      setIsExportingImage(true);
      const blobs = await generateWishlistImages(chosenSchools, prefs, originMiddle);
      blobs.forEach((blob, idx) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `2027_부천_나의지망표_쪽${idx + 1}.jpg`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      });
      onToast('지망표 이미지를 내려받았습니다.');
    } catch (e) {
      onToast('이미지 저장 중 오류가 발생했습니다.');
    } finally {
      setIsExportingImage(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    downloadWishlistCSV(chosenSchools, prefs, originMiddle);
    onToast('엑셀용 CSV 파일을 내려받았습니다.');
  };

  // Print
  const handlePrint = () => {
    window.print();
  };

  // JSON Restore Handler
  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const p = JSON.parse(text);

      if (
        p.version !== 1 ||
        !Array.isArray(p.wishlist) ||
        !['male', 'female'].includes(p.gender)
      ) {
        throw new Error('Invalid format');
      }

      onUpdatePrefs({
        gender: p.gender,
        origin: middles.some((m) => m.name === p.origin) ? p.origin : '',
        distance: typeof p.distance === 'boolean' ? p.distance : true,
        wishlist: Array.from(new Set<number>(p.wishlist)).filter((id) => {
          const s = schools.find((sc) => sc.id === id);
          return s && (p.gender !== 'male' || !s.girls);
        }),
        notes: typeof p.notes === 'object' && p.notes ? p.notes : {},
        times: typeof p.times === 'object' && p.times ? p.times : {},
      });

      onToast('지망표 백업 기록을 성공적으로 복원했습니다.');
    } catch {
      onToast('올바른 지망표 백업 JSON 파일인지 확인해 주세요.');
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-8">
      {/* Title & Introduction */}
      <div className="bg-white rounded-3xl border border-[#ebdcc9] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold text-[#b85e00] tracking-wider uppercase">
                MY WISHLIST PLANNER
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#fdf5eb] text-[#ed8200] border border-[#f5dfc3]">
                {prefs.gender === 'male' ? '남학생' : '여학생'} · {chosenSchools.length}/{totalEligibleCount}개교
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#261d13]">
              나의 2027 고등학교 지망표
            </h1>
            <p className="text-xs sm:text-sm text-[#7d674f] mt-1.5 leading-relaxed">
              가고 싶은 순서대로 학교를 정렬하고, 메모와 직접 확인한 통학시간을 기록하세요. 
              가족과 함께 상의하고 최종 원서 작성 전 이미지·PDF·엑셀로 보관할 수 있습니다.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <button
              onClick={onGoToSchools}
              className="px-4 py-2 bg-[#fdf5eb] hover:bg-[#faebd9] text-[#b85e00] text-xs sm:text-sm font-bold rounded-xl border border-[#ebd8bf] transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>학교 더 찾아보기</span>
            </button>
          </div>
        </div>

        {/* Save & Export Action Strip */}
        <div className="mt-6 pt-5 border-t border-[#f0e4d4] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#5c4936]">
            <Sparkles className="w-4 h-4 text-[#ed8200]" />
            <span>지망표 저장 & 내보내기:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSaveImage}
              disabled={chosenSchools.length === 0 || isExportingImage}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#ed8200] hover:bg-[#cf7200] disabled:opacity-40 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>{isExportingImage ? '이미지 생성 중…' : '이미지 저장 (JPG)'}</span>
            </button>

            <button
              onClick={handlePrint}
              disabled={chosenSchools.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#faf4ec] disabled:opacity-40 text-[#2c2217] text-xs font-bold rounded-xl border border-[#ebdcc9] transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>인쇄 / PDF</span>
            </button>

            <button
              onClick={handleExportCSV}
              disabled={chosenSchools.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#faf4ec] disabled:opacity-40 text-[#2c2217] text-xs font-bold rounded-xl border border-[#ebdcc9] transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>엑셀 CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Ranked School Items List */}
        <div className="lg:col-span-8 space-y-4">
          {chosenSchools.length > 0 ? (
            <div className="space-y-3.5">
              {chosenSchools.map((s, idx) => {
                const distText = getDistanceText(s, originMiddle, prefs.distance);
                const kakaoUrl = getKakaoRouteUrl(s, originMiddle);

                return (
                  <div
                    key={s.id}
                    className="bg-white rounded-2xl border border-[#ebdcc9] hover:border-[#dfc9b2] p-4 sm:p-5 shadow-xs transition-all flex flex-col sm:flex-row items-stretch sm:items-start gap-4"
                  >
                    {/* Rank Number Badge */}
                    <div className="flex sm:flex-col items-center justify-between sm:justify-start gap-2 shrink-0">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#ed8200] to-[#b85e00] text-white flex flex-col items-center justify-center font-black shadow-xs">
                        <span className="text-[10px] opacity-80 leading-none">지망</span>
                        <span className="text-lg leading-tight">{idx + 1}</span>
                      </div>

                      {/* Rank Move Controls */}
                      <div className="flex sm:flex-col items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveUp(idx)}
                          aria-label={`${s.name} 순위 올리기`}
                          className="p-1.5 rounded-lg bg-[#faf5ee] text-[#78634d] hover:text-[#261d13] hover:bg-[#ede0ce] disabled:opacity-30 transition-colors"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === chosenSchools.length - 1}
                          onClick={() => moveDown(idx)}
                          aria-label={`${s.name} 순위 내리기`}
                          className="p-1.5 rounded-lg bg-[#faf5ee] text-[#78634d] hover:text-[#261d13] hover:bg-[#ede0ce] disabled:opacity-30 transition-colors"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* School Content & Notes */}
                    <div className="flex-1 space-y-2.5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onOpenDetail(s.id, 'overview')}
                              className="font-black text-base sm:text-lg text-[#261d13] hover:text-[#ed8200] transition-colors text-left"
                            >
                              {s.name}
                            </button>
                            <span className="text-xs text-[#8c745c]">
                              ({s.girls ? '여고' : '남녀공학'} · {s.ownership})
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-xs text-[#7d674f] mt-1">
                            {prefs.distance && originMiddle && (
                              <span className="font-semibold text-[#b85e00]">
                                {distText}
                              </span>
                            )}
                            <span>· 2027 모집 {formatNumber(s.quota, 0)}명</span>
                            <a
                              href={kakaoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-[#ed8200] hover:underline"
                            >
                              <Navigation className="w-3 h-3" />
                              <span>길찾기</span>
                            </a>
                          </div>
                        </div>

                        {/* Remove school button */}
                        <button
                          type="button"
                          onClick={() => removeSchool(s.id)}
                          aria-label={`${s.name} 지망표에서 삭제`}
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Transit time input row */}
                      <div className="flex items-center gap-2 text-xs text-[#6e5842] bg-[#fbf7f1] p-2.5 rounded-xl border border-[#ebdcc9]">
                        <Clock className="w-3.5 h-3.5 text-[#ed8200] shrink-0" />
                        <span className="font-semibold">직접 확인한 통학시간:</span>
                        <input
                          type="number"
                          min="1"
                          max="300"
                          placeholder="분 입력"
                          value={prefs.times[s.id] ?? ''}
                          onChange={(e) => handleTimeChange(s.id, e.target.value)}
                          className="w-16 px-2 py-0.5 bg-white border border-[#ebdcc9] rounded-md text-xs font-bold text-center focus:ring-1 focus:ring-[#ed8200]"
                        />
                        <span>분</span>
                        <span className="text-[11px] text-[#8c745c] hidden sm:inline">
                          (길찾기로 소요시간을 확인해 기록하세요)
                        </span>
                      </div>

                      {/* Note textarea */}
                      <div>
                        <textarea
                          rows={2}
                          value={prefs.notes[s.id] ?? ''}
                          onChange={(e) => handleNoteChange(s.id, e.target.value)}
                          placeholder="이 학교를 선택한 이유나 기억할 점(예: 수학 중점 프로그램, 통학 버스 노선 등)을 적어보세요."
                          className="w-full bg-[#faf7f2] border border-[#ebdcc9] hover:border-[#dfc9b2] focus:border-[#ed8200] focus:ring-1 focus:ring-[#ed8200] rounded-xl p-2.5 text-xs text-[#261d13] leading-relaxed resize-y"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-[#ebdcc9] p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#fdf5eb] text-[#ed8200] flex items-center justify-center mx-auto shadow-xs">
                <Bookmark className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-[#261d13]">
                아직 지망표에 담긴 학교가 없습니다.
              </h3>
              <p className="text-xs text-[#7d674f] max-w-md mx-auto leading-relaxed">
                ‘학교 찾기’ 화면에서 가고 싶은 고등학교의 <strong>[지망표 추가]</strong> 버튼을 누르면 이 곳에서 1지망부터 순위를 정리하고 메모를 작성할 수 있습니다.
              </p>
              <button
                onClick={onGoToSchools}
                className="mt-2 px-6 py-2.5 bg-[#ed8200] hover:bg-[#cf7200] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors"
              >
                학교 찾아보기 →
              </button>
            </div>
          )}
        </div>

        {/* Right Sidebar Summary & Actions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Progress Card */}
          <section className="bg-white rounded-2xl border border-[#ebdcc9] p-5 shadow-xs space-y-4">
            <h2 className="font-extrabold text-sm sm:text-base text-[#261d13]">
              지망 순서 완성 현황
            </h2>

            <div>
              <div className="flex items-baseline justify-between mb-1.5">
                <strong className="text-2xl font-black text-[#ed8200]">
                  {chosenSchools.length}
                </strong>
                <span className="text-xs text-[#8c745c]">
                  / 총 {totalEligibleCount}개교
                </span>
              </div>
              <div className="h-3 w-full bg-[#faf4ec] rounded-full overflow-hidden border border-[#ebdcc9]">
                <div
                  style={{
                    width: `${Math.min(100, (chosenSchools.length / totalEligibleCount) * 100)}%`,
                  }}
                  className="h-full bg-gradient-to-r from-[#ed8200] to-[#b85e00] rounded-full transition-all duration-300"
                />
              </div>
            </div>

            <p className="text-xs text-[#6e5842] leading-relaxed">
              {chosenSchools.length === totalEligibleCount ? (
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>모든 지망 학교를 채웠습니다! 순서를 최종 검토하세요.</span>
                </span>
              ) : (
                <span>
                  현재 관심 학교를 우선 담아두셨습니다. 실제 원서 접수 시에는 관내 {totalEligibleCount}개 모든 학교의 순위를 작성해야 합니다.
                </span>
              )}
            </p>

            {/* Fill remaining button */}
            {chosenSchools.length < totalEligibleCount && (
              <button
                type="button"
                onClick={handleFillRemaining}
                className="w-full py-2.5 bg-[#fdf5eb] hover:bg-[#faebd9] text-[#b85e00] text-xs font-bold rounded-xl border border-[#ebd8bf] transition-colors flex items-center justify-center gap-1.5"
              >
                <ListPlus className="w-4 h-4" />
                <span>남은 학교 가나다순 일괄 추가</span>
              </button>
            )}

            <div className="p-3 bg-[#faf6f0] rounded-xl border border-[#ede0ce] text-xs text-[#7d674f] space-y-1">
              <strong className="text-[#261d13] block">배정 방식 안내:</strong>
              <p>
                부천은 1지망부터 배정 정원만큼 채운 뒤, 잔여 정원이 있을 때 2지망, 3지망 순서로 넘어갑니다. 거리순 자동배정이 아니므로 1지망 선택이 매우 중요합니다.
              </p>
            </div>
          </section>

          {/* Backup & Restore Panel */}
          <section className="bg-white rounded-2xl border border-[#ebdcc9] p-5 shadow-xs space-y-3">
            <h3 className="font-extrabold text-sm text-[#261d13]">
              다른 기기로 기록 옮기기 (백업)
            </h3>
            <p className="text-xs text-[#8c745c] leading-relaxed">
              작성한 지망 순서, 메모, 통학시간은 현재 브라우저에만 저장됩니다. 스마트폰이나 다른 PC로 옮기실 때는 백업 파일을 활용하세요.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => downloadJSONBackup(prefs)}
                className="py-2 px-3 bg-[#faf5ee] hover:bg-[#ede0ce] text-[#2c2217] text-xs font-bold rounded-xl border border-[#ebdcc9] transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-[#b85e00]" />
                <span>백업 저장</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-2 px-3 bg-[#faf5ee] hover:bg-[#ede0ce] text-[#2c2217] text-xs font-bold rounded-xl border border-[#ebdcc9] transition-colors flex items-center justify-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5 text-[#b85e00]" />
                <span>백업 불러오기</span>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleRestoreFile}
              className="hidden"
            />
          </section>
        </div>
      </div>
    </div>
  );
};
