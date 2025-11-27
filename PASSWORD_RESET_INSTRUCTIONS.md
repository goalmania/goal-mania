# Password Reset Instructions

## Issue
The password authentication is failing locally even though it works on production. This is likely due to:
1. The password hash in the database not matching the entered password
2. Database read preference potentially reading stale data (now fixed)

## Solution

### Step 1: Generate NEXTAUTH_SECRET

Run this command to generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Or use OpenSSL:
```bash
openssl rand -base64 32
```

Add the generated secret to your `.env.local` file:
```env
NEXTAUTH_SECRET="your-generated-secret-here"
```

### Step 2: Reset User Password

Use the provided script to reset the password for your user:

```bash
node scripts/reset-user-password.mjs goalmaniaofficial@gmail.com dimuropaolo7
```

This will:
- Connect to your MongoDB database
- Find the user by email
- Hash the new password with bcrypt
- Update the password in the database

### Step 3: Verify Login

After resetting the password, try logging in again with:
- Email: `goalmaniaofficial@gmail.com`
- Password: `dimuropaolo7`

## Changes Made

1. **Database Read Preference**: Changed from `secondaryPreferred` to `primary` to ensure we read the latest data for authentication
2. **Password Retrieval**: Simplified to use `.lean()` method which bypasses Mongoose transformations
3. **Enhanced Logging**: Added detailed logging to help diagnose authentication issues
4. **Password Reset Script**: Created `scripts/reset-user-password.mjs` to easily reset user passwords

## Troubleshooting

If login still fails after resetting the password:

1. **Check Database Connection**: Ensure `MONGODB_URI` in `.env.local` points to the correct database
2. **Verify Password**: Make sure you're entering the exact password (no extra spaces, correct case)
3. **Check Logs**: Look at the console output for detailed authentication logs
4. **Try Different Password**: Use the reset script to set a simple test password and verify it works

## Notes

- The password reset script uses bcrypt with 10 salt rounds (matching most of the codebase)
- The script will show you the user details before resetting the password
- Make sure your `.env.local` file has the correct `MONGODB_URI` configured

