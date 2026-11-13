document.addEventListener("DOMContentLoaded", () => {
    const state = {
        companies: [],
        categories: [],
        currentIndex: 0,
        searchQuery: "",
        selectedCategory: ""
    };

    const el = {
        menuBtn: document.getElementById("menuBtn"),
        closeDrawerBtn: document.getElementById("closeDrawerBtn"),
        menuDrawer: document.getElementById("menuDrawer"),
        drawerBackdrop: document.getElementById("drawerBackdrop"),
        logoBtn: document.getElementById("logoBtn"),
        profileBtn: document.getElementById("profileBtn"),
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
        companyPhoneLink: document.getElementById("companyPhoneLink"),
        companyPhoneText: document.getElementById("companyPhoneText"),
        copyPhoneBtn: document.getElementById("copyPhoneBtn"),
        whatsappLink: document.getElementById("whatsappLink"),
        instagramLink: document.getElementById("instagramLink"),
        editCompanyBtn: document.getElementById("editCompanyBtn"),

        newCompanyMenuBtn: document.getElementById("newCompanyMenuBtn"),
        profileModal: document.getElementById("profileModal"),
        openCreateFromProfileBtn: document.getElementById("openCreateFromProfileBtn"),
        openEditFromProfileBtn: document.getElementById("openEditFromProfileBtn"),
        deleteCurrentCompanyBtn: document.getElementById("deleteCurrentCompanyBtn"),

        companyFormModal: document.getElementById("companyFormModal"),
        formModalTitle: document.getElementById("formModalTitle"),
        companyForm: document.getElementById("companyForm"),
        formCompanyId: document.getElementById("formCompanyId"),
        formName: document.getElementById("formName"),
        formCategory: document.getElementById("formCategory"),
        formLogoUrl: document.getElementById("formLogoUrl"),
        formDescription: document.getElementById("formDescription"),
        formPhone: document.getElementById("formPhone"),
        formWhatsapp: document.getElementById("formWhatsapp"),
        formInstagram: document.getElementById("formInstagram"),

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
        }, 2600);
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
            chip.textContent = company.name;
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

    async function loadCompanies(keepId = null) {
        el.loadingState.classList.remove("hidden");
        el.companyCard.classList.add("hidden");
        el.emptyState.classList.add("hidden");

        try {
            const [companies, categories] = await Promise.all([
                CompanyApi.list(state.searchQuery, state.selectedCategory),
                CompanyApi.listCategories()
            ]);

            state.companies = companies;
            state.categories = categories;

            if (keepId) {
                const foundIndex = companies.findIndex((c) => c.id === keepId);
                state.currentIndex = foundIndex >= 0 ? foundIndex : 0;
            } else {
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

    function openCompanyForm(company = null) {
        if (company) {
            el.formModalTitle.textContent = "Editar Empresa";
            el.formCompanyId.value = company.id;
            el.formName.value = company.name || "";
            el.formCategory.value = company.category || "";
            el.formLogoUrl.value = company.logoUrl || "";
            el.formDescription.value = company.description || "";
            el.formPhone.value = company.phone || "";
            el.formWhatsapp.value = company.whatsapp || "";
            el.formInstagram.value = company.instagram || "";
        } else {
            el.formModalTitle.textContent = "Cadastrar Empresa";
            el.companyForm.reset();
            el.formCompanyId.value = "";
        }
        openModal(el.companyFormModal);
    }

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
    el.profileBtn.addEventListener("click", () => openModal(el.profileModal));

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
        const current = state.companies[state.currentIndex];
        if (!current) return;
        if (!confirm(`Deseja remover "${current.name}" da vitrine?`)) return;

        try {
            await CompanyApi.remove(current.id);
            closeModal(el.profileModal);
            showToast("Empresa removida.");
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
            logoUrl: el.formLogoUrl.value.trim(),
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
            showToast(id ? "Empresa atualizada!" : "Empresa cadastrada!");
            await loadCompanies(saved.id);
        } catch {
            showToast("Erro ao salvar empresa.");
        }
    });

    // Inicialização
    loadCompanies();
});
