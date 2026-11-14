import React from 'react';
import { ViewType } from '../types';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import { AcademyIntro } from './AcademyIntro';

interface FooterProps {
  onSelectView: (view: ViewType) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectView }) => {
  return (
    <footer className="bg-[#f5ede1] text-[#4a3b2c] border-t border-[#e2d2be] mt-16 pt-10 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Quota Official Notice Banner */}
        <div className="bg-[#fffbf5] border border-[#ebdcc9] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <ShieldCheck className="w-6 h-6 text-[#ed8200] shrink-0 mt-0.5" />
            <div className="text-sm leading-relaxed text-[#594734]">
              <p className="font-semibold text-[#2c2116] mb-1">
                2027학년도 모집정원 기준 공지 (22개교 총 4,836명)
              </p>
              <p>경기도교육청 신입생 전형계획 24쪽 기준으로 22개교 195학급 총 4,836명입니다. 2026학년도 정원은 2025년 9월 8일 배포된 안내 자료 기준으로 비교했습니다. 원서 접수 전 교육청 최신 공고를 확인해 주세요.</p>
            </div>
          </div>
          <button
            onClick={() => onSelectView('guide')}
            className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-[#fff7ee] text-[#b85e00] font-semibold text-xs rounded-xl border border-[#ebd7be] transition-colors shadow-xs"
          >
            <span>출처와 기준 보기</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <AcademyIntro />

        {/* Legal Disclaimer & Bottom Note */}
        <div className="pt-6 border-t border-[#e8d8c2] text-center text-xs text-[#8c745c] space-y-1.5">
          <p>
            학교 선택을 돕는 참고용 서비스이며 공식 원서는 교육청 및 해당 학교 안내에 따라 접수해 주세요.
          </p>
          <p className="text-[11px] text-[#9e8770]">
            개인정보는 서버로 전송되지 않으며, 모든 지망 순서·메모·통학시간은 브라우저 내부(localStorage)에만 안전하게 보관됩니다.
          </p>
          <p className="text-[11px] text-[#9e8770] font-medium pt-1">
            © 2026-2027 배움의 온도 진수학 교습소. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
