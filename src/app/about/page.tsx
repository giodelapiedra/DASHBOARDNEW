import React from 'react';

export const metadata = {
  title: 'About - News Dashboard',
  description: 'Learn more about our news dashboard application',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">About News Dashboard</h1>
      
      <div className="prose lg:prose-lg">
        <p>
          Welcome to News Dashboard, a modern platform designed to help you stay informed
          with the latest news and updates across various categories.
        </p>
        
        <h2>Our Mission</h2>
        <p>
          Our mission is to provide a clean, intuitive interface for accessing and managing
          news content. Whether you&apos;re a reader looking for the latest stories or a content
          creator managing your publications, News Dashboard offers the tools you need.
        </p>
        
        <h2>Features</h2>
        <ul>
          <li>Clean, responsive design for all devices</li>
          <li>Categorized news articles for easy navigation</li>
          <li>Powerful dashboard for content management</li>
          <li>User authentication and role-based access</li>
          <li>Image upload capabilities for rich content</li>
          <li>Markdown support for flexible content formatting</li>
        </ul>
        
        <h2>Technology Stack</h2>
        <p>
          News Dashboard is built with modern web technologies to ensure performance,
          security, and scalability:
        </p>
        <ul>
          <li>Next.js for server-side rendering and routing</li>
          <li>React for interactive UI components</li>
          <li>MongoDB for flexible data storage</li>
          <li>Tailwind CSS for responsive styling</li>
          <li>NextAuth.js for authentication</li>
        </ul>
        
        <h2>Get Started</h2>
        <p>
          Ready to explore? Browse our latest articles on the home page or
          register for an account to access the dashboard and start creating content.
        </p>
        
        <div className="mt-8 flex justify-center">
          <a
            href="/dashboard"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
} 