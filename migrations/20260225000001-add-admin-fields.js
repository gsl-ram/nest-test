module.exports = {
  async up(db) {
    const now = new Date();

    await db.collection('users').updateMany(
      { isBanned: { $exists: false } },
      { $set: { isBanned: false, updatedAt: now } },
    );

    await db.collection('companies').updateMany(
      { verificationStatus: { $exists: false } },
      { $set: { verificationStatus: 'pending', updatedAt: now } },
    );

    await db.collection('jobs').updateMany(
      { moderationStatus: { $exists: false } },
      { $set: { moderationStatus: 'APPROVED', updatedAt: now } },
    );
  },

  async down(db) {
    await db.collection('users').updateMany(
      {},
      { $unset: { isBanned: '' } },
    );

    await db.collection('companies').updateMany(
      {},
      { $unset: { verificationStatus: '' } },
    );

    await db.collection('jobs').updateMany(
      {},
      { $unset: { moderationStatus: '' } },
    );
  },
};
