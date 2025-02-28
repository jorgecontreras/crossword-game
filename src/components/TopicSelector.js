import React, { useState } from 'react';

function TopicSelector({ onSubmit }) {
  const [topic, setTopic] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (topic.trim()) {
      onSubmit(topic);
    }
  };

  return (
    <div className="topic-selector">
      <h2>Welcome to the AI Crossword Game!</h2>
      <p>Enter a topic to generate a custom crossword puzzle:</p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., Technology, Sports, Movies, etc."
          required
        />
        <button type="submit">Create Crossword</button>
      </form>
    </div>
  );
}

export default TopicSelector;