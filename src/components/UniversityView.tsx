import { useState } from 'react';
import { ArrowRight, Bookmark, Search } from 'lucide-react';
import type { AdmissionYear, SavedMajor, University } from '../utils/pathway';
import { subjectKey, usePathwayData } from '../utils/pathway';

export interface UniversityFilters {
  year: AdmissionYear;
  query: string;
  university: string;
  college: string;
}

interface Props {
  filters: UniversityFilters;
  onFilter: (filters: UniversityFilters) => void;
  saved: SavedMajor[];
  onToggleSave: (major: SavedMajor) => void;
  onCompare: (key: string) => void;
  onOpenSaved: () => void;
}

const control = 'min-h-11 w-full rounded-xl border border-[#d9c9b8] bg-white px-3 text-sm text-[#261d13]';
const action = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#8d4100] px-4 text-sm font-bold text-white hover:bg-[#693000]';

export function UniversityView({ filters, onFilter, saved, onToggleSave, onCompare, onOpenSaved }: Props) {
  const { data, failed, retry } = usePathwayData<{ universities: University[] }>('admissions');
  const universities = data?.universities ?? [];
  const { year, query, university, college } = filters;
  const selectedUniversities = universities.filter((item) => !university || item.id === university);
  const colleges = [...new Set(selectedUniversities.flatMap((item) => item.years[year].units.map((unit) => unit.college)))]
    .filter(Boolean).sort((a, b) => a.localeCompare(b, 'ko'));
  const terms = query.trim().split(/\s+/).filter(Boolean).map((term) => subjectKey(term).toLowerCase());
  const matches = selectedUniversities.flatMap((item) => item.years[year].units.flatMap((unit, index) => {
    if (college && unit.college !== college) return [];
    const searchable = subjectKey([item.name, item.short, unit.college, unit.name, unit.parent, unit.search].join(' ')).toLowerCase();
    if (!terms.every((term) => searchable.includes(term))) return [];
    const key = [item.id, unit.college, unit.name, unit.campus ?? ''].join('|');
    return [{ item, unit, key, index }];
  }));
  const showUniversities = !query.trim() && !university && !college;

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <section className="rounded-3xl border border-[#ebd5bc] bg-[#fff7ec] p-4 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-[#261d13]">대학·전공 찾기</h1>
            <p className="mt-2 text-sm leading-relaxed text-[#594734]">
              서울 16개 대학의 학과와 전공을 찾아볼 수 있어요. 대입 정보는 각 대학의 2027·2028학년도 시행계획을 바탕으로 정리했어요.
            </p>
          </div>
          <button type="button" className={action} onClick={onOpenSaved}>
            <Bookmark aria-hidden="true" size={16} /> 저장한 전공 {saved.length}개
          </button>
        </div>
        <details className="mt-3 rounded-xl border border-[#ebd5bc] bg-white">
          <summary className="min-h-11 cursor-pointer px-3 py-3 text-sm font-semibold text-[#793a00]">
            왜 이 16개 대학인가요?
          </summary>
          <div className="space-y-3 px-3 pb-4 text-sm leading-relaxed text-[#594734]">
            <p>앱에 담긴 대학은 교육부가 2019년 대입제도 공정성 강화 방안에서 수능 위주 전형 확대를 권고한 서울 소재 16곳이에요.</p>
            {universities.length > 0 && (
              <ul aria-label="수록 대학" className="grid list-disc grid-cols-2 gap-x-5 gap-y-1 pl-5 sm:grid-cols-4">
                {[...universities].sort((a, b) => a.name.localeCompare(b.name, 'ko')).map((item) => (
                  <li key={item.id} className="break-keep">{item.name}</li>
                ))}
              </ul>
            )}
            <a href="https://www.moe.go.kr/boardCnts/view.do?boardID=294&amp;boardSeq=79119&amp;lev=0&amp;m=020402&amp;s=moe"
              target="_blank" rel="noopener noreferrer" className="inline-block font-semibold text-[#793a00] underline underline-offset-2">
              교육부 발표 원문 보기 ↗
            </a>
          </div>
        </details>
        <label className="mt-5 block text-sm font-bold text-[#261d13]" htmlFor="university-search">대학명 또는 전공명</label>
        <div className="relative mt-1.5">
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-[#705541]" />
          <input id="university-search" type="search" className={`${control} pl-10`} placeholder="예: 서울대, 기계공학, 수학교육"
            value={query} onChange={(event) => onFilter({ ...filters, query: event.target.value })} />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <label className="text-sm font-semibold">대학
            <select className={`${control} mt-1`} value={university} onChange={(e) => onFilter({ ...filters, university: e.target.value, college: '' })}>
              <option value="">전체 대학</option>
              {universities.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold">단과대학
            <select className={`${control} mt-1`} value={college} onChange={(e) => onFilter({ ...filters, college: e.target.value })}>
              <option value="">전체 단과대학</option>
              {colleges.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold">대입 자료 연도
            <select className={`${control} mt-1`} value={year} onChange={(e) => onFilter({ ...filters, year: e.target.value as AdmissionYear, college: '' })}>
              <option value="2028">2028학년도 대입</option>
              <option value="2027">2027학년도 대입</option>
            </select>
          </label>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-[#624a35]">2027학년도 고교 입학생은 보통 2030학년도 대입을 준비해요.</p>
      </section>

      {failed && <p role="alert">대학 자료를 불러오지 못했어요. <button type="button" className="underline" onClick={retry}>다시 불러오기</button></p>}
      {!data && !failed && <p role="status">대학 자료를 불러오고 있어요.</p>}
      {data && (showUniversities ? (
        <section aria-label="대학 고르기" className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
          {universities.map((item) => (
            <button key={item.id} type="button" className="flex min-h-14 items-center justify-between gap-2 rounded-xl border border-[#ebdcc9] bg-white px-3 py-2 text-left text-sm font-bold hover:bg-[#fff3e3]"
              onClick={() => onFilter({ ...filters, university: item.id })}>
              {item.name}<ArrowRight aria-hidden="true" size={15} className="shrink-0" />
            </button>
          ))}
        </section>
      ) : (
        <UniversityResults key={JSON.stringify(filters)} matches={matches} year={year} saved={saved} onToggleSave={onToggleSave} onCompare={onCompare}
          onClear={() => onFilter({ year, query: '', university: '', college: '' })} />
      ))}
    </div>
  );
}

function UniversityResults({ matches, year, saved, onToggleSave, onCompare, onClear }: {
  matches: { item: University; unit: University['years'][AdmissionYear]['units'][number]; key: string; index: number }[];
  year: AdmissionYear;
  saved: SavedMajor[];
  onToggleSave: Props['onToggleSave'];
  onCompare: Props['onCompare'];
  onClear: () => void;
}) {
  const pageSize = 24;
  const [limit, setLimit] = useState(pageSize);
  return (
    <section className="space-y-3" aria-label="전공 검색 결과">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-bold" aria-live="polite">검색 결과 {matches.length.toLocaleString('ko-KR')}개</h2>
        <button type="button" onClick={onClear} className="min-h-11 px-2 text-sm font-semibold underline">검색 조건 지우기</button>
      </div>
      {matches.length === 0 && <p className="rounded-xl bg-white p-4">검색 결과가 없어요. 검색어를 짧게 쓰거나 대학 선택을 바꿔 보세요.</p>}
      <div className="grid gap-3 lg:grid-cols-2">
        {matches.slice(0, limit).map(({ item, unit, key, index }) => {
          const isSaved = saved.some((major) => major.key === key);
          const plan = item.years[year];
          const pdf = `/pathway/sources/${plan.file}`;
          return (
            <article key={`${key}|${index}`} className="min-w-0 rounded-2xl border border-[#ebdcc9] bg-white p-4">
              <p className="text-xs font-medium text-[#705541]">{item.name}{unit.college ? ` · ${unit.college}` : ''}{unit.campus ? ` · ${unit.campus}` : ''}</p>
              <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                <h3 className="min-w-0 break-words text-base font-bold">{unit.name}</h3>
                <button type="button" aria-pressed={isSaved} aria-label={`${item.name} ${unit.name} ${isSaved ? '저장 해제' : '관심 전공 저장'}`}
                  className={`min-h-11 rounded-xl border border-[#dec8ae] px-3 text-sm font-bold ${isSaved ? 'bg-[#f9ead9] text-[#793a00]' : 'bg-white text-[#593318]'}`}
                  onClick={() => onToggleSave({ key, university: item.name, name: unit.name, college: unit.college })}>
                  {isSaved ? '✓ 저장됨' : '관심 전공 저장'}
                </button>
              </div>
              {isSaved && (
                <button type="button" className={`${action} mt-2`} onClick={() => onCompare(key)}
                  aria-label={`${item.name} ${unit.name}, 이 전공으로 고교 비교`}>
                  이 전공으로 고교 비교 <ArrowRight aria-hidden="true" size={16} />
                </button>
              )}
              <details className="mt-2 border-t border-[#efe5d8] pt-1">
                <summary className="cursor-pointer py-2 text-sm font-semibold">{year}학년도 대입 시행계획 보기</summary>
                <div className="space-y-2 pb-2 text-sm text-[#594734]">
                  {unit.parent && <p>연결 모집단위 · {unit.parent}</p>}
                  {typeof unit.quota === 'number' && <p>{unit.basis || '원문에 표시된 인원'} · {unit.quota.toLocaleString('ko-KR')}명</p>}
                  {unit.routes?.length ? (
                    <ul className="space-y-1">
                      {unit.routes.map(([period, name, quota, page], routeIndex) => (
                        <li key={routeIndex}>{period} · {name}{typeof quota === 'number' ? ` · ${quota}명` : ''}
                          {page && <> · <a className="underline" href={`${pdf}#page=${page}`} target="_blank" rel="noreferrer">근거 {page}쪽</a></>}
                        </li>
                      ))}
                    </ul>
                  ) : <p>세부 전형은 시행계획 원문에서 확인해 주세요.</p>}
                  <div className="flex flex-wrap gap-3">
                    <a href={`${pdf}#page=${unit.page ?? 1}`} target="_blank" rel="noreferrer" className="font-semibold underline">시행계획 PDF ↗</a>
                    <a href={plan.source} target="_blank" rel="noreferrer" className="font-semibold underline">공식 게시처 ↗</a>
                  </div>
                </div>
              </details>
            </article>
          );
        })}
      </div>
      {limit < matches.length && <button className={action} type="button" onClick={() => setLimit(limit + pageSize)}>검색 결과 더 보기</button>}
    </section>
  );
}
