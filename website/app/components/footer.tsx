export function Footer() {
  return (
    <footer className="border-t-2 border-foreground py-6">
      <div className="mx-auto max-w-3xl px-6 text-center text-sm">
        <p>
          &copy; {new Date().getFullYear()} Arfak. All rights reserved.
          &middot;{" "}
          <a
            href="https://github.com/tianzhou/arfak"
            target="_blank"
            rel="noopener noreferrer"
            className="border-b border-foreground hover:bg-foreground hover:text-background"
          >
            GitHub
          </a>
        </p>
      </div>
    </footer>
  );
}
