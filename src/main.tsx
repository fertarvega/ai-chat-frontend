import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/styles/index.css";
import { createBrowserRouter } from "react-router-dom";
import { RouterProvider } from "react-router-dom";
import Home from "./pages/Home.tsx";
import { ChatReferenceProvider } from "./context/ChatReference.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ChatReferenceProvider>
      <div className="dark:bg-black dark:text-white min-h-screen">
        <RouterProvider router={router} />
      </div>
    </ChatReferenceProvider>
  </StrictMode>
);
