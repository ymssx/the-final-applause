// ============================================
// 📜 文案与数据 — 所有辛辣+黑暗+讽刺的文本
// ============================================

import type { CardType, LeaderMood, Official, OfficialTrait } from './types';

// ==================== 卡牌定义 ====================
export const CARD_DEFINITIONS: Record<CardType, {
  icon: string;
  name: string;
  description: string;
  needsTarget: boolean;
  flavorTexts: string[];
}> = {
  praise: {
    icon: '🎖',
    name: '颂扬',
    description: '向领袖表忠心。愉悦时效果最佳，多疑/暴怒时反而危险。',
    needsTarget: false,
    flavorTexts: [
      '"您的智慧如同太阳，而我们不过是被晒干的虫子。"',
      '"没有您，卡拉维亚将回到石器时代——虽然现在也差不多。"',
      '"领袖万岁！"你说出口时，自己都信了三秒。',
      '"您是历史的舵手。"至于船往哪开，谁在乎呢。',
    ]
  },
  report: {
    icon: '📋',
    name: '举报',
    description: '匿名举报一名官员。几天后目标怀疑大幅上升。但会侵蚀你的灵魂。',
    needsTarget: true,
    flavorTexts: [
      '你在纸条上写下一个名字。手没有抖。这才是最可怕的。',
      '"为了国家安全。"你在心里默念，好像这话说多了就会成真。',
      '墨水未干，你已经开始后悔——但只后悔了零点五秒。',
      '又一份匿名信。秘密警察的碎纸机最近应该换新的了。',
    ]
  },
  alliance: {
    icon: '🤝',
    name: '结盟',
    description: '尝试拉拢目标。盟友能救你的命，但恋惧者会拒绝。',
    needsTarget: true,
    flavorTexts: [
      '"我们是朋友。"在这个国家，这句话比情书更危险。',
      '你们在走廊交换了一个眼神。在卡拉维亚，这算订婚了。',
      '"互相照应。"翻译：互相当人质。',
      '握手时你数了一下——他手心的汗比你还多。',
    ]
  },
  gift: {
    icon: '🎁',
    name: '送礼',
    description: '讨好目标。好感+2，恐惧-1，你的权力-1。',
    needsTarget: true,
    flavorTexts: [
      '一瓶伏特加能买到三天的安全。划算。',
      '"这是家乡的特产。"其实是黑市淘的，但谁在乎呢。',
      '他接过礼物时的微笑，像极了猎人看到上钩的鱼。',
      '人情债是卡拉维亚唯一不会通胀的货币。',
    ]
  },
  silence: {
    icon: '🤐',
    name: '沉默',
    description: '隐入人群。低怀疑时有用，但存在感和忠诚会下降。',
    needsTarget: false,
    flavorTexts: [
      '沉默是金。在卡拉维亚，沉默是活命的最低消费。',
      '你假装在翻文件。其实文件是空的，就像这个国家的仓库。',
      '不说话是一门艺术。在这里，它还是一门生存技能。',
      '"我没有意见。"——历史上活得最久的官员的遗言。',
    ]
  },
  deflect: {
    icon: '↩️',
    name: '转移',
    description: '把怀疑转嫁给目标。目标怀疑+2，你怀疑-2。25%被识破。',
    needsTarget: true,
    flavorTexts: [
      '"说到工作失误，我倒是想起某人最近……"刀子从不正面捅。',
      '你轻描淡写地提了一句。子弹不需要大，够穿心就行。',
      '政治就是音乐椅。曲子停了，确保没座的不是你。',
      '"我不是在指控谁，只是在陈述客观事实。"——经典开场白。',
    ]
  },
  intel: {
    icon: '🔍',
    name: '情报',
    description: '查看目标的真实数据。知己知彼，才能活下去。',
    needsTarget: true,
    flavorTexts: [
      '知识就是力量。在这里，知识就是活过今晚。',
      '你翻开了一份不该看的档案。但"不该"在这里只是个建议。',
      '数字不会说谎。人会，但数字不会——大概吧。',
      '偷看别人的底牌，是这个游戏里最体面的犯罪。',
    ]
  },
  confess: {
    icon: '📝',
    name: '自白',
    description: '主动认错。大幅降低怀疑，但牺牲权力和尊严。',
    needsTarget: false,
    flavorTexts: [
      '"我承认我的思想还不够纯洁。"你含泪朗读自己编的罪状。',
      '自我批评是卡拉维亚最受欢迎的文学体裁。',
      '跪下来比较安全。这是所有活人总结出的经验。',
      '"我错了。"你说得如此真诚，连自己都感动了。',
    ]
  },
};

// ==================== 官员初始数据 ====================
export const INITIAL_OFFICIALS: Omit<Official, 'attitude'>[] = [
  {
    id: 'komalov',
    name: '科马洛夫',
    title: '工业部长',
    icon: '🏭',
    trait: 'ambitious',
    traitName: '野心家',
    loyalty: 5,
    power: 6,
    suspicion: 2,
    fear: 3,
    ambition: 9,
    favorability: -1,
    isAlly: false,
    isAlive: true,
    description: '眼神像饿狼盯着最后一块肉。他的工厂报告永远超额完成——纸上的。',
  },
  {
    id: 'voronov',
    name: '沃罗诺夫',
    title: '秘密警察长',
    icon: '🕵️',
    trait: 'paranoid_trait',
    traitName: '偏执狂',
    loyalty: 4,
    power: 7,
    suspicion: 3,
    fear: 7,
    ambition: 6,
    favorability: -2,
    isAlly: false,
    isAlive: true,
    description: '他知道每个人的秘密，包括他自己的——这让他比任何人都害怕。',
  },
  {
    id: 'yelena',
    name: '叶莲娜',
    title: '文化部长',
    icon: '🎭',
    trait: 'cunning',
    traitName: '狡猾者',
    loyalty: 5,
    power: 4,
    suspicion: 1,
    fear: 4,
    ambition: 7,
    favorability: -1,
    isAlly: false,
    isAlive: true,
    description: '她的笑容是卡拉维亚最精密的武器。没有人知道面具下面还有几层面具。',
  },
  {
    id: 'pavlov',
    name: '巴甫洛夫',
    title: '军事委员',
    icon: '⭐',
    trait: 'loyal',
    traitName: '忠犬',
    loyalty: 8,
    power: 5,
    suspicion: 1,
    fear: 2,
    ambition: 3,
    favorability: 0,
    isAlly: false,
    isAlive: true,
    description: '他真心相信领袖。在一个人人演戏的世界里，这种真诚反而成了最好的伪装。',
  },
  {
    id: 'molokin',
    name: '莫洛金',
    title: '农业部长',
    icon: '🌾',
    trait: 'coward',
    traitName: '胆小鬼',
    loyalty: 4,
    power: 2,
    suspicion: 2,
    fear: 9,
    ambition: 1,
    favorability: 2,
    isAlly: false,
    isAlive: true,
    description: '他的签名在发抖。他的报告在发抖。他整个人都在发抖。但他还活着，这说明发抖有用。',
  },
];

