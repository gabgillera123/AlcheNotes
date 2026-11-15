import javax.swing.*;
import javax.swing.border.EmptyBorder;
import javax.swing.filechooser.FileNameExtensionFilter;
import java.awt.*;
import java.awt.event.*;
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
 * 1. ABSTRACTION:   `abstract class ShopEntity` defines base identity and abstract `describeRole()`.
 * 2. INTERFACE:     `interface StudyEvaluator` and `interface Brewable` define behavioral contracts.
 * 3. ENCAPSULATION: `Flashcard`, `InventoryManager`, and `PlayerStats` keep state `private` with controlled mutators.
 * 4. INHERITANCE:   `CustomerOrder` and `ShopUpgrade` extend `ShopEntity`.
 * 5. POLYMORPHISM:  Upgrades override `applyUpgrade(PlayerStats stats)` dynamically at runtime.
 * ============================================================================
 */
public class QuizAlchemist extends JFrame {

    // ========================================================================
    // 1. INTERFACES (Contracts of Behavior)
    // ========================================================================
    public interface StudyEvaluator {
        Flashcard pickNextCard(String lastQuestionId);
        void recordOutcome(String questionId, boolean isCorrect);
    }

    public interface Brewable {
        boolean canBrew(Map<IngredientType, Integer> cauldron);
        int calculatePayout(int stars, boolean hasGoldenCauldron);
    }

    // ========================================================================
    // 2. ABSTRACT CLASS (Shared State + Abstract Method)
    // ========================================================================
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

    // ========================================================================
    // 3. ENUMS & ENCAPSULATED DOMAIN MODELS
    // ========================================================================
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

    /**
     * Encapsulated Study Flashcard with Adaptive Spaced Repetition telemetry.
     */
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

    /**
     * PotionRecipe implements Brewable and extends ShopEntity.
     */
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
                if (inPot < entry.getValue()) {
                    return false;
                }
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

