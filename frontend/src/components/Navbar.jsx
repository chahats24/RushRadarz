import React, { useEffect, useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activePath, setActivePath] = useState(
    typeof window !== "undefined" ? window.location.pathname : "/"
  );

  useEffect(() => {
    // Update activePath when browser navigation occurs (back/forward)
    function onPop() {
      setActivePath(window.location.pathname);
      setIsOpen(false);
    }
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/menu", label: "Menu" },
    { path: "/cart", label: "Cart" },
    { path: "/friends", label: "Friends" },
    { path: "/profile", label: "Profile" },
  ];

  // Auth/login removed — using a simple Profile page instead that stores data locally.

  const handleNavClick = (e, path) => {
    // If you want SPA behaviour (no full page reload) and you already use react-router
    // replace anchors with Link and remove the following manual pushState.
    // This code uses pushState to avoid full reloads if desired.
    if (window && window.history && window.location.pathname !== path) {
      e.preventDefault();
      window.history.pushState({}, "", path);
      // notify any router or components (if you don't have a router, you might re-render manually)
      setActivePath(path);
    }
    setIsOpen(false);
  };

  return (
    <nav className="bg-aurora shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Brand */}
          <a href="/" onClick={(e) => handleNavClick(e, "/")} className="text-2xl font-extrabold text-white flex items-center">
            <span aria-hidden className="mr-2" role="img">🍴</span>
            <span>RushRadarz</span>
          </a>

          {/* Desktop Links */}
          <div className="hidden md:flex space-x-6">
            {navLinks.map((link) => {
              const isActive = activePath === link.path;
              return (
                <a
                  key={link.path}
                  href={link.path}
                  onClick={(e) => handleNavClick(e, link.path)}
                  className={`${
                    isActive
                      ? "text-white font-semibold border-b-2 border-white"
                      : "text-white/90 hover:text-white"
                  } transition duration-200`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {link.label}
                </a>
              );
            })}

            {/* No auth UI here — profile is handled on the Profile page */}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded focus:outline-none text-white/90"
            onClick={() => setIsOpen((v) => !v)}
            aria-expanded={isOpen}
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {/* Inline SVG icons */}
            {!isOpen ? (
              /* hamburger */
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              /* X / close */
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden flex flex-col space-y-3 pb-4 bg-white/10 mt-2 px-2 rounded">
            {navLinks.map((link) => {
              const isActive = activePath === link.path;
              return (
                <a
                  key={link.path}
                  href={link.path}
                  onClick={(e) => handleNavClick(e, link.path)}
                  className={`${
                    isActive
                      ? "text-indigo-600 font-semibold"
                      : "text-gray-600 hover:text-indigo-600"
                  } px-2 py-1 rounded transition duration-200`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {link.label}
                </a>
              );
            })}

            {/* no mobile auth button — profile available on Profile page */}
          </div>
        )}
        {/* Login modal removed per user request */}
      </div>
    </nav>
  );
}
