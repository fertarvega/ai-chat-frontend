import { IChat } from "@/interfaces/chat";

const DB_NAME = import.meta.env.VITE_DB_NAME || "chatDB";
const DB_VERSION = Number(import.meta.env.VITE_DB_VERSION) || 1;
const STORE_NAME_CHATS = import.meta.env.VITE_STORE_NAME_CHATS || "chats";
const STORE_NAME_THREADS = import.meta.env.VITE_STORE_NAME_THREADS || "threads";

export const getChats = async (): Promise<IChat[]> => {
  return new Promise<IChat[]>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction([STORE_NAME_CHATS], "readonly");
      const store = transaction.objectStore(STORE_NAME_CHATS);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result as IChat[]);
      };

      request.onerror = (event) => {
        reject(new Error("Error retrieving chats from the store."));
      };
    };

    request.onerror = (event) => {
      reject(new Error("Error opening the database."));
    };
  });
};
