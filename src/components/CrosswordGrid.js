import React, { useState, useEffect } from 'react';

function CrosswordGrid({ crosswordData, onWordComplete }) {
  const [grid, setGrid] = useState([]);
  const [userInputs, setUserInputs] = useState({});
  const [selectedClue, setSelectedClue] = useState(null);
  const [completedWords, setCompletedWords] = useState([]);
  const [celebration, setCelebration] = useState(null);

  useEffect(() => {
    if (crosswordData) {
      setGrid(crosswordData.grid);
      
      // Initialize user inputs
      const inputs = {};
      crosswordData.words.forEach(word => {
        for (let i = 0; i < word.word.length; i++) {
          const row = word.direction === 'horizontal' ? word.startRow : word.startRow + i;
          const col = word.direction === 'horizontal' ? word.startCol + i : word.startCol;
          const cellId = `${row}-${col}`;
          inputs[cellId] = '';
        }
      });
      setUserInputs(inputs);
    }
  }, [crosswordData]);

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
        onWordComplete(wordData);
        
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
                    <input
                      type="text"
                      maxLength="1"
                      value={userInputs[cellId] || ''}
                      onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                      className={completedWords.some(word => {
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