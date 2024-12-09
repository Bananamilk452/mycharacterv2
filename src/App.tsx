import Router, { Switch, Route } from "crossroad";
import Index from "./pages";

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={Index} />
      </Switch>
    </Router>
  );
}
