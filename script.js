// ✅ script.js（行ごと・左から右に自然に流れる表示 + 入力欄修正）
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("question");
  const chatContainer = document.getElementById("chat-container");
  const spinner = document.getElementById("loading-spinner");
  const md = window.markdownit({ breaks: true, linkify: true });

  function scrollToBottom() {
    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });
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

    if (alignment === "right") {
      typeLinesSequentially(bubble, message, originalQuestion, messageWrapper);
    } else {
      bubble.textContent = message;
    }
  }

  async function typeLinesSequentially(container, fullMessage, originalQuestion, messageWrapper) {
    const lines = fullMessage.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const lineEl = document.createElement("div");
      container.appendChild(lineEl);
      await typeLine(lineEl, lines[i]);
    }

    addFeedbackButtons(messageWrapper, originalQuestion, fullMessage);
    scrollToBottom();
  }

  function typeLine(el, text, delay = 25) {
    return new Promise(resolve => {
      let i = 0;
      const interval = setInterval(() => {
        el.innerHTML += text[i];
        i++;
        if (i >= text.length) {
          clearInterval(interval);
          el.innerHTML = md.renderInline(el.textContent);
          resolve();
        }
      }, delay);
    });
  }

  function addFeedbackButtons(container, question, answer) {
    const feedbackDiv = document.createElement("div");
    feedbackDiv.className = "feedback-buttons";
    feedbackDiv.style.marginTop = "0.5em";
    feedbackDiv.style.fontSize = "0.85em";

    feedbackDiv.innerHTML = `
      <div style="margin-bottom: 0.2em; color: #666;">この回答は役に立ちましたか？</div>
      <div style="display: flex; gap: 0.5em; justify-content: flex-end;">
        <button class="feedback-btn" data-feedback="useful">👍 はい</button>
        <button class="feedback-btn" data-feedback="not_useful">👎 いいえ</button>
      </div>
    `;
    container.appendChild(feedbackDiv);
    scrollToBottom();

    feedbackDiv.querySelectorAll(".feedback-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const feedback = btn.dataset.feedback;
        if (feedback === "useful") {
          sendFeedback(question, answer, feedback, "");
          feedbackDiv.innerHTML = "フィードバックありがとうございました！";
        } else {
          showFeedbackReasonForm(feedbackDiv, question, answer);
        }
      });
    });
  }

  function showFeedbackReasonForm(container, question, answer) {
    container.innerHTML = `
      <label for="reason-input">差し支えなければ、理由を教えてください：</label>
      <textarea id="reason-input" rows="2" placeholder="例：情報が古い、質問と違う内容だった等"></textarea>
      <button id="submit-reason">送信</button>
    `;

    container.querySelector("#submit-reason").addEventListener("click", () => {
      const reason = container.querySelector("#reason-input").value.trim();
      if (!reason) return alert("理由を入力してください。")
      sendFeedback(question, answer, "not_useful", reason);
      container.innerHTML = "フィードバックありがとうございました！";
    });
  }

  function sendFeedback(question, answer, feedback, reason) {
    fetch("https://faqbot-ngw3.onrender.com/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, answer, feedback, reason })
    }).then(res => res.json()).then(data => {
      console.log("フィードバック送信成功:", data);
    }).catch(err => {
      console.error("送信エラー:", err);
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

      const data = await res.json();
      const answer = data.response?.trim() || "申し訳ありません、回答を取得できませんでした。";
      appendMessage("サポート", answer, "right", question);
    } catch (err) {
      console.error("通信エラー:", err);
      appendMessage("サポート", "エラーが発生しました。", "right", question);
    } finally {
      spinner.style.display = "none";
    }
  }

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      ask();
    }
  });

  window.closeChat = function () {
    alert("チャットを閉じます（ここに閉じる処理を追加）");
  };
});
