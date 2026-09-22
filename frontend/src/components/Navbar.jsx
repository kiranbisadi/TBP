import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <nav className="bg-gray-900 text-white px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">

        <Link to="/" className="text-2xl font-bold">
          MovieApp
        </Link>

        <div className="flex gap-6 items-center">

          <Link to="/">
            Home
          </Link>

          <Link to="/movies">
            Movies
          </Link>

          {token ? (
            <>
              <Link to="/bookings">
                My Bookings
              </Link>

              <Link to="/profile">
                Profile
              </Link>

              <button
                onClick={handleLogout}
                className="text-red-400"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                Login
              </Link>

              <Link to="/register">
                Register
              </Link>
            </>
          )}

        </div>

      </div>
    </nav>
  );
}

export default Navbar;