import { useMemo, useState } from 'react';
import { ArrowLeft, Building2, Landmark, Monitor } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

const BANK_RATES = [
  { label: 'SBI', rate: 7.1 },
  { label: 'HDFC', rate: 7.25 },
  { label: 'ICICI', rate: 7.5 },
  { label: 'IDFC', rate: 8.05 },
];

export default function FdCalcScreen() {
  const { setStep } = useAppStore();
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [years, setYears] = useState('');
  const [activeBank, setActiveBank] = useState<string | null>(null);

  const result = useMemo(() => {
    const p = parseFloat(principal);
    const r = parseFloat(rate);
    const t = parseFloat(years);

    if (
      Number.isNaN(p) ||
      Number.isNaN(r) ||
      Number.isNaN(t) ||
      p <= 0 ||
      r <= 0 ||
      t <= 0
    ) {
      return null;
    }

    const n = 4;
    const maturity = p * Math.pow(1 + (r / 100) / n, n * t);
    const interest = maturity - p;
    const growthPct = ((interest / p) * 100).toFixed(1);
    const effRate = ((interest / p / t) * 100).toFixed(2);
    const barPct = Math.min(96, Math.max(10, Math.round((interest / maturity) * 100)));

    return {
      maturity,
      interest,
      growthPct,
      effRate,
      barPct,
      principal: p,
      years: t,
      rate: r,
    };
  }, [principal, rate, years]);

  const fmt = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

  const handleBankPick = (bank: (typeof BANK_RATES)[0]) => {
    setRate(String(bank.rate));
    setActiveBank(bank.label);
  };

  const resetBankPickIfManual = (nextRate: string) => {
    setRate(nextRate);
    setActiveBank(null);
  };

  const yearsLabel =
    years && !Number.isNaN(parseFloat(years)) && parseFloat(years) === 1 ? 'yr' : 'yrs';

  return (
    <div
      className="mx-auto flex min-h-screen min-h-[100dvh] w-full max-w-[480px] flex-col bg-[#FAF6EE] shadow-xl"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="sticky top-0 z-20 border-b border-[#D4A853]/20 bg-[#FAF6EE]/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 pt-4 pb-3 sm:px-5">
          <button
            onClick={() => setStep('home')}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D4A853]/45 bg-white text-[#5C1A1A] transition-colors hover:bg-[#F8EFD8] focus:outline-none focus:ring-2 focus:ring-[#D4A853]"
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="flex flex-col items-center">
            <h1
              className="text-lg font-bold text-[#5C1A1A]"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Fixed Deposit
            </h1>
            <div className="mt-1 flex items-center gap-1.5">
              <Monitor size={11} className="text-[#9B5A3C]" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9B5A3C]">
                Yield Calculator
              </span>
            </div>
          </div>

          <div className="w-10" />
        </div>
      </div>

      <div className="flex-1 px-4 pb-8 pt-5 sm:px-5">
        <div className="space-y-5">
          {/* Quick Pick Section */}
          <section className="rounded-[22px] border border-[#D4A853]/25 bg-white px-4 py-4 shadow-[0_8px_24px_rgba(92,26,26,0.04)]">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9B5A3C]">
                  Quick pick
                </p>
                <h2 className="mt-1 text-sm font-semibold text-[#5C1A1A] sm:text-[15px]">
                  Current FD rates
                </h2>
              </div>
              <div className="rounded-full bg-[#FAF6EE] p-2 text-[#9B5A3C]">
                <Landmark size={15} />
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {BANK_RATES.map((bank) => {
                const isActive = activeBank === bank.label;
                return (
                  <button
                    key={bank.label}
                    onClick={() => handleBankPick(bank)}
                    className="rounded-full border px-3.5 py-2 text-[12px] font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#D4A853]"
                    style={{
                      background: isActive ? '#F5E8C8' : 'white',
                      borderColor: isActive ? '#D4A853' : 'rgba(212,168,83,0.35)',
                      color: isActive ? '#5C1A1A' : '#9B5A3C',
                      boxShadow: isActive ? '0 4px 14px rgba(212,168,83,0.14)' : 'none',
                    }}
                  >
                    {bank.label} {bank.rate}%
                  </button>
                );
              })}
            </div>
          </section>

          {/* Input Details Section */}
          <section className="rounded-[22px] border border-[#D4A853]/30 bg-white p-4 shadow-[0_10px_28px_rgba(92,26,26,0.05)]">
            <div className="mb-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9B5A3C]">
                Input details
              </p>
              <h2 className="mt-1 text-base font-semibold text-[#5C1A1A]">
                Enter your deposit details
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9B5A3C]">
                  Investment Amount
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-semibold text-[#9B5A3C]">
                    ₹
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={principal}
                    onChange={(e) => setPrincipal(e.target.value)}
                    placeholder="50,000"
                    className="w-full rounded-2xl border border-[#D4A853]/35 bg-[#FDF6E7] py-3.5 pl-9 pr-4 text-base font-semibold text-[#5C1A1A] outline-none transition-all placeholder:text-[#B58D6B] focus:border-[#D4A853] focus:ring-2 focus:ring-[#D4A853]/20 sm:text-[17px]"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
                <div>
                  <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9B5A3C]">
                    Rate
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={rate}
                      onChange={(e) => resetBankPickIfManual(e.target.value)}
                      placeholder="7.1"
                      className="w-full rounded-2xl border border-[#D4A853]/35 bg-[#FDF6E7] py-3.5 pl-4 pr-8 text-base font-semibold text-[#5C1A1A] outline-none transition-all placeholder:text-[#B58D6B] focus:border-[#D4A853] focus:ring-2 focus:ring-[#D4A853]/20"
                      style={{ fontFamily: "'DM Mono', monospace" }}
                    />
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-semibold text-[#9B5A3C]">
                      %
                    </span>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9B5A3C]">
                    Tenure
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={years}
                      onChange={(e) => setYears(e.target.value)}
                      placeholder="3"
                      className="w-full rounded-2xl border border-[#D4A853]/35 bg-[#FDF6E7] py-3.5 pl-4 pr-10 text-base font-semibold text-[#5C1A1A] outline-none transition-all placeholder:text-[#B58D6B] focus:border-[#D4A853] focus:ring-2 focus:ring-[#D4A853]/20"
                      style={{ fontFamily: "'DM Mono', monospace" }}
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-semibold text-[#9B5A3C] sm:right-4">
                      {yearsLabel}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Results Section */}
          <section className="relative overflow-hidden rounded-[24px] bg-[#5C1A1A] px-4 py-5 shadow-[0_14px_32px_rgba(92,26,26,0.18)] sm:p-5">
            <div
              className="absolute -right-8 -top-8 h-28 w-28 rounded-full border border-[#D4A853]/15"
              aria-hidden="true"
            />
            <div
              className="absolute -right-14 -top-14 h-44 w-44 rounded-full border border-[#D4A853]/10"
              aria-hidden="true"
            />

            <div className="relative z-10">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50">
                    Estimated returns
                  </p>
                  <h2 className="mt-1 text-sm font-semibold text-white sm:text-[15px]">
                    Maturity value
                  </h2>
                </div>
                <div className="rounded-full bg-white/10 p-2 text-[#F5E8C8]">
                  <Building2 size={15} />
                </div>
              </div>

              {!result ? (
                <div className="pt-1">
                  <p
                    className="mb-3 text-[30px] font-semibold text-white/30"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    ₹ — — —
                  </p>
                  <div className="mb-4 h-2 w-full rounded-full bg-white/10" />
                  <p className="text-center text-[13px] leading-relaxed text-white/40">
                    Add your amount, rate, and tenure to see the final maturity value.
                  </p>
                </div>
              ) : (
                <div>
                  <p
                    className="break-words text-2xl font-semibold leading-tight text-white sm:text-[31px]"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    {fmt(result.maturity)}
                  </p>
                  <p className="mt-1 text-[13px] font-medium text-[#F5E8C8]">
                    +{result.growthPct}% total growth over {result.years} {result.years === 1 ? 'year' : 'years'}
                  </p>

                  <div className="mt-4 mb-5 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-[#D4A853] transition-all duration-500 ease-out"
                      style={{ width: `${result.barPct}%` }}
                    />
                  </div>

                  <div className="space-y-0">
                    {[
                      {
                        label: 'Principal',
                        value: fmt(result.principal),
                        accent: false,
                      },
                      {
                        label: 'Interest earned',
                        value: `+ ${fmt(result.interest)}`,
                        accent: true,
                      },
                      {
                        label: 'Effective rate',
                        value: `${result.effRate}% p.a.`,
                        accent: false,
                      },
                    ].map((row, index, arr) => (
                      <div
                        key={row.label}
                        className="flex items-center justify-between py-3"
                        style={{
                          borderBottom:
                            index < arr.length - 1
                              ? '1px solid rgba(255,255,255,0.08)'
                              : 'none',
                        }}
                      >
                        <span className="text-[13px] text-white/60">{row.label}</span>
                        <span
                          className="text-sm font-semibold sm:text-[14px]"
                          style={{
                            fontFamily: "'DM Mono', monospace",
                            color: row.accent ? '#F5E8C8' : 'white',
                          }}
                        >
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}