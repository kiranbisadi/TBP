const express = require("express");

const { createMovie, getMovies, getMovieById, updateMovie, deleteMovie } = require("../controllers/movieController");

const router = express.Router();

router.post("/", createMovie);
router.get("/",getMovies);
router.get("/:id",getMovieById);
router.put("/:id",updateMovie);
router.delete("/:id",deleteMovie);

module.exports = router;