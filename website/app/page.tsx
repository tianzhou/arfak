import { Navbar } from "./components/navbar";
import { MacWindow } from "./components/mac-window";
import { Footer } from "./components/footer";

function Hero() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16 md:py-24">
      <MacWindow title="Welcome to Arfak">
        <div className="px-8 py-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Your Open-Source Personal AI Assistant
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-7">
            Arfak is a private, extensible AI assistant you can run anywhere.
            Built in the open, designed to work for you — not the other way
            around.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#"
              className="border-[3px] border-foreground bg-foreground px-6 py-2.5 text-base font-bold text-background hover:bg-background hover:text-foreground"
            >
              Get Started
            </a>
            <a
              href="https://github.com/tianzhou/arfak"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-foreground px-6 py-2.5 text-base font-medium hover:bg-foreground hover:text-background"
            >
              GitHub
            </a>
          </div>
        </div>
      </MacWindow>
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
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
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
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
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
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
];

function Features() {
  return (
    <section id="features" className="py-16">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-center text-2xl font-bold tracking-tight">
          Everything you need
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-base">
          A personal AI assistant that respects your privacy and adapts to your
          workflow.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="border-2 border-foreground bg-background p-5 shadow-[2px_2px_0_0_var(--foreground)]"
            >
              <div className="mb-3 flex h-8 w-8 items-center justify-center border border-foreground">
                {feature.icon}
              </div>
              <h3 className="text-base font-bold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
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
