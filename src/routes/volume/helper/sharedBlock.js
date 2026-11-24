import { useRef } from 'react'

// The target of a shared block volume accepts up to 16 nodes.
export const SHARED_BLOCK_MAX_NODES = 16

const UI_ATTACHMENT_ID = 'longhorn-ui'

const STRICT_LOCAL = 'strict-local'

const getAttachments = (volume) => Object.values(volume?.volumeAttachment?.attachments || {})

const uniqueSorted = (hosts) => [...new Set(hosts.filter(Boolean))].sort()

// Each node of a shared block volume has its own attachment.
export function getUIAttachmentID(volume, host) {
  return volume?.sharedBlock ? `${UI_ATTACHMENT_ID}-${host}` : UI_ATTACHMENT_ID
}

// The attachments made from the UI, as opposed to the ones made for workloads.
export function getUIAttachments(volume) {
  return getAttachments(volume)
    .filter(({ attachmentID }) => attachmentID === UI_ATTACHMENT_ID || attachmentID?.startsWith(`${UI_ATTACHMENT_ID}-`))
    .sort((a, b) => a.nodeID.localeCompare(b.nodeID))
}

// The nodes the UI or a workload asked to attach. Backups, snapshots and so on
// have attachments too, but they don't make the device available on a node.
export function getRequestedHosts(volume) {
  return uniqueSorted(getAttachments(volume)
    .filter(({ attachmentType }) => attachmentType === 'longhorn-api' || attachmentType === 'csi-attacher')
    .map(({ nodeID }) => nodeID))
}

// The API lists the frontend on the engine node first.
export function getEngineHost(volume) {
  return volume?.controllers?.[0]?.hostId || ''
}

// One entry per node the volume is on, or is moving to or from, the engine node
// first. The volume stays "attached" while nodes come and go, so this is the
// only place where that shows.
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
      let status = 'attached'
      if (!endpoint) {
        status = 'attaching'
      } else if (!isEngine && !requestedHosts.includes(host)) {
        status = 'detaching'
      }
      return { host, endpoint, isEngine, status }
    })
}

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

// A shared block volume takes more nodes while it is attached, but not in
// maintenance mode, where only one node can have it.
export function canAttachMoreNodes(volume) {
  return volume?.sharedBlock === true && volume.state === 'attached' && !volume.disableFrontend
    && getSharedBlockNodes(volume).length < SHARED_BLOCK_MAX_NODES
}

export function reachedMaxNodes(volume) {
  return volume?.sharedBlock === true && volume.state === 'attached' && !volume.disableFrontend
    && getSharedBlockNodes(volume).length >= SHARED_BLOCK_MAX_NODES
}

export function isAttachedTo(volume, host) {
  return volume?.sharedBlock === true && getRequestedHosts(volume).includes(host)
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
        // Every node of an attached volume has the same frontend setting.
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
// when the user changes their mind. Returns the fields it set. The key tells the
// tabs of a form apart.
export function useSharedBlockFields({ getFieldsValue, setFieldsValue }, names, key = '') {
  const replaced = useRef({})

  return (checked) => {
    let fields = replaced.current[key] || {}
    if (checked) {
      const current = getFieldsValue(names)
      fields = getSharedBlockFields(names, current)
      replaced.current[key] = Object.keys(fields).reduce((acc, name) => ({ ...acc, [name]: current[name] }), {})
    } else {
      delete replaced.current[key]
    }
    setFieldsValue(fields)
    return fields
  }
}
