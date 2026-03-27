"use client";

import { useEffect, useMemo, useState, type ComponentType, type DragEvent, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowUpRight,
  CircleHelp,
  GripVertical,
  HeartPulse,
  Pill,
  Scale,
  ShieldPlus,
  Star,
  Syringe,
  Waves,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import PageLoadingView from "@/components/PageLoadingView";

type CalculatorId =
  | "doses-pediatricas"
  | "tfge"
  | "ldl"
  | "cha2ds2-vasc"
  | "imc"
  | "conversao-corticoides"
  | "cage"
  | "conversao-benzodiazepinas";

type CategoryId =
  | "pediatria"
  | "nefrologia"
  | "cardiologia"
  | "medicina-geral"
  | "farmacologia"
  | "saude-mental";

type CalculatorItem = {
  id: CalculatorId;
  href: string;
  title: string;
  description: string;
  category: CategoryId;
  icon: ComponentType<{ className?: string }>;
  gradientClassName: string;
};

const calculators: CalculatorItem[] = [
  {
    id: "doses-pediatricas",
    href: "/calculadoras/doses-pediatricas",
    title: "Doses pediátricas",
    description: "Calculo de dose oral por peso, frequencia, concentracao e limite maximo.",
    category: "pediatria",
    icon: Syringe,
    gradientClassName: "from-sky-500/20 to-cyan-500/5",
  },
  {
    id: "tfge",
    href: "/calculadoras/tfge",
    title: "TFGe",
    description: "CKD-EPI creatinina 2021 para estimativa da taxa de filtracao glomerular.",
    category: "nefrologia",
    icon: Activity,
    gradientClassName: "from-emerald-500/18 to-cyan-500/5",
  },
  {
    id: "ldl",
    href: "/calculadoras/ldl",
    title: "LDL",
    description: "Calcula LDL pela formula de Friedewald a partir de colesterol total, HDL e trigliceridos.",
    category: "cardiologia",
    icon: HeartPulse,
    gradientClassName: "from-rose-500/16 to-orange-500/5",
  },
  {
    id: "cha2ds2-vasc",
    href: "/calculadoras/cha2ds2-vasc",
    title: "CHA2DS2-VASc",
    description: "Estratificacao do risco tromboembolico na fibrilhacao auricular nao valvular.",
    category: "cardiologia",
    icon: ShieldPlus,
    gradientClassName: "from-violet-500/14 to-fuchsia-500/5",
  },
  {
    id: "imc",
    href: "/calculadoras/imc",
    title: "IMC",
    description: "Indice de massa corporal com peso em quilogramas e altura em centimetros.",
    category: "medicina-geral",
    icon: Scale,
    gradientClassName: "from-lime-500/16 to-emerald-500/5",
  },
  {
    id: "conversao-corticoides",
    href: "/calculadoras/conversao-corticoides",
    title: "Conversao de corticoides",
    description: "Converte doses equivalentes entre glucocorticoides sistemicos por potencia anti-inflamatoria.",
    category: "farmacologia",
    icon: Pill,
    gradientClassName: "from-amber-500/16 to-yellow-500/5",
  },
  {
    id: "cage",
    href: "/calculadoras/cage",
    title: "CAGE",
    description: "Questionario breve de rastreio para consumo problematico de alcool.",
    category: "saude-mental",
    icon: CircleHelp,
    gradientClassName: "from-red-500/14 to-amber-500/5",
  },
  {
    id: "conversao-benzodiazepinas",
    href: "/calculadoras/conversao-benzodiazepinas",
    title: "Conversao de benzodiazepinas",
    description: "Estima doses orais equivalentes entre benzodiazepinas de uso habitual.",
    category: "farmacologia",
    icon: Waves,
    gradientClassName: "from-blue-500/16 to-sky-500/5",
  },
];

const categories: Array<{ id: CategoryId; title: string }> = [
  { id: "cardiologia", title: "Cardiologia" },
  { id: "nefrologia", title: "Nefrologia" },
  { id: "pediatria", title: "Pediatria" },
  { id: "medicina-geral", title: "Medicina Geral" },
  { id: "farmacologia", title: "Farmacologia" },
  { id: "saude-mental", title: "Saude Mental e Dependencias" },
];

function sortByStoredOrder(items: CalculatorItem[], order: CalculatorId[]) {
  const positions = new Map(order.map((id, index) => [id, index]));

  return [...items].sort((a, b) => {
    const aIndex = positions.get(a.id);
    const bIndex = positions.get(b.id);

    if (aIndex === undefined && bIndex === undefined) {
      return calculators.findIndex((item) => item.id === a.id) - calculators.findIndex((item) => item.id === b.id);
    }

    if (aIndex === undefined) {
      return 1;
    }

    if (bIndex === undefined) {
      return -1;
    }

    return aIndex - bIndex;
  });
}

function toggleFavorite(current: CalculatorId[], id: CalculatorId) {
  if (current.includes(id)) {
    return current.filter((item) => item !== id);
  }

  return [...current, id];
}

function sanitizeIds(ids: string[] | null | undefined) {
  return (ids ?? []).filter((id): id is CalculatorId => calculators.some((item) => item.id === id));
}

function moveItem(order: CalculatorId[], draggedId: CalculatorId, targetId: CalculatorId) {
  if (draggedId === targetId) {
    return order;
  }

  const next = [...order];
  const fromIndex = next.indexOf(draggedId);
  const targetIndex = next.indexOf(targetId);

  if (fromIndex === -1 || targetIndex === -1) {
    return order;
  }

  next.splice(fromIndex, 1);
  next.splice(targetIndex, 0, draggedId);
  return next;
}

function buildDefaultOrder() {
  return calculators.map((item) => item.id);
}

function CalculatorCard({
  item,
  isFavorite,
  onToggleFavorite,
  draggable = false,
  onDragStart,
  onDragOver,
  onDrop,
  personalizationEnabled = true,
}: {
  item: CalculatorItem;
  isFavorite: boolean;
  onToggleFavorite: (id: CalculatorId) => void;
  draggable?: boolean;
  onDragStart?: (event: DragEvent<HTMLSpanElement>, id: CalculatorId) => void;
  onDragOver?: (event: DragEvent<HTMLElement>, id: CalculatorId) => void;
  onDrop?: (event: DragEvent<HTMLElement>, id: CalculatorId) => void;
  personalizationEnabled?: boolean;
}) {
  const Icon = item.icon;
  const categoryTitle = categories.find((category) => category.id === item.category)?.title;
  const router = useRouter();

  function handleFavoriteClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    onToggleFavorite(item.id);
  }

  return (
    <article
      onClick={() => router.push(item.href)}
      onDragOver={onDragOver ? (event) => onDragOver(event, item.id) : undefined}
      onDrop={onDrop ? (event) => onDrop(event, item.id) : undefined}
      className={cn(
        "group relative overflow-hidden rounded-[1.75rem] border border-border/70 bg-card/80 p-5 shadow-sm transition hover:-translate-y-1 hover:border-foreground/30 hover:bg-card cursor-pointer",
      )}
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-80", item.gradientClassName)} />
      <div className="absolute inset-0 soft-grain opacity-20" />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/70 bg-background/75 shadow-sm">
          <Icon className="h-5 w-5 text-foreground" />
        </span>

        <div className="flex items-center gap-2">
          {draggable ? (
            <span
              draggable
              onDragStart={onDragStart ? (event) => onDragStart(event, item.id) : undefined}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              className="relative z-20 flex h-9 w-9 cursor-grab items-center justify-center rounded-2xl border border-border/70 bg-background/80 text-muted-foreground active:cursor-grabbing"
            >
              <GripVertical className="h-4 w-4" />
            </span>
          ) : null}

          <button
            type="button"
            onClick={handleFavoriteClick}
            aria-pressed={isFavorite}
            aria-label={isFavorite ? `Remover ${item.title} dos favoritos` : `Adicionar ${item.title} aos favoritos`}
            disabled={!personalizationEnabled}
            className={cn(
              "relative z-20 flex h-9 w-9 items-center justify-center rounded-2xl border transition",
              isFavorite
                ? "border-amber-300/70 bg-amber-50 text-amber-700"
                : "border-border/70 bg-background/80 text-muted-foreground hover:text-foreground",
              !personalizationEnabled && "cursor-not-allowed opacity-50",
            )}
          >
            <Star className={cn("h-4 w-4", isFavorite ? "fill-current" : "")} />
          </button>

          <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-foreground" />
        </div>
      </div>

      <div className="relative z-10 mt-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          {categoryTitle}
        </p>
        <h2 className="mt-2 text-lg font-semibold text-foreground">{item.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
      </div>
    </article>
  );
}

export default function CalculadorasPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<CalculatorId[]>([]);
  const [favoriteOrder, setFavoriteOrder] = useState<CalculatorId[]>([]);
  const [calculatorOrder, setCalculatorOrder] = useState<CalculatorId[]>(buildDefaultOrder);
  const [draggedId, setDraggedId] = useState<CalculatorId | null>(null);
  const [dragContext, setDragContext] = useState<"favorites" | "all" | null>(null);
  const [loadingPreferences, setLoadingPreferences] = useState(true);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadPreferences() {
      setLoadingPreferences(true);
      setErrorMsg(null);

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setUserId(null);
        setLoadingPreferences(false);
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from("user_calculator_preferences")
        .select("favorite_ids, favorite_order, calculator_order")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        setErrorMsg(
          "Nao foi possivel carregar as preferencias das calculadoras. Se a tabela ainda nao existir, corre o SQL desta funcionalidade.",
        );
        setLoadingPreferences(false);
        return;
      }

      const nextFavorites = sanitizeIds(data?.favorite_ids);
      const nextFavoriteOrder = sanitizeIds(data?.favorite_order);
      const nextCalculatorOrder = sanitizeIds(data?.calculator_order);
      const defaultOrder = buildDefaultOrder();

      setFavorites(nextFavorites);
      setFavoriteOrder([
        ...nextFavoriteOrder.filter((id) => nextFavorites.includes(id)),
        ...nextFavorites.filter((id) => !nextFavoriteOrder.includes(id)),
      ]);
      setCalculatorOrder([
        ...nextCalculatorOrder,
        ...defaultOrder.filter((id) => !nextCalculatorOrder.includes(id)),
      ]);
      setLoadingPreferences(false);
    }

    void loadPreferences();
  }, []);

  async function persistPreferences(
    nextFavorites: CalculatorId[],
    nextFavoriteOrder: CalculatorId[],
    nextCalculatorOrder: CalculatorId[],
  ) {
    if (!userId) {
      return;
    }

    setSavingPreferences(true);
    setErrorMsg(null);

    const supabase = createClient();
    const { error } = await supabase.from("user_calculator_preferences").upsert(
      {
        user_id: userId,
        favorite_ids: nextFavorites,
        favorite_order: nextFavoriteOrder,
        calculator_order: nextCalculatorOrder,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

    if (error) {
      setErrorMsg("Nao foi possivel guardar a ordem ou os favoritos das calculadoras.");
    }

    setSavingPreferences(false);
  }

  const favoriteItems = useMemo(() => {
    const items = calculators.filter((item) => favorites.includes(item.id));
    return sortByStoredOrder(items, favoriteOrder);
  }, [favoriteOrder, favorites]);

  const orderedCalculators = useMemo(
    () => sortByStoredOrder(calculators, calculatorOrder),
    [calculatorOrder],
  );

  function handleToggleFavorite(id: CalculatorId) {
    if (!userId) {
      setErrorMsg("Inicia sessao para guardar favoritos e ordem das calculadoras na tua conta.");
      return;
    }

    setFavorites((currentFavorites) => {
      const nextFavorites = toggleFavorite(currentFavorites, id);
      let nextFavoriteOrder: CalculatorId[] = [];

      setFavoriteOrder((currentOrder) => {
        const filtered = currentOrder.filter((item) => nextFavorites.includes(item));
        nextFavoriteOrder =
          nextFavorites.includes(id) && !filtered.includes(id) ? [...filtered, id] : filtered;
        return nextFavoriteOrder;
      });

      void persistPreferences(nextFavorites, nextFavoriteOrder, calculatorOrder);
      return nextFavorites;
    });
  }

  function handleDragStart(
    _event: DragEvent<HTMLSpanElement>,
    id: CalculatorId,
    context: "favorites" | "all",
  ) {
    if (!userId) {
      return;
    }

    setDraggedId(id);
    setDragContext(context);
  }

  function handleDragOver(event: DragEvent<HTMLElement>) {
    event.preventDefault();
  }

  function handleDrop(
    _event: DragEvent<HTMLElement>,
    targetId: CalculatorId,
    context: "favorites" | "all",
  ) {
    if (!draggedId || dragContext !== context || !userId) {
      return;
    }

    if (context === "favorites") {
      const nextFavoriteOrder = moveItem(favoriteOrder, draggedId, targetId);
      setFavoriteOrder(nextFavoriteOrder);
      void persistPreferences(favorites, nextFavoriteOrder, calculatorOrder);
    } else {
      const nextCalculatorOrder = moveItem(calculatorOrder, draggedId, targetId);
      setCalculatorOrder(nextCalculatorOrder);
      void persistPreferences(favorites, favoriteOrder, nextCalculatorOrder);
    }

    setDraggedId(null);
    setDragContext(null);
  }

  return (
    <main className="relative min-h-[calc(100vh-3.5rem)] app-surface">
      <div className="absolute inset-0 hero-surface opacity-70" />
      <div className="absolute inset-0 soft-grain opacity-25" />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-8">
        {loadingPreferences ? (
          <PageLoadingView
            label="A carregar calculadoras"
            detail="A recuperar favoritos e a tua organizacao personalizada."
          />
        ) : (
        <section className="space-y-8">
          <div className="rounded-[2rem] border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="font-display text-2xl font-semibold text-foreground">Favoritos</h1>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {savingPreferences ? (
                  <div className="rounded-2xl border border-border/70 bg-background/70 px-4 py-2 text-sm text-muted-foreground">
                    A guardar...
                  </div>
                ) : null}
                <div className="rounded-2xl border border-border/70 bg-background/70 px-4 py-2 text-sm text-muted-foreground">
                  {favoriteItems.length} favorita{favoriteItems.length === 1 ? "" : "s"}
                </div>
              </div>
            </div>

            {!userId && !loadingPreferences ? (
              <div className="mt-6 rounded-[1.5rem] border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Inicia sessao para guardar favoritos e a ordem personalizada das calculadoras na tua conta.
              </div>
            ) : null}

            {errorMsg ? (
              <div className="mt-6 rounded-[1.5rem] border border-red-300/60 bg-red-50 px-4 py-3 text-sm text-red-900">
                {errorMsg}
              </div>
            ) : null}

            {favoriteItems.length > 0 ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {favoriteItems.map((item) => (
                  <CalculatorCard
                    key={item.id}
                    item={item}
                    isFavorite
                    onToggleFavorite={handleToggleFavorite}
                    draggable={Boolean(userId)}
                    onDragStart={(event, id) => handleDragStart(event, id, "favorites")}
                    onDragOver={(event) => handleDragOver(event)}
                    onDrop={(event, id) => handleDrop(event, id, "favorites")}
                    personalizationEnabled={Boolean(userId)}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-[1.5rem] border border-dashed border-border/70 bg-background/55 p-5 text-sm text-muted-foreground">
                {loadingPreferences
                  ? "A carregar as tuas preferencias..."
                  : "Ainda nao tens favoritas. Clica na estrela de qualquer calculadora para a fixares aqui."}
              </div>
            )}
          </div>

          <section className="rounded-[2rem] border border-border/70 bg-card/70 p-6 shadow-sm backdrop-blur">
            <div className="mb-5">
              <h2 className="font-display text-2xl font-semibold text-foreground">
                Todas as calculadoras
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {orderedCalculators.map((item) => (
                <CalculatorCard
                  key={item.id}
                  item={item}
                  isFavorite={favorites.includes(item.id)}
                  onToggleFavorite={handleToggleFavorite}
                  draggable={Boolean(userId)}
                  onDragStart={(event, id) => handleDragStart(event, id, "all")}
                  onDragOver={(event) => handleDragOver(event)}
                  onDrop={(event, id) => handleDrop(event, id, "all")}
                  personalizationEnabled={Boolean(userId)}
                />
              ))}
            </div>
          </section>
        </section>
        )}
      </div>
    </main>
  );
}
