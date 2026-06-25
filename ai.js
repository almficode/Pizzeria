document.addEventListener('DOMContentLoaded', function () {
  var galeriaOverlay = document.getElementById('galeriaOverlay');
  var galeriaClose = document.getElementById('galeriaOverlayClose');
  var galeriaLinks = document.querySelectorAll('.galeria-open-link');

  function openGaleria() {
    if (!galeriaOverlay) return;
    galeriaOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeGaleria() {
    if (!galeriaOverlay) return;
    galeriaOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (galeriaClose) galeriaClose.addEventListener('click', closeGaleria);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeGaleria();
  });
  galeriaLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      openGaleria();
    });
  });

  var embedMsgs = document.getElementById('aiEmbedMessages');
  var embedInput = document.getElementById('aiEmbedInput');
  var embedSend = document.getElementById('aiEmbedSend');
  var chips = document.querySelectorAll('.ai-suggestion-chip');
  var embedHistory = [];
  var isSending = false;

  function sanitizeText(value) {
    return String(value || '').trim();
  }

  function addEmbedMsg(text, role) {
    if (!embedMsgs) return null;
    var div = document.createElement('div');
    div.className = 'ai-embed-msg ai-embed-msg--' + (role === 'user' ? 'user' : 'bot');
    div.textContent = sanitizeText(text);
    embedMsgs.appendChild(div);
    embedMsgs.scrollTop = embedMsgs.scrollHeight;
    return div;
  }

  async function sendChatMessage(text) {
    if (!text || isSending || !embedMsgs || !embedInput) return;
    var userText = sanitizeText(text);
    if (!userText) return;

    isSending = true;
    embedInput.value = '';
    addEmbedMsg(userText, 'user');
    embedHistory.push({ role: 'user', content: userText });
    var typing = addEmbedMsg('Escribiendo…', 'bot');
    typing.classList.add('ai-embed-msg--typing');

    try {
      var response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages: embedHistory })
      });

      var data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Error al conectar con el asistente.');
      }

      var replyText = sanitizeText(data.reply || (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content));
      if (!replyText) {
        console.error('OpenAI response invalid:', data);
        throw new Error('La respuesta del asistente no es válida.');
      }

      embedHistory.push({ role: 'assistant', content: replyText });
      typing.classList.remove('ai-embed-msg--typing');
      typing.textContent = replyText;
      embedMsgs.scrollTop = embedMsgs.scrollHeight;
    } catch (error) {
      var message = (error && error.message) ? error.message : 'Error al conectar con el asistente.';
      typing.classList.remove('ai-embed-msg--typing');
      typing.textContent = '⚠️ ' + message;
      console.error('AI chat error:', error);
    } finally {
      isSending = false;
      if (embedMsgs) embedMsgs.scrollTop = embedMsgs.scrollHeight;
    }
  }

  if (embedSend && embedInput) {
    embedSend.addEventListener('click', function () {
      sendChatMessage(embedInput.value);
    });

    embedInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendChatMessage(embedInput.value);
      }
    });
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      sendChatMessage(chip.dataset.q || chip.textContent);
    });
  });
});