// ==================== 领袖心情 ====================
export const MOOD_DEFINITIONS: Record<LeaderMood, {
  icon: string;
  name: string;
  description: string;
  flavorText: string;
}> = {
  suspicious: {
    icon: '🔴',
    name: '多疑',
    description: '所有人怀疑+1',
    flavorText: '领袖的目光像X光，扫过每个人的脊梁骨。今天最好别呼吸太大声。',
  },
  pleased: {
    icon: '🟢',
    name: '愉悦',
    description: '颂扬效果翻倍',
    flavorText: '领袖今天微笑了。整个政治局都松了口气——但没人敢先停下鼓掌。',
  },
  paranoid: {
    icon: '⚫',
    name: '偏执',
    description: '举报不消耗行动次数',
    flavorText: '领袖看了三遍门锁，换了两次保镖。今天是告密者的黄金时段。',
  },
  nostalgic: {
    icon: '🟤',
    name: '怀旧',
    description: '忠诚在清洗中权重提高',
    flavorText: '领袖在看旧照片。那些照片里的人，一半已经不存在了。',
  },
  furious: {
    icon: '🔴',
    name: '暴怒',
    description: '今天必有人被清洗',
    flavorText: '领袖砸了一个花瓶。秘书说是"不小心"。所有人都在算自己的生存概率。',
  },
  generous: {
    icon: '🟢',
    name: '慷慨',
    description: '权力最高者+2',
    flavorText: '领袖在发勋章。在卡拉维亚，勋章和墓碑往往只差一个星期。',
  },
};

// ==================== 会议桌线索模板 ====================
export const CLUE_TEMPLATES = {
  behavior: [
    { text: '{name}今天迟到了。', hint: '怀疑值偏高' },
    { text: '{name}主动坐到了领袖身边。', hint: '争宠中' },
    { text: '{name}看起来脸色很差。', hint: '恐惧上升' },
    { text: '{name}午饭时一个人坐在角落。', hint: '被孤立' },
    { text: '{name}和{name2}在走廊低声交谈。', hint: '可能结盟' },
    { text: '{name}今天穿了一身新衣服。', hint: '试图引起注意' },
    { text: '{name}在会议上频繁看表。', hint: '心不在焉，可能有计划' },
    { text: '{name}向领袖敬了三次酒。', hint: '在表忠心' },
    { text: '{name}的办公室灯昨晚亮到很晚。', hint: '可能在销毁文件' },
    { text: '{name}看你的眼神变了。', hint: '关系恶化' },
    { text: '{name}今天话特别多。心虚的人才话多。', hint: '掩盖什么' },
    { text: '{name}把手伸进口袋里——然后又放下了。', hint: '紧张不安' },
    { text: '{name}在文件上签字时停顿了很久。', hint: '心理挣扎' },
    { text: '{name}在走廊看到你，突然转身走了另一条路。', hint: '在回避你' },
  ],
  system: [
    { text: '昨天有人提交了一份匿名报告。', hint: '延迟炸弹进行中' },
    { text: '秘密警察部门今天加班了。', hint: '有人快到清洗线' },
    { text: '领袖办公室的灯亮到了凌晨。', hint: '清洗概率提高' },
    { text: '档案室调取了某人的历史记录。', hint: '有人正在被调查' },
    { text: '今天的报纸头版换了三次。有人的名字被删了。', hint: '有人即将消失' },
    { text: '食堂今天多了一个空位。但没人记得那里坐过谁。', hint: '有人已被清洗' },
    { text: '秘密警察换了新的打字机色带。工作量在增加。', hint: '更多人被调查' },
    { text: '走廊里多了一幅领袖画像。旧的那幅里有人被涂掉了。', hint: '历史正在被改写' },
  ],
  misleading: [
    { text: '有传言说{name}要被提拔。', hint: '可能是假消息' },
    { text: '据说{name}最近和领袖走得很近。', hint: '未必属实' },
    { text: '有人看到{name}进了领袖的书房。', hint: '也许只是巧合' },
    { text: '食堂里有人说{name}的好话。在这里，好话往往是催命符。', hint: '信息存疑' },
  ],
};

