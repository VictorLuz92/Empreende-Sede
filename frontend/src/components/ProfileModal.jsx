import { useEffect, useRef, useState } from "react";
import { MAX_AVATAR_SIZE_KB } from "../constants/services";
import { AuthApi } from "../services/api";
import { formatPaymentBadge, getInitials, validateAndReadImageFile } from "../utils/formatters";
import { ImageUploadErrorBox, ImageUploadGuidelines } from "./ImageUploadGuidelines";

export default function ProfileModal({
    isOpen,
    user,
    myStores,
    onClose,
    onUserUpdated,
    onOpenCreateStore,
    onEditStore,
    onOpenPix,
    onLogout,
    showToast
}) {
    const [avatarError, setAvatarError] = useState(null);
    const [customFileLabel, setCustomFileLabel] = useState("");
    const [imgLoadFailed, setImgLoadFailed] = useState(false);
    const fileInputRef = useRef(null);

    const avatarUrl = user?.avatarUrl || "";

    useEffect(() => {
        setImgLoadFailed(false);
    }, [avatarUrl]);

    useEffect(() => {
        if (!isOpen) {
            setAvatarError(null);
            setCustomFileLabel("");
        }
    }, [isOpen]);

    if (!isOpen || !user) return null;

    const initials = getInitials(user.name || "ES");
    const fileInfoText = customFileLabel || (avatarUrl ? "Foto de perfil salva" : "Usando iniciais do perfil");

    async function handleAvatarChange(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarError(null);

        try {
            const { dataUrl, info } = await validateAndReadImageFile(file, MAX_AVATAR_SIZE_KB);
            const updatedUser = await AuthApi.updateAvatar(dataUrl);
            setCustomFileLabel(info);
            onUserUpdated(updatedUser);
            showToast("Foto de perfil atualizada!");
        } catch (err) {
            setAvatarError(err);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    }

    async function handleRemoveAvatar() {
        try {
            const updatedUser = await AuthApi.updateAvatar(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            setAvatarError(null);
            setCustomFileLabel("");
            onUserUpdated(updatedUser);
            showToast("Foto de perfil removida.");
        } catch (err) {
            showToast(err.message || "Erro ao remover foto de perfil.");
        }
    }

    return (
        <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="profileModalTitle"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="modal-card modal-card-lg">
                <div className="modal-header">
                    <h2 id="profileModalTitle">Minha Conta &amp; Minhas Lojas</h2>
                    <button type="button" className="icon-close-btn" aria-label="Fechar" onClick={onClose}>
                        &times;
                    </button>
                </div>

                <div className="profile-summary">
                    <div className="profile-avatar-lg">
                        {avatarUrl && !imgLoadFailed ? (
                            <img
                                src={avatarUrl}
                                alt={`Foto de ${user.name || "usuário"}`}
                                className="profile-avatar-img"
                                onError={() => setImgLoadFailed(true)}
                            />
                        ) : (
                            <span>{initials}</span>
                        )}
                    </div>
                    <div className="profile-info-text">
                        <p className="profile-name">{user.name}</p>
                        <p className="profile-email">{user.email}</p>
                        <p className="profile-role-hint">
                            Todas as criações e edições de loja passam pela aprovação do Administrador.
                        </p>
                    </div>
                </div>

                <div className="upload-field-group">
                    <span className="field-label">Foto de Perfil do Usuário (separada da logo das lojas)</span>

                    <ImageUploadGuidelines
                        resolutionText={<code>400 &times; 400 px</code>}
                        proportionText={<span>proporção <strong>1:1 quadrada</strong> para encaixe perfeito no avatar circular</span>}
                        maxKB={MAX_AVATAR_SIZE_KB}
                    />

                    <div className="upload-control-row">
                        <label htmlFor="profileAvatarFile" className="upload-btn-label">
                            📷 Alterar foto de perfil
                        </label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            id="profileAvatarFile"
                            accept="image/png,image/jpeg,image/webp"
                            className="visually-hidden-file"
                            onChange={handleAvatarChange}
                        />
                        <span className="logo-file-info">{fileInfoText}</span>
                        {avatarUrl && (
                            <button type="button" className="btn-remove-logo" onClick={handleRemoveAvatar}>
                                Remover foto
                            </button>
                        )}
                    </div>

                    <ImageUploadErrorBox error={avatarError} />
                </div>

                <div className="modal-actions-stack">
                    <button type="button" className="btn-primary" onClick={onOpenCreateStore}>
                        + Cadastrar Nova Loja (Pix R$ 50,00 / 1 mês)
                    </button>
                    <button type="button" className="btn-secondary" onClick={onLogout}>
                        Sair da Conta
                    </button>
                </div>

                <div className="admin-approval-section">
                    <div className="admin-section-header">
                        <h3>Minhas Lojas</h3>
                        <span className="pending-count-pill">
                            {myStores.length === 1 ? "1 loja" : `${myStores.length} lojas`}
                        </span>
                    </div>

                    <div className="pending-approvals-list">
                        {myStores.length === 0 ? (
                            <p className="empty-pending-msg">
                                Você ainda não cadastrou nenhuma loja. Clique acima para começar por R$ 50,00/mês.
                            </p>
                        ) : (
                            myStores.map((store) => {
                                const status = formatPaymentBadge(store);
                                return (
                                    <div key={store.id} className="pending-item-card">
                                        <div className="pending-item-header">
                                            <strong>{store.name}</strong>
                                            <span className={`status-pill ${status.cls}`}>{status.text}</span>
                                        </div>

                                        <div className="pending-item-body">
                                            {store.logoUrl && (
                                                <img
                                                    src={store.logoUrl}
                                                    alt={store.name}
                                                    className="pending-thumb-img"
                                                />
                                            )}
                                            <div className="pending-item-details">
                                                <p>{store.category} &bull; {store.phone}</p>
                                                {store.subscriptionExpiresAt && (
                                                    <p>
                                                        Divulgação válida até:{" "}
                                                        {new Date(store.subscriptionExpiresAt).toLocaleDateString("pt-BR")}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="pending-item-actions">
                                            {store.paymentStatus === "PENDING_PAYMENT" ? (
                                                <button
                                                    type="button"
                                                    className="btn-approve"
                                                    onClick={() => onOpenPix(store, false)}
                                                >
                                                    💳 Pagar Pix R$ 50,00
                                                </button>
                                            ) : (store.expired || store.paymentStatus === "PAID") ? (
                                                <button
                                                    type="button"
                                                    className="btn-secondary btn-sm"
                                                    onClick={() => onOpenPix(store, true)}
                                                >
                                                    🔄 Renovar +1 mês (R$ 50)
                                                </button>
                                            ) : null}

                                            <button
                                                type="button"
                                                className="btn-secondary btn-sm"
                                                onClick={() => onEditStore(store)}
                                            >
                                                ✏️ Editar
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
