const axios = require('axios');
async function test() {
  try {
    const res = await axios.post("http://localhost:3000/api/user", {
      User_Name: "Test Lead",
      email: "testlead123@motherhomes.local",
      phone_no: "notanumber",
      password: "User@123",
      role: "user",
      isVerified: true,
    });
    console.log("User POST success:", res.data);
  } catch(e) {
    console.error("User POST error:", e.response?.data || e.message);
  }
}
test();
