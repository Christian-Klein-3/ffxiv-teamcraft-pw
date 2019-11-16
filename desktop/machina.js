const MachinaFFXIV = require('node-machina-ffxiv');
const isDev = require('electron-is-dev');
const path = require('path');
const { app } = require('electron');
const log = require('electron-log');
const isElevated = require('is-elevated');
const { exec } = require('child_process');

const machinaExePath = path.join(app.getAppPath(), '../../resources/MachinaWrapper/MachinaWrapper.exe');

let Machina;

function sendToRenderer(win, packet) {
  win && win.webContents && win.webContents.send('packet', packet);
}

module.exports.start = function(win, config, verbose, winpcap) {
  isElevated().then(elevated => {
    log.info('elevated', elevated);
    if (elevated) {
      exec(`netsh advfirewall firewall add rule name="FFXIVTeamcraft" dir=in action=allow program="${machinaExePath}" enable=yes`);

      const options = isDev ?
        {
          monitorType: winpcap ? 'WinPCap' : 'RawSocket',
          parseAlgorithm: 'PacketSpecific'
        } : {
          parseAlgorithm: 'PacketSpecific',
          noData: true,
          monitorType: winpcap ? 'WinPCap' : 'RawSocket',
          machinaExePath: machinaExePath,
          remoteDataPath: path.join(app.getAppPath(), '../../resources/remote-data'),
          definitionsDir: path.join(app.getAppPath(), '../../resources/app.asar.unpacked/node_modules/node-machina-ffxiv/models/default')
        };

      if (verbose) {
        options.logger = log.log;
      }

      const acceptedPackets = [
        'statusEffectList',
        'itemInfo',
        'updateInventorySlot',
        'currencyCrystalInfo',
        'marketBoardItemListingCount',
        'marketBoardItemListing',
        'marketBoardItemListingHistory',
        'marketTaxRates',
        'playerSetup',
        'playerSpawn',
        'inventoryModifyHandler',
        'npcSpawn',
        'ping',
        'playerStats',
        'updateClassInfo',
        'actorControl',
        'initZone',
        'weatherChange',
        'aetherReductionDlg',
        'desynthOrReductionResult',
        'persistentEffect'
      ];

      Machina = new MachinaFFXIV(options);
      Machina.filter(acceptedPackets);
      Machina.start(() => {
        log.info('Packet capture started');
      });
      Machina.setMaxListeners(0);
      Machina.on('any', (packet) => {
        if (verbose) {
          log.log(JSON.stringify(packet));
        }
        if (acceptedPackets.indexOf(packet.type) > -1 || acceptedPackets.indexOf(packet.superType) > -1) {
          sendToRenderer(win, packet);
        }
      });
    } else {
      throw new Error('Not enough permissions to run packet capture');
    }
  });


};

module.exports.stop = function() {
  if (Machina) {
    Machina.stop();
  }
};