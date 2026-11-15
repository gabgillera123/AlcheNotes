export type IngredientId = 'ice_berry' | 'dragon_scale' | 'moonwater' | 'mandrake_root' | 'burnt_scale';

export interface IngredientDef {
  id: IngredientId;
  name: string;
  zone: 'Greenhouse' | 'Monster Den' | 'Mystic Spring' | 'Scrap';
  description: string;
  color: string;
}

export interface StudyQuestion {
  id: string;
  subject: string;
  question: string;
  correctAnswer: string;
  options: string[];
  tfStatement: string;
  tfAnswer: boolean;
  hint: string;
  wrongCount: number;
  correctCount: number;
  masteryStreak: number;
  needsPractice: boolean;
}

export interface PotionRecipe {
  id: string;
  name: string;
  description: string;
  cureEffect: string;
  ingredients: Partial<Record<IngredientId, number>>;
  baseGold: number;
  color: string;
}

export interface CustomerOrder {
  id: string;
  customerName: string;
  customerTitle: string;
  ailmentState: 'flaming_hair' | 'frog_voice' | 'starry_drowsy' | 'drake_sneeze';
  curedText: string;
  dialogue: string;
  recipeId: string;
  rewardGold: number;
}

export type UpgradeId = 'hint_owl' | 'golden_cauldron' | 'enchanted_shears' | 'crystal_heart';

export interface ShopUpgrade {
  id: UpgradeId;
  name: string;
  cost: number;
  description: string;
  effectSummary: string;
}

export interface BrewedPotion {
  recipeId: string;
  name: string;
  stars: 3 | 5;
}

export const INGREDIENTS: Record<IngredientId, IngredientDef> = {
  ice_berry: {
    id: 'ice_berry',
    name: 'Ice Berry',
    zone: 'Greenhouse',
    description: 'Chilled crimson frost-berries harvested from the snow-glass conservatory.',
    color: '#f43f5e',
  },
  moonwater: {
    id: 'moonwater',
    name: 'Moonwater Vial',
    zone: 'Mystic Spring',
    description: 'Luminescent lavender dew collected under a crescent moon.',
    color: '#a855f7',
  },
  mandrake_root: {
    id: 'mandrake_root',
    name: 'Mandrake Essence',
    zone: 'Greenhouse',
    description: 'Soothing emerald botanical tonic distilled from singing roots.',
    color: '#22c55e',
  },
  dragon_scale: {
    id: 'dragon_scale',
    name: 'Dragon Scale',
    zone: 'Monster Den',
    description: 'A shimmering, heat-proof azure scale shed by a cavern drake.',
    color: '#38bdf8',
  },
  burnt_scale: {
    id: 'burnt_scale',
    name: 'Burnt Scale',
    zone: 'Scrap',
    description: 'A charred scale from a misfired quiz harvest. Can be transmuted (2 -> 1 Dragon Scale).',
    color: '#78716c',
  },
};

export const POTION_RECIPES: PotionRecipe[] = [
  {
    id: 'cooling_elixir',
    name: 'Cooling Elixir',
    description: 'Instantly douses magical hair-fires and calms pre-exam jitters.',
    cureEffect: 'Extinguishes flaming wizard hair!',
    ingredients: {
      ice_berry: 2,
      dragon_scale: 1,
    },
    baseGold: 110,
    color: '#38bdf8',
  },
  {
    id: 'croak_cure_tonic',
    name: 'Croak-Cure Tonic',
    description: 'Restores noble vocal cords cursed with amphibious ribbits.',
    cureEffect: 'Cures frog-croak voice curse!',
    ingredients: {
      moonwater: 2,
      mandrake_root: 1,
    },
    baseGold: 125,
    color: '#a855f7',
  },
  {
    id: 'focus_draught',
    name: 'Starlight Focus Elixir',
    description: 'Sharpens memory recall and banishes late-night study fatigue.',
    cureEffect: 'Awakens sleepy stargazers!',
    ingredients: {
      ice_berry: 1,
      moonwater: 1,
      dragon_scale: 1,
    },
    baseGold: 140,
    color: '#34d399',
  },
  {
    id: 'drake_soother',
    name: 'Emberward Brew',
    description: 'Shields cloaks and armor from baby dragon sneezes and sparks.',
    cureEffect: 'Fireproofs scorched gear!',
    ingredients: {
      mandrake_root: 2,
      dragon_scale: 1,
    },
    baseGold: 150,
    color: '#fb923c',
  },
];

