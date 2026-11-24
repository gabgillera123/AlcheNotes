import React, { useState } from 'react';
import { sound } from '../utils/sound';
import javaSourceCode from '../../java-src/QuizAlchemist.java?raw';

interface JavaSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JAVA_SOURCE_CODE = javaSourceCode;

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
                      <code>CustomerOrder</code> and <code>ShopUpgrade</code> extend <code>ShopEntity</code>. Each upgrade overrides <code>applyUpgrade(QuizAlchemist game)</code> polymorphically at runtime.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pixel-box-sm bg-[#0f172a] p-4 text-slate-100">
                <div className="font-pixel text-xs text-[#fde047]">
                  HOW TO COMPILE & RUN LOCALLY IN JAVA (JDK 8+)
                </div>
                <pre className="mt-2 overflow-x-auto font-mono text-xs text-[#bef264]">
{`# Windows PowerShell (from the repository root)
New-Item -ItemType Directory -Force build\\java | Out-Null
javac -d build\\java java-src\\QuizAlchemist.java
java -cp build\\java QuizAlchemist

# macOS / Linux (from the repository root)
mkdir -p build/java
javac -d build/java java-src/QuizAlchemist.java
java -cp build/java QuizAlchemist`}
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
