import { IChat, IMessage } from "@/interfaces/chat";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";

interface IChatReferenceContext {
  chats: IChat[];
  setChats: Dispatch<SetStateAction<IChat[]>>;
  chatUuid: string;
  setChatUuid: Dispatch<SetStateAction<string>>;
  hideSidebar: boolean;
  setHideSidebar: Dispatch<SetStateAction<boolean>>;
  messages: IMessage[];
  setMessages: Dispatch<SetStateAction<IMessage[]>>;
}

const ChatReferenceContext = createContext<IChatReferenceContext>(
  {} as IChatReferenceContext
);

export const ChatContextProvider = ({ children }: { children: ReactNode }) => {
  const [chats, setChats] = useState<IChat[]>([]);
  const [chatUuid, setChatUuid] = useState("");
  const [hideSidebar, setHideSidebar] = useState(false);
  const [messages, setMessages] = useState<IMessage[]>([]);

  return (
    <ChatReferenceContext.Provider
      value={{
        chats,
        setChats,
        chatUuid,
        setChatUuid,
        hideSidebar,
        setHideSidebar,
        messages,
        setMessages,
      }}
    >
      {children}
    </ChatReferenceContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatReferenceContext);
  if (context === undefined) {
    console.log("context is undefined");
  }
  return context;
};
