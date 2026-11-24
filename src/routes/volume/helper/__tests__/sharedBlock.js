import React from 'react'
import ReactDOM from 'react-dom'
import { act } from 'react-dom/test-utils'
import {
  SHARED_BLOCK_MAX_NODES,
  canAttachMoreNodes,
  getAttachDisabledReason,
  getAttachRequests,
  getDetachNotices,
  getDetachRequests,
  getEngineHost,
  getHostsAfterDetach,
  getRequestedHosts,
  getSharedBlockFields,
  getSharedBlockNodes,
  getSharedBlockProgress,
  getUIAttachmentID,
  getUIAttachments,
  hasNothingToDetach,
  isAttachedTo,
  isDataLocalityDisabled,
  isMaintenanceConflict,
  isUnreservedSharedAccess,
  useSharedBlockFields,
  withLiveAttachments,
} from '../sharedBlock'
import { attachable, detachable } from '../index'

const ENDPOINT = '/dev/longhorn/vol'

const ui = (nodeID, rest = {}) => ({ nodeID, attachmentID: `longhorn-ui-${nodeID}`, attachmentType: 'longhorn-api', parameters: { disableFrontend: 'false' }, ...rest })
const csi = (nodeID) => ui(nodeID, { attachmentID: `csi-${nodeID}`, attachmentType: 'csi-attacher' })
const other = (nodeID, attachmentType) => ui(nodeID, { attachmentID: `${attachmentType}-${nodeID}`, attachmentType, parameters: { disableFrontend: 'any' } })
const controller = (hostId, endpoint = ENDPOINT) => ({ hostId, endpoint })

const sharedBlockVolume = ({ tickets = [], on = [], ...rest } = {}) => ({
  name: 'vol',
  sharedBlock: true,
  accessMode: 'rwx',
  state: 'attached',
  disableFrontend: false,
  actions: { attach: '/attach', detach: '/detach' },
  controllers: on.map((item) => (typeof item === 'string' ? controller(item) : item)),
  volumeAttachment: { attachments: tickets.reduce((acc, item) => ({ ...acc, [item.attachmentID]: item }), {}) },
  ...rest,
})
const volumeOn = (...hosts) => sharedBlockVolume({ tickets: hosts.map((host) => ui(host)), on: hosts })
const maintenance = () => sharedBlockVolume({ disableFrontend: true, tickets: [ui('n1', { parameters: { disableFrontend: 'true' } })], on: [controller('n1', '')] })
const regularVolume = (rest = {}) => ({ name: 'rwo', accessMode: 'rwo', state: 'detached', disableFrontend: false, actions: { attach: '/rwo-attach', detach: '/rwo-detach' }, ...rest })
const statusOf = (volume) => getSharedBlockNodes(volume).map(({ host, status }) => [host, status])
const textsOf = (...args) => getDetachNotices(...args).map(({ type, text }) => [type, text])

