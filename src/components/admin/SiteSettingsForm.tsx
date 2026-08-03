"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField, TextAreaField } from "@/components/admin/form-fields";
import { LocaleTabs } from "@/components/admin/LocaleTabs";
import { updateSiteSettings, type SiteSettingsFormState } from "@/app/admin/(protected)/site-settings/actions";

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
  socialFacebook: string | null;
  socialInstagram: string | null;
  socialLinkedin: string | null;
  socialYoutube: string | null;
  defaultOgImageUrl: string | null;
  translations: {
    locale: "PT" | "EN";
    footerDescription: string | null;
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

  return (
    <form action={formAction} className="max-w-3xl space-y-10">
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
          id="mapEmbedUrl"
          name="mapEmbedUrl"
          label="URL de Embed do Google Maps"
          defaultValue={settings?.mapEmbedUrl ?? ""}
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
