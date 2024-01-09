const {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} = require("node:crypto");

const encryptToken = (data) => {
  const algorithm = process.env.ENCYPTION_ALGORITHM;
  const iv = randomBytes(16);
  const key = process.env.ENCYPTION_KEY;

  try {
    let cipher = createCipheriv(algorithm, Buffer.from(key, "hex"), iv);

    // Updating text
    let encrypted = cipher.update(JSON.stringify(data));

    // Using concatenation
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return { iv: iv.toString("hex"), encryptedData: encrypted.toString("hex") };
  } catch (err) {
    console.log("Err", err);
  }
};

const decryptToken = (data) => {
  const parsedData = typeof (data) === "string" ? JSON.parse(data) : data;
  const algorithm = process.env.ENCYPTION_ALGORITHM;
  const key = process.env.ENCYPTION_KEY;
  const iv = Buffer.from(parsedData.iv, "hex");

  const encryptedText = Buffer.from(parsedData.encryptedData, "hex");

  // Creating Decipher
  let decipher = createDecipheriv(algorithm, Buffer.from(key, "hex"), iv);

  // Updating encrypted text
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  // returns data after decryption
  return JSON.parse(decrypted.toString("utf8"));
};

module.exports = { encryptToken, decryptToken };
