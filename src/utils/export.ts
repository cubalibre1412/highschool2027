import { School, MiddleSchool, UserPrefs } from '../types';
import { shortenSchoolName, calculateDistance } from './geo';

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const paragraphs = String(text || '').replace(/\r/g, '').split('\n');
  const lines: string[] = [];
  for (const para of paragraphs) {
    let line = '';
    for (const ch of para) {
      if (ctx.measureText(line + ch).width > maxWidth && line) {
        lines.push(line);
        line = '';
      }
      line += ch;
    }
    lines.push(line);
  }
  return lines;
}

export async function generateWishlistImages(
  schools: School[],
  prefs: UserPrefs,
  originMiddle?: MiddleSchool | null
): Promise<Blob[]> {
  await document.fonts.ready;
  const W = 1100;
  const H = 1500;
  const M = 75;
  const canvases: HTMLCanvasElement[] = [];

  let c!: HTMLCanvasElement;
  let ctx!: CanvasRenderingContext2D;
  let y = 0;
  let page = 0;

  const font = (size = 20, bold = false) => {
    ctx.font = `${bold ? '700' : '400'} ${size}px "Pretendard Variable", Pretendard, "Malgun Gothic", sans-serif`;
  };

  const newPage = () => {
    c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    ctx = c.getContext('2d')!;

    // Background
    ctx.fillStyle = '#fffdf9';
    ctx.fillRect(0, 0, W, H);

    // Top decorative bar
    ctx.fillStyle = '#ed8200';
    ctx.fillRect(0, 0, W, 8);

    // Header brand
    ctx.fillStyle = '#785b3b';
    font(16, true);
    ctx.fillText('배움의 온도 진수학 교습소 · 부천 고등학교 한눈에 2027', M, 60);

    // Title
    font(36, true);
    ctx.fillStyle = '#2c2217';
    ctx.fillText(page ? '나의 2027 고교 지망표 (계속)' : '나의 2027 고교 지망표', M, 115);

    // Subtitle
    font(18);
    ctx.fillStyle = '#8a7761';
    const subText = `${prefs.gender === 'male' ? '남학생' : '여학생'} · 총 ${schools.length}개교 지망${originMiddle ? ` · ${originMiddle.name} 기준` : ''}`;
    ctx.fillText(subText, M, 155);

    // Separator
    ctx.strokeStyle = '#e6dac6';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(M, 180);
    ctx.lineTo(W - M, 180);
    ctx.stroke();

    // Footer notice
    ctx.fillStyle = '#9c8b77';
    font(14);
    ctx.fillText('※ 본 지망표는 가족과 검토를 위한 자율 참고용 자료이며 교육청 공식 입학원서가 아닙니다.', M, H - 65);
    ctx.fillText(`작성일자: ${new Date().toLocaleDateString('ko-KR')} · 쪽 ${++page}`, M, H - 40);

    canvases.push(c);
    y = 225;
  };

  newPage();

  for (let i = 0; i < schools.length; i++) {
    const s = schools[i];
    if (y + 110 > H - 120) newPage();

    // Rank Badge
    ctx.fillStyle = '#ed8200';
    font(24, true);
    const rankLabel = `${i + 1}지망`;
    ctx.fillText(rankLabel, M, y);

    // School Name
    ctx.fillStyle = '#221910';
    font(26, true);
    ctx.fillText(s.name, M + 95, y);
    y += 32;

    // School Info Meta
    font(16);
    ctx.fillStyle = '#7a6852';
    const dist = originMiddle ? calculateDistance(s, originMiddle) : null;
    const metaParts = [
      s.girls ? '여학교' : '남녀공학',
      s.ownership,
      s.name === '수주고등학교' ? '자율형 공립고' : '',
      dist !== null ? `직선 ${dist.toFixed(1)}km` : '',
      prefs.times[s.id] ? `직접 확인한 통학 ${prefs.times[s.id]}분` : '',
      `2027 정원 ${s.quota}명`,
    ].filter(Boolean);
    ctx.fillText(metaParts.join('  ·  '), M + 95, y);
    y += 28;

    // Note / Reason
    const note = prefs.notes[s.id];
    if (note && note.trim()) {
      font(17);
      const noteLines = wrapText(ctx, `메모: ${note.trim()}`, W - 2 * M - 95);
      ctx.fillStyle = '#423527';
      for (const line of noteLines) {
        if (y + 28 > H - 120) {
          newPage();
          font(18, true);
          ctx.fillStyle = '#221910';
          ctx.fillText(`${i + 1}지망 ${shortenSchoolName(s.name)} (메모 계속)`, M, y);
          y += 32;
          font(17);
          ctx.fillStyle = '#423527';
        }
        ctx.fillText(line, M + 95, y);
        y += 26;
      }
    }

    y += 18;
    // Row Divider
    ctx.strokeStyle = '#f0e6d6';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(M, y);
    ctx.lineTo(W - M, y);
    ctx.stroke();
    y += 36;
  }

  const blobs: Blob[] = [];
  for (const canvas of canvases) {
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.95)
    );
    if (!blob) throw new Error('Unable to render a wishlist page');
    blobs.push(blob);
  }
  return blobs;
}