describe('the nodes of a shared block volume', () => {
  it('lists the engine node first, then the others by name', () => {
    expect(getSharedBlockNodes(sharedBlockVolume({ tickets: [ui('n1'), ui('n2'), ui('n4')], on: ['n4', 'n2', 'n1'] }))).toStrictEqual([
      { host: 'n4', endpoint: ENDPOINT, isEngine: true, status: 'attached' },
      { host: 'n1', endpoint: ENDPOINT, isEngine: false, status: 'attached' },
      { host: 'n2', endpoint: ENDPOINT, isEngine: false, status: 'attached' },
    ])
  })

  it('tells attaching, detaching and released nodes apart', () => {
    expect(statusOf(sharedBlockVolume({ tickets: [ui('n1'), csi('n5'), ui('n3')], on: ['n1', controller('n3', '')] }))).toStrictEqual([['n1', 'attached'], ['n3', 'attaching'], ['n5', 'attaching']])
    expect(statusOf(sharedBlockVolume({ tickets: [ui('n1')], on: ['n1', 'n2'] }))).toStrictEqual([['n1', 'attached'], ['n2', 'detaching']])
    expect(statusOf(sharedBlockVolume({ tickets: [ui('n1')], on: ['n1', controller('n4', '')] }))).toStrictEqual([['n1', 'attached'], ['n4', 'detaching']])
    expect(statusOf(sharedBlockVolume({ tickets: [ui('n2')], on: ['n1', 'n2'] }))).toStrictEqual([['n1', 'released'], ['n2', 'attached']])
    expect(statusOf(sharedBlockVolume({ tickets: [ui('n2')], on: [controller('n1', ''), 'n2'] }))).toStrictEqual([['n1', 'attaching'], ['n2', 'attached']])
    expect(statusOf(sharedBlockVolume({ tickets: [other('n1', 'backup-controller')], on: ['n1'] }))).toStrictEqual([['n1', 'attached']])
    expect(statusOf(sharedBlockVolume({ on: ['n1', 'n2'] }))).toStrictEqual([['n1', 'detaching'], ['n2', 'detaching']])
    expect(statusOf(sharedBlockVolume({ on: [controller('', '')] }))).toStrictEqual([])
  })

  it('takes the first controller as the engine node, with or without an endpoint', () => {
    expect(getEngineHost(sharedBlockVolume({ on: [controller('n1', ''), 'n2'] }))).toBe('n1')
    expect(getEngineHost({})).toBe('')
  })

  it('counts the attachments of the UI and of workloads, with the frontend of the volume', () => {
    const tickets = ['backup-controller', 'snapshot-controller', 'volume-clone-controller', 'volume-expansion-controller', 'volume-eviction-controller', 'volume-rebuilding-controller', 'volume-restore-controller'].map((type, i) => other(`x${i}`, type))

    expect(getRequestedHosts(sharedBlockVolume({ tickets: [...tickets, csi('n2'), ui('n2'), ui('n1')] }))).toStrictEqual(['n1', 'n2'])
    expect(getRequestedHosts(sharedBlockVolume({ tickets: [ui('n1'), ui('n3', { parameters: { disableFrontend: 'true' } })] }))).toStrictEqual(['n1'])
    expect(getRequestedHosts(maintenance())).toStrictEqual(['n1'])
    expect(getRequestedHosts(sharedBlockVolume({ tickets: [ui('n1', { parameters: undefined })] }))).toStrictEqual(['n1'])
    expect(getRequestedHosts({})).toStrictEqual([])
  })

  it('reports the progress of attached volumes only', () => {
    const moving = { tickets: [ui('n1'), ui('n3')], on: ['n1', 'n2'] }

    expect(getSharedBlockProgress(sharedBlockVolume(moving))).toBe('Attaching to n3. Detaching from n2')
    expect(getSharedBlockProgress(volumeOn('n1', 'n2'))).toBe('')
    expect(getSharedBlockProgress(sharedBlockVolume({ ...moving, state: 'attaching' }))).toBe('')
    expect(getSharedBlockProgress(maintenance())).toBe('')
    expect(getSharedBlockProgress(regularVolume({ state: 'attached' }))).toBe('')
  })

  it('uses the attachments of their own stream for shared block volumes', () => {
    const live = { attachments: { a: ui('n9') } }
    const stream = (socketStatus, data) => ({ socketStatus, data })
    const volume = { ...volumeOn('n1'), id: 'vol' }
    const hostsWith = (volumeAttachments) => getRequestedHosts(withLiveAttachments(volume, volumeAttachments))

    expect(hostsWith(stream('open', { vol: live }))).toStrictEqual(['n9'])
    expect(hostsWith(stream('closed', { vol: live }))).toStrictEqual(['n1'])
    expect(hostsWith(stream('open', { vol: { code: 1 } }))).toStrictEqual(['n1'])
    expect(hostsWith(stream('open', { vol2: live }))).toStrictEqual(['n1'])
    expect(hostsWith(undefined)).toStrictEqual(['n1'])
    const regular = regularVolume({ id: 'vol' })
    expect(withLiveAttachments(regular, stream('open', { vol: live }))).toBe(regular)
    expect(withLiveAttachments(undefined, stream('open', {}))).toBe(undefined)
  })
})

