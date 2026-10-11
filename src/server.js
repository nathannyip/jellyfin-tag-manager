const express = require("express");
const config = require("./config");
const webhookRouter = require("./routes/webhook");

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "jellyfin-tag-manager",
  });
});

app.use("/webhook", webhookRouter);

app.use((error, _, res, _) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({
      success: false,
      message: "Invalid webhook payload",
    });
  }

  console.error("Unhandled error:", error);

  return res.status(500).json({
    success: false,
    message: "Failed to process request",
  });
});

app.listen(config.port, "0.0.0.0", () => {
  console.log(`Jellyfin Tag Manager listening on port ${config.port}`);
});
