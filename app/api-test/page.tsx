/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";

export default function ApiTestPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [league, setLeague] = useState("140"); // La Liga by default
  const [apiKey, setApiKey] = useState("");
  const [useMockData, setUseMockData] = useState(false);
  const [envStatus, setEnvStatus] = useState<{ [key: string]: boolean }>({});

  // Check which environment variables are set
  useEffect(() => {
    const checkEnvVars = async () => {
      try {
        const response = await fetch("/api/check-env");
        if (response.ok) {
          const data = await response.json();
          setEnvStatus(data);
        }
      } catch (err) {
        console.error("Error checking environment variables:", err);
      }
    };

    checkEnvVars();
  }, []);

  const testEndpoint = async () => {
    setLoading(true);
    setError(null);

    try {
      // Test our internal API endpoint
      const url = `/api/football/standings?league=${league}`;
      const options: RequestInit = {};

      // Add API key as a custom header if provided
      if (apiKey) {
        options.headers = {
          "X-Football-Api-Key": apiKey,
        };
        console.log("Using direct API key from input field");
      } else {
        console.log("Using API key from environment variables");
      }

      // Optionally force mock data
      if (useMockData) {
        options.headers = {
          ...options.headers,
          "X-Use-Mock-Data": "true",
        };
        console.log("Forcing mock data");
      }

      const response = await fetch(url, options);
      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const result = await response.json();
      console.log("API result:", result);
      setData(result);
    } catch (err) {
      console.error("Error testing API:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  // Testing direct API call
  const testDirectApi = async () => {
    setLoading(true);
    setError(null);

    const leagueMapping: Record<string, string> = {
      "39": "PL", // Premier League
      "140": "PD", // La Liga
      "78": "BL1", // Bundesliga
      "61": "FL1", // Ligue 1
      "135": "SA", // Serie A
    };

    const competitionCode = leagueMapping[league] || "PD";

    try {
      // Use the provided API key or fallback
      const keyToUse = apiKey || process.env.NEXT_PUBLIC_FOOTBALL_API_KEY || "";

      if (!keyToUse) {
        setError("No API key provided. Please enter an API key.");
        setLoading(false);
        return;
      }

      // Make a direct call to the football-data.org API
      const response = await fetch(
        `https://api.football-data.org/v4/competitions/${competitionCode}/standings`,
        {
          headers: {
            "X-Auth-Token": keyToUse,
          },
        }
      );

      console.log("Direct API response status:", response.status);

      if (!response.ok) {
        throw new Error(`Direct API responded with status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Direct API result:", result);
      setData({ directApi: result });
    } catch (err) {
      console.error("Error testing direct API:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  // Testing specific endpoint for La Liga
  const testSpecificEndpoint = async () => {
    setLoading(true);
    setError(null);

    try {
      // Direct test of the La Liga endpoint
      const keyToUse = apiKey || process.env.NEXT_PUBLIC_FOOTBALL_API_KEY || "";

      if (!keyToUse) {
        setError("No API key provided. Please enter an API key.");
        setLoading(false);
        return;
      }

      console.log("Testing specific La Liga endpoint");
      const response = await fetch(
        "https://api.football-data.org/v4/competitions/PD/standings",
        {
          headers: {
            "X-Auth-Token": keyToUse,
          },
        }
      );

      console.log("La Liga endpoint response status:", response.status);

      if (!response.ok) {
        throw new Error(
          `La Liga endpoint responded with status: ${response.status}`
        );
      }

      const result = await response.json();
      console.log("La Liga endpoint result:", result);
      setData({ laLigaEndpoint: result });
    } catch (err) {
      console.error("Error testing La Liga endpoint:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Football API Test</h1>

      {Object.keys(envStatus).length > 0 && (
        <div className="mb-4 p-3 bg-gray-100 rounded">
          <h2 className="font-semibold mb-2">Environment Variables:</h2>
          <ul className="text-sm">
            {Object.entries(envStatus).map(([name, isSet]) => (
              <li
                key={name}
                className={isSet ? "text-green-600" : "text-red-600"}
              >
                {name}: {isSet ? "✓ Set" : "✗ Not set"}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-4">
        <label className="block mb-2 font-medium">API Key (required):</label>
        <input
          type="text"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your football-data.org API key"
          className="border rounded p-2 w-full md:w-96 mb-2"
        />
        <p className="text-xs text-gray-600">
          Get an API key from{" "}
          <a
            href="https://www.football-data.org/client/register"
            target="_blank"
            className="text-blue-600 underline"
          >
            football-data.org
          </a>
        </p>
      </div>

      <div className="mb-4">
        <label className="block mb-2 font-medium">Select League:</label>
        <select
          value={league}
          onChange={(e) => setLeague(e.target.value)}
          className="border rounded p-2 w-full md:w-64"
        >
          <option value="39">Premier League</option>
          <option value="140">La Liga</option>
          <option value="78">Bundesliga</option>
          <option value="61">Ligue 1</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={useMockData}
            onChange={(e) => setUseMockData(e.target.checked)}
            className="mr-2"
          />
          <span>Force Mock Data (for internal API test)</span>
        </label>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={testEndpoint}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Test Internal API
        </button>

        <button
          onClick={testDirectApi}
          disabled={loading || !apiKey}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Test Direct API
        </button>

        <button
          onClick={testSpecificEndpoint}
          disabled={loading || !apiKey}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Test La Liga Endpoint
        </button>
      </div>

      {loading && <p className="text-gray-600">Loading...</p>}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {data && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Response Data:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
