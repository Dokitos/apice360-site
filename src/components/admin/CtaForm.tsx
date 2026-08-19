"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField, SelectField, CheckboxField, IconPickerField } from "@/components/admin/form-fields";
import { LocaleTabs } from "@/components/admin/LocaleTabs";
import { PAGE_LABELS } from "@/lib/known-page-sections";
import type { PageKeyValue } from "@/lib/content";

// Every place on the public site that actually reads a CTA by key (see
// getCta() call sites). Creating a CTA with a key outside this list (and
// not set as a Service's "Botão de Ação" or linked to a section below)
// won't be shown anywhere — the dropdown below steers editors towards a
// slot that's guaranteed to work.
const KNOWN_CTA_SLOTS: { key: string; description: string }[] = [
  { key: "home_hero", description: "Botão principal da capa (Início)" },
  { key: "header_budget", description: "Botão \"Orçamento\" no topo do site" },
  { key: "why_choose_services", description: "Botão da secção \"Porquê Escolher\" (Início)" },
  { key: "results_portfolio", description: "Botão da secção de resultados (Início)" },
  { key: "blog_see_more", description: "Botão \"Ver mais artigos\" (Início)" },
  { key: "contact_whatsapp_commercial", description: "Botão flutuante de WhatsApp + página de Contacto" },
  { key: "portfolio_final_budget", description: "Botão no fim da página de Portfólio" },
  { key: "project_detail_budget", description: "Botão na página de um projeto do portfólio" },
  { key: "about_talk_to_team", description: "Botão da página \"Quem Somos\"" },
  { key: "services_final_cta", description: "Botão no fim da página de Serviços" },
];

type SectionOption = { id: string; page: PageKeyValue; key: string; heading: string | null };

type Cta = {
  id: string;
  key: string;
  url: string;
  style: string | null;
  iconName: string | null;
  isActive: boolean;
  translations: { locale: "PT" | "EN"; label: string }[];
};

type CtaFormProps = {
  cta?: Cta;
  existingKeys?: string[];
  sections?: SectionOption[];
  action: (prevState: string | undefined, formData: FormData) => Promise<string | undefined>;
};

export function CtaForm({ cta, existingKeys = [], sections = [], action }: CtaFormProps) {
  const [error, formAction, isPending] = useActionState(action, undefined);
  const pt = cta?.translations.find((t) => t.locale === "PT");
  const en = cta?.translations.find((t) => t.locale === "EN");

  const availableSlots = KNOWN_CTA_SLOTS.filter((slot) => !existingKeys.includes(slot.key));
  const [customKey, setCustomKey] = useState(false);
  const [locationChoice, setLocationChoice] = useState("");

  const selectedSection = useMemo(
    () => (locationChoice.startsWith("section:") ? sections.find((s) => s.id === locationChoice.slice(8)) : undefined),
    [locationChoice, sections],
  );

  const computedKey = selectedSection
    ? `${selectedSection.page.toLowerCase()}_${selectedSection.key}_cta`
    : locationChoice && locationChoice !== "__custom__"
      ? locationChoice
      : "";

  function handleLocationChange(e: FormEvent<HTMLSelectElement>) {
    const value = e.currentTarget.value;
    if (value === "__custom__") {
      setCustomKey(true);
      return;
    }
    setLocationChoice(value);
  }

  return (
    <form action={formAction} className="max-w-xl space-y-6">
      {cta ? (
        <TextField
          id="key"
          name="key"
          label="Chave (identificador único)"
          defaultValue={cta.key}
          readOnly
          required
          hint="A chave não pode ser alterada depois de criada."
        />
      ) : customKey ? (
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <TextField
              id="key"
              name="key"
              label="Chave personalizada"
              placeholder="ex: my_custom_button"
              required
              hint="Só aparece no site se atribuíres esta chave a um Serviço, em 'Botão de Ação'. Minúsculas, números e underscore."
            />
          </div>
          <button
            type="button"
            onClick={() => setCustomKey(false)}
            className="mb-[1px] shrink-0 rounded-lg border border-outline-variant/40 px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-on-surface-variant transition-colors hover:bg-surface-container-high"
          >
            Voltar à lista
          </button>
        </div>
      ) : (
        <>
          <SelectField
            id="locationChoice"
            name="locationChoice"
            label="Onde vai aparecer este botão?"
            defaultValue=""
            required
            onChange={handleLocationChange}
            hint="Escolhe o local no site onde este botão deve aparecer."
          >
            <option value="" disabled>
              Escolhe um local...
            </option>
            {availableSlots.length > 0 ? (
              <optgroup label="Locais fixos do site">
                {availableSlots.map((slot) => (
                  <option key={slot.key} value={slot.key}>
                    {slot.description}
                  </option>
                ))}
              </optgroup>
            ) : null}
            {sections.length > 0 ? (
              <optgroup label="Secções de Página">
                {sections.map((s) => (
                  <option key={s.id} value={`section:${s.id}`}>
                    {PAGE_LABELS[s.page]} → {s.heading ?? s.key}
                  </option>
                ))}
              </optgroup>
            ) : null}
            <option value="__custom__">Outro (chave personalizada, para usar num Serviço)</option>
          </SelectField>
          <input type="hidden" name="key" value={computedKey} />
          <input type="hidden" name="linkedSectionId" value={selectedSection?.id ?? ""} />
        </>
      )}
      <TextField
        id="url"
        name="url"
        label="Destino (URL ou link do WhatsApp)"
        defaultValue={cta?.url}
        placeholder="https://wa.me/351000000000"
        required
      />
      <LocaleTabs
        pt={<TextField id="labelPt" name="labelPt" label="Texto do Botão (PT)" defaultValue={pt?.label} required />}
        en={<TextField id="labelEn" name="labelEn" label="Texto do Botão (EN)" defaultValue={en?.label} required />}
      />
      <IconPickerField id="iconName" name="iconName" label="Ícone (opcional)" defaultValue={cta?.iconName} />
      <SelectField id="style" name="style" label="Estilo" defaultValue={cta?.style ?? "primary"}>
        <option value="primary">Primário (preenchido)</option>
        <option value="outline">Contorno</option>
        <option value="ghost">Discreto</option>
      </SelectField>
      <CheckboxField id="isActive" name="isActive" label="Ativo (visível no site)" defaultChecked={cta?.isActive ?? true} />
      {error ? <p className="text-sm text-primary">{error}</p> : null}
      <Button type="submit" variant="cta" disabled={isPending}>
        {isPending ? "A guardar..." : "Guardar"}
      </Button>
    </form>
  );
}
