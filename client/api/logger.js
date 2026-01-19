// Database-based logging using Vercel Postgres
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);


/**
 * Initialize database tables (run once)
 * This is safe to call multiple times - it won't recreate existing tables
 */
export async function initLogTables() {
  try {
    // Create plan_generator_logs table
    await sql`
      CREATE TABLE IF NOT EXISTS plan_generator_logs (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        company_name TEXT,
        job_description TEXT,
        job_description_length INTEGER,
        is_url BOOLEAN,
        plan TEXT,
        plan_length INTEGER,
        job_fit TEXT,
        job_fit_length INTEGER,
        metadata JSONB,
        error TEXT
      )
    `;

    // Create chatbot_logs table
    await sql`
      CREATE TABLE IF NOT EXISTS chatbot_logs (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        message TEXT,
        message_length INTEGER,
        conversation_history_length INTEGER,
        response TEXT,
        response_length INTEGER,
        metadata JSONB,
        error TEXT
      )
    `;

    // Create indexes for faster queries
    await sql`CREATE INDEX IF NOT EXISTS idx_plan_logs_timestamp ON plan_generator_logs(timestamp DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_chatbot_logs_timestamp ON chatbot_logs(timestamp DESC)`;

    console.log('[Logger] Database tables initialized');
  } catch (error) {
    console.error('[Logger] Error initializing tables:', error);
    // Don't throw - allow app to continue even if tables already exist
  }
}

/**
 * Log a plan generator interaction
 */
export async function logPlanGenerator(data) {
  try {
    console.log('[Logger] logPlanGenerator called with:', {
      hasCompanyName: !!data.companyName,
      hasJobDescription: !!data.jobDescription,
      hasPlan: !!data.plan,
      hasJobFit: !!data.jobFit,
      isUrl: data.isUrl,
    });

    // Ensure tables exist (idempotent)
    await initLogTables();
    console.log('[Logger] Tables initialized/verified');

    // Prepare metadata as JSONB-compatible object
    const metadataJson = data.metadata || {};

    const result = await sql`
      INSERT INTO plan_generator_logs (
        company_name,
        job_description,
        job_description_length,
        is_url,
        plan,
        plan_length,
        job_fit,
        job_fit_length,
        metadata,
        error
      ) VALUES (
        ${data.companyName || null},
        ${data.jobDescription || null},
        ${data.jobDescription?.length || 0},
        ${data.isUrl || false},
        ${data.plan || null},
        ${data.plan?.length || 0},
        ${data.jobFit || null},
        ${data.jobFit?.length || 0},
        ${JSON.stringify(metadataJson)}::jsonb,
        ${data.error || null}
      )
    `;

    console.log('[Logger] Plan generator log saved to database successfully. Rows affected:', result.rowCount);
  } catch (error) {
    console.error('[Logger] Error logging plan generator:', error);
    console.error('[Logger] Error details:', error.message);
    console.error('[Logger] Error stack:', error.stack);
    console.error('[Logger] Error name:', error.name);
    // Don't throw - logging failures shouldn't break the API
  }
}

/**
 * Log a chatbot interaction
 */
export async function logChatbot(data) {
  try {
    console.log('[Logger] logChatbot called with:', {
      hasMessage: !!data.message,
      hasResponse: !!data.response,
      conversationHistoryLength: data.conversationHistory?.length || 0,
    });

    // Ensure tables exist (idempotent)
    await initLogTables();
    console.log('[Logger] Tables initialized/verified for chatbot');

    // Prepare metadata as JSONB-compatible object
    const metadataJson = data.metadata || {};

    const result = await sql`
      INSERT INTO chatbot_logs (
        message,
        message_length,
        conversation_history_length,
        response,
        response_length,
        metadata,
        error
      ) VALUES (
        ${data.message || null},
        ${data.message?.length || 0},
        ${data.conversationHistory?.length || 0},
        ${data.response || null},
        ${data.response?.length || 0},
        ${JSON.stringify(metadataJson)}::jsonb,
        ${data.error || null}
      )
    `;

    console.log('[Logger] Chatbot log saved to database successfully. Rows affected:', result.rowCount);
  } catch (error) {
    console.error('[Logger] Error logging chatbot:', error);
    console.error('[Logger] Error details:', error.message);
    console.error('[Logger] Error stack:', error.stack);
    console.error('[Logger] Error name:', error.name);
    // Don't throw - logging failures shouldn't break the API
  }
}

/**
 * Get all plan generator logs (protected by admin key)
 * @param {number} limit - Maximum number of logs to return (default: 1000)
 */
export async function getPlanLogs(limit = 1000) {
  try {
    const result = await sql`
      SELECT 
        id,
        timestamp,
        company_name as "companyName",
        job_description as "jobDescription",
        job_description_length as "jobDescriptionLength",
        is_url as "isUrl",
        plan,
        plan_length as "planLength",
        job_fit as "jobFit",
        job_fit_length as "jobFitLength",
        metadata,
        error
      FROM plan_generator_logs
      ORDER BY timestamp DESC
      LIMIT ${limit}
    `;

    // Transform to match expected format
    return result.rows.map(row => ({
      timestamp: row.timestamp.toISOString(),
      userInput: {
        companyName: row.companyName,
        jobDescription: row.jobDescription,
        jobDescriptionLength: row.jobDescriptionLength,
        isUrl: row.isUrl,
      },
      modelOutput: {
        plan: row.plan,
        planLength: row.planLength,
        jobFit: row.jobFit,
        jobFitLength: row.jobFitLength,
      },
      metadata: row.metadata || {},
      error: row.error,
    }));
  } catch (error) {
    console.error('[Logger] Error reading plan logs:', error);
    return [];
  }
}

/**
 * Get all chatbot logs (protected by admin key)
 * @param {number} limit - Maximum number of logs to return (default: 1000)
 */
export async function getChatbotLogs(limit = 1000) {
  try {
    const result = await sql`
      SELECT 
        id,
        timestamp,
        message,
        message_length as "messageLength",
        conversation_history_length as "conversationHistoryLength",
        response,
        response_length as "responseLength",
        metadata,
        error
      FROM chatbot_logs
      ORDER BY timestamp DESC
      LIMIT ${limit}
    `;

    // Transform to match expected format
    return result.rows.map(row => ({
      timestamp: row.timestamp.toISOString(),
      userInput: {
        message: row.message,
        messageLength: row.messageLength,
        conversationHistoryLength: row.conversationHistoryLength,
      },
      modelOutput: {
        response: row.response,
        responseLength: row.responseLength,
      },
      metadata: row.metadata || {},
      error: row.error,
    }));
  } catch (error) {
    console.error('[Logger] Error reading chatbot logs:', error);
    return [];
  }
}

/**
 * Get log statistics
 */
export async function getLogStats() {
  try {
    const [planStats, chatbotStats] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM plan_generator_logs`,
      sql`SELECT COUNT(*) as count FROM chatbot_logs`,
    ]);

    return {
      planGenerator: {
        total: parseInt(planStats.rows[0].count),
      },
      chatbot: {
        total: parseInt(chatbotStats.rows[0].count),
      },
    };
  } catch (error) {
    console.error('[Logger] Error getting stats:', error);
    return {
      planGenerator: { total: 0 },
      chatbot: { total: 0 },
    };
  }
}
