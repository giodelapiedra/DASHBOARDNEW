# MongoDB Atlas Connection Guide

## Connection Issue Detected

We've detected that your application is having trouble connecting to MongoDB Atlas. The error message indicates an authentication problem:

```
MongoServerError: bad auth : authentication failed
Error code: 8000
```

## Tools Available to Help

We've created several tools to help you troubleshoot and fix this issue:

1. **Connection Tester** - Interactive tool to test connection strings
   ```
   npm run test-connection
   ```

2. **Direct Test** - Tests the connection string in your .env.local file
   ```
   npm run direct-test
   ```

3. **Connection Helper** - Helps you test different usernames and passwords
   ```
   npm run connection-helper
   ```

## Step-by-Step Resolution Guide

### 1. Verify MongoDB Atlas Settings

1. **Log in to MongoDB Atlas**
   - Go to [cloud.mongodb.com](https://cloud.mongodb.com)
   - Sign in with your credentials

2. **Check Database User**
   - Navigate to "Database Access" in the left sidebar
   - Verify that the user "database" exists
   - If it doesn't, create a new user (see below)
   - If it does, reset the password to something simple without special characters

3. **Check Network Access**
   - Navigate to "Network Access" in the left sidebar
   - Ensure your current IP address is in the allowed list
   - For testing, you can add "Allow Access from Anywhere" (0.0.0.0/0)
   - **Note**: Restrict this in production environments

### 2. Create a New Database User

1. Go to "Database Access" and click "Add New Database User"
2. Set Authentication Method to "Password"
3. Username: Choose a simple username (e.g., "dashboard_user")
4. Password: Use a simple password without special characters
5. Database User Privileges: Select "Atlas admin" for testing
6. Click "Add User"

### 3. Test Your Connection

Run our interactive connection helper:

```
npm run connection-helper
```

This tool will:
- Ask for your cluster address (e.g., database.aaex8.mongodb.net)
- Ask for your database name (e.g., news_dashboard)
- Allow you to test different username/password combinations
- Provide detailed error messages if connection fails
- Let you create a test collection if connection succeeds

### 4. Update Your .env.local File

Once you find a working combination, update your `.env.local` file:

```
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER/news_dashboard?retryWrites=true&w=majority
```

Replace:
- YOUR_USERNAME with the working username
- YOUR_PASSWORD with the working password
- YOUR_CLUSTER with your cluster address (e.g., database.aaex8.mongodb.net)

### 5. Restart Your Application

After updating your .env.local file, restart your application:

```
npm run dev
```

## Common Issues and Solutions

### Authentication Failed (Error 8000)

**Causes:**
- Incorrect username or password
- User doesn't have appropriate permissions
- Special characters in password not properly URL-encoded

**Solutions:**
- Create a new user with a simple password
- Grant appropriate permissions (Atlas admin for testing)
- Use the connection helper to test different credentials

### Connection Timeout

**Causes:**
- Network connectivity issues
- Firewall blocking connection
- VPN interference

**Solutions:**
- Check your internet connection
- Temporarily disable firewall/VPN for testing
- Add your IP to the allowed list in Network Access

### Database Not Found

**Causes:**
- Incorrect database name in connection string
- Database doesn't exist yet

**Solutions:**
- Verify the database name in your connection string
- The database will be created automatically on first use

## Need More Help?

If you're still experiencing issues after following this guide, please:

1. Run `npm run direct-test` and share the complete error message
2. Check the MongoDB Atlas logs for more detailed error information
3. Contact MongoDB Atlas support with your cluster ID and error details 