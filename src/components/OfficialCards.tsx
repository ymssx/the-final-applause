// ============================================
// 👤 官员卡片组件
// ============================================
import { useGameStore } from '../game/store';

export function OfficialCards() {
  const { officials, selectedTarget, selectedCard, phase } = useGameStore();
  const selectTarget = useGameStore(s => s.selectTarget);
  
  const canSelectTarget = phase === 'play_cards' && selectedCard?.needsTarget;
  
  return (
    <div className="officials-area">
      {officials.map(official => {
        const isSelected = selectedTarget === official.id;
        const isDead = !official.isAlive;
        
        let statusClass = '';
        if (isDead) statusClass = 'dead';
        else if (official.isAlly) statusClass = 'ally';
        else if (official.attitude === 'hostile') statusClass = 'hostile';
        
        return (
          <div
            key={official.id}
            className={`official-card ${statusClass} ${isSelected ? 'selected' : ''}`}
            onClick={() => {
              if (canSelectTarget && official.isAlive) {
                selectTarget(official.id);
              }
            }}
            title={official.description}
          >
            {/* 态度标识 */}
            <span className="attitude-badge">
              {official.isAlly ? '🤝' :
               official.attitude === 'friendly' ? '😊' :
               official.attitude === 'hostile' ? '😠' : '❓'}
            </span>
            
            <div className="icon">{official.icon}</div>
            <div className="name">{official.name}</div>
            <div className="title">{official.title}</div>
            <span className="trait">{official.traitName}</span>
            
            {isDead && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontFamily: 'var(--font-ui)',
                fontSize: '12px',
                fontWeight: '700',
                color: 'var(--red)',
                letterSpacing: '3px',
              }}>
                [已清洗]
              </div>
            )}
            
            {/* 简略状态（非情报显示的模糊信息） */}
            {official.isAlive && (
              <div className="status-bar">
                <span title="怀疑">◉{official.suspicion > 4 ? '!' : '·'}</span>
                <span title="恐惧">♦{official.fear > 6 ? '!' : '·'}</span>
                <span title="好感">{official.favorability > 0 ? '♥' : official.favorability < 0 ? '♠' : '·'}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
