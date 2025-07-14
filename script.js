document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("question");
  const chatContainer = document.getElementById("chat-container");

  function scrollToBottom() {
    chatContainer.scrollTo({
      top: chatContainer.scrollHeight,
      behavior: "smooth"
    });
  }

  function typeText(element, text, speed = 60) {
    let index = 0;
    function showNextChar() {
      if (index < text.length) {
        element.textContent += text.charAt(index);
        index++;
        scrollToBottom();
        setTimeout(showNextChar, speed);
      }
    }
    showNextChar();
  }

  function appendMessage(sender, message, alignment, originalQuestion = null) {
    const messageWrapper = document.createElement("div");
    messageWrapper.className = `chat-message ${alignment}`;

    const label = document.createElement("div");
    label.className = "label";
    label.textContent = sender;

    const bubble = document.createElement("div");
    bubble.className = `bubble ${alignment === "left" ? "user" : "support"}`;

    if (alignment === "right") {
      bubble.style.minWidth = "70%";
      bubble.style.minHeight = "1.5em";
    }

    messageWrapper.appendChild(label);
    messageWrapper.appendChild(bubble);
    chatContainer.appendChild(messageWrapper);
    scrollToBottom();

    if (alignment === "right") {
      typeText(bubble, message);
      addFeedbackButtons(messageWrapper, originalQuestion, message);
    } else {
      bubble.textContent = message;
    }
  }

  function addFeedbackButtons(container, question, answer) {
    const feedbackDiv = document.createElement("div");
    feedbackDiv.className = "feedback-buttons";
    feedbackDiv.innerHTML = `
      この回答は役に立ちましたか？　
      <button class="feedback-btn" data-feedback="useful">👍 はい</button>
      <button class="feedback-btn" data-feedback="not_useful">👎 いいえ</button>
    `;
    container.appendChild(feedbackDiv);

    const buttons = feedbackDiv.querySelectorAll(".feedback-btn");
    buttons.forEach(btn => {
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
      <textarea id="reason-input" rows="2" placeholder="例：情報が古かった、質問と違う内容だった など"></textarea>
      <button id="submit-reason">送信</button>
    `;
    const submitButton = container.querySelector("#submit-reason");
    submitButton.addEventListener("click", () => {
      const reason = container.querySelector("#reason-input").value.trim();
      sendFeedback(question, answer, "not_useful", reason);
      container.innerHTML = "フィードバックありがとうございました！";
    });
  }

  function sendFeedback(question, answer, feedback, reason) {
    fetch("https://script.google.com/macros/s/AKfycbwZTA7HfylzjK2ovPzUjlOBrHZaCpae6ZHZM5C93tMEy0zzHSE-WrvV2-tajuJZP0Lj/exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: question,
        answer: answer,
        feedback: feedback,
        reason: reason
      })
    });
  }

  async function ask() {
    const question = input.value.trim();
    if (!question) return;

    appendMessage("ユーザー", question, "left");
    input.value = "";

    try {
      const res = await fetch("https://faqbot-ngw3.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
      });

      if (!res.ok) throw new Error("Network error");

      const data = await res.json();
      const answer = data.response?.trim() || "申し訳ありません、回答を取得できませんでした。";
      appendMessage("サポート", answer, "right", question);
    } catch (err) {
      console.error("通信エラー:", err);
      appendMessage("サポート", "エラーが発生しました。", "right", question);
    }
  }

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      ask();
    }
  });

  window.closeChat = function () {
    alert("チャットを閉じます（ここに閉じる処理を追加できます）");
  };
});
