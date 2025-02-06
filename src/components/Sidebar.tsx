import { IChat, IThreadChat } from "@/interfaces/chat";
import { useEffect, useState } from "react";
import { useChatContext } from "@/context/ChatContext";

const DB_NAME = import.meta.env.VITE_DB_NAME || "chatDB";
const DB_VERSION = Number(import.meta.env.VITE_DB_VERSION) || 1;
const STORE_NAME_CHATS = import.meta.env.VITE_STORE_NAME_CHATS || "chats";
const STORE_NAME_THREADS = import.meta.env.VITE_STORE_NAME_THREADS || "threads";

const Sidebar = () => {
  const [chats, setChats] = useState<IChat[]>([]);
  const { setChatUuid, hideSidebar, setHideSidebar, setMessages } =
    useChatContext();

  const handleHideSidebar = () => {
    setHideSidebar((prev) => !prev);
  };

  const handleNewChat = () => {
    setChatUuid("");
    setMessages([]);
  };

  const getChats = async () => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction([STORE_NAME_CHATS], "readonly");
      const store = transaction.objectStore(STORE_NAME_CHATS);
      const request = store.getAll();

      request.onsuccess = () => {
        setChats(request.result);
      };
    };
  };

  const getChatFromDB = async (chatUuid: string) => {
    const result: IThreadChat[] = await new Promise((resolve, reject) => {
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
    result.sort((a, b) => a.created_at.getTime() - b.created_at.getTime());
    setChatUuid(chatUuid);
    setMessages(result.map((thread) => thread.message));
  };

  useEffect(() => {
    getChats();
  }, []);

  return (
    <aside className={`[grid-area:aside]`}>
      <button
        className="rounded-md bg-slate-800 py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none ml-auto hidden sm:block"
        type="button"
        onClick={handleHideSidebar}
      >
        {hideSidebar ? "←" : "→"}
      </button>
      <select
        name="api"
        id="api"
        className="w-full border-2 border-gray-300 rounded-md p-2 dark:bg-gray-800 dark:text-white"
      >
        <option value="llama">LLama 3.3</option>
        <option value="deepseek">DeepSeek R1</option>
        <option value="financial-api">(Trained) Financial API</option>
      </select>
      {chats
        .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
        .map((chat) => (
          <option
            key={chat.id}
            value={chat.id}
            className="cursor-pointer"
            onClick={() => {
              getChatFromDB(chat.id);
            }}
          >
            {chat.id}
          </option>
        ))}

      <button onClick={handleNewChat}>New Chat</button>
    </aside>
  );
};

export default Sidebar;
