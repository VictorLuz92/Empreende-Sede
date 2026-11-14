import { useCallback, useEffect, useRef, useState } from "react";
import AuthModal from "../components/AuthModal";
import CompanyFormModal from "../components/CompanyFormModal";
import CompanyShowcase from "../components/CompanyShowcase";
import Header from "../components/Header";
import MenuDrawer from "../components/MenuDrawer";
import PixModal from "../components/PixModal";
import ProfileModal from "../components/ProfileModal";
import SearchSection from "../components/SearchSection";
import ServiceTypesNav from "../components/ServiceTypesNav";
import { OFFICIAL_SERVICE_CATEGORIES, OFFICIAL_SERVICE_SUBSEGMENTS } from "../constants/services";
import { AuthApi, CompanyApi } from "../services/api";

const DEFAULT_PROVIDERS = {
    googleEnabled: false,
    googleClientId: "",
    microsoftEnabled: false,
    microsoftClientId: "",
    pixKey: "",
    pixMonthlyAmount: "50.00",
    pixDurationDays: 30
};

export default function ShowcasePage() {
    const [companies, setCompanies] = useState([]);
    const [categories, setCategories] = useState(OFFICIAL_SERVICE_CATEGORIES);
    const [subsegmentsMap, setSubsegmentsMap] = useState({ ...OFFICIAL_SERVICE_SUBSEGMENTS });
    const [myStores, setMyStores] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedSubsegment, setSelectedSubsegment] = useState("");

    const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isDemoMode, setIsDemoMode] = useState(false);

    const [user, setUser] = useState(() => AuthApi.getUser());
    const [providers, setProviders] = useState(DEFAULT_PROVIDERS);

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [companyFormState, setCompanyFormState] = useState({ open: false, company: null });
    const [pixModalState, setPixModalState] = useState({ open: false, store: null, isRenewal: false });

    const [toastMsg, setToastMsg] = useState("");
    const toastTimerRef = useRef(null);
    const loadSeqRef = useRef(0);
    const pendingAuthActionRef = useRef(null);

    const showToast = useCallback((message) => {
        setToastMsg(message);
        clearTimeout(toastTimerRef.current);
        toastTimerRef.current = setTimeout(() => setToastMsg(""), 3400);
    }, []);

    useEffect(() => {
        document.title = "Empreende Sede — Vitrine de Empresas";
        return () => clearTimeout(toastTimerRef.current);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(searchQuery), 250);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const refreshMyStores = useCallback(async (activeUser = AuthApi.getUser()) => {
        if (!activeUser || !AuthApi.getToken()) {
            setMyStores([]);
            return;
        }
        try {
            const list = await CompanyApi.listMine();
            setMyStores(list);
        } catch {
            setMyStores([]);
        }
    }, []);

    const loadCompanies = useCallback(async (q, cat, sub, keepId = null) => {
        const seq = ++loadSeqRef.current;
        setIsLoading(true);
        try {
            const [list, cats, subs] = await Promise.all([
                CompanyApi.list(q, cat, sub),
                CompanyApi.listCategories(),
                CompanyApi.listSubsegments()
            ]);
            if (seq !== loadSeqRef.current) return;

            setHasLoadedOnce(true);
            setIsDemoMode(CompanyApi.isDemoMode);
            setCompanies(list);
            if (Array.isArray(cats) && cats.length > 0) setCategories(cats);
            if (subs && Object.keys(subs).length > 0) setSubsegmentsMap(subs);

            setCurrentIndex((prev) => {
                if (keepId) {
                    const idx = list.findIndex((c) => c.id === keepId);
                    return idx >= 0 ? idx : 0;
                }
                return prev >= list.length ? 0 : prev;
            });
        } finally {
            if (seq === loadSeqRef.current) setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const prov = await AuthApi.getProviders();
                setProviders(prov);
            } catch {
                // keep default provider settings
            }
            if (AuthApi.getToken()) {
                const verified = await AuthApi.verifySession();
                setUser(verified);
                await refreshMyStores(verified);
            }
        })();
    }, [refreshMyStores]);

    useEffect(() => {
        loadCompanies(debouncedQuery, selectedCategory, selectedSubsegment);
    }, [debouncedQuery, selectedCategory, selectedSubsegment, loadCompanies]);

    const isLogged = Boolean(user && AuthApi.getToken());

    function handleSelectCategory(category, shouldCloseDrawer = false) {
        setSelectedCategory(category);
        setSelectedSubsegment("");
        setCurrentIndex(0);
        if (shouldCloseDrawer) setIsDrawerOpen(false);
    }

    function handleSelectSubsegment(subsegment) {
        setSelectedSubsegment(subsegment);
        setCurrentIndex(0);
    }

    function handleSelectCategorySubsegment(category, subsegment) {
        setSelectedCategory(category);
        setSelectedSubsegment(subsegment);
        setCurrentIndex(0);
        setIsDrawerOpen(false);
    }

    function handleResetFilters() {
        setSearchQuery("");
        setDebouncedQuery("");
        setSelectedCategory("");
        setSelectedSubsegment("");
        setCurrentIndex(0);
    }

    function openCompanyForm(company = null) {
        if (!user || !AuthApi.getToken()) {
            pendingAuthActionRef.current = () => setCompanyFormState({ open: true, company });
            setAuthModalOpen(true);
            return;
        }
        setCompanyFormState({ open: true, company });
    }

    async function handleOpenAccountOrAuth() {
        if (!user || !AuthApi.getToken()) {
            pendingAuthActionRef.current = async (authenticatedUser) => {
                await refreshMyStores(authenticatedUser);
                setProfileModalOpen(true);
            };
            setAuthModalOpen(true);
            return;
        }
        await refreshMyStores(user);
        setProfileModalOpen(true);
    }

    async function handleAuthenticated(authResponse) {
        const nextUser = authResponse.user;
        setUser(nextUser);
        setAuthModalOpen(false);
        showToast(`Bem-vindo(a), ${nextUser.name}!`);
        await refreshMyStores(nextUser);

        if (typeof pendingAuthActionRef.current === "function") {
            const cb = pendingAuthActionRef.current;
            pendingAuthActionRef.current = null;
            await cb(nextUser);
        }
    }

    function handleLogout() {
        AuthApi.clearSession();
        setUser(null);
        setMyStores([]);
        setProfileModalOpen(false);
        showToast("Você saiu da conta.");
    }

    async function handleCopyPhone(phone) {
        if (!phone) return;
        try {
            await navigator.clipboard.writeText(phone);
            showToast("Telefone copiado!");
        } catch {
            showToast("Não foi possível copiar.");
        }
    }

    async function handleCompanySaved(saved, isEditing) {
        setCompanyFormState({ open: false, company: null });
        await refreshMyStores(user);

        if (isEditing) {
            showToast("Modificações enviadas! Aguardando aprovação do Administrador.");
            await loadCompanies(debouncedQuery, selectedCategory, selectedSubsegment, saved.id);
        } else {
            showToast("Loja pré-cadastrada! Realize o Pix de R$ 50,00 para aprovação.");
            setPixModalState({ open: true, store: saved, isRenewal: false });
        }
    }

    async function handlePixProofSubmitted() {
        setPixModalState({ open: false, store: null, isRenewal: false });
        await refreshMyStores(user);
        showToast("Comprovante Pix enviado! Aguardando aprovação do Administrador.");
    }

    return (
        <>
            <div className="app-shell">
                <Header
                    isLogged={isLogged}
                    user={user}
                    isDrawerOpen={isDrawerOpen}
                    onOpenDrawer={() => setIsDrawerOpen(true)}
                    onResetFilters={handleResetFilters}
                    onOpenAccountOrAuth={handleOpenAccountOrAuth}
                />

                {isDemoMode && (
                    <div className="connection-banner" role="status">
                        Modo demonstração offline (inicie a API Spring Boot na porta 8080 para login, Pix e banco de dados).
                    </div>
                )}

                <ServiceTypesNav
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={(cat) => handleSelectCategory(cat, false)}
                />

                <SearchSection
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onClearSearch={() => {
                        setSearchQuery("");
                        setDebouncedQuery("");
                    }}
                    selectedCategory={selectedCategory}
                    selectedSubsegment={selectedSubsegment}
                    subsegmentsMap={subsegmentsMap}
                    onSelectSubsegment={handleSelectSubsegment}
                    companies={companies}
                    currentIndex={currentIndex}
                    onSelectStore={setCurrentIndex}
                />

                <CompanyShowcase
                    hasLoadedOnce={hasLoadedOnce}
                    isLoading={isLoading}
                    companies={companies}
                    currentIndex={currentIndex}
                    isLogged={isLogged}
                    currentUser={user}
                    onResetFilter={handleResetFilters}
                    onPrev={() => setCurrentIndex((idx) => Math.max(0, idx - 1))}
                    onNext={() => setCurrentIndex((idx) => Math.min(companies.length - 1, idx + 1))}
                    onEditCompany={(company) => openCompanyForm(company)}
                    onCopyPhone={handleCopyPhone}
                />
            </div>

            <MenuDrawer
                isOpen={isDrawerOpen}
                categories={categories}
                subsegmentsMap={subsegmentsMap}
                selectedCategory={selectedCategory}
                selectedSubsegment={selectedSubsegment}
                onClose={() => setIsDrawerOpen(false)}
                onNewCompany={() => openCompanyForm(null)}
                onSelectCategory={handleSelectCategory}
                onSelectCategorySubsegment={handleSelectCategorySubsegment}
            />

            <AuthModal
                isOpen={authModalOpen}
                providers={providers}
                onClose={() => setAuthModalOpen(false)}
                onAuthenticated={handleAuthenticated}
            />

            <ProfileModal
                isOpen={profileModalOpen}
                user={user}
                myStores={myStores}
                onClose={() => setProfileModalOpen(false)}
                onUserUpdated={setUser}
                onOpenCreateStore={() => {
                    setProfileModalOpen(false);
                    openCompanyForm(null);
                }}
                onEditStore={(store) => {
                    setProfileModalOpen(false);
                    openCompanyForm(store);
                }}
                onOpenPix={(store, isRenewal) => {
                    setProfileModalOpen(false);
                    setPixModalState({ open: true, store, isRenewal });
                }}
                onLogout={handleLogout}
                showToast={showToast}
            />

            <CompanyFormModal
                isOpen={companyFormState.open}
                editingCompany={companyFormState.company}
                currentUserName={user?.name || ""}
                subsegmentsMap={subsegmentsMap}
                onClose={() => setCompanyFormState({ open: false, company: null })}
                onSaved={handleCompanySaved}
                showToast={showToast}
            />

            <PixModal
                isOpen={pixModalState.open}
                store={pixModalState.store}
                isRenewal={pixModalState.isRenewal}
                pixKey={providers.pixKey}
                onClose={() => setPixModalState({ open: false, store: null, isRenewal: false })}
                onProofSubmitted={handlePixProofSubmitted}
                showToast={showToast}
            />

            {toastMsg && (
                <div className="toast" role="status" aria-live="polite">
                    {toastMsg}
                </div>
            )}
        </>
    );
}
