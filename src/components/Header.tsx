import React from 'react';
import { ViewType } from '../types';
import { School, Bookmark, BarChart2, BookOpen, ExternalLink, Menu, X } from 'lucide-react';

interface HeaderProps {
  currentView: ViewType;
  onSelectView: (view: ViewType) => void;
  wishlistCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onSelectView,
  wishlistCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems: { view: ViewType; label: string; icon: React.ReactNode; badge?: number }[] = [
    { view: 'schools', label: '학교 찾기', icon: <School className="w-4 h-4" /> },
    { view: 'wishlist', label: '내 지망표', icon: <Bookmark className="w-4 h-4" />, badge: wishlistCount },
    { view: 'demand', label: '정원 알아보기', icon: <BarChart2 className="w-4 h-4" /> },
    { view: 'guide', label: '지원 안내', icon: <BookOpen className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#fffdfa]/95 backdrop-blur-md border-b border-[#ebdcc9] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Brand title */}
          <div
            onClick={() => {
              onSelectView('schools');
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-3.5 cursor-pointer group"
          >
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden shadow-xs border border-[#ed8200]/30 p-0.5 bg-white shrink-0">
              <img
                src="/brand/jinnmath-logo.jpg"
                alt="배움의 온도 진수학 교습소"
                className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg sm:text-xl text-[#2d2217] tracking-tight group-hover:text-[#ed8200] transition-colors leading-tight">
                부천 고등학교 한눈에
              </span>
              <span className="text-[11px] sm:text-xs text-[#8c7457] font-medium leading-none mt-1">
                배움의 온도 진수학 교습소 · 2027학년도
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 bg-[#f6ede1]/60 p-1 rounded-xl border border-[#e6d8c3]">
            {navItems.map((item) => {
              const active = currentView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => onSelectView(item.view)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                    active
                      ? 'bg-white text-[#b85e00] shadow-xs font-bold'
                      : 'text-[#69553f] hover:text-[#2d2217] hover:bg-white/50'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {typeof item.badge === 'number' && (
                    <span
                      className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ml-0.5 transition-colors ${
                        item.badge > 0
                          ? 'bg-[#ed8200] text-white'
                          : 'bg-[#e4d4be] text-[#735d46]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right action button: Guide / Sources */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => onSelectView('guide')}
              className="inline-flex items-center gap-1.5 text-xs text-[#7e674f] hover:text-[#b85e00] font-semibold px-3 py-1.5 rounded-lg hover:bg-[#f5ecdf] border border-transparent hover:border-[#ebdcc9] transition-all"
            >
              <span>공식자료·출처</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </button>
          </div>

          {/* Mobile menu toggle button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="메뉴 열기"
              className="p-2 rounded-lg text-[#69553f] hover:bg-[#f6ede1] focus:outline-none focus:ring-2 focus:ring-[#ed8200]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#ebdcc9] bg-[#fffdfa] px-4 pt-3 pb-5 space-y-1.5 shadow-lg animate-in slide-in-from-top-2 duration-200">
          {navItems.map((item) => {
            const active = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => {
                  onSelectView(item.view);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? 'bg-[#ed8200] text-white font-bold shadow-xs'
                    : 'text-[#69553f] hover:bg-[#f6ede1]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {typeof item.badge === 'number' && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      active
                        ? 'bg-white text-[#ed8200]'
                        : item.badge > 0
                        ? 'bg-[#ed8200] text-white'
                        : 'bg-[#ebdcc9] text-[#735d46]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
          <div className="pt-2 border-t border-[#ebdcc9]/60">
            <button
              onClick={() => {
                onSelectView('guide');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-[#7e674f] hover:bg-[#f6ede1] rounded-lg font-medium"
            >
              <span>공식 전형계획 자료·출처 안내</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
