import { useEffect, useRef, useState } from "react";
import {
    MAX_LOGO_SIZE_KB,
    OFFICIAL_SERVICE_CATEGORIES,
    OFFICIAL_SERVICE_SUBSEGMENTS
} from "../constants/services";
import { CompanyApi } from "../services/api";
import { formatCepMask, validateAndReadImageFile } from "../utils/formatters";
import { ImageUploadErrorBox, ImageUploadGuidelines } from "./ImageUploadGuidelines";

export default function CompanyFormModal({
    isOpen,
    editingCompany,
    currentUserName,
    subsegmentsMap,
    onClose,
    onSaved,
    showToast
}) {
    const [name, setName] = useState("");
    const [ownerName, setOwnerName] = useState("");
    const [category, setCategory] = useState("");
    const [subsegment, setSubsegment] = useState("");
    const [logoUrl, setLogoUrl] = useState("");
    const [logoLabel, setLogoLabel] = useState("");
    const [logoError, setLogoError] = useState(null);
    const [description, setDescription] = useState("");

    const [cep, setCep] = useState("");
    const [street, setStreet] = useState("");
    const [addressNumber, setAddressNumber] = useState("");
    const [complement, setComplement] = useState("");
    const [neighborhood, setNeighborhood] = useState("");
    const [city, setCity] = useState("");
    const [stateUf, setStateUf] = useState("");
    const [cepLookupLoading, setCepLookupLoading] = useState(false);
    const [cepVerified, setCepVerified] = useState(false);
    const [addressNotFoundByCep, setAddressNotFoundByCep] = useState(false);
    const [cepFeedback, setCepFeedback] = useState("");

    const [phone, setPhone] = useState("");
    const [whatsapp, setWhatsapp] = useState("");
    const [instagram, setInstagram] = useState("");
    const fileInputRef = useRef(null);

    const isEditing = Boolean(editingCompany);

    useEffect(() => {
        if (!isOpen) return;
        if (fileInputRef.current) fileInputRef.current.value = "";
        setLogoError(null);
        setCepLookupLoading(false);
        setCepFeedback("");

        if (editingCompany) {
            const source = editingCompany.hasPendingUpdate && editingCompany.pendingData
                ? editingCompany.pendingData
                : editingCompany;
            setName(source.name || "");
            setOwnerName(source.ownerName || currentUserName || "");
            setCategory(source.category || "");
            setSubsegment(source.subsegment || "");
            setLogoUrl(source.logoUrl || "");
            setLogoLabel(source.logoUrl ? "Logo atual da empresa" : "");
            setDescription(source.description || "");
            setCep(formatCepMask(source.cep || ""));
            setStreet(source.street || "");
            setAddressNumber(source.addressNumber || "");
            setComplement(source.complement || "");
            setNeighborhood(source.neighborhood || "");
            setCity(source.city || "");
            setStateUf(source.state || "");
            const pendingAdmin = source.addressStatus === "PENDING_ADMIN_CONFIRMATION";
            setAddressNotFoundByCep(pendingAdmin);
            setCepVerified(!pendingAdmin && Boolean(source.cep && source.street));
            setPhone(source.phone || "");
            setWhatsapp(source.whatsapp || "");
            setInstagram(source.instagram || "");
        } else {
            setName("");
            setOwnerName(currentUserName || "");
            setCategory("");
            setSubsegment("");
            setLogoUrl("");
            setLogoLabel("");
            setDescription("");
            setCep("");
            setStreet("");
            setAddressNumber("");
            setComplement("");
            setNeighborhood("");
            setCity("");
            setStateUf("");
            setCepVerified(false);
            setAddressNotFoundByCep(false);
            setPhone("");
            setWhatsapp("");
            setInstagram("");
        }
    }, [isOpen, editingCompany, currentUserName]);

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

    async function handleCepSearch(targetCep = cep) {
        const digits = (targetCep || "").replace(/\D/g, "");
        if (digits.length !== 8) {
            showToast("Digite os 8 dígitos do CEP para buscar.");
            return;
        }
        setCepLookupLoading(true);
        setCepFeedback("");
        try {
            const res = await CompanyApi.lookupCep(digits);
            setCep(res.cep || formatCepMask(digits));
            if (res.found) {
                setStreet(res.street || "");
                setNeighborhood(res.neighborhood || "");
                setCity(res.city || "");
                setStateUf(res.state || "");
                setCepVerified(true);
                setAddressNotFoundByCep(false);
                setCepFeedback("Endereço localizado e confirmado pela API de CEP.");
            } else {
                setCepVerified(false);
                setAddressNotFoundByCep(true);
                setCepFeedback(
                    "CEP não localizado na base automática. Preencha o endereço abaixo para enviar ao Adm confirmar."
                );
            }
        } catch (err) {
            setCepVerified(false);
            setAddressNotFoundByCep(true);
            setCepFeedback(
                err.message || "Não foi possível consultar o CEP. Preencha o endereço para o Adm confirmar."
            );
        } finally {
            setCepLookupLoading(false);
        }
    }

    function handleToggleManualAddress(checked) {
        setAddressNotFoundByCep(checked);
        if (checked) {
            setCepVerified(false);
            setCepFeedback("Solicitação de confirmação manual de endereço será enviada ao Administrador.");
        } else {
            setCepFeedback("");
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const digits = cep.replace(/\D/g, "");
        if (!addressNotFoundByCep && (!cepVerified || digits.length !== 8)) {
            showToast(
                "Busque e confirme um CEP válido pela API ou marque a opção \"Não encontrei meu endereço pelo CEP\"."
            );
            return;
        }

        const payload = {
            name: name.trim(),
            ownerName: ownerName.trim(),
            category: category.trim(),
            subsegment: subsegment.trim() || null,
            logoUrl: logoUrl.trim() || null,
            description: description.trim(),
            cep: formatCepMask(cep),
            street: street.trim(),
            addressNumber: addressNumber.trim(),
            complement: complement.trim() || null,
            neighborhood: neighborhood.trim(),
            city: city.trim(),
            state: stateUf.trim().toUpperCase(),
            addressNotFoundByCep: Boolean(addressNotFoundByCep),
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
                    <div className="form-grid-2">
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
                            Nome do Proprietário *
                            <input
                                type="text"
                                required
                                maxLength={120}
                                value={ownerName}
                                onChange={(e) => setOwnerName(e.target.value)}
                                placeholder="Ex: Carlos Eduardo Silva"
                            />
                        </label>
                    </div>

                    <div className="form-grid-2">
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
                    </div>

                    <div className="cep-address-box">
                        <span className="field-label">Endereço da Loja (Confirmação por CEP via API)</span>

                        <div className="cep-search-row">
                            <label className="cep-input-label">
                                CEP {!addressNotFoundByCep ? "*" : "(se souber)"}
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={9}
                                    value={cep}
                                    onChange={(e) => {
                                        const masked = formatCepMask(e.target.value);
                                        setCep(masked);
                                        setCepVerified(false);
                                    }}
                                    placeholder="00000-000"
                                />
                            </label>
                            <button
                                type="button"
                                className="btn-secondary cep-search-btn"
                                disabled={cepLookupLoading}
                                onClick={() => handleCepSearch(cep)}
                            >
                                {cepLookupLoading ? "Buscando..." : "Buscar CEP"}
                            </button>
                        </div>

                        <label className="cep-manual-toggle">
                            <input
                                type="checkbox"
                                checked={addressNotFoundByCep}
                                onChange={(e) => handleToggleManualAddress(e.target.checked)}
                            />
                            <span>
                                Não encontrei meu endereço pelo CEP (enviar solicitação para o Adm confirmar)
                            </span>
                        </label>

                        {cepVerified && !addressNotFoundByCep && (
                            <div className="address-status-banner address-ok">
                                ✓ {cepFeedback || "Endereço confirmado automaticamente pela API do CEP."}
                            </div>
                        )}
                        {addressNotFoundByCep && (
                            <div className="address-status-banner address-pending">
                                ⏳ {cepFeedback || "Este endereço será enviado para aprovação na aba \"Confirma Endereço\" do Adm."}
                            </div>
                        )}

                        <div className="form-grid-2">
                            <label>
                                Logradouro / Rua *
                                <input
                                    type="text"
                                    required
                                    maxLength={180}
                                    value={street}
                                    onChange={(e) => setStreet(e.target.value)}
                                    placeholder="Ex: Rua das Flores"
                                />
                            </label>
                            <label>
                                Número *
                                <input
                                    type="text"
                                    required
                                    maxLength={30}
                                    value={addressNumber}
                                    onChange={(e) => setAddressNumber(e.target.value)}
                                    placeholder="Ex: 120 ou S/N"
                                />
                            </label>
                        </div>

                        <div className="form-grid-2">
                            <label>
                                Bairro *
                                <input
                                    type="text"
                                    required
                                    maxLength={120}
                                    value={neighborhood}
                                    onChange={(e) => setNeighborhood(e.target.value)}
                                    placeholder="Ex: Centro"
                                />
                            </label>
                            <label>
                                Complemento
                                <input
                                    type="text"
                                    maxLength={120}
                                    value={complement}
                                    onChange={(e) => setComplement(e.target.value)}
                                    placeholder="Ex: Sala 2, Fundos (opcional)"
                                />
                            </label>
                        </div>

                        <div className="form-grid-2">
                            <label>
                                Cidade *
                                <input
                                    type="text"
                                    required
                                    maxLength={120}
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    placeholder="Ex: São Paulo"
                                />
                            </label>
                            <label>
                                Estado (UF) *
                                <input
                                    type="text"
                                    required
                                    maxLength={2}
                                    value={stateUf}
                                    onChange={(e) => setStateUf(e.target.value.toUpperCase())}
                                    placeholder="Ex: SP"
                                />
                            </label>
                        </div>
                    </div>

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
                                💳 <strong>Taxa de divulgação: R$ 50,00 no Pix</strong> (direito a 1 mês na vitrine). Sua conta inicia expirada e sua loja só aparece nas listas após confirmação do Pix e adição de 30 dias pelo Administrador.
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
