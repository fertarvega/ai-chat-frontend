const Chat = ({
  message,
  setMessage,
  handleSubmit,
  handleClear,
}: {
  message: string;
  setMessage: (message: string) => void;
  handleSubmit: () => void;
  handleClear: () => void;
}) => {
  return (
    <div className="[grid-area:chat] flex flex-col md:flex-row gap-2">
      <input
        type="text"
        placeholder="Type a message..."
        className="w-full border-2 border-gray-300 rounded-md p-2 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-0 focus:border-blue-500 focus:ring-blue-500"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSubmit();
          }
        }}
      />
      <button
        type="submit"
        className="bg-blue-500 text-white p-2 rounded-md"
        onClick={handleSubmit}
      >
        Send
      </button>
      <button onClick={handleClear} className="bg-emerald-800 rounded-md p-2">
        Clear
      </button>
    </div>
  );
};

export default Chat;
