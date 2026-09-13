import { useEffect, useState } from 'react';

import { BrandMark } from './components/BrandMark';
import { type AppRoute, hashForRoute, routeFromHash } from './lib/routing';

const pillars = [
  {
    index: '01',
    title: '나의 사주',
    titleEn: 'My Saju',
    description: '검증된 역법과 명시적인 불확실성을 바탕으로 네 기둥을 읽습니다.',
  },
  {
    index: '02',
    title: '관계의 결',
    titleEn: 'Relationship texture',
    description: '점수 대신 잘 맞는 지점, 긴장 가능성, 그 이유를 함께 살펴봅니다.',
  },
  {
    index: '03',
    title: '안전한 탐색',
    titleEn: 'Private by design',
    description: '개인 입력은 브라우저 메모리에서만 다루고 새로고침하면 사라집니다.',
  },
];

function useHashRoute(): AppRoute {
  const [route, setRoute] = useState(() => routeFromHash(window.location.hash));

  useEffect(() => {
    const updateRoute = () => setRoute(routeFromHash(window.location.hash));
    window.addEventListener('hashchange', updateRoute);
    return () => window.removeEventListener('hashchange', updateRoute);
  }, []);

  return route;
}

function Methodology() {
  return (
    <section className="detail-page" aria-labelledby="methodology-title">
      <p className="eyebrow">METHODOLOGY · 방법론</p>
      <h1 id="methodology-title">해석보다 먼저, 근거와 한계를 보여줍니다.</h1>
      <p className="detail-lead">
        INYEON은 사주를 과학적 예측이나 정해진 운명으로 주장하지 않습니다. 역법 계산과 관계 규칙은
        버전이 있는 결정론적 코드로 관리하고, 출생 시간이 없거나 출처가 다투어지는 경우 그 불확실성을
        숨기지 않습니다.
      </p>
      <div className="principle-grid">
        <article><span>계산</span><h2>재현 가능한 규칙</h2><p>같은 입력과 같은 버전은 같은 결과를 냅니다.</p></article>
        <article><span>설명</span><h2>맥락, 운명 아님</h2><p>관계를 단정하지 않고 대화를 시작할 관점을 제공합니다.</p></article>
        <article><span>확신</span><h2>모름을 그대로</h2><p>알 수 없는 출생 시간은 임의로 채우지 않습니다.</p></article>
      </div>
    </section>
  );
}

function Privacy() {
  return (
    <section className="detail-page" aria-labelledby="privacy-title">
      <p className="eyebrow">PRIVACY · 개인정보</p>
      <h1 id="privacy-title">당신의 정보가 머무르지 않도록 설계합니다.</h1>
      <p className="detail-lead">
        첫 공개 버전의 개인 출생 정보와 비교 결과는 활성 브라우저 메모리에서만 처리됩니다. 계정과 앱
        서버가 없으며, 로컬 저장소·URL·분석 도구·제3자 요청으로 개인 입력을 보내지 않습니다.
      </p>
      <div className="privacy-note">
        <strong>현재는 제품 기반을 구축 중입니다.</strong>
        <p>이 화면에는 출생 정보 입력이나 계산 기능이 아직 없습니다. 검증을 통과한 기능만 단계적으로 공개합니다.</p>
        <p>GitHub Pages와 인터넷 인프라는 별도의 접속·보안 로그를 보관할 수 있습니다.</p>
      </div>
    </section>
  );
}

function Landing() {
  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">KOREAN COMPATIBILITY LAB</p>
          <h1 id="hero-title">
            인연을 맞히는 대신,<br />
            <em>이해하는 방법.</em>
          </h1>
          <p className="hero-lead">
            사주와 궁합을 운명의 판정이 아닌 관계를 바라보는 하나의 렌즈로 탐색합니다.
          </p>
          <a className="primary-link" href={hashForRoute('/methodology')}>
            접근 방식 보기 <span aria-hidden="true">↗</span>
          </a>
          <p className="release-note">계산 기능은 검증을 마친 뒤 공개됩니다 · Preview foundation</p>
        </div>
        <div className="hero-orbit" aria-hidden="true">
          <div className="orbit orbit-outer" />
          <div className="orbit orbit-inner" />
          <div className="orb orb-sun" />
          <div className="orb orb-moon" />
          <span className="glyph glyph-left">緣</span>
          <span className="glyph glyph-right">和</span>
        </div>
      </section>
      <section className="pillars" aria-label="제품 원칙">
        {pillars.map((pillar) => (
          <article key={pillar.index}>
            <span className="pillar-index">{pillar.index}</span>
            <h2>{pillar.title}<small>{pillar.titleEn}</small></h2>
            <p>{pillar.description}</p>
          </article>
        ))}
      </section>
      <aside className="context-note">
        <span>COMPATIBILITY IS CONTEXT, NOT DESTINY.</span>
        <p>궁합은 관계의 가능성을 이야기하는 언어이지, 사람이나 미래를 판정하는 점수가 아닙니다.</p>
      </aside>
    </>
  );
}

export default function App() {
  const route = useHashRoute();

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href={hashForRoute('/')} aria-label="INYEON 홈">
          <BrandMark />
          <span>INYEON<small>인연</small></span>
        </a>
        <nav aria-label="주요 메뉴">
          <a aria-current={route === '/' ? 'page' : undefined} href={hashForRoute('/')}>Lab</a>
          <a aria-current={route === '/methodology' ? 'page' : undefined} href={hashForRoute('/methodology')}>Methodology</a>
          <a aria-current={route === '/privacy' ? 'page' : undefined} href={hashForRoute('/privacy')}>Privacy</a>
        </nav>
      </header>
      <main>{route === '/' ? <Landing /> : route === '/methodology' ? <Methodology /> : <Privacy />}</main>
      <footer>
        <span>INYEON · 인연</span>
        <p>전통의 언어를 오늘의 관계에 조심스럽게 번역합니다.</p>
        <span>SEOUL · 2026</span>
      </footer>
    </div>
  );
}
