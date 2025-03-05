# Connecting to MongoDB Atlas

This guide will help you connect your News Dashboard application to MongoDB Atlas, the cloud version of MongoDB.

## Step 1: Create a MongoDB Atlas Account and Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up for a free account if you don't have one already.
2. After signing in, create a new cluster by clicking "Build a Database".
3. Choose the "FREE" tier option (M0 Sandbox).
4. Select your preferred cloud provider (AWS, Google Cloud, or Azure) and region closest to your users.
5. Click "Create Cluster" and wait for the cluster to be created (this may take a few minutes).

## Step 2: Set Up Database Access

1. In the MongoDB Atlas dashboard, go to "Database Access" under the Security section.
2. Click "Add New Database User".
3. Create a username and password (use a strong password and save it securely).
4. Set privileges to "Read and Write to Any Database" for simplicity.
5. Click "Add User".

## Step 3: Set Up Network Access

1. Go to "Network Access" under the Security section.
2. Click "Add IP Address".
3. For development, you can click "Allow Access from Anywhere" (0.0.0.0/0).
   - Note: For production, you should restrict this to specific IP addresses.
4. Click "Confirm".

## Step 4: Get Your Connection String

1. Go back to your cluster and click "Connect".
2. Select "Connect your application".
3. Choose "Node.js" as your driver and the appropriate version.
4. Copy the connection string. It will look something like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<username>` and `<password>` with the credentials you created earlier.

## Step 5: Update Your Application's Environment Variables

1. Open the `.env.local` file in your project.
2. Replace the existing `MONGODB_URI` value with your MongoDB Atlas connection string:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/news_dashboard?retryWrites=true&w=majority
   ```
   - Make sure to replace `<username>` and `<password>` with your actual credentials.
   - Add `/news_dashboard` after the hostname to specify the database name.

## Step 6: Test the Connection

1. Install the dotenv package if you haven't already:
   ```
   npm install dotenv
   ```

2. Run the test script to verify the connection:
   ```
   node scripts/test-db-connection.js
   ```

3. If successful, you should see a message confirming the connection and listing the available collections.

## Step 7: Start Your Application

1. Start your application as usual:
   ```
   npm run dev
   ```

2. Your application should now be connected to MongoDB Atlas instead of a local MongoDB instance.

## Troubleshooting

If you encounter connection issues:

1. **Check your credentials**: Make sure your username and password are correct and properly URL-encoded.
2. **Network access**: Ensure your IP address is allowed in the Network Access settings.
3. **Connection string**: Verify that the connection string format is correct.
4. **Database name**: Make sure you've added the database name to the connection string.
5. **Firewall issues**: If you're behind a corporate firewall, you might need to request access to MongoDB Atlas.

## Data Migration

If you need to migrate data from your local MongoDB to MongoDB Atlas:

1. Use MongoDB Compass to connect to your local database.
2. Export your collections to JSON files.
3. Connect MongoDB Compass to your MongoDB Atlas cluster.
4. Import the JSON files into your Atlas collections.

Alternatively, you can use the `mongodump` and `mongorestore` tools for larger datasets. 