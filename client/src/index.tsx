import { render } from "preact";
import { App } from "./app.tsx";
import { ErrorBoundary, LocationProvider, Route, Router } from "preact-iso";
import { QueuePage } from "./pages/queue.tsx";

globalThis.addEventListener("load", () => {
  render(
    <LocationProvider>
      <ErrorBoundary>
        <Router>
          <Route path="/" component={App} />
          <Route path="/queue/:id" component={QueuePage} />
        </Router>
      </ErrorBoundary>
    </LocationProvider>,
    document.body
  );
})
