import { createContext, useContext, useState, ReactNode } from "react";

interface IChatReferenceContext {
  chatUuid: string;
  setChatUuid: (uuid: string) => void;
}

const ChatReferenceContext = createContext<IChatReferenceContext>(
  {} as IChatReferenceContext
);

export const ChatReferenceProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [chatUuid, setChatUuid] = useState<string>("");

  return (
    <ChatReferenceContext.Provider value={{ chatUuid, setChatUuid }}>
      {children}
    </ChatReferenceContext.Provider>
  );
};

export const useChatReference = () => {
  const context = useContext(ChatReferenceContext);
  if (context === undefined) {
    console.log("context is undefined");
  }
  return context;
};
