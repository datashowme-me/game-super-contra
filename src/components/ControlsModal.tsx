import React from 'react';
import { X, Keyboard, Smartphone, Gamepad2, Info } from 'lucide-react';

interface ControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ControlsModal: React.FC<ControlsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <Gamepad2 className="w-5 h-5 text-red-500" />
            <h2 className="font-arcade text-sm font-bold text-neutral-100">双人按键与操作指南 (CONTROLS)</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-neutral-200">
          {/* 1P vs 2P Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1P Bill Controls */}
            <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-arcade text-xs font-bold text-blue-400">1P 比尔 (BILL RIZER)</span>
                <span className="text-[10px] text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded">键盘左侧</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-neutral-800">
                  <span className="text-neutral-400">移动 / 8向瞄准:</span>
                  <span className="font-arcade text-[11px] text-white">W·A·S·D / 方向键</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-neutral-800">
                  <span className="text-neutral-400">武器射击:</span>
                  <span className="font-arcade text-[11px] text-amber-400">J / Z / 鼠标点击</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-neutral-800">
                  <span className="text-neutral-400">自动开火 (Auto-Fire):</span>
                  <span className="font-arcade text-[11px] text-orange-400">T 键 (默认自动开火)</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-neutral-800">
                  <span className="text-neutral-400">特技跳跃 / 翻滚:</span>
                  <span className="font-arcade text-[11px] text-blue-400">K / 空格 / X</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-neutral-800">
                  <span className="text-neutral-400">全屏战术轰炸:</span>
                  <span className="font-arcade text-[11px] text-red-400">L / C 键</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-neutral-400">下跳半固体跳板:</span>
                  <span className="font-arcade text-[11px] text-white">S + K / ↓ + 空格</span>
                </div>
              </div>
            </div>

            {/* 2P Lance Controls */}
            <div className="p-4 rounded-xl border border-red-500/30 bg-red-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-arcade text-xs font-bold text-red-400">2P 兰斯 (LANCE BEAN)</span>
                <span className="text-[10px] text-red-300 bg-red-500/20 px-2 py-0.5 rounded">键盘右侧</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-neutral-800">
                  <span className="text-neutral-400">移动 / 8向瞄准:</span>
                  <span className="font-arcade text-[11px] text-white">↑ · ← · ↓ · →</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-neutral-800">
                  <span className="text-neutral-400">武器射击 (连发):</span>
                  <span className="font-arcade text-[11px] text-amber-400">小键盘 1 / U 键</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-neutral-800">
                  <span className="text-neutral-400">特技跳跃 / 翻滚:</span>
                  <span className="font-arcade text-[11px] text-blue-400">小键盘 2 / I 键</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-neutral-800">
                  <span className="text-neutral-400">全屏战术轰炸:</span>
                  <span className="font-arcade text-[11px] text-red-400">小键盘 3 / O 键</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-neutral-400">下跳半固体跳板:</span>
                  <span className="font-arcade text-[11px] text-white">↓ + 跳跃键</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contra Co-op Classic Mechanics */}
          <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-amber-400 font-semibold">
              <Info className="w-4 h-4 shrink-0" />
              <span>经典魂斗罗战斗机制</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-neutral-400 leading-relaxed pl-1">
              <li><strong className="text-neutral-200">借命机制: </strong>双人模式下一方命数归零阵亡后，按跳跃/射击键可向队友借取 1 条生命并立即空降重生！</li>
              <li><strong className="text-neutral-200">潜水隐蔽: </strong>在第 1 关瀑布水池中下蹲趴下即可潜入水下躲避子弹。</li>
              <li><strong className="text-neutral-200">经典弹药: </strong>击落飞翔的红隼飞行胶囊可拾取 M(重机枪)、S(散弹枪)、L(穿透激光)、F(旋转火焰弹)、B(无敌护盾)。</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-neutral-950/50 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-arcade text-xs rounded-lg transition-colors"
          >
            明白，返回游戏
          </button>
        </div>
      </div>
    </div>
  );
};
