/* eslint-disable node/no-unpublished-import */
import { Octokit } from '@octokit/rest';
import semver from 'semver';

function createGitHubClient(): Octokit {
  const { GH_TOKEN, GHE_API_URL } = process.env;

  if (!GH_TOKEN) {
    throw new Error('A GH_TOKEN environment variable is required');
  }

  const options: {
    auth: string;
    baseUrl?: string;
  } = {
    auth: `token ${GH_TOKEN}`,
  };

  if (GHE_API_URL) {
    options.baseUrl = GHE_API_URL;
  }

  return new Octokit(options);
}

async function createRelease() {
  if (!process.argv[2] || process.argv[2].startsWith('undefined')) {
    return;
  }

  const entitiesForPushTags: Array<{ name: string; newVersion: string }> =
    JSON.parse(process.argv[2]);

  if (!entitiesForPushTags || !Array.isArray(entitiesForPushTags)) {
    throw new Error('Wrong Lerna output');
  }

  const tagVersionSeparator = '@';
  const tags: ReadonlyArray<string> = entitiesForPushTags.map(
    (entity) => `${entity.name}${tagVersionSeparator}${entity.newVersion}`,
  );
  const releaseNotes: ReadonlyArray<{ name: string; notes: string }> =
    entitiesForPushTags.map((entity) => {
      return {
        name: entity.name,
        notes: 'Automatic release',
      };
    });

  const client = createGitHubClient();

  return Promise.all(
    releaseNotes.map(({ notes, name }) => {
      const tag = tags.find((t) =>
        t.startsWith(`${name}${tagVersionSeparator}`),
      );

      /* istanbul ignore if */
      if (!tag) {
        return Promise.resolve();
      }

      const prereleaseParts =
        semver.prerelease(tag.replace(`${name}${tagVersionSeparator}`, '')) ||
        [];

      return client.repos.createRelease({
        owner: 'Kallenju',
        repo: 'notes',
        tag_name: tag,
        name: tag,
        body: notes,
        draft: false,
        prerelease: prereleaseParts.length > 0,
      });
    }),
  );
}

try {
  process.stdout.write('Create releases');

  await createRelease();
} catch (error) {
  process.stdout.write(`Failed to create releases: ${String(error)}`);
}
