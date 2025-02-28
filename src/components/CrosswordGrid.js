import React, { useState, useEffect } from 'react';

function CrosswordGrid({ crosswordData, onWordComplete }) {
  const [grid, setGrid] = useState([]);
  const [userInputs, setUserInputs] = useState({});
  const [selectedClue, setSelectedClue] = useState(null);
  const [completedWords, setCompletedWords] = useState([]);
  const [celebration, setCelebration] = useState(null);
  const [completedWordIds, setCompletedWordIds] = useState([]);

  useEffect(() => {
    if (crosswordData) {
      setGrid(crosswordData.grid);
      
      // Initialize user inputs
      const inputs = {};
      
      // First, initialize all cells as empty
      crosswordData.words.forEach(word => {
        for (let i = 0; i < word.word.length; i++) {
          const row = word.direction === 'horizontal' ? word.startRow : word.startRow + i;
          const col = word.direction === 'horizontal' ? word.startCol + i : word.startCol;
          const cellId = `${row}-${col}`;
          inputs[cellId] = '';
        }
      });
      
      // Then, fill in prefilled cells
      if (crosswordData.prefilledPositions && crosswordData.prefilledPositions.length > 0) {
        crosswordData.prefilledPositions.forEach(pos => {
          // Find which word(s) this position belongs to
          const matchingWords = crosswordData.words.filter(word => {
            for (let i = 0; i < word.word.length; i++) {
              const row = word.direction === 'horizontal' ? word.startRow : word.startRow + i;
              const col = word.direction === 'horizontal' ? word.startCol + i : word.startCol;
              if (row === pos.row && col === pos.col) {
                return true;
              }
            }
            return false;
          });
          
          if (matchingWords.length > 0) {
            // Get the letter for this position
            let letter = '';
            matchingWords.forEach(word => {
              for (let i = 0; i < word.word.length; i++) {
                const row = word.direction === 'horizontal' ? word.startRow : word.startRow + i;
                const col = word.direction === 'horizontal' ? word.startCol + i : word.startCol;
                if (row === pos.row && col === pos.col) {
                  letter = word.word[i];
                  break;
                }
              }
            });
            
            if (letter) {
              inputs[`${pos.row}-${pos.col}`] = letter;
            }
          }
        });
      }
      
      setUserInputs(inputs);
    }
  }, [crosswordData]);

  useEffect(() => {
    if (!crosswordData || !crosswordData.words) return;
    
    // Track newly completed words in this check
    const newlyCompleted = [];
    
    // Check for completed words
    crosswordData.words.forEach(word => {
      // Skip already completed words
      if (completedWordIds.includes(word.word)) {
        return;
      }
      
      let isWordComplete = true;
      
      for (let i = 0; i < word.word.length; i++) {
        const row = word.direction === 'horizontal' ? word.startRow : word.startRow + i;
        const col = word.direction === 'horizontal' ? word.startCol + i : word.startCol;
        const cellId = `${row}-${col}`;
        
        const expectedLetter = word.word[i];
        const userLetter = userInputs[cellId] || '';
        
        if (userLetter.toUpperCase() !== expectedLetter) {
          isWordComplete = false;
          break;
        }
      }
      
      if (isWordComplete) {
        newlyCompleted.push(word.word);
      }
    });
    
    // Update the completed words state if new words were completed
    if (newlyCompleted.length > 0) {
      setCompletedWordIds(prev => {
        const uniqueNewWords = newlyCompleted.filter(word => !prev.includes(word));
        
        // Log completion status
        console.log(`Newly completed words: ${uniqueNewWords.join(', ')}`);
        console.log(`Total completed: ${prev.length + uniqueNewWords.length} of ${crosswordData.words.length}`);
        
        const updated = [...prev, ...uniqueNewWords];
        
        // Notify parent component about each newly completed word
        uniqueNewWords.forEach(word => {
          onWordComplete(word);
        });
        
        return updated;
      });
    }
  }, [userInputs, crosswordData, completedWordIds, onWordComplete]);

  const handleCellChange = (row, col, value) => {
    const cellId = `${row}-${col}`;
    const newInputs = { ...userInputs, [cellId]: value.toUpperCase() };
    setUserInputs(newInputs);
    
    // Check if any words are completed
    checkCompletedWords(newInputs);
  };

  const checkCompletedWords = (inputs) => {
    crosswordData.words.forEach(wordData => {
      if (completedWords.includes(wordData.word)) return;
      
      let isComplete = true;
      for (let i = 0; i < wordData.word.length; i++) {
        const row = wordData.direction === 'horizontal' ? wordData.startRow : wordData.startRow + i;
        const col = wordData.direction === 'horizontal' ? wordData.startCol + i : wordData.startCol;
        const cellId = `${row}-${col}`;
        
        if (inputs[cellId] !== wordData.word[i]) {
          isComplete = false;
          break;
        }
      }
      
      if (isComplete) {
        const newCompletedWords = [...completedWords, wordData.word];
        setCompletedWords(newCompletedWords);
        onWordComplete(wordData.word);
        
        // Show celebration
        const celebrations = [
          "Great job!",
          "Excellent!",
          "You got it!",
          "Fantastic!",
          "Amazing work!"
        ];
        setCelebration({
          message: celebrations[Math.floor(Math.random() * celebrations.length)],
          word: wordData.word
        });
        
        setTimeout(() => {
          setCelebration(null);
        }, 2000);
      }
    });
  };

  const handleClueClick = (word) => {
    setSelectedClue(word);
  };

  // Check if a cell is part of a word
  const isCellInWord = (row, col) => {
    if (!crosswordData) return false;
    
    return crosswordData.words.some(word => {
      if (word.direction === 'horizontal') {
        return row === word.startRow && 
               col >= word.startCol && 
               col < word.startCol + word.word.length;
      } else { // vertical
        return col === word.startCol && 
               row >= word.startRow && 
               row < word.startRow + word.word.length;
      }
    });
  };

  const Cell = ({ value, row, col, isSelected, isCompleted, onChange }) => {
    const isPrefilled = crosswordData.prefilledPositions && 
      crosswordData.prefilledPositions.some(pos => pos.row === row && pos.col === col);
    
    const handleChange = (e) => {
      // Don't allow changes to prefilled cells
      if (isPrefilled) return;
      
      const newValue = e.target.value;
      if (newValue.length <= 1) {
        onChange(row, col, newValue);
        
        // Auto-advance to next cell if value is added
        if (newValue && e.target.nextElementSibling) {
          e.target.nextElementSibling.focus();
        }
      }
    };
    
    return (
      <input
        type="text"
        maxLength="1"
        value={value}
        onChange={handleChange}
        className={`cell-input ${isSelected ? 'selected' : ''} 
                  ${isCompleted ? 'completed' : ''} 
                  ${isPrefilled ? 'prefilled' : ''}`}
        readOnly={isPrefilled}
      />
    );
  };

  if (!crosswordData) return <div>Loading crossword...</div>;

  return (
    <div className="crossword-container">
      <div className="crossword-grid">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="grid-row">
            {row.map((cell, colIndex) => {
              const cellId = `${rowIndex}-${colIndex}`;
              const isPlayableCell = isCellInWord(rowIndex, colIndex);
              const isActive = selectedClue && (
                (selectedClue.direction === 'horizontal' && 
                 rowIndex === selectedClue.startRow && 
                 colIndex >= selectedClue.startCol && 
                 colIndex < selectedClue.startCol + selectedClue.word.length) ||
                (selectedClue.direction === 'vertical' && 
                 colIndex === selectedClue.startCol && 
                 rowIndex >= selectedClue.startRow && 
                 rowIndex < selectedClue.startRow + selectedClue.word.length)
              );
              
              return (
                <div 
                  key={colIndex} 
                  className={`grid-cell ${!isPlayableCell ? 'empty' : ''} ${isActive ? 'active' : ''}`}
                >
                  {isPlayableCell && (
                    <Cell
                      value={userInputs[cellId] || ''}
                      row={rowIndex}
                      col={colIndex}
                      isSelected={isActive}
                      isCompleted={completedWords.some(word => {
                        return crosswordData.words.some(w => 
                          w.word === word && (
                            (w.direction === 'horizontal' && 
                             rowIndex === w.startRow && 
                             colIndex >= w.startCol && 
                             colIndex < w.startCol + w.word.length) ||
                            (w.direction === 'vertical' && 
                             colIndex === w.startCol && 
                             rowIndex >= w.startRow && 
                             rowIndex < w.startRow + w.word.length)
                          )
                        );
                      }) ? 'completed' : ''}
                      onChange={handleCellChange}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      
      <div className="clues-container">
        <div className="clues-section">
          <h3>Across</h3>
          <ul>
            {crosswordData.words
              .filter(word => word.direction === 'horizontal')
              .map((word, index) => (
                <li 
                  key={index} 
                  onClick={() => handleClueClick(word)}
                  className={completedWords.includes(word.word) ? 'completed' : ''}
                >
                  {word.clue} {completedWords.includes(word.word) && '✓'}
                </li>
              ))}
          </ul>
        </div>
        <div className="clues-section">
          <h3>Down</h3>
          <ul>
            {crosswordData.words
              .filter(word => word.direction === 'vertical')
              .map((word, index) => (
                <li 
                  key={index} 
                  onClick={() => handleClueClick(word)}
                  className={completedWords.includes(word.word) ? 'completed' : ''}
                >
                  {word.clue} {completedWords.includes(word.word) && '✓'}
                </li>
              ))}
          </ul>
        </div>
      </div>
      
      {celebration && (
        <div className="celebration">
          <div className="celebration-content">
            <h3>{celebration.message}</h3>
            <p>You completed: {celebration.word}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default CrosswordGrid; 