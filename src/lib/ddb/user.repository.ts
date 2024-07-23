// Importing necessary modules from AWS SDK
import { BaseDynamoDBClass } from "./base.repository.js";

export interface UserRecord {
  id: string;
  name: string;
  mobile: string;
  pid: string;
  provider: string;
  connectedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export class UserRepository extends BaseDynamoDBClass {
  constructor() {
    super("TMSSystemTable");
  }

  async getUserById(id: string): Promise<any> {
    return this.getItem({ id });
  }

  async addUser(user: UserRecord): Promise<any> {
    return this.putItem(user);
  }

  async deleteUser(userId: string): Promise<any> {
    return this.deleteItem({ userId });
  }
}
