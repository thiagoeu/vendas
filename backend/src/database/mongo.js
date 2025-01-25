import { MongoClient } from "mongodb";

export const Mongo = {
  async connect({ mongoConnectionsString, mongoDbName }) {
    try {
      const client = new MongoClient(mongoConnectionsString);
      await client.connect();
      const db = client.db(mongoDbName);
      this.db = db;

      return "Mongo connected";
    } catch (error) {
      return { text: "Error during mongo connection", error };
    }
  },
};
