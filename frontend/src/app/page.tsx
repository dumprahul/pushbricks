import Image from "next/image";
import Link from "next/link";
import pushChain from "../../public/push-chain.png"
import Footer from "../components/footer";
import SiteHeader from "@/components/header";

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      {/* Hero */}
      <section className="rounded-none border-2 border-border bg-white p-8 shadow-[6px_6px_0_var(--color-primary)] md:p-12">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <div className="inline-block mb-4 rounded-none border-2 border-border bg-[var(--color-accent)] px-3 py-1 text-xs font-black uppercase tracking-wider">
              Real-World Assets on Push Chain
            </div>
            <h1 className="text-pretty text-4xl font-extrabold leading-tight md:text-5xl lg:text-6xl">
              Tokenize. Lease. Borrow.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed opacity-90">
              Turn property into programmable tokens with automated leasing, transparent auctions, and verifiable settlement.
            </p>
            <div className="mt-6 lg:hidden inline-flex items-center gap-2 text-sm">
              <span className="font-bold opacity-70">Powered by</span>
              {/* <span className="font-extrabold text-[var(--color-secondary)]">Push Chain</span> */}
              <Image src={pushChain} alt="Push Chain" width={100} height={100} />
            </div>
            <div className="mt-6 lg:mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="#get-started"
                className="inline-flex items-center justify-center rounded-none border-2 border-border bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-white shadow-[4px_4px_0_var(--color-border)] transition-all active:translate-y-[2px] active:shadow-[2px_2px_0_var(--color-border)] hover:translate-y-[2px] hover:shadow-[2px_2px_0_var(--color-border)]"
              >
                Launch App
              </Link>
              <Link
                href="/marketplace"
                className="inline-flex items-center justify-center rounded-none border-2 border-border bg-white px-6 py-3 text-sm font-bold text-foreground transition-colors hover:bg-[var(--color-secondary)] hover:text-white"
              >
                Explore Properties
              </Link>
            </div>
          </div>
          <div className="hidden lg:block rounded-none border-2 border-border bg-[var(--color-secondary)]/60 p-4 shadow-[4px_4px_0_var(--color-border)]">
            <div className="text-sm font-bold text-white">Powered by</div>
            {/* <div className="mt-1 text-xl font-extrabold text-[var(--color-accent)]">Push Chain</div> */}
            <Image src={pushChain} alt="Push Chain" width={100} height={100} className="mt-1" />

          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mt-12">
        <h3 className="text-xl font-extrabold">Features</h3>
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Tokenize Assets",
              desc: "Mint compliant property tokens that represent ownership or revenue share.",
            },
            {
              title: "Lease & Borrow",
              desc: "Smart contracts for leasing flows and collateralized borrowing.",
            },
            {
              title: "Dutch Auctions",
              desc: "On-chain price discovery with transparent participation and settlement.",
            },
            {
              title: "Push Notifications",
              desc: "Protocol-native alerts for bids, leases, repayments, and expirations.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-none border-2 border-border bg-white p-5 shadow-[6px_6px_0_var(--color-primary)]"
            >
              <div className="mb-2 inline-block rounded-none border-2 border-border bg-[var(--color-accent)] px-2 py-1 text-xs font-black">
                {f.title}
              </div>
              <p className="text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="mt-14">
        <h3 className="text-xl font-extrabold">How It Works</h3>
        <ol className="mt-6 grid gap-6 md:grid-cols-3">
          {[
            {
              n: "01",
              title: "Tokenize",
              desc: "Define property, compliance rules, and mint tokens for ownership or yield claims.",
            },
            {
              n: "02",
              title: "List",
              desc: "Open leasing or Dutch auction flows with on-chain rules and notifications.",
            },
            {
              n: "03",
              title: "Settle",
              desc: "Execute trust-minimized settlement and track income streams programmatically.",
            },
          ].map((s) => (
            <li
              key={s.n}
              className="rounded-none border-2 border-border bg-white p-5 shadow-[6px_6px_0_var(--color-primary)]"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-none border-2 border-border bg-[var(--color-accent)] px-3 py-2 text-sm font-extrabold">
                  {s.n}
                </div>
                <div>
                  <h4 className="text-base font-extrabold">{s.title}</h4>
                  <p className="mt-1 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* CTA */}
      <section
        id="get-started"
        className="mt-14 rounded-none border-2 border-border bg-white p-6 shadow-[6px_6px_0_var(--color-primary)] md:p-10"
      >
        <div className="grid items-center gap-4 md:grid-cols-3">
          <h3 className="md:col-span-2 text-pretty text-2xl font-extrabold">
            Own your first on-chain real estate today.
          </h3>
          <div className="flex md:justify-end">
            <Link
              href="#"
              className="inline-flex items-center justify-center rounded-none border-2 border-border bg-[var(--color-accent)] px-5 py-3 text-sm font-black text-foreground shadow-[4px_4px_0_var(--color-primary)] transition-all active:translate-y-[2px] active:shadow-[2px_2px_0_var(--color-primary)] hover:shadow-[2px_2px_0_var(--color-border)] hover:translate-y-[2px]"
              aria-label="Get Started"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
      </main>
    </>
  )
}
