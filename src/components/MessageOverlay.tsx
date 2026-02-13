// ============================================
// 💬 消息弹窗组件 — 不友好版
// ============================================
import { useGameStore } from '../game/store';
import { useState, useEffect } from 'react';

const DISMISS_HINTS = [
  '[ 点击继续，如果你还敢的话 ]',
  '[ 点击。别磨蹭。 ]',
  '[ 领袖在等你。点击继续。 ]',
  '[ 点击继续。时间不等人——在卡拉维亚，什么都不等人。 ]',
  '[ 还不点？秘密警察可没这么耐心。 ]',
  '[ 点击。犹豫是一种态度。 ]',
  '[ 继续。不继续也得继续。 ]',
  '[ 别发呆了。点击继续。 ]',
  '[ 点击。假装这一切没有发生也是一种选择——但不是好的。 ]',
  '[ 点击继续。或者永远留在这个瞬间。你选。 ]',
];

export function MessageOverlay() {
  const { messageQueue } = useGameStore();
  const dismissMessage = useGameStore(s => s.dismissMessage);
  const [hint, setHint] = useState('');
  const [isNew, setIsNew] = useState(false);
  
  // 每次消息变化时随机选一条提示
  useEffect(() => {
    if (messageQueue.length > 0) {
      setHint(DISMISS_HINTS[Math.floor(Math.random() * DISMISS_HINTS.length)]);
      setIsNew(true);
      const timer = setTimeout(() => setIsNew(false), 100);
      return () => clearTimeout(timer);
    }
  }, [messageQueue.length, messageQueue[0]]);
  
  if (messageQueue.length === 0) return null;
  
  const currentMessage = messageQueue[0];
  const remaining = messageQueue.length - 1;
  
  return (
    <div 
      className="message-overlay" 
      onClick={dismissMessage}
      style={{ animation: isNew ? 'slideUp 0.3s ease-out' : undefined }}
    >
      <div className="message-box">
        <div className="message-text">{currentMessage}</div>
        <div className="message-hint" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
        }}>
          <span>{hint}</span>
          {remaining > 0 && (
            <span style={{ 
              fontFamily: 'var(--font-ui)',
              fontSize: '11px',
              color: 'var(--red)',
              fontWeight: 700,
            }}>
              还有 {remaining} 条消息
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
