import { useAppStore } from "./store/useAppStore";
import { GoogleOAuthProvider } from "@react-oauth/google";
import LanguageScreen from "./pages/LanguageScreen";
import PersonaScreen from "./pages/PersonaScreen";
import ChatScreen from "./pages/ChatScreen";
import VoiceScreen from "./pages/VoiceScreen";
import LoginScreen from "./pages/LoginScreen";
import HomeScreen from "./pages/HomeScreen";
import FdCalcScreen from "./pages/FdCalcScreen";

export default function App() {
  const { step } = useAppStore();

  // NOTE: Setup VITE_GOOGLE_CLIENT_ID in your .env
  const clientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID || "PASTE_YOUR_ID_IN_ENV_FILE";

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="min-h-dvh bg-[var(--cream)]">
        {step === "login" && <LoginScreen />}
        {step === "home" && <HomeScreen />}
        {step === "language" && <LanguageScreen />}
        {step === "persona" && <PersonaScreen />}
        {step === "chat" && <ChatScreen />}
        {step === "voice" && <VoiceScreen />}
        {step === "fd-calc" && <FdCalcScreen />}
      </div>
    </GoogleOAuthProvider>
  );
}
