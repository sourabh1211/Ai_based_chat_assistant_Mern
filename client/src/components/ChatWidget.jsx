// import React, { useMemo, useRef, useState } from "react";
// import { sendChat } from "../api";

// export default function ChatWidget() {
//   const [open, setOpen] = useState(true);
//   const [loading, setLoading] = useState(false);
//   const [text, setText] = useState("");
//   const [msgs, setMsgs] = useState([
//     { role: "assistant", content: "Hi! Ask me anything about our help articles." }
//   ]);

//   const listRef = useRef(null);
//   const canSend = useMemo(() => text.trim().length > 0 && !loading, [text, loading]);

//   async function onSend() {
//     const content = text.trim();
//     if (!content) return;

//     setMsgs((m) => [...m, { role: "user", content }]);
//     setText("");
//     setLoading(true);

//     try {
//       const data = await sendChat(content);
//       const extra =
//         data.sources?.length
//           ? "\n\nReferences:\n" + data.sources.map((s) => `- ${s.title} (${s.slug})`).join("\n")
//           : "";

//       setMsgs((m) => [...m, { role: "assistant", content: (data.reply || "").trim() + extra }]);
//     } catch (e) {
//       setMsgs((m) => [...m, { role: "assistant", content: `Error: ${e.message}` }]);
//     } finally {
//       setLoading(false);
//       setTimeout(() => {
//         listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
//       }, 50);
//     }
//   }

//   return (
//     <div className="fixed right-4 bottom-4 z-[9999]">
//       <button
//         onClick={() => setOpen((v) => !v)}
//         className="rounded-full bg-black text-white px-4 py-3 shadow-lg hover:opacity-90 active:scale-[0.99]"
//       >
//         {open ? "×" : "Chat"}
//       </button>

//       {open && (
//         <div className="mt-3 w-[360px] h-[520px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-200">
//           <div className="px-4 py-3 bg-black text-white font-semibold">
//             Knowledge Base Assistant
//           </div>

//           <div ref={listRef} className="flex-1 p-3 overflow-auto bg-gray-50 space-y-2">
//             {msgs.map((m, idx) => (
//               <div
//                 key={idx}
//                 className={[
//                   "max-w-[92%] rounded-2xl px-3 py-2 border",
//                   m.role === "user"
//                     ? "ml-auto bg-blue-100 border-blue-200"
//                     : "mr-auto bg-white border-gray-200"
//                 ].join(" ")}
//               >
//                 <pre className="whitespace-pre-wrap break-words text-sm text-gray-900 m-0">
//                   {m.content}
//                 </pre>
//               </div>
//             ))}

//             {loading && (
//               <div className="max-w-[92%] mr-auto bg-white border border-gray-200 rounded-2xl px-3 py-2">
//                 <pre className="whitespace-pre-wrap break-words text-sm text-gray-600 m-0">
//                   Typing…
//                 </pre>
//               </div>
//             )}
//           </div>

//           <div className="p-3 border-t border-gray-200 bg-white flex gap-2">
//             <input
//               value={text}
//               onChange={(e) => setText(e.target.value)}
//               placeholder="Type your question…"
//               className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20"
//               onKeyDown={(e) => {
//                 if (e.key === "Enter" && canSend) onSend();
//               }}
//             />
//             <button
//               disabled={!canSend}
//               onClick={onSend}
//               className="rounded-xl bg-black text-white px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
//             >
//               Send
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import React, { useEffect, useMemo, useRef, useState } from "react";
import { sendChat } from "../api";

