export const filterBackingImage = (data, field, value) => {
  if (!data || data.length === 0) {
    return []
  }
  let backingImages = [...data]
  switch (field) {
    case 'name':
    case 'uuid':
    case 'minNumberOfCopies':
      backingImages = backingImages.filter((image) => (value ? image[field].toString().includes(value.toString().trim()) : true))
      break
    case 'diskSelector':
    case 'nodeSelector':
      backingImages = backingImages.filter((image) => (value ? image[field]?.toString().includes(value.trim()) || false : true))
      break
    case 'sourceType':
      backingImages = backingImages.filter((image) => (value ? image.sourceType === value.trim() : true))
      break
    default:
  }
  return backingImages && backingImages.length > 0 ? backingImages.sort((a, b) => a.name.localeCompare(b.name)) : []
}

export const filterBackupBackingImage = (bbiData, field, value) => {
  if (!bbiData || bbiData.length === 0) {
    return []
  }
  let result = [...bbiData]
  if (field && value) {
    switch (field) {
      case 'name':
      case 'state':
      case 'url':
      case 'backupTargetName':
        result = result.filter((image) => (value ? image[field].toLowerCase().includes(value.toLowerCase().trim()) : true))
        break
      default:
    }
  }
  return result
}
