import { useEffect, useState } from "react";
import {
  MessageSquare, Mic, ArrowRight, LogOut, X,
  User as UserIcon, Lightbulb, Calculator, History, Clock,
  Zap, TrendingUp, ChevronRight
} from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { listSessions, getSession } from "../lib/api";
import type { SessionOut } from "../types";

// ─── constants ───────────────────────────────────────────────────────────────

const FINANCIAL_TIPS = [
  {
    titleEn: "Fixed Deposit (FD)",
    descEn: "Safe returns with high security. Great for emergency funds.",
  },
  {
    titleEn: "Tax Saving (80C)",
    descEn: "Save up to ₹1.5L with PPF, ELSS, or life insurance premiums.",
  },
  {
    titleEn: "SIP Growth",
    descEn: "Small amounts monthly can build big wealth. Start early!",
  },
];

const PERSONA_EMOJI: Record<string, string> = {
  maa: "💖",
  banker: "💰",
  dost: "😎",
};

const PERSONA_COLOR: Record<string, { bg: string; border: string; text: string }> = {
  maa:    { bg: "#FFF0F5", border: "rgba(220,80,120,0.2)",  text: "#B03060" },
  banker: { bg: "#FDF6E7", border: "rgba(212,168,83,0.3)",  text: "#7A5200" },
  dost:   { bg: "#F0F6FF", border: "rgba(80,130,220,0.2)",  text: "#2A5AB0" },
};

const QUICK_ASKS = [
  { icon: "📈", label: "How to start SIP?" },
  { icon: "🏦", label: "Best FD rates now?" },
  { icon: "💳", label: "Reduce my EMI?" },
  { icon: "🧾", label: "Save tax under 80C?" },
];

