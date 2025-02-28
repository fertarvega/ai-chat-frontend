import { useChatContext } from "@/context/ChatContext";
import { getChats } from "@/helpers/getChats";
import { addIndexedDB } from "@/helpers/addIndexedDB";
import { IChat, IMessage, IThreadChat } from "@/interfaces/chat";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { streamingMessage } from "@/helpers/streamingMessage";

const ChatInput = () => {
  const { chatUuid, setChatUuid, messages, setMessages, setChats } =
    useChatContext();
  const [textInput, setTextInput] = useState("");

  const adjustTextareaHeight = (element: HTMLTextAreaElement) => {
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  };

  const saveMessage = async (
    message: IMessage,
    uuid: string
  ): Promise<void> => {
    const thread: IThreadChat = {
      id: uuidv4(),
      chatUuid: uuid,
      created_at: new Date(),
      message,
    };

    await addIndexedDB(thread, "thread");
  };

  const handleSubmit = async () => {
    let auxChatUuid = chatUuid;

    const userMessage: IMessage = {
      role: "user",
      content: textInput,
    };

    setTextInput("");
    const auxThread = [...messages];
    auxThread.push(userMessage);
    setMessages(auxThread);

    if (!auxChatUuid) {
      auxChatUuid = uuidv4();
      await createChat(auxChatUuid, userMessage);
    }

    try {
      await saveMessage(userMessage, auxChatUuid);
      await streamingMessage(
        textInput,
        auxChatUuid,
        auxThread,
        setMessages,
        saveMessage
      );
    } catch (error) {
      console.error("Error al guardar el mensaje:", error);
    }
  };

  const getChat = async () => {
    const chats = await getChats();
    setChats(chats);
  };

  const createChat = async (id: string, message: IMessage): Promise<void> => {
    setChatUuid(id);

    const response = await fetch("http://localhost:3000/chat/title", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: message.content,
      }),
    });

    const data = await response.json();

    const chat: IChat = {
      id: id,
      created_at: new Date(),
      topic: data.title,
    };

    await addIndexedDB(chat, "chat");
    getChat();
  };

  return (
    <section className="[grid-area:chat] flex justify-center">
      <article className="flex flex-col md:flex-row gap-2 max-w-[800px] w-full items-center">
        <textarea
          placeholder="Type a message for Llama 3.2."
          className="w-full border-2 border-gray-300 rounded-xl p-2 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-0 focus:border-blue-600 focus:ring-blue-500 min-h-[40px] max-h-[300px] overflow-y-auto resize-none"
          value={textInput}
          onChange={(e) => {
            setTextInput(e.target.value);
            adjustTextareaHeight(e.target);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          ref={(textarea) => {
            if (textarea) adjustTextareaHeight(textarea);
          }}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 h-16"
          onClick={handleSubmit}
        >
          Send
        </button>
      </article>
    </section>
  );
};

export default ChatInput;
