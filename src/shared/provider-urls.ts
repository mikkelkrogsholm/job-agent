export type DetailProvider = "jobnet" | "jobbank" | "jobindex" | "jobdanmark";

const detailPaths: Record<DetailProvider, RegExp> = {
  jobnet: /^\/find-job\/[^/]+\/?$/,
  jobbank: /^\/job\/\d+(?:\/[^/]+)+\/?$/,
  jobindex: /^\/vis-job\/[^/]+\/?$/,
  jobdanmark: /^\/job\/[^/]+\/?$/,
};

const detailHosts: Record<DetailProvider, string> = {
  jobnet: "jobnet.dk",
  jobbank: "jobbank.dk",
  jobindex: "www.jobindex.dk",
  jobdanmark: "jobdanmark.dk",
};

export function isProviderDetailUrl(provider: DetailProvider, value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:"
      && url.host === detailHosts[provider]
      && !url.username
      && !url.password
      && detailPaths[provider].test(url.pathname);
  } catch {
    return false;
  }
}

export function assertProviderDetailUrl(provider: DetailProvider, value: string): void {
  if (!isProviderDetailUrl(provider, value)) {
    throw new Error(`canonicalUrl must be an exact https ${provider} job URL`);
  }
}
