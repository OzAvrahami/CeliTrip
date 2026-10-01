exports.up = (pgm) => pgm.sql(`
CREATE TABLE entity (
  id text PRIMARY KEY,
  kind text NOT NULL CHECK (kind IN ('destination','branch','chain')),
  parent_id text REFERENCES entity(id),
  chain_id text REFERENCES entity(id),
  fixture boolean NOT NULL DEFAULT true CHECK (fixture)
);
CREATE TABLE content_revision (
  id text PRIMARY KEY,
  entity_id text NOT NULL REFERENCES entity(id),
  revision_number integer NOT NULL CHECK (revision_number > 0),
  status text NOT NULL CHECK (status IN ('draft','published')),
  categories text[] NOT NULL DEFAULT '{}',
  address text,
  UNIQUE(entity_id, revision_number), UNIQUE(entity_id, id)
);
CREATE TABLE translation_revision (
  revision_id text NOT NULL REFERENCES content_revision(id),
  locale text NOT NULL CHECK (locale IN ('he','en','fr','ru')),
  title text NOT NULL,
  summary text NOT NULL,
  review_status text NOT NULL DEFAULT 'unreviewed_fixture' CHECK (review_status = 'unreviewed_fixture'),
  PRIMARY KEY(revision_id, locale)
);
CREATE TABLE publication (
  entity_id text PRIMARY KEY REFERENCES entity(id),
  revision_id text NOT NULL,
  FOREIGN KEY(entity_id, revision_id) REFERENCES content_revision(entity_id, id)
);
CREATE FUNCTION guard_publication() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM content_revision WHERE id=NEW.revision_id AND status='published') THEN
    RAISE EXCEPTION 'Draft revision cannot enter publication';
  END IF;
  IF (SELECT count(*) FROM translation_revision WHERE revision_id=NEW.revision_id) <> 4 THEN
    RAISE EXCEPTION 'All four fixture translations required';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER publication_guard BEFORE INSERT OR UPDATE ON publication FOR EACH ROW EXECUTE FUNCTION guard_publication();
CREATE TABLE claim_revision (
  id text PRIMARY KEY,
  revision_id text NOT NULL REFERENCES content_revision(id),
  subject_id text NOT NULL REFERENCES entity(id),
  predicate text NOT NULL,
  value boolean,
  dimensions text[] NOT NULL CHECK (dimensions <@ ARRAY['unknown','historical','needs_review','conflicting','chain_scope']::text[]),
  copy jsonb NOT NULL,
  UNIQUE(revision_id, id)
);
CREATE TABLE source_revision (
  id text PRIMARY KEY,
  source_id text NOT NULL,
  revision_number integer NOT NULL,
  subject_id text NOT NULL REFERENCES entity(id),
  source_type text NOT NULL CHECK (source_type IN ('venue','chain','historical_record','traveler')),
  title jsonb NOT NULL,
  url text,
  published_on date,
  UNIQUE(source_id, revision_number)
);
CREATE TABLE observation (
  id text PRIMARY KEY,
  claim_id text NOT NULL REFERENCES claim_revision(id),
  source_revision_id text NOT NULL REFERENCES source_revision(id),
  stance text NOT NULL CHECK (stance IN ('supports','contradicts','unresolved')),
  statement jsonb NOT NULL,
  observed_on date,
  verified_on date,
  verification_method text,
  effective_on date,
  expires_on date
);
CREATE INDEX branch_parent_idx ON entity(parent_id);
CREATE INDEX claim_revision_idx ON claim_revision(revision_id);
CREATE INDEX observation_claim_idx ON observation(claim_id);
CREATE FUNCTION immutable_revision() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'Append a new revision; preserve source history'; END $$;
CREATE TRIGGER immutable_content BEFORE UPDATE OR DELETE ON content_revision FOR EACH ROW EXECUTE FUNCTION immutable_revision();
CREATE TRIGGER immutable_translation BEFORE UPDATE OR DELETE ON translation_revision FOR EACH ROW EXECUTE FUNCTION immutable_revision();
CREATE TRIGGER immutable_claim BEFORE UPDATE OR DELETE ON claim_revision FOR EACH ROW EXECUTE FUNCTION immutable_revision();
CREATE TRIGGER immutable_source BEFORE UPDATE OR DELETE ON source_revision FOR EACH ROW EXECUTE FUNCTION immutable_revision();
CREATE TRIGGER immutable_observation BEFORE UPDATE OR DELETE ON observation FOR EACH ROW EXECUTE FUNCTION immutable_revision();
CREATE VIEW published_content AS
SELECT e.id, e.kind, e.parent_id, e.chain_id, r.id AS revision_id, r.revision_number, r.categories, r.address
FROM publication p JOIN entity e ON e.id=p.entity_id
JOIN content_revision r ON r.id=p.revision_id AND r.entity_id=e.id AND r.status='published';
`);
exports.down = (pgm) => pgm.sql(`DROP VIEW published_content; DROP TABLE observation, source_revision, claim_revision, publication, translation_revision, content_revision, entity CASCADE; DROP FUNCTION guard_publication(), immutable_revision();`);
