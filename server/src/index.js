const express = require("express");
const { v4: uuid } = require("uuid");
const fs = require("fs/promises");
const path = require("path");
const passwordHash = require("password-hash");
const jwt = require("jsonwebtoken");
let users = [];

function saveUserToFile(user) {
  users.push(user);
  fs.writeFile(
    path.join(__dirname, "../data/users.json"),
    JSON.stringify(users)
  ).then((user) => {
    console.log("user saved to user.json file");
  });
}

function readUserFromFile() {
  fs.readFile(path.join(__dirname, "../data/users.json")).then((data) => {
    console.log("data", data);
    if (data.toString()) {
      users = JSON.parse(data.toString());
    }
  });
}

readUserFromFile();

const app = express();

app.use(express.json());

app.listen(4000, () => {
  console.log("Server is listening at port 4000...");
});

app.get("/", (req, res) => {
  return res.json({ msg: "api is working" });
});

app.get("/api/users", (req, res) => {
  return res.json({ users: users });
});

app.post("/api/users/register", (req, res) => {
  const user = req.body;
  user.id = uuid();
  user.password = passwordHash.generate(user.password);
  saveUserToFile(user);
  return res.json({ user });
});

app.post("/api/users/login", (req, res) => {
  const { email, password } = req.body;
  console.log(email + "    " + password);

  const user = users.find((user) => user.email === email);
  if (user && passwordHash.verify(password, user.password)) {
    const token = jwt.sign(user, "secret@123");
    return res.status(200).json({ msg: "Logged in successfully", token });
  } else {
    return res.status(404).json({ msg: "invalid email or password" });
  }
});

const data = { id: 1, name: "pawan" };
const token = jwt.sign(data, "secret@123");
console.log("token", token);
