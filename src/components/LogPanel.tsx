// ============================================
// 📋 行动日志组件
// ============================================
import { useRef, useEffect } from 'react';
import { useGameStore } from '../game/store';

export function LogPanel() {
  const { logs, day } = useGameStore();
  const bottomRef = useRef<HTMLDivElement>(null);
  
  // 自动滚到底部
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs.length]);
  
  // 只显示最近的日志
  const recentLogs = logs.filter(l => l.day >= day - 1).slice(-30);
  
  return (
    <div className="log-area">
      <h3>█ 行动日志</h3>
      {recentLogs.map((log, i) => (
        <div key={i} className={`log-entry ${log.type}`}>
          <span className="log-day">D{log.day}</span>
          {log.text}
        </div>
      ))}
      {recentLogs.length === 0 && (
        <div className="log-entry info" style={{ fontStyle: 'italic' }}>
          档案空白。一切尚未开始。
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
