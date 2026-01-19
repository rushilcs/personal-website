// Vercel Serverless Function for Admin Logs Viewing
import { getPlanLogs, getChatbotLogs, getLogStats } from './logger.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const adminKey = req.query.key || req.headers['x-admin-key'];
    const expectedKey = process.env.ADMIN_LOG_KEY;
    
    // Debug info (remove in production if needed)
    if (!expectedKey) {
      console.error('[Admin Logs] ADMIN_LOG_KEY environment variable is not set');
      return res.status(500).json({ 
        error: 'Server configuration error',
        message: 'ADMIN_LOG_KEY environment variable is not set. Please add it in Vercel dashboard.'
      });
    }
    
    // Decode URL-encoded key if needed (handles special characters in query string)
    const decodedKey = adminKey ? decodeURIComponent(adminKey) : null;
    
    if (!decodedKey || decodedKey !== expectedKey) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const type = req.query.type || 'all'; // 'plan', 'chatbot', or 'all'
    const limit = parseInt(req.query.limit) || 1000; // Limit results
    
    let logs = {};
    let stats = {};
    
    if (type === 'plan' || type === 'all') {
      logs.planGenerator = await getPlanLogs(limit);
    }
    
    if (type === 'chatbot' || type === 'all') {
      logs.chatbot = await getChatbotLogs(limit);
    }

    // Get statistics if requested
    if (req.query.stats === 'true') {
      stats = await getLogStats();
    }

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      counts: {
        planGenerator: logs.planGenerator?.length || 0,
        chatbot: logs.chatbot?.length || 0,
      },
      stats: Object.keys(stats).length > 0 ? stats : undefined,
      logs,
    });
  } catch (error) {
    console.error('[API] Error fetching logs:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch logs',
      message: error.message 
    });
  }
}
