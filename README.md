# Blockstack Migration Tool

This repo contains a migration tool that uses your recovery phrase and browser wallet to generate and propagate transactions that will either update or renew your name. The options are discussed below in more detail.

> NOTE: This is experimental software. Use at your own risk!

### Install

To install the dependancies just run `npm install` from the root of the folder.

### Using the tool

To see the help run `node index.js -h`:

```
$ node index.js -h

  Usage: index [options] [command]

  Options:

    -V, --version             output the version number
    -h, --help                output usage information

  Commands:

    phraseVersion [options]   Get the version of your identity phrase by comparing to your browser
    updateZonefile [options]  this command takes all the inputs necessary to update your zonefile
    renewName [options]       this command takes all the inputs necessary to renew your name. It is also used for transfering
```

To check what version of keychain phrase you have first use the `phraseVersion` command to fetch that information:

```
node index.js phraseVersion -p "$(cat .id)"

One of the options below should be the identiy address for your first ID.
Note the number next to it! This is the phraseVersion for update or renew commands
    8 => undefined
    9 => 1Kjvyk85SzHZG356sUW7v2motU7FQNEbyr
    10 => 1BpBjkNnfC5H4iGSWitL77CZdNbPkG8BP1

Below is the public key of your browser BTC wallet. Make sure it is the same before continuing.
    btc => 1Ln4djANagRj8h4EPaqwoCdpQJvwR2stTK
```

You will need to compare the output from that command to the information in your browser. Make sure to note the number next to your identity address. You will need it for the next step.

#### `updateZonefile`

```
$ node index.js updateZonefile -p "$(cat .id)" -i <browser_index> -n myname.id -v <version_from_phraseVersion>
```

This will generate and propagate a transaction that updates your zonefile. You will need to look in your browser to find the index of the Identity. Your first ID is at Index 0, second at index 1...

#### `renewName`

```
$ node index.js renewName -p "$(cat .id)" -i <id_index> -n myname.id -v <version_from_phraseVersion> -d <destination_identity_address>
```

This will generate and propagate transactions that renew your name and associate it with a different identity address. To get another identity address you just need to `Create A New ID` in your browser.