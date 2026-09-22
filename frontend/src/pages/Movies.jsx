import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Movies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMovies();
  }, []);

  const getMovies = async () => {
    try {
      const response = await api.get("/movies");
      setMovies(response.data.movies);
    } catch (error) {
      console.log("Error fetching movies:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <p className="text-center mt-10">
        Loading movies...
      </p>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">

      <h1 className="text-3xl font-bold mb-6">
        Movies
      </h1>

      {movies.length === 0 ? (
        <p>No movies available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">

          {movies.map((movie) => (

            <Link
              key={movie._id}
              to={`/movies/${movie._id}`}
              className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg"
            >

              <img
                src={movie.poster}
                alt={movie.title}
                className="w-full h-72 object-cover"
              />

              <div className="p-4">

                <h2 className="text-xl font-bold">
                  {movie.title}
                </h2>

                <p className="text-gray-600 mt-2">
                  {movie.language}
                </p>

                <p className="mt-2">
                  ⭐ {movie.rating}
                </p>

              </div>

            </Link>

          ))}

        </div>
      )}

    </div>
  );
}

export default Movies;