export type FeeRates = import("@wdk/wallet").FeeRates;
export type TransferOptions = import("@wdk/wallet").TransferOptions;
export type Transaction = import("@wdk/wallet").Transaction;
export type TransactionResult = import("@wdk/wallet").TransactionResult;
export type TransferResult = import("@wdk/wallet").TransferResult;
export type IWalletAccount = import("@wdk/wallet").IWalletAccount;
export type EvmWalletConfig = import("@wdk/wallet-evm").EvmWalletConfig;
export type EvmTransaction = import("@wdk/wallet-evm").EvmTransaction;
export type ValisWalletconfig = any;
export type Seed = string | Uint8Array;
export type Seeds = {
    /**
     * - The ethereum's wallet seed phrase.
     */
    ethereum: Seed;
    /**
     * - The arbitrum's wallet seed phrase.
     */
    arbitrum: Seed;
    /**
     * - The polygon's wallet seed phrase.
     */
    polygon: Seed;
};
export type WdkConfig = {
    /**
     * - The ethereum blockchain configuration.
     */
    ethereum: EvmWalletConfig;
    /**
     * - The ethereum blockchain configuration.
     */
    valis: ValisWalletconfig;
    /**
     * - The arbitrum blockchain configuration.
     */
    arbitrum: EvmWalletConfig;
    /**
     * - The polygon blockchain configuration.
     */
    polygon: EvmWalletConfig;
};
export type TransferConfig = {
    /**
     * - The maximum fee amount for transfer operations.
     */
    transferMaxFee?: number;
    /**
     * - The paymaster token configuration.
     */
    paymasterToken: {
        address: string;
    };
};
export type ApproveOptions = {
    token: string;
    recipient: string;
    amount: number;
};
export class WdkManager {
    /**
       * Checks if a seed phrase is valid.
       *
       * @param {string} seed - The seed phrase.
       * @returns {boolean} True if the seed phrase is valid.
       */
    static isValidSeedPhrase(seed: string): boolean;
    /**
       * Creates a new wallet development kit manager.
       *
       * @param {Seed | Seeds} seed - A [BIP-39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) seed phrase to use for
       *                                             all blockchains, or an object mapping each blockchain to a different seed phrase.
       * @param {WdkConfig} config - The configuration for each blockchain.
       */
    constructor(seed: Seed | Seeds, config: WdkConfig);
    /** @private */
    private _seed;
    /** @private */
    private _config;
    /** @private */
    private _wallets;
    /** @private */
    private _account_abstraction_wallets;
    /** @private */
    private _imports;
    /**
       * Returns the wallet account for a specific blockchain and index (see [BIP-44](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki)).
       *
       * @example
       * // Return the account for the ethereum blockchain with derivation path m/44'/60'/0'/0/1
       * const account = await wdk.getAccount("ethereum", 1);
       * @param {Blockchain} blockchain - A blockchain identifier (e.g., "ethereum").
       * @param {number} [index] - The index of the account to get (default: 0).
       * @returns {Promise<IWalletAccount>} The account.
       */
    getAccount(blockchain: Blockchain, index?: number): Promise<IWalletAccount>;
    /**
       * Returns the wallet account for a specific blockchain and BIP-44 derivation path.
       *
       * @example
       * // Returns the account for the ethereum blockchain with derivation path m/44'/60'/0'/0/1
       * const account = await wdk.getAccountByPath("ethereum", "0'/0/1");
       * @param {Blockchain} blockchain - A blockchain identifier (e.g., "ethereum").
       * @param {string} path - The derivation path (e.g. "0'/0/0").
       * @returns {Promise<IWalletAccount>} The account.
       */
    getAccountByPath(blockchain: Blockchain, path: string): Promise<IWalletAccount>;
    /**
       * Returns the address of an account.
       *
       * @param {Blockchain} blockchain - A blockchain identifier (e.g., "ethereum").
       * @param {number} accountIndex - The index of the account to use (see [BIP-44](https://en.bitcoin.it/wiki/BIP_0044)).
       * @returns {Promise<string>} The abstracted address.
       *
       * @example
       * // Get the abstracted address of the ethereum wallet's account at m/44'/60'/0'/0/3
       * const abstractedAddress = await wdk.getAbstractedAddress("ethereum", 3);
       */
    getAddress(blockchain: Blockchain, accountIndex: number): Promise<string>;
    /**
       * Returns the native token balance of an address.
       *
       * @param {Blockchain} blockchain - A blockchain identifier (e.g., "ethereum").
       * @param {number} accountIndex - The index of the account to use (see [BIP-44](https://en.bitcoin.it/wiki/BIP_0044)).
       * @returns {Promise<number>} The native token balance (in base unit).
       */
    getAddressBalance(blockchain: Blockchain, accountIndex: number): Promise<number>;
    /**
       * Transfers a token to another address.
       *
       * @param {Blockchain} blockchain - A blockchain identifier (e.g., "ethereum").
       * @param {number} accountIndex - The index of the account to use (see [BIP-44](https://en.bitcoin.it/wiki/BIP_0044)).
       * @param {Transaction} options - The transfer's options.
       * @returns {Promise<Omit<TransactionResult, "hash">>} The transfer's result.
       *
       * @example
       * // Transfer 1 BTC from the spark wallet's account at index 0 to another address
       * const transfer = await wdk.transfer("spark", 0, {
       *     to: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
       *     value: 1
       * });
       *
       * console.log("Transaction hash:", transfer.hash);
       */
    quoteSendTransaction(blockchain: Blockchain, accountIndex: number, options: Transaction): Promise<Omit<TransactionResult, "hash">>;
    /**
       * Transfers a token to another address.
       *
       * @param {Blockchain} blockchain - A blockchain identifier (e.g., "ethereum").
       * @param {number} accountIndex - The index of the account to use (see [BIP-44](https://en.bitcoin.it/wiki/BIP_0044)).
       * @param {Transaction} options - The transfer's options.
       * @returns {Promise<Omit<TransactionResult, "hash">>} The transfer's result.
       *
       * @example
       * // Transfer 1 BTC from the spark wallet's account at index 0 to another address
       * const transfer = await wdk.transfer("spark", 0, {
       *     to: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
       *     value: 1
       * });
       *
       * console.log("Transaction hash:", transfer.hash);
       */
    sendTransaction(blockchain: Blockchain, accountIndex: number, options: Transaction): Promise<Omit<TransactionResult, "hash">>;
    /**
       * Returns an evm transaction to approve the interaction transaction.
       *
       * @param {ApproveOptions} options - The approve options.
       * @returns {Promise<EvmTransaction>} The evm transaction.
       */
    getApproveTransaction(options: ApproveOptions): Promise<EvmTransaction>;
    /** Disposes all the wallet accounts, erasing their private keys from the memory. */
    dispose(): void;
    /** @private */
    private _getWalletManager;
}
/**
 * Enumeration for all available blockchains.
 */
export type Blockchain = string;
export namespace Blockchain {
    let Ethereum: string;
    let Valis: string;
}
