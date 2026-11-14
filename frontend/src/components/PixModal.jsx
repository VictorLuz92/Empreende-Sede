import { useEffect, useMemo, useState } from "react";
import qrcode from "qrcode-generator";
import { CompanyApi } from "../services/api";

export default function PixModal({
    isOpen,
    store,
    isRenewal,
    pixKey,
    onClose,
    onProofSubmitted,
    showToast
}) {
    const [txId, setTxId] = useState("");
    const [payerNote, setPayerNote] = useState("");

    useEffect(() => {
        if (isOpen) {
            setTxId("");
            setPayerNote("");
        }
    }, [isOpen, store?.id]);

    const qrDataUrl = useMemo(() => {
        if (!store?.pixCode) return "";
        try {
            const qr = qrcode(0, "M");
            qr.addData(store.pixCode);
            qr.make();
            return qr.createDataURL(4, 2);
        } catch {
            return "";
        }
    }, [store?.pixCode]);

    if (!isOpen || !store) return null;

    async function handleCopyPix() {
        const code = (store.pixCode || "").trim();
        if (!code) return;
        try {
            await navigator.clipboard.writeText(code);
            showToast("Código Pix Copia e Cola copiado!");
        } catch {
            showToast("Não foi possível copiar o código Pix.");
        }
    }

    async function handleSubmitProof(e) {
        e.preventDefault();
        if (!payerNote.trim()) {
            showToast("Informe o nome do usuário que enviou o Pix.");
            return;
        }
        try {
            await CompanyApi.submitPixProof(store.id, {
                txId: txId.trim() || null,
                payerNote: payerNote.trim(),
                renewal: Boolean(isRenewal)
            });
            await onProofSubmitted();
        } catch (err) {
            showToast(err.message || "Erro ao enviar solicitação Pix.");
        }
    }

    return (
        <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pixModalTitle"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="modal-card modal-card-lg">
                <div className="modal-header">
                    <h2 id="pixModalTitle">Pagamento Pix — R$ 50,00 (1 mês)</h2>
                    <button type="button" className="icon-close-btn" aria-label="Fechar" onClick={onClose}>
                        &times;
                    </button>
                </div>

                <div className="pix-summary-banner">
                    <strong>
                        {isRenewal ? `Renovação (+1 mês): ${store.name}` : `Publicar loja: ${store.name}`}
                    </strong>
                    <span>
                        Valor: <strong>R$ 50,00</strong> &bull; Validade: <strong>30 dias (1 mês)</strong> após aprovação do Administrador.
                    </span>
                </div>

                <div className="pix-qr-box">
                    <div className="pix-qr-wrap">
                        {qrDataUrl ? (
                            <img
                                src={qrDataUrl}
                                alt="QR Code Pix"
                                style={{ width: "100%", height: "100%", imageRendering: "pixelated" }}
                            />
                        ) : (
                            <span>Use o código Pix Copia e Cola ao lado.</span>
                        )}
                    </div>
                    <div className="pix-copy-col">
                        <p className="pix-key-info">
                            <strong>Chave Pix:</strong> {pixKey || "Chave Pix não configurada"}
                        </p>
                        <label className="pix-code-label">
                            Pix Copia e Cola
                            <textarea rows={3} readOnly value={store.pixCode || ""} />
                        </label>
                        <button type="button" className="btn-secondary" onClick={handleCopyPix}>
                            📋 Copiar código Pix
                        </button>
                    </div>
                </div>

                <form className="company-form" onSubmit={handleSubmitProof}>
                    <label>
                        Nome do usuário que enviou o Pix *
                        <input
                            type="text"
                            required
                            maxLength={255}
                            value={payerNote}
                            onChange={(e) => setPayerNote(e.target.value)}
                            placeholder="Ex: Maria Silva"
                        />
                    </label>

                    <label>
                        Comprovante / Código da transação Pix ou E2E (opcional)
                        <input
                            type="text"
                            maxLength={120}
                            value={txId}
                            onChange={(e) => setTxId(e.target.value)}
                            placeholder="Ex: E1234567820261114... (opcional)"
                        />
                    </label>

                    <div className="form-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Pagar depois
                        </button>
                        <button type="submit" className="btn-primary">
                            Enviar Confirmação de Pix para o Adm
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
