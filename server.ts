import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '9128165397:AAFZFN_qgNyfROzRZT4M6ZNaM4zfrDz_q2Y';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '8990517709';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'show77';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '123abc@$';

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Telegram Alert Endpoint
  app.post('/api/telegram/notify', async (req, res) => {
    try {
      const { message } = req.body;
      if (!message) {
        return res.status(400).json({ error: 'Message content is required' });
      }

      const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
      const response = await fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error('Telegram API error response:', data);
        return res.status(response.status).json(data);
      }

      res.json({ success: true, result: data.result });
    } catch (error: any) {
      console.error('Telegram notification error:', error);
      res.status(500).json({ error: error.message || 'Failed to dispatch Telegram message' });
    }
  });

  // Director Authentication Endpoint
  app.post('/api/director/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      return res.json({
        success: true,
        user: {
          username: ADMIN_USERNAME,
          name: 'Camp Director',
          role: 'director',
        },
      });
    }
    return res.status(401).json({ success: false, error: 'Invalid username or password' });
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Vite middleware in dev or static serving in prod
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Driftwood Camp full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
