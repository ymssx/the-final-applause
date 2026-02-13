// ============================================
// 📊 玩家档案组件
// ============================================
import { useGameStore } from '../game/store';

export function PlayerProfile() {
  const { player } = useGameStore();
  
  const stats = [
    { key: 'loyalty', label: '忠诚 ★', value: player.loyalty, max: 15, cls: 'loyalty' },
    { key: 'power', label: '权力 ◆', value: player.power, max: 15, cls: 'power' },
    { key: 'suspicion', label: '怀疑 ◉', value: player.suspicion, max: 15, cls: 'suspicion' },
    { key: 'humanity', label: '人性 ♡', value: player.humanity, max: 10, cls: 'humanity' },
  ];
  
  return (
    <div className="player-profile">
      <h3>█ 你的档案</h3>
      {stats.map(stat => (
        <div key={stat.key} className="stat-row">
          <span className="stat-label">{stat.label}</span>
          <div className="stat-bar">
            <div
              className={`stat-bar-fill ${stat.cls}`}
              style={{ width: `${(stat.value / stat.max) * 100}%` }}
            />
          </div>
          <span className="stat-value">{stat.value}</span>
        </div>
      ))}
      
      {/* 状态标注 */}
      {player.suspicion >= 4 && (
        <div style={{
          marginTop: '4px',
          fontFamily: 'var(--font-ui)',
          fontSize: '12px',
          fontWeight: '700',
          color: 'var(--red-bright)',
          animation: 'blink 1s infinite',
        }}>
          ⚠ 怀疑值偏高
        </div>
      )}
      {player.humanity <= 3 && (
        <div style={{
          marginTop: '2px',
          fontFamily: 'var(--font-serif)',
          fontSize: '13px',
          color: 'var(--text-dim)',
          fontStyle: 'italic',
        }}>
          你已经不是原来的自己了。
        </div>
      )}
    </div>
  );
}
