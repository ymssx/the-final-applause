// ============================================
// 🎮 游戏核心引擎 — 所有游戏逻辑
// ============================================

import type {
  GameState, Card, CardType, Official, LeaderMoodInfo, LeaderMood,
  Clue, DelayedAction, LogEntry, Player, LeaderQuestion, LeaderOption,
  ConsecutiveActions,
} from './types';
import {
  CARD_DEFINITIONS, INITIAL_OFFICIALS, MOOD_DEFINITIONS,
  CLUE_TEMPLATES, LEADER_QUESTIONS, RANDOM_EVENTS,
  DEATH_NARRATIVES, DAY_TRANSITION_TEXTS,
  getRandomItem, getRandomFlavorText, AI_ACTION_HINTS,
} from './data';

let cardIdCounter = 0;
let actionIdCounter = 0;
let clueIdCounter = 0;

function genId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

// ==================== 初始化 ====================

export function createInitialState(): GameState {
  return {
    day: 0,
    phase: 'title',
    act: 1,
    player: { loyalty: 5, power: 3, suspicion: 1, humanity: 8 },
    officials: INITIAL_OFFICIALS.map(o => ({
      ...o,
      attitude: o.favorability >= 1 ? 'friendly' as const : o.favorability <= -1 ? 'hostile' as const : 'unknown' as const,
    })),
    leaderMood: generateMood(1),
    clues: [],
    hand: [],
    actionsRemaining: 2,
    delayedActions: [],
    purgeThreshold: 6,
    consecutiveActions: { silence: 0, praise: 0, report: 0 },
    logs: [],
    purgedOfficials: [],
    purgedByPlayer: 0,
    isAnimating: false,
    messageQueue: [],
    showDayTransition: false,
    dayTransitionText: '',
  };
}

// ==================== 心情生成 ====================

function generateMood(day: number): LeaderMoodInfo {
  const moods: LeaderMood[] = ['suspicious', 'pleased', 'paranoid', 'nostalgic', 'furious', 'generous'];
  
  // 根据幕数调整概率（后期更容易暴怒/多疑）
  let weights: number[];
  if (day <= 5) {
    weights = [2, 3, 1, 2, 1, 2]; // 第一幕：较温和
  } else if (day <= 10) {
    weights = [3, 2, 2, 1, 2, 1]; // 第二幕：更多疑
  } else {
    weights = [3, 1, 2, 1, 4, 1]; // 第三幕：频繁暴怒
  }
  
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let roll = Math.random() * totalWeight;
  let selectedMood: LeaderMood = 'suspicious';
  
  for (let i = 0; i < moods.length; i++) {
    roll -= weights[i];
    if (roll <= 0) {
      selectedMood = moods[i];
      break;
    }
  }
  
  // 15%概率伪装
  const isFake = Math.random() < 0.15;
  let realMood: LeaderMood | undefined;
  if (isFake) {
    const otherMoods = moods.filter(m => m !== selectedMood);
    realMood = getRandomItem(otherMoods);
  }
  
  const def = MOOD_DEFINITIONS[selectedMood];
  return {
    type: selectedMood,
    icon: def.icon,
    name: def.name,
    description: def.description,
    isFake,
    realMood,
  };
}

// ==================== 线索生成 ====================

function generateClues(state: GameState): Clue[] {
  const aliveOfficials = state.officials.filter(o => o.isAlive);
  const clues: Clue[] = [];
  const clueCount = 2 + (Math.random() < 0.4 ? 1 : 0); // 2-3条
  
  for (let i = 0; i < clueCount; i++) {
    const roll = Math.random();
    let type: 'behavior' | 'system' | 'misleading';
    
    if (roll < 0.15) {
      type = 'misleading';
    } else if (roll < 0.45) {
      type = 'system';
    } else {
      type = 'behavior';
    }
    
    const templates = CLUE_TEMPLATES[type];
    const template = getRandomItem(templates);
    const official = getRandomItem(aliveOfficials);
    const official2 = getRandomItem(aliveOfficials.filter(o => o.id !== official.id));
    
    let text = template.text
      .replace('{name}', official.name)
      .replace('{name2}', official2?.name || '某人');
    
    // 80-85%准确率
    const isReliable = Math.random() < 0.82;
    
    clues.push({
      id: genId('clue'),
      text,
      type,
      relatedOfficialId: official.id,
      isReliable,
    });
  }
  
  // 如果有延迟炸弹，增加系统线索
  if (state.delayedActions.length > 0 && Math.random() < 0.6) {
    const sysTpl = getRandomItem(CLUE_TEMPLATES.system);
    clues.push({
      id: genId('clue'),
      text: sysTpl.text,
      type: 'system',
      isReliable: true,
    });
  }
  
  return clues;
}

