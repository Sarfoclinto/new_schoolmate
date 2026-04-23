import Provider from "./providers";
import Router from "./router/index.routes";


// sanity check

function App() {
  return (
    <Provider>
      <Router />
    </Provider>
  );
}

export default App;
