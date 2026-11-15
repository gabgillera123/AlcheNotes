import React, { useState } from 'react';
import { sound } from '../utils/sound';

interface JavaSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JAVA_SOURCE_CODE = `import javax.swing.*;
import javax.swing.border.EmptyBorder;
import javax.swing.filechooser.FileNameExtensionFilter;
import java.awt.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.*;
import java.util.List;

/**
 * ============================================================================
 * QUIZ ALCHEMIST — Complete 2D Java Swing & OOP Edition
 * ============================================================================
 * How to compile & run in terminal or any IDE (IntelliJ, Eclipse, NetBeans, VS Code):
 *   javac QuizAlchemist.java
 *   java QuizAlchemist
 *
 * OOP Concepts Demonstrated for Exam / Presentation Defense:
 * 1. ABSTRACTION:   abstract class ShopEntity defines base identity and abstract describeRole().
 * 2. INTERFACE:     interface StudyEvaluator and interface Brewable define behavioral contracts.
 * 3. ENCAPSULATION: Flashcard, PotionRecipe, and SpellbookDeck keep state private with controlled mutators.
 * 4. INHERITANCE:   CustomerOrder, PotionRecipe, and ShopUpgrade extend ShopEntity.
 * 5. POLYMORPHISM:  ShopUpgrade subclasses override applyUpgrade(QuizAlchemist game) dynamically.
 * ============================================================================
 */
public class QuizAlchemist extends JFrame {

    // 1. INTERFACES (Contracts of Behavior)
    public interface StudyEvaluator {
        Flashcard pickNextCard(String lastQuestionId);
        void recordOutcome(String questionId, boolean isCorrect);
    }

    public interface Brewable {
        boolean canBrew(Map<IngredientType, Integer> cauldron);
        int calculatePayout(int stars, boolean hasGoldenCauldron);
    }

    // 2. ABSTRACT CLASS (Shared State + Abstract Method)
    public static abstract class ShopEntity {
        private final String id;
        private final String name;

        public ShopEntity(String id, String name) {
            this.id = id;
            this.name = name;
        }

        public String getId() { return id; }
        public String getName() { return name; }

        public abstract String describeRole();
    }

    // 3. ENUMS & ENCAPSULATED DOMAIN MODELS
    public enum IngredientType {
        ICE_BERRY("Ice Berry", "Greenhouse", new Color(225, 29, 72)),
        MOONWATER("Moonwater Vial", "Mystic Spring", new Color(147, 51, 234)),
        MANDRAKE_ROOT("Mandrake Essence", "Greenhouse", new Color(22, 163, 74)),
        DRAGON_SCALE("Dragon Scale", "Monster Den", new Color(56, 189, 248)),
        BURNT_SCALE("Burnt Scale", "Scrap", new Color(120, 113, 108));

        private final String displayName;
        private final String zone;
        private final Color color;

        IngredientType(String displayName, String zone, Color color) {
            this.displayName = displayName;
            this.zone = zone;
            this.color = color;
        }

        public String getDisplayName() { return displayName; }
        public String getZone() { return zone; }
        public Color getColor() { return color; }
    }

    public static class Flashcard {
        private final String id;
        private final String subject;
        private final String question;
        private final String correctAnswer;
        private final List<String> options;
        private final String tfStatement;
        private final boolean tfAnswer;
        private final String hint;

        private int wrongCount = 0;
        private int correctCount = 0;
        private int masteryStreak = 0;
        private boolean needsPractice = false;

        public Flashcard(String id, String subject, String question, String correctAnswer,
                         List<String> options, String tfStatement, boolean tfAnswer, String hint) {
            this.id = id;
            this.subject = subject;
            this.question = question;
            this.correctAnswer = correctAnswer;
            this.options = new ArrayList<>(options);
            this.tfStatement = tfStatement;
            this.tfAnswer = tfAnswer;
            this.hint = hint;
        }

        public void recordAttempt(boolean isCorrect) {
            if (isCorrect) {
                this.correctCount++;
                this.masteryStreak++;
                if (this.needsPractice && this.masteryStreak >= 2) {
                    this.needsPractice = false;
                }
            } else {
                this.wrongCount++;
                this.masteryStreak = 0;
                this.needsPractice = true;
            }
        }

        public int getPriorityScore() {
            return (needsPractice ? 100 : 0) + (wrongCount * 35) - (masteryStreak * 15) - (correctCount * 5);
        }

        public String getId() { return id; }
        public String getSubject() { return subject; }
        public String getQuestion() { return question; }
        public String getCorrectAnswer() { return correctAnswer; }
        public List<String> getOptions() { return Collections.unmodifiableList(options); }
        public String getTfStatement() { return tfStatement; }
        public boolean isTfAnswer() { return tfAnswer; }
        public String getHint() { return hint; }
        public int getWrongCount() { return wrongCount; }
        public int getMasteryStreak() { return masteryStreak; }
        public boolean isNeedsPractice() { return needsPractice; }
    }

    public static class PotionRecipe extends ShopEntity implements Brewable {
        private final String description;
        private final Map<IngredientType, Integer> requiredIngredients;
        private final int baseGold;

        public PotionRecipe(String id, String name, String description,
                            Map<IngredientType, Integer> requiredIngredients, int baseGold) {
            super(id, name);
            this.description = description;
            this.requiredIngredients = new EnumMap<>(requiredIngredients);
            this.baseGold = baseGold;
        }

        @Override
        public String describeRole() {
            return getName() + " (" + baseGold + "G): " + description;
        }

        @Override
        public boolean canBrew(Map<IngredientType, Integer> cauldron) {
            for (Map.Entry<IngredientType, Integer> entry : requiredIngredients.entrySet()) {
                int inPot = cauldron.getOrDefault(entry.getKey(), 0);
                if (inPot < entry.getValue()) return false;
            }
            return true;
        }

        @Override
        public int calculatePayout(int stars, boolean hasGoldenCauldron) {
            double starMult = (stars == 5) ? 1.0 : 0.7;
            double cauldronMult = (stars == 5 && hasGoldenCauldron) ? 1.25 : 1.0;
            return (int) Math.round(baseGold * starMult * cauldronMult);
        }

        public Map<IngredientType, Integer> getRequiredIngredients() {
            return Collections.unmodifiableMap(requiredIngredients);
        }
    }

    public static class CustomerOrder extends ShopEntity {
        private final String title;
        private final String dialogue;
        private final String curedDialogue;
        private final PotionRecipe desiredRecipe;
        private final String ailmentType;

        public CustomerOrder(String id, String name, String title, String dialogue,
                             String curedDialogue, PotionRecipe desiredRecipe, String ailmentType) {
            super(id, name);
            this.title = title;
            this.dialogue = dialogue;
            this.curedDialogue = curedDialogue;
            this.desiredRecipe = desiredRecipe;
            this.ailmentType = ailmentType;
        }

        @Override
        public String describeRole() {
            return getName() + " [" + title + "] wants " + desiredRecipe.getName();
        }

        public String getTitle() { return title; }
        public String getDialogue() { return dialogue; }
        public String getCuredDialogue() { return curedDialogue; }
        public PotionRecipe getDesiredRecipe() { return desiredRecipe; }
        public String getAilmentType() { return ailmentType; }
    }

    public static abstract class ShopUpgrade extends ShopEntity {
        private final int cost;
        private final String description;
        private boolean purchased = false;

        public ShopUpgrade(String id, String name, int cost, String description) {
            super(id, name);
            this.cost = cost;
            this.description = description;
        }

        public int getCost() { return cost; }
        public String getDescription() { return description; }
        public boolean isPurchased() { return purchased; }
        public void setPurchased(boolean purchased) { this.purchased = purchased; }

        public abstract void applyUpgrade(QuizAlchemist game);
    }

    public static class SpellbookDeck implements StudyEvaluator {
        private String subjectName = "Java & OOP Exam Reviewer";
        private final List<Flashcard> cards = new ArrayList<>();

        public SpellbookDeck() {
            cards.add(new Flashcard(
                "q1", subjectName,
                "What is the difference between an Abstract Class and an Interface in Java?",
                "An abstract class can hold state (fields) and constructors; an interface defines a contract of behavior.",
                Arrays.asList(
                    "An abstract class can hold state (fields) and constructors; an interface defines a contract of behavior.",
                    "An interface can be instantiated directly with new, whereas an abstract class cannot.",
                    "Abstract classes only allow private methods, while interfaces only allow static fields.",
                    "A class can extend multiple abstract classes but implement only one interface."
                ),
                "In Java, a class can implement multiple interfaces but can only extend a single superclass.",
                true,
                "Think about which one can have instance fields and constructors vs multiple implementation."
            ));
            cards.add(new Flashcard(
                "q2", subjectName,
                "Which OOP pillar bundles fields and methods together while hiding internal state via private access?",
                "Encapsulation",
                Arrays.asList("Encapsulation", "Polymorphism", "Method Overloading", "Garbage Collection"),
                "Encapsulation recommends making all internal class fields public static variables.",
                false,
                "It acts like a protective capsule around private fields with public getters/setters."
            ));
        }

        @Override
        public Flashcard pickNextCard(String lastQuestionId) {
            List<Flashcard> pool = new ArrayList<>();
            for (Flashcard c : cards) {
                if (!c.getId().equals(lastQuestionId)) pool.add(c);
            }
            if (pool.isEmpty()) pool.addAll(cards);
            pool.sort((a, b) -> Integer.compare(b.getPriorityScore(), a.getPriorityScore()));
            return pool.get(0);
        }

        @Override
        public void recordOutcome(String questionId, boolean isCorrect) {
            for (Flashcard c : cards) {
                if (c.getId().equals(questionId)) {
                    c.recordAttempt(isCorrect);
                    break;
                }
            }
        }

        public int importLines(List<String> lines, String newSubject) {
            List<Flashcard> imported = new ArrayList<>();
            int idx = 1;
            for (String raw : lines) {
                String line = raw.trim();
                if (line.isEmpty() || line.startsWith("#")) continue;
                String[] parts = line.contains("|") ? line.split("\\\\|", 2) : line.split(",", 2);
                if (parts.length == 2) {
                    String q = parts[0].trim();
                    String a = parts[1].trim();
                    if (q.equalsIgnoreCase("question") && a.equalsIgnoreCase("answer")) continue;
                    List<String> opts = Arrays.asList(
                        a,
                        "It only applies during static bytecode compilation.",
                        "A deprecated JVM memory pointer.",
                        "None of the above."
                    );
                    imported.add(new Flashcard(
                        "custom_" + (idx++), newSubject,
                        q.endsWith("?") ? q : q + "?",
                        a, opts,
                        "Regarding \\"" + q + "\\": The correct answer is \\"" + a + "\\".",
                        true,
                        "Starts with \\"" + a.substring(0, Math.min(8, a.length())) + "...\\""
                    ));
                }
            }
            if (!imported.isEmpty()) {
                this.subjectName = newSubject;
                this.cards.clear();
                this.cards.addAll(imported);
            }
            return imported.size();
        }

        public List<Flashcard> getCards() { return cards; }
        public String getSubjectName() { return subjectName; }
    }

    // 5. SWING GAME STATE & CUSTOM 2D RENDERER
    private final SpellbookDeck spellbook = new SpellbookDeck();
    private final Map<IngredientType, Integer> inventory = new EnumMap<>(IngredientType.class);
    private final Map<IngredientType, Integer> cauldron = new EnumMap<>(IngredientType.class);
    private final List<CustomerOrder> customers = new ArrayList<>();
    private final List<ShopUpgrade> upgrades = new ArrayList<>();

    private int currentCustomerIdx = 0;
    private boolean customerCured = false;
    private Integer brewedPotionStars = null;
    private int gold = 50;
    private int vitality = 3;
    private final int maxVitality = 3;
    private boolean hasGoldenCauldron = false;
    private boolean hasHintOwl = false;
    private boolean hasEnchantedShears = false;
    private String lastQuestionId = null;
    private String statusMessage = "Ignis rushed in with flaming hair! Gather a Dragon Scale!";

    private final JLabel hudLabel = new JLabel();
    private final JTextArea dialogueArea = new JTextArea(3, 40);
    private final ShopCanvasPanel canvasPanel = new ShopCanvasPanel();
    private final JPanel shelfPanel = new JPanel(new GridLayout(5, 1, 6, 6));
    private final JButton actionBtn = new JButton();

    public QuizAlchemist() {
        super("QuizAlchemist — 2D Magical Potion Shop (Java Swing OOP Edition)");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(1120, 740);
        setLocationRelativeTo(null);
        initGameData();
        buildGuiLayout();
        refreshUi();
    }

    private void initGameData() {
        inventory.put(IngredientType.ICE_BERRY, 2);
        inventory.put(IngredientType.DRAGON_SCALE, 0);
        inventory.put(IngredientType.MOONWATER, 2);
        inventory.put(IngredientType.MANDRAKE_ROOT, 1);
        inventory.put(IngredientType.BURNT_SCALE, 0);

        Map<IngredientType, Integer> coolingMap = new EnumMap<>(IngredientType.class);
        coolingMap.put(IngredientType.ICE_BERRY, 2);
        coolingMap.put(IngredientType.DRAGON_SCALE, 1);
        PotionRecipe coolingElixir = new PotionRecipe(
            "cooling_elixir", "Cooling Elixir",
            "Instantly douses magical hair-fires before class presentations.", coolingMap, 110
        );

        Map<IngredientType, Integer> croakMap = new EnumMap<>(IngredientType.class);
        croakMap.put(IngredientType.MOONWATER, 2);
        croakMap.put(IngredientType.MANDRAKE_ROOT, 1);
        PotionRecipe croakTonic = new PotionRecipe(
            "croak_tonic", "Croak-Cure Tonic",
            "Restores noble knight voices hexed into frog croaks.", croakMap, 125
        );

        customers.add(new CustomerOrder(
            "c1", "Ignis the Apprentice", "Stressed Wizard Student",
            "\\"Please, I need a Cooling Elixir before my presentation! My hair literally caught fire!\\"",
            "\\"Ahhh, sweet frost! My flaming hair is out! Take these gold coins!\\"",
            coolingElixir, "FLAMING_HAIR"
        ));
        customers.add(new CustomerOrder(
            "c2", "Sir Reginald", "Cursed Royal Knight",
            "\\"RIBBIT! Pardon me—a bog witch turned my voice into a frog croak! I need a Croak-Cure Tonic!\\"",
            "\\"Huzzah! My royal baritone has returned! Here is your gold, Alchemist!\\"",
            croakTonic, "FROG_VOICE"
        ));

        upgrades.add(new ShopUpgrade("u_owl", "Hint Owl Familiar", 80, "Whispers a clue on tough flashcards.") {
            @Override public String describeRole() { return "Companion Upgrade"; }
            @Override public void applyUpgrade(QuizAlchemist game) { game.hasHintOwl = true; }
        });
        upgrades.add(new ShopUpgrade("u_gold", "Golden Cauldron", 100, "+25% Gold payout on 5-Star Potions.") {
            @Override public String describeRole() { return "Equipment Upgrade"; }
            @Override public void applyUpgrade(QuizAlchemist game) { game.hasGoldenCauldron = true; }
        });
        upgrades.add(new ShopUpgrade("u_shears", "Enchanted Shears", 120, "+1 Bonus Ingredient on 2+ Study Streaks.") {
            @Override public String describeRole() { return "Tool Upgrade"; }
            @Override public void applyUpgrade(QuizAlchemist game) { game.hasEnchantedShears = true; }
        });
    }

    private void buildGuiLayout() {
        setLayout(new BorderLayout());
        JPanel topBar = new JPanel(new BorderLayout(12, 0));
        topBar.setBackground(new Color(39, 21, 61));
        topBar.setBorder(new EmptyBorder(10, 16, 10, 16));
        hudLabel.setForeground(new Color(253, 224, 71));
        hudLabel.setFont(new Font(Font.MONOSPACED, Font.BOLD, 15));
        topBar.add(hudLabel, BorderLayout.WEST);

        JPanel topButtons = new JPanel(new FlowLayout(FlowLayout.RIGHT, 8, 0));
        topButtons.setOpaque(false);
        JButton gatherBtn = new JButton("Gather Ingredients");
        gatherBtn.addActionListener(e -> openGatherDialog(IngredientType.DRAGON_SCALE));
        JButton spellbookBtn = new JButton("Spellbook / Load Reviewer");
        spellbookBtn.addActionListener(e -> openSpellbookDialog());
        JButton upgradesBtn = new JButton("Shop Upgrades");
        upgradesBtn.addActionListener(e -> openUpgradesDialog());
        topButtons.add(gatherBtn);
        topButtons.add(spellbookBtn);
        topButtons.add(upgradesBtn);
        topBar.add(topButtons, BorderLayout.EAST);
        add(topBar, BorderLayout.NORTH);

        JPanel centerContainer = new JPanel(new BorderLayout());
        centerContainer.add(canvasPanel, BorderLayout.CENTER);
        shelfPanel.setBackground(new Color(156, 102, 68));
        shelfPanel.setPreferredSize(new Dimension(280, 420));
        centerContainer.add(shelfPanel, BorderLayout.EAST);
        add(centerContainer, BorderLayout.CENTER);

        JPanel bottomCounter = new JPanel(new BorderLayout(12, 8));
        bottomCounter.setBackground(new Color(222, 184, 135));
        bottomCounter.setBorder(new EmptyBorder(12, 16, 12, 16));
        dialogueArea.setEditable(false);
        dialogueArea.setLineWrap(true);
        dialogueArea.setWrapStyleWord(true);
        bottomCounter.add(dialogueArea, BorderLayout.CENTER);

        actionBtn.addActionListener(e -> handlePrimaryCounterAction());
        bottomCounter.add(actionBtn, BorderLayout.EAST);
        add(bottomCounter, BorderLayout.SOUTH);
    }

    private CustomerOrder getCurrentCustomer() {
        return customers.get(currentCustomerIdx % customers.size());
    }

    private void refreshUi() {
        CustomerOrder cust = getCurrentCustomer();
        PotionRecipe recipe = cust.getDesiredRecipe();
        hudLabel.setText(String.format("VITALITY: %d/%d | GOLD: %dG | DECK: %s (%d cards)",
            vitality, maxVitality, gold, spellbook.getSubjectName(), spellbook.getCards().size()));

        shelfPanel.removeAll();
        for (IngredientType type : new IngredientType[]{
            IngredientType.ICE_BERRY, IngredientType.MOONWATER,
            IngredientType.MANDRAKE_ROOT, IngredientType.DRAGON_SCALE
        }) {
            int stock = inventory.getOrDefault(type, 0);
            int needed = recipe.getRequiredIngredients().getOrDefault(type, 0);
            int inPot = cauldron.getOrDefault(type, 0);
            JButton btn = new JButton(type.getDisplayName() + " [Stock: " + stock + " | Pot: " + inPot + "/" + needed + "]");
            btn.addActionListener(e -> {
                if (stock > 0) {
                    inventory.put(type, stock - 1);
                    cauldron.put(type, inPot + 1);
                    refreshUi();
                } else {
                    openGatherDialog(type);
                }
            });
            shelfPanel.add(btn);
        }

        dialogueArea.setText(cust.getName() + ": " + (customerCured ? cust.getCuredDialogue() : cust.getDialogue())
            + "\\nOrder: " + recipe.getName() + " | Status: " + statusMessage);

        if (customerCured) {
            actionBtn.setText("Welcome Next Customer ->");
        } else if (brewedPotionStars != null) {
            actionBtn.setText("Serve " + brewedPotionStars + "-Star " + recipe.getName());
        } else if (recipe.canBrew(cauldron)) {
            actionBtn.setText("Brew & Stabilize Magic!");
        } else {
            actionBtn.setText("Study to Gather Missing Ingredients");
        }
        shelfPanel.revalidate();
        repaint();
    }

    private void handlePrimaryCounterAction() {
        PotionRecipe recipe = getCurrentCustomer().getDesiredRecipe();
        if (customerCured) {
            customerCured = false;
            currentCustomerIdx++;
            refreshUi();
        } else if (brewedPotionStars != null) {
            gold += recipe.calculatePayout(brewedPotionStars, hasGoldenCauldron);
            brewedPotionStars = null;
            customerCured = true;
            refreshUi();
        } else if (recipe.canBrew(cauldron)) {
            Flashcard card = spellbook.pickNextCard(lastQuestionId);
            int ans = JOptionPane.showConfirmDialog(this,
                "Rapid-Fire True/False Stabilization:\\n" + card.getTfStatement(),
                "Stabilize Cauldron", JOptionPane.YES_NO_OPTION);
            boolean correct = (ans == JOptionPane.YES_OPTION) == card.isTfAnswer();
            spellbook.recordOutcome(card.getId(), correct);
            cauldron.clear();
            brewedPotionStars = correct ? 5 : 3;
            refreshUi();
        } else {
            openGatherDialog(IngredientType.DRAGON_SCALE);
        }
    }

    private void openGatherDialog(IngredientType targetType) {
        Flashcard card = spellbook.pickNextCard(lastQuestionId);
        lastQuestionId = card.getId();
        Object[] opts = card.getOptions().toArray();
        String chosen = (String) JOptionPane.showInputDialog(this,
            (hasHintOwl ? "[Hint Owl: " + card.getHint() + "]\\n\\n" : "") + card.getQuestion(),
            "Foraging " + targetType.getDisplayName(), JOptionPane.QUESTION_MESSAGE, null, opts, opts[0]);
        if (chosen == null) return;
        boolean correct = chosen.equals(card.getCorrectAnswer());
        spellbook.recordOutcome(card.getId(), correct);
        if (correct) {
            int qty = (hasEnchantedShears && card.getMasteryStreak() >= 2) ? 2 : 1;
            inventory.put(targetType, inventory.getOrDefault(targetType, 0) + qty);
            statusMessage = "Harvested +" + qty + " " + targetType.getDisplayName() + "!";
        } else {
            inventory.put(IngredientType.BURNT_SCALE, inventory.getOrDefault(IngredientType.BURNT_SCALE, 0) + 1);
            vitality = Math.max(1, vitality - 1);
            statusMessage = "Misfired! Got a Burnt Scale. Question marked for Spaced Repetition!";
        }
        refreshUi();
    }

    private void openSpellbookDialog() {
        String raw = JOptionPane.showInputDialog(this,
            "Enter a 'Question | Answer' flashcard to add to your Spellbook:",
            "What is Polymorphism? | Objects responding dynamically to overridden method calls");
        if (raw != null && !raw.trim().isEmpty()) {
            spellbook.importLines(Collections.singletonList(raw), "Custom Reviewer");
            refreshUi();
        }
    }

    private void openUpgradesDialog() {
        JDialog dialog = new JDialog(this, "Shop Upgrades (Gold: " + gold + "G)", true);
        dialog.setSize(480, 260);
        dialog.setLocationRelativeTo(this);
        dialog.setLayout(new GridLayout(upgrades.size(), 1, 6, 6));
        for (ShopUpgrade upg : upgrades) {
            JButton b = new JButton(upg.getName() + " (" + upg.getCost() + "G) - " + upg.getDescription());
            b.setEnabled(!upg.isPurchased() && gold >= upg.getCost());
            b.addActionListener(e -> {
                gold -= upg.getCost();
                upg.setPurchased(true);
                upg.applyUpgrade(this);
                dialog.dispose();
                refreshUi();
            });
            dialog.add(b);
        }
        dialog.setVisible(true);
    }

    private class ShopCanvasPanel extends JPanel {
        @Override
        protected void paintComponent(Graphics g) {
            super.paintComponent(g);
            Graphics2D g2 = (Graphics2D) g;
            int w = getWidth(), h = getHeight();
            g2.setColor(new Color(124, 58, 237));
            g2.fillRect(0, 0, w, h);
            g2.setColor(new Color(251, 146, 60));
            g2.fillRect(0, h / 4, w, h / 3);
            g2.setColor(new Color(56, 189, 248));
            g2.fillRect(50, 70, 170, 130);
            g2.setColor(new Color(124, 74, 45));
            g2.fillRoundRect(w / 2 - 55, h - 220, 120, 190, 80, 80);
            g2.setColor(hasGoldenCauldron ? new Color(217, 119, 6) : new Color(39, 32, 56));
            g2.fillOval(60, h - 130, 120, 95);
            g2.setColor(new Color(163, 230, 53));
            g2.fillOval(74, h - 124, 92, 24);
        }
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new QuizAlchemist().setVisible(true));
    }
}`;

