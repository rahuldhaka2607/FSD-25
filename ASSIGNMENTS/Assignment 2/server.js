const express = require("express");
const { exec } = require("child_process");

const app = express();
const PORT = 3000;

app.use(express.json());

const products = require("./products.json");

// Home Route
app.get("/", (req, res) => {
    res.redirect("/api/products");
});

// Get All Products
app.get("/api/products", (req, res) => {
    res.json(products);
});

// Get Product By ID
app.get("/api/products/:id", (req, res) => {
    const id = parseInt(req.params.id);

    const product = products.find(p => p.id === id);

    if (!product) {
        return res.status(404).json({
            message: "Product not found"
        });
    }

    res.json(product);
});

// Get Products By Category
app.get("/api/products/category/:category", (req, res) => {
    const category = req.params.category.toLowerCase();

    const filteredProducts = products.filter(
        p => p.category.toLowerCase() === category
    );

    res.json(filteredProducts);
});

// Add New Product
app.post("/api/products", (req, res) => {
    const newProduct = {
        id: products.length + 1,
        name: req.body.name,
        price: req.body.price,
        category: req.body.category
    };

    products.push(newProduct);

    res.status(201).json({
        message: "Product added successfully",
        product: newProduct
    });
});

// Delete Product
app.delete("/api/products/:id", (req, res) => {
    const id = parseInt(req.params.id);

    const index = products.findIndex(p => p.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "Product not found"
        });
    }

    const deletedProduct = products.splice(index, 1);

    res.json({
        message: "Product deleted successfully",
        product: deletedProduct[0]
    });
});

// Start Server and Open Browser Automatically
app.listen(PORT, () => {
    const url = `http://localhost:${PORT}/api/products`;

    console.log(`Server running at ${url}`);

    exec(`start ${url}`);
});