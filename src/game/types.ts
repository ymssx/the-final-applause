// ============================================
// 🎩 最后的掌声 — 核心类型定义
// ============================================

/** 领袖心情 */
export type LeaderMood = 'suspicious' | 'pleased' | 'paranoid' | 'nostalgic' | 'furious' | 'generous';

export interface LeaderMoodInfo {
  type: LeaderMood;
  icon: string;
  name: string;
  description: string;
  isFake: boolean; // 15%概率伪装
  realMood?: LeaderMood; // 伪装时的真实心情
}

/** 卡牌类型 */
export type CardType = 'praise' | 'report' | 'alliance' | 'gift' | 'silence' | 'deflect' | 'intel' | 'confess';

export interface Card {
  id: string;
  type: CardType;
  icon: string;
  name: string;
  description: string;
  needsTarget: boolean;
  flavorText: string; // 辛辣文案
}

/** 官员特质 */
export type OfficialTrait = 'ambitious' | 'paranoid_trait' | 'cunning' | 'loyal' | 'coward';

/** 官员 */
export interface Official {
  id: string;
  name: string;
  title: string;
  icon: string;
  trait: OfficialTrait;
  traitName: string;
  // 属性
  loyalty: number;    // 忠诚
  power: number;      // 权力
  suspicion: number;  // 怀疑
  fear: number;       // 恐惧
  ambition: number;   // 野心
  // 与玩家关系
  favorability: number; // 好感度 -10 ~ 10
  attitude: 'friendly' | 'hostile' | 'unknown' | 'allied';
  isAlly: boolean;
  isAlive: boolean;
  // 描述
  description: string;
}

/** 玩家 */
export interface Player {
  loyalty: number;    // 忠诚 0-15
  power: number;      // 权力 0-15
  suspicion: number;  // 怀疑 0-15
  humanity: number;   // 人性 0-10
}

/** 延迟炸弹 */
export interface DelayedAction {
  id: string;
  type: 'report' | 'confess_loyalty' | 'alliance_protection';
  sourceId: string; // 发起者
  targetId?: string; // 目标
  daysRemaining: number;
  description: string;
}

/** 会议桌线索 */
export interface Clue {
  id: string;
  text: string;
  type: 'behavior' | 'system' | 'misleading';
  relatedOfficialId?: string;
  isReliable: boolean; // 80-85%准确
}

/** 领袖提问 */
export interface LeaderQuestion {
  id: string;
  text: string;
  options: LeaderOption[];
}

export interface LeaderOption {
  id: string;
  text: string;
  riskHint: string;
  // 隐藏效果（根据当天心情和状态计算）
  effects: (gameState: GameState) => { loyalty: number; suspicion: number; power: number; humanity: number; description: string };
}

/** NPC对话 */
export interface NpcDialogue {
  id: string;
  officialId: string;
  officialName: string;
  officialIcon: string;
  text: string; // NPC说的话
  options: NpcDialogueOption[];
}

export interface NpcDialogueOption {
  id: string;
  text: string;
  hint: string; // 风险提示
  effects: {
    loyalty: number;
    suspicion: number;
    power: number;
    humanity: number;
    favorability: number; // 对该NPC好感变化
    description: string;
  };
}

/** 突发事件 */
export interface RandomEvent {
  id: string;
  text: string;
  flavorText: string;
  effect: (gameState: GameState) => Partial<EventResult>;
}

export interface EventResult {
  playerChanges: Partial<Player>;
  officialChanges: { officialId: string; changes: Partial<Official> }[];
  message: string;
}

/** 游戏阶段 */
export type GamePhase =
  | 'title'           // 标题画面
  | 'intro'           // 开场文字
  | 'morning_briefing' // 晨间简报
  | 'play_cards'      // 打牌阶段
  | 'npc_dialogue'    // NPC对话
  | 'random_event'    // 突发事件
  | 'leader_question' // 领袖提问
  | 'day_end'         // 日终结算
  | 'purge'           // 清洗判定
  | 'game_over'       // 游戏结束
  | 'victory'         // 胜利/成为领袖
  | 'leader_phase';   // 领袖视角

/** 日志条目 */
export interface LogEntry {
  day: number;
  phase: string;
  text: string;
  type: 'info' | 'warning' | 'danger' | 'success' | 'death';
}

/** 连续行为计数 */
export interface ConsecutiveActions {
  silence: number;
  praise: number;
  report: number;
}

/** 游戏状态 */
export interface GameState {
  // 核心
  day: number;
  phase: GamePhase;
  act: 1 | 2 | 3 | 4; // 幕
  player: Player;
  officials: Official[];
  
  // 当天状态
  leaderMood: LeaderMoodInfo;
  clues: Clue[];
  hand: Card[];
  actionsRemaining: number;
  
  // 系统
  delayedActions: DelayedAction[];
  purgeThreshold: number;
  consecutiveActions: ConsecutiveActions;
  logs: LogEntry[];
  
  // 当天事件
  currentEvent?: RandomEvent;
  currentQuestion?: LeaderQuestion;
  currentNpcDialogue?: NpcDialogue;
  selectedCard?: Card;
  selectedTarget?: string;
  
  // 结局
  purgedOfficials: string[];
  purgedByPlayer: number;
  endingType?: 'purged' | 'survivor' | 'leader' | 'last_standing' | 'hollow';
  
  // 动画/UI状态
  isAnimating: boolean;
  messageQueue: string[];
  showDayTransition: boolean;
  dayTransitionText: string;
}
