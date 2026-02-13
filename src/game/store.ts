// ============================================
// 🗄️ 游戏状态管理 (Zustand)
// ============================================

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { GameState, Card, LogEntry, Official } from './types';
import {
  createInitialState,
  resolveCard,
  processAIActions,
  processDelayedActions,
  processPurge,
  checkConsecutiveActions,
  startNewDay,
  generateQuestion,
  resolveRandomEvent,
  checkVictory,
  drawHand,
} from './engine';
import { RANDOM_EVENTS, PLAYER_DEATH_TEXTS, getRandomItem } from './data';

interface GameStore extends GameState {
  // 游戏流程
  startGame: () => void;
  finishIntro: () => void;
  dismissDayTransition: () => void;
  
  // 晨间简报
  proceedFromBriefing: () => void;
  
  // 出牌
  selectCard: (card: Card) => void;
  selectTarget: (officialId: string) => void;
  playCard: () => void;
  cancelSelection: () => void;
  endActions: () => void;
  
  // 事件
  resolveEvent: () => void;
  
  // 领袖提问
  answerQuestion: (optionId: string) => void;
  
  // 日终
  processDayEnd: () => void;
  
  // 消息队列
  dismissMessage: () => void;
  
  // 新的一天
  nextDay: () => void;
  
  // 重新开始
  restartGame: () => void;
  
  // 通用
  addLog: (text: string, type?: LogEntry['type']) => void;
}

