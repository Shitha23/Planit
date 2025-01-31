import "./App.css";
import app from "./firebaseConfig";

function App() {
  console.log("Firebase App:", app);

  return (
    <div className="App">
      <div className="bg-lightBlue text-navyBlue font-sans p-18 rounded-xl">
        <h1 className="text-mediumBlue text-2xl font-bold">
          Welcome to Plan-It
        </h1>
        {app ? (
          <p className="text-mediumBlue text-lg font-semibold">
            Firebase is initialized
          </p>
        ) : (
          <p className="text-mediumBlue text-lg font-semibold">
            Firebase is not initialized
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