// ==================== 领袖提问库 ====================
export const LEADER_QUESTIONS = [
  {
    id: 'q_steel',
    text: '"我们的钢铁产量今年如何？"',
    options: [
      {
        id: 'q_steel_a',
        text: '"超额完成，全赖领袖英明！"',
        riskHint: '可能被怀疑造假',
        effectLogic: 'if_suspicious_bad',
      },
      {
        id: 'q_steel_b',
        text: '"勉强达标，仍需努力。"',
        riskHint: '可能被视为消极',
        effectLogic: 'safe_if_recent_purge',
      },
      {
        id: 'q_steel_c',
        text: '"根据真实数据，略有不足。"',
        riskHint: '可能被认为动摇信心',
        effectLogic: 'if_nostalgic_good',
      },
      {
        id: 'q_steel_d',
        text: '"在您的远见指导下，前景光明。"',
        riskHint: '可能被认为敷衍',
        effectLogic: 'neutral',
      },
    ],
  },
  {
    id: 'q_enemy',
    text: '"你认为，我们的内部敌人藏在哪里？"',
    options: [
      {
        id: 'q_enemy_a',
        text: '"无处不在！我们必须加强警惕！"',
        riskHint: '可能显得过于激进',
        effectLogic: 'if_paranoid_good',
      },
      {
        id: 'q_enemy_b',
        text: '"我相信在您的领导下，敌人无处遁形。"',
        riskHint: '可能被认为回避问题',
        effectLogic: 'if_suspicious_bad',
      },
      {
        id: 'q_enemy_c',
        text: '"也许我们应该先审视自己。"',
        riskHint: '可能被认为在暗示什么',
        effectLogic: 'if_nostalgic_good',
      },
      {
        id: 'q_enemy_d',
        text: '沉默不语。',
        riskHint: '沉默可能被解读为任何意思',
        effectLogic: 'neutral',
      },
    ],
  },
  {
    id: 'q_loyalty',
    text: '"忠诚意味着什么？"',
    options: [
      {
        id: 'q_loyalty_a',
        text: '"忠诚意味着绝对服从。"',
        riskHint: '太标准的答案反而可疑',
        effectLogic: 'if_pleased_good',
      },
      {
        id: 'q_loyalty_b',
        text: '"忠诚意味着愿意为国家牺牲一切。"',
        riskHint: '听起来像是在暗示什么',
        effectLogic: 'if_furious_risky',
      },
      {
        id: 'q_loyalty_c',
        text: '"忠诚是每天的选择，不是一次性的誓言。"',
        riskHint: '可能被认为在给自己留退路',
        effectLogic: 'if_nostalgic_good',
      },
      {
        id: 'q_loyalty_d',
        text: '"您定义的就是忠诚。"',
        riskHint: '阿谀还是真心？',
        effectLogic: 'if_suspicious_bad',
      },
    ],
  },
  {
    id: 'q_report',
    text: '"有人说你的部门存在浪费。你怎么看？"',
    options: [
      {
        id: 'q_report_a',
        text: '"污蔑！这是敌人的阴谋！"',
        riskHint: '激烈的反应可能适得其反',
        effectLogic: 'if_paranoid_good',
      },
      {
        id: 'q_report_b',
        text: '"我会立即展开自查，向您汇报。"',
        riskHint: '主动认错可能有效',
        effectLogic: 'safe_if_recent_purge',
      },
      {
        id: 'q_report_c',
        text: '"每个部门都有改进空间。我会做得更好。"',
        riskHint: '模糊的回答可能不讨喜',
        effectLogic: 'neutral',
      },
      {
        id: 'q_report_d',
        text: '"也许该看看谁在散播这种流言。"',
        riskHint: '反击可能让情况更复杂',
        effectLogic: 'if_suspicious_bad',
      },
    ],
  },
  {
    id: 'q_future',
    text: '"卡拉维亚的未来会怎样？"',
    options: [
      {
        id: 'q_future_a',
        text: '"在您的领导下，光明无限！"',
        riskHint: '标准答案，标准风险',
        effectLogic: 'if_pleased_good',
      },
      {
        id: 'q_future_b',
        text: '"我们需要继续革命，直到最后一个敌人倒下。"',
        riskHint: '听起来像是在暗示清洗',
        effectLogic: 'if_furious_risky',
      },
      {
        id: 'q_future_c',
        text: '"人民是我们的根基。"',
        riskHint: '提到"人民"在某些语境下很危险',
        effectLogic: 'if_nostalgic_good',
      },
      {
        id: 'q_future_d',
        text: '"这个问题太深刻了，我还在学习中。"',
        riskHint: '谦虚可能被视为无能',
        effectLogic: 'neutral',
      },
    ],
  },
  {
    id: 'q_traitor',
    text: '"如果你发现身边有叛徒，你会怎么做？"',
    options: [
      {
        id: 'q_traitor_a',
        text: '"立刻举报，绝不姑息。"',
        riskHint: '太快了。你是不是早就在盯着某人？',
        effectLogic: 'if_paranoid_good',
      },
      {
        id: 'q_traitor_b',
        text: '"先收集证据，再向组织汇报。"',
        riskHint: '理性的回答。但理性在这里不值钱。',
        effectLogic: 'safe_if_recent_purge',
      },
      {
        id: 'q_traitor_c',
        text: '"我会先问自己：是不是我看错了。"',
        riskHint: '自我怀疑？还是在包庇？',
        effectLogic: 'if_nostalgic_good',
      },
      {
        id: 'q_traitor_d',
        text: '"在卡拉维亚，没有叛徒。只有尚未被发现的叛徒。"',
        riskHint: '高级幽默。但领袖未必有幽默感。',
        effectLogic: 'if_pleased_good',
      },
    ],
  },
  {
    id: 'q_sacrifice',
    text: '"革命需要牺牲。你准备好了吗？"',
    options: [
      {
        id: 'q_sacrifice_a',
        text: '"随时！我的命属于卡拉维亚！"',
        riskHint: '热血沸腾。但领袖可能当真。',
        effectLogic: 'if_furious_risky',
      },
      {
        id: 'q_sacrifice_b',
        text: '"牺牲应该有价值，不该被浪费。"',
        riskHint: '在质疑牺牲的意义？',
        effectLogic: 'if_nostalgic_good',
      },
      {
        id: 'q_sacrifice_c',
        text: '"我已经在每天的工作中牺牲了。"',
        riskHint: '把加班等同于牺牲？胆子不小。',
        effectLogic: 'neutral',
      },
      {
        id: 'q_sacrifice_d',
        text: '"牺牲是荣耀。" 你低下了头。',
        riskHint: '低头是臣服还是在隐藏表情？',
        effectLogic: 'if_pleased_good',
      },
    ],
  },
  {
    id: 'q_trust',
    text: '"你信任坐在你身边的人吗？"',
    options: [
      {
        id: 'q_trust_a',
        text: '"我信任组织选择的每一个人。"',
        riskHint: '嘴上说信任，但你的盟友呢？',
        effectLogic: 'if_pleased_good',
      },
      {
        id: 'q_trust_b',
        text: '你看了看身边的人，然后摇了摇头。',
        riskHint: '公开表示不信任？这很大胆。',
        effectLogic: 'if_paranoid_good',
      },
      {
        id: 'q_trust_c',
        text: '"信任需要时间验证。"',
        riskHint: '外交辞令。领袖讨厌外交辞令。',
        effectLogic: 'neutral',
      },
      {
        id: 'q_trust_d',
        text: '"我只信任您。"',
        riskHint: '过于直白。但也许正是领袖想听的。',
        effectLogic: 'if_suspicious_bad',
      },
    ],
  },
];

