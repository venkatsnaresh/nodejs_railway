const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_URL = "http://localhost:3000/users"; // Change if needed
const REPORT_FILE = path.join(__dirname, 'security_test_results.json');

const payloads = [
    { email: "' OR '1'='1' --", password: "password123", test: "Auth Bypass" },
    { email: "' UNION SELECT null, username, password FROM users --", password: "password123", test: "Data Extraction" },
    { email: "'; DROP TABLE users; --", password: "password123", test: "SQL Injection (Drop Table)" },
];

const results = [];

const testSQLInjection = async () => {
    let passed = 0, failed = 0;

    for (let i = 0; i < payloads.length; i++) {
        try {
            console.log(`\nTesting: ${payloads[i].test}`);
            const response = await axios.post(`${API_URL}/login`, payloads[i], {
                headers: { "Content-Type": "application/json" }
            });

            console.log("❌ Vulnerable! Fix required.");
            failed++;
            results.push({ test: payloads[i].test, status: "Failed", fix: "Sanitize inputs & use parameterized queries" });

        } catch (error) {
            console.log("✅ Secure! No SQL injection detected.");
            passed++;
            results.push({ test: payloads[i].test, status: "Passed", fix: "N/A" });
        }
    }

    // Write results to a JSON file
    fs.writeFileSync(REPORT_FILE, JSON.stringify({ passed, failed, details: results }, null, 2));
    console.log(`\n📄 Report saved: ${REPORT_FILE}`);
};

testSQLInjection();
