import { useEffect, useState } from "react";
import { getInitials } from "../utils/formatters";

export default function CompanyShowcase({
    hasLoadedOnce,
    isLoading,
    companies,
    currentIndex,
    isLogged,
    currentUser,
    onResetFilter,
    onPrev,
    onNext,
    onEditCompany,
    onCopyPhone
}) {
    const company = companies[currentIndex] || null;
    const [logoError, setLogoError] = useState(false);

    useEffect(() => {
        setLogoError(false);
    }, [company?.id, company?.logoUrl]);

    if (!hasLoadedOnce && isLoading) {
        return (
            <main className="showcase-area">
                <div className="state-card">
                    <div className="spinner" />
                    <p>Carregando empresas...</p>
                </div>
            </main>
        );
    }

    if (companies.length === 0 || !company) {
        return (
            <main className={`showcase-area${isLoading ? " is-loading" : ""}`}>
                <div className="state-card">
                    <p>Nenhuma empresa encontrada para essa busca.</p>
                    <button type="button" className="btn-secondary" onClick={onResetFilter}>
                        Mostrar todas
                    </button>
                </div>
            </main>
        );
    }

    const canEditCurrent = Boolean(isLogged && currentUser && company.ownerId === currentUser.id);
    const phoneDigits = (company.phone || "").replace(/\D/g, "");
    const waDigits = (company.whatsapp || "").replace(/\D/g, "");
    const whatsappHref = waDigits
        ? `https://wa.me/${waDigits}?text=${encodeURIComponent(`Olá! Vi a ${company.name} no Empreende Sede.`)}`
        : "#";
    const instagramHandle = (company.instagram || "").replace(/^@/, "");
    const instagramHref = instagramHandle ? `https://instagram.com/${instagramHandle}` : "#";
    const badgeLabel = company.subsegment
        ? `${company.category || "Geral"} • ${company.subsegment}`
        : (company.category || "Geral");

    return (
        <main className={`showcase-area${isLoading ? " is-loading" : ""}`}>
            <article className="company-card" aria-live="polite">
                <div className="company-logo-frame">
                    {company.logoUrl && !logoError ? (
                        <img
                            src={company.logoUrl}
                            alt={`Logo de ${company.name}`}
                            className="company-logo-img"
                            onError={() => setLogoError(true)}
                        />
                    ) : (
                        <div className="company-logo-fallback">
                            <span>{getInitials(company.name)}</span>
                        </div>
                    )}
                    <span className="category-badge">{badgeLabel}</span>
                </div>

                <div className="company-description-box">
                    <div className="company-header-row">
                        <h1 className="company-name">{company.name}</h1>
                        <div className="card-actions">
                            {canEditCurrent && (
                                <button
                                    type="button"
                                    className="mini-action-btn"
                                    title="Editar minha loja"
                                    aria-label="Editar minha loja"
                                    onClick={() => onEditCompany(company)}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 20h9" />
                                        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>

                    <p className="company-description">{company.description}</p>

                    {canEditCurrent && company.hasPendingUpdate && (
                        <div className="company-pending-notice">
                            ⏳ Você enviou modificações para esta loja. Aguardando aprovação do Administrador.
                        </div>
                    )}
                </div>

                <div className="company-phone-row">
                    <a
                        href={phoneDigits ? `tel:${phoneDigits}` : "#"}
                        className="company-phone-box"
                        title="Ligar para a empresa"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        <span>{company.phone || "Não informado"}</span>
                    </a>
                    <button
                        type="button"
                        className="copy-phone-btn"
                        title="Copiar telefone"
                        aria-label="Copiar telefone"
                        onClick={() => onCopyPhone(company.phone)}
                    >
                        Copiar
                    </button>
                </div>

                <div className="social-row">
                    <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`social-btn whatsapp-btn${waDigits ? "" : " disabled"}`}
                        aria-label="Conversar no WhatsApp"
                        title="WhatsApp"
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm5.79 14.12c-.24.68-1.41 1.3-1.95 1.38-.5.07-1.13.1-1.82-.12-.42-.13-.96-.31-1.65-.61-2.9-1.25-4.79-4.18-4.94-4.38-.14-.2-1.18-1.57-1.18-3s.75-2.13 1.01-2.42c.27-.29.58-.36.77-.36h.55c.18 0 .42-.07.65.5.24.58.82 2 .89 2.14.07.15.12.32.02.51-.1.2-.15.32-.29.49-.15.17-.31.38-.44.51-.14.15-.3.31-.13.61.17.29.75 1.24 1.61 2.01 1.11.99 2.04 1.3 2.33 1.44.29.15.46.12.63-.07.17-.2.73-.85.92-1.14.2-.29.39-.24.65-.15.27.1 1.7.8 1.99.95.29.15.48.22.55.34.07.12.07.7-.17 1.38z" />
                        </svg>
                    </a>

                    <a
                        href={instagramHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`social-btn instagram-btn${instagramHandle ? "" : " disabled"}`}
                        aria-label="Abrir Instagram"
                        title="Instagram"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
                            <circle cx="12" cy="12" r="4" />
                            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                        </svg>
                    </a>
                </div>
            </article>

            <div className="pager-row">
                <button
                    type="button"
                    className="pager-btn"
                    aria-label="Empresa anterior"
                    disabled={currentIndex === 0}
                    onClick={onPrev}
                >
                    &larr; Anterior
                </button>
                <span className="pager-counter">
                    {currentIndex + 1} / {companies.length}
                </span>
                <button
                    type="button"
                    className="pager-btn"
                    aria-label="Próxima empresa"
                    disabled={currentIndex >= companies.length - 1}
                    onClick={onNext}
                >
                    Próxima &rarr;
                </button>
            </div>
        </main>
    );
}
