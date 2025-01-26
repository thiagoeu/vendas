import { Mongo } from "../database/mongo.js";
import { ObjectId } from "mongodb";
import crypto from "crypto";

const collectionName = "users";

export default class UsersDataAcess {
  async getUsers() {
    const result = await Mongo.db.collection(collectionName).find({}).toArray();
    console.log(result);
    return result;
  }
}
