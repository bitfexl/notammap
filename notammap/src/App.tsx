import { useState, useEffect } from "react";
import { MapTest } from "./lib/map/MapTest";
import { fetchCountries, fetchNotams } from "./lib/notams/NotamFetch";

function App() {
    const [count, setCount] = useState(0);

    useEffect(() => {
        (async () => {
            const countries = await fetchCountries();
            for (const country of countries) {
                console.log(country + ":");
                const notams = await fetchNotams(country);
                console.log(notams);
            }
        })();
    }, []);

    return (
        <>
            <h1>Notam Map</h1>
            <h1>Heading 1</h1>
            <h2>Heading 2</h2>
            <h3>Heading 3</h3>
            <h4>Heading 4</h4>
            <hr />
            <h5>Heading 5</h5>
            <h6>Heading 6</h6>
            <div className="card">
                <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
                <p>{import.meta.env.VITE_MY_VAR}</p>
                <div className="inline-block w-40 h-20 border-red-500 border-8"></div>
                <br />
                <div className="inline-block w-40 h-20 bg-green-500"></div>
            </div>
            <MapTest></MapTest>
        </>
    );
}

export default App;
