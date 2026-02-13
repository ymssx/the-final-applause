// ============================================
// 🃏 手牌区域组件
// ============================================
import { useGameStore } from '../game/store';

export function HandArea() {
  const { hand, selectedCard, selectedTarget, actionsRemaining } = useGameStore();
  const { selectCard, cancelSelection, playCard, endActions } = useGameStore();
  
  const canPlay = selectedCard && (!selectedCard.needsTarget || selectedTarget) && actionsRemaining > 0;
  
  return (
    <div className="hand-area">
      <div className="hand-cards">
        {hand.map(card => (
          <div
            key={card.id}
            className={`hand-card ${selectedCard?.id === card.id ? 'selected' : ''}`}
            onClick={() => selectCard(card)}
          >
            {card.needsTarget && <span className="card-target-badge">⎯▶</span>}
            <div className="card-icon">{card.icon}</div>
            <div className="card-name">{card.name}</div>
            <div className="card-desc">{card.description}</div>
          </div>
        ))}
        
        {hand.length === 0 && (
          <div style={{ 
            fontFamily: 'var(--font-serif)', 
            fontSize: '13px', 
            color: 'var(--text-dim)',
            padding: '12px',
          }}>
            手牌已用尽。
          </div>
        )}
      </div>
      
      <div className="hand-actions">
        <div className="actions-remaining">
          行动: {actionsRemaining}/2
        </div>
        
        <button
          className="action-btn primary"
          disabled={!canPlay}
          onClick={playCard}
        >
          {selectedCard?.needsTarget && !selectedTarget
            ? '选择目标'
            : canPlay
              ? `▶ 打出 ${selectedCard?.name || ''}`
              : actionsRemaining <= 0
                ? '行动耗尽'
                : '选择卡牌'}
        </button>
        
        {selectedCard && (
          <button className="action-btn secondary" onClick={cancelSelection}>
            ✕ 取消
          </button>
        )}
        
        <button className="action-btn secondary" onClick={endActions}>
          ▶▶ 结束行动
        </button>
      </div>
    </div>
  );
}
