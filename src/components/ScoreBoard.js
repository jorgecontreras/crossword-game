import React from 'react';

function ScoreBoard({ score, completedWords, totalWords, topic }) {
  return (
    <div className="scoreboard">
      <div className="score-section">
        <h2>Score: {score}</h2>
        <p>Topic: {topic}</p>
      </div>
      <div className="progress-section">
        <p>Progress: {completedWords.length} / {totalWords} words</p>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(completedWords.length / totalWords) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}

export default ScoreBoard;