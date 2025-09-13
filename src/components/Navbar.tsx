const Navbar = () => {
  return (
    <header className="sticky top-0 z-10 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-zinc-900">Fake Store</h1>
          </div>

          <nav className="hidden space-x-8 md:flex">
            <a
              href="#"
              className="font-medium text-zinc-600 hover:text-zinc-900">
              Products
            </a>

            <a
              href="https://www.devahoy.com"
              className="font-medium text-zinc-600 hover:text-zinc-900"
              target="_blank">
              Contact
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
