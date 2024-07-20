// Importing necessary modules from AWS SDK
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  DeleteCommandInput,
  DynamoDBDocumentClient,
  GetCommand,
  GetCommandInput,
  PutCommand,
  PutCommandInput,
  QueryCommand,
  QueryCommandInput,
  UpdateCommand,
  UpdateCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { removeUndefined } from "../lib/util/index.js";
interface ItemKey {
  [key: string]: any;
}

export class BaseDynamoDBClass {
  protected tableName: string;
  protected docClient: DynamoDBDocumentClient;

  constructor(tableName: string) {
    this.tableName = `${tableName}`;
    const client = new DynamoDBClient({ region: "ap-northeast-2" });
    this.docClient = DynamoDBDocumentClient.from(client);
  }

  async getItem<T>(key: ItemKey) {
    const params: GetCommandInput = {
      TableName: this.tableName,
      Key: key,
    };

    try {
      const response = await this.docClient.send(new GetCommand(params));
      return response.Item as T;
    } catch (error) {
      console.error("Error getting item:", error);
      throw error;
    }
  }

  async putItem(item: Record<string, any>) {
    if (!item) {
      throw new Error("Item is required");
    }

    if (!item.created_at) {
      item.created_at = new Date().toISOString();
    }

    item.updated_at = new Date().toISOString();

    const params: PutCommandInput = {
      TableName: this.tableName,
      Item: removeUndefined(item),
    };

    try {
      const response = await this.docClient.send(new PutCommand(params));

      return response;
    } catch (error) {
      console.error("Error putting item:", error);
      throw error;
    }
  }

  async updateItem({
    Key,
    UpdateExpression,
    ExpressionAttributeValues,
    ExpressionAttributeNames,
  }: {
    Key: ItemKey;
    UpdateExpression: string;
    ExpressionAttributeValues: { [key: string]: any };
    ExpressionAttributeNames?: { [key: string]: string };
  }): Promise<any> {
    const params: UpdateCommandInput = {
      TableName: this.tableName,
      Key: Key,
      UpdateExpression: UpdateExpression,
      ExpressionAttributeValues: ExpressionAttributeValues,
      ExpressionAttributeNames: ExpressionAttributeNames,
      ReturnValues: "ALL_NEW",
    };

    try {
      const response = await this.docClient.send(new UpdateCommand(params));

      return response.Attributes;
    } catch (error) {
      console.error("Error updating item:", error);
      throw error;
    }
  }

  async deleteItem(key: ItemKey) {
    const params: DeleteCommandInput = {
      TableName: this.tableName,
      Key: key,
    };

    try {
      const response = await this.docClient.send(new DeleteCommand(params));
      return response;
    } catch (error) {
      console.error("Error deleting item:", error);
      throw error;
    }
  }

  async queryItems<T>(query: Omit<QueryCommandInput, "TableName">) {
    const params: QueryCommandInput = {
      TableName: this.tableName,
      ...query,
    };

    try {
      const response = await this.docClient.send(new QueryCommand(params));
      return response.Items as T[];
    } catch (error) {
      console.error("Error querying items:", error);
      throw error;
    }
  }
}
