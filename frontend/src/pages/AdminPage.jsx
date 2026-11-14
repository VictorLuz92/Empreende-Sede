import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { OFFICIAL_SERVICE_CATEGORIES, OFFICIAL_SERVICE_SUBSEGMENTS } from "../constants/services";
import { AdminApi, CompanyApi } from "../services/api";
import { formatCompanyAddress } from "../utils/formatters";
import "../styles/admin.css";

function getPendingBadge(item) {
    const isEdit = Boolean(item.hasPendingUpdate && item.pendingData);
    if (isEdit && item.pendingRenewal) {
        return { cls: "badge-edit", text: "Edição + Renovação Pix" };
    }
    if (item.pendingRenewal) {
        return { cls: "badge-renew", text: "Renovação Pix (+1 mês)" };
    }
    if (isEdit) {
        return { cls: "badge-edit", text: "Edição de Loja" };
    }
    return { cls: "badge-create", text: "Nova Loja (Pix R$ 50)" };
}

function getAllStoreStatusBadge(item) {
    if (!item.approved) return { cls: "badge-renew", text: "Não aprovada" };
    if (item.expired) return { cls: "badge-danger", text: "Expirada" };
    return { cls: "badge-create", text: "Publicada" };
}

function groupStoresByService(items) {
    const groupedMap = new Map();
    OFFICIAL_SERVICE_CATEGORIES.forEach((cat) => groupedMap.set(cat, []));

    items.forEach((item) => {
        const cat = (item.category || "").trim() || "Outros";
        if (!groupedMap.has(cat)) {
            groupedMap.set(cat, []);
        }
        groupedMap.get(cat).push(item);
    });

    return Array.from(groupedMap.entries()).filter(([, groupItems]) => groupItems.length > 0);
}

