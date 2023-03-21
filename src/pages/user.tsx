import { type NextPage } from "next";
import Layout from "../components/layout";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";

const UserAdmin: NextPage = () => {
  const utils = api.useContext();
  const { data: sessionData } = useSession();
  const [tempName, setTempName] = useState(sessionData?.user.name || "");
  const updateUser = api.user.updateUser.useMutation({
    onSettled: async () => {
      await utils.user.getUserInfo.invalidate();
    },
  });
  return (
    <Layout>
      <div className="flex h-screen">
        <div className="m-auto">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              updateUser.mutate({
                name: tempName,
              });
            }}
          >
            <label htmlFor="name_input">Your Name</label>
            <input
              id="name_input"
              type="text"
              className="ml-2 border border-black pl-2"
              minLength={2}
              maxLength={36}
              value={tempName}
              onChange={(event) => setTempName(event.target.value)}
            />
            <button
              disabled={!tempName || tempName === sessionData?.user.name}
              type="submit"
              className="ml-3 border border-black px-2 no-underline transition hover:bg-black/10"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default UserAdmin;
