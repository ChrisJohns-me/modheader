import lodashIsUndefined from 'lodash/isUndefined.js';
import lodashIsEmpty from 'lodash/isEmpty.js';
import { fixProfiles } from './profile.js';
import { getLocal, setLocal, getSync, removeLocal } from './storage.js';

export async function setProfiles(profiles) {
  await setLocal({ profiles });
}

export async function setSelectedProfileIndex(index) {
  await setLocal({ selectedProfile: index });
}

export async function setPaused(isPaused) {
  if (isPaused) {
    await setLocal({ isPaused: true });
  } else {
    await removeLocal('isPaused');
  }
}

export async function setLockedTabId(lockedTabId) {
  if (lockedTabId) {
    await setLocal({ lockedTabId });
  } else {
    await removeLocal('lockedTabId');
  }
}

export async function initStorage() {
  let chromeLocal = await getLocal();
  let isMutated;
  if (!chromeLocal.profiles) {
    const items = await getSync();
    const keys = items ? Object.keys(items) : [];
    keys.sort();
    if (keys.length > 0) {
      chromeLocal = {
        profiles: items[keys[keys.length - 1]],
        selectedProfile: 0,
        savedToCloud: true
      };
      isMutated = true;
    }
  }
  if (lodashIsEmpty(chromeLocal.profiles)) {
    chromeLocal.profiles = [];
  }
  if (fixProfiles(chromeLocal.profiles)) {
    isMutated = true;
  }
  if (
    lodashIsUndefined(chromeLocal.selectedProfile) ||
    chromeLocal.selectedProfile < 0 ||
    chromeLocal.selectedProfile >= chromeLocal.profiles.length
  ) {
    chromeLocal.selectedProfile = chromeLocal.profiles.length - 1;
    isMutated = true;
  }
  if (isMutated) {
    await setLocal(chromeLocal);
  }
  return chromeLocal;
}
