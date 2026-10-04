exports.up=pgm=>pgm.sql(`
CREATE TABLE editorial_grant (
 user_id text REFERENCES "user"(id), role text CHECK(role IN('editor','language_reviewer','subject_reviewer','publisher','administrator')),
 scope text NOT NULL REFERENCES entity(id), locale text NOT NULL DEFAULT '*' CHECK(locale IN('*','he','en','fr','ru')),
 PRIMARY KEY(user_id,role,scope,locale), CHECK(role<>'language_reviewer' OR locale<>'*')
);
CREATE TABLE editorial_revision (
 id text PRIMARY KEY REFERENCES content_revision(id), parent_revision text REFERENCES content_revision(id),
 actor_id text NOT NULL REFERENCES "user"(id), document jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), synthetic boolean NOT NULL DEFAULT true CHECK(synthetic)
);
CREATE TABLE editorial_head (
 entity_id text PRIMARY KEY REFERENCES entity(id), revision_id text NOT NULL REFERENCES editorial_revision(id),
 state text NOT NULL CHECK(state IN('draft','review','published','withdrawn')), cycle integer NOT NULL DEFAULT 0
);
CREATE TABLE editorial_review (
 id bigserial PRIMARY KEY, revision_id text NOT NULL REFERENCES editorial_revision(id), cycle integer NOT NULL,
 actor_id text NOT NULL REFERENCES "user"(id), kind text NOT NULL CHECK(kind IN('subject','language')),
 locale text NOT NULL CHECK(locale IN('*','he','en','fr','ru')), reason text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), synthetic boolean NOT NULL DEFAULT true CHECK(synthetic),
 UNIQUE(revision_id,cycle,kind,locale), CHECK((kind='subject')=(locale='*'))
);
CREATE TABLE editorial_audit (
 id bigserial PRIMARY KEY, actor_id text REFERENCES "user"(id), operator text,
 entity_id text REFERENCES entity(id), revision_id text REFERENCES content_revision(id),
 action text NOT NULL, reason text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE correction (
 id uuid PRIMARY KEY, entity_id text NOT NULL REFERENCES entity(id), revision_id text NOT NULL,
 claim_id text, message text NOT NULL CHECK(length(message) BETWEEN 10 AND 2000),
 contact text CHECK(length(contact)<=254), state text NOT NULL DEFAULT 'new' CHECK(state IN('new','triaged','resolved')),
 created_at timestamptz NOT NULL DEFAULT now(), version integer NOT NULL DEFAULT 1,
 FOREIGN KEY(entity_id,revision_id) REFERENCES content_revision(entity_id,id),
 FOREIGN KEY(revision_id,claim_id) REFERENCES claim_revision(revision_id,id)
);
CREATE TABLE submission_limit (bucket text PRIMARY KEY, count integer NOT NULL, expires_at timestamptz NOT NULL);
CREATE TRIGGER immutable_editorial_revision BEFORE UPDATE OR DELETE ON editorial_revision FOR EACH ROW EXECUTE FUNCTION immutable_revision();
CREATE TRIGGER immutable_editorial_review BEFORE UPDATE OR DELETE ON editorial_review FOR EACH ROW EXECUTE FUNCTION immutable_revision();
CREATE TRIGGER immutable_editorial_audit BEFORE UPDATE OR DELETE ON editorial_audit FOR EACH ROW EXECUTE FUNCTION immutable_revision();
CREATE FUNCTION seal_editorial_children() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE target text;
BEGIN
 IF TG_TABLE_NAME='observation' THEN SELECT revision_id INTO target FROM claim_revision WHERE id=NEW.claim_id;
 ELSE target:=NEW.revision_id; END IF;
 IF EXISTS(SELECT 1 FROM editorial_revision WHERE id=target) THEN RAISE EXCEPTION 'Revision is sealed'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER seal_claim BEFORE INSERT ON claim_revision FOR EACH ROW EXECUTE FUNCTION seal_editorial_children();
CREATE TRIGGER seal_translation BEFORE INSERT ON translation_revision FOR EACH ROW EXECUTE FUNCTION seal_editorial_children();
CREATE TRIGGER seal_observation BEFORE INSERT ON observation FOR EACH ROW EXECUTE FUNCTION seal_editorial_children();
CREATE OR REPLACE FUNCTION guard_publication() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE review_cycle integer; review_state text;
BEGIN
 IF EXISTS(SELECT 1 FROM editorial_revision WHERE id=NEW.revision_id) THEN
   SELECT cycle,state INTO review_cycle,review_state FROM editorial_head WHERE entity_id=NEW.entity_id AND revision_id=NEW.revision_id;
   IF review_state IS DISTINCT FROM 'review' OR
      (SELECT count(*) FROM editorial_review WHERE revision_id=NEW.revision_id AND cycle=review_cycle AND kind='language')<>4 OR
      NOT EXISTS(SELECT 1 FROM editorial_review WHERE revision_id=NEW.revision_id AND cycle=review_cycle AND kind='subject')
   THEN RAISE EXCEPTION 'Exact current revision requires subject and four language reviews'; END IF;
 ELSIF NOT EXISTS(SELECT 1 FROM content_revision WHERE id=NEW.revision_id AND status='published') THEN
   RAISE EXCEPTION 'Draft revision cannot enter publication';
 END IF;
 IF (SELECT count(*) FROM translation_revision WHERE revision_id=NEW.revision_id)<>4 THEN RAISE EXCEPTION 'All four fixture translations required'; END IF;
 RETURN NEW;
END $$;
CREATE OR REPLACE VIEW published_content AS
SELECT e.id,e.kind,e.parent_id,e.chain_id,r.id AS revision_id,r.revision_number,r.categories,r.address
FROM publication p JOIN entity e ON e.id=p.entity_id JOIN content_revision r ON r.id=p.revision_id AND r.entity_id=e.id;
CREATE INDEX ON editorial_audit(entity_id,id);
CREATE INDEX ON correction(entity_id,state);
`);
exports.down=pgm=>pgm.sql(`
DROP TRIGGER seal_claim ON claim_revision; DROP TRIGGER seal_translation ON translation_revision; DROP TRIGGER seal_observation ON observation; DROP FUNCTION seal_editorial_children();
DROP TABLE submission_limit,correction,editorial_audit,editorial_review,editorial_head,editorial_revision,editorial_grant;
CREATE OR REPLACE VIEW published_content AS SELECT e.id,e.kind,e.parent_id,e.chain_id,r.id AS revision_id,r.revision_number,r.categories,r.address FROM publication p JOIN entity e ON e.id=p.entity_id JOIN content_revision r ON r.id=p.revision_id AND r.entity_id=e.id AND r.status='published';
CREATE OR REPLACE FUNCTION guard_publication() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
IF NOT EXISTS(SELECT 1 FROM content_revision WHERE id=NEW.revision_id AND status='published') THEN RAISE EXCEPTION 'Draft revision cannot enter publication'; END IF;
IF (SELECT count(*) FROM translation_revision WHERE revision_id=NEW.revision_id)<>4 THEN RAISE EXCEPTION 'All four fixture translations required'; END IF; RETURN NEW; END $$;
`);
