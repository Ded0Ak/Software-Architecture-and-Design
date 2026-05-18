import "reflect-metadata";
import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { router } from "./routes";
import { seedIfEmpty } from "./seed";

const app = express();
app.use(bodyParser.json());

app.use("/api", router);

const publicDir = path.join(process.cwd(), "public");
app.use(express.static(publicDir));

seedIfEmpty();

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(400).json({ message: err.message || "Server error" });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});