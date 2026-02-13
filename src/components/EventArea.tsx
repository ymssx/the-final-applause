// ============================================
// 📰 事件区域组件 — 晨间简报/事件/提问
// ============================================
import { useGameStore } from '../game/store';
import { MOOD_DEFINITIONS } from '../game/data';

export function EventArea() {
  const {
    phase, clues, leaderMood, currentEvent, currentQuestion, day,
  } = useGameStore();
  const {
    proceedFromBriefing, resolveEvent, answerQuestion,
    processDayEnd, nextDay,
  } = useGameStore();
  
  const moodDef = MOOD_DEFINITIONS[leaderMood.type];
  
  return (
    <div className="event-area">
      {/* === 晨间简报 === */}
      {phase === 'morning_briefing' && (
        <>
          <div className="phase-label">☀ 晨 间 简 报</div>
          
          <div className="event-card">
            <div className="event-title">▌ 领袖心情</div>
            <div className="event-text">
              <span style={{ fontSize: '24px' }}>{moodDef.icon}</span>{' '}
              <strong>{moodDef.name}</strong> — {moodDef.description}
            </div>
            <div className="event-flavor">{moodDef.flavorText}</div>
          </div>
          
          <div className="event-card">
            <div className="event-title">▌ 会议桌线索</div>
            {clues.map(clue => (
              <div key={clue.id} className={`clue-item ${clue.type === 'misleading' ? 'misleading' : ''}`}>
                {clue.text}
              </div>
            ))}
          </div>
          
          <button className="briefing-proceed-btn" onClick={proceedFromBriefing}>
            ▶ 进入会议室
          </button>
        </>
      )}
      
      {/* === 打牌阶段提示 === */}
      {phase === 'play_cards' && (
        <>
          <div className="phase-label">🃏 行 动 阶 段</div>
          <div className="event-card">
            <div className="event-flavor">
              选择手牌打出。需要目标的卡牌请先点击官员。每天2次行动机会。
            </div>
          </div>
          
          {/* 保持线索可见 */}
          {clues.map(clue => (
            <div key={clue.id} className={`clue-item ${clue.type === 'misleading' ? 'misleading' : ''}`}>
              {clue.text}
            </div>
          ))}
        </>
      )}
      
      {/* === 突发事件 === */}
      {phase === 'random_event' && currentEvent && (
        <>
          <div className="phase-label">⚡ 突 发 事 件</div>
          <div className="event-card">
            <div className="event-title">▌ 事件</div>
            <div className="event-text">{currentEvent.text}</div>
            <div className="event-flavor">{currentEvent.flavorText}</div>
          </div>
          <button className="continue-btn" onClick={resolveEvent}>
            ▶ 继续
          </button>
        </>
      )}
      
      {/* === 领袖提问 === */}
      {phase === 'leader_question' && currentQuestion && (
        <>
          <div className="phase-label">👁 领 袖 提 问</div>
          <div className="event-card">
            <div className="event-title">▌ 领袖发话了</div>
            <div className="event-text">{currentQuestion.text}</div>
            
            <div className="question-options">
              {currentQuestion.options.map(option => (
                <div
                  key={option.id}
                  className="question-option"
                  onClick={() => answerQuestion(option.id)}
                >
                  <div className="option-text">{option.text}</div>
                  <div className="option-risk">⚠ {option.riskHint}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      
      {/* === 日终结算 === */}
      {phase === 'day_end' && (
        <>
          <div className="phase-label">🌙 日 终 结 算</div>
          <div className="event-card">
            <div className="event-title">▌ 夜幕降临</div>
            <div className="event-flavor">
              秘密警察在加班。走廊里的脚步声比白天更多。
            </div>
          </div>
          <button className="continue-btn" onClick={processDayEnd}>
            ▶ 结算
          </button>
        </>
      )}
      
      {/* === 清洗结果 === */}
      {phase === 'purge' && (
        <>
          <div className="phase-label">💀 清 洗 判 定</div>
          <div className="event-card">
            <div className="event-title" style={{ color: 'var(--red-bright)' }}>▌ 今日清洗报告</div>
            <div className="event-flavor">
              又一天结束了。有些人的明天不会到来。
            </div>
          </div>
          <button className="continue-btn" onClick={nextDay}>
            ▶ 迎接新的一天
          </button>
        </>
      )}
    </div>
  );
}
