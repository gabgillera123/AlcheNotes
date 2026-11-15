import React, { useState } from 'react';
import {
  IngredientId,
  INGREDIENTS,
  POTION_RECIPES,
  PRESET_DECKS,
  PotionRecipe,
  StudyQuestion,
  parseReviewerText,
} from '../game/rules';
import { IngredientSprite, SpellbookSprite } from './PixelSprites';
import { sound } from '../utils/sound';

interface SpellbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'recipes' | 'reviewer' | 'import';
  inventory: Record<IngredientId, number>;
  activeRecipeId: string;
  questions: StudyQuestion[];
  activeSubject: string;
  onSelectPresetDeck: (deckKey: string) => void;
  onAddQuestion: (q: StudyQuestion) => void;
  onImportQuestions: (newQuestions: StudyQuestion[], subjectName: string) => void;
  onQuickLoadCauldron: (recipe: PotionRecipe) => void;
  onOpenGatherForIngredient: (ingId: IngredientId) => void;
}

export const SpellbookModal: React.FC<SpellbookModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'recipes',
  inventory,
  activeRecipeId,
  questions,
  activeSubject,
  onSelectPresetDeck,
  onAddQuestion,
  onImportQuestions,
  onQuickLoadCauldron,
  onOpenGatherForIngredient,
}) => {
  const [tab, setTab] = useState<'recipes' | 'reviewer' | 'import'>(initialTab);

  // Add Single Flashcard form state
  const [qText, setQText] = useState('');
  const [correctAns, setCorrectAns] = useState('');
  const [wrong1, setWrong1] = useState('');
  const [wrong2, setWrong2] = useState('');
  const [tfStmt, setTfStmt] = useState('');
  const [tfBool, setTfBool] = useState(true);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Bulk CSV / Text Import state
  const [customSubject, setCustomSubject] = useState('My Exam Notes');
  const [rawImportText, setRawImportText] = useState('');
  const [importStatus, setImportStatus] = useState('');

  if (!isOpen) return null;

  const handleAddCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!qText.trim() || !correctAns.trim()) {
      setFormError('Please enter both a Question and its Correct Answer.');
      return;
    }

    const w1 = wrong1.trim() || 'None of the above';
    const w2 = wrong2.trim() || 'Only applies at compile time';
    const w3 = 'Does not affect runtime state';

    const newCard: StudyQuestion = {
      id: `user_card_${Date.now()}`,
      subject: activeSubject,
      question: qText.trim(),
      correctAnswer: correctAns.trim(),
      options: [correctAns.trim(), w1, w2, w3],
      tfStatement:
        tfStmt.trim() ||
        `For "${qText.trim()}", the correct answer is "${correctAns.trim()}".`,
      tfAnswer: tfBool,
      hint: `Starts with "${correctAns.trim().slice(0, 10)}..."`,
      wrongCount: 0,
      correctCount: 0,
      masteryStreak: 0,
      needsPractice: false,
    };

    sound.playHarvestSuccess();
    onAddQuestion(newCard);
    setQText('');
    setCorrectAns('');
    setWrong1('');
    setWrong2('');
    setTfStmt('');
    setFormSuccess('Added flashcard to your Magical Spellbook!');
  };

  const handleBulkImport = (e: React.FormEvent) => {
    e.preventDefault();
    setImportStatus('');
    if (!rawImportText.trim()) {
      setImportStatus('Error: Please paste at least one "Question | Answer" line or upload a file.');
      return;
    }
    const parsed = parseReviewerText(rawImportText, customSubject);
    if (parsed.length === 0) {
      setImportStatus('Error: Could not parse lines. Use "Question | Answer" or "Question, Answer" format.');
      return;
    }
    sound.playPotionPoof();
    onImportQuestions(parsed, customSubject.trim() || 'Custom Reviewer');
    setRawImportText('');
    setImportStatus(`Success! Transformed ${parsed.length} study notes into Spellbook flashcards.`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = String(ev.target?.result || '');
      setRawImportText(content);
      const baseName = file.name.replace(/\.(csv|txt|md)$/i, '');
      if (baseName) setCustomSubject(baseName);
    };
    reader.readAsText(file);
  };

  const needsPracticeCount = questions.filter((q) => q.needsPractice).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="spellbook-modal-title"
    >
      <div className="pixel-box relative flex max-h-[90vh] w-full max-w-4xl flex-col bg-[#fdf6e3] text-[#1e1b2e]">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b-4 border-[#181020] bg-[#5b21b6] px-5 py-3 text-white">
          <div className="flex items-center gap-3">
            <SpellbookSprite className="h-9 w-9" />
            <div>
              <h2 id="spellbook-modal-title" className="font-pixel text-lg tracking-wide text-[#fde047]">
                ALCHEMIST SPELLBOOK & STUDY REVIEWER
              </h2>
              <p className="text-xs text-purple-200">
                Active Deck: {activeSubject} · {questions.length} Flashcards · {needsPracticeCount} Needs Practice
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="pixel-btn pixel-box-sm bg-[#ef4444] px-3 py-1 font-pixel text-sm text-white hover:bg-[#dc2626]"
            aria-label="Close Spellbook"
          >
            X
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b-4 border-[#181020] bg-[#e6d5b8] px-5 py-2.5">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setTab('recipes');
            }}
            className={`pixel-btn pixel-box-sm px-4 py-1.5 font-pixel text-xs whitespace-nowrap shrink-0 ${
              tab === 'recipes'
                ? 'bg-[#7c3aed] text-white'
                : 'bg-[#fdf6e3] text-[#1e1b2e] hover:bg-white'
            }`}
          >
            Potion Recipes
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setTab('reviewer');
            }}
            className={`pixel-btn pixel-box-sm px-4 py-1.5 font-pixel text-xs whitespace-nowrap shrink-0 ${
              tab === 'reviewer'
                ? 'bg-[#7c3aed] text-white'
                : 'bg-[#fdf6e3] text-[#1e1b2e] hover:bg-white'
            }`}
          >
            Study Flashcards ({questions.length})
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setTab('import');
            }}
            className={`pixel-btn pixel-box-sm px-4 py-1.5 font-pixel text-xs whitespace-nowrap shrink-0 ${
              tab === 'import'
                ? 'bg-[#7c3aed] text-white'
                : 'bg-[#fdf6e3] text-[#1e1b2e] hover:bg-white'
            }`}
          >
            Load / Upload Reviewer (CSV/TXT)
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'recipes' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
                <p className="text-sm font-medium text-[#4a3f5c]">
                  Check what ingredients each customer potion requires. If you are out of an ingredient, gather it in the Greenhouse or Monster Den!
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {POTION_RECIPES.map((recipe) => {
                  const isCustomerOrder = recipe.id === activeRecipeId;
                  const missingIngredients: IngredientId[] = [];
                  for (const [ingId, reqQty] of Object.entries(recipe.ingredients)) {
                    const have = inventory[ingId as IngredientId] || 0;
                    if (have < (reqQty || 0)) {
                      missingIngredients.push(ingId as IngredientId);
                    }
                  }
                  const canLoadAll = missingIngredients.length === 0;

                  return (
                    <div
                      key={recipe.id}
                      className={`pixel-box-sm flex flex-col justify-between p-4 ${
                        isCustomerOrder ? 'bg-[#fef3c7]' : 'bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            {isCustomerOrder && (
                              <span className="font-pixel text-[11px] font-bold text-[#d97706]">
                                ★ CURRENT CUSTOMER ORDER
                              </span>
                            )}
                            <h3 className="font-pixel text-base text-[#1e1b2e]">{recipe.name}</h3>
                          </div>
                          <span className="font-mono-tabular text-sm font-bold text-[#b45309]">
                            {recipe.baseGold} Gold
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-[#4a3f5c]">{recipe.description}</p>

                        {/* Required Ingredients List */}
                        <div className="mt-3 space-y-2 border-t border-[#e5dec9] pt-3">
                          <div className="font-pixel text-[11px] text-[#5b21b6]">REQUIRED INGREDIENTS:</div>
                          {Object.entries(recipe.ingredients).map(([ingKey, reqCount]) => {
                            const ingId = ingKey as IngredientId;
                            const ingDef = INGREDIENTS[ingId];
                            const ownedCount = inventory[ingId] || 0;
                            const enough = ownedCount >= (reqCount || 0);

                            return (
                              <div
                                key={ingId}
                                className="flex items-center justify-between text-xs font-semibold"
                              >
                                <div className="flex items-center gap-2">
                                  <IngredientSprite id={ingId} className="h-7 w-7" />
                                  <span>
                                    {reqCount}x {ingDef.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`font-mono-tabular ${
                                      enough ? 'text-[#15803d]' : 'text-[#dc2626]'
                                    }`}
                                  >
                                    In Stock: {ownedCount}/{reqCount}
                                  </span>
                                  {!enough && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        sound.playClick();
                                        onClose();
                                        onOpenGatherForIngredient(ingId);
                                      }}
                                      className="pixel-btn bg-[#7c3aed] px-2 py-0.5 font-pixel text-[10px] text-white hover:bg-[#6d28d9]"
                                    >
                                      Gather
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="mt-4 pt-2">
                        {canLoadAll ? (
                          <button
                            type="button"
                            onClick={() => {
                              sound.playPlop();
                              onQuickLoadCauldron(recipe);
                              onClose();
                            }}
                            className="pixel-btn pixel-box-sm w-full bg-[#16a34a] py-2 font-pixel text-xs text-white hover:bg-[#15803d]"
                          >
                            Toss Ingredients Into Cauldron
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              sound.playClick();
                              onClose();
                              onOpenGatherForIngredient(missingIngredients[0]);
                            }}
                            className="pixel-btn pixel-box-sm w-full bg-[#f59e0b] py-2 font-pixel text-xs text-[#181020] hover:bg-[#fbbf24]"
                          >
                            Out of {INGREDIENTS[missingIngredients[0]].name} — Go Study & Gather!
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'reviewer' && (
            <div className="space-y-6">
              {/* Preset Deck Switcher */}
              <div className="pixel-box-sm bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-pixel text-xs text-[#5b21b6]">SWITCH STUDY SUBJECT DECK</h3>
                    <p className="text-xs text-[#4a3f5c]">
                      Pick a built-in exam reviewer or add your own flashcards below.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(PRESET_DECKS).map(([key, deck]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          onSelectPresetDeck(key);
                        }}
                        className={`pixel-btn pixel-box-sm px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 ${
                          activeSubject === deck.subject
                            ? 'bg-[#5b21b6] text-white'
                            : 'bg-[#f3e8ff] text-[#4c1d95] hover:bg-[#e9d5ff]'
                        }`}
                      >
                        Load {deck.title}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Add New Flashcard Form */}
              <form onSubmit={handleAddCardSubmit} className="pixel-box-sm space-y-3 bg-white p-4">
                <h3 className="font-pixel text-xs text-[#1e1b2e]">ADD NEW EXAM QUESTION TO SPELLBOOK</h3>
                {formError && (
                  <p className="text-xs font-semibold text-[#dc2626]" role="alert">
                    {formError}
                  </p>
                )}
                {formSuccess && (
                  <p className="text-xs font-semibold text-[#15803d]" role="status">
                    {formSuccess}
                  </p>
                )}
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <label htmlFor="add-q-input" className="block text-xs font-bold text-[#1e1b2e]">
                      Question Prompt *
                    </label>
                    <input
                      id="add-q-input"
                      type="text"
                      value={qText}
                      onChange={(e) => setQText(e.target.value)}
                      placeholder="e.g., What is a Deadlock in Operating Systems?"
                      className="mt-1 w-full border-2 border-[#181020] bg-[#fdf6e3] px-3 py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label htmlFor="add-ans-input" className="block text-xs font-bold text-[#1e1b2e]">
                      Correct Answer *
                    </label>
                    <input
                      id="add-ans-input"
                      type="text"
                      value={correctAns}
                      onChange={(e) => setCorrectAns(e.target.value)}
                      placeholder="e.g., When two or more processes wait indefinitely for resources"
                      className="mt-1 w-full border-2 border-[#181020] bg-[#fdf6e3] px-3 py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label htmlFor="add-w1-input" className="block text-xs font-bold text-[#1e1b2e]">
                      Wrong Option 1 (Optional)
                    </label>
                    <input
                      id="add-w1-input"
                      type="text"
                      value={wrong1}
                      onChange={(e) => setWrong1(e.target.value)}
                      placeholder="e.g., A fast CPU cache flush"
                      className="mt-1 w-full border-2 border-[#181020] bg-[#fdf6e3] px-3 py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label htmlFor="add-w2-input" className="block text-xs font-bold text-[#1e1b2e]">
                      Wrong Option 2 (Optional)
                    </label>
                    <input
                      id="add-w2-input"
                      type="text"
                      value={wrong2}
                      onChange={(e) => setWrong2(e.target.value)}
                      placeholder="e.g., Automatic garbage collection"
                      className="mt-1 w-full border-2 border-[#181020] bg-[#fdf6e3] px-3 py-1.5 text-xs"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap items-end justify-between gap-3 pt-1">
                  <div className="flex-1">
                    <label htmlFor="add-tf-input" className="block text-xs font-bold text-[#1e1b2e]">
                      Cauldron True/False Stabilization Fact (Optional)
                    </label>
                    <input
                      id="add-tf-input"
                      type="text"
                      value={tfStmt}
                      onChange={(e) => setTfStmt(e.target.value)}
                      placeholder="Auto-generated if left blank"
                      className="mt-1 w-full border-2 border-[#181020] bg-[#fdf6e3] px-3 py-1.5 text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label htmlFor="add-tf-select" className="text-xs font-bold">
                      Fact is:
                    </label>
                    <select
                      id="add-tf-select"
                      value={tfBool ? 'true' : 'false'}
                      onChange={(e) => setTfBool(e.target.value === 'true')}
                      className="border-2 border-[#181020] bg-[#fdf6e3] px-2 py-1.5 text-xs font-bold"
                    >
                      <option value="true">TRUE</option>
                      <option value="false">FALSE</option>
                    </select>
                    <button
                      type="submit"
                      className="pixel-btn pixel-box-sm bg-[#7c3aed] px-4 py-1.5 font-pixel text-xs text-white hover:bg-[#6d28d9] whitespace-nowrap shrink-0"
                    >
                      + Add to Spellbook
                    </button>
                  </div>
                </div>
              </form>

              {/* Current Flashcards & Spaced Repetition Mastery List */}
              <div className="space-y-2">
                <h3 className="font-pixel text-xs text-[#5b21b6]">
                  ACTIVE SPELLBOOK FLASHCARDS & SPACED REPETITION TRACKER
                </h3>
                <div className="space-y-2">
                  {questions.map((q, index) => (
                    <div
                      key={q.id}
                      className={`pixel-box-sm flex flex-col justify-between gap-2 p-3 md:flex-row md:items-center ${
                        q.needsPractice ? 'bg-[#fee2e2]' : 'bg-white'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#1e1b2e]">
                          <span className="font-mono-tabular text-[#5b21b6]">#{index + 1}</span>
                          <span>{q.question}</span>
                        </div>
                        <p className="text-xs text-[#15803d]">
                          <strong>Answer:</strong> {q.correctAnswer}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3 text-xs font-mono-tabular">
                        {q.needsPractice && (
                          <span className="font-pixel text-[10px] font-bold text-[#dc2626]">
                            NEEDS PRACTICE (PRIORITY)
                          </span>
                        )}
                        <span className="text-[#4a3f5c]">
                          Streak: <strong>{q.masteryStreak}</strong> · Missed: <strong>{q.wrongCount}</strong>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'import' && (
            <form onSubmit={handleBulkImport} className="space-y-4">
              <div className="pixel-box-sm space-y-3 bg-white p-4">
                <h3 className="font-pixel text-sm text-[#5b21b6]">
                  UPLOAD OR PASTE YOUR REAL-LIFE STUDY NOTES (TXT / CSV)
                </h3>
                <p className="text-xs text-[#4a3f5c]">
                  Upload a <code>.txt</code> or <code>.csv</code> file, or paste your study notes below using{' '}
                  <code>Question | Answer</code> or <code>Question, Answer</code> on each line.
                </p>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="reviewer-subject-input" className="block text-xs font-bold text-[#1e1b2e]">
                      Subject / Exam Title
                    </label>
                    <input
                      id="reviewer-subject-input"
                      type="text"
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                      className="mt-1 w-full border-2 border-[#181020] bg-[#fdf6e3] px-3 py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label htmlFor="reviewer-file-upload" className="block text-xs font-bold text-[#1e1b2e]">
                      Upload .TXT or .CSV File
                    </label>
                    <input
                      id="reviewer-file-upload"
                      type="file"
                      accept=".txt,.csv,.md"
                      onChange={handleFileUpload}
                      className="mt-1 w-full border-2 border-[#181020] bg-[#fdf6e3] px-3 py-1 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="reviewer-raw-textarea" className="block text-xs font-bold text-[#1e1b2e]">
                    Paste Reviewer Notes (One Question & Answer per line)
                  </label>
                  <textarea
                    id="reviewer-raw-textarea"
                    rows={6}
                    value={rawImportText}
                    onChange={(e) => setRawImportText(e.target.value)}
                    placeholder={`What is the difference between an Abstract Class and an Interface? | An abstract class can hold state and concrete methods; an interface defines a contract.\nWhat is Encapsulation? | Bundling data with methods that operate on that data.\nWhat is a Binary Search Tree lookup complexity? | O(log n)`}
                    className="mt-1 w-full border-2 border-[#181020] bg-[#fdf6e3] p-3 font-mono text-xs"
                  />
                </div>

                {importStatus && (
                  <p
                    className={`text-xs font-bold ${
                      importStatus.startsWith('Error') ? 'text-[#dc2626]' : 'text-[#15803d]'
                    }`}
                    role="status"
                  >
                    {importStatus}
                  </p>
                )}

                <div className="flex justify-end gap-3">
                  <button
                    type="submit"
                    className="pixel-btn pixel-box-sm bg-[#16a34a] px-5 py-2 font-pixel text-xs text-white hover:bg-[#15803d]"
                  >
                    Transform Notes Into Magical Spellbook
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
