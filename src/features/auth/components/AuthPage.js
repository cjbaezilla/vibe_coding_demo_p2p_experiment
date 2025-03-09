import React from 'react';

/**
 * Page component for authentication screens
 * @param {object} props - Component props
 * @param {string} props.title - The title displayed at the top of the page
 * @param {React.ReactNode} props.children - The content to display inside the page
 * @param {boolean} props.centered - Whether to center the content vertically
 * @param {boolean} props.containerized - Whether to wrap content in a container with shadow
 * @returns {React.ReactElement} The rendered auth page
 */
const AuthPage = ({
  title,
  children,
  centered = false,
  containerized = false
}) => {
  const containerClasses = containerized
    ? 'w-full max-w-md p-6 bg-white rounded-lg shadow-md'
    : '';

  const wrapperClasses = centered
    ? 'flex flex-col items-center justify-center min-h-[60vh]'
    : 'container mx-auto px-4';

  const titleElement = containerized
    ? <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">{title}</h2>
    : <h1 className="text-3xl font-bold mb-6 text-center">{title}</h1>;

  return (
    <div className={wrapperClasses}>
      {containerized ? (
        <div className={containerClasses}>
          {titleElement}
          {children}
        </div>
      ) : (
        <>
          {titleElement}
          {children}
        </>
      )}
    </div>
  );
};

export default AuthPage;