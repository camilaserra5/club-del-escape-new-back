const express = require("express");
const request = require("request");
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
        description: req.body.description,
      },
    ],
    back_urls: {
      success: "https://club-del-escape-new-front.vercel.app/success",
      pending: "https://club-del-escape-new-front.vercel.app/pending",
      failure: "https://club-del-escape-new-front.vercel.app/failure",
    },
    payment_methods: {
      excluded_payment_types: [
        {
          id: "ticket",
        },
      ],
    },
    auto_return: "approved",
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

app.get("products", (req, res) => {
  const url = `https://api.bookeo.com/v2/settings/products?secretKey=${secretKey}&apiKey=${apiKey}`;
  request({ url }, (error, response, body) => {
    if (error || response.statusCode !== 200) {
      console.error(error);
      return res.status(500).json({ type: "error", message: error });
    }

    res.json(JSON.parse(body));
  });
});

app.get("/slots", (req, res) => {
  const apiKey = "AJN9H4KPKRCTEHAXM9HXJ41558697WMR1777F47D4D4";
  const secretKey = "IPEwY87K3Eoskq4c2EiDQ0jP4RwM2P5A";
  const { dateFrom, dateTo } = req.query;
  const startTime = `${dateFrom}T09:00:00-03:00`;
  const endTime = `${dateTo}T03:00:00-03:00`;
  const url = `https://api.bookeo.com/v2/availability/slots?apiKey=${apiKey}&secretKey=${secretKey}&startTime=${startTime}&endTime=${endTime}&itemsPerPage=300`;
  request({ url }, (error, response, body) => {
    if (error || response.statusCode !== 200) {
      console.error(error);
      return res.status(500).json({ type: "error", message: error });
    }

    res.json(JSON.parse(body));
  });
});

app.post("/hold-slot", (req, res) => {
  const apiKey = "AJN9H4KPKRCTEHAXM9HXJ41558697WMR1777F47D4D4";
  const secretKey = "IPEwY87K3Eoskq4c2EiDQ0jP4RwM2P5A";
  const { eventId, productId, participants } = req.body;
  const url = `https://api.bookeo.com/v2/holds?apiKey=${apiKey}&secretKey=${secretKey}`;

  const options = {
    method: "POST",
    url,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      eventId: eventId,
      participants: {
        numbers: [
          {
            peopleCategoryId: "Cadults",
            number: participants,
          },
        ],
      },
      productId: productId,
    }),
  };
  request(options, (error, response, body) => {
    if (error || response.statusCode !== 201) {
      console.log(`${response.body}`);
      return res.status(500).json({ type: "error", message: error });
    }
    const jsonResponse = JSON.parse(response.body);

    res.json({
      slotId: jsonResponse.id,
      price: jsonResponse.price.totalGross.amount,
    });
  });
});

app.post("/create-reservation", (req, res) => {
  const apiKey = "AJN9H4KPKRCTEHAXM9HXJ41558697WMR1777F47D4D4";
  const secretKey = "IPEwY87K3Eoskq4c2EiDQ0jP4RwM2P5A";
  const {
    holdId,
    eventId,
    firstName,
    lastName,
    email,
    phoneNumber,
    paymentId,
    participants,
    productId,
  } = req.body;
  const url = `https://api.bookeo.com/v2/bookings?apiKey=${apiKey}&secretKey=${secretKey}&previousHoldId=${holdId}&notifyUsers=true&notifyCustomer=true`;

  console.log(
    JSON.stringify({
      eventId: eventId,
      customer: {
        firstName: firstName,
        lastName: lastName,
        emailAddress: email,
        phoneNumbers: [
          {
            number: phoneNumber,
            type: "mobile",
          },
        ],
      },
      participants: {
        numbers: [
          {
            peopleCategoryId: "Cadults",
            number: participants,
          },
        ],
      },
      productId: productId,
      initialPayments: [
        {
          paymentMethod: "other",
          paymentMethodOther: "Mercado Pago",
          reason: "Seña",
          comment: "Este es el id de pago de mp: " + paymentId,
          amount: {
            amount: "1000",
            currency: "ARS",
          },
        },
      ],
    })
  );
  const options = {
    method: "POST",
    url,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      eventId: eventId,
      customer: {
        firstName: firstName,
        lastName: lastName,
        emailAddress: email,
        phoneNumbers: [
          {
            number: phoneNumber,
            type: "mobile",
          },
        ],
      },
      participants: {
        numbers: [
          {
            peopleCategoryId: "Cadults",
            number: participants,
          },
        ],
      },
      productId: productId,
      initialPayments: [
        {
          paymentMethod: "other",
          paymentMethodOther: "Mercado Pago",
          reason: "Seña",
          comment: "Este es el id de pago de mp: " + paymentId,
          amount: {
            amount: "1000",
            currency: "ARS",
          },
        },
      ],
    }),
  };

  request(options, (error, response, body) => {
    if (error || response.statusCode !== 200) {
      console.log(error);
      console.log(response.body);
      console.log(response.statusCode);
      return res.status(500).json({ type: "error", message: error });
    }

    res.json(JSON.parse(body));
  });
});

app.listen(8080, () => {
  console.log("server started on port 5000");
});
