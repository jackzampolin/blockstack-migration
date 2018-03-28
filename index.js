var program = require('commander');
var bsk = require('./blockstack.js')
var blockstack = require('blockstack')

program
  .version('0.1.0')
  
program
  .command('phraseVersion')
  .description('Get the version of your identity phrase by comparing to your browser')
  .option("-p, --phrase [mnemonic]", "your blockstack mnemonic")
  .action(function(env,options){
    if (!env.phrase) {
      console.log("Need to input phrase (-p or --phrase)")
      return
    }
    
    var oh8pk = bsk.getIdentityNodeFromPhrase(env.phrase,"8",0)
    var oh8pubKey = "undefined"
    if (oh8pk) {
      oh8pubKey = oh8.pk.getAddress()
    }
    
    var oh9pk = bsk.getIdentityNodeFromPhrase(env.phrase,"9",0)
    var oh9pubKey = "undefined"
    if (oh9pk) {
      oh9pubKey = oh9pk.getAddress()
    }
    
    var oh10pk = bsk.getIdentityNodeFromPhrase(env.phrase,"10",0)
    var oh10pubKey = "undefined"
    if (oh10pk) {
      oh10pubKey = oh10pk.getAddress()
    }
    
    var btcPk = bsk.getBTC(bsk.getMaster(env.phrase))
    var btcPubKey = "undefined"
    if (btcPk) {
      btcPubKey = btcPk.getAddress()
    }
    
    console.log("")
    console.log("One of the options below should be the identiy address for your first ID.") 
    console.log("Note the number next to it! This is the phraseVersion for update or renew commands")
    console.log(`    8 => ${oh8pubKey}`)
    console.log(`    9 => ${oh9pubKey}`)
    console.log(`    10 => ${oh10pubKey}`)
    console.log("")
    console.log("Below is the public key of your browser BTC wallet. Make sure it is the same before continuing.")
    console.log(`    btc => ${btcPubKey}`)
    console.log("")
  })

program
  .command('updateZonefile')
  .description('this command takes all the inputs necessary to update your zonefile')
  .option("-p, --phrase [mnemonic]", "your blockstack mnemonic")
  .option("-i, --index [index]", "browser index for identity")
  .option("-n, --name [name]", "name at that browser index")
  .option("-v, --phraseVersion [version]", "version derived from calling phraseVersion with your mnemonic")
  .action(function(env, options){
    if (!env.phrase) {
      console.log("Need to input phrase (-p or --phrase)")
      return
    }
    if (!env.index) {
      console.log("Need to input index of name to update (-i or --index)")
      return
    }
    if (!env.name) {
      console.log("Need to input name to update (-n or --name)")
      return
    }
    if (!env.phraseVersion) {
      console.log("Need to input phrase version (-v or --phraseVersion)")
      console.log("Get this by calling 'blockstack-migration phraseVersion'")
      return
    }
    var paymentKeyHex = bsk.toPrivkeyHex(bsk.getBTC(bsk.getMaster(env.phrase)))
    var ownerKey = bsk.getIdentityNodeFromPhrase(env.phrase, `${env.phraseVersion}`, parseInt(env.index))
    var zonefile = `$ORIGIN ${env.name}
$TTL 3600
_https._tcp URI 10 1 "https://gaia.blockstack.org/hub/${ownerKey.getAddress()}/profile.json"
`

    blockstack.transactions.makeUpdate(env.name, ownerKey.getHex(), paymentKeyHex, zonefile)
    .then(transaction => {
      console.log("updating zonefile to:")
      console.log(zonefile)
      return blockstack.config.network.broadcastTransaction(transaction)
    }).catch((err) => {
      console.log(err)
      return
    }).then(txhash => {
      console.log(`Watch transaction https://explorer.blockstack.org/tx/${txhash}`)
      return blockstack.config.network.broadcastZoneFile(zonefile, txhash)
    })
    .then(() => {
      console.log('done')
    })
  });
  
program
  .command('renewName')
  .description('this command takes all the inputs necessary to renew your name. It is also used for transfering')
  .option("-p, --phrase [mnemonic]", "your blockstack mnemonic")
  .option("-i, --index [index]", "browser index for identity")
  .option("-n, --name [name]", "name at that browser index")
  .option("-d, --dest [dest]", "destination address for identity")
  .option("-v, --phraseVersion [version]", "version derived from calling phraseVersion with your mnemonic")
  .action(function(env, options){
    if (!env.phrase) {
      console.log("Need to input phrase (-p or --phrase)")
      return
    }
    if (!env.index) {
      console.log("Need to input index of name to update (-i or --index)")
      return
    }
    if (!env.name) {
      console.log("Need to input name to update (-n or --name)")
      return
    }
    if (!env.dest) {
      console.log("Need to input destination address to update (-d or --dest)")
      console.log("Choose an open identity address from your browser")
      return
    }
    if (!env.phraseVersion) {
      console.log("Need to input phrase version (-v or --phraseVersion)")
      console.log("Get this by calling 'blockstack-migration phraseVersion'")
      return
    }
    var paymentKeyHex = bsk.toPrivkeyHex(bsk.getBTC(bsk.getMaster(env.phrase)))
    var ownerKey = bsk.getIdentityNodeFromPhrase(env.phrase, `${env.phraseVersion}`, parseInt(env.index))
    var zonefile = `$ORIGIN ${env.name}
$TTL 3600
_https._tcp URI 10 1 "https://gaia.blockstack.org/hub/${ownerKey.getAddress()}/profile.json"
`

    blockstack.transactions.makeRenewal(env.name, env.dest, ownerKey.getHex(), paymentKeyHex, zonefile)
    .then(transaction => {
      console.log("renewing name to address =>", env.dest)
      console.log("updating zonefile to:")
      console.log(zonefile)
      return blockstack.config.network.broadcastTransaction(transaction)
    }).catch((err) => {
      console.log(zonefile)
      console.log(err)
      return
    }).then(txhash => {
      console.log(`Watch transaction: https://explorer.blockstack.org/tx/${txhash}`)
      return blockstack.config.network.broadcastZoneFile(zonefile, txhash)
    })
    .then(() => {
      console.log('done')
    })
  });

program.parse(process.argv);
