import { Role, TaskPriority, TaskStatus } from "@prisma/client";
import { tasksService } from "../modules/tasks/tasks.service";
import { tasksRepository } from "../modules/tasks/tasks.repository";
import { AuthPayload } from "../middleware/auth";

jest.mock("../modules/tasks/tasks.repository");

const mockedRepo = tasksRepository as jest.Mocked<typeof tasksRepository>;

function actor(role: Role, userId = "user-1"): AuthPayload {
  return { userId, email: `${userId}@example.com`, role };
}

const baseTask = {
  id: "task-1",
  title: "Test task",
  description: null,
  priority: TaskPriority.MEDIUM,
  status: TaskStatus.TODO,
  dueDate: null,
  createdById: "creator-1",
  assignedToId: "user-1",
  createdAt: new Date(),
  updatedAt: new Date(),
} as any;

describe("tasksService RBAC", () => {
  beforeEach(() => jest.resetAllMocks());

  it("allows a Member to view a task assigned to them", async () => {
    mockedRepo.findById.mockResolvedValue(baseTask);
    const result = await tasksService.getTaskById(actor(Role.MEMBER), "task-1");
    expect(result).toEqual(baseTask);
  });

  it("forbids a Member from viewing a task not assigned to them", async () => {
    mockedRepo.findById.mockResolvedValue({ ...baseTask, assignedToId: "someone-else" });
    await expect(tasksService.getTaskById(actor(Role.MEMBER), "task-1")).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("allows a Member to update only the status field on their own task", async () => {
    mockedRepo.findById.mockResolvedValue(baseTask);
    mockedRepo.update.mockResolvedValue({ ...baseTask, status: TaskStatus.DONE });

    const result = await tasksService.updateTask(actor(Role.MEMBER), "task-1", {
      status: TaskStatus.DONE,
    });

    expect(mockedRepo.update).toHaveBeenCalledWith("task-1", { status: TaskStatus.DONE });
    expect(result.status).toBe(TaskStatus.DONE);
  });

  it("forbids a Member from changing fields other than status", async () => {
    mockedRepo.findById.mockResolvedValue(baseTask);

    await expect(
      tasksService.updateTask(actor(Role.MEMBER), "task-1", { title: "New title" } as any)
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it("allows a Manager to reassign a task", async () => {
    mockedRepo.findById.mockResolvedValue(baseTask);
    mockedRepo.update.mockResolvedValue({ ...baseTask, assignedToId: "user-2" });

    await tasksService.updateTask(actor(Role.MANAGER, "manager-1"), "task-1", {
      assignedToId: "user-2",
    });

    expect(mockedRepo.update).toHaveBeenCalledWith(
      "task-1",
      expect.objectContaining({ assignedTo: { connect: { id: "user-2" } } })
    );
  });

  it("scopes list() to only the actor's tasks when Member", async () => {
    mockedRepo.findMany.mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 20 });

    await tasksService.listTasks(actor(Role.MEMBER, "user-1"), {
      page: 1,
      pageSize: 20,
    } as any);

    expect(mockedRepo.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ onlyVisibleToUserId: "user-1", assignedToId: undefined })
    );
  });
});
