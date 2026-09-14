const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'students.json');

// Ensure students.json exists
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// Helper: read students from file
function readStudents() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return data ? JSON.parse(data) : [];
  } catch (err) {
    return [];
  }
}

// Helper: write students to file
function writeStudents(students) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(students, null, 2));
}

// HTML for the student registration form
function getFormHTML() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Student Record Form</title>
<style>
  body { font-family: Arial, sans-serif; background: #f4f6f8; margin: 0; padding: 40px; }
  .container { max-width: 480px; margin: 0 auto; background: #fff; padding: 30px 35px;
    border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
  h1 { text-align: center; color: #2c3e50; font-size: 22px; margin-bottom: 25px; }
  label { display: block; margin-bottom: 6px; color: #34495e; font-weight: bold; font-size: 14px; }
  input { width: 100%; padding: 10px; margin-bottom: 18px; border: 1px solid #ccd1d9;
    border-radius: 6px; box-sizing: border-box; font-size: 14px; }
  button { width: 100%; padding: 12px; background: #3498db; color: #fff; border: none;
    border-radius: 6px; font-size: 15px; cursor: pointer; }
  button:hover { background: #2980b9; }
  .link { display: block; text-align: center; margin-top: 18px; color: #3498db; text-decoration: none; }
</style>
</head>
<body>
  <div class="container">
    <h1>Student Record Form</h1>
    <form action="/add-student" method="POST">
      <label for="name">Student Name</label>
      <input type="text" id="name" name="name" required>

      <label for="roll">Roll Number</label>
      <input type="text" id="roll" name="roll" required>

      <label for="course">Course</label>
      <input type="text" id="course" name="course" required>

      <label for="email">Email</label>
      <input type="email" id="email" name="email" required>

      <button type="submit">Add Student</button>
    </form>
    <a class="link" href="/students">View All Students →</a>
  </div>
</body>
</html>
`;
}

// HTML for displaying student records
function getStudentsHTML(students) {
  const rows = students.map((s, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${escapeHTML(s.name)}</td>
        <td>${escapeHTML(s.roll)}</td>
        <td>${escapeHTML(s.course)}</td>
        <td>${escapeHTML(s.email)}</td>
      </tr>`).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Student Records</title>
<style>
  body { font-family: Arial, sans-serif; background: #f4f6f8; margin: 0; padding: 40px; }
  .container { max-width: 700px; margin: 0 auto; background: #fff; padding: 30px 35px;
    border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
  h1 { text-align: center; color: #2c3e50; font-size: 22px; margin-bottom: 25px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; font-size: 14px; }
  th { background: #3498db; color: #fff; }
  tr:hover { background: #f9f9f9; }
  .link { display: block; text-align: center; margin-top: 20px; color: #3498db; text-decoration: none; }
  .empty { text-align: center; color: #888; padding: 20px 0; }
</style>
</head>
<body>
  <div class="container">
    <h1>All Student Records</h1>
    ${students.length === 0
      ? '<p class="empty">No student records found yet.</p>'
      : `<table>
          <tr><th>#</th><th>Name</th><th>Roll No.</th><th>Course</th><th>Email</th></tr>
          ${rows}
        </table>`}
    <a class="link" href="/">← Back to Form</a>
  </div>
</body>
</html>
`;
}

function escapeHTML(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const server = http.createServer((req, res) => {
  const { method, url } = req;

  // Route: GET / -> show form
  if (method === 'GET' && url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(getFormHTML());

  // Route: POST /add-student -> save data
  } else if (method === 'POST' && url === '/add-student') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const formData = querystring.parse(body);
      const newStudent = {
        name: formData.name || '',
        roll: formData.roll || '',
        course: formData.course || '',
        email: formData.email || ''
      };

      const students = readStudents();
      students.push(newStudent);
      writeStudents(students);

      // Redirect to /students after saving
      res.writeHead(302, { Location: '/students' });
      res.end();
    });

  // Route: GET /students -> display all records
  } else if (method === 'GET' && url === '/students') {
    const students = readStudents();
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(getStudentsHTML(students));

  // 404 for everything else
  } else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<h1>404 - Page Not Found</h1><a href="/">Go back home</a>');
  }
});

server.listen(PORT, () => {
  console.log(`✅ Server is running! Welcome message: Student Record App started successfully.`);
  console.log(`👉 Open your browser at: http://localhost:${PORT}`);
});