import React from 'react';
import { SHOP_UPGRADES, UpgradeId } from '../game/rules';
import { CauldronSprite, HintOwlSprite } from './PixelSprites';
import { sound } from '../utils/sound';

interface UpgradesModalProps {
  isOpen: boolean;
  onClose: () => void;
  gold: number;
  ownedUpgrades: UpgradeId[];
  onBuyUpgrade: (upgradeId: UpgradeId, cost: number) => void;
}

export const UpgradesModal: React.FC<UpgradesModalProps> = ({
  isOpen,
  onClose,
  gold,
  ownedUpgrades,
  onBuyUpgrade,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrades-modal-title"
    >
      <div className="pixel-box flex max-h-[90vh] w-full max-w-3xl flex-col bg-[#fdf6e3] text-[#1e1b2e]">
        {/* Header */}
        <div className="flex items-center justify-between border-b-4 border-[#181020] bg-[#b45309] px-5 py-3 text-white">
          <div>
            <h2 id="upgrades-modal-title" className="font-pixel text-lg text-[#fef08a]">
              ALCHEMIST GUILD SHOP UPGRADES
            </h2>
            <p className="text-xs text-amber-100">
              Spend gold coins from happy customers on magical tools that help you study & brew!
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono-tabular pixel-box-sm bg-[#181020] px-3 py-1 text-sm font-bold text-[#fde047]">
              Gold: {gold}G
            </span>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="pixel-btn pixel-box-sm bg-[#ef4444] px-3 py-1 font-pixel text-xs text-white"
              aria-label="Close Upgrades"
            >
              X
            </button>
          </div>
        </div>

        {/* Upgrades Grid */}
        <div className="grid grid-cols-1 gap-4 overflow-y-auto p-6 md:grid-cols-2">
          {SHOP_UPGRADES.map((upg) => {
            const isOwned = ownedUpgrades.includes(upg.id);
            const canAfford = gold >= upg.cost;

            return (
              <div
                key={upg.id}
                className={`pixel-box-sm flex flex-col justify-between p-4 ${
                  isOwned ? 'bg-[#dcfce7]' : 'bg-white'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {upg.id === 'hint_owl' && <HintOwlSprite className="h-12 w-12 shrink-0" />}
                      {upg.id === 'golden_cauldron' && (
                        <CauldronSprite isGolden={true} className="h-12 w-12 shrink-0" />
                      )}
                      {upg.id === 'enchanted_shears' && (
                        <div className="flex h-12 w-12 items-center justify-center bg-[#f3e8ff] font-pixel text-lg text-[#6d28d9]">
                          ✂
                        </div>
                      )}
                      {upg.id === 'crystal_heart' && (
                        <div className="flex h-12 w-12 items-center justify-center bg-[#fee2e2] font-pixel text-lg text-[#dc2626]">
                          ♥
                        </div>
                      )}
                      <div>
                        <h3 className="font-pixel text-sm text-[#1e1b2e]">{upg.name}</h3>
                        <p className="font-mono-tabular text-xs font-bold text-[#b45309]">
                          {isOwned ? 'OWNED' : `Cost: ${upg.cost} Gold`}
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-[#4a3f5c]">{upg.description}</p>
                  <p className="mt-2 text-xs font-bold text-[#5b21b6]">{upg.effectSummary}</p>
                </div>

                <div className="mt-4 pt-2">
                  {isOwned ? (
                    <div className="pixel-box-sm bg-[#16a34a] py-2 text-center font-pixel text-xs text-white">
                      ✓ Equipped in Shop
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => {
                        sound.playGoldCoins();
                        onBuyUpgrade(upg.id, upg.cost);
                      }}
                      className={`pixel-btn pixel-box-sm w-full py-2 font-pixel text-xs ${
                        canAfford
                          ? 'bg-[#f59e0b] text-[#181020] hover:bg-[#fbbf24]'
                          : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {canAfford
                        ? `Buy ${upg.name} (${upg.cost}G)`
                        : `Need ${upg.cost - gold}G More`}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
