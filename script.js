document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("question");
  const chatContainer = document.getElementById("chat-container");

  // ユーティリティ：スクロール
  function scrollToBottom() {
    chatContainer.scrollTo({
      top: chatContainer.scrollHeight,
      behavior: "smooth"
    });
  }

  // タイピング風の表示（サポート側）
  function typeText(element, text, speed = 30) {
    let index = 0;
    function showNextChar() {
      if (index < text.length) {
        element.innerHTML += text.charAt(index);
        index++;
        scrollToBottom();
        setTimeout(showNextChar, speed);
      }
    }
    showNextChar();
  }

  // チャットメッセージの追加
  function appendMessage(sender, message, alignment) {
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

      if (!res.ok) throw new Error("Network response was not ok");

      const data = await res.json();
      const answer = data.response?.trim() || "申し訳ありません、回答を取得できませんでした。";
      appendMessage("サポート", answer, "right");

    } catch (err) {
      console.error("エラー:", err);
      appendMessage("サポート", "エラーが発生しました。", "right");
    }
  }

  // Enterキーで送信
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      ask
