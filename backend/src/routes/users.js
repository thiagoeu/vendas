import express from "express";
import UsersControllers from "../controllers/users.js";

const usersRouter = express.Router();

const usersControllers = new UsersControllers();

usersRouter.get("/", async (req, res) => {
  const { success, statusCode, body } = await usersControllers.getUsers();

  res.status(statusCode).send({ success, statusCode, body });
});

export default usersRouter;
