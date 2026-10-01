/** @typedef {'he'|'en'|'fr'|'ru'} Locale */
/** @typedef {{category?:string, dimension?:string, q?:string}} Filters */
export const categories = ['bakery','cafe','grocery','restaurant','supermarket'];
export const dimensions = ['unknown','historical','needs_review','conflicting','chain_scope'];
export function filtersFrom(params = {}) {
  const one = (v) => typeof v === 'string' ? v : '';
  return { category: categories.includes(one(params.category)) ? params.category : '',
    dimension: dimensions.includes(one(params.dimension)) ? params.dimension : '', q: one(params.q).trim().slice(0,80) };
}
export function filterQuery(filters) {
  const query = new URLSearchParams(Object.entries(filtersFrom(filters)).filter(([,v])=>v));
  return query.size ? '?' + query.toString() : '';
}

/** Public repository has no draft switch; every read starts from a pinned publication. */
export function repository(db) {
  const validateLocale = (locale) => { if(!['he','en','fr','ru'].includes(locale)) throw new Error('Unsupported locale'); };
  return {
    async entity(id, locale) {
      validateLocale(locale);
      const {rows}=await db.query(`SELECT p.*, t.title, t.summary, t.review_status
        FROM published_content p JOIN translation_revision t ON t.revision_id=p.revision_id
        WHERE p.id=$1 AND t.locale=$2`,[id,locale]);
      return rows[0] || null;
    },
    /** @param {Locale} locale @param {Filters} filters */
    async places(locale, filters={}) {
      validateLocale(locale);
      const f=filtersFrom(filters);
      const {rows}=await db.query(`SELECT p.*,t.title,t.summary,
        ARRAY(SELECT DISTINCT unnest(c.dimensions) FROM claim_revision c WHERE c.revision_id=p.revision_id) AS dimensions
        FROM published_content p JOIN translation_revision t ON t.revision_id=p.revision_id AND t.locale=$1
        WHERE p.kind='branch' AND p.parent_id='rome'
        AND ($2='' OR $2=ANY(p.categories))
        AND ($3='' OR EXISTS(SELECT 1 FROM claim_revision c WHERE c.revision_id=p.revision_id AND $3=ANY(c.dimensions)))
        AND ($4='' OR EXISTS(SELECT 1 FROM translation_revision a WHERE a.revision_id=p.revision_id AND position(lower($4) in lower(a.title || ' ' || a.summary))>0))
        ORDER BY p.id`,[locale,f.category,f.dimension,f.q]);
      return rows;
    },
    async evidence(id,locale) {
      validateLocale(locale);
      const {rows}=await db.query(`SELECT c.id,c.predicate,c.value,c.dimensions,c.subject_id,
        e.kind AS scope,c.copy->$2 AS copy,
        COALESCE((SELECT jsonb_agg(jsonb_build_object('id',o.id,'stance',o.stance,'statement',o.statement->$2,
        'source',s.title->$2,'sourceId',s.source_id,'sourceRevision',s.revision_number,'sourceType',s.source_type,
        'sourceSubject',s.subject_id,'url',s.url,'publishedOn',s.published_on,'observedOn',o.observed_on,
        'verifiedOn',o.verified_on,'verificationMethod',o.verification_method,'effectiveOn',o.effective_on,'expiresOn',o.expires_on)
        ORDER BY s.source_id,s.revision_number,o.id) FROM observation o JOIN source_revision s ON s.id=o.source_revision_id WHERE o.claim_id=c.id),'[]'::jsonb) AS observations
        FROM published_content p JOIN claim_revision c ON c.revision_id=p.revision_id
        JOIN entity e ON e.id=c.subject_id WHERE p.id=$1 ORDER BY c.id`,[id,locale]);
      return rows;
    }
  };
}