describe('attaching', () => {
  const limit = (count) => Array.from({ length: count }, (_, i) => `n${i}`)
  const full = () => sharedBlockVolume({ tickets: limit(SHARED_BLOCK_MAX_NODES).map((host) => ui(host)), on: limit(SHARED_BLOCK_MAX_NODES - 1) })

  it('lets an attached shared block volume take more nodes, and says why when it does not', () => {
    expect(attachable(volumeOn('n1', 'n2'))).toBe(true)
    expect(attachable(sharedBlockVolume({ state: 'detached' }))).toBe(true)
    expect(attachable(sharedBlockVolume({ state: 'attaching' }))).toBe(false)
    expect(attachable(maintenance())).toBe(false)
    expect(attachable({ ...volumeOn('n1'), restoreStatus: [{ isRestoring: true }] })).toBe(false)
    expect(attachable(full())).toBe(false)
    expect(canAttachMoreNodes(volumeOn(...limit(SHARED_BLOCK_MAX_NODES - 1)))).toBe(true)
    expect(attachable(regularVolume({ state: 'attached' }))).toBe(false)
    expect(getAttachDisabledReason(full())).toMatch(/up to 16 nodes/)
    expect(getAttachDisabledReason(maintenance())).toMatch(/maintenance mode/)
    expect(getAttachDisabledReason({ ...full(), state: 'detached' })).toBe('')
    expect(getAttachDisabledReason({ ...maintenance(), standby: true })).toBe('')
    expect(getAttachDisabledReason(volumeOn('n1'))).toBe('')
    expect(getAttachDisabledReason(regularVolume({ state: 'attached' }))).toBe('')
  })

  it('uses one attachment per node for shared block volumes only', () => {
    expect(getUIAttachmentID(volumeOn('n1'), 'n3')).toBe('longhorn-ui-n3')
    expect(getUIAttachmentID(regularVolume(), 'n3')).toBe('longhorn-ui')
    expect(getUIAttachments(sharedBlockVolume({ tickets: [ui('n2'), ui('n1'), csi('n3'), ui('n4', { attachmentID: 'longhorn-ui' }), ui('n5', { attachmentID: 'longhorn-uix' }), ui('n6', { attachmentID: '' })] })).map(({ nodeID }) => nodeID)).toStrictEqual(['n1', 'n2', 'n4'])
  })

  it('skips volumes that are on the host already, and only those', () => {
    const requests = getAttachRequests([volumeOn('n1'), sharedBlockVolume({ tickets: [csi('n3')], on: ['n3'] }), regularVolume()], 'n3', true)

    expect(requests.map(({ url, params }) => [url, params.hostId, params.disableFrontend, params.AttachmentID])).toStrictEqual([
      ['/attach', 'n3', false, 'longhorn-ui-n3'],
      ['/rwo-attach', 'n3', true, 'longhorn-ui'],
    ])
    expect(getAttachRequests([sharedBlockVolume({ state: 'detached' })], 'n1', true)[0].params.disableFrontend).toBe(true)
    expect(isAttachedTo(sharedBlockVolume({ tickets: [ui('n2')], on: ['n1', 'n2'] }), 'n1')).toBe(false)
    expect(isAttachedTo(regularVolume({ volumeAttachment: { attachments: { a: ui('n1') } } }), 'n1')).toBe(false)
  })

  it('does not mix regular RWX volumes with attached shared block volumes', () => {
    const rwx = regularVolume({ accessMode: 'rwx' })

    expect(isMaintenanceConflict([volumeOn('n1'), rwx])).toBe(true)
    expect(isMaintenanceConflict([sharedBlockVolume({ state: 'detached' }), rwx])).toBe(false)
    expect(isMaintenanceConflict([volumeOn('n1'), { ...rwx, migratable: true }])).toBe(false)
    expect(isMaintenanceConflict([volumeOn('n1'), regularVolume()])).toBe(false)
  })
})