/** Assemble the same Korean-rendered pages as one downloadable A4 PDF. */
export async function generateWishlistPDF(
  schools: School[],
  prefs: UserPrefs,
  originMiddle?: MiddleSchool | null
): Promise<Blob> {
  const pages = await generateWishlistImages(schools, prefs, originMiddle);
  if (!pages.length) throw new Error('The wishlist is empty');
  const encoder = new TextEncoder();
  const chunks: ArrayBuffer[] = [];
  const offsets: number[] = [0];
  let length = 0;
  const append = (data: Uint8Array) => {
    const copy = new Uint8Array(data.length);
    copy.set(data);
    chunks.push(copy.buffer);
    length += copy.length;
  };
  const text = (value: string) => append(encoder.encode(value));
  const object = (id: number, header: string, stream?: Uint8Array) => {
    offsets[id] = length;
    text(`${id} 0 obj\n${header}`);
    if (stream) {
      text('\nstream\n');
      append(stream);
      text('\nendstream');
    }
    text('\nendobj\n');
  };
  text('%PDF-1.4\n%Wishlist\n');
  object(1, '<< /Type /Catalog /Pages 2 0 R >>');
  object(2, `<< /Type /Pages /Count ${pages.length} /Kids [${pages.map((_, i) => `${3 + i * 3} 0 R`).join(' ')}] >>`);
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const scale = Math.min(pageWidth / 1100, pageHeight / 1500);
  const imageWidth = 1100 * scale;
  const imageHeight = 1500 * scale;
  const x = (pageWidth - imageWidth) / 2;
  const y = (pageHeight - imageHeight) / 2;
  for (const [i, page] of pages.entries()) {
    const id = 3 + i * 3;
    const jpeg = new Uint8Array(await page.arrayBuffer());
    object(id, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /XObject << /Im0 ${id + 1} 0 R >> >> /Contents ${id + 2} 0 R >>`);
    object(id + 1, `<< /Type /XObject /Subtype /Image /Width 1100 /Height 1500 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>`, jpeg);
    const commands = encoder.encode(`q\n${imageWidth.toFixed(2)} 0 0 ${imageHeight.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} cm\n/Im0 Do\nQ`);
    object(id + 2, `<< /Length ${commands.length} >>`, commands);
  }
  const startXref = length;
  text(`xref\n0 ${offsets.length}\n0000000000 65535 f \n`);
  offsets.slice(1).forEach(offset => text(`${String(offset).padStart(10, '0')} 00000 n \n`));
  text(`trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF`);
  return new Blob(chunks, { type: 'application/pdf' });
}

export function saveDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export function downloadWishlistCSV(
  schools: School[],
  prefs: UserPrefs,
  originMiddle?: MiddleSchool | null
) {
  const rows = [
    ['2027학년도 부천 일반고 지망표 (참고용 검토 자료)', '배움의 온도 진수학 교습소'],
    ['학생 성별', prefs.gender === 'male' ? '남학생' : '여학생'],
    ['출발 기준 중학교', originMiddle ? originMiddle.name : '미설정'],
    ['생성일시', new Date().toLocaleString('ko-KR')],
    [],
    ['지망순위', '고등학교명', '학교유형', '설립구분', '직선거리(km)', '직접 확인한 통학시간(분)', '2027 모집정원(명)', '2026 모집정원(명)', '지망 이유 및 메모'],
  ];

  schools.forEach((s, idx) => {
    const d = originMiddle ? calculateDistance(s, originMiddle) : null;
    rows.push([
      `${idx + 1}지망`,
      s.name,
      s.girls ? '여학교' : '남녀공학',
      s.ownership,
      d !== null ? d.toFixed(2) : '',
      prefs.times[s.id] ? String(prefs.times[s.id]) : '',
      String(s.quota),
      String(s.quota2026),
      prefs.notes[s.id] || '',
    ]);
  });

  const escapeCell = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csvContent = '\ufeff' + rows.map((row) => row.map(escapeCell).join(',')).join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `2027_부천_고등학교_지망표_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadJSONBackup(prefs: UserPrefs) {
  const payload = {
    version: 1,
    exportDate: new Date().toISOString(),
    appName: '부천 고등학교 한눈에 2027',
    ...prefs,
  };
  const str = JSON.stringify(payload, null, 2);
  const blob = new Blob([str], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `부천고등학교_지망표_백업_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
