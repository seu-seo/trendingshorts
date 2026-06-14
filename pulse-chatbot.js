/**
 * Pulse Chatbot — 떼다 붙이는 챗봇 엔진
 * --------------------------------------------------
 * 사용법:
 *   1) HTML에 빈 컨테이너를 둔다:  <div id="chatbot"></div>
 *   2) 이 파일을 불러온다:        <script src="pulse-chatbot.js"></script>
 *   3) 설정(JSON)을 넘겨 실행한다:
 *
 *      // (A) JSON 파일을 fetch 해서 쓰는 경우 — 웹서버 환경 권장
 *      PulseChatbot.mountFromUrl('#chatbot', 'pulse-chatbot.json', {
 *        onComplete: (answers) => console.log('답변:', answers)
 *      });
 *
 *      // (B) JSON을 직접 넣어 쓰는 경우 — file:// 로 그냥 열어도 작동
 *      PulseChatbot.mount('#chatbot', CONFIG_OBJECT, {
 *        onComplete: (answers) => console.log('답변:', answers)
 *      });
 *
 *  onComplete(answers): 모든 질문이 끝나면 호출됨.
 *    answers = [{ category, question, answer }, ...]
 */
window.PulseChatbot = (function () {
  var STYLE_ID = 'pulse-chatbot-styles';

  function injectStyles(theme) {
    if (document.getElementById(STYLE_ID)) return; // 한 번만 주입
    var css = `
      .pc-root {
        --pc-bg: ${theme.bg};
        --pc-primary: ${theme.primary};
        --pc-ink: ${theme.ink};
        --pc-ink-muted: ${theme.inkMuted};
        --pc-line: ${theme.line};
        --pc-user-text: ${theme.userBubbleText};
        display: flex;
        flex-direction: column;
        height: 100%;
        background: var(--pc-bg);
        color: var(--pc-ink);
        font-family: 'Instrument Sans', 'Pretendard', -apple-system, sans-serif;
        box-sizing: border-box;
      }
      .pc-root *, .pc-root *::before, .pc-root *::after { box-sizing: border-box; }

      .pc-scroll {
        flex: 1;
        overflow-y: auto;
        padding: 20px 20px 8px;
        display: flex;
        flex-direction: column;
      }
      .pc-messages { display: flex; flex-direction: column; gap: 8px; }

      .pc-step-label {
        display: flex; align-items: center; gap: 10px;
        margin: 24px 0 8px 0;
      }
      .pc-step-badge, .pc-step-name {
        font-size: 9px; font-family: 'JetBrains Mono', monospace;
        color: var(--pc-ink-muted); letter-spacing: 0.16em; text-transform: uppercase;
      }

      .pc-bot-row { display: flex; align-self: flex-start; width: 100%; }

      .pc-bubble {
        padding: 12px 16px; font-size: 14px; line-height: 1.7;
        word-break: keep-all; animation: pcBubbleIn 0.18s ease; position: relative;
      }
      @keyframes pcBubbleIn {
        from { opacity: 0; transform: translateY(6px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .pc-bubble.bot {
        background: transparent; border-left: 2px solid var(--pc-primary);
        color: var(--pc-ink); padding: 10px 0 10px 16px; width: 100%;
      }
      .pc-bubble.user {
        background: var(--pc-primary); color: var(--pc-user-text);
        align-self: flex-end; border-radius: 3px; margin-left: auto;
        max-width: 78%; font-weight: 500; padding: 10px 14px;
      }
      .pc-hint { font-size: 11px; color: var(--pc-ink-muted); margin-top: 6px; letter-spacing: 0.01em; }

      .pc-typing {
        display: flex; align-items: center; gap: 5px;
        padding: 14px 0 14px 16px; border-left: 2px solid var(--pc-primary); width: 100%;
      }
      .pc-typing span {
        width: 14px; height: 2px; background: var(--pc-ink-muted);
        animation: pcType 1.4s infinite;
      }
      .pc-typing span:nth-child(2) { animation-delay: 0.22s; }
      .pc-typing span:nth-child(3) { animation-delay: 0.44s; }
      @keyframes pcType {
        0%, 60%, 100% { opacity: 0.2; transform: scaleX(1); }
        30% { opacity: 1; transform: scaleX(1.5); }
      }

      .pc-input-bar {
        display: flex; align-items: flex-end; gap: 12px;
        padding: 14px 20px 18px; border-top: 1px solid var(--pc-line);
        background: var(--pc-bg); flex-shrink: 0;
      }
      .pc-input {
        flex: 1; background: transparent; border: none;
        border-bottom: 1px solid var(--pc-line); padding: 6px 0 8px;
        font-size: 14px; color: var(--pc-ink); resize: none;
        font-family: inherit; max-height: 96px; overflow-y: auto;
        line-height: 1.5; outline: none; transition: border-color 0.15s;
      }
      .pc-input:focus { border-bottom-color: var(--pc-primary); }
      .pc-input::placeholder { color: var(--pc-ink-muted); }
      .pc-send {
        width: 36px; height: 36px; border-radius: 3px;
        background: var(--pc-primary); color: var(--pc-user-text);
        border: none; cursor: pointer; display: flex;
        align-items: center; justify-content: center; flex-shrink: 0;
        transition: opacity 0.15s;
      }
      .pc-send:active { opacity: 0.75; }
      .pc-send:disabled { opacity: 0.3; cursor: default; }
    `;
    var styleEl = document.createElement('style');
    styleEl.id = STYLE_ID;
    styleEl.textContent = css;
    document.head.appendChild(styleEl);
  }

  function el(tag, cls, html) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (html != null) node.innerHTML = html;
    return node;
  }

  function mount(targetSelector, config, options) {
    options = options || {};
    var theme = Object.assign({
      bg: '#050507', primary: '#C8FF57', ink: '#ECEDEE',
      inkMuted: '#8A8A92', line: '#2A2A30', userBubbleText: '#0a0a0a'
    }, config.theme || {});
    injectStyles(theme);

    var root = typeof targetSelector === 'string'
      ? document.querySelector(targetSelector) : targetSelector;
    if (!root) { console.error('[PulseChatbot] 대상 요소를 찾을 수 없어요:', targetSelector); return; }

    var questions = config.questions || [];
    var messages = config.messages || {};
    var answers = [];
    var step = 0;

    // --- UI 골격 ---
    root.classList.add('pc-root');
    root.innerHTML = '';
    var scroll = el('div', 'pc-scroll');
    var msgWrap = el('div', 'pc-messages');
    scroll.appendChild(msgWrap);

    var inputBar = el('div', 'pc-input-bar');
    var input = el('textarea', 'pc-input');
    input.rows = 1;
    input.placeholder = config.inputPlaceholder || '여기에 입력하세요…';
    var sendBtn = el('button', 'pc-send',
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>');
    inputBar.appendChild(input);
    inputBar.appendChild(sendBtn);

    root.appendChild(scroll);
    root.appendChild(inputBar);

    function scrollBottom() {
      setTimeout(function () { scroll.scrollTop = scroll.scrollHeight; }, 60);
    }

    function botSay(text, onDone) {
      var typingRow = el('div', 'pc-bot-row');
      var typing = el('div', 'pc-typing', '<span></span><span></span><span></span>');
      typingRow.appendChild(typing);
      msgWrap.appendChild(typingRow);
      scrollBottom();
      setTimeout(function () {
        msgWrap.removeChild(typingRow);
        var row = el('div', 'pc-bot-row');
        var bubble = el('div', 'pc-bubble bot');
        bubble.textContent = text;
        row.appendChild(bubble);
        msgWrap.appendChild(row);
        scrollBottom();
        if (onDone) onDone();
      }, 700);
    }

    function ask(i) {
      var q = questions[i];
      var label = el('div', 'pc-step-label',
        '<span class="pc-step-badge">' + (i + 1) + ' / ' + questions.length + '</span>' +
        '<span class="pc-step-name">' + q.category + '</span>');
      msgWrap.appendChild(label);

      var typingRow = el('div', 'pc-bot-row');
      typingRow.appendChild(el('div', 'pc-typing', '<span></span><span></span><span></span>'));
      msgWrap.appendChild(typingRow);
      scrollBottom();

      setTimeout(function () {
        msgWrap.removeChild(typingRow);
        var row = el('div', 'pc-bot-row');
        var bubble = el('div', 'pc-bubble bot');
        bubble.innerHTML = escapeHtml(q.q) +
          (q.hint ? '<div class="pc-hint">' + escapeHtml(q.hint) + '</div>' : '');
        row.appendChild(bubble);
        msgWrap.appendChild(row);
        input.placeholder = q.placeholder || '';
        input.focus();
        scrollBottom();
      }, 700);
    }

    function send() {
      var val = input.value.trim();
      if (!val) return;
      var userBubble = el('div', 'pc-bubble user');
      userBubble.textContent = val;
      msgWrap.appendChild(userBubble);

      answers.push({
        category: questions[step].category,
        question: questions[step].q,
        answer: val
      });

      input.value = '';
      input.style.height = 'auto';
      step++;
      scrollBottom();

      if (step < questions.length) {
        setTimeout(function () { ask(step); }, 400);
      } else {
        setTimeout(function () {
          botSay(messages.complete || '완벽해요!', function () {
            inputBar.style.display = 'none';
            if (typeof options.onComplete === 'function') options.onComplete(answers);
          });
        }, 400);
      }
    }

    function escapeHtml(s) {
      return String(s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    sendBtn.addEventListener('click', send);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
    });
    input.addEventListener('input', function () {
      input.style.height = 'auto';
      input.style.height = Math.min(96, input.scrollHeight) + 'px';
    });

    // --- 시작 ---
    setTimeout(function () {
      botSay(messages.intro || '안녕하세요!', function () {
        setTimeout(function () { ask(0); }, 300);
      });
    }, 400);

    return { reset: function () { mount(targetSelector, config, options); } };
  }

  function mountFromUrl(targetSelector, url, options) {
    return fetch(url)
      .then(function (r) { return r.json(); })
      .then(function (config) { return mount(targetSelector, config, options); })
      .catch(function (e) {
        console.error('[PulseChatbot] JSON 로드 실패:', e,
          '\nfile:// 로 직접 열면 fetch가 막힐 수 있어요. 그땐 mount()에 JSON을 직접 넘기세요.');
      });
  }

  return { mount: mount, mountFromUrl: mountFromUrl };
})();
