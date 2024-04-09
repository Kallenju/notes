const microserviceNames = ['frontendServer'] as const;

type TMicroserviceNames = (typeof microserviceNames)[number];

function isMicroserviceName(value: unknown): value is TMicroserviceNames {
  if (typeof value !== 'string') {
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return microserviceNames.includes(value as any);
}

export { microserviceNames, isMicroserviceName };

export type { TMicroserviceNames };
