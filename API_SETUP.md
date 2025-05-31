# Football API Setup

## API Rate Limit Issue Fix

The football standings feature was encountering 429 (Too Many Requests) errors due to API rate limiting. We've implemented the following fixes:

1. Added in-memory caching with a 12-hour expiration
2. Implemented retry logic with exponential backoff
3. Added fallback to stale cache when rate limited
4. Improved error handling and user feedback

## API Key Setup

To properly use the football API, you need to:

1. Create a `.env.local` file in the project root with the following content:

   ```
   # Football API credentials
   NEXT_PUBLIC_FOOTBALL_API_KEY=YOUR_API_KEY_HERE
   ```

2. Replace `YOUR_API_KEY_HERE` with your actual API key from [football-data.org](https://www.football-data.org/)

3. Restart the development server

## API Information

We're using the football-data.org API v4 with the following endpoints:

- Standings: `GET https://api.football-data.org/v4/competitions/{code}/standings`
- Matches: `GET https://api.football-data.org/v4/matches`

League competition codes:

- Premier League: PL
- La Liga: PD
- Bundesliga: BL1
- Ligue 1: FL1

## Free API Tier Limitations

The free tier of football-data.org has the following limits:

- 10 calls per minute
- 100 calls per day (24 hour rolling window)

Our implementation handles these limits by:

- Caching responses to minimize API calls
- Retrying with backoff when rate limited
- Showing cached/fallback data when necessary

## Testing

After setting up your API key:

1. Visit the league pages to see the standings
2. The component will show a blue notification if using cached data
3. If all API calls fail, it will gracefully fall back to mock data
