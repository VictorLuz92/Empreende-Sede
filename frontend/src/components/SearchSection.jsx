import { OFFICIAL_SERVICE_SUBSEGMENTS } from "../constants/services";
import { getInitials } from "../utils/formatters";

export default function SearchSection({
    searchQuery,
    onSearchChange,
    onClearSearch,
    selectedCategory,
    selectedSubsegment,
    subsegmentsMap,
    onSelectSubsegment,
    companies,
    currentIndex,
    onSelectStore
}) {
    const subsegments = selectedCategory
        ? (subsegmentsMap[selectedCategory] || OFFICIAL_SERVICE_SUBSEGMENTS[selectedCategory] || [])
        : [];

    const stripEntries = [
        { subsegment: "", label: "Todos" },
        ...subsegments.map((sub) => ({ subsegment: sub, label: sub }))
    ];

    const showStoresPanel = Boolean(selectedCategory && selectedSubsegment);

    return (
        <section className="search-section" aria-label="Pesquisa de empresas">
            <div className="search-box">
                <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                </svg>
                <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Pesquisar empresa por nome ou segmento..."
                    autoComplete="off"
                    aria-label="Pesquisar empresa"
                />
                {searchQuery && (
                    <button
                        type="button"
                        className="clear-btn"
                        aria-label="Limpar pesquisa"
                        onClick={onClearSearch}
                    >
                        &times;
                    </button>
                )}
            </div>

            <div className="results-strip" aria-label="Subsegmentos do serviço">
                {!selectedCategory ? (
                    <span className="results-strip-hint">
                        Selecione um tipo de serviço acima para ver os subsegmentos da comunidade.
                    </span>
                ) : (
                    stripEntries.map(({ subsegment, label }) => (
                        <button
                            key={subsegment || "__ALL_SUB__"}
                            type="button"
                            className={`result-chip${selectedSubsegment === subsegment ? " active" : ""}`}
                            onClick={() => onSelectSubsegment(subsegment)}
                        >
                            {label}
                        </button>
                    ))
                )}
            </div>

            {showStoresPanel && (
                <div className="subsegment-stores-panel" aria-label="Lojas do subsegmento">
                    <div className="subsegment-stores-header">
                        <span>Lojas em {selectedSubsegment}</span>
                        <span className="subsegment-stores-count">
                            {companies.length === 1 ? "1 loja" : `${companies.length} lojas`}
                        </span>
                    </div>

                    {companies.length === 0 ? (
                        <p className="results-strip-hint">
                            Nenhuma loja cadastrada neste subsegmento ainda.
                        </p>
                    ) : (
                        <div className="subsegment-stores-grid">
                            {companies.map((company, idx) => (
                                <button
                                    key={company.id || `${company.name}-${idx}`}
                                    type="button"
                                    className={`subsegment-store-item${idx === currentIndex ? " active" : ""}`}
                                    onClick={() => onSelectStore(idx)}
                                >
                                    {company.logoUrl ? (
                                        <img
                                            src={company.logoUrl}
                                            alt={company.name}
                                            className="subsegment-store-thumb"
                                        />
                                    ) : (
                                        <span className="subsegment-store-initials">
                                            {getInitials(company.name)}
                                        </span>
                                    )}
                                    <div className="subsegment-store-meta">
                                        <span className="subsegment-store-name">{company.name}</span>
                                        <span className="subsegment-store-phone">
                                            {company.phone || "Ver detalhes"}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}
