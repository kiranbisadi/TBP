const Show = require("../models/Show");
const Movie = require("../models/movie");
const Theatre = require("../models/Theatre");
const Screen = require("../models/screen");

// ==========================================
// HELPER: CONVERT HH:MM TO MINUTES
// ==========================================
const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
};

// ==========================================
// HELPER: CHECK SHOW TIME CONFLICT
// ==========================================
const hasTimeConflict = async ({
  theatreId,
  screenId,
  showDate,
  startTime,
  endTime,
  excludeShowId = null,
}) => {
  const newStart = timeToMinutes(startTime);
  const newEnd = timeToMinutes(endTime);

  // Start time must be before end time
  if (newStart >= newEnd) {
    return {
      invalid: true,
      conflict: false,
    };
  }

  const query = {
    theatreId,
    screenId,
    showDate: new Date(showDate),
    status: "active",
  };

  // Used when updating an existing show
  if (excludeShowId) {
    query._id = {
      $ne: excludeShowId,
    };
  }

  const existingShows = await Show.find(query);

  for (const existingShow of existingShows) {
    const existingStart = timeToMinutes(
      existingShow.startTime
    );

    const existingEnd = timeToMinutes(
      existingShow.endTime
    );

    // Check whether the two time ranges overlap
    if (
      newStart < existingEnd &&
      newEnd > existingStart
    ) {
      return {
        invalid: false,
        conflict: true,
      };
    }
  }

  return {
    invalid: false,
    conflict: false,
  };
};

