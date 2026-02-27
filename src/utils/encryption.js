
import CryptoJS from "crypto-js";

const SECRET_KEY = process.env.SECRET_KEY || "7x!9@kL#2mN$5pQ&8rT*uY^3vW";


const encryptData = (data) => {
  try {
    console.log("🔐 Encrypting with crypto-js...");
    
    const jsonString = JSON.stringify(data);
    
    // Encrypt the data using AES
    const encrypted = CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString();
    
    console.log(" Encryption successful");
    return encrypted;
    
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt data");
  }
};

const decryptData = (encryptedData) => {
  try {
   
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedString) {
      throw new Error("Decryption failed - wrong key?");
    }
    
   
    return JSON.parse(decryptedString);
    
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt data");
  }
};

export { encryptData, decryptData };