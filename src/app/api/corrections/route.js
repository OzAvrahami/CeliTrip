import {pool} from '@/server/db';
import {submitCorrection} from '@/server/corrections';
import {readBody,response,errorResponse} from '@/server/editorial-http';
export async function POST(request){try{return response(await submitCorrection(pool,await readBody(request)));}catch(e){return errorResponse(e);}}
