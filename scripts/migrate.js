import { runner } from 'node-pg-migrate';
import { localConfig } from '../src/server/local-config.js';
export async function migrate(connectionString = localConfig().connectionString) {
  return runner({ databaseUrl: connectionString, dir: 'db/migrations', direction: 'up', migrationsTable: 'pgmigrations', log: () => {} });
}
if (process.argv[1]?.endsWith('migrate.js')) {
  await migrate();
  console.log('Local migrations applied.');
}
