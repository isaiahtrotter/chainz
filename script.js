// Array of category files with their paths
const categoryFiles = [
  { name: "Animals", file: "categories/animals.json" },
  //{ name: "US Capitals", file: "categories/us_capitals.json" },
];

let currentCategory = null; // Will hold the name of the selected category
let currentCategoryWords = []; // Will hold the words from the selected category
let previousWord = ""; // Store the previous word for comparison
let totalScore = 0; // Track total score
let wordHistory = []; // Track added words and their scores
let guessedWords = new Set(); // Track words that have already been guessed
let currentlyHighlightedKey = null; // Track the currently highlighted key

// Function to load a JSON file and set the current category and words
function loadCategory(categoryFile) {
  fetch(categoryFile.file)
    .then((response) => response.json())
    .then((data) => {
      currentCategory = categoryFile.name;
      currentCategoryWords = data.map((word) => word.toUpperCase());
      document.querySelector(".category span").textContent = currentCategory;
      console.log(`Loaded ${currentCategory} category with words:`, currentCategoryWords);
    })
    .catch((error) => console.error("Error loading category:", error));
}

// Function to randomly select a category and load it
function selectRandomCategory() {
  const randomCategory = categoryFiles[Math.floor(Math.random() * categoryFiles.length)];
  loadCategory(randomCategory);
}

// Function to handle key press from the on-screen keyboard
function inputKey(char) {
  const input = document.getElementById("wordInput");
  if (input.value.length < input.maxLength) {
    input.value += char.toUpperCase(); // Convert the character to uppercase
  }
}

// Function to handle backspace
function backspace() {
  const input = document.getElementById("wordInput");
  input.value = input.value.slice(0, -1);
}

// Function to handle word submission
function submitWord() {
  const input = document.getElementById("wordInput");
  const word = input.value.trim().toUpperCase();

  if (word && isValidGuess(word) && matchesCategory(word) && !guessedWords.has(word)) {
    const score = calculateScore(word);
    addWordToList(word, score); // Add word with calculated score
    updateTotalScore(score); // Update the total score in the UI
    highlightLastLetterKey(word.slice(-1)); // Highlight the last letter key
    previousWord = word; // Update previous word for next comparison
    guessedWords.add(word); // Mark the word as guessed
    input.value = ""; // Clear the input after submission
  } else {
    // Flash red if the guess is not valid or has already been guessed
    input.classList.add("flash-red");
    setTimeout(() => {
      input.classList.remove("flash-red");
    }, 500);
  }
}

// Function to check if the word is a valid guess
function isValidGuess(word) {
  if (!previousWord) return true; // First word is always valid

  const lastThree = previousWord.slice(-3);
  const lastTwo = previousWord.slice(-2);
  const lastOne = previousWord.slice(-1);

  return word.startsWith(lastThree) || word.startsWith(lastTwo) || word.startsWith(lastOne);
}

// Function to check if the word matches the current category
function matchesCategory(word) {
  return currentCategoryWords.includes(word);
}

// Function to add a word to the word list
function addWordToList(word, score) {
  const wordsList = document.getElementById("wordsList");

  // Create a new div for the word item
  const wordItem = document.createElement("div");
  wordItem.classList.add("word-item");

  // Create a span for the word text with appropriate highlighting
  const wordSpan = document.createElement("span");
  wordSpan.classList.add("word");
  wordSpan.innerHTML = highlightWord(word);

  // Create a span for the score
  const scoreSpan = document.createElement("span");
  scoreSpan.classList.add("score");
  scoreSpan.textContent = `(${score})`;

  // Append word and score to the word item
  wordItem.appendChild(wordSpan);
  wordItem.appendChild(scoreSpan);

  // Append the word item to the word list
  wordsList.appendChild(wordItem);

  // Store the last added word item and its score in the history
  wordHistory.push({ element: wordItem, score: score });

  // Scroll to the bottom of the list to show the latest word
  wordsList.scrollTop = wordsList.scrollHeight;
}

// Function to delete the last word and update the score
function deleteLastWord() {
  if (wordHistory.length > 0) {
    // Get the last word item and its score
    const lastEntry = wordHistory.pop();

    // Remove the last word item from the list
    lastEntry.element.remove();

    // Subtract the score from the total score
    totalScore -= lastEntry.score;
    updateTotalScore(0); // Update the total score in the UI

    // Remove the word from the guessedWords set
    guessedWords.delete(lastEntry.element.querySelector(".word").textContent);

    // Update previousWord to the last remaining word in the history, if any
    if (wordHistory.length > 0) {
      previousWord = wordHistory[wordHistory.length - 1].element.querySelector(".word").textContent;
      highlightLastLetterKey(previousWord.slice(-1)); // Highlight the last letter of the updated last word
    } else {
      previousWord = ""; // No previous word if history is empty
      if (currentlyHighlightedKey) {
        currentlyHighlightedKey.classList.remove("highlight-key"); // Remove highlight if no words left
        currentlyHighlightedKey = null;
      }
    }
  }
}

