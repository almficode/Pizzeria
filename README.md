# Pizzeria Gigi

Este proyecto incluye un asistente IA integrado y listo para desplegar en Vercel.

## Cómo funciona

- El frontend en `index.html` carga `ai.js`, que envía las preguntas del usuario a `/api/openai`.
- La función serverless en `api/openai.js` usa `OPENAI_API_KEY` para llamar a la API de OpenAI.
- `package.json` indica Node 24 para Vercel.
- `vercel.json` no define runtime manualmente para evitar errores de configuración.
- La clave nunca se expone en el navegador.

## Despliegue en Vercel

1. Crea el proyecto en Vercel apuntando a este repositorio.
2. En Vercel, ve a _Settings_ → _Environment Variables_.
3. Añade la variable:
   - `OPENAI_API_KEY` = `sk-...` (tu clave real de OpenAI)
4. Despliega.

## Notas

- El endpoint de API está en `api/openai.js`.
- No necesitas modificar `index.html` para la clave.
- Si el asistente no responde, revisa que `OPENAI_API_KEY` esté bien configurada.
