// eslint-disable-next-line no-undef
const { IPC } = BareKit
const HRPC = require('../spec/hrpc')

const { WdkManager } = require('../src/wdk-core/wdk-manager')
const rpcException = require('../src/exceptions/rpc-exception')

const rpc = new HRPC(IPC)
/**
 *
 * @type {WdkManager}
 */
let wdk = null

rpc.onWorkletStart(async init => {
  try {
    if (wdk) wdk.dispose() // cleanup existing;
    wdk = new WdkManager(init.seedPhrase, JSON.parse(init.config))
    return { status: 'started' }
  } catch (error) {
    throw new Error(rpcException.stringifyError(error))
  }
})

rpc.onGetAddress(async payload => {
  try {
    return { address: await wdk.getAddress(payload.network, payload.accountIndex) }
  } catch (error) {
    throw new Error(rpcException.stringifyError(error))
  }
})

rpc.onGetAddressBalance(async payload => {
  try {
    const balance = await wdk.getAddressBalance(payload.network, payload.accountIndex)
    return { balance: balance.toString() }
  } catch (error) {
    throw new Error(rpcException.stringifyError(error))
  }
})

rpc.onQuoteSendTransaction(async payload => {
  try {
    const transaction = await wdk.quoteSendTransaction(payload.network, payload.accountIndex, payload.options)
    return { fee: transaction.fee }
  } catch (error) {
    throw new Error(rpcException.stringifyError(error))
  }
})

rpc.onSendTransaction(async payload => {
  try {
    const transaction = await wdk.sendTransaction(payload.network, payload.accountIndex, payload.options)
    return { fee: transaction.fee, hash: transaction.hash }
  } catch (error) {
    throw new Error(rpcException.stringifyError(error))
  }
})

rpc.onGetTransactionReceipt(async payload => {
  try {
    const receipt = await wdk.getTransactionReceipt(payload.network, payload.accountIndex, payload.hash)
    if (receipt) {
      return { receipt: JSON.stringify(receipt) }
    }
    return {}
  } catch (error) {
    throw new Error(rpcException.stringifyError(error))
  }
})

rpc.onGetApproveTransaction(async payload => {
  try {
    const approveTx = await wdk.getApproveTransaction(payload)
    if (approveTx) {
      return approveTx
    }
    return {}
  } catch (error) {
    throw new Error(rpcException.stringifyError(error))
  }
})

rpc.onDispose(() => {
  try {
    wdk.dispose()
    wdk = null
  } catch (error) {
    throw new Error(rpcException.stringifyError(error))
  }
})
