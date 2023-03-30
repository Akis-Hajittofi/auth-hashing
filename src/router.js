const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const secret = process.env.JWT_SECRET;
const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hash = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      // data: { username, password: hash }
      // Maybe in bigger use cases, there will be more data,
      // so the solution below could be better

      // Anything after the comma won't be included in the spread syntax
      data: { ...req.body, password: hash },
    });
    res.json({ user: { id: user.id, username: user.username, hash: hash } });
  } catch (error) {
    res.status(500).json({ error: "Cannot be registered!" });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const checkUser = await prisma.user.findUnique({
    where: { username: username },
  });

  const checkPasswordsMatch = await bcrypt.compare(
    password,
    checkUser.password
  );

  if (!checkUser) {
    res.status(401).json({ error: "Username invalid!" });
  } else if (!checkPasswordsMatch) {
    res.status(401).json({ error: "Password invalid!" });
  } else {
    res.json(jwt.sign(checkUser.username, secret));
  }
});

module.exports = router;
