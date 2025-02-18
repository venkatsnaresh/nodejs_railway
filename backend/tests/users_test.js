const request = require("supertest");
const app = require("../server"); // Import your Express app

let token = "";
let resetToken = "";

const testResults = []; // Store test results for the summary table

// Helper function to log test results in table format
const logTestResult = (testNumber, description, status) => {
  testResults.push({ testNumber, description, status });
};

describe("User Authentication API Tests", () => {
  test("1️⃣ User signs up with valid data", async () => {
    const res = await request(app)
      .post("/users/signup")
      .send({ username: "testuser", email: "test@example.com", password: "Secure123!" });

    expect(res.status).toBe(200);
    logTestResult(1, "User signs up with valid data", "✅");
  });

  test("2️⃣ User signs up with existing email", async () => {
    const res = await request(app)
      .post("/users/signup")
      .send({ username: "testuser", email: "test@example.com", password: "Secure123!" });

    expect(res.status).toBe(400);
    logTestResult(2, "User signs up with existing email", "❌");
  });

  test("3️⃣ User logs in with valid credentials", async () => {
    const res = await request(app)
      .post("/users/login")
      .send({ email: "test@example.com", password: "Secure123!" });

    expect(res.status).toBe(200);
    token = res.body.token;
    logTestResult(3, "User logs in with valid credentials", "✅");
  });

  test("4️⃣ User logs in with incorrect password", async () => {
    const res = await request(app)
      .post("/users/login")
      .send({ email: "test@example.com", password: "WrongPass!" });

    expect(res.status).toBe(400);
    logTestResult(4, "User logs in with incorrect password", "❌");
  });

  test("5️⃣ User requests password reset", async () => {
    const res = await request(app)
      .post("/users/forgot-password")
      .send({ email: "test@example.com" });

    expect(res.status).toBe(200);
    resetToken = "mock-reset-token"; // Replace with real token
    logTestResult(5, "User requests password reset", "✅");
  });

  test("6️⃣ User resets password with valid token", async () => {
    const res = await request(app)
      .post("/users/reset-password")
      .send({ token: resetToken, newPassword: "NewSecure123!" });

    expect(res.status).toBe(200);
    logTestResult(6, "User resets password with valid token", "✅");
  });

  test("7️⃣ User tries expired reset token", async () => {
    const res = await request(app)
      .post("/users/reset-password")
      .send({ token: "expired-token", newPassword: "AnotherSecure123!" });

    expect(res.status).toBe(400);
    logTestResult(7, "User tries expired reset token", "❌");
  });

  test("8️⃣ User accesses protected route without token", async () => {
    const res = await request(app).get("/users/protected");
    expect(res.status).toBe(401);
    logTestResult(8, "User accesses protected route without token", "❌");
  });

  test("9️⃣ User accesses protected route with token", async () => {
    const res = await request(app)
      .get("/users/protected")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    logTestResult(9, "User accesses protected route with token", "✅");
  });

  test("🔟 User injects SQL in login form", async () => {
    const res = await request(app)
      .post("/users/login")
      .send({ email: "' OR 1=1 --", password: "irrelevant" });

    expect(res.status).toBe(400);
    logTestResult(10, "User injects SQL in login form", "✅");
  });

  test("🔵 User injects XSS in signup form", async () => {
    const res = await request(app)
      .post("/users/signup")
      .send({ username: "<script>alert(1)</script>", email: "xss@example.com", password: "Password!" });

    expect(res.status).toBe(400);
    logTestResult(11, "User injects XSS in signup form", "✅");
  });

  test("🔴 User logs in with incorrect email format", async () => {
    const res = await request(app)
      .post("/users/login")
      .send({ email: "invalid-email", password: "Password!" });

    expect(res.status).toBe(400);
    logTestResult(12, "User logs in with incorrect email format", "❌");
  });

  test("⚠️ User tries login without password", async () => {
    const res = await request(app)
      .post("/users/login")
      .send({ email: "test@example.com" });

    expect(res.status).toBe(400);
    logTestResult(13, "User tries login without password", "❌");
  });

  // Add remaining 17 test cases in a similar format...

  afterAll(() => {
    console.log("\n\n📌 **Test Summary** 📌");
    console.log("=========================================");
    console.log("| #  | Test Description                       | Result |");
    console.log("=========================================");
    testResults.forEach(({ testNumber, description, status }) => {
      console.log(`| ${testNumber.toString().padEnd(2)} | ${description.padEnd(35)} | ${status} |`);
    });
    console.log("=========================================");
  });
});
