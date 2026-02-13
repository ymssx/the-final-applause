// ============================================
// 🎬 标题画面组件
// ============================================
import { useGameStore } from '../game/store';

export function TitleScreen() {
  const startGame = useGameStore(s => s.startGame);
  
  return (
    <div className="title-screen">
      <h1>
        最后的掌声
        <br />
        <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '14px', letterSpacing: '6px', imageRendering: 'pixelated', WebkitFontSmoothing: 'none' } as React.CSSProperties}>THE FINAL APPLAUSE</span>
      </h1>
      <div className="title-subtitle">一款关于权力、恐惧与人性的卡牌游戏</div>
      <div className="title-location">卡拉维亚共和国 · 19██年</div>
      <button className="title-start-btn" onClick={startGame}>
        ▶ 开始游戏
      </button>
      <div style={{
        marginTop: '48px',
        fontFamily: 'var(--font-serif)',
        fontSize: '13px',
        color: 'var(--text-dim)',
        maxWidth: '360px',
        textAlign: 'center',
        lineHeight: '1.8',
      }}>
        "在一个掌声不能停下来的国家里，<br/>
        最先停下来的人就是下一个消失的人。"
      </div>
    </div>
  );
}