export const CUSTOMER_QUEUE: CustomerOrder[] = [
  {
    id: 'cust_ignis',
    customerName: 'Ignis the Apprentice',
    customerTitle: 'Stressed Wizard Student',
    ailmentState: 'flaming_hair',
    dialogue: 'Please, I need a Cooling Elixir before my presentation! My hair literally caught fire while cramming!',
    curedText: 'Ahhh, sweet frost! My hair is out and I feel ready to ace my defense! Here is your gold!',
    recipeId: 'cooling_elixir',
    rewardGold: 110,
  },
  {
    id: 'cust_croaks',
    customerName: 'Sir Reginald',
    customerTitle: 'Cursed Royal Knight',
    ailmentState: 'frog_voice',
    dialogue: 'RIBBIT! I mean—pardon me! A bog witch hexed my voice into a frog croak. Please brew a Croak-Cure Tonic!',
    curedText: 'By my sword, my baritone voice has returned! Take these gold coins, Master Alchemist!',
    recipeId: 'croak_cure_tonic',
    rewardGold: 125,
  },
  {
    id: 'cust_lyra',
    customerName: 'Lyra Starweaver',
    customerTitle: 'Sleepy Guild Astronomer',
    ailmentState: 'starry_drowsy',
    dialogue: 'Yaaawn... The comet passes at midnight and my eyelids feel like lead. I need a Starlight Focus Elixir!',
    curedText: 'My mind is crystal clear! I can see every constellation now. Thank you so much!',
    recipeId: 'focus_draught',
    rewardGold: 140,
  },
  {
    id: 'cust_ember',
    customerName: 'Keeper Vaelen',
    customerTitle: 'Drake Sanctuary Warden',
    ailmentState: 'drake_sneeze',
    dialogue: 'The hatchlings have the hiccups and keep singeing my beard! Could you brew an Emberward Brew?',
    curedText: 'Not a single singed whisker! You are the finest alchemist in the realm!',
    recipeId: 'drake_soother',
    rewardGold: 150,
  },
];

export const SHOP_UPGRADES: ShopUpgrade[] = [
  {
    id: 'hint_owl',
    name: 'Hint Owl Familiar',
    cost: 80,
    description: 'A wise barn owl perches in your shop and whispers a clue or eliminates 2 wrong options on tough flashcards.',
    effectSummary: 'Whispers clues & eliminates 2 wrong answers',
  },
  {
    id: 'golden_cauldron',
    name: 'Golden Cauldron',
    cost: 100,
    description: 'An enchanted gilded cauldron that grants +15s extra quiz time and boosts 5-Star Potion gold payouts by +25%.',
    effectSummary: '+15s Quiz Time & +25% Gold on 5-Star Potions',
  },
  {
    id: 'enchanted_shears',
    name: 'Enchanted Foraging Shears',
    cost: 120,
    description: 'Harvests +1 bonus ingredient whenever you answer a study question with a Mastery Streak of 2 or higher.',
    effectSummary: '+1 Bonus Ingredient on 2+ Study Streaks',
  },
  {
    id: 'crystal_heart',
    name: 'Crystal Ward Heart',
    cost: 90,
    description: 'Increases your maximum Alchemist Vitality by +1 heart and restores all lost vitality pips.',
    effectSummary: '+1 Max Vitality & Full Heal',
  },
];

