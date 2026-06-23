function resolveDevOrigin(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return 'http://localhost:4200';
}

export const environment = {
  production: false,
  get siteUrl() {
    return resolveDevOrigin();
  },
  get apiUrl() {
    return `${resolveDevOrigin()}/api`;
  }
};
