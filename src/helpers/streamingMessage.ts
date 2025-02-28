import { IMessage } from "@/interfaces/chat";

export const streamingMessage = async (
  textInput: string,
  uuid: string,
  auxHistory: IMessage[],
  setMessages: (messages: IMessage[]) => void,
  saveMessage: (message: IMessage, uuid: string) => Promise<void>
) => {
  const response = await fetch("http://localhost:3000/chat/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: textInput,
      uuid,
    }),
  });

  const reader = response?.body?.getReader();
  const decoder = new TextDecoder("utf-8");

  const index = auxHistory.length;
  let fullResponse = "";

  try {
    while (true) {
      if (!reader) {
        console.log("No reader");
        break;
      }

      const { done, value } = await reader.read();

      if (done) {
        const assistantMessage: IMessage = {
          role: "assistant",
          content: fullResponse,
        };
        const auxFullResponseHistory = [...auxHistory];
        auxFullResponseHistory[index] = assistantMessage;
        setMessages(auxFullResponseHistory);

        try {
          await saveMessage(assistantMessage, uuid);
        } catch (error) {
          console.error("Error al guardar la respuesta:", error);
        }
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      const events = chunk.split("\n\n").filter(Boolean);

      for (const event of events) {
        if (event.startsWith("data: ")) {
          const cleanChunk = event.substring(5);
          try {
            const jsonResponse = JSON.parse(cleanChunk);

            fullResponse += jsonResponse.response;

            const auxFullResponseHistory = [...auxHistory];
            const assistantMessage: IMessage = {
              role: "assistant",
              content: fullResponse,
            };
            auxFullResponseHistory[index] = assistantMessage;
            setMessages(auxFullResponseHistory);
          } catch (error) {
            console.error("Error parsing JSON:", error);
          }
        } else {
          console.warn("Unexpected event format:", event);
        }
      }
    }
  } catch (error) {
    console.error("Error reading stream:", error);
  } finally {
    reader?.releaseLock();
  }
};
