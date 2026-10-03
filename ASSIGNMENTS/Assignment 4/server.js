import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const dataFile = path.join(__dirname, "requests.json");

function readRequests() {
    try {
        const data = fs.readFileSync(dataFile, "utf8");
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading requests.json:", error);
        return [];
    }
}

function writeRequests(requests) {
    try {
        fs.writeFileSync(dataFile, JSON.stringify(requests, null, 2), "utf8");
    } catch (error) {
        console.error("Error writing requests.json:", error);
    }
}

// 1. GET ALL REQUESTS
app.get("/api/requests", (req, res) => {
    const requests = readRequests();
    res.json(requests);
});

// 2. GET REQUEST BY ID
app.get("/api/requests/:id", (req, res) => {
    const requests = readRequests();
    const id = parseInt(req.params.id);
    const request = requests.find(r => r.id === id);

    if (request) {
        res.json(request);
    } else {
        res.status(404).json({ message: "Request not found" });
    }
});

// 3. CREATE REQUEST
app.post("/api/requests", (req, res) => {
    const { studentName, email, category, description, priority } = req.body;

    if (!studentName || !email || !category || !description || !priority) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
    }

    const requests = readRequests();
    
    // Generate a unique ID
    const maxId = requests.length > 0 ? Math.max(...requests.map(r => r.id)) : 0;
    const newId = maxId + 1;

    const newRequest = {
        id: newId,
        studentName,
        email,
        category,
        description,
        priority,
        status: "Pending",
        createdAt: new Date().toISOString()
    };

    requests.push(newRequest);
    writeRequests(requests);

    res.status(201).json(newRequest);
});

// 4. UPDATE REQUEST
app.put("/api/requests/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const { studentName, email, category, description, priority } = req.body;

    const requests = readRequests();
    const index = requests.findIndex(r => r.id === id);

    if (index === -1) {
        return res.status(404).json({ message: "Request not found" });
    }

    // Update allowed fields
    const requestToUpdate = requests[index];
    if (studentName) requestToUpdate.studentName = studentName;
    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
        requestToUpdate.email = email;
    }
    if (category) requestToUpdate.category = category;
    if (description) requestToUpdate.description = description;
    if (priority) requestToUpdate.priority = priority;

    requests[index] = requestToUpdate;
    writeRequests(requests);

    res.json(requestToUpdate);
});

// 5. DELETE REQUEST
app.delete("/api/requests/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const requests = readRequests();
    const index = requests.findIndex(r => r.id === id);

    if (index === -1) {
        return res.status(404).json({ message: "Request not found" });
    }

    requests.splice(index, 1);
    writeRequests(requests);

    res.json({ message: "Request deleted successfully" });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
