import { UserPrefs } from './types';

export const STORAGE_KEY = 'bucheon-compass-v1';

export const DEFAULTS: UserPrefs = {
  gender: 'female',
  origin: '',
  distance: true,
  interests: ['curriculum', 'commute'],
  fields: [],
  wishlist: [],
  notes: {},
  times: {},
  compare: [],
  schoolSort: 'name',
};

export interface InterestFieldDef {
  id: string;
  label: string;
  pattern: RegExp;
  examples: string[];
}

export const INTEREST_FIELDS: InterestFieldDef[] = [
  {
    id: 'humanities',
    label: '언어·인문',
    pattern: /국어|독서|문학|화법|언어|작문|영어|영미|일본|중국|독일|프랑스|스페인|한문|역사|세계사|동아시아|철학/,
    examples: ['국어국문학과', '영어영문학과', '사학과'],
  },
  {
    id: 'society',
    label: '사회·경영',
    pattern: /사회|지리|정치|법과 사회|법학|경제|윤리|심리|창업|확률|통계/,
    examples: ['경영학과', '경제학과', '사회학과'],
  },
  {
    id: 'science',
    label: '수학·기초과학',
    pattern: /수학|대수|미적분|기하|확률|통계|물리|화학|생명|지구|과학/,
    examples: ['수학과', '물리학과', '생명과학과'],
  },
  {
    id: 'engineering',
    label: '공학·컴퓨터',
    pattern: /수학|대수|미적분|기하|확률|통계|물리|화학|정보|인공지능|기술|공학|프로그래밍/,
    examples: ['기계공학과', '전자공학과', '컴퓨터공학과'],
  },
  {
    id: 'health',
    label: '보건·의료',
    pattern: /생명|화학|보건|확률|통계|심리|운동/,
    examples: ['간호학과', '물리치료학과', '의학과'],
  },
  {
    id: 'arts',
    label: '예술·디자인',
    pattern: /미술|음악|예술|디자인|매체|영상|문학/,
    examples: ['시각디자인학과', '음악학과', '영상학과'],
  },
  {
    id: 'sports',
    label: '체육·스포츠',
    pattern: /체육|스포츠|운동|보건|생명/,
    examples: ['체육학과', '스포츠과학과', '체육교육과'],
  },
];

export const INTEREST_SHORTCUTS = [
  { id: 'commute', label: '통학' },
  { id: 'curriculum', label: '선택과목' },
  { id: 'assessment', label: '평가 방식' },
  { id: 'achievement', label: '성취도' },
  { id: 'graduates', label: '졸업 후 진학' },
];

export const TIMELINE_EVENTS = [
  {
    date: '2026. 12. 4. (금) ~ 12. 10. (목)',
    title: '원서 접수',
    desc: '매일 09:00~17:00 (마감 12월 10일 17:00). 부천 중학교 재학생은 학교에서 작성 및 온라인 전송.',
    highlight: true,
  },
  {
    date: '2027. 1. 6. (수)',
    title: '배정 대상자 발표',
    desc: '중학교 내신성적 200점 기준으로 부천 학군 일반고 입학 대상자 선발 발표.',
    highlight: false,
  },
  {
    date: '2027. 1. 22. (금)',
    title: '배정 학교 발표',
    desc: '학생별 최종 지망 순위 및 추첨 배정 결과 발표 (SATP 및 학생 휴대전화 문자 안내).',
    highlight: true,
  },
  {
    date: '2027. 1. 25. (월) 오전 10시',
    title: '등록 안내 예비소집',
    desc: '배정받은 고등학교에서 실시. 학교에 따라 방식이 다를 수 있으니 공지 확인 필요.',
    highlight: false,
  },
  {
    date: '2027. 1. 25. (월) ~ 1. 27. (수)',
    title: '배정 학교 등록',
    desc: '기한 내에 배정된 학교에 등록 절차를 완료해야 합니다.',
    highlight: true,
  },
  {
    date: '2027. 2. 4. (목)',
    title: '차순위자 추가배정 발표',
    desc: '미등록 결원에 따른 추가배정자 발표 (등록 2. 4. ~ 2. 5.).',
    highlight: false,
  },
];
