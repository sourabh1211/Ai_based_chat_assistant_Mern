import React from "react";
import ChatWidget from "./components/ChatWidget";
import Analytics from "./pages/Analytics";

export default function App() {
  const path = window.location.pathname;
  return <>{path.startsWith("/admin/analytics") ? <Analytics /> : <ChatWidget />}</>;
}

