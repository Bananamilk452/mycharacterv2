import Router, { Switch, Route } from "crossroad";
import Index from "./pages/Index";
import Editor from "./pages/Editor";

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={Index} />
        <Route path="/editor/:collectionUuid" component={Editor} />
      </Switch>
    </Router>
  );
}
