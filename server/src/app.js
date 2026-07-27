import express from "express";
import cors from "cors";
const app = express();
app.use(cors());
app.use(express.json());
app.get("/", (_req, res) => {
    res.json({
        message: "MusicSense API is running",
    });
});
export default app;
//# sourceMappingURL=app.js.map