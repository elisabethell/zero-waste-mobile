import * as SecureStore from 'expo-secure-store';

const RECIPIENT_KEY_PREFIX = 'savebite_nik_';

export const saveRecipientCredential = async (
  deliveryId: string,
  nik: string
): Promise<void> => {
  // Disimpan terenkripsi (Keychain iOS / Keystore Android)
  await SecureStore.setItemAsync(`${RECIPIENT_KEY_PREFIX}${deliveryId}`, nik, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
};

export const getRecipientCredential = async (
  deliveryId: string
): Promise<string | null> => {
  return await SecureStore.getItemAsync(`${RECIPIENT_KEY_PREFIX}${deliveryId}`);
};

export const deleteRecipientCredential = async (
  deliveryId: string
): Promise<void> => {
  await SecureStore.deleteItemAsync(`${RECIPIENT_KEY_PREFIX}${deliveryId}`);
};