// ==================== 抽牌 ====================

export function drawHand(): Card[] {
  // 牌库分布：沉默多，举报少
  const distribution: CardType[] = [
    'praise', 'praise', 'praise', 'praise', 'praise',
    'report', 'report', 'report',
    'alliance', 'alliance', 'alliance', 'alliance',
    'gift', 'gift', 'gift', 'gift',
    'silence', 'silence', 'silence', 'silence', 'silence', 'silence',
    'deflect', 'deflect', 'deflect',
    'intel', 'intel', 'intel', 'intel',
    'confess', 'confess', 'confess',
  ];
  
  // 打乱并抽5张
  const shuffled = [...distribution].sort(() => Math.random() - 0.5);
  const drawn = shuffled.slice(0, 5);
  
  // 保底：至少1张颂扬、1张沉默
  const hasPraise = drawn.includes('praise');
  const hasSilence = drawn.includes('silence');
  
  if (!hasPraise) drawn[0] = 'praise';
  if (!hasSilence) drawn[1] = 'silence';
  
  return drawn.map(type => {
    const def = CARD_DEFINITIONS[type];
    return {
      id: genId('card'),
      type,
      icon: def.icon,
      name: def.name,
      description: def.description,
      needsTarget: def.needsTarget,
      flavorText: getRandomFlavorText(type),
    };
  });
}

// ==================== 卡牌效果 ====================

export interface CardResult {
  playerChanges: Partial<Player>;
  officialChanges?: { id: string; changes: Partial<Official> }[];
  logs: string[];
  delayed?: Omit<DelayedAction, 'id'>;
  flavorText: string;
}

