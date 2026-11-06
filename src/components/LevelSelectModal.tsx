import React from 'react';
import { X, Play, ShieldAlert, Crosshair, Award } from 'lucide-react';
import { LEVELS } from '../game/levels';

interface LevelSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLevelId: number;
  onSelectLevel: (levelId: number) => void;
  onDeploy: (levelId: number) => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  isOpen,
  onClose,
  selectedLevelId,
  onSelectLevel,
  onDeploy,
}) => {
  if (!isOpen) return null;

  const imageMap: Record<number, string> = {
    1: '/src/assets/images/contra_stage_jungle_1793951933401.jpg',
    2: '/src/assets/images/contra_stage_base_1793951934281.jpg',
    3: '/src/assets/images/contra_stage_alien_1793951933748.jpg',
  };

  const bossMap: Record<number, { name: string; type: string; drops: string[]; sprite: string }> = {
    1: { 
      name: '堡垒重炮壁垒', 
      type: '旋转激光双炮 + 哨塔机枪 + 能量核心', 
      drops: ['M', 'S', 'L', 'B'],
      sprite: '/src/assets/images/contra_boss_fortress_1793952834537.jpg'
    },
    2: { 
      name: '泰坦重装机械蛛', 
      type: '重力践踏震荡波 + 散弹等离子 + 浮空导弹', 
      drops: ['F', 'S', 'L', 'B'],
      sprite: '/src/assets/images/contra_boss_spider_1793952835549.jpg'
    },
    3: { 
      name: '异形魔脑终极核心', 
      type: '多方位恶魔之眼 + 剧毒生化飞针 + 胞囊幼体', 
      drops: ['S', 'L', 'F', 'B'],
      sprite: '/src/assets/images/contra_boss_alien_1793952835291.jpg'
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div>
            <h2 className="font-arcade text-sm font-bold text-amber-400">战区关卡选择 (STAGE SELECT)</h2>
            <p className="text-xs text-neutral-400 mt-1">选择目标作战战区，查看敌情简报并空降作战</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Level Grid */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {LEVELS.map((lvl) => {
              const isSelected = lvl.id === selectedLevelId;
              const boss = bossMap[lvl.id];
              const imgSrc = imageMap[lvl.id];

              return (
                <div
                  key={lvl.id}
                  onClick={() => onSelectLevel(lvl.id)}
                  className={`relative rounded-xl border overflow-hidden cursor-pointer transition-all flex flex-col ${
                    isSelected
                      ? 'border-amber-400 bg-neutral-800/80 shadow-[0_0_20px_rgba(245,158,11,0.25)] ring-1 ring-amber-400'
                      : 'border-neutral-800 bg-neutral-950/60 hover:border-neutral-700'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative h-40 w-full overflow-hidden bg-neutral-950">
                    <img
                      src={imgSrc}
                      alt={lvl.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent" />
                    <div className="absolute top-2.5 left-2.5 font-arcade text-[10px] px-2 py-0.5 bg-neutral-950/90 text-amber-400 border border-amber-500/30 rounded">
                      STAGE 0{lvl.id}
                    </div>
                  </div>

                  {/* Info Card */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="font-arcade text-xs font-bold text-neutral-100">{lvl.name}</h3>
                      <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">{lvl.description}</p>
                    </div>

                    {/* Boss Intel */}
                    <div className="pt-2 border-t border-neutral-800/80 space-y-2 text-[11px]">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={boss?.sprite}
                          alt={boss?.name}
                          className="w-10 h-10 rounded-lg object-cover border border-red-500/40 bg-black shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1 text-red-400 font-medium">
                            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{boss?.name}</span>
                          </div>
                          <div className="text-[10px] text-neutral-400 truncate">{boss?.type}</div>
                        </div>
                      </div>

                      {/* Powerups Available */}
                      <div className="flex items-center gap-1 text-neutral-400 text-[10px]">
                        <span>补给弹药:</span>
                        <div className="flex items-center gap-1 font-arcade">
                          {boss?.drops.map((d) => (
                            <span
                              key={d}
                              className="px-1 py-0.2 rounded bg-neutral-800 text-amber-300 border border-neutral-700"
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeploy(lvl.id);
                      }}
                      className={`w-full py-2.5 rounded font-arcade text-[11px] font-bold transition-all flex items-center justify-center gap-2 ${
                        isSelected
                          ? 'bg-amber-400 text-neutral-950 hover:bg-amber-300'
                          : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                      }`}
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>{isSelected ? '立即空降出击' : '选择此关卡'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-neutral-950/50 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          <span>关卡支持单人及双人本地同屏作战</span>
          <button
            onClick={() => onDeploy(selectedLevelId)}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-arcade text-xs font-bold rounded-lg transition-colors shadow-md"
          >
            以当前关卡开始战斗
          </button>
        </div>
      </div>
    </div>
  );
};
