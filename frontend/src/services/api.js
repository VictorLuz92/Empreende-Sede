import { OFFICIAL_SERVICE_CATEGORIES, OFFICIAL_SERVICE_SUBSEGMENTS } from "../constants/services";
import { SEED_COMPANIES } from "../constants/seedCompanies";
import { supabase } from "./supabaseClient";

const API_ORIGIN = (import.meta.env.VITE_API_ORIGIN || "").replace(/\/$/, "");
const API_BASE_URL = `${API_ORIGIN}/api/companies`;
const AUTH_BASE_URL = `${API_ORIGIN}/api/auth`;
const ADMIN_BASE_URL = `${API_ORIGIN}/api/admin`;

const USER_TOKEN_KEY = "empreende_sede_user_token";
const USER_INFO_KEY = "empreende_sede_user_info";
const ADMIN_TOKEN_KEY = "empreende_sede_admin_token";
const ADMIN_EMAIL_KEY = "empreende_sede_admin_email";
const STORAGE_KEY = "empreende_sede_demo_companies_v8";

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

function mapSupabaseCompanyRow(row) {
    return {
        id: row.id,
        name: row.name,
        category: row.category,
        subsegment: row.subsegment,
        logoUrl: row.logo_url,
        description: row.description,
        ownerName: row.owner_name,
        cep: row.cep,
        street: row.street,
        addressNumber: row.address_number,
        complement: row.complement,
        neighborhood: row.neighborhood,
        city: row.city,
        state: row.state,
        addressStatus: row.address_status,
        addressConfirmed: row.address_confirmed,
        phone: row.phone,
        whatsapp: row.whatsapp,
        instagram: row.instagram,
        ownerId: row.owner_id,
        approved: row.approved,
        paymentStatus: row.payment_status,
        subscriptionExpiresAt: row.subscription_expires_at
    };
}

function isCompanyPublished(company) {
    if (!company || company.approved === false) return false;
    if (String(company.paymentStatus || "").toUpperCase() === "EXEMPT") return true;
    if (!company.subscriptionExpiresAt) return false;
    return new Date(company.subscriptionExpiresAt) > new Date();
}

