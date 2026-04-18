import { useState, useRef, useEffect } from "react";
import { Send, RefreshCw, ChevronLeft } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { PERSONAS, I18N } from "../lib/config";
import { sendMessage, getSession } from "../lib/api";
import ChatBubble from "../components/ChatBubble";
import type { DisplayMessage } from "../types";

export default function ChatScreen() {
  const {
    language,
    persona,
    session,
    messages,
    isLoading,
    addMessage,
    updateLastMessage,
    setMessages,
    setLoading,
    resetChat,
    setStep,
  } = useAppStore();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const t = I18N[language];
  const personaConfig = PERSONAS.find((p) => p.id === persona)!;
  const personaName =
    language === "hi" ? personaConfig.nameHi : personaConfig.nameEn;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Sync with server on mount (powered by Redis)
  useEffect(() => {
    if (session) {
      const syncMessages = async () => {
        try {
          const data = await getSession(session.id);
          if (data && data.messages) {
            setMessages(data.messages);
          }
        } catch (err: any) {
          console.error("Failed to sync messages:", err);
          // If session is deleted or invalid, go back home
          if (err.response?.status === 404 || err.response?.status === 403) {
            resetChat();
          }
        }
      };
      syncMessages();
    }
  }, []); // Only on mount

  const handleSend = async () => {
    if (!input.trim() || isLoading || !session) return;
    const text = input.trim();
    setInput("");

    // Add user message
    const userMsg: DisplayMessage = {
      id: Date.now(),
      session_id: session.id,
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    addMessage(userMsg);

    // Add typing indicator
    const typingMsg: DisplayMessage = {
      id: Date.now() + 1,
      session_id: session.id,
      role: "assistant",
      content: "",
      created_at: new Date().toISOString(),
      isTyping: true,
    };
    addMessage(typingMsg);
    setLoading(true);

    try {
      const resp = await sendMessage(session.id, text);
      updateLastMessage({
        id: resp.message.id,
        content: resp.message.content,
        created_at: resp.message.created_at,
        key_points: resp.key_points,
        isTyping: false,
      });
    } catch (e) {
      updateLastMessage({
        content:
          language === "hi"
            ? "माफ करना, कुछ गड़बड़ हो गई। दोबारा कोशिश करें।"
            : "Sorry, something went wrong. Please try again.",
        isTyping: false,
        key_points: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!session || isLoading) return;
    setLoading(true);
    try {
      const data = await getSession(session.id);
      if (data && data.messages) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error("Sync failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestion = (s: string) => {
    setInput(s);
    textareaRef.current?.focus();
  };

  const showSuggestions = messages.length <= 1;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=Noto+Serif+Devanagari:wght@400;600&display=swap');

        .cs-wrap {
          height: 100dvh;
          background-color: #F5EFE2;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          font-family: 'Lora', Georgia, serif;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          max-width: 360px;
          margin: 0 auto;
          position: relative;
          overflow: hidden;
        }

        .cs-wrap::before {
          content: '';
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 27px,
            rgba(180, 140, 80, 0.07) 27px,
            rgba(180, 140, 80, 0.07) 28px
          );
          pointer-events: none;
          z-index: 0;
        }

        /* Header */
        .cs-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          background: #FFFDF7;
          border-bottom: 1.5px solid #D4B48A;
          z-index: 10;
        }

        .cs-header-back {
          background: none;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #A07850;
          cursor: pointer;
          padding: 0;
          transition: color 0.15s;
        }

        .cs-header-back:hover {
          color: #8B4A1A;
        }

        .cs-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1.5px solid #D4B48A;
          background: #FDF3E3;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          box-shadow: 2px 2px 0px #D4B48A;
          flex-shrink: 0;
        }

        .cs-header-info {
          flex: 1;
          min-width: 0;
        }

        .cs-header-name {
          font-family: ${language === "hi" ? "'Noto Serif Devanagari', serif" : "'Lora', Georgia, serif"};
          font-size: 16px;
          font-weight: 600;
          color: #2C1A0E;
          margin: 0 0 2px 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .cs-header-status {
          display: flex;
          align-items: center;
          gap: 5px;
          font-family: 'Lora', Georgia, serif;
          font-size: 11px;
          font-style: italic;
          color: #6B8E23;
        }

        .cs-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #6B8E23;
          animation: cs-pulse 2s infinite;
        }

        @keyframes cs-pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }

        .cs-header-reset {
          background: none;
          border: none;
          color: #A07850;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          transition: color 0.15s;
        }
        .cs-header-reset:hover {
          color: #8B4A1A;
        }

        /* Messages */
        .cs-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          z-index: 1;
          display: flex;
          flex-direction: column;
          scrollbar-width: none; /* Firefox */
        }
        .cs-messages::-webkit-scrollbar {
          display: none; /* Chrome/Safari */
        }

        /* Suggestions */
        .cs-suggestions {
          margin-top: 16px;
        }

        .cs-sugg-title {
          text-align: center;
          font-family: 'Lora', Georgia, serif;
          font-size: 11px;
          font-style: italic;
          color: #A07850;
          margin: 0 0 10px 0;
        }

        .cs-sugg-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
        }

        .cs-sugg-btn {
          background: #FFFDF7;
          border: 1.5px solid #D4B48A;
          border-radius: 3px;
          padding: 8px 12px;
          font-size: 12.5px;
          font-family: ${language === "hi" ? "'Noto Serif Devanagari', serif" : "'Lora', Georgia, serif"};
          color: #8B4A1A;
          cursor: pointer;
          box-shadow: 2px 2px 0px #D4B48A;
          transition: transform 0.1s, box-shadow 0.1s;
          text-align: left;
        }

        .cs-sugg-btn:active {
          transform: translate(1px, 1px);
          box-shadow: 1px 1px 0px #D4B48A;
        }

        /* Bottom Input */
        .cs-bottom {
          padding: 16px 20px 24px;
          background: #F5EFE2;
          border-top: 1.5px solid #D4B48A;
          z-index: 10;
        }

        .cs-input-box {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          background: #FFFDF7;
          border: 1.5px solid #D4B48A;
          border-radius: 3px;
          padding: 8px 10px;
          box-shadow: 3px 3px 0px #D4B48A;
          transition: border-color 0.15s, box-shadow 0.15s;
        }

        .cs-input-box:focus-within {
          border-color: #C4873A;
          box-shadow: 3px 3px 0px #C4873A;
        }

        .cs-textarea {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          resize: none;
          font-family: ${language === "hi" ? "'Noto Serif Devanagari', serif" : "'Lora', Georgia, serif"};
          font-size: 15px;
          color: #2C1A0E;
          max-height: 100px;
          padding: 4px 0;
          scrollbar-width: none;
        }
        .cs-textarea::-webkit-scrollbar { display: none; }
        .cs-textarea::placeholder {
          color: #A07850;
          font-style: italic;
          opacity: 0.8;
        }

        .cs-send {
          width: 36px;
          height: 36px;
          border-radius: 3px;
          background: #C4873A;
          color: #FFFDF7;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: transform 0.1s, background 0.15s;
        }

        .cs-send:active:not(:disabled) {
          transform: scale(0.95);
        }

        .cs-send:disabled {
          background: #E0C8A8;
          cursor: not-allowed;
          color: rgba(255, 253, 247, 0.7);
        }

        .cs-disclaimer {
          text-align: center;
          font-size: 10px;
          font-style: italic;
          color: #A07850;
          opacity: 0.7;
          margin: 10px 0 0;
        }

        /* --- ChatBubble CSS --- */
        .cb-user-row {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 16px;
        }
        .cb-user-bubble {
          max-width: 82%;
          background: #C4873A;
          color: #FFFDF7;
          padding: 12px 16px;
          border-radius: 12px 12px 2px 12px;
          font-family: ${language === "hi" ? "'Noto Serif Devanagari', serif" : "'Lora', Georgia, serif"};
          font-size: 14.5px;
          line-height: 1.45;
          box-shadow: 2px 2px 0px #8B4A1A;
          word-break: break-word;
        }
        .cb-sys-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 20px;
        }
        .cb-sys-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 1.5px solid #D4B48A;
          background: #FDF3E3;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          flex-shrink: 0;
          box-shadow: 1px 1px 0px #D4B48A;
          margin-top: 4px;
        }
        .cb-sys-bubble-wrap {
          flex: 1;
          max-width: 82%;
        }
        .cb-sys-bubble {
          background: #FFFDF7;
          color: #2C1A0E;
          padding: 12px 16px;
          border: 1.5px solid #D4B48A;
          border-radius: 12px 12px 12px 2px;
          font-family: ${language === "hi" ? "'Noto Serif Devanagari', serif" : "'Lora', Georgia, serif"};
          font-size: 14.5px;
          line-height: 1.45;
          box-shadow: 2px 2px 0px #D4B48A;
          word-break: break-word;
        }
        .cb-typing {
          padding: 16px;
          display: flex;
          gap: 4px;
          align-items: center;
        }
        .cb-typing span {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #A07850;
          animation: cb-bounce 1.2s infinite ease-in-out;
        }
        .cb-typing span:nth-child(2) { animation-delay: 0.2s; }
        .cb-typing span:nth-child(3) { animation-delay: 0.4s; }
        
        @keyframes cb-bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }

        .cs-spin {
          animation: cs-spin-anim 1s linear infinite;
        }
        @keyframes cs-spin-anim {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .cb-points {
          margin-top: 8px;
          background: #FDF3E3;
          border: 1.5px solid #D4B48A;
          border-radius: 3px;
          padding: 12px;
        }
        .cb-points-title {
          margin: 0 0 8px 0;
          font-family: 'Lora', Georgia, serif;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #8B4A1A;
        }
        .cb-points-list {
          margin: 0;
          padding: 0;
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .cb-points-item {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          font-family: ${language === "hi" ? "'Noto Serif Devanagari', serif" : "'Lora', Georgia, serif"};
          font-size: 13.5px;
          color: #2C1A0E;
          line-height: 1.4;
        }
        .cb-points-bullet {
          color: #C4873A;
          font-size: 14px;
          line-height: 1.2;
          flex-shrink: 0;
        }
      `}</style>
      <div className="cs-wrap">
        {/* Header */}
        <header className="cs-header">
          <button className="cs-header-back" onClick={() => setStep("home")}>
            <ChevronLeft size={24} strokeWidth={2.5} />
          </button>

          <div className="cs-avatar">{personaConfig.emoji}</div>

          <div className="cs-header-info">
            <h1 className="cs-header-name">{personaName}</h1>
            <div className="cs-header-status">
              <span className="cs-status-dot" />
              <span>{language === "hi" ? "ऑनलाइन" : "Online"}</span>
            </div>
          </div>

          <button
            onClick={handleSync}
            disabled={isLoading}
            title={language === "hi" ? "चैट रिफ्रेश करें" : "Refresh Chat"}
            className="cs-header-reset"
          >
            <RefreshCw size={18} strokeWidth={2.5} className={isLoading ? "cs-spin" : ""} />
          </button>
        </header>

        {/* Messages */}
        <div className="cs-messages">
          {messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              msg={msg}
              language={language}
              persona={persona}
            />
          ))}

          {/* Suggestions */}
          {showSuggestions && (
            <div className="cs-suggestions">
              <p className="cs-sugg-title">{t.suggestionLabel}</p>
              <div className="cs-sugg-list">
                {t.suggestions.slice(0, 3).map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestion(s)}
                    className="cs-sugg-btn"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div className="cs-bottom">
          <div className="cs-input-box">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.typeMessage}
              rows={1}
              disabled={isLoading}
              className="cs-textarea"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="cs-send"
            >
              <Send size={16} strokeWidth={2.5} />
            </button>
          </div>
          <p className="cs-disclaimer">
            {language === "hi"
              ? "वित्तीय सलाह केवल शैक्षणिक उद्देश्यों के लिए है"
              : "Finance advice for educational purposes only"}
          </p>
        </div>
      </div>
    </>
  );
}
