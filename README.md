# AlcheNotes

AlcheNotes is a magical potion-shop study game. Answer study questions to gather
ingredients, brew potions, and serve customers. The repository includes a
browser version and a standalone Java Swing version.

## Run the browser game

Requirements: Node.js and npm.

From the repository root, install dependencies and start the development server:

```sh
npm install
npm run dev
```

Open the local URL printed by Vite in your browser.

## Run the Java Swing game

Requirements: JDK 8 or later.

From the repository root, compile and run the standalone game:

**Windows PowerShell**

```powershell
New-Item -ItemType Directory -Force build\java | Out-Null
javac -d build\java java-src\QuizAlchemist.java
java -cp build\java QuizAlchemist
```

**macOS / Linux**

```sh
mkdir -p build/java
javac -d build/java java-src/QuizAlchemist.java
java -cp build/java QuizAlchemist
```

The Java game has no third-party dependencies. Its study-card importer accepts
text or CSV files; you can also enter questions in the game.
