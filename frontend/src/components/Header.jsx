import { useEffect, useState } from "react";

export default function Header({
    isLogged,
    user,
    isDrawerOpen,
    onOpenDrawer,
    onResetFilters,
    onOpenAccountOrAuth
}) {
    const [avatarError, setAvatarError] = useState(false);
    const avatarUrl = isLogged ? (user?.avatarUrl || "") : "";

    useEffect(() => {
        setAvatarError(false);
    }, [avatarUrl]);

    const firstName = (user?.name || "Conta").split(/\s+/)[0];

    return (
        <header className="topbar">
            <button
                type="button"
                className="icon-btn hamburger-btn"
                aria-label="Abrir menu"
                aria-expanded={isDrawerOpen}
                onClick={onOpenDrawer}
            >
                <span />
                <span />
                <span />
            </button>

            <a
                href="#inicio"
                className="brand-box"
                aria-label="Empreende Sede - Início"
                onClick={(e) => {
                    e.preventDefault();
                    onResetFilters();
                }}
            >
                Empreende Sede
            </a>

            <div className="topbar-right">
                <button
                    type="button"
                    className={`session-role-badge session-action-pill${isLogged ? " is-logged" : ""}`}
                    onClick={onOpenAccountOrAuth}
                >
                    {isLogged ? `👤 ${firstName}` : "Entrar"}
                </button>
                <button
                    type="button"
                    className="profile-btn"
                    aria-label="Abrir conta do usuário"
                    onClick={onOpenAccountOrAuth}
                >
                    {avatarUrl && !avatarError ? (
                        <img
                            src={avatarUrl}
                            alt={`Foto de ${user?.name || "usuário"}`}
                            className="header-avatar-img"
                            onError={() => setAvatarError(true)}
                        />
                    ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                            <circle cx="12" cy="8" r="4" />
                            <path d="M4 20c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
                        </svg>
                    )}
                </button>
            </div>
        </header>
    );
}
