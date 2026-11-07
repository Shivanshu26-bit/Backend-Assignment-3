const express = require("express");
const router = express.Router();

const Product = require("../models/Product");

// CREATE PRODUCT
router.post("/", async (req, res, next) => {
    try {
        const product = await Product.create(req.body);

        res.status(201).json(product);

    } catch (error) {
        next(error);
    }
});


// GET ALL PRODUCTS
// Filtering, Sorting and Pagination
router.get("/", async (req, res, next) => {
    try {
        // Get query parameters
        const {
            category,
            search,
            sortBy = "createdAt",
            order = "desc"
        } = req.query;

        // Pagination
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(
            Math.max(parseInt(req.query.limit, 10) || 10, 1),
            100
        );

        const skip = (page - 1) * limit;

        // Filtering
        const filter = {};

        if (category) {
            filter.category = category;
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { sku: { $regex: search, $options: "i" } },
                { supplier: { $regex: search, $options: "i" } }
            ];
        }

        // Sorting
        const allowedSortFields = [
            "name",
            "price",
            "quantity",
            "category",
            "createdAt"
        ];

        const validSortBy = allowedSortFields.includes(sortBy)
            ? sortBy
            : "createdAt";

        const sortOrder = order === "asc" ? 1 : -1;

        // Fetch products and total count
        const [products, total] = await Promise.all([
            Product.find(filter)
                .sort({ [validSortBy]: sortOrder })
                .skip(skip)
                .limit(limit),

            Product.countDocuments(filter)
        ]);

        // Response
        res.status(200).json({
            total,
            page,
            totalPages: Math.ceil(total / limit),
            count: products.length,
            products
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;