import HRPC from '../spec/hrpc'

import WdkManager from './wdk-core/wdk-manager.js'
import { stringifyError } from '../src/exceptions/rpc-exception'

/* eslint-disable no-undef */
const { IPC } = BareKit

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
    throw new Error(stringifyError(error))
  }
})
rpc.onGetAddress(async payload => {
  try {
    return { address: await wdk.getAddress(payload.network, payload.accountIndex) }
  } catch (error) {
    throw new Error(stringifyError(error))
  }
})

rpc.onGetAddressBalance(async payload => {
  try {
    const balance = await wdk.getAddressBalance(payload.network, payload.accountIndex)
    return { balance: balance.toString() }
  } catch (error) {
    throw new Error(stringifyError(error))
  }
})

rpc.onQuoteSendTransaction(async payload => {
  try {
    // Convert amount value to number
    payload.options.value = Number(payload.options.value)
    const transaction = await wdk.quoteSendTransaction(payload.network, payload.accountIndex, payload.options)
    return { fee: transaction.fee.toString() }
  } catch (error) {
    throw new Error(stringifyError(error))
  }
})

rpc.onSendTransaction(async payload => {
  try {
    payload.options.value = Number(payload.options.value)
    const transaction = await wdk.sendTransaction(payload.network, payload.accountIndex, payload.options)
    return { fee: transaction.fee.toString(), hash: transaction.hash }
  } catch (error) {
    throw new Error(stringifyError(error))
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
    throw new Error(stringifyError(error))
  }
})

rpc.onGetApproveTransaction(async payload => {
  try {
    payload.amount = Number(payload.amount)
    const approveTx = await wdk.getApproveTransaction(payload)
    if (approveTx) {
      approveTx.value = approveTx.value.toString()
      return approveTx
    }
    return {}
  } catch (error) {
    throw new Error(stringifyError(error))
  }
})

rpc.onDispose(() => {
  try {
    wdk.dispose()
    wdk = null
  } catch (error) {
    throw new Error(stringifyError(error))
  }
})