export const PRESET_DECKS: Record<string, { title: string; subject: string; questions: StudyQuestion[] }> = {
  cs_oop: {
    title: 'CS & Object-Oriented Programming',
    subject: 'Computer Science',
    questions: [
      {
        id: 'cs_1',
        subject: 'Computer Science',
        question: 'What is the difference between an Abstract Class and an Interface?',
        correctAnswer: 'An abstract class can hold state and concrete methods; an interface defines a contract of behavior.',
        options: [
          'An abstract class can hold state and concrete methods; an interface defines a contract of behavior.',
          'An interface can be instantiated directly with new, whereas an abstract class cannot.',
          'Abstract classes only allow private methods, while interfaces only allow static variables.',
          'There is no difference; both compile into identical singleton instances.',
        ],
        tfStatement: 'An abstract class can contain both abstract method signatures and concrete implemented methods.',
        tfAnswer: true,
        hint: 'Think about which one can store instance fields (state) and shared method bodies vs. pure contracts.',
        wrongCount: 0,
        correctCount: 0,
        masteryStreak: 0,
        needsPractice: false,
      },
      {
        id: 'cs_2',
        subject: 'Computer Science',
        question: 'Which OOP principle bundles data with the methods that operate on that data while restricting direct access?',
        correctAnswer: 'Encapsulation',
        options: [
          'Encapsulation',
          'Polymorphism',
          'Multiple Inheritance',
          'Garbage Collection',
        ],
        tfStatement: 'Encapsulation encourages exposing all internal class fields as public global variables.',
        tfAnswer: false,
        hint: 'It acts like a protective capsule around internal object state using private/protected modifiers.',
        wrongCount: 0,
        correctCount: 0,
        masteryStreak: 0,
        needsPractice: false,
      },
      {
        id: 'cs_3',
        subject: 'Computer Science',
        question: 'What is the time complexity of searching for a key in a balanced Binary Search Tree (BST)?',
        correctAnswer: 'O(log n)',
        options: [
          'O(log n)',
          'O(n^2)',
          'O(n!)',
          'O(1) worst-case always',
        ],
        tfStatement: 'Halving the search space at each tree level results in logarithmic O(log n) lookup time.',
        tfAnswer: true,
        hint: 'Each comparison cuts the remaining subtree roughly in half.',
        wrongCount: 0,
        correctCount: 0,
        masteryStreak: 0,
        needsPractice: false,
      },
      {
        id: 'cs_4',
        subject: 'Computer Science',
        question: 'What does Runtime Polymorphism (Dynamic Dispatch) allow a program to do?',
        correctAnswer: 'Resolve calls to overridden methods at runtime based on the actual object type.',
        options: [
          'Resolve calls to overridden methods at runtime based on the actual object type.',
          'Convert source code into machine assembly without a compiler.',
          'Automatically delete unused database tables during startup.',
          'Prevent any subclass from inheriting parent methods.',
        ],
        tfStatement: 'Method overriding enables a subclass to provide a specific implementation of a method defined in its superclass.',
        tfAnswer: true,
        hint: 'One interface, many implementations chosen dynamically when the program runs.',
        wrongCount: 0,
        correctCount: 0,
        masteryStreak: 0,
        needsPractice: false,
      },
      {
        id: 'cs_5',
        subject: 'Computer Science',
        question: 'Which data structure operates strictly on a Last-In, First-Out (LIFO) principle?',
        correctAnswer: 'Stack',
        options: [
          'Stack',
          'Queue',
          'Min-Heap',
          'Adjacency Matrix',
        ],
        tfStatement: 'Function call frames are managed using a LIFO Call Stack.',
        tfAnswer: true,
        hint: 'Think of a stack of potion plates: the last one placed on top is the first one removed.',
        wrongCount: 0,
        correctCount: 0,
        masteryStreak: 0,
        needsPractice: false,
      },
    ],
  },
  biology_cell: {
    title: 'Cellular Biology & Genetics',
    subject: 'Biology',
    questions: [
      {
        id: 'bio_1',
        subject: 'Biology',
        question: 'Which organelle is responsible for generating most of the cell’s ATP through oxidative phosphorylation?',
        correctAnswer: 'Mitochondria',
        options: [
          'Mitochondria',
          'Golgi Apparatus',
          'Lysosome',
          'Smooth Endoplasmic Reticulum',
        ],
        tfStatement: 'Mitochondria contain their own circular DNA and double membrane.',
        tfAnswer: true,
        hint: 'Known as the powerhouse of the eukaryotic cell.',
        wrongCount: 0,
        correctCount: 0,
        masteryStreak: 0,
        needsPractice: false,
      },
      {
        id: 'bio_2',
        subject: 'Biology',
        question: 'During which phase of mitosis do sister chromatids separate and move toward opposite poles?',
        correctAnswer: 'Anaphase',
        options: [
          'Anaphase',
          'Prophase',
          'Metaphase',
          'Interphase',
        ],
        tfStatement: 'During Metaphase, chromosomes align along the middle equatorial plate before separating in Anaphase.',
        tfAnswer: true,
        hint: 'Starts with "A" for "Apart" / "Away".',
        wrongCount: 0,
        correctCount: 0,
        masteryStreak: 0,
        needsPractice: false,
      },
      {
        id: 'bio_3',
        subject: 'Biology',
        question: 'What is the role of mRNA during protein synthesis?',
        correctAnswer: 'Carries the genetic code transcribed from DNA to the ribosome for translation.',
        options: [
          'Carries the genetic code transcribed from DNA to the ribosome for translation.',
          'Breaks down lipid bilayers into simple sugars.',
          'Pumps sodium and potassium ions across the axon membrane.',
          'Stores starch granules inside plant plastids.',
        ],
        tfStatement: 'Ribosomes translate mRNA codons into polypeptide amino acid chains.',
        tfAnswer: true,
        hint: 'The "m" stands for Messenger.',
        wrongCount: 0,
        correctCount: 0,
        masteryStreak: 0,
        needsPractice: false,
      },
    ],
  },
};

