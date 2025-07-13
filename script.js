document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("question");
  const chatContainer = document.getElementById("chat-container");

  // 共通のスクロール関数
  function scrollToBottom() {
  chatContainer.scrollTo({
    top: chatContainer.scrollHeight,
    behavior: "smooth"
  });
}

  // メッセージをチャットエリアに追加する関数
  function appendMessage(sender, message, alignment) {
    const messageHtml = `
      <div class="chat-message ${alignment}">
        <div class="label">${sender}</div>
        <div class="bubble ${alignment === 'left' ? 'user' : 'support'}">${message}</div>
      </div>
    `;
    chatContainer.insertAdjacentHTML('beforeend', messageHtml);
    scrollToBottom();
  }

  // メッセージ送信処理
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

      const data = await res.json();
      const answer = data.response || "申し訳ありません、回答を取得できませんでした。";

      appendMessage("サポート", answer, "right");

    } catch (err) {
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
});
