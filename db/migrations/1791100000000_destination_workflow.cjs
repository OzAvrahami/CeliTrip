exports.up=pgm=>pgm.sql(`
CREATE TABLE destination_revision (
 id uuid PRIMARY KEY, entity_id text NOT NULL REFERENCES entity(id), number integer NOT NULL,
 source_locale text NOT NULL CHECK(source_locale IN('he','en','fr','ru')), labels jsonb NOT NULL,
 provenance jsonb NOT NULL, identity jsonb, actor_id text REFERENCES "user"(id), created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(entity_id,number), UNIQUE(entity_id,id)
);
CREATE TRIGGER immutable_destination_revision BEFORE UPDATE OR DELETE ON destination_revision FOR EACH ROW EXECUTE FUNCTION immutable_revision();
ALTER TABLE admin_destination ADD COLUMN revision_id uuid REFERENCES destination_revision(id), ADD COLUMN review_state text NOT NULL DEFAULT 'draft' CHECK(review_state IN('draft','review','published','withdrawn')), ADD COLUMN cycle integer NOT NULL DEFAULT 0;
INSERT INTO destination_revision(id,entity_id,number,source_locale,labels,provenance,identity)
 SELECT gen_random_uuid(),entity_id,version,'en',labels,
 jsonb_build_object('he',jsonb_build_object('method','legacy_manual'),'en',jsonb_build_object('method','legacy_manual'),'fr',jsonb_build_object('method','legacy_manual'),'ru',jsonb_build_object('method','legacy_manual')),
 CASE entity_id WHEN 'italy' THEN '{"provider":"wikidata","id":"Q38","country":"Q38"}'::jsonb WHEN 'rome' THEN '{"provider":"wikidata","id":"Q220","country":"Q38"}'::jsonb ELSE NULL END
 FROM admin_destination;
UPDATE admin_destination d SET revision_id=r.id FROM destination_revision r WHERE r.entity_id=d.entity_id;
ALTER TABLE admin_destination ALTER COLUMN revision_id SET NOT NULL;
CREATE TABLE destination_review(id bigserial PRIMARY KEY,revision_id uuid NOT NULL REFERENCES destination_revision(id),cycle integer NOT NULL,actor_id text NOT NULL REFERENCES "user"(id),kind text NOT NULL CHECK(kind IN('subject','language')),locale text NOT NULL,reason text NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),UNIQUE(revision_id,cycle,kind,locale));
CREATE TRIGGER immutable_destination_review BEFORE UPDATE OR DELETE ON destination_review FOR EACH ROW EXECUTE FUNCTION immutable_revision();
CREATE TABLE destination_publication(entity_id text PRIMARY KEY REFERENCES entity(id),revision_id uuid NOT NULL,FOREIGN KEY(entity_id,revision_id) REFERENCES destination_revision(entity_id,id));
CREATE TABLE translation_generation(id uuid PRIMARY KEY,actor_id text NOT NULL REFERENCES "user"(id),entity_id text REFERENCES entity(id),base_revision uuid REFERENCES destination_revision(id),source_hash text NOT NULL,source_locale text NOT NULL,provider text NOT NULL,result jsonb NOT NULL,created_at timestamptz NOT NULL DEFAULT now());
CREATE TRIGGER immutable_translation_generation BEFORE UPDATE OR DELETE ON translation_generation FOR EACH ROW EXECUTE FUNCTION immutable_revision();
CREATE TABLE translation_throttle(actor_id text PRIMARY KEY REFERENCES "user"(id),window_start timestamptz NOT NULL DEFAULT now(),requests integer NOT NULL);
`);
exports.down=pgm=>pgm.sql(`DROP TABLE translation_throttle,translation_generation,destination_publication,destination_review;ALTER TABLE admin_destination DROP COLUMN revision_id,DROP COLUMN review_state,DROP COLUMN cycle;DROP TABLE destination_revision;`);
