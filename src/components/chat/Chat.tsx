import { useChatContext } from "@/context/ChatContext";
import { useEffect, useRef } from "react";
import ChatOutput from "./ChatOutput";
import ChatInput from "./ChatInput";

export const Chat = () => {
  const { messages } = useChatContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <>
      <article className="flex flex-col gap-1 overflow-y-auto">
        {messages.map((item, index) => (
          <ChatOutput responseMessage={item} key={index} />
        ))}
        <div ref={messagesEndRef} />
      </article>
      <ChatInput />
    </>
  );
};
