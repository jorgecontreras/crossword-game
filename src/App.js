import React, { useState } from 'react';
import './App.css';
import TopicSelector from './components/TopicSelector';
import CrosswordGrid from './components/CrosswordGrid';
import ScoreBoard from './components/ScoreBoard';

function App() {
  const [topic, setTopic] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [totalWords, setTotalWords] = useState(10);
  const [completedWords, setCompletedWords] = useState([]);
  const [crosswordData, setCrosswordData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTopicSubmit = async (selectedTopic) => {
    setTopic(selectedTopic);
    setLoading(true);
    
    try {
      const data = await generateCrossword(selectedTopic);
      setCrosswordData(data);
      setTotalWords(data.words.length);
      setGameStarted(true);
    } catch (error) {
      console.error("Error generating crossword:", error);
      alert("Error generating crossword. Please try another topic.");
    } finally {
      setLoading(false);
    }
  };

  const handleWordComplete = (wordData) => {
    const wordString = wordData.word;
    setCompletedWords([...completedWords, wordString]);
    setScore(score + wordString.length * 10); // Score based on word length
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>AI Powered Crossword Game</h1>
      </header>
      <main>
        {!gameStarted ? (
          <>
            <TopicSelector onSubmit={handleTopicSubmit} />
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

// Improved function to create a crossword layout
function createCrosswordLayout(wordList) {
  // Sort words by length (descending) to place longer words first
  wordList.sort((a, b) => b.word.length - a.word.length);
  
  // Create a smaller grid (15x15 is standard for crosswords)
  const gridSize = 15;
  let grid = Array(gridSize).fill().map(() => Array(gridSize).fill(''));
  
  // Track placed words
  const placedWords = [];
  
  // Place the first (longest) word horizontally in the center
  const firstWord = wordList[0].word;
  const centerRow = Math.floor(gridSize / 2);
  const startCol = Math.floor((gridSize - firstWord.length) / 2);
  
  // Place the first word
  for (let i = 0; i < firstWord.length; i++) {
    grid[centerRow][startCol + i] = firstWord[i];
  }
  
  placedWords.push({
    word: firstWord,
    clue: wordList[0].clue,
    direction: 'horizontal',
    startRow: centerRow,
    startCol: startCol,
  });
  
  // Try to place remaining words with better intersection strategy
  const remainingWords = wordList.slice(1);
  
  // Keep track of cells that already have letters
  const filledCells = {};
  for (let i = 0; i < firstWord.length; i++) {
    filledCells[`${centerRow},${startCol + i}`] = firstWord[i];
  }
  
  // Place remaining words
  for (const wordData of remainingWords) {
    const word = wordData.word;
    let placed = false;
    
    // Try to find an intersection with already placed words
    // For each letter in the current word
    for (let charIndex = 0; charIndex < word.length && !placed; charIndex++) {
      const char = word[charIndex];
      
      // Check all filled cells for a matching character
      for (const cellKey in filledCells) {
        if (filledCells[cellKey] === char) {
          const [row, col] = cellKey.split(',').map(Number);
          
          // Try to place horizontally if the existing character is part of a vertical word
          // or vertically if part of a horizontal word
          let canPlaceHorizontally = false;
          let canPlaceVertically = false;
          
          // Check if this cell is part of a horizontal word
          const isPartOfHorizontal = placedWords.some(
            w => w.direction === 'horizontal' && 
                w.startRow === row && 
                col >= w.startCol && 
                col < w.startCol + w.word.length
          );
          
          // Check if this cell is part of a vertical word
          const isPartOfVertical = placedWords.some(
            w => w.direction === 'vertical' && 
                w.startCol === col && 
                row >= w.startRow && 
                row < w.startRow + w.word.length
          );
          
          // Only try to place vertically if the cell is part of a horizontal word (or vice versa)
          if (isPartOfHorizontal && !isPartOfVertical) {
            // Try vertical placement
            const vertStartRow = row - charIndex;
            
            // Check if the word fits on the grid
            if (vertStartRow >= 0 && vertStartRow + word.length <= gridSize) {
              canPlaceVertically = checkVerticalPlacement(
                grid, word, vertStartRow, col, charIndex, filledCells
              );
              
              if (canPlaceVertically) {
                // Place the word vertically
                for (let i = 0; i < word.length; i++) {
                  grid[vertStartRow + i][col] = word[i];
                  filledCells[`${vertStartRow + i},${col}`] = word[i];
                }
                
                placedWords.push({
                  word: word,
                  clue: wordData.clue,
                  direction: 'vertical',
                  startRow: vertStartRow,
                  startCol: col,
                });
                
                placed = true;
                break;
              }
            }
          }
          
          if (!placed && isPartOfVertical && !isPartOfHorizontal) {
            // Try horizontal placement
            const horizStartCol = col - charIndex;
            
            // Check if the word fits on the grid
            if (horizStartCol >= 0 && horizStartCol + word.length <= gridSize) {
              canPlaceHorizontally = checkHorizontalPlacement(
                grid, word, row, horizStartCol, charIndex, filledCells
              );
              
              if (canPlaceHorizontally) {
                // Place the word horizontally
                for (let i = 0; i < word.length; i++) {
                  grid[row][horizStartCol + i] = word[i];
                  filledCells[`${row},${horizStartCol + i}`] = word[i];
                }
                
                placedWords.push({
                  word: word,
                  clue: wordData.clue,
                  direction: 'horizontal',
                  startRow: row,
                  startCol: horizStartCol,
                });
                
                placed = true;
                break;
              }
            }
          }
        }
      }
      if (placed) break;
    }
    
    // If we couldn't place the word through intersections and we have few words,
    // try placing it adjacent to existing words
    if (!placed && placedWords.length < 3) {
      // Try to place word below the first word
      const word = wordData.word;
      const vertStartRow = centerRow + 1;
      const vertStartCol = startCol + Math.floor(firstWord.length / 3);
      
      if (vertStartRow + word.length <= gridSize) {
        const canPlace = checkVerticalPlacement(
          grid, word, vertStartRow, vertStartCol, -1, filledCells
        );
        
        if (canPlace) {
          for (let i = 0; i < word.length; i++) {
            grid[vertStartRow + i][vertStartCol] = word[i];
            filledCells[`${vertStartRow + i},${vertStartCol}`] = word[i];
          }
          
          placedWords.push({
            word: word,
            clue: wordData.clue,
            direction: 'vertical',
            startRow: vertStartRow,
            startCol: vertStartCol,
          });
        }
      }
    }
  }
  
  // If we couldn't place enough words, start over with a simpler grid
  if (placedWords.length < 4 && wordList.length >= 5) {
    return createSimpleCrossword(wordList);
  }
  
  // Fill in empty cells with black cells
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (grid[i][j] === '') {
        grid[i][j] = '';  // Use empty string for black cells
      }
    }
  }
  
  // Trim the grid to remove unnecessary rows/columns
  grid = trimGrid(grid);
  
  // Adjust word positions based on trimming
  const [rowOffset, colOffset] = getGridOffsets(grid, placedWords);
  placedWords.forEach(word => {
    word.startRow -= rowOffset;
    word.startCol -= colOffset;
  });
  
  return {
    grid: grid,
    words: placedWords
  };
}

// Helper function to check if a word can be placed vertically
function checkVerticalPlacement(grid, word, startRow, col, intersectIndex, filledCells) {
  // Check each position
  for (let i = 0; i < word.length; i++) {
    const row = startRow + i;
    
    // Out of bounds check
    if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length) {
      return false;
    }
    
    // Check if this cell already has a different letter
    const existing = grid[row][col];
    if (existing !== '' && existing !== word[i]) {
      return false;
    }
    
    // For non-intersection points, make sure adjacent cells are empty
    if (i !== intersectIndex) {
      // Check left and right cells aren't part of a horizontal word
      if (filledCells[`${row},${col-1}`] || filledCells[`${row},${col+1}`]) {
        return false;
      }
    }
    
    // Check if start position has a letter above it
    if (i === 0 && row > 0 && grid[row-1][col] !== '') {
      return false;
    }
    
    // Check if end position has a letter below it
    if (i === word.length - 1 && row < grid.length - 1 && grid[row+1][col] !== '') {
      return false;
    }
  }
  
  return true;
}

// Helper function to check if a word can be placed horizontally
function checkHorizontalPlacement(grid, word, row, startCol, intersectIndex, filledCells) {
  // Check each position
  for (let i = 0; i < word.length; i++) {
    const col = startCol + i;
    
    // Out of bounds check
    if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length) {
      return false;
    }
    
    // Check if this cell already has a different letter
    const existing = grid[row][col];
    if (existing !== '' && existing !== word[i]) {
      return false;
    }
    
    // For non-intersection points, make sure adjacent cells are empty
    if (i !== intersectIndex) {
      // Check cells above and below aren't part of a vertical word
      if (filledCells[`${row-1},${col}`] || filledCells[`${row+1},${col}`]) {
        return false;
      }
    }
    
    // Check if start position has a letter to the left
    if (i === 0 && col > 0 && grid[row][col-1] !== '') {
      return false;
    }
    
    // Check if end position has a letter to the right
    if (i === word.length - 1 && col < grid[0].length - 1 && grid[row][col+1] !== '') {
      return false;
    }
  }
  
  return true;
}

// Function to create a simple crossword when the algorithm struggles
function createSimpleCrossword(wordList) {
  // Sort words by length (descending)
  wordList.sort((a, b) => b.word.length - a.word.length);
  
  // Take only the first 5-7 words to ensure we can place them
  const words = wordList.slice(0, Math.min(7, wordList.length));
  
  // Create grid large enough for our words
  const gridSize = Math.max(words[0].word.length * 2, 15);
  const grid = Array(gridSize).fill().map(() => Array(gridSize).fill(''));
  
  const placedWords = [];
  
  // Place first word horizontally in the center
  const firstWord = words[0].word;
  const centerRow = Math.floor(gridSize / 2);
  const startCol = Math.floor((gridSize - firstWord.length) / 2);
  
  for (let i = 0; i < firstWord.length; i++) {
    grid[centerRow][startCol + i] = firstWord[i];
  }
  
  placedWords.push({
    word: firstWord,
    clue: words[0].clue,
    direction: 'horizontal',
    startRow: centerRow,
    startCol: startCol,
  });
  
  // Place second word vertically crossing the middle of the first word
  if (words.length > 1) {
    const secondWord = words[1].word;
    const crossIndex = Math.floor(firstWord.length / 2);
    const crossChar = firstWord[crossIndex];
    
    // Find where this character appears in the second word
    for (let i = 0; i < secondWord.length; i++) {
      if (secondWord[i] === crossChar) {
        const vertStartRow = centerRow - i;
        const vertCol = startCol + crossIndex;
        
        // Check if it fits
        if (vertStartRow >= 0 && vertStartRow + secondWord.length <= gridSize) {
          // Place the word
          for (let j = 0; j < secondWord.length; j++) {
            grid[vertStartRow + j][vertCol] = secondWord[j];
          }
          
          placedWords.push({
            word: secondWord,
            clue: words[1].clue,
            direction: 'vertical',
            startRow: vertStartRow,
            startCol: vertCol,
          });
          
          break;
        }
      }
    }
  }
  
  // For remaining words, place them in a simple pattern
  let currentRow = centerRow + 3;
  for (let i = 2; i < words.length; i++) {
    const word = words[i].word;
    const horizStartCol = Math.floor((gridSize - word.length) / 2);
    
    // Check if we have space
    if (currentRow < gridSize) {
      // Place horizontally
      for (let j = 0; j < word.length; j++) {
        grid[currentRow][horizStartCol + j] = word[j];
      }
      
      placedWords.push({
        word: word,
        clue: words[i].clue,
        direction: 'horizontal',
        startRow: currentRow,
        startCol: horizStartCol,
      });
      
      currentRow += 2;
    }
  }
  
  // Fill empty cells with black cells
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (grid[i][j] === '') {
        grid[i][j] = '';  // Use empty string for black cells
      }
    }
  }
  
  // Trim the grid
  const trimmedGrid = trimGrid(grid);
  
  // Adjust word positions
  const [rowOffset, colOffset] = getGridOffsets(grid, placedWords);
  placedWords.forEach(word => {
    word.startRow -= rowOffset;
    word.startCol -= colOffset;
  });
  
  return {
    grid: trimmedGrid,
    words: placedWords
  };
}

// Helper function to trim excess rows and columns
function trimGrid(grid) {
  // Find boundaries of content
  let minRow = grid.length, maxRow = 0, minCol = grid[0].length, maxCol = 0;
  
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (grid[i][j] !== ' ' && grid[i][j] !== '') {
        minRow = Math.min(minRow, i);
        maxRow = Math.max(maxRow, i);
        minCol = Math.min(minCol, j);
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
function getGridOffsets(grid, placedWords) {
  let minRow = grid.length, minCol = grid[0].length;
  
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (grid[i][j] !== ' ' && grid[i][j] !== '') {
        minRow = Math.min(minRow, i);
        minCol = Math.min(minCol, j);
      }
    }
  }
  
  return [minRow, minCol];
}

export default App; 