import { logoutAction } from '@/lib/actions';

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button type="submit" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50">
        Log out
      </button>
    </form>
  );
}
