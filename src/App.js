import React, { useState } from 'react';
import './App.css';
import TopicSelector from './components/TopicSelector';
import CrosswordGrid from './components/CrosswordGrid';
import ScoreBoard from './components/ScoreBoard';
import axios from 'axios';
import Fireworks from './components/Fireworks';

function App() {
  const [topic, setTopic] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [totalWords, setTotalWords] = useState(10);
  const [completedWords, setCompletedWords] = useState([]);
  const [crosswordData, setCrosswordData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Static fallback word database
  const fallbackWordData = {
    technology: [
      { word: "PROGRAMMING", clue: "The process of creating software" },
      // ... other tech words ...
    ],
    sports: [
      { word: "FOOTBALL", clue: "A game played with a ball by two teams of 11 players" },
      // ... other sports words ...
    ],
    // ... other categories ...
  };

  const handleTopicSubmit = async (selectedTopic) => {
    setTopic(selectedTopic);
    setLoading(true);
    setApiError(null);
    setCompletedWords([]); // Reset completed words
    
    try {
      console.log(`Submitting topic: ${selectedTopic}`);
      
      // First check if the server is healthy
      const healthCheck = await axios.get('http://localhost:3020/api/health');
      console.log('Server health check:', healthCheck.data);
      
      // Call the backend API to get words from Anthropic
      const response = await axios.post('http://localhost:3020/api/generate-words', {
        topic: selectedTopic
      });
      
      console.log('API response received:', response.data);
      
      const wordList = response.data.words;
      
      if (!wordList || wordList.length === 0) {
        throw new Error('No words returned from API');
      }
      
      // Log the words for debugging
      console.log('Words generated:', wordList);
      
      // Generate crossword with the dynamically generated words
      let data = createCrosswordLayout(wordList);
      
      // Add prefilled cells to the crossword
      data = addPrefilledCells(data);
      
      // Ensure we set the total words correctly
      const actualWordCount = data.words.length;
      console.log(`Setting total words to: ${actualWordCount}`);
      
      setCrosswordData(data);
      setTotalWords(actualWordCount);
      setGameStarted(true);
    } catch (error) {
      console.error("Error generating crossword:", error);
      
      // Use fallback word data
      alert("Using default word list for this topic.");
      
      // Find closest matching topic in fallback data or use technology as default
      let fallbackTopic = 'technology';
      Object.keys(fallbackWordData).forEach(key => {
        if (selectedTopic.toLowerCase().includes(key)) {
          fallbackTopic = key;
        }
      });
      
      const data = createCrosswordLayout(fallbackWordData[fallbackTopic]);
      setCrosswordData(data);
      setTotalWords(data.words.length);
      setGameStarted(true);
    } finally {
      setLoading(false);
    }
  };

  const handleWordComplete = (word) => {
    setCompletedWords(prevCompletedWords => {
      // First, check if this word is already in completed words to prevent duplicates
      if (prevCompletedWords.some(w => 
          (typeof w === 'string' && w === word) || 
          (w.word && w.word === word)
      )) {
        return prevCompletedWords; // Word already completed, don't add again
      }
      
      const newCompletedWords = [...prevCompletedWords, word];
      
      // Calculate score - ensuring we're properly accessing the word length
      const newScore = newCompletedWords.reduce((total, w) => {
        // Make sure we're accessing the word property (not the entire word object)
        const wordLength = typeof w === 'string' ? w.length : w.word?.length || 0;
        return total + (wordLength * 10);
      }, 0);
      
      setScore(newScore);
      
      // Debug logging
      console.log(`Completed ${newCompletedWords.length} out of ${totalWords} words`);
      console.log('Completed words:', newCompletedWords);
      
      // Only show celebration when ALL words are truly completed
      if (newCompletedWords.length === totalWords && totalWords > 0) {
        // Double-check by comparing with crosswordData
        const allWordsInPuzzle = crosswordData?.words || [];
        const allWordsCompleted = allWordsInPuzzle.every(puzzleWord => {
          return newCompletedWords.some(completedWord => {
            const completedText = typeof completedWord === 'string' ? 
              completedWord : completedWord.word;
            return completedText === puzzleWord.word;
          });
        });
        
        console.log('All words completed check:', allWordsCompleted);
        
        if (allWordsCompleted) {
          setGameCompleted(true);
          setShowCelebration(true);
          
          // Hide celebration after 8 seconds
          setTimeout(() => {
            setShowCelebration(false);
          }, 8000);
        }
      }
      
      return newCompletedWords;
    });
  };

  const handleNewGame = () => {
    setGameStarted(false);
    setGameCompleted(false);
    setShowCelebration(false);
    setCompletedWords([]);
    setScore(0);
    setCrosswordData(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>AI Powered Crossword Game</h1>
      </header>
      <main>
        {!gameStarted ? (
          <>
            <TopicSelector onSubmit={handleTopicSubmit} loading={loading} />
            {loading && <div className="loader">Generating crossword puzzle...</div>}
          </>
        ) : (
          <>
            <ScoreBoard 
              score={score} 
              completedWords={completedWords} 
              totalWords={totalWords} 
              topic={topic}
            />
            <CrosswordGrid 
              crosswordData={crosswordData} 
              onWordComplete={handleWordComplete} 
            />
            {gameCompleted && (
              <button 
                className="new-game-button"
                onClick={handleNewGame}
              >
                Start New Game
              </button>
            )}
          </>
        )}
        
        {showCelebration && (
          <>
            <Fireworks duration={7000} />
            <div className="celebration-message">
              <h2>🎉 Congratulations! 🎉</h2>
              <p>You've completed the crossword puzzle on "{topic}" with a score of {score}!</p>
              <button onClick={handleNewGame}>Play Another Puzzle</button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

// Function to generate crossword based on topic
async function generateCrossword(topic) {
  // Normalize topic to lowercase
  const normalizedTopic = topic.toLowerCase();
  
  // Get topic-related words
  const words = getWordsForTopic(normalizedTopic);
  
  // Generate a crossword layout from these words
  return createCrosswordLayout(words);
}

// Function to get words related to a topic
function getWordsForTopic(topic) {
  // Database of topics and related words
  const topicWordDatabase = {
    technology: [
      { word: "PROGRAMMING", clue: "The process of creating software" },
      { word: "JAVASCRIPT", clue: "A popular scripting language for web development" },
      { word: "PYTHON", clue: "A high-level programming language named after a snake" },
      { word: "DATABASE", clue: "An organized collection of structured information" },
      { word: "ALGORITHM", clue: "Step-by-step procedure for calculations or problem-solving" },
      { word: "INTERNET", clue: "The global system of interconnected computer networks" },
      { word: "HARDWARE", clue: "The physical components of a computer system" },
      { word: "SOFTWARE", clue: "Programs and other operating information used by a computer" },
      { word: "ENCRYPTION", clue: "The process of converting information into a code" },
      { word: "ROUTER", clue: "A device that forwards data packets between computer networks" },
      { word: "SERVER", clue: "A computer that provides functionality for other programs or devices" },
      { word: "CLOUD", clue: "A network of remote servers to store, manage, and process data" }
    ],
    sports: [
      { word: "FOOTBALL", clue: "A game played with a ball by two teams of 11 players" },
      { word: "BASKETBALL", clue: "A game played with a round ball and two raised baskets" },
      { word: "TENNIS", clue: "A game played with rackets and a ball on a court divided by a net" },
      { word: "HOCKEY", clue: "A game played on ice or field with sticks and a puck or ball" },
      { word: "BASEBALL", clue: "A game played with a bat and ball between two teams of nine players" },
      { word: "VOLLEYBALL", clue: "A game played by two teams who hit a ball over a high net" },
      { word: "SWIMMING", clue: "The sport of moving through water using the limbs" },
      { word: "MARATHON", clue: "A long-distance running race of 26.2 miles" },
      { word: "ATHLETE", clue: "A person who competes in sports" },
      { word: "STADIUM", clue: "A large structure for sports events with tiered seating" },
      { word: "OLYMPICS", clue: "An international sporting event held every four years" },
      { word: "REFEREE", clue: "An official who watches a game and makes sure rules are followed" }
    ],
    movies: [
      { word: "CINEMA", clue: "A theater where films are shown" },
      { word: "DIRECTOR", clue: "The person who controls the making of a film" },
      { word: "ACTOR", clue: "A performer who plays a role in a film" },
      { word: "SCREENPLAY", clue: "The script for a film including acting instructions and scene directions" },
      { word: "HOLLYWOOD", clue: "The center of the American film industry" },
      { word: "CAMERA", clue: "A device used to record images for a film" },
      { word: "SOUNDTRACK", clue: "The recorded music, dialogue, and sound effects of a film" },
      { word: "PREMIERE", clue: "The first public performance or showing of a film" },
      { word: "OSCAR", clue: "An Academy Award statuette" },
      { word: "EDITING", clue: "The process of selecting and arranging film shots" },
      { word: "ANIMATION", clue: "Films created using a rapid display of images to create an illusion of movement" },
      { word: "SCENE", clue: "A sequence of continuous action in a film" }
    ],
    music: [
      { word: "GUITAR", clue: "A stringed musical instrument with a fretted fingerboard" },
      { word: "PIANO", clue: "A large musical instrument with a keyboard" },
      { word: "CONCERT", clue: "A live musical performance" },
      { word: "RHYTHM", clue: "The pattern of regular or irregular pulses in music" },
      { word: "MELODY", clue: "A sequence of single notes that is musically satisfying" },
      { word: "ORCHESTRA", clue: "A large group of musicians playing various instruments together" },
      { word: "LYRICS", clue: "The words of a song" },
      { word: "ALBUM", clue: "A collection of audio recordings released together" },
      { word: "COMPOSER", clue: "A person who writes music" },
      { word: "HARMONY", clue: "The combination of simultaneously sounded musical notes" },
      { word: "MUSICAL", clue: "A play or film in which singing and dancing play an essential part" },
      { word: "TEMPO", clue: "The speed at which a passage of music is played" }
    ],
    food: [
      { word: "CUISINE", clue: "A style or method of cooking" },
      { word: "RESTAURANT", clue: "A place where people pay to sit and eat meals" },
      { word: "INGREDIENT", clue: "Any of the foods or substances used in making a dish" },
      { word: "RECIPE", clue: "A set of instructions for preparing a particular dish" },
      { word: "DESSERT", clue: "The sweet course eaten at the end of a meal" },
      { word: "APPETIZER", clue: "A small dish served before a main meal" },
      { word: "NUTRITION", clue: "The process of providing or obtaining food necessary for health and growth" },
      { word: "ORGANIC", clue: "Food produced without the use of artificial chemicals" },
      { word: "BEVERAGE", clue: "A drink of any type" },
      { word: "GOURMET", clue: "A connoisseur of good food" },
      { word: "VEGETARIAN", clue: "A person who does not eat meat" },
      { word: "SPICE", clue: "An aromatic or pungent vegetable substance used to flavor food" }
    ]
  };
  
  // Default to technology if no match is found
  let wordList = topicWordDatabase.technology;
  
  // Check if the topic contains any of our known topics
  Object.keys(topicWordDatabase).forEach(key => {
    if (topic.includes(key)) {
      wordList = topicWordDatabase[key];
    }
  });
  
  // Shuffle and take up to 10 words
  return shuffleArray(wordList).slice(0, 10);
}

// Function to shuffle an array
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Only updating the createCrosswordLayout function
function createCrosswordLayout(wordList) {
  // Convert all words to uppercase for consistency
  wordList = wordList.map(word => ({
    ...word,
    word: word.word.toUpperCase()
  }));
  
  // Sort words by length (descending)
  wordList.sort((a, b) => b.word.length - a.word.length);
  
  // Create a grid (standard crossword size)
  const gridSize = 20;
  let grid = Array(gridSize).fill().map(() => Array(gridSize).fill(''));
  
  // Start with center position
  const centerPos = Math.floor(gridSize / 2);
  
  // Track placed words
  const placedWords = [];
  
  // Try to place the first word horizontally in the center
  const firstWord = wordList[0].word;
  const firstWordStart = Math.max(0, Math.floor((gridSize - firstWord.length) / 2));
  
  // Place first word
  for (let i = 0; i < firstWord.length; i++) {
    grid[centerPos][firstWordStart + i] = firstWord[i];
  }
  
  // Add first word to placed words
  placedWords.push({
    word: firstWord,
    clue: wordList[0].clue,
    direction: 'horizontal',
    startRow: centerPos,
    startCol: firstWordStart
  });
  
  // Create a map of all letters in the grid for faster lookup
  let letterPositions = {};
  for (let i = 0; i < firstWord.length; i++) {
    const letter = firstWord[i];
    if (!letterPositions[letter]) {
      letterPositions[letter] = [];
    }
    letterPositions[letter].push({
      row: centerPos,
      col: firstWordStart + i
    });
  }
  
  // Place remaining words with improved intersection logic
  for (let i = 1; i < wordList.length; i++) {
    const currentWord = wordList[i].word;
    let placed = false;
    
    // Skip words that are too long for the grid
    if (currentWord.length > gridSize) continue;
    
    // Try to find an intersection with existing words
    for (let c = 0; c < currentWord.length && !placed; c++) {
      const letter = currentWord[c];
      const positions = letterPositions[letter] || [];
      
      // For each position of this letter in the grid
      for (let p = 0; p < positions.length && !placed; p++) {
        const pos = positions[p];
        
        // Try to place vertically
        if (canPlaceVertically(grid, currentWord, pos.row, pos.col, c)) {
          placeWordVertically(grid, currentWord, pos.row, pos.col, c);
          
          // Add this word to our placed words
          placedWords.push({
            word: currentWord,
            clue: wordList[i].clue,
            direction: 'vertical',
            startRow: pos.row - c,
            startCol: pos.col
          });
          
          // Update letter positions
          updateLetterPositions(letterPositions, currentWord, 'vertical', pos.row - c, pos.col);
          
          placed = true;
        }
        // Try to place horizontally
        else if (canPlaceHorizontally(grid, currentWord, pos.row, pos.col, c)) {
          placeWordHorizontally(grid, currentWord, pos.row, pos.col, c);
          
          // Add this word to our placed words
          placedWords.push({
            word: currentWord,
            clue: wordList[i].clue,
            direction: 'horizontal',
            startRow: pos.row,
            startCol: pos.col - c
          });
          
          // Update letter positions
          updateLetterPositions(letterPositions, currentWord, 'horizontal', pos.row, pos.col - c);
          
          placed = true;
        }
      }
    }
    
    // If we couldn't place the word with normal intersections, try with a more relaxed approach
    if (!placed && placedWords.length >= 3) {
      // Try to place word anywhere valid in the grid
      placed = placeWordAnywhere(grid, currentWord, wordList[i].clue, placedWords, letterPositions, gridSize);
    }
  }
  
  // Fill empty cells with black cells
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (grid[i][j] === '') {
        grid[i][j] = ' '; // space represents black cell
      }
    }
  }
  
  // Trim the grid to remove excess padding
  const trimmedGrid = trimGrid(grid);
  
  // Adjust word positions for trimmed grid
  const [rowOffset, colOffset] = getGridOffsets(grid);
  placedWords.forEach(word => {
    word.startRow -= rowOffset;
    word.startCol -= colOffset;
  });
  
  return {
    grid: trimmedGrid,
    words: placedWords
  };
}

// Function to check if a word can be placed vertically
function canPlaceVertically(grid, word, row, col, intersectAt) {
  const gridSize = grid.length;
  const startRow = row - intersectAt;
  
  // Check if word would go out of bounds
  if (startRow < 0 || startRow + word.length > gridSize) {
    return false;
  }
  
  // Check if the position is already occupied by a different letter
  // or if adjacent cells would cause words to run together
  for (let i = 0; i < word.length; i++) {
    const currentRow = startRow + i;
    
    // Check if position is already filled with a different letter
    if (grid[currentRow][col] !== '' && grid[currentRow][col] !== word[i]) {
      return false;
    }
    
    // Only check for adjacency if this isn't an intersection
    if (grid[currentRow][col] === '') {
      // Check cells to left and right to avoid unwanted horizontal adjacency
      if ((col > 0 && grid[currentRow][col-1] !== '') || 
          (col < gridSize-1 && grid[currentRow][col+1] !== '')) {
        return false;
      }
      
      // Check for letters adjacent but not part of this word placement
      const isTopEdge = i === 0;
      const isBottomEdge = i === word.length - 1;
      
      // Check top side (only for the first letter of the word)
      if (isTopEdge && currentRow > 0 && grid[currentRow-1][col] !== '') {
        return false;
      }
      
      // Check bottom side (only for the last letter of the word)
      if (isBottomEdge && currentRow < gridSize-1 && grid[currentRow+1][col] !== '') {
        return false;
      }
    }
  }
  
  // Add extra check for proper word boundaries
  // Check if there's a letter immediately before the start of the word
  if (startRow > 0 && grid[startRow - 1][col] !== '') {
    return false;
  }
  
  // Check if there's a letter immediately after the end of the word
  if (startRow + word.length < gridSize && grid[startRow + word.length][col] !== '') {
    return false;
  }
  
  return true;
}

// Function to check if a word can be placed horizontally
function canPlaceHorizontally(grid, word, row, col, intersectAt) {
  const gridSize = grid.length;
  const startCol = col - intersectAt;
  
  // Check if word would go out of bounds
  if (startCol < 0 || startCol + word.length > gridSize) {
    return false;
  }
  
  // Check if the position is already occupied by a different letter
  // or if adjacent cells would cause words to run together
  for (let i = 0; i < word.length; i++) {
    const currentCol = startCol + i;
    
    // Check if position is already filled with a different letter
    if (grid[row][currentCol] !== '' && grid[row][currentCol] !== word[i]) {
      return false;
    }
    
    // Only check for adjacency if this isn't an intersection
    if (grid[row][currentCol] === '') {
      // Check cells above and below to avoid unwanted vertical adjacency
      if ((row > 0 && grid[row-1][currentCol] !== '') || 
          (row < gridSize-1 && grid[row+1][currentCol] !== '')) {
        return false;
      }
      
      // Check for letters adjacent but not part of this word placement
      const isLeftEdge = i === 0;
      const isRightEdge = i === word.length - 1;
      
      // Check left side (only for the first letter of the word)
      if (isLeftEdge && currentCol > 0 && grid[row][currentCol-1] !== '') {
        return false;
      }
      
      // Check right side (only for the last letter of the word)
      if (isRightEdge && currentCol < gridSize-1 && grid[row][currentCol+1] !== '') {
        return false;
      }
    }
  }
  
  // Add extra check for proper word boundaries
  // Check if there's a letter immediately before the start of the word
  if (startCol > 0 && grid[row][startCol - 1] !== '') {
    return false;
  }
  
  // Check if there's a letter immediately after the end of the word
  if (startCol + word.length < gridSize && grid[row][startCol + word.length] !== '') {
    return false;
  }
  
  return true;
}

// Function to place a word vertically
function placeWordVertically(grid, word, row, col, intersectAt) {
  const startRow = row - intersectAt;
  for (let i = 0; i < word.length; i++) {
    grid[startRow + i][col] = word[i];
  }
}

// Function to place a word horizontally
function placeWordHorizontally(grid, word, row, col, intersectAt) {
  const startCol = col - intersectAt;
  for (let i = 0; i < word.length; i++) {
    grid[row][startCol + i] = word[i];
  }
}

// Function to update letter positions
function updateLetterPositions(letterPositions, word, direction, startRow, startCol) {
  for (let i = 0; i < word.length; i++) {
    const letter = word[i];
    if (!letterPositions[letter]) {
      letterPositions[letter] = [];
    }
    
    if (direction === 'horizontal') {
      letterPositions[letter].push({
        row: startRow,
        col: startCol + i
      });
    } else {
      letterPositions[letter].push({
        row: startRow + i,
        col: startCol
      });
    }
  }
}

// Function to place a word anywhere in the grid as a last resort
function placeWordAnywhere(grid, word, clue, placedWords, letterPositions, gridSize) {
  // Try to place horizontally in an open area
  for (let row = 1; row < gridSize - 1; row++) {
    for (let col = 1; col < gridSize - word.length - 1; col++) {
      // Check if this area is open
      let open = true;
      for (let i = -1; i <= word.length; i++) {
        if (col + i < 0 || col + i >= gridSize) continue;
        
        if (grid[row - 1][col + i] !== '' || 
            grid[row + 1][col + i] !== '' ||
            (i >= 0 && i < word.length && grid[row][col + i] !== '')) {
          open = false;
          break;
        }
      }
      
      if (open) {
        // Place word horizontally
        for (let i = 0; i < word.length; i++) {
          grid[row][col + i] = word[i];
        }
        
        // Add to placed words
        placedWords.push({
          word: word,
          clue: clue,
          direction: 'horizontal',
          startRow: row,
          startCol: col
        });
        
        // Update letter positions
        updateLetterPositions(letterPositions, word, 'horizontal', row, col);
        
        return true;
      }
    }
  }
  
  // Try to place vertically in an open area
  for (let col = 1; col < gridSize - 1; col++) {
    for (let row = 1; row < gridSize - word.length - 1; row++) {
      // Check if this area is open
      let open = true;
      for (let i = -1; i <= word.length; i++) {
        if (row + i < 0 || row + i >= gridSize) continue;
        
        if (grid[row + i][col - 1] !== '' || 
            grid[row + i][col + 1] !== '' ||
            (i >= 0 && i < word.length && grid[row + i][col] !== '')) {
          open = false;
          break;
        }
      }
      
      if (open) {
        // Place word vertically
        for (let i = 0; i < word.length; i++) {
          grid[row + i][col] = word[i];
        }
        
        // Add to placed words
        placedWords.push({
          word: word,
          clue: clue,
          direction: 'vertical',
          startRow: row,
          startCol: col
        });
        
        // Update letter positions
        updateLetterPositions(letterPositions, word, 'vertical', row, col);
        
        return true;
      }
    }
  }
  
  return false;
}

// Helper function to trim excess rows and columns
function trimGrid(grid) {
  // Find boundaries of content
  let minRow = grid.length, minCol = grid[0].length;
  let maxRow = 0, maxCol = 0;
  
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (grid[i][j] !== '' && grid[i][j] !== ' ') {
        minRow = Math.min(minRow, i);
        minCol = Math.min(minCol, j);
        maxRow = Math.max(maxRow, i);
        maxCol = Math.max(maxCol, j);
      }
    }
  }
  
  // Add padding of 1 cell
  minRow = Math.max(0, minRow - 1);
  minCol = Math.max(0, minCol - 1);
  maxRow = Math.min(grid.length - 1, maxRow + 1);
  maxCol = Math.min(grid[0].length - 1, maxCol + 1);
  
  // Create trimmed grid
  const trimmed = [];
  for (let i = minRow; i <= maxRow; i++) {
    const row = [];
    for (let j = minCol; j <= maxCol; j++) {
      row.push(grid[i][j]);
    }
    trimmed.push(row);
  }
  
  return trimmed;
}

// Helper to get offsets for word position adjustment
function getGridOffsets(grid) {
  let minRow = grid.length, minCol = grid[0].length;
  
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (grid[i][j] !== '' && grid[i][j] !== ' ') {
        minRow = Math.min(minRow, i);
        minCol = Math.min(minCol, j);
      }
    }
  }
  
  return [minRow, minCol];
}

