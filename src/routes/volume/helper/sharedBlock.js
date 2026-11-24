import { useRef } from 'react'

// The target of a shared block volume accepts up to 16 nodes.
export const SHARED_BLOCK_MAX_NODES = 16

const UI_ATTACHMENT_ID = 'longhorn-ui'

const STRICT_LOCAL = 'strict-local'

const ATTACHERS = { 'csi-attacher': 'a workload', 'longhorn-api': 'another API client' }

const uniqueSorted = (hosts) => [...new Set(hosts.filter(Boolean))].sort()

const getAttachments = (volume) => Object.values(volume?.volumeAttachment?.attachments || {})

// The backend ignores the attachments that ask for another frontend setting than the volume has.
const getActiveAttachments = (volume) => getAttachments(volume)
  .filter(({ parameters }) => (parameters?.disableFrontend === 'true') === (volume.disableFrontend === true))

const isUIAttachment = ({ attachmentID }) => attachmentID === UI_ATTACHMENT_ID || attachmentID?.startsWith(`${UI_ATTACHMENT_ID}-`) === true

// Attachment changes reach the UI sooner on their own stream than with the volume.
export function withLiveAttachments(volume, volumeAttachment) {
  return volume?.sharedBlock && volumeAttachment?.attachments ? { ...volume, volumeAttachment } : volume
}

// Each node of a shared block volume has its own attachment.
export function getUIAttachmentID(volume, host) {
  return volume?.sharedBlock ? `${UI_ATTACHMENT_ID}-${host}` : UI_ATTACHMENT_ID
}

// The attachments made from the UI, as opposed to the ones made for workloads.
export function getUIAttachments(volume) {
  return getAttachments(volume).filter(isUIAttachment).sort((a, b) => a.nodeID.localeCompare(b.nodeID))
}

// The nodes the UI or a workload asked to attach. The attachments of backups,
// snapshots and so on only bring the volume to the node of the engine.
export function getRequestedHosts(volume) {
  return uniqueSorted(getActiveAttachments(volume)
    .filter(({ attachmentType }) => attachmentType === 'longhorn-api' || attachmentType === 'csi-attacher')
    .map(({ nodeID }) => nodeID))
}

// The API lists the frontend on the engine node first.
export function getEngineHost(volume) {
  return volume?.controllers?.[0]?.hostId || ''
}

// One entry per node the volume is on, or is moving to or from, the engine node
// first. The volume stays "attached" while nodes come and go, so this is the
// only place where that shows. The engine node is released when nothing asks for
// the volume there any more. The volume stays on it until the others are detached.
export function getSharedBlockNodes(volume) {
  const controllers = (volume?.controllers || []).filter(({ hostId }) => hostId)
  const engineHost = getEngineHost(volume)
  const requestedHosts = getRequestedHosts(volume)
  const hosts = uniqueSorted([...controllers.map(({ hostId }) => hostId), ...requestedHosts])

  return hosts
    .sort((a, b) => Number(b === engineHost) - Number(a === engineHost))
    .map((host) => {
      const endpoint = controllers.find(({ hostId }) => hostId === host)?.endpoint || ''
      const isEngine = host === engineHost
      let status = endpoint ? 'attached' : 'attaching'
      if (!isEngine && !requestedHosts.includes(host)) {
        status = 'detaching'
      } else if (isEngine && endpoint && !getActiveAttachments(volume).some(({ nodeID }) => nodeID === host)) {
        status = 'released'
      }
      return { host, endpoint, isEngine, status }
    })
}

const getHosts = (volume) => getSharedBlockNodes(volume).map(({ host }) => host)

// What is still going on while the volume is already attached, if anything.
export function getSharedBlockProgress(volume) {
  if (!volume?.sharedBlock || volume.state !== 'attached' || volume.disableFrontend) {
    return ''
  }
  const nodes = getSharedBlockNodes(volume)
  const list = (status) => nodes.filter((node) => node.status === status).map(({ host }) => host).join(', ')
  return [['Attaching to', list('attaching')], ['Detaching from', list('detaching')]]
    .filter(([, hosts]) => hosts)
    .map(([text, hosts]) => `${text} ${hosts}`)
    .join('. ')
}

const isLive = (volume) => volume?.sharedBlock === true && volume.state === 'attached' && !volume.disableFrontend

// A shared block volume takes more nodes while it is attached, but not in
// maintenance mode, where only one node can have it.
export function canAttachMoreNodes(volume) {
  return isLive(volume) && getHosts(volume).length < SHARED_BLOCK_MAX_NODES
}

export function getAttachDisabledReason(volume) {
  if (volume?.sharedBlock !== true || volume.state !== 'attached' || canAttachMoreNodes(volume)) {
    return ''
  }
  return isLive(volume)
    ? `A shared block volume can be attached to up to ${SHARED_BLOCK_MAX_NODES} nodes`
    : 'A shared block volume in maintenance mode can only be attached to one node'
}

export function isAttachedTo(volume, host) {
  return volume?.sharedBlock === true && getRequestedHosts(volume).includes(host)
}

export function isRegularRwx(volume) {
  return volume.accessMode === 'rwx' && !volume.migratable && !volume.sharedBlock
}

// Regular RWX volumes can only be attached in maintenance mode, and a shared block
// volume that is attached already can only be attached without.
export function isMaintenanceConflict(volumes) {
  return volumes.some(isRegularRwx) && volumes.some(canAttachMoreNodes)
}

