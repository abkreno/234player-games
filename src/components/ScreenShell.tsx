import type { PropsWithChildren } from 'react';

type ScreenShellProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
  subtitle?: string;
}>;

export function ScreenShell({ eyebrow, title, subtitle, children }: ScreenShellProps) {
  return (
    <main className="screen-shell">
      <header className="screen-header">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {subtitle ? <p className="subtitle">{subtitle}</p> : null}
      </header>
      {children}
    </main>
  );
}
