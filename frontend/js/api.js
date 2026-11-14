const API_BASE_URL = window.API_BASE_URL || "http://localhost:8080/api/companies";
const STORAGE_KEY = "empreende_sede_demo_companies";

const SEED_COMPANIES = [
    {
        id: "demo-1",
        name: "Café & Prosa Artesanal",
        category: "Gastronomia",
        logoUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80",
        description: "Cafeteria especializada em grãos selecionados, pães de fermentação natural e um espaço acolhedor para reuniões e trabalho remoto.",
        phone: "(11) 98765-4321",
        whatsapp: "5511987654321",
        instagram: "cafeprosa.artesanal",
        approved: true,
        hasPendingUpdate: false,
        pendingData: null
    },
    {
        id: "demo-2",
        name: "Sede Tech Soluções",
        category: "Tecnologia",
        logoUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
        description: "Desenvolvimento de sistemas sob medida, automação comercial e suporte técnico especializado para pequenos e médios negócios.",
        phone: "(11) 91234-5678",
        whatsapp: "5511912345678",
        instagram: "sedetech.oficial",
        approved: true,
        hasPendingUpdate: false,
        pendingData: null
    },
    {
        id: "demo-3",
        name: "Estúdio Raiz Design",
        category: "Design & Marketing",
        logoUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=600&q=80",
        description: "Identidade visual, gestão de redes sociais e fotografia comercial para impulsionar marcas locais com criatividade.",
        phone: "(11) 99887-7665",
        whatsapp: "5511998877665",
        instagram: "estudioraiz.design",
        approved: true,
        hasPendingUpdate: false,
        pendingData: null
    },
    {
        id: "demo-4",
        name: "Verde Vida Hortifrúti",
        category: "Comércio Local",
        logoUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
        description: "Produtos orgânicos frescos direto do produtor, cestas semanais por assinatura e entregas rápidas na região.",
        phone: "(11) 97766-5544",
        whatsapp: "5511977665544",
        instagram: "verdevida.organicos",
        approved: true,
        hasPendingUpdate: false,
        pendingData: null
    }
];

function loadDemoCompanies() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_COMPANIES));
        return [...SEED_COMPANIES];
    }
    try {
        return JSON.parse(raw).map((c) => ({
            approved: true,
            hasPendingUpdate: false,
            pendingData: null,
            ...c
        }));
    } catch {
        return [...SEED_COMPANIES];
    }
}

