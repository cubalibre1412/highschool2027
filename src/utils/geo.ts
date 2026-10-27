import { School, MiddleSchool } from '../types';

export function shortenSchoolName(name: string): string {
  if (!name) return '';
  return name.replace('등학교', '').replace('여자', '여');
}

export function formatNumber(n: number | null | undefined, maxDigits = 1): string {
  if (n === null || n === undefined || isNaN(n)) return '—';
  return Number(n).toLocaleString('ko-KR', { maximumFractionDigits: maxDigits });
}

export function formatRate(numerator: number, denominator: number): string {
  if (!denominator) return '—';
  return `${((100 * numerator) / denominator).toFixed(1)}%`;
}

export function calculateDistance(school: School, originMiddle?: MiddleSchool | null): number | null {
  if (!originMiddle?.lat || !school.lat) return null;
  const R = 6371; // Earth radius in km
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(school.lat - originMiddle.lat);
  const dLng = toRad(school.lng - originMiddle.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(originMiddle.lat)) * Math.cos(toRad(school.lat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getDistanceText(school: School, originMiddle?: MiddleSchool | null, showDistance = true): string {
  if (!showDistance || !originMiddle) return '거리 기준 미설정';
  const d = calculateDistance(school, originMiddle);
  return d !== null ? `직선 ${d.toFixed(1)}km` : '거리 기준 미설정';
}

export function getKakaoRouteUrl(school: School, originMiddle?: MiddleSchool | null): string {
  if (originMiddle?.lat && originMiddle.lng && school.lat && school.lng) {
    return `https://map.kakao.com/link/by/traffic/${encodeURIComponent(originMiddle.name)},${originMiddle.lat},${originMiddle.lng}/${encodeURIComponent(school.name)},${school.lat},${school.lng}`;
  }
  return `https://map.kakao.com/link/to/${encodeURIComponent(school.name)},${school.lat},${school.lng}`;
}
