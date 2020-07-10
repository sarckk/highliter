/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
const buildCfg = env => {
  if (env === 'dev' || env === 'prod' || env === 'prod-demo') {
    return require(`./config/${env}.js`);
  }
  console.log('Invalid env parameter. Use "dev", "prod-lib" or "prod-demo"');
  return null;
};

module.exports = buildCfg;
