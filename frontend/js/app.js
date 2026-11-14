document.addEventListener("DOMContentLoaded", () => {
    const MAX_LOGO_SIZE_KB = 300;
    const MAX_AVATAR_SIZE_KB = 150;

    const state = {
        companies: [],
        categories: [],
        subsegmentsMap: { ...OFFICIAL_SERVICE_SUBSEGMENTS },
        myStores: [],
        currentIndex: 0,
        searchQuery: "",
        selectedCategory: "",
        selectedSubsegment: "",
        hasLoadedOnce: false,
        loadSeq: 0,
        renderedCategoriesKey: "",
        renderedSubsegmentsKey: "",
        user: AuthApi.getUser(),
        providers: {
            googleEnabled: false,
            googleClientId: "",
            microsoftEnabled: false,
            microsoftClientId: "",
            pixKey: "",
            pixMonthlyAmount: "50.00",
            pixDurationDays: 30
        },
        pendingActionAfterAuth: null
    };

    const el = {
        menuBtn: document.getElementById("menuBtn"),
        closeDrawerBtn: document.getElementById("closeDrawerBtn"),
        menuDrawer: document.getElementById("menuDrawer"),
        drawerBackdrop: document.getElementById("drawerBackdrop"),
        logoBtn: document.getElementById("logoBtn"),
        headerAuthBtn: document.getElementById("headerAuthBtn"),
        profileBtn: document.getElementById("profileBtn"),
        headerUserAvatarImg: document.getElementById("headerUserAvatarImg"),
        headerUserDefaultIcon: document.getElementById("headerUserDefaultIcon"),
        connectionBanner: document.getElementById("connectionBanner"),
        serviceTypesNav: document.getElementById("serviceTypesNav"),
        showcaseArea: document.querySelector(".showcase-area"),

        searchInput: document.getElementById("searchInput"),
        clearSearchBtn: document.getElementById("clearSearchBtn"),
        resultsStrip: document.getElementById("resultsStrip"),
        subsegmentStoresList: document.getElementById("subsegmentStoresList"),
        categoryList: document.getElementById("categoryList"),

        loadingState: document.getElementById("loadingState"),
        emptyState: document.getElementById("emptyState"),
        resetFilterBtn: document.getElementById("resetFilterBtn"),
        companyCard: document.getElementById("companyCard"),
        pagerRow: document.getElementById("pagerRow"),
        prevCompanyBtn: document.getElementById("prevCompanyBtn"),
        nextCompanyBtn: document.getElementById("nextCompanyBtn"),
        pagerCounter: document.getElementById("pagerCounter"),

        companyLogoImg: document.getElementById("companyLogoImg"),
        companyLogoFallback: document.getElementById("companyLogoFallback"),
        companyInitials: document.getElementById("companyInitials"),
        companyCategoryBadge: document.getElementById("companyCategoryBadge"),
        companyName: document.getElementById("companyName"),
        companyDescription: document.getElementById("companyDescription"),
        companyPendingNotice: document.getElementById("companyPendingNotice"),
        companyPhoneLink: document.getElementById("companyPhoneLink"),
        companyPhoneText: document.getElementById("companyPhoneText"),
        copyPhoneBtn: document.getElementById("copyPhoneBtn"),
        whatsappLink: document.getElementById("whatsappLink"),
        instagramLink: document.getElementById("instagramLink"),
        editCompanyBtn: document.getElementById("editCompanyBtn"),

        newCompanyMenuBtn: document.getElementById("newCompanyMenuBtn"),

        // Auth Modal
        authModal: document.getElementById("authModal"),
        googleLoginBtn: document.getElementById("googleLoginBtn"),
        microsoftLoginBtn: document.getElementById("microsoftLoginBtn"),
        googleButtonContainer: document.getElementById("googleButtonContainer"),
        authTabLogin: document.getElementById("authTabLogin"),
        authTabRegister: document.getElementById("authTabRegister"),
        authErrorBox: document.getElementById("authErrorBox"),
        loginForm: document.getElementById("loginForm"),
        loginEmail: document.getElementById("loginEmail"),
        loginPassword: document.getElementById("loginPassword"),
        registerForm: document.getElementById("registerForm"),
        registerName: document.getElementById("registerName"),
        registerEmail: document.getElementById("registerEmail"),
        registerPassword: document.getElementById("registerPassword"),

        // Profile / My Stores Modal
        profileModal: document.getElementById("profileModal"),
        profileAvatarImg: document.getElementById("profileAvatarImg"),
        profileAvatarInitials: document.getElementById("profileAvatarInitials"),
        profileName: document.getElementById("profileName"),
        profileEmail: document.getElementById("profileEmail"),
        profileAvatarFile: document.getElementById("profileAvatarFile"),
        profileAvatarFileName: document.getElementById("profileAvatarFileName"),
        profileAvatarError: document.getElementById("profileAvatarError"),
        removeProfileAvatarBtn: document.getElementById("removeProfileAvatarBtn"),
        openCreateFromProfileBtn: document.getElementById("openCreateFromProfileBtn"),
        logoutBtn: document.getElementById("logoutBtn"),
        myStoresCountLabel: document.getElementById("myStoresCountLabel"),
        myStoresList: document.getElementById("myStoresList"),

        // Company Form Modal
        companyFormModal: document.getElementById("companyFormModal"),
        formModalTitle: document.getElementById("formModalTitle"),
        companyForm: document.getElementById("companyForm"),
        formCompanyId: document.getElementById("formCompanyId"),
        formLogoData: document.getElementById("formLogoData"),
        formLogoFile: document.getElementById("formLogoFile"),
        logoFileName: document.getElementById("logoFileName"),
        logoUploadError: document.getElementById("logoUploadError"),
        logoUploadPreviewBox: document.getElementById("logoUploadPreviewBox"),
        formLogoPreviewImg: document.getElementById("formLogoPreviewImg"),
        removeLogoBtn: document.getElementById("removeLogoBtn"),
        formName: document.getElementById("formName"),
        formCategory: document.getElementById("formCategory"),
        formSubsegment: document.getElementById("formSubsegment"),
        formDescription: document.getElementById("formDescription"),
        formPhone: document.getElementById("formPhone"),
        formWhatsapp: document.getElementById("formWhatsapp"),
        formInstagram: document.getElementById("formInstagram"),
        formApprovalNotice: document.getElementById("formApprovalNotice"),
        formSubmitBtn: document.getElementById("formSubmitBtn"),

        // Pix Modal
        pixModal: document.getElementById("pixModal"),
        pixStoreNameLabel: document.getElementById("pixStoreNameLabel"),
        pixQrCanvasWrap: document.getElementById("pixQrCanvasWrap"),
        pixKeyDisplay: document.getElementById("pixKeyDisplay"),
        pixCopiaColaText: document.getElementById("pixCopiaColaText"),
        copyPixCodeBtn: document.getElementById("copyPixCodeBtn"),
        pixProofForm: document.getElementById("pixProofForm"),
        pixCompanyId: document.getElementById("pixCompanyId"),
        pixIsRenewal: document.getElementById("pixIsRenewal"),
        pixTxIdInput: document.getElementById("pixTxIdInput"),
        pixPayerNoteInput: document.getElementById("pixPayerNoteInput"),

        toast: document.getElementById("toast")
    };

    let searchTimer = null;
    let toastTimer = null;

    function showToast(message) {
        el.toast.textContent = message;
        el.toast.classList.remove("hidden");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            el.toast.classList.add("hidden");
        }, 3400);
    }

    function openDrawer() {
        el.menuDrawer.classList.add("open");
        el.menuDrawer.setAttribute("aria-hidden", "false");
        el.menuBtn.setAttribute("aria-expanded", "true");
        el.drawerBackdrop.classList.remove("hidden");
    }

    function closeDrawer() {
        el.menuDrawer.classList.remove("open");
        el.menuDrawer.setAttribute("aria-hidden", "true");
        el.menuBtn.setAttribute("aria-expanded", "false");
        el.drawerBackdrop.classList.add("hidden");
    }

    function openModal(modal) {
        modal.classList.remove("hidden");
    }

    function closeModal(modal) {
        modal.classList.add("hidden");
    }

    function getInitials(name) {
        const parts = (name || "ES").trim().split(/\s+/);
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }

    function showAuthError(msg) {
        if (!msg) {
            el.authErrorBox.classList.add("hidden");
            el.authErrorBox.textContent = "";
            return;
        }
        el.authErrorBox.textContent = msg;
        el.authErrorBox.classList.remove("hidden");
    }

    function switchAuthTab(mode) {
        showAuthError("");
        const isLogin = mode === "login";
        el.authTabLogin.classList.toggle("active", isLogin);
        el.authTabLogin.setAttribute("aria-selected", String(isLogin));
        el.authTabRegister.classList.toggle("active", !isLogin);
        el.authTabRegister.setAttribute("aria-selected", String(!isLogin));
        el.loginForm.classList.toggle("hidden", !isLogin);
        el.registerForm.classList.toggle("hidden", isLogin);
    }

    function openAuthModal(afterAuthCallback = null) {
        state.pendingActionAfterAuth = afterAuthCallback;
        switchAuthTab("login");
        openModal(el.authModal);
    }

    async function onAuthenticated(authResponse) {
        state.user = authResponse.user;
        closeModal(el.authModal);
        showToast(`Bem-vindo(a), ${state.user.name}!`);
        await refreshMyStores();
        renderUserSessionUI();

        if (typeof state.pendingActionAfterAuth === "function") {
            const cb = state.pendingActionAfterAuth;
            state.pendingActionAfterAuth = null;
            cb();
        }
    }

    function renderUserSessionUI() {
        const isLogged = Boolean(state.user && AuthApi.getToken());
        if (isLogged) {
            const firstName = (state.user.name || "Conta").split(/\s+/)[0];
            el.headerAuthBtn.textContent = `👤 ${firstName}`;
            el.headerAuthBtn.classList.add("is-logged");
            el.profileName.textContent = state.user.name;
            el.profileEmail.textContent = state.user.email;
        } else {
            el.headerAuthBtn.textContent = "Entrar";
            el.headerAuthBtn.classList.remove("is-logged");
        }

        const currentCompany = state.companies[state.currentIndex];
        const canEditCurrent = isLogged && currentCompany && currentCompany.ownerId === state.user.id;
        el.editCompanyBtn.classList.toggle("hidden", !canEditCurrent);

        if (currentCompany && currentCompany.hasPendingUpdate && canEditCurrent) {
            el.companyPendingNotice.classList.remove("hidden");
        } else {
            el.companyPendingNotice.classList.add("hidden");
        }

        syncUserPhoto();
    }

    function syncUserPhoto() {
        const isLogged = Boolean(state.user && AuthApi.getToken());
        const avatarUrl = isLogged ? (state.user.avatarUrl || "") : "";
        const initials = isLogged ? getInitials(state.user.name || "ES") : "ES";
        el.profileAvatarInitials.textContent = initials;

        if (avatarUrl) {
            el.headerUserAvatarImg.src = avatarUrl;
            el.headerUserAvatarImg.alt = `Foto de ${state.user?.name || "usuário"}`;
            el.headerUserAvatarImg.classList.remove("hidden");
            el.headerUserDefaultIcon.classList.add("hidden");
            el.headerUserAvatarImg.onerror = () => {
                el.headerUserAvatarImg.classList.add("hidden");
                el.headerUserDefaultIcon.classList.remove("hidden");
            };

            el.profileAvatarImg.src = avatarUrl;
            el.profileAvatarImg.alt = `Foto de ${state.user?.name || "usuário"}`;
            el.profileAvatarImg.classList.remove("hidden");
            el.profileAvatarInitials.classList.add("hidden");
            el.profileAvatarImg.onerror = () => {
                el.profileAvatarImg.classList.add("hidden");
                el.profileAvatarInitials.classList.remove("hidden");
            };

            el.removeProfileAvatarBtn.classList.remove("hidden");
            if (!el.profileAvatarFileName.dataset.customLabel) {
                el.profileAvatarFileName.textContent = "Foto de perfil salva";
            }
        } else {
            el.headerUserAvatarImg.src = "";
            el.headerUserAvatarImg.classList.add("hidden");
            el.headerUserDefaultIcon.classList.remove("hidden");
            el.profileAvatarImg.src = "";
            el.profileAvatarImg.classList.add("hidden");
            el.profileAvatarInitials.classList.remove("hidden");
            el.removeProfileAvatarBtn.classList.add("hidden");
            delete el.profileAvatarFileName.dataset.customLabel;
            el.profileAvatarFileName.textContent = "Usando iniciais do perfil";
        }
    }

    function renderConnectionBanner() {
        if (CompanyApi.isDemoMode) {
            el.connectionBanner.textContent = "Modo demonstração offline (inicie a API Spring Boot na porta 8080 para login, Pix e banco de dados).";
            el.connectionBanner.classList.remove("hidden");
        } else {
            el.connectionBanner.classList.add("hidden");
        }
    }

    function updateActiveCategoryButtons() {
        el.serviceTypesNav.querySelectorAll("[data-category]").forEach((btn) => {
            btn.classList.toggle("active", btn.dataset.category === state.selectedCategory);
        });
        el.categoryList.querySelectorAll("[data-category]").forEach((btn) => {
            btn.classList.toggle("active", btn.dataset.category === state.selectedCategory);
        });
    }

    function selectCategory(category, shouldCloseDrawer = false) {
        state.selectedCategory = category;
        state.selectedSubsegment = "";
        state.currentIndex = 0;
        updateActiveCategoryButtons();
        renderResultsStrip();
        if (shouldCloseDrawer) closeDrawer();
        loadCompanies();
    }

    function renderCategories() {
        const categories = state.categories.length > 0
            ? state.categories
            : OFFICIAL_SERVICE_CATEGORIES;
        const categoriesKey = categories.join("|");

        if (state.renderedCategoriesKey === categoriesKey) {
            updateActiveCategoryButtons();
            return;
        }
        state.renderedCategoriesKey = categoriesKey;

        const buildButtons = (container, className, shouldCloseDrawer) => {
            container.innerHTML = "";
            const entries = [{ category: "", label: "Todos os Serviços" }, ...categories.map((cat) => ({ category: cat, label: cat }))];
            entries.forEach(({ category, label }) => {
                const btn = document.createElement("button");
                btn.type = "button";
                btn.dataset.category = category;
                btn.className = className;
                btn.textContent = label;
                btn.addEventListener("click", () => selectCategory(category, shouldCloseDrawer));
                container.appendChild(btn);
            });
        };

        buildButtons(el.serviceTypesNav, "service-type-tab", false);
        buildButtons(el.categoryList, "category-item", true);

        updateActiveCategoryButtons();
    }

    function updateActiveSubsegmentButtons() {
        el.resultsStrip.querySelectorAll("[data-subsegment]").forEach((btn) => {
            btn.classList.toggle("active", btn.dataset.subsegment === state.selectedSubsegment);
        });
    }

    function renderResultsStrip() {
        if (!state.selectedCategory) {
            if (state.renderedSubsegmentsKey === "__NONE__") return;
            state.renderedSubsegmentsKey = "__NONE__";
            el.resultsStrip.innerHTML = "";
            const hint = document.createElement("span");
            hint.className = "results-strip-hint";
            hint.textContent = "Selecione um tipo de serviço acima para ver os subsegmentos da comunidade.";
            el.resultsStrip.appendChild(hint);
            return;
        }

        const subsegments = state.subsegmentsMap[state.selectedCategory]
            || OFFICIAL_SERVICE_SUBSEGMENTS[state.selectedCategory]
            || [];
        const stripKey = `${state.selectedCategory}::${subsegments.join("|")}`;

        if (state.renderedSubsegmentsKey === stripKey) {
            updateActiveSubsegmentButtons();
            return;
        }
        state.renderedSubsegmentsKey = stripKey;

        el.resultsStrip.innerHTML = "";
        const entries = [{ subsegment: "", label: "Todos" }, ...subsegments.map((sub) => ({ subsegment: sub, label: sub }))];
        entries.forEach(({ subsegment, label }) => {
            const chip = document.createElement("button");
            chip.type = "button";
            chip.dataset.subsegment = subsegment;
            chip.className = "result-chip";
            chip.textContent = label;
            chip.addEventListener("click", () => {
                state.selectedSubsegment = subsegment;
                state.currentIndex = 0;
                updateActiveSubsegmentButtons();
                loadCompanies();
            });
            el.resultsStrip.appendChild(chip);
        });

        updateActiveSubsegmentButtons();
    }

    function updateActiveSubsegmentStoreItem() {
        el.subsegmentStoresList.querySelectorAll("[data-store-index]").forEach((btn) => {
            btn.classList.toggle("active", Number(btn.dataset.storeIndex) === state.currentIndex);
        });
    }

    function renderSubsegmentStoresList() {
        if (!state.selectedCategory || !state.selectedSubsegment) {
            el.subsegmentStoresList.classList.add("hidden");
            el.subsegmentStoresList.innerHTML = "";
            return;
        }

        el.subsegmentStoresList.classList.remove("hidden");
        el.subsegmentStoresList.innerHTML = "";

        const header = document.createElement("div");
        header.className = "subsegment-stores-header";
        const title = document.createElement("span");
        title.textContent = `Lojas em ${state.selectedSubsegment}`;
        const countBadge = document.createElement("span");
        countBadge.className = "subsegment-stores-count";
        countBadge.textContent = state.companies.length === 1 ? "1 loja" : `${state.companies.length} lojas`;
        header.appendChild(title);
        header.appendChild(countBadge);
        el.subsegmentStoresList.appendChild(header);

        if (state.companies.length === 0) {
            const emptyMsg = document.createElement("p");
            emptyMsg.className = "results-strip-hint";
            emptyMsg.textContent = "Nenhuma loja cadastrada neste subsegmento ainda.";
            el.subsegmentStoresList.appendChild(emptyMsg);
            return;
        }

        const grid = document.createElement("div");
        grid.className = "subsegment-stores-grid";

        state.companies.forEach((company, idx) => {
            const item = document.createElement("button");
            item.type = "button";
            item.dataset.storeIndex = String(idx);
            item.className = `subsegment-store-item ${idx === state.currentIndex ? "active" : ""}`;

            if (company.logoUrl) {
                const img = document.createElement("img");
                img.src = company.logoUrl;
                img.alt = company.name;
                img.className = "subsegment-store-thumb";
                item.appendChild(img);
            } else {
                const fallback = document.createElement("span");
                fallback.className = "subsegment-store-initials";
                fallback.textContent = getInitials(company.name);
                item.appendChild(fallback);
            }

            const meta = document.createElement("div");
            meta.className = "subsegment-store-meta";
            const nameEl = document.createElement("span");
            nameEl.className = "subsegment-store-name";
            nameEl.textContent = company.name;
            const phoneEl = document.createElement("span");
            phoneEl.className = "subsegment-store-phone";
            phoneEl.textContent = company.phone || "Ver detalhes";
            meta.appendChild(nameEl);
            meta.appendChild(phoneEl);
            item.appendChild(meta);

            item.addEventListener("click", () => {
                state.currentIndex = idx;
                renderActiveCompany();
                updateActiveSubsegmentStoreItem();
            });
            grid.appendChild(item);
        });

        el.subsegmentStoresList.appendChild(grid);
    }

    function renderActiveCompany() {
        if (state.companies.length === 0) {
            el.companyCard.classList.add("hidden");
            el.pagerRow.classList.add("hidden");
            el.emptyState.classList.remove("hidden");
            renderUserSessionUI();
            return;
        }

        el.emptyState.classList.add("hidden");
        el.companyCard.classList.remove("hidden");
        el.pagerRow.classList.remove("hidden");

        if (state.currentIndex >= state.companies.length) {
            state.currentIndex = 0;
        }

        const company = state.companies[state.currentIndex];

        el.companyName.textContent = company.name;
        el.companyDescription.textContent = company.description;
        el.companyCategoryBadge.textContent = company.subsegment
            ? `${company.category || "Geral"} • ${company.subsegment}`
            : (company.category || "Geral");
        el.companyInitials.textContent = getInitials(company.name);

        if (company.logoUrl) {
            el.companyLogoImg.src = company.logoUrl;
            el.companyLogoImg.alt = `Logo de ${company.name}`;
            el.companyLogoImg.classList.remove("hidden");
            el.companyLogoFallback.classList.add("hidden");
            el.companyLogoImg.onerror = () => {
                el.companyLogoImg.classList.add("hidden");
                el.companyLogoFallback.classList.remove("hidden");
            };
        } else {
            el.companyLogoImg.classList.add("hidden");
            el.companyLogoFallback.classList.remove("hidden");
        }

        renderUserSessionUI();

        const phoneDigits = (company.phone || "").replace(/\D/g, "");
        el.companyPhoneText.textContent = company.phone || "Não informado";
        el.companyPhoneLink.href = phoneDigits ? `tel:${phoneDigits}` : "#";

        if (company.whatsapp) {
            const waDigits = company.whatsapp.replace(/\D/g, "");
            const text = encodeURIComponent(`Olá! Vi a ${company.name} no Empreende Sede.`);
            el.whatsappLink.href = `https://wa.me/${waDigits}?text=${text}`;
            el.whatsappLink.classList.remove("disabled");
        } else {
            el.whatsappLink.href = "#";
            el.whatsappLink.classList.add("disabled");
        }

        if (company.instagram) {
            const handle = company.instagram.replace(/^@/, "");
            el.instagramLink.href = `https://instagram.com/${handle}`;
            el.instagramLink.classList.remove("disabled");
        } else {
            el.instagramLink.href = "#";
            el.instagramLink.classList.add("disabled");
        }

        el.pagerCounter.textContent = `${state.currentIndex + 1} / ${state.companies.length}`;
        el.prevCompanyBtn.disabled = state.currentIndex === 0;
        el.nextCompanyBtn.disabled = state.currentIndex === state.companies.length - 1;
    }

    function formatPaymentBadge(store) {
        if (store.paymentStatus === "PENDING_PAYMENT") {
            return { text: "Aguardando Pix R$ 50,00", cls: "status-warn" };
        }
        if (store.paymentStatus === "PAYMENT_SUBMITTED") {
            return { text: "Pix enviado • Aguardando Adm", cls: "status-info" };
        }
        if (store.expired || store.paymentStatus === "EXPIRED") {
            return { text: "Plano expirado • Renovar R$ 50,00", cls: "status-danger" };
        }
        if (!store.approved) {
            return { text: "Aguardando aprovação do Adm", cls: "status-info" };
        }
        if (store.hasPendingUpdate) {
            return { text: "Edição aguardando Adm", cls: "status-info" };
        }
        if (store.daysRemaining != null) {
            return { text: `Ativa • ${store.daysRemaining} dia(s) restantes`, cls: "status-ok" };
        }
        return { text: "Ativa na vitrine", cls: "status-ok" };
    }

    function renderMyStores() {
        const count = state.myStores.length;
        el.myStoresCountLabel.textContent = count === 1 ? "1 loja" : `${count} lojas`;
        el.myStoresList.innerHTML = "";

        if (count === 0) {
            const p = document.createElement("p");
            p.className = "empty-pending-msg";
            p.textContent = "Você ainda não cadastrou nenhuma loja. Clique acima para começar por R$ 50,00/mês.";
            el.myStoresList.appendChild(p);
            return;
        }

        state.myStores.forEach((store) => {
            const status = formatPaymentBadge(store);
            const card = document.createElement("div");
            card.className = "pending-item-card";

            const header = document.createElement("div");
            header.className = "pending-item-header";
            const badge = document.createElement("span");
            badge.className = `status-pill ${status.cls}`;
            badge.textContent = status.text;
            const title = document.createElement("strong");
            title.textContent = store.name;
            header.appendChild(title);
            header.appendChild(badge);

            const body = document.createElement("div");
            body.className = "pending-item-body";
            if (store.logoUrl) {
                const img = document.createElement("img");
                img.src = store.logoUrl;
                img.alt = store.name;
                img.className = "pending-thumb-img";
                body.appendChild(img);
            }

            const details = document.createElement("div");
            details.className = "pending-item-details";
            const catP = document.createElement("p");
            catP.textContent = `${store.category} • ${store.phone}`;
            details.appendChild(catP);

            if (store.subscriptionExpiresAt) {
                const expDate = new Date(store.subscriptionExpiresAt).toLocaleDateString("pt-BR");
                const expP = document.createElement("p");
                expP.textContent = `Divulgação válida até: ${expDate}`;
                details.appendChild(expP);
            }
            body.appendChild(details);

            const actions = document.createElement("div");
            actions.className = "pending-item-actions";

            if (store.paymentStatus === "PENDING_PAYMENT") {
                const payBtn = document.createElement("button");
                payBtn.type = "button";
                payBtn.className = "btn-approve";
                payBtn.textContent = "💳 Pagar Pix R$ 50,00";
                payBtn.addEventListener("click", () => {
                    closeModal(el.profileModal);
                    openPixModal(store, false);
                });
                actions.appendChild(payBtn);
            } else if (store.expired || store.paymentStatus === "PAID") {
                const renewBtn = document.createElement("button");
                renewBtn.type = "button";
                renewBtn.className = "btn-secondary btn-sm";
                renewBtn.textContent = "🔄 Renovar +1 mês (R$ 50)";
                renewBtn.addEventListener("click", () => {
                    closeModal(el.profileModal);
                    openPixModal(store, true);
                });
                actions.appendChild(renewBtn);
            }

            const editBtn = document.createElement("button");
            editBtn.type = "button";
            editBtn.className = "btn-secondary btn-sm";
            editBtn.textContent = "✏️ Editar";
            editBtn.addEventListener("click", () => {
                closeModal(el.profileModal);
                openCompanyForm(store);
            });
            actions.appendChild(editBtn);

            card.appendChild(header);
            card.appendChild(body);
            card.appendChild(actions);
            el.myStoresList.appendChild(card);
        });
    }

    async function refreshMyStores() {
        if (!state.user || !AuthApi.getToken()) {
            state.myStores = [];
            return;
        }
        try {
            state.myStores = await CompanyApi.listMine();
            renderMyStores();
        } catch {
            state.myStores = [];
        }
    }

    function openPixModal(store, isRenewal = false) {
        el.pixCompanyId.value = store.id;
        el.pixIsRenewal.value = String(Boolean(isRenewal));
        el.pixStoreNameLabel.textContent = isRenewal ? `Renovação (+1 mês): ${store.name}` : `Publicar loja: ${store.name}`;
        el.pixKeyDisplay.textContent = state.providers.pixKey || "Chave Pix não configurada";
        el.pixCopiaColaText.value = store.pixCode || "";
        el.pixTxIdInput.value = "";
        el.pixPayerNoteInput.value = "";

        el.pixQrCanvasWrap.innerHTML = "";
        if (store.pixCode && typeof window.qrcode === "function") {
            try {
                const qr = window.qrcode(0, "M");
                qr.addData(store.pixCode);
                qr.make();
                el.pixQrCanvasWrap.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
            } catch {
                el.pixQrCanvasWrap.textContent = "Use o código Pix Copia e Cola ao lado.";
            }
        } else {
            el.pixQrCanvasWrap.textContent = "Use o código Pix Copia e Cola ao lado.";
        }

        openModal(el.pixModal);
    }

    async function loadProviders() {
        try {
            state.providers = await AuthApi.getProviders();
        } catch {
            // fallback defaults already in state
        }
    }

    async function loadCompanies(keepId = null) {
        const seq = ++state.loadSeq;

        if (!state.hasLoadedOnce) {
            el.loadingState.classList.remove("hidden");
            el.companyCard.classList.add("hidden");
            el.pagerRow.classList.add("hidden");
            el.emptyState.classList.add("hidden");
        } else if (el.showcaseArea) {
            el.showcaseArea.classList.add("is-loading");
        }

        try {
            const [companies, categories, subsegments] = await Promise.all([
                CompanyApi.list(state.searchQuery, state.selectedCategory, state.selectedSubsegment),
                CompanyApi.listCategories(),
                CompanyApi.listSubsegments()
            ]);

            if (seq !== state.loadSeq) return;

            state.hasLoadedOnce = true;
            state.companies = companies;
            state.categories = categories;
            if (subsegments && Object.keys(subsegments).length > 0) {
                state.subsegmentsMap = subsegments;
            }

            if (keepId) {
                const foundIndex = companies.findIndex((c) => c.id === keepId);
                state.currentIndex = foundIndex >= 0 ? foundIndex : 0;
            } else if (state.currentIndex >= companies.length) {
                state.currentIndex = 0;
            }

            renderConnectionBanner();
            renderCategories();
            renderResultsStrip();
            renderSubsegmentStoresList();
            renderActiveCompany();
        } finally {
            if (seq === state.loadSeq) {
                el.loadingState.classList.add("hidden");
                if (el.showcaseArea) {
                    el.showcaseArea.classList.remove("is-loading");
                }
            }
        }
    }

    function updateFormLogoPreview(dataUrl, labelText = "") {
        el.formLogoData.value = dataUrl || "";
        el.logoUploadError.classList.add("hidden");
        el.logoUploadError.textContent = "";

        if (dataUrl) {
            el.formLogoPreviewImg.src = dataUrl;
            el.logoUploadPreviewBox.classList.remove("hidden");
            el.logoFileName.textContent = labelText || "Imagem atual carregada";
        } else {
            el.formLogoPreviewImg.src = "";
            el.logoUploadPreviewBox.classList.add("hidden");
            el.logoFileName.textContent = "Nenhum arquivo selecionado";
        }
    }

    function populateFormSubsegments(category, selectedSubsegment = "") {
        const list = state.subsegmentsMap[category] || OFFICIAL_SERVICE_SUBSEGMENTS[category] || [];
        el.formSubsegment.innerHTML = "";
        const defaultOpt = document.createElement("option");
        defaultOpt.value = "";
        defaultOpt.textContent = list.length > 0 ? "Selecione o subsegmento (opcional)..." : "Selecione primeiro o tipo de serviço...";
        el.formSubsegment.appendChild(defaultOpt);

        list.forEach((sub) => {
            const opt = document.createElement("option");
            opt.value = sub;
            opt.textContent = sub;
            el.formSubsegment.appendChild(opt);
        });
        el.formSubsegment.value = selectedSubsegment || "";
    }

    function openCompanyForm(company = null) {
        if (!state.user || !AuthApi.getToken()) {
            openAuthModal(() => openCompanyForm(company));
            return;
        }

        el.formLogoFile.value = "";
        el.logoUploadError.classList.add("hidden");

        if (company) {
            const source = company.hasPendingUpdate && company.pendingData ? company.pendingData : company;
            el.formModalTitle.textContent = "Editar Minha Loja";
            el.formCompanyId.value = company.id;
            el.formName.value = source.name || "";
            el.formCategory.value = source.category || "";
            populateFormSubsegments(source.category || "", source.subsegment || "");
            el.formDescription.value = source.description || "";
            el.formPhone.value = source.phone || "";
            el.formWhatsapp.value = source.whatsapp || "";
            el.formInstagram.value = source.instagram || "";
            el.formApprovalNotice.innerHTML = "ℹ️ As modificações enviadas ficam pendentes até a <strong>aprovação do Administrador</strong>.";
            el.formSubmitBtn.textContent = "Enviar Edição para o Adm";
            updateFormLogoPreview(source.logoUrl || "", source.logoUrl ? "Logo atual da empresa" : "");
        } else {
            el.formModalTitle.textContent = "Cadastrar Nova Loja";
            el.companyForm.reset();
            el.formCompanyId.value = "";
            populateFormSubsegments("", "");
            el.formApprovalNotice.innerHTML = "💳 <strong>Taxa de divulgação: R$ 50,00 no Pix</strong> (direito a 1 mês na vitrine). Sua loja entra no ar após pagamento e aprovação do Administrador.";
            el.formSubmitBtn.textContent = "Continuar para Pix (R$ 50,00)";
            updateFormLogoPreview("", "");
        }
        openModal(el.companyFormModal);
    }

    el.formCategory.addEventListener("change", () => {
        populateFormSubsegments(el.formCategory.value, "");
    });

    function processImageUpload(fileInput, errorEl, maxKB, onLoaded) {
        const file = fileInput.files?.[0];
        if (!file) return;

        errorEl.classList.add("hidden");
        errorEl.textContent = "";

        const validTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!validTypes.includes(file.type)) {
            errorEl.textContent = "Formato inválido. Selecione uma imagem JPG, PNG ou WebP.";
            errorEl.classList.remove("hidden");
            fileInput.value = "";
            return;
        }

        const sizeKB = (file.size / 1024).toFixed(1);
        if (file.size > maxKB * 1024) {
            errorEl.innerHTML =
                `⚠️ O arquivo selecionado tem <strong>${sizeKB} KB</strong>, mas o tamanho máximo permitido é de <strong>${maxKB} KB</strong>. ` +
                `Comprima a imagem no <a href="https://squoosh.app/" target="_blank" rel="noopener noreferrer">Squoosh</a>, ` +
                `<a href="https://tinypng.com/" target="_blank" rel="noopener noreferrer">TinyPNG</a> ou ` +
                `<a href="https://www.iloveimg.com/pt/comprimir-imagem" target="_blank" rel="noopener noreferrer">iLoveIMG</a> e tente novamente.`;
            errorEl.classList.remove("hidden");
            fileInput.value = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result;
            const probe = new Image();
            probe.onload = () => onLoaded(dataUrl, `${file.name} (${sizeKB} KB • ${probe.width}×${probe.height} px)`);
            probe.onerror = () => onLoaded(dataUrl, `${file.name} (${sizeKB} KB)`);
            probe.src = dataUrl;
        };
        reader.readAsDataURL(file);
    }

    // Upload de imagem da Logo da Loja (Vitrine/Carrossel: 800×600 px 4:3, máx. 300 KB)
    el.formLogoFile.addEventListener("change", () => {
        processImageUpload(el.formLogoFile, el.logoUploadError, MAX_LOGO_SIZE_KB, (dataUrl, info) => {
            updateFormLogoPreview(dataUrl, info);
        });
    });

    // Upload separado da Foto de Perfil do Usuário (Avatar 1:1 400×400 px, máx. 150 KB)
    el.profileAvatarFile.addEventListener("change", () => {
        processImageUpload(el.profileAvatarFile, el.profileAvatarError, MAX_AVATAR_SIZE_KB, async (dataUrl, info) => {
            try {
                state.user = await AuthApi.updateAvatar(dataUrl);
                el.profileAvatarFileName.dataset.customLabel = "true";
                el.profileAvatarFileName.textContent = info;
                syncUserPhoto();
                showToast("Foto de perfil atualizada!");
            } catch (err) {
                el.profileAvatarError.textContent = err.message || "Não foi possível salvar a foto de perfil.";
                el.profileAvatarError.classList.remove("hidden");
                el.profileAvatarFile.value = "";
            }
        });
    });

    el.removeProfileAvatarBtn.addEventListener("click", async () => {
        try {
            state.user = await AuthApi.updateAvatar(null);
            el.profileAvatarFile.value = "";
            el.profileAvatarError.classList.add("hidden");
            delete el.profileAvatarFileName.dataset.customLabel;
            syncUserPhoto();
            showToast("Foto de perfil removida.");
        } catch (err) {
            showToast(err.message || "Erro ao remover foto de perfil.");
        }
    });

    el.removeLogoBtn.addEventListener("click", () => {
        el.formLogoFile.value = "";
        updateFormLogoPreview("", "");
    });

    // Autenticação: Abas Login / Registro e OAuth Google / Microsoft
    el.authTabLogin.addEventListener("click", () => switchAuthTab("login"));
    el.authTabRegister.addEventListener("click", () => switchAuthTab("register"));

    el.loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        showAuthError("");
        try {
            const resp = await AuthApi.login({
                email: el.loginEmail.value.trim(),
                password: el.loginPassword.value
            });
            await onAuthenticated(resp);
        } catch (err) {
            showAuthError(err.message);
        }
    });

    el.registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        showAuthError("");
        try {
            const resp = await AuthApi.register({
                name: el.registerName.value.trim(),
                email: el.registerEmail.value.trim(),
                password: el.registerPassword.value
            });
            await onAuthenticated(resp);
        } catch (err) {
            showAuthError(err.message);
        }
    });

    function loadScriptOnce(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }
            const s = document.createElement("script");
            s.src = src;
            s.async = true;
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
        });
    }

    el.googleLoginBtn.addEventListener("click", async () => {
        showAuthError("");
        if (!state.providers.googleEnabled || !state.providers.googleClientId) {
            showAuthError("Login com Google (Gmail) requer GOOGLE_CLIENT_ID configurado no backend. Por enquanto, você pode criar sua conta usando seu @gmail.com logo abaixo.");
            return;
        }
        try {
            await loadScriptOnce("https://accounts.google.com/gsi/client");
            window.google.accounts.id.initialize({
                client_id: state.providers.googleClientId,
                callback: async (response) => {
                    try {
                        const authResp = await AuthApi.loginWithGoogle(response.credential);
                        await onAuthenticated(authResp);
                    } catch (err) {
                        showAuthError(err.message);
                    }
                }
            });
            el.googleButtonContainer.classList.remove("hidden");
            window.google.accounts.id.renderButton(el.googleButtonContainer, {
                theme: "outline",
                size: "large",
                width: "100%"
            });
            window.google.accounts.id.prompt();
        } catch {
            showAuthError("Não foi possível carregar o login do Google.");
        }
    });

    el.microsoftLoginBtn.addEventListener("click", () => {
        showAuthError("");
        if (!state.providers.microsoftEnabled || !state.providers.microsoftClientId) {
            showAuthError("Login com Microsoft (Outlook) requer MICROSOFT_CLIENT_ID configurado no backend. Por enquanto, você pode criar sua conta usando seu @outlook.com logo abaixo.");
            return;
        }
        const redirectUri = window.location.origin + window.location.pathname;
        const authUrl = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize"
            + `?client_id=${encodeURIComponent(state.providers.microsoftClientId)}`
            + "&response_type=token"
            + `&redirect_uri=${encodeURIComponent(redirectUri)}`
            + `&scope=${encodeURIComponent("User.Read openid email profile")}`;

        const popup = window.open(authUrl, "ms_oauth", "width=500,height=620");
        if (!popup) {
            showAuthError("Habilite pop-ups no navegador para entrar com a Microsoft.");
            return;
        }
        const timer = setInterval(async () => {
            try {
                if (popup.closed) {
                    clearInterval(timer);
                    return;
                }
                if (popup.location.origin === window.location.origin && popup.location.hash.includes("access_token=")) {
                    const hashParams = new URLSearchParams(popup.location.hash.substring(1));
                    const accessToken = hashParams.get("access_token");
                    popup.close();
                    clearInterval(timer);
                    if (accessToken) {
                        const authResp = await AuthApi.loginWithMicrosoft(accessToken);
                        await onAuthenticated(authResp);
                    }
                }
            } catch {
                // cross-origin while user is still on login.microsoftonline.com
            }
        }, 400);
    });

    // Eventos de navegação e busca
    el.menuBtn.addEventListener("click", openDrawer);
    el.closeDrawerBtn.addEventListener("click", closeDrawer);
    el.drawerBackdrop.addEventListener("click", closeDrawer);

    el.logoBtn.addEventListener("click", (e) => {
        e.preventDefault();
        state.searchQuery = "";
        state.selectedCategory = "";
        state.selectedSubsegment = "";
        state.currentIndex = 0;
        el.searchInput.value = "";
        el.clearSearchBtn.classList.add("hidden");
        loadCompanies();
    });

    el.searchInput.addEventListener("input", () => {
        state.searchQuery = el.searchInput.value;
        el.clearSearchBtn.classList.toggle("hidden", !state.searchQuery);
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => loadCompanies(), 250);
    });

    el.clearSearchBtn.addEventListener("click", () => {
        state.searchQuery = "";
        el.searchInput.value = "";
        el.clearSearchBtn.classList.add("hidden");
        loadCompanies();
    });

    el.resetFilterBtn.addEventListener("click", () => {
        state.searchQuery = "";
        state.selectedCategory = "";
        state.selectedSubsegment = "";
        state.currentIndex = 0;
        el.searchInput.value = "";
        el.clearSearchBtn.classList.add("hidden");
        loadCompanies();
    });

    el.prevCompanyBtn.addEventListener("click", () => {
        if (state.currentIndex > 0) {
            state.currentIndex -= 1;
            renderActiveCompany();
            updateActiveSubsegmentStoreItem();
        }
    });

    el.nextCompanyBtn.addEventListener("click", () => {
        if (state.currentIndex < state.companies.length - 1) {
            state.currentIndex += 1;
            renderActiveCompany();
            updateActiveSubsegmentStoreItem();
        }
    });

    el.copyPhoneBtn.addEventListener("click", async () => {
        const company = state.companies[state.currentIndex];
        if (!company?.phone) return;
        try {
            await navigator.clipboard.writeText(company.phone);
            showToast("Telefone copiado!");
        } catch {
            showToast("Não foi possível copiar.");
        }
    });

    async function handleOpenAccountOrAuth() {
        if (!state.user || !AuthApi.getToken()) {
            openAuthModal(async () => {
                await refreshMyStores();
                openModal(el.profileModal);
            });
            return;
        }
        await refreshMyStores();
        renderUserSessionUI();
        openModal(el.profileModal);
    }

    el.headerAuthBtn.addEventListener("click", handleOpenAccountOrAuth);
    el.profileBtn.addEventListener("click", handleOpenAccountOrAuth);

    el.logoutBtn.addEventListener("click", () => {
        AuthApi.clearSession();
        state.user = null;
        state.myStores = [];
        closeModal(el.profileModal);
        renderUserSessionUI();
        showToast("Você saiu da conta.");
    });

    document.querySelectorAll("[data-close-modal]").forEach((btn) => {
        btn.addEventListener("click", () => {
            const modalId = btn.getAttribute("data-close-modal");
            closeModal(document.getElementById(modalId));
        });
    });

    [el.authModal, el.profileModal, el.companyFormModal, el.pixModal].forEach((modal) => {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) closeModal(modal);
        });
    });

    el.newCompanyMenuBtn.addEventListener("click", () => {
        closeDrawer();
        openCompanyForm();
    });

    el.openCreateFromProfileBtn.addEventListener("click", () => {
        closeModal(el.profileModal);
        openCompanyForm();
    });

    el.editCompanyBtn.addEventListener("click", () => {
        const current = state.companies[state.currentIndex];
        if (current) openCompanyForm(current);
    });

    el.companyForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const id = el.formCompanyId.value.trim();
        const payload = {
            name: el.formName.value.trim(),
            category: el.formCategory.value.trim(),
            subsegment: el.formSubsegment.value.trim() || null,
            logoUrl: el.formLogoData.value.trim() || null,
            description: el.formDescription.value.trim(),
            phone: el.formPhone.value.trim(),
            whatsapp: el.formWhatsapp.value.trim(),
            instagram: el.formInstagram.value.trim()
        };

        try {
            const saved = id
                ? await CompanyApi.update(id, payload)
                : await CompanyApi.create(payload);

            closeModal(el.companyFormModal);
            await refreshMyStores();

            if (id) {
                showToast("Modificações enviadas! Aguardando aprovação do Administrador.");
                await loadCompanies(saved.id);
            } else {
                showToast("Loja pré-cadastrada! Realize o Pix de R$ 50,00 para aprovação.");
                openPixModal(saved, false);
            }
        } catch (err) {
            showToast(err.message || "Erro ao salvar empresa.");
        }
    });

    el.copyPixCodeBtn.addEventListener("click", async () => {
        const code = el.pixCopiaColaText.value.trim();
        if (!code) return;
        try {
            await navigator.clipboard.writeText(code);
            showToast("Código Pix Copia e Cola copiado!");
        } catch {
            showToast("Não foi possível copiar o código Pix.");
        }
    });

    el.pixProofForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const id = el.pixCompanyId.value;
        const isRenewal = el.pixIsRenewal.value === "true";

        try {
            await CompanyApi.submitPixProof(id, {
                txId: el.pixTxIdInput.value.trim(),
                payerNote: el.pixPayerNoteInput.value.trim(),
                renewal: isRenewal
            });
            closeModal(el.pixModal);
            await refreshMyStores();
            showToast("Comprovante Pix enviado! Aguardando aprovação do Administrador.");
        } catch (err) {
            showToast(err.message || "Erro ao enviar comprovante Pix.");
        }
    });

    // Inicialização
    (async () => {
        await loadProviders();
        if (AuthApi.getToken()) {
            state.user = await AuthApi.verifySession();
            await refreshMyStores();
        }
        await loadCompanies();
    })();
});
