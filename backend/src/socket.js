/**
 * Singleton Socket.IO instance.
 * Set by index.js at startup, consumed by controllers.
 */
let _io = null;

function setIo(ioInstance) {
  _io = ioInstance;
}

function getIo() {
  return _io;
}

module.exports = { setIo, getIo };
