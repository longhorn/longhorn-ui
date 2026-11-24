import {
  SHARED_BLOCK_MAX_NODES,
  canAttachMoreNodes,
  getAttachRequests,
  getDetachRequests,
  getRequestedHosts,
  getSharedBlockFields,
  getSharedBlockNodes,
  getSharedBlockProgress,
  getUIAttachmentID,
  isDataLocalityDisabled,
  isUnreservedSharedAccess,
  reachedMaxNodes,
} from '../sharedBlock'
import { attachable, detachable } from '../index'

const ticket = (nodeID, attachmentID = `longhorn-ui-${nodeID}`, attachmentType = 'longhorn-api') => ({ nodeID, attachmentID, attachmentType })
const controller = (hostId, endpoint = '/dev/longhorn/vol') => ({ hostId, endpoint })

const sharedBlockVolume = ({ tickets = [], controllers = [], ...rest } = {}) => ({
  name: 'vol',
  sharedBlock: true,
  accessMode: 'rwx',
  state: 'attached',
  disableFrontend: false,
  actions: { attach: '/attach', detach: '/detach' },
  controllers,
  volumeAttachment: { attachments: tickets.reduce((acc, item) => ({ ...acc, [item.attachmentID]: item }), {}) },
  ...rest,
})

const regularVolume = (rest = {}) => ({ name: 'rwo', accessMode: 'rwo', state: 'detached', disableFrontend: false, actions: { attach: '/rwo-attach', detach: '/rwo-detach' }, ...rest })

const twoNodes = () => sharedBlockVolume({
  tickets: [ticket('node-1'), ticket('node-2')],
  controllers: [controller('node-2'), controller('node-1')],
})

describe('shared block volume nodes', () => {
  it('lists the engine node first and reports the state of each node', () => {
    const volume = sharedBlockVolume({
      tickets: [ticket('node-1'), ticket('node-3'), ticket('node-5', 'csi-1', 'csi-attacher'), ticket('node-6', 'backup-1', 'backup-controller')],
      controllers: [controller('node-4'), controller('node-1'), controller('node-2'), controller('node-3', '')],
    })

    expect(getSharedBlockNodes(volume)).toStrictEqual([
      { host: 'node-4', endpoint: '/dev/longhorn/vol', isEngine: true, status: 'attached' },
      { host: 'node-1', endpoint: '/dev/longhorn/vol', isEngine: false, status: 'attached' },
      { host: 'node-2', endpoint: '/dev/longhorn/vol', isEngine: false, status: 'detaching' },
      { host: 'node-3', endpoint: '', isEngine: false, status: 'attaching' },
      { host: 'node-5', endpoint: '', isEngine: false, status: 'attaching' },
    ])
    expect(getSharedBlockProgress(volume)).toBe('Attaching to node-3, node-5. Detaching from node-2')
  })

  it('reports no progress for settled, maintenance, detached and regular volumes', () => {
    const pending = { tickets: [ticket('node-1'), ticket('node-2')], controllers: [controller('node-1')] }

    expect(getSharedBlockProgress(twoNodes())).toBe('')
    expect(getSharedBlockProgress(sharedBlockVolume(pending))).toBe('Attaching to node-2')
    expect(getSharedBlockProgress(sharedBlockVolume({ ...pending, disableFrontend: true }))).toBe('')
    expect(getSharedBlockProgress(sharedBlockVolume({ ...pending, state: 'attaching' }))).toBe('')
    expect(getSharedBlockProgress(regularVolume({ state: 'attached' }))).toBe('')
  })

  it('only counts the attachments of the UI and of workloads', () => {
    expect(getRequestedHosts(sharedBlockVolume({
      tickets: [ticket('node-2', 'csi-1', 'csi-attacher'), ticket('node-2'), ticket('node-1'), ticket('node-3', 'snapshot', 'snapshot-controller')],
    }))).toStrictEqual(['node-1', 'node-2'])
    expect(getRequestedHosts({})).toStrictEqual([])
  })
})