export const useGameStore = create<GameStore>()(
  immer((set, get) => ({
    ...createInitialState(),
    
    startGame: () => {
      set((s) => {
        Object.assign(s, createInitialState());
        s.phase = 'intro';
      });
    },
    
    finishIntro: () => {
      set((s) => {
        const newDayState = startNewDay(s as GameState);
        Object.assign(s, newDayState);
        s.phase = 'morning_briefing';
      });
    },
    
    dismissDayTransition: () => {
      set((s) => {
        s.showDayTransition = false;
      });
    },
    
    proceedFromBriefing: () => {
      set((s) => {
        s.phase = 'play_cards';
        s.addLog = undefined as any; // 不在immer中调用
      });
    },
    
    selectCard: (card: Card) => {
      set((s) => {
        s.selectedCard = card;
        if (!card.needsTarget) {
          s.selectedTarget = undefined;
        }
      });
    },
    
    selectTarget: (officialId: string) => {
      set((s) => {
        s.selectedTarget = officialId;
      });
    },
    
    cancelSelection: () => {
      set((s) => {
        s.selectedCard = undefined;
        s.selectedTarget = undefined;
      });
    },
    
    playCard: () => {
      const state = get();
      if (!state.selectedCard) return;
      if (state.selectedCard.needsTarget && !state.selectedTarget) return;
      if (state.actionsRemaining <= 0) return;
      
      set((s) => {
        const card = s.selectedCard!;
        const targetId = s.selectedTarget;
        
        // 偏执心情下，举报不消耗行动
        const realMood = s.leaderMood.isFake ? s.leaderMood.realMood! : s.leaderMood.type;
        const freeReport = realMood === 'paranoid' && card.type === 'report';
        
        // 检查连续行为
        const consecCheck = checkConsecutiveActions(card.type, s.consecutiveActions);
        
        // 解算卡牌效果
        const result = resolveCard(card, targetId, s as unknown as GameState);
        
        // 应用玩家变化
        if (result.playerChanges) {
          Object.keys(result.playerChanges).forEach(key => {
            const k = key as keyof typeof result.playerChanges;
            const val = result.playerChanges[k];
            if (val !== undefined) {
              (s.player as any)[k] = Math.max(0, Math.min(15, val));
            }
          });
        }
        
        // 应用连续行为惩罚
        if (consecCheck.penalty) {
          Object.keys(consecCheck.penalty).forEach(key => {
            const k = key as keyof typeof consecCheck.penalty;
            const val = consecCheck.penalty![k];
            if (val !== undefined) {
              (s.player as any)[k] = Math.max(0, Math.min(15, (s.player as any)[k] + val));
            }
          });
        }
        
        // 应用官员变化
        if (result.officialChanges) {
          for (const oc of result.officialChanges) {
            const idx = s.officials.findIndex(o => o.id === oc.id);
            if (idx >= 0) {
              Object.keys(oc.changes).forEach(key => {
                const k = key as keyof Official;
                const val = (oc.changes as any)[k];
                if (val !== undefined) {
                  (s.officials[idx] as any)[k] = val;
                }
              });
              // 更新态度
              const o = s.officials[idx];
              if (o.isAlly) o.attitude = 'allied';
              else if (o.favorability >= 2) o.attitude = 'friendly';
              else if (o.favorability <= -2) o.attitude = 'hostile';
              else o.attitude = 'unknown';
            }
          }
        }
        
        // 添加延迟炸弹
        if (result.delayed) {
          s.delayedActions.push({
            id: `delayed_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            ...result.delayed,
          });
        }
        
        // 更新连续行为计数
        s.consecutiveActions.silence = card.type === 'silence' ? s.consecutiveActions.silence + 1 : 0;
        s.consecutiveActions.praise = card.type === 'praise' ? s.consecutiveActions.praise + 1 : 0;
        s.consecutiveActions.report = card.type === 'report' ? s.consecutiveActions.report + 1 : 0;
        
        // 消耗行动
        if (!freeReport) {
          s.actionsRemaining--;
        }
        
        // 从手牌移除
        s.hand = s.hand.filter(c => c.id !== card.id);
        
        // 添加日志
        for (const log of result.logs) {
          s.logs.push({ day: s.day, phase: 'play_cards', text: log, type: 'info' });
        }
        if (result.flavorText) {
          s.logs.push({ day: s.day, phase: 'play_cards', text: result.flavorText, type: 'info' });
        }
        if (consecCheck.warning) {
          s.logs.push({ day: s.day, phase: 'play_cards', text: consecCheck.warning, type: 'warning' });
        }
        
        // 添加到消息队列
        s.messageQueue = [...result.logs, result.flavorText].filter(Boolean);
        if (consecCheck.warning) {
          s.messageQueue.push(consecCheck.warning);
        }
        
        // 清除选择
        s.selectedCard = undefined;
        s.selectedTarget = undefined;
      });
    },
    
    endActions: () => {
      set((s) => {
        // 进入突发事件阶段
        const evt = getRandomItem(RANDOM_EVENTS);
        s.currentEvent = evt as any;
        s.phase = 'random_event';
        s.messageQueue = [];
      });
    },
    
    resolveEvent: () => {
      const state = get();
      if (!state.currentEvent) return;
      
      set((s) => {
        const result = resolveRandomEvent(s.currentEvent!.id, s as unknown as GameState);
        
        // 应用效果
        if (result.playerChanges) {
          Object.keys(result.playerChanges).forEach(key => {
            const k = key as keyof typeof result.playerChanges;
            const val = result.playerChanges[k];
            if (val !== undefined) {
              (s.player as any)[k] = Math.max(0, Math.min(15, val));
            }
          });
        }
        
        if (result.officialChanges) {
          for (const oc of result.officialChanges) {
            const idx = s.officials.findIndex(o => o.id === oc.id);
            if (idx >= 0) {
              Object.keys(oc.changes).forEach(key => {
                (s.officials[idx] as any)[key] = (oc.changes as any)[key];
              });
            }
          }
        }
        
        s.logs.push({ day: s.day, phase: 'random_event', text: result.message, type: 'info' });
        s.messageQueue = [result.message];
        
        // 进入领袖提问
        s.currentQuestion = generateQuestion(s as unknown as GameState);
        s.phase = 'leader_question';
      });
    },
    
    answerQuestion: (optionId: string) => {
      set((s) => {
        if (!s.currentQuestion) return;
        
        const option = s.currentQuestion.options.find(o => o.id === optionId);
        if (!option) return;
        
        const effects = option.effects(s as unknown as GameState);
        
        s.player.loyalty = Math.max(0, Math.min(15, s.player.loyalty + effects.loyalty));
        s.player.suspicion = Math.max(0, Math.min(15, s.player.suspicion + effects.suspicion));
        s.player.power = Math.max(0, Math.min(15, s.player.power + effects.power));
        s.player.humanity = Math.max(0, Math.min(10, s.player.humanity + effects.humanity));
        
        s.logs.push({ day: s.day, phase: 'leader_question', text: effects.description, type: 'info' });
        s.messageQueue = [effects.description];
        
        // 进入日终结算
        s.phase = 'day_end';
      });
    },
    
    processDayEnd: () => {
      set((s) => {
        const logs: string[] = [];
        
        // 1. 处理AI行动
        const aiResult = processAIActions(s as unknown as GameState);
        for (const oc of aiResult.officialChanges) {
          const idx = s.officials.findIndex(o => o.id === oc.id);
          if (idx >= 0) {
            Object.keys(oc.changes).forEach(key => {
              (s.officials[idx] as any)[key] = (oc.changes as any)[key];
            });
          }
        }
        if (aiResult.playerChanges) {
          Object.keys(aiResult.playerChanges).forEach(key => {
            const k = key as keyof typeof aiResult.playerChanges;
            const val = aiResult.playerChanges[k];
            if (val !== undefined) {
              (s.player as any)[k] = Math.max(0, Math.min(15, val));
            }
          });
        }
        logs.push(...aiResult.logs);
        
        // 2. 处理延迟炸弹
        const delayedResult = processDelayedActions(s as unknown as GameState);
        for (const oc of delayedResult.officialChanges) {
          const idx = s.officials.findIndex(o => o.id === oc.id);
          if (idx >= 0) {
            Object.keys(oc.changes).forEach(key => {
              (s.officials[idx] as any)[key] = (oc.changes as any)[key];
            });
          }
        }
        if (delayedResult.playerChanges) {
          Object.keys(delayedResult.playerChanges).forEach(key => {
            const k = key as keyof typeof delayedResult.playerChanges;
            const val = delayedResult.playerChanges[k];
            if (val !== undefined) {
              (s.player as any)[k] = Math.max(0, Math.min(15, val));
            }
          });
        }
        // 移除已结算的延迟炸弹
        s.delayedActions = s.delayedActions.filter(a => !delayedResult.resolved.includes(a.id));
        // 添加新的延迟炸弹
        for (const nd of delayedResult.newDelayed) {
          s.delayedActions.push({
            id: `delayed_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            ...nd,
          });
        }
        // 更新剩余延迟炸弹的计时（这里不再需要，因为在startNewDay中已处理）
        logs.push(...delayedResult.logs);
        
        // 3. 清洗判定
        const purgeResult = processPurge(s as unknown as GameState);
        
        for (const id of purgeResult.purgedOfficials) {
          const idx = s.officials.findIndex(o => o.id === id);
          if (idx >= 0) {
            s.officials[idx].isAlive = false;
          }
          s.purgedOfficials.push(id);
        }
        
        // 盟友背叛
        for (const b of purgeResult.allyBetrayal) {
          if (b.betrayed) {
            s.player.suspicion = Math.min(15, s.player.suspicion + b.suspicionGain);
          }
        }
        
        logs.push(...purgeResult.logs);
        
        // 检查心情伪装
        if (s.leaderMood.isFake) {
          logs.push(`※ 领袖的心情并非表面看到的那样。真实心情是：${
            s.leaderMood.realMood === 'suspicious' ? '多疑' :
            s.leaderMood.realMood === 'pleased' ? '愉悦' :
            s.leaderMood.realMood === 'paranoid' ? '偏执' :
            s.leaderMood.realMood === 'nostalgic' ? '怀旧' :
            s.leaderMood.realMood === 'furious' ? '暴怒' : '慷慨'
          }。你被骗了。`);
        }
        
        // 添加所有日志
        for (const log of logs) {
          s.logs.push({ day: s.day, phase: 'day_end', text: log, type: log.includes('清洗') || log.includes('供出') ? 'danger' : 'info' });
        }
        
        s.messageQueue = logs;
        
        // 检查玩家是否被清洗
        if (purgeResult.playerPurged) {
          s.phase = 'game_over';
          s.endingType = 'purged';
          s.messageQueue = [getRandomItem(PLAYER_DEATH_TEXTS)];
          return;
        }
        
        // 检查胜利
        const victory = checkVictory(s as unknown as GameState);
        if (victory) {
          s.phase = 'victory';
          s.endingType = victory;
          return;
        }
        
        // 进入清洗展示阶段
        s.phase = 'purge';
      });
    },
    
    nextDay: () => {
      set((s) => {
        const newDayState = startNewDay(s as unknown as GameState);
        Object.assign(s, newDayState);
        s.messageQueue = [];
      });
    },
    
    dismissMessage: () => {
      set((s) => {
        if (s.messageQueue.length > 0) {
          s.messageQueue = s.messageQueue.slice(1);
        }
      });
    },
    
    restartGame: () => {
      set((s) => {
        Object.assign(s, createInitialState());
      });
    },
    
    addLog: (text: string, type: LogEntry['type'] = 'info') => {
      set((s) => {
        s.logs.push({ day: s.day, phase: s.phase, text, type });
      });
    },
  }))
);
