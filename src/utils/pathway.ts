import React from 'react';
import majorSubjects from './majorSubjects';

export type AdmissionYear = '2027' | '2028';

export interface AdmissionUnit {
  name: string;
  college: string;
  page?: number;
  quota?: number | null;
  basis?: string;
  parent?: string;
  campus?: string;
  search?: string;
  routes?: [string, string, number | null, number?][];
}

export interface AdmissionPlan {
  file: string;
  source: string;
  units: AdmissionUnit[];
}

export interface University {
  id: string;
  name: string;
  short?: string;
  years: Record<AdmissionYear, AdmissionPlan>;
}

export interface SavedMajor {
  key: string;
  university: string;
  name: string;
  college: string;
}

export interface CourseSlot {
  grade?: number;
  semester?: number;
  group?: string;
  page?: number;
}

export interface CurriculumPlan {
  name: string;
  source: string;
  file?: string;
  draft?: boolean;
  partial?: boolean;
  courses: { name: string; slots: CourseSlot[] }[];
}

export const subjectKey = (name: string) => name.normalize('NFKC').replace(/\s+/g, '');

const majorPatterns = new Map(Object.entries(majorSubjects).map(([name, pattern]) => [subjectKey(name), pattern]));

export const relatedSubjects = (major: SavedMajor | undefined, subjects: string[]) => {
  const pattern = major && majorPatterns.get(subjectKey(major.name));
  return pattern ? subjects.filter((name) => pattern.test(name)) : [];
};

export function usePathwayData<T>(name: 'admissions' | 'curriculum') {
  const [data, setData] = React.useState<T | null>(null);
  const [failed, setFailed] = React.useState(false);
  const [attempt, setAttempt] = React.useState(0);
  React.useEffect(() => {
    const controller = new AbortController();
    fetch(`/pathway/${name}.json`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Pathway data unavailable');
        return response.json();
      })
      .then((result: T) => {
        if (!controller.signal.aborted) setData(result);
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true);
      });
    return () => controller.abort();
  }, [name, attempt]);
  return {
    data, failed, retry: () => {
      setFailed(false);
      setAttempt((value) => value + 1);
    },
  };
}
