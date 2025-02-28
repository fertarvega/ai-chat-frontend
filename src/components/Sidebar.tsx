import { IThreadChat } from "@/interfaces/chat";
import { useEffect } from "react";
import { useChatContext } from "@/context/ChatContext";
import {
  DB_VERSION,
  DB_NAME,
  STORE_NAME_CHATS,
  STORE_NAME_THREADS,
} from "@/helpers/constsDatabase";

const Sidebar = () => {
  const { chats, setChats, setChatUuid, setMessages } = useChatContext();

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

    return result;
  };

  const deleteChatFromDB = async (uuid: string) => {
    try {
      // 💥
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });

      const transaction = db.transaction(
        [STORE_NAME_CHATS, STORE_NAME_THREADS],
        "readwrite"
      );
      const chatStore = transaction.objectStore(STORE_NAME_CHATS);
      const threadStore = transaction.objectStore(STORE_NAME_THREADS);

      chatStore.delete(uuid);

      const threadIndex = threadStore.index("chatUuid");
      const threadRequest = threadIndex.getAllKeys(uuid);

      threadRequest.onsuccess = () => {
        const keys = threadRequest.result;
        keys.forEach((key) => threadStore.delete(key));
      };

      return new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => {
          fetch(`http://localhost:3000/chat/delete?uuid=${uuid}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }).then((res) => {
            if (!res.ok) {
              throw new Error("Fallo el delete en la bd");
            }
            handleNewChat();
            getChats();
            resolve();
          });
        };
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (error) {
      console.error("Error deleting chat:", error);
      throw error;
    }
  };

  useEffect(() => {
    getChats();
  }, []);

  return (
    <aside
      className={`[grid-area:aside] flex flex-col border-r border-gray-300 pr-2`}
    >
      <button
        className="bg-blue-600 text-white p-2 rounded-xl w-full hover:bg-blue-700"
        onClick={handleNewChat}
      >
        New Chat
      </button>
      {chats
        .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
        .map((chat) => (
          <div
            key={chat.id}
            className="cursor-pointer flex justify-between items-center w-full py-1 px-2 rounded-xl hover:bg-gray-700 dark:hover:bg-gray-800 group"
            onClick={() => {
              getChatFromDB(chat.id);
            }}
            title={chat.topic}
          >
            <p className="truncate">{chat.topic}</p>
            <img
              src="/icon-bin.svg"
              alt="trash"
              className="w-6 h-6 cursor-pointer hover:bg-red-900 rounded-xl hidden group-hover:block p-1"
              onClick={(e) => {
                e.stopPropagation();
                deleteChatFromDB(chat.id);
              }}
            />
          </div>
        ))}
    </aside>
  );
};

export default Sidebar;
