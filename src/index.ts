import { app } from "./app";
import "dotenv/config";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`server is runing in ${PORT}`))