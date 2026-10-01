/** Fixture translations are unreviewed demonstration copy, never venue evidence. */
export const L = (en, he, fr, ru) => ({ en, he, fr, ru });
export const entities = [
  ['rome','destination',null,null],
  ['demo-chain','chain',null,null],
  ['forno-demo','branch','rome',null],
  ['tavola-demo','branch','rome','demo-chain'],
  ['mercato-demo','branch','rome',null],
  ['draft-only','branch','rome',null],
];
export const revisions = [
  { id:'rome-v1', entity:'rome', number:1, status:'published', categories:[],
    title:L('Rome','רומא','Rome','Рим'),
    summary:L('A little more context. A more considered choice. Explore the demonstration journey, from a place to the evidence behind each claim.','עוד קצת הקשר, בחירה יותר מודעת. גלו את מסע ההדגמה, מהמקום ועד למקורות של כל טענה.','Plus de contexte pour mieux choisir. Explorez le parcours de démonstration, du lieu aux sources de chaque affirmation.','Больше контекста для осознанного выбора. Пройдите демонстрационный маршрут от места к источникам каждого утверждения.') },
  { id:'forno-v1', entity:'forno-demo', number:1, status:'published', categories:['bakery','cafe','grocery'],
    title:L('Forno Demo · Branch A','פורנו לדוגמה · סניף א׳','Forno Démo · Succursale A','Форно Демо · Филиал A'),
    summary:L('A fictional bakery, café and grocery. Conflicting preparation reports remain unresolved; other details are unknown.','מאפייה, בית קפה ומכולת בדיוניים. דיווחים סותרים על ההכנה טרם הוכרעו; פרטים נוספים אינם ידועים.','Boulangerie, café et épicerie fictifs. Les témoignages contradictoires sur la préparation restent non résolus.','Вымышленные пекарня, кафе и магазин. Противоречия о приготовлении не разрешены; другие сведения неизвестны.') },
  { id:'forno-v2', entity:'forno-demo', number:2, status:'draft', categories:['restaurant'], title:L('DRAFT ONLY — NOT PUBLIC','טיוטה בלבד','BROUILLON PRIVÉ','ЧЕРНОВИК'), summary:L('DRAFT SECRET revision','טיוטה חסויה','Révision privée','Скрытая редакция') },
  { id:'tavola-v1', entity:'tavola-demo', number:1, status:'published', categories:['restaurant'],
    title:L('Tavola Demo · Branch B','טאבולה לדוגמה · סניף ב׳','Tavola Démo · Succursale B','Тавола Демо · Филиал B'),
    summary:L('A fictional restaurant in an example chain. A chain statement does not confirm this branch’s kitchen.','מסעדה בדיונית ברשת לדוגמה. הצהרת הרשת אינה מאשרת את תנאי המטבח בסניף זה.','Restaurant fictif d’une chaîne de démonstration. Une déclaration de la chaîne ne confirme pas la cuisine de cette succursale.','Вымышленный ресторан демонстрационной сети. Заявление сети не подтверждает устройство кухни этого филиала.') },
  { id:'mercato-v1', entity:'mercato-demo', number:1, status:'published', categories:['supermarket','grocery'],
    title:L('Mercato Demo · Branch C','מרקאטו לדוגמה · סניף ג׳','Mercato Démo · Succursale C','Меркато Демо · Филиал C'),
    summary:L('A fictional shop for exploring missing information. Product availability and preparation controls have not been established.','חנות בדיונית להדגמת מידע חסר. זמינות מוצרים ואמצעי מניעת מגע צולב לא הוכחו.','Magasin fictif pour explorer les informations manquantes. Disponibilité et mesures de préparation non établies.','Вымышленный магазин для примера отсутствующих данных. Наличие товаров и меры при приготовлении не установлены.') },
  { id:'draft-v1', entity:'draft-only', number:1, status:'draft', categories:['cafe'], title:L('PRIVATE DRAFT BRANCH','סניף טיוטה','SUCCURSALE PRIVÉE','ЧЕРНОВИК ФИЛИАЛА'), summary:L('Not published','לא פורסם','Non publié','Не опубликовано') },
];
export const claims = [
  {id:'utensils',rev:'forno-v1',subject:'forno-demo',predicate:'separate_utensils',value:null,dimensions:['unknown'],title:L('Separate utensils','כלים נפרדים','Ustensiles séparés','Отдельная посуда'), summary:L('No observation answers this question.','אין תצפית שעונה על שאלה זו.','Aucune observation ne répond à cette question.','Нет наблюдений, отвечающих на этот вопрос.')},
  {id:'historical',rev:'forno-v1',subject:'forno-demo',predicate:'accreditation',value:null,dimensions:['historical','needs_review','unknown'],title:L('Accreditation history','היסטוריית הסמכה','Historique d’accréditation','История аккредитации'),summary:L('An illustrative older record cannot establish current accreditation. No actual authority, approval or dates are supplied.','רשומה ישנה להמחשה אינה מוכיחה הסמכה נוכחית. לא נמסרו רשות אמיתית, אישור או תאריכים.','Un ancien document illustratif ne prouve aucune accréditation actuelle. Aucune autorité, approbation ou date réelle.','Условная старая запись не подтверждает текущую аккредитацию. Реальные организация, одобрение и даты не указаны.')},
  {id:'fryer',rev:'forno-v1',subject:'forno-demo',predicate:'dedicated_fryer',value:null,dimensions:['conflicting','needs_review'],title:L('Dedicated fryer','מטגנת ייעודית','Friteuse dédiée','Отдельная фритюрница'),summary:L('Two fictional observations disagree. Neither is selected as the current truth.','שתי תצפיות בדיוניות סותרות זו את זו. אף אחת אינה מוצגת כאמת נוכחית.','Deux observations fictives se contredisent. Aucune n’est retenue comme vérité actuelle.','Два вымышленных наблюдения противоречат друг другу. Ни одно не принято за текущее состояние.')},
  {id:'chain-kitchen',rev:'tavola-v1',subject:'demo-chain',predicate:'separate_kitchen',value:null,dimensions:['chain_scope','unknown','needs_review'],title:L('Chain kitchen statement','הצהרת הרשת על המטבח','Déclaration de la chaîne sur les cuisines','Заявление сети о кухне'),summary:L('This example statement concerns the chain. Branch B’s preparation environment remains unknown.','הצהרה זו לדוגמה נוגעת לרשת. סביבת ההכנה בסניף ב׳ עדיין אינה ידועה.','Cette déclaration concerne la chaîne. L’environnement de préparation de la succursale B reste inconnu.','Пример заявления относится к сети. Условия приготовления в филиале B остаются неизвестными.')},
  {id:'products',rev:'mercato-v1',subject:'mercato-demo',predicate:'gf_availability',value:null,dimensions:['unknown'],title:L('Product availability','זמינות מוצרים','Disponibilité des produits','Наличие товаров'),summary:L('No product range or preparation information has been recorded.','לא תועד מידע על מגוון המוצרים או ההכנה.','Aucune information sur l’offre ou la préparation n’est enregistrée.','Сведения об ассортименте и приготовлении не записаны.')},
  {id:'draft-secret',rev:'forno-v2',subject:'forno-demo',predicate:'private_edit',value:true,dimensions:[],title:L('DRAFT SECRET claim','טיוטה','Brouillon','Черновик'),summary:L('Must not leak','חסוי','Privé','Скрыто')},
];
const generic = L('Illustrative source','מקור להמחשה','Source illustrative','Иллюстративный источник');
export const sources = [
  ['history-1','history',1,'forno-demo','historical_record',generic],
  ['venue-1','venue',1,'forno-demo','venue',L('Example venue statement · revision 1','הצהרת עסק לדוגמה · גרסה 1','Déclaration fictive · révision 1','Пример заявления · редакция 1')],
  ['venue-2','venue',2,'forno-demo','venue',L('Example venue statement · revision 2','הצהרת עסק לדוגמה · גרסה 2','Déclaration fictive · révision 2','Пример заявления · редакция 2')],
  ['chain-1','chain',1,'demo-chain','chain',L('Example chain statement','הצהרת רשת לדוגמה','Déclaration fictive de chaîne','Пример заявления сети')],
];
export const observations = [
  ['history-o','historical','history-1','unresolved',L('Historical scenario only; no current accreditation established.','תרחיש היסטורי בלבד; לא הוכחה הסמכה נוכחית.','Scénario historique uniquement ; aucune accréditation actuelle établie.','Только исторический сценарий; текущая аккредитация не установлена.')],
  ['fryer-yes','fryer','venue-1','supports',L('Example earlier statement: a dedicated fryer is described.','הצהרה קודמת לדוגמה: מתוארת מטגנת ייעודית.','Exemple antérieur : une friteuse dédiée est décrite.','Ранний пример заявления: описана отдельная фритюрница.')],
  ['fryer-no','fryer','venue-2','contradicts',L('Example changed statement: the fryer is described as shared. Newer does not automatically resolve the conflict.','הצהרה ששונתה לדוגמה: המטגנת מתוארת כמשותפת. גרסה חדשה אינה פותרת את הסתירה אוטומטית.','Exemple modifié : la friteuse est décrite comme partagée. La nouvelle version ne résout pas automatiquement le conflit.','Изменённый пример: фритюрница описана как общая. Новая редакция не разрешает противоречие автоматически.')],
  ['chain-o','chain-kitchen','chain-1','unresolved',L('A chain-wide statement describes separate kitchens, without identifying Branch B.','הצהרה כללית של הרשת מתארת מטבחים נפרדים, ללא זיהוי סניף ב׳.','La chaîne décrit des cuisines séparées, sans identifier la succursale B.','Сеть описывает отдельные кухни, не указывая филиал B.')],
];

