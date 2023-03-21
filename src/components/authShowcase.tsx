import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

const AuthShowcase: React.FC = () => {
  const { data: sessionData } = useSession();

  return (
    <div className="flex items-center gap-3 p-3">
      <Link href={`/user`}>
        <p className="text-center text-lg">
          {sessionData && <span>{sessionData.user?.name}</span>}
        </p>
      </Link>
      <button
        className="ml-3 border border-black px-2 no-underline transition hover:bg-black/10"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
};

export default AuthShowcase;
