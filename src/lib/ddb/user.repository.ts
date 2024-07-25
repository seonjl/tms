// Importing necessary modules from AWS SDK
import { BaseDynamoDBClass } from "./base.repository.js";

export interface UserRecord {
  pk: string; // user_email
  sk: string; // created_at
  entity_type: "user";
  name: string;
  mobile: string;
  locale: string;
  provider: "google";
  last_logged_in_at: string;
}

export class UserRepository extends BaseDynamoDBClass {
  constructor() {
    super("TMSSystemTable");
  }

  async createUser(
    user_email: string,
    { name, mobile, locale, provider }: Partial<UserRecord>
  ) {
    const isoDate = new Date().toISOString();

    const user = await this.getUser(user_email);

    // upsert
    return this.putItem({
      pk: user_email,
      sk: user?.sk || isoDate,
      entity_type: "user",
      name,
      mobile,
      locale,
      provider,
      last_logged_in_at: isoDate,
    });
  }

  async getUser(user_email: string) {
    const user = await this.queryItems<UserRecord>({
      IndexName: "EntityTypeIndex",
      KeyConditionExpression:
        "#pk = :user_email AND #entity_type = :entity_type",
      ExpressionAttributeNames: {
        "#pk": "pk",
        "#entity_type": "entity_type",
      },
      ExpressionAttributeValues: {
        ":user_email": user_email,
        ":entity_type": "user",
      },
    });

    return user[0] ? user[0] : null;
  }
}
