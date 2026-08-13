import { Card } from "@/components/ui/Card";
import { LoginForm } from "@/components/admin/LoginForm";

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-container-low px-5 py-16">
      <Card variant="glass" className="relative w-full max-w-md overflow-hidden border border-outline p-12">
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-[100px]" />
        <div className="relative">
          <span className="mb-4 inline-block font-mono text-label-mono uppercase tracking-[0.3em] text-primary">
            Ápice 360
          </span>
          <h1 className="mb-8 font-heading text-headline-md">Painel de Administração</h1>
          <LoginForm />
        </div>
      </Card>
    </main>
  );
}
