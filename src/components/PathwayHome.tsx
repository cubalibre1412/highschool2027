import { ArrowRight, Bookmark, GraduationCap, School } from 'lucide-react';
import type { ViewType } from '../types';
import type { SavedMajor } from '../utils/pathway';

const button = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#8d4100] px-4 text-sm font-bold text-white hover:bg-[#693000]';

export function PathwayHome({ onNavigate, savedCount, compareCount, wishlistCount }: {
  onNavigate: (view: ViewType) => void;
  savedCount: number;
  compareCount: number;
  wishlistCount: number;
}) {
  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <section className="rounded-3xl border border-[#ebd5bc] bg-[#fff7ec] p-5 sm:p-8">
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">나에게 맞는 학교를 찾아봐요</h1>
        <p className="mt-2 text-sm leading-relaxed text-[#594734] sm:text-base">고등학교부터 골라도, 관심 있는 전공부터 찾아봐도 좋아요.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={() => onNavigate('schools')} className="flex min-h-28 items-start gap-3 rounded-2xl border border-[#dcb894] bg-white p-4 text-left hover:bg-[#fff1df]">
            <School aria-hidden="true" className="mt-0.5 shrink-0 text-[#8d4100]" />
            <span className="flex-1"><strong className="block text-base">부천 고등학교 찾기</strong><span className="mt-1 block text-sm leading-relaxed text-[#594734]">통학과 과목을 비교하고 지망표를 만들어요.</span></span>
            <ArrowRight aria-hidden="true" size={18} className="mt-1 shrink-0" />
          </button>
          <button type="button" onClick={() => onNavigate('universities')} className="flex min-h-28 items-start gap-3 rounded-2xl border border-[#dcb894] bg-white p-4 text-left hover:bg-[#fff1df]">
            <GraduationCap aria-hidden="true" className="mt-0.5 shrink-0 text-[#8d4100]" />
            <span className="min-w-0 flex-1">
              <strong className="block text-base">서울 16개 대학·전공 찾기</strong>
              <span className="mt-1 block break-keep text-sm leading-relaxed text-[#594734]">
                2019년 교육부의 수능 위주 전형 확대 권고 대상 대학이에요.
              </span>
            </span>
            <ArrowRight aria-hidden="true" size={18} className="mt-1 shrink-0" />
          </button>
        </div>
      </section>
      {(savedCount > 0 || compareCount > 0 || wishlistCount > 0) && (
        <section className="rounded-2xl border border-[#ebdcc9] bg-white p-4">
          <h2 className="text-base font-bold">이어서 보기</h2>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {savedCount > 0 && <button className="min-h-11 text-sm font-semibold underline" onClick={() => onNavigate('majors')}>저장한 전공 {savedCount}개</button>}
            {compareCount > 0 && <button className="min-h-11 text-sm font-semibold underline" onClick={() => onNavigate(compareCount >= 2 ? 'courses' : 'schools')}>비교 중인 학교 {compareCount}개교</button>}
            {wishlistCount > 0 && <button className="min-h-11 text-sm font-semibold underline" onClick={() => onNavigate('wishlist')}>내 지망표 이어서 작성</button>}
          </div>
        </section>
      )}
    </div>
  );
}

export function SavedMajorsView({ saved, activeKey, onCompare, onRemove, onExplore }: {
  saved: SavedMajor[];
  activeKey: string;
  onCompare: (key: string) => void;
  onRemove: (major: SavedMajor) => void;
  onExplore: () => void;
}) {
  return (
    <div className="mx-auto max-w-3xl space-y-3">
      <section className="rounded-3xl border border-[#ebd5bc] bg-[#fff7ec] p-5 sm:p-7">
        <h1 className="flex items-center gap-2 text-2xl font-black"><Bookmark aria-hidden="true" /> 저장한 전공</h1>
        <p className="mt-2 text-sm text-[#594734]">{saved.length ? '궁금한 전공을 하나 골라 부천 고교에서 관련 과목을 어떻게 배우는지 살펴봐요.' : '대학·전공 찾기에서 마음에 드는 전공을 저장해 보세요.'}</p>
        <button type="button" className={`${button} mt-3`} onClick={onExplore}>{saved.length ? '대학·전공 더 찾아보기' : '대학·전공 찾기'}</button>
      </section>
      {saved.map((major) => (
        <article key={major.key} className="rounded-2xl border border-[#ebdcc9] bg-white p-4">
          <p className="text-sm text-[#594734]">{major.university}{major.college ? ` · ${major.college}` : ''}</p>
          <h2 className="mt-1 text-lg font-bold">{major.name}{activeKey === major.key && <span className="ml-2 text-xs text-[#793a00]">비교 중</span>}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className={button} onClick={() => onCompare(major.key)}>이 전공으로 부천 고교 비교</button>
            <button type="button" className="min-h-11 px-2 text-sm underline" aria-label={`${major.university} ${major.name} 저장 해제`} onClick={() => onRemove(major)}>저장 해제</button>
          </div>
        </article>
      ))}
    </div>
  );
}
