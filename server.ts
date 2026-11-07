import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini client if API key is provided
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Health / status check
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!apiKey,
    service: 'Canva Studio Backend Engine',
  });
});

// Magic Write API
app.post('/api/magic-write', async (req, res) => {
  const { prompt, tone = 'engaging', task = 'rewrite', currentText = '' } = req.body;

  if (!ai) {
    // Intelligent fallback generator if API key is not yet set
    const fallbackOptions: Record<string, string[]> = {
      rewrite: [
        `Elevate your style with ${currentText || 'unmatched creativity'}. Designed to inspire.`,
        `Crafted for creators: ${currentText || 'Bold. Timeless. Unique.'}`,
        `Experience next-level design with ${currentText || 'seamless precision'}.`,
      ],
      slogan: [
        'Design Without Limits.',
        'Create in Seconds. Inspire Forever.',
        'Simplicity Meets Bold Aesthetic.',
        'Your Vision, Brought to Life.',
      ],
      headline: [
        'The Future of Visual Storytelling',
        'Unleash Your Creative Potential',
        'Transform Ideas into Masterpieces',
      ],
      summarize: [
        `${(currentText || 'Expressive design').slice(0, 60)}... Simplified for impact.`,
      ],
    };
    const pool = fallbackOptions[task] || fallbackOptions.rewrite;
    const result = pool[Math.floor(Math.random() * pool.length)];
    return res.json({ text: result, source: 'curated-smart-preset' });
  }

  try {
    const systemPrompt = `You are Canva Magic Write, a world-class copywriter and design typographer.
Task: ${task}
Tone: ${tone}
User input / context: "${prompt || currentText}"
Return concise, high-impact copy suitable for graphic design posters, social media banners, presentations, and flyers.
Provide only the resulting polished text without conversational filler, quotes, or markdown wrappers.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: systemPrompt,
    });

    const text = response.text?.trim() || currentText || 'Design with bold confidence';
    res.json({ text, source: 'gemini-3.8-flash' });
  } catch (error: any) {
    console.error('Magic write error:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate text',
      fallback: currentText || 'Creative Design Studio',
    });
  }
});

// Magic Design API (Generates complete graphic compositions from a prompt)
app.post('/api/magic-design', async (req, res) => {
  const { prompt, canvasType = 'square' } = req.body;

  if (!ai) {
    // Return curated high-grade design template matching keywords
    const lower = (prompt || '').toLowerCase();
    const isDark = lower.includes('dark') || lower.includes('night') || lower.includes('tech');
    
    return res.json({
      source: 'smart-template-engine',
      design: {
        title: prompt || 'New Creative Project',
        backgroundColor: isDark ? '#0f172a' : '#faf7f2',
        elements: [
          {
            type: 'shape',
            shapeType: 'circle',
            x: 80,
            y: 90,
            width: 220,
            height: 220,
            fill: isDark ? 'rgba(56, 189, 248, 0.15)' : '#fed7aa',
            opacity: 0.8,
            rotation: 0,
          },
          {
            type: 'text',
            text: (prompt || 'BOLD & TIMELESS').toUpperCase(),
            x: 100,
            y: 280,
            fontSize: 44,
            fontWeight: 'bold',
            fontFamily: 'Outfit',
            color: isDark ? '#ffffff' : '#1e293b',
            textAlign: 'left',
            letterSpacing: 2,
          },
          {
            type: 'text',
            text: 'Curated Collection · Limited Edition Release',
            x: 100,
            y: 350,
            fontSize: 16,
            fontWeight: 'normal',
            fontFamily: 'Plus Jakarta Sans',
            color: isDark ? '#94a3b8' : '#64748b',
            textAlign: 'left',
            letterSpacing: 0.5,
          },
          {
            type: 'shape',
            shapeType: 'rectangle',
            x: 100,
            y: 400,
            width: 140,
            height: 44,
            fill: isDark ? '#38bdf8' : '#0f172a',
            borderRadius: 8,
            rotation: 0,
          },
          {
            type: 'text',
            text: 'EXPLORE NOW',
            x: 122,
            y: 413,
            fontSize: 13,
            fontWeight: 'bold',
            fontFamily: 'Plus Jakarta Sans',
            color: isDark ? '#0f172a' : '#ffffff',
            textAlign: 'left',
            letterSpacing: 1,
          },
        ],
      },
    });
  }

  try {
    const promptInstructions = `You are Canva Magic Design AI.
Generate a structured graphic design composition for a ${canvasType} canvas (width: 800, height: 800) based on this request:
"${prompt}"

Output strictly valid JSON with the following schema:
{
  "title": "Short title",
  "backgroundColor": "#hex or rgba",
  "elements": [
    {
      "type": "text" | "shape",
      "text": "text content (if text)",
      "shapeType": "rectangle" | "circle" | "triangle" | "star" (if shape),
      "x": number (0 to 700),
      "y": number (0 to 700),
      "width": number,
      "height": number,
      "fill": "#hex color",
      "color": "#hex color (for text)",
      "fontSize": number (14 to 64),
      "fontWeight": "normal" | "bold" | "600",
      "fontFamily": "Plus Jakarta Sans" | "Outfit" | "Playfair Display" | "Oswald",
      "textAlign": "left" | "center" | "right",
      "borderRadius": number (optional, for rectangles),
      "letterSpacing": number (optional),
      "opacity": number (0.1 to 1)
    }
  ]
}
Include 3 to 7 harmonious, well-positioned elements (title heading, supporting subheading, call-to-action button or container, geometric background accents). Ensure good color contrast and sophisticated aesthetics.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptInstructions,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      source: 'gemini-3.8-flash',
      design: parsed,
    });
  } catch (error: any) {
    console.error('Magic design error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate design' });
  }
});

// Magic AI Image Generation
app.post('/api/magic-image', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  if (!ai) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY is not configured',
    });
  }

  try {
    const response = await ai.models.generateImages({
      model: 'gemini-3.1-flash-lite-image',
      prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '1:1',
      },
    });

    const base64Image = response.generatedImages?.[0]?.image?.imageBytes;
    if (!base64Image) {
      throw new Error('No image generated');
    }

    res.json({
      url: `data:image/jpeg;base64,${base64Image}`,
      source: 'gemini-3.1-flash-lite-image',
    });
  } catch (error: any) {
    console.error('Magic image generation error:', error);
    res.status(500).json({ error: error.message || 'Image generation failed' });
  }
});

// Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
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
    console.log(`Canva Studio Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
