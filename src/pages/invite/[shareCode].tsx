import { type NextPage } from "next";
import { useRouter } from "next/router";
import { signIn, useSession } from "next-auth/react";
import Layout from "~/components/layout";
import { api } from "~/utils/api";
import { useState, useEffect } from "react";

const InviteLanding: NextPage = () => {
  const putNewMember = api.group.putNewMember.useMutation();
  const { data: sessionData } = useSession();
  const router = useRouter();
  let { shareCode } = router.query;
  if (Array.isArray(shareCode)) {
    shareCode = shareCode.join("");
  }
  const [name, setName] = useState(sessionData?.user.name || "");
  const { data: groupInfo, isLoading } = api.group.getOneByShareCode.useQuery(
    {
      shareCode: shareCode as string,
    },
    { enabled: !!shareCode }
  );
  if (!shareCode) return <div>Invalid Link</div>;
  if (isLoading) return <div>Loading...</div>;
  if (!groupInfo) return <div>Invalid Link</div>;

  const joinPostAuth = async () => {
    putNewMember.mutate({
      groupId: groupInfo.id,
      name: name ? name : undefined,
    });
    await router.replace(`/groups/${groupInfo.id}`);
  };

  return (
    <div className="flex h-screen">
      <div className="m-auto">
        <h1 className="mb-4 text-center text-xl">{`${"You've been invited to "}${
          groupInfo.name
        }`}</h1>
        <div className="flex justify-center">
          {sessionData ? (
            <div className="flex flex-col">
              <div className="flex">
                <label htmlFor="name_input">Your Name</label>
                <input
                  id="name_input"
                  type="text"
                  className="mb-2 ml-3 border-2 border-black pl-2"
                  placeholder="Richard Johnson"
                  minLength={2}
                  maxLength={36}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
              <button
                className="mx-auto border border-black px-2 no-underline transition hover:bg-black/10"
                onClick={(event) => {
                  event.preventDefault();
                  const join = putNewMember
                    .mutateAsync({
                      groupId: groupInfo.id,
                      name: name ? name : undefined,
                    })
                    .then(() => {
                      void router.replace(`/groups/${groupInfo.id}`);
                    });
                }}
                disabled={!name}
              >
                Join!
              </button>
            </div>
          ) : (
            <button
              className="border border-black px-2 no-underline transition hover:bg-black/10"
              onClick={() => void signIn()}
            >
              {"Sign up and join!"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InviteLanding;
