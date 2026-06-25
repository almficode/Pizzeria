function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    var body = '';
    req.on('data', function (chunk) { body += chunk; });
    req.on('end', function () {
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

  var apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENAI_API_KEY no está configurada en Vercel' });
  }

  var body;
  try {
    body = await parseJsonBody(req);
  } catch (error) {
    return res.status(400).json({ error: 'Request body must be valid JSON' });
  }

  var messages = Array.isArray(body.messages) ? body.messages : [];
  if (!messages.length) {
    return res.status(400).json({ error: 'messages is required and must be a non-empty array' });
  }

  var systemPrompt = [
    'Eres el asistente virtual de Pizzeria Gigi, un restaurante italiano auténtico en Arrecife, Lanzarote.',
    'Dirección: C/ Dr. Ruperto González Negrín 4 Bajo, Arrecife, Lanzarote, España.',
    'Teléfono: +34 928 81 47 49.',
    'Horario: Lunes a Viernes 12:00–23:00, Sábado y Domingo 11:00–23:30.',
    'Pizzeria Gigi existe desde 1995 y ha recibido el premio Travellers\' Choice de TripAdvisor con más de 438 opiniones.',
    'La carta incluye pizzas tradicionales elaboradas con masa madre, horno de piedra a 400°C y tomate San Marzano importado de Italia.',
    'Menú principal: Margherita (12€), Diavola (14€), Quattro Formaggi (15€), Prosciutto e Funghi (14€), Napolitana (13€), Vegetariana Gigi (13€) y Carbonara (15€).',
    'El asistente debe contestar preguntas sobre el negocio, la carta, horarios, reservas, ubicación, ingredientes, alergias y el contenido del sitio web como si fuera un experto del restaurante.',
    'Si no conoce una respuesta, debe admitirlo y no inventar datos.',
    'Responde siempre en el idioma en el que te escriba el cliente. Sé amable, claro y conciso.'
  ].join(' ');

  try {
    var response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'system', content: systemPrompt }].concat(messages),
        max_tokens: 500,
        temperature: 0.7
      })
    });

    var data = await response.json();
    if (!response.ok) {
      var errorMessage = data && data.error && data.error.message ? data.error.message : 'Error from OpenAI';
      return res.status(response.status).json({ error: errorMessage });
    }

    var reply = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content
      ? data.choices[0].message.content.trim()
      : '';

    if (!reply) {
      return res.status(500).json({ error: 'OpenAI returned an invalid response' });
    }

    return res.status(200).json({ reply: reply });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Error connecting to OpenAI' });
  }
};
