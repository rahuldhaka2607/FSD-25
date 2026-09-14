const express = require("express");

const app = express();
const PORT = 3000;

app.use(express.json());

const products = require("./products.json");

app.get("/", (req, res) => {
    res.send("Welcome to Products REST API");
});

app.get("/products", (req, res) => {
    res.json(products);
});

app.get("/products/:id", (req, res) => {
    const id = parseInt(req.params.id);

    const product = products.find(p => p.id === id);

    if (!product) {
        return res.status(404).json({
            message: "Product not found"
        });
    }

    res.json(product);
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});