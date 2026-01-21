// Vercel Serverless Function for Chatbot
import { chatWithRushil } from './helpers.js';
import { logChatbot } from './logger.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await chatWithRushil(message, conversationHistory || []);

    // Log the interaction to Google Sheets
    logChatbot({
      message,
      conversationHistory,
      response,
    }).catch(err => console.error('[API] Error logging to Google Sheets:', err));

    return res.status(200).json({
      response,
    });
  } catch (error) {
    console.error('Error in chatbot:', error);
    
    // Log the error to Google Sheets
    logChatbot({
      message: req.body?.message || 'unknown',
      conversationHistory: req.body?.conversationHistory || [],
      error: error.message,
    }).catch(err => console.error('[API] Error logging error to Google Sheets:', err));
    
    return res.status(500).json({ 
      error: 'Failed to process chat message',
      message: error.message 
    });
  }
}
