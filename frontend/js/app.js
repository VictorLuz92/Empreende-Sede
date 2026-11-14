document.addEventListener("DOMContentLoaded", () => {
    const MAX_LOGO_SIZE_KB = 300;
    const MAX_LOGO_SIZE_BYTES = MAX_LOGO_SIZE_KB * 1024;
    const ROLE_STORAGE_KEY = "empreende_sede_session_role";

    const state = {
        companies: [],
        categories: [],
        pendingList: [],
        currentIndex: 0,
        searchQuery: "",
        selectedCategory: "",
        role: localStorage.getItem(ROLE_STORAGE_KEY) || "USER"
    };

    const el = {
        menuBtn: document.getElementById("menuBtn"),
        closeDrawerBtn: document.getElementById("closeDrawerBtn"),
        menuDrawer: document.getElementById("menuDrawer"),
        drawerBackdrop: document.getElementById("drawerBackdrop"),
        logoBtn: document.getElementById("logoBtn"),
        profileBtn: document.getElementById("profileBtn"),
        sessionRoleBadge: document.getElementById("sessionRoleBadge"),
        headerUserAvatarImg: document.getElementById("headerUserAvatarImg"),
        headerUserDefaultIcon: document.getElementById("headerUserDefaultIcon"),
        pendingBadgeCount: document.getElementById("pendingBadgeCount"),
        connectionBanner: document.getElementById("connectionBanner"),

        searchInput: document.getElementById("searchInput"),
        clearSearchBtn: document.getElementById("clearSearchBtn"),
        resultsStrip: document.getElementById("resultsStrip"),
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
        profileModal: document.getElementById("profileModal"),
        roleUserBtn: document.getElementById("roleUserBtn"),
        roleAdminBtn: document.getElementById("roleAdminBtn"),
        adminTabBadge: document.getElementById("adminTabBadge"),
        profileAvatarImg: document.getElementById("profileAvatarImg"),
        profileAvatarInitials: document.getElementById("profileAvatarInitials"),
        profileName: document.getElementById("profileName"),
        profileEmail: document.getElementById("profileEmail"),
        profileRoleHint: document.getElementById("profileRoleHint"),
        openCreateFromProfileBtn: document.getElementById("openCreateFromProfileBtn"),
        openEditFromProfileBtn: document.getElementById("openEditFromProfileBtn"),
        deleteCurrentCompanyBtn: document.getElementById("deleteCurrentCompanyBtn"),
        adminApprovalSection: document.getElementById("adminApprovalSection"),
        pendingCountLabel: document.getElementById("pendingCountLabel"),
        pendingApprovalsList: document.getElementById("pendingApprovalsList"),

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
        formLogoAvatarPreviewImg: document.getElementById("formLogoAvatarPreviewImg"),
        removeLogoBtn: document.getElementById("removeLogoBtn"),
        formName: document.getElementById("formName"),
        formCategory: document.getElementById("formCategory"),
        formDescription: document.getElementById("formDescription"),
        formPhone: document.getElementById("formPhone"),
        formWhatsapp: document.getElementById("formWhatsapp"),
        formInstagram: document.getElementById("formInstagram"),
        formApprovalNotice: document.getElementById("formApprovalNotice"),
        formSubmitBtn: document.getElementById("formSubmitBtn"),

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
        }, 3200);
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

    function setRole(newRole) {
        state.role = newRole === "ADMIN" ? "ADMIN" : "USER";
        localStorage.setItem(ROLE_STORAGE_KEY, state.role);
        renderSessionUI();
    }

    function renderSessionUI() {
        const isAdmin = state.role === "ADMIN";
        const currentCompany = state.companies[state.currentIndex];

        el.sessionRoleBadge.textContent = isAdmin ? "🛡️ Admin" : "👤 Usuário";
        el.sessionRoleBadge.classList.toggle("is-admin", isAdmin);

        el.roleUserBtn.classList.toggle("active", !isAdmin);
        el.roleUserBtn.setAttribute("aria-selected", String(!isAdmin));
        el.roleAdminBtn.classList.toggle("active", isAdmin);
        el.roleAdminBtn.setAttribute("aria-selected", String(isAdmin));

        if (isAdmin) {
            el.profileName.textContent = "Administrador do Portal";
            el.profileEmail.textContent = "admin@empreendesede.com.br";
            el.profileRoleHint.textContent = "Você pode aprovar ou rejeitar edições enviadas pelos usuários e publicar alterações imediatamente.";
            el.deleteCurrentCompanyBtn.classList.remove("hidden");
            el.adminApprovalSection.classList.remove("hidden");
            el.formApprovalNotice.innerHTML = "🛡️ Sessão atual: <strong>Administrador</strong>. Suas alterações serão publicadas imediatamente.";
            el.formApprovalNotice.classList.add("is-admin-notice");
            el.formSubmitBtn.textContent = "Salvar e Publicar";
        } else {
            el.profileName.textContent = currentCompany
                ? `Usuário — ${currentCompany.name}`
                : "Empreendedor Local (Usuário)";
            el.profileEmail.textContent = "empreendedor@empreendesede.com.br";
            el.profileRoleHint.textContent = "Você pode editar os dados e a logo da loja. As mudanças precisam ser aprovadas pelo Administrador.";
            el.deleteCurrentCompanyBtn.classList.add("hidden");
            el.adminApprovalSection.classList.add("hidden");
            el.formApprovalNotice.innerHTML = "ℹ️ Sessão atual: <strong>Usuário</strong>. Ao salvar, as alterações ficarão pendentes até a aprovação do <strong>Administrador</strong>.";
            el.formApprovalNotice.classList.remove("is-admin-notice");
            el.formSubmitBtn.textContent = "Enviar para Aprovação";
        }

        renderPendingApprovals();
    }

    function syncUserPhoto(company) {
        const logoUrl = company?.logoUrl || "";
        const initials = getInitials(company?.name || "ES");
        el.profileAvatarInitials.textContent = initials;

        if (logoUrl) {
            el.headerUserAvatarImg.src = logoUrl;
            el.headerUserAvatarImg.alt = `Foto de ${company.name}`;
            el.headerUserAvatarImg.classList.remove("hidden");
            el.headerUserDefaultIcon.classList.add("hidden");
            el.headerUserAvatarImg.onerror = () => {
                el.headerUserAvatarImg.classList.add("hidden");
                el.headerUserDefaultIcon.classList.remove("hidden");
            };

            el.profileAvatarImg.src = logoUrl;
            el.profileAvatarImg.alt = `Foto de ${company.name}`;
            el.profileAvatarImg.classList.remove("hidden");
            el.profileAvatarInitials.classList.add("hidden");
            el.profileAvatarImg.onerror = () => {
                el.profileAvatarImg.classList.add("hidden");
                el.profileAvatarInitials.classList.remove("hidden");
            };
        } else {
            el.headerUserAvatarImg.classList.add("hidden");
            el.headerUserDefaultIcon.classList.remove("hidden");
            el.profileAvatarImg.classList.add("hidden");
            el.profileAvatarInitials.classList.remove("hidden");
        }
    }

    function renderConnectionBanner() {
        if (CompanyApi.isDemoMode) {
            el.connectionBanner.textContent = "Modo demonstração offline (inicie a API Spring Boot na porta 8080 para sincronizar com o banco).";
            el.connectionBanner.classList.remove("hidden");
        } else {
            el.connectionBanner.classList.add("hidden");
        }
    }

    function renderCategories() {
        el.categoryList.innerHTML = "";

        const allBtn = document.createElement("button");
        allBtn.className = `category-item ${state.selectedCategory === "" ? "active" : ""}`;
        allBtn.textContent = "Todas as categorias";
        allBtn.addEventListener("click", () => {
            state.selectedCategory = "";
            closeDrawer();
            loadCompanies();
        });
        el.categoryList.appendChild(allBtn);

        state.categories.forEach((cat) => {
            const btn = document.createElement("button");
            btn.className = `category-item ${state.selectedCategory === cat ? "active" : ""}`;
            btn.textContent = cat;
            btn.addEventListener("click", () => {
                state.selectedCategory = cat;
                closeDrawer();
                loadCompanies();
            });
            el.categoryList.appendChild(btn);
        });
    }

    function renderResultsStrip() {
        el.resultsStrip.innerHTML = "";
        state.companies.forEach((company, idx) => {
            const chip = document.createElement("button");
            chip.className = `result-chip ${idx === state.currentIndex ? "active" : ""}`;
            chip.textContent = company.hasPendingUpdate ? `${company.name} ⏳` : company.name;
            chip.addEventListener("click", () => {
                state.currentIndex = idx;
                renderActiveCompany();
                renderResultsStrip();
            });
            el.resultsStrip.appendChild(chip);
        });
    }

    function renderActiveCompany() {
        if (state.companies.length === 0) {
            el.companyCard.classList.add("hidden");
            el.pagerRow.classList.add("hidden");
            el.emptyState.classList.remove("hidden");
            syncUserPhoto(null);
            renderSessionUI();
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
        el.companyCategoryBadge.textContent = company.category || "Geral";
        el.companyInitials.textContent = getInitials(company.name);

        if (company.hasPendingUpdate) {
            el.companyPendingNotice.classList.remove("hidden");
        } else {
            el.companyPendingNotice.classList.add("hidden");
        }

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

        syncUserPhoto(company);
        renderSessionUI();

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

    function renderPendingApprovals() {
        const count = state.pendingList.length;

        if (count > 0) {
            el.pendingBadgeCount.textContent = String(count);
            el.pendingBadgeCount.classList.remove("hidden");
            el.adminTabBadge.textContent = String(count);
            el.adminTabBadge.classList.remove("hidden");
        } else {
            el.pendingBadgeCount.classList.add("hidden");
            el.adminTabBadge.classList.add("hidden");
        }

        el.pendingCountLabel.textContent = count === 1 ? "1 pendente" : `${count} pendentes`;
        el.pendingApprovalsList.innerHTML = "";

        if (count === 0) {
            const emptyP = document.createElement("p");
            emptyP.className = "empty-pending-msg";
            emptyP.textContent = "Nenhuma alteração pendente de aprovação no momento.";
            el.pendingApprovalsList.appendChild(emptyP);
            return;
        }

        state.pendingList.forEach((item) => {
            const isEdit = item.hasPendingUpdate && item.pendingData;
            const data = isEdit ? item.pendingData : item;

            const card = document.createElement("div");
            card.className = "pending-item-card";

            const header = document.createElement("div");
            header.className = "pending-item-header";

            const typeBadge = document.createElement("span");
            typeBadge.className = `pending-type-badge ${isEdit ? "is-edit" : "is-create"}`;
            typeBadge.textContent = isEdit ? "Edição de Loja" : "Nova Loja";

            const storeTitle = document.createElement("strong");
            storeTitle.textContent = isEdit ? `${item.name} → ${data.name}` : data.name;

            header.appendChild(typeBadge);
            header.appendChild(storeTitle);

            const body = document.createElement("div");
            body.className = "pending-item-body";

            if (data.logoUrl) {
                const thumb = document.createElement("img");
                thumb.src = data.logoUrl;
                thumb.alt = `Logo proposta para ${data.name}`;
                thumb.className = "pending-thumb-img";
                body.appendChild(thumb);
            }

            const details = document.createElement("div");
            details.className = "pending-item-details";

            const catP = document.createElement("p");
            catP.innerHTML = `<strong>Categoria:</strong> ${escapeHtml(data.category || "Geral")} &bull; <strong>Tel:</strong> ${escapeHtml(data.phone || "-")}`;

            const descP = document.createElement("p");
            descP.textContent = data.description || "";

            details.appendChild(catP);
            details.appendChild(descP);
            body.appendChild(details);

            const actions = document.createElement("div");
            actions.className = "pending-item-actions";

            const approveBtn = document.createElement("button");
            approveBtn.type = "button";
            approveBtn.className = "btn-approve";
            approveBtn.textContent = "✓ Aprovar";
            approveBtn.addEventListener("click", async () => {
                try {
                    const approvedCompany = await CompanyApi.approve(item.id);
                    showToast(`Alterações de "${approvedCompany.name}" aprovadas!`);
                    await loadCompanies(approvedCompany.id);
                } catch {
                    showToast("Erro ao aprovar alterações.");
                }
            });

            const rejectBtn = document.createElement("button");
            rejectBtn.type = "button";
            rejectBtn.className = "btn-reject";
            rejectBtn.textContent = "✕ Rejeitar";
            rejectBtn.addEventListener("click", async () => {
                try {
                    await CompanyApi.reject(item.id);
                    showToast("Solicitação rejeitada.");
                    await loadCompanies(item.id);
                } catch {
                    showToast("Erro ao rejeitar solicitação.");
                }
            });

            actions.appendChild(approveBtn);
            actions.appendChild(rejectBtn);

            card.appendChild(header);
            card.appendChild(body);
            card.appendChild(actions);
            el.pendingApprovalsList.appendChild(card);
        });
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    async function loadCompanies(keepId = null) {
        el.loadingState.classList.remove("hidden");
        el.companyCard.classList.add("hidden");
        el.emptyState.classList.add("hidden");

        try {
            const [companies, categories, pendingList] = await Promise.all([
                CompanyApi.list(state.searchQuery, state.selectedCategory),
                CompanyApi.listCategories(),
                CompanyApi.listPending()
            ]);

            state.companies = companies;
            state.categories = categories;
            state.pendingList = pendingList;

            if (keepId) {
                const foundIndex = companies.findIndex((c) => c.id === keepId);
                state.currentIndex = foundIndex >= 0 ? foundIndex : 0;
            } else if (state.currentIndex >= companies.length) {
                state.currentIndex = 0;
            }

            renderConnectionBanner();
            renderCategories();
            renderResultsStrip();
            renderActiveCompany();
        } finally {
            el.loadingState.classList.add("hidden");
        }
    }

    function updateFormLogoPreview(dataUrl, labelText = "") {
        el.formLogoData.value = dataUrl || "";
        el.logoUploadError.classList.add("hidden");
        el.logoUploadError.textContent = "";

        if (dataUrl) {
            el.formLogoPreviewImg.src = dataUrl;
            el.formLogoAvatarPreviewImg.src = dataUrl;
            el.logoUploadPreviewBox.classList.remove("hidden");
            el.logoFileName.textContent = labelText || "Imagem atual carregada";
        } else {
            el.formLogoPreviewImg.src = "";
            el.formLogoAvatarPreviewImg.src = "";
            el.logoUploadPreviewBox.classList.add("hidden");
            el.logoFileName.textContent = "Nenhum arquivo selecionado";
        }
    }

    function openCompanyForm(company = null) {
        el.formLogoFile.value = "";
        el.logoUploadError.classList.add("hidden");

        if (company) {
            const source = company.hasPendingUpdate && company.pendingData ? company.pendingData : company;
            el.formModalTitle.textContent = state.role === "ADMIN"
                ? "Editar Loja (Administrador)"
                : "Editar Minha Loja (Usuário)";
            el.formCompanyId.value = company.id;
            el.formName.value = source.name || "";
            el.formCategory.value = source.category || "";
            el.formDescription.value = source.description || "";
            el.formPhone.value = source.phone || "";
            el.formWhatsapp.value = source.whatsapp || "";
            el.formInstagram.value = source.instagram || "";
            updateFormLogoPreview(source.logoUrl || "", source.logoUrl ? "Logo atual da empresa" : "");
        } else {
            el.formModalTitle.textContent = state.role === "ADMIN"
                ? "Cadastrar Empresa (Administrador)"
                : "Cadastrar Empresa (Usuário)";
            el.companyForm.reset();
            el.formCompanyId.value = "";
            updateFormLogoPreview("", "");
        }
        renderSessionUI();
        openModal(el.companyFormModal);
    }

    // Upload de imagem da Logo com validação de tamanho máximo (300 KB) e leitura de resolução
    el.formLogoFile.addEventListener("change", () => {
        const file = el.formLogoFile.files?.[0];
        if (!file) return;

        const validTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!validTypes.includes(file.type)) {
            el.logoUploadError.textContent = "Formato inválido. Selecione uma imagem JPG, PNG ou WebP.";
            el.logoUploadError.classList.remove("hidden");
            el.formLogoFile.value = "";
            return;
        }

        const sizeKB = (file.size / 1024).toFixed(1);
        if (file.size > MAX_LOGO_SIZE_BYTES) {
            el.logoUploadError.innerHTML =
                `⚠️ O arquivo selecionado tem <strong>${sizeKB} KB</strong>, mas o tamanho máximo permitido é de <strong>${MAX_LOGO_SIZE_KB} KB</strong>. ` +
                `Comprima a imagem no <a href="https://squoosh.app/" target="_blank" rel="noopener noreferrer">Squoosh</a>, ` +
                `<a href="https://tinypng.com/" target="_blank" rel="noopener noreferrer">TinyPNG</a> ou ` +
                `<a href="https://www.iloveimg.com/pt/comprimir-imagem" target="_blank" rel="noopener noreferrer">iLoveIMG</a> e tente novamente.`;
            el.logoUploadError.classList.remove("hidden");
            el.formLogoFile.value = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result;
            const probe = new Image();
            probe.onload = () => {
                const info = `${file.name} (${sizeKB} KB • ${probe.width}×${probe.height} px)`;
                updateFormLogoPreview(dataUrl, info);
            };
            probe.onerror = () => {
                updateFormLogoPreview(dataUrl, `${file.name} (${sizeKB} KB)`);
            };
            probe.src = dataUrl;
        };
        reader.readAsDataURL(file);
    });

    el.removeLogoBtn.addEventListener("click", () => {
        el.formLogoFile.value = "";
        updateFormLogoPreview("", "");
    });

    // Alternância de sessão Usuário / Administrador
    el.roleUserBtn.addEventListener("click", () => setRole("USER"));
    el.roleAdminBtn.addEventListener("click", () => setRole("ADMIN"));

    // Eventos de navegação e busca
    el.menuBtn.addEventListener("click", openDrawer);
    el.closeDrawerBtn.addEventListener("click", closeDrawer);
    el.drawerBackdrop.addEventListener("click", closeDrawer);

    el.logoBtn.addEventListener("click", (e) => {
        e.preventDefault();
        state.searchQuery = "";
        state.selectedCategory = "";
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
        el.searchInput.value = "";
        el.clearSearchBtn.classList.add("hidden");
        loadCompanies();
    });

    el.prevCompanyBtn.addEventListener("click", () => {
        if (state.currentIndex > 0) {
            state.currentIndex -= 1;
            renderActiveCompany();
            renderResultsStrip();
        }
    });

    el.nextCompanyBtn.addEventListener("click", () => {
        if (state.currentIndex < state.companies.length - 1) {
            state.currentIndex += 1;
            renderActiveCompany();
            renderResultsStrip();
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

    // Modais
    el.profileBtn.addEventListener("click", () => {
        renderSessionUI();
        openModal(el.profileModal);
    });

    document.querySelectorAll("[data-close-modal]").forEach((btn) => {
        btn.addEventListener("click", () => {
            const modalId = btn.getAttribute("data-close-modal");
            closeModal(document.getElementById(modalId));
        });
    });

    [el.profileModal, el.companyFormModal].forEach((modal) => {
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

    el.openEditFromProfileBtn.addEventListener("click", () => {
        closeModal(el.profileModal);
        const current = state.companies[state.currentIndex];
        if (current) openCompanyForm(current);
    });

    el.deleteCurrentCompanyBtn.addEventListener("click", async () => {
        if (state.role !== "ADMIN") {
            showToast("Apenas o Administrador pode remover empresas.");
            return;
        }
        const current = state.companies[state.currentIndex];
        if (!current) return;
        if (!confirm(`Deseja remover "${current.name}" da vitrine?`)) return;

        try {
            await CompanyApi.remove(current.id);
            closeModal(el.profileModal);
            showToast("Empresa removida pelo Administrador.");
            await loadCompanies();
        } catch {
            showToast("Erro ao remover empresa.");
        }
    });

    el.companyForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const id = el.formCompanyId.value.trim();
        const payload = {
            name: el.formName.value.trim(),
            category: el.formCategory.value.trim(),
            logoUrl: el.formLogoData.value.trim() || null,
            description: el.formDescription.value.trim(),
            phone: el.formPhone.value.trim(),
            whatsapp: el.formWhatsapp.value.trim(),
            instagram: el.formInstagram.value.trim()
        };

        try {
            const saved = id
                ? await CompanyApi.update(id, payload, state.role)
                : await CompanyApi.create(payload, state.role);

            closeModal(el.companyFormModal);

            if (state.role === "ADMIN") {
                showToast(id ? "Loja atualizada e publicada!" : "Loja cadastrada e publicada!");
            } else {
                showToast(
                    id
                        ? "Edições enviadas! Aguardando aprovação do Administrador."
                        : "Cadastro enviado! Aguardando aprovação do Administrador."
                );
            }

            await loadCompanies(saved.id);
        } catch {
            showToast("Erro ao salvar alterações da empresa.");
        }
    });

    // Inicialização
    loadCompanies();
});
