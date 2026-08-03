"use client";

import { Icon } from "@/components/ui/Icon";

type DeleteButtonProps = {
  action: () => Promise<void>;
  confirmMessage?: string;
  label?: string;
};

export function DeleteButton({
  action,
  confirmMessage = "Tens a certeza que queres eliminar este registo? Esta ação não pode ser desfeita.",
  label = "Eliminar",
}: DeleteButtonProps) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        aria-label={label}
        title={label}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-primary/10 hover:text-primary"
      >
        <Icon name="delete" className="text-lg" />
      </button>
    </form>
  );
}
