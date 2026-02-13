// ============================================
// 🎮 游戏核心引擎 — 所有游戏逻辑
// ============================================

import type {
  GameState, Card, CardType, Official, LeaderMoodInfo, LeaderMood,
  Clue, DelayedAction, LogEntry, Player, LeaderQuestion, LeaderOption,
  ConsecutiveActions, NpcDialogue,
} from './types';
import {
  CARD_DEFINITIONS, INITIAL_OFFICIALS, MOOD_DEFINITIONS,
  CLUE_TEMPLATES, LEADER_QUESTIONS, RANDOM_EVENTS,
  DEATH_NARRATIVES, DAY_TRANSITION_TEXTS,
  getRandomItem, getRandomFlavorText, AI_ACTION_HINTS,
  NPC_DIALOGUE_TEMPLATES,
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
    player: { loyalty: 5, power: 3, suspicion: 2, humanity: 8 },
    officials: INITIAL_OFFICIALS.map(o => ({
      ...o,
      attitude: o.favorability >= 1 ? 'friendly' as const : o.favorability <= -1 ? 'hostile' as const : 'unknown' as const,
    })),
    leaderMood: generateMood(1),
    clues: [],
    hand: [],
    actionsRemaining: 2,
    delayedActions: [],
    purgeThreshold: 5,
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
    weights = [3, 2, 2, 2, 1, 1]; // 第一幕：已有压力
  } else if (day <= 10) {
    weights = [3, 1, 3, 1, 3, 1]; // 第二幕：暴怒+偏执高发
  } else {
    weights = [3, 1, 2, 0, 5, 0]; // 第三幕：频繁暴怒，不再慷慨
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
  
  // 20%概率伪装（后期更高）
  const fakeChance = day <= 5 ? 0.15 : day <= 10 ? 0.25 : 0.35;
  const isFake = Math.random() < fakeChance;
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
  const reliability = state.day <= 5 ? 0.85 : state.day <= 10 ? 0.70 : 0.55;
  
  // === 线索1：谁最接近清洗线（帮你决定该举报谁/保护谁）===
  const sortedBySuspicion = [...aliveOfficials].sort((a, b) => b.suspicion - a.suspicion);
  if (sortedBySuspicion.length > 0) {
    const most = sortedBySuspicion[0];
    const isReliable = Math.random() < reliability;
    const shown = isReliable ? most : getRandomItem(aliveOfficials);
    
    const dangerTexts = [
      `${shown.name}最近频繁被秘密警察约谈。`,
      `有人在领袖面前提起了${shown.name}的名字。不是好事。`,
      `${shown.name}的档案被调取了。走廊里的人都在回避他。`,
      `${shown.name}昨晚的灯亮到了凌晨。也许在销毁文件，也许在写遗书。`,
    ];
    clues.push({
      id: genId('clue'),
      text: getRandomItem(dangerTexts),
      type: 'behavior',
      relatedOfficialId: shown.id,
      isReliable,
    });
  }
  
  // === 线索2：谁对你有威胁/谁是潜在盟友（帮你决定社交方向）===
  const hostile = aliveOfficials.filter(o => o.favorability <= -2);
  const friendly = aliveOfficials.filter(o => o.favorability >= 2 && !o.isAlly);
  
  if (hostile.length > 0 && Math.random() < 0.7) {
    const h = getRandomItem(hostile);
    const isReliable2 = Math.random() < reliability;
    const shown2 = isReliable2 ? h : getRandomItem(aliveOfficials);
    const hostileTexts = [
      `${shown2.name}看你的眼神变了。小心背后。`,
      `${shown2.name}最近和秘密警察走得很近。你的名字可能在他们的话题里。`,
      `有人看到${shown2.name}在写什么东西。他看到你就合上了本子。`,
    ];
    clues.push({
      id: genId('clue'),
      text: getRandomItem(hostileTexts),
      type: 'behavior',
      relatedOfficialId: shown2.id,
      isReliable: isReliable2,
    });
  } else if (friendly.length > 0 && Math.random() < 0.5) {
    const f = getRandomItem(friendly);
    const friendlyTexts = [
      `${f.name}向你点了点头。在卡拉维亚，这已经算是表白了。`,
      `${f.name}主动给你留了一个好位子。也许值得拉拢。`,
    ];
    clues.push({
      id: genId('clue'),
      text: getRandomItem(friendlyTexts),
      type: 'behavior',
      relatedOfficialId: f.id,
      isReliable: true,
    });
  }
  
  // === 线索3：领袖心情验证/系统压力提示 ===
  const realMood = state.leaderMood.isFake ? state.leaderMood.realMood! : state.leaderMood.type;
  if (state.leaderMood.isFake && Math.random() < 0.4) {
    // 暗示心情可能是伪装的
    const fakeHints = [
      '领袖的表情似乎有些不自然。也许事情不像表面那么简单。',
      '你注意到领袖的手指在桌下不停敲击。他的心情也许不像看起来那样。',
      '秘书的表情和领袖不太搭。有人在演戏。',
    ];
    clues.push({
      id: genId('clue'),
      text: getRandomItem(fakeHints),
      type: 'system',
      isReliable: true,
    });
  }
  
  // 系统压力线索
  if (state.purgeThreshold <= 3) {
    clues.push({
      id: genId('clue'),
      text: '空气中弥漫着恐惧的味道。清洗的门槛越来越低了。',
      type: 'system',
      isReliable: true,
    });
  }
  
  // 延迟炸弹相关线索
  if (state.delayedActions.length > 0 && Math.random() < 0.5) {
    const sysTpl = getRandomItem(CLUE_TEMPLATES.system);
    clues.push({
      id: genId('clue'),
      text: sysTpl.text,
      type: 'system',
      isReliable: true,
    });
  }
  
  // 补充行为线索（使用模板）
  if (clues.length < 2) {
    const templates = CLUE_TEMPLATES.behavior;
    const template = getRandomItem(templates);
    const official = getRandomItem(aliveOfficials);
    const official2 = getRandomItem(aliveOfficials.filter(o => o.id !== official.id));
    const text = template.text
      .replace('{name}', official.name)
      .replace('{name2}', official2?.name || '某人');
    clues.push({
      id: genId('clue'),
      text,
      type: 'behavior',
      relatedOfficialId: official.id,
      isReliable: Math.random() < reliability,
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
      let loyaltyGain = 1; // 基础降为1
      let susGain = 0;
      let powerGain = 0;
      
      // 愉悦时才是颂扬的好时机
      if (realMood === 'pleased') { loyaltyGain = 2; }
      // 暴怒时颂扬=找死（领袖觉得你在拍马屁敷衍他）
      if (realMood === 'furious') { loyaltyGain = 0; susGain = 2; }
      // 多疑时颂扬引起反感（越多疑越觉得你在演戏）
      if (realMood === 'suspicious') { susGain = 2; loyaltyGain = 0; }
      // 偏执时颂扬让领袖觉得你在掩饰什么
      if (realMood === 'paranoid') { susGain = 1; }
      // 怀旧时领袖不想听空话
      if (realMood === 'nostalgic') { loyaltyGain = 0; }
      
      // 嫉妒机制：随机1-2个官员好感下降
      const alive = state.officials.filter(o => o.isAlive);
      const jealousCount = Math.min(alive.length, 1 + (Math.random() < 0.4 ? 1 : 0));
      const shuffled = [...alive].sort(() => Math.random() - 0.5);
      const jealousTargets = shuffled.slice(0, jealousCount);
      const officialChanges = jealousTargets.map(t => ({
        id: t.id,
        changes: { favorability: t.favorability - 1, ...(t.ambition >= 7 ? { suspicion: t.suspicion } : {}) },
      }));
      
      // 高野心的人被激怒时可能反击（给你加怀疑的延迟炸弹）
      let delayed: CardResult['delayed'];
      const angryAmbitious = jealousTargets.find(t => t.ambition >= 7 && Math.random() < 0.4);
      if (angryAmbitious) {
        delayed = {
          type: 'report',
          sourceId: angryAmbitious.id,
          targetId: 'player',
          daysRemaining: 1 + Math.floor(Math.random() * 2),
          description: `${angryAmbitious.name}的报复`,
        };
      }
      
      const logs: string[] = [];
      if (loyaltyGain > 0) logs.push(`你向领袖献上了颂词。忠诚+${loyaltyGain}。`);
      else logs.push('你向领袖献上了颂词。但他似乎没在听。');
      if (susGain > 0) logs.push(`领袖看了你一眼。那种目光能让人脊背发凉。怀疑+${susGain}。`);
      if (jealousTargets.length > 0) {
        logs.push(`${jealousTargets.map(t => t.name).join('、')}看你的眼神不太友善。`);
      }
      if (angryAmbitious) {
        logs.push(`${angryAmbitious.name}的表情阴沉了下来。你可能给自己树了一个敌。`);
      }
      
      return {
        playerChanges: {
          loyalty: state.player.loyalty + loyaltyGain,
          suspicion: state.player.suspicion + susGain,
        },
        officialChanges,
        logs,
        delayed,
        flavorText: card.flavorText,
      };
    }
    
    case 'report': {
      if (!target) return { playerChanges: {}, logs: ['没有选择目标。'], flavorText: '' };
      
      const delay = 1 + Math.floor(Math.random() * 3);
      
      // === 人性机制：低人性时举报更容易被发现（你的冷血已经引人注目）===
      const extraSus = state.player.humanity <= 2 ? 1 : 0;
      const logs_report = [
        `你写下了一份关于${target.name}的匿名举报。人性-2。`,
        `举报将在${delay}天后生效。在此期间，保持冷静。`,
      ];
      if (extraSus > 0) logs_report.push('你举报得太频繁了。有人开始注意你冰冷的眼神。怀疑+1。');
      
      return {
        playerChanges: { humanity: Math.max(0, state.player.humanity - 2), suspicion: state.player.suspicion + extraSus },
        logs: logs_report,
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
      // 沉默：低怀疑时是好选择，但高怀疑时只是苟延残喘
      const susReduce = state.player.suspicion >= 4 ? 0 : 1; // 高怀疑时沉默不再降怀疑（你已经被盯上了，躲不掉）
      const loyReduce = 1;
      const powReduce = 1;
      
      const logs: string[] = [];
      if (susReduce > 0) {
        logs.push('你选择了沉默。你暂时消失在了领袖的视线中。');
      } else {
        logs.push('你选择了沉默。但你已经被盯上了——沉默救不了你。');
      }
      logs.push('你的存在感在降低。权力-1，忠诚-1。');
      
      return {
        playerChanges: {
          suspicion: Math.max(0, state.player.suspicion - susReduce),
          power: Math.max(0, state.player.power - powReduce),
          loyalty: Math.max(0, state.player.loyalty - loyReduce),
        },
        logs,
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
      // 自白降低怀疑但也降低权力和人性
      return {
        playerChanges: {
          suspicion: Math.max(0, state.player.suspicion - 2),
          power: Math.max(0, state.player.power - 2),
          humanity: Math.max(0, state.player.humanity - 1),
        },
        logs: [
          '你写了一份自我批评报告。怀疑-2，权力-2，人性-1。',
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
  if (target.fear >= 7) return false;
  if (target.fear <= 4 && target.favorability >= 2) return true;
  if (target.fear <= 4 && target.favorability >= 0) return Math.random() < 0.45;
  if (target.fear <= 6 && target.favorability >= 3) return Math.random() < 0.35;
  return false;
}

// ==================== 领袖提问逻辑 ====================

export function generateQuestion(state: GameState): LeaderQuestion {
  const realMood = state.leaderMood.isFake ? state.leaderMood.realMood! : state.leaderMood.type;
  
  // === 领袖点名质问机制：根据玩家行为+心情生成针对性提问 ===
  
  // 如果玩家怀疑高，领袖会直接质问
  if (state.player.suspicion >= 4) {
    return {
      id: 'q_direct_suspicion',
      text: `"${state.day > 10 ? '同志' : '年轻人'}，有人说你最近……行为异常。你怎么解释？"`,
      options: [
        {
          id: 'q_ds_confess',
          text: '"我承认工作中有不足。请领袖给我改正的机会。"',
          riskHint: '示弱可能有用——也可能让你成为更容易的猎物',
          effects: (gs: GameState) => {
            const rm = gs.leaderMood.isFake ? gs.leaderMood.realMood! : gs.leaderMood.type;
            if (rm === 'nostalgic' || rm === 'generous') return { loyalty: 1, suspicion: -2, power: -1, humanity: 0, description: '领袖叹了口气。"知错能改。"怀疑-2，忠诚+1，权力-1。' };
            if (rm === 'furious') return { loyalty: 0, suspicion: 1, power: -2, humanity: 0, description: '"不足？"领袖拍了桌子。"是罪过！"权力-2，怀疑+1。' };
            return { loyalty: 0, suspicion: -1, power: -1, humanity: 0, description: '领袖没有立刻回答。这比回答更可怕。怀疑-1，权力-1。' };
          },
        },
        {
          id: 'q_ds_deflect',
          text: '"也许是有人在故意散播谣言。我建议彻查。"',
          riskHint: '反咬一口？要看领袖信不信',
          effects: (gs: GameState) => {
            const rm = gs.leaderMood.isFake ? gs.leaderMood.realMood! : gs.leaderMood.type;
            if (rm === 'paranoid') return { loyalty: 1, suspicion: -1, power: 1, humanity: -1, description: '领袖点头。"查！都查！"你暂时脱身了。怀疑-1，权力+1，人性-1。' };
            if (rm === 'suspicious') return { loyalty: 0, suspicion: 2, power: 0, humanity: 0, description: '"谣言？还是事实？"领袖的目光像刀。怀疑+2。' };
            return { loyalty: 0, suspicion: 0, power: 0, humanity: -1, description: '领袖没有表态。这意味着一切皆有可能。人性-1。' };
          },
        },
        {
          id: 'q_ds_loyal',
          text: '"我的每一天都献给了卡拉维亚。这就是我的回答。"',
          riskHint: '激情宣言。但空洞的激情最危险',
          effects: (gs: GameState) => {
            const rm = gs.leaderMood.isFake ? gs.leaderMood.realMood! : gs.leaderMood.type;
            if (rm === 'pleased') return { loyalty: 2, suspicion: -1, power: 0, humanity: 0, description: '领袖微笑了。"很好。继续。"忠诚+2，怀疑-1。' };
            if (rm === 'furious' || rm === 'suspicious') return { loyalty: 0, suspicion: 2, power: 0, humanity: 0, description: '"每个叛徒都这么说。"怀疑+2。' };
            return { loyalty: 1, suspicion: 0, power: 0, humanity: 0, description: '领袖点了点头，但没有微笑。忠诚+1。' };
          },
        },
        {
          id: 'q_ds_silence',
          text: '低下头，沉默。',
          riskHint: '沉默是认罪还是尊重？取决于领袖的心情',
          effects: (gs: GameState) => {
            const rm = gs.leaderMood.isFake ? gs.leaderMood.realMood! : gs.leaderMood.type;
            if (rm === 'nostalgic') return { loyalty: 0, suspicion: -1, power: 0, humanity: 0, description: '领袖看了你很久，然后看向了窗外。怀疑-1。' };
            if (rm === 'furious') return { loyalty: -1, suspicion: 3, power: 0, humanity: 0, description: '"你不说话？！"椅子倒了。忠诚-1，怀疑+3。' };
            return { loyalty: -1, suspicion: 1, power: -1, humanity: 0, description: '沉默被解读为心虚。忠诚-1，怀疑+1，权力-1。' };
          },
        },
      ],
    };
  }
  
  // 如果最近有人被清洗，领袖会借题发挥
  if (state.purgedOfficials.length > 0 && Math.random() < 0.5) {
    const lastPurgedId = state.purgedOfficials[state.purgedOfficials.length - 1];
    const lastPurged = state.officials.find(o => o.id === lastPurgedId);
    const purgedName = lastPurged?.name || '那个叛徒';
    
    return {
      id: 'q_after_purge',
      text: `"${purgedName}被清洗了。你和他……关系如何？"`,
      options: [
        {
          id: 'q_ap_deny',
          text: '"我和此人没有任何私交。"',
          riskHint: '如果领袖知道你在撒谎呢？',
          effects: (gs: GameState) => {
            const rm = gs.leaderMood.isFake ? gs.leaderMood.realMood! : gs.leaderMood.type;
            const wasAlly = lastPurged?.isAlly;
            if (wasAlly) return { loyalty: 0, suspicion: 3, power: 0, humanity: -1, description: '领袖掏出了一份文件。"这不是你签名的联名信吗？"你的谎言被戳穿了。怀疑+3，人性-1。' };
            if (rm === 'suspicious') return { loyalty: 0, suspicion: 1, power: 0, humanity: 0, description: '"没有私交。"领袖重复了一遍你的话。语气不像是在确认。怀疑+1。' };
            return { loyalty: 0, suspicion: 0, power: 0, humanity: 0, description: '领袖似乎接受了你的回答。暂时的。' };
          },
        },
        {
          id: 'q_ap_report',
          text: '"我早就觉得他不对劲。可惜没来得及举报。"',
          riskHint: '事后诸葛亮。但领袖可能就吃这一套',
          effects: (gs: GameState) => {
            const rm = gs.leaderMood.isFake ? gs.leaderMood.realMood! : gs.leaderMood.type;
            if (rm === 'paranoid' || rm === 'furious') return { loyalty: 1, suspicion: -1, power: 1, humanity: -2, description: '"很好，以后要更积极地举报。"忠诚+1，怀疑-1，权力+1。但你知道自己在说谎。人性-2。' };
            return { loyalty: 0, suspicion: 1, power: 0, humanity: -1, description: '"没来得及？还是不想？"怀疑+1，人性-1。' };
          },
        },
        {
          id: 'q_ap_honest',
          text: '"我们是同事。仅此而已。"',
          riskHint: '诚实是奢侈品。但偶尔有用',
          effects: (gs: GameState) => {
            const rm = gs.leaderMood.isFake ? gs.leaderMood.realMood! : gs.leaderMood.type;
            if (rm === 'nostalgic') return { loyalty: 1, suspicion: 0, power: 0, humanity: 0, description: '领袖沉默了一会儿。"同事……是啊。"忠诚+1。' };
            return { loyalty: 0, suspicion: 0, power: 0, humanity: 0, description: '领袖的表情没有变化。不确定这算好事还是坏事。' };
          },
        },
      ],
    };
  }
  
  // 普通提问（从模板池中选取）
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
    default: {
      // 中立回答也有风险：领袖可能认为你在敷衍
      const roll = Math.random();
      if (roll < 0.3) return { loyalty: -1, suspicion: 1, power: 0, humanity: 0, description: '领袖皱了皱眉。你的回答太平庸了。忠诚-1，怀疑+1。' };
      if (roll < 0.6) return { loyalty: 0, suspicion: 0, power: -1, humanity: 0, description: '领袖已经看向了别人。你的存在感降低了。权力-1。' };
      return { loyalty: 0, suspicion: 0, power: 0, humanity: 0, description: '领袖没什么反应。这在卡拉维亚算是好事。' };
    }
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
    // 高野心：45%暗中增加某人怀疑（更具威胁）
    if (official.ambition > 5 && Math.random() < 0.45) {
      // 50%概率针对玩家
      if (Math.random() < 0.5) {
        const susInc = state.day <= 5 ? 1 : 2; // 后期AI攻击更狠
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
    
    // 敌意官员：主动针对玩家
    if (official.attitude === 'hostile' && Math.random() < 0.4) {
      const susInc = 1;
      playerChanges = {
        ...playerChanges,
        suspicion: (playerChanges.suspicion ?? state.player.suspicion) + susInc,
      };
      logs.push(`${official.name}似乎在背后做了什么对你不利的事。`);
    }
    
    // 盟友效果：每轮只有30%概率降低怀疑（削弱）
    if (official.isAlly) {
      const currentSus = playerChanges.suspicion ?? state.player.suspicion;
      if (Math.random() < 0.3) {
        playerChanges = { ...playerChanges, suspicion: Math.max(0, currentSus - 1) };
      }
      // 盟友也可能被吓到而消极（恐惧高时不再帮忙）
      if (official.fear >= 6 && Math.random() < 0.3) {
        logs.push(`${official.name}最近似乎在刻意疏远你。恐惧让盟约变得脆弱。`);
      }
    }
    
    // 高野心+高权力：构陷竞争者
    if (official.ambition > 7 && official.power > 4) {
      const rivals = alive.filter(o => o.id !== official.id && o.power > official.power);
      if (rivals.length > 0 && Math.random() < 0.3) {
        const rival = getRandomItem(rivals);
        changes.push({ id: rival.id, changes: { suspicion: rival.suspicion + 1 } });
      }
    }
    
    // 每天所有官员恐惧自然上升（越到后期越恐惧）
    if (state.day > 5) {
      const fearInc = Math.random() < 0.3 ? 1 : 0;
      if (fearInc > 0) {
        changes.push({ id: official.id, changes: { fear: Math.min(10, official.fear + fearInc) } });
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
    loyalty: number;
  }
  
  const candidates: PurgeCandidate[] = [];
  
  if (state.player.suspicion >= state.purgeThreshold) {
    candidates.push({ id: 'player', suspicion: state.player.suspicion, isPlayer: true, loyalty: state.player.loyalty });
  }
  
  for (const o of state.officials.filter(o => o.isAlive)) {
    if (o.suspicion >= state.purgeThreshold) {
      candidates.push({ id: o.id, suspicion: o.suspicion, isPlayer: false, loyalty: o.loyalty });
    }
  }
  
  // === 忠诚度机制 ===
  // 忠诚<4时，清洗阈值等效降低（忠诚越低越危险）
  const loyaltyPenalty = state.player.loyalty < 4 ? (4 - state.player.loyalty) : 0; // 忠诚0→降4, 忠诚1→降3, 忠诚2→降2, 忠诚3→降1
  const effectivePlayerThreshold = state.purgeThreshold - loyaltyPenalty;
  
  if (state.player.suspicion >= effectivePlayerThreshold && !candidates.find(c => c.isPlayer)) {
    candidates.push({ id: 'player', suspicion: state.player.suspicion, isPlayer: true, loyalty: state.player.loyalty });
    if (loyaltyPenalty > 0) {
      logs.push(`你的忠诚度只有${state.player.loyalty}。领袖对不忠者的容忍度更低（阈值-${loyaltyPenalty}）。`);
    }
  }
  for (const o of state.officials.filter(o => o.isAlive)) {
    const oLoyaltyPenalty = o.loyalty < 4 ? (4 - o.loyalty) : 0;
    const oEffectiveThreshold = state.purgeThreshold - oLoyaltyPenalty;
    if (o.suspicion >= oEffectiveThreshold && !candidates.find(c => c.id === o.id)) {
      candidates.push({ id: o.id, suspicion: o.suspicion, isPlayer: false, loyalty: o.loyalty });
    }
  }
  
  // 排序，怀疑最高的先处理
  candidates.sort((a, b) => b.suspicion - a.suspicion);
  
  // 暴怒时必须清洗至少一人（包括玩家在候选池中）
  if (realMood === 'furious' && candidates.length === 0) {
    const alive = state.officials.filter(o => o.isAlive);
    const allCandidates = [
      { id: 'player', suspicion: state.player.suspicion, isPlayer: true, loyalty: state.player.loyalty },
      ...alive.map(o => ({ id: o.id, suspicion: o.suspicion, isPlayer: false, loyalty: o.loyalty })),
    ];
    // 按怀疑排序，最高的成为目标
    allCandidates.sort((a, b) => b.suspicion - a.suspicion);
    if (allCandidates.length > 0) {
      candidates.push(allCandidates[0]);
      logs.push('领袖的暴怒需要一个出口。有人必须消失。');
    }
  }
  
  // 偏执时，随机抽一个人进入候选（10%概率波及玩家）
  if (realMood === 'paranoid' && Math.random() < 0.25) {
    const alive = state.officials.filter(o => o.isAlive);
    if (Math.random() < 0.1 && !candidates.find(c => c.isPlayer)) {
      candidates.push({ id: 'player', suspicion: state.player.suspicion, isPlayer: true, loyalty: state.player.loyalty });
      logs.push('领袖的目光突然锁定了你。偏执是不讲逻辑的。');
    } else if (alive.length > 0) {
      const random = getRandomItem(alive);
      if (!candidates.find(c => c.id === random.id)) {
        candidates.push({ id: random.id, suspicion: random.suspicion, isPlayer: false, loyalty: random.loyalty });
      }
    }
  }
  
  for (const c of candidates) {
    if (c.isPlayer) {
      // === 权力机制：高权力有几率自保 ===
      let powerSaved = false;
      if (state.player.power >= 7) {
        const powerSaveChance = (state.player.power - 6) * 0.08; // power 7→8%, 8→16%, 10→32%
        if (Math.random() < powerSaveChance) {
          powerSaved = true;
          logs.push(`你的权力网络发挥了作用。有人替你挡了这一刀。怀疑-1，权力-2。`);
        }
      }
      
      // 检查盟友保护（盟友恐惧高时保护概率大幅降低）
      const allies = state.officials.filter(o => o.isAlly && o.isAlive);
      let protected_ = powerSaved;
      
      if (!protected_) {
        for (const ally of allies) {
          const protectChance = ally.fear >= 8 ? 0.05 : ally.fear >= 6 ? 0.1 : 0.2;
          if (Math.random() < protectChance) {
            protected_ = true;
            logs.push(`${ally.name}在领袖面前为你说了话。你暂时安全了。怀疑-2。`);
            break;
          }
        }
      }
      
      // === 人性机制：人性为0时，盟友不会保护你 ===
      if (state.player.humanity <= 0 && protected_ && !powerSaved) {
        protected_ = false;
        logs.push('你的盟友在最后一刻犹豫了。你已经不是他们认识的那个人了。人性为0，盟友拒绝保护。');
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
  if (type === 'silence') {
    if (consecutive.silence >= 1) {
      return {
        warning: '领袖注意到你最近一言不发。"沉默是一种态度。"怀疑+2。',
        penalty: { suspicion: 2 },
      };
    }
  }
  
  if (type === 'praise') {
    if (consecutive.praise >= 2) {
      return {
        warning: '你的颂扬太频繁了。领袖开始觉得你在刻意讨好。怀疑+1。',
        penalty: { suspicion: 1 },
      };
    }
  }
  
  if (type === 'report') {
    if (consecutive.report >= 1) {
      return {
        warning: '有人觉得你举报得太频繁了。人性-2，你自己的怀疑也在上升。',
        penalty: { humanity: -2, suspicion: 1 },
      };
    }
  }
  
  return {};
}

// ==================== 新一天 ====================

export function startNewDay(state: GameState): Partial<GameState> {
  const newDay = state.day + 1;
  const act = newDay <= 5 ? 1 : newDay <= 10 ? 2 : newDay <= 15 ? 3 : 4;
  // 阈值下降更快：5 → 4.6 → ... → 最低1.5
  const newThreshold = Math.max(1.5, 5 - (newDay - 1) * 0.25);
  
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
  let updatedPlayer: Partial<Player> = {};
  
  if (realMood === 'suspicious') {
    playerSusChange = 1;
    officialUpdates = state.officials.filter(o => o.isAlive).map(o => ({
      id: o.id,
      changes: { suspicion: o.suspicion + 1 },
    }));
  }
  
  // === 权力机制：低权力时每天怀疑更容易上涨（边缘化） ===
  // === 高权力时有存在感，怀疑上涨概率低 ===
  if (newDay > 3) {
    let naturalSusChance: number;
    if (state.player.power <= 2) naturalSusChance = 0.7; // 低权力：边缘人物，容易被盯上
    else if (state.player.power <= 4) naturalSusChance = 0.5;
    else if (state.player.power <= 6) naturalSusChance = 0.3;
    else naturalSusChance = 0.15; // 高权力：有庇护网
    const naturalSusRise = Math.random() < naturalSusChance ? 1 : 0;
    playerSusChange += naturalSusRise;
  }
  
  // === 人性机制：人性低时，忠诚缓慢流失（你已经不像人了，领袖也注意到了）===
  if (state.player.humanity <= 2) {
    const loyaltyDrain = state.player.humanity === 0 ? 2 : 1;
    // 在返回值中处理
    updatedPlayer = {
      ...updatedPlayer,
      loyalty: Math.max(0, (updatedPlayer.loyalty ?? state.player.loyalty) - loyaltyDrain),
    };
  }
  
  // === 忠诚机制：高忠诚在怀旧/慷慨心情时有保护效果 ===
  if ((realMood === 'nostalgic' || realMood === 'generous') && state.player.loyalty >= 7) {
    playerSusChange = Math.max(0, playerSusChange - 1);
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
  
  // 合并最终玩家状态

  return {
    day: newDay,
    act: act as 1 | 2 | 3 | 4,
    phase: 'morning_briefing',
    leaderMood: mood,
    clues,
    hand,
    actionsRemaining: realMood === 'paranoid' ? 3 : 2,
    purgeThreshold: newThreshold,
    officials: updatedOfficials,
    delayedActions: updatedDelayed,
    player: {
      ...state.player,
      ...updatedPlayer,
      suspicion: state.player.suspicion + playerSusChange,
      loyalty: Math.max(0, (updatedPlayer.loyalty ?? state.player.loyalty)),
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

export function checkVictory(state: GameState): 'leader' | 'survivor' | 'last_standing' | 'hollow' | null {
  const aliveOfficials = state.officials.filter(o => o.isAlive);
  
  // 所有官员被清洗
  if (aliveOfficials.length === 0) return 'last_standing';
  
  // === 人性机制：人性为0时触发隐藏结局 ===
  if (state.player.humanity <= 0 && state.day >= 10) return 'hollow';
  
  // 第15天后
  if (state.day >= 15) {
    // leader结局：高权力+高忠诚
    if (state.player.power >= 10 && state.player.loyalty >= 6) return 'leader';
    // survivor结局
    return 'survivor';
  }
  
  return null;
}

// ==================== NPC对话生成 ====================

export function generateNpcDialogue(state: GameState): NpcDialogue | null {
  const alive = state.officials.filter(o => o.isAlive);
  if (alive.length === 0) return null;
  
  // 每次打牌后有40%概率触发NPC对话（后期更高）
  const chance = state.day <= 5 ? 0.35 : state.day <= 10 ? 0.45 : 0.55;
  if (Math.random() > chance) return null;
  
  // 选一个NPC
  const official = getRandomItem(alive);
  
  // 确定关系类型
  let relation: 'hostile' | 'friendly' | 'ally' | 'neutral';
  if (official.isAlly) relation = 'ally';
  else if (official.favorability <= -2) relation = 'hostile';
  else if (official.favorability >= 2) relation = 'friendly';
  else relation = 'neutral';
  
  // 筛选可用模板
  const templates = NPC_DIALOGUE_TEMPLATES.filter(t => {
    // 关系匹配
    if (t.condition !== 'any' && t.condition !== relation) return false;
    // 特质匹配
    if (t.traits && t.traits.length > 0 && !t.traits.includes(official.trait)) return false;
    return true;
  });
  
  if (templates.length === 0) return null;
  
  const template = getRandomItem(templates);
  let line = getRandomItem(template.lines);
  
  // 替换占位符
  line = line.replace(/\{name\}/g, official.name);
  // {name2}：随机选另一个存活的NPC
  const others = alive.filter(o => o.id !== official.id);
  const other = others.length > 0 ? getRandomItem(others) : official;
  line = line.replace(/\{name2\}/g, other.name);
  
  return {
    id: genId('npc_dlg'),
    officialId: official.id,
    officialName: official.name,
    officialIcon: official.icon,
    text: line,
    options: template.options.map((opt, i) => ({
      id: `npc_opt_${i}`,
      text: opt.text,
      hint: opt.hint,
      effects: { ...opt.effects },
    })),
  };
}