export function createInitialInventory(): Record<IngredientId, number> {
  return {
    ice_berry: 2,
    dragon_scale: 0,
    moonwater: 2,
    mandrake_root: 1,
    burnt_scale: 0,
  };
}

/**
 * Adaptive Spaced Repetition:
 * Questions with `needsPractice` or higher `wrongCount` get prioritized so the player
 * practices missed flashcards more frequently until mastered (`masteryStreak >= 2`).
 */
export function pickNextQuestion(
  questions: StudyQuestion[],
  lastQuestionId?: string
): StudyQuestion {
  if (questions.length === 0) {
    return PRESET_DECKS.cs_oop.questions[0];
  }
  if (questions.length === 1) {
    return questions[0];
  }

  // Filter out the immediate last question if there are other needsPractice cards or options
  const candidates = questions.filter((q) => q.id !== lastQuestionId);
  const pool = candidates.length > 0 ? candidates : questions;

  // Sort by priority score: needsPractice (+100), wrongCount * 30, minus masteryStreak * 15
  const scored = [...pool].sort((a, b) => {
    const scoreA =
      (a.needsPractice ? 100 : 0) +
      a.wrongCount * 35 -
      a.masteryStreak * 15 -
      a.correctCount * 5;
    const scoreB =
      (b.needsPractice ? 100 : 0) +
      b.wrongCount * 35 -
      b.masteryStreak * 15 -
      b.correctCount * 5;
    return scoreB - scoreA;
  });

  return scored[0];
}

/**
 * Updates spaced repetition telemetry after answering a study flashcard.
 */
export function recordQuestionOutcome(
  questions: StudyQuestion[],
  questionId: string,
  isCorrect: boolean
): StudyQuestion[] {
  return questions.map((q) => {
    if (q.id !== questionId) return q;
    if (isCorrect) {
      const nextStreak = q.masteryStreak + 1;
      // Mastered once they answer it right 2 times in a row after missing it
      const clearedNeedsPractice = q.needsPractice ? nextStreak >= 2 : false;
      return {
        ...q,
        correctCount: q.correctCount + 1,
        masteryStreak: nextStreak,
        needsPractice: q.needsPractice && !clearedNeedsPractice,
      };
    } else {
      return {
        ...q,
        wrongCount: q.wrongCount + 1,
        masteryStreak: 0,
        needsPractice: true,
      };
    }
  });
}

