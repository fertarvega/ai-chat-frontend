const Sidebar = ({
  hideSidebar,
  setHideSidebar,
}: {
  hideSidebar: boolean;
  setHideSidebar: (hideSidebar: boolean) => void;
}) => {
  const handleHideSidebar = () => {
    setHideSidebar(!hideSidebar);
  };

  return (
    <aside className={`[grid-area:aside]`}>
      <button
        className="rounded-md bg-slate-800 py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none ml-auto hidden sm:block"
        type="button"
        onClick={handleHideSidebar}
      >
        {hideSidebar ? "←" : "→"}
      </button>
      <select
        name="api"
        id="api"
        className="w-full border-2 border-gray-300 rounded-md p-2 dark:bg-gray-800 dark:text-white"
      >
        <option value="llama">LLama 3.2</option>
        <option value="claude">Claude</option>
        <option value="openai">OpenAI</option>
        <option value="gemini">Gemini</option>
        <option value="financial-api">(Trained) Financial API</option>
      </select>
    </aside>
  );
};

export default Sidebar;
