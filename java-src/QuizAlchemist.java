import javax.swing.*;
import javax.swing.border.EmptyBorder;
import javax.swing.filechooser.FileNameExtensionFilter;
import java.awt.*;
import java.awt.event.*;
import java.awt.font.FontRenderContext;
import java.awt.font.LineBreakMeasurer;
import java.awt.font.TextAttribute;
import java.awt.font.TextLayout;
import java.awt.geom.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.text.AttributedString;
import java.util.*;
import java.util.List;

/**
 * ============================================================================
 * QUIZ ALCHEMIST — Java Swing & OOP Edition (Jinxed-style UI)
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
    // 5. JINXED-STYLE THEME, POTION TIERS & ART (everything is drawn with Java2D)
    // ========================================================================
    /** Potion rarity tiers, named after the brews on jinxed.party. */
    public enum Tier {
        MURKY("Murky", new Color(0x8a9a5b)),
        BUBBLY("Bubbly", new Color(0x4cc9f0)),
        GLOWING("Glowing", new Color(0x6ee7a0)),
        ENCHANTED("Enchanted", new Color(0xc084fc)),
        PRIMORDIAL("Primordial", new Color(0xffb02e));

        final String label;
        final Color color;
        Tier(String label, Color color) { this.label = label; this.color = color; }
    }

    static final class Theme {
        static final Color BG = new Color(0x1a1222);      // same as jinxed.party theme-color
        static final Color BG_DEEP = new Color(0x120b19);
        static final Color CARD = new Color(0x2a1d3b);
        static final Color CARD_HI = new Color(0x38294f);
        static final Color LINE = new Color(0x4a3868);
        static final Color TEXT = new Color(0xf6efff);
        static final Color MUTED = new Color(0xa898c4);
        static final Color VIOLET = new Color(0x8b5cf6);
        static final Color PINK = new Color(0xf472b6);
        static final Color GOLD = new Color(0xfbbf24);
        static final Color GREEN = new Color(0x4ade80);
        static final Color RED = new Color(0xfb7185);
        static final Color CAT = new Color(0x0c0912);
        private static String family;

        static Font font(int style, float size) {
            if (family == null) {
                Set<String> have = new HashSet<>(Arrays.asList(
                    GraphicsEnvironment.getLocalGraphicsEnvironment().getAvailableFontFamilyNames()));
                family = Font.DIALOG;
                for (String f : new String[]{"Nunito", "Poppins", "Quicksand", "Fredoka", "Segoe UI",
                                             "SF Pro Rounded", "Helvetica Neue", "Arial"}) {
                    if (have.contains(f)) { family = f; break; }
                }
            }
            return new Font(family, style, 12).deriveFont(size);
        }

        static void aa(Graphics2D g) {
            g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
            g.setRenderingHint(RenderingHints.KEY_STROKE_CONTROL, RenderingHints.VALUE_STROKE_PURE);
        }

        static Color alpha(Color c, int a) { return new Color(c.getRed(), c.getGreen(), c.getBlue(), a); }

        static Color mix(Color a, Color b, double t) {
            return new Color(
                (int) (a.getRed() + (b.getRed() - a.getRed()) * t),
                (int) (a.getGreen() + (b.getGreen() - a.getGreen()) * t),
                (int) (a.getBlue() + (b.getBlue() - a.getBlue()) * t));
        }
    }

    /** Procedural art: night sky, potions, shelf, black cat, cauldron and customers. */
    static final class Art {
        static void sky(Graphics2D g, int w, int h, double t) {
            g.setPaint(new GradientPaint(0, 0, new Color(0x2a1a3d), 0, h, new Color(0x150d1e)));
            g.fillRect(0, 0, w, h);
            for (int i = 0; i < 46; i++) {
                double sx = ((i * 7919) % 1000) / 1000.0 * w;
                double sy = ((i * 104729) % 1000) / 1000.0 * h * 0.62;
                double tw = 0.5 + 0.5 * Math.sin(t * 1.6 + i * 1.7);
                double r = 1.3 + (i % 3) * 0.6;
                g.setColor(new Color(255, 240, 200, (int) (50 + 130 * tw)));
                g.fill(new Ellipse2D.Double(sx, sy, r, r));
            }
            double mr = Math.min(w, h) * 0.065, mx = w * 0.90, my = h * 0.30;
            g.setPaint(new RadialGradientPaint(new Point2D.Double(mx, my), (float) (mr * 3),
                new float[]{0f, 1f}, new Color[]{new Color(255, 236, 170, 70), new Color(255, 236, 170, 0)}));
            g.fill(new Ellipse2D.Double(mx - mr * 3, my - mr * 3, mr * 6, mr * 6));
            Area moon = new Area(new Ellipse2D.Double(mx - mr, my - mr, mr * 2, mr * 2));
            moon.subtract(new Area(new Ellipse2D.Double(mx - mr + mr * 0.55, my - mr - mr * 0.15, mr * 2, mr * 2)));
            g.setColor(new Color(0xffe9a8));
            g.fill(moon);
        }

        static void potion(Graphics2D g, double cx, double baseY, double size, Color liquid,
                           double t, boolean lit, int seed) {
            double bodyD = size * 0.78, bodyX = cx - bodyD / 2, bodyY = baseY - bodyD;
            double neckW = size * 0.26, neckH = size * 0.30;
            Shape body = new Ellipse2D.Double(bodyX, bodyY, bodyD, bodyD);
            Shape neck = new RoundRectangle2D.Double(cx - neckW / 2, bodyY - neckH + 4, neckW, neckH, 6, 6);
            if (!lit) {
                g.setColor(Theme.alpha(Theme.LINE, 170));
                g.setStroke(new BasicStroke(2f, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND, 1f, new float[]{4f, 5f}, 0f));
                g.draw(body);
                g.draw(neck);
                g.setStroke(new BasicStroke(1f));
                return;
            }
            float gr = (float) (size * 0.95);
            double gy = bodyY + bodyD / 2;
            g.setPaint(new RadialGradientPaint(new Point2D.Double(cx, gy), gr, new float[]{0f, 1f},
                new Color[]{Theme.alpha(liquid, 95), Theme.alpha(liquid, 0)}));
            g.fill(new Ellipse2D.Double(cx - gr, gy - gr, gr * 2, gr * 2));
            g.setColor(new Color(255, 255, 255, 28));
            g.fill(body);
            g.fill(neck);
            Shape old = g.getClip();
            g.clip(body);
            double level = bodyY + bodyD * 0.38 + Math.sin(t * 2.2 + seed) * 2;
            g.setColor(liquid);
            g.fill(new Rectangle2D.Double(bodyX, level, bodyD, bodyD));
            g.setColor(Theme.mix(liquid, Color.WHITE, .35));
            g.fill(new Ellipse2D.Double(bodyX, level - 3, bodyD, 6));
            for (int i = 0; i < 3; i++) {
                double p = (t * 0.35 + i * 0.33 + seed * 0.1) % 1.0;
                double bx = cx + Math.sin(i * 2.3 + seed) * bodyD * 0.2;
                double by = bodyY + bodyD - p * bodyD * 0.6;
                g.setColor(new Color(255, 255, 255, (int) (150 * (1 - p))));
                g.fill(new Ellipse2D.Double(bx - 2, by - 2, 4 + i, 4 + i));
            }
            g.setClip(old);
            g.setColor(new Color(255, 255, 255, 120));
            g.setStroke(new BasicStroke(2f));
            g.draw(body);
            g.draw(neck);
            g.setColor(new Color(0xb9824f));
            g.fill(new RoundRectangle2D.Double(cx - neckW * 0.6, bodyY - neckH - 4, neckW * 1.2, 10, 4, 4));
            g.setColor(new Color(255, 255, 255, 140));
            g.setStroke(new BasicStroke(2.2f, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
            g.draw(new Arc2D.Double(bodyX + bodyD * 0.16, bodyY + bodyD * 0.16, bodyD * 0.5, bodyD * 0.5, 105, 55, Arc2D.OPEN));
            g.setStroke(new BasicStroke(1f));
        }

        /** Wooden plank with five potion slots. Returns the x where the plank ends. */
        static double shelf(Graphics2D g, double x, double plankY, double slot, List<Tier> tiers, double t, double extra) {
            for (int i = 0; i < 5; i++) {
                Tier tier = i < tiers.size() ? tiers.get(i) : null;
                potion(g, x + slot * (i + 0.5), plankY - 4, slot * 0.82,
                       tier == null ? Theme.LINE : tier.color, t, tier != null, i);
            }
            double w = slot * 5 + 20 + extra;
            g.setColor(new Color(0x2b1d3d));
            g.fill(new Rectangle2D.Double(x + 6, plankY + 12, 10, 20));
            g.fill(new Rectangle2D.Double(x + w - 30, plankY + 12, 10, 20));
            g.setColor(new Color(0x4a3366));
            g.fill(new RoundRectangle2D.Double(x - 10, plankY, w, 14, 8, 8));
            g.setColor(new Color(0x6a4a94));
            g.fill(new RoundRectangle2D.Double(x - 10, plankY, w, 5, 5, 5));
            return x - 10 + w;
        }

        private static void ear(Graphics2D g, double x1, double y1, double x2, double y2, double x3, double y3, Color c) {
            Path2D p = new Path2D.Double();
            p.moveTo(x1, y1);
            p.lineTo(x2, y2);
            p.lineTo(x3, y3);
            p.closePath();
            g.setColor(c);
            g.fill(p);
        }

        /** Black cat sitting with its feet at (cx, baseY). */
        static void cat(Graphics2D g, double cx, double baseY, double s, double t) {
            AffineTransform old = g.getTransform();
            g.translate(cx, baseY);
            g.scale(s, s);
            Color fur = Theme.CAT, rim = new Color(0x3a2d54);
            double sway = Math.sin(t * 1.4) * 10;
            Path2D tail = new Path2D.Double();
            tail.moveTo(26, -8);
            tail.curveTo(62, -4, 66 + sway, -40, 50 + sway, -58);
            g.setStroke(new BasicStroke(12f, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
            g.setColor(rim);
            g.draw(tail);
            g.setStroke(new BasicStroke(9f, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
            g.setColor(fur);
            g.draw(tail);
            g.setColor(rim);
            g.fill(new Ellipse2D.Double(-35.5, -63.5, 71, 65));
            g.setColor(fur);
            g.fill(new Ellipse2D.Double(-34, -62, 68, 62));
            double hx = -4, hy = -88;
            ear(g, hx - 29, hy - 4, hx - 24, hy - 42, hx - 5, hy - 20, rim);
            ear(g, hx + 29, hy - 4, hx + 24, hy - 42, hx + 5, hy - 20, rim);
            ear(g, hx - 26, hy - 6, hx - 23, hy - 37, hx - 8, hy - 20, fur);
            ear(g, hx + 26, hy - 6, hx + 23, hy - 37, hx + 8, hy - 20, fur);
            ear(g, hx - 22, hy - 14, hx - 21, hy - 31, hx - 12, hy - 21, new Color(0x5b2a56));
            ear(g, hx + 22, hy - 14, hx + 21, hy - 31, hx + 12, hy - 21, new Color(0x5b2a56));
            g.setColor(rim);
            g.fill(new Ellipse2D.Double(hx - 29, hy - 27, 58, 54));
            g.setColor(fur);
            g.fill(new Ellipse2D.Double(hx - 27.5, hy - 25.5, 55, 51));
            boolean blink = (t % 5.0) > 4.85;
            for (int side = -1; side <= 1; side += 2) {
                double ex = hx + side * 11;
                if (blink) {
                    g.setColor(new Color(0xd8ff5e));
                    g.setStroke(new BasicStroke(2f, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
                    g.draw(new Line2D.Double(ex - 5, hy - 1, ex + 5, hy - 1));
                } else {
                    g.setColor(new Color(0xd8ff5e));
                    g.fill(new Ellipse2D.Double(ex - 5.5, hy - 8, 11, 14));
                    g.setColor(Color.BLACK);
                    g.fill(new Ellipse2D.Double(ex - 1.5, hy - 7, 3, 12));
                    g.setColor(new Color(255, 255, 255, 200));
                    g.fill(new Ellipse2D.Double(ex - 4, hy - 7, 3, 3));
                }
            }
            g.setColor(new Color(0xf08ab5));
            Path2D nose = new Path2D.Double();
            nose.moveTo(hx - 3, hy + 6);
            nose.lineTo(hx + 3, hy + 6);
            nose.lineTo(hx, hy + 10);
            nose.closePath();
            g.fill(nose);
            g.setColor(new Color(255, 255, 255, 120));
            g.setStroke(new BasicStroke(1.2f));
            for (int side = -1; side <= 1; side += 2) {
                g.draw(new Line2D.Double(hx + side * 12, hy + 8, hx + side * 32, hy + 4));
                g.draw(new Line2D.Double(hx + side * 12, hy + 11, hx + side * 32, hy + 13));
            }
            g.setStroke(new BasicStroke(1f));
            g.setTransform(old);
        }

        static void cauldron(Graphics2D g, double cx, double baseY, double s, Color liquid, boolean golden, double t) {
            AffineTransform old = g.getTransform();
            g.translate(cx, baseY);
            g.scale(s, s);
            Color shell = golden ? new Color(0xd97706) : new Color(0x2c2440);
            Color edge = golden ? new Color(0xfbbf24) : new Color(0x4d3d70);
            g.setColor(shell.darker());
            g.fill(new Rectangle2D.Double(-44, -10, 14, 12));
            g.fill(new Rectangle2D.Double(30, -10, 14, 12));
            g.setColor(shell);
            g.fill(new Ellipse2D.Double(-62, -92, 124, 90));
            g.setColor(edge);
            g.setStroke(new BasicStroke(3f));
            g.draw(new Arc2D.Double(-56, -82, 112, 76, 200, 120, Arc2D.OPEN));
            g.setStroke(new BasicStroke(1f));
            g.setColor(shell.darker());
            g.fill(new Ellipse2D.Double(-54, -108, 108, 30));
            g.setColor(edge);
            g.draw(new Ellipse2D.Double(-54, -108, 108, 30));
            g.setColor(liquid);
            g.fill(new Ellipse2D.Double(-46, -104, 92, 22));
            g.setColor(Theme.mix(liquid, Color.WHITE, .4));
            g.fill(new Ellipse2D.Double(-30, -100, 40, 7));
            for (int i = 0; i < 3; i++) {
                double p = (t * 0.45 + i * 0.34) % 1.0;
                double bx = -22 + i * 22 + Math.sin(t * 2 + i) * 4;
                double by = -98 - p * 34;
                g.setColor(Theme.alpha(Theme.mix(liquid, Color.WHITE, .3), (int) (200 * (1 - p))));
                g.fill(new Ellipse2D.Double(bx - 5 + p * 2, by - 5, 10 - p * 4, 10 - p * 4));
            }
            g.setTransform(old);
        }

        static void customer(Graphics2D g, double cx, double baseY, double s, double t, String ailment, boolean cured) {
            AffineTransform old = g.getTransform();
            g.translate(cx, baseY);
            g.scale(s, s);
            boolean flaming = "FLAMING_HAIR".equals(ailment) && !cured;
            boolean frog = "FROG_VOICE".equals(ailment);
            Color skin = frog && !cured ? new Color(0x9be7a0) : new Color(0xffd7b0);
            Color robe = frog ? new Color(0x64748b) : new Color(0x6d4bd1);
            g.setColor(robe);
            g.fill(new RoundRectangle2D.Double(-50, -118, 100, 160, 44, 44));
            g.setColor(Theme.alpha(Color.WHITE, 40));
            g.fill(new RoundRectangle2D.Double(-50, -118, 22, 160, 22, 22));
            g.setColor(skin);
            g.fill(new Ellipse2D.Double(-34, -184, 68, 68));
            if (frog) {
                g.setColor(new Color(0xa5b4c6));
                g.fill(new Arc2D.Double(-39, -192, 78, 66, 0, 180, Arc2D.PIE));
                g.setColor(new Color(0xef4444));
                g.fill(new RoundRectangle2D.Double(-5, -214, 10, 30, 8, 8));
            } else {
                Path2D hat = new Path2D.Double();
                hat.moveTo(-40, -168);
                hat.lineTo(40, -168);
                hat.lineTo(6 + Math.sin(t * 2) * 3, -254);
                hat.closePath();
                g.setColor(new Color(0x4c1d95));
                g.fill(hat);
                g.setColor(new Color(0x7c3aed));
                g.fill(new RoundRectangle2D.Double(-50, -176, 100, 13, 12, 12));
                g.setColor(new Color(0xfde047));
                g.fill(new Ellipse2D.Double(-6, -212, 9, 9));
            }
            if (flaming) {
                for (int i = 0; i < 3; i++) {
                    double fl = Math.sin(t * 7 + i * 2) * 5;
                    double fx = -26 + i * 26;
                    Path2D f = new Path2D.Double();
                    f.moveTo(fx - 11, -176);
                    f.curveTo(fx - 12, -198 - fl, fx + 2, -208 - fl, fx, -226 - fl * 2);
                    f.curveTo(fx + 12, -204 - fl, fx + 14, -190, fx + 11, -176);
                    f.closePath();
                    g.setColor(new Color(0xf97316));
                    g.fill(f);
                    g.setColor(new Color(0xfde047));
                    g.fill(new Ellipse2D.Double(fx - 5, -194, 10, 16));
                }
            }
            g.setColor(new Color(0x1b1325));
            g.fill(new Ellipse2D.Double(-17, -150, 9, 10));
            g.fill(new Ellipse2D.Double(8, -150, 9, 10));
            g.setStroke(new BasicStroke(3f, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
            if (cured) g.draw(new Arc2D.Double(-12, -140, 24, 16, 200, 140, Arc2D.OPEN));
            else g.fill(new Ellipse2D.Double(-6, -133, 12, 10));
            g.setStroke(new BasicStroke(1f));
            g.setTransform(old);
        }

        /** Gradient, outlined, slightly wobbly wordmark in the spirit of the Jinxed logo. */
        static void wordmark(Graphics2D g, String text, float size, double cx, double baseline) {
            Font f = Theme.font(Font.BOLD, size);
            FontRenderContext frc = g.getFontRenderContext();
            double spacing = size * 0.07, total = 0;
            double[] adv = new double[text.length()];
            for (int i = 0; i < adv.length; i++) {
                adv[i] = f.getStringBounds(String.valueOf(text.charAt(i)), frc).getWidth();
                total += adv[i] + (i < adv.length - 1 ? spacing : 0);
            }
            double x = cx - total / 2;
            List<Shape> glyphs = new ArrayList<>();
            for (int i = 0; i < adv.length; i++) {
                AffineTransform at = new AffineTransform();
                at.translate(x + adv[i] / 2, baseline + Math.sin(i * 1.3) * size * 0.04);
                at.rotate(Math.toRadians(i % 2 == 0 ? -3 : 3));
                at.translate(-adv[i] / 2, 0);
                glyphs.add(new TextLayout(String.valueOf(text.charAt(i)), f, frc).getOutline(at));
                x += adv[i] + spacing;
            }
            AffineTransform old = g.getTransform();
            g.translate(0, size * 0.08);
            g.setColor(new Color(0x0a0610));
            g.setStroke(new BasicStroke(size * 0.16f, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
            for (Shape s : glyphs) { g.draw(s); g.fill(s); }
            g.setTransform(old);
            g.setStroke(new BasicStroke(size * 0.11f, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
            g.setColor(new Color(0x2a1646));
            for (Shape s : glyphs) g.draw(s);
            g.setPaint(new GradientPaint(0, (float) (baseline - size * 0.85), new Color(0xd9b8ff),
                                         0, (float) baseline, Theme.PINK));
            for (Shape s : glyphs) g.fill(s);
            g.setStroke(new BasicStroke(1f));
        }
    }

    // ========================================================================
    // 6. REUSABLE WIDGETS
    // ========================================================================
    static class PillButton extends JButton {
        private Color base, fg;
        private boolean hover, down;

        PillButton(String text, Color base, Color fg) { this(text, base, fg, 15f); }

        PillButton(String text, Color base, Color fg, float fontSize) {
            super(text);
            this.base = base;
            this.fg = fg;
            setContentAreaFilled(false);
            setBorderPainted(false);
            setFocusPainted(false);
            setOpaque(false);
            setFont(Theme.font(Font.BOLD, fontSize));
            setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
            setMargin(new Insets(10, 24, 13, 24));
            addMouseListener(new MouseAdapter() {
                @Override public void mouseEntered(MouseEvent e) { hover = true; repaint(); }
                @Override public void mouseExited(MouseEvent e) { hover = false; down = false; repaint(); }
                @Override public void mousePressed(MouseEvent e) { down = true; repaint(); }
                @Override public void mouseReleased(MouseEvent e) { down = false; repaint(); }
            });
        }

        void setColors(Color base, Color fg) { this.base = base; this.fg = fg; repaint(); }

        @Override public Dimension getPreferredSize() {
            FontMetrics fm = getFontMetrics(getFont());
            Insets m = getMargin();
            return new Dimension(fm.stringWidth(getText()) + m.left + m.right, fm.getHeight() + m.top + m.bottom);
        }

        @Override protected void paintComponent(Graphics g0) {
            Graphics2D g = (Graphics2D) g0.create();
            Theme.aa(g);
            int w = getWidth(), h = getHeight(), lip = 4, bodyH = h - lip;
            Color c = !isEnabled() ? Theme.mix(base, Theme.BG, .6) : hover ? Theme.mix(base, Color.WHITE, .12) : base;
            g.setColor(Theme.mix(c, Color.BLACK, .38));
            g.fillRoundRect(0, lip, w, bodyH, bodyH, bodyH);
            int y = down && isEnabled() ? lip - 1 : 0;
            g.setColor(c);
            g.fillRoundRect(0, y, w, bodyH, bodyH, bodyH);
            g.setFont(getFont());
            g.setColor(isEnabled() ? fg : Theme.alpha(fg, 130));
            FontMetrics fm = g.getFontMetrics();
            g.drawString(getText(), (w - fm.stringWidth(getText())) / 2, y + (bodyH - fm.getHeight()) / 2 + fm.getAscent());
            g.dispose();
        }
    }

    static class RoundPanel extends JPanel {
        private final Color fill, line;
        private final int arc;

        RoundPanel(LayoutManager lm, Color fill, Color line, int arc) {
            super(lm);
            this.fill = fill;
            this.line = line;
            this.arc = arc;
            setOpaque(false);
        }

        @Override protected void paintComponent(Graphics g0) {
            Graphics2D g = (Graphics2D) g0.create();
            Theme.aa(g);
            g.setColor(fill);
            g.fillRoundRect(0, 0, getWidth() - 1, getHeight() - 1, arc, arc);
            if (line != null) {
                g.setColor(line);
                g.setStroke(new BasicStroke(2f));
                g.drawRoundRect(1, 1, getWidth() - 3, getHeight() - 3, arc, arc);
            }
            g.dispose();
            super.paintComponent(g0);
        }
    }

    static class Chip extends JComponent {
        enum Glyph { NONE, COIN, HEART, BOOK }
        private String text;
        private final Glyph glyph;
        private final Color accent;

        Chip(Glyph glyph, String text, Color accent) {
            this.glyph = glyph;
            this.text = text;
            this.accent = accent;
            setFont(Theme.font(Font.BOLD, 13f));
        }

        void setText(String t) { text = t; revalidate(); repaint(); }

        @Override public Dimension getPreferredSize() {
            FontMetrics fm = getFontMetrics(getFont());
            return new Dimension(fm.stringWidth(text) + 28 + (glyph == Glyph.NONE ? 0 : 24), 34);
        }

        @Override protected void paintComponent(Graphics g0) {
            Graphics2D g = (Graphics2D) g0.create();
            Theme.aa(g);
            int w = getWidth(), h = getHeight();
            g.setColor(Theme.CARD);
            g.fillRoundRect(0, 0, w - 1, h - 1, h, h);
            g.setColor(Theme.LINE);
            g.drawRoundRect(0, 0, w - 1, h - 1, h, h);
            int x = 14;
            if (glyph == Glyph.COIN) {
                g.setColor(Theme.GOLD);
                g.fillOval(x - 2, h / 2 - 8, 16, 16);
                g.setColor(new Color(0xb45309));
                g.drawOval(x - 2, h / 2 - 8, 16, 16);
                g.drawLine(x + 6, h / 2 - 4, x + 6, h / 2 + 4);
                x += 22;
            } else if (glyph == Glyph.HEART) {
                double hx = x - 2, hy = h / 2 - 7, s = 16;
                Path2D p = new Path2D.Double();
                p.moveTo(hx + s / 2, hy + s);
                p.curveTo(hx - s * 0.25, hy + s * 0.5, hx + s * 0.05, hy - s * 0.15, hx + s / 2, hy + s * 0.3);
                p.curveTo(hx + s * 0.95, hy - s * 0.15, hx + s * 1.25, hy + s * 0.5, hx + s / 2, hy + s);
                g.setColor(accent);
                g.fill(p);
                x += 22;
            } else if (glyph == Glyph.BOOK) {
                g.setColor(accent);
                g.fillRoundRect(x - 2, h / 2 - 8, 14, 16, 4, 4);
                g.setColor(Theme.CARD);
                g.drawLine(x + 5, h / 2 - 6, x + 5, h / 2 + 6);
                x += 22;
            }
            g.setFont(getFont());
            g.setColor(Theme.TEXT);
            FontMetrics fm = g.getFontMetrics();
            g.drawString(text, x, (h - fm.getHeight()) / 2 + fm.getAscent());
            g.dispose();
        }
    }

    static class TimerRing extends JComponent {
        private double frac = 1;
        private int secs = 21;

        TimerRing() { setPreferredSize(new Dimension(76, 76)); }

        void set(double frac, int secs) { this.frac = Math.max(0, Math.min(1, frac)); this.secs = secs; repaint(); }

        @Override protected void paintComponent(Graphics g0) {
            Graphics2D g = (Graphics2D) g0.create();
            Theme.aa(g);
            int s = Math.min(getWidth(), getHeight()) - 10, x = (getWidth() - s) / 2, y = (getHeight() - s) / 2;
            g.setStroke(new BasicStroke(7f, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
            g.setColor(Theme.CARD_HI);
            g.drawOval(x, y, s, s);
            g.setColor(secs <= 5 ? Theme.RED : Theme.VIOLET);
            g.draw(new Arc2D.Double(x, y, s, s, 90, -360 * frac, Arc2D.OPEN));
            g.setFont(Theme.font(Font.BOLD, 26f));
            g.setColor(secs <= 5 ? Theme.RED : Theme.TEXT);
            FontMetrics fm = g.getFontMetrics();
            String t = String.valueOf(secs);
            g.drawString(t, (getWidth() - fm.stringWidth(t)) / 2, (getHeight() - fm.getHeight()) / 2 + fm.getAscent());
            g.dispose();
        }
    }

    static class Stamp extends JComponent {
        private String text = "";
        private Color color = Theme.GREEN;
        private double angle = -4;

        Stamp() { setPreferredSize(new Dimension(320, 82)); setMaximumSize(new Dimension(320, 82)); }

        void set(String text, Color color, double angle) { this.text = text; this.color = color; this.angle = angle; repaint(); }

        @Override protected void paintComponent(Graphics g0) {
            Graphics2D g = (Graphics2D) g0.create();
            Theme.aa(g);
            g.rotate(Math.toRadians(angle), getWidth() / 2.0, getHeight() / 2.0);
            g.setFont(Theme.font(Font.BOLD, 34f));
            FontMetrics fm = g.getFontMetrics();
            int tw = fm.stringWidth(text), bw = tw + 44, bh = 58;
            int bx = (getWidth() - bw) / 2, by = (getHeight() - bh) / 2;
            g.setColor(Theme.alpha(color, 36));
            g.fillRoundRect(bx, by, bw, bh, 18, 18);
            g.setColor(color);
            g.setStroke(new BasicStroke(3.5f));
            g.drawRoundRect(bx, by, bw, bh, 18, 18);
            g.drawString(text, bx + 22, by + (bh - fm.getHeight()) / 2 + fm.getAscent());
            g.dispose();
        }
    }

    static class LogoView extends JComponent {
        LogoView() { setPreferredSize(new Dimension(250, 42)); }

        @Override protected void paintComponent(Graphics g0) {
            Graphics2D g = (Graphics2D) g0.create();
            Theme.aa(g);
            Art.wordmark(g, "QUIZALCHEMIST", 24f, getWidth() / 2.0, getHeight() * 0.72);
            g.dispose();
        }
    }

    /** Answer card, like the answer rows in a Jinxed round. */
    static class OptionCard extends JPanel {
        enum State { NORMAL, CORRECT, WRONG, DIM }
        final String text;
        private final int number;
        private State state = State.NORMAL;
        private boolean hover;

        OptionCard(int number, String text, int textWidth, Runnable onClick) {
            super(new BorderLayout());
            this.number = number;
            this.text = text;
            setOpaque(false);
            setBorder(new EmptyBorder(11, 58, 11, 16));
            add(new WrapText(text, Theme.font(Font.BOLD, 15f), Theme.TEXT, textWidth, false), BorderLayout.CENTER);
            setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
            addMouseListener(new MouseAdapter() {
                @Override public void mouseEntered(MouseEvent e) { hover = true; repaint(); }
                @Override public void mouseExited(MouseEvent e) { hover = false; repaint(); }
                @Override public void mouseClicked(MouseEvent e) { if (state == State.NORMAL) onClick.run(); }
            });
        }

        void setState(State s) { state = s; setCursor(Cursor.getDefaultCursor()); repaint(); }

        @Override protected void paintComponent(Graphics g0) {
            Graphics2D g = (Graphics2D) g0.create();
            Theme.aa(g);
            int w = getWidth(), h = getHeight();
            Color border = Theme.LINE, fill = hover && state == State.NORMAL ? Theme.CARD_HI : Theme.CARD;
            if (state == State.CORRECT) { border = Theme.GREEN; fill = Theme.alpha(Theme.GREEN, 40); }
            if (state == State.WRONG) { border = Theme.RED; fill = Theme.alpha(Theme.RED, 40); }
            if (hover && state == State.NORMAL) border = Theme.VIOLET;
            if (state == State.DIM) fill = Theme.alpha(Theme.CARD, 120);
            g.setColor(fill);
            g.fillRoundRect(0, 0, w - 1, h - 1, 26, 26);
            g.setColor(border);
            g.setStroke(new BasicStroke(2f));
            g.drawRoundRect(1, 1, w - 3, h - 3, 26, 26);
            int cx = 30, cy = h / 2;
            g.setColor(state == State.DIM ? Theme.alpha(Theme.CARD_HI, 140) : Theme.CARD_HI);
            g.fillOval(cx - 13, cy - 13, 26, 26);
            g.setStroke(new BasicStroke(2.6f, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
            if (state == State.CORRECT) {
                g.setColor(Theme.GREEN);
                g.drawLine(cx - 6, cy, cx - 2, cy + 5);
                g.drawLine(cx - 2, cy + 5, cx + 7, cy - 5);
            } else if (state == State.WRONG) {
                g.setColor(Theme.RED);
                g.drawLine(cx - 5, cy - 5, cx + 5, cy + 5);
                g.drawLine(cx - 5, cy + 5, cx + 5, cy - 5);
            } else {
                g.setFont(Theme.font(Font.BOLD, 13f));
                g.setColor(Theme.MUTED);
                FontMetrics fm = g.getFontMetrics();
                String n = String.valueOf(number);
                g.drawString(n, cx - fm.stringWidth(n) / 2, cy + (fm.getAscent() - fm.getDescent()) / 2);
            }
            g.dispose();
        }
    }

    /** Fixed-width wrapped text (Swing's HTML label ignores CSS widths, so lines are measured manually). */
    static class WrapText extends JComponent {
        private static final FontRenderContext FRC = new FontRenderContext(null, true, true);
        private String text;
        private final Font font;
        private final Color color;
        private final int width;
        private final boolean center;
        private final List<TextLayout> lines = new ArrayList<>();
        private int height;

        WrapText(String text, Font font, Color color, int width, boolean center) {
            this.font = font;
            this.color = color;
            this.width = width;
            this.center = center;
            this.text = text;
            relayout();
        }

        void setText(String t) { text = t; relayout(); revalidate(); repaint(); }

        private void relayout() {
            lines.clear();
            double h = 0;
            for (String para : (text == null ? "" : text).split("\n", -1)) {
                if (para.isEmpty()) { h += font.getSize2D() * 1.3; lines.add(null); continue; }
                AttributedString as = new AttributedString(para);
                as.addAttribute(TextAttribute.FONT, font);
                LineBreakMeasurer m = new LineBreakMeasurer(as.getIterator(), FRC);
                while (m.getPosition() < para.length()) {
                    TextLayout tl = m.nextLayout(width);
                    lines.add(tl);
                    h += tl.getAscent() + tl.getDescent() + tl.getLeading();
                }
            }
            height = (int) Math.ceil(h) + 2;
        }

        @Override public Dimension getPreferredSize() { return new Dimension(width, height); }
        @Override public Dimension getMinimumSize() { return getPreferredSize(); }
        @Override public Dimension getMaximumSize() { return getPreferredSize(); }

        @Override protected void paintComponent(Graphics g0) {
            Graphics2D g = (Graphics2D) g0.create();
            Theme.aa(g);
            g.setColor(color);
            float y = 0;
            for (TextLayout tl : lines) {
                if (tl == null) { y += font.getSize2D() * 1.3f; continue; }
                y += tl.getAscent();
                float x = center ? (width - tl.getAdvance()) / 2f : 0f;
                tl.draw(g, x, y);
                y += tl.getDescent() + tl.getLeading();
            }
            g.dispose();
        }
    }

    private static JLabel label(String text, int style, float size, Color color) {
        JLabel l = new JLabel(text);
        l.setFont(Theme.font(style, size));
        l.setForeground(color);
        return l;
    }

    private static String esc(String s) {
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }

    // ========================================================================
    // 7. GAME STATE
    // ========================================================================
    private final SpellbookDeck spellbook = new SpellbookDeck();
    private final Map<IngredientType, Integer> inventory = new EnumMap<>(IngredientType.class);
    private final Map<IngredientType, Integer> cauldron = new EnumMap<>(IngredientType.class);
    private final List<PotionRecipe> recipes = new ArrayList<>();
    private final List<CustomerOrder> customers = new ArrayList<>();
    private final List<ShopUpgrade> upgrades = new ArrayList<>();
    private final LinkedList<Tier> shelf = new LinkedList<>();

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
    private int roundNo = 0;
    private int servedStreak = 0;
    private double phase = 0;
    private String statusMessage = "Ignis rushed in with flaming hair! Study to harvest a Dragon Scale!";

    // ---- Swing widgets ----
    private final CardLayout cardLayout = new CardLayout();
    private final JPanel root = new JPanel(cardLayout);
    private final JPanel questionHost = new JPanel(new BorderLayout());
    private final StagePanel stage = new StagePanel();
    private final TitlePanel titleScreen = new TitlePanel();
    private final JPanel orderPanel = new JPanel();
    private final Chip goldChip = new Chip(Chip.Glyph.COIN, "50 G", Theme.GOLD);
    private final Chip heartChip = new Chip(Chip.Glyph.HEART, "3/3", Theme.RED);
    private final Chip deckChip = new Chip(Chip.Glyph.BOOK, "", Theme.VIOLET);
    private final PillButton primaryBtn = new PillButton("", Theme.GREEN, Color.BLACK, 16f);
    private QuestionPanel currentQuestion;

    public QuizAlchemist() {
        super("QuizAlchemist");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(1180, 780);
        setMinimumSize(new Dimension(1020, 700));
        setLocationRelativeTo(null);
        initGameData();

        root.setBackground(Theme.BG);
        questionHost.setOpaque(false);
        root.add(titleScreen, "title");
        root.add(buildGameScreen(), "game");
        root.add(questionHost, "question");
        setContentPane(root);

        new javax.swing.Timer(40, e -> {
            phase += 0.04;
            if (titleScreen.isShowing()) titleScreen.repaint();
            if (stage.isShowing()) stage.repaint();
            if (currentQuestion != null && currentQuestion.isShowing()) currentQuestion.repaint();
        }).start();

        refreshUi();
        showScreen("title");
    }

    private void showScreen(String name) { cardLayout.show(root, name); }

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
            "Instantly douses magical hair-fires before class presentations.", coolingMap, 110);

        Map<IngredientType, Integer> croakMap = new EnumMap<>(IngredientType.class);
        croakMap.put(IngredientType.MOONWATER, 2);
        croakMap.put(IngredientType.MANDRAKE_ROOT, 1);
        PotionRecipe croakTonic = new PotionRecipe(
            "croak_tonic", "Croak-Cure Tonic",
            "Restores noble knight voices hexed into frog croaks.", croakMap, 125);

        recipes.add(coolingElixir);
        recipes.add(croakTonic);

        customers.add(new CustomerOrder(
            "c1", "Ignis the Apprentice", "Stressed Wizard Student",
            "\"Please, I need a Cooling Elixir before my presentation! My hair literally caught fire!\"",
            "\"Ahhh, sweet frost! My flaming hair is out! Take these gold coins!\"",
            coolingElixir, "FLAMING_HAIR"));
        customers.add(new CustomerOrder(
            "c2", "Sir Reginald", "Cursed Royal Knight",
            "\"RIBBIT! Pardon me—a bog witch turned my voice into a frog croak! I need a Croak-Cure Tonic!\"",
            "\"Huzzah! My royal baritone has returned! Here is your gold, Alchemist!\"",
            croakTonic, "FROG_VOICE"));

        upgrades.add(new ShopUpgrade("u_owl", "Hint Owl Familiar", 80, "Whispers a clue on tough flashcards.") {
            @Override public String describeRole() { return "Companion Upgrade"; }
            @Override public void applyUpgrade(QuizAlchemist game) { game.hasHintOwl = true; }
        });
        upgrades.add(new ShopUpgrade("u_gold", "Golden Cauldron", 100, "+25% gold on 5-star potions. Unlocks Enchanted brews.") {
            @Override public String describeRole() { return "Equipment Upgrade"; }
            @Override public void applyUpgrade(QuizAlchemist game) { game.hasGoldenCauldron = true; }
        });
        upgrades.add(new ShopUpgrade("u_shears", "Enchanted Shears", 120, "+1 bonus ingredient on 2+ study streaks.") {
            @Override public String describeRole() { return "Tool Upgrade"; }
            @Override public void applyUpgrade(QuizAlchemist game) { game.hasEnchantedShears = true; }
        });
    }

    private CustomerOrder getCurrentCustomer() {
        return customers.get(currentCustomerIdx % customers.size());
    }

    /** Cosmetic potion tier for a brew: 3-star Bubbly, 5-star Glowing, Golden Cauldron Enchanted, +3 streak Primordial. */
    private Tier tierFor(int stars) {
        if (stars < 5) return Tier.BUBBLY;
        if (!hasGoldenCauldron) return Tier.GLOWING;
        return servedStreak >= 2 ? Tier.PRIMORDIAL : Tier.ENCHANTED;
    }

    private IngredientType firstMissing(PotionRecipe r) {
        for (Map.Entry<IngredientType, Integer> e : r.getRequiredIngredients().entrySet()) {
            int have = inventory.getOrDefault(e.getKey(), 0) + cauldron.getOrDefault(e.getKey(), 0);
            if (have < e.getValue()) return e.getKey();
        }
        return null;
    }

    // ========================================================================
    // 8. SCREENS
    // ========================================================================
    private JPanel buildGameScreen() {
        JPanel screen = new JPanel(new BorderLayout());
        screen.setBackground(Theme.BG);

        JPanel top = new JPanel(new BorderLayout(12, 0));
        top.setBackground(Theme.BG_DEEP);
        top.setBorder(BorderFactory.createCompoundBorder(
            BorderFactory.createMatteBorder(0, 0, 2, 0, Theme.LINE), new EmptyBorder(8, 18, 8, 18)));
        top.add(new LogoView(), BorderLayout.WEST);
        JPanel chips = new JPanel(new FlowLayout(FlowLayout.RIGHT, 10, 4));
        chips.setOpaque(false);
        chips.add(deckChip);
        chips.add(heartChip);
        chips.add(goldChip);
        top.add(chips, BorderLayout.EAST);
        screen.add(top, BorderLayout.NORTH);

        JPanel center = new JPanel(new BorderLayout());
        center.setOpaque(false);
        center.add(stage, BorderLayout.CENTER);
        orderPanel.setLayout(new BoxLayout(orderPanel, BoxLayout.Y_AXIS));
        orderPanel.setBackground(Theme.BG_DEEP);
        orderPanel.setBorder(BorderFactory.createCompoundBorder(
            BorderFactory.createMatteBorder(0, 2, 0, 0, Theme.LINE), new EmptyBorder(16, 18, 16, 18)));
        orderPanel.setPreferredSize(new Dimension(344, 10));
        center.add(orderPanel, BorderLayout.EAST);
        screen.add(center, BorderLayout.CENTER);

        JPanel bar = new JPanel(new BorderLayout(12, 0));
        bar.setBackground(Theme.BG_DEEP);
        bar.setBorder(BorderFactory.createCompoundBorder(
            BorderFactory.createMatteBorder(2, 0, 0, 0, Theme.LINE), new EmptyBorder(12, 18, 12, 18)));
        JPanel left = new JPanel(new FlowLayout(FlowLayout.LEFT, 10, 0));
        left.setOpaque(false);
        PillButton spell = new PillButton("Spellbook", Theme.CARD_HI, Theme.TEXT, 14f);
        spell.addActionListener(e -> openSpellbookDialog());
        PillButton shop = new PillButton("Upgrades", Theme.CARD_HI, Theme.TEXT, 14f);
        shop.addActionListener(e -> openUpgradesDialog());
        PillButton toss = new PillButton("Fill cauldron", Theme.CARD_HI, Theme.TEXT, 14f);
        toss.addActionListener(e -> tossRecipeIntoCauldron());
        PillButton help = new PillButton("How to play", Theme.CARD_HI, Theme.TEXT, 14f);
        help.addActionListener(e -> openHowToPlayDialog());
        left.add(spell);
        left.add(shop);
        left.add(toss);
        left.add(help);
        bar.add(left, BorderLayout.WEST);
        primaryBtn.addActionListener(e -> handlePrimaryCounterAction());
        JPanel right = new JPanel(new FlowLayout(FlowLayout.RIGHT, 0, 0));
        right.setOpaque(false);
        right.add(primaryBtn);
        bar.add(right, BorderLayout.EAST);
        screen.add(bar, BorderLayout.SOUTH);
        return screen;
    }

    private void refreshUi() {
        CustomerOrder cust = getCurrentCustomer();
        PotionRecipe recipe = cust.getDesiredRecipe();

        goldChip.setText(gold + " G");
        heartChip.setText(vitality + "/" + maxVitality);
        deckChip.setText(spellbook.getSubjectName() + "  ·  " + spellbook.getCards().size() + " cards");

        rebuildOrderPanel(cust, recipe);

        IngredientType missing = firstMissing(recipe);
        if (customerCured) {
            primaryBtn.setText("Welcome next customer");
            primaryBtn.setColors(Theme.VIOLET, Color.WHITE);
        } else if (brewedPotionStars != null) {
            int payout = recipe.calculatePayout(brewedPotionStars, hasGoldenCauldron);
            primaryBtn.setText("Serve " + tierFor(brewedPotionStars).label + " " + recipe.getName() + "  (+" + payout + " G)");
            primaryBtn.setColors(Theme.GOLD, new Color(0x2b1a00));
        } else if (recipe.canBrew(cauldron)) {
            primaryBtn.setText("Brew & stabilize");
            primaryBtn.setColors(Theme.GREEN, Color.BLACK);
        } else if (missing == null) {
            primaryBtn.setText("Add ingredients to the cauldron");
            primaryBtn.setColors(Theme.PINK, Color.BLACK);
        } else {
            primaryBtn.setText("Study to harvest " + missing.getDisplayName());
            primaryBtn.setColors(Theme.VIOLET, Color.WHITE);
        }
        revalidate();
        repaint();
    }

    private void rebuildOrderPanel(CustomerOrder cust, PotionRecipe recipe) {
        orderPanel.removeAll();
        addLeft(orderPanel, label("ORDER #" + (currentCustomerIdx + 1), Font.BOLD, 12f, Theme.MUTED));
        orderPanel.add(Box.createVerticalStrut(4));
        addLeft(orderPanel, label(cust.getName(), Font.BOLD, 22f, Theme.TEXT));
        addLeft(orderPanel, label(cust.getTitle(), Font.PLAIN, 13f, Theme.MUTED));
        orderPanel.add(Box.createVerticalStrut(10));

        String quote = customerCured ? cust.getCuredDialogue() : cust.getDialogue();
        WrapText q = new WrapText(quote, Theme.font(Font.ITALIC, 14f), Theme.TEXT, 286, false);
        RoundPanel bubble = new RoundPanel(new BorderLayout(), Theme.CARD, Theme.LINE, 22);
        bubble.setBorder(new EmptyBorder(10, 12, 10, 12));
        bubble.add(q, BorderLayout.CENTER);
        addLeft(orderPanel, bubble);
        orderPanel.add(Box.createVerticalStrut(14));

        addLeft(orderPanel, label(recipe.getName(), Font.BOLD, 17f, Theme.GOLD));
        WrapText desc = new WrapText(recipe.describeRole().replaceFirst("^[^:]*: ", ""), Theme.font(Font.PLAIN, 12f), Theme.MUTED, 300, false);
        addLeft(orderPanel, desc);
        orderPanel.add(Box.createVerticalStrut(8));

        for (IngredientType type : new IngredientType[]{
            IngredientType.ICE_BERRY, IngredientType.MOONWATER, IngredientType.MANDRAKE_ROOT, IngredientType.DRAGON_SCALE}) {
            addLeft(orderPanel, new IngredientRow(type, recipe));
            orderPanel.add(Box.createVerticalStrut(6));
        }
        orderPanel.add(Box.createVerticalStrut(4));
        addLeft(orderPanel, label("Burnt Scales (Murky): " + inventory.getOrDefault(IngredientType.BURNT_SCALE, 0), Font.PLAIN, 12f, Theme.MUTED));
        orderPanel.add(Box.createVerticalGlue());

        WrapText st = new WrapText(statusMessage, Theme.font(Font.BOLD, 13f), Theme.TEXT, 286, false);
        RoundPanel status = new RoundPanel(new BorderLayout(), Theme.alpha(Theme.VIOLET, 60), Theme.VIOLET, 22);
        status.setBorder(new EmptyBorder(10, 12, 10, 12));
        status.add(st, BorderLayout.CENTER);
        addLeft(orderPanel, status);
        orderPanel.revalidate();
        orderPanel.repaint();
    }

    private static void addLeft(JPanel p, JComponent c) {
        c.setAlignmentX(Component.LEFT_ALIGNMENT);
        p.add(c);
    }

    /** One tappable ingredient row: tap to toss into the cauldron, or study when out of stock. */
    private final class IngredientRow extends JComponent {
        private final IngredientType type;
        private final int need;
        private boolean hover;

        IngredientRow(IngredientType type, PotionRecipe recipe) {
            this.type = type;
            this.need = recipe.getRequiredIngredients().getOrDefault(type, 0);
            Dimension d = new Dimension(306, 52);
            setPreferredSize(d);
            setMaximumSize(d);
            setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
            addMouseListener(new MouseAdapter() {
                @Override public void mouseEntered(MouseEvent e) { hover = true; repaint(); }
                @Override public void mouseExited(MouseEvent e) { hover = false; repaint(); }
                @Override public void mouseClicked(MouseEvent e) {
                    if (customerCured || brewedPotionStars != null) return;
                    int stock = inventory.getOrDefault(type, 0);
                    if (stock > 0) {
                        inventory.put(type, stock - 1);
                        cauldron.merge(type, 1, Integer::sum);
                        statusMessage = "Tossed 1x " + type.getDisplayName() + " into the cauldron!";
                        refreshUi();
                    } else {
                        statusMessage = "Out of " + type.getDisplayName() + " — study to harvest more!";
                        startGather(type);
                    }
                }
            });
        }

        @Override protected void paintComponent(Graphics g0) {
            Graphics2D g = (Graphics2D) g0.create();
            Theme.aa(g);
            int w = getWidth(), h = getHeight();
            int stock = inventory.getOrDefault(type, 0), pot = cauldron.getOrDefault(type, 0);
            g.setColor(hover ? Theme.CARD_HI : Theme.CARD);
            g.fillRoundRect(0, 0, w - 1, h - 1, 20, 20);
            g.setColor(hover ? Theme.VIOLET : Theme.LINE);
            g.setStroke(new BasicStroke(2f));
            g.drawRoundRect(1, 1, w - 3, h - 3, 20, 20);
            g.setColor(Theme.alpha(type.getColor(), 70));
            g.fillOval(10, h / 2 - 15, 30, 30);
            g.setColor(type.getColor());
            g.fillOval(17, h / 2 - 8, 16, 16);
            g.setFont(Theme.font(Font.BOLD, 14f));
            g.setColor(need > 0 ? Theme.TEXT : Theme.MUTED);
            g.drawString(type.getDisplayName(), 50, 22);
            g.setFont(Theme.font(Font.PLAIN, 12f));
            g.setColor(stock > 0 ? Theme.MUTED : Theme.RED);
            g.drawString(stock > 0 ? "In stock: " + stock : "Out of stock — tap to study", 50, 40);
            if (need > 0) {
                String s = Math.min(pot, need) + "/" + need;
                g.setFont(Theme.font(Font.BOLD, 14f));
                FontMetrics fm = g.getFontMetrics();
                g.setColor(pot >= need ? Theme.GREEN : Theme.GOLD);
                g.drawString(s, w - 14 - fm.stringWidth(s), 24);
                g.setColor(Theme.BG_DEEP);
                g.fillRoundRect(w - 74, 32, 60, 7, 7, 7);
                g.setColor(pot >= need ? Theme.GREEN : Theme.GOLD);
                g.fillRoundRect(w - 74, 32, (int) (60.0 * Math.min(pot, need) / need), 7, 7, 7);
            }
            g.dispose();
        }
    }

    private class StagePanel extends JPanel {
        StagePanel() { setBackground(Theme.BG); setMinimumSize(new Dimension(420, 300)); }

        @Override protected void paintComponent(Graphics g0) {
            super.paintComponent(g0);
            Graphics2D g = (Graphics2D) g0.create();
            Theme.aa(g);
            int w = getWidth(), h = getHeight();
            Art.sky(g, w, h, phase);
            double scale = Math.max(0.65, Math.min(1.2, Math.min(w / 720.0, h / 560.0)));
            double counterTop = h * 0.74;

            double slot = Math.max(44, Math.min(66, w * 0.082));
            double plankY = h * 0.31;
            double shelfEnd = Art.shelf(g, w * 0.05, plankY, slot, new ArrayList<>(shelf), phase, 96 * scale);
            Art.cat(g, shelfEnd - 52 * scale, plankY + 2, scale * 0.95, phase);

            CustomerOrder cust = getCurrentCustomer();
            double cx = w * 0.64;
            Art.customer(g, cx, counterTop + 14, scale * 1.05, phase, cust.getAilmentType(), customerCured);

            // wanted-potion bubble / happy sparkles
            if (!customerCured && brewedPotionStars == null) {
                double bx = cx + 54 * scale, by = counterTop - 250 * scale;
                g.setColor(Theme.TEXT);
                g.fill(new RoundRectangle2D.Double(bx, by, 62, 70, 22, 22));
                Path2D tailP = new Path2D.Double();
                tailP.moveTo(bx + 8, by + 62);
                tailP.lineTo(bx - 6, by + 84);
                tailP.lineTo(bx + 26, by + 66);
                tailP.closePath();
                g.fill(tailP);
                Art.potion(g, bx + 31, by + 62, 52, recipeColor(cust.getDesiredRecipe()), phase, true, 7);
            } else if (customerCured) {
                for (int i = 0; i < 5; i++) {
                    double a = phase * 2 + i * 1.3;
                    double sx = cx + Math.cos(a) * 80 * scale, sy = counterTop - 190 * scale + Math.sin(a * 1.3) * 40 * scale;
                    g.setColor(Theme.alpha(Theme.GOLD, 200));
                    g.setStroke(new BasicStroke(2.5f, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
                    g.draw(new Line2D.Double(sx - 6, sy, sx + 6, sy));
                    g.draw(new Line2D.Double(sx, sy - 6, sx, sy + 6));
                }
                g.setStroke(new BasicStroke(1f));
            }

            // counter
            g.setColor(new Color(0x2f2142));
            g.fillRect(0, (int) counterTop, w, h - (int) counterTop);
            g.setColor(new Color(0x5a3f82));
            g.fillRect(0, (int) counterTop, w, 9);
            g.setColor(new Color(0, 0, 0, 55));
            for (int x = 70; x < w; x += 140) g.fillRect(x, (int) counterTop + 12, 3, h);

            // cauldron
            Color liquid = new Color(0x7ee081);
            double r = 0, gr = 0, b = 0;
            int n = 0;
            for (Map.Entry<IngredientType, Integer> e : cauldron.entrySet()) {
                int c = e.getValue();
                if (c > 0) {
                    Color col = e.getKey().getColor();
                    r += col.getRed() * c;
                    gr += col.getGreen() * c;
                    b += col.getBlue() * c;
                    n += c;
                }
            }
            if (n > 0) liquid = new Color((int) (r / n), (int) (gr / n), (int) (b / n));
            double potX = w * 0.25, potBase = counterTop + 6;
            Art.cauldron(g, potX, potBase, scale * 1.05, liquid, hasGoldenCauldron, phase);
            if (brewedPotionStars != null) {
                double bob = Math.sin(phase * 3) * 6;
                Art.potion(g, potX, potBase - 150 * scale + bob, 78 * scale, tierFor(brewedPotionStars).color, phase, true, 2);
            }
            g.dispose();
        }
    }

    private Color recipeColor(PotionRecipe r) {
        double rr = 0, gg = 0, bb = 0;
        int n = 0;
        for (Map.Entry<IngredientType, Integer> e : r.getRequiredIngredients().entrySet()) {
            Color c = e.getKey().getColor();
            rr += c.getRed() * e.getValue();
            gg += c.getGreen() * e.getValue();
            bb += c.getBlue() * e.getValue();
            n += e.getValue();
        }
        return n == 0 ? Theme.GREEN : new Color((int) (rr / n), (int) (gg / n), (int) (bb / n));
    }

    private class TitlePanel extends JPanel {
        TitlePanel() {
            setLayout(new BorderLayout());
            setBackground(Theme.BG);
            JPanel south = new JPanel();
            south.setOpaque(false);
            south.setLayout(new BoxLayout(south, BoxLayout.Y_AXIS));
            south.setBorder(new EmptyBorder(0, 0, 44, 0));

            PillButton play = new PillButton("Play", Theme.VIOLET, Color.WHITE, 22f);
            play.setMargin(new Insets(12, 72, 15, 72));
            play.setAlignmentX(Component.CENTER_ALIGNMENT);
            play.addActionListener(e -> { refreshUi(); showScreen("game"); });

            JPanel row = new JPanel(new FlowLayout(FlowLayout.CENTER, 12, 0));
            row.setOpaque(false);
            PillButton how = new PillButton("How to play", Theme.CARD_HI, Theme.TEXT, 14f);
            how.addActionListener(e -> openHowToPlayDialog());
            PillButton book = new PillButton("Load your reviewer", Theme.CARD_HI, Theme.TEXT, 14f);
            book.addActionListener(e -> openSpellbookDialog());
            row.add(how);
            row.add(book);

            south.add(play);
            south.add(Box.createVerticalStrut(16));
            south.add(row);
            add(south, BorderLayout.SOUTH);
        }

        @Override protected void paintComponent(Graphics g0) {
            super.paintComponent(g0);
            Graphics2D g = (Graphics2D) g0.create();
            Theme.aa(g);
            int w = getWidth(), h = getHeight();
            Art.sky(g, w, h, phase);
            float size = (float) Math.max(40, Math.min(92, w / 10.5));
            Art.wordmark(g, "QUIZALCHEMIST", size, w / 2.0, h * 0.20);
            g.setFont(Theme.font(Font.BOLD, 19f));
            g.setColor(Theme.TEXT);
            String tag = "The study game where every right answer is brewed into a potion";
            FontMetrics fm = g.getFontMetrics();
            g.drawString(tag, (w - fm.stringWidth(tag)) / 2, (int) (h * 0.20 + size * 0.62));
            g.setFont(Theme.font(Font.PLAIN, 14f));
            g.setColor(Theme.MUTED);
            String sub = "Study your own notes. Brew rare potions. Don't get jinxed.";
            fm = g.getFontMetrics();
            g.drawString(sub, (w - fm.stringWidth(sub)) / 2, (int) (h * 0.20 + size * 0.62) + 28);

            double slot = Math.max(52, Math.min(84, w * 0.085));
            double extra = slot * 1.7;
            double shelfW = slot * 5 + 20 + extra;
            double x = (w - shelfW) / 2 + 10;
            double plankY = h * 0.60;
            List<Tier> all = Arrays.asList(Tier.values());
            double end = Art.shelf(g, x, plankY, slot, all, phase, extra);
            Art.cat(g, end - slot * 0.85, plankY + 2, Math.max(0.9, slot / 62.0), phase);
            g.dispose();
        }
    }

    // ========================================================================
    // 9. STUDY ROUND (Jinxed-style prompt + countdown + answer cards)
    // ========================================================================
    private final class QuestionPanel extends JPanel {
        private final javax.swing.Timer clock;
        private double remaining = 21.0;
        private final TimerRing ring = new TimerRing();
        private final List<OptionCard> optionCards = new ArrayList<>();
        private final String correct;
        private final java.util.function.Function<Boolean, String> resolver;
        private boolean locked = false;
        private final JPanel feedback = new JPanel();
        private final Stamp stamp = new Stamp();
        private final WrapText detail = new WrapText("", Theme.font(Font.PLAIN, 15f), Theme.TEXT, 560, true);
        private final PillButton continueBtn = new PillButton("Continue", Theme.VIOLET, Color.WHITE, 16f);

        QuestionPanel(String kind, String promptText, String caption, List<String> options, String correct,
                      String hint, java.util.function.Function<Boolean, String> resolver) {
            this.correct = correct;
            this.resolver = resolver;
            setLayout(new BorderLayout());
            setOpaque(false);

            JPanel col = new JPanel();
            col.setOpaque(false);
            col.setLayout(new BoxLayout(col, BoxLayout.Y_AXIS));

            JPanel head = new JPanel(new BorderLayout());
            head.setOpaque(false);
            Dimension hd = new Dimension(660, 70);
            head.setPreferredSize(hd);
            head.setMaximumSize(hd);
            JPanel chipWrap = new JPanel(new FlowLayout(FlowLayout.LEFT, 0, 0));
            chipWrap.setOpaque(false);
            chipWrap.add(new Chip(Chip.Glyph.NONE, kind, Theme.VIOLET));
            head.add(chipWrap, BorderLayout.WEST);
            head.add(ring, BorderLayout.EAST);
            JLabel round = label("Round " + roundNo, Font.BOLD, 15f, Theme.MUTED);
            round.setHorizontalAlignment(SwingConstants.CENTER);
            head.add(round, BorderLayout.CENTER);
            col.add(head);

            WrapText prompt = new WrapText(promptText, Theme.font(Font.BOLD, 26f), Theme.TEXT, 640, true);
            prompt.setAlignmentX(Component.CENTER_ALIGNMENT);
            col.add(prompt);
            col.add(Box.createVerticalStrut(8));
            JLabel cap = label(caption, Font.PLAIN, 14f, Theme.MUTED);
            cap.setAlignmentX(Component.CENTER_ALIGNMENT);
            col.add(cap);
            col.add(Box.createVerticalStrut(12));

            int i = 0;
            for (String opt : options) {
                final String chosen = opt;
                OptionCard oc = new OptionCard(++i, opt, 560, () -> answer(chosen));
                oc.setAlignmentX(Component.CENTER_ALIGNMENT);
                oc.setMaximumSize(new Dimension(660, 400));
                optionCards.add(oc);
                col.add(oc);
                col.add(Box.createVerticalStrut(10));

                final int idx = i;
                String key = "opt" + idx;
                getInputMap(WHEN_IN_FOCUSED_WINDOW).put(KeyStroke.getKeyStroke(KeyEvent.VK_0 + idx, 0), key);
                getActionMap().put(key, new AbstractAction() {
                    @Override public void actionPerformed(ActionEvent e) { answer(chosen); }
                });
            }

            if (hint != null) {
                PillButton owl = new PillButton("Ask the Hint Owl", Theme.GOLD, new Color(0x2b1a00), 13f);
                owl.setAlignmentX(Component.CENTER_ALIGNMENT);
                WrapText hintLabel = new WrapText("", Theme.font(Font.ITALIC, 13f), Theme.GOLD, 560, true);
                hintLabel.setAlignmentX(Component.CENTER_ALIGNMENT);
                owl.addActionListener(e -> {
                    hintLabel.setText("Owl whispers: " + hint);
                    owl.setEnabled(false);
                });
                col.add(owl);
                col.add(Box.createVerticalStrut(6));
                col.add(hintLabel);
            }

            feedback.setOpaque(false);
            feedback.setLayout(new BoxLayout(feedback, BoxLayout.Y_AXIS));
            feedback.setAlignmentX(Component.CENTER_ALIGNMENT);
            stamp.setAlignmentX(Component.CENTER_ALIGNMENT);
            detail.setAlignmentX(Component.CENTER_ALIGNMENT);
            continueBtn.setAlignmentX(Component.CENTER_ALIGNMENT);
            continueBtn.addActionListener(e -> finish());
            feedback.add(Box.createVerticalStrut(6));
            feedback.add(stamp);
            feedback.add(detail);
            feedback.add(Box.createVerticalStrut(12));
            feedback.add(continueBtn);
            feedback.setVisible(false);
            col.add(feedback);

            JPanel holder = new JPanel(new GridBagLayout());
            holder.setOpaque(false);
            holder.setBorder(new EmptyBorder(8, 0, 8, 0));
            holder.add(col, new GridBagConstraints());
            JScrollPane sp = new JScrollPane(holder, ScrollPaneConstants.VERTICAL_SCROLLBAR_AS_NEEDED,
                                             ScrollPaneConstants.HORIZONTAL_SCROLLBAR_NEVER);
            sp.setOpaque(false);
            sp.getViewport().setOpaque(false);
            sp.setBorder(null);
            sp.getVerticalScrollBar().setUnitIncrement(20);
            add(sp, BorderLayout.CENTER);

            getInputMap(WHEN_IN_FOCUSED_WINDOW).put(KeyStroke.getKeyStroke(KeyEvent.VK_ENTER, 0), "next");
            getActionMap().put("next", new AbstractAction() {
                @Override public void actionPerformed(ActionEvent e) { if (locked) finish(); }
            });

            clock = new javax.swing.Timer(100, e -> {
                remaining -= 0.1;
                ring.set(remaining / 21.0, (int) Math.ceil(Math.max(0, remaining)));
                if (remaining <= 0) answer(null);
            });
            clock.start();
        }

        private void answer(String chosen) {
            if (locked) return;
            locked = true;
            clock.stop();
            boolean ok = chosen != null && chosen.equals(correct);
            for (OptionCard oc : optionCards) {
                if (oc.text.equals(correct)) oc.setState(OptionCard.State.CORRECT);
                else if (oc.text.equals(chosen)) oc.setState(OptionCard.State.WRONG);
                else oc.setState(OptionCard.State.DIM);
            }
            String msg = resolver.apply(ok);
            stamp.set(ok ? "BREWED!" : chosen == null ? "TIME'S UP!" : "JINXED!", ok ? Theme.GREEN : Theme.RED, ok ? -4 : 5);
            detail.setText(msg + (ok ? "" : "\nCorrect answer: " + correct));
            feedback.setVisible(true);
            revalidate();
            repaint();
            continueBtn.requestFocusInWindow();
        }

        private void finish() {
            clock.stop();
            refreshUi();
            showScreen("game");
        }

        @Override public void removeNotify() { clock.stop(); super.removeNotify(); }

        @Override protected void paintComponent(Graphics g0) {
            Graphics2D g = (Graphics2D) g0.create();
            Theme.aa(g);
            Art.sky(g, getWidth(), getHeight(), phase);
            g.setColor(new Color(18, 11, 25, 150));
            g.fillRect(0, 0, getWidth(), getHeight());
            g.dispose();
        }
    }

    private void presentQuestion(QuestionPanel qp) {
        currentQuestion = qp;
        questionHost.removeAll();
        questionHost.add(qp, BorderLayout.CENTER);
        questionHost.revalidate();
        questionHost.repaint();
        showScreen("question");
    }

    private void startGather(IngredientType target) {
        Flashcard card = spellbook.pickNextCard(lastQuestionId);
        lastQuestionId = card.getId();
        roundNo++;
        List<String> opts = new ArrayList<>(card.getOptions());
        Collections.shuffle(opts);
        String kind = "HARVEST · " + target.getDisplayName().toUpperCase() + (card.isNeedsPractice() ? " · PRIORITY REVIEW" : "");
        presentQuestion(new QuestionPanel(kind, card.getQuestion(),
            "Pick the right answer before the clock runs out. Wrong answers get you jinxed.",
            opts, card.getCorrectAnswer(), hasHintOwl ? card.getHint() : null, ok -> {
                spellbook.recordOutcome(card.getId(), ok);
                if (ok) {
                    int qty = (hasEnchantedShears && card.getMasteryStreak() >= 2) ? 2 : 1;
                    inventory.merge(target, qty, Integer::sum);
                    statusMessage = "Correct! Harvested +" + qty + " " + target.getDisplayName() + "!";
                    return "+" + qty + " " + target.getDisplayName() + " harvested";
                }
                inventory.merge(IngredientType.BURNT_SCALE, 1, Integer::sum);
                vitality = Math.max(1, vitality - 1);
                statusMessage = "Jinxed! You got a Burnt Scale. This card is queued for extra practice.";
                return "A Murky Burnt Scale instead. This card is now prioritized for review.";
            }));
    }

    private void startStabilize(PotionRecipe recipe) {
        Flashcard card = spellbook.pickNextCard(lastQuestionId);
        lastQuestionId = card.getId();
        roundNo++;
        presentQuestion(new QuestionPanel("STABILIZE · " + recipe.getName().toUpperCase(), card.getTfStatement(),
            "True or false? The cauldron is bubbling!",
            Arrays.asList("True", "False"), card.isTfAnswer() ? "True" : "False",
            hasHintOwl ? card.getHint() : null, ok -> {
                spellbook.recordOutcome(card.getId(), ok);
                cauldron.clear();
                brewedPotionStars = ok ? 5 : 3;
                Tier tier = tierFor(brewedPotionStars);
                statusMessage = ok ? "POOF! Brewed a 5-star " + tier.label + " " + recipe.getName() + "!"
                                   : "Fizzle! Brewed a 3-star " + tier.label + " " + recipe.getName() + "!";
                return (ok ? "A " + tier.label + " " : "A weaker " + tier.label + " ") + recipe.getName() + " is ready to serve.";
            }));
    }

    private void tossRecipeIntoCauldron() {
        if (brewedPotionStars != null || customerCured) return;
        PotionRecipe recipe = getCurrentCustomer().getDesiredRecipe();
        for (Map.Entry<IngredientType, Integer> req : recipe.getRequiredIngredients().entrySet()) {
            IngredientType type = req.getKey();
            int needed = req.getValue() - cauldron.getOrDefault(type, 0);
            if (needed > 0 && inventory.getOrDefault(type, 0) < needed) {
                statusMessage = "Out of " + type.getDisplayName() + " — study to harvest more!";
                startGather(type);
                return;
            }
        }
        for (Map.Entry<IngredientType, Integer> req : recipe.getRequiredIngredients().entrySet()) {
            IngredientType type = req.getKey();
            int needed = req.getValue() - cauldron.getOrDefault(type, 0);
            if (needed > 0) {
                inventory.merge(type, -needed, Integer::sum);
                cauldron.merge(type, needed, Integer::sum);
            }
        }
        statusMessage = "Everything for " + recipe.getName() + " is in the cauldron. Brew & stabilize!";
        refreshUi();
    }

    private void handlePrimaryCounterAction() {
        CustomerOrder cust = getCurrentCustomer();
        PotionRecipe recipe = cust.getDesiredRecipe();
        if (customerCured) {
            customerCured = false;
            currentCustomerIdx++;
            statusMessage = "A new customer arrived at the counter!";
            refreshUi();
        } else if (brewedPotionStars != null) {
            int stars = brewedPotionStars;
            int payout = recipe.calculatePayout(stars, hasGoldenCauldron);
            Tier tier = tierFor(stars);
            gold += payout;
            shelf.addLast(tier);
            while (shelf.size() > 5) shelf.removeFirst();
            servedStreak = stars == 5 ? servedStreak + 1 : 0;
            brewedPotionStars = null;
            customerCured = true;
            statusMessage = "Served a " + tier.label + " potion and earned +" + payout + " gold!";
            refreshUi();
        } else if (recipe.canBrew(cauldron)) {
            startStabilize(recipe);
        } else {
            IngredientType missing = firstMissing(recipe);
            if (missing == null) tossRecipeIntoCauldron();
            else startGather(missing);
        }
    }

    // ========================================================================
    // 10. DIALOGS (Spellbook, Upgrades, How to play)
    // ========================================================================
    private JDialog darkDialog(String title, int w, int h) {
        JDialog d = new JDialog(this, title, true);
        d.setSize(w, h);
        d.setLocationRelativeTo(this);
        JPanel c = new JPanel(new BorderLayout(0, 12));
        c.setBackground(Theme.BG);
        c.setBorder(new EmptyBorder(18, 20, 18, 20));
        d.setContentPane(c);
        return d;
    }

    private void openSpellbookDialog() {
        JDialog d = darkDialog("Spellbook", 660, 500);
        Container c = d.getContentPane();
        JPanel head = new JPanel();
        head.setOpaque(false);
        head.setLayout(new BoxLayout(head, BoxLayout.Y_AXIS));
        addLeft(head, label("Load your reviewer", Font.BOLD, 22f, Theme.TEXT));
        addLeft(head, label("Paste 'Question | Answer' lines, or upload a .txt / .csv study sheet.", Font.PLAIN, 13f, Theme.MUTED));
        c.add(head, BorderLayout.NORTH);

        JTextArea notes = new JTextArea(
            "What is Polymorphism? | The ability of different objects to respond to the same method call\n" +
            "What is an Interface? | A contract of abstract methods that a class can implement\n" +
            "What is Encapsulation? | Bundling private fields with public getter and setter methods");
        notes.setFont(new Font(Font.MONOSPACED, Font.PLAIN, 13));
        notes.setBackground(Theme.CARD);
        notes.setForeground(Theme.TEXT);
        notes.setCaretColor(Theme.PINK);
        notes.setLineWrap(true);
        notes.setWrapStyleWord(true);
        notes.setBorder(new EmptyBorder(12, 14, 12, 14));
        JScrollPane scroll = new JScrollPane(notes);
        scroll.setBorder(BorderFactory.createLineBorder(Theme.LINE, 2));
        c.add(scroll, BorderLayout.CENTER);

        JPanel btns = new JPanel(new FlowLayout(FlowLayout.RIGHT, 10, 0));
        btns.setOpaque(false);
        PillButton upload = new PillButton("Upload .txt / .csv", Theme.CARD_HI, Theme.TEXT, 14f);
        upload.addActionListener(e -> {
            JFileChooser chooser = new JFileChooser();
            chooser.setFileFilter(new FileNameExtensionFilter("Text & CSV Files", "txt", "csv"));
            if (chooser.showOpenDialog(d) == JFileChooser.APPROVE_OPTION) {
                try {
                    List<String> lines = Files.readAllLines(chooser.getSelectedFile().toPath(), StandardCharsets.UTF_8);
                    int count = spellbook.importLines(lines, chooser.getSelectedFile().getName());
                    statusMessage = "Loaded " + count + " flashcards from " + chooser.getSelectedFile().getName() + "!";
                    d.dispose();
                    refreshUi();
                } catch (IOException ex) {
                    JOptionPane.showMessageDialog(d, "Failed to read file: " + ex.getMessage());
                }
            }
        });
        PillButton brew = new PillButton("Brew notes into cards", Theme.VIOLET, Color.WHITE, 14f);
        brew.addActionListener(e -> {
            int count = spellbook.importLines(Arrays.asList(notes.getText().split("\\r?\\n")), "Custom Study Reviewer");
            statusMessage = "Transformed " + count + " study notes into flashcards!";
            d.dispose();
            refreshUi();
        });
        btns.add(upload);
        btns.add(brew);
        c.add(btns, BorderLayout.SOUTH);
        d.setVisible(true);
    }

    private void openUpgradesDialog() {
        JDialog d = darkDialog("Upgrades", 600, 150 + upgrades.size() * 92);
        Container c = d.getContentPane();
        JPanel head = new JPanel(new BorderLayout());
        head.setOpaque(false);
        head.add(label("Alchemist Guild Shop", Font.BOLD, 22f, Theme.TEXT), BorderLayout.WEST);
        head.add(new Chip(Chip.Glyph.COIN, gold + " G", Theme.GOLD), BorderLayout.EAST);
        c.add(head, BorderLayout.NORTH);

        JPanel list = new JPanel();
        list.setOpaque(false);
        list.setLayout(new BoxLayout(list, BoxLayout.Y_AXIS));
        for (ShopUpgrade upg : upgrades) {
            RoundPanel row = new RoundPanel(new BorderLayout(12, 0), Theme.CARD, Theme.LINE, 24);
            row.setBorder(new EmptyBorder(12, 16, 12, 16));
            row.setMaximumSize(new Dimension(1000, 80));
            JPanel text = new JPanel();
            text.setOpaque(false);
            text.setLayout(new BoxLayout(text, BoxLayout.Y_AXIS));
            addLeft(text, label(upg.getName(), Font.BOLD, 16f, Theme.TEXT));
            addLeft(text, label(upg.getDescription(), Font.PLAIN, 12f, Theme.MUTED));
            row.add(text, BorderLayout.CENTER);
            PillButton buy = new PillButton(upg.isPurchased() ? "Owned" : upg.getCost() + " G",
                upg.isPurchased() ? Theme.GREEN : Theme.GOLD, Color.BLACK, 14f);
            buy.setEnabled(!upg.isPurchased() && gold >= upg.getCost());
            buy.addActionListener(e -> {
                gold -= upg.getCost();
                upg.setPurchased(true);
                upg.applyUpgrade(this);
                statusMessage = "Purchased " + upg.getName() + "!";
                d.dispose();
                refreshUi();
            });
            JPanel btnWrap = new JPanel(new GridBagLayout());
            btnWrap.setOpaque(false);
            btnWrap.add(buy);
            row.add(btnWrap, BorderLayout.EAST);
            list.add(row);
            list.add(Box.createVerticalStrut(10));
        }
        c.add(list, BorderLayout.CENTER);
        d.setVisible(true);
    }

    private void openHowToPlayDialog() {
        JDialog d = darkDialog("How to play", 640, 700);
        Container c = d.getContentPane();
        JPanel body = new JPanel();
        body.setOpaque(false);
        body.setLayout(new BoxLayout(body, BoxLayout.Y_AXIS));
        addLeft(body, label("How to play", Font.BOLD, 24f, Theme.TEXT));
        addLeft(body, label("Every right answer is brewed into a potion.", Font.PLAIN, 13f, Theme.MUTED));
        body.add(Box.createVerticalStrut(14));
        String[][] steps = {
            {"1  Read the order", "A customer arrives with a magical ailment and asks for a potion."},
            {"2  Study to harvest", "Answer a flashcard before the 21-second clock ends to harvest an ingredient. Wrong answers get you jinxed: a Murky Burnt Scale and a lost heart."},
            {"3  Brew & stabilize", "Fill the cauldron, then answer a True/False check. Correct brews a 5-star potion; wrong brews a 3-star."},
            {"4  Serve & upgrade", "Serve the potion for gold, put it on the shelf, then spend gold on upgrades."}
        };
        for (String[] s : steps) {
            RoundPanel card = new RoundPanel(new BorderLayout(), Theme.CARD, Theme.LINE, 22);
            card.setBorder(new EmptyBorder(10, 14, 10, 14));
            card.setMaximumSize(new Dimension(1000, 84));
            JPanel t = new JPanel();
            t.setOpaque(false);
            t.setLayout(new BoxLayout(t, BoxLayout.Y_AXIS));
            addLeft(t, label(s[0], Font.BOLD, 15f, Theme.TEXT));
            WrapText sub = new WrapText(s[1], Theme.font(Font.PLAIN, 12f), Theme.MUTED, 520, false);
            addLeft(t, sub);
            card.add(t, BorderLayout.CENTER);
            addLeft(body, card);
            body.add(Box.createVerticalStrut(8));
        }
        body.add(Box.createVerticalStrut(6));
        addLeft(body, label("The potions", Font.BOLD, 17f, Theme.TEXT));
        body.add(Box.createVerticalStrut(6));
        String[] tierDesc = {
            "Murky: a Burnt Scale from a wrong harvest",
            "Bubbly: a 3-star brew",
            "Glowing: a 5-star brew",
            "Enchanted: a 5-star brew from the Golden Cauldron",
            "Primordial: Enchanted, 3 flawless serves in a row"
        };
        Tier[] tiers = Tier.values();
        for (int i = 0; i < tiers.length; i++) {
            final Color col = tiers[i].color;
            JPanel line = new JPanel(new FlowLayout(FlowLayout.LEFT, 8, 2));
            line.setOpaque(false);
            JComponent dot = new JComponent() {
                @Override protected void paintComponent(Graphics g0) {
                    Graphics2D g = (Graphics2D) g0.create();
                    Theme.aa(g);
                    g.setColor(col);
                    g.fillOval(0, 2, 14, 14);
                    g.dispose();
                }
            };
            dot.setPreferredSize(new Dimension(16, 18));
            line.add(dot);
            line.add(label(tierDesc[i], Font.PLAIN, 13f, Theme.TEXT));
            addLeft(body, line);
        }
        c.add(body, BorderLayout.CENTER);
        PillButton ok = new PillButton("Got it", Theme.VIOLET, Color.WHITE, 15f);
        ok.addActionListener(e -> d.dispose());
        JPanel south = new JPanel(new FlowLayout(FlowLayout.RIGHT, 0, 0));
        south.setOpaque(false);
        south.add(ok);
        c.add(south, BorderLayout.SOUTH);
        d.setVisible(true);
    }

    public static void main(String[] args) {
        System.setProperty("awt.useSystemAAFontSettings", "on");
        System.setProperty("swing.aatext", "true");
        SwingUtilities.invokeLater(() -> new QuizAlchemist().setVisible(true));
    }
}
