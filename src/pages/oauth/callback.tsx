import { getCurrentURL } from "@src/lib/url";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const CallbackPage: NextPage = () => {
  const router = useRouter();
  const [token, setToken] = useState<string>("");
  const [fetching, setFetching] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [displayCopy, setDisplayCopy] = useState<boolean>(false);

  useEffect(() => {
    const { code } = router.query;
    console.log(code);
    if (!code) return;
    if (token) return;

    const urlencoded = new URLSearchParams();
    urlencoded.append("client_id", localStorage.getItem("client_id") || "");
    urlencoded.append("code", code as string);
    urlencoded.append("redirect_uri", getCurrentURL() + "/oauth/callback");
    urlencoded.append("grant_type", "authorization_code");
    urlencoded.append(
      "code_verifier",
      localStorage.getItem("code_verifier") || ""
    );

    const tokenEndpoint = localStorage.getItem("oauth_token_endpoint") || "";

    setFetching(true);
    void fetch(tokenEndpoint, {
      method: "POST",
      body: urlencoded,
      redirect: "manual",
    })
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      .catch((error) => setError(error.message))
      .then(async (response) => {
        setFetching(false);
        if (!response) {
          setError("Unknown error");
          return;
        }
        if (response.status !== 200) {
          const data = (await response.json()) as unknown as {
            error_description: string;
          };
          if (!data) {
            setError("Unknown error");
          } else {
            setError(data.error_description);
          }
          return;
        }
        if (!response) return;
        const data = (await response.json()) as unknown as {
          access_token: string;
        };
        setToken(data.access_token);
      });
  }, [router, token]);

  console.log(error);

  return (
    <>
      <Head>
        <title>Oauther</title>
        <meta name="description" content="oauth utility" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-4xl text-white">Your Token:</h1>
          {fetching && <p className="text-white">Fetching token...</p>}
          {error && (
            <>
              <p className="text-red-500">{error}</p>
              <Link href="/">
                <button className="rounded bg-white p-2 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 focus:ring-offset-white">
                  Go back
                </button>
              </Link>
            </>
          )}
          {token && (
            <>
              <div className="max-w-2xl rounded-lg bg-white bg-opacity-20 p-4">
                <p className="break-words text-white">{token}</p>
              </div>
              <button
                onClick={() => {
                  void navigator.clipboard.writeText(token);
                  setDisplayCopy(true);
                  setTimeout(() => setDisplayCopy(false), 2000);
                }}
                className="rounded bg-white p-2 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 focus:ring-offset-white"
              >
                Copy token
              </button>
            </>
          )}
        </div>
        <div
          className={
            "absolute bottom-0 right-0 m-4 rounded-md bg-white px-5 py-2 transition-all duration-500 " +
            (displayCopy ? "opacity-100" : "opacity-0")
          }
        >
          Token copied!
        </div>
        <span className="text-sm text-neutral-500">
          {" "}
          Made by{" "}
          <a href="https://bestem.dev" target="_blank" className="font-bold">
            Bestem
          </a>
        </span>
        <a href="https://github.com/bestem-dev/OAuther" target="_blank">
          <Image
            src="/github.png"
            alt="Github Page"
            width={42}
            height={42}
            className="absolute right-0 top-0 m-4 shadow-md hover:scale-110"
          />
        </a>
      </main>
    </>
  );
};

export default CallbackPage;