export function resolveCard(
  card: Card,
  targetId: string | undefined,
  state: GameState
): CardResult {
  const target = targetId ? state.officials.find(o => o.id === targetId) : undefined;
  const realMood = state.leaderMood.isFake ? state.leaderMood.realMood! : state.leaderMood.type;
  
  switch (card.type) {
    case 'praise': {
      let loyaltyGain = 2;
      if (realMood === 'pleased') loyaltyGain = 4; // 翻倍
      
      const jealousTarget = getRandomItem(state.officials.filter(o => o.isAlive));
      const officialChanges = jealousTarget
        ? [{ id: jealousTarget.id, changes: { favorability: jealousTarget.favorability - 1 } }]
        : undefined;
      
      return {
        playerChanges: { loyalty: state.player.loyalty + loyaltyGain },
        officialChanges,
        logs: [
          `你向领袖献上了颂词。忠诚+${loyaltyGain}。`,
          jealousTarget ? `${jealousTarget.name}看你的眼神带着嫉妒。` : '',
        ].filter(Boolean),
        flavorText: card.flavorText,
      };
    }
    
    case 'report': {
      if (!target) return { playerChanges: {}, logs: ['没有选择目标。'], flavorText: '' };
      
      const delay = 1 + Math.floor(Math.random() * 3);
      
      return {
        playerChanges: { humanity: Math.max(0, state.player.humanity - 2) },
        logs: [
          `你写下了一份关于${target.name}的匿名举报。人性-2。`,
          `举报将在${delay}天后生效。在此期间，保持冷静。`,
        ],
        delayed: {
          type: 'report',
          sourceId: 'player',
          targetId: target.id,
          daysRemaining: delay,
          description: `对${target.name}的举报正在调查中`,
        },
        flavorText: card.flavorText,
      };
    }
    
    case 'alliance': {
      if (!target) return { playerChanges: {}, logs: ['没有选择目标。'], flavorText: '' };
      
      // 结盟判定
      const success = checkAllianceSuccess(target);
      
      if (success) {
        return {
          playerChanges: {},
          officialChanges: [{ id: target.id, changes: { isAlly: true, attitude: 'allied' as const } }],
          logs: [
            `你与${target.name}达成了秘密盟约。`,
            '"互相照应。"——在卡拉维亚，这比结婚誓言更沉重。',
          ],
          flavorText: card.flavorText,
        };
      } else {
        const penaltyLog = target.fear >= 8
          ? `${target.name}被你的提议吓坏了，转身就跑。你的怀疑+1。`
          : `${target.name}冷冷地拒绝了你。也许时机不对。`;
        
        return {
          playerChanges: target.fear >= 8 ? { suspicion: state.player.suspicion + 1 } : {},
          logs: [penaltyLog],
          flavorText: card.flavorText,
        };
      }
    }
    
    case 'gift': {
      if (!target) return { playerChanges: {}, logs: ['没有选择目标。'], flavorText: '' };
      
      return {
        playerChanges: { power: Math.max(0, state.player.power - 1) },
        officialChanges: [{ id: target.id, changes: {
          favorability: target.favorability + 2,
          fear: Math.max(0, target.fear - 1),
        }}],
        logs: [
          `你送了${target.name}一份礼物。好感+2，恐惧-1。你的权力-1。`,
          '人情是卡拉维亚唯一的硬通货。',
        ],
        flavorText: card.flavorText,
      };
    }
    
    case 'silence': {
      return {
        playerChanges: {
          suspicion: Math.max(0, state.player.suspicion - 1),
          power: Math.max(0, state.player.power - 1),
        },
        logs: ['你选择了沉默。怀疑-1，权力-1。', '不说话是一门濒危的艺术。'],
        flavorText: card.flavorText,
      };
    }
    
    case 'deflect': {
      if (!target) return { playerChanges: {}, logs: ['没有选择目标。'], flavorText: '' };
      
      const caught = Math.random() < 0.25;
      
      if (caught) {
        return {
          playerChanges: { suspicion: state.player.suspicion + 3 },
          logs: [
            `你试图把怀疑转嫁给${target.name}，但被识破了。`,
            '你的怀疑+3。搬起石头砸自己的脚，卡拉维亚经典节目。',
          ],
          flavorText: card.flavorText,
        };
      } else {
        return {
          playerChanges: { suspicion: Math.max(0, state.player.suspicion - 2) },
          officialChanges: [{ id: target.id, changes: { suspicion: target.suspicion + 2 } }],
          logs: [
            `你巧妙地将话题引向了${target.name}。目标怀疑+2，你的怀疑-2。`,
            '刀子不需要太大。够划破信任就行。',
          ],
          flavorText: card.flavorText,
        };
      }
    }
    
    case 'intel': {
      if (!target) return { playerChanges: {}, logs: ['没有选择目标。'], flavorText: '' };
      
      return {
        playerChanges: {},
        logs: [
          `你调查了${target.name}的档案。`,
          `── ${target.name}（${target.title}）──`,
          `忠诚: ${target.loyalty} | 权力: ${target.power}`,
          `怀疑: ${target.suspicion} | 恐惧: ${target.fear}`,
          `野心: ${target.ambition} | 好感: ${target.favorability}`,
          `状态: ${target.isAlly ? '盟友' : target.attitude === 'hostile' ? '敌意' : '中立'}`,
        ],
        flavorText: card.flavorText,
      };
    }
    
    case 'confess': {
      return {
        playerChanges: {
          suspicion: Math.max(0, state.player.suspicion - 3),
          power: Math.max(0, state.player.power - 2),
        },
        logs: [
          '你写了一份自我批评报告。怀疑-3，权力-2。',
          '明天领袖会评估你的"诚意"。忠诚+1（次日生效）。',
        ],
        delayed: {
          type: 'confess_loyalty',
          sourceId: 'player',
          daysRemaining: 1,
          description: '自白的忠诚回报',
        },
        flavorText: card.flavorText,
      };
    }
    
    default:
      return { playerChanges: {}, logs: ['未知卡牌。'], flavorText: '' };
  }
}

