/**
 * cdn.jsdelivr.net is necessary to load the unicode fonts for troika-js
 */

export const developmentCSP = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob:;
  font-src 'self' data:;
  worker-src 'self' blob:;
  object-src 'none';
  base-uri 'self';
  connect-src 'self' https://cdn.jsdelivr.net;
`;

export const productionCSP = `
  default-src 'self';
  script-src 'self' blob:;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob:;
  font-src 'self' data:;
  worker-src 'self' blob:;
  object-src 'none';
  base-uri 'self';
  connect-src 'self' https://cdn.jsdelivr.net;
`;
