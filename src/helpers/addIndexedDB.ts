import { STORE_NAME_CHATS, STORE_NAME_THREADS } from "./constsDatabase";
import { DB_NAME } from "./constsDatabase";
import { DB_VERSION } from "./constsDatabase";
import { IChat, IThreadChat } from "@/interfaces/chat";

export const addIndexedDB = (
  value: IThreadChat | IChat,
  table: "chat" | "thread"
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error("Error al abrir la base de datos"));
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction(
        [table === "chat" ? STORE_NAME_CHATS : STORE_NAME_THREADS],
        "readwrite"
      );
      const store = transaction.objectStore(
        table === "chat" ? STORE_NAME_CHATS : STORE_NAME_THREADS
      );
      const addRequest = store.add(value);

      addRequest.onsuccess = () => {
        resolve();
      };

      addRequest.onerror = () => {
        reject(new Error("Error al guardar el mensaje"));
      };
    };
  });
};
