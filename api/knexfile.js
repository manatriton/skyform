// Update with your config settings.

module.exports = {
  // Default configuration.
  development: {
    client: 'postgresql',
    connection: {
      database: process.env.SKYFORM_DATABASE,
      user: process.env.SKYFORM_USER,
      password: process.env.SKYFORM_PASSWORD,
    },
    pool: {
      min: 2,
      max: 10
    },
  },
};
