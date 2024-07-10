if (process.argv[2] && !process.argv[2].includes('undefined')) {
  const entitiesForPushTags: Array<{ name: string; newVersion: string }> =
    JSON.parse(process.argv[2]);

  if (!entitiesForPushTags || !Array.isArray(entitiesForPushTags)) {
    throw new Error('Wrong Lerna output');
  }

  const sleep = 'sleep 10';

  const pushTagsCommands = entitiesForPushTags.map((entity, index) => {
    const { name, newVersion } = entity;
    const tag = `${name}@${newVersion}`;
    const command = `git push origin ${tag}`;

    return index === entitiesForPushTags.length - 1
      ? command
      : `${command}; ${sleep}`;
  });

  process.stdout.write(
    [
      'git push origin main --no-follow-tags; sleep 10',
      ...pushTagsCommands,
    ].join('; '),
  );
} else {
  process.stdout.write('echo "Packages were not changed"');
}
