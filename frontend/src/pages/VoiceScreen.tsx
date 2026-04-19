import { useState, useRef, useEffect } from 'react';
import { Mic, Square, ArrowLeft, Volume2, Sparkles, CheckCircle2, Brain } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { processVoice } from '../lib/api';

const FINANCE_FACTS = [
    { emoji: "💰", factEn: "Warren Buffett made over 99% of his wealth after his 50th birthday — patience is the real alpha.", factHi: "वॉरेन बफे ने अपनी 99% संपत्ति 50वें जन्मदिन के बाद बनाई — धैर्य ही असली कुंजी है।" },
    { emoji: "🧂", factEn: 'The word "salary" comes from Latin — soldiers in ancient Rome were paid in salt.', factHi: 'शब्द "सैलरी" लैटिन से आया है — प्राचीन रोम में सैनिकों को नमक में भुगतान किया जाता था।' },
    { emoji: "📈", factEn: "The longest U.S. bull market ran from March 2009 to February 2020 — nearly 11 unbroken years.", factHi: "सबसे लंबा अमेरिकी बुल मार्केट मार्च 2009 से फरवरी 2020 तक चला — लगभग 11 साल तक।" },
    { emoji: "🍽️", factEn: "The first credit card (Diners Club, 1950) was invented after Frank McNamara forgot his wallet at dinner.", factHi: "पहला क्रेडिट कार्ड 1950 में तब बना जब फ्रैंक मैकनमार डिनर पर अपना बटुआ भूल गए थे।" },
    { emoji: "🌾", factEn: "Japan's Osaka Rice Exchange in 1697 is considered the world's first futures market.", factHi: "1697 में जापान का ओसाका राइस एक्सचेंज दुनिया का पहला फ्यूचर्स मार्केट माना जाता है।" },
    { emoji: "🌳", factEn: "The NYSE was founded under a buttonwood tree in 1792 by just 24 stockbrokers.", factHi: "न्यूयॉर्क स्टॉक एक्सचेंज की स्थापना 1792 में एक पेड़ के नीचे सिर्फ 24 ब्रोकरों द्वारा हुई थी।" },
    { emoji: "🚢", factEn: "The Dutch East India Company (1602) was the first company to issue public stock to the world.", factHi: "डच ईस्ट इंडिया कंपनी (1602) दुनिया में पब्लिक स्टॉक जारी करने वाली पहली कंपनी थी।" },
    { emoji: "📦", factEn: "Index funds now hold more U.S. stocks than active funds — a quiet revolution by Jack Bogle.", factHi: "अब एक्टिव फंड्स की तुलना में इंडेक्स फंड्स में अधिक पैसा है — जैक बोगल की एक शांत क्रांति!" },
    { emoji: "🔢", factEn: "A $1 investment in the S&P 500 in 1928 would be worth over $7,000 today, inflation-adjusted.", factHi: "1928 में S&P 500 में 1 डॉलर का निवेश आज 7,000 डॉलर से अधिक का होगा।" },
    { emoji: "✨", factEn: "Compound interest: even a 1% daily gain doubles your money in just ~70 days.", factHi: "कंपाउंड इंटरेस्ट: रोज़ाना 1% की बढ़त आपके पैसे को सिर्फ ~70 दिनों में दोगुना कर देती है।" },
];

