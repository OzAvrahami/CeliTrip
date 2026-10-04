import {destinations} from '@/server/destinations';
import {pool} from '@/server/db';
import {administration} from '@/server/administration';
import {editorialService} from '@/server/editorial-service';
import {principal,readBody,response,errorResponse} from '@/server/editorial-http';
import {fail} from '@/server/editorial-validation';
const service=administration(pool),editorial=editorialService(pool);
export async function GET(request){try{const p=await principal(request.headers),q=Object.fromEntries(new URL(request.url).searchParams);return response(q.view==='destination'?await destinations(pool).read(p,q.id):await service.read(p,q.view||'dashboard',q));}catch(e){return errorResponse(e);}}
export async function POST(request){try{const body=await readBody(request),p=await principal(request.headers);let result;
 if(body.action==='destination-generation')result=await destinations(pool).generation(p,body);
 else if(body.action==='destination-transition')result=await destinations(pool).transition(p,{...body,action:body.operation});
 else if(['destination','category'].includes(body.action))result=await service.saveCatalog(p,body.action,body);
 else if(body.action==='settings')result=await service.settings(p,body);
 else if(body.action==='correction')result=await service.correction(p,body);
 else if(body.action==='team')result=await service.team(p,body);
 else if(body.action==='translation')result=await editorial.save(p,body.id,body.expected,body.document,body.locale);
 else fail('invalid');return response(result);
 }catch(e){return errorResponse(e);}}
