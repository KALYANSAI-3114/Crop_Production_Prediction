import { useState } from "react";
import "./App.css";

function App() {
  const [form, setForm] = useState({
    Crop: "",
    Season: "",
    Area: "",
    Yield: "",
    Year: ""
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const predict = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Crop: form.Crop,
          Season: form.Season,
          Area: parseFloat(form.Area),
          Yield: parseFloat(form.Yield),
          Year: parseInt(form.Year)
        })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.detail);

      setResult(data.predicted_production);
    } catch (err) {
      setError(err.message || "Prediction failed");
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <div className="card">
        <h1>🌾 Crop Production Predictor</h1>

        <input name="Crop" placeholder="Crop (e.g. Rice)" onChange={handleChange} />
        <input name="Season" placeholder="Season (e.g. Kharif)" onChange={handleChange} />
        <input name="Area" placeholder="Area" type="number" onChange={handleChange} />
        <input name="Yield" placeholder="Yield" type="number" onChange={handleChange} />
        <input name="Year" placeholder="Year" type="number" onChange={handleChange} />

        <button onClick={predict} disabled={loading}>
          {loading ? "Predicting..." : "Predict"}
        </button>

        {result && <h3>Predicted Production: {result}</h3>}
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}

export default App;
