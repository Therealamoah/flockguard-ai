import { Link } from 'react-router-dom';
import { ClipboardList, Sparkles, ShieldCheck, Bell, Lightbulb, ArrowRight } from 'lucide-react';
import PlanCard from '../../components/PlanCard';
import { PLAN_TIERS } from '../../data/plans';

const LOOP_STEPS = [
  {
    icon: ClipboardList,
    tone: 'text-brand-500 bg-mint-100',
    title: 'Monitor',
    body: 'Staff log feed, water, mortality, egg production or weight gain, temperature, humidity, and behavior every day.',
  },
  {
    icon: Sparkles,
    tone: 'text-warning-ink bg-warning-bg',
    title: 'Detect',
    body: 'Pattern detection compares each entry against the flock\'s own baseline and flags what looks unusual.',
  },
  {
    icon: ShieldCheck,
    tone: 'text-ink-soft bg-surface',
    title: 'Verify',
    body: 'A flagged reading is never assumed true — a manager confirms or dismisses it, with photo or video evidence if needed.',
  },
  {
    icon: Bell,
    tone: 'text-critical-ink bg-critical-bg',
    title: 'Alert',
    body: 'Confirmed issues become alerts immediately, so you find out in hours, not after a week of declining numbers.',
  },
  {
    icon: Lightbulb,
    tone: 'text-brand-500 bg-mint-100',
    title: 'Guide',
    body: 'Every alert comes with a recommended next step — what to check, and who to call.',
  },
];

const BENEFITS = [
  {
    title: 'Days of warning, not hindsight',
    body: 'Small deviations in feed or mortality show up long before a house-wide outbreak does. FlockGuard surfaces them the same day.',
  },
  {
    title: 'Built for the people in the houses',
    body: 'Daily logging takes under a minute per flock — designed for staff on the floor, not spreadsheets at a desk.',
  },
  {
    title: 'Verification keeps trust high',
    body: 'Every flagged pattern is confirmed by a person before it becomes an alert, so the system stays useful instead of noisy.',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-6 py-4">
          <span className="text-lg font-semibold tracking-tight text-ink">FlockGuard</span>
          <nav className="hidden items-center gap-6 text-sm font-medium text-ink-soft sm:flex">
            <a href="#how-it-works" className="hover:text-ink">
              How it works
            </a>
            <a href="#benefits" className="hover:text-ink">
              Why FlockGuard
            </a>
            <a href="#pricing" className="hover:text-ink">
              Pricing
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-ink-soft hover:text-ink">
              Log in
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[1180px] px-6 py-20 text-center">
        <span className="inline-block rounded-full bg-mint-100 px-3 py-1 text-xs font-medium text-brand-500">
          AI-powered flock health early warning
        </span>
        <h1 className="mx-auto mt-5 max-w-2xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          Catch flock health problems before they spread
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-ink-soft">
          FlockGuard watches your daily feed, water, mortality, and production logs, flags unusual
          patterns, and alerts your team early enough to act.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            to="/register"
            className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
          >
            Get started free
            <ArrowRight size={15} />
          </Link>
          <a
            href="#how-it-works"
            className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-ink-soft hover:bg-card"
          >
            See how it works
          </a>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-[1180px] px-6 py-16">
        <h2 className="text-center text-2xl font-semibold tracking-tight text-ink">
          A simple loop, run every day
        </h2>
        <p className="mx-auto mt-2 max-w-md text-center text-sm text-ink-soft">
          Five steps take a routine daily log all the way to a confirmed alert with a recommended
          next step.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {LOOP_STEPS.map((step, i) => (
            <div key={step.title} className="rounded-2xl border border-border bg-card px-5 py-5">
              <div className={`flex h-9 w-9 items-center justify-center rounded-full ${step.tone}`}>
                <step.icon size={17} />
              </div>
              <div className="mt-3 text-xs font-medium text-ink-muted">Step {i + 1}</div>
              <div className="text-base font-semibold text-ink">{step.title}</div>
              <p className="mt-1.5 text-sm text-ink-soft">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="benefits" className="mx-auto max-w-[1180px] px-6 py-16">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {BENEFITS.map((b) => (
            <div key={b.title}>
              <div className="text-base font-semibold text-ink">{b.title}</div>
              <p className="mt-1.5 text-sm text-ink-soft">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-[1180px] px-6 py-16">
        <h2 className="text-center text-2xl font-semibold tracking-tight text-ink">
          Plans that grow with your farm
        </h2>
        <p className="mx-auto mt-2 max-w-md text-center text-sm text-ink-soft">
          Start free on a couple of flocks. Upgrade whenever you're ready for the full loop.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {PLAN_TIERS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              ctaHref="/register"
              ctaLabel={plan.price === 0 ? 'Get started free' : `Start with ${plan.name}`}
            />
          ))}
        </div>
      </section>

      <section className="bg-brand-950 py-16">
        <div className="mx-auto max-w-[1180px] px-6 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            Ready to protect your flock?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/70">
            Set up your farm in minutes and start logging today's numbers right away.
          </p>
          <Link
            to="/register"
            className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-400"
          >
            Get started free
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto flex max-w-[1180px] flex-col items-center justify-between gap-3 text-xs text-ink-muted sm:flex-row">
          <span>© 2026 FlockGuard. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-ink-soft">
              Log in
            </Link>
            <Link to="/register" className="hover:text-ink-soft">
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
