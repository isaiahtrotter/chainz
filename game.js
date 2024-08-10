const categories = {
  Animals: "categories/animals.json",
  "US Capitals": "categories/usCapitals.json",
  // Add more categories here
};

let selectedCategory =
  Object.keys(categories)[Math.floor(Math.random() * Object.keys(categories).length)];
let words = [];
let lastWord = "";
let score = 0;
let timeLeft = 120; // 2 minutes
let history = []; // Track submitted words

document.getElementById("category-name").textContent = selectedCategory;

const timerElement = document.getElementById("timer");
const scoreElement = document.getElementById("score");
const wordInput = document.getElementById("word-input");
const wordList = document.getElementById("word-list");
const resultMessage = document.getElementById("result-message");
const submitButton = document.getElementById("submit-word");
const deleteButton = document.getElementById("delete-word");

// Timer function
function startTimer() {
  const timer = setInterval(() => {
    if (timeLeft <= 0) {
      clearInterval(timer);
      endGame();
    } else {
      timeLeft--;
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      timerElement.textContent = `${minutes < 10 ? "0" : ""}${minutes}:${
        seconds < 10 ? "0" : ""
      }${seconds}`;
    }
  }, 1000);
}

// Function to check the word and update the game state
function submitWord() {
  const guessedWord = wordInput.value.trim().toLowerCase();

  if (guessedWord.length > 0 && words.includes(guessedWord)) {
    let wordScore = guessedWord.length * 5;

    // Check for bonus score based on previous word
    if (lastWord) {
      const lastWordLastThree = lastWord.slice(-3);
      const lastWordLastTwo = lastWord.slice(-2);
      const guessedWordFirstThree = guessedWord.slice(0, 3);
      const guessedWordFirstTwo = guessedWord.slice(0, 2);
      const guessedWordFirstLetter = guessedWord[0];

      if (guessedWordFirstThree === lastWordLastThree) {
        wordScore *= 10; // Multiply score by 10
      } else if (guessedWordFirstTwo === lastWordLastTwo) {
        wordScore *= 5; // Multiply score by 5
      } else if (guessedWordFirstLetter === lastWord.slice(-1)) {
        // No score multiplier, use regular score
      } else {
        resultMessage.textContent = "The guess does not match the required pattern.";
        return; // Exit function early if no conditions are met
      }
    }

    score += wordScore;
    scoreElement.textContent = score;
    lastWord = guessedWord;
    words = words.filter((word) => word !== guessedWord); // Remove the guessed word from the list

    history.push({ word: guessedWord, score: wordScore }); // Save to history with score

    // Create a new list item with the word and its score
    const wordElement = document.createElement("div");
    wordElement.textContent = `${guessedWord} (Score: ${wordScore})`;
    wordList.appendChild(wordElement);

    resultMessage.textContent = "";
  } else {
    resultMessage.textContent = "Invalid word or word not in category!";
  }

  wordInput.value = "";
  wordInput.focus();
}

// Function to delete the previous word
function deletePreviousWord() {
  if (history.length > 0) {
    const lastEntry = history.pop();
    const lastWordDeleted = lastEntry.word;
    words.push(lastWordDeleted); // Re-add the last word to the list

    // Remove the last word from the word list display
    const wordElements = Array.from(wordList.children);
    const lastWordElement = wordElements.find((element) =>
      element.textContent.startsWith(lastWordDeleted)
    );
    if (lastWordElement) {
      wordList.removeChild(lastWordElement);
    }

    // Update lastWord to the letter of the new last word, if history is not empty
    if (history.length > 0) {
      lastWord = history[history.length - 1].word;
    } else {
      lastWord = "";
    }

    // Adjust score accordingly
    score -= lastEntry.score;
    scoreElement.textContent = score;

    resultMessage.textContent = "Previous word deleted.";
  } else {
    resultMessage.textContent = "No words to delete.";
  }
}

// Function to end the game
function endGame() {
  wordInput.disabled = true;
  submitButton.disabled = true;
  deleteButton.disabled = true;
  resultMessage.textContent = `Time's up! Your final score is ${score}.`;
}

document.getElementById("submit-word").addEventListener("click", submitWord);
document.getElementById("delete-word").addEventListener("click", deletePreviousWord);

wordInput.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    submitWord();
  }
});

// Load category words from JSON file
fetch(categories[selectedCategory])
  .then((response) => response.json())
  .then((data) => {
    words = data;
    startTimer();
  })
  .catch((error) => {
    console.error("Error loading category data:", error);
  });
