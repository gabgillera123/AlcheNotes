import React, { useState, useEffect, useMemo } from 'react';
import {
  IngredientId,
  INGREDIENTS,
  StudyQuestion,
  UpgradeId,
  pickNextQuestion,
} from '../game/rules';
import { HintOwlSprite, IngredientSprite } from './PixelSprites';
import { sound } from '../utils/sound';

interface GatherIngredientsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTargetIngredient?: IngredientId;
  inventory: Record<IngredientId, number>;
  questions: StudyQuestion[];
  ownedUpgrades: UpgradeId[];
  onHarvestResult: (
    ingredientId: IngredientId,
    questionId: string,
    isCorrect: boolean
  ) => void;
  onTransmuteBurntScales: () => void;
}

const HARVESTABLE_IDS: IngredientId[] = [
  'dragon_scale',
  'ice_berry',
  'moonwater',
  'mandrake_root',
];

export const GatherIngredientsModal: React.FC<GatherIngredientsModalProps> = ({
  isOpen,
  onClose,
  initialTargetIngredient = 'dragon_scale',
  inventory,
  questions,
  ownedUpgrades,
  onHarvestResult,
  onTransmuteBurntScales,
}) => {
  const [selectedIng, setSelectedIng] = useState<IngredientId>(
    initialTargetIngredient === 'burnt_scale' ? 'dragon_scale' : initialTargetIngredient
  );
  const [currentQuestion, setCurrentQuestion] = useState<StudyQuestion>(() =>
    pickNextQuestion(questions)
  );
  const [eliminatedOptions, setEliminatedOptions] = useState<string[]>([]);
  const [owlWhisper, setOwlWhisper] = useState<string | null>(null);
  const [answeredState, setAnsweredState] = useState<{
    selectedOption: string;
    isCorrect: boolean;
    bonusTriggered: boolean;
  } | null>(null);

  const hasGoldenCauldron = ownedUpgrades.includes('golden_cauldron');
  const hasHintOwl = ownedUpgrades.includes('hint_owl');
  const hasEnchantedShears = ownedUpgrades.includes('enchanted_shears');

  const maxTime = hasGoldenCauldron ? 40 : 25;
  const [timeLeft, setTimeLeft] = useState<number>(maxTime);

  useEffect(() => {
    if (isOpen) {
      const target =
        initialTargetIngredient === 'burnt_scale' ? 'dragon_scale' : initialTargetIngredient;
      setSelectedIng(target);
      const nextQ = pickNextQuestion(questions);
      setCurrentQuestion(nextQ);
      setAnsweredState(null);
      setEliminatedOptions([]);
      setOwlWhisper(null);
      setTimeLeft(maxTime);
    }
  }, [isOpen, initialTargetIngredient]);

  // Countdown timer while question is active
  useEffect(() => {
    if (!isOpen || answeredState) return;
    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time expired counts as a missed harvest
          sound.playHarvestFail();
          setAnsweredState({
            selectedOption: 'TIME EXPIRED',
            isCorrect: false,
            bonusTriggered: false,
          });
          onHarvestResult(selectedIng, currentQuestion.id, false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isOpen, answeredState, selectedIng, currentQuestion.id]);

  // Deterministic option order based on question id + text length so options don't jump on re-render
  const displayOptions = useMemo(() => {
    const opts = [...currentQuestion.options];
    const shift = currentQuestion.id.charCodeAt(currentQuestion.id.length - 1) % opts.length;
    return [...opts.slice(shift), ...opts.slice(0, shift)];
  }, [currentQuestion]);

  if (!isOpen) return null;

  const handleSelectAnswer = (option: string) => {
    if (answeredState) return;
    const isCorrect = option === currentQuestion.correctAnswer;
    const nextStreak = isCorrect ? currentQuestion.masteryStreak + 1 : 0;
    const bonusTriggered = isCorrect && hasEnchantedShears && nextStreak >= 2;

    if (isCorrect) {
      sound.playHarvestSuccess();
    } else {
      sound.playHarvestFail();
    }

    setAnsweredState({
      selectedOption: option,
      isCorrect,
      bonusTriggered,
    });

    onHarvestResult(selectedIng, currentQuestion.id, isCorrect);
  };

  const handleNextQuestion = () => {
    sound.playClick();
    const nextQ = pickNextQuestion(questions, currentQuestion.id);
    setCurrentQuestion(nextQ);
    setAnsweredState(null);
    setEliminatedOptions([]);
    setOwlWhisper(null);
    setTimeLeft(maxTime);
  };

  const handleUseHintOwl = () => {
    if (!hasHintOwl || answeredState) return;
    sound.playClick();
    const wrongOpts = displayOptions.filter((o) => o !== currentQuestion.correctAnswer);
    setEliminatedOptions(wrongOpts.slice(0, 2));
    setOwlWhisper(currentQuestion.hint);
  };

  const ingDef = INGREDIENTS[selectedIng];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gather-modal-title"
    >
      <div className="pixel-box relative flex max-h-[92vh] w-full max-w-4xl flex-col bg-[#fdf6e3] text-[#1e1b2e]">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b-4 border-[#181020] bg-[#15803d] px-5 py-3 text-white">
          <div>
            <h2 id="gather-modal-title" className="font-pixel text-lg text-[#fef08a]">
              GREENHOUSE & MONSTER DEN — STUDY TO FORAGE
            </h2>
            <p className="text-xs text-emerald-100">
              Answer flashcards from your real-life reviewer to harvest high-quality potion ingredients!
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="pixel-btn pixel-box-sm bg-[#ef4444] px-3 py-1 font-pixel text-xs text-white hover:bg-[#dc2626]"
          >
            Back to Shop
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Step A: Choose Which Ingredient to Harvest */}
          <div>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <span className="font-pixel text-xs text-[#15803d]">
                1. SELECT INGREDIENT TO HARVEST:
              </span>
              {inventory.burnt_scale > 0 && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono-tabular text-[#78716c]">
                    Burnt Scales Held: <strong>{inventory.burnt_scale}</strong>
                  </span>
                  {inventory.burnt_scale >= 2 && (
                    <button
                      type="button"
                      onClick={() => {
                        sound.playPotionPoof();
                        onTransmuteBurntScales();
                      }}
                      className="pixel-btn pixel-box-sm bg-[#0284c7] px-2.5 py-1 font-pixel text-[10px] text-white"
                    >
                      Reforge 2 Burnt Scales → 1 Dragon Scale
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {HARVESTABLE_IDS.map((id) => {
                const def = INGREDIENTS[id];
                const isSelected = selectedIng === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setSelectedIng(id);
                    }}
                    className={`pixel-btn pixel-box-sm flex items-center gap-3 p-3 text-left ${
                      isSelected
                        ? 'bg-[#dcfce7] ring-2 ring-[#15803d]'
                        : 'bg-white hover:bg-[#f8fafc]'
                    }`}
                  >
                    <IngredientSprite id={id} className="h-11 w-11 shrink-0" />
                    <div className="min-w-0">
                      <div className="font-pixel text-xs text-[#1e1b2e] truncate">
                        {def.name}
                      </div>
                      <div className="text-[11px] text-[#4a3f5c]">{def.zone}</div>
                      <div className="font-mono-tabular text-xs font-bold text-[#15803d]">
                        Owned: {inventory[id] || 0}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step B: Flashcard Quiz Arena */}
          <div className="pixel-box-sm bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#e5dec9] pb-3">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-pixel text-[#5b21b6]">
                  FORAGING: {ingDef.name.toUpperCase()} ({ingDef.zone})
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-[#4a3f5c]">
                  Subject: {currentQuestion.subject}
                </span>
                {currentQuestion.needsPractice && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-pixel text-[11px] font-bold text-[#dc2626]">
                      ★ SPACED REPETITION PRACTICE (Missed {currentQuestion.wrongCount}x)
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono-tabular text-xs font-bold text-[#1e1b2e]">
                  Time: {timeLeft}s {hasGoldenCauldron && '(+15s Golden Bonus)'}
                </span>
              </div>
            </div>

            {/* Question Text */}
            <div className="my-4">
              <p className="text-base font-bold leading-snug text-[#1e1b2e] md:text-lg">
                {currentQuestion.question}
              </p>
            </div>

            {/* Optional Hint Owl Whisper */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              {hasHintOwl ? (
                <div className="flex items-center gap-3">
                  <HintOwlSprite className="h-10 w-10" />
                  {owlWhisper ? (
                    <p className="text-xs font-semibold text-[#92400e]">
                      <strong>Hint Owl whispers:</strong> "{owlWhisper}" (2 wrong options removed!)
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleUseHintOwl}
                      disabled={Boolean(answeredState)}
                      className="pixel-btn pixel-box-sm bg-[#fef08a] px-3 py-1.5 font-pixel text-xs text-[#78350f] hover:bg-[#fde047]"
                    >
                      Ask Hint Owl for a Clue
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-xs text-[#64748b]">
                  Tip: Buy the <strong>Hint Owl Familiar</strong> in Shop Upgrades to get clues on tough questions!
                </p>
              )}
            </div>

            {/* Answer Choices */}
            <div className="grid grid-cols-1 gap-2.5">
              {displayOptions.map((option, idx) => {
                const isEliminated = eliminatedOptions.includes(option);
                const isCorrectOption = option === currentQuestion.correctAnswer;
                const isSelectedOption = answeredState?.selectedOption === option;

                let btnStyle = 'bg-[#fdf6e3] hover:bg-[#f3e8ff] text-[#1e1b2e]';
                if (answeredState) {
                  if (isCorrectOption) {
                    btnStyle = 'bg-[#dcfce7] text-[#14532d] ring-2 ring-[#16a34a]';
                  } else if (isSelectedOption && !answeredState.isCorrect) {
                    btnStyle = 'bg-[#fee2e2] text-[#7f1d1d] ring-2 ring-[#dc2626]';
                  } else {
                    btnStyle = 'bg-slate-100 text-slate-400 opacity-75';
                  }
                } else if (isEliminated) {
                  btnStyle = 'bg-slate-100 text-slate-400 line-through opacity-50';
                }

                return (
                  <button
                    key={option}
                    type="button"
                    disabled={Boolean(answeredState) || isEliminated}
                    onClick={() => handleSelectAnswer(option)}
                    className={`pixel-btn pixel-box-sm flex items-center gap-3 px-4 py-3 text-left text-sm font-semibold ${btnStyle}`}
                  >
                    <span className="font-pixel text-xs text-[#5b21b6]">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    <span className="flex-1">{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Outcome Feedback Banner */}
            {answeredState && (
              <div
                className={`mt-5 pixel-box-sm p-4 ${
                  answeredState.isCorrect ? 'bg-[#dcfce7]' : 'bg-[#fee2e2]'
                }`}
                role="status"
              >
                {answeredState.isCorrect ? (
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                      <IngredientSprite id={selectedIng} className="h-12 w-12 shrink-0" />
                      <div>
                        <h4 className="font-pixel text-sm text-[#15803d]">
                          SUCCESS! HARVESTED SHINY {ingDef.name.toUpperCase()}!
                          {answeredState.bonusTriggered && ' (+1 SHEARS STREAK BONUS!)'}
                        </h4>
                        <p className="text-xs text-[#166534]">
                          Great recall! Mastery Streak on this card is now{' '}
                          <strong>{currentQuestion.masteryStreak + 1}</strong>.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleNextQuestion}
                        className="pixel-btn pixel-box-sm bg-[#16a34a] px-4 py-2 font-pixel text-xs text-white hover:bg-[#15803d]"
                      >
                        Harvest Another
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          onClose();
                        }}
                        className="pixel-btn pixel-box-sm bg-[#5b21b6] px-4 py-2 font-pixel text-xs text-white hover:bg-[#4c1d95]"
                      >
                        Return to Shop
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                      <IngredientSprite id="burnt_scale" className="h-12 w-12 shrink-0" />
                      <div>
                        <h4 className="font-pixel text-sm text-[#b91c1c]">
                          OOPS! MISFIRED HARVEST — RECEIVED A BURNT SCALE (-1 VITALITY)
                        </h4>
                        <p className="text-xs text-[#7f1d1d]">
                          Correct Answer: <strong>{currentQuestion.correctAnswer}</strong>. The Spellbook marked this question for extra practice!
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleNextQuestion}
                        className="pixel-btn pixel-box-sm bg-[#dc2626] px-4 py-2 font-pixel text-xs text-white hover:bg-[#b91c1c]"
                      >
                        Try Another Question
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
