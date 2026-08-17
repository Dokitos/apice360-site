"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField, TextAreaField, SelectField, ImageField, SlugField } from "@/components/admin/form-fields";
import { LocaleTabs } from "@/components/admin/LocaleTabs";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

type BlogPost = {
  categoryId: string | null;
  featuredImageUrl: string | null;
  status: "DRAFT" | "PUBLISHED";
  translations: {
    locale: "PT" | "EN";
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
            <TextField id="titleEn" name="titleEn" label="Title (EN)" defaultValue={en?.title} required />
            <SlugField id="slugEn" name="slugEn" label="Slug (EN)" defaultValue={en?.slug} sourceId="titleEn" required />
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
      />

      {error ? <p className="text-sm text-primary">{error}</p> : null}
      <Button type="submit" variant="cta" disabled={isPending}>
        {isPending ? "A guardar..." : "Guardar"}
      </Button>
    </form>
  );
}
