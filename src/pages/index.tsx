import { type NextPage } from "next";
import Head from "next/head";

import { useState, useEffect } from "react";
import RizzRow from "~/components/RizzRow";

import { api, type RouterOutputs } from "~/utils/api";

type Rizz = RouterOutputs["rizz"]["getAll"];

const rizzAPI = api.rizz;

const Home: NextPage = () => {
  const [cook, cooking] = useState("");
  const [rizz, rizzling] = useState<Rizz>([]);
  const [order, setOrder] = useState<string>("vote");

  const { getAll, submit, downvote } = rizzAPI;

  const { data: rizzData } = getAll.useQuery();

  useEffect(() => {
    if (rizzData) {
      rizzling(rizzData);
    }
  }, [rizzData]);

  const rizzCreation = submit.useMutation({
    onSuccess(data) {
      rizzling((prev) => [...prev, data]);
    },
  });

  const downvoteCreation = downvote.useMutation({
    onSuccess(data) {
      rizzling((prev) => {
        const index = prev.findIndex((rizz) => rizz.id === data.id);
        prev[index] = data;
        return prev;
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    rizzCreation.mutate({ name: cook });
    cooking("");
  };

  const handleOrder = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setOrder(e.target.value);
    switch (e.target.value) {
      case "vote":
        rizzling((prev) => [...prev].sort((a, b) => b.votes - a.votes));
        break;

      case "alphabetical":
        rizzling((prev) =>
          [...prev].sort((a, b) => a.rizz.localeCompare(b.rizz))
        );
        break;
    }
  };

  return (
    <>
      <Head>
        <title>The Rizzclopedia</title>
        <meta name="description" content="For all your rizz needs" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="px-4 py-16">
          <h1 className="text-xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            The <span className="text-[hsl(280,100%,70%)]">Rizzclopedia</span>
          </h1>
        </div>

        <div>
          <form
            onSubmit={handleSubmit}
            className="flex flex-row items-center justify-center"
          >
            <input
              type="text"
              name="habit"
              className="mr-5 rounded border-2 border-amber-500"
              value={cook}
              onChange={(e) => cooking(e.target.value)}
            />
            <button
              type="submit"
              className="mx-1 rounded bg-sky-400 px-3 hover:bg-sky-300"
            >
              add
            </button>
          </form>

          <ul className="flex flex-col">
            <label htmlFor="order" className="text-white">
              Sort:
            </label>

            <select
              name="order"
              id="order"
              value={order}
              onChange={handleOrder}
              className="w-24 rounded"
            >
              <option value="vote">by vote</option>
              <option value="alphabetical">by name</option>
            </select>
            <div className="m-7" />

            {rizz.map((rizz) => (
              <li key={rizz.id}>
                <RizzRow data={rizz} />
              </li>
            ))}
          </ul>
        </div>
      </main>
    </>
  );
};

export default Home;
