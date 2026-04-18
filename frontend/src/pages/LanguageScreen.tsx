import { useAppStore } from "../store/useAppStore";

import type { Language } from "../types";

export default function LanguageScreen() {
  const { setLanguage, setStep } = useAppStore();

  const choose = (lang: Language) => {
    setLanguage(lang);
    setStep("persona");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=Noto+Serif+Devanagari:wght@400;600&display=swap');

        .ld-wrap {
          min-height: 100dvh;
          background-color: #F5EFE2;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          font-family: 'Lora', Georgia, serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: 48px 28px 32px;
          box-sizing: border-box;
          max-width: 360px;
          margin: 0 auto;
          position: relative;
        }

        .ld-wrap::before {
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

        .ld-top {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          position: relative;
          z-index: 1;
        }

        .ld-diya {
          width: 72px;
          height: 72px;
          margin-bottom: 18px;
        }

        .ld-title {
          font-family: 'Lora', Georgia, serif;
          font-size: 32px;
          font-weight: 600;
          color: #2C1A0E;
          letter-spacing: -0.5px;
          line-height: 1.15;
          margin: 0 0 6px;
        }

        .ld-hindi-title {
          font-family: 'Noto Serif Devanagari', serif;
          font-size: 15px;
          color: #8B6240;
          margin: 0 0 14px;
          letter-spacing: 0.5px;
        }

        .ld-rule {
          width: 40px;
          height: 1.5px;
          background: linear-gradient(90deg, transparent, #C4873A, transparent);
          margin: 0 auto 14px;
        }

        .ld-tagline {
          font-family: 'Lora', Georgia, serif;
          font-style: italic;
          font-size: 14px;
          color: #7A5C3A;
          max-width: 200px;
          line-height: 1.55;
          margin: 0;
        }

        .ld-middle {
          width: 100%;
          position: relative;
          z-index: 1;
        }

        .ld-label {
          text-align: center;
          font-family: 'Lora', Georgia, serif;
          font-size: 10.5px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #A07850;
          margin-bottom: 18px;
        }

        .ld-btn {
          width: 100%;
          display: flex;
          align-items: center;
          padding: 18px 20px;
          background: #FFFDF7;
          border: 1.5px solid #D4B48A;
          border-radius: 3px;
          cursor: pointer;
          margin-bottom: 12px;
          position: relative;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          box-shadow: 3px 3px 0px #D4B48A;
          text-align: left;
          box-sizing: border-box;
        }

        .ld-btn:hover {
          transform: translate(-1px, -1px);
          box-shadow: 4px 4px 0px #C4873A;
        }

        .ld-btn:active {
          transform: translate(2px, 2px);
          box-shadow: 1px 1px 0px #D4B48A;
        }

        .ld-badge {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: 1.5px solid #D4B48A;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 600;
          color: #8B4A1A;
          background: #FDF3E3;
          flex-shrink: 0;
          margin-right: 16px;
          font-family: 'Lora', Georgia, serif;
        }

        .ld-btn-text {
          flex: 1;
        }

        .ld-btn-main {
          font-family: 'Lora', Georgia, serif;
          font-size: 15px;
          font-weight: 600;
          color: #2C1A0E;
          display: block;
          margin-bottom: 2px;
        }

        .ld-btn-sub {
          font-family: 'Lora', Georgia, serif;
          font-size: 12px;
          font-style: italic;
          color: #8B6240;
          display: block;
        }

        .ld-arrow {
          font-size: 18px;
          color: #C4873A;
          margin-left: 8px;
          font-family: Georgia, serif;
        }

        .ld-bottom {
          text-align: center;
          position: relative;
          z-index: 1;
          width: 100%;
        }

        .ld-footer-rule {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
          opacity: 0.35;
        }

        .ld-footer-line {
          flex: 1;
          height: 1px;
          background: #8B6240;
        }

        .ld-footer-text {
          font-family: 'Lora', Georgia, serif;
          font-size: 11px;
          font-style: italic;
          color: #A07850;
          opacity: 0.7;
          margin: 0;
        }
        .ls-back {
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
          align-self: flex-start;
          margin-bottom: 24px;
          position: relative;
          z-index: 10;
          transition: color 0.15s;
        }

        .ls-back:hover {
          color: #2C1A0E;
        }
      `}</style>

      <div className="ld-wrap">
        <button className="ls-back" onClick={() => setStep("home")}>
          ← Back
        </button>

        {/* TOP */}
        <div className="ld-top">
          <div className="ld-diya">
            <img src="/logo.png" className="w-full h-full object-contain" alt="Logo" />
          </div>

          <h1 className="ld-title">Lakshmi Didi</h1>
          <p className="ld-hindi-title">लक्ष्मी दीदी</p>
          <div className="ld-rule" />
          <p className="ld-tagline">
            Your trusted companion for money that matters
          </p>
        </div>

        {/* MIDDLE */}
        <div className="ld-middle">
          <p className="ld-label">Choose your language · भाषा चुनें</p>

          {/* ENGLISH */}
          <button className="ld-btn" onClick={() => choose("en")}>
            <div className="ld-badge">EN</div>
            <div className="ld-btn-text">
              <span className="ld-btn-main">English</span>
              <span className="ld-btn-sub">Continue in English</span>
            </div>
            <span className="ld-arrow">→</span>
          </button>

          {/* HINDI */}
          <button className="ld-btn" onClick={() => choose("hi")}>
            <div
              className="ld-badge"
              style={{
                fontFamily: "'Noto Serif Devanagari', serif",
                fontSize: "16px",
              }}
            >
              हिं
            </div>
            <div className="ld-btn-text">
              <span
                className="ld-btn-main"
                style={{ fontFamily: "'Noto Serif Devanagari', serif" }}
              >
                हिंदी
              </span>
              <span
                className="ld-btn-sub"
                style={{
                  fontFamily: "'Noto Serif Devanagari', serif",
                  fontStyle: "normal",
                }}
              >
                हिंदी में जारी रखें
              </span>
            </div>
            <span className="ld-arrow">→</span>
          </button>
        </div>

        {/* BOTTOM */}
        <div className="ld-bottom">
          <div className="ld-footer-rule">
            <span className="ld-footer-line" />
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M7 1l1.5 3.5L12 5l-2.5 2.5.5 3.5L7 9.5 4 11l.5-3.5L2 5l3.5-.5z"
                fill="#8B6240"
                opacity="0.6"
              />
            </svg>
            <span className="ld-footer-line" />
          </div>
          <p className="ld-footer-text">
            Smart finance advice for every Indian
          </p>
        </div>
      </div>
    </>
  );
}
