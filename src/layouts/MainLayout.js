import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">React App</h1>
          <nav>
            <ul className="flex space-x-4 items-center">
              <li>
                <Link to="/" className="hover:text-gray-300">Home</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-gray-300">About</Link>
              </li>
              <SignedIn>
                <li>
                  <Link to="/profile" className="hover:text-gray-300">Profile</Link>
                </li>
                <li className="ml-4">
                  <UserButton afterSignOutUrl="/" />
                </li>
              </SignedIn>
              <SignedOut>
                <li>
                  <Link to="/login" className="hover:text-gray-300">Login</Link>
                </li>
                <li>
                  <Link to="/signup" className="hover:text-gray-300">Sign Up</Link>
                </li>
              </SignedOut>
            </ul>
          </nav>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto py-4">
        <Outlet />
      </main>
      
      <footer className="bg-gray-800 text-white p-4">
        <div className="container mx-auto text-center">
          <p>&copy; {new Date().getFullYear()} React App</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout; 