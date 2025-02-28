import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { shadesOfPurple } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { IMessage } from "@/interfaces/chat";
import { useState, useCallback } from "react";
import "@/styles/markdown.css";

const ChatOutput = ({ responseMessage }: { responseMessage: IMessage }) => {
  const [copyText, setCopyText] = useState<string>("Copy");

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopyText("Copied!");
    setTimeout(() => {
      setCopyText("Copy");
    }, 2000);
  }, []);

  const isUserMessage = responseMessage.role === "user";

  return (
    <section
      className={`my-1 p-2 border border-gray-300 rounded-xl dark:text-white max-w-[795px] w-full ${
        isUserMessage ? "text-right" : ""
      } ${isUserMessage ? "dark:bg-blue-600" : "dark:bg-gray-800"}`}
    >
      <article className="m-2 markdown-body" style={{ lineHeight: "1.6" }}>
        <ReactMarkdown
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              return !inline && match ? (
                <div className="relative">
                  <button
                    onClick={() => copyToClipboard(String(children))}
                    className="absolute right-2 top-2 px-2 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-600"
                  >
                    {copyText}
                  </button>
                  <SyntaxHighlighter
                    style={shadesOfPurple}
                    language={match[1]}
                    PreTag="div"
                    showLineNumbers={true}
                    customStyle={{
                      background: "#000",
                      margin: 0,
                      padding: "10px",
                      lineHeight: "1.5",
                      fontFamily: "monospace",
                      fontSize: "14px",
                    }}
                    {...props}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                </div>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
            h1: ({ node, ...props }) => (
              <h1 className="markdown-h1" {...props} />
            ),
            h2: ({ node, ...props }) => (
              <h2 className="markdown-h2" {...props} />
            ),
            h3: ({ node, ...props }) => (
              <h3 className="markdown-h3" {...props} />
            ),
            ul: ({ node, ...props }) => (
              <ul className="markdown-ul" {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol className="markdown-ol" {...props} />
            ),
            li: ({ node, ...props }) => (
              <li className="markdown-li" {...props} />
            ),
            strong: ({ node, ...props }) => (
              <strong className="markdown-strong" {...props} />
            ),
            em: ({ node, ...props }) => (
              <em className="markdown-em" {...props} />
            ),
          }}
        >
          {responseMessage.content}
        </ReactMarkdown>
        {!isUserMessage && (
          <div className="text-xs text-gray-100 mt-2 text-right">
            Generated with Llama 3.2 (Groq)
          </div>
        )}
      </article>
    </section>
  );
};

export default ChatOutput;
