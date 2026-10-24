"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdminIcon as Icon } from "@/components/admin/AdminIcon";

type DeleteButtonProps = {
  action: () => Promise<void>;
  confirmMessage?: string;
  label?: string;
  successMessage?: string;
};

export function DeleteButton({
  action,
  confirmMessage = "Tens a certeza que queres eliminar este registo? Esta ação não pode ser desfeita.",
  label = "Eliminar",
  successMessage = "Eliminado com sucesso.",
}: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    if (!window.confirm(confirmMessage)) return;
    startTransition(async () => {
      try {
        await action();
        router.refresh();
        toast.success(successMessage);
      } catch {
        toast.error("Não foi possível eliminar. Tenta novamente.");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={label}
      title={label}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Icon name="delete" className="text-lg" />
    </button>
  );
}
