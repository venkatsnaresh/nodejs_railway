const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_URL = "http://localhost:3000/users/login"; // Change if needed
const REPORT_FILE = path.join(__dirname, 'bruteforce_results.json');

const username = "test@example.com"; // Change if needed
const passwords = ["password123", "123456", "qwerty", "admin", "letmein"]; // Common passwords

const results = [];

const testBruteForce = async () => {
    let successfulAttempts = 0, failedAttempts = 0;

    for (let i = 0; i < passwords.length; i++) {
        try {
            console.log(`\n🔄 Trying password: ${passwords[i]}`);
            const response = await axios.post(API_URL, { email: username, password: passwords[i] }, {
                headers: { "Content-Type": "application/json" }
            });

            console.log("❌ Login successful! Weak password detected.");
            successfulAttempts++;
            results.push({ password: passwords[i], status: "Failed", fix: "Implement account lockout & rate limiting" });

        } catch (error) {
            console.log("✅ Secure! Incorrect password.");
            failedAttempts++;
            results.push({ password: passwords[i], status: "Passed", fix: "N/A" });
        }
    }

    // Save results
    fs.writeFileSync(REPORT_FILE, JSON.stringify({ successfulAttempts, failedAttempts, details: results }, null, 2));
    console.log(`\n📄 Report saved: ${REPORT_FILE}`);
};

testBruteForce();
