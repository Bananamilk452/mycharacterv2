import Router, { Route, Switch } from "crossroad";
import { ErrorBoundary } from "react-error-boundary";

import { Fallback } from "./components/Fallback";
import { MobileNotice } from "./components/MobileNotice";
import { Toaster } from "./components/ui/sonner";
import Editor from "./pages/Editor";
import Index from "./pages/Index";

export default function App() {
  return (
    <ErrorBoundary FallbackComponent={Fallback}>
      <Router>
        <Switch>
          <Route path="/" component={Index} />
          <Route path="/editor/:collectionUuid" component={Editor} />
        </Switch>
      </Router>
      <Toaster />
      <MobileNotice />
    </ErrorBoundary>
  );
}
