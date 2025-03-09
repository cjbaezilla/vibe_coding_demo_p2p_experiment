import React from 'react';
import { Link } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';

/**
 * Home page component that serves as the landing page for the application
 * @returns {React.ReactElement} The home page component
 */
const HomePage = () => (
    <div className="py-8 px-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center">Welcome to Our Platform</h1>
      <p className="text-center mt-4 text-lg text-gray-600">
        Explore our features and connect with others in real-time.
      </p>

      <div className="mt-12">
        <SignedIn>
          <div className="bg-white rounded-lg shadow-md p-6 mt-8">
            <h2 className="text-2xl font-semibold text-center">Try Our Real-time Chat</h2>
            <p className="text-center mt-3 mb-6">
              Connect with other users instantly using our secure real-time chat feature.
            </p>
            <div className="flex justify-center">
              <Link
                to="/chat"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium
                          rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2
                    11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                    clipRule="evenodd"
                  />
                </svg>
                Start Chatting Now
                <span className="ml-2 inline-block w-2 h-2 rounded-full bg-green-500" />
              </Link>
            </div>
          </div>
        </SignedIn>

        <SignedOut>
          <div className="bg-white rounded-lg shadow-md p-6 mt-8">
            <h2 className="text-2xl font-semibold text-center">Join Our Community</h2>
            <p className="text-center mt-3 mb-6">
              Sign up to access exclusive features including our real-time chat platform.
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                to="/login"
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg
                          hover:bg-blue-700 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg
                          hover:bg-green-700 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </SignedOut>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-bold text-lg mb-2">Real-time Chat</h3>
          <p className="text-gray-600">Connect with other users instantly through our secure chat platform.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-bold text-lg mb-2">User Profiles</h3>
          <p className="text-gray-600">Create and customize your profile to connect with others.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-bold text-lg mb-2">Secure Authentication</h3>
          <p className="text-gray-600">Your data is protected with our modern authentication system.</p>
        </div>
      </div>
    </div>
  );

export default HomePage;