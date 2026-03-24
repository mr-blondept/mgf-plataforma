"use client";

import { useEffect, useState, FormEvent, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import LoadingSkeleton from "@/components/LoadingSkeleton";

type ProfileForm = {
  full_name: string;
  medical_order_number: string;
  graduation_year: string;
  workplace: string;
};

export default function PerfilPage() {
  return (
    <Suspense fallback={<PerfilPageFallback />}>
      <PerfilPageContent />
    </Suspense>
  );
}

function PerfilPageFallback() {
  return (
    <main className="relative min-h-[calc(100vh-3.5rem)] app-surface">
      <div className="absolute inset-0 hero-surface" />
      <div className="absolute inset-0 soft-grain opacity-30" />
      <div className="relative mx-auto w-full max-w-2xl px-4 py-10">
        <section className="rounded-3xl border border-border/70 bg-card/80 p-6 shadow-md backdrop-blur sm:p-8">
          <div className="flex flex-col gap-2">
            <LoadingSkeleton className="h-8 w-52" />
            <LoadingSkeleton className="h-4 w-full max-w-md" />
          </div>
          <div className="mt-8 space-y-4">
            <LoadingSkeleton className="h-5 w-40" />
            <LoadingSkeleton className="h-11 rounded-xl" />
            <LoadingSkeleton className="h-5 w-28" />
            <LoadingSkeleton className="h-11 rounded-xl" />
            <LoadingSkeleton className="h-5 w-32" />
            <LoadingSkeleton className="h-11 rounded-xl" />
            <LoadingSkeleton className="h-12 rounded-2xl" />
          </div>
        </section>
      </div>
    </main>
  );
}

function PerfilPageContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [form, setForm] = useState<ProfileForm>({
    full_name: "",
    medical_order_number: "",
    graduation_year: "",
    workplace: "",
  });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const requiresCompletion = searchParams.get("complete") === "1";

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        window.location.href = "/auth";
        return;
      }

      setEmail(user.email ?? "");
      const meta = user.user_metadata ?? {};

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, medical_order_number, graduation_year, workplace")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        setErrorMsg(
          `Não foi possível carregar o perfil. (${error.message})`
        );
      }

      setForm({
        full_name:
          (data?.full_name as string | null) ??
          (meta.full_name as string | null) ??
          "",
        medical_order_number:
          (data?.medical_order_number as string | null) ??
          (meta.medical_order_number as string | null) ??
          "",
        graduation_year:
          data?.graduation_year != null
            ? String(data.graduation_year)
            : (meta.graduation_year as string | null) ??
              (meta.graduation_year != null ? String(meta.graduation_year) : ""),
        workplace:
          (data?.workplace as string | null) ??
          (meta.workplace as string | null) ??
          "",
      });

      setLoading(false);
    });
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const supabase = createClient();
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    if (!user) {
      window.location.href = "/auth";
      return;
    }

    const normalizedName = form.full_name.trim();
    if (normalizedName.length < 2) {
      setErrorMsg("Nome inválido.");
      setSaving(false);
      return;
    }

    if (newPassword || confirmPassword) {
      if (newPassword.length < 4) {
        setErrorMsg("A palavra-passe deve ter pelo menos 4 dígitos.");
        setSaving(false);
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg("As palavras-passe não coincidem.");
        setSaving(false);
        return;
      }
    }

    const medicalOrderValue = Number(form.medical_order_number);
    if (
      !Number.isInteger(medicalOrderValue) ||
      medicalOrderValue < 1000 ||
      medicalOrderValue > 199999
    ) {
      setErrorMsg("Nº Ordem dos Médicos inválido.");
      setSaving(false);
      return;
    }

    const yearValue = Number(form.graduation_year);
    if (
      !Number.isInteger(yearValue) ||
      yearValue < 1950 ||
      yearValue > new Date().getFullYear()
    ) {
      setErrorMsg("Ano de conclusão inválido.");
      setSaving(false);
      return;
    }

    const payload = {
      id: user.id,
      full_name: normalizedName,
      medical_order_number: String(medicalOrderValue),
      graduation_year: yearValue,
      workplace: form.workplace.trim() || null,
    };

    if (newPassword) {
      const { error: passwordError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (passwordError) {
        setErrorMsg(`Erro ao atualizar password. (${passwordError.message})`);
        setSaving(false);
        return;
      }
    }

    const { error: metaError } = await supabase.auth.updateUser({
      data: {
        full_name: normalizedName,
        medical_order_number: String(medicalOrderValue),
        graduation_year: String(yearValue),
        workplace: form.workplace.trim() || null,
      },
    });
    if (metaError) {
      setErrorMsg(`Erro ao guardar metadados. (${metaError.message})`);
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .upsert(payload, { onConflict: "id" });

    if (error) {
      setErrorMsg(`Erro ao guardar o perfil. (${error.message})`);
      setSaving(false);
      return;
    }

    setSuccessMsg("Perfil atualizado com sucesso.");
    setNewPassword("");
    setConfirmPassword("");
    setSaving(false);
  }

  return (
    <main className="relative min-h-[calc(100vh-3.5rem)] app-surface">
      <div className="absolute inset-0 hero-surface" />
      <div className="absolute inset-0 soft-grain opacity-30" />
      <div className="relative mx-auto w-full max-w-2xl px-4 py-10">
        <section className="rounded-3xl border border-border/70 bg-card/80 p-6 shadow-md backdrop-blur sm:p-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold text-foreground">
              Perfil do utilizador
            </h1>
            <p className="text-sm text-muted-foreground">
              Atualiza os teus dados profissionais. Estes campos ajudam a
              personalizar a plataforma.
            </p>
          </div>

          {requiresCompletion ? (
            <div className="mt-6 rounded-2xl border border-amber-300/70 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Precisamos que completes o teu perfil antes de continuares. Preenche o Nº Ordem dos Médicos, o ano de conclusão do curso de Medicina e o local de trabalho.
            </div>
          ) : null}

          {loading ? (
            <div className="mt-8 space-y-4">
              <LoadingSkeleton className="h-5 w-40" />
              <LoadingSkeleton className="h-11 rounded-xl" />
              <LoadingSkeleton className="h-5 w-28" />
              <LoadingSkeleton className="h-11 rounded-xl" />
              <LoadingSkeleton className="h-5 w-32" />
              <LoadingSkeleton className="h-11 rounded-xl" />
              <LoadingSkeleton className="h-12 rounded-2xl" />
            </div>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className={cn(
                    "flex h-10 w-full rounded-xl border border-input bg-muted px-3 py-2.5 text-sm text-muted-foreground",
                    "cursor-not-allowed"
                  )}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="perfil-nome"
                  className="text-sm font-medium text-foreground"
                >
                  Nome
                </label>
                <input
                  id="perfil-nome"
                  type="text"
                  required
                  className={cn(
                    "flex h-10 w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm transition-colors",
                    "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  )}
                  value={form.full_name}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      full_name: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="perfil-ordem"
                  className="text-sm font-medium text-foreground"
                >
                  Nº Ordem dos Médicos
                </label>
                <input
                  id="perfil-ordem"
                  type="number"
                  min={1000}
                  max={199999}
                  inputMode="numeric"
                  required
                  className={cn(
                    "flex h-10 w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm transition-colors",
                    "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  )}
                  value={form.medical_order_number}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      medical_order_number: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="perfil-ano"
                  className="text-sm font-medium text-foreground"
                >
                  Ano de conclusão do curso de Medicina
                </label>
                <input
                  id="perfil-ano"
                  type="number"
                  min={1950}
                  max={new Date().getFullYear()}
                  required
                  className={cn(
                    "flex h-10 w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm transition-colors",
                    "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  )}
                  value={form.graduation_year}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      graduation_year: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="perfil-local"
                  className="text-sm font-medium text-foreground"
                >
                  Local de trabalho
                </label>
                <input
                  id="perfil-local"
                  type="text"
                  required
                  className={cn(
                    "flex h-10 w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm transition-colors",
                    "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  )}
                  value={form.workplace}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      workplace: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="rounded-2xl border border-border/70 bg-secondary/50 p-4">
                <h2 className="text-sm font-semibold text-foreground">
                  Alterar password
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Deixa em branco se não quiseres alterar.
                </p>
                <div className="mt-3 space-y-3">
                  <div className="space-y-2">
                    <label
                      htmlFor="perfil-password"
                      className="text-sm font-medium text-foreground"
                    >
                      Nova password
                    </label>
                    <input
                      id="perfil-password"
                      type="password"
                      minLength={4}
                      className={cn(
                        "flex h-10 w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm transition-colors",
                        "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      )}
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="perfil-password-confirm"
                      className="text-sm font-medium text-foreground"
                    >
                      Confirmar nova password
                    </label>
                    <input
                      id="perfil-password-confirm"
                      type="password"
                      minLength={4}
                      className={cn(
                        "flex h-10 w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm transition-colors",
                        "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      )}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                    />
                  </div>
                </div>
              </div>

              {errorMsg && (
                <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="rounded-md border border-success/40 bg-success/10 px-3 py-2 text-sm text-success">
                  {successMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="flex h-10 w-full items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg disabled:opacity-50"
              >
                {saving ? "A guardar..." : "Guardar alterações"}
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
