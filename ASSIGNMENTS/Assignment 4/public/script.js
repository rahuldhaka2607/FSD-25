let editId = null;

document.addEventListener("DOMContentLoaded", fetchRequests);

document.getElementById("requestForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const payload = {
        studentName: document.getElementById("studentName").value,
        email: document.getElementById("email").value,
        category: document.getElementById("category").value,
        priority: document.getElementById("priority").value,
        description: document.getElementById("description").value
    };

    try {
        const url = editId ? `/api/requests/${editId}` : "/api/requests";
        const method = editId ? "PUT" : "POST";
        
        await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        showMessage(editId ? "Updated successfully!" : "Submitted successfully!", "success");
        resetForm();
        fetchRequests();
    } catch (err) {
        showMessage("Error processing request.", "error");
    }
});

document.getElementById("cancelBtn").addEventListener("click", resetForm);

async function fetchRequests() {
    const res = await fetch("/api/requests");
    const data = await res.json();
    renderRequests(data);
}

function renderRequests(requests) {
    const list = document.getElementById("requestsList");
    list.innerHTML = "";
    
    // Show newest first
    requests.reverse().forEach(req => {
        list.innerHTML += `
            <div class="req-card">
                <div class="req-header">
                    <div>
                        <h3 class="req-title">${req.studentName}</h3>
                        <div class="req-meta">${req.category} • ID: ${req.id}</div>
                    </div>
                    <span class="badge ${req.priority.toLowerCase()}">${req.priority}</span>
                </div>
                <div class="req-desc">${req.description}</div>
                <div class="req-footer">
                    <button class="btn secondary small" onclick="editRequest(${req.id})">Edit</button>
                    <button class="btn secondary small" style="color:var(--danger)" onclick="deleteRequest(${req.id})">Delete</button>
                </div>
            </div>
        `;
    });
}

async function editRequest(id) {
    const res = await fetch(`/api/requests/${id}`);
    const req = await res.json();
    
    document.getElementById("studentName").value = req.studentName;
    document.getElementById("email").value = req.email;
    document.getElementById("category").value = req.category;
    document.getElementById("priority").value = req.priority;
    document.getElementById("description").value = req.description;
    
    editId = id;
    document.getElementById("submitBtn").innerText = "Update";
    document.getElementById("cancelBtn").classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deleteRequest(id) {
    if (confirm("Delete this request?")) {
        await fetch(`/api/requests/${id}`, { method: "DELETE" });
        fetchRequests();
    }
}

function resetForm() {
    document.getElementById("requestForm").reset();
    editId = null;
    document.getElementById("submitBtn").innerText = "Submit";
    document.getElementById("cancelBtn").classList.add("hidden");
}

function showMessage(text, type) {
    const msg = document.getElementById("formMessage");
    msg.textContent = text;
    msg.className = `message ${type}`;
    setTimeout(() => msg.classList.add("hidden"), 3000);
}
