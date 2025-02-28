const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3020;

// Configure CORS
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

app.post('/api/generate-words', async (req, res) => {
  try {
    const { topic } = req.body;
    console.log(`Generating words for topic: ${topic}`);
    
    // Check if API key is set
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not set in environment variables');
    }
    
    // Make request to Anthropic API with updated parameters
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: "claude-3-haiku-20240307",
        max_tokens: 1024,
        system: "You are a helpful assistant that generates crossword puzzle words and clues based on topics.",
        messages: [
          {
            role: "user",
            content: `Generate 10 words related to the topic "${topic}" for a crossword puzzle. 
            For each word, provide a clear, concise clue. 
            Format your response as a JSON array of objects, each with "word" and "clue" properties.
            Only include words that are 3-12 letters long and contain only alphabetic characters.
            Example response format:
            [
              {"word": "EXAMPLE", "clue": "A representative model or pattern"},
              {"word": "SAMPLE", "clue": "A small part or quantity intended to show what the whole is like"}
            ]
            Only provide the JSON array, with no additional text.`
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
          'x-api-key': process.env.ANTHROPIC_API_KEY
        }
      }
    );
    
    console.log('Received response from Anthropic API');
    
    // Log the structure of the response
    console.log('Response structure:', Object.keys(response.data));
    
    // Extract the content from the AI response
    const content = response.data.content[0].text;
    console.log('Raw content:', content);
    
    // Parse the JSON content
    const words = JSON.parse(content);
    
    res.json({ words });
  } catch (error) {
    console.error('Error generating words:', error);
    console.error('Error details:', error.response?.data || 'No response data');
    res.status(500).json({ 
      error: 'Failed to generate words', 
      details: error.message,
      response: error.response?.data
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`ANTHROPIC_API_KEY ${process.env.ANTHROPIC_API_KEY ? 'is set' : 'is NOT set'}`);
}); 