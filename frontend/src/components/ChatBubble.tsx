import type { DisplayMessage } from '../types';
import type { Language, Persona } from '../types';
import { PERSONAS, I18N } from '../lib/config';

interface Props {
  msg: DisplayMessage;
  language: Language;
  persona: Persona;
}

export default function ChatBubble({ msg, language, persona }: Props) {
  const isUser = msg.role === 'user';
  const isTyping = msg.isTyping;
  const t = I18N[language];
  const personaConfig = PERSONAS.find((p) => p.id === persona)!;

  if (isUser) {
    return (
      <div className="cb-user-row">
        <div className="cb-user-bubble">
          {msg.content}
        </div>
      </div>
    );
  }

  return (
    <div className="cb-sys-row">
      {/* Avatar */}
      <div className="cb-sys-avatar">
        {personaConfig.emoji}
      </div>

      <div className="cb-sys-bubble-wrap">
        {isTyping ? (
          <div className="cb-sys-bubble cb-typing">
            <span />
            <span />
            <span />
          </div>
        ) : (
          <>
            {/* Main bubble */}
            <div className="cb-sys-bubble">
              {msg.content}
            </div>

            {/* Key Points */}
            {msg.key_points && msg.key_points.length > 0 && (
              <div className="cb-points">
                <p className="cb-points-title">✦ {t.keyPoints}</p>
                <ul className="cb-points-list">
                  {msg.key_points.map((pt, i) => (
                    <li key={i} className="cb-points-item">
                      <span className="cb-points-bullet">•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
