const session = {
  set: (name: string, value: string) => {
    sessionStorage.setItem(name, value);
  },
  get: (name: string) => {
    return sessionStorage.getItem(name);
  },
  remove: (name: string) => {
    sessionStorage.removeItem(name);
  },
};

export default session;

export const sessionGetBackupData = () => {
  return sessionStorage.getItem('backup-data');
};

export const sessionSetBackupData = (value: string) => {
  sessionStorage.setItem('backup-data', value);
};

export const sessionRemoveBackupData = () => {
  sessionStorage.removeItem('backup-data');
};
