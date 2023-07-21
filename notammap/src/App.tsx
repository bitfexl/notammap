import { useState } from "react";

function App() {
    const [count, setCount] = useState(0);

    return (
        <>
            <h1>Notam Map</h1>
            <div className="card">
                <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
                <p>{import.meta.env.VITE_MY_VAR}</p>
                <div className="inline-block w-40 h-20 border-red-500 border-8"></div>
                <br />
                <div className="inline-block w-40 h-20 bg-green-500"></div>
            </div>
        </>
    );
}

export default App;
