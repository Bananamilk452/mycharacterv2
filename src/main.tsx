import * as Sentry from "@sentry/react";
import { StrictMode } from "react";

import "./index.css";

import { createRoot } from "react-dom/client";

import App from "./App.tsx";

if (location.href === "https://mycharacterv2.vercel.app/") {
  const go = confirm(
    "이 도메인은 더 이상 사용되지 않습니다. mycharacter.app으로 이동하시겠습니까?",
  );
  if (go) {
    location.href = "https://mycharacter.app/";
  }
}

Sentry.init({
  dsn: "https://95c58208cc93695f61dc3a857e4071db@o409411.ingest.us.sentry.io/4510400766869504",
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
