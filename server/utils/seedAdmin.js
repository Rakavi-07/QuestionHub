import Admin from '../models/Admin.js';

const DEFAULT_ADMIN = {
  name: 'QuestionHub Admin',
  email: 'admin@srmist.edu.in',
  password: 'Admin@123',
};

/**
 * Ensures at least one Admin account exists. Runs once at server startup.
 * The password is hashed automatically by the Admin model's pre-save hook.
 */
export default async function seedAdmin() {
  try {
    const adminCount = await Admin.countDocuments();

    if (adminCount === 0) {
      await Admin.create(DEFAULT_ADMIN);
      console.log(
        `Default admin created -> email: ${DEFAULT_ADMIN.email} | password: ${DEFAULT_ADMIN.password} (please change this after first login)`
      );
    }
  } catch (error) {
    console.error(`Failed to seed default admin: ${error.message}`);
  }
}
