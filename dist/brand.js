'use strict';
(()=>{
const previousSchools=schoolsView;
schoolsView=function(){let box=document.createElement('div');box.innerHTML=previousSchools();let hero=box.querySelector('.simple-hero');if(hero)hero.insertAdjacentHTML('beforeend','<div class="brand-hero"><img src="brand/jinnmath-logo.jpg" width="854" height="832" alt="배움의 온도 진수학" decoding="async"></div>');return box.innerHTML};
let footer=document.querySelector('footer');let section=document.createElement('section');section.className='brand-footer';section.setAttribute('aria-label','배움의 온도 진수학 소개');section.innerHTML='<img class="brand-footer-logo" src="brand/jinnmath-logo.jpg" alt="배움의 온도 진수학 교습소 로고" width="96" height="96" loading="lazy"><div class="brand-footer-copy"><strong>배움의 온도, 진수학</strong><p>학생과 학부모가 함께 고민하는 고등학교 선택을 돕습니다.</p><details class="brand-contact"><summary>교습소 안내 보기 ＋</summary><img class="brand-banner" src="brand/jinnmath-banner.jpg" alt="배움의 온도 진수학 교습소. 범박힐스테이트 3단지 상가 3층, 문의 010-8145-3605. 카카오톡 채널 배움의온도진수학교습소." width="945" height="200" loading="lazy"><a href="tel:01081453605">교습소 문의 010-8145-3605</a></details></div>';footer.append(section);
if(data){render();renderSim()}
})();