function checkAllianceSuccess(target: Official): boolean {
  if (target.fear >= 8) return false;
  if (target.fear <= 5 && target.favorability >= 0) return true;
  if (target.fear <= 5 && target.favorability < 0) return Math.random() < 0.5;
  if (target.fear >= 6 && target.fear <= 7 && target.favorability >= 2) return Math.random() < 0.5;
  return false;
}

// ==================== 领袖提问逻辑 ====================

export function generateQuestion(state: GameState): LeaderQuestion {
  const template = getRandomItem(LEADER_QUESTIONS);
  
  return {
    id: template.id,
    text: template.text,
    options: template.options.map(opt => ({
      id: opt.id,
      text: opt.text,
      riskHint: opt.riskHint,
      effects: (gs: GameState) => resolveQuestionEffect(opt.effectLogic, gs),
    })),
  };
}

function resolveQuestionEffect(logic: string, state: GameState): {
  loyalty: number; suspicion: number; power: number; humanity: number; description: string;
} {
  const realMood = state.leaderMood.isFake ? state.leaderMood.realMood! : state.leaderMood.type;
  
  switch (logic) {
    case 'if_suspicious_bad':
      if (realMood === 'suspicious') return { loyalty: 0, suspicion: 2, power: 0, humanity: 0, description: '领袖觉得你在说谎。怀疑+2。' };
      if (realMood === 'pleased') return { loyalty: 3, suspicion: 0, power: 0, humanity: 0, description: '领袖很高兴。忠诚+3。' };
      return { loyalty: 1, suspicion: 0, power: 0, humanity: 0, description: '领袖点了点头。忠诚+1。' };
    
    case 'safe_if_recent_purge':
      if (state.purgedOfficials.length > 0) return { loyalty: 0, suspicion: -1, power: 0, humanity: 0, description: '考虑到最近的清洗，谨慎是明智的。怀疑-1。' };
      return { loyalty: -1, suspicion: 0, power: 0, humanity: 0, description: '领袖觉得你不够积极。忠诚-1。' };
    
    case 'if_nostalgic_good':
      if (realMood === 'nostalgic') return { loyalty: 2, suspicion: 0, power: 0, humanity: 0, description: '领袖被你的真诚打动了。忠诚+2。' };
      return { loyalty: 0, suspicion: 2, power: 0, humanity: 0, description: '领袖认为你在动摇军心。怀疑+2。' };
    
    case 'if_paranoid_good':
      if (realMood === 'paranoid') return { loyalty: 2, suspicion: -1, power: 1, humanity: -1, description: '领袖欣赏你的警觉。忠诚+2，怀疑-1，权力+1。但你的人性-1。' };
      return { loyalty: 0, suspicion: 1, power: 0, humanity: 0, description: '领袖觉得你太激进了。怀疑+1。' };
    
    case 'if_pleased_good':
      if (realMood === 'pleased') return { loyalty: 3, suspicion: 0, power: 1, humanity: 0, description: '领袖龙颜大悦。忠诚+3，权力+1。' };
      if (realMood === 'suspicious') return { loyalty: 0, suspicion: 1, power: 0, humanity: 0, description: '标准答案？领袖不喜欢标准答案。怀疑+1。' };
      return { loyalty: 1, suspicion: 0, power: 0, humanity: 0, description: '不功不过。忠诚+1。' };
    
    case 'if_furious_risky':
      if (realMood === 'furious') return { loyalty: 1, suspicion: 0, power: 2, humanity: -1, description: '领袖需要忠犬。你表现得像一条。权力+2，人性-1。' };
      return { loyalty: 0, suspicion: 2, power: 0, humanity: 0, description: '话说得太满了。怀疑+2。' };
    
    case 'neutral':
    default:
      return { loyalty: 0, suspicion: 0, power: 0, humanity: 0, description: '领袖没什么反应。这在卡拉维亚算是好事。' };
  }
}

