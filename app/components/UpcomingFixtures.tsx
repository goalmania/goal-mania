"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";

interface FixtureProps {
  league: string;
}

interface Fixture {
  id: number;
  league: {
    id: number;
    name: string;
    logo: string;
    round: string;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
    };
    away: {
      id: number;
      name: string;
      logo: string;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  fixture: {
    id: number;
    date: string;
    status: {
      short: string;
      long: string;
    };
    venue: {
      name: string;
      city: string;
    };
  };
}

// Group fixtures by date
const groupFixturesByDate = (fixtures: Fixture[]) => {
  const groups: Record<string, Fixture[]> = {};

  fixtures.forEach((fixture) => {
    const date = new Date(fixture.fixture.date).toLocaleDateString("it-IT", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

    if (!groups[date]) {
      groups[date] = [];
    }

    groups[date].push(fixture);
  });

  return groups;
};

export default function UpcomingFixtures({ league }: FixtureProps) {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFixtures = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          `/api/football/fixtures?league=${league}`
        );

        if (response.data && response.data.fixtures) {
          setFixtures(response.data.fixtures);
        } else {
          setFixtures([]);
        }
      } catch (err) {
        console.error(`Error fetching fixtures for ${league}:`, err);
        setError(`Failed to load fixtures for this league.`);
        setFixtures([]);
      } finally {
        setLoading(false);
      }
    };

    if (league) {
      fetchFixtures();
    }
  }, [league]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-gray-100 animate-pulse h-24 rounded-lg"
          ></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-amber-800 bg-amber-50 rounded-md">
        {error}
      </div>
    );
  }

  if (fixtures.length === 0) {
    return (
      <div className="p-4 text-gray-500 text-center">
        Nessuna partita in programma per questa lega.
      </div>
    );
  }

  // Group fixtures by date
  const groupedFixtures = groupFixturesByDate(fixtures);

  return (
    <div className="space-y-6">
      {Object.entries(groupedFixtures).map(([date, matches]) => (
        <div key={date} className="space-y-3">
          <h3 className="font-medium text-gray-700 bg-gray-50 p-2 rounded">
            {date}
          </h3>

          <div className="space-y-3">
            {matches.map((match) => (
              <div
                key={match.id}
                className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="relative h-6 w-6">
                        <Image
                          src={match.teams.home.logo}
                          alt={match.teams.home.name}
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                      <span className="font-medium text-gray-800 text-sm">
                        {match.teams.home.name}
                      </span>
                    </div>

                    <div className="px-3 py-1 bg-gray-50 rounded text-xs font-medium text-gray-500">
                      {new Date(match.fixture.date).toLocaleTimeString(
                        "it-IT",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-800 text-sm">
                        {match.teams.away.name}
                      </span>
                      <div className="relative h-6 w-6">
                        <Image
                          src={match.teams.away.logo}
                          alt={match.teams.away.name}
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-gray-500 text-center">
                    {match.fixture.venue.name}, {match.fixture.venue.city}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
