require("dotenv").config();
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const moment = require("moment");
const port = 5000;