function personaEmoji(slug: string): string {
  return PERSONA_EMOJI[slug.toLowerCase()] ?? "💬";
}
function personaColor(slug: string) {
  return PERSONA_COLOR[slug.toLowerCase()] ?? { bg: "#F5F5F5", border: "rgba(0,0,0,0.1)", text: "#555" };
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

// ─── component ───────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const {
    user, setStep, logout, setSession, setMessages, setLanguage, setPersona,
  } = useAppStore();

  const [sessions, setSessions]     = useState<SessionOut[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [loadError, setLoadError]   = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const firstName  = user?.name?.split(" ")[0] || "User";
  const currentTip = FINANCIAL_TIPS[Math.floor(Date.now() / 86_400_000) % FINANCIAL_TIPS.length];

  useEffect(() => {
    (async () => {
      try {
        setLoadError(null);
        const data = await listSessions();
        setSessions(data ?? []);
      } catch {
        setLoadError("Unable to load history");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleStartText  = () => { useAppStore.setState({ isVoiceMode: false }); setStep("language"); };
  const handleStartVoice = () => { useAppStore.setState({ isVoiceMode: true  }); setStep("language"); };

  const resumeSession = async (sessionId: string) => {
    try {
      const { session, messages } = await getSession(sessionId);
      const isVoice = messages.some((m) => m.content.includes("\n\nKey Points:\n- "));
      useAppStore.setState({ isVoiceMode: isVoice, voiceState: "idle" });
      setSession(session);
      setLanguage(session.language);
      setPersona(session.persona);
      setMessages(messages as any);
      setStep(isVoice ? "voice" : "chat");
    } catch {
      setStep("home");
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');

        .hs-wrap {
          min-height: 100dvh;
          background: #FAF6EE;
          font-family: 'DM Sans', sans-serif;
          display: flex;
          flex-direction: column;
          max-width: 480px;
          margin: 0 auto;
          position: relative;
          overflow-x: hidden;
          padding-bottom: 48px;
        }

        .hs-stagger > * {
          opacity: 0;
          animation: hsSlideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .hs-stagger > *:nth-child(1) { animation-delay: 0.05s; }
        .hs-stagger > *:nth-child(2) { animation-delay: 0.12s; }
        .hs-stagger > *:nth-child(3) { animation-delay: 0.20s; }
        .hs-stagger > *:nth-child(4) { animation-delay: 0.28s; }
        .hs-stagger > *:nth-child(5) { animation-delay: 0.36s; }
        .hs-stagger > *:nth-child(6) { animation-delay: 0.44s; }
        .hs-stagger > *:nth-child(7) { animation-delay: 0.52s; }
        @keyframes hsSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0);    }
        }

        /* ── action cards ── */
        .hs-action-card {
          background: white;
          border: 1px solid rgba(212,168,83,0.45);
          border-radius: 20px;
          padding: 20px 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          transition: transform 0.2s ease, border-color 0.2s;
        }
        .hs-action-card:hover  { transform: translateY(-3px); border-color: #D4A853; }
        .hs-action-card:active { transform: scale(0.97); }

        /* ── quick ask pills ── */
        .hs-qa-pill {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 9px 14px;
          background: white;
          border: 1px solid rgba(212,168,83,0.38);
          border-radius: 40px;
          cursor: pointer;
          transition: all 0.18s;
          white-space: nowrap;
        }
        .hs-qa-pill:hover  { border-color: #D4A853; background: #FDF8ED; transform: translateY(-1px); }
        .hs-qa-pill:active { transform: scale(0.97); }

        /* ── session card ── */
        .hs-sess-card {
          flex: 0 0 150px;
          background: white;
          border: 1px solid rgba(212,168,83,0.3);
          border-radius: 16px;
          padding: 14px 12px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 10px;
          transition: transform 0.2s, border-color 0.2s;
          position: relative;
          overflow: hidden;
        }
        .hs-sess-card::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #D4A853, #E8C97A);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .hs-sess-card:hover  { transform: translateY(-3px); border-color: #D4A853; }
        .hs-sess-card:hover::after { opacity: 1; }
        .hs-sess-card:active { transform: scale(0.97); }

        /* ── FD calc row ── */
        .hs-fd-card {
          background: white;
          border: 1px solid rgba(212,168,83,0.45);
          border-radius: 18px;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: transform 0.2s, border-color 0.2s;
          position: relative;
          overflow: hidden;
        }
        .hs-fd-card:hover  { transform: translateY(-2px); border-color: #C8922A; }
        .hs-fd-card:active { transform: scale(0.98); }

        /* ── profile overlay ── */
        .hs-profile-overlay {
          position: absolute;
          inset: 0;
          z-index: 100;
        }
        .hs-profile-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(44,26,14,0.22);
        }
        .hs-profile-card {
          position: absolute;
          top: 68px;
          right: 16px;
          width: 270px;
          background: white;
          border: 1px solid rgba(212,168,83,0.5);
          border-radius: 18px;
          overflow: hidden;
          animation: hsPop 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          display: flex;
          flex-direction: column;
          max-height: calc(100dvh - 100px);
        }
        @keyframes hsPop {
          from { opacity: 0; transform: translateY(-8px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .hs-wisdom {
          background-color: #5C1A1A;
          background-image: linear-gradient(to bottom, rgba(44,26,14,0.3), rgba(44,26,14,0.85)), url('/tips_hero.png');
          background-size: cover;
          background-position: center;
          border-radius: 18px;
          padding: 20px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 10px 30px -8px rgba(44,26,14,0.5);
        }

        .hs-hscroll {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding-bottom: 4px;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .hs-hscroll::-webkit-scrollbar { display: none; }

        /* ── section header ── */
        .hs-sec-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .hs-sec-title {
          font-family: 'Lora', serif;
          font-size: 14px;
          font-weight: 700;
          color: #2C1A0E;
          margin: 0;
        }
        .hs-sec-link {
          background: none;
          border: none;
          font-size: 11px;
          color: #D4A853;
          font-weight: 600;
          padding: 0;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 2px;
        }

        /* ── streak badge ── */
        .hs-streak {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 11px;
          background: linear-gradient(135deg, #FDF0CC, #F8E4A8);
          border: 1px solid rgba(212,168,83,0.5);
          border-radius: 20px;
        }

        /* ── empty state ── */
        .hs-empty {
          border: 1.5px dashed rgba(212,168,83,0.45);
          border-radius: 16px;
          padding: 28px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          background: rgba(253,246,231,0.4);
          text-align: center;
        }
      `}</style>

      <div className="hs-wrap">

        {/* ── Profile overlay ── */}
        {isProfileOpen && (
          <div className="hs-profile-overlay">
            <div className="hs-profile-backdrop" onClick={() => setIsProfileOpen(false)} />
            <div className="hs-profile-card">
              <button
                onClick={() => setIsProfileOpen(false)}
                style={{ position: "absolute", top: 10, right: 10, width: 28, height: 28, borderRadius: "50%", border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#9B5A3C" }}
              >
                <X size={14} />
              </button>

              <div style={{ flexShrink: 0, background: "#FDF6E7", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", borderBottom: "1px solid rgba(212,168,83,0.3)" }}>
                {user?.picture ? (
                  <img src={user.picture} alt="Profile" style={{ width: 56, height: 56, borderRadius: "50%", border: "2px solid #D4A853", objectFit: "cover", marginBottom: 10 }} />
                ) : (
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#F5E8C8", border: "2px solid #D4A853", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                    <UserIcon size={24} color="#9B5A3C" />
                  </div>
                )}
                <p style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: 16, color: "#2C1A0E", margin: 0 }}>{user?.name || "User"}</p>
                <p style={{ fontSize: 12, color: "#9B5A3C", margin: "3px 0 0" }}>{user?.email}</p>
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: "16px", background: "white" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                  <History size={12} color="#9B5A3C" />
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#9B5A3C", textTransform: "uppercase", letterSpacing: "0.1em" }}>Recent Sessions</span>
                </div>

                {isLoading && <p style={{ fontSize: 12, color: "#9B5A3C", fontStyle: "italic" }}>Loading history…</p>}
                {loadError && (
                  <div style={{ background: "#FFF0F0", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 12px" }}>
                    <p style={{ fontSize: 12, color: "#B91C1C", margin: 0 }}>{loadError}</p>
                  </div>
                )}
                {!isLoading && !loadError && sessions.length === 0 && (
                  <div style={{ textAlign: "center", padding: "16px", border: "1px dashed rgba(212,168,83,0.5)", borderRadius: 10, background: "rgba(253,246,231,0.5)" }}>
                    <Clock size={16} color="rgba(212,168,83,0.5)" style={{ margin: "0 auto 6px" }} />
                    <p style={{ fontSize: 11, color: "#9B5A3C", fontStyle: "italic", margin: 0 }}>Your history will appear here</p>
                  </div>
                )}
                {!isLoading && sessions.map((sess) => (
                  <div key={sess.id} className="hs-sess" style={{ marginBottom: 6, padding: "8px 10px", borderRadius: 10, display: "flex", alignItems: "center", gap: 10, cursor: "pointer", background: "white", border: "1px solid rgba(212,168,83,0.3)", transition: "border-color 0.15s" }} onClick={() => { setIsProfileOpen(false); resumeSession(sess.id); }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: "#FDF6E7", border: "1px solid rgba(212,168,83,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>
                      {personaEmoji(sess.persona)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "#2C1A0E", margin: 0, textTransform: "capitalize", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sess.persona}</p>
                      <p style={{ fontSize: 10, color: "#9B5A3C", margin: "2px 0 0" }}>{new Date(sess.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</p>
                    </div>
                    <ArrowRight size={12} color="rgba(212,168,83,0.6)" />
                  </div>
                ))}
              </div>

              <div style={{ flexShrink: 0, borderTop: "1px solid rgba(212,168,83,0.2)", background: "#FFFDF7" }}>
                <button
                  onClick={() => { logout(); setIsProfileOpen(false); }}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", border: "none", background: "none", cursor: "pointer", color: "#B44D12", fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ━━━ MAIN CONTENT ━━━ */}
        <div className="hs-stagger">

          {/* 1 — Top bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 20px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Lora', serif", fontWeight: 700, fontSize: 16, color: "#5C1A1A" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#F5E8C8", border: "1.5px solid #D4A853", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img src="/logo.png" alt="" style={{ width: 18, height: 18, objectFit: "contain" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              </div>
              Lakshmi Didi
            </div>
            <button
              onClick={() => setIsProfileOpen(true)}
              style={{ width: 38, height: 38, borderRadius: "50%", border: "2px solid #D4A853", background: "#F5E8C8", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden", padding: 0 }}
            >
              {user?.picture
                ? <img src={user.picture} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <UserIcon size={18} color="#9B5A3C" />}
            </button>
          </div>

          {/* 2 — Greeting */}
          <div style={{ padding: "20px 20px 0" }}>
            <h1 style={{ fontFamily: "'Lora', serif", fontSize: 26, fontWeight: 700, color: "#2C1A0E", margin: "0 0 4px" }}>
              Namaste, {firstName}!
            </h1>
            <p style={{ fontSize: 13, color: "#9B5A3C", fontStyle: "italic", margin: 0 }}>
              Your personal wealth companion is ready.
            </p>
          </div>

          {/* 3 — Wisdom banner */}
          <div style={{ padding: "16px 16px 0" }}>
            <div className="hs-wisdom">
              <div style={{ position: "absolute", width: 120, height: 120, borderRadius: "50%", border: "1px solid rgba(212,168,83,0.15)", top: -40, right: -40, pointerEvents: "none" }} />
              <div style={{ position: "absolute", width: 80, height: 80, borderRadius: "50%", border: "1px solid rgba(212,168,83,0.1)", top: -20, right: -20, pointerEvents: "none" }} />

              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#D4A853", display: "inline-block" }} />
                <span style={{ fontSize: 10, fontWeight: 600, color: "#D4A853", textTransform: "uppercase", letterSpacing: "0.1em" }}>Wisdom of the day</span>
              </div>

              <p style={{ fontFamily: "'Lora', serif", fontSize: 15, fontWeight: 600, color: "white", lineHeight: 1.55, marginBottom: 14 }}>
                "Investing today is like planting a tree for tomorrow's shade."
              </p>

              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, background: "rgba(255,255,255,0.12)", borderRadius: 12, padding: "12px 14px", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.2)", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(212,168,83,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Lightbulb size={14} color="#D4A853" />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "white", margin: "0 0 2px" }}>{currentTip.titleEn}</p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", margin: 0, lineHeight: 1.4 }}>{currentTip.descEn}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 4 — Action cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "16px 16px 0" }}>
            <div className="hs-action-card" onClick={handleStartText}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: "#FDF6E7", border: "1px solid rgba(212,168,83,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <MessageSquare size={22} color="#9B5A3C" strokeWidth={1.8} />
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#2C1A0E", margin: 0 }}>Text Chat</p>
                <p style={{ fontSize: 11, color: "#9B5A3C", margin: "2px 0 0" }}>Start guidance</p>
              </div>
            </div>

            <div className="hs-action-card" onClick={handleStartVoice}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: "#FDF6E7", border: "1px solid rgba(212,168,83,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Mic size={22} color="#9B5A3C" strokeWidth={1.8} />
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#2C1A0E", margin: 0 }}>Voice Mode</p>
                <p style={{ fontSize: 11, color: "#9B5A3C", margin: "2px 0 0" }}>Hands-free advice</p>
              </div>
            </div>
          </div>

          {/* 5 — Ask me anything (quick prompts) */}
          <div style={{ padding: "20px 0 0" }}>
            <div className="hs-sec-head" style={{ padding: "0 16px" }}>
              <p className="hs-sec-title">Ask me anything</p>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Zap size={12} color="#D4A853" />
                <span style={{ fontSize: 11, color: "#D4A853", fontWeight: 600 }}>Quick start</span>
              </div>
            </div>
            <div className="hs-hscroll" style={{ padding: "0 16px 4px" }}>
              {QUICK_ASKS.map((q) => (
                <button
                  key={q.label}
                  className="hs-qa-pill"
                  onClick={() => {
                    useAppStore.setState({ isVoiceMode: false });
                    setStep("language");
                  }}
                >
                  <span style={{ fontSize: 15 }}>{q.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 500, color: "#3C2A0E" }}>{q.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 6 — FD Calculator */}
          <div style={{ margin: "4px 16px 0" }}>
            <div className="hs-fd-card" onClick={() => setStep("fd-calc")}>
              {/* left accent stripe */}
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: "linear-gradient(180deg, #D4A853, #E8C97A)", borderRadius: "18px 0 0 18px" }} />

              <div style={{ width: 44, height: 44, borderRadius: 12, background: "#FDF6E7", border: "1px solid rgba(212,168,83,0.35)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: 6 }}>
                <Calculator size={20} color="#9B5A3C" strokeWidth={1.8} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#2C1A0E", margin: 0 }}>FD Returns Calculator</p>
                <p style={{ fontSize: 11, color: "#9B5A3C", margin: "2px 0 0" }}>See your money grow in seconds</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#FDF6E7", border: "1px solid rgba(212,168,83,0.3)", borderRadius: 8, padding: "5px 10px" }}>
                <TrendingUp size={12} color="#C8922A" />
                <span style={{ fontSize: 11, fontWeight: 600, color: "#C8922A" }}>Calculate</span>
              </div>
            </div>
          </div>

          {/* 7 — Recent Sessions */}
          <div style={{ padding: "20px 16px 0" }}>
            <div className="hs-sec-head">
              <p className="hs-sec-title">Jump back in</p>
              {sessions.length > 0 && (
                <button className="hs-sec-link" onClick={() => setIsProfileOpen(true)}>
                  View all <ChevronRight size={12} />
                </button>
              )}
            </div>

            {/* Loading */}
            {isLoading && (
              <div style={{ display: "flex", gap: 10 }}>
                {[1, 2].map((i) => (
                  <div key={i} style={{ flex: "0 0 150px", height: 100, borderRadius: 16, background: "rgba(212,168,83,0.08)", border: "1px solid rgba(212,168,83,0.15)", animation: "hsPulse 1.4s ease-in-out infinite" }} />
                ))}
                <style>{`@keyframes hsPulse { 0%,100%{opacity:0.5} 50%{opacity:1} }`}</style>
              </div>
            )}

            {/* Error */}
            {loadError && !isLoading && (
              <div style={{ background: "#FFF0F0", border: "1px solid #FECACA", borderRadius: 10, padding: "12px 14px" }}>
                <p style={{ fontSize: 12, color: "#B91C1C", margin: 0 }}>{loadError}</p>
              </div>
            )}

            {/* Empty */}
            {!isLoading && !loadError && sessions.length === 0 && (
              <div className="hs-empty">
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "#FDF6E7", border: "1px solid rgba(212,168,83,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Clock size={18} color="rgba(212,168,83,0.6)" />
                </div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#5C3A1E", margin: 0 }}>No sessions yet</p>
                <p style={{ fontSize: 12, color: "#9B5A3C", margin: 0, lineHeight: 1.5 }}>
                  Start a chat above — your conversations will appear here.
                </p>
              </div>
            )}

            {/* Session cards */}
            {!isLoading && sessions.length > 0 && (
              <div className="hs-hscroll">
                {sessions.slice(0, 5).map((sess) => {
                  const col = personaColor(sess.persona);
                  return (
                    <div key={sess.id} className="hs-sess-card" onClick={() => resumeSession(sess.id)}>
                      {/* persona badge */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: col.bg, border: `1px solid ${col.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                          {personaEmoji(sess.persona)}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: 12, fontWeight: 700, color: "#2C1A0E", margin: 0, textTransform: "capitalize", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {sess.persona}
                          </p>
                          <p style={{ fontSize: 10, color: col.text, margin: "1px 0 0", fontWeight: 500 }}>
                            {timeAgo(sess.created_at)}
                          </p>
                        </div>
                      </div>

                      {/* resume cta */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
                        <span style={{ fontSize: 10, color: "#9B5A3C", background: "#FDF6E7", border: "1px solid rgba(212,168,83,0.28)", borderRadius: 6, padding: "3px 8px", fontWeight: 500 }}>
                          Resume →
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>{/* end .hs-stagger */}
      </div>
    </>
  );
}