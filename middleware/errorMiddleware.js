const errorMiddleware = (err, req, res, next) => {

    console.error(err);

    // Duplicate SKU error
    if (err.code === 11000) {
        return res.status(409).json({
            message: "SKU already exists"
        });
    }

    // Mongoose validation error
    if (err.name === "ValidationError") {
        return res.status(400).json({
            message: "Validation Failed",
            errors: Object.values(err.errors).map(
                error => error.message
            )
        });
    }

    // Invalid MongoDB ID
    if (err.name === "CastError") {
        return res.status(400).json({
            message: "Invalid ID or value"
        });
    }

    res.status(500).json({
        message: err.message || "Internal Server Error"
    });
};

module.exports = errorMiddleware;