// ============================================
// 📜 开场文字组件
// ============================================
import { useState, useEffect } from 'react';
import { INTRO_TEXTS } from '../game/data';
import { useGameStore } from '../game/store';

export function IntroScreen() {
  const finishIntro = useGameStore(s => s.finishIntro);
  const [visibleLines, setVisibleLines] = useState(0);
  
  useEffect(() => {
    if (visibleLines < INTRO_TEXTS.length) {
      const timer = setTimeout(() => {
        setVisibleLines(v => v + 1);
      }, INTRO_TEXTS[visibleLines] === '' ? 400 : 800);
      return () => clearTimeout(timer);
    }
  }, [visibleLines]);
  
  return (
    <div className="intro-screen">
      <div className="intro-text">
        {INTRO_TEXTS.slice(0, visibleLines).map((line, i) => (
          <div
            key={i}
            className={`intro-line ${line === '' ? 'empty' : ''} ${
              line.includes('活下去') || line.includes('鼓掌') ? 'bold' : ''
            }`}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            {line}
          </div>
        ))}
      </div>
      
      <button className="intro-skip-btn" onClick={finishIntro}>
        {visibleLines >= INTRO_TEXTS.length ? '▶ 进入卡拉维亚' : '▶▶ 跳过'}
      </button>
    </div>
  );
}
