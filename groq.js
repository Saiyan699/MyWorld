// groq.js
const axios = require('axios');
require('dotenv').config();

class GroqAPI {
  constructor() {
    this.baseUrl = 'https://api.groq.com/openai/v1/chat/completions';
    this.availableModels = {
      'llama3-70b': 'llama3-70b-8192',
      'mixtral': 'mixtral-8x7b-32768'
    };
    this.defaultModel = this.availableModels['llama3-70b'];
  }

  async getResponse(prompt, userId = null) {
    try {
      // Dodaj uputu za hrvatski jezik u prompt
      const systemMessage = {
        role: "system",
        content: "Odgovaraj isključivo na hrvatskom jeziku. Koristi standardni hrvatski pravopis."
      };

      const userMessage = {
        role: "user",
        content: prompt
      };

      const messages = [systemMessage, userMessage];

      // Ako postoji kontekst, dodaj ga
      if (userId && this.conversations.has(userId)) {
        messages.unshift(...this.conversations.get(userId));
      }

      const response = await axios.post(
        this.baseUrl,
        {
          model: this.defaultModel,
          messages: messages,
          temperature: 0.7,
          max_tokens: 1024
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Groq API Error:', error.response?.data || error.message);
      return "❌ Došlo je do greške. Molim pokušajte ponovo kasnije.";
    }
  }
}

module.exports = new GroqAPI();
