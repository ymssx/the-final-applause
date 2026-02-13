// ============================================
// 💬 消息弹窗组件
// ============================================
import { useGameStore } from '../game/store';

export function MessageOverlay() {
  const { messageQueue } = useGameStore();
  const dismissMessage = useGameStore(s => s.dismissMessage);
  
  if (messageQueue.length === 0) return null;
  
  const currentMessage = messageQueue[0];
  
  return (
    <div className="message-overlay" onClick={dismissMessage}>
      <div className="message-box">
        <div className="message-text">{currentMessage}</div>
        <div className="message-hint">[ 点击继续 ] ({messageQueue.length})</div>
      </div>
    </div>
  );
}