function filterDemoCompanies(list, query = "", category = "", subsegment = "") {
    const q = query.trim().toLowerCase();
    const cat = category.trim().toLowerCase();
    const sub = subsegment.trim().toLowerCase();

    return list
        .filter((c) => {
            if (!isCompanyPublished(c)) return false;
            const matchCat = !cat || (c.category || "").toLowerCase() === cat;
            const matchSub = !sub || (c.subsegment || "").toLowerCase() === sub;
            const matchQ = !q
                || (c.name || "").toLowerCase().includes(q)
                || (c.description || "").toLowerCase().includes(q)
                || (c.category || "").toLowerCase().includes(q)
                || (c.subsegment || "").toLowerCase().includes(q)
                || (c.ownerName || "").toLowerCase().includes(q);
            return matchCat && matchSub && matchQ;
        })
        .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

export const AuthApi = {
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

export const CompanyApi = {
    isDemoMode: false,

    async list(query = "", category = "", subsegment = "") {
        const params = new URLSearchParams();
        if (query.trim()) params.set("q", query.trim());
        if (category.trim()) params.set("category", category.trim());
        if (subsegment.trim()) params.set("subsegment", subsegment.trim());

        const url = params.toString() ? `${API_BASE_URL}?${params}` : API_BASE_URL;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Erro ao buscar empresas");
            this.isDemoMode = false;
            return await response.json();
        } catch {
            if (supabase) {
                try {
                    const { data, error } = await supabase
                        .from("companies")
                        .select("*")
                        .eq("active", true)
                        .eq("approved", true)
                        .order("name", { ascending: true });
                    if (!error && Array.isArray(data)) {
                        this.isDemoMode = false;
                        return filterDemoCompanies(data.map(mapSupabaseCompanyRow), query, category, subsegment);
                    }
                } catch {
                    // fallback to local demo data
                }
            }
            this.isDemoMode = true;
            return filterDemoCompanies(loadDemoCompanies(), query, category, subsegment);
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

    async listSubsegments() {
        try {
            const response = await fetch(`${API_BASE_URL}/subsegments`);
            if (!response.ok) throw new Error("Erro ao buscar subsegmentos");
            return await response.json();
        } catch {
            return { ...OFFICIAL_SERVICE_SUBSEGMENTS };
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
    },

    async lookupCep(rawCep) {
        const digits = (rawCep || "").replace(/\D/g, "");
        if (digits.length !== 8) {
            throw new Error("Informe um CEP válido com 8 dígitos.");
        }
        try {
            const response = await fetch(`${API_ORIGIN}/api/cep/${digits}`);
            if (response.ok) {
                return await response.json();
            }
        } catch {
            // fallback directly to ViaCEP if backend proxy is unavailable
        }
        try {
            const viaCepResp = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
            if (viaCepResp.ok) {
                const data = await viaCepResp.json();
                if (!data.erro && data.localidade && data.uf) {
                    return {
                        found: true,
                        cep: `${digits.slice(0, 5)}-${digits.slice(5)}`,
                        street: (data.logradouro || "").trim(),
                        neighborhood: (data.bairro || "").trim(),
                        city: (data.localidade || "").trim(),
                        state: (data.uf || "").trim().toUpperCase()
                    };
                }
            }
        } catch {
            // handled as not found below
        }
        return {
            found: false,
            cep: `${digits.slice(0, 5)}-${digits.slice(5)}`,
            street: "",
            neighborhood: "",
            city: "",
            state: ""
        };
    }
};

export const AdminApi = {
    getToken() {
        return sessionStorage.getItem(ADMIN_TOKEN_KEY) || "";
    },

    getEmail() {
        return sessionStorage.getItem(ADMIN_EMAIL_KEY) || "Administrador Único";
    },

    saveSession(data) {
        sessionStorage.setItem(ADMIN_TOKEN_KEY, data.token);
        sessionStorage.setItem(ADMIN_EMAIL_KEY, data.user.email);
    },

    clearSession() {
        sessionStorage.removeItem(ADMIN_TOKEN_KEY);
        sessionStorage.removeItem(ADMIN_EMAIL_KEY);
    },

    async login(email, password) {
        const resp = await fetch(`${ADMIN_BASE_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email.trim(), password })
        });
        if (!resp.ok) {
            throw new Error(await parseError(resp, "Credenciais de Administrador inválidas."));
        }
        const data = await resp.json();
        this.saveSession(data);
        return data;
    },

    async request(path, options = {}) {
        const headers = {
            ...(options.headers || {}),
            Authorization: `Bearer ${this.getToken()}`
        };
        const resp = await fetch(`${ADMIN_BASE_URL}${path}`, { ...options, headers });
        if (resp.status === 401 || resp.status === 403) {
            this.clearSession();
            const authErr = new Error("Sessão administrativa expirada ou não autorizada.");
            authErr.isAuthError = true;
            throw authErr;
        }
        if (!resp.ok) {
            throw new Error(await parseError(resp, "Erro ao processar solicitação."));
        }
        if (resp.status === 204) return null;
        return await resp.json();
    },

    getPending() {
        return this.request("/pending");
    },

    getAddressRequests() {
        return this.request("/address-requests");
    },

    getSubsegmentRequests() {
        return this.request("/subsegment-requests");
    },

    getAllCompanies() {
        return this.request("/companies");
    },

    approveCompany(id) {
        return this.request(`/companies/${id}/approve`, { method: "POST" });
    },

    confirmAddress(id) {
        return this.request(`/companies/${id}/confirm-address`, { method: "POST" });
    },

    assignSubsegment(id, subsegment) {
        return this.request(`/companies/${id}/subsegment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subsegment })
        });
    },

    rejectCompany(id) {
        return this.request(`/companies/${id}/reject`, { method: "POST" });
    },

    renewCompany(id) {
        return this.request(`/companies/${id}/renew`, { method: "POST" });
    },

    deleteCompany(id) {
        return this.request(`/companies/${id}`, { method: "DELETE" });
    }
};
