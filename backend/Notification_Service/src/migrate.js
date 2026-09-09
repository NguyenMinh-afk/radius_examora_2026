import sequelize from "./config/sequelize.js";
import Notification from "./models/notification/Notification.js";

const run = async () => {
  try {
    await sequelize.authenticate();
    console.log("[migrate] Database connection OK");
    await sequelize.sync();
    console.log("[migrate] Notification table ensured");
    process.exit(0);
  } catch (err) {
    console.error("[migrate] Error:", err);
    process.exit(1);
  }
};

run();
