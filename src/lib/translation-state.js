/** Keep corrections/reviewed values; ignore responses for an older source or field edit. */
export function mergeGenerated(current, generated, snapshot, sourceKey, responseKey, protectedLocales=[]) {
 if(sourceKey!==responseKey)return current;
 return Object.fromEntries(Object.entries(current).map(([locale,value])=>[locale,
  protectedLocales.includes(locale)||value!==snapshot[locale]?value:generated[locale]||value]));
}
