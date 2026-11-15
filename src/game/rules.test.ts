import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PRESET_DECKS,
  POTION_RECIPES,
  createInitialInventory,
  pickNextQuestion,
  recordQuestionOutcome,
  canBrewRecipe,
  calculateOrderPayout,
  parseReviewerText,
} from './rules';

test('initial inventory starts with 2 Ice Berries and 0 Dragon Scales', () => {
  const inv = createInitialInventory();
  assert.equal(inv.ice_berry, 2);
  assert.equal(inv.dragon_scale, 0);
});

test('spaced repetition prioritizes missed questions and clears needsPractice after 2 streak', () => {
  let deck = structuredClone(PRESET_DECKS.cs_oop.questions);
  const targetId = deck[2].id;

  // Player gets question 3 wrong
  deck = recordQuestionOutcome(deck, targetId, false);
  const missedCard = deck.find((q) => q.id === targetId)!;
  assert.equal(missedCard.wrongCount, 1);
  assert.equal(missedCard.needsPractice, true);
  assert.equal(missedCard.masteryStreak, 0);

  // Next question picker should prioritize the missed question when not blocked by lastQuestionId
  const nextPick = pickNextQuestion(deck, deck[0].id);
  assert.equal(nextPick.id, targetId);

  // Answer it right once -> still needsPractice until streak reaches 2
  deck = recordQuestionOutcome(deck, targetId, true);
  assert.equal(deck.find((q) => q.id === targetId)!.needsPractice, true);

  // Answer it right a second time -> mastered! needsPractice becomes false
  deck = recordQuestionOutcome(deck, targetId, true);
  assert.equal(deck.find((q) => q.id === targetId)!.needsPractice, false);
  assert.equal(deck.find((q) => q.id === targetId)!.masteryStreak, 2);
});

test('canBrewRecipe validates Cooling Elixir ingredients (2 Ice Berries + 1 Dragon Scale)', () => {
  const coolingRecipe = POTION_RECIPES.find((r) => r.id === 'cooling_elixir')!;
  assert.equal(canBrewRecipe({ ice_berry: 2, dragon_scale: 0 }, coolingRecipe), false);
  assert.equal(canBrewRecipe({ ice_berry: 2, dragon_scale: 1 }, coolingRecipe), true);
});

test('calculateOrderPayout scales with star rating and Golden Cauldron upgrade', () => {
  assert.equal(calculateOrderPayout(100, 5, false), 100);
  assert.equal(calculateOrderPayout(100, 5, true), 125);
  assert.equal(calculateOrderPayout(100, 3, true), 70);
});

test('parseReviewerText parses pipe and comma separated flashcards into StudyQuestions', () => {
  const raw = `
    Question, Answer
    What is polymorphism? | The ability of different objects to respond to the same method call
    What is recursion?, A function that calls itself until a base case is reached
  `;
  const questions = parseReviewerText(raw, 'Midterm Exam');
  assert.equal(questions.length, 2);
  assert.equal(questions[0].subject, 'Midterm Exam');
  assert.equal(questions[0].options.length, 4);
  assert.equal(questions[0].correctAnswer, 'The ability of different objects to respond to the same method call');
});
