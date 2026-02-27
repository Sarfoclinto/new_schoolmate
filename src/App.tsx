import Provider from "./providers";
import Router from "./router/index.routes";

function App() {
  return (
    <Provider>
      <Router />
    </Provider>
  );
}

export default App;
