import { useMemo, useState } from 'react';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

const BANK_RATES = [
  { label: 'SBI',   rate: 7.10 },
  { label: 'HDFC',  rate: 7.25 },
  { label: 'ICICI', rate: 7.50 },
  { label: 'IDFC',  rate: 8.05 },
];

export default function FdCalcScreen() {
  const { setStep }   = useAppStore();
  const [principal, setPrincipal]   = useState('');
  const [rate, setRate]             = useState('');
  const [years, setYears]           = useState('');
  const [activeBank, setActiveBank] = useState<string | null>(null);

  const result = useMemo(() => {
    const p = parseFloat(principal.replace(/,/g, ''));
    const r = parseFloat(rate);
    const t = parseFloat(years);
    if ([p, r, t].some((v) => isNaN(v) || v <= 0)) return null;
    const n        = 4;
    const maturity = p * Math.pow(1 + r / 100 / n, n * t);
    const interest = maturity - p;
    return {
      maturity, interest,
      principal: p, rate: r, years: t,
      growthPct: ((interest / p) * 100).toFixed(1),
      effRate:   ((interest / p / t) * 100).toFixed(2),
      barPct:    Math.min(96, Math.max(8, Math.round((interest / maturity) * 100))),
    };
  }, [principal, rate, years]);

  const fmt   = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;
  const yrLbl = years && parseFloat(years) === 1 ? 'yr' : 'yrs';

  const handleBankPick  = (bank: (typeof BANK_RATES)[0]) => { setRate(String(bank.rate)); setActiveBank(bank.label); };
  const handleRateInput = (v: string) => { setRate(v); setActiveBank(null); };

  /* ── Design tokens ── */
  const MONO  = "'DM Mono', monospace";
  const SERIF = "Georgia, 'Times New Roman', serif";
  const SANS  = "'DM Sans', sans-serif";
  const GOLD  = '#B87E2A';
  const GOLDB = 'rgba(184,126,42,0.22)';
  const INK   = '#19110A';
  const MUTED = '#9A7C52';
  const PAPER = '#F7F3EC';
  const WHITE = '#FFFFFF';

  const sectionLabel: React.CSSProperties = {
    fontFamily:    MONO,
    fontSize:      9,
    fontWeight:    500,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color:         MUTED,
    display:       'block',
    marginBottom:  10,
  };

  const fieldLabel: React.CSSProperties = {
    fontFamily:    MONO,
    fontSize:      8.5,
    fontWeight:    500,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color:         MUTED,
    display:       'block',
    marginBottom:  7,
  };

  const baseInput: React.CSSProperties = {
    width:            '100%',
    background:       WHITE,
    border:           `1px solid ${GOLDB}`,
    borderRadius:     6,
    padding:          '13px 14px',
    fontFamily:       MONO,
    fontSize:         16,
    fontWeight:       500,
    color:            INK,
    outline:          'none',
    transition:       'border-color 0.15s',
    WebkitAppearance: 'none',
    boxSizing:        'border-box',
  };

  return (
    <div
      style={{
        fontFamily:      SANS,
        backgroundColor: PAPER,
        color:           INK,
        minHeight:       '100dvh',
        width:           '100%',
        maxWidth:        480,
        margin:          '0 auto',
        display:         'flex',
        flexDirection:   'column',
      }}
    >

      {/* ━━━ HEADER ━━━ */}
      <header
        style={{
          position:        'sticky',
          top:             0,
          zIndex:          20,
          backgroundColor: PAPER,
          borderBottom:    `1px solid ${GOLDB}`,
          padding:         '16px 20px 14px',
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'space-between',
        }}
      >
        <button
          onClick={() => setStep('home')}
          aria-label="Go back"
          style={{
            width:          36,
            height:         36,
            flexShrink:     0,
            borderRadius:   6,
            border:         `1px solid ${GOLDB}`,
            background:     WHITE,
            color:          MUTED,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            cursor:         'pointer',
          }}
        >
          <ArrowLeft size={16} />
        </button>

        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: MUTED, marginBottom: 4 }}>
            Yield Calculator
          </div>
          <h1 style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 600, color: INK, lineHeight: 1, margin: 0 }}>
            Fixed Deposit
          </h1>
        </div>

        <div style={{ width: 36, flexShrink: 0 }} />
      </header>

      {/* ━━━ BODY ━━━ */}
      <div
        style={{
          flex:          1,
          padding:       '24px 20px 48px',
          display:       'flex',
          flexDirection: 'column',
          gap:           28,
          overflowX:     'hidden',
        }}
      >

        {/* ── Bank rate chips: 2×2 grid, never overflows ── */}
        <section>
          <span style={sectionLabel}>Quick pick — current FD rates</span>
          <div
            style={{
              display:             'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap:                 10,
            }}
          >
            {BANK_RATES.map((bank) => {
              const active = activeBank === bank.label;
              return (
                <button
                  key={bank.label}
                  onClick={() => handleBankPick(bank)}
                  style={{
                    display:        'flex',
                    alignItems:     'center',
                    justifyContent: 'space-between',
                    padding:        '13px 16px',
                    borderRadius:   8,
                    border:         active ? `1.5px solid ${GOLD}` : `1px solid ${GOLDB}`,
                    background:     active ? '#FDF2DC' : WHITE,
                    cursor:         'pointer',
                    transition:     'all 0.14s',
                    textAlign:      'left',
                    minWidth:       0,
                  }}
                >
                  <span
                    style={{
                      fontFamily:    MONO,
                      fontSize:      10,
                      fontWeight:    600,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color:         active ? GOLD : MUTED,
                    }}
                  >
                    {bank.label}
                  </span>
                  <span
                    style={{
                      fontFamily: SERIF,
                      fontSize:   22,
                      fontWeight: 600,
                      color:      INK,
                      lineHeight: 1,
                    }}
                  >
                    {bank.rate}%
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Deposit fields ── */}
        <section>
          <span style={sectionLabel}>Deposit details</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Investment amount */}
            <div>
              <span style={fieldLabel}>Investment amount</span>
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position:      'absolute',
                    left:          13,
                    top:           '50%',
                    transform:     'translateY(-50%)',
                    fontFamily:    SERIF,
                    fontSize:      17,
                    color:         MUTED,
                    pointerEvents: 'none',
                    lineHeight:    1,
                    userSelect:    'none',
                  }}
                >
                  ₹
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={principal}
                  onChange={(e) => setPrincipal(e.target.value)}
                  placeholder="50,000"
                  style={{ ...baseInput, paddingLeft: 34 }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = GOLD)}
                  onBlur={(e)  => (e.currentTarget.style.borderColor = GOLDB)}
                />
              </div>
            </div>

            {/* Rate + Tenure — 2-col grid with minmax(0) to prevent overflow */}
            <div
              style={{
                display:             'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap:                 12,
              }}
            >
              <div>
                <span style={fieldLabel}>Rate p.a.</span>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={rate}
                    onChange={(e) => handleRateInput(e.target.value)}
                    placeholder="7.10"
                    style={{ ...baseInput, paddingRight: 28 }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = GOLD)}
                    onBlur={(e)  => (e.currentTarget.style.borderColor = GOLDB)}
                  />
                  <span
                    style={{
                      position:      'absolute',
                      right:         11,
                      top:           '50%',
                      transform:     'translateY(-50%)',
                      fontFamily:    MONO,
                      fontSize:      11,
                      fontWeight:    600,
                      color:         MUTED,
                      pointerEvents: 'none',
                      userSelect:    'none',
                    }}
                  >
                    %
                  </span>
                </div>
              </div>

              <div>
                <span style={fieldLabel}>Tenure</span>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={years}
                    onChange={(e) => setYears(e.target.value)}
                    placeholder="3"
                    style={{ ...baseInput, paddingRight: 36 }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = GOLD)}
                    onBlur={(e)  => (e.currentTarget.style.borderColor = GOLDB)}
                  />
                  <span
                    style={{
                      position:      'absolute',
                      right:         11,
                      top:           '50%',
                      transform:     'translateY(-50%)',
                      fontFamily:    MONO,
                      fontSize:      11,
                      fontWeight:    600,
                      color:         MUTED,
                      pointerEvents: 'none',
                      userSelect:    'none',
                    }}
                  >
                    {yrLbl}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Result card ── */}
        <section
          style={{
            borderRadius: 10,
            background:   INK,
            overflow:     'hidden',
          }}
        >
          {/* gold top rule */}
          <div
            style={{
              height:     1,
              background: `linear-gradient(90deg, transparent, ${GOLD} 25%, ${GOLD} 75%, transparent)`,
            }}
          />

          <div style={{ padding: '22px 20px 22px' }}>

            {/* label + icon */}
            <div
              style={{
                display:        'flex',
                justifyContent: 'space-between',
                alignItems:     'center',
                marginBottom:   14,
              }}
            >
              <span
                style={{
                  fontFamily:    MONO,
                  fontSize:      9,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color:         'rgba(255,255,255,0.32)',
                  fontWeight:    500,
                }}
              >
                Estimated maturity value
              </span>
              <TrendingUp size={14} color={`${GOLD}88`} />
            </div>

            {/* maturity amount */}
            <div
              style={{
                fontFamily:    SERIF,
                fontSize:      result ? 38 : 30,
                fontWeight:    600,
                color:         result ? WHITE : 'rgba(255,255,255,0.16)',
                lineHeight:    1,
                letterSpacing: '-0.01em',
                wordBreak:     'break-word',
                transition:    'all 0.2s',
              }}
            >
              {result ? fmt(result.maturity) : '₹ — — —'}
            </div>

            {/* growth tag */}
            <div
              style={{
                marginTop:  8,
                minHeight:  18,
                fontSize:   12,
                fontWeight: 500,
                color:      result ? `${GOLD}BB` : 'transparent',
                transition: 'color 0.2s',
              }}
            >
              {result
                ? `+${result.growthPct}% total growth · ${result.years} ${result.years === 1 ? 'year' : 'years'}`
                : 'x'}
            </div>

            {/* progress bar */}
            <div
              style={{
                margin:       '20px 0 22px',
                height:       2,
                borderRadius: 2,
                background:   'rgba(255,255,255,0.09)',
                overflow:     'hidden',
              }}
            >
              <div
                style={{
                  height:       '100%',
                  width:        result ? `${result.barPct}%` : '0%',
                  background:   `linear-gradient(90deg, ${GOLD}80, ${GOLD})`,
                  borderRadius: 2,
                  transition:   'width 0.55s cubic-bezier(0.4,0,0.2,1)',
                }}
              />
            </div>

            {/* breakdown or empty hint */}
            {result ? (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                {[
                  { label: 'Principal',           value: fmt(result.principal),              accent: false },
                  { label: 'Interest earned',     value: `+ ${fmt(result.interest)}`,        accent: true  },
                  { label: 'Effective rate p.a.', value: `${result.effRate}%`,               accent: false },
                ].map((row, i, arr) => (
                  <div
                    key={row.label}
                    style={{
                      display:        'flex',
                      justifyContent: 'space-between',
                      alignItems:     'center',
                      padding:        '12px 0',
                      borderBottom:   i < arr.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                    }}
                  >
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)' }}>
                      {row.label}
                    </span>
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize:   13,
                        fontWeight: 500,
                        color:      row.accent ? '#E8D0A0' : WHITE,
                      }}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p
                style={{
                  fontSize:      12,
                  color:         'rgba(255,255,255,0.2)',
                  textAlign:     'center',
                  padding:       '2px 0 4px',
                  letterSpacing: '0.01em',
                  margin:        0,
                }}
              >
                Enter amount, rate &amp; tenure to see results
              </p>
            )}

          </div>
        </section>

      </div>
    </div>
  );
}