// Replace the existing addPrefilledCells function with this improved version
function addPrefilledCells(crosswordData) {
  const { grid, words } = crosswordData;
  
  // Create a map of words by their actual text
  const wordsByText = {};
  words.forEach(word => {
    if (!wordsByText[word.word]) {
      wordsByText[word.word] = [];
    }
    wordsByText[word.word].push(word);
  });
  
  // Initialize prefilledPositions
  crosswordData.prefilledPositions = [];
  
  // STRATEGY 1: Prefill all short words (3 letters or less)
  words.forEach(word => {
    if (word.word.length <= 3) {
      // For very short words, prefill the first letter
      const row = word.startRow;
      const col = word.startCol;
      crosswordData.prefilledPositions.push({ row, col });
    }
  });
  
  // STRATEGY 2: Handle all duplicates (regardless of direction)
  Object.entries(wordsByText)
    .filter(([text, instances]) => instances.length > 1)
    .forEach(([text, instances]) => {
      // For each instance of the duplicate word
      instances.forEach((word, index) => {
        // For the first instance, prefill the first character
        // For others, prefill different characters to disambiguate
        const positionToPrefill = index % word.word.length;
        const row = word.direction === 'horizontal' 
          ? word.startRow 
          : word.startRow + positionToPrefill;
        const col = word.direction === 'horizontal' 
          ? word.startCol + positionToPrefill 
          : word.startCol;
        
        crosswordData.prefilledPositions.push({ row, col });
      });
    });
  
  // STRATEGY 3: For medium-length words (4-6 letters), add strategic hints
  words.forEach(word => {
    if (word.word.length >= 4 && word.word.length <= 6) {
      // Prefill a strategic position (40% into the word)
      const idx = Math.floor(word.word.length * 0.4);
      const row = word.direction === 'horizontal' ? word.startRow : word.startRow + idx;
      const col = word.direction === 'horizontal' ? word.startCol + idx : word.startCol;
      
      // Only add if not already prefilled
      const alreadyPrefilled = crosswordData.prefilledPositions.some(
        pos => pos.row === row && pos.col === col
      );
      
      if (!alreadyPrefilled) {
        crosswordData.prefilledPositions.push({ row, col });
      }
    }
  });
  
  // STRATEGY 4: For very dense areas of the grid, add more hints
  // Find cell density (how many words pass through each cell)
  const cellDensity = {};
  words.forEach(word => {
    for (let i = 0; i < word.word.length; i++) {
      const row = word.direction === 'horizontal' ? word.startRow : word.startRow + i;
      const col = word.direction === 'horizontal' ? word.startCol + i : word.startCol;
      const key = `${row},${col}`;
      
      if (!cellDensity[key]) {
        cellDensity[key] = 0;
      }
      cellDensity[key]++;
    }
  });
  
  // Prefill cells that have multiple words passing through them
  Object.entries(cellDensity)
    .filter(([key, count]) => count > 1)
    .forEach(([key, count]) => {
      const [row, col] = key.split(',').map(Number);
      
      // Only add if not already prefilled
      const alreadyPrefilled = crosswordData.prefilledPositions.some(
        pos => pos.row === row && pos.col === col
      );
      
      if (!alreadyPrefilled) {
        crosswordData.prefilledPositions.push({ row: row, col: col });
      }
    });
  
  // Debug output
  console.log(`Added ${crosswordData.prefilledPositions.length} prefilled cells`);
  
  return crosswordData;
}

export default App; 