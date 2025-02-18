const axios = require('axios');
const fs = require('fs');

const API_URL = "http://localhost:3000/users/login";
const REPORT_FILE = "rate_limit_results.json";

const username = "test@example.com";
const password = "password123";

const results = [];

const testRateLimit = async () => {
    for (let i = 0; i < 20; i++) {
        try {
            console.log(`🔄 Attempt ${i + 1}`);
            await axios.post(API_URL, { email: username, password }, { headers: { "Content-Type": "application/json" } });
            results.push({ attempt: i + 1, status: "Failed", fix: "Implement request throttling & rate limits" });
        } catch (error) {
            results.push({ attempt: i + 1, status: "Passed", fix: "N/A" });
        }
    }
    fs.writeFileSync(REPORT_FILE, JSON.stringify(results, null, 2));
    console.log(`📄 Rate Limit Report saved: ${REPORT_FILE}`);
};

testRateLimit();
