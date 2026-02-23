// utils/encryption.js
import CryptoJS from "crypto-js";

// Get secret key from environment variables
const SECRET_KEY = process.env.SECRET_KEY || "7x!9@kL#2mN$5pQ&8rT*uY^3vW";

// Encryption function
const encryptData = (data) => {
  try {
    console.log("🔐 Encrypting with crypto-js...");
    
    // Convert data to JSON string
    const jsonString = JSON.stringify(data);
    
    // Encrypt the data using AES
    const encrypted = CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString();
    
    console.log("✅ Encryption successful");
    return encrypted;
    
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt data");
  }
};

// Decryption function (if needed backend)
const decryptData = (encryptedData) => {
  try {
    // Decrypt the data
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedString) {
      throw new Error("Decryption failed - wrong key?");
    }
    
    // Parse JSON
    return JSON.parse(decryptedString);
    
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt data");
  }
};

export { encryptData, decryptData };