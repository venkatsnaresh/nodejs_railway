const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const userRoutes = require("./routes/user");
const subscriptionRoutes = require("./routes/subscription");
const complaintRoutes = require("./routes/complaint");
const adminRoutes = require("./routes/admin");

const master_adminRoutes = require("./routes/masteradmin");
//const donation_Routes = require("./routes/donations");

const payment_Routes = require("./routes/payment");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());


// Use Routes
app.use("/users", userRoutes);
app.use("/subscriptions", subscriptionRoutes);
app.use("/complaints", complaintRoutes);
app.use("/admins", adminRoutes);

app.use("/masters", master_adminRoutes);


app.use("/payments", payment_Routes);


// **Start Server**
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
