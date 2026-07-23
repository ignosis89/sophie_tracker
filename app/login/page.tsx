'use client';

import { useActionState } from 'react';
import { loginAction, type LoginState } from '@/lib/actions';

const initialState: LoginState = {};

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <form
        action={action}
        className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Sophie&apos;s Grade Tracker</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Enter the password to continue.</p>

        <input
          type="password"
          name="password"
          required
          autoFocus
          placeholder="Password"
          className="mt-6 w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:text-zinc-50 dark:focus:ring-zinc-100"
        />

        {state.error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="mt-4 w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
        >
          {pending ? 'Checking…' : 'Enter'}
        </button>
      </form>
    </div>
  );
}
