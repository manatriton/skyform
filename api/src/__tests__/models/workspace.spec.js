const Workspaces = require("../../models/workspace");

describe("Workspaces", () => {
  test("should correctly post-processes raw workspace objects", () => {
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
});



