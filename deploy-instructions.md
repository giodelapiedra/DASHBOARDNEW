# Deployment Instructions for Hostinger

## Files to Upload

After building your application, upload the following files to your Hostinger hosting:

1. `.next` folder - contains the compiled Next.js application
2. `node_modules` folder - contains all dependencies
3. `public` folder - contains static assets
4. `package.json` and `package-lock.json` - dependency information
5. `server.mjs` - custom server for running in production
6. `.env.local` - environment variables (or set them in Hostinger dashboard)

## Hostinger Setup

1. **Enable Node.js Support**
   - Login to Hostinger control panel
   - Go to "Websites" > Your domain > "Advanced" > "Node.js"
   - Enable Node.js support

2. **Configure Node.js Application**
   - Set entry point to: `server.mjs`
   - Set Node.js version: 18 or higher (recommended)
   - Set environment variables:
     ```
     MONGODB_URI=mongodb+srv://database:Giopogi24@cluster0.aaex8.mongodb.net/news_dashboard?retryWrites=true&w=majority&appName=Cluster0
     NEXTAUTH_SECRET=news_dashboard_secret_key_change_this_in_production
     NEXTAUTH_URL=https://yourdomain.com
     ```

3. **Create a .htaccess File**
   Create a `.htaccess` file in your root directory with:
   ```
   RewriteEngine On
   RewriteRule ^$ http://localhost:3000/ [P,L]
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
   ```

4. **Start the Application**
   - Go to Node.js application settings
   - Click "Restart" to apply all changes and start the application

## Troubleshooting

If you encounter issues:

1. **Check Application Logs**
   - Go to "Websites" > Your domain > "Advanced" > "Node.js"
   - Look for error logs in the dashboard

2. **MongoDB Connection Issues**
   - Verify your MongoDB Atlas connection string is correct
   - Ensure your IP address is whitelisted in MongoDB Atlas

3. **Port Issues**
   - Make sure you're using the port provided by Hostinger environment

4. **File Permissions**
   - Set proper permissions: 755 for directories, 644 for files

For additional support, contact Hostinger customer service. 