// ============================================
// 🏆 结局画面组件
// ============================================
import { useState, useEffect } from 'react';
import { useGameStore } from '../game/store';
import { VICTORY_TEXTS, PLAYER_DEATH_TEXTS, getRandomItem } from '../game/data';

export function EndingScreen() {
  const { endingType, player, day, purgedByPlayer, purgedOfficials } = useGameStore();
  const restartGame = useGameStore(s => s.restartGame);
  const [visibleLines, setVisibleLines] = useState(0);
  
  const isDeath = endingType === 'purged';
  
  let texts: string[] = [];
  let title = '';
  
  switch (endingType) {
    case 'purged':
      texts = [getRandomItem(PLAYER_DEATH_TEXTS)];
      title = '你被清洗了';
      break;
    case 'leader':
      texts = VICTORY_TEXTS.leader;
      title = '你成为了领袖';
      break;
    case 'survivor':
      texts = VICTORY_TEXTS.survivor;
      title = '你活了下来';
      break;
    case 'last_standing':
      texts = VICTORY_TEXTS.last_standing;
      title = '最后的幸存者';
      break;
    default:
      texts = ['游戏结束。'];
      title = '结束';
  }
  
  useEffect(() => {
    if (visibleLines < texts.length) {
      const timer = setTimeout(() => {
        setVisibleLines(v => v + 1);
      }, texts[visibleLines] === '' ? 500 : 1000);
      return () => clearTimeout(timer);
    }
  }, [visibleLines, texts.length]);
  
  // 人性评价
  const humanityComment = player.humanity <= 1
    ? '"你已经完全变成了他们。恭喜——或者说，默哀。"'
    : player.humanity <= 3
      ? '"你还记得自己曾经是什么样的人吗？大概不记得了。"'
      : player.humanity <= 5
        ? '"你做了一些不该做的事。但谁在这里没有呢。"'
        : player.humanity <= 7
          ? '"你保留了一些人性。在这里，这几乎是一种奢侈。"'
          : '"你几乎没有沾染血腥。要么你是圣人，要么你是懦夫。也许两者没有区别。"';
  
  return (
    <div className={`ending-screen ${isDeath ? 'death' : 'victory'}`}>
      <h1>{title}</h1>
      
      <div>
        {texts.slice(0, visibleLines).map((line, i) => (
          <div
            key={i}
            className={`ending-text-line ${line === '' ? 'empty' : ''}`}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            {line}
          </div>
        ))}
      </div>
      
      {visibleLines >= texts.length && (
        <>
          <div className="ending-stats">
            <h3>█ 最终档案</h3>
            <div className="ending-stat-row">
              <span className="label">存活天数</span>
              <span className="value">{day}</span>
            </div>
            <div className="ending-stat-row">
              <span className="label">最终权力</span>
              <span className="value">{player.power}</span>
            </div>
            <div className="ending-stat-row">
              <span className="label">最终忠诚</span>
              <span className="value">{player.loyalty}</span>
            </div>
            <div className="ending-stat-row">
              <span className="label">剩余人性</span>
              <span className="value">{player.humanity}/10</span>
            </div>
            <div className="ending-stat-row">
              <span className="label">因你被清洗</span>
              <span className="value">{purgedOfficials.length} 人</span>
            </div>
            <div style={{
              marginTop: '8px',
              fontFamily: 'var(--font-serif)',
              fontSize: '13px',
              color: 'var(--text-dim)',
              fontStyle: 'italic',
              lineHeight: '1.8',
            }}>
              {humanityComment}
            </div>
          </div>
          
          <button className="ending-restart-btn" onClick={restartGame}>
            ▶ 再来一次
          </button>
          
          <div style={{
            marginTop: '16px',
            fontFamily: 'var(--font-serif)',
            fontSize: '12px',
            color: 'var(--text-dim)',
          }}>
            "历史是一个圆。掌声永远不会停。"
          </div>
        </>
      )}
    </div>
  );
}