// ==================== 突发事件 ====================
export const RANDOM_EVENTS = [
  {
    id: 'evt_anonymous_letter',
    text: '一封匿名信出现在你的办公桌上。',
    flavorText: '"注意你的背后。" 字迹潦草得像是用左手写的——或者用恐惧写的。',
    effect: 'suspicion_warning',
  },
  {
    id: 'evt_parade',
    text: '国庆阅兵彩排。所有人必须参加。',
    flavorText: '士兵们走得很整齐。就像排队去食堂——或者排队去刑场。',
    effect: 'loyalty_check',
  },
  {
    id: 'evt_inspection',
    text: '秘密警察突击检查了你的办公室。',
    flavorText: '他们翻了每个抽屉。你的抽屉是空的。这让他们更怀疑了。',
    effect: 'suspicion_up',
  },
  {
    id: 'evt_blackout',
    text: '全城停电三小时。',
    flavorText: '黑暗中每个人都在做自己的事——写匿名信、烧文件、或者只是单纯地害怕。',
    effect: 'chaos',
  },
  {
    id: 'evt_banquet',
    text: '领袖设宴款待。',
    flavorText: '伏特加是领袖牌的。也就是说，你不能不喝，也不能喝多。两者都是政治错误。',
    effect: 'banquet',
  },
  {
    id: 'evt_photo',
    text: '官方合影。所有在任官员必须出席。',
    flavorText: '你站在第二排。笑容必须恰到好处——太开心显得假，太严肃显得不满。这是卡拉维亚最难的表情管理。',
    effect: 'photo',
  },
  {
    id: 'evt_foreign_visit',
    text: '外国代表团来访。',
    flavorText: '领袖需要展示团结。今天谁都不会被清洗。但欠的债明天还。',
    effect: 'safe_day',
  },
  {
    id: 'evt_newspaper',
    text: '今天的报纸刊登了一篇"来自群众的声音"。',
    flavorText: '作者署名"一个爱国的工人"。所有人都知道是秘密警察写的。但没人说。',
    effect: 'propaganda',
  },
  {
    id: 'evt_rumor',
    text: '一个关于你的谣言在走廊里流传。',
    flavorText: '"据说你昨晚偷偷见了某人。"你确实见了——镜子里的自己，吓了一跳。',
    effect: 'rumor',
  },
  {
    id: 'evt_award',
    text: '领袖决定颁发"人民英雄"勋章。',
    flavorText: '上一个获得这枚勋章的人三个月后就消失了。但拒绝领奖？那你今天就消失。',
    effect: 'award',
  },
];

// ==================== 死亡叙事 ====================
export const DEATH_NARRATIVES = [
  '档案中已无此人。',
  '经调查，此人从未存在。',
  '他一直忠诚。至少档案是这么写的。',
  '因健康原因，永久休假。',
  '已调往西伯利亚特别行政区。不必等他回来。',
  '组织感谢他的贡献。谈话到此结束。',
  '他的名字已从所有照片中移除。',
  '据悉，他主动请求离开。没有人反对。',
  '他的椅子第二天就被搬走了。好像从来没有过。',
  '他的最后一句话是"我是无辜的"。但这里所有人的最后一句话都是这个。',
];

// ==================== 玩家死亡文案 ====================
export const PLAYER_DEATH_TEXTS = [
  '黎明前的敲门声。你早就在等了。',
  '他们甚至没有给你穿外套的时间。外面很冷，但你已经感觉不到了。',
  '档案被封存。你的名字从通讯录上划掉。墨水还是湿的。',
  '你的同事们明天会假装不认识你。不是因为他们冷血。是因为他们也想活。',
  '你终于不用再鼓掌了。',
];

// ==================== 日间过渡文案 ====================
export const DAY_TRANSITION_TEXTS = [
  '新的一天。太阳升起了。在卡拉维亚，这算是好消息。',
  '又活过了一夜。不要高兴太早。',
  '闹钟响了。你还活着。这两件事在卡拉维亚并不总是同时发生。',
  '早安，同志。今天的生存概率尚未计算。',
  '昨晚你做了一个梦：你是自由的。然后你醒了。',
  '清晨的广播在播国歌。你已经第{day}天在数旋律里有多少个"领袖"了。',
  '走廊里的脚步声比昨天少了。你没有数，但你注意到了。',
  '镜子里的你看起来比昨天老了十岁。权力让人苍老。恐惧更是。',
];

// ==================== 开场文案 ====================
export const INTRO_TEXTS = [
  '卡拉维亚共和国。',
  '一个由钢铁、谎言和恐惧铸成的国家。',
  '',
  '你是政治局的一名新晋委员。',
  '你的前任上周还坐在你现在的椅子上。',
  '他的名字已经从所有记录中删除。',
  '',
  '你只有一个目标：活下去。',
  '或者，如果你足够野心——坐上最高的那把椅子。',
  '',
  '但要记住：',
  '在卡拉维亚，掌声最先停下来的人，',
  '就是下一个消失的人。',
  '',
  '游戏开始了。',
  '',
  '鼓掌吧。',
];

