const crypto = require("crypto");

// Encryption secret key (store securely, e.g., in environment variables)
const ENCRYPTION_KEY = process.env.CRYPTO_ENCRYPTION_KEY; // Must be 32 characters
const CRYPTO_KEY = process.env.CRYPTO_KEY;
const IV_LENGTH = 16; // Initialization vector length

// Function to encrypt data
const encrypt = (text) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(CRYPTO_KEY, Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
};

// Function to decrypt data
const decrypt = (encryptedText) => {
  // Ensure that encryptedText is in the correct format
  if (!encryptedText || !encryptedText.includes(":")) {
    throw new Error("Invalid encrypted text format");
  }
  const [iv, encrypted] = encryptedText.split(":");
  // Validate that both iv and encrypted parts are not empty
  if (!iv || !encrypted) {
    throw new Error("Invalid encrypted text format: missing IV or encrypted data");
  }
  const decipher = crypto.createDecipheriv(process.env.CRYPTO_KEY, Buffer.from(process.env.CRYPTO_ENCRYPTION_KEY), Buffer.from(iv, "hex"));
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  console.log(decrypted)
  return decrypted;
};


module.exports = {encrypt, decrypt}