// ============================================
// 📋 行动日志组件 — 弹窗模式
// ============================================
import { useRef, useEffect, useState } from 'react';
import { useGameStore } from '../game/store';

export function LogPanel() {
  const { logs, day } = useGameStore();
  const [isOpen, setIsOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  
  // 弹窗打开时自动滚到底部
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  }, [isOpen, logs.length]);
  
  // 所有日志，按天分组
  const recentLogs = logs.filter(l => l.day >= day - 2).slice(-50);
  
  // 今日新日志数
  const todayCount = logs.filter(l => l.day === day).length;
  
  return (
    <>
      {/* 触发按钮 */}
      <button className="log-toggle-btn" onClick={() => setIsOpen(true)}>
        📋 日志
        {todayCount > 0 && <span className="log-badge">{todayCount}</span>}
      </button>
      
      {/* 弹窗 */}
      {isOpen && (
        <div className="log-modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="log-modal" onClick={e => e.stopPropagation()}>
            <div className="log-modal-header">
              <h3>█ 行动日志</h3>
              <button className="log-modal-close" onClick={() => setIsOpen(false)}>✕</button>
            </div>
            <div className="log-modal-body">
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
          </div>
        </div>
      )}
    </>
  );
}
