const bitcore = require('@axerunners/axecore-lib');

const { _ } = bitcore.deps;
const { PrivateKey, PublicKey, Address } = bitcore;
const { BufferWriter } = bitcore.encoding;
const { ECDSA, Signature } = bitcore.crypto;
const { sha256sha256 } = bitcore.crypto.Hash;
const JSUtil = bitcore.util.js;
const $ = bitcore.util.preconditions;

/**
 * constructs a new message to sign and verify.
 *
 * @param {String} message
 * @returns {Message}
 */
const Message = function Message(message) {
  if (!(this instanceof Message)) {
    return new Message(message);
  }
  $.checkArgument(_.isString(message), 'First argument should be a string');
  this.message = message;

  return this;
};

Message.MAGIC_BYTES = Buffer.from('DarkCoin Signed Message:\n');

Message.prototype.magicHash = function magicHash() {
  const prefix1 = BufferWriter.varintBufNum(Message.MAGIC_BYTES.length);
  const messageBuffer = Buffer.from(this.message);
  const prefix2 = BufferWriter.varintBufNum(messageBuffer.length);
  const buf = Buffer.concat([prefix1, Message.MAGIC_BYTES, prefix2, messageBuffer]);
  const hash = sha256sha256(buf);
  return hash;
};

// eslint-disable-next-line no-underscore-dangle
Message.prototype._sign = function _sign(privateKey) {
  $.checkArgument(privateKey instanceof PrivateKey,
    'First argument should be an instance of PrivateKey');
  const hash = this.magicHash();
  const ecdsa = new ECDSA();
  ecdsa.hashbuf = hash;
  ecdsa.privkey = privateKey;
  ecdsa.pubkey = privateKey.toPublicKey();
  ecdsa.signRandomK();
  ecdsa.calci();
  return ecdsa.sig;
};

/**
 * Will sign a message with a given bitcoin private key.
 *
 * @param {PrivateKey} privateKey - An instance of PrivateKey
 * @returns {String} A base64 encoded compact signature
 */
Message.prototype.sign = function sign(privateKey) {
  // eslint-disable-next-line no-underscore-dangle
  const signature = this._sign(privateKey);
  return signature.toCompact().toString('base64');
};

// eslint-disable-next-line no-underscore-dangle
Message.prototype._verify = function _verify(publicKey, signature) {
  $.checkArgument(publicKey instanceof PublicKey, 'First argument should be an instance of PublicKey');
  $.checkArgument(signature instanceof Signature, 'Second argument should be an instance of Signature');
  const hash = this.magicHash();
  const verified = ECDSA.verify(hash, signature, publicKey);
  if (!verified) {
    this.error = 'The signature was invalid';
  }
  return verified;
};

/**
 * Will return a boolean of the signature is valid for a given bitcoin address.
 * If it isn't the specific reason is accessible via the "error" member.
 *
 * @param {Address|String} bitcoinAddress - A bitcoin address
 * @param {String} signatureString - A base64 encoded compact signature
 * @returns {Boolean}
 */
Message.prototype.verify = function verify(btcAddress, signatureString) {
  let bitcoinAddress = btcAddress;
  $.checkArgument(bitcoinAddress);
  $.checkArgument(signatureString && _.isString(signatureString));

  if (_.isString(bitcoinAddress)) {
    bitcoinAddress = Address.fromString(bitcoinAddress);
  }
  const signature = Signature.fromCompact(Buffer.from(signatureString, 'base64'));

  // recover the public key
  const ecdsa = new ECDSA();
  ecdsa.hashbuf = this.magicHash();
  ecdsa.sig = signature;
  const publicKey = ecdsa.toPublicKey();

  const signatureAddress = Address.fromPublicKey(publicKey, bitcoinAddress.network);

  // check that the recovered address and specified address match
  if (bitcoinAddress.toString() !== signatureAddress.toString()) {
    this.error = 'The signature did not match the message digest';
    return false;
  }

  // eslint-disable-next-line no-underscore-dangle
  return this._verify(publicKey, signature);
};

/**
 * Instantiate a message from a message string
 *
 * @param {String} str - A string of the message
 * @returns {Message} A new instance of a Message
 */
Message.fromString = function fromString(str) {
  return new Message(str);
};

/**
 * Instantiate a message from JSON
 *
 * @param {String} json - An JSON string or Object with keys: message
 * @returns {Message} A new instance of a Message
 */
Message.fromJSON = function fromJSON(jsonParam) {
  let json = jsonParam;
  if (JSUtil.isValidJSON(json)) {
    json = JSON.parse(json);
  }
  return new Message(json.message);
};

/**
 * @returns {Object} A plain object with the message information
 */
Message.prototype.toObject = function toObject() {
  return {
    message: this.message,
  };
};

/**
 * @returns {String} A JSON representation of the message information
 */
Message.prototype.toJSON = function toJSON() {
  return JSON.stringify(this.toObject());
};

/**
 * Will return a the string representation of the message
 *
 * @returns {String} Message
 */
Message.prototype.toString = function toString() {
  return this.message;
};

/**
 * Will return a string formatted for the console
 *
 * @returns {String} Message
 */
Message.prototype.inspect = function inspect() {
  return `<Message: ${this.toString()}>`;
};

module.exports = Message;
