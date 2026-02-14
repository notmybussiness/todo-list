import { signOut } from "@/app/actions/auth";

export function LogoutForm() {
  return (
    <form action={signOut} className="auth-actions">
      <button type="submit" className="action-btn logout-btn">
        로그아웃
      </button>
    </form>
  );
}
