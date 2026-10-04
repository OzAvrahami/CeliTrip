/** @param {{status: string, release?: {channel?: string}}} metadata */
function releaseLabel(metadata) {
  if (metadata.status === 'unreleased') return 'Unreleased';
  if (metadata.status !== 'released') throw new Error('Invalid product release status');
  return metadata.release?.channel === 'prerelease' ? 'Published prerelease' : 'Released';
}

module.exports = { releaseLabel };
