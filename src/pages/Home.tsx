import Chat from "@/components/chat/Chat";
import ChatOutput from "@/components/chat/ChatOutput";
import Sidebar from "@/components/Sidebar";
import { ChatMessage } from "@/interfaces/chat";
import "@/styles/main.css";
import { useState, useEffect, useRef } from "react";

const Home = () => {
  const [hideSidebar, setHideSidebar] = useState(false);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async () => {
    const auxHistory = [...history];
    auxHistory.push({ role: "user", content: message });
    setHistory(auxHistory);
    setMessage("");

    await handleSendMessage(auxHistory);
  };

  const handleSendMessage = async (auxHistory: ChatMessage[]) => {
    const response = await fetch("http://localhost:3000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: message }),
    });

    const reader = response?.body?.getReader();
    const decoder = new TextDecoder("utf-8");

    const index = auxHistory.length;
    let fullResponse = "";

    while (true) {
      if (!reader) break;
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      const jsonResponse = JSON.parse(chunk.replace("data: ", ""));

      fullResponse += jsonResponse.response;
      const auxFullResponseHistory = [...auxHistory];
      auxFullResponseHistory[index] = {
        role: "assistant",
        content: fullResponse,
      };
      setHistory(auxFullResponseHistory);
    }
  };

  const handleClear = async () => {
    setMessage("");
    setHistory([]);
    await fetch("http://localhost:3000/chat/reset", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [history]);

  return (
    <section className={`home-container ${hideSidebar ? "sidebar-open" : ""}`}>
      <Sidebar hideSidebar={hideSidebar} setHideSidebar={setHideSidebar} />
      <article className="flex flex-col gap-1 overflow-y-auto">
        {history.map((item, index) => (
          <ChatOutput responseMessage={item} key={index} />
        ))}
        <div ref={messagesEndRef} />
      </article>
      <Chat
        message={message}
        setMessage={setMessage}
        handleSubmit={handleSubmit}
        handleClear={handleClear}
      />
    </section>
  );
};

export default Home;
