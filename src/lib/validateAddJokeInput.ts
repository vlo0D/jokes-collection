export const MAX_TEXT_LEN = 280;
export const MAX_TYPE_LEN = 30;

export interface AddJokeInput {
  setup: string;
  punchline: string;
  type?: string;
}

export interface CleanedAddJokeInput {
  setup: string;
  punchline: string;
  type: string | null;
}

export interface AddJokeValidationErrors {
  setup?: string;
  punchline?: string;
  type?: string;
}

export type AddJokeValidationResult =
  | { ok: true; cleaned: CleanedAddJokeInput }
  | { ok: false; errors: AddJokeValidationErrors };

export function validateAddJokeInput(input: AddJokeInput): AddJokeValidationResult {
  const setup = input.setup.trim();
  const punchline = input.punchline.trim();
  const type = (input.type ?? '').trim();
  const errors: AddJokeValidationErrors = {};

  if (setup.length === 0) {
    errors.setup = 'Setup is required.';
  } else if (setup.length > MAX_TEXT_LEN) {
    errors.setup = `Setup is too long (max ${MAX_TEXT_LEN}).`;
  }

  if (punchline.length === 0) {
    errors.punchline = 'Punchline is required.';
  } else if (punchline.length > MAX_TEXT_LEN) {
    errors.punchline = `Punchline is too long (max ${MAX_TEXT_LEN}).`;
  }

  if (type.length > MAX_TYPE_LEN) {
    errors.type = `Type is too long (max ${MAX_TYPE_LEN}).`;
  }

  if (
    errors.setup !== undefined ||
    errors.punchline !== undefined ||
    errors.type !== undefined
  ) {
    return { ok: false, errors };
  }
  return {
    ok: true,
    cleaned: { setup, punchline, type: type.length === 0 ? null : type },
  };
}
