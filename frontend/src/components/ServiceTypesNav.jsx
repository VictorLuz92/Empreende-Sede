export default function ServiceTypesNav({ categories, selectedCategory, onSelectCategory }) {
    const entries = [
        { category: "", label: "Todos os Serviços" },
        ...categories.map((cat) => ({ category: cat, label: cat }))
    ];

    return (
        <nav className="service-types-nav" aria-label="Tipos de serviços">
            {entries.map(({ category, label }) => (
                <button
                    key={category || "__ALL__"}
                    type="button"
                    className={`service-type-tab${selectedCategory === category ? " active" : ""}`}
                    onClick={() => onSelectCategory(category)}
                >
                    {label}
                </button>
            ))}
        </nav>
    );
}
