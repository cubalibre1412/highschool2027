export interface AchievementRecord {
  school: string;
  disclosure: string;
  academic_year: number;
  grade: number;
  semester: number;
  department: string;
  subject: string;
  source: string;
  mean: number;
  A: number | null;
  B: number | null;
  C: number | null;
  D: number | null;
  E: number | null;
}

export interface GraduateRecord {
  gender: string;
  graduates: number;
  junior_college: number;
  university: number;
  foreign_total: number;
  further_total: number;
  employed: number;
  other: number;
}

export interface SchoolDocument {
  id: number;
  category: string;
  title: string;
  period: string;
  status: string;
  url: string;
  textUrl?: string;
  ocrPages?: boolean;
}

export interface AssessmentSubject {
  subject: string;
  paper: number;
  performance: number;
  essay: number;
}

export interface AssessmentSummary {
  korean?: AssessmentSubject;
  math?: AssessmentSubject;
  english?: AssessmentSubject;
}

export interface AdmissionRecord {
  school: string;
  year: number;
  total: number;
  male: number;
  female: number;
}

export interface AthleteInfo {
  sport: string;
  planned: number;
}

export interface School {
  id: number;
  name: string;
  lat: number;
  lng: number;
  address: string;
  phone: string;
  ownership: string;
  homepage: string;
  source: string;
  girls: boolean;
  quota: number;
  quota2026: number;
  classes2027?: number;
  quotaSource?: string;
  athletes2027?: AthleteInfo | null;
  scanFiles?: boolean;
  achievement: AchievementRecord[];
  graduates: GraduateRecord[];
  documents: SchoolDocument[];
  assessmentSummary?: AssessmentSummary;
  admissions: AdmissionRecord[];
}

export interface MiddleSchool {
  name: string;
  lat: number;
  lng: number;
  address: string;
  phone: string;
  ownership: string;
  homepage: string;
  source: string;
  applicationSubmission?: {
    date: string;
    period: string;
    sourcePage: number;
    meaning: string;
  };
}

export interface PopulationGroup {
  male: number;
  female: number;
  total: number;
}

export interface AdmissionPlan {
  title: string;
  edition: string;
  file: string;
  sha256: string;
  quotaPage: number;
  totalQuota: number;
  classes: number;
  athletesPlanned: number;
  contact: {
    office: string;
    phone1: string;
    phone2: string;
    portal: string;
  };
  pages: Record<string, number>;
}

export interface AppData {
  asOf: string;
  schools: School[];
  middles: MiddleSchool[];
  population: {
    '2025': PopulationGroup;
    '2026': PopulationGroup;
  };
  admissions: AdmissionRecord[];
  admissionPlan?: AdmissionPlan;
}

export type GenderType = 'female' | 'male';
export type ViewType = 'schools' | 'wishlist' | 'demand' | 'guide';
export type SchoolSortType = 'name' | 'distance' | 'change';
export type DetailTabType = 'overview' | 'curriculum' | 'assessment' | 'achievement' | 'graduates';

export interface UserPrefs {
  gender: GenderType;
  origin: string;
  distance: boolean;
  interests: string[];
  fields: string[];
  wishlist: number[];
  notes: Record<number, string>;
  times: Record<number, number>;
  compare: number[];
  schoolSort: SchoolSortType;
}
