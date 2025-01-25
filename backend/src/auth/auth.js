import express from "express";
import passport from "passport";
import LocalStrategy from "passport-local";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { Mongo } from "../database/mongo.js";
import { ObjectId } from "mongodb";

// Nome da coleção no MongoDB para armazenar os usuários
const collectionName = "users";

// Criação do router de autenticação
const authRouter = express.Router();

// Configuração da estratégia de autenticação local (email e senha)
passport.use(
  new LocalStrategy(
    { usernameField: "email" }, // Define que o campo "email" será usado como username
    async (email, password, callback) => {
      // Busca o usuário no banco de dados pelo email
      const user = await Mongo.db
        .collection(collectionName)
        .findOne({ email: email });

      // Se o usuário não for encontrado, retorna um erro
      if (!user) {
        return callback(null, false);
      }

      // Recupera o salt do usuário
      const saltBuffer = user.salt.buffer;

      // Recria o hash da senha usando o salt armazenado
      crypto.pbkdf2(
        password,
        saltBuffer,
        310000, // Número de iterações
        16, // Comprimento do hash
        "sha256", // Algoritmo de hashing
        (error, hashedPassword) => {
          if (error) {
            return callback(error);
          }

          // Converte o hash armazenado em Buffer para comparação segura
          const userPassowrdBuffer = Buffer.from(user.password.buffer);

          // Compara os hashes de forma segura
          if (!crypto.timingSafeEqual(userPassowrdBuffer, hashedPassword)) {
            return callback(null, false); // Senha incorreta
          }

          // Remove os campos sensíveis (senha e salt) do usuário antes de retornar
          const { password, salt, ...rest } = user;

          return callback(null, rest); // Retorna o usuário autenticado
        }
      );
    }
  )
);

// Rota para registro de novos usuários
authRouter.post("/signup", async (req, res) => {
  // Verifica se o email já está cadastrado
  const checkUser = await Mongo.db
    .collection(collectionName)
    .findOne({ email: req.body.email });

  if (checkUser) {
    return res.status(500).send({
      success: false,
      statusCode: 500,
      body: {
        text: "User already exists",
      },
    });
  }

  // Gera um novo salt para o usuário
  const salt = crypto.randomBytes(16);

  // Cria o hash da senha usando o salt gerado
  crypto.pbkdf2(
    req.body.password,
    salt,
    310000,
    16,
    "sha256",
    async (error, hashedPassword) => {
      if (error) {
        res.status(500).send({
          success: false,
          statusCode: 500,
          body: {
            text: "Error hashing password",
          },
        });
      }

      // Insere o novo usuário no banco de dados
      const result = await Mongo.db.collection(collectionName).insertOne({
        fullname: req.body.fullname,
        email: req.body.email,
        password: hashedPassword, // Armazena o hash da senha
        salt, // Armazena o salt
      });

      // Se o usuário foi inserido com sucesso
      if (result.insertedId) {
        const user = await Mongo.db.collection(collectionName).findOne(
          { _id: new ObjectId(result.insertedId) },
          { projection: { password: 0, salt: 0 } } // Exclui senha e salt da resposta
        );

        // Gera um token JWT para o usuário registrado
        const token = jwt.sign(user, "secret");

        return res.send({
          success: true,
          statusCode: 200,
          body: {
            text: "User registered",
            user,
            token,
          },
        });
      }
    }
  );
});

// Rota para login de usuários
authRouter.post("/login", (req, res) => {
  passport.authenticate("local", (error, user) => {
    if (error) {
      return res.status(500).send({
        success: false,
        statusCode: 500,
        body: {
          text: "Error during authentication",
          error,
        },
      });
    }

    if (!user) {
      return res.status(400).send({
        success: false,
        statusCode: 400,
        body: {
          text: "Credentials are not correct",
        },
      });
    }

    // Gera um token JWT para o usuário autenticado
    const token = jwt.sign(user, "secret");
    return res.status(200).send({
      success: true,
      statusCode: 200,
      body: {
        text: "User logged in correctly",
        user,
        token,
      },
    });
  })(req, res); // Passa os parâmetros req e res para a estratégia de autenticação
});

export default authRouter;
