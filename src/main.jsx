import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import worker from "./mock";
import { BrowserRouter } from "react-router";
import { MessageContextProvider } from "./context/message-context.jsx";

worker
  .start()
  .then(() => {
    createRoot(document.getElementById("root")).render(
      <StrictMode>
        <BrowserRouter>
          <MessageContextProvider>
            <App />
          </MessageContextProvider>
        </BrowserRouter>
      </StrictMode>,
    );
  })
  .catch((error) => console.error(error));
