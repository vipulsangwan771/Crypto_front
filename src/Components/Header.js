import React from 'react';
import Logo from './Assests/CrptoTracker.png'

function Header() {
  return (
    <header className="bg-blue-600 text-white p-4 flex items-center">
      <img
        src={Logo} // or "/favicon.ico" if you prefer the .ico
        alt="Crypto Tracker Logo"
        className="w-8 h-8 mr-3"
      />
      <h1 className="text-2xl font-bold">Crypto Tracker</h1>
    </header>
  );
}

export default React.memo(Header);