// ==================== 随机事件逻辑 ====================

export function resolveRandomEvent(eventId: string, state: GameState): {
  playerChanges: Partial<Player>;
  officialChanges?: { id: string; changes: Partial<Official> }[];
  message: string;
} {
  switch (eventId) {
    case 'evt_anonymous_letter':
      return { playerChanges: {}, message: '你把信烧了。但信里的话烧不掉。' };
    
    case 'evt_parade':
      return {
        playerChanges: { loyalty: state.player.loyalty + 1 },
        message: '你在阅兵式上鼓掌鼓得最响。忠诚+1。手掌很疼，但这是小事。',
      };
    
    case 'evt_inspection':
      return {
        playerChanges: { suspicion: state.player.suspicion + 1 },
        message: '秘密警察什么都没找到。但他们记下了"什么都没找到"。怀疑+1。',
      };
    
    case 'evt_blackout':
      return {
        playerChanges: {},
        officialChanges: state.officials.filter(o => o.isAlive).map(o => ({
          id: o.id,
          changes: { fear: o.fear + 1 },
        })),
        message: '停电三小时。每个人的恐惧都升高了。黑暗里，所有人都是嫌疑犯。',
      };
    
    case 'evt_banquet':
      return {
        playerChanges: { loyalty: state.player.loyalty + 1, power: state.player.power + 1 },
        message: '宴会很成功。你没喝多，也没喝少。忠诚+1，权力+1。',
      };
    
    case 'evt_photo':
      return {
        playerChanges: {},
        message: '照片洗出来了。你站在第二排。不前不后——完美的位置。',
      };
    
    case 'evt_foreign_visit':
      return {
        playerChanges: { suspicion: Math.max(0, state.player.suspicion - 1) },
        message: '外国人在。今天所有人都安全。怀疑-1。明天再说。',
      };
    
    case 'evt_newspaper':
      return {
        playerChanges: {},
        message: '"人民的声音"刊登了。所有人鼓掌。没有人问"哪个人民"。',
      };
    
    case 'evt_rumor': {
      const rumor = Math.random() < 0.5;
      return {
        playerChanges: rumor ? { suspicion: state.player.suspicion + 1 } : {},
        message: rumor ? '谣言传开了。怀疑+1。谣言是卡拉维亚最快的交通工具。'
          : '谣言不攻自破。这次运气不错。',
      };
    }
    
    case 'evt_award': {
      return {
        playerChanges: { loyalty: state.player.loyalty + 2, suspicion: state.player.suspicion + 1 },
        message: '你获得了"人民英雄"勋章。忠诚+2，怀疑+1。枪打出头鸟，但不接受勋章的人死得更快。',
      };
    }
    
    default:
      return { playerChanges: {}, message: '什么都没发生。在卡拉维亚，这是最好的事件。' };
  }
}

// ==================== AI官员行为 ====================

