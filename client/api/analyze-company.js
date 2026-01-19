// Vercel Serverless Function for Company Analysis
// This endpoint generates a 90-day plan using LLM analysis

import { generate90DayPlan, analyzeJobFit, scrapeJobDescription } from './helpers.js';
import { logPlanGenerator } from './logger.js';

// For Vercel, we export a default async function that receives req and res
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
    let { companyName, jobDescription } = req.body;

    if (!companyName || !jobDescription) {
      return res.status(400).json({ error: 'Company name and job description are required' });
    }

    // Check if jobDescription is a URL
    const isUrl = jobDescription.trim().startsWith('http://') || jobDescription.trim().startsWith('https://');
    
    if (isUrl) {
      try {
        jobDescription = await scrapeJobDescription(jobDescription.trim());
        
        if (!jobDescription || jobDescription.length < 50) {
          return res.status(400).json({ 
            error: 'Could not extract job description from URL',
            message: 'Automated access is blocked on this site. Please copy and paste the job description text directly.'
          });
        }
      } catch (error) {
        return res.status(400).json({ 
          error: 'Failed to scrape job description from URL',
          message: error.message || 'Automated access is blocked on this site. Please copy and paste the job description text directly.'
        });
      }
    }

    // Generate 90-day plan and job fit analysis
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

    // Determine if original input was a URL (before scraping)
    const originalJobDesc = req.body.jobDescription;
    const wasUrl = originalJobDesc?.trim().startsWith('http://') || originalJobDesc?.trim().startsWith('https://');

    // Log the interaction (async, don't await - don't block response)
    logPlanGenerator({
      companyName,
      jobDescription,
      isUrl: wasUrl,
      plan,
      jobFit,
      metadata,
    }).catch(err => {
      console.error('[API] Logging error (non-blocking):', err);
      console.error('[API] Logging error details:', err.message, err.stack);
    });

    return res.status(200).json({
      plan,
      jobFit,
      metadata,
    });
  } catch (error) {
    console.error('Error analyzing company:', error);
    
    // Log the error (async, don't await - don't block response)
    logPlanGenerator({
      companyName: req.body?.companyName || 'unknown',
      jobDescription: req.body?.jobDescription || 'unknown',
      isUrl: false,
      plan: null,
      jobFit: null,
      metadata: null,
      error: error.message || 'Unknown error',
    }).catch(err => console.error('[API] Logging error (non-blocking):', err));
    
    return res.status(500).json({ 
      error: 'Failed to analyze company',
      message: error.message 
    });
  }
}
