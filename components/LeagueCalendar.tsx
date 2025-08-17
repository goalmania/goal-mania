"use client";
import Image from "next/image";
import { getFixtures } from "@/lib/api/football";
import type { League, FixtureResponse } from "@/lib/api/football";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useI18n } from "@/lib/hooks/useI18n";
import { useState, useEffect } from "react";

interface LeagueCalendarProps {
  league: League;
}

export function LeagueCalendar({ league }: LeagueCalendarProps) {
  const { t } = useI18n();
  const [fixtures, setFixtures] = useState<FixtureResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchFixtures() {
      try {
        setIsLoading(true);
        const { fixtures: fixturesData, error: fetchError } = await getFixtures(league);
        
        if (fetchError) {
          console.error(`Error fetching fixtures for ${league}: ${fetchError}`);
          setError(fetchError);
        } else {
          setFixtures(fixturesData || []);
        }
      } catch (err) {
        console.error(`Error fetching fixtures for ${league}:`, err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    }

    fetchFixtures();
  }, [league, t]);

  // Check if we have valid data
  const hasFixturesData = fixtures && fixtures.length > 0;

  // Group fixtures by round
  const fixturesByRound = fixtures.reduce(
    (acc: Record<string, FixtureResponse[]>, fixture) => {
      const round = fixture.league.round || t('league.unknownRound');
      if (!acc[round]) {
        acc[round] = [];
      }
      acc[round].push(fixture);
      return acc;
    },
    {}
  );

  // Sort rounds to display the nearest upcoming matches first
  const sortedRounds = Object.keys(fixturesByRound).sort((a, b) => {
    // If rounds contain numbers (like "Regular Season - 10"), sort by that number
    const aMatch = a.match(/Regular Season - (\d+)/);
    const bMatch = b.match(/Regular Season - (\d+)/);

    if (aMatch && bMatch) {
      return parseInt(aMatch[1]) - parseInt(bMatch[1]);
    }
    return a.localeCompare(b);
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-md shadow">
        <div className="p-4 border-b">
          <h3 className="text-lg font-medium text-black">{t('league.upcomingMatches')}</h3>
        </div>
        <div className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-md shadow">
      <div className="p-4 border-b">
        <h3 className="text-lg font-medium text-black">{t('league.upcomingMatches')}</h3>
      </div>

      {!hasFixturesData ? (
        <div className="p-4 sm:p-8">
          <Alert variant="destructive" className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-black">{t('league.noDataAvailable')}</AlertTitle>
            <AlertDescription className="text-black">
              {t('league.loadError')}
            </AlertDescription>
          </Alert>
        </div>
      ) : (
        <div>
          {sortedRounds.map((round) => (
            <div key={round} className="mb-4">
              <div className="px-4 py-2 bg-gray-50 border-y border-gray-200">
                <h4 className="text-sm font-medium text-black">{round}</h4>
              </div>
              <ul className="divide-y divide-gray-200">
                {fixturesByRound[round].map((fixture) => {
                  const fixtureDate = new Date(fixture.fixture.date);
                  const isLive = fixture.fixture.status.short === "LIVE";
                  const isFinished = fixture.fixture.status.short === "FT";

                  return (
                    <li key={fixture.fixture.id} className="p-3 sm:p-4">
                      <div className="flex flex-col space-y-2">
                        <div className="flex justify-between items-center text-xs sm:text-sm text-black">
                          <span className="truncate mr-2">
                            {fixtureDate.toLocaleDateString("it-IT", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                          <span>
                            {isLive ? (
                              <span className="px-2 py-0.5 sm:py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 whitespace-nowrap">
                                {t('league.live')}
                              </span>
                            ) : isFinished ? (
                              <span className="px-2 py-0.5 sm:py-1 text-xs font-medium rounded-full bg-gray-100 text-black whitespace-nowrap">
                                {t('league.finished')}
                              </span>
                            ) : (
                              fixtureDate.toLocaleTimeString("it-IT", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            )}
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center">
                          <div className="flex flex-row items-center justify-between sm:justify-end sm:flex-1">
                            <span className="text-sm font-medium truncate max-w-[120px] sm:max-w-none sm:mr-2 text-black">
                              {fixture.teams.home.name}
                            </span>
                            <div className="h-6 w-6 sm:h-8 sm:w-8 relative ml-2 sm:ml-0">
                              <Image
                                src={fixture.teams.home.logo}
                                alt={fixture.teams.home.name}
                                fill
                                className="object-contain"
                                sizes="(max-width: 640px) 24px, 32px"
                              />
                            </div>
                          </div>

                          <div className="mx-0 my-2 sm:mx-4 sm:my-0 px-3 py-1 sm:px-4 sm:py-2 bg-gray-100 rounded-md text-center sm:min-w-[70px] self-center">
                            {isLive || isFinished ? (
                              <span className="font-bold text-base sm:text-lg text-black">
                                {fixture.goals.home} - {fixture.goals.away}
                              </span>
                            ) : (
                              <span className="text-xs sm:text-sm text-black">
                                VS
                              </span>
                            )}
                          </div>

                          <div className="flex flex-row-reverse sm:flex-row items-center justify-between sm:justify-start sm:flex-1">
                            <span className="text-sm font-medium truncate max-w-[120px] sm:max-w-none sm:ml-2 text-black">
                              {fixture.teams.away.name}
                            </span>
                            <div className="h-6 w-6 sm:h-8 sm:w-8 relative mr-2 sm:mr-0">
                              <Image
                                src={fixture.teams.away.logo}
                                alt={fixture.teams.away.name}
                                fill
                                className="object-contain"
                                sizes="(max-width: 640px) 24px, 32px"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="text-xs text-black text-center mt-1">
                          {fixture.fixture.venue.name &&
                            `${fixture.fixture.venue.name}${
                              fixture.fixture.venue.city
                                ? `, ${fixture.fixture.venue.city}`
                                : ""
                            }`}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