describe('detaching', () => {
  it('detaches the chosen hosts, each with its own attachment', () => {
    const volume = sharedBlockVolume({ tickets: [ui('n2'), ui('n1'), csi('n3'), ui('n4', { attachmentID: 'longhorn-ui' })] })

    expect(getDetachRequests(volume, false, ['n2', 'n4'])).toStrictEqual([
      { url: '/detach', data: { forceDetach: false, attachmentID: 'longhorn-ui-n2', hostId: 'n2' } },
      { url: '/detach', data: { forceDetach: false, attachmentID: 'longhorn-ui', hostId: 'n4' } },
    ])
    expect(getDetachRequests(volume, false).map(({ data }) => data.hostId)).toStrictEqual(['n1', 'n2', 'n4'])
    expect(getDetachRequests(volume, true, ['n1'])).toStrictEqual([{ url: '/detach', data: { forceDetach: true, attachmentID: 'longhorn-ui', hostId: '' } }])
    expect(getDetachRequests(regularVolume(), false)).toStrictEqual([{ url: '/rwo-detach', data: { forceDetach: false, attachmentID: 'longhorn-ui', hostId: '' } }])
  })

  it('knows which nodes keep the volume', () => {
    expect(getHostsAfterDetach(volumeOn('n1', 'n2', 'n3'), ['n1', 'n2'])).toStrictEqual(['n1', 'n3'])
    expect(getHostsAfterDetach(volumeOn('n1', 'n2'), ['n1', 'n2'])).toStrictEqual([])
    expect(getHostsAfterDetach(sharedBlockVolume({ tickets: [ui('n3')], on: ['n1', 'n3'] }), ['n3'])).toStrictEqual([])
    expect(getHostsAfterDetach(sharedBlockVolume({ tickets: [ui('n2'), csi('n2')], on: ['n1', 'n2'] }), ['n2'])).toStrictEqual(['n1', 'n2'])
    expect(getHostsAfterDetach(sharedBlockVolume({ tickets: [ui('n1'), other('n2', 'backup-controller')], on: ['n2', 'n1'] }), ['n1'])).toStrictEqual(['n2'])
    expect(getHostsAfterDetach({ ...maintenance(), volumeAttachment: { attachments: { a: ui('n1', { parameters: { disableFrontend: 'true' } }), b: other('n1', 'backup-controller') } } }, ['n1'])).toStrictEqual(['n1'])
    expect(getHostsAfterDetach(sharedBlockVolume({ tickets: [ui('n1'), ui('n4', { parameters: { disableFrontend: 'true' } })], on: ['n1'] }), ['n1'])).toStrictEqual([])
  })

  it('says what a detach does beyond its hosts', () => {
    expect(textsOf([volumeOn('n1', 'n2')], false, [])).toStrictEqual([])
    expect(textsOf([volumeOn('n1', 'n2')], false, ['n2'])).toStrictEqual([])
    expect(textsOf([volumeOn('n1', 'n2')], false, ['n1', 'n2'])).toStrictEqual([])
    expect(textsOf([volumeOn('n1', 'n2')], false, ['n1'])).toStrictEqual([['info', 'The engine runs on n1. The volume stays available there until it is detached from all nodes.']])
    expect(textsOf([sharedBlockVolume({ tickets: [ui('n3')], on: ['n1', 'n3'] })], false, ['n3'])).toStrictEqual([['warning', 'No other node keeps the volume attached, so this also detaches it from n1, where the engine runs.']])
    expect(textsOf([sharedBlockVolume({ tickets: [ui('n1'), ui('n2'), csi('n2')], on: ['n1', 'n2'] })], false, ['n2'])).toStrictEqual([['info', 'The volume stays available on n2, also attached outside the UI.']])
    expect(textsOf([regularVolume()], false, [])).toStrictEqual([])
    expect(textsOf([regularVolume()], true)).toStrictEqual([])
  })

  it('names every node of a force detach, also the ones without an attachment', () => {
    expect(textsOf([sharedBlockVolume({ tickets: [ui('n3')], on: ['n1', 'n3'] })], true)).toStrictEqual([['warning', 'Force Detach detaches vol from all nodes: n1, n3.']])
  })

  it('says who attached a volume that the UI did not', () => {
    const text = (tickets) => textsOf([sharedBlockVolume({ tickets, on: ['n1'] })], false)[0]

    expect(text([csi('n1')])).toStrictEqual(['warning', 'vol was not attached from the UI, but by a workload. It can only be detached there, or with Force Detach.'])
    expect(text([other('n1', 'backup-controller'), ui('n1', { attachmentID: 'abc' })])[1]).toBe('vol was not attached from the UI, but by backup-controller and another API client. It can only be detached there, or with Force Detach.')
    expect(text([])[1]).toBe('vol was not attached from the UI. It can only be detached with Force Detach.')
  })

  it('lists the hosts of each shared block volume when detaching several', () => {
    const mixed = sharedBlockVolume({ name: 'mixed', tickets: [ui('n1'), ui('n2'), csi('n3')], on: ['n1', 'n2', 'n3'] })

    expect(textsOf([mixed, regularVolume(), volumeOn('n1')], false)).toStrictEqual([
      ['info', 'mixed is detached from n2 and stays available on n1, n3.'],
      ['info', 'vol is detached from n1.'],
    ])
    expect(textsOf([volumeOn('n1'), regularVolume()], false)).toStrictEqual([['info', 'vol is detached from n1.']])
    expect(textsOf([sharedBlockVolume({ tickets: [ui('n3')], on: ['n1', 'n3', 'n4'] }), regularVolume()], false)).toStrictEqual([['info', 'vol is detached from n1, n3.']])
    expect(textsOf([sharedBlockVolume({ tickets: [ui('n1'), csi('n1')], on: ['n1'] }), regularVolume()], false)).toStrictEqual([['info', 'vol stays available on n1.']])
  })

  it('is possible whenever the volume is attached, unlike other RWX volumes', () => {
    expect(detachable(volumeOn('n1'))).toBe(true)
    expect(detachable({ ...volumeOn('n1'), migratable: true })).toBe(true)
    expect(detachable(sharedBlockVolume({ state: 'detached' }))).toBe(false)
    expect(detachable({ ...volumeOn('n1'), standby: true })).toBe(false)
    expect(detachable(regularVolume({ accessMode: 'rwx', state: 'attached' }))).toBe(false)
  })

  it('has nothing to do for volumes the UI did not attach, unless forced', () => {
    const workload = sharedBlockVolume({ tickets: [csi('n1')], on: ['n1'] })

    expect(hasNothingToDetach([workload], false)).toBe(true)
    expect(hasNothingToDetach([workload], true)).toBe(false)
    expect(hasNothingToDetach([workload, volumeOn('n1')], false)).toBe(false)
    expect(hasNothingToDetach([workload, regularVolume()], false)).toBe(false)
    expect(hasNothingToDetach([], false)).toBe(false)
  })
})

