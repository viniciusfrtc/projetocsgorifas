
var adm = require('./admin.json');
var SteamUser = require('steam-user');
var SteamCommunity = require('steamcommunity');
var SteamTotp = require('steam-totp');
var TradeOfferManager = require('steam-tradeoffer-manager');
var fs = require('fs');
var inv = require('./inventario.js');

var client = new SteamUser();
var manager = new TradeOfferManager({
	"steam": client, // Polling every 30 seconds is fine since we get notifications from Steam
	"domain": "http://localhost:3000", // Our domain is example.com
	"language": "en" // We want English item descriptions
});
var community = new SteamCommunity();

// Steam logon options
var logOnOptions = {
	"accountName": adm.user,
	"password": adm.password,
	"twoFactorCode": SteamTotp.getAuthCode(adm.sharedsecret)
};

// exports.carregarinventario = () => {
// 	client.logOn(logOnOptions);
//
// 	client.on('loggedOn', function() {
// 		console.log("Logged into Steam");
// 	});
//
// 	client.on('webSession', function(sessionID, cookies) {
// 		manager.setCookies(cookies, function(err) {
// 			if (err) {
// 				console.log(err);
// 				process.exit(1); // Fatal error since we couldn't get our API key
// 				return;
// 			}
//
// 			console.log("Got API key: " + manager.apiKey);
//
// 			// Get our inventory
// 			manager.getInventoryContents(730, 2, true, function(err, inventory) {
// 				if (err) {
// 					console.log(err);
// 					return;
// 				}
//
// 				if (inventory.length == 0) {
// 					// Inventory empty
// 					console.log("CS:GO inventory is empty");
// 					return;
// 				}
//
// 				console.log("Found " + inventory.length + " CS:GO items");
// 				console.log(inventory);
//
// 				community.setCookies(cookies);
//
// 				return inventory;
// 			});
//
// 		});
// 	});
// };

exports.enviarpremio = (tradeurl, premio) => {

	client.logOn(logOnOptions);

	client.on('loggedOn', function() {
		console.log("Logged into Steam");
	});

	client.on('webSession', function(sessionID, cookies) {
		manager.setCookies(cookies, function(err) {
			if (err) {
				console.log(err);
				process.exit(1); // Fatal error since we couldn't get our API key
				return;
			}

			console.log("Got API key: " + manager.apiKey);

			// Get our inventory
			manager.getInventoryContents(730, 2, true, function(err, inventory) {
				if (err) {
					console.log(err);
					return;
				}

				if (inventory.length == 0) {
					// Inventory empty
					console.log("CS:GO inventory is empty");
					return;
				}

				console.log("Found " + inventory.length + " CS:GO items");

				// Create and send the offer
				var offer = manager.createOffer(tradeurl);
				// let pospremio;
				// for(i = 0; i < inv.inventario.length; i++){
				// 	if (inv.inventario[premio].market_name == inventory[i].market_name){
				// 		pospremio = i;
				// 		break;
				// 	};
				// };

				offer.addMyItem(inventory[premio]);
				offer.setMessage("Here, have some items!");
				offer.send(function(err, status) {
					if (err) {
						console.log(err);
						return;
					}

					if (status == 'pending') {
						// We need to confirm it
						console.log(`Offer #${offer.id} sent, but requires confirmation`);
						community.acceptConfirmationForObject(adm.identitysecret, offer.id, function(err) {
							if (err) {
								console.log(err);
							} else {
								console.log("Offer confirmed");
							}
						});
					} else {
						console.log(`Offer #${offer.id} sent successfully`);
					}
				});
			});
		});

		community.setCookies(cookies);
		return;
	});

};
