import { signIn, signOut, useSession } from "next-auth/react";

const AuthShowcase: React.FC = () => {
  const { data: sessionData } = useSession();

  return (
    <div className="flex items-center gap-3 p-3">
      <p className="text-center text-lg">
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
      </p>
      <button
        className="rounded-full px-10 py-3 font-semibold no-underline transition hover:bg-black/10"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
};

export default AuthShowcase;
