import { hydrate, render } from "preact";
import { App } from "./app.tsx";
import { ErrorBoundary, LocationProvider, Route, Router, prerender as ssg } from "preact-iso";
import { QueuePage } from "./pages/queue.tsx";
import { SSGContext } from "./comptime/ssg.tsx";

function Main() {
  return (
    <LocationProvider>
      <ErrorBoundary>
        <Router>
          <Route path="/" component={App} />
          <Route path="/queue/:id" component={QueuePage} />
        </Router>
      </ErrorBoundary>
    </LocationProvider>
  );
}

if (typeof window !== "undefined") {
  const onLoad = () => {
    document.body.replaceChildren();
    
    render(
      <Main />,
      document.body
    );

    globalThis.removeEventListener("DOMContentLoaded", onLoad);
  };
  
  globalThis.addEventListener("DOMContentLoaded", onLoad);
}

export async function prerender(data: {}) {
  const ctx: SSGContext = {
    title: "",
    elements: new Set()
  };


  const { html, links } = await ssg(
    <SSGContext.Provider value={ctx}>
      <Main {...data} />
    </SSGContext.Provider>
  );

  return {
    html,
    links,
    head: ctx
  }
}
