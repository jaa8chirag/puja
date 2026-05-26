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

const boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW";

let body = "";
body += "--" + boundary + "\r\n";
body += 'Content-Disposition: form-data; name="puja_name"\r\n\r\n';
body += "Test Service\r\n";
body += "--" + boundary + "\r\n";
body += 'Content-Disposition: form-data; name="puja_type"\r\n\r\n';
body += "home_puja\r\n";
body += "--" + boundary + "--\r\n";

fetch("http://localhost:5052/api/admin/services", {
  method: "POST",
  headers: {
    "Content-Type": `multipart/form-data; boundary=${boundary}`,
    "Authorization": `Bearer ${token}`
  },
  body: body
}).then(async res => {
  console.log("Status:", res.status);
  console.log("Body:", await res.text());
}).catch(console.error);
