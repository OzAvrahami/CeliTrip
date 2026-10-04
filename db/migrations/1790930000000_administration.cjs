exports.up=pgm=>pgm.sql(`
CREATE TABLE admin_access(user_id text PRIMARY KEY REFERENCES "user"(id),disabled boolean NOT NULL DEFAULT false,version integer NOT NULL DEFAULT 1);
CREATE TABLE admin_destination(entity_id text PRIMARY KEY REFERENCES entity(id),kind text NOT NULL CHECK(kind IN('country','city')),labels jsonb NOT NULL,state text NOT NULL DEFAULT 'draft' CHECK(state IN('draft','archived')),version integer NOT NULL DEFAULT 1);
INSERT INTO entity(id,kind) VALUES('italy','destination') ON CONFLICT DO NOTHING;
INSERT INTO entity(id,kind,parent_id) VALUES('rome','destination','italy') ON CONFLICT DO NOTHING;
INSERT INTO admin_destination(entity_id,kind,labels) VALUES('italy','country','{"he":"איטליה","en":"Italy","fr":"Italie","ru":"Италия"}'),('rome','city','{"he":"רומא","en":"Rome","fr":"Rome","ru":"Рим"}');
UPDATE entity SET parent_id='italy' WHERE id='rome' AND parent_id IS NULL;
CREATE TABLE admin_category(id text PRIMARY KEY,labels jsonb NOT NULL,archived boolean NOT NULL DEFAULT false,version integer NOT NULL DEFAULT 1);
INSERT INTO admin_category(id,labels) VALUES
 ('bakery','{"he":"מאפייה","en":"Bakery","fr":"Boulangerie","ru":"Пекарня"}'),
 ('cafe','{"he":"בית קפה","en":"Café","fr":"Café","ru":"Кафе"}'),
 ('grocery','{"he":"מכולת","en":"Grocery","fr":"Épicerie","ru":"Продукты"}'),
 ('restaurant','{"he":"מסעדה","en":"Restaurant","fr":"Restaurant","ru":"Ресторан"}'),
 ('supermarket','{"he":"סופרמרקט","en":"Supermarket","fr":"Supermarché","ru":"Супермаркет"}');
CREATE TABLE admin_setting(key text PRIMARY KEY,translations jsonb NOT NULL,version integer NOT NULL DEFAULT 1);
INSERT INTO admin_setting VALUES('identity','{"he":{"name":"CeliTrip","tagline":"סביבת עריכה מקומית"},"en":{"name":"CeliTrip","tagline":"Local editorial workspace"},"fr":{"name":"CeliTrip","tagline":"Espace éditorial local"},"ru":{"name":"CeliTrip","tagline":"Локальная редакция"}}',1);
CREATE TABLE admin_history(id bigserial PRIMARY KEY,kind text NOT NULL,target text NOT NULL,version integer NOT NULL,actor_id text NOT NULL REFERENCES "user"(id),snapshot jsonb NOT NULL,created_at timestamptz NOT NULL DEFAULT now());
CREATE TRIGGER immutable_admin_history BEFORE UPDATE OR DELETE ON admin_history FOR EACH ROW EXECUTE FUNCTION immutable_revision();
ALTER TABLE correction ADD COLUMN assigned_to text REFERENCES "user"(id);
CREATE TABLE correction_event(id bigserial PRIMARY KEY,correction_id uuid NOT NULL REFERENCES correction(id),actor_id text NOT NULL REFERENCES "user"(id),state text NOT NULL,assigned_to text REFERENCES "user"(id),note text NOT NULL,created_at timestamptz NOT NULL DEFAULT now());
CREATE TRIGGER immutable_correction_event BEFORE UPDATE OR DELETE ON correction_event FOR EACH ROW EXECUTE FUNCTION immutable_revision();
CREATE FUNCTION editorial_scope_contains(scope_id text,target_id text) RETURNS boolean LANGUAGE sql STABLE AS $$
 WITH RECURSIVE lineage AS(SELECT id,parent_id FROM entity WHERE id=target_id UNION ALL SELECT e.id,e.parent_id FROM entity e JOIN lineage l ON e.id=l.parent_id)
 SELECT EXISTS(SELECT 1 FROM lineage WHERE id=scope_id)
$$;
`);
exports.down=pgm=>pgm.sql(`DROP FUNCTION editorial_scope_contains;DROP TABLE correction_event;ALTER TABLE correction DROP COLUMN assigned_to;DROP TABLE admin_history,admin_setting,admin_category,admin_destination,admin_access;`);
