import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => (
  <nav className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 shadow-lg">
    <div className="container mx-auto flex justify-between items-center">
      <Link to="/" className="text-white text-xl font-bold">
        Crypto Dashboard
      </Link>
      <div>
        <Link to="/" className="text-white px-4 py-2 hover:bg-blue-700 rounded">
          Dashboard
        </Link>
      </div>
    </div>
  </nav>
);

export default Navbar;
