document.addEventListener("DOMContentLoaded", () => {
    const API_ORIGIN = window.API_ORIGIN || "http://localhost:8080";
    const ADMIN_API = `${API_ORIGIN}/api/admin`;
    const TOKEN_KEY = "empreende_sede_admin_token";
    const EMAIL_KEY = "empreende_sede_admin_email";

    const el = {
        adminLoginScreen: document.getElementById("adminLoginScreen"),
        adminDashboard: document.getElementById("adminDashboard"),
        adminLoginForm: document.getElementById("adminLoginForm"),
        adminEmailInput: document.getElementById("adminEmailInput"),
        adminPasswordInput: document.getElementById("adminPasswordInput"),
        adminLoginError: document.getElementById("adminLoginError"),
        adminIdentityLabel: document.getElementById("adminIdentityLabel"),

        refreshAdminBtn: document.getElementById("refreshAdminBtn"),
        adminLogoutBtn: document.getElementById("adminLogoutBtn"),

        statPendingCount: document.getElementById("statPendingCount"),
        statPublishedCount: document.getElementById("statPublishedCount"),
        statExpiredCount: document.getElementById("statExpiredCount"),

        tabPendingBtn: document.getElementById("tabPendingBtn"),
        tabAllBtn: document.getElementById("tabAllBtn"),
        tabPendingBadge: document.getElementById("tabPendingBadge"),
        tabAllBadge: document.getElementById("tabAllBadge"),
        pendingPanel: document.getElementById("pendingPanel"),
        allStoresPanel: document.getElementById("allStoresPanel"),
        pendingList: document.getElementById("pendingList"),
        allStoresList: document.getElementById("allStoresList"),

        toast: document.getElementById("adminToast")
    };

    let toastTimer = null;

    function showToast(msg) {
        el.toast.textContent = msg;
        el.toast.classList.remove("hidden");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => el.toast.classList.add("hidden"), 3200);
    }

    function getToken() {
        return sessionStorage.getItem(TOKEN_KEY) || "";
    }

    function clearSession() {
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(EMAIL_KEY);
        el.adminDashboard.classList.add("hidden");
        el.adminLoginScreen.classList.remove("hidden");
    }

    async function apiFetch(path, options = {}) {
        const headers = {
            ...(options.headers || {}),
            Authorization: `Bearer ${getToken()}`
        };
        const resp = await fetch(`${ADMIN_API}${path}`, { ...options, headers });
        if (resp.status === 401 || resp.status === 403) {
            clearSession();
            throw new Error("Sessão administrativa expirada ou não autorizada.");
        }
        if (!resp.ok) {
            let msg = "Erro ao processar solicitação.";
            try {
                const body = await resp.json();
                if (body?.error) msg = body.error;
            } catch {
                // ignore
            }
            throw new Error(msg);
        }
        if (resp.status === 204) return null;
        return await resp.json();
    }

    function escapeHtml(str) {
        return String(str ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function renderPending(pendingItems) {
        el.pendingList.innerHTML = "";
        el.statPendingCount.textContent = String(pendingItems.length);
        el.tabPendingBadge.textContent = String(pendingItems.length);

        if (pendingItems.length === 0) {
            const box = document.createElement("div");
            box.className = "empty-box";
            box.textContent = "Nenhuma loja ou pagamento Pix aguardando aprovação no momento.";
            el.pendingList.appendChild(box);
            return;
        }

        pendingItems.forEach((item) => {
            const isEdit = item.hasPendingUpdate && item.pendingData;
            const data = isEdit ? item.pendingData : item;

            let badgeClass = "badge-create";
            let badgeText = "Nova Loja (Pix R$ 50)";
            if (isEdit && item.pendingRenewal) {
                badgeClass = "badge-edit";
                badgeText = "Edição + Renovação Pix";
            } else if (item.pendingRenewal) {
                badgeClass = "badge-renew";
                badgeText = "Renovação Pix (+1 mês)";
            } else if (isEdit) {
                badgeClass = "badge-edit";
                badgeText = "Edição de Loja";
            }

            const card = document.createElement("article");
            card.className = "store-card";

            const top = document.createElement("div");
            top.className = "store-card-top";
            top.innerHTML = `<span class="badge ${badgeClass}">${badgeText}</span>`
                + `<span class="badge">${escapeHtml(item.paymentStatus)}</span>`;

            const body = document.createElement("div");
            body.className = "store-body";

            if (data.logoUrl) {
                const img = document.createElement("img");
                img.src = data.logoUrl;
                img.alt = data.name;
                img.className = "store-thumb";
                body.appendChild(img);
            }

            const meta = document.createElement("div");
            meta.className = "store-meta";
            meta.innerHTML = `
                <h3>${escapeHtml(isEdit ? `${item.name} → ${data.name}` : data.name)}</h3>
                <p><strong>Proprietário:</strong> ${escapeHtml(item.ownerEmail || "N/A")}</p>
                <p><strong>Categoria:</strong> ${escapeHtml(data.category)} &bull; <strong>Tel:</strong> ${escapeHtml(data.phone)}</p>
                <p>${escapeHtml(data.description)}</p>
            `;
            body.appendChild(meta);

            card.appendChild(top);
            card.appendChild(body);

            if (!item.approved || item.paymentStatus === "PAYMENT_SUBMITTED" || item.paymentStatus === "PENDING_PAYMENT" || item.pendingRenewal) {
                const pixBox = document.createElement("div");
                pixBox.className = "pix-proof-box";
                pixBox.innerHTML = `
                    <p><strong>Status Pix:</strong> ${escapeHtml(item.paymentStatus)}</p>
                    <p><strong>Código / Comprovante:</strong> ${escapeHtml(item.pixTxId || "Ainda não informado pelo usuário")}</p>
                    <p><strong>Observação:</strong> ${escapeHtml(item.pixPayerNote || "-")}</p>
                `;
                card.appendChild(pixBox);
            }

            const actions = document.createElement("div");
            actions.className = "store-actions";

            const approveBtn = document.createElement("button");
            approveBtn.type = "button";
            approveBtn.className = "btn-primary";
            approveBtn.textContent = (!item.approved || item.pendingRenewal || item.paymentStatus === "PAYMENT_SUBMITTED")
                ? "✓ Aprovar e Liberar 30 dias"
                : "✓ Aprovar Edição";
            approveBtn.addEventListener("click", async () => {
                try {
                    await apiFetch(`/companies/${item.id}/approve`, { method: "POST" });
                    showToast(`"${data.name}" aprovada com sucesso!`);
                    await loadAdminData();
                } catch (err) {
                    showToast(err.message);
                }
            });

            const rejectBtn = document.createElement("button");
            rejectBtn.type = "button";
            rejectBtn.className = "btn-danger";
            rejectBtn.textContent = "✕ Rejeitar";
            rejectBtn.addEventListener("click", async () => {
                if (!confirm(`Rejeitar a solicitação de "${data.name}"?`)) return;
                try {
                    await apiFetch(`/companies/${item.id}/reject`, { method: "POST" });
                    showToast("Solicitação rejeitada.");
                    await loadAdminData();
                } catch (err) {
                    showToast(err.message);
                }
            });

            actions.appendChild(approveBtn);
            actions.appendChild(rejectBtn);
            card.appendChild(actions);
            el.pendingList.appendChild(card);
        });
    }

    function renderAllStores(items) {
        el.allStoresList.innerHTML = "";
        el.tabAllBadge.textContent = String(items.length);

        let published = 0;
        let expiredOrUnpaid = 0;

        items.forEach((item) => {
            const isExpired = Boolean(item.expired);
            const isPublished = item.approved && !isExpired;
            if (isPublished) published += 1;
            if (isExpired || item.paymentStatus === "PENDING_PAYMENT") expiredOrUnpaid += 1;

            const card = document.createElement("article");
            card.className = "store-card";

            let statusBadge = `<span class="badge badge-create">Publicada</span>`;
            if (!item.approved) statusBadge = `<span class="badge badge-renew">Não aprovada</span>`;
            else if (isExpired) statusBadge = `<span class="badge badge-danger">Expirada</span>`;

            const expInfo = item.subscriptionExpiresAt
                ? `${new Date(item.subscriptionExpiresAt).toLocaleDateString("pt-BR")} (${item.daysRemaining} dias)`
                : "Sem expiração (Seed/Adm)";

            const top = document.createElement("div");
            top.className = "store-card-top";
            top.innerHTML = `${statusBadge}<span class="badge">${escapeHtml(item.paymentStatus)}</span>`;

            const body = document.createElement("div");
            body.className = "store-body";
            if (item.logoUrl) {
                const img = document.createElement("img");
                img.src = item.logoUrl;
                img.alt = item.name;
                img.className = "store-thumb";
                body.appendChild(img);
            }

            const meta = document.createElement("div");
            meta.className = "store-meta";
            meta.innerHTML = `
                <h3>${escapeHtml(item.name)}</h3>
                <p><strong>Dono:</strong> ${escapeHtml(item.ownerEmail || "Adm")}</p>
                <p><strong>Categoria:</strong> ${escapeHtml(item.category)} &bull; ${escapeHtml(item.phone)}</p>
                <p><strong>Validade:</strong> ${escapeHtml(expInfo)}</p>
            `;
            body.appendChild(meta);

            const actions = document.createElement("div");
            actions.className = "store-actions";

            const renewBtn = document.createElement("button");
            renewBtn.type = "button";
            renewBtn.className = "btn-secondary";
            renewBtn.textContent = "+ 30 dias (Pix)";
            renewBtn.addEventListener("click", async () => {
                try {
                    await apiFetch(`/companies/${item.id}/renew`, { method: "POST" });
                    showToast(`Plano de "${item.name}" estendido em +30 dias!`);
                    await loadAdminData();
                } catch (err) {
                    showToast(err.message);
                }
            });

            const delBtn = document.createElement("button");
            delBtn.type = "button";
            delBtn.className = "btn-danger";
            delBtn.textContent = "Remover";
            delBtn.addEventListener("click", async () => {
                if (!confirm(`Remover "${item.name}" da vitrine?`)) return;
                try {
                    await apiFetch(`/companies/${item.id}`, { method: "DELETE" });
                    showToast("Loja removida.");
                    await loadAdminData();
                } catch (err) {
                    showToast(err.message);
                }
            });

            actions.appendChild(renewBtn);
            actions.appendChild(delBtn);

            card.appendChild(top);
            card.appendChild(body);
            card.appendChild(actions);
            el.allStoresList.appendChild(card);
        });

        el.statPublishedCount.textContent = String(published);
        el.statExpiredCount.textContent = String(expiredOrUnpaid);
    }

    async function loadAdminData() {
        const [pending, all] = await Promise.all([
            apiFetch("/pending"),
            apiFetch("/companies")
        ]);
        renderPending(pending);
        renderAllStores(all);
    }

    async function enterDashboard() {
        el.adminIdentityLabel.textContent = sessionStorage.getItem(EMAIL_KEY) || "Administrador Único";
        el.adminLoginScreen.classList.add("hidden");
        el.adminDashboard.classList.remove("hidden");
        await loadAdminData();
    }

    el.adminLoginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        el.adminLoginError.classList.add("hidden");
        try {
            const resp = await fetch(`${ADMIN_API}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: el.adminEmailInput.value.trim(),
                    password: el.adminPasswordInput.value
                })
            });
            if (!resp.ok) {
                let errMsg = "Credenciais de Administrador inválidas.";
                try {
                    const body = await resp.json();
                    if (body?.error) errMsg = body.error;
                } catch {
                    // ignore
                }
                throw new Error(errMsg);
            }
            const data = await resp.json();
            sessionStorage.setItem(TOKEN_KEY, data.token);
            sessionStorage.setItem(EMAIL_KEY, data.user.email);
            await enterDashboard();
        } catch (err) {
            el.adminLoginError.textContent = err.message;
            el.adminLoginError.classList.remove("hidden");
        }
    });

    el.refreshAdminBtn.addEventListener("click", () => {
        loadAdminData().then(() => showToast("Lista atualizada.")).catch((e) => showToast(e.message));
    });

    el.adminLogoutBtn.addEventListener("click", clearSession);

    el.tabPendingBtn.addEventListener("click", () => {
        el.tabPendingBtn.classList.add("active");
        el.tabAllBtn.classList.remove("active");
        el.pendingPanel.classList.remove("hidden");
        el.allStoresPanel.classList.add("hidden");
    });

    el.tabAllBtn.addEventListener("click", () => {
        el.tabAllBtn.classList.add("active");
        el.tabPendingBtn.classList.remove("active");
        el.allStoresPanel.classList.remove("hidden");
        el.pendingPanel.classList.add("hidden");
    });

    if (getToken()) {
        enterDashboard().catch(clearSession);
    }
});
