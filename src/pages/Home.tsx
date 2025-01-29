import { useState, useEffect, useRef } from "react";
import "@/styles/main.css";
import Sidebar from "@/components/Sidebar";
import Chat from "@/components/chat/Chat";
import { IChat, IMessage, IThreadChat } from "@/interfaces/chat";
import { v4 as uuidv4 } from "uuid";
import ChatOutput from "@/components/chat/ChatOutput";
import { useChatReference } from "@/context/ChatReference";

const DB_NAME = import.meta.env.VITE_DB_NAME || "chatDB";
const DB_VERSION = Number(import.meta.env.VITE_DB_VERSION) || 1;
const STORE_NAME_CHATS = import.meta.env.VITE_STORE_NAME_CHATS || "chats";
const STORE_NAME_THREADS = import.meta.env.VITE_STORE_NAME_THREADS || "threads";

const Home = () => {
  const [hideSidebar, setHideSidebar] = useState(false);
  const [message, setMessage] = useState("");
  const [thread, setThread] = useState<IMessage[]>([]);
  const { chatUuid } = useChatReference();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const saveMessage = async (message: IMessage): Promise<void> => {
    if (!chatUuid) {
      return;
    }

    const checkChat = await checkIfChatExists(chatUuid);
    if (!checkChat) {
      return;
    }

    const thread: IThreadChat = {
      id: uuidv4(),
      chatUuid: chatUuid,
      created_at: new Date(),
      message,
    };

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error("Error al abrir la base de datos"));
      };

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction([STORE_NAME_THREADS], "readwrite");
        const store = transaction.objectStore(STORE_NAME_THREADS);
        const addRequest = store.add(thread);

        addRequest.onsuccess = () => {
          resolve();
        };

        addRequest.onerror = () => {
          reject(new Error("Error al guardar el mensaje"));
        };
      };
    });
  };

  const handleSubmit = async () => {
    const userMessage: IMessage = {
      role: "user",
      content: message,
    };

    setMessage("");
    const auxThread = [...thread];
    auxThread.push(userMessage);
    setThread(auxThread);
    handleSendMessage(auxThread);
    try {
      await saveMessage(userMessage);
    } catch (error) {
      console.error("Error al guardar el mensaje:", error);
    }
  };

  const handleSendMessage = async (auxHistory: IMessage[]) => {
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
      if (!reader) {
        console.log("No reader");
        break;
      }

      const { done, value } = await reader.read();

      if (done) {
        const assistantMessage: IMessage = {
          role: "assistant",
          content: fullResponse,
        };
        const auxFullResponseHistory = [...auxHistory];
        auxFullResponseHistory[index] = assistantMessage;
        setThread(auxFullResponseHistory);

        try {
          await saveMessage(assistantMessage);
        } catch (error) {
          console.error("Error al guardar la respuesta:", error);
        }
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      const jsonResponse = JSON.parse(chunk.replace("data: ", ""));

      fullResponse += jsonResponse.response;
      const auxFullResponseHistory = [...auxHistory];
      const assistantMessage: IMessage = {
        role: "assistant",
        content: fullResponse,
      };
      auxFullResponseHistory[index] = assistantMessage;
      setThread(auxFullResponseHistory);
    }
  };

  const checkIfChatExists = async (chatUuid: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onsuccess = async (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction([STORE_NAME_CHATS], "readonly");
        const store = transaction.objectStore(STORE_NAME_CHATS);
        const request = store.get(chatUuid);

        request.onsuccess = async () => {
          if (request.result === undefined) {
            await createChat(chatUuid);
            resolve(true);
          } else {
            resolve(true);
          }
        };

        request.onerror = () => {
          reject(new Error("Error al obtener los hilos"));
        };
      };
    });
  };

  const createChat = async (chatUuid: string): Promise<void> => {
    const chat: IChat = {
      id: chatUuid,
      created_at: new Date(),
      topic: chatUuid,
    };

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction([STORE_NAME_CHATS], "readwrite");
        const store = transaction.objectStore(STORE_NAME_CHATS);
        const addRequest = store.add(chat);

        addRequest.onsuccess = () => {
          resolve();
        };

        addRequest.onerror = () => {
          reject(new Error("Error al crear el chat"));
        };
      };
    });
  };

  const getThreadsByChat = (chatUuid: string): Promise<IThreadChat[]> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction([STORE_NAME_THREADS], "readonly");
        const store = transaction.objectStore(STORE_NAME_THREADS);
        const index = store.index("chatUuid");
        const request = index.getAll(chatUuid);

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          reject(new Error("Error al obtener los hilos"));
        };
      };
    });
  };

  useEffect(() => {
    const initDB = () => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (event) => {
        console.error("Error al abrir DB:", event);
      };

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME_CHATS)) {
          db.createObjectStore(STORE_NAME_CHATS, {
            keyPath: "id",
          });
        }
        if (!db.objectStoreNames.contains(STORE_NAME_THREADS)) {
          const threadStore = db.createObjectStore(STORE_NAME_THREADS, {
            keyPath: "id",
          });
          threadStore.createIndex("chatUuid", "chatUuid", { unique: false });
          // threadStore.createIndex("created_at", "created_at", {
          //   unique: false,
          // });
        }
      };

      request.onsuccess = async (event) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const db = (event.target as IDBOpenDBRequest).result;
      };
    };

    initDB();
  }, []);

  useEffect(() => {
    const getChat = async () => {
      if (!chatUuid) {
        return;
      }

      const checkChat = await checkIfChatExists(chatUuid);
      if (!checkChat) {
        return;
      }

      const threads = await getThreadsByChat(chatUuid);
      threads.sort((a, b) => a.created_at.getTime() - b.created_at.getTime());
      setThread(threads.map((thread) => thread.message));
    };
    getChat();
  }, [chatUuid]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [thread]);

  return (
    <section className={`home-container ${!hideSidebar ? "sidebar-open" : ""}`}>
      <Sidebar hideSidebar={hideSidebar} setHideSidebar={setHideSidebar} />
      <article className="flex flex-col gap-1 overflow-y-auto">
        {thread.map((item, index) => (
          <ChatOutput responseMessage={item} key={index} />
        ))}
        <div ref={messagesEndRef} />
      </article>
      <Chat
        message={message}
        setMessage={setMessage}
        handleSubmit={handleSubmit}
      />
    </section>
  );
};

export default Home;
