const prisma = require('../db');

function hasChatModels() {
  try {
    const conv = prisma?.conversation;
    const msg = prisma?.chatMessage;
    return (
      conv != null &&
      msg != null &&
      typeof conv.findMany === 'function' &&
      typeof msg.findMany === 'function'
    );
  } catch {
    return false;
  }
}

module.exports = { hasChatModels };
