// ============================================
// 📊 玩家档案组件 — 信息迷雾版
// ============================================
import { useGameStore } from '../game/store';

/** 将数值转换为模糊描述 */
function getSuspicionDesc(v: number): { text: string; level: 'safe' | 'warn' | 'danger' | 'critical' } {
  if (v <= 1) return { text: '无人注意你', level: 'safe' };
  if (v <= 2) return { text: '偶尔有目光扫过', level: 'safe' };
  if (v <= 3) return { text: '有人在注意你', level: 'warn' };
  if (v <= 4) return { text: '走廊里的耳语变多了', level: 'warn' };
  if (v <= 5) return { text: '秘密警察翻了你的档案', level: 'danger' };
  if (v <= 6) return { text: '你的名字出现在某份名单上', level: 'danger' };
  return { text: '黎明前会有人敲门', level: 'critical' };
}

function getLoyaltyDesc(v: number): { text: string; level: 'safe' | 'warn' | 'danger' | 'critical' } {
  if (v >= 8) return { text: '领袖的宠臣', level: 'safe' };
  if (v >= 6) return { text: '被信任的同志', level: 'safe' };
  if (v >= 4) return { text: '普通党员', level: 'warn' };
  if (v >= 2) return { text: '态度可疑', level: 'danger' };
  return { text: '叛徒的标签已经贴好了', level: 'critical' };
}

function getPowerDesc(v: number): { text: string; level: 'safe' | 'warn' | 'danger' | 'critical' } {
  if (v >= 10) return { text: '权倾朝野', level: 'safe' };
  if (v >= 7) return { text: '有人听你说话', level: 'safe' };
  if (v >= 4) return { text: '普通官僚', level: 'warn' };
  if (v >= 2) return { text: '边缘人物', level: 'danger' };
  return { text: '透明人', level: 'critical' };
}

function getHumanityDesc(v: number): { text: string; level: 'safe' | 'warn' | 'danger' | 'critical' } {
  if (v >= 7) return { text: '你还记得自己是谁', level: 'safe' };
  if (v >= 5) return { text: '镜子里的人有些陌生', level: 'warn' };
  if (v >= 3) return { text: '你开始享受告密了', level: 'danger' };
  if (v >= 1) return { text: '你和这台机器越来越像', level: 'danger' };
  return { text: '机器的一部分', level: 'critical' };
}

export function PlayerProfile() {
  const { player, purgeThreshold } = useGameStore();
  
  // 计算忠诚惩罚后的等效阈值
  const loyaltyPenalty = player.loyalty < 4 ? (4 - player.loyalty) : 0;
  const effectiveThreshold = purgeThreshold - loyaltyPenalty;
  // 危险程度：怀疑接近阈值时显示
  const dangerRatio = player.suspicion / effectiveThreshold;
  
  const sus = getSuspicionDesc(player.suspicion);
  const loy = getLoyaltyDesc(player.loyalty);
  const pow = getPowerDesc(player.power);
  const hum = getHumanityDesc(player.humanity);
  
  return (
    <div className="player-profile">
      <h3>█ 你的处境</h3>
      
      <div className={`profile-item ${sus.level}`}>
        <span className="profile-icon">◉</span>
        <span className="profile-text">{sus.text}</span>
      </div>
      
      <div className={`profile-item ${loy.level}`}>
        <span className="profile-icon">★</span>
        <span className="profile-text">{loy.text}</span>
      </div>
      
      <div className={`profile-item ${pow.level}`}>
        <span className="profile-icon">◆</span>
        <span className="profile-text">{pow.text}</span>
      </div>
      
      <div className={`profile-item ${hum.level}`}>
        <span className="profile-icon">♡</span>
        <span className="profile-text">{hum.text}</span>
      </div>
      
      {/* 清洗预警 */}
      {dangerRatio >= 0.8 && (
        <div className="purge-warning" style={{
          marginTop: '8px',
          padding: '6px 8px',
          background: 'rgba(180,30,30,0.3)',
          border: '1px solid var(--red)',
          fontFamily: 'var(--font-ui)',
          fontSize: '11px',
          color: 'var(--red-bright)',
          animation: 'blink 0.8s infinite',
          textAlign: 'center',
        }}>
          {dangerRatio >= 1.0
            ? '▓▓▓ 今晚可能是你的最后一夜 ▓▓▓'
            : '▓▓ 你感到一种不祥的预感 ▓▓'}
        </div>
      )}
      
      {player.humanity <= 2 && (
        <div style={{
          marginTop: '4px',
          fontFamily: 'var(--font-serif)',
          fontSize: '12px',
          color: 'var(--text-dim)',
          fontStyle: 'italic',
          textAlign: 'center',
        }}>
          {player.humanity === 0 
            ? '你的盟友不再信任你。忠诚正在流失。'
            : '你的冷血正在引起注意。'}
        </div>
      )}
    </div>
  );
}
