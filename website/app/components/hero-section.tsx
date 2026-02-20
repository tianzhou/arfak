"use client";

import { useRef } from "react";
import { DitheredLandscape } from "./dithered-landscape";
import { MacWindow } from "./mac-window";

export function HeroSection() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const onMouseMove = () => {
    wrapperRef.current?.classList.add("birds-active");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      wrapperRef.current?.classList.remove("birds-active");
    }, 500);
  };

  const onMouseLeave = () => {
    clearTimeout(timer.current);
    wrapperRef.current?.classList.remove("birds-active");
  };

  return (
    <div
      ref={wrapperRef}
      className="relative overflow-hidden"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <DitheredLandscape />
      <section className="relative z-10 mx-auto max-w-3xl px-6 py-16 md:py-24">
        <MacWindow title="Welcome to Arfak">
          <div className="px-8 py-10 text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Open-Source Personal AI Assistant for You
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base leading-7">
              Arfak is a private, extensible AI assistant you can run anywhere.
              Built in the open, designed to work for you — not the other way
              around.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="#"
                className="border-[3px] border-accent bg-accent px-6 py-2.5 text-base font-bold text-white shadow-[3px_3px_0_0_var(--foreground)] hover:bg-background hover:text-accent"
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
    </div>
  );
}
