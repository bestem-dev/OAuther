import { type NextPage } from "next";
import Head from "next/head";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import getPkce from "oauth-pkce";

import { getCurrentURL } from "../lib/url";

const Home: NextPage = () => {
  const [clientID, setClientID] = useState<string>("");
  const [oauthServer, setOauthServer] = useState<string>("");
  const [scope, setScope] = useState<string>("");
  const [currentURL, setCurrentURL] = useState<string>("");
  const [pkce, setPkce] = useState<{
    verifier: string;
    challenge: string;
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    getPkce(50, (error, { verifier, challenge }) => {
      setPkce({ verifier, challenge });
    });
    const clientID = localStorage.getItem("client_id");
    if (clientID) {
      setClientID(clientID);
    }
    const oauthServer = localStorage.getItem("oauth_server");
    if (oauthServer) {
      setOauthServer(oauthServer);
    }
    const scope = localStorage.getItem("scope");
    if (scope) {
      setScope(scope);
    }
    setCurrentURL(getCurrentURL());
  }, []);

  const login = useCallback(async () => {
    if (!pkce) return;
    const redirectURL = currentURL + "/oauth/callback";
    const codeVerifier = pkce.verifier;

    localStorage.setItem("code_verifier", codeVerifier);
    localStorage.setItem("oauth_server", oauthServer);
    localStorage.setItem("scope", scope);
    localStorage.setItem("client_id", clientID);

    const codeChallenge = pkce.challenge;

    const oauthUrl = `${oauthServer}/oauth2/authorize?client_id=${clientID}&response_type=code&redirect_uri=${redirectURL}&scope=${scope}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
    console.log(oauthUrl);
    console.log(codeVerifier);
    console.log(codeChallenge);
    await router.push(oauthUrl);
  }, [clientID, router, pkce, currentURL, oauthServer, scope]);

  return (
    <>
      <Head>
        <title>Bestem OAuther</title>
        <meta name="description" content="OAuth 2.0 PKCE Token Generator" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-5xl text-white">Bestem OAuther</h1>
            <h2 className="text-lg text-neutral-200">
              OAuth 2.0 PKCE Token Generator
            </h2>
          </div>

          <div className="flex flex-col items-center justify-center gap-4">
            <FieldInput
              label="Client ID"
              value={clientID}
              onChange={setClientID}
            />
            <FieldInput
              label="OAuth Server"
              value={oauthServer}
              placeholder="https://id.example.com"
              onChange={setOauthServer}
            />
            <FieldInput
              label="Scope"
              value={scope}
              placeholder="openid"
              onChange={setScope}
            />
            <p className="mt-2 text-center text-white">
              Remember to set up your callback url as:
              <br />
              <span className="font-bold text-neutral-300 ">
                {currentURL + "/oauth/callback"}
              </span>
            </p>
          </div>

          <button
            onClick={() => void login()}
            className="rounded bg-white p-2 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 focus:ring-offset-white"
          >
            Get Token
          </button>
        </div>
        <span className="text-sm text-neutral-500">
          {" "}
          Made by{" "}
          <a href="https://bestem.dev" className="font-bold">
            Bestem
          </a>
        </span>
      </main>
    </>
  );
};

const FieldInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}> = ({ label, value, onChange, placeholder }) => {
  return (
    <div className="flex flex-col">
      <label htmlFor="client-id" className="block text-white">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        id="client-id"
        className="my-1 block w-96 rounded-sm border border-transparent px-3 py-2 shadow-md focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600"
      ></input>
    </div>
  );
};

export default Home;
