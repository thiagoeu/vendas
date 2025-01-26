import UsersDataAcess from "../dataAccess/users.js";
import { ok, serverError } from "../helpers/httpResponse.js";

export default class UsersControllers {
  constructor() {
    this.dataAccess = new UsersDataAcess();
  }

  async getUsers() {
    try {
      const users = await this.dataAccess.getUsers();
      console.log(users);
      return ok(users);
    } catch (error) {
      return serverError(error);
    }
  }
}
