import { ChatMessage } from "@/interfaces/chat";

const ChatOutput = ({ responseMessage }: { responseMessage: ChatMessage }) => {
  return (
    <div className="[grid-area:chat-output] pr-2 md:px-2">
      <div className="mb-2 p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-white">
        <strong>
          {responseMessage.role === "user" ? "User" : "Llama 3.2"}
        </strong>
        <p>{responseMessage.content}</p>
      </div>
    </div>
  );
};

export default ChatOutput;
