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
  }, []);

  const login = useCallback(async () => {
    if (!pkce) return;
    const currentURL = getCurrentURL();
    const oauthServer = "https://id.sandbox.btgpactual.com";
    const redirectURL = currentURL + "/oauth/callback";
    const scope = "openid";
    // create oauth code challenge
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
  }, [clientID, router, pkce]);

  return (
    <>
      <Head>
        <title>Oauther</title>
        <meta name="description" content="oauth utility" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-4xl text-white">Oauther</h1>
          <FieldInput
            label="Client ID"
            value={clientID}
            onChange={setClientID}
          />
          <FieldInput
            label="Oauth Server"
            value={oauthServer}
            onChange={setOauthServer}
          />
          <FieldInput label="Scope" value={scope} onChange={setScope} />
          <button
            onClick={() => void login()}
            className="w-20 rounded bg-white p-2"
          >
            Login
          </button>
        </div>
      </main>
    </>
  );
};

const FieldInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
}> = ({ label, value, onChange }) => {
  return (
    <div className="flex flex-col">
      <label htmlFor="client-id" className="block text-white">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        id="client-id"
        className="block w-96 rounded-sm p-1 text-center"
      ></input>
    </div>
  );
};

export default Home;
