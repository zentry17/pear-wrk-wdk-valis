// Copyright 2024 Tether Operations Limited
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
'use strict'
/** @typedef {import('@wdk/wallet').FeeRates} FeeRates */

/** @typedef {import('@wdk/wallet').TransferOptions} TransferOptions */
/** @typedef {import('@wdk/wallet').Transaction} Transaction */
/** @typedef {import('@wdk/wallet').TransactionResult} TransactionResult */
/** @typedef {import('@wdk/wallet').TransferResult} TransferResult */
/** @typedef {import('@wdk/wallet').IWalletAccount} IWalletAccount */

/** @typedef {import('@wdk/wallet-evm').EvmWalletConfig} EvmWalletConfig */
/** @typedef {import('@wdk/wallet-evm').EvmTransaction} EvmTransaction */
/** @typedef {import('@wdk/wallet-valis').ValisWalletConfig} ValisWalletconfig */

/** @typedef {string | Uint8Array} Seed */

/**
 * @typedef {Object} Seeds
 * @property {Seed} ethereum - The ethereum's wallet seed phrase.
 * @property {Seed} arbitrum - The arbitrum's wallet seed phrase.
 * @property {Seed} polygon - The polygon's wallet seed phrase.
 */

/**
 * @typedef {Object} WdkConfig
 * @property {EvmWalletConfig } ethereum - The ethereum blockchain configuration.
 * @property {ValisWalletconfig } valis - The ethereum blockchain configuration.
 * @property {EvmWalletConfig } arbitrum - The arbitrum blockchain configuration.
 * @property {EvmWalletConfig } polygon - The polygon blockchain configuration.
 */

/**
 * @typedef {Object} TransferConfig
 * @property {number} [transferMaxFee] - The maximum fee amount for transfer operations.
 * @property {Object} paymasterToken - The paymaster token configuration.
 * @property {string} paymasterToken.address - The address of the paymaster token.
 */

/**
 * @typedef {Object} ApproveOptions
 * @property {string} token
 * @property {string} recipient
 * @property {number} amount
 */

/**
 * Enumeration for all available blockchains.
 *
 * @enum {string}
 */
const Blockchain = {
  Ethereum: 'ethereum',
  Valis: 'valis'
}

const EVM_BLOCKCHAINS = [
  Blockchain.Ethereum,
  Blockchain.Arbitrum,
  Blockchain.Polygon
]

class WdkManager {
  /**
     * Creates a new wallet development kit manager.
     *
     * @param {Seed | Seeds} seed - A [BIP-39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) seed phrase to use for
     *                                             all blockchains, or an object mapping each blockchain to a different seed phrase.
     * @param {WdkConfig} config - The configuration for each blockchain.
     */
  constructor (seed, config) {
    /** @private */
    this._seed = seed

    /** @private */
    this._config = config

    /** @private */
    this._wallets = { }

    /** @private */
    this._account_abstraction_wallets = { }

    /** @private */
    this._imports = { }
  }

  /**
     * Checks if a seed phrase is valid.
     *
     * @param {string} seed - The seed phrase.
     * @returns {boolean} True if the seed phrase is valid.
     */
  static isValidSeedPhrase (seed) {
    // eslint-disable-next-line no-undef
    return bip39.validateMnemonic(seed)
  }

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
  async getAccount (blockchain, index = 0) {
    const wallet = await this._getWalletManager(blockchain)

    return await wallet.getAccount(index)
  }

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
  async getAccountByPath (blockchain, path) {
    const wallet = await this._getWalletManager(blockchain)

    return await wallet.getAccountByPath(path)
  }

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
  async getAddress (blockchain, accountIndex) {
    const account = await this.getAccount(blockchain, accountIndex)

    return await account.getAddress()
  }

  /**
     * Returns the native token balance of an address.
     *
     * @param {Blockchain} blockchain - A blockchain identifier (e.g., "ethereum").
     * @param {number} accountIndex - The index of the account to use (see [BIP-44](https://en.bitcoin.it/wiki/BIP_0044)).
     * @returns {Promise<number>} The native token balance (in base unit).
     */
  async getAddressBalance (blockchain, accountIndex) {
    const account = await this.getAccount(blockchain, accountIndex)

    return await account.getBalance()
  }

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
  async quoteSendTransaction (blockchain, accountIndex, options) {
    const account = await this.getAccount(blockchain, accountIndex)

    return await account.quoteSendTransaction(options)
  }

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
  async sendTransaction (blockchain, accountIndex, options) {
    const account = await this.getAccount(blockchain, accountIndex)

    return await account.sendTransaction(options)
  }

  /**
     * Returns an evm transaction to approve the interaction transaction.
     *
     * @param {ApproveOptions} options - The approve options.
     * @returns {Promise<EvmTransaction>} The evm transaction.
     */
  async getApproveTransaction (options) {
    const { token, recipient, amount } = options

    const erc20Abi = ['function approve(address spender, uint256 amount) external returns (bool)']

    const contract = new this._imports.ethers.Contract(token, erc20Abi)

    return {
      to: token,
      value: 0,
      data: contract.interface.encodeFunctionData('approve', [recipient, amount])
    }
  }

  /** Disposes all the wallet accounts, erasing their private keys from the memory. */
  dispose () {
    for (const blockchain in this._wallets) {
      this._wallets[blockchain].dispose()
    }

    this._seed = null
    this._config = null
    this._wallets = { }
    this._account_abstraction_wallets = { }
  }

  /** @private */
  async _getWalletManager (blockchain) {
    if (!Object.values(Blockchain).includes(blockchain)) {
      throw new Error(`Unsupported blockchain: ${blockchain}.`)
    }

    if (!this._wallets[blockchain]) {
      const seed = (typeof this._seed === 'string' || this._seed instanceof Uint8Array)
        ? this._seed
        : this._seed[blockchain]

      const config = this._config

      if (EVM_BLOCKCHAINS.includes(blockchain)) {
        const { default: WalletManagerEvm } = await import('@wdk/wallet-evm')
      } else if (blockchain === 'valis') {
        const { default: WalletManagerValis } = await import('@wdk/wallet-valis')
      }

      return this._wallets[blockchain]
    }
  }
}

module.exports = {
  WdkManager, Blockchain
}
