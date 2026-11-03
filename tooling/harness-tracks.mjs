export const tracks = Object.freeze(['minimal', 'standard', 'reinforced']);
export const riskFlags = Object.freeze(['security', 'data_integrity', 'financial', 'migration', 'public_contract', 'production', 'irreversible', 'shared_surface', 'uncertainty']);

export function trackOf(state) {
  const track = state?.track === undefined ? 'reinforced' : state.track;
  if (!tracks.includes(track)) throw new Error(`Invalid track: ${track}`);
  return track;
}

export function maxTrack(...values) {
  if (!values.length || values.some(value => !tracks.includes(value))) throw new Error('Invalid track floor');
  return tracks[Math.max(...values.map(value => tracks.indexOf(value)))];
}

export function validateAssessment(assessment) {
  if (!assessment || typeof assessment !== 'object' || Array.isArray(assessment) || Object.keys(assessment).some(key => !['reason', 'risks'].includes(key)) || typeof assessment.reason !== 'string' || !assessment.reason.trim() || !Array.isArray(assessment.risks) || assessment.risks.some(risk => !riskFlags.includes(risk)) || new Set(assessment.risks).size !== assessment.risks.length) throw new Error('Track selection requires assessment reason and explicit risk flags');
  return assessment;
}

export function resolveTrack(requested, assessment, project = {}) {
  const selected = trackOf({ track: requested });
  if (assessment !== undefined) validateAssessment(assessment);
  else if (requested !== undefined) throw new Error('Explicit track selection requires assessment');
  const risks = assessment?.risks || [];
  const riskFloor = risks.some(risk => riskFlags.slice(0, 7).includes(risk)) ? 'reinforced' : risks.length ? 'standard' : 'minimal';
  const projectFloor = project.minimum_track === undefined ? 'minimal' : trackOf({ track: project.minimum_track });
  const roles = project.required_roles || [];
  const roleFloor = roles.some(role => ['security', 'logging', 'ui', 'ux'].includes(role)) ? 'reinforced' : roles.some(role => ['definition', 'functional'].includes(role)) ? 'standard' : 'minimal';
  return maxTrack(selected, riskFloor, projectFloor, roleFloor);
}
