/**
 * Utility functions for handling user sessions
 */

// Track the last refresh time to prevent excessive refreshes
let lastRefreshTime = 0;
const REFRESH_COOLDOWN = 2000; // Reduce cooldown to 2 seconds

/**
 * Refreshes the user session with the latest data from the database
 * @param updateSession - The update function from useSession hook
 * @param currentSession - The current session object
 * @returns Promise that resolves when the session is refreshed
 */
export async function refreshUserSession(
  updateSession: any,
  currentSession: any
) {
  // Prevent excessive refreshes
  const now = Date.now();
  if (now - lastRefreshTime < REFRESH_COOLDOWN) {
    return currentSession?.user;
  }

  lastRefreshTime = now;

  try {
    const response = await fetch("/api/auth/refresh");

    if (!response.ok) {
      throw new Error("Failed to refresh user data");
    }

    const userData = await response.json();

    // Always update the session with the latest user data
    const updatedSession = {
      ...currentSession,
      user: {
        ...currentSession?.user,
        role: userData.role,
      },
    };

    await updateSession(updatedSession);

    return userData;
  } catch (error) {
    console.error("Failed to refresh session:", error);
    throw error;
  }
}
