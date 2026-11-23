export function createConfigCode(origin: URL, id: string, credential: string) {
  const isHTTPS = origin.protocol.startsWith("https:");

  return [(isHTTPS ? "y" : "n"),origin.host,id,credential].join(";");
}
