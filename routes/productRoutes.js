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

// LOW-STOCK ALERT REPORT
router.get("/low-stock", async (req, res, next) => {
    try {
        const lowStockItems = await Product.find({
            $expr: {
                $lte: ["$quantity", "$reorderLevel"]
            }
        }).sort({ quantity: 1 });

        res.status(200).json({
            count: lowStockItems.length,
            lowStockItems
        });

    } catch (error) {
        next(error);
    }
});

// CATEGORY-WISE INVENTORY SUMMARY
router.get("/summary", async (req, res, next) => {
    try {
        const summary = await Product.aggregate([
            {
                $group: {
                    _id: "$category",

                    totalItems: {
                        $sum: 1
                    },

                    totalQuantity: {
                        $sum: "$quantity"
                    },

                    totalStockValue: {
                        $sum: {
                            $multiply: ["$price", "$quantity"]
                        }
                    },

                    avgPrice: {
                        $avg: "$price"
                    }
                }
            },
            {
                $sort: {
                    _id: 1
                }
            },
            {
                $project: {
                    _id: 1,
                    totalItems: 1,
                    totalQuantity: 1,
                    totalStockValue: {
                        $round: ["$totalStockValue", 2]
                    },
                    avgPrice: {
                        $round: ["$avgPrice", 2]
                    }
                }
            }
        ]);

        res.status(200).json({
            categories: summary.length,
            summary
        });

    } catch (error) {
        next(error);
    }
});

// GET SINGLE PRODUCT BY ID
router.get("/:id", async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json(product);

    } catch (error) {
        next(error);
    }
});


// UPDATE PRODUCT
router.put("/:id", async (req, res, next) => {
    try {
        const allowedFields = [
            "name",
            "sku",
            "category",
            "price",
            "quantity",
            "reorderLevel",
            "supplier"
        ];

        const updates = {};

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                message: "No valid fields provided for update"
            });
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            {
    returnDocument: "after",
    runValidators: true
}
        );

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json(product);

    } catch (error) {
        next(error);
    }
});

// DELETE PRODUCT
router.delete("/:id", async (req, res, next) => {
    try {
        const product = await Product.findByIdAndDelete(
            req.params.id
        );

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json({
            message: "Product deleted successfully",
            id: product._id
        });

    } catch (error) {
        next(error);
    }
});


// STOCK ADJUSTMENT
router.patch("/:id/stock", async (req, res, next) => {
    try {
        const { change } = req.body || {};

        // Validate stock change
        if (!Number.isInteger(change) || change === 0) {
            return res.status(400).json({
                message: "Change must be a non-zero integer"
            });
        }

        // Prevent negative stock using an atomic update
        const filter = { _id: req.params.id };

        if (change < 0) {
            filter.quantity = { $gte: Math.abs(change) };
        }

        const product = await Product.findOneAndUpdate(
            filter,
            { $inc: { quantity: change } },
            { returnDocument: "after" }
        );

        if (!product) {
            const exists = await Product.exists({
                _id: req.params.id
            });

            if (!exists) {
                return res.status(404).json({
                    message: "Product not found"
                });
            }

            return res.status(400).json({
                message: "Insufficient stock"
            });
        }

        res.status(200).json({
            message: "Stock updated successfully",
            product
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;