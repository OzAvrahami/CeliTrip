exports.up = (pgm) => pgm.sql(`
CREATE FUNCTION guard_claim_scope() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE owner_id text; owner_chain text; subject_kind text;
BEGIN
 SELECT r.entity_id,e.chain_id INTO owner_id,owner_chain FROM content_revision r JOIN entity e ON e.id=r.entity_id WHERE r.id=NEW.revision_id;
 SELECT kind INTO subject_kind FROM entity WHERE id=NEW.subject_id;
 IF NEW.subject_id IS DISTINCT FROM owner_id AND NEW.subject_id IS DISTINCT FROM owner_chain THEN
   RAISE EXCEPTION 'Claim belongs to another branch or chain';
 END IF;
 IF ('chain_scope'=ANY(NEW.dimensions)) IS DISTINCT FROM (subject_kind='chain') THEN
   RAISE EXCEPTION 'Chain scope must be explicit';
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER claim_scope_guard BEFORE INSERT ON claim_revision FOR EACH ROW EXECUTE FUNCTION guard_claim_scope();
CREATE FUNCTION guard_observation_scope() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF (SELECT subject_id FROM claim_revision WHERE id=NEW.claim_id) IS DISTINCT FROM
    (SELECT subject_id FROM source_revision WHERE id=NEW.source_revision_id) THEN
   RAISE EXCEPTION 'Observation source scope must match the claim subject';
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER observation_scope_guard BEFORE INSERT ON observation FOR EACH ROW EXECUTE FUNCTION guard_observation_scope();
`);
exports.down = (pgm) => pgm.sql('DROP TRIGGER observation_scope_guard ON observation; DROP TRIGGER claim_scope_guard ON claim_revision; DROP FUNCTION guard_observation_scope(),guard_claim_scope();');
