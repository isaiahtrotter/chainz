const categories = {
  Animals: "categories/animals.json",
  "US Capitals": "categories/usCapitals.json",
  // Add more categories here
};

// Open and closing the modal
document.addEventListener("DOMContentLoaded", () => {
  const rulesLink = document.querySelector(".rules-link");
  const modal = document.getElementById("rules");
  const closeBtn = document.querySelector(".modal .close");

  rulesLink.addEventListener("click", (event) => {
    event.preventDefault();
    modal.style.display = "flex";
  });

  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Close modal when clicking outside of the modal content
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
});

let selectedCategory =
  Object.keys(categories)[Math.floor(Math.random() * Object.keys(categories).length)];
let words = [];
let lastWord = "";
let score = 0;
let timeLeft = 120; // 2 minutes
let history = []; // Track submitted words
let firstWordAdded = false; // Track if the first word has been added

document.getElementById("category-name").textContent = selectedCategory;

const timerElement = document.getElementById("timer");
const scoreElement = document.getElementById("score");
const wordInput = document.getElementById("word-input");
const wordList = document.getElementById("word-list");
const resultMessage = document.getElementById("result-message");
const submitButton = document.getElementById("submit-word");

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

// Function to apply yellow styling based on matching conditions
function applyHighlightStyles(wordElement, newWord, oldWord) {
  const highlightColor = "#f7af23";

  // Get the parts to highlight
  let highlightOldPart, highlightNewPart;
  if (newWord.slice(0, 3) === oldWord.slice(-3)) {
    highlightOldPart = oldWord.slice(-3);
    highlightNewPart = newWord.slice(0, 3);
  } else if (newWord.slice(0, 2) === oldWord.slice(-2)) {
    highlightOldPart = oldWord.slice(-2);
    highlightNewPart = newWord.slice(0, 2);
  } else if (newWord[0] === oldWord[oldWord.length - 1]) {
    highlightOldPart = oldWord.slice(-1);
    highlightNewPart = newWord[0];
  }

  if (highlightOldPart || highlightNewPart) {
    // Create spans for highlighted parts
    const oldWordSpan = oldWord
      .split(highlightOldPart)
      .join(`<span style="color: ${highlightColor};">${highlightOldPart}</span>`);
    const newWordSpan = newWord
      .split(highlightNewPart)
      .join(`<span style="color: ${highlightColor};">${highlightNewPart}</span>`);

    // Apply the highlights to the wordElement
    const textElement = wordElement.querySelector("span");
    textElement.innerHTML = `${newWordSpan} (Score: ${wordScore})`;
  }
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
    wordElement.classList.add("word-item");

    const textElement = document.createElement("span");

    // Apply special styling to the last letter of the first word
    if (!firstWordAdded) {
      textElement.innerHTML = `${guessedWord.slice(
        0,
        -1
      )}<span style="color: #f7af23;">${guessedWord.slice(-1)}</span> (Score: ${wordScore})`;
      firstWordAdded = true; // Set flag to true after the first word is added
    } else {
      textElement.textContent = `${guessedWord} (Score: ${wordScore})`;
    }

    // Add the red "x" for deleting the word
    const deleteElement = document.createElement("button");
    deleteElement.classList.add("delete-x");
    deleteElement.textContent = "✖";
    deleteElement.addEventListener("click", () =>
      deleteSpecificWord(wordElement, guessedWord, wordScore)
    );

    wordElement.appendChild(textElement);
    wordElement.appendChild(deleteElement);

    // Append the new word element to the list
    wordList.appendChild(wordElement);

    // Apply highlight styles based on the new word and the previous word
    if (history.length > 0) {
      const previousWordElement = wordList.children[history.length - 1];
      const previousWord = history[history.length - 1].word;
      applyHighlightStyles(previousWordElement, guessedWord, previousWord);
    }

    // Ensure only the most recent word has the delete button
    const wordItems = Array.from(wordList.children);
    wordItems.forEach((item, index) => {
      const deleteBtn = item.querySelector(".delete-x");
      if (deleteBtn) {
        deleteBtn.style.display = index === wordItems.length - 1 ? "inline" : "none";
      }
    });

    resultMessage.textContent = "";

    // Clear the input field
    wordInput.value = "";
    wordInput.focus();
  } else {
    resultMessage.textContent = "Invalid word or word not in category!";
  }
}

// Function to delete a specific word
function deleteSpecificWord(wordElement, word, wordScore) {
  wordList.removeChild(wordElement);
  history = history.filter((entry) => entry.word !== word); // Remove the word from history
  words.push(word); // Re-add the word to the list

  // Update lastWord
  if (history.length > 0) {
    lastWord = history[history.length - 1].word;
  } else {
    lastWord = "";
  }

  // Adjust score accordingly
  score -= wordScore;
  scoreElement.textContent = score;

  // Ensure only the most recent word has the delete button
  const wordItems = Array.from(wordList.children);
  wordItems.forEach((item, index) => {
    const deleteBtn = item.querySelector(".delete-x");
    if (deleteBtn) {
      deleteBtn.style.display = index === wordItems.length - 1 ? "inline" : "none";
    }
  });
}

// Function to end the game
function endGame() {
  wordInput.disabled = true;
  submitButton.disabled = true;
  resultMessage.textContent = `Time's up! Your final score is ${score}.`;
}

document.getElementById("submit-word").addEventListener("click", submitWord);

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
    startTimer(); // Start the timer only after loading the words
  })
  .catch((error) => {
    console.error("Error loading category data:", error);
  });
