import { useEffect, useRef, useState } from "react";
import {
    MAX_LOGO_SIZE_KB,
    OFFICIAL_SERVICE_CATEGORIES,
    OFFICIAL_SERVICE_SUBSEGMENTS
} from "../constants/services";
import { CompanyApi } from "../services/api";
import { validateAndReadImageFile } from "../utils/formatters";
import { ImageUploadErrorBox, ImageUploadGuidelines } from "./ImageUploadGuidelines";

export default function CompanyFormModal({
    isOpen,
    editingCompany,
    subsegmentsMap,
    onClose,
    onSaved,
    showToast
}) {
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [subsegment, setSubsegment] = useState("");
    const [logoUrl, setLogoUrl] = useState("");
    const [logoLabel, setLogoLabel] = useState("");
    const [logoError, setLogoError] = useState(null);
    const [description, setDescription] = useState("");
    const [phone, setPhone] = useState("");
    const [whatsapp, setWhatsapp] = useState("");
    const [instagram, setInstagram] = useState("");
    const fileInputRef = useRef(null);

    const isEditing = Boolean(editingCompany);

    useEffect(() => {
        if (!isOpen) return;
        if (fileInputRef.current) fileInputRef.current.value = "";
        setLogoError(null);

        if (editingCompany) {
            const source = editingCompany.hasPendingUpdate && editingCompany.pendingData
                ? editingCompany.pendingData
                : editingCompany;
            setName(source.name || "");
            setCategory(source.category || "");
            setSubsegment(source.subsegment || "");
            setLogoUrl(source.logoUrl || "");
            setLogoLabel(source.logoUrl ? "Logo atual da empresa" : "");
            setDescription(source.description || "");
            setPhone(source.phone || "");
            setWhatsapp(source.whatsapp || "");
            setInstagram(source.instagram || "");
        } else {
            setName("");
            setCategory("");
            setSubsegment("");
            setLogoUrl("");
            setLogoLabel("");
            setDescription("");
            setPhone("");
            setWhatsapp("");
            setInstagram("");
        }
    }, [isOpen, editingCompany]);

    if (!isOpen) return null;

    const availableSubsegments = category
        ? (subsegmentsMap[category] || OFFICIAL_SERVICE_SUBSEGMENTS[category] || [])
        : [];

    async function handleLogoFileChange(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        setLogoError(null);
        try {
            const { dataUrl, info } = await validateAndReadImageFile(file, MAX_LOGO_SIZE_KB);
            setLogoUrl(dataUrl);
            setLogoLabel(info);
        } catch (err) {
            setLogoError(err);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    }

    function handleRemoveLogo() {
        if (fileInputRef.current) fileInputRef.current.value = "";
        setLogoUrl("");
        setLogoLabel("");
        setLogoError(null);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const payload = {
            name: name.trim(),
            category: category.trim(),
            subsegment: subsegment.trim() || null,
            logoUrl: logoUrl.trim() || null,
            description: description.trim(),
            phone: phone.trim(),
            whatsapp: whatsapp.trim(),
            instagram: instagram.trim()
        };

        try {
            const saved = isEditing
                ? await CompanyApi.update(editingCompany.id, payload)
                : await CompanyApi.create(payload);
            await onSaved(saved, isEditing);
        } catch (err) {
            showToast(err.message || "Erro ao salvar empresa.");
        }
    }

    return (
        <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="formModalTitle"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="modal-card modal-card-lg">
                <div className="modal-header">
                    <h2 id="formModalTitle">{isEditing ? "Editar Minha Loja" : "Cadastrar Nova Loja"}</h2>
                    <button type="button" className="icon-close-btn" aria-label="Fechar" onClick={onClose}>
                        &times;
                    </button>
                </div>

                <form className="company-form" onSubmit={handleSubmit}>
                    <label>
                        Nome da Empresa *
                        <input
                            type="text"
                            required
                            maxLength={150}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Café & Prosa Artesanal"
                        />
                    </label>

                    <label>
                        Tipo de Serviço *
                        <select
                            required
                            value={category}
                            onChange={(e) => {
                                setCategory(e.target.value);
                                setSubsegment("");
                            }}
                        >
                            <option value="">Selecione o tipo de serviço...</option>
                            {OFFICIAL_SERVICE_CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </label>

                    <label>
                        Subsegmento da Comunidade
                        <select value={subsegment} onChange={(e) => setSubsegment(e.target.value)}>
                            <option value="">
                                {availableSubsegments.length > 0
                                    ? "Selecione o subsegmento (opcional)..."
                                    : "Selecione primeiro o tipo de serviço..."}
                            </option>
                            {availableSubsegments.map((sub) => (
                                <option key={sub} value={sub}>{sub}</option>
                            ))}
                        </select>
                    </label>

                    <div className="upload-field-group">
                        <span className="field-label">
                            Logo / Foto da Loja (Vitrine e Carrossel — separada da sua foto de perfil)
                        </span>

                        <ImageUploadGuidelines
                            resolutionText={<><code>800 &times; 600 px</code> ou <code>1200 &times; 900 px</code></>}
                            proportionText={<span>proporção <strong>4:3</strong> exclusiva da vitrine da loja</span>}
                            maxKB={MAX_LOGO_SIZE_KB}
                        />

                        <div className="upload-control-row">
                            <label htmlFor="formLogoFile" className="upload-btn-label">
                                📷 Selecionar logo da loja
                            </label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                id="formLogoFile"
                                accept="image/png,image/jpeg,image/webp"
                                className="visually-hidden-file"
                                onChange={handleLogoFileChange}
                            />
                            <span className="logo-file-info">
                                {logoLabel || "Nenhum arquivo selecionado"}
                            </span>
                        </div>

                        <ImageUploadErrorBox error={logoError} />

                        {logoUrl && (
                            <div className="logo-preview-box">
                                <div className="logo-preview-pair">
                                    <div className="preview-carousel-item">
                                        <span className="preview-caption">Prévia na Vitrine / Carrossel (4:3)</span>
                                        <img
                                            src={logoUrl}
                                            alt="Prévia da logo na vitrine"
                                            className="preview-carousel-img"
                                        />
                                    </div>
                                </div>
                                <button type="button" className="btn-remove-logo" onClick={handleRemoveLogo}>
                                    Remover imagem
                                </button>
                            </div>
                        )}
                    </div>

                    <label>
                        Descrição da Empresa *
                        <textarea
                            rows={3}
                            required
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Conte o que sua empresa faz e seus diferenciais..."
                        />
                    </label>

                    <div className="form-grid-2">
                        <label>
                            Telefone *
                            <input
                                type="tel"
                                required
                                maxLength={30}
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="(11) 99999-9999"
                            />
                        </label>
                        <label>
                            WhatsApp (com DDD)
                            <input
                                type="tel"
                                maxLength={30}
                                value={whatsapp}
                                onChange={(e) => setWhatsapp(e.target.value)}
                                placeholder="5511999999999"
                            />
                        </label>
                    </div>

                    <label>
                        Instagram (usuário sem @)
                        <input
                            type="text"
                            maxLength={120}
                            value={instagram}
                            onChange={(e) => setInstagram(e.target.value)}
                            placeholder="suaempresa.oficial"
                        />
                    </label>

                    <div className="form-approval-notice">
                        {isEditing ? (
                            <>
                                ℹ️ As modificações enviadas ficam pendentes até a{" "}
                                <strong>aprovação do Administrador</strong>.
                            </>
                        ) : (
                            <>
                                💳 <strong>Taxa de divulgação: R$ 50,00 no Pix</strong> (direito a 1 mês na vitrine). Sua loja entra no ar após pagamento e aprovação do Administrador.
                            </>
                        )}
                    </div>

                    <div className="form-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary">
                            {isEditing ? "Enviar Edição para o Adm" : "Continuar para Pix (R$ 50,00)"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
