export function createIdFactory(timeOffset: number) {
  let i = 0;
  
  return () => {
    let id = 0n;

    id |= BigInt((Date.now() - timeOffset) & 0xFFFF_FFFF_FF) << 16n;
    id |= BigInt(i << 8);
    id &= 0xFFFF_FFFF_FFFF_FFn;

    i = (i + 1) & 0xFFFF;

    return id.toString(36);
  }
}
