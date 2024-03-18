const stripe = require("stripe")(
  "sk_test_51O4Ir1KE1abBAwczUcQjqw8K0AKslrlsgF1xrwniHO1HrhLAyHvPEjyZ4Chm2HC4PfvvNjYZgbTmq4xmIpCPcAV800UK16h8OE"
);
const method = {};

method.createCheckoutSession = async (req, res) => {
  const prices = await stripe.prices.list({
    lookup_keys: [req.body.lookup_key],
    expand: ["data.product"],
  });
    // console.log(prices)
  const session = await stripe.checkout.sessions.create({
    billing_address_collection: "auto",
    line_items: [
      {
        price: prices.data[0].id,
        // For metered billing, do not pass quantity
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `http://localhost:5173/setting/Settings/price?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `http://localhost:5173/setting/Settings/price?canceled=true`,
  });
    // console.log(session)

  res.redirect(303, session.url);
};

module.exports = method;
