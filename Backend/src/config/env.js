const requiredEnvVariables = [
  "JWT_SECRETKEY",
  "MONGOOSE_URI",
  "FRONTEND_URL",
];

for (const variable of requiredEnvVariables) {
  if (!process.env[variable]) {
    console.error(`Missing required environment variable: ${variable}`);
    process.exit(1);
  }
}