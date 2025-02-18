const { exec } = require("child_process");
const path = require("path");

const artilleryConfig = {
  config: {
    target: "http://localhost:3000",  // Change to your API URL
    phases: [
      { duration: 300, arrivalRate: 10 }, // 10 users per second for 5 minutes
    ],
  },
  scenarios: [
    {
      flow: [
        { get: { url: "/api/users" } },
        {
          post: {
            url: "/api/users",
            json: {
              name: "Test User",
              email: "test@example.com",
            },
          },
        },
      ],
    },
  ],
};

// Save the config JSON
const fs = require("fs");
const filePath = path.join(__dirname, "load_test_config.json");
fs.writeFileSync(filePath, JSON.stringify(artilleryConfig, null, 2));

// Run the test with output stored in the same folder
const outputFile = path.join(__dirname, "load_results.json");

exec(`artillery run ${filePath} --output ${outputFile}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing Artillery: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Error Output: ${stderr}`);
    return;
  }
  console.log(`Load Test Completed. Results saved in ${outputFile}`);
});

