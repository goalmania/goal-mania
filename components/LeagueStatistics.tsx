import Image from "next/image";
import { getStandings, getTopScorers } from "@/lib/api/football";
import type { League } from "@/lib/api/football";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface LeagueStatisticsProps {
  league: League;
}

export async function LeagueStatistics({ league }: LeagueStatisticsProps) {
  // Fetch standings data from API
  const { standings, error: standingsError } = await getStandings(league);

  // Fetch top scorers data from API
  const { topScorers, error: scorersError } = await getTopScorers(league, 5);

  // Log any errors to help with debugging
  if (standingsError) {
    console.error(`Error fetching standings for ${league}: ${standingsError}`);
  }

  if (scorersError) {
    console.error(`Error fetching top scorers for ${league}: ${scorersError}`);
  }

  // Check if we have valid data
  const hasStandingsData =
    standings && standings.league.standings[0]?.length > 0;
  const hasScorersData = topScorers && topScorers.length > 0;

  return (
    <div className="space-y-8">
      {/* Standings Table */}
      <div className="bg-white rounded-md shadow overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">Classifica</h3>
        </div>

        {!hasStandingsData ? (
          <div className="p-8">
            <Alert
              variant="destructive"
              className="bg-amber-50 border-amber-200"
            >
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertTitle>Dati non disponibili</AlertTitle>
              <AlertDescription>
                Non è stato possibile caricare la classifica per questa lega.
                Riprova più tardi o contatta l'amministratore se il problema
                persiste.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8 sm:w-12"
                  >
                    Pos
                  </th>
                  <th
                    scope="col"
                    className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Squadra
                  </th>
                  <th
                    scope="col"
                    className="px-1 sm:px-3 py-2 sm:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-8 sm:w-10 hidden sm:table-cell"
                  >
                    PG
                  </th>
                  <th
                    scope="col"
                    className="px-1 sm:px-3 py-2 sm:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-8 sm:w-10 hidden sm:table-cell"
                  >
                    V
                  </th>
                  <th
                    scope="col"
                    className="px-1 sm:px-3 py-2 sm:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-8 sm:w-10 hidden sm:table-cell"
                  >
                    P
                  </th>
                  <th
                    scope="col"
                    className="px-1 sm:px-3 py-2 sm:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-8 sm:w-10 hidden sm:table-cell"
                  >
                    S
                  </th>
                  <th
                    scope="col"
                    className="px-1 sm:px-3 py-2 sm:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-10 sm:w-14 hidden md:table-cell"
                  >
                    GF
                  </th>
                  <th
                    scope="col"
                    className="px-1 sm:px-3 py-2 sm:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-10 sm:w-14 hidden md:table-cell"
                  >
                    GS
                  </th>
                  <th
                    scope="col"
                    className="px-1 sm:px-3 py-2 sm:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-8 sm:w-12 hidden sm:table-cell"
                  >
                    DR
                  </th>
                  <th
                    scope="col"
                    className="px-1 sm:px-3 py-2 sm:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-8 sm:w-12"
                  >
                    Pti
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {standings.league.standings[0].map((team) => (
                  <tr
                    key={team.team.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-sm text-gray-500">
                      {team.rank}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-5 w-5 sm:h-6 sm:w-6 relative mr-2 sm:mr-3">
                          <Image
                            src={team.team.logo}
                            alt={team.team.name}
                            fill
                            className="object-contain"
                            sizes="24px"
                          />
                        </div>
                        <div className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none">
                          {team.team.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-1 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-center text-gray-500 hidden sm:table-cell">
                      {team.all.played}
                    </td>
                    <td className="px-1 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-center text-gray-500 hidden sm:table-cell">
                      {team.all.win}
                    </td>
                    <td className="px-1 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-center text-gray-500 hidden sm:table-cell">
                      {team.all.draw}
                    </td>
                    <td className="px-1 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-center text-gray-500 hidden sm:table-cell">
                      {team.all.lose}
                    </td>
                    <td className="px-1 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-center text-gray-500 hidden md:table-cell">
                      {team.all.goals.for}
                    </td>
                    <td className="px-1 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-center text-gray-500 hidden md:table-cell">
                      {team.all.goals.against}
                    </td>
                    <td className="px-1 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-center text-gray-500 hidden sm:table-cell">
                      {team.goalsDiff}
                    </td>
                    <td className="px-1 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-center font-medium text-gray-900">
                      {team.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Top Scorers Section */}
      <div className="bg-white rounded-md shadow overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">
            Classifica Marcatori
          </h3>
        </div>

        {!hasScorersData ? (
          <div className="p-8">
            <Alert
              variant="destructive"
              className="bg-amber-50 border-amber-200"
            >
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertTitle>Dati non disponibili</AlertTitle>
              <AlertDescription>
                Non è stato possibile caricare i dati dei marcatori per questa
                lega. Riprova più tardi o contatta l'amministratore se il
                problema persiste.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {topScorers.map((scorer, index) => (
              <li key={scorer.player.id} className="p-3 sm:p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-2 sm:mr-3 text-base sm:text-xl font-semibold text-gray-500 w-6 sm:w-8 text-center">
                    {index + 1}
                  </div>
                  <div className="h-10 w-10 sm:h-12 sm:w-12 relative mr-3 sm:mr-4">
                    <Image
                      src={scorer.player.photo}
                      alt={scorer.player.name}
                      fill
                      className="object-cover rounded-full"
                      sizes="(max-width: 640px) 40px, 48px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                      {scorer.player.name}
                    </p>
                    <div className="flex items-center mt-1">
                      <div className="h-3 w-3 sm:h-4 sm:w-4 relative mr-1">
                        <Image
                          src={scorer.statistics[0].team.logo}
                          alt={scorer.statistics[0].team.name}
                          fill
                          className="object-contain"
                          sizes="(max-width: 640px) 12px, 16px"
                        />
                      </div>
                      <p className="text-xs text-gray-500 truncate max-w-[100px] sm:max-w-none">
                        {scorer.statistics[0].team.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="text-lg sm:text-xl font-bold text-indigo-600">
                      {scorer.statistics[0].goals.total}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {scorer.statistics[0].games.appearences} partite
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
