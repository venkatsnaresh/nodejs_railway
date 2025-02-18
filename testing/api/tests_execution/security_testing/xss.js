const axios = require('axios');
const fs = require('fs');

const API_URL = "http://localhost:3000/comments"; // Change if needed
const REPORT_FILE = "xss_results.json";

const payloads = [
    { comment: "<script>alert('XSS')</script>" },
    { comment: "<img src=x onerror=alert('XSS')>" },
    { comment: "<svg/onload=alert('XSS')>" },
];

const results = [];

const testXSS = async () => {
    for (let payload of payloads) {
        try {
            console.log(`Testing XSS payload: ${JSON.stringify(payload)}`);
            await axios.post(API_URL, payload, { headers: { "Content-Type": "application/json" } });
            results.push({ payload, status: "Failed", fix: "Sanitize input & use Content Security Policy (CSP)" });
        } catch (error) {
            results.push({ payload, status: "Passed", fix: "N/A" });
        }
    }
    fs.writeFileSync(REPORT_FILE, JSON.stringify(results, null, 2));
    console.log(`📄 XSS Report saved: ${REPORT_FILE}`);
};

testXSS();
