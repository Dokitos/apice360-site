"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/admin/login/actions";
import { FloatingLabelInput } from "@/components/ui/FloatingLabelInput";
import { Button } from "@/components/ui/Button";

export function LoginForm() {
  const [error, formAction, isPending] = useActionState(loginAction, undefined);

  return (
    <form action={formAction} className="space-y-8">
      <FloatingLabelInput
        id="email"
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        required
      />
      <FloatingLabelInput
        id="password"
        name="password"
        label="Palavra-passe"
        type="password"
        autoComplete="current-password"
        required
      />
      {error ? <p className="text-sm text-primary">{error}</p> : null}
      <Button type="submit" variant="cta" className="w-full" disabled={isPending}>
        {isPending ? "A entrar..." : "Entrar"}
      </Button>
    </form>
  );
}
