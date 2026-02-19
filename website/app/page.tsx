import { Navbar } from "./components/navbar";

function Hero() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-24 text-center md:py-32">
      <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl md:text-6xl dark:text-white">
        Your Open-Source Personal{" "}
        <span className="text-accent">AI Assistant</span>
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
        Arfak is a private, extensible AI assistant you can run anywhere. Built
        in the open, designed to work for you — not the other way around.
      </p>
      <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <a
          href="#"
          className="rounded-full bg-accent px-6 py-3 text-base font-medium text-white transition-colors hover:bg-accent-hover"
        >
          Get Started
        </a>
        <a
          href="https://github.com/ArkFak/arfak"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-zinc-300 px-6 py-3 text-base font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          GitHub
        </a>
      </div>
    </section>
  );
}

const features = [
  {
    title: "Privacy First",
    description:
      "Your data stays yours. Run Arfak locally or on your own infrastructure with full control over your information.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-accent"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: "Extensible",
    description:
      "Build on top of Arfak with plugins and integrations. Connect your tools, services, and workflows.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-accent"
      >
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    title: "Open Source",
    description:
      "Fully open-source and community-driven. Inspect the code, contribute features, and shape the future.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-accent"
      >
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
];

function Features() {
  return (
    <section id="features" className="border-t border-zinc-200 bg-zinc-50 py-20 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Everything you need
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-zinc-600 dark:text-zinc-400">
          A personal AI assistant that respects your privacy and adapts to your
          workflow.
        </p>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-zinc-200 py-8 dark:border-zinc-800">
      <div className="mx-auto max-w-5xl px-6 text-center text-sm text-zinc-500 dark:text-zinc-500">
        <p>
          &copy; {new Date().getFullYear()} Arfak. All rights reserved. &middot;{" "}
          <a
            href="https://github.com/ArkFak/arfak"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-zinc-900 dark:hover:text-white"
          >
            GitHub
          </a>
        </p>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <Footer />
    </div>
  );
}
