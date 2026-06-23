const oauthTempStore = new Map();

const STATE_EXPIRY_MS = 5 * 60 * 1000;

export const setOAuthResult = (stateId, data) => {
  oauthTempStore.set(stateId, {
    ...data,
    expiresAt: Date.now() + STATE_EXPIRY_MS,
  });
};

export const getOAuthResult = (stateId) => {
  const record = oauthTempStore.get(stateId);
  if (!record) return null;

  if (Date.now() > record.expiresAt) {
    oauthTempStore.delete(stateId);
    return null;
  }

  return record;
};

export const deleteOAuthResult = (stateId) => {
  oauthTempStore.delete(stateId);
};
