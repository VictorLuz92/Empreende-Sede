const API_ORIGIN = window.API_ORIGIN || "http://localhost:8080";
const API_BASE_URL = `${API_ORIGIN}/api/companies`;
const AUTH_BASE_URL = `${API_ORIGIN}/api/auth`;
const ADMIN_BASE_URL = `${API_ORIGIN}/api/admin`;

const USER_TOKEN_KEY = "empreende_sede_user_token";
const USER_INFO_KEY = "empreende_sede_user_info";
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
        paymentStatus: "EXEMPT"
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
        paymentStatus: "EXEMPT"
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
        paymentStatus: "EXEMPT"
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
        paymentStatus: "EXEMPT"
    }
];

function loadDemoCompanies() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_COMPANIES));
        return [...SEED_COMPANIES];
    }
    try {
        return JSON.parse(raw);
    } catch {
        return [...SEED_COMPANIES];
    }
}

async function parseError(response, fallbackMsg) {
    try {
        const body = await response.json();
        if (body?.fields) {
            const first = Object.values(body.fields)[0];
            if (first) return String(first);
        }
        if (body?.error) return String(body.error);
    } catch {
        // ignore parse failure
    }
    return fallbackMsg;
}

const AuthApi = {
    getToken() {
        return localStorage.getItem(USER_TOKEN_KEY) || "";
    },

    getUser() {
        try {
            const raw = localStorage.getItem(USER_INFO_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    },

    saveSession(authResp) {
        localStorage.setItem(USER_TOKEN_KEY, authResp.token);
        localStorage.setItem(USER_INFO_KEY, JSON.stringify(authResp.user));
    },

    clearSession() {
        localStorage.removeItem(USER_TOKEN_KEY);
        localStorage.removeItem(USER_INFO_KEY);
    },

    authHeaders(extra = {}) {
        const token = this.getToken();
        return token
            ? { ...extra, Authorization: `Bearer ${token}` }
            : { ...extra };
    },

    async getProviders() {
        const response = await fetch(`${AUTH_BASE_URL}/providers`);
        if (!response.ok) throw new Error("Não foi possível carregar configurações de autenticação.");
        return await response.json();
    },

    async register(payload) {
        const response = await fetch(`${AUTH_BASE_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(await parseError(response, "Falha ao criar conta."));
        const data = await response.json();
        this.saveSession(data);
        return data;
    },

    async login(payload) {
        const response = await fetch(`${AUTH_BASE_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(await parseError(response, "Falha ao fazer login."));
        const data = await response.json();
        this.saveSession(data);
        return data;
    },

    async loginWithGoogle(idToken) {
        const response = await fetch(`${AUTH_BASE_URL}/oauth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: idToken })
        });
        if (!response.ok) throw new Error(await parseError(response, "Falha na autenticação com Google."));
        const data = await response.json();
        this.saveSession(data);
        return data;
    },

    async loginWithMicrosoft(accessToken) {
        const response = await fetch(`${AUTH_BASE_URL}/oauth/microsoft`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: accessToken })
        });
        if (!response.ok) throw new Error(await parseError(response, "Falha na autenticação com Microsoft."));
        const data = await response.json();
        this.saveSession(data);
        return data;
    },

    async verifySession() {
        const token = this.getToken();
        if (!token) return null;
        try {
            const response = await fetch(`${AUTH_BASE_URL}/me`, {
                headers: this.authHeaders()
            });
            if (!response.ok) {
                this.clearSession();
                return null;
            }
            const user = await response.json();
            localStorage.setItem(USER_INFO_KEY, JSON.stringify(user));
            return user;
        } catch {
            return this.getUser();
        }
    }
};

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
            const categories = new Set(loadDemoCompanies().map((c) => c.category || "Geral"));
            return Array.from(categories).sort((a, b) => a.localeCompare(b, "pt-BR"));
        }
    },

    async listMine() {
        const response = await fetch(`${API_BASE_URL}/mine`, {
            headers: AuthApi.authHeaders()
        });
        if (!response.ok) throw new Error(await parseError(response, "Falha ao carregar suas lojas."));
        return await response.json();
    },

    async create(payload) {
        const response = await fetch(API_BASE_URL, {
            method: "POST",
            headers: AuthApi.authHeaders({ "Content-Type": "application/json" }),
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(await parseError(response, "Falha ao cadastrar loja."));
        return await response.json();
    },

    async update(id, payload) {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: "PUT",
            headers: AuthApi.authHeaders({ "Content-Type": "application/json" }),
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(await parseError(response, "Falha ao enviar edição da loja."));
        return await response.json();
    },

    async submitPixProof(id, payload) {
        const response = await fetch(`${API_BASE_URL}/${id}/pix-proof`, {
            method: "POST",
            headers: AuthApi.authHeaders({ "Content-Type": "application/json" }),
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(await parseError(response, "Falha ao enviar comprovante Pix."));
        return await response.json();
    }
};
