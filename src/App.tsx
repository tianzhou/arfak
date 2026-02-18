import Stack from '@nkzw/stack';
import { AnchorHTMLAttributes } from 'react';
import { LinkProps, Link as ReactRouterLink, Route, Routes } from 'react-router';
import AuthClient from './user/AuthClient.tsx';
import SignIn from './user/SignIn.tsx';

const Link = ({ className, ...props }: LinkProps & AnchorHTMLAttributes<HTMLAnchorElement>) => (
  <ReactRouterLink
    className={
      'text-pink-700 underline hover:no-underline dark:text-pink-400' +
      (className ? ` ${className}` : '')
    }
    {...props}
  />
);

const Home = () => {
  const { data: session } = AuthClient.useSession();

  return (
    <div className="m-6 mx-auto w-8/12 rounded-2xl border border-gray-200 p-4 shadow-md dark:border-neutral-600 dark:bg-neutral-800 dark:shadow-none">
      <h1 className="text-4xl">Welcome</h1>
      <p className="my-4">
        <em>Minimal, fast, sensible defaults.</em>
      </p>
      <p className="my-4">
        Using{' '}
        <Link key="vite" target="_blank" to="https://vitejs.dev/">
          Vite
        </Link>
        ,{' '}
        <Link key="react" target="_blank" to="https://reactjs.org/">
          React
        </Link>
        ,{' '}
        <Link key="typescript" target="_blank" to="https://www.typescriptlang.org/">
          TypeScript
        </Link>
        ,{' '}
        <Link key="tailwind" target="_blank" to="https://tailwindcss.com/">
          Tailwind
        </Link>
        , and{' '}
        <Link key="better-auth" target="_blank" to="https://www.better-auth.com/">
          Better Auth
        </Link>
        .
      </p>
      <p className="my-4">
        Change{' '}
        <code className="rounded-sm border border-pink-700 bg-neutral-100 px-1 py-1 font-mono text-pink-700 dark:border-pink-400 dark:bg-neutral-700 dark:text-pink-400">
          src/App.tsx
        </code>{' '}
        for live updates.
      </p>
      <div>
        {session ? (
          <Stack gap={12} vertical>
            <div>Hello, {session.user.name}</div>
            <div>
              <a
                className="text-pink-700 dark:border-pink-400"
                onClick={() => AuthClient.signOut()}
              >
                Logout
              </a>
            </div>
          </Stack>
        ) : (
          <SignIn />
        )}
      </div>
      <p className="my-4">
        <Link to="/about">About this template</Link>
      </p>
    </div>
  );
};

const About = () => (
  <div className="m-6 mx-auto w-8/12 rounded-sm border border-gray-200 p-4 shadow-md dark:border-neutral-600 dark:bg-neutral-800 dark:shadow-none">
    <h1 className="text-4xl">About</h1>
    <p className="my-4">🤘</p>
    <p className="my-4">
      <Link to="/">Home</Link>
    </p>
  </div>
);

export default function App() {
  return (
    <Routes>
      <Route element={<Home />} path="/" />
      <Route element={<About />} path="/about" />
    </Routes>
  );
}
