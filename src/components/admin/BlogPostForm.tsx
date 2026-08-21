"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField, TextAreaField, SelectField, ImageField, SlugField } from "@/components/admin/form-fields";
import { LocaleTabs } from "@/components/admin/LocaleTabs";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import type { SiteLocale } from "@/lib/locale";

type BlogPost = {
  categoryId: string | null;
  featuredImageUrl: string | null;
  status: "DRAFT" | "PUBLISHED";
  translations: {
    locale: SiteLocale;
    isAutoTranslated: boolean;
    slug: string;
    title: string;
    excerpt: string | null;
    bodyHtml: string;
    seoTitle: string | null;
    seoDescription: string | null;
  }[];
};

type Category = { id: string; name: string };

type BlogPostFormProps = {
  post?: BlogPost;
  categories: Category[];
  action: (prevState: string | undefined, formData: FormData) => Promise<string | undefined>;
};

export function BlogPostForm({ post, categories, action }: BlogPostFormProps) {
  const [error, formAction, isPending] = useActionState(action, undefined);
  const pt = post?.translations.find((t) => t.locale === "PT");
  const en = post?.translations.find((t) => t.locale === "EN");
  const es = post?.translations.find((t) => t.locale === "ES");
  const fr = post?.translations.find((t) => t.locale === "FR");

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <SelectField id="categoryId" name="categoryId" label="Categoria" defaultValue={post?.categoryId ?? ""}>
          <option value="">Sem categoria</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </SelectField>
        <SelectField id="status" name="status" label="Estado" defaultValue={post?.status ?? "DRAFT"}>
          <option value="DRAFT">Rascunho</option>
          <option value="PUBLISHED">Publicado</option>
        </SelectField>
      </div>

      <ImageField id="featuredImageUrl" name="featuredImageUrl" label="Imagem de Destaque" defaultValue={post?.featuredImageUrl} />

      <LocaleTabs
        pt={
          <>
            <TextField id="titlePt" name="titlePt" label="Título (PT)" defaultValue={pt?.title} required />
            <SlugField id="slugPt" name="slugPt" label="Slug (PT)" defaultValue={pt?.slug} sourceId="titlePt" required />
            <TextAreaField id="excerptPt" name="excerptPt" label="Resumo (PT)" defaultValue={pt?.excerpt ?? ""} />
            <RichTextEditor id="bodyHtmlPt" name="bodyHtmlPt" label="Conteúdo (PT)" defaultValue={pt?.bodyHtml ?? ""} />
            <TextField id="seoTitlePt" name="seoTitlePt" label="Título SEO (PT)" defaultValue={pt?.seoTitle ?? ""} />
            <TextAreaField
              id="seoDescriptionPt"
              name="seoDescriptionPt"
              label="Descrição SEO (PT)"
              defaultValue={pt?.seoDescription ?? ""}
            />
          </>
        }
        en={
          <>
            <TextField id="titleEn" name="titleEn" label="Title (EN)" defaultValue={en?.title} />
            <SlugField id="slugEn" name="slugEn" label="Slug (EN)" defaultValue={en?.slug} sourceId="titleEn" />
            <TextAreaField id="excerptEn" name="excerptEn" label="Excerpt (EN)" defaultValue={en?.excerpt ?? ""} />
            <RichTextEditor id="bodyHtmlEn" name="bodyHtmlEn" label="Body (EN)" defaultValue={en?.bodyHtml ?? ""} />
            <TextField id="seoTitleEn" name="seoTitleEn" label="SEO Title (EN)" defaultValue={en?.seoTitle ?? ""} />
            <TextAreaField
              id="seoDescriptionEn"
              name="seoDescriptionEn"
              label="SEO Description (EN)"
              defaultValue={en?.seoDescription ?? ""}
            />
          </>
        }
        es={
          <>
            <TextField id="titleEs" name="titleEs" label="Título (ES)" defaultValue={es?.title} />
            <SlugField id="slugEs" name="slugEs" label="Slug (ES)" defaultValue={es?.slug} sourceId="titleEs" />
            <TextAreaField id="excerptEs" name="excerptEs" label="Resumen (ES)" defaultValue={es?.excerpt ?? ""} />
            <RichTextEditor id="bodyHtmlEs" name="bodyHtmlEs" label="Contenido (ES)" defaultValue={es?.bodyHtml ?? ""} />
            <TextField id="seoTitleEs" name="seoTitleEs" label="Título SEO (ES)" defaultValue={es?.seoTitle ?? ""} />
            <TextAreaField
              id="seoDescriptionEs"
              name="seoDescriptionEs"
              label="Descripción SEO (ES)"
              defaultValue={es?.seoDescription ?? ""}
            />
          </>
        }
        fr={
          <>
            <TextField id="titleFr" name="titleFr" label="Titre (FR)" defaultValue={fr?.title} />
            <SlugField id="slugFr" name="slugFr" label="Slug (FR)" defaultValue={fr?.slug} sourceId="titleFr" />
            <TextAreaField id="excerptFr" name="excerptFr" label="Résumé (FR)" defaultValue={fr?.excerpt ?? ""} />
            <RichTextEditor id="bodyHtmlFr" name="bodyHtmlFr" label="Contenu (FR)" defaultValue={fr?.bodyHtml ?? ""} />
            <TextField id="seoTitleFr" name="seoTitleFr" label="Titre SEO (FR)" defaultValue={fr?.seoTitle ?? ""} />
            <TextAreaField
              id="seoDescriptionFr"
              name="seoDescriptionFr"
              label="Description SEO (FR)"
              defaultValue={fr?.seoDescription ?? ""}
            />
          </>
        }
        autoTranslated={{
          EN: en?.isAutoTranslated ?? true,
          ES: es?.isAutoTranslated ?? true,
          FR: fr?.isAutoTranslated ?? true,
        }}
      />

      {error ? <p className="text-sm text-primary">{error}</p> : null}
      <Button type="submit" variant="cta" disabled={isPending}>
        {isPending ? "A guardar..." : "Guardar"}
      </Button>
    </form>
  );
}
