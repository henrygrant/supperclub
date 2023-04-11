import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Layout from "~/components/layout";
import { api } from "~/utils/api";
import { useState } from "react";
import { Dancing_Script } from "next/font/google";
import { formatDateTime } from "~/utils/date";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: "400",
  style: "normal",
});

const Group: NextPage = () => {
  const router = useRouter();
  let { groupId } = router.query;
  if (Array.isArray(groupId)) {
    groupId = groupId.join("");
  }
  const { data: groupInfo, isLoading } = api.group.getOneById.useQuery(
    {
      groupId: groupId as string,
    },
    { enabled: !!groupId }
  );

  const rollEvents = api.group.getRollEvents.useQuery({
    groupId: groupId as string,
  });

  if (isLoading) return <div>Loading...</div>;
  if (!groupId || !groupInfo) return <div>No group found</div>;

  return (
    <Layout>
      <div className="flex h-screen">
        <div className="m-auto">
          <h1 className="mx-2 text-center">
            <span
              className={`${dancingScript.className} block text-6xl lg:text-9xl`}
            >
              {groupInfo.name}
            </span>
            {rollEvents?.data?.length ? (
              <>
                <span className={`${dancingScript.className} block text-4xl`}>
                  is going to
                </span>
                <span
                  className={`${dancingScript.className} text-center text-6xl lg:text-9xl`}
                >
                  {rollEvents.data[0]?.winningSuggestion}
                </span>
              </>
            ) : (
              <></>
            )}
          </h1>
          <div className="my-5 flex justify-center">
            <RollTheDice groupId={groupId} />
          </div>
          {/* <AdminControls /> */}
          <div className="mx-3 flex flex-col">
            <ManageSuggestion groupId={groupId} />
            <CodeGenerator groupId={groupId} />
            <MemberList groupId={groupId} />
            <History groupId={groupId} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Group;

const History: React.FC<{ groupId: string }> = ({ groupId }) => {
  const rollEvents = api.group.getRollEvents.useQuery({
    groupId: groupId,
  });
  return (
    <div className="mb-3 justify-center border border-black p-3">
      <h2 className={`${dancingScript.className} text-2xl`}>History:</h2>
      <table className="w-full">
        {rollEvents?.data?.map((rollEvent) => (
          <tr key={rollEvent.id}>
            <td>{rollEvent.winningSuggestion}</td>
            <td>{rollEvent.user.name}</td>
            <td>{formatDateTime(rollEvent.dttmCreated)}</td>
          </tr>
        ))}
      </table>
    </div>
  );
};

const RollTheDice: React.FC<{ groupId: string }> = ({ groupId }) => {
  const utils = api.useContext();
  const { data: sessionData } = useSession();
  const group = api.group.getOneById.useQuery({
    groupId,
  });
  const rollTheDice = api.group.rollTheDice.useMutation({
    onSettled: async () => {
      await utils.group.getRollEvents.invalidate();
      await utils.group.getOneById.invalidate();
    },
  });
  return (
    <button
      onClick={(event) => {
        event.preventDefault();
        rollTheDice.mutate({ groupId });
      }}
      disabled={rollTheDice.isLoading}
      className="ml-3 border border-black px-2 no-underline transition hover:bg-black/10"
      // disabled={
      //   !sessionData?.user.isAdmin &&
      //   group?.data?.ownerUserId !== sessionData?.user.id
      // }
    >
      Roll Away!
    </button>
  );
};

const ManageSuggestion: React.FC<{ groupId: string }> = ({ groupId }) => {
  const utils = api.useContext();

  const group = api.group.getOneById.useQuery({
    groupId,
  });
  const { data: sessionData } = useSession();
  const putSuggestion = api.group.putSuggestion.useMutation({
    onSettled: async () => {
      await utils.group.getOneById.invalidate();
    },
  });
  const myCurrentSuggestion = () => {
    const me = group.data?.users.find((u) => u.userId === sessionData?.user.id);
    return me?.suggestion;
  };
  const [tempSuggestion, setTempSuggestion] = useState("");

  return (
    <div className="mb-3 justify-center border border-black p-3">
      <h2 className={`${dancingScript.className} text-2xl`}>
        Your Current Suggestion:
      </h2>
      {myCurrentSuggestion() ? (
        <div className="flex items-center justify-between">
          <div className="mt-1">{myCurrentSuggestion()}</div>
          <button
            onClick={(event) => {
              event.preventDefault();
              setTempSuggestion("");
              group.data &&
                putSuggestion.mutate({
                  suggestion: null,
                  groupId: group.data.id,
                });
            }}
            className="ml-3 border border-black px-2 no-underline transition hover:bg-black/10"
          >
            Reset
          </button>
        </div>
      ) : (
        <form
          className="flex items-center justify-between"
          onSubmit={(event) => {
            event.preventDefault();
            group.data &&
              putSuggestion.mutate({
                suggestion: tempSuggestion,
                groupId: group.data.id,
              });
            setTempSuggestion("");
          }}
        >
          <input
            type="text"
            className="mt-1 border border-black pl-2"
            placeholder="restaurant suggestion"
            minLength={2}
            maxLength={36}
            value={tempSuggestion}
            onChange={(event) => setTempSuggestion(event.target.value)}
          />
          <button
            disabled={!tempSuggestion}
            type="submit"
            className="ml-3 border border-black px-2 no-underline transition hover:bg-black/10"
          >
            Submit
          </button>
        </form>
      )}
    </div>
  );
};

const MemberList: React.FC<{ groupId: string }> = ({ groupId }) => {
  const group = api.group.getOneById.useQuery({
    groupId,
  });
  return (
    <div className="mb-3 border border-black p-3">
      <h2 className={`${dancingScript.className} text-2xl`}>Members:</h2>
      {group.data &&
        group.data.users.map((groupuser) => (
          <div key={groupuser.user.id} className="grid grid-cols-10 gap-2">
            <div className="col-span-5 flex">
              <div>{groupuser.user.name}</div>
              {group.data?.ownerUserId === groupuser.user.id && (
                <div className="ml-1">{"<O>"}</div>
              )}
              {groupuser.isAdmin && <div className="ml-1">{" <A> "}</div>}
            </div>
            <div className="col-span-4 text-center">
              {groupuser.suggestion || "no suggestion set"}
            </div>
            <div className="col-span-1 text-center">{groupuser.points}</div>
          </div>
        ))}
    </div>
  );
};

const CodeGenerator: React.FC<{ groupId: string }> = ({ groupId }) => {
  const utils = api.useContext();
  const generateCodeForGroup = api.group.generateCodeForGroup.useMutation({
    onSettled: async () => {
      await utils.group.getOneById.invalidate();
    },
  });
  const group = api.group.getOneById.useQuery({
    groupId: groupId,
  });
  const shareUrl = (code: string) => {
    return `${window.location.origin}/invite/${code}`;
  };
  return (
    <div className="mb-3 gap-3 border border-black p-3">
      <div>
        <h2 className={`${dancingScript.className} text-2xl`}>Share:</h2>
        {group?.data?.shareCode ? (
          <div>
            <p>{shareUrl(group.data.shareCode)}</p>
          </div>
        ) : (
          <div>
            <button
              onClick={() => {
                generateCodeForGroup.mutate({ groupId: groupId });
              }}
            >
              Generate a Share Link
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
