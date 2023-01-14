const mercadopago = require("mercadopago");
require("dotenv").config();

mercadopago.configure({
  access_token: "APP_USR-207518113159238-011315-3d87b47a39ff9aee368a6fbf1c538b9c-1285593746",
});

module.exports = {
    mercadopago
} 