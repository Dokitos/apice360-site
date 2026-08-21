"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField, TextAreaField, SelectField, CheckboxField, ImageField, SlugField } from "@/components/admin/form-fields";
import { LocaleTabs } from "@/components/admin/LocaleTabs";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import type { SiteLocale } from "@/lib/locale";

type Project = {
  slug: string;
  category: "LSF" | "REMODELACAO";
  locationLabel: string | null;
  clientName: string | null;
  clientLocation: string | null;
  coverImageUrl: string | null;
  order: number;
  isFeatured: boolean;
  isPublished: boolean;
  translations: {
    locale: SiteLocale;
    isAutoTranslated: boolean;
    title: string;
    shortDescription: string | null;
    challenge: string | null;
    methodology: string | null;
    result: string | null;
    testimonialQuote: string | null;
  }[];
};

type PortfolioProjectFormProps = {
  project?: Project;
  action: (prevState: string | undefined, formData: FormData) => Promise<string | undefined>;
};

export function PortfolioProjectForm({ project, action }: PortfolioProjectFormProps) {
  const [error, formAction, isPending] = useActionState(action, undefined);
  const pt = project?.translations.find((t) => t.locale === "PT");
  const en = project?.translations.find((t) => t.locale === "EN");
  const es = project?.translations.find((t) => t.locale === "ES");
  const fr = project?.translations.find((t) => t.locale === "FR");

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <SlugField
          id="slug"
          name="slug"
          label="Slug (URL)"
          defaultValue={project?.slug}
          placeholder="ex: moradia-lsf-lisboa"
          sourceId="titlePt"
          required
        />
        <SelectField id="category" name="category" label="Categoria" defaultValue={project?.category ?? "LSF"}>
          <option value="LSF">LSF</option>
          <option value="REMODELACAO">Remodelação</option>
        </SelectField>
      </div>

      <ImageField id="coverImageUrl" name="coverImageUrl" label="Imagem de Capa" defaultValue={project?.coverImageUrl} />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <TextField id="locationLabel" name="locationLabel" label="Localização" defaultValue={project?.locationLabel ?? ""} />
        <TextField id="clientName" name="clientName" label="Nome do Cliente" defaultValue={project?.clientName ?? ""} />
        <TextField
          id="clientLocation"
          name="clientLocation"
          label="Localização do Cliente"
          defaultValue={project?.clientLocation ?? ""}
        />
      </div>

      <LocaleTabs
        pt={
          <>
            <TextField id="titlePt" name="titlePt" label="Título (PT)" defaultValue={pt?.title} required />
            <TextAreaField
              id="shortDescriptionPt"
              name="shortDescriptionPt"
              label="Descrição Curta (PT)"
              defaultValue={pt?.shortDescription ?? ""}
            />
            <RichTextEditor id="challengePt" name="challengePt" label="Desafio Resolvido (PT)" defaultValue={pt?.challenge ?? ""} />
            <RichTextEditor
              id="methodologyPt"
              name="methodologyPt"
              label="Metodologia Ápice (PT)"
              defaultValue={pt?.methodology ?? ""}
            />
            <RichTextEditor id="resultPt" name="resultPt" label="Resultado (PT)" defaultValue={pt?.result ?? ""} />
            <TextAreaField
              id="testimonialQuotePt"
              name="testimonialQuotePt"
              label="Aprovação do Cliente (PT)"
              defaultValue={pt?.testimonialQuote ?? ""}
            />
          </>
        }
        en={
          <>
            <TextField id="titleEn" name="titleEn" label="Title (EN)" defaultValue={en?.title} />
            <TextAreaField
              id="shortDescriptionEn"
              name="shortDescriptionEn"
              label="Short Description (EN)"
              defaultValue={en?.shortDescription ?? ""}
            />
            <RichTextEditor id="challengeEn" name="challengeEn" label="Challenge Solved (EN)" defaultValue={en?.challenge ?? ""} />
            <RichTextEditor
              id="methodologyEn"
              name="methodologyEn"
              label="Ápice Methodology (EN)"
              defaultValue={en?.methodology ?? ""}
            />
            <RichTextEditor id="resultEn" name="resultEn" label="Result (EN)" defaultValue={en?.result ?? ""} />
            <TextAreaField
              id="testimonialQuoteEn"
              name="testimonialQuoteEn"
              label="Client Approval (EN)"
              defaultValue={en?.testimonialQuote ?? ""}
            />
          </>
        }
        es={
          <>
            <TextField id="titleEs" name="titleEs" label="Título (ES)" defaultValue={es?.title} />
            <TextAreaField
              id="shortDescriptionEs"
              name="shortDescriptionEs"
              label="Descripción Corta (ES)"
              defaultValue={es?.shortDescription ?? ""}
            />
            <RichTextEditor id="challengeEs" name="challengeEs" label="Desafío Resuelto (ES)" defaultValue={es?.challenge ?? ""} />
            <RichTextEditor
              id="methodologyEs"
              name="methodologyEs"
              label="Metodología Ápice (ES)"
              defaultValue={es?.methodology ?? ""}
            />
            <RichTextEditor id="resultEs" name="resultEs" label="Resultado (ES)" defaultValue={es?.result ?? ""} />
            <TextAreaField
              id="testimonialQuoteEs"
              name="testimonialQuoteEs"
              label="Aprobación del Cliente (ES)"
              defaultValue={es?.testimonialQuote ?? ""}
            />
          </>
        }
        fr={
          <>
            <TextField id="titleFr" name="titleFr" label="Titre (FR)" defaultValue={fr?.title} />
            <TextAreaField
              id="shortDescriptionFr"
              name="shortDescriptionFr"
              label="Description Courte (FR)"
              defaultValue={fr?.shortDescription ?? ""}
            />
            <RichTextEditor id="challengeFr" name="challengeFr" label="Défi Résolu (FR)" defaultValue={fr?.challenge ?? ""} />
            <RichTextEditor
              id="methodologyFr"
              name="methodologyFr"
              label="Méthodologie Ápice (FR)"
              defaultValue={fr?.methodology ?? ""}
            />
            <RichTextEditor id="resultFr" name="resultFr" label="Résultat (FR)" defaultValue={fr?.result ?? ""} />
            <TextAreaField
              id="testimonialQuoteFr"
              name="testimonialQuoteFr"
              label="Approbation du Client (FR)"
              defaultValue={fr?.testimonialQuote ?? ""}
            />
          </>
        }
        autoTranslated={{
          EN: en?.isAutoTranslated ?? true,
          ES: es?.isAutoTranslated ?? true,
          FR: fr?.isAutoTranslated ?? true,
        }}
      />

      <TextField id="order" name="order" label="Ordem de Exibição" type="number" defaultValue={project?.order ?? 0} />
      <div className="flex flex-col gap-3">
        <CheckboxField
          id="isFeatured"
          name="isFeatured"
          label="Destaque (aparece em 'Projetos de Alto Desempenho')"
          defaultChecked={project?.isFeatured ?? false}
        />
        <CheckboxField
          id="isPublished"
          name="isPublished"
          label="Publicado (visível no site)"
          defaultChecked={project?.isPublished ?? true}
        />
      </div>

      {error ? <p className="text-sm text-primary">{error}</p> : null}
      <Button type="submit" variant="cta" disabled={isPending}>
        {isPending ? "A guardar..." : "Guardar"}
      </Button>
    </form>
  );
}
