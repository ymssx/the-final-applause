// ============================================
// 🃏 手牌区域组件 — 扑克牌样式
// ============================================
import { useGameStore } from '../game/store';
import type { Card } from '../game/types';

/** 根据卡牌类型返回花色风格 */
function getCardSuit(type: Card['type']) {
  switch (type) {
    case 'praise': return { suit: '♥', color: 'var(--red-bright)', label: '赞美' };
    case 'report': return { suit: '♠', color: 'var(--text-bright)', label: '举报' };
    case 'alliance': return { suit: '♦', color: 'var(--yellow-bright)', label: '结盟' };
    case 'gift': return { suit: '♣', color: 'var(--green-bright)', label: '贿赂' };
    case 'silence': return { suit: '♠', color: 'var(--text-dim)', label: '沉默' };
    case 'deflect': return { suit: '♦', color: 'var(--blue-bright)', label: '甩锅' };
    case 'intel': return { suit: '♣', color: 'var(--yellow)', label: '情报' };
    case 'confess': return { suit: '♥', color: 'var(--red)', label: '忏悔' };
    default: return { suit: '?', color: 'var(--text-dim)', label: '未知' };
  }
}

export function HandArea() {
  const { hand, selectedCard, selectedTarget, actionsRemaining } = useGameStore();
  const { selectCard, cancelSelection, playCard, endActions } = useGameStore();
  
  const canPlay = selectedCard && (!selectedCard.needsTarget || selectedTarget) && actionsRemaining > 0;
  
  const handleCardClick = (card: Card) => {
    if (selectedCard?.id === card.id) {
      cancelSelection();
    } else {
      selectCard(card);
    }
  };
  
  return (
    <div className="hand-area">
      {/* 顶部操作栏 */}
      <div className="hand-action-bar">
        <div className="actions-remaining">
          行动: {actionsRemaining}/2
        </div>
        <div className="hand-actions">
          <button
            className="action-btn primary"
            disabled={!canPlay}
            onClick={playCard}
          >
            {selectedCard?.needsTarget && !selectedTarget
              ? '选择目标 ⎯▶'
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
      
      {/* 牌组区 */}
      <div className="poker-hand">
        {hand.map((card, index) => {
          const suit = getCardSuit(card.type);
          const isSelected = selectedCard?.id === card.id;
          
          return (
            <div
              key={card.id}
              className={`poker-card ${isSelected ? 'selected' : ''}`}
              style={{ '--card-index': index } as React.CSSProperties}
              onClick={() => handleCardClick(card)}
            >
              {/* 牌面 */}
              <div className="poker-card-inner">
                {/* 左上角：花色 + 缩写 */}
                <div className="poker-corner top-left" style={{ color: suit.color }}>
                  <span className="poker-suit">{suit.suit}</span>
                  <span className="poker-rank">{suit.label}</span>
                </div>
                
                {/* 中心图标 */}
                <div className="poker-center">
                  <span className="poker-icon">{card.icon}</span>
                  <span className="poker-name">{card.name}</span>
                </div>
                
                {/* 右下角（倒转） */}
                <div className="poker-corner bottom-right" style={{ color: suit.color }}>
                  <span className="poker-suit">{suit.suit}</span>
                  <span className="poker-rank">{suit.label}</span>
                </div>
                
                {/* 需要目标标记 */}
                {card.needsTarget && (
                  <span className="poker-target-badge">⎯▶</span>
                )}
              </div>
              
              {/* 选中时展示的效果详情 */}
              {isSelected && (
                <div className="poker-detail">
                  <div className="poker-detail-desc">{card.description}</div>
                  <div className="poker-detail-flavor">{card.flavorText}</div>
                </div>
              )}
            </div>
          );
        })}
        
        {hand.length === 0 && (
          <div className="poker-empty">
            手牌已用尽。
          </div>
        )}
      </div>
    </div>
  );
}
