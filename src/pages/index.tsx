import { type NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import supperclubLogo from "../../public/supperclub_logo.svg";
import { useState } from "react";
import Layout from "../components/layout";

const Home: NextPage = () => {
  const { data: sessionData } = useSession();

  return (
    <Layout>
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <Image src={supperclubLogo} alt="Supper Club" />
          <div className="flex w-full gap-2">
            {sessionData && (
              <>
                <CreateGroup />
                <GroupBrowser />
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;

const CreateGroup: React.FC = () => {
  const [name, setName] = useState("");

  const postGroup = api.group.postGroup.useMutation();
  return (
    <div className="flex flex-grow flex-col border p-3">
      <h3 className="text-xl font-bold">Create a Group</h3>
      <form
        className=""
        onSubmit={(event) => {
          event.preventDefault();
          postGroup.mutate({
            name: name,
          });
          setName("");
        }}
      >
        <input
          type="text"
          className="border-2 border-black"
          placeholder="group name"
          minLength={2}
          maxLength={36}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <button
          type="submit"
          className="rounded-full px-10 py-3 font-semibold no-underline transition hover:bg-black/10"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

const GroupBrowser: React.FC = () => {
  const groups = api.group.getAllForUser.useQuery();
  return (
    <div className="flex flex-grow flex-col border p-3">
      <h3 className="text-xl font-bold">Your Groups</h3>
      {groups.data ? (
        groups.data.map((group) => (
          <div key={group.id}>
            <Link href={`/groups/${group.id}`}>{group.name}</Link>
          </div>
        ))
      ) : (
        <p>{"You aren't in any groups yet!"}</p>
      )}
    </div>
  );
};
