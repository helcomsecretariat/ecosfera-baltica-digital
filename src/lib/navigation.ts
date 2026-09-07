export const SEED_PARAM = "seed";

/**
 * Returns `href` without the seed query parameter. Other parameters (e.g. `debug`) and the hash are kept.
 * `href` must be an absolute URL, such as `window.location.href`.
 */
export function stripSeedFromUrl(href: string): string {
  const url = new URL(href);
  url.searchParams.delete(SEED_PARAM);
  return url.toString();
}

type LocationLike = Pick<Location, "href" | "replace" | "reload">;

/**
 * Full navigation back to the lobby so it generates a fresh random seed.
 *
 * When the URL carries a seed, `replace` overwrites the history entry pushed on "Play" instead of adding
 * another one, so Back does not land on that entry. A seed in the entry the user originally arrived on
 * (a shared link) stays reachable via Back, by design. Without a seed a plain `reload` is used, because
 * navigating to the identical URL would not reload if a hash fragment were present.
 */
export function returnToLobby(location: LocationLike = window.location): void {
  if (!new URL(location.href).searchParams.has(SEED_PARAM)) {
    location.reload();
    return;
  }
  location.replace(stripSeedFromUrl(location.href));
}
