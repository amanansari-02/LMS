// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Toaster } from "sonner";
import { SearchProvider } from "./context/SearchContext.tsx";

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <SearchProvider>
    <App />
    <Toaster position="top-right" richColors />
    {/* </StrictMode> */}
  </SearchProvider>
);
