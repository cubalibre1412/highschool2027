import React from 'react';
import type { School, UserPrefs } from '../types';
import { shortenSchoolName } from '../utils/geo';
import { relatedSubjects, subjectKey, usePathwayData } from '../utils/pathway';
import type { CurriculumPlan, SavedMajor } from '../utils/pathway';

type Plans = { schools: Record<number, CurriculumPlan> };

const primary = 'inline-flex min-h-11 items-center justify-center rounded-xl bg-[#8d4100] px-4 text-sm font-bold text-white hover:bg-[#693000]';
const secondary = 'inline-flex min-h-11 items-center justify-center rounded-xl border border-[#d9c9b8] bg-white px-3 text-sm font-semibold hover:bg-[#fff3e3]';

function planStatus(plan: CurriculumPlan | undefined) {
  if (!plan?.courses.length) return '자료 미확인';
  if (plan.partial) return '일부 과목 확인';
  if (plan.draft) return '편제표 초안';
  return '편제표 확인';
}

function PlanLinks({ plan, page }: { plan: CurriculumPlan; page?: number }) {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-[#793a00]">
      <a href={plan.source} target="_blank" rel="noreferrer" className="underline underline-offset-2">
        {plan.courses.length ? '학교 게시물 ↗' : '학교 공지 확인 ↗'}
      </a>
      {plan.file && <a href={page && /\.pdf$/i.test(plan.file) ? `${plan.file}#page=${page}` : plan.file} target="_blank" rel="noreferrer" className="underline underline-offset-2">
        {page && /\.pdf$/i.test(plan.file) ? `편제표 ${page}쪽 ↗` : '편제표 원문 ↗'}
      </a>}
    </div>
  );
}

export function SchoolPlan2027({ school }: { school: School }) {
  const { data, failed, retry } = usePathwayData<Plans>('curriculum');
  const plan = data?.schools[school.id];
  return (
    <section className="rounded-2xl border border-[#ebdcc9] bg-[#fff7ec] p-4">
      <h3 className="text-base font-bold">2027학년도 입학생 편제표</h3>
      {!data && !failed && <p className="mt-2 text-sm" role="status">자료를 불러오고 있어요.</p>}
      {failed && <p className="mt-2 text-sm" role="alert">자료를 불러오지 못했어요. <button type="button" className="underline" onClick={retry}>다시 시도</button></p>}
      {data && (
        <div className="mt-2 space-y-2 text-sm">
          <p className="font-semibold">{planStatus(plan)}</p>
          <p>{plan?.courses.length ? '개설 여부와 수강 조건은 학교의 최신 안내에서 확인해 주세요.' : '이 앱에서 확인한 편제표가 없어요. 학교 안내를 확인해 보세요.'}</p>
          {plan && <PlanLinks plan={plan} />}
        </div>
      )}
    </section>
  );
}

interface PlannerProps {
  schools: School[];
  prefs: UserPrefs;
  saved: SavedMajor[];
  activeMajor: SavedMajor | undefined;
  subjects: string[];
  currentSubject: string;
  onFocusSubject: (subject: string) => void;
  onSelectMajor: (key: string) => void;
  onSelectSubjects: (subjects: string[]) => void;
  onSelectSchools: () => void;
  onExploreMajors: () => void;
  onAddSchool: (id: number) => void;
  onSaveNote: (id: number, note: string) => void;
  onOpenWishlist: () => void;
}