// Function to highlight the word based on the rules
function highlightWord(word) {
  // Always highlight the last letter in yellow
  let highlightedWord = `${word.slice(0, -1)}<span class="highlight">${word.slice(-1)}</span>`;

  if (previousWord) {
    if (previousWord.slice(-3) === word.slice(0, 3)) {
      // Highlight last 3 letters of the previous word and first 3 of the current
      highlightedWord = `<span class="highlight">${word.slice(0, 3)}</span>${word.slice(
        3,
        -1
      )}<span class="highlight">${word.slice(-1)}</span>`;
    } else if (previousWord.slice(-2) === word.slice(0, 2)) {
      // Highlight last 2 letters of the previous word and first 2 of the current
      highlightedWord = `<span class="highlight">${word.slice(0, 2)}</span>${word.slice(
        2,
        -1
      )}<span class="highlight">${word.slice(-1)}</span>`;
    } else if (previousWord.slice(-1) === word.slice(0, 1)) {
      // Highlight last letter of the previous word and first letter of the current
      highlightedWord = `<span class="highlight">${word.slice(0, 1)}</span>${word.slice(
        1,
        -1
      )}<span class="highlight">${word.slice(-1)}</span>`;
    }
  }

  return highlightedWord;
}

// Function to calculate the score based on the rules
function calculateScore(word) {
  let baseScore = word.length * 5; // 5 points per letter

  if (previousWord) {
    if (previousWord.slice(-3) === word.slice(0, 3)) {
      return baseScore * 10; // 10x multiplier
    } else if (previousWord.slice(-2) === word.slice(0, 2)) {
      return baseScore * 5; // 5x multiplier
    }
  }
  return baseScore; // No multiplier
}

// Function to update the total score and display it
function updateTotalScore(score) {
  totalScore += score;
  document.querySelector(".total-score").textContent = totalScore;
}

// Function to highlight the key corresponding to the last letter of the word
function highlightLastLetterKey(lastLetter) {
  // Remove highlight from the previously highlighted key
  if (currentlyHighlightedKey) {
    currentlyHighlightedKey.classList.remove("highlight-key");
  }

  // Find the key corresponding to the last letter and highlight it
  const key = document.querySelector(`.key[data-key="${lastLetter.toUpperCase()}"]`);
  if (key) {
    key.classList.add("highlight-key");
    currentlyHighlightedKey = key; // Update the currently highlighted key
  }
}

// Countdown timer function
function startCountdown(duration, display) {
  let timer = duration,
    minutes,
    seconds;
  const countdown = setInterval(() => {
    minutes = Math.floor(timer / 60);
    seconds = timer % 60;

    seconds = seconds < 10 ? "0" + seconds : seconds;
    display.textContent = minutes + ":" + seconds;

    if (--timer < 0) {
      clearInterval(countdown);
      display.textContent = "0:00";
      endGame(); // End the game when time is up
    }
  }, 1000);
}

function disableAllKeys() {
  const keys = document.querySelectorAll(".key");
  keys.forEach((key) => {
    key.disabled = true;
  });
}

// Function to end the game
function endGame() {
  // Disable the input field
  const input = document.getElementById("wordInput");
  input.disabled = true;

  // Disable the delete word button
  const deleteButton = document.getElementById("deleteLastWordBtn");
  deleteButton.disabled = true;

  // Disable all keys on the on-screen keyboard
  disableAllKeys();

  // Display a message or perform any other end-of-game actions
  alert("Time's up! Game over.");
}

// Convert input to uppercase as the user types
document.getElementById("wordInput").addEventListener("input", function () {
  this.value = this.value.toUpperCase();
});

// Listen for the Enter key press on the physical keyboard
document.getElementById("wordInput").addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    submitWord();
  }
});

// Start the game by selecting a random category and starting the countdown
window.onload = function () {
  selectRandomCategory(); // Load a random category
  const timer = 90; // 1.5 minutes in seconds
  const display = document.querySelector(".timer");
  startCountdown(timer, display);
};

// Attach the deleteLastWord function to the delete button
document.getElementById("deleteLastWordBtn").addEventListener("click", deleteLastWord);
