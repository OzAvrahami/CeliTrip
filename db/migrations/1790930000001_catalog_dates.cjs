// Administrative record timestamps, not source verification dates or review deadlines.
exports.up=pgm=>pgm.sql(`
ALTER TABLE admin_destination ADD COLUMN created_at timestamptz NOT NULL DEFAULT now(), ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE admin_category ADD COLUMN created_at timestamptz NOT NULL DEFAULT now(), ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
`);
exports.down=pgm=>pgm.sql('ALTER TABLE admin_destination DROP COLUMN created_at,DROP COLUMN updated_at;ALTER TABLE admin_category DROP COLUMN created_at,DROP COLUMN updated_at;');