export function CoursePlanner({ schools, prefs, saved, activeMajor, subjects, currentSubject, onFocusSubject, onSelectMajor, onSelectSubjects, onSelectSchools, onExploreMajors, onAddSchool, onSaveNote, onOpenWishlist }: PlannerProps) {
  const { data, failed, retry } = usePathwayData<Plans>('curriculum');
  const [query, setQuery] = React.useState('');
  const candidates = prefs.compare.flatMap((id) => schools.filter((school) => school.id === id));
  const allSubjects = [...new Map(Object.values(data?.schools ?? {}).flatMap((plan) =>
    plan.courses.map((course) => [subjectKey(course.name), course.name] as const))).values()]
    .sort((a, b) => a.localeCompare(b, 'ko'));
  const suggested = relatedSubjects(activeMajor, allSubjects);
  const choices = subjects.length > 0 ? subjects : suggested;
  const active = choices.includes(currentSubject) ? currentSubject : choices[0];
  const quickChoices = choices.slice(0, 6);
  if (active && !quickChoices.includes(active)) quickChoices.push(active);
  const matches = allSubjects.filter((name) => subjectKey(name).includes(subjectKey(query.trim()))).slice(0, 12);
  const addSubject = (name: string) => {
    onSelectSubjects([...new Set([...subjects, name])]);
    onFocusSubject(name);
    setQuery('');
  };

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <section className="rounded-3xl border border-[#ebd5bc] bg-[#fff7ec] p-4 sm:p-7">
        <h1 className="text-2xl font-black">2027학년도 입학생 과목 비교</h1>
        <p className="mt-2 text-sm leading-relaxed text-[#594734]">과목을 하나 고르면 학교마다 언제, 어떻게 듣는지 볼 수 있어요.</p>
        <div className="mt-4 flex flex-wrap items-end gap-2">
          <label className="min-w-0 flex-1 text-sm font-semibold sm:flex-none">
            관심 전공
            <select className="mt-1 block min-h-11 w-full max-w-sm rounded-xl border border-[#d9c9b8] bg-white px-3"
              value={activeMajor?.key ?? ''} onChange={(event) => onSelectMajor(event.target.value)}>
              <option value="">전공 없이 과목 고르기</option>
              {saved.map((major) => <option key={major.key} value={major.key}>{major.name} · {major.university}</option>)}
            </select>
          </label>
          <button type="button" className={secondary} onClick={onExploreMajors}>다른 전공 찾아보기</button>
          <button type="button" className={secondary} onClick={onSelectSchools}>비교할 학교 고르기</button>
        </div>
        <p className="mt-3 text-sm font-semibold">{candidates.length ? `비교 학교 · ${candidates.map((school) => shortenSchoolName(school.name)).join(', ')}` : '비교할 학교를 골라 주세요.'}</p>
        {candidates.length === 1 && <p className="mt-1 text-sm">한 학교를 더 고르면 나란히 비교할 수 있어요.</p>}
      </section>

      {failed && <p role="alert">편제표를 불러오지 못했어요. <button type="button" className="underline" onClick={retry}>다시 시도</button></p>}
      {!data && !failed && <p role="status">편제표를 불러오고 있어요.</p>}
      {data && candidates.length >= 2 && (
        <>
          <section className="space-y-3 rounded-2xl border border-[#ebdcc9] bg-white p-4">
            <h2 className="text-base font-bold">비교할 과목 고르기</h2>
            {activeMajor && !suggested.length && <p className="text-sm">이 전공에 연결된 과목 안내가 아직 없어요. 궁금한 과목을 직접 골라 보세요.</p>}
            {activeMajor && suggested.length > 0 && <p className="text-sm text-[#594734]">관련 과목은 진로 탐색에 참고하세요. 대학별 필수 과목은 해당 학년도 전형 안내에서 확인해 주세요.</p>}
            <label className="block text-sm font-semibold">
              <span className="sr-only">과목 이름 검색</span>
              <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="과목 검색 (예: 기하)"
                className="min-h-11 w-full rounded-xl border border-[#d9c9b8] px-3" />
            </label>
            {query.trim() && (
              <div className="flex flex-wrap gap-2">
                {matches.length ? matches.map((name) => <button key={name} type="button" className={secondary} onClick={() => addSubject(name)}>{name} 추가</button>) :
                  <p className="text-sm">확보한 편제 자료에서 이 이름을 찾지 못했어요. 과목 이름을 짧게 써 보세요.</p>}
              </div>
            )}
            {suggested.length > 0 && subjects.length > 0 && (
              <button type="button" className={secondary} onClick={() => onSelectSubjects([])}>관련 과목으로 돌아가기</button>
            )}
            {choices.length > 0 && (
              <div className="flex flex-wrap gap-2" role="group" aria-label="비교할 과목">
                {quickChoices.map((name) => <button type="button" key={name} onClick={() => onFocusSubject(name)}
                  aria-pressed={active === name} className={active === name ? primary : secondary}>{name}</button>)}
              </div>
            )}
            {choices.length > 6 && (
              <label className="block text-sm font-semibold">다른 관련 과목
                <select className="mt-1 block min-h-11 w-full max-w-sm rounded-xl border border-[#d9c9b8] bg-white px-3"
                  value={active} onChange={(event) => onFocusSubject(event.target.value)}>
                  {choices.map((name) => <option key={name}>{name}</option>)}
                </select>
              </label>
            )}
            {active && subjects.includes(active) && (
              <button type="button" className="min-h-11 text-sm underline" onClick={() => onSelectSubjects(subjects.filter((name) => name !== active))}>
                {active} 비교 목록에서 빼기
              </button>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold">{active ? `${active}, 학교마다 어떻게 배우나요?` : '학교별 편제표 확인 현황'}</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {candidates.map((school) => {
                const plan = data.schools[school.id];
                const course = active && plan?.courses.find((item) => subjectKey(item.name) === subjectKey(active));
                const past = active ? [...new Set(school.achievement.filter((item) =>
                  subjectKey(item.subject.replace(/\s*\([\d.]+\)$/, '')) === subjectKey(active)).map((item) => item.grade))].sort() : [];
                return (
                  <article key={school.id} className="min-w-0 space-y-3 rounded-2xl border border-[#ebdcc9] bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-base font-bold">{school.name}</h3>
                      <span className="rounded-full bg-[#f6ecdf] px-2.5 py-1 text-xs font-semibold">{planStatus(plan)}</span>
                    </div>
                    {course ? (
                      <ul className="space-y-2 text-sm">
                        {course.slots.map((slot, index) => {
                          const isGroup = /^선택 묶음 \d+|^[^·]+ 묶음 ·/.test(slot.group ?? '');
                          const groupCourses = isGroup ? plan.courses.filter((item) => item.slots.some((other) =>
                            other.group === slot.group && other.grade === slot.grade && other.semester === slot.semester && other.page === slot.page)) : [];
                          return <li key={index} className="rounded-xl bg-[#faf4eb] p-3">
                            <strong>{slot.grade && slot.semester ? `${slot.grade}학년 ${slot.semester}학기` : '편성 학기 확인 필요'}</strong>
                            <p className="mt-1">{slot.group || '선택 묶음은 학교 자료에서 확인'}</p>
                            {slot.group && /택\s*\d/.test(slot.group) && (
                              <p className="mt-1 text-[#594734]">
                                ‘택’ 뒤 숫자는 이 묶음에서 고르는 과목 수예요.
                              </p>
                            )}
                            {groupCourses.length > 1 && (
                              <details className="mt-2">
                                <summary className="cursor-pointer py-1 font-semibold">같은 묶음의 다른 과목 보기</summary>
                                <p className="mt-1 leading-relaxed">{groupCourses.filter((item) => item !== course).map((item) => item.name).join(' · ')}</p>
                              </details>
                            )}
                          </li>;
                        })}
                      </ul>
                    ) : active && <p className="text-sm">{plan?.courses.length ? '확보한 자료에서 이 과목을 확인하지 못했어요.' : '2027학년도 편성 여부를 학교에 확인해 주세요.'}</p>}
                    {plan && <PlanLinks plan={plan} page={course ? course.slots[0]?.page : undefined} />}
                    {active && <details className="border-t border-[#efe5d8] pt-2 text-sm">
                      <summary className="cursor-pointer py-1 font-semibold">2026학년도 실제 수강 기록 보기</summary>
                      <p className="mt-1 pb-2">{past.length ? `2026학년도 1학기 ${past.map((grade) => `${grade}학년`).join(', ')} 수강 공시에서 확인했어요.` : '2026학년도 1학기 공시에서 같은 이름의 과목을 확인하지 못했어요.'}</p>
                    </details>}
                    {prefs.wishlist.includes(school.id) ? (
                      <label className="block text-sm font-semibold">
                        지망표에 남길 메모
                        <textarea className="mt-1 block min-h-20 w-full rounded-xl border border-[#d9c9b8] px-3 py-2 font-normal"
                          value={prefs.notes[school.id] ?? ''} placeholder="예: 기하와 미적분Ⅱ를 함께 들을 수 있는지 물어보기"
                          onChange={(event) => onSaveNote(school.id, event.target.value)} />
                      </label>
                    ) : <button type="button" className={secondary} onClick={() => onAddSchool(school.id)}>{shortenSchoolName(school.name)} 지망표에 담기</button>}
                  </article>
                );
              })}
            </div>
            {candidates.some((school) => prefs.wishlist.includes(school.id)) && <button type="button" className={primary} onClick={onOpenWishlist}>내 지망표에서 순서 정하기</button>}
          </section>
        </>
      )}
    </div>
  );
}
