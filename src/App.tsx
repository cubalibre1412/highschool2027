import React from 'react';
import { AppData, School, MiddleSchool, UserPrefs, ViewType, DetailTabType } from './types';
import { STORAGE_KEY, DEFAULTS } from './constants';
import { shortenSchoolName } from './utils/geo';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SchoolsView } from './components/SchoolsView';
import { WishlistView } from './components/WishlistView';
import { DemandView } from './components/DemandView';
import { GuideView } from './components/GuideView';
import { CompareFloatingBar } from './components/CompareFloatingBar';
import { CompareModal } from './components/CompareModal';
import { SchoolDetailModal } from './components/SchoolDetailModal';

export default function App() {
  const [appData, setAppData] = React.useState<AppData | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  // Current view tab
  const [currentView, setCurrentView] = React.useState<ViewType>('schools');

  // User preferences
  const [prefs, setPrefs] = React.useState<UserPrefs>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULTS, ...parsed };
      }
    } catch {
      // fallback
    }
    return DEFAULTS;
  });

  // Modal states
  const [detailSchoolId, setDetailSchoolId] = React.useState<number | null>(null);
  const [detailTab, setDetailTab] = React.useState<DetailTabType>('overview');
  const [isCompareOpen, setIsCompareOpen] = React.useState<boolean>(false);

  // Toast feedback
  const [toastMsg, setToastMsg] = React.useState<string | null>(null);
  const toastTimerRef = React.useRef<any>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToastMsg(null);
    }, 2800);
  };

  // Save preferences to localStorage whenever changed
  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // storage unavailable
    }
  }, [prefs]);

  // Handle URL hash changes
  React.useEffect(() => {
    const handleHash = () => {
      const h = window.location.hash.slice(1);
      if (['schools', 'wishlist', 'demand', 'guide'].includes(h)) {
        setCurrentView(h as ViewType);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const changeView = (view: ViewType) => {
    setCurrentView(view);
    window.location.hash = view;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fetch /data.json
  React.useEffect(() => {
    fetch('/data.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load data.json');
        return res.json();
      })
      .then((data: AppData) => {
        setAppData(data);
        // Clean wishlist & compare IDs that might be invalid
        setPrefs((prev) => {
          const validWishlist = (prev.wishlist || []).filter((id) => {
            const s = data.schools.find((sc) => sc.id === id);
            return s && (prev.gender !== 'male' || !s.girls);
          });
          const validCompare = (prev.compare || []).filter((id) => {
            const s = data.schools.find((sc) => sc.id === id);
            return s && (prev.gender !== 'male' || !s.girls);
          });
          return {
            ...prev,
            wishlist: validWishlist,
            compare: validCompare.slice(0, 4),
          };
        });
        setLoading(false);
      })
      .catch((err) => {
        setError('데이터를 불러오지 못했습니다. 새로고침해 주세요.');
        setLoading(false);
      });
  }, []);

  // Update preferences partial
  const updatePrefs = (updated: Partial<UserPrefs>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...updated };
      // If gender changed to male, purge girls schools from wishlist and compare
      if (updated.gender === 'male' && appData) {
        next.wishlist = next.wishlist.filter((id) => {
          const s = appData.schools.find((sc) => sc.id === id);
          return s && !s.girls;
        });
        next.compare = next.compare.filter((id) => {
          const s = appData.schools.find((sc) => sc.id === id);
          return s && !s.girls;
        });
      }
      return next;
    });
  };

  // Toggle wishlist item
  const toggleWishlist = (schoolId: number) => {
    if (!appData) return;
    const s = appData.schools.find((sc) => sc.id === schoolId);
    if (!s) return;

    if (prefs.gender === 'male' && s.girls) {
      showToast('남학생은 여학교를 지망할 수 없습니다.');
      return;
    }

    if (prefs.wishlist.includes(schoolId)) {
      updatePrefs({ wishlist: prefs.wishlist.filter((id) => id !== schoolId) });
      showToast(`${shortenSchoolName(s.name)}를 지망표에서 제외했습니다.`);
    } else {
      updatePrefs({ wishlist: [...prefs.wishlist, schoolId] });
      showToast(`${shortenSchoolName(s.name)}를 지망표에 담았습니다.`);
    }
  };

  // Toggle compare item
  const toggleCompare = (schoolId: number) => {
    if (prefs.compare.includes(schoolId)) {
      updatePrefs({ compare: prefs.compare.filter((id) => id !== schoolId) });
    } else {
      if (prefs.compare.length >= 4) {
        showToast('최대 4개 학교까지 동시에 비교할 수 있습니다.');
        return;
      }
      updatePrefs({ compare: [...prefs.compare, schoolId] });
    }
  };

  // Save verified transit time
  const saveTransitTime = (schoolId: number, minutes: number | null) => {
    const nextTimes = { ...prefs.times };
    if (minutes !== null && minutes >= 1 && minutes <= 300) {
      nextTimes[schoolId] = Math.round(minutes);
    } else {
      delete nextTimes[schoolId];
    }
    updatePrefs({ times: nextTimes });
  };

  // Open detail modal
  const handleOpenDetail = (schoolId: number, tab: DetailTabType = 'overview') => {
    setDetailSchoolId(schoolId);
    setDetailTab(tab);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-2xl overflow-hidden border border-[#ed8200]/30 shadow-md p-1 bg-white mb-4 animate-bounce">
          <img
            src="/brand/jinnmath-logo.jpg"
            alt="배움의 온도 진수학"
            className="w-full h-full object-cover rounded-xl"
          />
        </div>
        <h2 className="text-lg font-black text-[#261d13]">
          부천 고등학교 한눈에 · 2027
        </h2>
        <p className="text-xs text-[#8c745c] mt-1.5 animate-pulse">
          공식 공시자료와 학교별 전형 데이터를 불러오고 있습니다…
        </p>
      </div>
    );
  }

  if (error || !appData) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-[#ebdcc9] shadow-sm max-w-md text-center space-y-4">
          <h2 className="text-xl font-black text-[#261d13]">
            자료를 불러오지 못했습니다
          </h2>
          <p className="text-xs text-[#8c745c] leading-relaxed">
            {error || '네트워크 상태를 확인하신 후 새로고침해 주세요.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-[#ed8200] hover:bg-[#cf7200] text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
          >
            페이지 새로고침
          </button>
        </div>
      </div>
    );
  }

  const originMiddle = appData.middles.find((m) => m.name === prefs.origin);
  const detailSchool = detailSchoolId
    ? appData.schools.find((s) => s.id === detailSchoolId)
    : null;

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col font-sans text-[#2c241c]">
      {/* Global Top Navigation */}
      <Header
        currentView={currentView}
        onSelectView={changeView}
        wishlistCount={prefs.wishlist.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentView === 'schools' && (
          <SchoolsView
            schools={appData.schools}
            middles={appData.middles}
            prefs={prefs}
            originMiddle={originMiddle}
            onUpdatePrefs={updatePrefs}
            onToggleWishlist={toggleWishlist}
            onToggleCompare={toggleCompare}
            onOpenDetail={handleOpenDetail}
            onOpenWishlist={() => changeView('wishlist')}
          />
        )}

        {currentView === 'wishlist' && (
          <WishlistView
            schools={appData.schools}
            middles={appData.middles}
            prefs={prefs}
            originMiddle={originMiddle}
            onUpdatePrefs={updatePrefs}
            onOpenDetail={handleOpenDetail}
            onGoToSchools={() => changeView('schools')}
            onToast={showToast}
          />
        )}

        {currentView === 'demand' && (
          <DemandView
            appData={appData}
            schools={appData.schools}
            onOpenDetail={handleOpenDetail}
          />
        )}

        {currentView === 'guide' && (
          <GuideView
            appData={appData}
            originMiddle={originMiddle}
            middles={appData.middles}
            onSelectMiddle={(name) => updatePrefs({ origin: name })}
          />
        )}
      </main>

      {/* Footer & Brand Attribution */}
      <Footer onSelectView={changeView} />

      {/* Compare Floating Bottom Bar */}
      <CompareFloatingBar
        compareIds={prefs.compare}
        schools={appData.schools}
        onOpenCompare={() => setIsCompareOpen(true)}
        onClearCompare={() => updatePrefs({ compare: [] })}
        onRemoveCompareItem={(id) =>
          updatePrefs({ compare: prefs.compare.filter((x) => x !== id) })
        }
      />

      {/* Compare Modal */}
      {isCompareOpen && (
        <CompareModal
          compareIds={prefs.compare}
          schools={appData.schools}
          originMiddle={originMiddle}
          prefs={prefs}
          onClose={() => setIsCompareOpen(false)}
          onOpenDetail={handleOpenDetail}
          onToggleField={(fieldId) => {
            const next = prefs.fields.includes(fieldId)
              ? prefs.fields.filter((x) => x !== fieldId)
              : [...prefs.fields, fieldId];
            updatePrefs({ fields: next });
          }}
        />
      )}

      {/* School Deep Detail Modal */}
      {detailSchool && (
        <SchoolDetailModal
          school={detailSchool}
          initialTab={detailTab}
          originMiddle={originMiddle}
          prefs={prefs}
          onClose={() => setDetailSchoolId(null)}
          onSaveTime={saveTransitTime}
          onToggleWishlist={toggleWishlist}
        />
      )}

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#261d13]/95 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-2xl shadow-xl border border-[#524130] animate-in fade-in slide-in-from-top-2 duration-150">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
