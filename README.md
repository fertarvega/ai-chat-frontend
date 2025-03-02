# AI Chat Application
This is a chat application that allows users to interact with Llama 3.3 AI model through a clean interface. The application provides a seamless experience for having conversations with an AI assistant, with support for markdown formatting, code highlighting, and chat history management.

## How to use it
Clone the repository and start the project using
```bash
npm run dev
```
Note: The project requires the backend part to function properly.
URL: https://github.com/fertarvega/ai-chat-backend

## Main Features
- **Real-time AI Conversations**: Interact with Llama 3.3 AI model through Groq's API.
- **Streaming Responses**: AI responses are streamed in real-time for a natural conversation experience.
- **Markdown Support**: Full markdown rendering including code blocks, headings, lists, and more.
- **Syntax Highlighting**: Code snippets are displayed with syntax highlighting.
- **Chat History**: All conversations are saved locally and can be accessed later.
- **Offline Support**: Uses IndexedDB for local storage of chat history.

## Technical Implementation
- **Frontend**: React with TypeScript.
- **Styling**: Tailwind CSS.
- **State Management**: React Context API for global state.
- **Storage**: IndexedDB for local persistence of chats and messages.
- **Markdown**: ReactMarkdown for rendering markdown content.
- **Code Highlighting**: react-syntax-highlighter for code blocks.

## Key Components
1. **Chat Interface**: Main chat area with message history and input field.
2. **Sidebar**: Navigation panel showing chat history and allowing creation of new chats.
3. **ChatInput**: Text area for user input.
4. **ChatOutput**: Component for rendering AI and user messages with markdown support.

## Data Flow
1. User inputs a message in the ChatInput component.
2. Message is sent to the backend API.
3. AI response is streamed back and displayed in real-time.
4. Both user messages and AI responses are stored in IndexedDB.
5. Chat history is accessible through the sidebar.

#### To Do:
1. Responsive design.
2. AI model selector.