/**
 * Checks whether the cauldron currently holds the exact or sufficient ingredients for a recipe.
 */
export function canBrewRecipe(
  cauldronContents: Partial<Record<IngredientId, number>>,
  recipe: PotionRecipe
): boolean {
  for (const [ingId, requiredQty] of Object.entries(recipe.ingredients)) {
    const current = cauldronContents[ingId as IngredientId] || 0;
    if (current < (requiredQty || 0)) {
      return false;
    }
  }
  return true;
}

/**
 * Evaluates the star quality and gold payout of a brewed potion.
 */
export function calculateOrderPayout(
  baseGold: number,
  stars: 3 | 5,
  hasGoldenCauldron: boolean
): number {
  const starMultiplier = stars === 5 ? 1.0 : 0.7;
  const cauldronMultiplier = stars === 5 && hasGoldenCauldron ? 1.25 : 1.0;
  return Math.round(baseGold * starMultiplier * cauldronMultiplier);
}

/**
 * Parses user-uploaded or pasted Reviewer text/CSV lines into StudyQuestion items.
 * Accepts lines formatted as:
 * Question | Answer
 * Question, Answer
 * Q: ... / A: ...
 */
export function parseReviewerText(
  rawText: string,
  subjectName: string = 'Custom Reviewer'
): StudyQuestion[] {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#'));

  const parsedPairs: { question: string; answer: string }[] = [];

  for (const line of lines) {
    let parts: string[] = [];
    if (line.includes('|')) {
      parts = line.split('|').map((s) => s.trim());
    } else if (line.includes('\t')) {
      parts = line.split('\t').map((s) => s.trim());
    } else if (line.includes(',')) {
      const idx = line.indexOf(',');
      parts = [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
    } else if (line.includes(' - ')) {
      const idx = line.indexOf(' - ');
      parts = [line.slice(0, idx).trim(), line.slice(idx + 3).trim()];
    }

    if (parts.length >= 2 && parts[0].length >= 3 && parts[1].length >= 1) {
      // Skip header rows like "Question,Answer"
      if (
        parts[0].toLowerCase() === 'question' &&
        parts[1].toLowerCase() === 'answer'
      ) {
        continue;
      }
      parsedPairs.push({ question: parts[0], answer: parts[1] });
    }
  }

  if (parsedPairs.length === 0) {
    return [];
  }

  const fallbackDistractors = [
    'It only occurs during compile-time static linking.',
    'A deprecated protocol replaced by direct memory paging.',
    'None of the above; the process is strictly irreversible.',
    'An unindexed pointer reference in global heap storage.',
  ];

  return parsedPairs.map((pair, idx) => {
    const otherAnswers = parsedPairs
      .filter((_, i) => i !== idx)
      .map((p) => p.answer);

    const distractors: string[] = [];
    for (const ans of otherAnswers) {
      if (distractors.length < 3 && ans !== pair.answer && !distractors.includes(ans)) {
        distractors.push(ans);
      }
    }
    for (const fb of fallbackDistractors) {
      if (distractors.length < 3 && fb !== pair.answer && !distractors.includes(fb)) {
        distractors.push(fb);
      }
    }

    const options = [pair.answer, ...distractors.slice(0, 3)];
    const cleanQ = pair.question.replace(/\?$/, '');

    return {
      id: `custom_${Date.now()}_${idx}`,
      subject: subjectName.trim() || 'Custom Reviewer',
      question: pair.question.endsWith('?') ? pair.question : `${pair.question}?`,
      correctAnswer: pair.answer,
      options,
      tfStatement: `Regarding "${cleanQ}": The correct answer is "${pair.answer}".`,
      tfAnswer: true,
      hint: `Starts with "${pair.answer.slice(0, Math.min(12, pair.answer.length))}..."`,
      wrongCount: 0,
      correctCount: 0,
      masteryStreak: 0,
      needsPractice: false,
    };
  });
}
