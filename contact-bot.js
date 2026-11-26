(function () {
  'use strict';

  const panel = document.getElementById('contact-bot');
  const triggers = document.querySelectorAll('[data-bot-trigger]');
  const closeButton = document.getElementById('bot-close');
  const log = document.getElementById('bot-log');
  const form = document.getElementById('bot-form');
  const questionInput = document.getElementById('bot-question');
  const continueButton = document.getElementById('bot-continue');
  const contactName = document.getElementById('contact-name');
  const contactMessage = document.getElementById('contact-message');
  if (!panel || !triggers.length || !closeButton || !log || !form || !questionInput || !continueButton || !contactName || !contactMessage) return;

  const topics = {
    cloud: {
      label: 'Cloud & infrastructure',
      reply: 'We design and support cloud, on-prem and hybrid environments. Tell us about your current setup, preferred providers and reliability goals in the contact form.'
    },
    messaging: {
      label: 'Secure messaging',
      reply: 'We work on SMS gateways and OTP delivery systems. Share the countries, expected traffic and integrations you need so we can discuss a suitable approach.'
    },
    esim: {
      label: 'eSIM & web apps',
      reply: 'We can discuss inventory tools, reseller portals, ordering flows and custom web apps. Tell us which parts of the workflow you need to build or improve.'
    },
    pricing: {
      label: 'Pricing & timeline',
      reply: 'A quote and timeline depend on the scope. Send a short description, target date and budget range through the contact form, and the team can reply by email.'
    }
  };

  let selectedTopic = '';
  let lastQuestion = '';
  let lastTrigger = null;

  function addMessage(kind, message) {
    const item = document.createElement('p');
    item.className = 'bot-message bot-message-' + kind;
    item.textContent = message;
    log.appendChild(item);
    log.scrollTop = log.scrollHeight;
  }

  function setExpanded(expanded) {
    triggers.forEach(function (trigger) {
      trigger.setAttribute('aria-expanded', String(expanded));
    });
  }

  function close(restoreFocus) {
    panel.hidden = true;
    setExpanded(false);
    if (restoreFocus) {
      const focusTarget = lastTrigger && lastTrigger.getClientRects().length
        ? lastTrigger : document.getElementById('nav-toggle');
      if (focusTarget) focusTarget.focus();
    }
  }

  function open(trigger) {
    lastTrigger = trigger;
    panel.hidden = false;
    setExpanded(true);
    questionInput.focus();
  }

  function topicFor(question) {
    const text = question.toLowerCase();
    if (/price|pricing|cost|quote|budget|timeline|deadline|how long/.test(text)) return 'pricing';
    if (/sms|otp|message|messaging|gateway|jasmin/.test(text)) return 'messaging';
    if (/esim|sim card|telecom|website|web app|software|portal/.test(text)) return 'esim';
    if (/cloud|azure|gcp|server|network|infrastructure|office|docker/.test(text)) return 'cloud';
    return '';
  }

  triggers.forEach(function (trigger) {
    trigger.addEventListener('click', function (event) {
      event.preventDefault();
      if (panel.hidden) open(trigger);
      else close(true);
    });
  });

  closeButton.addEventListener('click', function () { close(true); });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !panel.hidden) {
      event.preventDefault();
      close(true);
    }
  });

  panel.querySelectorAll('[data-bot-topic]').forEach(function (button) {
    button.addEventListener('click', function () {
      selectedTopic = button.getAttribute('data-bot-topic');
      const topic = topics[selectedTopic];
      if (!topic) return;
      addMessage('visitor', topic.label);
      addMessage('assistant', topic.reply);
      questionInput.focus();
    });
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const question = questionInput.value.trim();
    if (!question) return;
    lastQuestion = question;
    addMessage('visitor', question);
    const match = topicFor(question);
    if (match) {
      selectedTopic = match;
      addMessage('assistant', topics[match].reply);
    } else if (/email|contact|reach you/.test(question.toLowerCase())) {
      addMessage('assistant', 'You can use the contact form below or email info@merkeisolutions.com. This guide does not send messages.');
    } else {
      addMessage('assistant', 'I can help with cloud infrastructure, secure messaging, eSIM and web apps. For a specific answer, add your question to the contact form and the team can reply by email.');
    }
    questionInput.value = '';
    questionInput.focus();
  });

  continueButton.addEventListener('click', function () {
    if (!contactMessage.value.trim()) {
      if (lastQuestion) contactMessage.value = 'I would like to ask: ' + lastQuestion;
      else if (selectedTopic) contactMessage.value = 'I would like to discuss ' + topics[selectedTopic].label.toLowerCase() + '.';
    }
    close(false);
    contactName.focus();
  });
})();
