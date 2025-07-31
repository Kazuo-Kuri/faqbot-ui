// 回答を1文字ずつ表示する関数
function typeText(text, element, callback) {
  let i = 0;
  const interval = setInterval(() => {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
    } else {
      clearInterval(interval);
      if (callback) callback();
    }
  }, 10);
}

typeText(response, answerElement, () => {
  makeLinksOpenInNewTab("chat-area"); // ← chat-areaに変更（必要に応じて）
});

function makeLinksOpenInNewTab(containerId = "chat-area") {
  const container = document.getElementById(containerId);
  if (!container) return;
  const links = container.querySelectorAll("a");
  links.forEach(link => {
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
  });
}

// script.js・・inWidthの処理を含む
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("question");
  const chatContainer = document.getElementById("chat-container");
  const spinner = document.getElementById("loading-spinner");
  const md = window.markdownit({ breaks: true, html: false });
  const sendButton = document.getElementById("send-button");
  restoreChatHistory();
    
  // チャット履歴を復元
  function restoreChatHistory() {
    const chatLog = document.getElementById('chat-container');
    const history = localStorage.getItem('chatHistory');
    if (history) {
      JSON.parse(history).forEach(entry => {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = entry.html;
        chatLog.appendChild(wrapper.firstElementChild);
      });
    }
  }
    
  sendButton.addEventListener("click", () => {
    ask();
    setTimeout(saveChatHistory, 100); // レスポンス後に履歴を保存
  });
    
  function scrollToBottom() {
    chatContainer.scrollTo({
      top: chatContainer.scrollHeight,
      behavior: "auto"
    });
  }

  function appendMessage(sender, message, alignment, originalQuestion = null) {
    const messageWrapper = document.createElement("div");
    messageWrapper.className = `chat-message ${alignment}`;

    const label = document.createElement("div");
    label.className = "label";
    label.textContent = sender;

    const bubble = document.createElement("div");
    bubble.className = `bubble ${alignment === "left" ? "user" : "support"}`;

    messageWrapper.appendChild(label);
    messageWrapper.appendChild(bubble);
    chatContainer.appendChild(messageWrapper);
    scrollToBottom();

    bubble.innerHTML = md.render(message);
    if (alignment === "right") {
      addFeedbackButtons(messageWrapper, originalQuestion, message);
    }
  }

  function addFeedbackButtons(container, question, answer) {
    const feedbackDiv = document.createElement("div");
    feedbackDiv.className = "feedback-buttons";
    feedbackDiv.style.marginTop = "0.5em";
    feedbackDiv.style.fontSize = "0.85em";

    feedbackDiv.innerHTML = `
      <div style="margin-bottom: 0.2em; color: #666;">この回答は参考になりましたか？</div>
      <div style="display: flex; gap: 0.5em; justify-content: flex-end;">
        <button class="feedback-btn" data-feedback="useful" style="background: transparent; border: 1px solid #ccc; border-radius: 6px; padding: 2px 8px; cursor: pointer; color: #666;">はい</button>
        <button class="feedback-btn" data-feedback="not_useful" style="background: transparent; border: 1px solid #ccc; border-radius: 6px; padding: 2px 8px; cursor: pointer; color: #666;">いいえ</button>
      </div>
    `;
    container.appendChild(feedbackDiv);
    scrollToBottom();

    const buttons = feedbackDiv.querySelectorAll(".feedback-btn");
    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        const feedback = btn.dataset.feedback;
        if (feedback === "useful") {
          sendFeedback(question, answer, feedback, "");
          feedbackDiv.innerHTML = "ご協力ありがとうございました。";
        } else {
          showFeedbackReasonForm(feedbackDiv, question, answer);
        }
      });
    });
  }

  function showFeedbackReasonForm(container, question, answer) {
    container.innerHTML = `
      <label for="reason-input" style="font-size: 0.8em; color: #666;">よろしければ理由をお聞かせください（任意）</label>
      <textarea id="reason-input" rows="2" placeholder="例：内容が質問とずれていた、説明がわかりづらかったなど" style="width: 100%; margin-top: 4px; border-radius: 4px; border: 1px solid #ccc; padding: 4px;"></textarea>
      <button id="submit-reason" style="margin-top: 4px; padding: 4px 8px; border-radius: 4px; cursor: pointer;">送信</button>
    `;

    scrollToBottom();

    const submitButton = container.querySelector("#submit-reason");
    submitButton.addEventListener("click", () => {
      const reason = container.querySelector("#reason-input").value.trim();
      if (reason === "") {
        alert("理由を入力してください。");
        return;
      }
      sendFeedback(question, answer, "not_useful", reason);
      container.innerHTML = "ご協力ありがとうございました。";
      scrollToBottom();
    });
  }

  function sendFeedback(question, answer, feedback, reason) {
    const payload = { question, answer, feedback, reason };
    console.log("フィードバック送信:", payload);

    fetch("https://faqbot-ngw3.onrender.com/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        console.log("フィードバック結果:", data);
      })
      .catch(err => {
        console.error("フィードバック送信エラー:", err);
      });
  }

  async function ask() {
    const question = input.value.trim();
    if (!question) return;

    appendMessage("ユーザー", question, "left");
    input.value = "";
    spinner.style.display = "block";

    try {
      const res = await fetch("https://faqbot-ngw3.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
      });

      if (!res.ok) throw new Error("Network error");

      const data = await res.json();
      const answer = data.response?.trim() || "申し訳ありませんが、回答を取得できませんでした。";
      appendMessage("サポート", answer, "right", question);
    } catch (err) {
      console.error("通信エラー:", err);
      appendMessage("サポート", "通信エラーが発生しました。", "right", question);
    } finally {
      spinner.style.display = "none";
    }
  }

  window.closeChat = function () {
    alert("チャットを閉じる処理は未実装です。今後のアップデートをお待ちください。");
  };
});

// チャット履歴の保存
function saveChatHistory() {
  const chatLog = document.getElementById('chat-container');
  const messages = Array.from(chatLog.querySelectorAll('.chat-message')).map(el => {
    const type = el.classList.contains('left') ? 'user' : 'bot';
    const html = el.outerHTML; 
    return { type, html };
  });
  localStorage.setItem('chatHistory', JSON.stringify(messages));
}

// チャット履歴のクリア（初期化）
function clearChatHistory() {
  localStorage.removeItem('chatHistory');
  document.getElementById('chat-container').innerHTML = '';
}