describe('attaching', () => {
  it('lets an attached shared block volume take more nodes, except in maintenance mode or at the limit', () => {
    const full = sharedBlockVolume({ controllers: Array.from({ length: SHARED_BLOCK_MAX_NODES }, (_, i) => controller(`node-${i}`)) })

    expect(attachable(twoNodes())).toBe(true)
    expect(attachable(sharedBlockVolume({ state: 'detached' }))).toBe(true)
    expect(attachable(sharedBlockVolume({ state: 'attaching' }))).toBe(false)
    expect(attachable({ ...twoNodes(), disableFrontend: true })).toBe(false)
    expect(attachable({ ...twoNodes(), restoreStatus: [{ isRestoring: true }] })).toBe(false)
    expect(attachable(full)).toBe(false)
    expect(reachedMaxNodes(full)).toBe(true)
    expect(reachedMaxNodes(twoNodes())).toBe(false)
    expect(canAttachMoreNodes(regularVolume({ state: 'attached' }))).toBe(false)
    expect(attachable(regularVolume({ state: 'attached' }))).toBe(false)
  })

  it('uses one attachment per node for shared block volumes only', () => {
    expect(getUIAttachmentID(twoNodes(), 'node-3')).toBe('longhorn-ui-node-3')
    expect(getUIAttachmentID(regularVolume(), 'node-3')).toBe('longhorn-ui')
  })

  it('skips volumes that are on the host already and keeps the frontend of attached ones', () => {
    const onHost = sharedBlockVolume({ tickets: [ticket('node-3', 'csi-1', 'csi-attacher')] })
    const requests = getAttachRequests([twoNodes(), onHost, regularVolume()], 'node-3', true)

    expect(requests.map(({ url, params }) => [url, params.hostId, params.disableFrontend, params.AttachmentID])).toStrictEqual([
      ['/attach', 'node-3', false, 'longhorn-ui-node-3'],
      ['/rwo-attach', 'node-3', true, 'longhorn-ui'],
    ])
    expect(getAttachRequests([sharedBlockVolume({ state: 'detached' })], 'node-1', true)[0].params.disableFrontend).toBe(true)
  })
})

describe('detaching', () => {
  const volume = () => sharedBlockVolume({ tickets: [ticket('node-2'), ticket('node-1'), ticket('node-3', 'csi-1', 'csi-attacher'), ticket('node-4', 'longhorn-ui')] })

  it('detaches the chosen hosts, each with its own attachment', () => {
    expect(getDetachRequests(volume(), false, ['node-2', 'node-4'])).toStrictEqual([
      { url: '/detach', data: { forceDetach: false, attachmentID: 'longhorn-ui-node-2', hostId: 'node-2' } },
      { url: '/detach', data: { forceDetach: false, attachmentID: 'longhorn-ui', hostId: 'node-4' } },
    ])
  })

  it('leaves the attachments of workloads alone without force', () => {
    expect(getDetachRequests(volume(), false).map(({ data }) => data.hostId)).toStrictEqual(['node-1', 'node-2', 'node-4'])
  })

  it('sends one request for a force detach and for regular volumes', () => {
    expect(getDetachRequests(volume(), true, ['node-1'])).toStrictEqual([{ url: '/detach', data: { forceDetach: true, attachmentID: 'longhorn-ui', hostId: '' } }])
    expect(getDetachRequests(regularVolume(), false)).toStrictEqual([{ url: '/rwo-detach', data: { forceDetach: false, attachmentID: 'longhorn-ui', hostId: '' } }])
  })

  it('is possible whenever the volume is attached, unlike other RWX volumes', () => {
    expect(detachable(twoNodes())).toBe(true)
    expect(detachable({ ...twoNodes(), migratable: true })).toBe(true)
    expect(detachable(sharedBlockVolume({ state: 'detached' }))).toBe(false)
    expect(detachable({ ...twoNodes(), standby: true })).toBe(false)
    expect(detachable(regularVolume({ accessMode: 'rwx', state: 'attached' }))).toBe(false)
  })
})

describe('form fields and conditions', () => {
  it('returns the values the form needs for its own fields', () => {
    expect(getSharedBlockFields(['accessMode', 'frontend', 'dataLocality'], { dataLocality: 'strict-local' })).toStrictEqual({ accessMode: 'rwx', frontend: 'blockdev', dataLocality: 'disabled' })
    expect(getSharedBlockFields(['accessMode', 'frontend', 'dataLocality'], { dataLocality: 'best-effort' })).toStrictEqual({ accessMode: 'rwx', frontend: 'blockdev' })
    expect(getSharedBlockFields(['accessMode'])).toStrictEqual({ accessMode: 'rwx' })
  })

  it('rules out strict-local for shared block volumes only', () => {
    expect(isDataLocalityDisabled(true, 'strict-local')).toBe(true)
    expect(isDataLocalityDisabled(true, 'best-effort')).toBe(false)
    expect(isDataLocalityDisabled(false, 'strict-local')).toBe(false)
  })

  it('warns only when the condition is true', () => {
    expect(isUnreservedSharedAccess({ conditions: { UnreservedSharedAccess: { status: 'True' } } })).toBe(true)
    expect(isUnreservedSharedAccess({ conditions: { UnreservedSharedAccess: { status: 'False' } } })).toBe(false)
    expect(isUnreservedSharedAccess({ conditions: {} })).toBe(false)
    expect(isUnreservedSharedAccess({})).toBe(false)
  })
})
