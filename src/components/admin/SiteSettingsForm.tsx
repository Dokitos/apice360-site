"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { TextField, TextAreaField, CheckboxField, SelectField } from "@/components/admin/form-fields";
import { LocaleTabs } from "@/components/admin/LocaleTabs";
import { updateSiteSettings, type SiteSettingsFormState } from "@/app/admin/(protected)/site-settings/actions";
import type { SiteLocale } from "@/lib/locale";

type SiteSettings = {
  phone: string | null;
  whatsappCommercial: string | null;
  whatsappGeneral: string | null;
  email: string | null;
  addressLine: string | null;
  addressCity: string | null;
  addressPostalCode: string | null;
  addressCountry: string | null;
  mapEmbedUrl: string | null;
  mapLatitude: number | null;
  mapLongitude: number | null;
  socialFacebook: string | null;
  socialInstagram: string | null;
  socialLinkedin: string | null;
  socialYoutube: string | null;
  defaultOgImageUrl: string | null;
  nif: string | null;
  partnersDisplayMode: string;
  architectAreaEnabled: boolean;
  lsfPageEnabled: boolean;
  maintenanceMode: boolean;
  gaMeasurementId: string | null;
  metaPixelId: string | null;
  translations: {
    locale: SiteLocale;
    isAutoTranslated: boolean;
    footerDescription: string | null;
    footerLegal: string | null;
    footerTagline: string | null;
    showroomText: string | null;
    defaultSeoTitle: string | null;
    defaultSeoDescription: string | null;
  }[];
};

