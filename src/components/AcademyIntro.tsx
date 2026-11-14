import { ExternalLink, MapPin, Phone } from 'lucide-react';

export function AcademyIntro() {
  return (
    <section className="space-y-3 rounded-2xl border border-[#ebd5bc] bg-[#fff7ec] p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <img src="/brand/jinnmath-logo.jpg" alt="" width="48" height="48"
          className="size-12 shrink-0 rounded-xl border border-[#ebd7be] bg-white object-cover" />
        <div className="min-w-0">
          <h2 className="break-keep text-base font-bold text-[#261d13]">배움의 온도 진수학 교습소</h2>
          <p className="mt-1 break-keep text-sm text-[#594734]">중3·고등 내신과 수능 수학 맞춤 지도</p>
        </div>
      </div>
      <div className="space-y-1.5 text-sm text-[#594734]">
        <p className="flex items-start gap-2">
          <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#8d4100]" />
          <span className="break-keep">부천시 범박힐스테이트 3단지 상가 3층</span>
        </p>
        <p className="break-keep pl-6">
          카카오톡 채널 ·{' '}
          <a href="https://pf.kakao.com/_KjTYn" target="_blank" rel="noopener noreferrer"
            className="font-semibold text-[#793a00] underline underline-offset-2 hover:text-[#542700]">
            배움의온도진수학교습소 <ExternalLink aria-hidden="true" className="inline size-3 align-baseline" />
          </a>
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <a href="tel:01081453605" className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-[#dec8ae] bg-white px-3 text-sm font-semibold text-[#793a00] hover:bg-[#fff1df]">
          <Phone aria-hidden="true" size={15} /> 010-8145-3605
        </a>
        <a href="https://blog.naver.com/jinnmath" target="_blank" rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-[#8d4100] px-3 text-sm font-semibold text-white hover:bg-[#693000]">
          교습소 블로그 <ExternalLink aria-hidden="true" size={15} />
        </a>
      </div>
    </section>
  );
}
