// ============================================
// 📰 事件区域组件 — 晨间简报/事件/提问
// ============================================
import { useGameStore } from '../game/store';
import { MOOD_DEFINITIONS } from '../game/data';

export function EventArea() {
  const {
    phase, clues, leaderMood, currentEvent, currentQuestion, currentNpcDialogue, day,
  } = useGameStore();
  const {
    proceedFromBriefing, resolveEvent, answerQuestion, answerNpcDialogue,
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
            <div className="event-title">▌ 会议桌观察</div>
            <div className="event-flavor" style={{ fontSize: '12px', marginBottom: '8px', color: 'var(--text-dim)' }}>
              你环顾四周，注意到了一些事情……
            </div>
            {clues.map(clue => (
              <div key={clue.id} className={`clue-item ${clue.type === 'misleading' ? 'misleading' : clue.type === 'system' ? 'system-clue' : ''}`}>
                {clue.type === 'system' ? '⚙ ' : '👁 '}{clue.text}
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
            <div className="event-flavor" style={{ fontSize: '12px' }}>
              领袖今天心情<strong>{MOOD_DEFINITIONS[leaderMood.type].name}</strong>。
              {leaderMood.type === 'pleased' && ' 也许是献颂词的好时机。'}
              {leaderMood.type === 'suspicious' && ' 不要做任何引人注目的事。'}
              {leaderMood.type === 'furious' && ' 有人今天必须消失。确保那个人不是你。'}
              {leaderMood.type === 'paranoid' && ' 举报不消耗行动。这是试探还是陷阱？'}
              {leaderMood.type === 'nostalgic' && ' 他在回忆过去。空话打动不了他。'}
              {leaderMood.type === 'generous' && ' 难得的好日子。但好运不会持续。'}
            </div>
          </div>
          
          {/* 保持线索可见 */}
          <div style={{ opacity: 0.8 }}>
            {clues.map(clue => (
              <div key={clue.id} className={`clue-item ${clue.type === 'misleading' ? 'misleading' : clue.type === 'system' ? 'system-clue' : ''}`}>
                {clue.type === 'system' ? '⚙ ' : '👁 '}{clue.text}
              </div>
            ))}
          </div>
        </>
      )}
      
      {/* === NPC对话 === */}
      {phase === 'npc_dialogue' && currentNpcDialogue && (
        <>
          <div className="phase-label">💬 有 人 搭 话</div>
          <div className="event-card npc-dialogue-card" style={{ borderColor: 'var(--yellow)' }}>
            <div className="event-title" style={{ color: 'var(--yellow-bright)' }}>
              {currentNpcDialogue.officialIcon} {currentNpcDialogue.officialName}
            </div>
            <div className="event-text" style={{ 
              whiteSpace: 'pre-line', 
              fontSize: '15px', 
              lineHeight: 2,
              fontFamily: 'var(--font-serif)',
            }}>
              {currentNpcDialogue.text.replace(/^"/, '')}
            </div>
            
            <div className="question-options">
              {currentNpcDialogue.options.map(option => (
                <div
                  key={option.id}
                  className="question-option"
                  onClick={() => answerNpcDialogue(option.id)}
                >
                  <div className="option-text">{option.text}</div>
                  <div className="option-risk">💭 {option.hint}</div>
                </div>
              ))}
            </div>
          </div>
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
          <div className="phase-label" style={{ color: 'var(--red-bright)' }}>👁 领 袖 质 问</div>
          <div className="event-card" style={{ borderColor: 'var(--red)' }}>
            <div className="event-title" style={{ color: 'var(--red-bright)' }}>▌ 领袖的目光锁定了你</div>
            <div className="event-text" style={{ fontSize: '16px', lineHeight: 1.6 }}>{currentQuestion.text}</div>
            <div style={{ 
              fontSize: '11px', 
              color: 'var(--text-dim)', 
              fontStyle: 'italic',
              marginTop: '4px',
            }}>
              房间里安静得能听到心跳。所有人都在看你。
            </div>
            
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
