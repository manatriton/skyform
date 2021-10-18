const Workspaces = require("../../models/workspace");
const db = global.knex;


describe("Workspaces", () => {
  test("should correctly post-processes raw workspace objects", async () => {
    const createdAt = new Date(1970, 1, 1);
    const rawWorkspace = {
      id: 1,
      name: "workspace-test",
      created_at: createdAt,
    };

    const expected = {
      id: "workspace:1",
      name: "workspace-test",
      createdAt: createdAt.toISOString(),
    };

    expect(Workspaces.postProcess(rawWorkspace)).toEqual(expected);
  });

  test("should get a workspace by id", async () => {
    await db("workspaces")
      .insert({
        name: "test"
      });

    const workspaces = new Workspaces({ db });
    const workspace = await workspaces.getWorkspaceById("workspace:1");

    expect(workspace).toMatchObject({
      id: expect.any(String),
      name: "test",
      createdAt: expect.any(String),
      noColor: false,
      workingDirectory: null,
    });
  });
});
