import express from "express";
import cors from "cors";
import { Mongo } from "./database/mongo";

async function main() {
  const hostname = "localhost";
  const port = 3000;

  const app = express();

  app.use(express.json());
  app.use(cors());

  app.get("/", (req, res) => {
    res.send({
      success: true,
      statusCodes: 200,
      body: "bem vindo a minha pagina",
    });
  });

  app.listen(port),
    () => {
      console.log(`Server running at http://${hostname}:${port}/`); // logs the server's address
    };
}

main();