export function processAIActions(state: GameState): {
  officialChanges: { id: string; changes: Partial<Official> }[];
  playerChanges: Partial<Player>;
  logs: string[];
} {
  const changes: { id: string; changes: Partial<Official> }[] = [];
  let playerChanges: Partial<Player> = {};
  const logs: string[] = [];
  
  const alive = state.officials.filter(o => o.isAlive);
  
  for (const official of alive) {
    // 高野心：30%暗中增加某人怀疑
    if (official.ambition > 6 && Math.random() < 0.3) {
      // 可能针对玩家
      if (Math.random() < 0.35) {
        const susInc = 1;
        playerChanges = {
          ...playerChanges,
          suspicion: (playerChanges.suspicion ?? state.player.suspicion) + susInc,
        };
        logs.push(getRandomItem(AI_ACTION_HINTS));
      } else {
        // 针对其他官员
        const others = alive.filter(o => o.id !== official.id);
        if (others.length > 0) {
          const victim = getRandomItem(others);
          changes.push({ id: victim.id, changes: { suspicion: victim.suspicion + 1 } });
        }
      }
    }
    
    // 盟友效果：每轮降低玩家怀疑0.5（累积后取整）
    if (official.isAlly) {
      const currentSus = playerChanges.suspicion ?? state.player.suspicion;
      // 简化为每轮-1，因为0.5在整数系统中不好处理
      if (Math.random() < 0.5) {
        playerChanges = { ...playerChanges, suspicion: Math.max(0, currentSus - 1) };
        // 不显式提示，让玩家自己发现
      }
    }
    
    // 高野心+高权力：构陷竞争者
    if (official.ambition > 8 && official.power > 5) {
      const rivals = alive.filter(o => o.id !== official.id && o.power > official.power);
      if (rivals.length > 0 && Math.random() < 0.2) {
        const rival = getRandomItem(rivals);
        changes.push({ id: rival.id, changes: { suspicion: rival.suspicion + 1 } });
      }
    }
  }
  
  return { officialChanges: changes, playerChanges, logs };
}

// ==================== 延迟炸弹结算 ====================

export function processDelayedActions(state: GameState): {
  resolved: string[];
  officialChanges: { id: string; changes: Partial<Official> }[];
  playerChanges: Partial<Player>;
  logs: string[];
  newDelayed: Omit<DelayedAction, 'id'>[];
} {
  const resolved: string[] = [];
  const officialChanges: { id: string; changes: Partial<Official> }[] = [];
  let playerChanges: Partial<Player> = {};
  const logs: string[] = [];
  const newDelayed: Omit<DelayedAction, 'id'>[] = [];
  
  for (const action of state.delayedActions) {
    if (action.daysRemaining <= 1) {
      resolved.push(action.id);
      
      switch (action.type) {
        case 'report': {
          const target = state.officials.find(o => o.id === action.targetId);
          if (target && target.isAlive) {
            // 检查领袖心情变化造成的反噬
            const realMood = state.leaderMood.isFake ? state.leaderMood.realMood! : state.leaderMood.type;
            
            if (realMood === 'pleased' || realMood === 'generous') {
              // 领袖心情转好，举报反噬
              playerChanges = { ...playerChanges, suspicion: (playerChanges.suspicion ?? state.player.suspicion) + 1 };
              logs.push('举报调查完成，但领袖心情正好。他反而觉得举报者不安好心。你的怀疑+1。');
            } else {
              officialChanges.push({ id: target.id, changes: { suspicion: target.suspicion + 3 } });
              logs.push(`对${target.name}的调查完成。${target.name}的怀疑+3。秘密警察在他的名字下画了一条红线。`);
            }
            
            // 20%概率被发现
            if (Math.random() < 0.2) {
              officialChanges.push({ id: target.id, changes: { favorability: -5 } });
              logs.push(`${target.name}发现了是你举报的。关系降至冰点。`);
              // 反举报
              newDelayed.push({
                type: 'report',
                sourceId: target.id,
                targetId: 'player',
                daysRemaining: 1 + Math.floor(Math.random() * 2),
                description: `${target.name}的反举报`,
              });
              logs.push(`${target.name}提交了一份关于你的反举报。`);
            }
          } else {
            logs.push('举报的目标已经不在了。举报作废——但你举报的事实不会消失。');
          }
          break;
        }
        
        case 'confess_loyalty': {
          playerChanges = { ...playerChanges, loyalty: (playerChanges.loyalty ?? state.player.loyalty) + 1 };
          logs.push('领袖评估了你的自白。忠诚+1。诚意——或者说，演技——得到了认可。');
          break;
        }
        
        case 'alliance_protection': {
          // 盟友保护效果生效
          logs.push('你的盟约保护效果已生效。');
          break;
        }
      }
    }
  }
  
  // 反举报对玩家生效
  for (const action of state.delayedActions) {
    if (action.daysRemaining <= 1 && action.targetId === 'player' && action.sourceId !== 'player') {
      playerChanges = { ...playerChanges, suspicion: (playerChanges.suspicion ?? state.player.suspicion) + 3 };
      const source = state.officials.find(o => o.id === action.sourceId);
      logs.push(`${source?.name || '某人'}的举报生效。你的怀疑+3。`);
    }
  }
  
  return { resolved, officialChanges, playerChanges, logs, newDelayed };
}