// Volumes that are on the host already are skipped, so attaching several volumes
// doesn't add a second attachment next to the one of a workload.
export function getAttachRequests(volumes, host, disableFrontend) {
  return volumes
    .filter((volume) => !isAttachedTo(volume, host))
    .map((volume) => ({
      url: volume.actions?.attach,
      params: {
        hostId: host,
        disableFrontend: canAttachMoreNodes(volume) ? false : disableFrontend,
        AttachedBy: '',
        attacherType: '',
        AttachmentID: getUIAttachmentID(volume, host),
      },
    }))
}

// Without hosts, a shared block volume is detached from all nodes it was attached
// to in the UI. Force detach always detaches a volume from all nodes.
export function getDetachRequests(volume, forceDetach, hosts) {
  const url = volume.actions?.detach
  if (!volume.sharedBlock || forceDetach) {
    return [{ url, data: { forceDetach, attachmentID: UI_ATTACHMENT_ID, hostId: '' } }]
  }
  return getUIAttachments(volume)
    .filter(({ nodeID }) => !hosts || hosts.includes(nodeID))
    .map(({ attachmentID, nodeID }) => ({ url, data: { forceDetach, attachmentID, hostId: nodeID } }))
}

// The nodes that still have the volume after detaching it from the given hosts.
export function getHostsAfterDetach(volume, hosts) {
  const left = getActiveAttachments(volume).filter((item) => !(isUIAttachment(item) && hosts.includes(item.nodeID)))
  if (left.length === 0) {
    return []
  }
  const requested = getRequestedHosts(volume).filter((host) => left.some(({ nodeID }) => nodeID === host))
  return uniqueSorted([getEngineHost(volume), ...requested])
}

// What a detach does that its hosts don't say, for the shared block volumes among
// the given ones. The hosts are the ones chosen for a single volume.
export function getDetachNotices(volumes, forceDetach, chosenHosts = []) {
  const sharedBlockVolumes = volumes.filter(({ sharedBlock }) => sharedBlock)
  const single = volumes.length === 1

  return sharedBlockVolumes.flatMap((volume) => {
    const { name } = volume
    if (forceDetach) {
      return [{ type: 'warning', text: `Force Detach detaches ${name} from all nodes: ${getHosts(volume).join(', ')}.` }]
    }

    const uiHosts = uniqueSorted(getUIAttachments(volume).map(({ nodeID }) => nodeID))
    if (uiHosts.length === 0) {
      const attachers = [...new Set(getAttachments(volume).map(({ attachmentType }) => ATTACHERS[attachmentType] || attachmentType))]
      return [{ type: 'warning', text: `${name} was not attached from the UI${attachers.length > 0 ? `, but by ${attachers.join(' and ')}` : ''}. It can only be detached there, or with Force Detach.` }]
    }

    const hosts = single ? chosenHosts : uiHosts
    const after = getHostsAfterDetach(volume, hosts)
    if (!single) {
      return [{ type: 'info', text: `${name} is detached from ${hosts.join(', ')}${after.length > 0 ? ` and stays available on ${after.join(', ')}` : ''}.` }]
    }
    if (hosts.length === 0) {
      return []
    }

    const engineHost = getEngineHost(volume)
    const keptByOthers = hosts.filter((host) => after.includes(host) && host !== engineHost)
    return [
      after.length > 0 && hosts.includes(engineHost) && { type: 'info', text: `The engine runs on ${engineHost}. The volume stays available there until it is detached from all nodes.` },
      keptByOthers.length > 0 && { type: 'info', text: `The volume stays available on ${keptByOthers.join(', ')}, which was also attached outside the UI.` },
      after.length === 0 && engineHost && !hosts.includes(engineHost) && { type: 'warning', text: `No other node keeps the volume attached, so this also detaches it from ${engineHost}, where the engine runs.` },
    ].filter(Boolean)
  })
}

// A detach that has nothing to detach: without force, only what the UI attached
// can be detached.
export function hasNothingToDetach(volumes, forceDetach) {
  return !forceDetach && volumes.length > 0
    && volumes.every((volume) => volume.sharedBlock && getUIAttachments(volume).length === 0)
}

// A shared block volume is only used as a block device, so it needs no file system type.
export function canCreatePV(volume, params) {
  return Boolean(volume?.kubernetesStatus && !volume.kubernetesStatus.pvName && params?.pvName && (params.fsType || volume.sharedBlock))
}

export function isUnreservedSharedAccess(volume) {
  return volume?.conditions?.UnreservedSharedAccess?.status?.toLowerCase() === 'true'
}

export function isDataLocalityDisabled(sharedBlock, dataLocality) {
  return sharedBlock === true && dataLocality === STRICT_LOCAL
}

// The values a shared block volume needs, for the given fields of a form.
export function getSharedBlockFields(names, current = {}) {
  const fields = { accessMode: 'rwx', frontend: 'blockdev' }
  if (current.dataLocality === STRICT_LOCAL) {
    fields.dataLocality = 'disabled'
  }
  return names.filter((name) => fields[name] !== undefined).reduce((acc, name) => ({ ...acc, [name]: fields[name] }), {})
}

// Sets the fields a shared block volume needs, and puts the previous values back
// when the user changes their mind, unless they changed the field meanwhile.
// Returns the fields it set. The key tells the tabs of a form apart.
export function useSharedBlockFields({ getFieldsValue, setFieldsValue }, names, key = '') {
  const replaced = useRef({})

  return (checked) => {
    const current = getFieldsValue(names)
    let fields = {}
    if (checked) {
      fields = getSharedBlockFields(names, current)
      replaced.current[key] = Object.keys(fields).map((name) => ({ name, from: current[name], to: fields[name] }))
    } else {
      fields = (replaced.current[key] || [])
        .filter(({ name, to }) => current[name] === to)
        .reduce((acc, { name, from }) => ({ ...acc, [name]: from }), {})
      delete replaced.current[key]
    }
    setFieldsValue(fields)
    return fields
  }
}
