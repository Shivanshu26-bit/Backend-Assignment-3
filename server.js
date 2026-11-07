require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");

const productRoutes = require("./routes/productRoutes");
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

// Middleware
app.use(express.json());

// Home route
app.get("/", (req, res) => {
    res.json({
        message: "Inventory Management API is running!"
    });
});

// Product routes
app.use("/api/products", productRoutes);

// Centralized error handling
app.use(errorMiddleware);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();