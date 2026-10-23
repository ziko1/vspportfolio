import { createResource, createSignal, Show } from "solid-js";
import { getProbe } from "./api";

const labels = {
  uk: {
    eyebrow: "ТЕХНІЧНИЙ ПІЛОТ · НЕ PRODUCTION",
    title: "Швидкий стек. Без втрати функцій.",
    body: "SolidJS і Rust/Axum працюють окремо від чинного Gatsby-сайту. Жодний старий маршрут або база даних не змінені.",
    api: "Відповідь Axum API",
    db: "Готовність PostgreSQL",
    checking: "Перевіряємо…",
    ok: "Доступний",
    down: "Недоступний",
    retry: "Перевірити знову",
    detail: "Без підключеної тестової БД очікується HTTP 503. Це захист, а не збій сайту.",
    next: "Далі: інвентаризація маршрутів, CMS, форм і контроль сумісності перед поступовим перенесенням."
  },
  en: {
    eyebrow: "TECHNICAL PILOT · NOT PRODUCTION",
    title: "Faster stack. No lost features.",
    body: "SolidJS and Rust/Axum run alongside the existing Gatsby website. Existing routes and databases are untouched.",
    api: "Axum API response",
    db: "PostgreSQL readiness",
    checking: "Checking…",
    ok: "Available",
    down: "Unavailable",
    retry: "Check again",
    detail: "HTTP 503 is expected without a dedicated test database. This is fail-closed behavior, not a site failure.",
    next: "Next: inventory routes, CMS and forms, then verify parity before gradually switching traffic."
  }
} as const;

export function App() {
  const [lang, setLang] = createSignal<"uk" | "en">("uk");
  const [health, { refetch: refreshHealth }] = createResource(() => getProbe("/api/migration/health"));
  const [ready, { refetch: refreshReady }] = createResource(() => getProbe("/api/migration/ready"));
  const t = () => labels[lang()];

  function refresh() {
    void refreshHealth();
    void refreshReady();
  }

  return (
    <main class="min-h-dvh bg-[#0b1220] px-4 py-10 text-slate-100 sm:px-8 lg:py-20">
      <div class="mx-auto max-w-5xl">
        <header class="mb-20 flex items-center justify-between gap-5">
          <a class="text-base font-extrabold tracking-widest text-white" href="/" aria-label="Pilot home">
            VSP<span class="text-cyan-400"> / LAB</span>
          </a>
          <div role="group" aria-label="Language" class="inline-flex gap-1 rounded-full border border-slate-700 bg-slate-900 p-1">
            <button type="button" aria-pressed={lang() === "uk"} class="rounded-full px-4 py-2 text-sm font-semibold transition-colors hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400" classList={{ "bg-slate-700": lang() === "uk" }} onClick={() => setLang("uk")}>УК</button>
            <button type="button" aria-pressed={lang() === "en"} class="rounded-full px-4 py-2 text-sm font-semibold transition-colors hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400" classList={{ "bg-slate-700": lang() === "en" }} onClick={() => setLang("en")}>EN</button>
          </div>
        </header>

        <section aria-labelledby="pilot-heading" class="max-w-3xl">
          <p class="mb-5 text-xs font-bold uppercase tracking-[0.23em] text-cyan-300">{t().eyebrow}</p>
          <h1 id="pilot-heading" class="text-4xl font-bold leading-tight tracking-tight sm:text-6xl">{t().title}</h1>
          <p class="mt-7 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">{t().body}</p>
        </section>

        <section aria-label="Service status" class="mt-14 grid gap-5 sm:grid-cols-2">
          <article class="rounded-3xl border border-slate-700/80 bg-slate-900/70 p-7 shadow-xl shadow-black/10">
            <p class="text-sm font-medium text-slate-400">{t().api}</p>
            <div class="mt-5 flex items-center gap-3">
              <span class="h-3 w-3 rounded-full" classList={{ "bg-emerald-400": health()?.ok === true, "bg-amber-400": health()?.ok !== true }} aria-hidden="true" />
              <strong class="text-2xl">
                <Show when={!health.loading} fallback={t().checking}>
                  {health()?.ok ? t().ok : t().down}
                </Show>
              </strong>
            </div>
            <Show when={health.error}>
              <p class="mt-4 text-sm text-amber-300" role="alert">{t().down}</p>
            </Show>
          </article>
          <article class="rounded-3xl border border-slate-700/80 bg-slate-900/70 p-7 shadow-xl shadow-black/10">
            <p class="text-sm font-medium text-slate-400">{t().db}</p>
            <div class="mt-5 flex items-center gap-3">
              <span class="h-3 w-3 rounded-full" classList={{ "bg-emerald-400": ready()?.ok === true, "bg-amber-400": ready()?.ok !== true }} aria-hidden="true" />
              <strong class="text-2xl">
                <Show when={!ready.loading} fallback={t().checking}>
                  {ready()?.ok ? t().ok : t().down}
                </Show>
              </strong>
            </div>
            <Show when={ready.error}>
              <p class="mt-4 text-sm text-amber-300" role="alert">{t().down}</p>
            </Show>
          </article>
        </section>

        <div class="mt-8 flex flex-wrap items-center gap-5">
          <button type="button" class="rounded-full bg-cyan-400 px-6 py-3 font-bold text-slate-950 transition hover:bg-cyan-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-400" onClick={refresh}>
            {t().retry}
          </button>
          <p class="max-w-xl text-sm leading-relaxed text-slate-400">{t().detail}</p>
        </div>
        <footer class="mt-16 border-t border-slate-700/70 pt-7 text-sm text-slate-400">{t().next}</footer>
      </div>
    </main>
  );
}

