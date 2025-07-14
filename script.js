document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("question");
  const chatContainer = document.getElementById("chat-container");

  // スクロール処理
  function scrollToBottom() {
    chatContainer.scrollTo({
      top: chatContainer.scrollHeight,
      behavior: "smooth"
    });
  }

  // タイピング風表示（1文字ずつ追加）
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

  // チャットメッセージを追加
  function appendMessage(sender, message, alignment) {
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
    } else {
      bubble.textContent = message;
    }
  }

  // 質問送信処理
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
      appendMessage("サポート", answer, "right");
    } catch (err) {
      console.error("通信エラー:", err);
      appendMessage("サポート", "エラーが発生しました。", "right");
    }
  }

  // Enterキーで送信
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      ask();
    }
  });

  // チャットを閉じる処理
  window.closeChat = function () {
    alert("チャットを閉じます（ここに閉じる処理を追加できます）");
  };
});
