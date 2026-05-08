export function newUserJokeLocalId(): string {
  return crypto.randomUUID();
}

export function userJokeId(localId: string): string {
  return `u_${localId}`;
}

export function sourcedJokeId(sourceId: number): string {
  return `s_${sourceId}`;
}
