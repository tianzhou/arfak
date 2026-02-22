import { Footer } from './components/footer';
import { HeroSection } from './components/hero-section';
import { Navbar } from './components/navbar';

const features = [
  {
    title: 'Talk to Agents, Not Humans',
    description:
      'No support tickets, no waiting rooms. Your AI agents handle everything — schedule, research, draft, and execute on your behalf around the clock.',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <circle cx="9" cy="10" r="1" fill="currentColor" />
        <circle cx="15" cy="10" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: 'Privacy First',
    description:
      'Your data stays yours. Run Arfak locally or on your own infrastructure with full control over your information.',
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
    title: 'Open Source',
    description:
      'Fully open-source and community-driven. Inspect the code, contribute features, and shape the future.',
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
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="text-center text-2xl font-bold tracking-tight">Everything you need</h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-base">
          A personal AI assistant that respects your privacy and adapts to your workflow.
        </p>
        {/* Bento box — outer border is the box, gap reveals foreground as dividers */}
        <div className="mt-10 overflow-hidden border-3 border-foreground bg-foreground shadow-[4px_4px_0_0_var(--foreground)]">
          <div className="grid grid-cols-1 gap-[3px] sm:grid-cols-5 sm:grid-rows-2">
            {/* Large cell — spans 3 of 5 columns, both rows */}
            <div className="flex flex-col justify-center bg-background p-8 sm:col-span-3 sm:row-span-2">
              <div className="mb-5 flex h-12 w-12 items-center justify-center border-2 border-foreground">
                {features[0].icon}
              </div>
              <h3 className="text-xl font-bold">{features[0].title}</h3>
              <p className="mt-3 text-sm leading-7">{features[0].description}</p>
            </div>
            {/* Small cell — top right */}
            <div className="flex flex-col justify-center bg-background p-5 sm:col-span-2">
              <div className="mb-3 flex h-8 w-8 items-center justify-center border border-foreground">
                {features[1].icon}
              </div>
              <h3 className="text-base font-bold">{features[1].title}</h3>
              <p className="mt-2 text-sm leading-6">{features[1].description}</p>
            </div>
            {/* Small cell — bottom right */}
            <div className="flex flex-col justify-center bg-background p-5 sm:col-span-2">
              <div className="mb-3 flex h-8 w-8 items-center justify-center border border-foreground">
                {features[2].icon}
              </div>
              <h3 className="text-base font-bold">{features[2].title}</h3>
              <p className="mt-2 text-sm leading-6">{features[2].description}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <Features />
      <Footer />
    </div>
  );
}
