import React, { useState, useEffect, useCallback } from 'react';
import {
  BrewedPotion,
  CUSTOMER_QUEUE,
  IngredientId,
  INGREDIENTS,
  POTION_RECIPES,
  PRESET_DECKS,
  PotionRecipe,
  StudyQuestion,
  UpgradeId,
  calculateOrderPayout,
  canBrewRecipe,
  createInitialInventory,
  recordQuestionOutcome,
} from './game/rules';
import {
  CauldronSprite,
  CustomerSprite,
  HintOwlSprite,
  IngredientSprite,
  SpellbookSprite,
} from './components/PixelSprites';
import { SpellbookModal } from './components/SpellbookModal';
import { GatherIngredientsModal } from './components/GatherIngredientsModal';
import { CauldronStabilizeModal } from './components/CauldronStabilizeModal';
import { UpgradesModal } from './components/UpgradesModal';
import { sound } from './utils/sound';

type GameState = 'title' | 'playing' | 'paused' | 'gameover';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') {
        return 'playing';
      }
    }
    return 'title';
  });

  // Reviewer & Study Deck State
  const [activeSubject, setActiveSubject] = useState<string>(
    PRESET_DECKS.cs_oop.subject
  );
  const [questions, setQuestions] = useState<StudyQuestion[]>(() =>
    structuredClone(PRESET_DECKS.cs_oop.questions)
  );

  // Shop Inventory, Cauldron, & Economy State
  const [inventory, setInventory] = useState<Record<IngredientId, number>>(() =>
    createInitialInventory()
  );
  const [cauldronContents, setCauldronContents] = useState<
    Partial<Record<IngredientId, number>>
  >({});
  const [brewedPotion, setBrewedPotion] = useState<BrewedPotion | null>(null);

  // Customer Queue & Progression
  const [customerIdx, setCustomerIdx] = useState<number>(0);
  const [customerCured, setCustomerCured] = useState<boolean>(false);
  const [customersServedCount, setCustomersServedCount] = useState<number>(0);

  // Player Stats & Upgrades
  const [gold, setGold] = useState<number>(50);
  const [vitality, setVitality] = useState<number>(3);
  const [maxVitality, setMaxVitality] = useState<number>(3);
  const [ownedUpgrades, setOwnedUpgrades] = useState<UpgradeId[]>([]);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Active Modals
  const [spellbookOpen, setSpellbookOpen] = useState<boolean>(false);
  const [spellbookTab, setSpellbookTab] = useState<'recipes' | 'reviewer' | 'import'>('recipes');
  const [gatherOpen, setGatherOpen] = useState<boolean>(false);
  const [gatherTargetIng, setGatherTargetIng] = useState<IngredientId>('dragon_scale');
  const [stabilizeOpen, setStabilizeOpen] = useState<boolean>(false);
  const [upgradesOpen, setUpgradesOpen] = useState<boolean>(false);
  const [guideMinimized, setGuideMinimized] = useState<boolean>(false);
  const [shopNotice, setShopNotice] = useState<string>(
    'Ignis the Apprentice rushed in with flaming hair! Check the recipe or gather a Dragon Scale!'
  );

  // Frozen end-of-shift snapshot for Victory / Game Over modal
  const [endRunSummary, setEndRunSummary] = useState<{
    victory: boolean;
    served: number;
    finalGold: number;
    masteredCount: number;
  } | null>(null);

  const currentCustomer = CUSTOMER_QUEUE[customerIdx % CUSTOMER_QUEUE.length];
  const currentRecipe =
    POTION_RECIPES.find((r) => r.id === currentCustomer.recipeId) || POTION_RECIPES[0];

  const hasGoldenCauldron = ownedUpgrades.includes('golden_cauldron');
  const hasHintOwl = ownedUpgrades.includes('hint_owl');
  const hasEnchantedShears = ownedUpgrades.includes('enchanted_shears');

  // Sync gameState to document.body.dataset.state
  useEffect(() => {
    document.body.dataset.state = gameState;
  }, [gameState]);

  const startNewGame = useCallback(() => {
    sound.playHarvestSuccess();
    setInventory(createInitialInventory());
    setCauldronContents({});
    setBrewedPotion(null);
    setCustomerIdx(0);
    setCustomerCured(false);
    setCustomersServedCount(0);
    setGold(50);
    setVitality(3);
    setMaxVitality(3);
    setOwnedUpgrades([]);
    setEndRunSummary(null);
    setSpellbookOpen(false);
    setGatherOpen(false);
    setStabilizeOpen(false);
    setUpgradesOpen(false);
    setShopNotice(
      'Welcome to your shift! Ignis needs a Cooling Elixir (2 Ice Berries + 1 Dragon Scale).'
    );
    setGameState('playing');
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, []);

  // Keyboard shortcuts for Title Start, Pause, Spellbook, Gather, Upgrades
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (gameState === 'title') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          startNewGame();
        }
        return;
      }

      if (gameState === 'playing') {
        if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
          if (spellbookOpen || gatherOpen || stabilizeOpen || upgradesOpen) {
            setSpellbookOpen(false);
            setGatherOpen(false);
            setStabilizeOpen(false);
            setUpgradesOpen(false);
          } else {
            e.preventDefault();
            setGameState('paused');
          }
        } else if (e.key.toLowerCase() === 'b' && !gatherOpen && !stabilizeOpen) {
          setSpellbookTab('recipes');
          setSpellbookOpen((prev) => !prev);
        } else if (e.key.toLowerCase() === 'g' && !spellbookOpen && !stabilizeOpen) {
          setGatherOpen((prev) => !prev);
        } else if (e.key.toLowerCase() === 'u' && !spellbookOpen && !gatherOpen) {
          setUpgradesOpen((prev) => !prev);
        } else if (e.key.toLowerCase() === 'm') {
          sound.muted = !sound.muted;
          setIsMuted(sound.muted);
        }
      } else if (gameState === 'paused') {
        if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
          e.preventDefault();
          setGameState('playing');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    gameState,
    spellbookOpen,
    gatherOpen,
    stabilizeOpen,
    upgradesOpen,
    startNewGame,
  ]);

  // Handlers for Reviewer Deck
  const handleSelectPresetDeck = (deckKey: string) => {
    const preset = PRESET_DECKS[deckKey];
    if (!preset) return;
    setActiveSubject(preset.subject);
    setQuestions(structuredClone(preset.questions));
    setShopNotice(`Loaded "${preset.title}" (${preset.questions.length} cards) into your Spellbook!`);
  };

  const handleAddQuestion = (newQ: StudyQuestion) => {
    setQuestions((prev) => [newQ, ...prev]);
    setShopNotice(`Added new flashcard to "${activeSubject}" Spellbook!`);
  };

  const handleImportQuestions = (newQs: StudyQuestion[], subjectName: string) => {
    setActiveSubject(subjectName);
    setQuestions(newQs);
    setShopNotice(`Loaded ${newQs.length} custom flashcards for "${subjectName}"!`);
  };

  // Handler for Harvesting Ingredients in Greenhouse / Monster Den
  const handleHarvestResult = (
    ingredientId: IngredientId,
    questionId: string,
    isCorrect: boolean
  ) => {
    const targetQ = questions.find((q) => q.id === questionId);
    const nextStreak = isCorrect && targetQ ? targetQ.masteryStreak + 1 : 0;
    const updatedQuestions = recordQuestionOutcome(questions, questionId, isCorrect);
    setQuestions(updatedQuestions);

    if (isCorrect) {
      const bonusQty = hasEnchantedShears && nextStreak >= 2 ? 2 : 1;
      setInventory((prev) => ({
        ...prev,
        [ingredientId]: (prev[ingredientId] || 0) + bonusQty,
      }));
      setShopNotice(
        `Harvested +${bonusQty} shiny ${INGREDIENTS[ingredientId].name}! Ready to brew at the Cauldron!`
      );
    } else {
      // Wrong answer gives a Burnt Scale and costs 1 Vitality pip
      setInventory((prev) => ({
        ...prev,
        burnt_scale: (prev.burnt_scale || 0) + 1,
      }));
      const nextVit = vitality - 1;
      setVitality(nextVit);
      setShopNotice(
        `Misfired harvest! Got 1 Burnt Scale and lost 1 Vitality. That question is now prioritized for practice!`
      );

      if (nextVit <= 0) {
        const mastered = updatedQuestions.filter((q) => q.correctCount > 0 && !q.needsPractice).length;
        setEndRunSummary({
          victory: false,
          served: customersServedCount,
          finalGold: gold,
          masteredCount: mastered,
        });
        setGatherOpen(false);
        setGameState('gameover');
      }
    }
  };

  const handleTransmuteBurntScales = () => {
    if (inventory.burnt_scale < 2) return;
    setInventory((prev) => ({
      ...prev,
      burnt_scale: prev.burnt_scale - 2,
      dragon_scale: prev.dragon_scale + 1,
    }));
    setShopNotice('Reforged 2 Burnt Scales into 1 shiny Dragon Scale!');
  };

  // Toss single ingredient from shelf into Cauldron
  const handleTossIngredient = (ingId: IngredientId) => {
    if (brewedPotion) {
      setShopNotice('Serve or clear the current brewed potion before tossing more ingredients!');
      return;
    }
    const available = inventory[ingId] || 0;
    if (available <= 0) {
      sound.playClick();
      setGatherTargetIng(ingId);
      setGatherOpen(true);
      return;
    }

    sound.playPlop();
    setInventory((prev) => ({
      ...prev,
      [ingId]: prev[ingId] - 1,
    }));
    setCauldronContents((prev) => ({
      ...prev,
      [ingId]: (prev[ingId] || 0) + 1,
    }));
    setShopNotice(`Tossed 1x ${INGREDIENTS[ingId].name} into the bubbling cauldron!`);
  };

  // Quick-load all required ingredients for a recipe into the Cauldron
  const handleQuickLoadCauldron = (recipe: PotionRecipe) => {
    if (brewedPotion) return;
    // First return any existing cauldron items to shelf
    const restoredInv = { ...inventory };
    for (const [k, qty] of Object.entries(cauldronContents)) {
      restoredInv[k as IngredientId] = (restoredInv[k as IngredientId] || 0) + (qty || 0);
    }

    // Check if restoredInv has enough for recipe
    for (const [ingKey, reqQty] of Object.entries(recipe.ingredients)) {
      const id = ingKey as IngredientId;
      if ((restoredInv[id] || 0) < (reqQty || 0)) {
        setGatherTargetIng(id);
        setGatherOpen(true);
        return;
      }
    }

    // Deduct recipe ingredients and place in cauldron
    const nextCauldron: Partial<Record<IngredientId, number>> = {};
    for (const [ingKey, reqQty] of Object.entries(recipe.ingredients)) {
      const id = ingKey as IngredientId;
      restoredInv[id] -= reqQty || 0;
      nextCauldron[id] = reqQty || 0;
    }

    sound.playPlop();
    setInventory(restoredInv);
    setCauldronContents(nextCauldron);
    setShopNotice(
      `Loaded all ingredients for ${recipe.name} into the cauldron! Click "Brew & Stabilize" on the cauldron!`
    );
  };

  const handleEmptyCauldron = () => {
    sound.playClick();
    const restored = { ...inventory };
    for (const [k, qty] of Object.entries(cauldronContents)) {
      restored[k as IngredientId] = (restored[k as IngredientId] || 0) + (qty || 0);
    }
    setInventory(restored);
    setCauldronContents({});
    setShopNotice('Returned cauldron ingredients back to your shelf.');
  };

  // Complete Cauldron True/False Stabilization
  const handleCompleteBrew = (
    stars: 3 | 5,
    questionId: string,
    isCorrect: boolean
  ) => {
    setQuestions((prev) => recordQuestionOutcome(prev, questionId, isCorrect));
    setCauldronContents({});
    setBrewedPotion({
      recipeId: currentRecipe.id,
      name: currentRecipe.name,
      stars,
    });
    setStabilizeOpen(false);
    setShopNotice(
      `POOF! Brewed a ${stars}-Star ${currentRecipe.name}! Hand it to ${currentCustomer.customerName}!`
    );
  };

  // Serve Brewed Potion to Customer
  const handleServeCustomer = () => {
    if (!brewedPotion) return;
    sound.playGoldCoins();
    const payout = calculateOrderPayout(
      currentCustomer.rewardGold,
      brewedPotion.stars,
      hasGoldenCauldron
    );
    const nextGold = gold + payout;
    const nextServed = customersServedCount + 1;

    setGold(nextGold);
    setCustomersServedCount(nextServed);
    setBrewedPotion(null);
    setCustomerCured(true);
    setShopNotice(
      `${currentCustomer.customerName} is cured! Paid +${payout} Gold Coins (${brewedPotion.stars}-Star quality)!`
    );
  };

  const handleNextCustomer = () => {
    sound.playClick();
    if (customersServedCount >= CUSTOMER_QUEUE.length) {
      const mastered = questions.filter((q) => q.correctCount > 0 && !q.needsPractice).length;
      setEndRunSummary({
        victory: true,
        served: customersServedCount,
        finalGold: gold,
        masteredCount: mastered,
      });
      setGameState('gameover');
      return;
    }
    setCustomerCured(false);
    setCustomerIdx((prev) => prev + 1);
    const nextCust = CUSTOMER_QUEUE[(customerIdx + 1) % CUSTOMER_QUEUE.length];
    const nextRec = POTION_RECIPES.find((r) => r.id === nextCust.recipeId);
    setShopNotice(
      `New customer arrived: ${nextCust.customerName} wants a ${nextRec?.name}!`
    );
  };

  const handleBuyUpgrade = (upgradeId: UpgradeId, cost: number) => {
    if (gold < cost || ownedUpgrades.includes(upgradeId)) return;
    setGold((prev) => prev - cost);
    setOwnedUpgrades((prev) => [...prev, upgradeId]);

    if (upgradeId === 'crystal_heart') {
      setMaxVitality((m) => m + 1);
      setVitality((m) => Math.max(m, maxVitality + 1));
    }
    setShopNotice(`Purchased ${upgradeId.replace('_', ' ').toUpperCase()} upgrade!`);
  };

  const totalCauldronItems = Object.values(cauldronContents).reduce(
    (acc, v) => acc + (v || 0),
    0
  );
  const readyToBrewCurrentOrder = canBrewRecipe(cauldronContents, currentRecipe);

  // Check if player has enough shelf + cauldron stock for currentRecipe
  const missingForCurrentOrder: IngredientId[] = [];
  for (const [ingKey, reqQty] of Object.entries(currentRecipe.ingredients)) {
    const id = ingKey as IngredientId;
    const totalOwned = (inventory[id] || 0) + (cauldronContents[id] || 0);
    if (totalOwned < (reqQty || 0)) {
      missingForCurrentOrder.push(id);
    }
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#1a1025] select-none">
      {/* =====================================================================
          STAGE 1: TITLE SCREEN OVERLAY (`gameState === 'title'`)
      ===================================================================== */}
      {gameState === 'title' && (
        <section
          className="relative z-40 flex min-h-screen w-full flex-col items-center justify-between px-6 py-10 text-white"
          style={{
            background:
              'radial-gradient(circle at 50% 28%, #4c1d95 0%, #2e1065 48%, #140924 100%)',
          }}
        >
          {/* Top Quiet Context Line */}
          <div className="font-pixel text-xs tracking-widest text-purple-200">
            COZY 2D MAGICAL POTION SHOP & EXAM STUDY GAME
          </div>

          {/* Centerpiece Emblem & Start Lockup */}
          <div className="my-auto flex max-w-2xl flex-col items-center text-center">
            {/* Custom Inline SVG Crest Lockup */}
            <div className="mb-4 flex items-center justify-center gap-6">
              <SpellbookSprite className="h-20 w-20" />
              <CauldronSprite isGolden={false} isBubblingFast={false} className="h-28 w-28" />
              <IngredientSprite id="dragon_scale" className="h-20 w-20" />
            </div>

            <svg
              viewBox="0 0 540 84"
              className="w-full max-w-xl"
              role="img"
              aria-label="QuizAlchemist"
            >
              <rect x="6" y="6" width="528" height="72" fill="#181020" />
              <rect x="10" y="10" width="520" height="64" fill="#5b21b6" />
              <rect x="14" y="14" width="512" height="56" fill="#4c1d95" />
              <text
                x="270"
                y="53"
                textAnchor="middle"
                fill="#fde047"
                fontFamily="Silkscreen, monospace"
                fontSize="36"
                fontWeight="bold"
              >
                QUIZ ALCHEMIST
              </text>
            </svg>

            <p className="mt-4 max-w-lg text-sm leading-relaxed text-purple-100 md:text-base">
              Load your real-life exam notes into a magical Spellbook, harvest rare Dragon Scales &
              Ice Berries by answering study flashcards, and brew 5-Star Elixirs for quirky customers!
            </p>

            {/* Quick Subject Picker on Title Screen */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <span className="font-pixel text-xs text-[#fde047]">STUDY DECK:</span>
              {Object.entries(PRESET_DECKS).map(([key, deck]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    handleSelectPresetDeck(key);
                  }}
                  className={`pixel-btn pixel-box-sm px-3 py-1.5 text-xs font-bold whitespace-nowrap shrink-0 ${
                    activeSubject === deck.subject
                      ? 'bg-[#fde047] text-[#181020]'
                      : 'bg-[#3b0764] text-purple-100 hover:bg-[#5b21b6]'
                  }`}
                >
                  {deck.title}
                </button>
              ))}
            </div>

            {/* Primary Start CTA (<3 menu actions) */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                data-start="true"
                onClick={startNewGame}
                className="pixel-btn pixel-box bg-[#a3e635] px-8 py-4 font-pixel text-lg font-bold text-[#181020] hover:bg-[#bef264]"
              >
                OPEN POTION SHOP
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setSpellbookTab('import');
                  setSpellbookOpen(true);
                }}
                className="pixel-btn pixel-box bg-[#7c3aed] px-5 py-4 font-pixel text-sm text-white hover:bg-[#6d28d9]"
              >
                UPLOAD / EDIT REVIEWER
              </button>
            </div>
          </div>

          {/* Flat Single-Line Control Hint at Bottom Margin */}
          <div className="font-pixel text-xs text-purple-300">
            Enter / Space Start · [B] Spellbook · [G] Gather Ingredients · [U] Shop Upgrades · [P] Pause
          </div>
        </section>
      )}

      {/* =====================================================================
          STAGE 2: ACTIVE SHOP VIEWPORT (`gameState !== 'title'`)
          Matches /public/assets/aistudio/image_0de59231.png 1-to-1!
      ===================================================================== */}
      {gameState !== 'title' && (
        <div className="relative mx-auto flex min-h-screen max-w-[1440px] flex-col justify-between">
          {/* Top World-Matched HUD Strip */}
          <div className="z-20 flex flex-wrap items-center justify-between gap-4 border-b-4 border-[#181020] bg-[#27153d] px-5 py-2.5 text-white">
            {/* Left Cluster: Vitality Pips, Gold Coins, Shift Progress */}
            <div className="flex flex-wrap items-center gap-6">
              {/* Discrete Vitality Pips */}
              <div className="flex items-center gap-2" aria-label={`Vitality ${vitality} of ${maxVitality}`}>
                <span className="font-pixel text-[11px] text-purple-300">VITALITY</span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: maxVitality }).map((_, i) => {
                    const isFull = i < vitality;
                    return (
                      <svg
                        key={i}
                        viewBox="0 0 16 16"
                        className="h-5 w-5"
                        shapeRendering="crispEdges"
                        aria-hidden="true"
                      >
                        <path
                          d="M2 4h4v2h4V4h4v5h-2v2h-2v2H6v-2H4V9H2V4z"
                          fill="#181020"
                        />
                        <path
                          d="M3 5h3v2h4V5h3v4h-2v2H9v2H7v-2H5V9H3V5z"
                          fill={isFull ? '#ef4444' : '#334155'}
                        />
                        {isFull && <rect x="4" y="6" width="2" height="2" fill="#fca5a5" />}
                      </svg>
                    );
                  })}
                </div>
              </div>

              {/* Gold Readout */}
              <div className="flex items-center gap-2">
                <span className="font-pixel text-[11px] text-purple-300">GOLD</span>
                <span
                  data-testid="gold-display"
                  className="font-mono-tabular font-pixel text-base font-bold text-[#fde047]"
                >
                  {Math.round(gold)}G
                </span>
              </div>

              {/* Customer Wave Progress */}
              <div className="flex items-center gap-2">
                <span className="font-pixel text-[11px] text-purple-300">ORDERS</span>
                <span className="font-mono-tabular font-pixel text-sm text-[#bef264]">
                  {customersServedCount}/{CUSTOMER_QUEUE.length}
                </span>
              </div>

              {/* Active Reviewer Subject & Spaced Repetition Count */}
              <div className="hidden lg:flex items-center gap-2 text-xs text-purple-200">
                <span>Spellbook: <strong>{activeSubject}</strong> ({questions.length} cards)</span>
                {questions.some((q) => q.needsPractice) && (
                  <span className="font-pixel text-[10px] text-[#fca5a5]">
                    · {questions.filter((q) => q.needsPractice).length} Needs Practice
                  </span>
                )}
              </div>
            </div>

            {/* Right Cluster: Upgrades & Utility Controls */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={(e) => {
                  e.currentTarget.blur();
                  sound.playClick();
                  setUpgradesOpen(true);
                }}
                className="pixel-btn pixel-box-sm bg-[#f59e0b] px-3 py-1 font-pixel text-xs font-bold text-[#181020] hover:bg-[#fbbf24] whitespace-nowrap shrink-0"
              >
                Shop Upgrades ({ownedUpgrades.length}/4)
              </button>

              <button
                type="button"
                tabIndex={-1}
                onClick={(e) => {
                  e.currentTarget.blur();
                  sound.muted = !sound.muted;
                  setIsMuted(sound.muted);
                }}
                className="pixel-btn pixel-box-sm bg-[#4c1d95] px-2.5 py-1 font-pixel text-xs text-white hover:bg-[#5b21b6]"
                aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                title="Mute [M]"
              >
                {isMuted ? 'MUTE' : 'SFX'}
              </button>

              <button
                type="button"
                tabIndex={-1}
                onClick={(e) => {
                  e.currentTarget.blur();
                  sound.playClick();
                  setGameState('paused');
                }}
                className="pixel-btn pixel-box-sm bg-[#4c1d95] px-2.5 py-1 font-pixel text-xs text-white hover:bg-[#5b21b6]"
                aria-label="Pause Game"
                title="Pause [P]"
              >
                PAUSE
              </button>

              <button
                type="button"
                tabIndex={-1}
                onClick={(e) => {
                  e.currentTarget.blur();
                  startNewGame();
                }}
                className="pixel-btn pixel-box-sm bg-[#4c1d95] px-2.5 py-1 font-pixel text-xs text-white hover:bg-[#5b21b6]"
                aria-label="Restart Shift"
                title="Restart [R]"
              >
                RESTART
              </button>
            </div>
          </div>

          {/* ===================================================================
              MAIN SHOP INTERIOR SCENE (Matches Reference Image Layout!)
          =================================================================== */}
          <div className="relative flex flex-1 flex-col justify-between overflow-hidden">
            {/* Pixel Brick Wall Backdrop (Purple & Warm Coral/Peach horizontal bands) */}
            <div
              className="absolute inset-0 z-0"
              style={{
                backgroundColor: '#7e3af2',
                backgroundImage: `
                  linear-gradient(to bottom,
                    rgba(109, 40, 217, 0.92) 0%,
                    rgba(124, 58, 237, 0.9) 24%,
                    rgba(251, 146, 60, 0.85) 24%,
                    rgba(251, 113, 133, 0.85) 54%,
                    rgba(124, 58, 237, 0.92) 54%,
                    rgba(91, 33, 182, 0.96) 100%
                  ),
                  repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 20px,
                    #3b0764 20px,
                    #3b0764 24px
                  ),
                  repeating-linear-gradient(
                    90deg,
                    transparent,
                    transparent 44px,
                    #3b0764 44px,
                    #3b0764 48px
                  )
                `,
              }}
            />

            {/* Upper Shop Room Area (Left Window & Gather Button, Center Door & Customer, Right Wooden Shelf) */}
            <div className="relative z-10 grid flex-1 grid-cols-1 gap-6 px-6 pt-5 lg:grid-cols-12">
              {/* LEFT ZONE (Cols 1-4): "GATHER INGREDIENTS" Pixel Pill + Sunny Window with Yellow Curtains */}
              <div className="flex flex-col items-start justify-between lg:col-span-4">
                {/* Top-Left Pixel Pill Button: GATHER INGREDIENTS (Matches reference!) */}
                <button
                  type="button"
                  aria-label="Gather Ingredients"
                  onClick={() => {
                    sound.playClick();
                    setGatherTargetIng(
                      missingForCurrentOrder[0] || 'dragon_scale'
                    );
                    setGatherOpen(true);
                  }}
                  className="pixel-btn pixel-box bg-white px-6 py-3 text-center font-pixel text-sm font-bold leading-tight text-[#181020] hover:bg-[#fef08a]"
                >
                  GATHER <br /> INGREDIENTS
                </button>

                {/* Sunny Shop Window with Golden Pixel Curtains (Matches reference!) */}
                <div className="my-4 self-center lg:self-start lg:ml-6">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setGatherTargetIng(missingForCurrentOrder[0] || 'ice_berry');
                      setGatherOpen(true);
                    }}
                    className="group relative block focus:outline-none"
                    title="Visit Greenhouse & Monster Den"
                  >
                    <div className="pixel-box relative h-52 w-64 overflow-hidden bg-[#38bdf8] border-4 border-white">
                      {/* Sky & Fluffy Clouds */}
                      <div className="absolute top-4 left-6 h-5 w-14 bg-white opacity-90" />
                      <div className="absolute top-8 right-6 h-6 w-16 bg-white opacity-90" />
                      {/* Diagonal Glass Panes Reflection */}
                      <div
                        className="absolute inset-0 opacity-25"
                        style={{
                          backgroundImage:
                            'repeating-linear-gradient(-45deg, transparent, transparent 14px, #ffffff 14px, #ffffff 20px)',
                        }}
                      />
                      {/* Rolling Green Hills Outside */}
                      <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#22c55e] border-t-4 border-[#15803d]" />
                      <div className="absolute bottom-0 right-0 h-20 w-36 rounded-tl-full bg-[#16a34a]" />
                      {/* Center White Window Frame Crossbar */}
                      <div className="absolute inset-y-0 left-1/2 w-2.5 -translate-x-1/2 bg-white" />
                      <div className="absolute inset-x-0 bottom-0 h-3 bg-[#78350f]" />

                      {/* Hover prompt */}
                      <span className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-[#181020]/85 px-2 py-0.5 font-pixel text-[10px] text-[#bef264] opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap">
                        Go to Greenhouse →
                      </span>
                    </div>

                    {/* Left & Right Golden-Yellow Pixel Curtains */}
                    <div className="pointer-events-none absolute -top-2 -left-5 h-56 w-10 border-4 border-[#181020] bg-[#facc15]">
                      <div className="h-full w-3 bg-[#eab308]" />
                      <div className="absolute top-1/2 left-0 right-0 h-3 bg-[#b45309]" />
                    </div>
                    <div className="pointer-events-none absolute -top-2 -right-5 h-56 w-10 border-4 border-[#181020] bg-[#facc15]">
                      <div className="h-full w-3 bg-[#eab308]" />
                      <div className="absolute top-1/2 left-0 right-0 h-3 bg-[#b45309]" />
                    </div>
                  </button>
                </div>

                {/* Equipped Hint Owl Familiar Perch if Purchased */}
                {hasHintOwl && (
                  <div className="pixel-box-sm mb-2 flex items-center gap-2 bg-[#fef3c7] px-3 py-1.5 text-xs font-bold text-[#78350f]">
                    <HintOwlSprite className="h-8 w-8" />
                    <span>Hint Owl Perched & Ready!</span>
                  </div>
                )}
              </div>

              {/* CENTER ZONE (Cols 5-8): Wooden Arched Door + Quirky Customer at Counter */}
              <div className="flex flex-col items-center justify-end lg:col-span-4">
                <div className="relative flex flex-col items-center">
                  {/* Arched Wooden Shop Door Behind Customer (Matches Reference Image!) */}
                  <div className="relative flex h-64 w-44 flex-col justify-between rounded-t-full border-8 border-[#181020] bg-[#7c4a2d] pt-10 shadow-inner">
                    {/* Vertical Wood Plank Lines */}
                    <div
                      className="absolute inset-0 opacity-30"
                      style={{
                        backgroundImage:
                          'repeating-linear-gradient(90deg, transparent, transparent 18px, #3e2723 18px, #3e2723 21px)',
                      }}
                    />
                    {/* Horizontal Iron Door Bands */}
                    <div className="relative z-10 h-5 w-full border-y-2 border-[#181020] bg-[#94a3b8]" />
                    <div className="relative z-10 mb-8 flex h-5 w-full items-center justify-end border-y-2 border-[#181020] bg-[#94a3b8] pr-3">
                      <div className="h-4 w-5 bg-[#f59e0b] border border-[#181020]" />
                    </div>

                    {/* Quirky Customer Standing at the Shop Counter */}
                    <div className="absolute -bottom-2 left-1/2 z-20 -translate-x-1/2 flex flex-col items-center">
                      {/* Customer Nameplate */}
                      <div className="pixel-box-sm mb-1 bg-[#181020] px-3 py-0.5 text-center whitespace-nowrap">
                        <span className="font-pixel text-[11px] text-[#fde047]">
                          {currentCustomer.customerName}
                        </span>
                        <span className="block text-[10px] text-purple-200">
                          {currentCustomer.customerTitle}
                        </span>
                      </div>

                      <CustomerSprite
                        ailmentState={currentCustomer.ailmentState}
                        cured={customerCured}
                        className="h-40 w-40"
                      />
                    </div>
                  </div>

                  {/* Action Button Below Customer: Serve Brewed Potion OR Call Next Customer */}
                  <div className="mt-3 z-30">
                    {brewedPotion && !customerCured && (
                      <button
                        type="button"
                        onClick={handleServeCustomer}
                        className="pixel-btn pixel-box bg-[#a3e635] px-5 py-2.5 font-pixel text-xs font-bold text-[#181020] ring-2 ring-[#fde047] hover:bg-[#bef264]"
                      >
                        ★ Hand {brewedPotion.stars}-Star {brewedPotion.name} to{' '}
                        {currentCustomer.customerName} (+
                        {calculateOrderPayout(
                          currentCustomer.rewardGold,
                          brewedPotion.stars,
                          hasGoldenCauldron
                        )}
                        G)
                      </button>
                    )}

                    {customerCured && (
                      <button
                        type="button"
                        onClick={handleNextCustomer}
                        className="pixel-btn pixel-box bg-[#38bdf8] px-5 py-2.5 font-pixel text-xs font-bold text-[#181020] hover:bg-[#7dd3fc]"
                      >
                        {customersServedCount >= CUSTOMER_QUEUE.length
                          ? 'Complete Shift & View Summary →'
                          : 'Welcome Next Customer →'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT ZONE (Cols 9-12): Tall Wooden Apothecary Shelf with Spellbook & Ingredients */}
              <div className="flex flex-col justify-end lg:col-span-4">
                <div className="pixel-box border-4 border-[#181020] bg-[#9c6644] p-3">
                  {/* Top Wooden Crown Molding */}
                  <div className="mb-2 h-4 w-full border-2 border-[#181020] bg-[#b07d56]" />

                  {/* SHELF 1: SPELLBOOK COMPARTMENT */}
                  <div className="relative flex flex-col items-center justify-center border-4 border-[#181020] bg-[#36221c] p-4">
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setSpellbookTab('recipes');
                        setSpellbookOpen(true);
                      }}
                      className="group flex flex-col items-center focus:outline-none"
                    >
                      <SpellbookSprite className="h-20 w-20 transition-transform group-hover:scale-105" />
                      <span className="pixel-box-sm -mt-2 bg-white px-3 py-1 font-pixel text-xs font-bold text-[#181020] group-hover:bg-[#fef08a]">
                        SPELLBOOK
                      </span>
                    </button>
                  </div>

                  {/* Wooden Plank Banner: INGREDIENTS */}
                  <div className="my-2 flex justify-center">
                    <div className="pixel-box-sm border-2 border-[#181020] bg-[#d4a373] px-6 py-1 font-pixel text-xs font-bold tracking-wider text-[#181020]">
                      INGREDIENTS
                    </div>
                  </div>

                  {/* SHELF 2: ICE BERRY VIAL & MOONWATER FLASK */}
                  <div className="grid grid-cols-2 gap-2 border-4 border-[#181020] bg-[#36221c] p-3">
                    {(['ice_berry', 'moonwater'] as IngredientId[]).map((id) => {
                      const count = inventory[id] || 0;
                      const neededCount = currentRecipe.ingredients[id] || 0;
                      const inCauldron = cauldronContents[id] || 0;

                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => handleTossIngredient(id)}
                          className="pixel-btn group flex flex-col items-center rounded bg-[#271815] p-2 text-center hover:bg-[#462d26]"
                          aria-label={`${INGREDIENTS[id].name}, ${count} in stock. Click to toss into cauldron or gather more.`}
                        >
                          <IngredientSprite
                            id={id}
                            className="h-14 w-14 transition-transform group-hover:scale-105"
                          />
                          <span className="mt-1 font-pixel text-[11px] text-amber-100">
                            {INGREDIENTS[id].name}
                          </span>
                          <span
                            data-testid={`stock-${id}`}
                            className={`font-mono-tabular text-xs font-bold ${
                              count > 0 ? 'text-[#bef264]' : 'text-[#f87171]'
                            }`}
                          >
                            Stock: {count}
                            {neededCount > 0 && ` (Need ${neededCount - inCauldron})`}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Middle Shelf Divider */}
                  <div className="my-2 h-3 w-full border-2 border-[#181020] bg-[#b07d56]" />

                  {/* SHELF 3: MANDRAKE ESSENCE & SPARKLING DRAGON SCALE */}
                  <div className="grid grid-cols-2 gap-2 border-4 border-[#181020] bg-[#36221c] p-3">
                    {(['mandrake_root', 'dragon_scale'] as IngredientId[]).map((id) => {
                      const count = inventory[id] || 0;
                      const neededCount = currentRecipe.ingredients[id] || 0;
                      const inCauldron = cauldronContents[id] || 0;
                      const isMissingForOrder = neededCount > inCauldron && count === 0;

                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => handleTossIngredient(id)}
                          className={`pixel-btn group flex flex-col items-center rounded p-2 text-center ${
                            isMissingForOrder
                              ? 'bg-[#451a1c] ring-2 ring-[#f87171] hover:bg-[#5c2326]'
                              : 'bg-[#271815] hover:bg-[#462d26]'
                          }`}
                          aria-label={`${INGREDIENTS[id].name}, ${count} in stock. ${
                            count === 0 ? 'Out of stock, click to study and gather!' : 'Click to toss into cauldron.'
                          }`}
                        >
                          <IngredientSprite
                            id={id}
                            className="h-14 w-14 transition-transform group-hover:scale-105"
                          />
                          <span className="mt-1 font-pixel text-[11px] text-amber-100">
                            {INGREDIENTS[id].name}
                          </span>
                          <span
                            data-testid={`stock-${id}`}
                            className={`font-mono-tabular text-xs font-bold ${
                              count > 0 ? 'text-[#bef264]' : 'text-[#fca5a5]'
                            }`}
                          >
                            {count === 0 && isMissingForOrder
                              ? '0 (Click to Gather!)'
                              : `Stock: ${count}`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* ===================================================================
                FOREGROUND WOODEN COUNTER, CAULDRON & RETRO DIALOG WINDOW
                (Matches bottom section of reference image!)
            =================================================================== */}
            <div className="relative z-20 mt-2">
              {/* Darker Wood Wainscoting Behind Counter */}
              <div
                className="h-10 w-full border-t-4 border-[#181020]"
                style={{
                  background:
                    'repeating-linear-gradient(0deg, #8c583a, #8c583a 10px, #6f432a 10px, #6f432a 14px)',
                }}
              />

              {/* Warm Light-Wood Plank Tabletop Counter */}
              <div
                className="relative min-h-[215px] w-full border-t-4 border-[#181020] px-6 py-4"
                style={{
                  background:
                    'repeating-linear-gradient(0deg, #deb887, #deb887 22px, #cfa36e 22px, #cfa36e 26px)',
                }}
              >
                <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-6 lg:grid-cols-12">
                  {/* BOTTOM-LEFT: BUBBLING BLACK (OR GOLDEN) CAULDRON */}
                  <div className="flex flex-col items-center sm:flex-row lg:col-span-5 gap-4">
                    <div className="relative -mt-14 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          if (readyToBrewCurrentOrder) {
                            sound.playPlop();
                            setStabilizeOpen(true);
                          } else {
                            handleQuickLoadCauldron(currentRecipe);
                          }
                        }}
                        className="group relative block focus:outline-none"
                        aria-label="Alchemist Cauldron"
                      >
                        <CauldronSprite
                          isGolden={hasGoldenCauldron}
                          isBubblingFast={readyToBrewCurrentOrder}
                          ingredientCount={totalCauldronItems}
                          className="h-44 w-44 transition-transform group-hover:scale-105"
                        />
                      </button>
                    </div>

                    {/* Cauldron Recipe & Action Readout Panel */}
                    <div className="pixel-box-sm flex-1 bg-[#fdf6e3] p-3 text-[#1e1b2e]">
                      <div className="flex items-center justify-between border-b border-[#d6cbb5] pb-1">
                        <span className="font-pixel text-xs font-bold text-[#4c1d95]">
                          {hasGoldenCauldron ? '★ GOLDEN CAULDRON' : 'IRON CAULDRON'}
                        </span>
                        {totalCauldronItems > 0 && (
                          <button
                            type="button"
                            onClick={handleEmptyCauldron}
                            className="text-[11px] font-bold text-[#dc2626] underline hover:text-[#991b1b]"
                          >
                            Empty
                          </button>
                        )}
                      </div>

                      {/* Target Recipe Checklist */}
                      <div className="mt-2 space-y-1">
                        <div className="text-[11px] font-bold text-[#4a3f5c]">
                          Target: <strong>{currentRecipe.name}</strong>
                        </div>
                        {Object.entries(currentRecipe.ingredients).map(([ingKey, reqQty]) => {
                          const id = ingKey as IngredientId;
                          const inPot = cauldronContents[id] || 0;
                          const met = inPot >= (reqQty || 0);
                          return (
                            <div
                              key={id}
                              className="flex items-center justify-between text-xs font-mono-tabular"
                            >
                              <span>{INGREDIENTS[id].name}:</span>
                              <span
                                className={
                                  met ? 'font-bold text-[#15803d]' : 'font-semibold text-[#b45309]'
                                }
                              >
                                {inPot}/{reqQty} in pot
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Brew / Load Button */}
                      <div className="mt-3">
                        {brewedPotion ? (
                          <button
                            type="button"
                            onClick={handleServeCustomer}
                            className="pixel-btn pixel-box-sm w-full bg-[#16a34a] py-2 font-pixel text-xs text-white hover:bg-[#15803d]"
                          >
                            Serve {brewedPotion.stars}★ Potion!
                          </button>
                        ) : readyToBrewCurrentOrder ? (
                          <button
                            type="button"
                            onClick={() => {
                              sound.playPlop();
                              setStabilizeOpen(true);
                            }}
                            className="pixel-btn pixel-box-sm w-full bg-[#7c3aed] py-2 font-pixel text-xs text-white hover:bg-[#6d28d9] animate-pulse"
                          >
                            Brew & Stabilize Magic!
                          </button>
                        ) : missingForCurrentOrder.length === 0 ? (
                          <button
                            type="button"
                            onClick={() => handleQuickLoadCauldron(currentRecipe)}
                            className="pixel-btn pixel-box-sm w-full bg-[#16a34a] py-2 font-pixel text-xs text-white hover:bg-[#15803d]"
                          >
                            Toss {currentRecipe.name} Ingredients In
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              sound.playClick();
                              setGatherTargetIng(missingForCurrentOrder[0]);
                              setGatherOpen(true);
                            }}
                            className="pixel-btn pixel-box-sm w-full bg-[#f59e0b] py-2 font-pixel text-xs text-[#181020] hover:bg-[#fbbf24]"
                          >
                            Gather Missing {INGREDIENTS[missingForCurrentOrder[0]].name}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM-RIGHT: RETRO DIALOG & GUIDE INSTRUCTIONS WINDOW (Matches Reference Image!) */}
                  <div className="lg:col-span-7">
                    <div className="pixel-box bg-white text-[#181020]">
                      {/* Pink/Lavender Retro Title Bar (`GUIDE INSTRUCTIONS` in reference mockup) */}
                      <div className="flex items-center justify-between border-b-4 border-[#181020] bg-[#f5b8e2] px-4 py-1.5">
                        <span className="font-pixel text-xs font-bold tracking-wide text-[#181020]">
                          CUSTOMER ORDER & ALCHEMIST GUIDE — STEP-BY-STEP
                        </span>
                        <button
                          type="button"
                          onClick={() => setGuideMinimized((prev) => !prev)}
                          className="font-pixel text-xs font-bold text-[#181020] hover:text-[#7c3aed] px-1"
                          aria-label={guideMinimized ? 'Expand Guide' : 'Minimize Guide'}
                        >
                          {guideMinimized ? '+' : 'X'}
                        </button>
                      </div>

                      {!guideMinimized && (
                        <div className="p-4 space-y-3">
                          {/* Customer Speech Quote */}
                          <div className="flex flex-col justify-between gap-2 border-b border-slate-200 pb-2.5 sm:flex-row sm:items-center">
                            <p className="text-sm font-bold text-[#1e1b2e]">
                              <span className="text-[#7c3aed]">{currentCustomer.customerName}:</span>{' '}
                              "{customerCured ? currentCustomer.curedText : currentCustomer.dialogue}"
                            </p>
                          </div>

                          {/* Live Contextual Step Indicator & Actions */}
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="text-xs font-medium text-[#4a3f5c]">
                              <strong>Status:</strong> {shopNotice}
                            </p>

                            <div className="flex flex-wrap items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  sound.playClick();
                                  setSpellbookTab('recipes');
                                  setSpellbookOpen(true);
                                }}
                                className="pixel-btn pixel-box-sm bg-[#ede9fe] px-3 py-1.5 font-pixel text-[11px] text-[#4c1d95] hover:bg-[#ddd6fe]"
                              >
                                1. Recipe Book
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  sound.playClick();
                                  setGatherTargetIng(
                                    missingForCurrentOrder[0] || 'dragon_scale'
                                  );
                                  setGatherOpen(true);
                                }}
                                className="pixel-btn pixel-box-sm bg-[#dcfce7] px-3 py-1.5 font-pixel text-[11px] text-[#14532d] hover:bg-[#bbf7d0]"
                              >
                                2. Study & Gather
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  sound.playClick();
                                  setUpgradesOpen(true);
                                }}
                                className="pixel-btn pixel-box-sm bg-[#fef3c7] px-3 py-1.5 font-pixel text-[11px] text-[#78350f] hover:bg-[#fde68a]"
                              >
                                3. Buy Upgrades ({Math.round(gold)}G)
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODALS: SPELLBOOK, GREENHOUSE/MONSTER DEN, CAULDRON, UPGRADES
      ===================================================================== */}
      <SpellbookModal
        isOpen={spellbookOpen}
        onClose={() => setSpellbookOpen(false)}
        initialTab={spellbookTab}
        inventory={inventory}
        activeRecipeId={currentRecipe.id}
        questions={questions}
        activeSubject={activeSubject}
        onSelectPresetDeck={handleSelectPresetDeck}
        onAddQuestion={handleAddQuestion}
        onImportQuestions={handleImportQuestions}
        onQuickLoadCauldron={handleQuickLoadCauldron}
        onOpenGatherForIngredient={(ingId) => {
          setGatherTargetIng(ingId);
          setGatherOpen(true);
        }}
      />

      <GatherIngredientsModal
        isOpen={gatherOpen}
        onClose={() => setGatherOpen(false)}
        initialTargetIngredient={gatherTargetIng}
        inventory={inventory}
        questions={questions}
        ownedUpgrades={ownedUpgrades}
        onHarvestResult={handleHarvestResult}
        onTransmuteBurntScales={handleTransmuteBurntScales}
      />

      <CauldronStabilizeModal
        isOpen={stabilizeOpen}
        recipe={currentRecipe}
        questions={questions}
        isGoldenCauldron={hasGoldenCauldron}
        onCompleteBrew={handleCompleteBrew}
        onCancel={() => setStabilizeOpen(false)}
      />

      <UpgradesModal
        isOpen={upgradesOpen}
        onClose={() => setUpgradesOpen(false)}
        gold={gold}
        ownedUpgrades={ownedUpgrades}
        onBuyUpgrade={handleBuyUpgrade}
      />

      {/* =====================================================================
          PAUSE MODAL (`gameState === 'paused'`)
      ===================================================================== */}
      {gameState === 'paused' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pause-modal-title"
        >
          <div className="pixel-box w-full max-w-md bg-[#fdf6e3] p-6 text-center text-[#1e1b2e]">
            <h2 id="pause-modal-title" className="font-pixel text-xl text-[#4c1d95]">
              SHOP SHIFT PAUSED
            </h2>
            <p className="mt-2 text-xs text-[#4a3f5c]">
              Take a breather! Your cauldron is safely simmering.
            </p>

            <div className="my-5 grid grid-cols-3 gap-2 font-mono-tabular">
              <div className="pixel-box-sm bg-white p-2.5">
                <div className="font-pixel text-[10px] text-[#5b21b6]">GOLD</div>
                <div className="text-base font-bold">{Math.round(gold)}G</div>
              </div>
              <div className="pixel-box-sm bg-white p-2.5">
                <div className="font-pixel text-[10px] text-[#5b21b6]">SERVED</div>
                <div className="text-base font-bold">
                  {customersServedCount}/{CUSTOMER_QUEUE.length}
                </div>
              </div>
              <div className="pixel-box-sm bg-white p-2.5">
                <div className="font-pixel text-[10px] text-[#5b21b6]">CARDS</div>
                <div className="text-base font-bold">{questions.length}</div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setGameState('playing');
                }}
                className="pixel-btn pixel-box-sm bg-[#16a34a] py-2.5 font-pixel text-xs text-white hover:bg-[#15803d]"
              >
                Resume Shift
              </button>
              <button
                type="button"
                onClick={startNewGame}
                className="pixel-btn pixel-box-sm bg-[#f59e0b] py-2.5 font-pixel text-xs text-[#181020] hover:bg-[#fbbf24]"
              >
                Restart Shift
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setGameState('title');
                }}
                className="pixel-btn pixel-box-sm bg-[#4c1d95] py-2.5 font-pixel text-xs text-white hover:bg-[#5b21b6]"
              >
                Return to Title Screen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          VICTORY / GAME OVER MODAL (`gameState === 'gameover'`)
      ===================================================================== */}
      {gameState === 'gameover' && endRunSummary && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="gameover-modal-title"
        >
          <div className="pixel-box w-full max-w-md bg-[#fdf6e3] p-6 text-center text-[#1e1b2e]">
            <h2
              id="gameover-modal-title"
              className={`font-pixel text-xl ${
                endRunSummary.victory ? 'text-[#15803d]' : 'text-[#dc2626]'
              }`}
            >
              {endRunSummary.victory
                ? '★ SHIFT COMPLETE — MASTER ALCHEMIST! ★'
                : 'ALCHEMIST EXHAUSTED — SHIFT ENDED'}
            </h2>
            <p className="mt-2 text-xs text-[#4a3f5c]">
              {endRunSummary.victory
                ? 'Every quirky customer left cured and smiling, and your exam mastery grew stronger!'
                : 'You ran out of Alchemist Vitality while foraging! Review your missed flashcards and try again!'}
            </p>

            <div className="my-5 grid grid-cols-3 gap-2 font-mono-tabular">
              <div className="pixel-box-sm bg-white p-3">
                <div className="font-pixel text-[10px] text-[#5b21b6]">CUSTOMERS</div>
                <div className="text-lg font-bold">
                  {endRunSummary.served}/{CUSTOMER_QUEUE.length}
                </div>
              </div>
              <div className="pixel-box-sm bg-white p-3">
                <div className="font-pixel text-[10px] text-[#5b21b6]">TOTAL GOLD</div>
                <div className="text-lg font-bold text-[#b45309]">
                  {Math.round(endRunSummary.finalGold)}G
                </div>
              </div>
              <div className="pixel-box-sm bg-white p-3">
                <div className="font-pixel text-[10px] text-[#5b21b6]">MASTERED</div>
                <div className="text-lg font-bold text-[#15803d]">
                  {endRunSummary.masteredCount}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                data-start="true"
                onClick={startNewGame}
                className="pixel-btn pixel-box-sm bg-[#16a34a] py-3 font-pixel text-xs text-white hover:bg-[#15803d]"
              >
                {endRunSummary.victory ? 'Start Another Shift' : 'Try Again'}
              </button>
              <button
                type="button"
                onClick={() => setGameState('title')}
                className="pixel-btn pixel-box-sm bg-[#4c1d95] py-2.5 font-pixel text-xs text-white hover:bg-[#5b21b6]"
              >
                Back to Title Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
