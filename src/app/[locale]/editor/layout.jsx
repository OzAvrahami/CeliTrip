import {headers} from 'next/headers';
import {auth} from '@/server/auth';
import {pool} from '@/server/db';
import {administration} from '@/server/administration';
import {DomainError} from '@/server/editorial-validation';
import {localDemoRequest} from '@/server/local-demo-auth';
import AdminShell from '@/components/AdminShell';
import version from '../../../../VERSION.json';
import {releaseLabel} from '@/lib/release-label.cjs';
/** Persistent authenticated shell. Each page/service still authorizes every request. */
export default async function AdministrationLayout({children,params}){
 const {locale}=await params,h=await headers(),session=await auth.api.getSession({headers:h});
 if(!session)return children;
 let context;try{context=await administration(pool).context({userId:session.user.id,sessionId:session.session.id,requestHeaders:h});}catch(e){if(e instanceof DomainError)return children;throw e;}
 const identity=(await pool.query("SELECT translations FROM admin_setting WHERE key='identity'")).rows[0].translations[locale]||{name:'CeliTrip',tagline:''};
 return <AdminShell locale={locale} context={context} identity={identity} passwordDemo={localDemoRequest(h)} version={version.version} versionLabel={releaseLabel(version)}>{children}</AdminShell>;
}
