const API_ORIGIN = window.API_ORIGIN || "http://localhost:8080";
const API_BASE_URL = `${API_ORIGIN}/api/companies`;
const AUTH_BASE_URL = `${API_ORIGIN}/api/auth`;
const ADMIN_BASE_URL = `${API_ORIGIN}/api/admin`;

const USER_TOKEN_KEY = "empreende_sede_user_token";
const USER_INFO_KEY = "empreende_sede_user_info";
const STORAGE_KEY = "empreende_sede_demo_companies_v3";

const OFFICIAL_SERVICE_CATEGORIES = [
    "Mão de Obra",
    "Comércio",
    "Gastronomia",
    "Beleza (Masculina/Feminina)",
    "Vestuário"
];

const SEED_COMPANIES = [
    // Mão de Obra (3 exemplos)
    {
        id: "demo-1",
        name: "Sede Manutenção & Reparos",
        category: "Mão de Obra",
        logoUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80",
        description: "Serviços elétricos, hidráulicos, montagem de móveis e pequenos reparos residenciais e comerciais com garantia.",
        phone: "(11) 91234-5678",
        whatsapp: "5511912345678",
        instagram: "sedemanutencao.oficial",
        approved: true,
        paymentStatus: "EXEMPT"
    },
    {
        id: "demo-2",
        name: "EletroForte Instalações",
        category: "Mão de Obra",
        logoUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80",
        description: "Instalação de ar-condicionado, quadros elétricos, tomadas e iluminação LED com atendimento rápido em toda a cidade.",
        phone: "(11) 93456-7810",
        whatsapp: "5511934567810",
        instagram: "eletroforte.sede",
        approved: true,
        paymentStatus: "EXEMPT"
    },
    {
        id: "demo-3",
        name: "Marcenaria Tradição & Sob Medida",
        category: "Mão de Obra",
        logoUrl: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80",
        description: "Móveis planejados, restauração em madeira maciça, portas e painéis ripados feitos sob medida para sua casa ou loja.",
        phone: "(11) 94567-8912",
        whatsapp: "5511945678912",
        instagram: "marcenariatradicao",
        approved: true,
        paymentStatus: "EXEMPT"
    },
    // Comércio (3 exemplos)
    {
        id: "demo-4",
        name: "Verde Vida Hortifrúti",
        category: "Comércio",
        logoUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
        description: "Produtos orgânicos frescos direto do produtor, cestas semanais por assinatura e entregas rápidas na região.",
        phone: "(11) 97766-5544",
        whatsapp: "5511977665544",
        instagram: "verdevida.organicos",
        approved: true,
        paymentStatus: "EXEMPT"
    },
    {
        id: "demo-5",
        name: "TechLocal Informática & Celulares",
        category: "Comércio",
        logoUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80",
        description: "Acessórios para celular, periféricos, notebooks e assistência técnica especializada com peças originais e garantia.",
        phone: "(11) 99123-4501",
        whatsapp: "5511991234501",
        instagram: "techlocal.sede",
        approved: true,
        paymentStatus: "EXEMPT"
    },
    {
        id: "demo-6",
        name: "Empório da Serra Mercearia",
        category: "Comércio",
        logoUrl: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80",
        description: "Queijos artesanais, cafés especiais, temperos naturais, bebidas e produtos coloniais selecionados diariamente.",
        phone: "(11) 98234-5602",
        whatsapp: "5511982345602",
        instagram: "emporiodaserra.loja",
        approved: true,
        paymentStatus: "EXEMPT"
    },
    // Gastronomia (3 exemplos)
    {
        id: "demo-7",
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
        id: "demo-8",
        name: "Forno Nobre Pizzaria & Massas",
        category: "Gastronomia",
        logoUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80",
        description: "Pizzas artesanais assadas em forno a lenha com massa de longa fermentação, massas frescas e delivery próprio.",
        phone: "(11) 97345-6703",
        whatsapp: "5511973456703",
        instagram: "fornonobre.pizzas",
        approved: true,
        paymentStatus: "EXEMPT"
    },
    {
        id: "demo-9",
        name: "Doce Encanto Confeitaria",
        category: "Gastronomia",
        logoUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80",
        description: "Bolos artesanais para festas, doces finos, tortas geladas e kits personalizados para eventos e encomendas.",
        phone: "(11) 96456-7804",
        whatsapp: "5511964567804",
        instagram: "doceencanto.confeitaria",
        approved: true,
        paymentStatus: "EXEMPT"
    },
    // Beleza (Masculina/Feminina) (3 exemplos)
    {
        id: "demo-10",
        name: "Espaço Raiz Beleza & Barbearia",
        category: "Beleza (Masculina/Feminina)",
        logoUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80",
        description: "Cortes masculinos e femininos, barba, coloração, escova e estética facial com horário agendado.",
        phone: "(11) 99887-7665",
        whatsapp: "5511998877665",
        instagram: "espacoraiz.beleza",
        approved: true,
        paymentStatus: "EXEMPT"
    },
    {
        id: "demo-11",
        name: "Barbearia Dom Pedro",
        category: "Beleza (Masculina/Feminina)",
        logoUrl: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=600&q=80",
        description: "Corte masculino clássico e degradê, barboterapia com toalha quente e cuidados completos para o visual masculino.",
        phone: "(11) 95567-8905",
        whatsapp: "5511955678905",
        instagram: "barbeariadompedro",
        approved: true,
        paymentStatus: "EXEMPT"
    },
    {
        id: "demo-12",
        name: "Studio Bela Essência",
        category: "Beleza (Masculina/Feminina)",
        logoUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80",
        description: "Manicure, pedicure, design de sobrancelhas, alongamento de cílios e maquiagem social em ambiente climatizado.",
        phone: "(11) 94678-9006",
        whatsapp: "5511946789006",
        instagram: "studiobelaessencia",
        approved: true,
        paymentStatus: "EXEMPT"
    },
    // Vestuário (3 exemplos)
    {
        id: "demo-13",
        name: "Ateliê & Moda Local",
        category: "Vestuário",
        logoUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80",
        description: "Roupas casuais masculinas e femininas, confecção própria, ajustes sob medida e peças exclusivas.",
        phone: "(11) 96543-2109",
        whatsapp: "5511965432109",
        instagram: "ateliemodalocal",
        approved: true,
        paymentStatus: "EXEMPT"
    },
    {
        id: "demo-14",
        name: "Urbano Fit & Esportes",
        category: "Vestuário",
        logoUrl: "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=600&q=80",
        description: "Moda fitness, camisetas dry-fit, conjuntos esportivos masculinos e femininos e acessórios para treino e corrida.",
        phone: "(11) 93789-0107",
        whatsapp: "5511937890107",
        instagram: "urbanofit.sede",
        approved: true,
        paymentStatus: "EXEMPT"
    },
    {
        id: "demo-15",
        name: "Villa Jeans & Casual",
        category: "Vestuário",
        logoUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80",
        description: "Calças jeans premium, jaquetas, camisas sociais e looks casuais completos com variedade de numerações.",
        phone: "(11) 92890-1208",
        whatsapp: "5511928901208",
        instagram: "villajeans.oficial",
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
    },

    async updateAvatar(avatarUrl) {
        const response = await fetch(`${AUTH_BASE_URL}/me/avatar`, {
            method: "PUT",
            headers: this.authHeaders({ "Content-Type": "application/json" }),
            body: JSON.stringify({ avatarUrl: avatarUrl || null })
        });
        if (!response.ok) throw new Error(await parseError(response, "Falha ao atualizar foto de perfil."));
        const user = await response.json();
        localStorage.setItem(USER_INFO_KEY, JSON.stringify(user));
        return user;
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
            return [...OFFICIAL_SERVICE_CATEGORIES];
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
