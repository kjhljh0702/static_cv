import React from 'react';

const story = {
  en: [
    ['Understand the', 'system.', 'From mechanisms and motion control to the structure of a program.', '01 / ROBOTICS → SYSTEMS'],
    ['Find the', 'signal.', 'Learning representations that reveal what code does, beyond how it is written.', '02 / CODE → MEANING'],
    ['Make it', 'matter.', 'Bringing that understanding back to practical engineering and useful research.', '03 / RESEARCH → IMPACT'],
  ],
  ko: [
    ['시스템을', '이해하고.', '로봇의 메커니즘과 제어에서 프로그램의 구조까지 탐구합니다.', '01 / 로보틱스 → 시스템'],
    ['의미를', '발견하고.', '코드가 어떻게 쓰였는지를 넘어, 무엇을 하는지 이해하는 표현을 학습합니다.', '02 / 코드 → 의미'],
    ['가치를', '만듭니다.', '이해를 실제 엔지니어링과 유용한 연구로 이어갑니다.', '03 / 연구 → 가치'],
  ],
};
export default function ScrollStory({ lang }) {
  return <section className="manifesto scroll-story" id="approach" aria-label={lang === 'en' ? 'My approach' : '연구 철학'}>
    <div className="story-sticky">
      <div className="story-grid" aria-hidden="true" />
      <div className="story-orbit" aria-hidden="true">
        {[0, 1, 2, 3].map(i => <div key={i} className={`story-ring story-ring-${i}`}><i /><b /></div>)}
      </div>
      <div className="story-top shell"><p className="eyebrow">{lang === 'en' ? 'ONE THREAD THROUGH IT ALL' : '모든 작업을 관통하는 하나의 생각'}</p><span className="mono">HANYANG UNIVERSITY / PSL</span></div>
      <div className="story-stage shell">
        {story[lang].map(([lead, word, text, label], i) => <article className={`story-beat story-beat-${i}`} key={i}>
          <span className="story-ordinal" aria-hidden="true">0{i + 1}</span>
          <p className="story-label mono">{label}</p>
          <h2>{lead}<br /><em>{word}</em></h2>
          <p className="story-description">{text}</p>
        </article>)}
      </div>
      <div className="story-bottom shell"><span className="mono">{lang === 'en' ? 'SCROLL TO FOLLOW THE THREAD' : '스크롤하며 생각의 흐름을 따라가세요'}</span><div className="story-dots" aria-hidden="true">{[0, 1, 2].map(i => <span key={i} data-step={i}>0{i + 1}</span>)}</div><span className="story-counter mono" aria-hidden="true">01 / 03</span></div>
      <div className="story-progress" aria-hidden="true" />
    </div>
  </section>;
}
