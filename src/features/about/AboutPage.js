import React from 'react';

/**
 * About page component displaying information about the application
 * @returns {React.ReactElement} The rendered about page
 */
const AboutPage = () => (
    <div className="py-8 px-4">
      <h1 className="text-3xl font-bold text-center">About Page</h1>
      <p className="text-center mt-4">This is a simple React application with TailwindCSS and React Router.</p>
    </div>
  );

export default AboutPage;