// Simple Express server for local development
// This proxies API calls and allows us to use environment variables for OpenAI API key

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Import helper functions
import { generate90DayPlan, analyzeJobFit, scrapeJobDescription, chatWithRushil } from './api/helpers.js';

console.log('[Server] Helpers imported successfully');
console.log('[Server] generate90DayPlan type:', typeof generate90DayPlan);

app.post('/api/analyze-company', async (req, res) => {
  try {
    let { companyName, jobDescription } = req.body;

    console.log('[API] Request received:', { companyName, jobDescriptionLength: jobDescription?.length, isUrl: jobDescription?.startsWith('http') });

    if (!companyName || !jobDescription) {
      return res.status(400).json({ error: 'Company name and job description are required' });
    }

    // Check if jobDescription is a URL
    const isUrl = jobDescription.trim().startsWith('http://') || jobDescription.trim().startsWith('https://');
    
    if (isUrl) {
      console.log('[API] Detected URL, scraping job description...');
      try {
        jobDescription = await scrapeJobDescription(jobDescription.trim());
        console.log('[API] Scraped job description, length:', jobDescription?.length);
        
        if (!jobDescription || jobDescription.length < 50) {
          return res.status(400).json({ 
            error: 'Could not extract job description from URL',
            message: 'Automated access is blocked on this site. Please copy and paste the job description text directly.'
          });
        }
      } catch (error) {
        console.error('[API] Error scraping URL:', error);
        return res.status(400).json({ 
          error: 'Failed to scrape job description from URL',
          message: error.message || 'Automated access is blocked on this site. Please copy and paste the job description text directly.'
        });
      }
    }

    // Generate 90-day plan and job fit analysis
    console.log('[API] Generating 90-day plan...');
    const startTime = Date.now();
    const [planResult, jobFit] = await Promise.all([
      generate90DayPlan(companyName, jobDescription),
      analyzeJobFit(companyName, jobDescription),
    ]);
    
    // Handle both old format (string) and new format (object with metadata)
    const plan = typeof planResult === 'string' ? planResult : planResult.plan;
    const metadata = typeof planResult === 'object' && planResult.metadata ? planResult.metadata : {
      latency: Date.now() - startTime,
      model: 'unknown',
      architecture: 'unknown',
      cost: 0,
      tokens: { input: 0, output: 0, total: 0 }
    };
    
    console.log('[API] Plan generated, length:', plan?.length);
    console.log('[API] Job fit requirements:', jobFit?.length || 0);
    console.log('[API] Metadata:', metadata);

    return res.status(200).json({
      plan,
      jobFit,
      metadata,
    });
  } catch (error) {
    console.error('[API] Error analyzing company:', error);
    console.error('[API] Error stack:', error.stack);
    return res.status(500).json({ 
      error: 'Failed to analyze company',
      message: error.message 
    });
  }
});

app.post('/api/chatbot', async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await chatWithRushil(message, conversationHistory || []);

    return res.status(200).json({
      response,
    });
  } catch (error) {
    console.error('[API] Error in chatbot:', error);
    return res.status(500).json({ 
      error: 'Failed to process chat message',
      message: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
  console.log(`📝 API endpoint: http://localhost:${PORT}/api/analyze-company`);
  console.log(`💬 Chatbot endpoint: http://localhost:${PORT}/api/chatbot`);
  if (process.env.OPENAI_API_KEY) {
    console.log(`✅ OpenAI API key found - LLM features enabled`);
  } else {
    console.log(`⚠️  No OpenAI API key found - using heuristic fallback`);
    console.log(`   Add OPENAI_API_KEY to .env.local to enable LLM features`);
  }
});
