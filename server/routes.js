import mongoose from "mongoose";
import app from "./index";

const CONNECTION_URL = `mongodb+srv://admin:aDqvIJdJh6GNfiBD@cluster0.dycq5dv.mongodb.net/test`;
const PORT = 3001;

mongoose
  .connect(CONNECTION_URL)
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch((error) => {
    console.log(error.message);
  });
