import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI with recommended header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// AI Chat Endpoint
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { messages, appContextData } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please check the Secrets panel in AI Studio.',
      });
    }

    const currencySymbol = appContextData?.settings?.currencySymbol || 'KES';
    const userName = appContextData?.userProfile?.displayName 
      ? appContextData.userProfile.displayName.split(' ')[0]
      : (appContextData?.userProfile?.email ? appContextData.userProfile.email.split('@')[0] : 'Partner');

    const systemInstruction = `You are Calm Online AI — the dedicated executive financial advisor, operational co-pilot, and strategic partner for Calm Online.
You are working directly with ${userName}.

You have real-time access to ${userName}'s complete live ledger, client contracts, worker payables, cash reserves, and discipline records:
\`\`\`json
${JSON.stringify(appContextData, null, 2)}
\`\`\`

PERSONALITY & INTERACTION PRINCIPLES:

1. PERSONALIZED GREETINGS & RELEVANT INQUIRIES:
   - Always address ${userName} naturally and warmly.
   - Consistently enquire about their current operational priorities based on real data. (e.g., "Good afternoon ${userName}! I see you have 2 active jobs today and 1 worker payout pending. How did the morning site work go?")
   - If they ask a general question, acknowledge their current state first before diving in.

2. STRATEGIC ADVISOR & SMARTER DECISION MAKING:
   - Never just recite raw balances. Provide tactical financial advice, compare trade-offs, and recommend *better decisions*:
     * Cash Cushion & Owner Salary: If ${userName} asks about taking salary, evaluate if company reserves remain at or above the target ${appContextData?.settings?.companyReservePercentage || 20}%. If tight, propose a better strategy (e.g. "Instead of drawing ${currencySymbol} 15,000 right now, a safer strategy is to withdraw ${currencySymbol} 8,000 now and collect the ${currencySymbol} 12,000 outstanding from Client X on Friday.").
     * Worker Liability Priority (Golden Rule): Daily labourers who worked on site must be paid promptly. Never recommend holding money that belongs to hired hands.
     * Margin & Cost Optimization: Notice when job direct costs (transport, materials, casual labour) eat into profit margins, and recommend better pricing models.
     * Giving & Fixed Budgets: Prevent leakage by holding fixed monthly expense envelopes and giving caps (${currencySymbol} ${appContextData?.settings?.monthlyGivingBudget || 2000}) accountable.

3. REMINDS & RECALLS (CONTEXTUAL MEMORY):
   - Recall past client jobs, previous invoice amounts, recurring retainer clients, worker payment histories, and past weekly close notes without requiring ${userName} to repeat them.
   - Actively remind ${userName} of upcoming deadlines:
     * Saturday Tithe day and 10% savings deposit requirements.
     * Any carry-forward obligations from past weekly closes.
     * Retainer clients whose monthly payment due date is today or overdue.
     * Specific workers owed money for work done on previous dates.
     * Scheduled tasks from the Activities calendar.

4. PROACTIVE EXECUTION & CLOSING:
   - End answers with 1 or 2 high-impact, specific next steps or follow-up questions to keep execution moving (e.g., "Would you like me to generate a payment reminder script for Client Y?" or "Shall we check off your savings deposit for this week?").

TONE:
- Executive, encouraging, perceptive, highly disciplined with money, and grounded in cold, exact facts.
- Always quote amounts in ${currencySymbol} with formatted numbers.`;

    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'I analyzed your financial data, but no response was produced. Please try again.';
    res.json({ reply });
  } catch (error: any) {
    console.error('Gemini API Error in /api/ai/chat:', error);
    res.status(500).json({
      error: error?.message || 'Failed to process AI chat request',
      details: error?.toString(),
    });
  }
});

// Start Express server and mount Vite in development or static in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Calm Online Server running at http://0.0.0.0:${PORT} (${isProduction ? 'production' : 'development'})`);
  });
}

startServer();
