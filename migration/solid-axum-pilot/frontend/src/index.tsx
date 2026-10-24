import { render } from "solid-js/web";
import { App } from "./App";
import "./styles.css";

const container = document.getElementById("root");
if (!container) throw new Error("MISSING_APP_ROOT");
render(() => <App />, container);

