import { isShardedVolume, getDataLayoutText, getVolumeShards } from '../index'

const shardedVolume = {
  name: 'vol',
  dataLayout: { type: 'sharded', mode: 'erasureCoding', dataChunks: 2, parityChunks: 1, stripSizeKB: 64 },
}

describe('data layout helpers', () => {
  it('reads an empty or missing layout type as replicated', () => {
    expect(isShardedVolume({ dataLayout: { type: '', mode: '' } })).toBe(false)
    expect(getDataLayoutText({ dataLayout: { type: '', mode: '' } })).toBe('Replicated')
    expect(getDataLayoutText({})).toBe('Replicated')
  })

  it('names a sharded volume by its data and parity chunks', () => {
    expect(isShardedVolume(shardedVolume)).toBe(true)
    expect(getDataLayoutText(shardedVolume)).toBe('Sharded 2+1')
  })

  it('returns only the shards of the volume, in slot order', () => {
    const shards = [
      { name: 'vol-10', shardGroupName: 'vol', slotIndex: 10 },
      { name: 'vol-x-0', shardGroupName: 'vol-x', slotIndex: 0 },
      { name: 'vol-2', shardGroupName: 'vol', slotIndex: 2 },
      { name: 'vol-0', shardGroupName: 'vol', slotIndex: 0 },
    ]

    expect(getVolumeShards(shardedVolume, shards).map(shard => shard.name)).toEqual(['vol-0', 'vol-2', 'vol-10'])
    expect(getVolumeShards(shardedVolume, undefined)).toEqual([])
  })
})
