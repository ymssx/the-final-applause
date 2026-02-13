// ============================================
// 🏛️ 游戏主界面组件
// ============================================
import { useGameStore } from '../game/store';
import { MOOD_DEFINITIONS } from '../game/data';
import { OfficialCards } from './OfficialCards';
import { HandArea } from './HandArea';
import { EventArea } from './EventArea';
import { PlayerProfile } from './PlayerProfile';
import { LogPanel } from './LogPanel';
import { MessageOverlay } from './MessageOverlay';
import { DayTransition } from './DayTransition';

export function GameBoard() {
  const {
    day, act, phase, leaderMood, clues, actionsRemaining,
    purgeThreshold, showDayTransition, delayedActions,
  } = useGameStore();
  
  const actNames = { 1: '第一幕：求生', 2: '第二幕：攀升', 3: '第三幕：登顶', 4: '尾声' };
  const moodDef = MOOD_DEFINITIONS[leaderMood.type];
  
  // 清洗压力的模糊描述
  const getPurgePressure = () => {
    if (purgeThreshold >= 4.5) return '空气尚可呼吸';
    if (purgeThreshold >= 3.5) return '走廊里的脚步声变多了';
    if (purgeThreshold >= 2.5) return '今晚有人会消失';
    return '几乎所有人都在颤抖';
  };
  
  return (
    <>
      {showDayTransition && <DayTransition />}
      
      <div className="game-main scanlines">
        {/* 顶部：领袖区域 */}
        <div className="leader-area">
          <div className="leader-mood">
            <span className="mood-icon">{moodDef.icon}</span>
            <span className="mood-name">{moodDef.name}</span>
            <span className="mood-desc">— {moodDef.description}</span>
          </div>
          
          <div className="day-info">
            <span>{actNames[act]}</span>
            <span>第 {day} 天</span>
            <span className="threshold" style={{
              color: purgeThreshold <= 2.5 ? 'var(--red-bright)' : purgeThreshold <= 3.5 ? 'var(--yellow)' : 'var(--text-dim)',
            }}>
              {getPurgePressure()}
            </span>
            {phase === 'play_cards' && (
              <span>剩余行动: {actionsRemaining}</span>
            )}
          </div>
        </div>
        
        {/* 中间区域 */}
        <div className="main-content">
          <div className="content-left">
            <OfficialCards />
            <EventArea />
          </div>
          <div className="content-right">
            <PlayerProfile />
            {delayedActions.length > 0 && (
              <div className="delayed-actions">
                <h4>⏳ 调查队列</h4>
                {delayedActions.map(a => (
                  <div key={a.id} className="delayed-item">
                    {a.description} <span className="days">[{a.daysRemaining}天]</span>
                  </div>
                ))}
              </div>
            )}
            <LogPanel />
          </div>
        </div>
        
        {/* 底部：手牌 */}
        {(phase === 'play_cards' || phase === 'npc_dialogue') && <HandArea />}
        
        {/* 消息弹窗 */}
        <MessageOverlay />
      </div>
    </>
  );
}
