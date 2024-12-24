const C = {
  RegExp: {
    // Regular expressions ensure that only the correct request path is included, scenarios:
    // https://example.com/v1/backingimages -> /v1/backingimages
    // http://localhost/v1/backingimages -> /v1/backingimages
    // wss://example.com/v1/backingimages -> /v1/backingimages
    // /v1/backingimages/v1?action=backupBackingImageCreate (no change)
    // /v1/backupbackingimages/v1-xxx (no change)
    REQUEST: /^(https?|wss?):\/\/[^/]+(:\d{2,6})?(?=\/v1)/,
  },
  ContainerMarginHeight: 101,
}

export default C
