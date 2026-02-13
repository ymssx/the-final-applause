// ============================================
// 🎩 最后的掌声 — 主应用组件
// ============================================
import { useGameStore } from './game/store';
import { TitleScreen } from './components/TitleScreen';
import { IntroScreen } from './components/IntroScreen';
import { GameBoard } from './components/GameBoard';
import { EndingScreen } from './components/EndingScreen';

function App() {
  const phase = useGameStore(s => s.phase);
  
  return (
    <div className="game-container">
      {/* 噪点纹理叠加 */}
      <div className="noise-overlay" />
      
      {phase === 'title' && <TitleScreen />}
      {phase === 'intro' && <IntroScreen />}
      {(phase === 'game_over' || phase === 'victory') && <EndingScreen />}
      {!['title', 'intro', 'game_over', 'victory'].includes(phase) && <GameBoard />}
    </div>
  );
}

export default App;
