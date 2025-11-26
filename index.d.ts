export { default as HRPC } from "./types/spec/hrpc/index.js";
export * as schema from "./types/spec/schema/index.js";
export type FeeRates = import("@wdk/wallet").FeeRates;
export type TransferOptions = import("@wdk/wallet").TransferOptions;
export type TransferResult = import("@wdk/wallet").TransferResult;
export type IWalletAccount = import("@wdk/wallet").IWalletAccount;
export type Seed = import("./types/src/wdk-core/wdk-manager.js").Seed;
export type Seeds = import("./types/src/wdk-core/wdk-manager.js").Seeds;
export type WdkConfig = import("./types/src/wdk-core/wdk-manager.js").WdkConfig;
export type TransferConfig =
  import("./types/src/wdk-core/wdk-manager.js").TransferConfig;
export { WdkManager, Blockchain } from "./types/src/wdk-core/wdk-manager.js";
