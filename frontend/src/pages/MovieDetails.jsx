import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

function MovieDetails() {
  const { id } = useParams();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMovie();
  }, [id]);

  const getMovie = async () => {
    try {
      const response = await api.get(`/movies/${id}`);
      setMovie(response.data.movie);
    } catch (error) {
      console.log("Error fetching movie:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <p className="text-center mt-10">
        Loading movie...
      </p>
    );
  }

  if (!movie) {
    return (
      <p className="text-center mt-10">
        Movie not found
      </p>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">

      <div className="grid md:grid-cols-2 gap-8">

        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full max-w-md rounded-lg shadow"
        />

        <div>

          <h1 className="text-4xl font-bold mb-4">
            {movie.title}
          </h1>

          <p className="text-gray-600 mb-4">
            {movie.description}
          </p>

          <p className="mb-2">
            <strong>Language:</strong> {movie.language}
          </p>

          <p className="mb-2">
            <strong>Duration:</strong> {movie.duration} minutes
          </p>

          <p className="mb-2">
            <strong>Rating:</strong> ⭐ {movie.rating}
          </p>

          <p className="mb-2">
            <strong>Release Date:</strong>{" "}
            {new Date(movie.releaseDate).toLocaleDateString()}
          </p>

          <p className="mb-4">
            <strong>Genre:</strong>{" "}
            {movie.genre.join(", ")}
          </p>

          <button className="bg-red-600 text-white px-6 py-3 rounded">
            Book Tickets
          </button>

        </div>

      </div>

    </div>
  );
}

export default MovieDetails;