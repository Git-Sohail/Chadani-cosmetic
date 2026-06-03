function formatUserForClient(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || null,
    profileImage: user.profileImage || null,
    isVerified: user.isVerified ?? false,
    createdAt: user.createdAt || null,
  };
}

module.exports = { formatUserForClient };
