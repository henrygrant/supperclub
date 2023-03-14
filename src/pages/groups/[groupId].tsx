import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Layout from "~/components/layout";
import { api } from "~/utils/api";
import { useState, useEffect } from "react";

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

  if (isLoading) return <div>Loading...</div>;
  if (!groupId || !groupInfo) return <div>No group found</div>;
  if (!groupInfo) return <div>No group found</div>;

  return (
    <Layout>
      <div className="flex h-screen">
        <div className="m-auto">
          <h1 className="mb-4 text-center text-xl">{groupInfo.name}</h1>

          {/* <AdminControls /> */}
          <div className="flex w-full gap-2">
            <ManageSuggestion groupId={groupId} />
            <MemberList groupId={groupId} />
            <CodeGenerator groupId={groupId} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Group;

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
    <div className="flex flex-grow justify-center border p-3">
      {myCurrentSuggestion() ? (
        <div className="flex items-center">
          <h2 className="text-lg">
            Current Suggestion: {myCurrentSuggestion()}
          </h2>
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
            className="rounded-full px-10 py-3 font-semibold no-underline transition hover:bg-black/10"
          >
            Reset
          </button>
        </div>
      ) : (
        <form
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
            className="border-2 border-black"
            placeholder="restaurant suggestion"
            minLength={2}
            maxLength={36}
            value={tempSuggestion}
            onChange={(event) => setTempSuggestion(event.target.value)}
          />
          <button
            disabled={!tempSuggestion}
            type="submit"
            className="rounded-full px-10 py-3 font-semibold no-underline transition hover:bg-black/10"
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
    <div className="flex-grow border p-3">
      <h2 className="mt-4 text-lg">Members:</h2>
      {group.data &&
        group.data.users.map((groupuser) => (
          <div key={groupuser.user.id} className="flex justify-between">
            <div>{groupuser.user.name}</div>
            <div>{groupuser.points}</div>
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
  return (
    <div className="flex flex-grow gap-3 border p-3">
      <div>{group?.data?.shareCode ? group.data.shareCode : "No Code Set"}</div>
      <div>
        <button
          onClick={() => {
            const code = generateCodeForGroup.mutate({ groupId: groupId });
            console.log(code);
          }}
        >
          Generate
        </button>
      </div>
    </div>
  );
};
// const AdminControls: React.FC<{ groupId: string }> = ({ groupId }) => {
//   const group = api.group.getOneById.useQuery(
//     {
//       groupId: groupId,
//     },
//     { enabled: !!groupId }
//   );

//   return (
//     <div>
//       <h2 className="mt-4 text-lg">Admin:</h2>
//       {group.data &&
//         group.data.users.map((groupuser) => (
//           <div key={groupuser.user.id} className="flex justify-between">
//             <div>{groupuser.user.name}</div>
//             <div>{groupuser.points}</div>
//           </div>
//         ))}
//     </div>
//   );
// };
