const axios = require(require.resolve('axios')); // Ensure global module usage

const API_URL = "http://localhost:3000/users/login"; // Change this to your API endpoint
const MAX_REQUESTS = 1000; // Number of requests to simulate
const CONCURRENT_REQUESTS = 100; // Number of concurrent requests at a time

let successCount = 0;
let failureCount = 0;

const stressTest = async () => {
    console.log(`🚀 Starting Stress Test: ${MAX_REQUESTS} requests with ${CONCURRENT_REQUESTS} concurrent`);

    const sendRequest = async () => {
        try {
            const response = await axios.post(API_URL, {
                email: "test@example.com",
                password: "password123"
            });

            if (response.status === 200) {
                successCount++;
            } else {
                failureCount++;
            }
        } catch (error) {
            failureCount++;
        }
    };

    const requests = [];
    for (let i = 0; i < MAX_REQUESTS; i++) {
        requests.push(sendRequest());

        if (requests.length >= CONCURRENT_REQUESTS) {
            await Promise.all(requests);
            requests.length = 0; // Reset batch
        }
    }

    console.log(`✅ Successful Requests: ${successCount}`);
    console.log(`❌ Failed Requests: ${failureCount}`);
    console.log(`🛠️ Fix Recommendation: Implement Load Balancing & Auto-Scaling`);
};

// Run the stress test
stressTest();
