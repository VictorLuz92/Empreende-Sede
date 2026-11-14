export function getInitials(name) {
    const parts = (name || "ES").trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function formatPaymentBadge(store) {
    if (store.paymentStatus === "PENDING_PAYMENT") {
        return { text: "Aguardando Pix R$ 50,00", cls: "status-warn" };
    }
    if (store.paymentStatus === "PAYMENT_SUBMITTED") {
        return { text: "Pix enviado • Aguardando Adm", cls: "status-info" };
    }
    if (store.expired || store.paymentStatus === "EXPIRED") {
        return { text: "Plano expirado • Renovar R$ 50,00", cls: "status-danger" };
    }
    if (!store.approved) {
        return { text: "Aguardando aprovação do Adm", cls: "status-info" };
    }
    if (store.hasPendingUpdate) {
        return { text: "Edição aguardando Adm", cls: "status-info" };
    }
    if (store.daysRemaining != null) {
        return { text: `Ativa • ${store.daysRemaining} dia(s) restantes`, cls: "status-ok" };
    }
    return { text: "Ativa na vitrine", cls: "status-ok" };
}

export function loadScriptOnce(src) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

export function validateAndReadImageFile(file, maxKB) {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject(new Error("Nenhum arquivo selecionado."));
            return;
        }
        const validTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!validTypes.includes(file.type)) {
            reject(new Error("Formato inválido. Selecione uma imagem JPG, PNG ou WebP."));
            return;
        }

        const sizeKB = (file.size / 1024).toFixed(1);
        if (file.size > maxKB * 1024) {
            const err = new Error(`Arquivo acima do limite (${sizeKB} KB / máx. ${maxKB} KB).`);
            err.sizeKB = sizeKB;
            err.maxKB = maxKB;
            err.tooLarge = true;
            reject(err);
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result;
            const probe = new Image();
            probe.onload = () => resolve({
                dataUrl,
                info: `${file.name} (${sizeKB} KB • ${probe.width}×${probe.height} px)`
            });
            probe.onerror = () => resolve({
                dataUrl,
                info: `${file.name} (${sizeKB} KB)`
            });
            probe.src = dataUrl;
        };
        reader.onerror = () => reject(new Error("Erro ao ler o arquivo selecionado."));
        reader.readAsDataURL(file);
    });
}
