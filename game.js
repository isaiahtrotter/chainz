const categories = {
  Animals: "categories/animals.json",
  "US Capitals": "categories/usCapitals.json",
  // Add more categories here
};

let selectedCategory =
  Object.keys(categories)[Math.floor(Math.random() * Object.keys(categories).length)];
let words = [];
let lastLetter = "";
let score = 0;
let timeLeft = 120; // 2 minutes
let history = []; // Track submitted words

document.getElementById("category-name").textContent = selectedCategory;

const timerElement = document.getElementById("timer");
const scoreElement = document.getElementById("score");
const wordInput = document.getElementById("word-input");
const wordList = document.getElementById("word-list");
const resultMessage = document.getElementById("result-message");

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

  if (
    guessedWord.length > 0 &&
    words.includes(guessedWord) &&
    (lastLetter === "" || guessedWord.startsWith(lastLetter))
  ) {
    score += guessedWord.length * 5;
    scoreElement.textContent = score;
    lastLetter = guessedWord[guessedWord.length - 1];
    words = words.filter((word) => word !== guessedWord); // Remove the guessed word from the list

    history.push(guessedWord); // Save to history

    const wordElement = document.createElement("div");
    wordElement.textContent = guessedWord;
    wordList.appendChild(wordElement);

    resultMessage.textContent = "";
  } else {
    resultMessage.textContent = "Invalid word or wrong starting letter!";
  }

  wordInput.value = "";
  wordInput.focus();
}

// Function to delete the previous word
function deletePreviousWord() {
  if (history.length > 0) {
    const lastWord = history.pop();
    words.push(lastWord); // Re-add the last word to the list

    // Remove the last word from the word list display
    const wordElements = Array.from(wordList.children);
    const lastWordElement = wordElements.find((element) => element.textContent === lastWord);
    if (lastWordElement) {
      wordList.removeChild(lastWordElement);
    }

    // Update lastLetter to the letter of the new last word, if history is not empty
    if (history.length > 0) {
      lastLetter = history[history.length - 1][history[history.length - 1].length - 1];
    } else {
      lastLetter = "";
    }

    // Adjust score accordingly
    score -= lastWord.length * 5;
    scoreElement.textContent = score;

    resultMessage.textContent = "Previous word deleted.";
  } else {
    resultMessage.textContent = "No words to delete.";
  }
}

// Function to end the game
function endGame() {
  wordInput.disabled = true;
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
