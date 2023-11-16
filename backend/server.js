require("dotenv").config();
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const moment = require("moment");
const port = 5000;

app.use(express.json());
app.use(bodyParser.json());

const [basic, standard, plus] = [
  "price_1OCygDSHmrZ8FAtqPmTXPUlh",
  "price_1OCyhrSHmrZ8FAtqVFYuQd4b",
  "price_1OCyi9SHmrZ8FAtqAMFgJHCR",
];

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://saas-plan-stripe-default-rtdb.firebaseio.com",
});

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

const stripeSession = async (plan) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: plan,
          quantity: 1,
        },
      ],
      success_url: "http://localhost:5173/success",
      cancel_url: "http://localhost:5173/cancel",
    });
    return session;
  } catch (e) {
    return e;
  }
};

app.post("/api/v1/create-subscription-checkout-session", async (req, res) => {
  const { plan, customerId } = req.body;
  let planId = null;
  if (plan == 0) planId = basic;
  else if (plan == 4999) planId = standard;
  else if (plan == 3999) planId = plus;

  try {
    const session = await stripeSession(planId);
    const user = await admin.auth().getUser(customerId);

    await admin
      .database()
      .ref("users")
      .child(user.uid)
      .update({
        subscription: {
          sessionId: session.id,
        },
      });
    return res.json({ session });
  } catch (error) {
    res.send(error);
  }
});