export default function ChatWidget() {
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState([
    { role: "assistant", content: "Hi! Ask me anything about our help articles." }
  ]);

  const listRef = useRef(null);
  const inputRef = useRef(null);

  const canSend = useMemo(() => text.trim().length > 0 && !loading, [text, loading]);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => inputRef.current?.focus(), 80);
  }, [open]);

  useEffect(() => {
    setTimeout(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    }, 50);
  }, [msgs.length, loading]);

  async function onSend() {
    const content = text.trim();
    if (!content) return;

    setMsgs((m) => [...m, { role: "user", content }]);
    setText("");
    setLoading(true);

    try {
      const data = await sendChat(content);
      const extra =
        data.sources?.length
          ? "\n\nReferences:\n" + data.sources.map((s) => `- ${s.title} (${s.slug})`).join("\n")
          : "";

      setMsgs((m) => [
        ...m,
        { role: "assistant", content: (data.reply || "").trim() + extra }
      ]);
    } catch (e) {
      setMsgs((m) => [...m, { role: "assistant", content: `Error: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed right-5 bottom-5 z-[9999]">
      <button
        onClick={() => setOpen((v) => !v)}
        className={[
          "group relative rounded-full px-4 py-3 shadow-lg transition-all",
          "bg-gradient-to-r from-black via-zinc-900 to-black text-white",
          "hover:shadow-2xl hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.99]",
          "ring-1 ring-white/10"
        ].join(" ")}
      >
        <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-violet-500/40 via-cyan-400/30 to-fuchsia-500/40 blur opacity-0 group-hover:opacity-100 transition-opacity" />
        <span className="relative font-semibold tracking-wide">
          {open ? "×" : "Chat"}
        </span>
      </button>

      {open && (
        <div className="mt-3 w-[370px] sm:w-[390px] h-[560px] rounded-[28px] overflow-hidden">
          <div className="relative h-full rounded-[28px] border border-white/10 bg-white/70 backdrop-blur-xl shadow-2xl">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
              <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.04)_1px,transparent_0)] [background-size:18px_18px]" />
            </div>

            <div className="relative flex h-full flex-col">
              <div className="px-4 py-3 flex items-center justify-between border-b border-black/5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-black to-zinc-700 text-white grid place-items-center shadow-md">
                    <SparkIcon />
                  </div>
                  <div>
                    <div className="font-extrabold tracking-tight text-zinc-900 leading-5">
                      Knowledge Assistant
                    </div>
                    <div className="text-xs text-zinc-600">
                      Answers from your help articles
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] px-2 py-1 rounded-full bg-black/5 text-zinc-700">
                    {loading ? "Thinking…" : "Ready"}
                  </span>
                  <button
                    onClick={() => setMsgs([{ role: "assistant", content: "Hi! Ask me anything about our help articles." }])}
                    className="text-xs px-3 py-1.5 rounded-full bg-white hover:bg-black/5 border border-black/10 text-zinc-800 transition"
                    title="Clear chat"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div
                ref={listRef}
                className="relative flex-1 overflow-auto px-3 py-4 space-y-3"
              >
                {msgs.map((m, idx) => (
                  <MessageBubble key={idx} role={m.role} content={m.content} />
                ))}

                {loading && (
                  <div className="max-w-[92%] mr-auto rounded-2xl px-3 py-2 border border-black/10 bg-white shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-zinc-700 animate-bounce" />
                      <span className="h-2 w-2 rounded-full bg-zinc-700 animate-bounce [animation-delay:120ms]" />
                      <span className="h-2 w-2 rounded-full bg-zinc-700 animate-bounce [animation-delay:240ms]" />
                      <span className="text-xs text-zinc-600 ml-2">Typing…</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative p-3 border-t border-black/5 bg-white/60 backdrop-blur">
                <div className="flex items-end gap-2">
                  <div className="flex-1 rounded-2xl border border-black/10 bg-white shadow-sm focus-within:ring-2 focus-within:ring-black/10">
                    <textarea
                      ref={inputRef}
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Type your question…"
                      rows={1}
                      className="w-full resize-none bg-transparent px-4 py-3 text-sm outline-none placeholder:text-zinc-400"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey && canSend) {
                          e.preventDefault();
                          onSend();
                        }
                      }}
                    />
                    <div className="px-4 pb-2 flex items-center justify-between">
                      <span className="text-[11px] text-zinc-500">
                        Press <span className="font-semibold">Enter</span> to send •{" "}
                        <span className="font-semibold">Shift+Enter</span> for new line
                      </span>
                      <span className="text-[11px] text-zinc-500">
                        {text.trim().length}/800
                      </span>
                    </div>
                  </div>

                  <button
                    disabled={!canSend}
                    onClick={onSend}
                    className={[
                      "relative rounded-2xl px-4 py-3 text-sm font-semibold transition-all",
                      "text-white bg-gradient-to-r from-black via-zinc-900 to-black",
                      "shadow-lg hover:shadow-xl hover:-translate-y-[1px] active:translate-y-0",
                      "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0",
                      "ring-1 ring-white/10"
                    ].join(" ")}
                  >
                    <span className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-violet-500/30 via-cyan-400/25 to-fuchsia-500/30 blur opacity-0 hover:opacity-100 transition-opacity" />
                    <span className="relative flex items-center gap-2">
                      <SendIcon />
                      Send
                    </span>
                  </button>
                </div>
              </div>

              <div className="absolute top-3 right-3 h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.15)]" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MessageBubble({ role, content }) {
  const isUser = role === "user";
  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div
        className={[
          "max-w-[92%] rounded-3xl px-4 py-3 border shadow-sm",
          "transition-transform duration-200",
          isUser
            ? "bg-gradient-to-br from-blue-600/10 to-cyan-400/10 border-blue-200/60"
            : "bg-white/80 border-black/10"
        ].join(" ")}
      >
        <div className="flex items-center gap-2 mb-1">
          <span
            className={[
              "text-[11px] px-2 py-0.5 rounded-full border",
              isUser
                ? "bg-blue-600/10 text-blue-700 border-blue-200/60"
                : "bg-black/5 text-zinc-700 border-black/10"
            ].join(" ")}
          >
            {isUser ? "You" : "Assistant"}
          </span>
        </div>

        <pre className="whitespace-pre-wrap break-words text-sm text-zinc-900 m-0 leading-relaxed">
          {content}
        </pre>
      </div>
    </div>
  );
}

function SparkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="opacity-90">
      <path
        d="M12 2l1.6 6.2L20 10l-6.4 1.8L12 18l-1.6-6.2L4 10l6.4-1.8L12 2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M19 14l.8 3.1L23 18l-3.2.9L19 22l-.8-3.1L15 18l3.2-.9L19 14Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        opacity="0.7"
      />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="opacity-90">
      <path
        d="M22 2L11 13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M22 2l-7 20-4-9-9-4 20-7Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
