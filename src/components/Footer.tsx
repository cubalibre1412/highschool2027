import React from 'react';
import { ViewType } from '../types';
import { Phone, MapPin, ExternalLink, ShieldCheck, HelpCircle } from 'lucide-react';

interface FooterProps {
  onSelectView: (view: ViewType) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectView }) => {
  return (
    <footer className="bg-[#f5ede1] text-[#4a3b2c] border-t border-[#e2d2be] mt-16 pt-12 pb-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
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

        {/* Brand JinnMath Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4 border-t border-[#e8d8c2]">
          {/* Brand Intro & Logo */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-4">
              <img
                src="/brand/jinnmath-logo.jpg"
                alt="배움의 온도 진수학 교습소"
                className="w-16 h-16 rounded-2xl shadow-sm border border-[#ebd7be] object-cover bg-white p-0.5"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              <div>
                <h3 className="font-extrabold text-lg text-[#2a2016]">
                  배움의 온도 진수학 교습소
                </h3>
                <p className="text-xs text-[#7e6952] mt-0.5">
                  학생과 학부모가 함께 고민하는 고등학교 선택을 돕습니다.
                </p>
              </div>
            </div>
            <p className="text-xs text-[#6e5842] leading-relaxed">공개된 학교알리미 및 교육청 전형계획 자료를 토대로 만든 무료 안내 도구입니다. 부천 지역 중3 수험생과 학부모님의 진학 탐색을 돕습니다.</p>
            <div className="pt-1">
              <a
                href="https://blog.naver.com/jinnmath"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#2a2016] hover:bg-[#1a140d] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
              >
                <span>배움의 온도 진수학 블로그 방문하기</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Brand Location & Contact with Banner */}
          <div className="lg:col-span-7 bg-[#fffbf5] rounded-2xl p-5 border border-[#ebdcc9] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#f0e2d0]">
              <span className="text-xs font-bold text-[#b85e00] tracking-wider uppercase">
                교습소 안내 & 문의
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="tel:01081453605"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#ed8200] hover:text-[#c46900]"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>문의 010-8145-3605</span>
                </a>
              </div>
            </div>

            {/* Banner Image */}
            <div className="rounded-xl overflow-hidden border border-[#ebd7be] bg-white shadow-xs">
              <img
                src="/brand/jinnmath-banner.jpg"
                alt="배움의 온도 진수학 교습소. 범박힐스테이트 3단지 상가 3층. 전화 010-8145-3605. 카카오톡 채널 배움의온도진수학교습소."
                className="w-full h-auto object-cover max-h-36"
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-[#705a45] pt-1">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#ed8200] shrink-0" />
                <span>경기도 부천시 범박힐스테이트 3단지 상가 3층</span>
              </div>
              <span className="text-[11px] text-[#917b65]">
                카카오톡 채널: 배움의온도진수학교습소
              </span>
            </div>
          </div>
        </div>

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
