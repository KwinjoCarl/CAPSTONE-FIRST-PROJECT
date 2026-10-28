// Hashes any plain-text passwords in the users table with bcrypt.
// Safe to run multiple times — already-hashed passwords (starting with $2) are skipped.
const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function migratePasswords() {
  const [users] = await db.query('SELECT id, email, password FROM users');
  let migrated = 0;

  for (const user of users) {
    if (user.password && !user.password.startsWith('$2')) {
      const hash = await bcrypt.hash(user.password, 10);
      await db.query('UPDATE users SET password = ? WHERE id = ?', [hash, user.id]);
      console.log(`  hashed password for ${user.email}`);
      migrated++;
    }
  }

  console.log(`Password migration complete: ${migrated} user(s) migrated, ${users.length - migrated} already hashed.`);
  process.exit(0);
}

migratePasswords().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
