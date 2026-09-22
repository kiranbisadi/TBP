const Booking = require("../models/booking");
const Show = require("../models/Show");
const Screen = require("../models/screen");

// HELPER: GENERATE SEAT NUMBERS

const generateSeats = (rows, seatsPerRow) => {
  const seats = [];

  for (let row = 0; row < rows; row++) {
    const rowLetter = String.fromCharCode(65 + row);

    for (let seat = 1; seat <= seatsPerRow; seat++) {
      seats.push(`${rowLetter}${seat}`);
    }
  }

  return seats;
};

// CREATE BOOKING

const createBooking = async (req, res) => {
  try {
    const { showId, seats } = req.body;

    // CHECK INPUT
    
    if (!showId || !seats || !Array.isArray(seats)) {
      return res.status(400).json({
        message: "Please provide showId and seats",
      });
    }

    // Must select at least one seat
    if (seats.length === 0) {
      return res.status(400).json({
        message: "Please select at least one seat",
      });
    }

    // Maximum 6 seats per booking
    if (seats.length > 6) {
      return res.status(400).json({
        message: "You can book maximum 6 seats at a time",
      });
    }

    // CHECK DUPLICATE SEATS IN REQUEST

    const uniqueSeats = [...new Set(seats)];

    if (uniqueSeats.length !== seats.length) {
      return res.status(400).json({
        message: "Duplicate seats are not allowed",
      });
    }

    // GET SHOW
    
    const show = await Show.findOne({
      _id: showId,
      status: "active",
    });

    if (!show) {
      return res.status(404).json({
        message: "Show not found or inactive",
      });
    }

    // GET SCREEN
    
    const screen = await Screen.findOne({
      _id: show.screenId,
      status: "active",
    });

    if (!screen) {
      return res.status(404).json({
        message: "Screen not found or inactive",
      });
    }

    // ==========================================
    // GENERATE VALID SEATS
    // ==========================================
    const validSeats = generateSeats(
      screen.rows,
      screen.seatsPerRow
    );

    // CHECK SELECTED SEATS ARE VALID
    
    for (const seat of seats) {
      if (!validSeats.includes(seat)) {
        return res.status(400).json({
          message: `Invalid seat: ${seat}`,
        });
      }
    }

    // FIND ALREADY BOOKED SEATS
    
    const existingBookings = await Booking.find({
      showId,
      status: "booked",
    });

    const bookedSeats = [];

    for (const booking of existingBookings) {
      bookedSeats.push(...booking.seats);
    }

    // CHECK IF SELECTED SEATS ARE ALREADY BOOKED
    
    const alreadyBooked = seats.filter((seat) =>
      bookedSeats.includes(seat)
    );

    if (alreadyBooked.length > 0) {
      return res.status(400).json({
        message: "Some selected seats are already booked",
        seats: alreadyBooked,
      });
    }

    // CALCULATE TOTAL
    
    const totalAmount =
      seats.length * show.ticketPrice;

    // CREATE BOOKING
    
    const booking = await Booking.create({
      userId: req.user.userId,
      showId,
      seats,
      totalAmount,
      status: "booked",
    });

    // RETURN BOOKING
    
    res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// GET AVAILABLE / BOOKED SEATS

const getShowSeats = async (req, res) => {
  try {
    const { showId } = req.params;

    // GET SHOW
    
    const show = await Show.findOne({
      _id: showId,
      status: "active",
    });

    if (!show) {
      return res.status(404).json({
        message: "Show not found or inactive",
      });
    }

    // GET SCREEN
    
    const screen = await Screen.findOne({
      _id: show.screenId,
      status: "active",
    });

    if (!screen) {
      return res.status(404).json({
        message: "Screen not found or inactive",
      });
    }

    // GENERATE ALL SEATS
    
    const allSeats = generateSeats(
      screen.rows,
      screen.seatsPerRow
    );

    // GET BOOKINGS

    const bookings = await Booking.find({
      showId,
      status: "booked",
    }).select("seats");

    // GET BOOKED SEATS
    
    const bookedSeats = [];

    for (const booking of bookings) {
      bookedSeats.push(...booking.seats);
    }

    // GET AVAILABLE SEATS
   
    const availableSeats = allSeats.filter(
      (seat) => !bookedSeats.includes(seat)
    );

    res.status(200).json({
      message: "Seat availability fetched successfully",
      totalSeats: allSeats.length,
      bookedSeats,
      availableSeats,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// GET MY BOOKINGS

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      userId: req.user.userId,
    })
      .populate(
        "showId",
        "showDate startTime endTime ticketPrice"
      )
      .populate(
        {
          path: "showId",
          populate: [
            {
              path: "movieId",
              select: "title poster",
            },
            {
              path: "theatreId",
              select: "name city",
            },
            {
              path: "screenId",
              select: "name",
            },
          ],
        }
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Bookings fetched successfully",
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// GET BOOKING BY ID

const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    }).populate({
      path: "showId",
      populate: [
        {
          path: "movieId",
          select: "title poster",
        },
        {
          path: "theatreId",
          select: "name address city",
        },
        {
          path: "screenId",
          select: "name",
        },
      ],
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    res.status(200).json({
      message: "Booking fetched successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// CANCEL BOOKING

const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        message: "Booking is already cancelled",
      });
    }

    booking.status = "cancelled";

    await booking.save();

    res.status(200).json({
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createBooking,
  getShowSeats,
  getMyBookings,
  getBookingById,
  cancelBooking,
};