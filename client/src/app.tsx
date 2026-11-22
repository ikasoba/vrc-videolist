import { useCallback, useState } from "preact/hooks";
import * as client from "./hooks/client.ts";
import { useLocation } from "preact-iso";
import { Button } from "./components/Button.tsx";
import { Head } from "./comptime/ssg.tsx";
import { Box } from "./components/Box.tsx";
import { Vertical } from "./components/Vertical.tsx";
import { Horizontal } from "./components/Horizontal.tsx";
import { useIssuers } from "./hooks/auth.ts";

function OpenQueueButton() {
  const { route } = useLocation();
  const [isDisabled, setDisabled] = useState(false);
  const [isLoginRequired, setLoginRequired] = useState(false);
  const onClick = useCallback(async () => {
    setDisabled(true);

    const queue = await client.createQueue().catch(err => null);
    if (queue == null) {
      setLoginRequired(true);
      return;
    }

    route(`/queue/${queue.id}`);

    setDisabled(false);
  }, []);

  return (
    !isLoginRequired
      ?
      <Button disabled={isDisabled} onClick={onClick}>
        新しいキューをひらく
      </Button>
      :
      <Box>
        <p> 作成には Misskey でのログインが必要です。 </p>
        <LoginBox />
      </Box>
  );
}

function LoginBox() {
  const issuers = useIssuers();

  const onLogin = useCallback(async (iss: string) => {
    const url = new URL(`/a/auth`, location.origin);
    const authURL =
      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          iss
        }),
      })
        .then(async x => new URL(await x.text()))
      ;

    console.log(authURL);

    location.replace(authURL);
  }, []);

  return (
    issuers?.map(x => {
      const url = new URL(x);

      return (
        <Button onClick={() => onLogin(x)}>
          Login with {url.host}
        </Button>
      );
    })
  )
}

export function App() {
  return (
    <>
      <Head>
        <link rel="redirect_uri" href="./a/redirect" />
      </Head>

      <Vertical>
        <Horizontal>
          <section className="h-app">
            <a href="./" className="u-url p-name">
              <Box>
                VRChat 用 Web ビデオキュー
              </Box>
            </a>
          </section>
          <a href="https://github.com/ikasoba/vrc-videolist">
            <Box>
              Github
            </Box>
          </a>
        </Horizontal>

        <Box>
          <p id="what-is-this">
            VRChat で複数の動画を一括で読み込むためのけしからんツールです。<br />
            キューと現在のオフセットを保持して、リダイレクトすることで  URL だけを返すエコな仕様となっています。
          </p>

          <OpenQueueButton />

          <ul>
            <li>
              <p>
                YouTube のプレイリストの読み込みはできません
              </p>
            </li>
            <li>
              <p>
                URL は改行区切りで複数入力できます
              </p>
            </li>
            <li>
              <p>
                URL の追加・管理は Web からのみできます
              </p>
            </li>
          </ul>
        </Box>
      </Vertical>
    </>
  )
}
