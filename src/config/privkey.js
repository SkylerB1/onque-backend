const fs = require("fs");

const privet_key = {
  key: fs.readFileSync(
    "/etc/letsencrypt/live/api.jjmedia.appwrk.com/privkey.pem"
  ),
  cert: fs.readFileSync(
    "/etc/letsencrypt/live/api.jjmedia.appwrk.com/fullchain.pem"
  ),
};

module.exports = privet_key;