// ==========================================
// CREATE SHOW
// ==========================================
const createShow = async (req, res) => {
  try {
    const {
      movieId,
      theatreId,
      screenId,
      showDate,
      startTime,
      endTime,
      ticketPrice,
    } = req.body;

    // ==========================================
    // REQUIRED FIELDS
    // ==========================================
    if (
      !movieId ||
      !theatreId ||
      !screenId ||
      !showDate ||
      !startTime ||
      !endTime ||
      ticketPrice === undefined
    ) {
      return res.status(400).json({
        message: "Please provide all required show details",
      });
    }

    // ==========================================
    // TICKET PRICE VALIDATION
    // ==========================================
    if (ticketPrice < 0) {
      return res.status(400).json({
        message: "Ticket price cannot be negative",
      });
    }

    // ==========================================
    // TIME FORMAT VALIDATION
    // ==========================================
    const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (
      !timePattern.test(startTime) ||
      !timePattern.test(endTime)
    ) {
      return res.status(400).json({
        message: "Time must be in HH:MM format",
      });
    }

    // ==========================================
    // CHECK MOVIE
    // ==========================================
    const movie = await Movie.findOne({
      _id: movieId,
      status: "active",
    });

    if (!movie) {
      return res.status(404).json({
        message: "Movie not found or inactive",
      });
    }

    // ==========================================
    // CHECK THEATRE OWNERSHIP
    // ==========================================
    const theatre = await Theatre.findOne({
      _id: theatreId,
      ownerId: req.user.userId,
    });

    if (!theatre) {
      return res.status(404).json({
        message:
          "Theatre not found or does not belong to you",
      });
    }

    // ==========================================
    // THEATRE MUST BE APPROVED
    // ==========================================
    if (theatre.status !== "approved") {
      return res.status(400).json({
        message:
          "Theatre must be approved before creating shows",
      });
    }

    // ==========================================
    // CHECK SCREEN
    // ==========================================
    const screen = await Screen.findOne({
      _id: screenId,
      theatreId,
    });

    if (!screen) {
      return res.status(404).json({
        message: "Screen not found in this theatre",
      });
    }

    // ==========================================
    // SCREEN MUST BE ACTIVE
    // ==========================================
    if (screen.status !== "active") {
      return res.status(400).json({
        message: "Screen is inactive",
      });
    }

    // ==========================================
    // MAXIMUM 4 SHOWS PER SCREEN PER DAY
    // ==========================================
    const showCount = await Show.countDocuments({
      theatreId,
      screenId,
      showDate: new Date(showDate),
      status: "active",
    });

    if (showCount >= 4) {
      return res.status(400).json({
        message:
          "A screen can have maximum 4 shows per day",
      });
    }

    // ==========================================
    // CHECK TIME CONFLICT
    // ==========================================
    const conflictResult = await hasTimeConflict({
      theatreId,
      screenId,
      showDate,
      startTime,
      endTime,
    });

    if (conflictResult.invalid) {
      return res.status(400).json({
        message:
          "Start time must be earlier than end time",
      });
    }

    if (conflictResult.conflict) {
      return res.status(400).json({
        message:
          "Another show already exists during this time on this screen",
      });
    }

    // ==========================================
    // CREATE SHOW
    // ==========================================
    const show = await Show.create({
      movieId,
      theatreId,
      screenId,
      showDate: new Date(showDate),
      startTime,
      endTime,
      ticketPrice,
      status: "active",
    });

    res.status(201).json({
      message: "Show created successfully",
      show,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ==========================================
// GET MY SHOWS
// ==========================================
const getMyShows = async (req, res) => {
  try {
    const theatres = await Theatre.find({
      ownerId: req.user.userId,
    }).select("_id");

    const theatreIds = theatres.map(
      (theatre) => theatre._id
    );

    const shows = await Show.find({
      theatreId: {
        $in: theatreIds,
      },
    })
      .populate(
        "movieId",
        "title poster duration language"
      )
      .populate(
        "theatreId",
        "name city"
      )
      .populate(
        "screenId",
        "name totalSeats rows seatsPerRow"
      )
      .sort({
        showDate: 1,
        startTime: 1,
      });

    res.status(200).json({
      message: "Shows fetched successfully",
      shows,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ==========================================
// GET SHOW BY ID
// ==========================================
const getShowById = async (req, res) => {
  try {
    const show = await Show.findById(
      req.params.id
    )
      .populate(
        "movieId",
        "title description poster duration language"
      )
      .populate(
        "theatreId",
        "name address city ownerId"
      )
      .populate(
        "screenId",
        "name totalSeats rows seatsPerRow"
      );

    if (!show) {
      return res.status(404).json({
        message: "Show not found",
      });
    }

    // ==========================================
    // CHECK OWNERSHIP
    // ==========================================
    if (
      show.theatreId.ownerId.toString() !==
      req.user.userId
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to access this show",
      });
    }

    res.status(200).json({
      message: "Show fetched successfully",
      show,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE SHOW
// ==========================================
const updateShow = async (req, res) => {
  try {
    const {
      movieId,
      showDate,
      startTime,
      endTime,
      ticketPrice,
      status,
    } = req.body;

    const show = await Show.findById(
      req.params.id
    ).populate("theatreId");

    if (!show) {
      return res.status(404).json({
        message: "Show not found",
      });
    }

    // ==========================================
    // CHECK OWNERSHIP
    // ==========================================
    if (
      show.theatreId.ownerId.toString() !==
      req.user.userId
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to update this show",
      });
    }

    // ==========================================
    // CHECK MOVIE IF CHANGED
    // ==========================================
    if (movieId) {
      const movie = await Movie.findOne({
        _id: movieId,
        status: "active",
      });

      if (!movie) {
        return res.status(404).json({
          message: "Movie not found or inactive",
        });
      }

      show.movieId = movieId;
    }

    // ==========================================
    // NEW VALUES
    // ==========================================
    const newShowDate = showDate
      ? new Date(showDate)
      : show.showDate;

    const newStartTime =
      startTime ?? show.startTime;

    const newEndTime =
      endTime ?? show.endTime;

    const newTicketPrice =
      ticketPrice ?? show.ticketPrice;

    const newStatus =
      status ?? show.status;

    // ==========================================
    // PRICE VALIDATION
    // ==========================================
    if (newTicketPrice < 0) {
      return res.status(400).json({
        message: "Ticket price cannot be negative",
      });
    }

    // ==========================================
    // TIME FORMAT VALIDATION
    // ==========================================
    const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (
      !timePattern.test(newStartTime) ||
      !timePattern.test(newEndTime)
    ) {
      return res.status(400).json({
        message: "Time must be in HH:MM format",
      });
    }

    // ==========================================
    // CHECK MAXIMUM 4 SHOWS
    // ==========================================
    if (
      newStatus === "active" &&
      show.status !== "active"
    ) {
      const showCount =
        await Show.countDocuments({
          theatreId:
            show.theatreId._id,

          screenId:
            show.screenId,

          showDate: newShowDate,

          status: "active",

          _id: {
            $ne: show._id,
          },
        });

      if (showCount >= 4) {
        return res.status(400).json({
          message:
            "A screen can have maximum 4 active shows per day",
        });
      }
    }

    // ==========================================
    // CHECK TIME CONFLICT
    // ==========================================
    if (newStatus === "active") {
      const conflictResult =
        await hasTimeConflict({
          theatreId:
            show.theatreId._id,

          screenId:
            show.screenId,

          showDate:
            newShowDate,

          startTime:
            newStartTime,

          endTime:
            newEndTime,

          excludeShowId:
            show._id,
        });

      if (conflictResult.invalid) {
        return res.status(400).json({
          message:
            "Start time must be earlier than end time",
        });
      }

      if (conflictResult.conflict) {
        return res.status(400).json({
          message:
            "Another show already exists during this time on this screen",
        });
      }
    }

    // ==========================================
    // UPDATE SHOW
    // ==========================================
    show.showDate = newShowDate;

    show.startTime = newStartTime;

    show.endTime = newEndTime;

    show.ticketPrice = newTicketPrice;

    show.status = newStatus;

    await show.save();

    res.status(200).json({
      message: "Show updated successfully",
      show,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ==========================================
// DELETE SHOW
// ==========================================
const deleteShow = async (req, res) => {
  try {
    const show = await Show.findById(
      req.params.id
    ).populate("theatreId");

    if (!show) {
      return res.status(404).json({
        message: "Show not found",
      });
    }

    // ==========================================
    // CHECK OWNERSHIP
    // ==========================================
    if (
      show.theatreId.ownerId.toString() !==
      req.user.userId
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to delete this show",
      });
    }

    await Show.findByIdAndDelete(
      req.params.id
    );

    res.status(200).json({
      message: "Show deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ==========================================
// GET PUBLIC SHOWS
// ==========================================
const getPublicShows = async (req, res) => {
  try {
    const {
      movieId,
      theatreId,
      showDate,
    } = req.query;

    const filter = {
      status: "active",
    };

    if (movieId) {
      filter.movieId = movieId;
    }

    if (theatreId) {
      filter.theatreId = theatreId;
    }

    if (showDate) {
      filter.showDate = new Date(showDate);
    }

    const shows = await Show.find(filter)
      .populate(
        "movieId",
        "title poster duration language"
      )
      .populate(
        "theatreId",
        "name address city"
      )
      .populate(
        "screenId",
        "name totalSeats rows seatsPerRow"
      )
      .sort({
        showDate: 1,
        startTime: 1,
      });

    res.status(200).json({
      message:
        "Available shows fetched successfully",
      shows,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createShow,
  getMyShows,
  getShowById,
  updateShow,
  deleteShow,
  getPublicShows,
};