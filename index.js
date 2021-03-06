const EventEmitter = require('events');
const authenticator = require('authenticator');
const Request = require('./libs/helpers/request');
const Item = require('./libs/classes/Item');
const Trade = require('./libs/classes/Trade');
const User = require('./libs/classes/User');

const sleep = (ms) => new Promise(resolve => setTimeout(() => resolve(), ms));

class OPSkinsTrade extends EventEmitter {
  constructor(api_key, secret, polling = 1000) {
    super();
    this.request = new Request(api_key);
    this.Item = new Item(this.request);
    this.Trade = new Trade(this.request);
    this.User = new User(this.request);
    this.api_key = api_key;
    this.secret = secret;
    this.polling = polling;
  }

  generateTwoFactor() {
    return authenticator.generateToken(this.secret);
  }
  async pollTrades() {
    const offers = (await this.Trade.getOffers()).response.offers;
    offers.forEach((offer) => {
      this.emit('incoming trade', offer);
    });
    await sleep(this.polling);
    this.pollTrades();
  }
  
  getUserInventory(steamid){
  	return this.Trade.getUserInventoryFromSteamId({'steam_id' : steamid, 'app_id' : '2'}); 
  }

  async sendOffer(steamid, items){
  	const offerData = (await this.Trade.sendOfferToSteamId({'twofactor_code' : this.generateTwoFactor(), 'steam_id' : steamid, 'items' : items})).response.offer;
  	this.emit('sentOffer', offerData);
  }
  
}

module.exports = OPSkinsTrade;
