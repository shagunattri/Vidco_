// JWT = Shagun eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZjJkYTc0ZDkzYWE5ZjIwZTRiMmI0YzYiLCJpYXQiOjE1OTY4Mjc0Njl9.RFh8lhsVuvrudRNQwVID1NgFWMzD7Vno6mIgKAAPpD0

const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const requireDoctor = require("../middlewares/requiredDoctor");

const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");

const router = express.Router();

router.post("/api/v1/patient/signup", async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const user = new Patient({ email, password, name });
    await user.save();
    const token = jwt.sign({ userId: user._id }, "PATIENT SECRETE KEY");
    res.send({ token, user });
  } catch (err) {
    return res.status(422).send(err.message);
  }
});

router.post("/api/v1/patient/signin", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(404).send({ error: "Must provide email and password." });
  }
  const user = await Patient.findOne({ email });
  if (!user) {
    return res.status(404).send({ error: "Invalid password or email." });
  }
  try {
    await user.comparePassword(password);
    const token = jwt.sign({ userId: user._id }, "PATIENT SECRETE KEY");
    res.send({ token, user });
  } catch (err) {
    return res.status(404).send({ error: "Invalid password or email." });
  }
});

router.put("/api/v1/patient/panic/:id", requireDoctor, async (req, res) => {
  const { patientId } = req.params;
  try {
    const update = { panic: true };
    const status = await Patient.findByIdAndUpdate(patientId, update, {
      new: true,
    });
    res.send(status);
  } catch (err) {
    return res.status(404).send({ error: err.message });
  }
});

router.get("/api/v1/getdoctors", async (req, res) => {
  const docs = await Doctor.find({});
  res.send(docs);
});

module.exports = router;
