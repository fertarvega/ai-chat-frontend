import "@/styles/main.css";
import Sidebar from "@/components/Sidebar";
import { useChatContext } from "@/context/ChatContext";
import { Chat } from "@/components/chat/Chat";
import { useEffect } from "react";

const DB_NAME = import.meta.env.VITE_DB_NAME || "chatDB";
const DB_VERSION = Number(import.meta.env.VITE_DB_VERSION) || 1;
const STORE_NAME_CHATS = import.meta.env.VITE_STORE_NAME_CHATS || "chats";
const STORE_NAME_THREADS = import.meta.env.VITE_STORE_NAME_THREADS || "threads";

const Home = () => {
  const { hideSidebar } = useChatContext();

  useEffect(() => {
    const initDB = () => {
      console.log("Iniciando apertura de DB...", { DB_NAME, DB_VERSION });
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (event) => {
        console.error("Error al abrir DB:", (event.target as IDBOpenDBRequest).error);
      };

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        console.log("Ejecutando onupgradeneeded...");
        
        // Crear stores si no existen
        if (!db.objectStoreNames.contains(STORE_NAME_CHATS)) {
          const chatStore = db.createObjectStore(STORE_NAME_CHATS, {
            keyPath: "id",
            autoIncrement: true
          });
          console.log("Store de chats creado");
        }
        
        if (!db.objectStoreNames.contains(STORE_NAME_THREADS)) {
          const threadStore = db.createObjectStore(STORE_NAME_THREADS, {
            keyPath: "id",
            autoIncrement: true
          });
          threadStore.createIndex("chatUuid", "chatUuid", { unique: false });
          console.log("Store de threads creado");
        }
      };

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        console.log("DB abierta exitosamente:", {
          name: db.name,
          version: db.version,
          stores: Array.from(db.objectStoreNames)
        });
      };
    };

    initDB();

    // Cleanup function
    return () => {
      indexedDB.databases().then(databases => {
        databases.forEach(database => {
          if (database.name === DB_NAME) {
            const db = indexedDB.open(DB_NAME);
            db.onsuccess = (event) => {
              (event.target as IDBOpenDBRequest).result.close();
            };
          }
        });
      });
    };
  }, []);

  return (
    <section className={`home-container ${!hideSidebar ? "sidebar-open" : ""}`}>
      <Sidebar />
      <Chat />
    </section>
  );
};

export default Home;
