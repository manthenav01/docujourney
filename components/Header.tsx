import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="bg-gray-800 text-white p-4">
            <h1 className="text-xl font-bold">DocuJourney</h1>
            <nav>
                <ul className="flex space-x-4">
                    <li><a href="/" className="hover:underline">Home</a></li>
                    <li><a href="/docs" className="hover:underline">Docs</a></li>
                    <li><a href="/dashboard" className="hover:underline">Dashboard</a></li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;