module.exports = {
  async up(db) {
    const now = new Date();

    const adminRole = await db.collection('roles').findOne({ name: 'admin' });
    const jobSeekerRole = await db.collection('roles').findOne({
      name: 'job_seeker',
    });
    const employerRole = await db.collection('roles').findOne({
      name: 'employer',
    });

    const adminPermissions = {
      users: { view: true, create: true, edit: true, delete: true },
      roles: { view: true, create: true, edit: true, delete: true },
      jobs: { view: true, create: true, edit: true, delete: true },
      applications: { view: true, create: true, edit: true, delete: true },
      companies: { view: true, create: true, edit: true, delete: true },
      profiles: { view: true, create: true, edit: true, delete: true },
      admin: { view: true, create: true, edit: true, delete: true },
    };

    const jobSeekerPermissions = {
      users: { view: false, create: false, edit: false, delete: false },
      roles: { view: false, create: false, edit: false, delete: false },
      jobs: { view: true, create: false, edit: false, delete: false },
      applications: { view: true, create: true, edit: false, delete: false },
      companies: { view: true, create: false, edit: false, delete: false },
      profiles: { view: true, create: true, edit: true, delete: false },
      admin: { view: false, create: false, edit: false, delete: false },
    };

    const employerPermissions = {
      users: { view: false, create: false, edit: false, delete: false },
      roles: { view: false, create: false, edit: false, delete: false },
      jobs: { view: true, create: true, edit: true, delete: true },
      applications: { view: true, create: false, edit: true, delete: false },
      companies: { view: true, create: true, edit: true, delete: true },
      profiles: { view: true, create: true, edit: true, delete: false },
      admin: { view: false, create: false, edit: false, delete: false },
    };

    if (adminRole) {
      await db.collection('roles').updateOne(
        { _id: adminRole._id },
        { $set: { permissions: adminPermissions, updatedAt: now } },
      );
    } else {
      await db.collection('roles').insertOne({
        name: 'admin',
        permissions: adminPermissions,
        createdAt: now,
        updatedAt: now,
      });
    }

    if (!jobSeekerRole) {
      await db.collection('roles').insertOne({
        name: 'job_seeker',
        permissions: jobSeekerPermissions,
        createdAt: now,
        updatedAt: now,
      });
    }

    if (!employerRole) {
      await db.collection('roles').insertOne({
        name: 'employer',
        permissions: employerPermissions,
        createdAt: now,
        updatedAt: now,
      });
    }
  },

  async down(db) {
    await db
      .collection('roles')
      .deleteMany({ name: { $in: ['job_seeker', 'employer'] } });

    const adminRole = await db.collection('roles').findOne({ name: 'admin' });
    if (adminRole) {
      await db.collection('roles').updateOne(
        { _id: adminRole._id },
        {
          $set: {
            permissions: {
              users: { view: true, create: true, edit: true, delete: true },
              roles: { view: true, create: true, edit: true, delete: true },
            },
            updatedAt: new Date(),
          },
        },
      );
    }
  },
};
