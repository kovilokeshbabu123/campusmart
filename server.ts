import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function normalizeIndianPhoneServer(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.slice(1);
  }
  return digits;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '64kb' }));

  app.post('/api/sms/send', async (req: Request, res: Response) => {
    const rawPhone = typeof req.body?.phoneNumber === 'string' ? req.body.phoneNumber : '';
    const rawMessage = typeof req.body?.message === 'string' ? req.body.message.trim() : '';

    const digits = normalizeIndianPhoneServer(rawPhone);
    if (!/^[6-9]\d{9}$/.test(digits)) {
      res.status(400).json({
        ok: false,
        error: 'Enter a valid 10-digit Indian mobile number (e.g. 9876543210).',
      });
      return;
    }

    if (rawMessage.length < 4 || rawMessage.length > 480) {
      res.status(400).json({
        ok: false,
        error: 'SMS message body must be between 4 and 480 characters.',
      });
      return;
    }

    const phoneE164 = `+91${digits}`;
    const smsUri = `sms:${phoneE164}?body=${encodeURIComponent(rawMessage)}`;

    const fast2SmsKey = process.env.FAST2SMS_API_KEY?.trim();
    if (fast2SmsKey) {
      try {
        const apiRes = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            authorization: fast2SmsKey,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            route: 'q',
            message: rawMessage,
            language: 'english',
            flash: 0,
            numbers: digits,
          }),
        });
        const data = (await apiRes.json().catch(() => null)) as { return?: boolean; message?: string[] } | null;
        if (apiRes.ok && data?.return) {
          res.json({
            ok: true,
            delivered: true,
            provider: 'fast2sms',
            phoneE164,
            smsUri,
            message: rawMessage,
          });
          return;
        }
        res.status(502).json({
          ok: false,
          delivered: false,
          phoneE164,
          smsUri,
          error: data?.message?.[0] ?? 'Fast2SMS gateway could not deliver the message.',
        });
        return;
      } catch {
        res.status(502).json({
          ok: false,
          delivered: false,
          phoneE164,
          smsUri,
          error: 'Could not reach the Fast2SMS gateway.',
        });
        return;
      }
    }

    const twilioSid = process.env.TWILIO_ACCOUNT_SID?.trim();
    const twilioToken = process.env.TWILIO_AUTH_TOKEN?.trim();
    const twilioFrom = process.env.TWILIO_PHONE_NUMBER?.trim();
    if (twilioSid && twilioToken && twilioFrom) {
      try {
        const authHeader = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
        const form = new URLSearchParams({
          To: phoneE164,
          From: twilioFrom,
          Body: rawMessage,
        });
        const apiRes = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(twilioSid)}/Messages.json`,
          {
            method: 'POST',
            headers: {
              authorization: `Basic ${authHeader}`,
              'content-type': 'application/x-www-form-urlencoded',
            },
            body: form.toString(),
          },
        );
        if (apiRes.ok) {
          res.json({
            ok: true,
            delivered: true,
            provider: 'twilio',
            phoneE164,
            smsUri,
            message: rawMessage,
          });
          return;
        }
        res.status(502).json({
          ok: false,
          delivered: false,
          phoneE164,
          smsUri,
          error: 'Twilio SMS gateway rejected the request.',
        });
        return;
      } catch {
        res.status(502).json({
          ok: false,
          delivered: false,
          phoneE164,
          smsUri,
          error: 'Could not reach the Twilio SMS gateway.',
        });
        return;
      }
    }

    // No external SMS gateway secret configured in container — return clean device SMS link fallback
    res.json({
      ok: true,
      delivered: false,
      provider: 'device-sms',
      phoneE164,
      smsUri,
      message: rawMessage,
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const port = Number(process.env.PORT ?? 3000);
  app.listen(port, '0.0.0.0', () => {
    console.log(`CampusMart VEMU server listening on http://localhost:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start CampusMart server:', err);
  process.exit(1);
});
