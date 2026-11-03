// Only the explicitly unreleased initial series may retain its target version.
export function isInitialDraft(version,status) {
  if(!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version))throw new Error('Invalid release version');
  if(!['unreleased','released'].includes(status))throw new Error('Invalid RELEASE_STATUS');
  return version.startsWith('0.')&&status==='unreleased';
}