// ==================== 胜利文案 ====================
export const VICTORY_TEXTS = {
  leader: [
    '你坐上了那把椅子。',
    '暖气很足。景色很好。卫兵很多。',
    '',
    '你开始注意到——',
    '谁的掌声最先停下来。',
    '',
    '循环开始了。',
  ],
  survivor: [
    '你活了下来。',
    '十五天。在卡拉维亚，这已经是一种成就。',
    '',
    '但你没有爬上去。',
    '你只是没有掉下来。',
    '',
    '你的同事们有的消失了，有的升迁了。',
    '而你——你还在原来的位子上，继续鼓掌。',
    '',
    '直到有一天，掌声停下来。',
  ],
  last_standing: [
    '所有人都消失了。',
    '会议室里只剩你一个人。',
    '',
    '领袖看着你。你看着领袖。',
    '"你是最忠诚的。"他说。',
    '',
    '你不确定这是奖励还是惩罚。',
    '在卡拉维亚，这两者从来没有区别。',
  ],
  hollow: [
    '你还活着。',
    '',
    '但镜子里的那个人——你不认识了。',
    '',
    '你举报了所有能举报的人。',
    '你出卖了每一个信任过你的人。',
    '你的笔下流出了太多匿名信，',
    '以至于你的手已经不会写别的东西了。',
    '',
    '你赢了。',
    '但赢的那个东西，已经不是你了。',
    '',
    '人性归零。你已经和这台机器融为一体。',
    '恭喜，同志。你是最完美的零件。',
  ],
};

// ==================== AI行动提示 ====================
export const AI_ACTION_HINTS = [
  '会议上有人暗示你的工作存在问题。',
  '一份关于你的材料出现在了秘密警察的桌上。',
  '有人在你的背后耳语。你转过头，走廊空空如也。',
  '你的档案被调取了。"例行检查"，他们说。',
  '今天有人坐了你常坐的位子。巧合，大概。',
  '食堂大妈给你的菜比昨天少了。这可能什么都不意味。但也可能意味着一切。',
];

// ==================== 打出卡牌动作台词 ====================
// 打出每种卡牌时，角色会说出一句夸张搞笑的台词
export const PLAY_LINES: Record<CardType, string[]> = {
  praise: [
    '"领袖！您的光芒让我不得不戴墨镜上班！"',
    '"歌颂您的文章我写了八百页！只是最后加上了第九百页。"',
    '"您是太阳！我们是向日葵！虽然已经被晒干了！"',
    '"领袖万岁！"（你鼓掌鼓得手都肿了，但不敢停）',
    '"没有您就没有卡拉维亚！"——这句话你今天说了47遍。',
    '"您的智慧深不可测！"（主要是因为没人敢测）',
    '你深情地朗诵了一首赞美诗。听众们感动得不敢动。',
    '"领袖，您今天比昨天更英明了！"你说这话时眼都不眨。',
    '你起立鼓掌。然后发现其他人早就站起来了。你恨自己慢了0.3秒。',
    '"您就是卡拉维亚的空气！"——少了会死，多了会中毒。',
    '你在颂词里用了37个感叹号。你觉得还不够。',
    '"感谢领袖让我们活着！"周围的人使劲点头，像一群啄米的鸡。',
  ],
  report: [
    '你在厕所隔间里偷偷写完了举报信。手纸是最好的信纸。',
    '"为了国家。"你低声说，然后把纸条塞进了那个大家都假装不知道的信箱。',
    '你用左手写字，以为这样就认不出笔迹。你高估了自己的左手。',
    '举报信写好了。你检查了三遍错别字——这可是要进档案的。',
    '"匿名检举。"你在信封上写道。然后用自己的唾液封了口。DNA？什么是DNA？',
    '你面无表情地投下了举报信。像投一张选票——在卡拉维亚，效果差不多。',
    '你告诉自己这是"正义"。你的右手告诉你它在发抖。',
    '举报信塞进信箱的声音，比你预想的要响。你装作在系鞋带。',
    '"我不是在害人，我是在帮国家。"你在心里排练了这句台词108遍。',
    '你站在秘密信箱前犹豫了0.3秒。在卡拉维亚，这算是道德挣扎了。',
  ],
  alliance: [
    '"咱俩……交个朋友？"你的声音像求婚一样紧张。',
    '你递出了半块面包。在卡拉维亚，这比钻戒更有诚意。',
    '"你我联手，至少能多活三天。"——这是卡拉维亚最浪漫的情话。',
    '你们交换了一个眼神。在这个国家，一个眼神就是一份合同。',
    '"我帮你，你帮我。"翻译：我当你的人质，你当我的人质。',
    '你小心翼翼地靠近他，像在接近一只受惊的猫。一只手里可能有刀的猫。',
    '"信我一次。"你说。他看你的眼神像在看一个推销保险的人。',
    '你伸出了手。在卡拉维亚，这个动作的危险系数仅次于举枪。',
    '"我们是同一条船上的人。"你没说的是：这条船正在沉。',
    '你在他耳边低语了三个字。他的瞳孔先放大，然后缩小了。',
  ],
  gift: [
    '你偷偷塞了一瓶伏特加。他装作没看见。你装作没送。大家都是演员。',
    '"这是家乡特产。"你面不改色地说。其实是黑市三倍价淘来的。',
    '你送出了一条围巾。在这个寒冷的国家，温暖是最好的贿赂。',
    '他接过礼物时说了声"同志太客气了"。你们都知道这不是客气。',
    '"不成敬意。"你说。他的眼睛亮了一下——在卡拉维亚，这就是谢谢。',
    '你把包裹递过去。他拆开时的表情，是你今天见过最接近人类的表情。',
    '一盒进口巧克力。在这个国家，巧克力比黄金更有说服力。',
    '"这是我妻子做的腌黄瓜。"你没有妻子。你也不会腌黄瓜。但他不知道。',
    '你送出了一本书。《领袖语录》精装版。他都有八本了，但还是得收。',
  ],
  silence: [
    '你假装在认真看文件。文件是倒着拿的，但没人注意。',
    '你成功地让自己变成了空气。在卡拉维亚，这是一种超能力。',
    '"我没有意见。"你说完这句话后闭上了嘴，像关上了一扇金库的门。',
    '你低头看着桌面上的木纹。你开始数木纹有几条。数到237的时候会议结束了。',
    '今天你决定当一块石头。石头不会被清洗。大概。',
    '你的存在感降到了负数。旁边的人甚至往你的方向伸了伸腿。',
    '你屏住呼吸。不是因为紧张——是因为你觉得呼吸声太大了。',
    '"……"这是你今天贡献的全部发言。但这已经够多了。',
    '你完美地模仿了一盆植物。一盆没有威胁的、忠诚的、不会说话的植物。',
    '你闭上眼假装在思考。其实你在数会议室的灯泡。13个。和昨天一样。',
  ],
  deflect: [
    '"说到这个问题，我倒是想起某位同志最近的一些表现……"你优雅地递出了刀。',
    '你不动声色地改变了话题的方向。像一个交通警察，把危险引向了别人的车道。',
    '"我不是在指控任何人。"你说。所有人都知道你在指控某人。',
    '你用一种无辜的表情提到了目标的名字。你的无辜程度和一只偷吃的猫差不多。',
    '"也许我们应该关注一下……"你把聚光灯甩到了别人身上，像甩一颗烫手的土豆。',
    '你在会议上"不经意"提到了一件事。你排练这个"不经意"排练了一整晚。',
    '"纯粹是出于关心。"你微笑着说。你的微笑像一把刚磨好的刀。',
    '你巧妙地把矛头引向了目标。如果政治是一门艺术，你刚完成了一幅杰作。',
  ],
  intel: [
    '你翻开了他的档案。这种感觉像偷看别人的日记——只不过日记里写的是生死。',
    '"让我看看你的底牌。"你没说出口，但你的手已经伸向了档案柜。',
    '你假装去借文件，实际上在偷看旁边的那一份。眼角余光是卡拉维亚最重要的器官。',
    '情报到手了。在这个国家，知道别人的秘密，就等于拿着一把上了膛的枪。',
    '"知己知彼。"你翻开档案时引用了这句古话。古人没说的是：知道太多会死。',
    '你用了整整一杯茶的时间，把目标的情报看了三遍。茶凉了，但信息很热。',
    '你偷偷记下了几个数字。在卡拉维亚，正确的数字能救命。错误的数字能杀人。',
    '你查完档案后小心翼翼地放回原处。指纹？你已经提前戴了手套——开玩笑的。',
  ],
  confess: [
    '"我有罪！"你含泪朗诵自己编的罪状。观众们感动得想鼓掌。',
    '你写了一份自我批评。三千字。你觉得不够长，又加了两千字的忏悔。',
    '"我的思想还不够纯洁！"你跪下来。膝盖告诉你：地板很硬。你的尊严告诉你：更硬。',
    '自我批评会上你主动发言。旁边的人松了一口气——不是他们。',
    '"我检讨，我反省，我痛心疾首！"你的表演可以拿奥斯卡。如果卡拉维亚有奥斯卡的话。',
    '你在自白书上签了名。笔迹歪歪扭扭——不是因为紧张，是因为你写到手抽筋了。',
    '"从今天起我要重新做人！"你已经重新做过七次人了。第八次轻车熟路。',
    '你用颤抖的声音承认了所有（编造的）错误。最佳男主角：你。',
  ],
};

