import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = Number(process.env.PORT || 3000);

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const server = http.createServer(async (req, res) => {
  try {
    if ((req.method === 'GET' || req.method === 'HEAD') && req.url === '/') {
      const html = await fs.readFile(path.join(__dirname, 'index.html'), 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(req.method === 'HEAD' ? '' : html);
      return;
    }

    if (req.method === 'POST' && req.url === '/recognize-image') {
      if (!client) {
        sendJson(res, 500, {
          error: 'OPENAI_API_KEY is not set. Add it to your environment before starting the server.'
        });
        return;
      }

      const body = await readJsonBody(req);
      const image = body?.image;

      if (!image || typeof image !== 'string' || !image.startsWith('data:image/')) {
        sendJson(res, 400, { error: 'Expected a base64 data URL image.' });
        return;
      }

      const response = await client.responses.create({
        model: 'gpt-4.1',
        input: [
          {
            role: 'system',
            content: [
              {
                type: 'input_text',
                text: 'You read handwritten text from images. Return only the handwritten text with normal spacing and punctuation. Do not add explanations, labels, or quotes. If the image is unreadable, return exactly: UNREADABLE'
              }
            ]
          },
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: 'Read the handwritten text in this image. Ignore notebook lines, paper texture, shadows, and any printed background marks. If there is a single word, return just that word.'
              },
              {
                type: 'input_image',
                image_url: image
              }
            ]
          }
        ]
      });

      const text = (response.output_text || '').trim();
      sendJson(res, 200, {
        text: text === 'UNREADABLE' ? '' : text
      });
      return;
    }

    sendJson(res, 404, { error: 'Not found' });
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: error.message || 'Server error' });
  }
});

server.listen(port, () => {
  console.log(`Handwriter server running at http://localhost:${port}`);
});

async function readJsonBody(req) {
  let raw = '';

  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 10 * 1024 * 1024) {
      throw new Error('Request body too large');
    }
  }

  return raw ? JSON.parse(raw) : {};
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}
