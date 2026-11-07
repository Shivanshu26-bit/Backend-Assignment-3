# Inventory Management System

**Made by Shivanshu Shukla**  
Roll No - 2501060131
BCA – Artificial Intelligence & Data Science | Semester 3  
Backend Assignment 3

---

This is my Backend Assignment 3 project, a backend for managing inventory built with Node.js, Express.js, MongoDB and Mongoose. It's basically a bunch of REST APIs that let you manage products, keep track of stock, get low-stock alerts and see a summary of inventory by category.

I used MongoDB Atlas for the database, Express to handle the requests, and Mongoose for the models, validation and queries.

## What it can do

**Products**
- Create a new product
- Get all products
- Get a single product by its ID
- Update a product
- Delete a product

**Filter, search, sort and pagination**
- Filter products by category
- Search by name, SKU or supplier
- Sort by name, price, quantity, category or creation date
- Get products page by page using pagination

**Stock adjustment**
- Increase the stock of a product
- Decrease the stock of a product
- Stock can never go negative (you get an error if you try to remove more than what's available)
- The stock adjustment request is validated before anything gets updated

**Low stock alerts**
- Finds products where quantity is less than or equal to the reorder level
- Shows them with the lowest quantity first

**Inventory summary (aggregation)**

I used the MongoDB aggregation pipeline for this one. It gives:
- Total products in each category
- Total quantity in each category
- Total stock value of products in each category.
- Average product price

**Error handling**
- One central error handling middleware
- Mongoose validation errors are handled properly
- Proper HTTP status codes for the responses

## Folder structure

```
Inventory-Management-System/
│
├── config/
│   └── db.js
│
├── middleware/
│   └── errorMiddleware.js
│
├── models/
│   └── Product.js
│
├── routes/
│   └── productRoutes.js
│
├── .env
├── .gitignore
├── package.json
├── package-lock.json
└── server.js
```

## What you need before running it

- Node.js and npm
- A MongoDB Atlas account
- Postman (for testing the APIs)

## How to run it

1. Clone the repo

```
git clone https://github.com/Shivanshu26-bit/Backend-Assignment-3.git
```

2. Go into the folder

```
cd Backend-Assignment-3
```

3. Install the packages

```
npm install
```

4. Make a `.env` file in the root folder and add this

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

Just replace `your_mongodb_connection_string` with your own MongoDB Atlas connection string.

5. Start the server

```
npm start
```

The server will run at `http://localhost:5000`

## API

Base URL: `http://localhost:5000/api/products`

You can add these query params to the get all products request:

```
?category=Stationery
?search=Gel
?sortBy=price&order=asc
?page=1&limit=5
```

## Testing

I tested all the APIs using Postman. Here's what I checked:

- Creating and getting products
- Updating and deleting products
- Filtering, searching, sorting and pagination
- Increasing and decreasing stock
- Trying to remove more stock than available (it correctly gives an error)
- Low stock report
- Category-wise summary

I made sure both the normal responses and the error responses were working the way they should.

## My part in this project

I built the whole backend on my own. This is what I did:

1. Set up the Node.js and Express.js project
2. Connected it to MongoDB Atlas
3. Made the Product model using Mongoose
4. Wrote the CRUD APIs
5. Added filtering, sorting and pagination
6. Added stock adjustment with validation
7. Made the low-stock alert feature
8. Used MongoDB aggregation for the inventory summary
9. Tested all the endpoints in Postman
10. Handled version control and put the code on GitHub

## Links

GitHub: https://github.com/Shivanshu26-bit/Backend-Assignment-3
