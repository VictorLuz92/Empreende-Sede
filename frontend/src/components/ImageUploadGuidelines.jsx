export function ImageUploadGuidelines({ resolutionText, proportionText, maxKB }) {
    return (
        <div className="upload-guidelines">
            <p>
                <strong>📐 Resolução proporcional recomendada:</strong>{" "}
                {resolutionText} ({proportionText}).
            </p>
            <p>
                <strong>📦 Tamanho máximo do arquivo:</strong>{" "}
                <strong>{maxKB} KB</strong> (formatos aceitos: JPG, PNG ou WebP).
            </p>
            <p className="compress-links-row">
                <strong>💡 Arquivo muito grande? Reduza sem perder qualidade:</strong>{" "}
                <a href="https://squoosh.app/" target="_blank" rel="noopener noreferrer">Squoosh</a>{" "}
                &bull;{" "}
                <a href="https://tinypng.com/" target="_blank" rel="noopener noreferrer">TinyPNG</a>{" "}
                &bull;{" "}
                <a href="https://www.iloveimg.com/pt/comprimir-imagem" target="_blank" rel="noopener noreferrer">iLoveIMG</a>
            </p>
        </div>
    );
}

export function ImageUploadErrorBox({ error }) {
    if (!error) return null;

    if (error.tooLarge) {
        return (
            <div className="logo-upload-error" role="alert">
                ⚠️ O arquivo selecionado tem <strong>{error.sizeKB} KB</strong>, mas o tamanho máximo permitido é de{" "}
                <strong>{error.maxKB} KB</strong>. Comprima a imagem no{" "}
                <a href="https://squoosh.app/" target="_blank" rel="noopener noreferrer">Squoosh</a>,{" "}
                <a href="https://tinypng.com/" target="_blank" rel="noopener noreferrer">TinyPNG</a> ou{" "}
                <a href="https://www.iloveimg.com/pt/comprimir-imagem" target="_blank" rel="noopener noreferrer">iLoveIMG</a>{" "}
                e tente novamente.
            </div>
        );
    }

    return (
        <div className="logo-upload-error" role="alert">
            {error.message || String(error)}
        </div>
    );
}
