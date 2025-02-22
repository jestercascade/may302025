const config = {
  BASE_URL: "http://localhost:3000",
  REMOTE_PATTERNS: [
    {
      protocol: "https",
      hostname: "i.pinimg.com", // Pinterest
    },
    {
      protocol: "https",
      hostname: "img.kwcdn.com", // Temu
    },
    {
      protocol: "https",
      hostname: "firebasestorage.googleapis.com", // Firebase
    },
  ],
};

module.exports = config;
