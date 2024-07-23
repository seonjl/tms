import { randomId } from "../util/index.js";
import { BaseDynamoDBClass } from "./base.repository.js";

export interface FileRecord {
  pk: string; // user_email, save as url encoded
  sk: string; // file.{id}
  entity_type: "file";
  name: string;
  size: string;
  bucket: string;
  key: string;
  uploaded_at: string;
}

export class FileRepository extends BaseDynamoDBClass {
  constructor() {
    super("TMSSystemTable");
  }

  async listFiles({ user_email: _user_email }: { user_email: string }) {
    const user_email = encodeURIComponent(_user_email);

    return this.queryItems({
      IndexName: "EntityTypeIndex",
      KeyConditionExpression:
        "#pk = :user_email AND #entity_type = :entity_type",
      ExpressionAttributeNames: {
        "#pk": "pk",
        "#entity_type": "entity_type",
      },
      ExpressionAttributeValues: {
        ":user_email": user_email,
        ":entity_type": "file",
      },
    });
  }

  async createFile(
    user_email: string,
    {
      name,
      size,
      bucket,
      key,
    }: { name: string; size: string; bucket: string; key: string }
  ) {
    const taskId = randomId({ prefix: "file" });
    return this.putItem({
      pk: user_email,
      sk: taskId,
      entity_type: "file",
      name,
      size,
      bucket,
      key,
      uploaded_at: new Date().toISOString(),
    });
  }

  async getFile(_user_email: string, file_id: string) {
    const user_email = encodeURIComponent(_user_email);
    return this.getItem<FileRecord>({ pk: user_email, sk: file_id });
  }
}
