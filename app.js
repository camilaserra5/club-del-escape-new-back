const express = require("express");
const axios = require("axios");
const app = express();
const cors = require("cors");
const { mercadopago } = require("./mercadopago");
app.use(cors());
app.use(express.json());

app.post("/mercadopago", async (req, res) => {
  let preference = {
    items: [
      {
        title: req.body.title,
        unit_price: req.body.price,
        quantity: 1,
        description: req.body.description
      }
    ],
    back_urls: {
      success: "http://localhost:3000/success",
      pending: "http://localhost:3000/pending",
      failure: "http://localhost:3000/failure"
    },
    payment_methods: {
      excluded_payment_types: [
        {
          id: "ticket",
        }
      ]
    }
  };

  mercadopago.preferences
    .create(preference)
    .then(function (response) {
      console.log(response.body);
      res.status(200).json({ preferenceId: response.body.id });
    })
    .catch(function (error) {
      console.log(error);
    });
});

app.post("/webhooks", async (req, res) => {
  console.log(req.body);
  return res.status(200).send("OK");
});

app.listen(8080, () => {
  console.log("server started on port 5000");
});
