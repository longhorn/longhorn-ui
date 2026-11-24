// A shared block volume is only used as a block device, so it needs no file system type.
export function canCreatePV(volume, params) {
  return Boolean(volume?.kubernetesStatus && !volume.kubernetesStatus.pvName && params?.pvName && (params.fsType || volume.sharedBlock))
}
