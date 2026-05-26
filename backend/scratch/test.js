import jwt from "jsonwebtoken";

const token = jwt.sign(
  {
    id: 1,
    name: "Admin",
    role: "superAdmin",
  },
  "supersecretkey",
  { expiresIn: "90d" }
);

fetch("http://localhost:5052/api/admin/createUser", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  },
  body: JSON.stringify({
    name: "Test",
    email: "test@test.com",
    phone: "1234567890",
    password: "password123",
    role: "user"
  })
}).then(async res => {
  console.log("Status:", res.status);
  console.log("Body:", await res.text());
}).catch(console.error);
