"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import { Icon } from "@/components/ui/Icon";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { PageSectionForm } from "@/components/admin/PageSectionForm";
import { PageSectionItemForm } from "@/components/admin/PageSectionItemForm";
import { cn } from "@/lib/cn";
import type { SiteLocale } from "@/lib/locale";

type FormAction = (prevState: string | undefined, formData: FormData) => Promise<string | undefined>;

type ItemData = {
  id: string;
  iconName: string | null;
  imageUrl: string | null;
  numberLabel: string | null;
  ctaKey: string | null;
  order: number;
  translations: { locale: SiteLocale; isAutoTranslated: boolean; title: string; body: string | null }[];
  updateAction: FormAction;
  deleteAction: () => Promise<void>;
};

type SectionData = {
  id: string;
  key: string;
  layout: string;
  imageUrl: string | null;
  iconName: string | null;
  ctaKey: string | null;
  order: number;
  isActive: boolean;
  translations: {
    locale: SiteLocale;
    isAutoTranslated: boolean;
    eyebrow: string | null;
    heading: string | null;
    subheading: string | null;
    body: string | null;
    ctaLabel: string | null;
  }[];
  items: ItemData[];
  updateAction: FormAction;
  deleteAction: () => Promise<void>;
  createItemAction: FormAction;
  reorderItemsAction: (orderedIds: string[]) => Promise<void>;
};

type CtaOption = { key: string; label: string };

type SectionsEditorProps = {
  sections: SectionData[];
  ctas: CtaOption[];
  createSectionAction: FormAction;
  reorderSectionsAction: (orderedIds: string[]) => Promise<void>;
  initialOpenId?: string | null;
};