// ==================== NPC对话模板 ====================
// NPC根据不同关系和性格对玩家说话，玩家选择回答方式
export interface NpcDialogueTemplate {
  /** 触发条件 */
  condition: 'hostile' | 'friendly' | 'ally' | 'neutral' | 'any';
  /** 可用特质（空则所有） */
  traits?: OfficialTrait[];
  /** NPC台词 */
  lines: string[];
  /** 回答选项 */
  options: {
    text: string;
    hint: string;
    effects: {
      loyalty: number;
      suspicion: number;
      power: number;
      humanity: number;
      favorability: number;
      description: string;
    };
  }[];
}

export const NPC_DIALOGUE_TEMPLATES: NpcDialogueTemplate[] = [
  // === 敌意NPC的挑衅 ===
  {
    condition: 'hostile',
    lines: [
      '"{name}走到你面前，笑容像结了冰的伏特加：\n"同志，最近工作……很辛苦吧？我听到了一些有趣的传闻。"',
      '"{name}拦住了你的去路：\n"你知道吗，有人在领袖面前提起了你的名字。不是好事。"',
      '"{name}靠过来低声说：\n"你以为没人看到？同志，墙壁有耳朵。"',
      '"{name}一边翻文件一边"随口"问道：\n"你上周三下午在哪？有人在问。"',
      '"{name}在走廊"偶遇"你：\n"小心你的朋友。有些朋友比敌人更危险。"',
      '"{name}在会议前凑过来：\n"听说你的部门效率不太好啊？我可以帮你向领袖解释……如果你需要的话。"',
    ],
    options: [
      {
        text: '"传闻？什么传闻？我洗耳恭听。"',
        hint: '装作不知道。但你心跳加速了。',
        effects: { loyalty: 0, suspicion: 0, power: 0, humanity: 0, favorability: 0, description: '你面不改色。他似乎失去了兴趣——暂时的。' },
      },
      {
        text: '"多谢关心。但我建议你管好自己的事。"',
        hint: '强硬回击。要么他退缩，要么他记恨。',
        effects: { loyalty: 0, suspicion: 0, power: 1, humanity: 0, favorability: -2, description: '他的笑容僵了一秒。你获得了一点尊严，但多了一个更深的敌人。权力+1，好感-2。' },
      },
      {
        text: '"我们都是为卡拉维亚服务。不如坐下来喝杯茶？"',
        hint: '试图化解敌意。但示弱也是一种信号。',
        effects: { loyalty: 0, suspicion: 0, power: -1, humanity: 1, favorability: 2, description: '他看了你很久，然后点了点头。也许不是所有的墙都需要用拳头来砸。好感+2，权力-1，人性+1。' },
      },
      {
        text: '假装没听到，走开。',
        hint: '回避是一种策略。也是一种认输。',
        effects: { loyalty: 0, suspicion: 0, power: -1, humanity: 0, favorability: -1, description: '你转身走了。他在你背后笑了。走廊很长，但你走得很快。权力-1，好感-1。' },
      },
    ],
  },
  // === 友好NPC的示好 ===
  {
    condition: 'friendly',
    lines: [
      '"{name}递给你一杯茶：\n"小心，这杯没有毒。——开个玩笑。在卡拉维亚，这种玩笑不太好笑。"',
      '"{name}走到你身边，压低了声音：\n"今天领袖心情不太好。小心说话。这是免费的建议。"',
      '"{name}拍了拍你的肩膀：\n"你看起来像没睡好。在这里，失眠是一种合理的反应。"',
      '"{name}趁没人注意时靠近你：\n"我听说了一件事。也许对你有用——也许对我们都有用。"',
      '"{name}假装看文件，低声说：\n"你的左边第三个人……最近和秘密警察走得很近。注意。"',
      '"{name}在食堂给你递来一块面包：\n"多吃点。活着的人需要力气。"',
    ],
    options: [
      {
        text: '"谢谢。这年头，善意比黄金贵。"',
        hint: '真诚回应。在卡拉维亚，这需要勇气。',
        effects: { loyalty: 0, suspicion: 0, power: 0, humanity: 1, favorability: 2, description: '他微微点头。在这个国家，一句"谢谢"就是最深的交情。好感+2，人性+1。' },
      },
      {
        text: '"我不需要你的消息。我自己看得到。"',
        hint: '保持距离。亲近有时候比疏远更危险。',
        effects: { loyalty: 0, suspicion: 0, power: 1, humanity: -1, favorability: -2, description: '他的笑容消失了。"好吧。各自保重。"权力+1，人性-1，好感-2。' },
      },
      {
        text: '"好。那我也告诉你一件事……"',
        hint: '投桃报李。情报交换是信任的开始。',
        effects: { loyalty: 0, suspicion: 1, power: 0, humanity: 0, favorability: 3, description: '你们交换了一些有用的信息。但交换的过程被角落里的人看到了。好感+3，怀疑+1。' },
      },
      {
        text: '"别在这说。晚点。"',
        hint: '谨慎。但谨慎过头和多疑没区别。',
        effects: { loyalty: 0, suspicion: 0, power: 0, humanity: 0, favorability: 0, description: '他理解地点了点头。你们后来没有再聊。也许明天。如果你们都还在的话。' },
      },
    ],
  },
  // === 盟友NPC的密谈 ===
  {
    condition: 'ally',
    lines: [
      '"{name}在厕所里等你：\n"我们需要谈谈。情况比我想的更糟。"',
      '"{name}在文件夹里塞了一张纸条：\n"今晚有动作。做好准备。"你还没来得及问，他已经走了。',
      '"{name}找到你：\n"领袖今天问了关于你的事。我帮你挡了。但我不能每次都挡。"',
      '"{name}和你并排走路：\n"我开始后悔和你结盟了。——不是因为你不好。是因为活着太难了。"',
      '"{name}假装和你讨论工作：\n"如果有一天他们来找我，替我照顾一下我的猫。认真的。"',
      '"{name}递过来一份文件：\n"看看第三页。那个名字——你认识的。"',
    ],
    options: [
      {
        text: '"我们会没事的。坚持住。"',
        hint: '鼓励盟友。但空洞的安慰不如沉默。',
        effects: { loyalty: 0, suspicion: 0, power: 0, humanity: 1, favorability: 1, description: '他苦笑了一下。"你自己都不信。但……谢谢。"好感+1，人性+1。' },
      },
      {
        text: '"也许我们应该低调一段时间。"',
        hint: '保护性疏远。但疏远是盟约的敌人。',
        effects: { loyalty: 0, suspicion: -1, power: 0, humanity: 0, favorability: -1, description: '他沉默了。你们之间出现了一道裂缝。但至少暂时安全了。怀疑-1，好感-1。' },
      },
      {
        text: '"如果他们来，我会尽力保你。"',
        hint: '一个也许做不到的承诺。但承诺本身有力量。',
        effects: { loyalty: 1, suspicion: 0, power: 0, humanity: 1, favorability: 2, description: '他握了握你的手。在卡拉维亚，这比任何文件更有约束力。忠诚+1，人性+1，好感+2。' },
      },
      {
        text: '"别说了。有人在看我们。"',
        hint: '警觉。但他需要的不只是警觉。',
        effects: { loyalty: 0, suspicion: 0, power: 0, humanity: 0, favorability: -1, description: '你们迅速分开。他的背影看起来比昨天更孤独了。好感-1。' },
      },
    ],
  },
  // === 中立NPC的试探 ===
  {
    condition: 'neutral',
    lines: [
      '"{name}在走廊里叫住你：\n"你觉得……今天谁最危险？"他的语气听起来像是闲聊。但这里没有闲聊。',
      '"{name}坐到了你旁边的位子：\n"同志，你信命吗？我最近开始信了。"',
      '"{name}递给你一支笔：\n"你的笔坏了。——用我的吧。"一支笔，在卡拉维亚，有时候是一把刀。',
      '"{name}看了你一眼：\n"你和{name2}……熟吗？"语气随意。但在卡拉维亚，随意就是伪装。',
      '"{name}在食堂排队时转过头：\n"你说，我们这种人……最后能落什么好？"他笑了。笑容比问题更悲伤。',
      '"{name}突然问你：\n"如果你有机会离开卡拉维亚，你会走吗？"这个问题在这里等同于叛国。',
    ],
    options: [
      {
        text: '"我不太方便讨论这个，同志。"',
        hint: '安全的回答。但太安全也是一种态度。',
        effects: { loyalty: 0, suspicion: 0, power: 0, humanity: 0, favorability: 0, description: '他耸了耸肩。"也对。"你们继续假装什么都没发生。' },
      },
      {
        text: '"也许我们可以找个时间聊聊。"',
        hint: '半开放式回应。也许是友谊的开始，也许是陷阱。',
        effects: { loyalty: 0, suspicion: 1, power: 0, humanity: 1, favorability: 2, description: '他眼里闪过一丝光。你可能交到了一个朋友——或者掉进了一个坑。好感+2，怀疑+1，人性+1。' },
      },
      {
        text: '"你问这些做什么？谁让你来的？"',
        hint: '反过来质问。攻击是最好的防守——有时候。',
        effects: { loyalty: 0, suspicion: 0, power: 1, humanity: -1, favorability: -3, description: '他的脸色变了。"没人……我只是——算了。"你吓到他了。权力+1，人性-1，好感-3。' },
      },
      {
        text: '"在卡拉维亚，最危险的问题就是这种问题。"',
        hint: '用幽默化解。但幽默在这里是奢侈品。',
        effects: { loyalty: 0, suspicion: 0, power: 0, humanity: 1, favorability: 1, description: '他愣了一下，然后笑了。在这个国家，能一起笑的人比盟友更稀有。好感+1，人性+1。' },
      },
    ],
  },
  // === 胆小鬼NPC的乞求 ===
  {
    condition: 'any',
    traits: ['coward'],
    lines: [
      '"{name}浑身发抖地走到你面前：\n"求你……帮帮我。他们在查我。我什么都没做。我发誓。"',
      '"{name}拽住你的袖子，声音像蚊子：\n"你能不能……别举报我？我家里还有——"他没说完就哭了。',
      '"{name}趴在桌子上，假装在写东西：\n"如果我明天不在了……帮我把抽屉里的信寄出去。"',
    ],
    options: [
      {
        text: '"冷静。我会想办法的。"',
        hint: '安慰一个可能已经来不及安慰的人。',
        effects: { loyalty: 0, suspicion: 0, power: 0, humanity: 2, favorability: 3, description: '他擦了擦眼泪。"你是好人。"在卡拉维亚，这是诅咒。好感+3，人性+2。' },
      },
      {
        text: '"离我远点。别把我拖下水。"',
        hint: '自保是本能。但本能有时候很丑陋。',
        effects: { loyalty: 0, suspicion: -1, power: 0, humanity: -2, favorability: -3, description: '他像被打了一巴掌。然后慢慢走开了。你更安全了——大概。怀疑-1，人性-2，好感-3。' },
      },
      {
        text: '"也许你应该主动去自白。这是唯一的出路。"',
        hint: '也许是好建议。也许是把他推向深渊。',
        effects: { loyalty: 0, suspicion: 0, power: 0, humanity: 0, favorability: 0, description: '他想了想，点了点头。"也许你说得对。"他走的时候背很驼。明天他还会在吗？' },
      },
    ],
  },
  // === 野心家NPC的拉拢 ===
  {
    condition: 'any',
    traits: ['ambitious'],
    lines: [
      '"{name}叫住你，笑容里全是算计：\n"同志，你觉得……领袖最近是不是老了？一个假设性的问题。"',
      '"{name}靠过来：\n"如果——我是说如果——有一天换个人坐那把椅子。你站哪边？"',
      '"{name}递给你一根烟：\n"你是个聪明人。聪明人应该站在赢的那边。你懂我意思。"',
    ],
    options: [
      {
        text: '"你在说什么？我不明白。"',
        hint: '装傻是生存艺术。但他不会轻易放过你。',
        effects: { loyalty: 0, suspicion: 0, power: 0, humanity: 0, favorability: -1, description: '他盯着你，试图读出你的真实想法。"好吧。当我没说。"好感-1。' },
      },
      {
        text: '"这种话……我应该举报你。"',
        hint: '用举报威胁他。危险但有力。',
        effects: { loyalty: 1, suspicion: 0, power: 1, humanity: -1, favorability: -5, description: '他的脸白了。"你不会的。"但他不确定。你获得了权力，失去了一个可能的盟友。忠诚+1，权力+1，人性-1，好感-5。' },
      },
      {
        text: '"继续说。我在听。"',
        hint: '危险的好奇心。但信息就是权力。',
        effects: { loyalty: -1, suspicion: 1, power: 1, humanity: 0, favorability: 3, description: '他的眼睛亮了。你现在知道了一个秘密——这让你更强大，也更危险。忠诚-1，权力+1，怀疑+1，好感+3。' },
      },
      {
        text: '"我忠于卡拉维亚。你也应该。"',
        hint: '标准答案。但他会记住你没有同意。',
        effects: { loyalty: 1, suspicion: 0, power: 0, humanity: 0, favorability: -2, description: '"当然，当然。"他笑了，但笑容已经变了。忠诚+1，好感-2。' },
      },
    ],
  },
  // === 狡猾者NPC的双面话 ===
  {
    condition: 'any',
    traits: ['cunning'],
    lines: [
      '"{name}微笑着走过来，像一只猫在审视猎物：\n"你知道吗，你今天的表现……领袖注意到了。好的方面。"——她停顿了一下——"我觉得。"',
      '"{name}说：\n"有人在议论你。不用紧张——大部分是好话。至于那些不好的……我替你挡了。你欠我一个人情。"',
      '"{name}递来一杯酒：\n"敬我们的友谊。虽然在这里，友谊的保质期通常不超过一周。"',
    ],
    options: [
      {
        text: '"谢谢提醒。我记住了。"',
        hint: '不远不近。和狡猾的人打交道，距离是最好的武器。',
        effects: { loyalty: 0, suspicion: 0, power: 0, humanity: 0, favorability: 1, description: '她点了点头，似乎满意于你的分寸感。好感+1。' },
      },
      {
        text: '"你要什么？直说吧。"',
        hint: '直接拆穿她的面具。但面具下面可能还有面具。',
        effects: { loyalty: 0, suspicion: 0, power: 1, humanity: 0, favorability: -1, description: '她轻轻笑了。"直接。我喜欢。"——但她的眼神说的是另一回事。权力+1，好感-1。' },
      },
      {
        text: '"人情？行。但人情是双向的。"',
        hint: '接受她的交易。在卡拉维亚，人情债没有利率表。',
        effects: { loyalty: 0, suspicion: 0, power: 0, humanity: 0, favorability: 2, description: '"当然。"她举杯。你们之间建立了一种微妙的平衡——像两个扶着同一面墙的人。好感+2。' },
      },
    ],
  },
];

// ==================== 工具函数 ====================
export function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getRandomFlavorText(cardType: CardType): string {
  return getRandomItem(CARD_DEFINITIONS[cardType].flavorTexts);
}
