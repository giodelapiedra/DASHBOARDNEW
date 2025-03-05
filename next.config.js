/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    MONGODB_URI: process.env.MONGODB_URI || "mongodb+srv://database:Giopogi24@cluster0.aaex8.mongodb.net/news_dashboard?retryWrites=true&w=majority",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "news_dashboard_secret_key_change_this_in_production",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "https://dashboard-tau-lime.vercel.app"
  }
};

module.exports = nextConfig;