export default function VoiceScreen() {
    const { session, messages, language, persona, voiceState, setVoiceState, setStep } = useAppStore();

    const [bullets, setBullets] = useState<string[]>([]);
    const [recordingTime, setRecordingTime] = useState(0);
    const [errorMsg, setErrorMsg] = useState('');
    const [factIndex, setFactIndex] = useState(0);
    const [factAnimating, setFactAnimating] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<number | null>(null);
    const factTimerRef = useRef<number | null>(null);
    const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (messages?.length > 0) {
            const allBullets: string[] = [];
            messages.forEach(m => {
                if (m.role === 'assistant' && m.content.includes('\n\nKey Points:\n- ')) {
                    const parts = m.content.split('\n\nKey Points:\n- ');
                    if (parts.length > 1) allBullets.push(...parts[1].split('\n- '));
                }
            });
            setBullets(allBullets);
        }
    }, [messages]);

    useEffect(() => {
        if (voiceState === 'recording') {
            timerRef.current = window.setInterval(() => setRecordingTime(t => t + 1), 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
            setRecordingTime(0);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [voiceState]);

    useEffect(() => {
        if (voiceState === 'processing') {
            setFactIndex(Math.floor(Math.random() * FINANCE_FACTS.length));
            factTimerRef.current = window.setInterval(() => {
                setFactAnimating(true);
                setTimeout(() => {
                    setFactIndex(i => (i + 1) % FINANCE_FACTS.length);
                    setFactAnimating(false);
                }, 350);
            }, 5000);
        } else {
            if (factTimerRef.current) clearInterval(factTimerRef.current);
        }
        return () => { if (factTimerRef.current) clearInterval(factTimerRef.current); };
    }, [voiceState]);

    const formatTime = (s: number) =>
        `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

    const startRecording = async () => {
        setErrorMsg('');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];
            mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
            mediaRecorder.onstop = async () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                stream.getTracks().forEach(t => t.stop());
                await handleProcessAudio(blob);
            };
            mediaRecorder.start();
            setVoiceState('recording');
        } catch {
            setErrorMsg('Microphone permission denied.');
            setVoiceState('permission-denied');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
    };

    const handleProcessAudio = async (blob: Blob) => {
        if (!session) return;
        setVoiceState('processing');
        setErrorMsg('');
        try {
            const res = await processVoice(session.id, language, persona, blob);
            setBullets(prev => [...prev, ...res.bullets]);
            if (res.audio) {
                setVoiceState('playing');
                const audio = new Audio(`data:audio/mpeg;base64,${res.audio}`);
                audioPlayerRef.current = audio;
                audio.onended = () => setVoiceState('idle');
                await audio.play();
            } else {
                setVoiceState('idle');
            }
        } catch (err: any) {
            setErrorMsg(err.response?.data?.detail || 'Failed to process audio.');
            setVoiceState('error');
        }
    };

    const handleBack = () => { audioPlayerRef.current?.pause(); setStep('home'); };

    if (!session) { setStep('home'); return null; }

    const isIdle = ['idle', 'error', 'permission-denied'].includes(voiceState);
    const isRecording = voiceState === 'recording';
    const isProcessing = voiceState === 'processing';
    const isPlaying = voiceState === 'playing';
    const currentFact = FINANCE_FACTS[factIndex];

    return (
        <div
            className="flex flex-col h-dvh bg-[#FAF6EE] max-w-[480px] mx-auto relative overflow-hidden"
            style={{ fontFamily: "'Georgia', serif" }}
        >
            {/* Top Bar */}
            <div
                className="flex items-center justify-between px-5 pt-5 pb-4 bg-[#FAF6EE] z-10"
                style={{ borderBottom: '1px solid rgba(212,168,83,0.3)' }}
            >
                <button
                    onClick={handleBack}
                    className="w-9 h-9 rounded-full border border-[#D4A853] bg-white flex items-center justify-center text-[#5C1A1A] hover:bg-[#F5E8C8] transition-colors"
                >
                    <ArrowLeft size={17} />
                </button>
                <div className="text-center">
                    <h2 className="font-bold text-[17px] text-[#5C1A1A] capitalize">{persona}</h2>
                    <div className="flex items-center justify-center gap-1.5 mt-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isPlaying ? 'bg-amber-500' : 'bg-green-500'}`} />
                        <span className="text-[10px] font-semibold text-[#9B5A3C] uppercase tracking-widest">
                            {isPlaying ? 'Playing' : isRecording ? 'Recording' : isProcessing ? 'Thinking' : 'Voice Active'}
                        </span>
                    </div>
                </div>
                <div className="w-9" />
            </div>

            {/* ── PROCESSING STATE — full-screen takeover ── */}
            {isProcessing && (
                <div className="flex-1 flex flex-col overflow-hidden">

                    {/* Hero section */}
                    <div
                        className="flex flex-col items-center justify-center pt-10 pb-8 px-6"
                        style={{ background: 'linear-gradient(160deg, #5C1A1A 0%, #7B2D1A 60%, #8B4513 100%)' }}
                    >
                        {/* Pulsing orb */}
                        <div className="relative mb-5">
                            <div
                                className="w-20 h-20 rounded-full flex items-center justify-center"
                                style={{ background: 'rgba(212,168,83,0.2)', border: '1.5px solid rgba(212,168,83,0.5)' }}
                            >
                                <Brain size={32} className="text-[#D4A853]" strokeWidth={1.5} />
                            </div>
                            <div className="absolute inset-0 rounded-full animate-ping" style={{ border: '1px solid rgba(212,168,83,0.35)' }} />
                            <div className="absolute rounded-full animate-ping" style={{ inset: '-8px', border: '1px solid rgba(212,168,83,0.15)', animationDelay: '0.4s' }} />
                        </div>

                        <p className="text-white font-bold text-[18px] mb-1" style={{ fontFamily: 'Georgia, serif' }}>
                            {language === 'hi' ? 'सोच रही हूँ…' : 'Crafting your answer…'}
                        </p>
                        <p className="text-[12px] italic" style={{ color: 'rgba(255,255,255,0.5)' }}>This may take a few seconds</p>

                        {/* Waveform */}
                        <div className="flex items-end gap-[3px] mt-5 h-6">
                            {Array.from({ length: 11 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="w-[3px] rounded-full bg-[#D4A853]"
                                    style={{
                                        height: '4px',
                                        opacity: 0.65,
                                        animation: 'waveBar 1s ease-in-out infinite',
                                        animationDelay: `${i * 0.09}s`,
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Fact card */}
                    <div
                        className="flex-1 flex flex-col mx-4 my-4 rounded-2xl overflow-hidden"
                        style={{ border: '1px solid rgba(212,168,83,0.45)', background: 'white' }}
                    >
                        {/* Card header */}
                        <div
                            className="flex items-center gap-2 px-5 py-3"
                            style={{ borderBottom: '1px solid rgba(212,168,83,0.2)', background: '#FDF6E7' }}
                        >
                            <Sparkles size={13} className="text-[#D4A853]" />
                            <span className="text-[10px] font-bold text-[#9B5A3C] uppercase tracking-widest">{language === 'hi' ? 'वित्तीय तथ्य' : 'Finance Fact'}</span>
                            <div className="flex gap-1 ml-auto">
                                {FINANCE_FACTS.map((_, i) => (
                                    <span
                                        key={i}
                                        className="w-1 h-1 rounded-full transition-all duration-300"
                                        style={{ background: i === factIndex ? '#D4A853' : 'rgba(212,168,83,0.25)' }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Fact content */}
                        <div
                            className="flex-1 flex flex-col items-center justify-center px-6 py-8 text-center gap-5"
                            style={{
                                opacity: factAnimating ? 0 : 1,
                                transform: factAnimating ? 'translateY(8px)' : 'translateY(0)',
                                transition: 'opacity 0.35s ease, transform 0.35s ease',
                            }}
                        >
                            <div
                                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                                style={{ background: '#FDF6E7', border: '1px solid rgba(212,168,83,0.3)' }}
                            >
                                {currentFact.emoji}
                            </div>
                            <p className="text-[15px] text-[#5C1A1A] leading-relaxed italic max-w-[260px]">
                                "{language === 'hi' ? currentFact.factHi : currentFact.factEn}"
                            </p>
                        </div>

                        {/* Progress bar */}
                        <div className="px-5 pb-5">
                            <div className="w-full h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(212,168,83,0.2)' }}>
                                <div
                                    className="h-full rounded-full bg-[#D4A853]"
                                    key={factIndex}
                                    style={{ animation: 'progressBar 5s linear forwards', width: '0%' }}
                                />
                            </div>
                            <p className="text-center text-[11px] text-[#9B5A3C] mt-2 italic">
                                {language === 'hi' ? 'अगला तथ्य कुछ सेकंड में…' : 'Next fact in a few seconds…'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* ── NON-PROCESSING STATES ── */}
            {!isProcessing && (
                <div className="flex-1 overflow-y-auto px-5 pt-4 pb-36 space-y-4">

                    {bullets.length === 0 && !isRecording && (
                        <div className="flex flex-col items-center justify-center min-h-[55vh] gap-5 text-center">
                            <div
                                className="relative w-24 h-24 rounded-full bg-[#F5E8C8] flex items-center justify-center"
                                style={{ border: '1.5px solid #D4A853' }}
                            >
                                <Mic size={38} className="text-[#5C1A1A] opacity-70" strokeWidth={1.5} />
                                <span className="absolute inset-0 rounded-full animate-ping opacity-25" style={{ border: '1px solid #D4A853' }} />
                            </div>
                            <div>
                                <p className="font-bold text-[19px] text-[#5C1A1A]">
                                    {language === 'hi' ? 'मैं सुन रही हूँ' : "I'm listening…"}
                                </p>
                                <p className="text-[13px] text-[#9B5A3C] italic max-w-[210px] mx-auto mt-2 leading-relaxed">
                                    {language === 'hi' ? 'तैयार होने पर माइक बटन दबाएं।' : "Tap the mic button when you're ready to speak."}
                                </p>
                            </div>
                        </div>
                    )}

                    {isRecording && (
                        <div className="flex flex-col items-center justify-center py-14 gap-5">
                            <p className="font-bold text-[17px] text-[#5C1A1A]">Listening…</p>
                            <div className="flex items-end gap-1 h-10">
                                {Array.from({ length: 9 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-[3px] rounded-full bg-[#D4A853]"
                                        style={{ height: '5px', animation: 'waveBar 0.9s ease-in-out infinite', animationDelay: `${i * 0.1}s` }}
                                    />
                                ))}
                            </div>
                            <p className="text-[12px] text-[#9B5A3C] italic">Speak clearly — I'll capture every word</p>
                        </div>
                    )}

                    {bullets.length > 0 && (
                        <div className="bg-white rounded-2xl overflow-hidden shadow-sm" style={{ border: '1px solid rgba(212,168,83,0.5)' }}>
                            <div
                                className="flex items-center gap-2 px-5 py-3.5"
                                style={{ borderBottom: '1px solid rgba(212,168,83,0.15)', background: '#FDF6E7' }}
                            >
                                <CheckCircle2 size={13} className="text-[#D4A853]" />
                                <span className="text-[10px] font-bold text-[#9B5A3C] uppercase tracking-widest">Key Takeaways</span>
                            </div>
                            <ul>
                                {bullets.map((point, i) => (
                                    <li
                                        key={i}
                                        className="flex gap-3 px-5 py-3.5"
                                        style={{ borderBottom: i < bullets.length - 1 ? '1px solid rgba(212,168,83,0.1)' : 'none' }}
                                    >
                                        <span className="w-5 h-5 rounded-full bg-[#F5E8C8] text-[#5C1A1A] text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                                            {i + 1}
                                        </span>
                                        <span className="text-[14px] leading-relaxed text-[#5C1A1A]">{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* Error banner */}
            {errorMsg && (
                <div className="absolute bottom-[108px] left-4 right-4 bg-red-50 border border-red-200 text-red-600 text-[13px] font-medium p-3 rounded-xl text-center shadow z-20 animate-fade-in">
                    {errorMsg}
                </div>
            )}

            {/* Bottom controls — hidden during processing */}
            {!isProcessing && (
                <div
                    className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-7 pt-4 z-10"
                    style={{ background: 'linear-gradient(to top, #FAF6EE 70%, transparent)' }}
                >
                    {isIdle && (
                        <button
                            onClick={startRecording}
                            className="w-[72px] h-[72px] rounded-full bg-[#5C1A1A] flex flex-col items-center justify-center gap-1 text-white transition-transform active:scale-95"
                            style={{ boxShadow: '0 6px 24px rgba(92,26,26,0.35)' }}
                        >
                            <Mic size={26} strokeWidth={1.8} />
                            <span className="text-[9px] font-bold tracking-wider uppercase opacity-80">Tap</span>
                        </button>
                    )}
                    {isRecording && (
                        <div className="flex flex-col items-center gap-3">
                            <div className="bg-white border border-[#D4A853] text-[#5C1A1A] text-[14px] font-bold px-5 py-1 rounded-full font-mono tracking-widest shadow-sm">
                                {formatTime(recordingTime)}
                            </div>
                            <button
                                onClick={stopRecording}
                                className="w-[72px] h-[72px] rounded-full bg-red-700 flex flex-col items-center justify-center gap-1 text-white active:scale-95"
                                style={{ boxShadow: '0 6px 24px rgba(185,28,28,0.4)', animation: 'pulseRec 1.8s ease-in-out infinite' }}
                            >
                                <Square size={22} fill="currentColor" strokeWidth={0} />
                                <span className="text-[9px] font-bold tracking-wider uppercase opacity-85">Stop</span>
                            </button>
                        </div>
                    )}
                    {isPlaying && (
                        <div
                            className="w-[72px] h-[72px] rounded-full bg-[#F5E8C8] flex flex-col items-center justify-center gap-1 cursor-not-allowed"
                            style={{ border: '1.5px solid #D4A853' }}
                        >
                            <Volume2 size={26} className="animate-pulse text-[#5C1A1A]" />
                            <span className="text-[9px] font-bold tracking-wider uppercase text-[#9B5A3C]">Playing</span>
                        </div>
                    )}
                </div>
            )}

            <style>{`
                @keyframes waveBar { 0%,100%{height:4px;opacity:.3} 50%{height:22px;opacity:1} }
                @keyframes pulseRec { 0%,100%{box-shadow:0 6px 24px rgba(185,28,28,.4)} 50%{box-shadow:0 6px 32px rgba(185,28,28,.7)} }
                @keyframes progressBar { 0%{width:0%} 100%{width:100%} }
                @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
                .animate-fade-in { animation: fadeIn .3s ease; }
            `}</style>
        </div>
    );
}