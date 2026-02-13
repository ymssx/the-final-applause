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
    description: '向领袖表忠心。忠诚+2，但招人嫉妒。',
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
    description: '举报一名官员。人性-2，1-3天后目标怀疑+3。',
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
    description: '尝试与目标建立联盟。盟友每轮降低你的怀疑。',
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
    description: '什么都不说。怀疑-1，权力-1。连续2天会被注意。',
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
    description: '查看目标所有属性数值。消耗行动但无风险。',
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
    description: '主动认错。怀疑-3，但权力-2。次日忠诚+1。',
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
    ambition: 8,
    favorability: 0,
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
    ambition: 5,
    favorability: -1,
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
    ambition: 6,
    favorability: 0,
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
    ambition: 2,
    favorability: 1,
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

// ==================== 工具函数 ====================
export function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getRandomFlavorText(cardType: CardType): string {
  return getRandomItem(CARD_DEFINITIONS[cardType].flavorTexts);
}
