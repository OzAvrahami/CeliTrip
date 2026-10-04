// Distinct from MFA: only a successful guarded owner-demo password sign-in sets this.
exports.up = pgm => pgm.addColumns('session', {
  localDemoPassword: {type:'boolean',notNull:true,default:false}
});
exports.down = pgm => pgm.dropColumns('session', ['localDemoPassword']);
