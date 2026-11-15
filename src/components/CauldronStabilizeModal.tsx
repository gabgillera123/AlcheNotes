import React, { useState, useEffect } from 'react';
import { PotionRecipe, StudyQuestion, pickNextQuestion } from '../game/rules';
import { CauldronSprite } from './PixelSprites';
import { sound } from '../utils/sound';

interface CauldronStabilizeModalProps {
  isOpen: boolean;
  recipe: PotionRecipe | null;
  questions: StudyQuestion[];
  isGoldenCauldron: boolean;
  onCompleteBrew: (stars: 3 | 5, questionId: string, isCorrect: boolean) => void;
  onCancel: () => void;
}

export const CauldronStabilizeModal: React.FC<CauldronStabilizeModalProps> = ({
  isOpen,
  recipe,
  questions,
  isGoldenCauldron,
  onCompleteBrew,
  onCancel,
}) => {
  const [question, setQuestion] = useState<StudyQuestion>(() => pickNextQuestion(questions));
  const [result, setResult] = useState<{ isCorrect: boolean; stars: 3 | 5 } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setQuestion(pickNextQuestion(questions));
      setResult(null);
    }
  }, [isOpen, recipe]);

  if (!isOpen || !recipe) return null;

  const handleAnswerTF = (choice: boolean) => {
    if (result) return;
    const isCorrect = choice === question.tfAnswer;
    const stars: 3 | 5 = isCorrect ? 5 : 3;

    if (isCorrect) {
      sound.playPotionPoof();
    } else {
      sound.playHarvestFail();
    }

    setResult({ isCorrect, stars });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="stabilize-modal-title"
    >
      <div className="pixel-box w-full max-w-xl bg-[#fdf6e3] text-[#1e1b2e]">
        {/* Header */}
        <div className="flex items-center justify-between border-b-4 border-[#181020] bg-[#4c1d95] px-5 py-3 text-white">
          <h2 id="stabilize-modal-title" className="font-pixel text-base text-[#bef264]">
            CAULDRON BUBBLING — STABILIZE THE MAGIC!
          </h2>
          {!result && (
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onCancel();
              }}
              className="pixel-btn pixel-box-sm bg-[#ef4444] px-2.5 py-0.5 font-pixel text-xs text-white"
            >
              X
            </button>
          )}
        </div>

        <div className="p-6 text-center space-y-5">
          <div className="flex flex-col items-center">
            <CauldronSprite
              isGolden={isGoldenCauldron}
              isBubblingFast={true}
              className="h-32 w-32"
            />
            <p className="mt-2 font-pixel text-xs text-[#5b21b6]">
              BREWING: {recipe.name.toUpperCase()}
            </p>
            <p className="text-xs text-[#4a3f5c]">
              Answer this rapid-fire True/False note check to brew a <strong>5-Star Elixir</strong>!
            </p>
          </div>

          <div className="pixel-box-sm bg-white p-4 text-left">
            <div className="font-pixel text-[11px] text-[#15803d]">
              RAPID-FIRE TRUE / FALSE CHECK ({question.subject}):
            </div>
            <p className="mt-2 text-base font-bold text-[#1e1b2e]">
              "{question.tfStatement}"
            </p>
          </div>

          {!result ? (
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleAnswerTF(true)}
                className="pixel-btn pixel-box-sm bg-[#16a34a] py-3 font-pixel text-sm text-white hover:bg-[#15803d]"
              >
                TRUE
              </button>
              <button
                type="button"
                onClick={() => handleAnswerTF(false)}
                className="pixel-btn pixel-box-sm bg-[#dc2626] py-3 font-pixel text-sm text-white hover:bg-[#b91c1c]"
              >
                FALSE
              </button>
            </div>
          ) : (
            <div
              className={`pixel-box-sm p-4 space-y-3 ${
                result.isCorrect ? 'bg-[#dcfce7]' : 'bg-[#fef3c7]'
              }`}
              role="status"
            >
              <div className="font-pixel text-base text-[#1e1b2e]">
                {result.isCorrect
                  ? `POOF! ★★★★★ 5-STAR ${recipe.name.toUpperCase()} BREWED!`
                  : `FIZZLE! ★★★☆☆ 3-STAR ${recipe.name.toUpperCase()} BREWED!`}
              </div>
              <p className="text-xs text-[#4a3f5c]">
                {result.isCorrect
                  ? 'Perfect stabilization! Your potion shimmers with five-star alchemical potency!'
                  : `The statement was ${
                      question.tfAnswer ? 'TRUE' : 'FALSE'
                    }. The potion is slightly fizzy (3-Star), but still works!`}
              </p>
              <button
                type="button"
                onClick={() =>
                  onCompleteBrew(result.stars, question.id, result.isCorrect)
                }
                className="pixel-btn pixel-box-sm w-full bg-[#7c3aed] py-2.5 font-pixel text-xs text-white hover:bg-[#6d28d9]"
              >
                Bottle {result.stars}-Star {recipe.name} & Return to Counter
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
