import { useEffect, useState } from "react";
import { OFFICIAL_SERVICE_SUBSEGMENTS } from "../constants/services";

export default function MenuDrawer({
    isOpen,
    categories,
    subsegmentsMap,
    selectedCategory,
    selectedSubsegment,
    onClose,
    onNewCompany,
    onSelectCategory,
    onSelectCategorySubsegment
}) {
    const [expandedCategory, setExpandedCategory] = useState(selectedCategory || "");

    useEffect(() => {
        if (isOpen) {
            setExpandedCategory(selectedCategory || "");
        }
    }, [isOpen, selectedCategory]);

    function handleToggleCategory(category) {
        const nextExpanded = expandedCategory === category ? "" : category;
        setExpandedCategory(nextExpanded);
        if (nextExpanded) {
            onSelectCategory(category, false);
        }
    }

    return (
        <>
            {isOpen && <div className="backdrop" onClick={onClose} />}
            <aside className={`drawer${isOpen ? " open" : ""}`} aria-hidden={!isOpen}>
                <div className="drawer-header">
                    <h2>Menu</h2>
                    <button
                        type="button"
                        className="icon-close-btn"
                        aria-label="Fechar menu"
                        onClick={onClose}
                    >
                        &times;
                    </button>
                </div>

                <nav className="drawer-nav">
                    <button
                        type="button"
                        className="drawer-action-primary"
                        onClick={() => {
                            onClose();
                            onNewCompany();
                        }}
                    >
                        + Divulgar Minha Loja (R$ 50/mês)
                    </button>

                    <div className="drawer-section">
                        <h3>Tipos de Serviços</h3>
                        <div className="category-list">
                            <button
                                type="button"
                                className={`category-item${selectedCategory === "" ? " active" : ""}`}
                                onClick={() => {
                                    setExpandedCategory("");
                                    onSelectCategory("", true);
                                }}
                            >
                                <span>Todos os Serviços</span>
                            </button>

                            {categories.map((category) => {
                                const isExpanded = expandedCategory === category;
                                const isSelected = selectedCategory === category;
                                const subsegments =
                                    subsegmentsMap[category] ||
                                    OFFICIAL_SERVICE_SUBSEGMENTS[category] ||
                                    [];

                                return (
                                    <div key={category} className="drawer-category-group">
                                        <button
                                            type="button"
                                            className={`category-item category-item-expandable${isSelected ? " active" : ""}`}
                                            aria-expanded={isExpanded}
                                            onClick={() => handleToggleCategory(category)}
                                        >
                                            <span>{category}</span>
                                            <svg
                                                className={`drawer-chevron${isExpanded ? " expanded" : ""}`}
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2.2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                aria-hidden="true"
                                            >
                                                <path d="m9 6 6 6-6 6" />
                                            </svg>
                                        </button>

                                        {isExpanded && subsegments.length > 0 && (
                                            <div
                                                className="drawer-subsegment-list"
                                                role="group"
                                                aria-label={`Subsegmentos de ${category}`}
                                            >
                                                <button
                                                    type="button"
                                                    className={`drawer-subsegment-item${isSelected && selectedSubsegment === "" ? " active" : ""}`}
                                                    onClick={() => onSelectCategorySubsegment(category, "")}
                                                >
                                                    Todos
                                                </button>
                                                {subsegments.map((subsegment) => (
                                                    <button
                                                        key={subsegment}
                                                        type="button"
                                                        className={`drawer-subsegment-item${isSelected && selectedSubsegment === subsegment ? " active" : ""}`}
                                                        onClick={() => onSelectCategorySubsegment(category, subsegment)}
                                                    >
                                                        {subsegment}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="drawer-section drawer-footer-info">
                        <h3>Sobre o Empreende Sede</h3>
                        <p>
                            Portal de divulgação e conexão direta com empreendedores locais. Plano mensal via Pix por R$ 50,00 após aprovação.
                        </p>
                    </div>
                </nav>
            </aside>
        </>
    );
}
