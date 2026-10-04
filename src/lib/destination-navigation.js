/** Carry only bounded list filters, never a caller-supplied redirect URL. */
export function destinationContext(input={}){
 const source=typeof input==='string'?new URLSearchParams(input):input;
 const out=new URLSearchParams();
 for(const key of ['q','kind','state','destination','sort','page']){
  const value=source instanceof URLSearchParams?source.get(key):source[key];
  if(typeof value==='string'&&value.length<=160)out.set(key,value);
 }
 return out.toString();
}
export const destinationList=(locale,context)=>`/${locale}/editor/destinations${destinationContext(context)?'?'+destinationContext(context):''}`;
export const destinationQuery=context=>destinationContext(context)?'?from='+encodeURIComponent(destinationContext(context)):'';