// ==================== 清洗判定 ====================

export function processPurge(state: GameState): {
  purgedOfficials: string[];
  playerPurged: boolean;
  logs: string[];
  allyBetrayal: { officialId: string; betrayed: boolean; suspicionGain: number }[];
} {
  const realMood = state.leaderMood.isFake ? state.leaderMood.realMood! : state.leaderMood.type;
  const logs: string[] = [];
  const purged: string[] = [];
  const allyBetrayal: { officialId: string; betrayed: boolean; suspicionGain: number }[] = [];
  let playerPurged = false;
  
  // 收集所有超过阈值的（包括玩家）
  interface PurgeCandidate {
    id: string;
    suspicion: number;
    isPlayer: boolean;
  }
  
  const candidates: PurgeCandidate[] = [];
  
  if (state.player.suspicion >= state.purgeThreshold) {
    candidates.push({ id: 'player', suspicion: state.player.suspicion, isPlayer: true });
  }
  
  for (const o of state.officials.filter(o => o.isAlive)) {
    if (o.suspicion >= state.purgeThreshold) {
      candidates.push({ id: o.id, suspicion: o.suspicion, isPlayer: false });
    }
  }
  
  // 排序，怀疑最高的先处理
  candidates.sort((a, b) => b.suspicion - a.suspicion);
  
  // 暴怒时必须清洗至少一人
  if (realMood === 'furious' && candidates.length === 0) {
    // 随机选一个怀疑值最高的
    const alive = state.officials.filter(o => o.isAlive);
    if (alive.length > 0) {
      const highest = [...alive].sort((a, b) => b.suspicion - a.suspicion)[0];
      candidates.push({ id: highest.id, suspicion: highest.suspicion, isPlayer: false });
      logs.push('领袖的暴怒需要一个出口。有人必须消失。');
    }
  }
  
  for (const c of candidates) {
    if (c.isPlayer) {
      // 检查盟友保护
      const allies = state.officials.filter(o => o.isAlly && o.isAlive);
      let protected_ = false;
      
      for (const ally of allies) {
        if (Math.random() < 0.3) {
          protected_ = true;
          logs.push(`${ally.name}在领袖面前为你说了话。你暂时安全了。怀疑-2。`);
          break;
        }
      }
      
      if (!protected_) {
        playerPurged = true;
      }
    } else {
      // 官员被清洗
      purged.push(c.id);
      const official = state.officials.find(o => o.id === c.id)!;
      logs.push(`${official.name}被清洗了。${getRandomItem(DEATH_NARRATIVES)}`);
      
      // 检查盟友背叛
      if (official.isAlly) {
        let betrayChance: number;
        let susGain: number;
        
        if (official.fear <= 3) { betrayChance = 0.1; susGain = 3; }
        else if (official.fear <= 6) { betrayChance = 0.3; susGain = 3; }
        else if (official.fear <= 8) { betrayChance = 0.5; susGain = 4; }
        else { betrayChance = 0.8; susGain = 5; }
        
        const betrayed = Math.random() < betrayChance;
        allyBetrayal.push({ officialId: c.id, betrayed, suspicionGain: betrayed ? susGain : 0 });
        
        if (betrayed) {
          logs.push(`${official.name}在被带走前供出了你。你的怀疑+${susGain}。恐惧让人变成野兽。`);
        } else {
          logs.push(`${official.name}至死没有提到你的名字。也许这就是忠诚。`);
        }
      }
    }
  }
  
  return { purgedOfficials: purged, playerPurged, logs, allyBetrayal };
}

