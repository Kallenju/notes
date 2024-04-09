const loginTypes = ['internal', 'google', 'facebook'] as const;

type TLoginTypes = (typeof loginTypes)[number];

function isLoginType(value: unknown): value is TLoginTypes {
  if (typeof value !== 'string') {
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return loginTypes.includes(value as any);
}

export { loginTypes, isLoginType };
export type { TLoginTypes };
