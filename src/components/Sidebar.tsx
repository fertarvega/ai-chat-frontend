import { IChat, IThreadChat } from "@/interfaces/chat";
import { useEffect, useState, useRef } from "react";
import { useChatContext } from "@/context/ChatContext";

const DB_NAME = import.meta.env.VITE_DB_NAME || "chatDB";
const DB_VERSION = Number(import.meta.env.VITE_DB_VERSION) || 1;
const STORE_NAME_CHATS = import.meta.env.VITE_STORE_NAME_CHATS || "chats";
const STORE_NAME_THREADS = import.meta.env.VITE_STORE_NAME_THREADS || "threads";

const Sidebar = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    chats,
    setChats,
    setChatUuid,
    hideSidebar,
    setHideSidebar,
    setMessages,
    chatUuid,
  } = useChatContext();

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

    return result;
  };

  useEffect(() => {
    getChats();
  }, []);

  const handleDownloadJSON = async () => {
    const data = await getChatFromDB(chatUuid);
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-history.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleUploadJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const jsonData = JSON.parse(event.target?.result as string);
          console.log("JSON:", jsonData);

          // Guardar en IndexedDB
          const request = indexedDB.open(DB_NAME, DB_VERSION);

          request.onsuccess = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            const transaction = db.transaction(
              [STORE_NAME_THREADS],
              "readwrite"
            );
            const store = transaction.objectStore(STORE_NAME_THREADS);

            // Insertar todos los registros en una sola transacción
            jsonData.forEach((thread: IThreadChat) => {
              store.add(thread);
            });

            transaction.oncomplete = () => {
              console.log("Todos los registros guardados exitosamente");
              setMessages(
                jsonData.map((thread: IThreadChat) => thread.message)
              );
              setChatUuid(jsonData[0]?.chatUuid);
            };

            transaction.onerror = (error) => {
              console.error("Error al guardar los registros:", error);
            };
          };
        } catch (error) {
          console.error(error);
        }
      };

      reader.readAsText(file);
      e.target.value = "";
    }
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
            method: "GET",
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

  return (
    <aside className={`[grid-area:aside]`}>
      <button
        className="rounded-md bg-slate-800 py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none ml-auto hidden sm:block"
        type="button"
        onClick={handleHideSidebar}
      >
        {hideSidebar ? "←" : "→"}
      </button>
      {chats
        .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
        .map((chat) => (
          <div
            key={chat.id}
            className="cursor-pointer flex text-nowrap py-2"
            onClick={() => {
              getChatFromDB(chat.id);
            }}
          >
            <p>{chat.id.slice(0, 25)}...</p>
            <button
              className="bg-red-500 px-2 ml-2"
              onClick={(e) => {
                e.stopPropagation();
                deleteChatFromDB(chat.id);
              }}
            >
              X
            </button>
          </div>
        ))}

      <button onClick={handleNewChat}>New Chat</button>
      <button onClick={handleDownloadJSON}>Download Chat</button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUploadJson}
        accept=".json"
        style={{ display: "none" }}
      />
      <button onClick={handleUploadClick}>Upload Chat</button>
    </aside>
  );
};

export default Sidebar;