// ==================== 连续行为检查 ====================

export function checkConsecutiveActions(
  type: CardType,
  consecutive: ConsecutiveActions
): { warning?: string; penalty?: Partial<Player> } {
  const updated = { ...consecutive };
  
  if (type === 'silence') {
    if (updated.silence >= 2) {
      return {
        warning: '领袖似乎注意到你最近很安静。"沉默是一种态度。"怀疑+1。',
        penalty: { suspicion: 1 }, // 额外+1
      };
    }
  }
  
  if (type === 'praise') {
    if (updated.praise >= 3) {
      return {
        warning: '你的颂扬太频繁了。其他人开始用嫉妒的眼神看你。',
        penalty: {},
      };
    }
  }
  
  if (type === 'report') {
    if (updated.report >= 2) {
      return {
        warning: '有人觉得你举报得太频繁了。人性-1，被识破概率翻倍。',
        penalty: { humanity: -1 },
      };
    }
  }
  
  return {};
}

// ==================== 新一天 ====================

export function startNewDay(state: GameState): Partial<GameState> {
  const newDay = state.day + 1;
  const act = newDay <= 5 ? 1 : newDay <= 10 ? 2 : newDay <= 15 ? 3 : 4;
  const newThreshold = Math.max(1.8, 6 - (newDay - 1) * 0.3);
  
  // 更新心情
  const mood = generateMood(newDay);
  
  // 生成线索
  const clues = generateClues(state);
  
  // 抽手牌
  const hand = drawHand();
  
  // 日间过渡文案
  let transitionText = getRandomItem(DAY_TRANSITION_TEXTS).replace('{day}', String(newDay));
  
  // 更新延迟炸弹计时
  const updatedDelayed = state.delayedActions.map(a => ({
    ...a,
    daysRemaining: a.daysRemaining - 1,
  }));
  
  // 领袖心情对所有人的影响
  const realMood = mood.isFake ? mood.realMood! : mood.type;
  let officialUpdates: { id: string; changes: Partial<Official> }[] = [];
  let playerSusChange = 0;
  
  if (realMood === 'suspicious') {
    playerSusChange = 1;
    officialUpdates = state.officials.filter(o => o.isAlive).map(o => ({
      id: o.id,
      changes: { suspicion: o.suspicion + 1 },
    }));
  }
  
  if (realMood === 'generous') {
    // 权力最高者+2
    const alive = state.officials.filter(o => o.isAlive);
    if (alive.length > 0) {
      const highest = [...alive].sort((a, b) => b.power - a.power)[0];
      officialUpdates.push({ id: highest.id, changes: { power: highest.power + 2 } });
    }
  }
  
  // 应用官员变化
  const updatedOfficials = state.officials.map(o => {
    const update = officialUpdates.find(u => u.id === o.id);
    if (update) {
      return { ...o, ...update.changes };
    }
    return o;
  });
  
  return {
    day: newDay,
    act: act as 1 | 2 | 3 | 4,
    phase: 'morning_briefing',
    leaderMood: mood,
    clues,
    hand,
    actionsRemaining: realMood === 'paranoid' ? 3 : 2, // 偏执时举报不消耗行动
    purgeThreshold: newThreshold,
    officials: updatedOfficials,
    delayedActions: updatedDelayed,
    player: {
      ...state.player,
      suspicion: state.player.suspicion + playerSusChange,
    },
    showDayTransition: true,
    dayTransitionText: transitionText,
    currentEvent: undefined,
    currentQuestion: undefined,
    selectedCard: undefined,
    selectedTarget: undefined,
  };
}

// ==================== 胜利检查 ====================

export function checkVictory(state: GameState): 'leader' | 'survivor' | 'last_standing' | null {
  const aliveOfficials = state.officials.filter(o => o.isAlive);
  
  // 所有官员被清洗
  if (aliveOfficials.length === 0) return 'last_standing';
  
  // 第15天后
  if (state.day >= 15) {
    if (state.player.power >= 8) return 'leader';
    return 'survivor';
  }
  
  return null;
}
