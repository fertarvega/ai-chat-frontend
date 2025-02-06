/* eslint-disable no-useless-escape */
import { useState } from "react";
import Prism from "prismjs";
import "prismjs/themes/prism-funky.css";
import { IMessage } from "@/interfaces/chat";

const ChatOuput = ({ responseMessage }: { responseMessage: IMessage }) => {
  const [isCopied, setIsCopied] = useState(false);
  const isCodeBlock = (text: string) => {
    return text.startsWith("```") && text.endsWith("```");
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  const formatCodeBlock = (text: string) => {
    const code = text.slice(3, -3).split("\n").slice(1, -1).join("\n");

    return (
      <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-x-auto flex flex-col">
        <button onClick={() => copyCode(code)} className="self-end">
          {isCopied ? <span className="text-green-300">Copiado</span> : "Copiar"}
        </button>
        {/* // TODO: Add language different from javascript */}
        <code
          dangerouslySetInnerHTML={{
            __html: Prism.highlight(
              code,
              Prism.languages.javascript,
              "javascript"
            ),
          }}
        />
      </pre>
    );
  };

  return (
    <div className="[grid-area:chat-output] pr-2 md:px-2">
      <div className="mb-2 p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-white">
        <strong>
          {responseMessage.role === "user" ? "User" : "Llama 3.2"}
        </strong>
        <div>
          {responseMessage.content
            .split(/(\`\`\`[\s\S]*?\`\`\`|\*\*.*?\*\*|\n)/)
            .map((text, index) => {
              if (isCodeBlock(text)) {
                return formatCodeBlock(text);
              }
              if (text.startsWith("**") && text.endsWith("**")) {
                return <strong key={index}>{text.slice(2, -2)}</strong>;
              }
              if (text.startsWith("* ")) {
                return (
                  <div key={index} className="flex flex-row">
                    <span className="mr-2">•</span>
                    <span>{text.slice(2)}</span>
                  </div>
                );
              }
              if (text.startsWith("\n")) {
                return (
                  <div key={index} className="flex flex-row mb-1">
                    <span>{text}</span>
                  </div>
                );
              }
              return text;
            })}
        </div>
      </div>
    </div>
  );
};

export default ChatOuput;
