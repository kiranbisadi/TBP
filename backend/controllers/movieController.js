const Movie = require("../models/movie");

const createMovie = async (req, res) => {
    try {
        const {
            title,
            description,
            genre,
            language,
            duration,
            releaseDate,
            poster,
            rating,
        } = req.body;

        if (
            !title ||
            !description ||
            !genre ||
            !language ||
            !duration ||
            !releaseDate ||
            !poster
        ) {
            return res.status(400).json({
                message: "Please provide all required movie details",
            });
        }

        const movie = await Movie.create({
            title,
            description,
            genre,
            language,
            duration,
            releaseDate,
            poster,
            rating,
        });

        res.status(201).json({
            message: "Movie created successfully",
            movie,
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};

const getMovies = async (req, res) => {
    try {
        const movies = await Movie.find({ status: "active" });

        res.status(200).json({
            message: "Movies fetched successfully",
            movies,
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};

const getMovieById = async (req, res) => {
    try {
        const movie = await Movie.findOne({
            _id: req.params.id,
            status: "active",
        });

        if (!movie) {
            return res.status(404).json({
                message: "Movie not found",
            });
        }

        res.status(200).json({
            message: "Movie fetched successfully",
            movie,
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};

const updateMovie = async (req, res) => {
    try {
        const {
            title,
            description,
            genre,
            language,
            duration,
            releaseDate,
            poster,
            rating,
            status,
        } = req.body;

        const movie = await Movie.findById(req.params.id);

        if (!movie) {
            return res.status(404).json({
                message: "Movie not found",
            });
        }

        movie.title = title ?? movie.title;
        movie.description = description ?? movie.description;
        movie.genre = genre ?? movie.genre;
        movie.language = language ?? movie.language;
        movie.duration = duration ?? movie.duration;
        movie.releaseDate = releaseDate ?? movie.releaseDate;
        movie.poster = poster ?? movie.poster;
        movie.rating = rating ?? movie.rating;
        movie.status = status ?? movie.status;

        await movie.save();

        res.status(200).json({
            message: "Movie updated successfully",
            movie,
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};

const deleteMovie = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);

        if (!movie) {
            return res.status(404).json({
                message: "Movie not found",
            });
        }

        await Movie.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Movie deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};
module.exports = {
    createMovie, getMovies, getMovieById, updateMovie, deleteMovie,
};