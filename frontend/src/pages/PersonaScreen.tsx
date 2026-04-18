import { useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { PERSONAS, I18N } from "../lib/config";
import { createSession } from "../lib/api";
import type { Persona } from "../types";

export default function PersonaScreen() {
  const { language, persona, setPersona, setStep, setSession, addMessage } =
    useAppStore();
  const t = I18N[language];
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    try {
      const session = await createSession(language, persona);
      setSession(session);

      const selectedPersona = PERSONAS.find((p) => p.id === persona)!;
      const personaName =
        language === "hi" ? selectedPersona.nameHi : selectedPersona.nameEn;

      addMessage({
        id: -1,
        session_id: session.id,
        role: "assistant",
        content: t.welcomeMsg(personaName),
        created_at: new Date().toISOString(),
        key_points: [],
      });

      setStep(useAppStore.getState().isVoiceMode ? "voice" : "chat");
    } catch (e) {
      console.error(e);
      alert(language === 'hi' ? "सत्र शुरू करने में विफल। कृपया पुन: प्रयास करें।" : "Failed to start session. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=Noto+Serif+Devanagari:wght@400;600&display=swap');

        .ps-wrap {
          min-height: 100dvh;
          background-color: #F5EFE2;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          font-family: 'Lora', Georgia, serif;
          display: flex;
          flex-direction: column;
          padding: 40px 24px 32px;
          box-sizing: border-box;
          max-width: 360px;
          margin: 0 auto;
          position: relative;
        }

        .ps-wrap::before {
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
        }

        .ps-back {
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'Lora', Georgia, serif;
          font-size: 13px;
          color: #A07850;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0;
          margin-bottom: 32px;
          position: relative;
          z-index: 1;
          transition: color 0.15s;
        }

        .ps-back:hover { color: #2C1A0E; }

        .ps-header {
          text-align: center;
          margin-bottom: 28px;
          position: relative;
          z-index: 1;
        }

        .ps-logo-wrap {
          width: 48px;
          height: 48px;
          margin: 0 auto 12px;
          background: #FDF3E3;
          border-radius: 50%;
          border: 1.5px solid #D4B48A;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          box-sizing: border-box;
        }

        .ps-title {
          font-family: 'Lora', Georgia, serif;
          font-size: 26px;
          font-weight: 600;
          color: #2C1A0E;
          margin: 0 0 8px;
          letter-spacing: -0.3px;
        }

        .ps-rule {
          width: 40px;
          height: 1.5px;
          background: linear-gradient(90deg, transparent, #C4873A, transparent);
          margin: 0 auto 10px;
        }

        .ps-subtitle {
          font-family: 'Lora', Georgia, serif;
          font-style: italic;
          font-size: 13px;
          color: #8B6240;
          margin: 0;
        }

        .ps-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex: 1;
          position: relative;
          z-index: 1;
        }

        .ps-card {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 18px;
          background: #FFFDF7;
          border: 1.5px solid #D4B48A;
          border-radius: 3px;
          cursor: pointer;
          text-align: left;
          box-sizing: border-box;
          transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
          box-shadow: 3px 3px 0px #D4B48A;
          position: relative;
        }

        .ps-card:hover {
          transform: translate(-1px, -1px);
          box-shadow: 4px 4px 0px #C4873A;
        }

        .ps-card:active {
          transform: translate(2px, 2px);
          box-shadow: 1px 1px 0px #D4B48A;
        }

        .ps-card.selected {
          background: #FDF0D8;
          border-color: #C4873A;
          box-shadow: 3px 3px 0px #C4873A;
        }

        .ps-card.selected:hover {
          box-shadow: 4px 4px 0px #A0621A;
        }

        .ps-icon-wrap {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 1.5px solid #D4B48A;
          background: #FDF3E3;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          flex-shrink: 0;
          transition: border-color 0.15s, background 0.15s;
        }

        .ps-card.selected .ps-icon-wrap {
          border-color: #C4873A;
          background: #FAEBD0;
        }

        .ps-card-text {
          flex: 1;
          min-width: 0;
        }

        .ps-card-name {
          font-family: 'Lora', Georgia, serif;
          font-size: 15px;
          font-weight: 600;
          color: #2C1A0E;
          display: block;
          margin-bottom: 3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ps-card.selected .ps-card-name {
          color: #8B4A1A;
        }

        .ps-card-tagline {
          font-family: 'Lora', Georgia, serif;
          font-style: italic;
          font-size: 12px;
          color: #8B6240;
          display: block;
          line-height: 1.4;
        }

        .ps-check {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 1.5px solid #D4B48A;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.15s;
        }

        .ps-card.selected .ps-check {
          border-color: #C4873A;
          background: #C4873A;
        }

        .ps-check-tick {
          display: none;
          width: 10px;
          height: 10px;
        }

        .ps-card.selected .ps-check-tick {
          display: block;
        }

        .ps-cta-wrap {
          margin-top: 24px;
          position: relative;
          z-index: 1;
        }

        .ps-divider {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
          opacity: 0.35;
        }

        .ps-divider-line {
          flex: 1;
          height: 1px;
          background: #8B6240;
        }

        .ps-cta {
          width: 100%;
          padding: 17px 20px;
          background: #FFFDF7;
          border: 1.5px solid #C4873A;
          border-radius: 3px;
          box-shadow: 3px 3px 0px #C4873A;
          cursor: pointer;
          font-family: 'Lora', Georgia, serif;
          font-size: 15px;
          font-weight: 600;
          color: #8B4A1A;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s;
          box-sizing: border-box;
        }

        .ps-cta:hover:not(:disabled) {
          transform: translate(-1px, -1px);
          box-shadow: 4px 4px 0px #A0621A;
        }

        .ps-cta:active:not(:disabled) {
          transform: translate(2px, 2px);
          box-shadow: 1px 1px 0px #C4873A;
        }

        .ps-cta:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          box-shadow: none;
        }

        .ps-loading-dots span {
          display: inline-block;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #C4873A;
          margin: 0 2px;
          animation: ps-bounce 1.2s infinite ease-in-out;
        }

        .ps-loading-dots span:nth-child(2) { animation-delay: 0.2s; }
        .ps-loading-dots span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes ps-bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <div className="ps-wrap">
        {/* Back */}
        <button className="ps-back" onClick={() => setStep("language")}>
          ← {language === "hi" ? "वापस" : "Back"}
        </button>

        {/* Header */}
        <div className="ps-header">
          <div className="ps-logo-wrap">
            <img src="/logo.png" className="w-full h-full object-contain" alt="Logo" />
          </div>
          <h2 className="ps-title">
            {language === "hi" ? "सलाहकार चुनें" : t.choosePersona}
          </h2>
          <div className="ps-rule" />
          <p className="ps-subtitle">
            {language === "hi"
              ? "किससे बात करना चाहते हैं?"
              : "Who do you want to talk to?"}
          </p>
        </div>

        {/* Persona Cards */}
        <div className="ps-list">
          {PERSONAS.map((p) => {
            const isSelected = persona === p.id;
            const name = language === "hi" ? p.nameHi : p.nameEn;
            const tagline = language === "hi" ? p.taglineHi : p.taglineEn;

            return (
              <button
                key={p.id}
                className={`ps-card${isSelected ? " selected" : ""}`}
                onClick={() => setPersona(p.id as Persona)}
              >
                <div className="ps-icon-wrap">{p.emoji}</div>
                <div className="ps-card-text">
                  <span
                    className="ps-card-name"
                    style={
                      language === "hi"
                        ? { fontFamily: "'Noto Serif Devanagari', serif" }
                        : {}
                    }
                  >
                    {name}
                  </span>
                  <span
                    className="ps-card-tagline"
                    style={
                      language === "hi"
                        ? {
                            fontFamily: "'Noto Serif Devanagari', serif",
                            fontStyle: "normal",
                          }
                        : {}
                    }
                  >
                    {tagline}
                  </span>
                </div>
                <div className="ps-check">
                  <svg
                    className="ps-check-tick"
                    viewBox="0 0 10 10"
                    fill="none"
                  >
                    <path
                      d="M1.5 5L4 7.5L8.5 2.5"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </button>
            );
          })}
        </div>

        {/* CTA */}
        <div className="ps-cta-wrap">
          <div className="ps-divider">
            <span className="ps-divider-line" />
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M7 1l1.5 3.5L12 5l-2.5 2.5.5 3.5L7 9.5 4 11l.5-3.5L2 5l3.5-.5z"
                fill="#8B6240"
                opacity="0.6"
              />
            </svg>
            <span className="ps-divider-line" />
          </div>

          <button
            className="ps-cta"
            onClick={handleStart}
            disabled={loading || !persona}
          >
            {loading ? (
              <span className="ps-loading-dots">
                <span />
                <span />
                <span />
              </span>
            ) : (
              <>
                <span>{language === "hi" ? t.startChat : t.startChat}</span>
                <span
                  style={{ fontSize: "18px", fontFamily: "Georgia, serif" }}
                >
                  →
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
