function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed, use POST' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENAI_API_KEY no está configurada en Vercel' });
  }

  let body;
  try {
    body = await parseJsonBody(req);
  } catch (error) {
    return res.status(400).json({ error: 'Request body must be valid JSON' });
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (!messages.length) {
    return res.status(400).json({ error: 'messages is required and must be a non-empty array' });
  }

  const systemPrompt = [
    'Eres el asistente virtual de Pizzeria Gigi, un restaurante italiano auténtico ubicado en C/ Dr. Ruperto González Negrín 4 Bajo, Arrecife, Lanzarote, España.',
    'Teléfono: +34 928 81 47 49.',
    'Horario: Lunes a Viernes 12:00–23:00, Sábado y Domingo 11:00–23:30.',
    'El restaurante lleva abierto desde 1995 y ha ganado el premio Travellers\' Choice de TripAdvisor con más de 438 opiniones y una valoración de 4,5 sobre 5.',
    'La masa se elabora a mano cada día con levadura madre de fermentación lenta. El tomate es San Marzano importado del Vesubio. El horno de piedra alcanza 400°C.',
    'Carta de pizzas: Margherita (12€), Diavola (14€), Quattro Formaggi (15€), Prosciutto e Funghi (14€), Napolitana (13€), Vegetariana Gigi (13€) y Carbonara (15€).',
    'Para reservas recomienda llamar al +34 928 81 47 49.',
    'Responde siempre en el mismo idioma en que te escriba el cliente. Sé amable, cálido y conciso. No inventes información que no tengas.'
  ].join(' ');

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        max_tokens: 400,
        temperature: 0.7
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error ? data.error.message : 'Error from OpenAI' });
    }

    const reply = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content ? data.choices[0].message.content.trim() : '';
    if (!reply) {
      return res.status(500).json({ error: 'OpenAI returned an invalid response' });
    }

    return res.status(200).json({ reply });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Error connecting to OpenAI' });
  }
};
