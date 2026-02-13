// ============================================
// 👤 官员卡片组件 — 信息迷雾版
// ============================================
import { useGameStore } from '../game/store';

/** 获取官员的模糊状态描述 */
function getOfficialMood(o: { suspicion: number; fear: number; favorability: number; ambition: number; isAlly: boolean; loyalty: number }) {
  // 只给出模糊印象，不给精确数值
  const hints: string[] = [];
  
  if (o.suspicion >= 5) hints.push('如履薄冰');
  else if (o.suspicion >= 3) hints.push('神色紧张');
  
  if (o.fear >= 8) hints.push('瑟瑟发抖');
  else if (o.fear >= 6) hints.push('目光闪躲');
  
  if (o.ambition >= 8) hints.push('野心勃勃');
  
  if (o.favorability >= 3) hints.push('对你微笑');
  else if (o.favorability <= -3) hints.push('对你冷眼');
  else if (o.favorability <= -1) hints.push('似有敌意');
  
  if (hints.length === 0) {
    if (o.loyalty >= 7) return '沉稳镇定';
    return '面无表情';
  }
  return hints.join('，');
}

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
        
        const mood = isDead ? '' : getOfficialMood(official);
        
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
            {/* 关系标识 */}
            <span className="attitude-badge">
              {official.isAlly ? '🤝' :
               official.attitude === 'friendly' ? '·' :
               official.attitude === 'hostile' ? '·' : '·'}
            </span>
            
            <div className="icon">{official.icon}</div>
            <div className="name">{official.name}</div>
            <div className="title">{official.title}</div>
            
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
            
            {/* 模糊状态 */}
            {official.isAlive && (
              <div className="official-mood" style={{
                fontSize: '11px',
                color: 'var(--text-dim)',
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                marginTop: '4px',
                lineHeight: 1.3,
                minHeight: '28px',
              }}>
                {mood}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
