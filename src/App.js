import React, { useEffect, useRef, useState } from "react";
import { clearChatHistory, userTurn } from "./utils/core";

const ChatApp = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    try {
      const reply = await userTurn(input);
      setInput("");
      const assistantMessage = { role: "assistant", content: reply };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>🛍️ Fashion Assistant</h2>
      <div style={styles.chatBox}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              ...styles.message,
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              backgroundColor: msg.role === "user" ? "#DCF8C6" : "#F1F0F0",
            }}
          >
            <div style={styles.sender}>
              {msg.role === "user" ? "You" : "Assistant"}
            </div>
            <div>{msg.content}</div>
          </div>
        ))}
        {loading && (
          <div style={styles.typing}>Assistant is typing...</div>
        )}
        <div ref={scrollRef}></div>
      </div>
      <div style={styles.inputArea}>
        <input
          style={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type your vibe (e.g., something fun for summer brunch)"
        />
        <button onClick={sendMessage} style={styles.sendButton}>
          Send
        </button>
        <button onClick={() => {clearChatHistory(); setMessages([]);}} style={styles.clearButton}>
          Clear
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "sans-serif",
    padding: 20,
    maxWidth: 600,
    margin: "auto",
  },
  heading: {
    textAlign: "center",
    color: "#333",
    marginBottom: 20,
  },
  chatBox: {
    border: "1px solid #ddd",
    borderRadius: 10,
    padding: 15,
    height: 450,
    overflowY: "auto",
    backgroundColor: "#fafafa",
    display: "flex",
    flexDirection: "column",
  },
  message: {
    padding: "10px 15px",
    borderRadius: 12,
    marginBottom: 10,
    maxWidth: "75%",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  sender: {
    fontSize: "0.75rem",
    color: "#777",
    marginBottom: 4,
  },
  typing: {
    fontStyle: "italic",
    color: "#666",
    marginBottom: 10,
  },
  inputArea: {
    display: "flex",
    gap: 10,
    marginTop: 10,
  },
  input: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    border: "1px solid #ccc",
    fontSize: 16,
  },
  sendButton: {
    padding: "10px 16px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },
  clearButton: {
    padding: "10px 16px",
    backgroundColor: "#f44336",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },
};

export default ChatApp;
