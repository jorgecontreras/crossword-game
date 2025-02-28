import React, { useEffect, useState } from 'react';
import '../styles/Fireworks.css';

const Fireworks = ({ duration = 5000 }) => {
  const [fireworks, setFireworks] = useState([]);
  const [active, setActive] = useState(true);
  
  useEffect(() => {
    // Generate initial fireworks
    generateFireworks();
    
    // Add more fireworks every 800ms
    const interval = setInterval(() => {
      if (active) {
        generateFireworks();
      }
    }, 800);
    
    // Stop after specified duration
    const timer = setTimeout(() => {
      setActive(false);
      clearInterval(interval);
    }, duration);
    
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [duration, active]);
  
  const generateFireworks = () => {
    const newFireworks = [];
    const count = Math.floor(Math.random() * 3) + 2; // 2-4 fireworks at once
    
    for (let i = 0; i < count; i++) {
      newFireworks.push({
        id: Date.now() + i,
        x: Math.random() * 100,
        y: Math.random() * 50 + 10,
        size: Math.random() * 2 + 1,
        color: getRandomColor()
      });
    }
    
    setFireworks(prevFireworks => [...prevFireworks, ...newFireworks]);
    
    // Remove old fireworks to prevent too many elements
    setTimeout(() => {
      setFireworks(prevFireworks => prevFireworks.filter(fw => fw.id !== newFireworks[0].id));
    }, 1000);
  };
  
  const getRandomColor = () => {
    const colors = [
      '#FF5252', '#FF4081', '#E040FB', '#7C4DFF', 
      '#536DFE', '#448AFF', '#40C4FF', '#18FFFF',
      '#64FFDA', '#69F0AE', '#B2FF59', '#EEFF41',
      '#FFFF00', '#FFD740', '#FFAB40', '#FF6E40'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  return (
    <div className="fireworks-container">
      {fireworks.map(fw => (
        <div
          key={fw.id}
          className="firework"
          style={{
            left: `${fw.x}%`,
            top: `${fw.y}%`,
            transform: `scale(${fw.size})`,
            '--color': fw.color
          }}
        >
          {[...Array(12)].map((_, i) => (
            <div 
              key={i} 
              className="particle"
              style={{ 
                transform: `rotate(${i * 30}deg) translateY(-15px)`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Fireworks; 