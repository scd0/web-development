import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import { fileURLToPath } from "url";
import path from "path";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";

import authenticationRoutes from "./routes/authentication-route.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://www.npmjs.com/package/dotenv
dotenv.config();

// https://www.npmjs.com/package/express
const app = express();
app.use(express.json());
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

// https://www.npmjs.com/package/helmet
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

// https://www.npmjs.com/package/cors
app.use(cors());

// https://www.npmjs.com/package/express-rate-limit
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);

// https://www.npmjs.com/package/body-parser
const bodyParserOptions = { limit: "30mb", extended: true };
app.use(bodyParser.json(bodyParserOptions));
app.use(bodyParser.urlencoded(bodyParserOptions));

// routes/
app.use("/authentication", authenticationRoutes);

// https://www.npmjs.com/package/mongoose
const PORT = process.env.PORT || 3001;
mongoose.connect(process.env.MONGO_URL)
.then(() => {
  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
  });
})
.catch((error) => {
  console.error(error);
});
