export const logger = {
  info: (msg: string, meta?: any) => {
    console.log(`[INFO] ${msg}`, meta !== undefined ? meta : '');
  },
  error: (msg: string, meta?: any) => {
    console.error(`[ERROR] ${msg}`, meta !== undefined ? meta : '');
  },
  warn: (msg: string, meta?: any) => {
    console.warn(`[WARN] ${msg}`, meta !== undefined ? meta : '');
  }
};