function saveDemoCompanies(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

const CompanyApi = {
    isDemoMode: false,

    async list(query = "", category = "") {
        const params = new URLSearchParams();
        if (query.trim()) params.set("q", query.trim());
        if (category.trim()) params.set("category", category.trim());

        const url = params.toString() ? `${API_BASE_URL}?${params}` : API_BASE_URL;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Erro ao buscar empresas");
            this.isDemoMode = false;
            return await response.json();
        } catch {
            this.isDemoMode = true;
            const q = query.trim().toLowerCase();
            const cat = category.trim().toLowerCase();
            return loadDemoCompanies()
                .filter((c) => {
                    if (c.approved === false) return false;
                    const matchCat = !cat || (c.category || "").toLowerCase() === cat;
                    const matchQ = !q
                        || (c.name || "").toLowerCase().includes(q)
                        || (c.description || "").toLowerCase().includes(q)
                        || (c.category || "").toLowerCase().includes(q);
                    return matchCat && matchQ;
                })
                .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
        }
    },

    async listCategories() {
        try {
            const response = await fetch(`${API_BASE_URL}/categories`);
            if (!response.ok) throw new Error("Erro ao buscar categorias");
            return await response.json();
        } catch {
            const categories = new Set(
                loadDemoCompanies()
                    .filter((c) => c.approved !== false)
                    .map((c) => c.category || "Geral")
            );
            return Array.from(categories).sort((a, b) => a.localeCompare(b, "pt-BR"));
        }
    },

    async listPending() {
        try {
            const response = await fetch(`${API_BASE_URL}/pending`);
            if (!response.ok) throw new Error("Erro ao buscar aprovações pendentes");
            return await response.json();
        } catch {
            return loadDemoCompanies().filter((c) => c.approved === false || c.hasPendingUpdate === true);
        }
    },

    async create(payload, role = "USER") {
        const isAdmin = role.toUpperCase() === "ADMIN";
        try {
            const response = await fetch(`${API_BASE_URL}?role=${encodeURIComponent(role)}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error("Falha ao cadastrar empresa");
            this.isDemoMode = false;
            return await response.json();
        } catch (err) {
            if (!this.isDemoMode) throw err;
            const list = loadDemoCompanies();
            const created = {
                ...payload,
                id: `demo-${Date.now()}`,
                whatsapp: (payload.whatsapp || "").replace(/\D/g, "") || null,
                instagram: (payload.instagram || "").replace(/^@/, "") || null,
                approved: isAdmin,
                hasPendingUpdate: false,
                pendingData: null
            };
            list.push(created);
            saveDemoCompanies(list);
            return created;
        }
    },

    async update(id, payload, role = "USER") {
        const isAdmin = role.toUpperCase() === "ADMIN";
        try {
            const response = await fetch(`${API_BASE_URL}/${id}?role=${encodeURIComponent(role)}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error("Falha ao atualizar empresa");
            this.isDemoMode = false;
            return await response.json();
        } catch (err) {
            if (!this.isDemoMode) throw err;
            const list = loadDemoCompanies();
            const index = list.findIndex((c) => c.id === id);
            if (index === -1) throw new Error("Empresa não encontrada");

            const sanitized = {
                name: payload.name,
                category: payload.category || "Geral",
                logoUrl: payload.logoUrl || null,
                description: payload.description,
                phone: payload.phone,
                whatsapp: (payload.whatsapp || "").replace(/\D/g, "") || null,
                instagram: (payload.instagram || "").replace(/^@/, "") || null
            };

            if (isAdmin) {
                list[index] = {
                    ...list[index],
                    ...sanitized,
                    approved: true,
                    hasPendingUpdate: false,
                    pendingData: null
                };
            } else {
                list[index] = {
                    ...list[index],
                    hasPendingUpdate: true,
                    pendingData: sanitized
                };
            }
            saveDemoCompanies(list);
            return list[index];
        }
    },

    async approve(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/${id}/approve`, {
                method: "POST"
            });
            if (!response.ok) throw new Error("Falha ao aprovar alterações");
            this.isDemoMode = false;
            return await response.json();
        } catch (err) {
            if (!this.isDemoMode) throw err;
            const list = loadDemoCompanies();
            const index = list.findIndex((c) => c.id === id);
            if (index === -1) throw new Error("Empresa não encontrada");
            const current = list[index];
            const applied = current.hasPendingUpdate && current.pendingData
                ? { ...current, ...current.pendingData }
                : { ...current };
            applied.approved = true;
            applied.hasPendingUpdate = false;
            applied.pendingData = null;
            list[index] = applied;
            saveDemoCompanies(list);
            return applied;
        }
    },

    async reject(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/${id}/reject`, {
                method: "POST"
            });
            if (!response.ok) throw new Error("Falha ao rejeitar alterações");
            this.isDemoMode = false;
        } catch (err) {
            if (!this.isDemoMode) throw err;
            const list = loadDemoCompanies();
            const index = list.findIndex((c) => c.id === id);
            if (index === -1) return;
            if (list[index].approved === false) {
                list.splice(index, 1);
            } else {
                list[index].hasPendingUpdate = false;
                list[index].pendingData = null;
            }
            saveDemoCompanies(list);
        }
    },

    async remove(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: "DELETE"
            });
            if (!response.ok) throw new Error("Falha ao remover empresa");
            this.isDemoMode = false;
        } catch (err) {
            if (!this.isDemoMode) throw err;
            const list = loadDemoCompanies().filter((c) => c.id !== id);
            saveDemoCompanies(list);
        }
    }
};
