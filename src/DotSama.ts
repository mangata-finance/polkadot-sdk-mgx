import { ApiPromise, WsProvider } from '@polkadot/api'
import { KeyringPair } from '@polkadot/keyring/types'
import BN from 'bn.js'
import { DEFAULT_TOKEN_DECIMALS } from './constants/chain'
import toBn from './utils/toBn'
/**
 * @class DotSama
 * The DotSama class defines the `getInstance` method that lets clients access the unique singleton instance.
 */
export class DotSama {
  private api: Promise<ApiPromise> | null
  private uri: string
  private decimals: number = DEFAULT_TOKEN_DECIMALS
  private static instanceMap: Map<string, DotSama> = new Map<string, DotSama>()

  /**
   * The Mangata's constructor is private to prevent direct
   * construction calls with the `new` operator.
   */
  private constructor(uri: string) {
    this.api = null
    this.uri = uri
  }

  /**
   * Initialised via create method with proper types and rpc
   * for Mangata
   */
  private async connectToNode(uri: string) {
    const provider = new WsProvider(uri)
    const api = await ApiPromise.create({ provider, throwOnConnect: true })
    this.decimals = api.registry.chainDecimals[0]
    return api
  }

  /**
   * The static method that controls the access to the Mangata instance.
   */
  public static getInstance(uri: string): DotSama {
    if (!DotSama.instanceMap.has(uri)) {
      this.instanceMap.set(uri, new DotSama(uri))
      return this.instanceMap.get(uri)!
    } else {
      return this.instanceMap.get(uri)!
    }
  }

  /**
   * Api instance of the connected node
   */
  async getApi(): Promise<ApiPromise> {
    // Because we assign this.api synchronously, repeated calls to
    // method() are guaranteed to always reuse the same promise.
    if (!this.api) {
      this.api = this.connectToNode(this.uri)
    }

    return this.api
  }

  async disconnect(): Promise<void> {
    const api = await this.getApi()
    api.disconnect()
  }

  async createCrowdloan() {}

  async getCrowdloanFunds() {}

  async contributeToCrowdloan(account: KeyringPair, parachainId: string, amount: string) {
    const api = await this.getApi()
    const valueToContribute = toBn(amount, this.decimals)
    const extrinsic = api.tx.crowdloan.contribute(parachainId, valueToContribute, null)
    // now we need to sign the transaction
  }
}