export function SectionsEditor({
  sections,
  ctas,
  createSectionAction,
  reorderSectionsAction,
  initialOpenId,
}: SectionsEditorProps) {
  const [order, setOrder] = useState(sections.map((s) => s.id));
  const [openId, setOpenId] = useState<string | null>(initialOpenId ?? null);
  const [isCreating, setIsCreating] = useState(false);
  const [, startReorder] = useTransition();
  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const byId = new Map(sections.map((s) => [s.id, s]));
  const orderedSections = order.map((id) => byId.get(id)).filter((s): s is SectionData => Boolean(s));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setOrder((current) => {
      const oldIndex = current.indexOf(String(active.id));
      const newIndex = current.indexOf(String(over.id));
      const next = arrayMove(current, oldIndex, newIndex);
      startReorder(async () => {
        try {
          await reorderSectionsAction(next);
          router.refresh();
        } catch {
          toast.error("Não foi possível reordenar. Tenta novamente.");
        }
      });
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-on-surface-variant">Arrasta pelo ícone para reordenar. Clica numa secção para editar.</p>
        <button
          type="button"
          onClick={() => {
            setIsCreating((v) => !v);
            setOpenId(null);
          }}
          className="flex shrink-0 items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold uppercase text-on-primary transition-transform hover:scale-105"
        >
          <Icon name={isCreating ? "close" : "add"} />
          {isCreating ? "Cancelar" : "Nova Secção"}
        </button>
      </div>

      {isCreating ? (
        <div className="rounded-lg border border-outline-variant/20 bg-surface-container-low p-6">
          <h3 className="mb-4 font-heading text-headline-sm">Nova Secção</h3>
          <PageSectionForm ctas={ctas} action={createSectionAction} />
        </div>
      ) : null}

      {orderedSections.length === 0 && !isCreating ? (
        <div className="rounded-lg border border-outline-variant/20 bg-surface-container-low p-10 text-center text-on-surface-variant">
          Ainda não há secções configuradas para esta página.
        </div>
      ) : null}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {orderedSections.map((section) => (
              <SectionRow
                key={section.id}
                section={section}
                ctas={ctas}
                isOpen={openId === section.id}
                onToggle={() =>
                  setOpenId((current) => {
                    setIsCreating(false);
                    return current === section.id ? null : section.id;
                  })
                }
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SectionRow({
  section,
  ctas,
  isOpen,
  onToggle,
}: {
  section: SectionData;
  ctas: CtaOption[];
  isOpen: boolean;
  onToggle: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const pt = section.translations.find((t) => t.locale === "PT");

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-lg border border-outline-variant/20 bg-surface-container-lowest",
        isDragging && "opacity-60 shadow-lg",
      )}
    >
      <div className="flex items-center gap-2 p-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Arrastar para reordenar"
          className="flex h-8 w-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low active:cursor-grabbing"
        >
          <Icon name="drag_indicator" />
        </button>
        <button type="button" onClick={onToggle} className="flex flex-1 items-center gap-3 overflow-hidden py-1 text-left">
          <code className="shrink-0 rounded bg-surface-container px-2 py-1 text-xs text-on-surface-variant">{section.key}</code>
          <span className="truncate font-medium">{pt?.heading || pt?.eyebrow || "(sem título)"}</span>
          <span className="hidden shrink-0 rounded bg-surface-container px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant sm:inline-block">
            {section.layout}
          </span>
          <span className={cn("ml-auto shrink-0 text-xs", section.isActive ? "text-primary" : "text-on-surface-variant")}>
            {section.isActive ? "Ativo" : "Inativo"}
          </span>
          <Icon name={isOpen ? "expand_less" : "expand_more"} className="shrink-0" />
        </button>
        <DeleteButton action={section.deleteAction} />
      </div>
      {isOpen ? (
        <div className="border-t border-outline-variant/20 p-6">
          <PageSectionForm section={section} ctas={ctas} action={section.updateAction} />
          <div className="mt-10 border-t border-outline-variant/20 pt-8">
            <ItemsEditor section={section} ctas={ctas} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ItemsEditor({ section, ctas }: { section: SectionData; ctas: CtaOption[] }) {
  const [order, setOrder] = useState(section.items.map((i) => i.id));
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [, startReorder] = useTransition();
  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const byId = new Map(section.items.map((i) => [i.id, i]));
  const orderedItems = order.map((id) => byId.get(id)).filter((i): i is ItemData => Boolean(i));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setOrder((current) => {
      const oldIndex = current.indexOf(String(active.id));
      const newIndex = current.indexOf(String(over.id));
      const next = arrayMove(current, oldIndex, newIndex);
      startReorder(async () => {
        try {
          await section.reorderItemsAction(next);
          router.refresh();
        } catch {
          toast.error("Não foi possível reordenar. Tenta novamente.");
        }
      });
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h4 className="font-heading text-headline-sm">Itens</h4>
        <button
          type="button"
          onClick={() => {
            setIsCreating((v) => !v);
            setOpenItemId(null);
          }}
          className="flex shrink-0 items-center gap-2 rounded-lg border border-outline-variant px-4 py-2 text-xs font-bold uppercase text-on-surface transition-colors hover:border-primary hover:text-primary"
        >
          <Icon name={isCreating ? "close" : "add"} />
          {isCreating ? "Cancelar" : "Novo Item"}
        </button>
      </div>

      {isCreating ? (
        <div className="rounded-lg border border-outline-variant/20 bg-surface-container-low p-6">
          <PageSectionItemForm ctas={ctas} action={section.createItemAction} />
        </div>
      ) : null}

      {orderedItems.length === 0 && !isCreating ? <p className="text-sm text-on-surface-variant">Ainda não há itens.</p> : null}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {orderedItems.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                ctas={ctas}
                isOpen={openItemId === item.id}
                onToggle={() =>
                  setOpenItemId((current) => {
                    setIsCreating(false);
                    return current === item.id ? null : item.id;
                  })
                }
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function ItemRow({
  item,
  ctas,
  isOpen,
  onToggle,
}: {
  item: ItemData;
  ctas: CtaOption[];
  isOpen: boolean;
  onToggle: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const pt = item.translations.find((t) => t.locale === "PT");

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-lg border border-outline-variant/20 bg-surface-container-lowest",
        isDragging && "opacity-60 shadow-lg",
      )}
    >
      <div className="flex items-center gap-2 p-2.5">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Arrastar para reordenar"
          className="flex h-7 w-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low active:cursor-grabbing"
        >
          <Icon name="drag_indicator" className="text-base" />
        </button>
        <button type="button" onClick={onToggle} className="flex flex-1 items-center gap-3 py-0.5 text-left text-sm">
          <span className="truncate">{pt?.title || "(sem título)"}</span>
          <Icon name={isOpen ? "expand_less" : "expand_more"} className="ml-auto shrink-0 text-lg" />
        </button>
        <DeleteButton action={item.deleteAction} />
      </div>
      {isOpen ? (
        <div className="border-t border-outline-variant/20 p-6">
          <PageSectionItemForm item={item} ctas={ctas} action={item.updateAction} />
        </div>
      ) : null}
    </div>
  );
}
