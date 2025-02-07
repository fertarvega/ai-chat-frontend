import { useState, useEffect } from "react";

const DB_NAME = import.meta.env.VITE_DB_NAME || "chatDB";
const DB_VERSION = Number(import.meta.env.VITE_DB_VERSION) || 1;
const STORE_NAME_CHATS = import.meta.env.VITE_STORE_NAME_CHATS || "chats";
const STORE_NAME_THREADS = import.meta.env.VITE_STORE_NAME_THREADS || "threads";

interface DatabaseState {
  db: IDBDatabase | null;
  error: string | null;
  loading: boolean;
}

const useIndexedDB = (): DatabaseState => {
  const [dbState, setDbState] = useState<DatabaseState>({
    db: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    const initDB = () => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (event) => {
        console.error("Database error:", (event.target as IDBRequest).error);
        setDbState({
          db: null,
          error: "Failed to open database",
          loading: false,
        });
      };

      request.onsuccess = (event) => {
        const db = (event.target as IDBRequest).result as IDBDatabase;
        setDbState({ db: db, error: null, loading: false });
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBRequest).result as IDBDatabase;

        if (!db.objectStoreNames.contains(STORE_NAME_CHATS)) {
          db.createObjectStore(STORE_NAME_CHATS, {
            keyPath: "id",
          });
        }

        if (!db.objectStoreNames.contains(STORE_NAME_THREADS)) {
          const objectStore = db.createObjectStore(STORE_NAME_THREADS, {
            keyPath: "id",
          });
          objectStore.createIndex("chatUuid", "chatUuid", { unique: false });
        }
      };
    };

    initDB();
  }, []);

  return dbState;
};

export default useIndexedDB;