export function SiteSettingsForm({ settings }: { settings: SiteSettings | null }) {
  const [state, formAction, isPending] = useActionState<SiteSettingsFormState, FormData>(
    updateSiteSettings,
    undefined,
  );
  const pt = settings?.translations.find((t) => t.locale === "PT");
  const en = settings?.translations.find((t) => t.locale === "EN");
  const es = settings?.translations.find((t) => t.locale === "ES");
  const fr = settings?.translations.find((t) => t.locale === "FR");

  useEffect(() => {
    if (!state) return;
    if (state.ok) toast.success(state.message);
    else toast.error(state.message);
  }, [state]);

  return (
    <form action={formAction} className="max-w-3xl space-y-10">
      <section className="space-y-6">
        <h2 className="font-heading text-headline-md">Funcionalidades</h2>
        <CheckboxField
          id="architectAreaEnabled"
          name="architectAreaEnabled"
          label="Mostrar 'Área do Arquiteto' no site"
          defaultChecked={settings?.architectAreaEnabled ?? true}
        />
        <p className="text-xs text-on-surface-variant">
          Quando desativado, o link desaparece do menu e a página deixa de estar acessível.
        </p>

        <CheckboxField
          id="lsfPageEnabled"
          name="lsfPageEnabled"
          label="Mostrar a página 'LSF' no site"
          defaultChecked={settings?.lsfPageEnabled ?? true}
        />
        <p className="text-xs text-on-surface-variant">
          Página informativa em /lsf, apresentada como uma sequência de capítulos. Quando desativada, o link
          desaparece do menu e a página deixa de estar acessível. O conteúdo edita-se em Secções de Página →
          LSF.
        </p>

        <CheckboxField
          id="maintenanceMode"
          name="maintenanceMode"
          label="Ativar modo de manutenção"
          defaultChecked={settings?.maintenanceMode ?? false}
        />
        <p className="text-xs text-on-surface-variant">
          Bloqueia o site para todos os visitantes, mostrando uma página de manutenção. Administradores e
          editores com sessão iniciada continuam a ver o site normalmente.
        </p>

        <SelectField
          id="partnersDisplayMode"
          name="partnersDisplayMode"
          label="Exibição dos Parceiros"
          defaultValue={settings?.partnersDisplayMode ?? "GRID"}
          hint="Grelha mostra todos os logos de uma vez; Carrossel desliza os logos automaticamente da direita para a esquerda."
        >
          <option value="GRID">Grelha</option>
          <option value="CAROUSEL">Carrossel</option>
        </SelectField>
      </section>

      <section className="space-y-6">
        <h2 className="font-heading text-headline-md">Contacto</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <TextField id="phone" name="phone" label="Telefone" defaultValue={settings?.phone ?? ""} />
          <TextField id="email" name="email" label="Email" type="email" defaultValue={settings?.email ?? ""} />
          <TextField
            id="whatsappCommercial"
            name="whatsappCommercial"
            label="WhatsApp Comercial (URL)"
            defaultValue={settings?.whatsappCommercial ?? ""}
            placeholder="https://wa.me/351..."
          />
          <TextField
            id="whatsappGeneral"
            name="whatsappGeneral"
            label="WhatsApp Geral (URL)"
            defaultValue={settings?.whatsappGeneral ?? ""}
            placeholder="https://wa.me/351..."
          />
          <TextField id="nif" name="nif" label="NIF da Empresa" defaultValue={settings?.nif ?? ""} />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="font-heading text-headline-md">Morada & Mapa</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <TextField id="addressLine" name="addressLine" label="Endereço, Bairro" defaultValue={settings?.addressLine ?? ""} />
          <TextField id="addressCity" name="addressCity" label="Cidade" defaultValue={settings?.addressCity ?? ""} />
          <TextField
            id="addressPostalCode"
            name="addressPostalCode"
            label="Código Postal"
            defaultValue={settings?.addressPostalCode ?? ""}
          />
          <TextField id="addressCountry" name="addressCountry" label="País" defaultValue={settings?.addressCountry ?? ""} />
        </div>
        <TextField
          id="mapLocation"
          name="mapLocation"
          label="Localização no Mapa (página de Contactos)"
          defaultValue={
            settings?.mapLatitude != null && settings?.mapLongitude != null
              ? `${settings.mapLatitude}, ${settings.mapLongitude}`
              : ""
          }
          placeholder="https://maps.app.goo.gl/..."
          hint="Abre o local no Google Maps → Partilhar → Copiar link, e cola aqui. Também aceita coordenadas (38.63329, -9.14416)."
        />
      </section>

      <section className="space-y-6">
        <h2 className="font-heading text-headline-md">Redes Sociais</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <TextField id="socialFacebook" name="socialFacebook" label="Facebook" defaultValue={settings?.socialFacebook ?? ""} />
          <TextField id="socialInstagram" name="socialInstagram" label="Instagram" defaultValue={settings?.socialInstagram ?? ""} />
          <TextField id="socialLinkedin" name="socialLinkedin" label="LinkedIn" defaultValue={settings?.socialLinkedin ?? ""} />
          <TextField id="socialYoutube" name="socialYoutube" label="YouTube" defaultValue={settings?.socialYoutube ?? ""} />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="font-heading text-headline-md">Tracking & Analítica</h2>
        <p className="text-xs text-on-surface-variant">
          Os dois scripts só são carregados depois de o visitante aceitar os cookies. Deixar um campo vazio
          desliga esse serviço. Aplica-se ao site e à landing page (/lp).
        </p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <TextField
            id="gaMeasurementId"
            name="gaMeasurementId"
            label="Google Analytics (ID de medição)"
            defaultValue={settings?.gaMeasurementId ?? ""}
            placeholder="G-XXXXXXXXXX"
            hint="Em Administrador → Fluxos de dados, no Google Analytics."
          />
          <TextField
            id="metaPixelId"
            name="metaPixelId"
            label="Meta Ads (ID do pixel)"
            defaultValue={settings?.metaPixelId ?? ""}
            placeholder="123456789012345"
            hint="Em Gestor de Eventos → Origens de dados, no Meta Business."
          />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="font-heading text-headline-md">Rodapé, Showroom & SEO Padrão</h2>
        <LocaleTabs
          pt={
            <>
              <TextAreaField
                id="footerDescriptionPt"
                name="footerDescriptionPt"
                label="Descrição do Rodapé (PT)"
                defaultValue={pt?.footerDescription ?? ""}
              />
              <TextField
                id="footerLegalPt"
                name="footerLegalPt"
                label="Linha Legal do Rodapé (PT)"
                defaultValue={pt?.footerLegal ?? ""}
                placeholder="© {ano} Ápice 360 — Construções em LSF."
                hint="Usa {ano} para inserir o ano corrente. Em branco, a linha fica só com o NIF."
              />
              <TextField
                id="footerTaglinePt"
                name="footerTaglinePt"
                label="Frase do Rodapé (PT)"
                defaultValue={pt?.footerTagline ?? ""}
                placeholder="Velocidade · Durabilidade · Qualidade"
              />
              <TextAreaField
                id="showroomTextPt"
                name="showroomTextPt"
                label="Texto do Showroom (PT)"
                defaultValue={pt?.showroomText ?? ""}
              />
              <TextField
                id="defaultSeoTitlePt"
                name="defaultSeoTitlePt"
                label="Título SEO Padrão (PT)"
                defaultValue={pt?.defaultSeoTitle ?? ""}
                hint="Só se aplica a páginas sem entrada própria. Para mudar o título do Início, Serviços, Portfólio, etc., usa SEO por Página."
              />
              <TextAreaField
                id="defaultSeoDescriptionPt"
                name="defaultSeoDescriptionPt"
                label="Descrição SEO Padrão (PT)"
                defaultValue={pt?.defaultSeoDescription ?? ""}
              />
            </>
          }
          en={
            <>
              <TextAreaField
                id="footerDescriptionEn"
                name="footerDescriptionEn"
                label="Footer Description (EN)"
                defaultValue={en?.footerDescription ?? ""}
              />
              <TextField
                id="footerLegalEn"
                name="footerLegalEn"
                label="Footer Legal Line (EN)"
                defaultValue={en?.footerLegal ?? ""}
                placeholder="© {ano} Ápice 360 — LSF Construction."
                hint="Usa {ano} para inserir o ano corrente. Em branco, a linha fica só com o NIF."
              />
              <TextField
                id="footerTaglineEn"
                name="footerTaglineEn"
                label="Footer Tagline (EN)"
                defaultValue={en?.footerTagline ?? ""}
                placeholder="Speed · Durability · Quality"
              />
              <TextAreaField
                id="showroomTextEn"
                name="showroomTextEn"
                label="Showroom Text (EN)"
                defaultValue={en?.showroomText ?? ""}
              />
              <TextField
                id="defaultSeoTitleEn"
                name="defaultSeoTitleEn"
                label="Default SEO Title (EN)"
                defaultValue={en?.defaultSeoTitle ?? ""}
              />
              <TextAreaField
                id="defaultSeoDescriptionEn"
                name="defaultSeoDescriptionEn"
                label="Default SEO Description (EN)"
                defaultValue={en?.defaultSeoDescription ?? ""}
              />
            </>
          }
          es={
            <>
              <TextAreaField
                id="footerDescriptionEs"
                name="footerDescriptionEs"
                label="Descripción del Pie de Página (ES)"
                defaultValue={es?.footerDescription ?? ""}
              />
              <TextField
                id="footerLegalEs"
                name="footerLegalEs"
                label="Línea Legal del Pie (ES)"
                defaultValue={es?.footerLegal ?? ""}
                placeholder="© {ano} Ápice 360 — Construcción en LSF."
                hint="Usa {ano} para inserir o ano corrente. Em branco, a linha fica só com o NIF."
              />
              <TextField
                id="footerTaglineEs"
                name="footerTaglineEs"
                label="Frase del Pie (ES)"
                defaultValue={es?.footerTagline ?? ""}
                placeholder="Velocidad · Durabilidad · Calidad"
              />
              <TextAreaField
                id="showroomTextEs"
                name="showroomTextEs"
                label="Texto del Showroom (ES)"
                defaultValue={es?.showroomText ?? ""}
              />
              <TextField
                id="defaultSeoTitleEs"
                name="defaultSeoTitleEs"
                label="Título SEO Predeterminado (ES)"
                defaultValue={es?.defaultSeoTitle ?? ""}
              />
              <TextAreaField
                id="defaultSeoDescriptionEs"
                name="defaultSeoDescriptionEs"
                label="Descripción SEO Predeterminada (ES)"
                defaultValue={es?.defaultSeoDescription ?? ""}
              />
            </>
          }
          fr={
            <>
              <TextAreaField
                id="footerDescriptionFr"
                name="footerDescriptionFr"
                label="Description du Pied de Page (FR)"
                defaultValue={fr?.footerDescription ?? ""}
              />
              <TextField
                id="footerLegalFr"
                name="footerLegalFr"
                label="Ligne Légale du Pied (FR)"
                defaultValue={fr?.footerLegal ?? ""}
                placeholder="© {ano} Ápice 360 — Construction LSF."
                hint="Usa {ano} para inserir o ano corrente. Em branco, a linha fica só com o NIF."
              />
              <TextField
                id="footerTaglineFr"
                name="footerTaglineFr"
                label="Phrase du Pied (FR)"
                defaultValue={fr?.footerTagline ?? ""}
                placeholder="Rapidité · Durabilité · Qualité"
              />
              <TextAreaField
                id="showroomTextFr"
                name="showroomTextFr"
                label="Texte du Showroom (FR)"
                defaultValue={fr?.showroomText ?? ""}
              />
              <TextField
                id="defaultSeoTitleFr"
                name="defaultSeoTitleFr"
                label="Titre SEO par Défaut (FR)"
                defaultValue={fr?.defaultSeoTitle ?? ""}
              />
              <TextAreaField
                id="defaultSeoDescriptionFr"
                name="defaultSeoDescriptionFr"
                label="Description SEO par Défaut (FR)"
                defaultValue={fr?.defaultSeoDescription ?? ""}
              />
            </>
          }
          autoTranslated={{
            EN: en?.isAutoTranslated ?? true,
            ES: es?.isAutoTranslated ?? true,
            FR: fr?.isAutoTranslated ?? true,
          }}
        />
      </section>

      {state ? (
        <p className={state.ok ? "text-sm text-emerald-400" : "text-sm text-primary"}>{state.message}</p>
      ) : null}
      <Button type="submit" variant="cta" disabled={isPending}>
        {isPending ? "A guardar..." : "Guardar Definições"}
      </Button>
    </form>
  );
}
