import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import App from "./App";

// Refresh uvek krece od vrha: intro (loader + hero) ima smisla samo odozgo.
// Link sa #sekcijom i dalje radi - App skace na nju kada je sajt spreman.
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
window.scrollTo(0, 0);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
