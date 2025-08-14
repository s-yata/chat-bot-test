const socket = new WebSocket("ws://localhost:8765");

const inputTextArea = document.getElementById("input-text-area");
const sendButton = document.getElementById("send-button");
const messages = document.querySelector('.messages');

// 接続が開いたとき
socket.addEventListener("open", () => {
  console.log("WebSocket: open: ", socket.url);
  socket.send("MySecretToken");
});

// メッセージ受信時
socket.addEventListener("message", (event) => {
  response = JSON.parse(event.data)
  console.log("WebSocket: message: ", response);

  // 新しいメッセージ要素を作成
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', 'other');
  messageDiv.innerHTML = `
    ${DOMPurify.sanitize(marked.parse(response.text))}
    <div class="timestamp">${new Date().toISOString()}</div>
`;
  // messageDiv.innerHTML = DOMPurify.sanitize(marked.parse(response.text));
  messages.appendChild(messageDiv);
  console.log(`append message other`);
});

// エラー
socket.addEventListener("error", (error) => {
  console.log("WebSocket: error: ", error);
});

// 接続が閉じたとき
socket.addEventListener("close", () => {
  console.log("WebSocket: close: ", socket.url);
});

// メッセージ送信関数（JSON形式）
function sendMessage() {
  const text = inputTextArea.value.trim();
  if (!text) {
    console.log("Empty text");
  } else if (socket.readyState !== WebSocket.OPEN) {
    console.log("Not connected");
  } else {
    const messageObject = {
      type: "chat",
      text: text,
      timestamp: new Date().toISOString()
    };
    socket.send(JSON.stringify(messageObject)); // JSON形式で送信
    console.log(`send: ${JSON.stringify(messageObject)}`);

    // 新しいメッセージ要素を作成
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', 'self');
    messageDiv.innerHTML = `
      ${DOMPurify.sanitize(marked.parse(text))}
      <div class="timestamp">${new Date().toISOString()}</div>
`;
    messages.appendChild(messageDiv);
    console.log(`append message self`);
  }
  inputTextArea.value = "";
  messages.scrollTop = messages.scrollHeight 
}

// ボタンで送信
sendButton.addEventListener("click", sendMessage);

// Enterキーで送信
inputTextArea.addEventListener("keypress", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});

// keyupで高さ調整
inputTextArea.addEventListener("keyup", (event) => {
  const target = event.target;
  target.style.height = "auto";
  target.style.height = (target.scrollHeight - 20) + "px";
});
