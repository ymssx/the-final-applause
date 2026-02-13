// ============================================
// 🌅 日间过渡组件
// ============================================
import { useGameStore } from '../game/store';

export function DayTransition() {
  const { day, act, dayTransitionText } = useGameStore();
  const dismissDayTransition = useGameStore(s => s.dismissDayTransition);
  
  const actNames = { 1: '第一幕：求生', 2: '第二幕：攀升', 3: '第三幕：登顶/崩溃', 4: '尾声：领袖视角' };
  
  return (
    <div className="day-transition">
      <div className="act-label">
        {actNames[act as keyof typeof actNames]}
      </div>
      <h2>第 {day} 天</h2>
      <p>{dayTransitionText}</p>
      <button onClick={dismissDayTransition}>
        ▶ 继续
      </button>
    </div>
  );
}