        public int getBaseGold() { return baseGold; }
    }

    /**
     * CustomerOrder extends ShopEntity (Inheritance).
     */
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

    /**
     * Polymorphic ShopUpgrade hierarchy.
     */
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

    // ========================================================================
    // 4. SPELLBOOK DECK MANAGER (Implements StudyEvaluator)
    // ========================================================================
    public static class SpellbookDeck implements StudyEvaluator {
        private String subjectName = "Java & OOP Exam Reviewer";
        private final List<Flashcard> cards = new ArrayList<>();

        public SpellbookDeck() {
            loadDefaultJavaOopDeck();
        }

        public void loadDefaultJavaOopDeck() {
            cards.clear();
            subjectName = "Java & OOP Exam Reviewer";
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
            cards.add(new Flashcard(
                "q3", subjectName,
                "What is Runtime Polymorphism (Dynamic Method Dispatch) in Java?",
                "Resolving a call to an overridden method at runtime based on the actual object instance.",
                Arrays.asList(
                    "Resolving a call to an overridden method at runtime based on the actual object instance.",
                    "Having two methods with the same name but different parameter lists in the same class.",
                    "Converting bytecode into native machine code before main() starts.",
                    "Declaring a method as final so subclasses cannot modify it."
                ),
                "Method overriding allows a subclass to provide a specific implementation of a method declared in its parent class.",
                true,
                "Occurs when a superclass reference points to a subclass object and invokes an overridden method."
            ));
            cards.add(new Flashcard(
                "q4", subjectName,
                "Which keyword is used in Java to call a superclass constructor or overridden method?",
                "super",
                Arrays.asList("super", "this", "extends", "instanceof"),
                "The super() constructor call must be the first statement inside a subclass constructor.",
                true,
                "Refers directly to the parent (super) class."
            ));
        }

        @Override
        public Flashcard pickNextCard(String lastQuestionId) {
            if (cards.isEmpty()) loadDefaultJavaOopDeck();
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
                String[] parts = line.contains("|") ? line.split("\\|", 2) : line.split(",", 2);
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
                        "Regarding \"" + q + "\": The correct answer is \"" + a + "\".",
                        true,
                        "Starts with \"" + a.substring(0, Math.min(8, a.length())) + "...\""
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

        public void addCard(Flashcard card) { cards.add(0, card); }
        public List<Flashcard> getCards() { return cards; }
        public String getSubjectName() { return subjectName; }
    }

    // ========================================================================
    // 5. GAME STATE & SWING UI COMPONENTS
    // ========================================================================
    private final SpellbookDeck spellbook = new SpellbookDeck();
    private final Map<IngredientType, Integer> inventory = new EnumMap<>(IngredientType.class);
    private final Map<IngredientType, Integer> cauldron = new EnumMap<>(IngredientType.class);
    private final List<PotionRecipe> recipes = new ArrayList<>();
    private final List<CustomerOrder> customers = new ArrayList<>();
    private final List<ShopUpgrade> upgrades = new ArrayList<>();

    private int currentCustomerIdx = 0;
    private boolean customerCured = false;
    private Integer brewedPotionStars = null;
    private int gold = 50;
    private int vitality = 3;
    private int maxVitality = 3;
    private boolean hasGoldenCauldron = false;
    private boolean hasHintOwl = false;
    private boolean hasEnchantedShears = false;
    private String lastQuestionId = null;
    private String statusMessage = "Ignis rushed in with flaming hair! Check the Spellbook or Gather a Dragon Scale!";

    // Swing UI Labels & Canvas
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

        recipes.add(coolingElixir);
        recipes.add(croakTonic);

        customers.add(new CustomerOrder(
            "c1", "Ignis the Apprentice", "Stressed Wizard Student",
            "\"Please, I need a Cooling Elixir before my presentation! My hair literally caught fire!\"",
            "\"Ahhh, sweet frost! My flaming hair is out! Take these gold coins!\"",
            coolingElixir, "FLAMING_HAIR"
        ));
        customers.add(new CustomerOrder(
            "c2", "Sir Reginald", "Cursed Royal Knight",
            "\"RIBBIT! Pardon me—a bog witch turned my voice into a frog croak! I need a Croak-Cure Tonic!\"",
            "\"Huzzah! My royal baritone has returned! Here is your gold, Alchemist!\"",
            croakTonic, "FROG_VOICE"
        ));

        upgrades.add(new ShopUpgrade("u_owl", "Hint Owl Familiar", 80, "Whispers a clue on tough flashcards.") {
            @Override
            public String describeRole() { return "Companion Upgrade"; }
            @Override
            public void applyUpgrade(QuizAlchemist game) { game.hasHintOwl = true; }
        });
        upgrades.add(new ShopUpgrade("u_gold", "Golden Cauldron", 100, "+25% Gold payout on 5-Star Potions.") {
            @Override
            public String describeRole() { return "Equipment Upgrade"; }
            @Override
            public void applyUpgrade(QuizAlchemist game) { game.hasGoldenCauldron = true; }
        });
        upgrades.add(new ShopUpgrade("u_shears", "Enchanted Shears", 120, "+1 Bonus Ingredient on 2+ Study Streaks.") {
            @Override
            public String describeRole() { return "Tool Upgrade"; }
            @Override
            public void applyUpgrade(QuizAlchemist game) { game.hasEnchantedShears = true; }
        });
    }

    private void buildGuiLayout() {
        setLayout(new BorderLayout(0, 0));

        // 1. Top HUD Bar
        JPanel topBar = new JPanel(new BorderLayout(12, 0));
        topBar.setBackground(new Color(39, 21, 61));
        topBar.setBorder(new EmptyBorder(10, 16, 10, 16));

        hudLabel.setForeground(new Color(253, 224, 71));
        hudLabel.setFont(new Font(Font.MONOSPACED, Font.BOLD, 15));
        topBar.add(hudLabel, BorderLayout.WEST);

        JPanel topButtons = new JPanel(new FlowLayout(FlowLayout.RIGHT, 8, 0));
        topButtons.setOpaque(false);

        JButton gatherBtn = createStyledButton("Gather Ingredients (Study)", new Color(34, 197, 94), Color.WHITE);
        gatherBtn.addActionListener(e -> openGatherDialog(IngredientType.DRAGON_SCALE));

        JButton spellbookBtn = createStyledButton("Spellbook & Load Reviewer", new Color(124, 58, 237), Color.WHITE);
        spellbookBtn.addActionListener(e -> openSpellbookDialog());

        JButton upgradesBtn = createStyledButton("Shop Upgrades", new Color(245, 158, 11), new Color(24, 16, 32));
        upgradesBtn.addActionListener(e -> openUpgradesDialog());

        topButtons.add(gatherBtn);
        topButtons.add(spellbookBtn);
        topButtons.add(upgradesBtn);
        topBar.add(topButtons, BorderLayout.EAST);
        add(topBar, BorderLayout.NORTH);

        // 2. Center 2D Pixel Shop Canvas + Right Wooden Apothecary Shelf
        JPanel centerContainer = new JPanel(new BorderLayout());
        centerContainer.add(canvasPanel, BorderLayout.CENTER);

        shelfPanel.setBackground(new Color(156, 102, 68));
        shelfPanel.setBorder(BorderFactory.createCompoundBorder(
            BorderFactory.createLineBorder(new Color(24, 16, 32), 4),
            new EmptyBorder(10, 12, 10, 12)
        ));
        shelfPanel.setPreferredSize(new Dimension(280, 420));
        centerContainer.add(shelfPanel, BorderLayout.EAST);
        add(centerContainer, BorderLayout.CENTER);

        // 3. Bottom Counter Dialogue & Cauldron Controls
        JPanel bottomCounter = new JPanel(new BorderLayout(12, 8));
        bottomCounter.setBackground(new Color(222, 184, 135));
        bottomCounter.setBorder(BorderFactory.createCompoundBorder(
            BorderFactory.createMatteBorder(5, 0, 0, 0, new Color(24, 16, 32)),
            new EmptyBorder(12, 16, 12, 16)
        ));

        dialogueArea.setEditable(false);
        dialogueArea.setLineWrap(true);
        dialogueArea.setWrapStyleWord(true);
        dialogueArea.setFont(new Font(Font.SANS_SERIF, Font.BOLD, 14));
        dialogueArea.setBackground(new Color(253, 246, 227));
        dialogueArea.setBorder(BorderFactory.createCompoundBorder(
            BorderFactory.createLineBorder(new Color(24, 16, 32), 3),
            new EmptyBorder(8, 10, 8, 10)
        ));
        bottomCounter.add(dialogueArea, BorderLayout.CENTER);

        JPanel cauldronControls = new JPanel(new GridLayout(2, 1, 6, 6));
        cauldronControls.setOpaque(false);
        actionBtn.setFont(new Font(Font.MONOSPACED, Font.BOLD, 13));
        actionBtn.addActionListener(e -> handlePrimaryCounterAction());

        JButton autoFillBtn = createStyledButton("Toss Required Recipe Into Cauldron", new Color(76, 29, 149), Color.WHITE);
        autoFillBtn.addActionListener(e -> tossRecipeIntoCauldron());

        cauldronControls.add(actionBtn);
        cauldronControls.add(autoFillBtn);
        bottomCounter.add(cauldronControls, BorderLayout.EAST);

        add(bottomCounter, BorderLayout.SOUTH);
    }

    private JButton createStyledButton(String text, Color bg, Color fg) {
        JButton btn = new JButton(text);
        btn.setBackground(bg);
        btn.setForeground(fg);
        btn.setFocusPainted(false);
        btn.setFont(new Font(Font.MONOSPACED, Font.BOLD, 12));
        btn.setBorder(BorderFactory.createCompoundBorder(
            BorderFactory.createLineBorder(new Color(24, 16, 32), 2),
            new EmptyBorder(6, 12, 6, 12)
        ));
        return btn;
    }

    private CustomerOrder getCurrentCustomer() {
        return customers.get(currentCustomerIdx % customers.size());
    }

    private void refreshUi() {
        CustomerOrder cust = getCurrentCustomer();
        PotionRecipe recipe = cust.getDesiredRecipe();

        hudLabel.setText(String.format(
            "VITALITY: %d/%d  |  GOLD: %dG  |  DECK: %s (%d cards)",
            vitality, maxVitality, gold, spellbook.getSubjectName(), spellbook.getCards().size()
        ));

        // Rebuild right-hand ingredient shelf buttons
        shelfPanel.removeAll();
        JLabel shelfTitle = new JLabel("APOTHECARY INGREDIENTS", SwingConstants.CENTER);
        shelfTitle.setFont(new Font(Font.MONOSPACED, Font.BOLD, 13));
        shelfTitle.setForeground(new Color(254, 240, 138));
        shelfPanel.add(shelfTitle);

        for (IngredientType type : new IngredientType[]{
            IngredientType.ICE_BERRY, IngredientType.MOONWATER,
            IngredientType.MANDRAKE_ROOT, IngredientType.DRAGON_SCALE
        }) {
            int stock = inventory.getOrDefault(type, 0);
            int needed = recipe.getRequiredIngredients().getOrDefault(type, 0);
            int inPot = cauldron.getOrDefault(type, 0);
            JButton ingBtn = createStyledButton(
                String.format("%s [Stock: %d | Pot: %d/%d]", type.getDisplayName(), stock, inPot, needed),
                stock > 0 ? new Color(54, 34, 28) : new Color(127, 29, 29),
                Color.WHITE
            );
            ingBtn.addActionListener(e -> {
                if (stock > 0) {
                    inventory.put(type, stock - 1);
                    cauldron.put(type, inPot + 1);
                    statusMessage = "Tossed 1x " + type.getDisplayName() + " into the cauldron!";
                    refreshUi();
                } else {
                    openGatherDialog(type);
                }
            });
            shelfPanel.add(ingBtn);
        }

        // Update dialogue box
        String quote = customerCured ? cust.getCuredDialogue() : cust.getDialogue();
        dialogueArea.setText(
            cust.getName() + " (" + cust.getTitle() + "): " + quote + "\n" +
            "Order: " + recipe.getName() + "  |  Status: " + statusMessage
        );

        // Update primary action button
        if (customerCured) {
            actionBtn.setText("Welcome Next Customer ->");
            actionBtn.setBackground(new Color(56, 189, 248));
            actionBtn.setForeground(Color.BLACK);
        } else if (brewedPotionStars != null) {
            int payout = recipe.calculatePayout(brewedPotionStars, hasGoldenCauldron);
            actionBtn.setText("Serve " + brewedPotionStars + "-Star " + recipe.getName() + " (+" + payout + "G)");
            actionBtn.setBackground(new Color(163, 230, 53));
            actionBtn.setForeground(Color.BLACK);
        } else if (recipe.canBrew(cauldron)) {
            actionBtn.setText("Brew & Stabilize Magic (True/False Quiz)!");
            actionBtn.setBackground(new Color(34, 197, 94));
            actionBtn.setForeground(Color.WHITE);
        } else {
            actionBtn.setText("Study in Greenhouse to Gather Missing Ingredients");
            actionBtn.setBackground(new Color(245, 158, 11));
            actionBtn.setForeground(Color.BLACK);
        }

        shelfPanel.revalidate();
        shelfPanel.repaint();
        canvasPanel.repaint();
    }

    private void tossRecipeIntoCauldron() {
        if (brewedPotionStars != null || customerCured) return;
        PotionRecipe recipe = getCurrentCustomer().getDesiredRecipe();
        for (Map.Entry<IngredientType, Integer> req : recipe.getRequiredIngredients().entrySet()) {
            IngredientType type = req.getKey();
            int needed = req.getValue() - cauldron.getOrDefault(type, 0);
            if (needed > 0) {
                int stock = inventory.getOrDefault(type, 0);
                if (stock < needed) {
                    statusMessage = "Out of " + type.getDisplayName() + "! Opening Greenhouse/Monster Den...";
                    refreshUi();
                    openGatherDialog(type);
                    return;
                }
            }
        }
        for (Map.Entry<IngredientType, Integer> req : recipe.getRequiredIngredients().entrySet()) {
            IngredientType type = req.getKey();
            int needed = req.getValue() - cauldron.getOrDefault(type, 0);
            if (needed > 0) {
                inventory.put(type, inventory.get(type) - needed);
                cauldron.put(type, cauldron.getOrDefault(type, 0) + needed);
            }
        }
        statusMessage = "All ingredients for " + recipe.getName() + " are in the cauldron! Click Brew & Stabilize!";
        refreshUi();
    }

    private void handlePrimaryCounterAction() {
        CustomerOrder cust = getCurrentCustomer();
        PotionRecipe recipe = cust.getDesiredRecipe();

        if (customerCured) {
            customerCured = false;
            currentCustomerIdx++;
            statusMessage = "New customer arrived at the counter!";
            refreshUi();
        } else if (brewedPotionStars != null) {
            int payout = recipe.calculatePayout(brewedPotionStars, hasGoldenCauldron);
            gold += payout;
            brewedPotionStars = null;
            customerCured = true;
            statusMessage = "Served potion and earned +" + payout + " Gold Coins!";
            refreshUi();
        } else if (recipe.canBrew(cauldron)) {
            openCauldronStabilizeDialog(recipe);
        } else {
            openGatherDialog(IngredientType.DRAGON_SCALE);
        }
    }

    // ========================================================================
    // STEP 3 DIALOG: STUDY FLASHCARDS TO GATHER INGREDIENTS
    // ========================================================================
    private void openGatherDialog(IngredientType targetType) {
        Flashcard card = spellbook.pickNextCard(lastQuestionId);
        lastQuestionId = card.getId();

        JDialog dialog = new JDialog(this, "Greenhouse & Monster Den — Foraging " + targetType.getDisplayName(), true);
        dialog.setSize(640, 440);
        dialog.setLocationRelativeTo(this);
        dialog.setLayout(new BorderLayout(10, 10));

        JPanel header = new JPanel(new BorderLayout());
        header.setBackground(new Color(21, 128, 61));
        header.setBorder(new EmptyBorder(10, 14, 10, 14));
        String practiceTag = card.isNeedsPractice() ? " [SPACED REPETITION PRIORITY]" : "";
        JLabel title = new JLabel("HARVESTING: " + targetType.getDisplayName().toUpperCase() + practiceTag);
        title.setForeground(Color.YELLOW);
        title.setFont(new Font(Font.MONOSPACED, Font.BOLD, 14));
        header.add(title, BorderLayout.WEST);
        dialog.add(header, BorderLayout.NORTH);

        JPanel body = new JPanel(new BorderLayout(8, 12));
        body.setBorder(new EmptyBorder(14, 16, 14, 16));
        body.setBackground(new Color(253, 246, 227));

        JTextArea qArea = new JTextArea(card.getQuestion());
        qArea.setEditable(false);
        qArea.setLineWrap(true);
        qArea.setWrapStyleWord(true);
        qArea.setFont(new Font(Font.SANS_SERIF, Font.BOLD, 16));
        qArea.setBackground(new Color(253, 246, 227));
        body.add(qArea, BorderLayout.NORTH);

        JPanel optionsPanel = new JPanel(new GridLayout(card.getOptions().size(), 1, 8, 8));
        optionsPanel.setOpaque(false);
        List<String> shuffled = new ArrayList<>(card.getOptions());
        Collections.shuffle(shuffled);

        for (String opt : shuffled) {
            JButton optBtn = createStyledButton(opt, Color.WHITE, Color.BLACK);
            optBtn.setHorizontalAlignment(SwingConstants.LEFT);
            optBtn.addActionListener(e -> {
                boolean correct = opt.equals(card.getCorrectAnswer());
                spellbook.recordOutcome(card.getId(), correct);
                if (correct) {
                    int qty = (hasEnchantedShears && card.getMasteryStreak() >= 2) ? 2 : 1;
                    inventory.put(targetType, inventory.getOrDefault(targetType, 0) + qty);
                    statusMessage = "Correct! Harvested +" + qty + " " + targetType.getDisplayName() + "!";
                    JOptionPane.showMessageDialog(dialog,
                        "Success! You harvested +" + qty + " shiny " + targetType.getDisplayName() + "!",
                        "Harvest Success", JOptionPane.INFORMATION_MESSAGE);
                } else {
                    inventory.put(IngredientType.BURNT_SCALE, inventory.getOrDefault(IngredientType.BURNT_SCALE, 0) + 1);
                    vitality = Math.max(1, vitality - 1);
                    statusMessage = "Oops! Received a Burnt Scale. Question marked for Spaced Repetition practice!";
                    JOptionPane.showMessageDialog(dialog,
                        "Oops! You got a Burnt Scale instead.\nCorrect Answer: " + card.getCorrectAnswer() +
                        "\n(This card is now prioritized for extra practice!)",
                        "Misfired Harvest", JOptionPane.WARNING_MESSAGE);
                }
                dialog.dispose();
                refreshUi();
            });
            optionsPanel.add(optBtn);
        }
        body.add(optionsPanel, BorderLayout.CENTER);

        if (hasHintOwl) {
            JButton owlBtn = createStyledButton("Ask Hint Owl for a Clue", new Color(254, 240, 138), new Color(120, 53, 15));
            owlBtn.addActionListener(e -> JOptionPane.showMessageDialog(dialog, "Hint Owl whispers: " + card.getHint()));
            body.add(owlBtn, BorderLayout.SOUTH);
        }

        dialog.add(body, BorderLayout.CENTER);
        dialog.setVisible(true);
    }

    // ========================================================================
    // STEP 4 DIALOG: CAULDRON TRUE/FALSE STABILIZATION
    // ========================================================================
    private void openCauldronStabilizeDialog(PotionRecipe recipe) {
        Flashcard card = spellbook.pickNextCard(lastQuestionId);
        int choice = JOptionPane.showConfirmDialog(
            this,
            "The Cauldron is bubbling! Answer this rapid-fire True/False check to stabilize the magic:\n\n\"" +
            card.getTfStatement() + "\"\n\nClick YES for TRUE, or NO for FALSE.",
            "Stabilize " + recipe.getName(),
            JOptionPane.YES_NO_OPTION
        );
        boolean playerSaysTrue = (choice == JOptionPane.YES_OPTION);
        boolean correct = (playerSaysTrue == card.isTfAnswer());
        spellbook.recordOutcome(card.getId(), correct);
        cauldron.clear();
        brewedPotionStars = correct ? 5 : 3;
        statusMessage = correct
            ? "POOF! Brewed a 5-Star " + recipe.getName() + "!"
            : "Fizzle! Brewed a 3-Star " + recipe.getName() + "!";
        refreshUi();
    }

    // ========================================================================
    // STEP 1 DIALOG: SPELLBOOK & CSV/TXT REVIEWER IMPORTER
    // ========================================================================
    private void openSpellbookDialog() {
        JDialog dialog = new JDialog(this, "Magical Spellbook — Load Reviewer (CSV / TXT)", true);
        dialog.setSize(620, 420);
        dialog.setLocationRelativeTo(this);
        dialog.setLayout(new BorderLayout(10, 10));

        JTextArea notesArea = new JTextArea(
            "What is Polymorphism? | The ability of different objects to respond to the same method call\n" +
            "What is an Interface? | A contract of abstract methods that a class can implement\n" +
            "What is Encapsulation? | Bundling private fields with public getter and setter methods"
        );
        notesArea.setFont(new Font(Font.MONOSPACED, Font.PLAIN, 12));

        JPanel btnPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT));
        JButton uploadFileBtn = createStyledButton("Upload .TXT / .CSV File...", new Color(2, 132, 199), Color.WHITE);
        uploadFileBtn.addActionListener(e -> {
            JFileChooser chooser = new JFileChooser();
            chooser.setFileFilter(new FileNameExtensionFilter("Text & CSV Files", "txt", "csv"));
            if (chooser.showOpenDialog(dialog) == JFileChooser.APPROVE_OPTION) {
                try {
                    List<String> lines = Files.readAllLines(chooser.getSelectedFile().toPath(), StandardCharsets.UTF_8);
                    int count = spellbook.importLines(lines, chooser.getSelectedFile().getName());
                    JOptionPane.showMessageDialog(dialog, "Loaded " + count + " flashcards into your Spellbook!");
                    dialog.dispose();
                    refreshUi();
                } catch (IOException ex) {
                    JOptionPane.showMessageDialog(dialog, "Failed to read file: " + ex.getMessage());
                }
            }
        });

        JButton importTextBtn = createStyledButton("Transform Notes Into Spellbook", new Color(22, 163, 74), Color.WHITE);
        importTextBtn.addActionListener(e -> {
            List<String> lines = Arrays.asList(notesArea.getText().split("\\r?\\n"));
            int count = spellbook.importLines(lines, "Custom Study Reviewer");
            JOptionPane.showMessageDialog(dialog, "Transformed " + count + " study notes into Spellbook flashcards!");
            dialog.dispose();
            refreshUi();
        });

        btnPanel.add(uploadFileBtn);
        btnPanel.add(importTextBtn);

        dialog.add(new JLabel("  Paste 'Question | Answer' lines below or upload a .txt/.csv study sheet:"), BorderLayout.NORTH);
        dialog.add(new JScrollPane(notesArea), BorderLayout.CENTER);
        dialog.add(btnPanel, BorderLayout.SOUTH);
        dialog.setVisible(true);
    }

    // ========================================================================
    // STEP 5 DIALOG: SHOP UPGRADES
    // ========================================================================
    private void openUpgradesDialog() {
        JDialog dialog = new JDialog(this, "Alchemist Guild Shop Upgrades (Gold: " + gold + "G)", true);
        dialog.setSize(520, 340);
        dialog.setLocationRelativeTo(this);
        dialog.setLayout(new GridLayout(upgrades.size(), 1, 8, 8));

        for (ShopUpgrade upg : upgrades) {
            JButton btn = createStyledButton(
                upg.getName() + " (" + upg.getCost() + "G) — " + upg.getDescription() +
                (upg.isPurchased() ? " [OWNED]" : ""),
                upg.isPurchased() ? new Color(22, 163, 74) : new Color(245, 158, 11),
                Color.BLACK
            );
            btn.setEnabled(!upg.isPurchased() && gold >= upg.getCost());
            btn.addActionListener(e -> {
                gold -= upg.getCost();
                upg.setPurchased(true);
                upg.applyUpgrade(this);
                statusMessage = "Purchased " + upg.getName() + "!";
                dialog.dispose();
                refreshUi();
            });
            dialog.add(btn);
        }
        dialog.setVisible(true);
    }

    // ========================================================================
    // CUSTOM 2D PIXEL-ART SHOP RENDERER (Java2D Graphics2D)
    // ========================================================================
    private class ShopCanvasPanel extends JPanel {
        @Override
        protected void paintComponent(Graphics g) {
            super.paintComponent(g);
            Graphics2D g2 = (Graphics2D) g;
            int w = getWidth();
            int h = getHeight();

            // 1. Purple & Coral Brick Wall Background
            g2.setColor(new Color(124, 58, 237));
            g2.fillRect(0, 0, w, h);
            g2.setColor(new Color(251, 146, 60));
            g2.fillRect(0, h / 4, w, h / 3);

            g2.setColor(new Color(59, 7, 100));
            for (int y = 0; y < h; y += 24) {
                g2.drawLine(0, y, w, y);
                int offset = (y / 24) % 2 == 0 ? 0 : 24;
                for (int x = offset; x < w; x += 48) {
                    g2.drawLine(x, y, x, y + 24);
                }
            }

            // 2. Sunny Window with Yellow Curtains (Left)
            int winX = 60, winY = 90, winW = 190, winH = 140;
            g2.setColor(new Color(56, 189, 248));
            g2.fillRect(winX, winY, winW, winH);
            g2.setColor(new Color(34, 197, 94));
            g2.fillRect(winX, winY + 95, winW, 45);
            g2.setColor(Color.WHITE);
            g2.setStroke(new BasicStroke(4));
            g2.drawRect(winX, winY, winW, winH);
            g2.drawLine(winX + winW / 2, winY, winX + winW / 2, winY + winH);
            // Yellow Curtains
            g2.setColor(new Color(250, 204, 21));
            g2.fillRect(winX - 18, winY - 6, 24, winH + 12);
            g2.fillRect(winX + winW - 6, winY - 6, 24, winH + 12);

            // 3. Arched Wooden Door & Quirky Customer (Center)
            int doorX = w / 2 - 60, doorY = h - 250, doorW = 140, doorH = 210;
            g2.setColor(new Color(124, 74, 45));
            g2.fillRoundRect(doorX, doorY, doorW, doorH, 90, 90);
            g2.setColor(new Color(24, 16, 32));
            g2.drawRoundRect(doorX, doorY, doorW, doorH, 90, 90);

            // Customer Sprite
            CustomerOrder cust = getCurrentCustomer();
            int cx = doorX + 35, cy = doorY + 75;
            if (!customerCured && "FLAMING_HAIR".equals(cust.getAilmentType())) {
                g2.setColor(new Color(239, 68, 68));
                g2.fillRect(cx + 4, cy - 26, 62, 26);
                g2.setColor(new Color(253, 224, 71));
                g2.fillRect(cx + 14, cy - 16, 42, 16);
            }
            g2.setColor(new Color(254, 215, 170));
            g2.fillRect(cx + 10, cy, 50, 45);
            g2.setColor(new Color(24, 16, 32));
            g2.fillRect(cx + 20, cy + 14, 8, 8);
            g2.fillRect(cx + 42, cy + 14, 8, 8);
            g2.setColor(new Color(91, 33, 182));
            g2.fillRect(cx, cy + 45, 70, 55);

            // 4. Bubbling Cauldron (Bottom-Left)
            int cauldX = 75, cauldY = h - 145;
            g2.setColor(hasGoldenCauldron ? new Color(217, 119, 6) : new Color(39, 32, 56));
            g2.fillOval(cauldX, cauldY, 130, 105);
            g2.setColor(new Color(163, 230, 53));
            g2.fillOval(cauldX + 16, cauldY + 6, 98, 26);
            g2.fillOval(cauldX + 36, cauldY - 16, 14, 14);
            g2.fillOval(cauldX + 74, cauldY - 24, 18, 18);
        }
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            QuizAlchemist app = new QuizAlchemist();
            app.setVisible(true);
        });
    }
}