function SubsegmentAssignCard({ item, subsegmentsMap, onSaveSubsegment, onReject }) {
    const isPendingEditSub = Boolean(
        item.hasPendingUpdate
        && item.pendingData
        && (!item.pendingData.subsegment || !item.pendingData.subsegment.trim())
    );
    const source = isPendingEditSub ? item.pendingData : item;
    const displayName = source.name || item.name;
    const category = source.category || item.category || "Geral";
    const options = subsegmentsMap[category] || OFFICIAL_SERVICE_SUBSEGMENTS[category] || [];

    const [selectedOption, setSelectedOption] = useState(options[0] || "__NEW__");
    const [customSubsegment, setCustomSubsegment] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (selectedOption !== "__NEW__" && !options.includes(selectedOption)) {
            setSelectedOption(options[0] || "__NEW__");
        }
    }, [options, selectedOption]);

    async function handleSave(e) {
        e.preventDefault();
        const chosen = selectedOption === "__NEW__"
            ? customSubsegment.trim()
            : selectedOption.trim();
        if (!chosen) return;
        setSaving(true);
        try {
            await onSaveSubsegment(item, displayName, chosen);
        } finally {
            setSaving(false);
        }
    }

    return (
        <article className="store-card">
            <div className="store-card-top">
                <span className="badge badge-edit">Sem Subsessão</span>
                <span className="badge">{category}</span>
            </div>

            <div className="store-body">
                {source.logoUrl && (
                    <img
                        src={source.logoUrl}
                        alt={displayName}
                        className="store-thumb"
                    />
                )}
                <div className="store-meta">
                    <h3>{displayName}</h3>
                    <p>
                        <strong>Proprietário:</strong>{" "}
                        {source.ownerName || item.ownerName || "N/A"} ({item.ownerEmail || "N/A"})
                    </p>
                    <p><strong>Tel:</strong> {source.phone || item.phone}</p>
                    <p>{source.description || item.description}</p>
                </div>
            </div>

            <form className="subsegment-assign-box" onSubmit={handleSave}>
                <label>
                    Escolher subsessão existente ou criar uma nova para {category}
                    <select
                        value={selectedOption}
                        onChange={(e) => setSelectedOption(e.target.value)}
                    >
                        {options.map((sub) => (
                            <option key={sub} value={sub}>{sub}</option>
                        ))}
                        <option value="__NEW__">+ Criar nova subsessão...</option>
                    </select>
                </label>

                {selectedOption === "__NEW__" && (
                    <label>
                        Nome da nova subsessão / subclasse *
                        <input
                            type="text"
                            required
                            maxLength={80}
                            value={customSubsegment}
                            onChange={(e) => setCustomSubsegment(e.target.value)}
                            placeholder={`Ex: Nova subsessão em ${category}`}
                        />
                    </label>
                )}

                <div className="store-actions">
                    <button type="submit" className="btn-primary" disabled={saving}>
                        {saving ? "Salvando..." : "✓ Confirmar Subclasse"}
                    </button>
                    <button
                        type="button"
                        className="btn-danger"
                        onClick={() => onReject(item, displayName)}
                    >
                        ✕ Rejeitar
                    </button>
                </div>
            </form>
        </article>
    );
}

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(AdminApi.getToken()));
    const [adminIdentity, setAdminIdentity] = useState(() => AdminApi.getEmail());

    const [emailInput, setEmailInput] = useState("");
    const [passwordInput, setPasswordInput] = useState("");
    const [loginError, setLoginError] = useState("");

    const [activeTab, setActiveTab] = useState("pending");
    const [pendingItems, setPendingItems] = useState([]);
    const [addressRequests, setAddressRequests] = useState([]);
    const [subsegmentRequests, setSubsegmentRequests] = useState([]);
    const [subsegmentsMap, setSubsegmentsMap] = useState({ ...OFFICIAL_SERVICE_SUBSEGMENTS });
    const [allItems, setAllItems] = useState([]);

    const [toastMsg, setToastMsg] = useState("");
    const toastTimerRef = useRef(null);

    const showToast = useCallback((msg) => {
        setToastMsg(msg);
        clearTimeout(toastTimerRef.current);
        toastTimerRef.current = setTimeout(() => setToastMsg(""), 3200);
    }, []);

    useEffect(() => {
        document.title = "Painel Administrativo — Empreende Sede";
        return () => clearTimeout(toastTimerRef.current);
    }, []);

    const handleLogout = useCallback(() => {
        AdminApi.clearSession();
        setIsAuthenticated(false);
        setPendingItems([]);
        setAddressRequests([]);
        setSubsegmentRequests([]);
        setAllItems([]);
    }, []);

    const loadAdminData = useCallback(async () => {
        try {
            const [pending, addresses, subsegmentsPending, subsMap, all] = await Promise.all([
                AdminApi.getPending(),
                AdminApi.getAddressRequests(),
                AdminApi.getSubsegmentRequests(),
                CompanyApi.listSubsegments(),
                AdminApi.getAllCompanies()
            ]);
            setPendingItems(pending);
            setAddressRequests(addresses);
            setSubsegmentRequests(subsegmentsPending);
            if (subsMap && Object.keys(subsMap).length > 0) {
                setSubsegmentsMap(subsMap);
            }
            setAllItems(all);
        } catch (err) {
            if (err.isAuthError) {
                handleLogout();
            }
            throw err;
        }
    }, [handleLogout]);

    useEffect(() => {
        if (!AdminApi.getToken()) return;
        setAdminIdentity(AdminApi.getEmail());
        loadAdminData().catch(() => {
            // session already cleared on auth failure
        });
    }, [loadAdminData]);

    async function handleLoginSubmit(e) {
        e.preventDefault();
        setLoginError("");
        try {
            await AdminApi.login(emailInput, passwordInput);
            setAdminIdentity(AdminApi.getEmail());
            setIsAuthenticated(true);
            await loadAdminData();
        } catch (err) {
            setLoginError(err.message);
        }
    }

    async function handleApprove(item, displayName) {
        try {
            await AdminApi.approveCompany(item.id);
            showToast(`"${displayName}" aprovada com Pix confirmado (+30 dias)!`);
            await loadAdminData();
        } catch (err) {
            showToast(err.message);
        }
    }

    async function handleConfirmAddress(item, addrSource, displayName) {
        const confirmed = window.confirm(
            `Confirmar o endereço da loja "${displayName}"?\n\n`
            + `Proprietário: ${addrSource.ownerName || item.ownerEmail || "N/A"}\n`
            + `CEP: ${addrSource.cep || "Não informado"}\n`
            + `Endereço: ${formatCompanyAddress(addrSource)}`
        );
        if (!confirmed) return;

        try {
            await AdminApi.confirmAddress(item.id);
            showToast(`Endereço de "${displayName}" confirmado com sucesso!`);
            await loadAdminData();
        } catch (err) {
            showToast(err.message);
        }
    }

    async function handleAssignSubsegment(item, displayName, chosenSubsegment) {
        try {
            await AdminApi.assignSubsegment(item.id, chosenSubsegment);
            showToast(`Subclasse "${chosenSubsegment}" definida para "${displayName}"!`);
            await loadAdminData();
        } catch (err) {
            showToast(err.message);
        }
    }

    async function handleReject(item, displayName) {
        if (!window.confirm(`Rejeitar a solicitação de "${displayName}"?`)) return;
        try {
            await AdminApi.rejectCompany(item.id);
            showToast("Solicitação rejeitada.");
            await loadAdminData();
        } catch (err) {
            showToast(err.message);
        }
    }

    async function handleRenew(item, categoryLabel, expInfo) {
        const confirmed = window.confirm(
            `Confirmar +30 dias (Pix) para a loja "${item.name}"?\n\n`
            + `Serviço: ${categoryLabel}\n`
            + `Proprietário: ${item.ownerName || item.ownerEmail || "Adm"}\n`
            + `Validade atual: ${expInfo}`
        );
        if (!confirmed) return;

        try {
            await AdminApi.renewCompany(item.id);
            showToast(`Plano de "${item.name}" estendido em +30 dias!`);
            await loadAdminData();
        } catch (err) {
            showToast(err.message);
        }
    }

    async function handleDelete(item) {
        if (!window.confirm(`Remover "${item.name}" da vitrine?`)) return;
        try {
            await AdminApi.deleteCompany(item.id);
            showToast("Loja removida.");
            await loadAdminData();
        } catch (err) {
            showToast(err.message);
        }
    }

    const publishedCount = useMemo(
        () => allItems.filter((item) => item.approved && !item.expired).length,
        [allItems]
    );

    const expiredOrUnpaidCount = useMemo(
        () => allItems.filter((item) => Boolean(item.expired) || item.paymentStatus === "PENDING_PAYMENT").length,
        [allItems]
    );

    const groupedAllStores = useMemo(
        () => groupStoresByService(allItems),
        [allItems]
    );

    return (
        <div className="admin-page-root">
            {!isAuthenticated ? (
                <main className="admin-login-screen">
                    <div className="login-card">
                        <div className="login-badge">Acesso Restrito</div>
                        <h1>Painel do Administrador</h1>
                        <p className="login-subtitle">
                            Apenas o administrador único do Empreende Sede pode aprovar lojas, validar pagamentos Pix (R$ 50,00/mês), confirmar endereços, organizar subclasses e publicar alterações.
                        </p>

                        {loginError && (
                            <div className="alert-error" role="alert">
                                {loginError}
                            </div>
                        )}

                        <form className="admin-form" onSubmit={handleLoginSubmit}>
                            <label>
                                E-mail do Administrador
                                <input
                                    type="email"
                                    required
                                    autoComplete="username"
                                    value={emailInput}
                                    onChange={(e) => setEmailInput(e.target.value)}
                                    placeholder="admin@empreendesede.com.br"
                                />
                            </label>
                            <label>
                                Senha
                                <input
                                    type="password"
                                    required
                                    autoComplete="current-password"
                                    value={passwordInput}
                                    onChange={(e) => setPasswordInput(e.target.value)}
                                    placeholder="••••••••"
                                />
                            </label>
                            <button type="submit" className="btn-primary">
                                Entrar no Painel Adm
                            </button>
                        </form>
                    </div>
                </main>
            ) : (
                <div className="admin-shell">
                    <header className="admin-topbar">
                        <div className="admin-brand">
                            <span className="shield-badge">🛡️</span>
                            <div>
                                <h1>Empreende Sede — Administração</h1>
                                <p className="admin-identity">{adminIdentity}</p>
                            </div>
                        </div>
                        <div className="topbar-actions">
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={() =>
                                    loadAdminData()
                                        .then(() => showToast("Lista atualizada."))
                                        .catch((e) => showToast(e.message))
                                }
                            >
                                ↻ Atualizar
                            </button>
                            <button type="button" className="btn-danger" onClick={handleLogout}>
                                Sair
                            </button>
                        </div>
                    </header>

                    <section className="stats-grid" aria-label="Resumo">
                        <div className="stat-card">
                            <span className="stat-label">Pendentes de Aprovação / Pix</span>
                            <strong className="stat-value">{pendingItems.length}</strong>
                        </div>
                        <div className="stat-card">
                            <span className="stat-label">Confirmações de Endereço</span>
                            <strong className="stat-value">{addressRequests.length}</strong>
                        </div>
                        <div className="stat-card">
                            <span className="stat-label">Confirmações de Subclasse</span>
                            <strong className="stat-value">{subsegmentRequests.length}</strong>
                        </div>
                        <div className="stat-card">
                            <span className="stat-label">Lojas Ativas na Vitrine</span>
                            <strong className="stat-value">{publishedCount}</strong>
                        </div>
                        <div className="stat-card">
                            <span className="stat-label">Expiradas / Sem Pagamento</span>
                            <strong className="stat-value">{expiredOrUnpaidCount}</strong>
                        </div>
                    </section>

                    <div className="admin-tabs" role="tablist">
                        <button
                            type="button"
                            role="tab"
                            className={`tab-btn${activeTab === "pending" ? " active" : ""}`}
                            onClick={() => setActiveTab("pending")}
                        >
                            ⏳ Aprovações &amp; Pix Pendentes (<span>{pendingItems.length}</span>)
                        </button>
                        <button
                            type="button"
                            role="tab"
                            className={`tab-btn${activeTab === "address" ? " active" : ""}`}
                            onClick={() => setActiveTab("address")}
                        >
                            📍 Confirma Endereço (<span>{addressRequests.length}</span>)
                        </button>
                        <button
                            type="button"
                            role="tab"
                            className={`tab-btn${activeTab === "subsegment" ? " active" : ""}`}
                            onClick={() => setActiveTab("subsegment")}
                        >
                            🏷️ Confirma Subclasse (<span>{subsegmentRequests.length}</span>)
                        </button>
                        <button
                            type="button"
                            role="tab"
                            className={`tab-btn${activeTab === "all" ? " active" : ""}`}
                            onClick={() => setActiveTab("all")}
                        >
                            🏪 Todas as Lojas (<span>{allItems.length}</span>)
                        </button>
                    </div>

                    {activeTab === "pending" && (
                        <section className="panel-section">
                            <div className="cards-grid">
                                {pendingItems.length === 0 ? (
                                    <div className="empty-box">
                                        Nenhuma loja ou pagamento Pix aguardando aprovação no momento.
                                    </div>
                                ) : (
                                    pendingItems.map((item) => {
                                        const isEdit = Boolean(item.hasPendingUpdate && item.pendingData);
                                        const data = isEdit ? item.pendingData : item;
                                        const badge = getPendingBadge(item);
                                        const showPixBox = !item.approved
                                            || item.paymentStatus === "PAYMENT_SUBMITTED"
                                            || item.paymentStatus === "PENDING_PAYMENT"
                                            || item.pendingRenewal;
                                        const approveLabel = (!item.approved || item.pendingRenewal || item.paymentStatus === "PAYMENT_SUBMITTED")
                                            ? "✓ Confirmar Pix e Liberar 30 dias"
                                            : "✓ Aprovar Edição";

                                        return (
                                            <article key={item.id} className="store-card">
                                                <div className="store-card-top">
                                                    <span className={`badge ${badge.cls}`}>{badge.text}</span>
                                                    <span className="badge">{item.paymentStatus}</span>
                                                </div>

                                                <div className="store-body">
                                                    {data.logoUrl && (
                                                        <img
                                                            src={data.logoUrl}
                                                            alt={data.name}
                                                            className="store-thumb"
                                                        />
                                                    )}
                                                    <div className="store-meta">
                                                        <h3>{isEdit ? `${item.name} → ${data.name}` : data.name}</h3>
                                                        <p>
                                                            <strong>Proprietário:</strong>{" "}
                                                            {data.ownerName || item.ownerName || "N/A"} ({item.ownerEmail || "N/A"})
                                                        </p>
                                                        <p>
                                                            <strong>Categoria:</strong> {data.category}
                                                            {data.subsegment ? ` • ${data.subsegment}` : " • Sem subsessão"}
                                                            {" "} &bull; <strong>Tel:</strong> {data.phone}
                                                        </p>
                                                        {data.street && (
                                                            <p>
                                                                <strong>Endereço:</strong> {formatCompanyAddress(data)}
                                                            </p>
                                                        )}
                                                        <p>{data.description}</p>
                                                    </div>
                                                </div>

                                                {data.addressStatus === "PENDING_ADMIN_CONFIRMATION" && (
                                                    <div className="address-alert-box">
                                                        ⏳ CEP não localizado — confirmação manual pendente na aba &ldquo;Confirma Endereço&rdquo;.
                                                    </div>
                                                )}

                                                {showPixBox && (
                                                    <div className="pix-proof-box">
                                                        <p><strong>Status Pix:</strong> {item.paymentStatus}</p>
                                                        <p><strong>Quem enviou o Pix:</strong> {item.pixPayerNote || "Ainda não informado"}</p>
                                                        <p><strong>Comprovante / Código Pix:</strong> {item.pixTxId || "Não informado (opcional)"}</p>
                                                    </div>
                                                )}

                                                <div className="store-actions">
                                                    <button
                                                        type="button"
                                                        className="btn-primary"
                                                        onClick={() => handleApprove(item, data.name)}
                                                    >
                                                        {approveLabel}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn-danger"
                                                        onClick={() => handleReject(item, data.name)}
                                                    >
                                                        ✕ Rejeitar
                                                    </button>
                                                </div>
                                            </article>
                                        );
                                    })
                                )}
                            </div>
                        </section>
                    )}

                    {activeTab === "address" && (
                        <section className="panel-section">
                            <div className="cards-grid">
                                {addressRequests.length === 0 ? (
                                    <div className="empty-box">
                                        Nenhuma solicitação de confirmação de endereço pendente no momento.
                                    </div>
                                ) : (
                                    addressRequests.map((item) => {
                                        const isPendingEditAddr = Boolean(
                                            item.hasPendingUpdate
                                            && item.pendingData
                                            && item.pendingData.addressStatus === "PENDING_ADMIN_CONFIRMATION"
                                        );
                                        const addrSource = isPendingEditAddr ? item.pendingData : item;
                                        const displayName = addrSource.name || item.name;
                                        const categoryLabel = addrSource.subsegment
                                            ? `${addrSource.category || "Outros"} (${addrSource.subsegment})`
                                            : (addrSource.category || item.category || "Outros");

                                        return (
                                            <article key={item.id} className="store-card">
                                                <div className="store-card-top">
                                                    <span className="badge badge-renew">Solicitação de Endereço</span>
                                                    <span className="badge">
                                                        {item.approved ? "Loja Aprovada" : "Aguardando Aprovação"}
                                                    </span>
                                                </div>

                                                <div className="store-body">
                                                    {addrSource.logoUrl && (
                                                        <img
                                                            src={addrSource.logoUrl}
                                                            alt={displayName}
                                                            className="store-thumb"
                                                        />
                                                    )}
                                                    <div className="store-meta">
                                                        <h3>{displayName}</h3>
                                                        <p>
                                                            <strong>Proprietário:</strong>{" "}
                                                            {addrSource.ownerName || item.ownerName || "N/A"} ({item.ownerEmail || "N/A"})
                                                        </p>
                                                        <p>
                                                            <strong>Serviço:</strong> {categoryLabel} &bull;{" "}
                                                            <strong>Tel:</strong> {addrSource.phone || item.phone}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="address-request-box">
                                                    <p><strong>CEP informado:</strong> {addrSource.cep || "Não informado"}</p>
                                                    <p><strong>Rua / Logradouro:</strong> {addrSource.street || "-"}, Nº {addrSource.addressNumber || "-"}</p>
                                                    {addrSource.complement && (
                                                        <p><strong>Complemento:</strong> {addrSource.complement}</p>
                                                    )}
                                                    <p><strong>Bairro:</strong> {addrSource.neighborhood || "-"}</p>
                                                    <p><strong>Cidade / UF:</strong> {addrSource.city || "-"} / {addrSource.state || "-"}</p>
                                                </div>

                                                <div className="store-actions">
                                                    <button
                                                        type="button"
                                                        className="btn-primary"
                                                        onClick={() => handleConfirmAddress(item, addrSource, displayName)}
                                                    >
                                                        ✓ Confirmar Endereço
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn-danger"
                                                        onClick={() => handleReject(item, displayName)}
                                                    >
                                                        ✕ Rejeitar
                                                    </button>
                                                </div>
                                            </article>
                                        );
                                    })
                                )}
                            </div>
                        </section>
                    )}

                    {activeTab === "subsegment" && (
                        <section className="panel-section">
                            <div className="cards-grid">
                                {subsegmentRequests.length === 0 ? (
                                    <div className="empty-box">
                                        Todas as lojas já possuem uma subsessão (subclasse) definida.
                                    </div>
                                ) : (
                                    subsegmentRequests.map((item) => (
                                        <SubsegmentAssignCard
                                            key={item.id}
                                            item={item}
                                            subsegmentsMap={subsegmentsMap}
                                            onSaveSubsegment={handleAssignSubsegment}
                                            onReject={handleReject}
                                        />
                                    ))
                                )}
                            </div>
                        </section>
                    )}

                    {activeTab === "all" && (
                        <section className="panel-section">
                            <div className="admin-service-groups">
                                {allItems.length === 0 ? (
                                    <div className="empty-box">Nenhuma loja cadastrada ainda.</div>
                                ) : (
                                    <>
                                        <nav className="admin-group-jump-nav" aria-label="Ir para tipo de serviço">
                                            {groupedAllStores.map(([category, groupItems], idx) => (
                                                <button
                                                    key={category}
                                                    type="button"
                                                    className="admin-jump-pill"
                                                    onClick={() => {
                                                        const target = document.getElementById(`admin-service-group-${idx}`);
                                                        if (target) {
                                                            target.scrollIntoView({ behavior: "smooth", block: "start" });
                                                        }
                                                    }}
                                                >
                                                    {category} <span>{groupItems.length}</span>
                                                </button>
                                            ))}
                                        </nav>

                                        {groupedAllStores.map(([category, groupItems], idx) => (
                                            <section
                                                key={category}
                                                id={`admin-service-group-${idx}`}
                                                className="admin-service-group"
                                            >
                                                <div className="admin-service-group-header">
                                                    <h3>{category}</h3>
                                                    <span className="admin-service-group-count">
                                                        {groupItems.length} {groupItems.length === 1 ? "loja" : "lojas"}
                                                    </span>
                                                </div>

                                                <div className="cards-grid">
                                                    {groupItems.map((item) => {
                                                        const statusBadge = getAllStoreStatusBadge(item);
                                                        const expInfo = item.subscriptionExpiresAt
                                                            ? `${new Date(item.subscriptionExpiresAt).toLocaleDateString("pt-BR")} (${item.daysRemaining} dias)`
                                                            : (item.paymentStatus === "EXEMPT"
                                                                ? "Sem expiração (Adm)"
                                                                : "Expirada / Sem Pix confirmado");
                                                        const categoryLabel = item.subsegment
                                                            ? `${item.category || "Outros"} (${item.subsegment})`
                                                            : `${item.category || "Outros"} (Sem subsessão)`;

                                                        return (
                                                            <article key={item.id} className="store-card">
                                                                <div className="store-card-top">
                                                                    <span className={`badge ${statusBadge.cls}`}>{statusBadge.text}</span>
                                                                    <span className="badge">{item.paymentStatus}</span>
                                                                </div>

                                                                <div className="store-body">
                                                                    {item.logoUrl && (
                                                                        <img
                                                                            src={item.logoUrl}
                                                                            alt={item.name}
                                                                            className="store-thumb"
                                                                        />
                                                                    )}
                                                                    <div className="store-meta">
                                                                        <h3>{item.name}</h3>
                                                                        <p>
                                                                            <strong>Proprietário:</strong>{" "}
                                                                            {item.ownerName || item.ownerEmail || "Adm"}
                                                                        </p>
                                                                        <p><strong>Serviço:</strong> {categoryLabel} &bull; {item.phone}</p>
                                                                        {item.street && (
                                                                            <p>
                                                                                <strong>Endereço:</strong> {formatCompanyAddress(item)}
                                                                            </p>
                                                                        )}
                                                                        <p><strong>Validade:</strong> {expInfo}</p>
                                                                    </div>
                                                                </div>

                                                                <div className="store-actions">
                                                                    <button
                                                                        type="button"
                                                                        className="btn-secondary"
                                                                        onClick={() => handleRenew(item, categoryLabel, expInfo)}
                                                                    >
                                                                        + 30 dias (Pix)
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        className="btn-danger"
                                                                        onClick={() => handleDelete(item)}
                                                                    >
                                                                        Remover
                                                                    </button>
                                                                </div>
                                                            </article>
                                                        );
                                                    })}
                                                </div>
                                            </section>
                                        ))}
                                    </>
                                )}
                            </div>
                        </section>
                    )}
                </div>
            )}

            {toastMsg && (
                <div className="toast" role="status" aria-live="polite">
                    {toastMsg}
                </div>
            )}
        </div>
    );
}
