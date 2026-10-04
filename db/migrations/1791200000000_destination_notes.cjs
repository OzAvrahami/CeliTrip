exports.up=pgm=>pgm.sql('ALTER TABLE destination_revision ADD COLUMN internal_note text CHECK(length(internal_note)<=1000)');
exports.down=pgm=>pgm.sql('ALTER TABLE destination_revision DROP COLUMN internal_note');
