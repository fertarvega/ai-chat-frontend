import "@/styles/main.css";
import Sidebar from "@/components/Sidebar";
import { useChatContext } from "@/context/ChatContext";
import { Chat } from "@/components/chat/Chat";
import { useEffect } from "react";
import useIndexedDB from "@/hooks/useIndexedDB";

const DB_NAME = import.meta.env.VITE_DB_NAME || "chatDB";
const DB_VERSION = Number(import.meta.env.VITE_DB_VERSION) || 1;
const STORE_NAME_CHATS = import.meta.env.VITE_STORE_NAME_CHATS || "chats";
const STORE_NAME_THREADS = import.meta.env.VITE_STORE_NAME_THREADS || "threads";

const Home = () => {
  const { hideSidebar } = useChatContext();
  const { db, error, loading } = useIndexedDB();

  if (loading) {
    return <p>Loading database...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (db) {
    return (
      <section
        className={`home-container ${!hideSidebar ? "sidebar-open" : ""}`}
      >
        <Sidebar />
        <Chat />
      </section>
    );
  }
};

export default Home;