describe('form fields and conditions', () => {
  it('returns the values the form needs for its own fields', () => {
    const names = ['accessMode', 'frontend', 'dataLocality']

    expect(getSharedBlockFields(names, { dataLocality: 'strict-local' })).toStrictEqual({ accessMode: 'rwx', frontend: 'blockdev', dataLocality: 'disabled' })
    expect(getSharedBlockFields(names, { dataLocality: 'best-effort' })).toStrictEqual({ accessMode: 'rwx', frontend: 'blockdev' })
    expect(getSharedBlockFields(['accessMode'])).toStrictEqual({ accessMode: 'rwx' })
  })

  it('rules out strict-local for shared block volumes only', () => {
    expect(isDataLocalityDisabled(true, 'strict-local')).toBe(true)
    expect(isDataLocalityDisabled(true, 'best-effort')).toBe(false)
    expect(isDataLocalityDisabled(false, 'strict-local')).toBe(false)
  })

  it('warns only when the condition is true', () => {
    expect(isUnreservedSharedAccess({ conditions: { UnreservedSharedAccess: { status: 'True' } } })).toBe(true)
    expect(isUnreservedSharedAccess({ conditions: { UnreservedSharedAccess: { status: 'true' } } })).toBe(true)
    expect(isUnreservedSharedAccess({ conditions: { UnreservedSharedAccess: { status: 'False' } } })).toBe(false)
    expect(isUnreservedSharedAccess({ conditions: {} })).toBe(false)
    expect(isUnreservedSharedAccess({})).toBe(false)
  })
})

describe('useSharedBlockFields', () => {
  let values
  let toggle
  let root
  const form = {
    getFieldsValue: (names) => names.reduce((acc, name) => ({ ...acc, [name]: values[name] }), {}),
    setFieldsValue: (fields) => { values = { ...values, ...fields } },
  }
  const Form = ({ tab }) => { // eslint-disable-line react/prop-types
    toggle = useSharedBlockFields(form, ['accessMode', 'frontend', 'dataLocality'], tab)
    return null
  }
  const render = (tab) => act(() => { ReactDOM.render(<Form tab={tab} />, root) })

  beforeEach(() => {
    root = document.createElement('div')
    values = { accessMode: 'rwop', frontend: 'ublk', dataLocality: 'strict-local' }
    render('a')
  })

  it('sets the fields and puts the previous values back', () => {
    expect(toggle(true)).toStrictEqual({ accessMode: 'rwx', frontend: 'blockdev', dataLocality: 'disabled' })
    expect(values).toStrictEqual({ accessMode: 'rwx', frontend: 'blockdev', dataLocality: 'disabled' })
    render('a')
    expect(toggle(false)).toStrictEqual({ accessMode: 'rwop', frontend: 'ublk', dataLocality: 'strict-local' })
    expect(values).toStrictEqual({ accessMode: 'rwop', frontend: 'ublk', dataLocality: 'strict-local' })
  })

  it('keeps what the user changed meanwhile', () => {
    toggle(true)
    values.dataLocality = 'best-effort'
    toggle(false)
    expect(values).toStrictEqual({ accessMode: 'rwop', frontend: 'ublk', dataLocality: 'best-effort' })
  })

  it('does not put anything back twice', () => {
    toggle(true)
    toggle(false)
    values = { accessMode: 'rwx', frontend: 'blockdev', dataLocality: 'disabled' }
    expect(toggle(false)).toStrictEqual({})
    expect(values.accessMode).toBe('rwx')
  })

  it('keeps the tabs of a form apart', () => {
    toggle(true)
    values = { accessMode: 'rwo', frontend: 'nvmf', dataLocality: 'best-effort' }
    render('b')
    toggle(true)
    toggle(false)
    expect(values).toStrictEqual({ accessMode: 'rwo', frontend: 'nvmf', dataLocality: 'best-effort' })
    values = { accessMode: 'rwx', frontend: 'blockdev', dataLocality: 'disabled' }
    render('a')
    toggle(false)
    expect(values).toStrictEqual({ accessMode: 'rwop', frontend: 'ublk', dataLocality: 'strict-local' })
  })
})
