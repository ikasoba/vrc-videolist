import { useEffect, useState } from "preact/hooks";
import { BeginAuthorizationRequest, GetIssuerResponse } from "server/src/schemas/miauth.ts";

export function useIssuers() {
  const [issuers, setIssuers] = useState<null | GetIssuerResponse["issuers"]>(null);

  useEffect(() => {
    (async () => {
      const data =
        await fetch(new URL("/a/issuers", location.origin))
          .then(async x => GetIssuerResponse.parse(await x.json()))
        ;

      setIssuers(data.issuers);
    })();
  }, []);

  return issuers;
}
