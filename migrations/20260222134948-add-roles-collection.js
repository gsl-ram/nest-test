module.exports = {
  async up(db) {
    const now = new Date();

    const result = await db.collection('roles').insertMany([
      {
        name: 'admin',
        permissions: {
          users: { view: true, create: true, edit: true, delete: true },
          roles: { view: true, create: true, edit: true, delete: true },
        },
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'user',
        permissions: {
          users: { view: true, create: false, edit: false, delete: false },
          roles: { view: false, create: false, edit: false, delete: false },
        },
        createdAt: now,
        updatedAt: now,
      },
    ]);

    const roles = await db.collection('roles').find({}).toArray();
    const adminRole = roles.find((r) => r.name === 'admin');
    const userRole = roles.find((r) => r.name === 'user');

    if (adminRole) {
      await db
        .collection('users')
        .updateMany({ role: 'admin' }, { $set: { role: adminRole._id } });
    }

    if (userRole) {
      await db
        .collection('users')
        .updateMany({ role: 'user' }, { $set: { role: userRole._id } });
    }

    await db.collection('roles').createIndex({ name: 1 }, { unique: true });
  },

  async down(db) {
    const roles = await db.collection('roles').find({}).toArray();

    for (const role of roles) {
      await db
        .collection('users')
        .updateMany({ role: role._id }, { $set: { role: role.name } });
    }

    await db.collection('roles').drop();
  },
};
