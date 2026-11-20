import * as FileSystem from 'expo-file-system/legacy';

const VAULT_DIR = `${FileSystem.documentDirectory}ktp_vault/`;

const ensureVaultDirExists = async () => {
  const dirInfo = await FileSystem.getInfoAsync(VAULT_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(VAULT_DIR, { intermediates: true });
  }
};

export const saveKtpToScopedStorage = async (
  tempPhotoUri: string,
  deliveryId: string
): Promise<string> => {
  await ensureVaultDirExists();
  const safeFileName = `ktp_${deliveryId}_${Date.now()}.jpg`;
  const destinationUri = `${VAULT_DIR}${safeFileName}`;

  await FileSystem.copyAsync({
    from: tempPhotoUri,
    to: destinationUri,
  });

  return destinationUri;
};