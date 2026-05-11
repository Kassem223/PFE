const axios = require('axios');

const chatbotController = {
  async chat(req, res) {
    try {
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Read company information from the text file
      const fs = require('fs').promises;
      const path = require('path');
      const companyInfoPath = path.join(__dirname, '../company_info.txt');
      
      let companyContext = '';
      try {
        companyContext = await fs.readFile(companyInfoPath, 'utf8');
      } catch (error) {
        console.log('Company info file not found, using default context');
        companyContext = 'VEKTOR est une entreprise de gestion des ressources et réservations.';
      }

      // Create the enhanced prompt with company context
      const enhancedPrompt = `
Contexte de l'entreprise:
${companyContext}

Question de l'utilisateur: ${message}

Réponds en français de manière professionnelle et utile. Si la question concerne l'entreprise, utilise les informations fournies dans le contexte. Sinon, réponds de manière générale mais en gardant le contexte professionnel d'une entreprise de gestion de ressources.
      `;

      // Call Ollama API with Mistral model
      const response = await axios.post('http://localhost:11434/api/generate', {
        model: 'mistral',
        prompt: enhancedPrompt,
        stream: false
      }, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.response) {
        res.json({
          response: response.data.response.trim()
        });
      } else {
        throw new Error('Invalid response from Ollama');
      }

    } catch (error) {
      console.error('Chatbot error:', error.message);
      res.status(500).json({ 
        error: 'Failed to process chat request',
        details: error.message 
      });
    }
  }
};

module.exports = chatbotController;