export const JavaSourceModal: React.FC<JavaSourceModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'architecture' | 'code'>('architecture');

  if (!isOpen) return null;

  const handleCopyCode = () => {
    sound.playHarvestSuccess();
    navigator.clipboard?.writeText(JAVA_SOURCE_CODE).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadJava = () => {
    sound.playGoldCoins();
    const blob = new Blob([JAVA_SOURCE_CODE], { type: 'text/x-java-source;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'QuizAlchemist.java';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="java-modal-title"
    >
      <div className="pixel-box flex max-h-[90vh] w-full max-w-4xl flex-col bg-[#fdf6e3] text-[#1e1b2e]">
        {/* Header */}
        <div className="flex items-center justify-between border-b-4 border-[#181020] bg-[#1e293b] px-5 py-3 text-white">
          <div>
            <h2 id="java-modal-title" className="font-pixel text-base text-[#38bdf8]">
              JAVA SWING & OOP EDITION — SOURCE CODE & ARCHITECTURE
            </h2>
            <p className="text-xs text-slate-300">
              Complete Java implementation (`/java-src/QuizAlchemist.java`) ready for IntelliJ, Eclipse, NetBeans, or `javac`!
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="pixel-btn pixel-box-sm bg-[#ef4444] px-3 py-1 font-pixel text-xs text-white"
            aria-label="Close Java Modal"
          >
            X
          </button>
        </div>

        {/* Sub-navigation */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-4 border-[#181020] bg-[#e2e8f0] px-5 py-2.5">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setActiveTab('architecture');
              }}
              className={`pixel-btn pixel-box-sm px-3 py-1.5 font-pixel text-xs ${
                activeTab === 'architecture'
                  ? 'bg-[#0284c7] text-white'
                  : 'bg-white text-[#1e293b]'
              }`}
            >
              1. Java OOP Architecture Breakdown
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setActiveTab('code');
              }}
              className={`pixel-btn pixel-box-sm px-3 py-1.5 font-pixel text-xs ${
                activeTab === 'code'
                  ? 'bg-[#0284c7] text-white'
                  : 'bg-white text-[#1e293b]'
              }`}
            >
              2. View QuizAlchemist.java
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyCode}
              className="pixel-btn pixel-box-sm bg-[#7c3aed] px-3 py-1.5 font-pixel text-xs text-white hover:bg-[#6d28d9]"
            >
              {copied ? '✓ Copied to Clipboard!' : 'Copy Java Source'}
            </button>
            <button
              type="button"
              onClick={handleDownloadJava}
              className="pixel-btn pixel-box-sm bg-[#16a34a] px-3 py-1.5 font-pixel text-xs text-white hover:bg-[#15803d]"
            >
              Download QuizAlchemist.java
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'architecture' ? (
            <div className="space-y-4">
              <div className="pixel-box-sm bg-white p-4">
                <h3 className="font-pixel text-sm text-[#0284c7]">
                  HOW JAVA OOP PRINCIPLES POWER QUIZ ALCHEMIST
                </h3>
                <p className="mt-1 text-xs text-[#4a3f5c]">
                  Use this reference guide for your Java Object-Oriented Programming presentation or defense. The complete source file is saved in the project at <code>/java-src/QuizAlchemist.java</code>.
                </p>

                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="pixel-box-sm bg-[#f8fafc] p-3">
                    <div className="font-pixel text-xs text-[#7c3aed]">1. ABSTRACTION</div>
                    <p className="mt-1 text-xs text-[#1e293b]">
                      <code>public static abstract class ShopEntity</code> defines shared state (<code>id</code>, <code>name</code>) and an abstract method <code>describeRole()</code> that every subclass must implement.
                    </p>
                  </div>

                  <div className="pixel-box-sm bg-[#f8fafc] p-3">
                    <div className="font-pixel text-xs text-[#15803d]">2. INTERFACES</div>
                    <p className="mt-1 text-xs text-[#1e293b]">
                      <code>interface StudyEvaluator</code> (implemented by <code>SpellbookDeck</code>) and <code>interface Brewable</code> (implemented by <code>PotionRecipe</code>) enforce strict behavioral contracts.
                    </p>
                  </div>

                  <div className="pixel-box-sm bg-[#f8fafc] p-3">
                    <div className="font-pixel text-xs text-[#b45309]">3. ENCAPSULATION</div>
                    <p className="mt-1 text-xs text-[#1e293b]">
                      <code>Flashcard</code> keeps <code>wrongCount</code>, <code>masteryStreak</code>, and <code>needsPractice</code> strictly <code>private</code>, updating them only through <code>recordAttempt(boolean isCorrect)</code>.
                    </p>
                  </div>

                  <div className="pixel-box-sm bg-[#f8fafc] p-3">
                    <div className="font-pixel text-xs text-[#dc2626]">4. INHERITANCE & POLYMORPHISM</div>
                    <p className="mt-1 text-xs text-[#1e293b]">
                      <code>CustomerOrder</code>, <code>PotionRecipe</code>, and <code>ShopUpgrade</code> extend <code>ShopEntity</code>. Each upgrade overrides <code>applyUpgrade(QuizAlchemist game)</code> polymorphically at runtime.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pixel-box-sm bg-[#0f172a] p-4 text-slate-100">
                <div className="font-pixel text-xs text-[#fde047]">
                  HOW TO COMPILE & RUN LOCALLY IN JAVA (JDK 11+ / 17+ / 21+)
                </div>
                <pre className="mt-2 overflow-x-auto font-mono text-xs text-[#bef264]">
{`# 1. Save or download QuizAlchemist.java from this window (or /java-src/QuizAlchemist.java)
javac QuizAlchemist.java

# 2. Launch the 2D Java Swing Desktop Game Window
java QuizAlchemist`}
                </pre>
              </div>
            </div>
          ) : (
            <div className="pixel-box-sm bg-[#0f172a] p-4 text-slate-100">
              <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-emerald-300">
                {JAVA_SOURCE_CODE}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
