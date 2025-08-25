import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const port = 3000;

app.use(bodyParser.json());

// --- API ENDPOINT ---
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "user" && password === "pass") {
    return res.status(200).json({ message: "Login successful", token: "abc123" });
  }

  return res.status(401).json({ message: "Invalid credentials" });
});

// --- SIMPLE UI PAGE ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "mockLogin.html"));
});

// --- Start server ---
app.listen(port, () => {
  console.log(`🚀 Mock server running at http://localhost:${port}`);
});
