//
// Blockstack-Transfer-Service
// ~~~~~
// copyright: (c) 2017 by Blockstack.org
//
// This file is part of Blockstack-Transfer-Service
//
// Blockstack-client is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Blockstack-client is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Blockstack-Transfer-Service. If not, see <http://www.gnu.org/licenses/>.

const keychains = require('blockstack-keychains')
const bitcoin = require('bitcoinjs-lib')
const bip39 = require('bip39')

// for portal versions before 2038088458012dcff251027ea23a22afce443f3b
class IdentityNode{
    constructor(key){
        this.key = key
    }
    getAddress(){
        return this.key.keyPair.getAddress()
    }
    getSKHex(){
        return this.key.keyPair.d.toBuffer(32).toString('hex')
    }
}


const VERSIONS = {
    "8" : (m, index) => { getIdentityKeyPre09(m) },
    "9" : (m, index) => { return getIdentityKey09to10(getMaster(m), index) },
    "10" : (m, index) => { return getIdentityKeyCurrent(getMaster(m), index) },
    "btc" : (m, index) => { return getBTC(getMaster(m), index) },
}

function getBTC(pK){
  const BIP_44_PURPOSE = 44
  const BITCOIN_COIN_TYPE = 0
  const ACCOUNT_INDEX = 0

  return pK.deriveHardened(BIP_44_PURPOSE)
  .deriveHardened(BITCOIN_COIN_TYPE)
  .deriveHardened(ACCOUNT_INDEX).derive(0).derive(0)
}

function getIdentityNodeFromPhrase(phrase, version = "current", index = 0){
    if (! (version in VERSIONS)){
        return {'status' : 'false', 'message' : `${version} not supported`}
    }
    return VERSIONS[version](phrase, index)
}

function getIdentityKeyCurrent(pK, index = 0){
    return new IdentityNode(
        pK.deriveHardened(888).deriveHardened(0).deriveHardened(index)
    )
}

function getIdentityKey09to10(pK, index = 0){
    return new IdentityNode(
        pK.deriveHardened(888).deriveHardened(0).deriveHardened(index).derive(0)
    )
}

function toAddress(k){
  return k.key.keyPair.getAddress()
}

function toPrivkeyHex(k){
  return k.key.keyPair.d.toHex() + '01'
}

function getIdentityKeyPre09(mnemonic) {
    // on browser branch, v09 was commit -- 848d1f5445f01db1e28cde4a52bb3f22e5ca014c
    const pK = keychains.PrivateKeychain.fromMnemonic(mnemonic)
    const identityKey = pK.privatelyNamedChild('blockstack-0')
    const secret = identityKey.ecPair.d
    const keyPair = new bitcoin.ECPair(secret, false, {"network" :
                                                       bitcoin.networks.bitcoin})
    return new IdentityNode({ keyPair })
}

function getMaster(mnemonic) {
    const seed = bip39.mnemonicToSeed(mnemonic)
    return bitcoin.HDNode.fromSeedBuffer(seed)
}

function generateTriplet() {
  const mnemonic = bip39.generateMnemonic()
  const identity = getIdentityNodeFromPhrase(mnemonic, 'v0.10-current')
  const addr = toAddress(identity)
  const privkey = toPrivkeyHex(identity)
  return {
    privateKey : privkey,
    phrase : mnemonic,
    addr
  }
}

exports.getIdentityNodeFromPhrase = getIdentityNodeFromPhrase
exports.getIdentityKey09to10 = getIdentityKey09to10
exports.getMaster = getMaster
exports.getIdentityKeyCurrent = getIdentityKeyCurrent
exports.getIdentityKeyPre09 = getIdentityKeyPre09
exports.toPrivkeyHex = toPrivkeyHex
exports.getBTC = getBTC
exports.toAddress = toAddress
exports.generateTriplet = generateTriplet
