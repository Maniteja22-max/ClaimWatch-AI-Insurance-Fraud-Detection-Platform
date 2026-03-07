import { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function App() {

  // ================= AUTH =================
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState("");
  const [activePage, setActivePage] = useState("dashboard");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // ================= CLAIM DATA =================
  const [claimAmount, setClaimAmount] = useState("");
  const [coverage, setCoverage] = useState("");
  const [previousClaims, setPreviousClaims] = useState("");
  const [frequency, setFrequency] = useState("");

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [claims, setClaims] = useState([]);

  // ================= LOGIN =================
  const handleLogin = () => {
    if (username === "admin" && password === "admin123") {
      setRole("admin");
      setIsLoggedIn(true);
    } else if (
      username === "investigator" &&
      password === "invest123"
    ) {
      setRole("investigator");
      setIsLoggedIn(true);
    } else {
      alert("Invalid Credentials");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setRole("");
    setUsername("");
    setPassword("");
    setClaims([]);
    setResult(null);
  };

  // ================= ANALYZE CLAIM =================
  const analyzeClaim = async () => {
    if (!claimAmount || !coverage) {
      alert("Please fill required fields");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/predict",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            claimAmount: Number(claimAmount),
            coverage: Number(coverage),
            previousClaims: Number(previousClaims),
            frequency: Number(frequency),
          }),
        }
      );

      const data = await response.json();

      const newClaim = {
        claimAmount,
        coverage,
        previousClaims,
        frequency,
        score: data.score,
        status: data.status,
      };

      setClaims((prev) => [newClaim, ...prev]);
      setResult(data);

    } catch (error) {
      alert("Backend not connected");
      console.error(error);
    }

    setLoading(false);
  };

  // ================= PDF DOWNLOAD =================
  const downloadPDF = async () => {
    const input = document.getElementById("report-section");

    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF();
    const imgWidth = 190;
    const imgHeight =
      (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
    pdf.save("ClaimWatch_Report.pdf");
  };

  // ================= LOGIN PAGE =================
  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-900 to-blue-900 text-white">
        <div className="bg-white/10 p-8 rounded-xl w-96 backdrop-blur-md shadow-xl">
          <h2 className="text-2xl font-bold mb-6 text-center">
            ClaimWatch AI Login
          </h2>

          <input
            className="w-full p-3 mb-4 rounded text-black"
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            className="w-full p-3 mb-4 rounded text-black"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleLogin}
            className="w-full bg-white text-black p-3 rounded font-bold"
          >
            Sign In
          </button>

          <p className="text-sm mt-4 text-gray-300">
            Admin: admin / admin123 <br />
            Investigator: investigator / invest123
          </p>
        </div>
      </div>
    );
  }

  // ================= MAIN LAYOUT =================
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 text-white">

      {/* SIDEBAR */}
      <div className="w-64 bg-black/30 p-6">
        <h2 className="text-2xl font-bold mb-10">
          ClaimWatch AI
        </h2>

        <ul className="space-y-6">
          <li onClick={() => setActivePage("dashboard")} className="cursor-pointer hover:text-yellow-300">📊 Dashboard</li>
          <li onClick={() => setActivePage("analytics")} className="cursor-pointer hover:text-yellow-300">📈 Analytics</li>
          <li onClick={() => setActivePage("reports")} className="cursor-pointer hover:text-yellow-300">📂 Reports</li>

          {role === "admin" && (
            <li onClick={() => setActivePage("settings")} className="cursor-pointer hover:text-yellow-300">⚙ Settings</li>
          )}

          <li onClick={handleLogout} className="cursor-pointer text-red-400">🚪 Sign Out</li>
        </ul>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-10">

        {/* DASHBOARD */}
        {activePage === "dashboard" && (
          <>
            <h1 className="text-3xl font-bold mb-8">
              Insurance Fraud Dashboard
            </h1>

            <div className="bg-white/10 p-8 rounded-xl shadow-lg max-w-3xl">

              <input className="w-full p-3 mb-4 rounded text-black" placeholder="Claim Amount" value={claimAmount} onChange={(e) => setClaimAmount(e.target.value)} />
              <input className="w-full p-3 mb-4 rounded text-black" placeholder="Policy Coverage" value={coverage} onChange={(e) => setCoverage(e.target.value)} />
              <input className="w-full p-3 mb-4 rounded text-black" placeholder="Previous Claims" value={previousClaims} onChange={(e) => setPreviousClaims(e.target.value)} />
              <input className="w-full p-3 mb-6 rounded text-black" placeholder="Claim Frequency" value={frequency} onChange={(e) => setFrequency(e.target.value)} />

              <button onClick={analyzeClaim} className="w-full bg-white text-black p-3 rounded font-bold">
                {loading ? "Analyzing..." : "Analyze Claim"}
              </button>

              {result && (
                <div className="mt-6 text-lg">
                  <p>Fraud Score: <span className="font-bold">{result.score}%</span></p>
                  <p className="font-bold">{result.status}</p>
                </div>
              )}
            </div>

            {/* GRAPH */}
            {claims.length > 0 && (
              <div className="mt-10 bg-white/10 p-6 rounded-xl max-w-3xl">
                <h3 className="text-xl font-bold mb-4">
                  Risk Distribution
                </h3>

                <Bar
                  data={{
                    labels: ["Low", "Medium", "High"],
                    datasets: [{
                      label: "Claims",
                      data: [
                        claims.filter(c => c.status === "Low Risk").length,
                        claims.filter(c => c.status === "Medium Risk").length,
                        claims.filter(c => c.status === "High Risk").length,
                      ],
                      backgroundColor: [
                        "rgba(34,197,94,0.7)",
                        "rgba(250,204,21,0.7)",
                        "rgba(239,68,68,0.7)",
                      ],
                    }],
                  }}
                />
              </div>
            )}
          </>
        )}

        {/* ANALYTICS */}
        {activePage === "analytics" && (
          <div className="bg-white/10 p-6 rounded-xl">
            <h2 className="text-2xl font-bold mb-6">Analytics</h2>
            <p>Total Claims: {claims.length}</p>
            <p>High Risk: {claims.filter(c => c.status === "High Risk").length}</p>
            <p>Medium Risk: {claims.filter(c => c.status === "Medium Risk").length}</p>
            <p>Low Risk: {claims.filter(c => c.status === "Low Risk").length}</p>
          </div>
        )}

        {/* REPORTS */}
        {activePage === "reports" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Reports</h2>

            <div id="report-section" className="bg-white/10 p-6 rounded-xl overflow-auto">
              <table className="w-full text-left">
                <thead>
                  <tr>
                    <th>Amount</th>
                    <th>Coverage</th>
                    <th>Score</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {claims.map((c, i) => (
                    <tr key={i}>
                      <td>{c.claimAmount}</td>
                      <td>{c.coverage}</td>
                      <td>{c.score}%</td>
                      <td>{c.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button onClick={downloadPDF} className="mt-6 bg-white text-black px-6 py-3 rounded font-bold">
              📄 Download PDF
            </button>
          </div>
        )}

        {/* SETTINGS */}
        {activePage === "settings" && role === "admin" && (
          <div>
            <h2 className="text-2xl font-bold">Admin Settings</h2>
            <p>System configuration panel.</p>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
