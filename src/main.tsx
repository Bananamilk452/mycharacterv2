import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";

import App from "./App.tsx";

if (location.href === "https://mycharacterv2.vercel.app/") {
  const go = confirm(
    "이 도메인은 더 이상 사용되지 않습니다. mycharacter.app으로 이동하시겠습니까?",
  );
  if (go) {
    location.href = "https://mycharacter.app/";
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
