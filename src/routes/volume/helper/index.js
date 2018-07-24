export function isSchedulingFailure(volume) {
  // volume.conditions.scheduled.status may be equal to 'Unknown' or 'True' or 'False', only 'False' value is scheduling failure
  // volume.conditions may be empty object({})
  return volume.conditions && volume.conditions.scheduled && volume.conditions.scheduled.status.toLowerCase() === 'false'
}
