import {pool} from '@/server/db';
import {editorialService} from '@/server/editorial-service';
import {principal,readBody,response,errorResponse} from '@/server/editorial-http';
import {fail} from '@/server/editorial-validation';
const service=editorialService(pool);
export async function GET(request){try{const p=await principal(request.headers);const q=new URL(request.url).searchParams;
  return response(q.get('view')==='corrections'?await service.corrections(p):q.get('view')==='access'?await service.access(p):q.get('id')?await service.read(p,q.get('id')):await service.list(p));
}catch(e){return errorResponse(e);}}
export async function POST(request){try{const body=await readBody(request),p=await principal(request.headers);let result;
  if(body.action==='save')result=await service.save(p,body.id,body.expected,body.document);
  else if(body.action==='correction')result=await service.resolve(p,body.id,body.version,body.state,body.reason);
  else if(body.action==='revoke')result=await service.revoke(p,body.userId,body.reason);
  else if(['submit','subject','language','publish','withdraw','return'].includes(body.action))result=await service.transition(p,body.id,body.revision,body.cycle,body.action,body.locale,body.reason);
  else fail('invalid');return response(result);
}catch(e){return errorResponse(e);}}
