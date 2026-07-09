/**
 * Compat shim: @splinetool/loader still imports `mergeBufferGeometries`,
 * which three renamed to `mergeGeometries` in r151 (removed in r153+).
 * next.config.ts aliases three's BufferGeometryUtils module here; we
 * re-export the real module (via a direct path so the alias doesn't
 * recurse) and restore the old name.
 */
export * from '../node_modules/three/examples/jsm/utils/BufferGeometryUtils.js';
export { mergeGeometries as mergeBufferGeometries } from '../node_modules/three/examples/jsm/utils/BufferGeometryUtils.js';
