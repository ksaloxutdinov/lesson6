import express from "express";
import dotenvConfig from "./helpers/dotenv-config.js";
import groupRouter from "./routes/group.route.js";
import teacherRouter from "./routes/teacher.route.js";
import studentRouter from "./routes/student.route.js";
import studentPassportRouter from "./routes/student-passport.route.js";
import teacherGroupRouter from "./routes/teacher-group.route.js";

dotenvConfig();

const app = express();
const PORT = process.env.PORT;

app.use(express.json());

app.use('/api/group', groupRouter);
app.use('/api/teacher', teacherRouter);
app.use('/api/student', studentRouter);
app.use('/api/student-passport', studentPassportRouter);
app.use('/api/teacher-group', teacherGroupRouter)

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}/`);
});