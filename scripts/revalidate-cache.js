const https = require("https");

// Get site URL from command line or use default
const siteUrl = process.argv[2] || "https://goalmania.shop";
const targetUrl = `${siteUrl}/api/revalidate`;

// Set admin token from environment or use default test token
const adminToken = process.env.ADMIN_TOKEN || "test-token";

console.log(`Revalidating cache on ${siteUrl}...`);

const data = JSON.stringify({});

const options = {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": data.length,
    Authorization: `Bearer ${adminToken}`,
  },
};

try {
  const req = https.request(targetUrl, options, (res) => {
    let responseData = "";

    res.on("data", (chunk) => {
      responseData += chunk;
    });

    res.on("end", () => {
      try {
        const parsedData = JSON.parse(responseData);
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log("✅ Cache revalidation successful!");
          console.log(parsedData);
        } else {
          console.error("❌ Revalidation failed:", parsedData);
        }
      } catch (error) {
        console.error("❌ Failed to parse response:", responseData);
      }
    });
  });

  req.on("error", (error) => {
    console.error("❌ Error making request:", error.message);
  });

  req.write(data);
  req.end();
} catch (error) {
  console.error("❌ Error initiating request:", error.message);
}
