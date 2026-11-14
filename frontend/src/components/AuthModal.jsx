import { useEffect, useRef, useState } from "react";
import { AuthApi } from "../services/api";
import { loadScriptOnce } from "../utils/formatters";

export default function AuthModal({ isOpen, providers, onClose, onAuthenticated }) {
    const [tab, setTab] = useState("login");
    const [errorMsg, setErrorMsg] = useState("");
    const [showGoogleSlot, setShowGoogleSlot] = useState(false);

    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [registerName, setRegisterName] = useState("");
    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");

    const googleSlotRef = useRef(null);
    const msPollRef = useRef(null);

    useEffect(() => {
        if (!isOpen) {
            setErrorMsg("");
            setShowGoogleSlot(false);
            clearInterval(msPollRef.current);
            return;
        }
        setTab("login");
        setErrorMsg("");
    }, [isOpen]);

    useEffect(() => {
        return () => clearInterval(msPollRef.current);
    }, []);

    if (!isOpen) return null;

    function handleSwitchTab(nextTab) {
        setErrorMsg("");
        setTab(nextTab);
    }

    async function handleLoginSubmit(e) {
        e.preventDefault();
        setErrorMsg("");
        try {
            const resp = await AuthApi.login({
                email: loginEmail.trim(),
                password: loginPassword
            });
            await onAuthenticated(resp);
        } catch (err) {
            setErrorMsg(err.message);
        }
    }

    async function handleRegisterSubmit(e) {
        e.preventDefault();
        setErrorMsg("");
        try {
            const resp = await AuthApi.register({
                name: registerName.trim(),
                email: registerEmail.trim(),
                password: registerPassword
            });
            await onAuthenticated(resp);
        } catch (err) {
            setErrorMsg(err.message);
        }
    }

    async function handleGoogleLogin() {
        setErrorMsg("");
        if (!providers.googleEnabled || !providers.googleClientId) {
            setErrorMsg("Login com Google (Gmail) requer GOOGLE_CLIENT_ID configurado no backend. Por enquanto, você pode criar sua conta usando seu @gmail.com logo abaixo.");
            return;
        }
        try {
            await loadScriptOnce("https://accounts.google.com/gsi/client");
            window.google.accounts.id.initialize({
                client_id: providers.googleClientId,
                callback: async (response) => {
                    try {
                        const authResp = await AuthApi.loginWithGoogle(response.credential);
                        await onAuthenticated(authResp);
                    } catch (err) {
                        setErrorMsg(err.message);
                    }
                }
            });
            setShowGoogleSlot(true);
            setTimeout(() => {
                if (googleSlotRef.current) {
                    window.google.accounts.id.renderButton(googleSlotRef.current, {
                        theme: "outline",
                        size: "large",
                        width: "100%"
                    });
                }
                window.google.accounts.id.prompt();
            }, 0);
        } catch {
            setErrorMsg("Não foi possível carregar o login do Google.");
        }
    }

    function handleMicrosoftLogin() {
        setErrorMsg("");
        if (!providers.microsoftEnabled || !providers.microsoftClientId) {
            setErrorMsg("Login com Microsoft (Outlook) requer MICROSOFT_CLIENT_ID configurado no backend. Por enquanto, você pode criar sua conta usando seu @outlook.com logo abaixo.");
            return;
        }
        const redirectUri = window.location.origin + window.location.pathname;
        const authUrl = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize"
            + `?client_id=${encodeURIComponent(providers.microsoftClientId)}`
            + "&response_type=token"
            + `&redirect_uri=${encodeURIComponent(redirectUri)}`
            + `&scope=${encodeURIComponent("User.Read openid email profile")}`;

        const popup = window.open(authUrl, "ms_oauth", "width=500,height=620");
        if (!popup) {
            setErrorMsg("Habilite pop-ups no navegador para entrar com a Microsoft.");
            return;
        }
        clearInterval(msPollRef.current);
        msPollRef.current = setInterval(async () => {
            try {
                if (popup.closed) {
                    clearInterval(msPollRef.current);
                    return;
                }
                if (popup.location.origin === window.location.origin && popup.location.hash.includes("access_token=")) {
                    const hashParams = new URLSearchParams(popup.location.hash.substring(1));
                    const accessToken = hashParams.get("access_token");
                    popup.close();
                    clearInterval(msPollRef.current);
                    if (accessToken) {
                        const authResp = await AuthApi.loginWithMicrosoft(accessToken);
                        await onAuthenticated(authResp);
                    }
                }
            } catch {
                // cross-origin while user is still on login.microsoftonline.com
            }
        }, 400);
    }

    return (
        <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="authModalTitle"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="modal-card modal-card-lg">
                <div className="modal-header">
                    <h2 id="authModalTitle">Entrar ou Criar Conta</h2>
                    <button type="button" className="icon-close-btn" aria-label="Fechar" onClick={onClose}>
                        &times;
                    </button>
                </div>

                <p className="auth-subtitle">
                    Crie sua conta ou faça login para cadastrar sua loja (R$ 50,00/mês no Pix) e solicitar alterações.
                </p>

                <div className="oauth-buttons-stack">
                    <button type="button" className="oauth-btn oauth-google" onClick={handleGoogleLogin}>
                        <span className="oauth-icon">G</span>
                        <span>Continuar com Google (Gmail)</span>
                    </button>
                    <button type="button" className="oauth-btn oauth-microsoft" onClick={handleMicrosoftLogin}>
                        <span className="oauth-icon">M</span>
                        <span>Continuar com Microsoft (Outlook)</span>
                    </button>
                </div>

                {showGoogleSlot && <div ref={googleSlotRef} className="google-gsi-slot" />}

                <div className="auth-divider"><span>ou use seu e-mail e senha</span></div>

                <div className="session-switcher" role="tablist">
                    <button
                        type="button"
                        className={`session-tab${tab === "login" ? " active" : ""}`}
                        role="tab"
                        aria-selected={tab === "login"}
                        onClick={() => handleSwitchTab("login")}
                    >
                        Entrar
                    </button>
                    <button
                        type="button"
                        className={`session-tab${tab === "register" ? " active" : ""}`}
                        role="tab"
                        aria-selected={tab === "register"}
                        onClick={() => handleSwitchTab("register")}
                    >
                        Criar Conta
                    </button>
                </div>

                {errorMsg && (
                    <div className="logo-upload-error" role="alert">
                        {errorMsg}
                    </div>
                )}

                {tab === "login" ? (
                    <form className="company-form" onSubmit={handleLoginSubmit}>
                        <label>
                            E-mail *
                            <input
                                type="email"
                                required
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                                placeholder="seunome@gmail.com ou @outlook.com"
                            />
                        </label>
                        <label>
                            Senha *
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                placeholder="Sua senha"
                            />
                        </label>
                        <button type="submit" className="btn-primary">Entrar com E-mail</button>
                    </form>
                ) : (
                    <form className="company-form" onSubmit={handleRegisterSubmit}>
                        <label>
                            Seu Nome Completo *
                            <input
                                type="text"
                                required
                                maxLength={120}
                                value={registerName}
                                onChange={(e) => setRegisterName(e.target.value)}
                                placeholder="Ex: Maria Silva"
                            />
                        </label>
                        <label>
                            E-mail (Gmail, Outlook ou outro) *
                            <input
                                type="email"
                                required
                                maxLength={180}
                                value={registerEmail}
                                onChange={(e) => setRegisterEmail(e.target.value)}
                                placeholder="maria@outlook.com"
                            />
                        </label>
                        <label>
                            Crie uma Senha (mínimo 6 caracteres) *
                            <input
                                type="password"
                                required
                                minLength={6}
                                maxLength={100}
                                value={registerPassword}
                                onChange={(e) => setRegisterPassword(e.target.value)}
                                placeholder="******"
                            />
                        </label>
                        <button type="submit" className="btn-primary">Criar Conta e Entrar</button>
                    </form>
                )}
            </div>
        </div>
    );
}
