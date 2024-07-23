import { randomId, removeUndefined } from "../util/index.js";
import { BaseDynamoDBClass } from "./base.repository.js";

export interface TaskRecord {
  pk: string; // user_email
  sk: string; // task.{id}
  entity_type: "task";
  title: string;
  description: string;
  task_status: string;
  due_date: string;
  created_at: string;
  updated_at: string;
}

export class TaskRepository extends BaseDynamoDBClass {
  constructor() {
    super("TMSSystemTable");
  }

  async listTasks({ user_email }: { user_email?: string }) {
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
        ":entity_type": "task", // "TASK"와 같은 대문자를 사용하는 것이 좋습니다.
      },
    });
  }

  async createTask(
    user_email: string,
    { title, description }: Pick<TaskRecord, "title" | "description">
  ) {
    const taskId = randomId({ prefix: "task" });
    return this.putItem({
      pk: user_email,
      sk: taskId,
      entity_type: "task",
      title,
      description,
    });
  }

  async updateTask(
    user_email: string,
    task_id: string,
    { title, description, task_status, due_date }: Partial<TaskRecord>
  ) {
    const UpdateExpression = "SET ".concat(
      Object.entries({ title, description, task_status, due_date })
        .filter(([_, value]) => value !== undefined)
        .map(([key]) => `${key} = :${key}`)
        .join(", ")
    );
    return this.updateItem({
      Key: { pk: user_email, sk: task_id },
      UpdateExpression: UpdateExpression,
      ExpressionAttributeValues: removeUndefined({
        ":title": title,
        ":description": description,
        ":task_status": task_status,
        ":due_date": due_date,
      }),
    });
  }
}
