/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { type NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import supperclubLogo from "../../public/bow.svg";
import { useState } from "react";
import Layout from "../components/layout";
import { Dancing_Script } from "next/font/google";
import { useRouter } from "next/router";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: "400",
  style: "normal",
});

const Home: NextPage = () => {
  const { data: sessionData } = useSession();

  return (
    <Layout>
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <Image src={supperclubLogo} alt="Supper Club" />
          <h1 className={`${dancingScript.className} text-9xl`}>Supper Club</h1>
          <div className="col-ga mx-3 flex-col">
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
  const router = useRouter();

  const postGroup = api.group.postGroup.useMutation();
  return (
    <div className="mb-3 flex flex-grow flex-col border border-black p-3">
      <h2 className={`${dancingScript.className} mb-1 text-2xl`}>
        Create a Group
      </h2>
      <form
        className=""
        onSubmit={(event) => {
          event.preventDefault();
          const newGroup = postGroup
            .mutateAsync({
              name: name,
            })
            .then((ret) => {
              void (ret && router.replace(`/groups/${ret.id}`));
            });
          //
        }}
      >
        <input
          type="text"
          className="border border-black pl-2"
          placeholder="group name"
          minLength={2}
          maxLength={36}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <button
          type="submit"
          className="ml-3 border border-black px-2 no-underline transition hover:bg-black/10"
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
    <div className="flex flex-grow flex-col border border-black p-3">
      <h2 className={`${dancingScript.className} mb-1 text-2xl`}>
        Your Groups
      </h2>
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
