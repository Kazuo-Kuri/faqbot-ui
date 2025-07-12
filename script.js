document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("question");
  const chatContainer = document.getElementById("chat-container");

  async function ask() {
    const question = input.value.trim();
    if (!question) return;

    // ユーザーのメッセージを追加
    chatContainer.innerHTML += `
      <div class="chat-message left">
        <div class="label">ユーザー</div>
        <div class="bubble user">${question}</div>
      </div>
    `;
    input.value = "";

    try {
      const res = await fetch("https://faqbot-ngw3.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
      });

      const data = await res.json();
      const answer = data.response;

      // サポートのメッセージを追加
      chatContainer.innerHTML += `
        <div class="chat-message right">
          <div class="label">サポート</div>
          <div class="bubble support">${answer}</div>
        </div>
      `;
      chatContainer.scrollTop = chatContainer.scrollHeight;

    } catch (err) {
      chatContainer.innerHTML += `
        <div class="chat-message right">
          <div class="label">サポート</div>
          <div class="bubble support">エラーが発生しました。</div>
        </div>
      `;
    }
  }

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      ask();
    }
  });
});
