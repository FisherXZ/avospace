'use client';

import { getDailyQuests, getWeeklyQuests, getQuestCoinReward } from '../utils/quests';
import {
  Zap,
  Target,
  Sunrise,
  Moon,
  Brain,
  Crown,
  Timer,
  Compass,
  Flame,
  Check,
  X,
} from 'lucide-react';
import './QuestsModal.css';

interface QuestsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Quest icon component
function QuestIcon({ iconName, size = 24 }: { iconName: string; size?: number }) {
  const iconProps = { size, strokeWidth: 2 };
  
  switch (iconName) {
    case 'Zap': return <Zap {...iconProps} />;
    case 'Target': return <Target {...iconProps} />;
    case 'Sunrise': return <Sunrise {...iconProps} />;
    case 'Moon': return <Moon {...iconProps} />;
    case 'Brain': return <Brain {...iconProps} />;
    case 'Crown': return <Crown {...iconProps} />;
    case 'Timer': return <Timer {...iconProps} />;
    case 'Compass': return <Compass {...iconProps} />;
    case 'Flame': return <Flame {...iconProps} />;
    default: return <Target {...iconProps} />;
  }
}

export default function QuestsModal({ isOpen, onClose }: QuestsModalProps) {
  const dailyQuests = getDailyQuests();
  const weeklyQuests = getWeeklyQuests();

  // Mock progress for display purposes (will be dynamic later)
  const getMockProgress = (questId: string) => {
    const progressMap: { [key: string]: { current: number; completed: boolean } } = {
      'quick-study': { current: 1, completed: true },
      'double-down': { current: 1, completed: false },
      'early-bird': { current: 0, completed: false },
      'night-owl': { current: 0, completed: false },
      'focus-master': { current: 0, completed: false },
      'consistency-king': { current: 3, completed: false },
      'hour-grinder': { current: 6.5, completed: false },
      'location-explorer': { current: 2, completed: true },
      'streak-builder': { current: 5, completed: false },
    };
    return progressMap[questId] || { current: 0, completed: false };
  };

  if (!isOpen) return null;

  return (
    <div className="quests-modal-overlay" onClick={onClose}>
      <div className="quests-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="quests-modal-header">
          <div className="modal-title-row">
            <Target size={28} strokeWidth={2.5} />
            <h2 className="modal-title">Study Quests</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Two-Panel Layout */}
        <div className="quests-modal-body">
          <div className="quests-panels-modal">
            {/* Daily Quests Panel */}
            <div className="quest-panel daily-panel">
              <div className="panel-header">
                <h3 className="panel-title">Daily Quests</h3>
                <span className="reset-timer">Resets in 6h 23m</span>
              </div>
              
              <div className="quest-list">
                {dailyQuests.map((quest) => {
                  const progress = getMockProgress(quest.id);
                  const progressPercent = Math.min(100, (progress.current / quest.target) * 100);
                  const coinReward = getQuestCoinReward(quest);
                  
                  return (
                    <div 
                      key={quest.id} 
                      className={`quest-card ${progress.completed ? 'completed' : ''}`}
                    >
                      <div className="quest-icon">
                        <QuestIcon iconName={quest.icon} size={28} />
                      </div>
                      <div className="quest-info">
                        <h4 className="quest-name">{quest.name}</h4>
                        <p className="quest-description">{quest.description}</p>
                        
                        <div className="quest-progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        
                        <div className="quest-footer">
                          <span className="progress-text">
                            {progress.current} / {quest.target}
                            {progress.completed && <Check size={16} className="check-icon" />}
                          </span>
                          <span className="quest-reward">
                            +{quest.xpReward} XP · +{coinReward} <img src="/avocoin.png" alt="coin" className="coin-icon" />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Weekly Quests Panel */}
            <div className="quest-panel weekly-panel">
              <div className="panel-header">
                <h3 className="panel-title">Weekly Quests</h3>
                <span className="reset-timer">Resets Sunday</span>
              </div>
              
              <div className="quest-list">
                {weeklyQuests.map((quest) => {
                  const progress = getMockProgress(quest.id);
                  const progressPercent = Math.min(100, (progress.current / quest.target) * 100);
                  const coinReward = getQuestCoinReward(quest);
                  
                  return (
                    <div 
                      key={quest.id} 
                      className={`quest-card ${progress.completed ? 'completed' : ''}`}
                    >
                      <div className="quest-icon">
                        <QuestIcon iconName={quest.icon} size={28} />
                      </div>
                      <div className="quest-info">
                        <h4 className="quest-name">{quest.name}</h4>
                        <p className="quest-description">{quest.description}</p>
                        
                        <div className="quest-progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        
                        <div className="quest-footer">
                          <span className="progress-text">
                            {progress.current} / {quest.target}
                            {progress.completed && <Check size={16} className="check-icon" />}
                          </span>
                          <span className="quest-reward">
                            +{quest.xpReward} XP · +{coinReward} <img src="/avocoin.png" alt="coin" className="coin-icon" />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

