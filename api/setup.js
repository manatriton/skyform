afterEach(async () => {
  await global.dbManager.truncateDb(['migrations'])
});