/** Append-only deterministic fixtures: reruns neither duplicate nor overwrite existing work. */
export async function seed(client) {
  await client.query('BEGIN');
  try {
    for(const row of entities) await client.query('INSERT INTO entity(id,kind,parent_id,chain_id) VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING',row);
    for(const r of revisions) {
      await client.query('INSERT INTO content_revision(id,entity_id,revision_number,status,categories) VALUES($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING',[r.id,r.entity,r.number,r.status,r.categories]);
      for(const locale of ['he','en','fr','ru']) await client.query('INSERT INTO translation_revision(revision_id,locale,title,summary) VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING',[r.id,locale,r.title[locale],r.summary[locale]]);
    }
    for(const c of claims) await client.query('INSERT INTO claim_revision(id,revision_id,subject_id,predicate,value,dimensions,copy) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING',[c.id,c.rev,c.subject,c.predicate,c.value,c.dimensions,JSON.stringify(Object.fromEntries(['he','en','fr','ru'].map(l=>[l,{title:c.title[l],summary:c.summary[l]}])))]);
    for(const s of sources) await client.query('INSERT INTO source_revision(id,source_id,revision_number,subject_id,source_type,title) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING',s);
    for(const o of observations) await client.query('INSERT INTO observation(id,claim_id,source_revision_id,stance,statement) VALUES($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING',o);
    for(const r of revisions.filter(r=>r.status==='published')) await client.query('INSERT INTO publication(entity_id,revision_id) VALUES($1,$2) ON CONFLICT DO NOTHING',[r.entity,r.id]);
    await client.query('COMMIT');
  } catch(error) { await client.query('ROLLBACK'); throw error; }
}
