/* eslint-disable no-underscore-dangle */
const bitcore = require('@axerunners/axecore-lib');
const chai = require('chai');
const Message = require('../');

const { expect } = chai;
const should = chai.should();
const { Address } = bitcore;
const { Signature } = bitcore.crypto;

describe('Message', () => {
  const address = 'yZKdLYCvDXa2kyQr8Tg3N6c3xeZoK7XDcj';
  const badAddress = 'yj3v6A6gQkiRbChbGwvahiFZ6EfpYxk9na';
  const privateKey = bitcore.PrivateKey.fromWIF('cR4qogdN9UxLZJXCNFNwDRRZNeLRWuds9TTSuLNweFVjiaE4gPaq');
  const text = 'hello, world';
  const signatureString = 'IB+LpNmaTAkB8e6fGgocGKuZ2tAXJ4ZmhhVs7FbOOcHjHPgMHycpAFIl1ojb+PA6jyhufeOKQZKjPnI8VQnevRI=';

  const badSignatureString = 'H69qZ4mbZCcvXk7CWjptD5ypnYVLvQ3eMXLM8+1gX21SLH/GaFnAjQrDn37+TDw79i9zHhbiMMwhtvTwnPigZ6k=';

  const signature = Signature.fromCompact(Buffer.from(signatureString, 'base64'));
  const badSignature = Signature.fromCompact(Buffer.from(badSignatureString, 'base64'));

  const publicKey = privateKey.toPublicKey();

  it('will error with incorrect message type', () => {
    expect(() => new Message(new Date())).to.throw('First argument should be a string');
  });

  it('will instantiate without "new"', () => {
    const message = Message(text);
    should.exist(message);
  });

  let signature2;
  let signature3;

  it('can sign a message', () => {
    const message2 = new Message(text);
    signature2 = message2._sign(privateKey);
    signature3 = Message(text).sign(privateKey);
    should.exist(signature2);
    should.exist(signature3);
  });

  it('sign will error with incorrect private key argument', () => {
    expect(() => {
      const message3 = new Message(text);
      return message3.sign('not a private key');
    }).to.throw('First argument should be an instance of PrivateKey');
  });

  it('can verify a message with signature', () => {
    const message4 = new Message(text);
    const verified = message4._verify(publicKey, signature2);
    verified.should.equal(true);
  });

  it('can verify a message with existing signature', () => {
    const message5 = new Message(text);
    const verified = message5._verify(publicKey, signature);
    verified.should.equal(true);
  });

  it('verify will error with incorrect public key argument', () => {
    expect(() => {
      const message6 = new Message(text);
      return message6._verify('not a public key', signature);
    }).to.throw('First argument should be an instance of PublicKey');
  });

  it('verify will error with incorrect signature argument', () => {
    expect(() => {
      const message7 = new Message(text);
      return message7._verify(publicKey, 'not a signature');
    }).to.throw('Second argument should be an instance of Signature');
  });

  it('verify will correctly identify a bad signature', () => {
    const message8 = new Message(text);
    const verified = message8._verify(publicKey, badSignature);
    should.exist(message8.error);
    verified.should.equal(false);
  });

  it('can verify a message with address and generated signature string', () => {
    const message9 = new Message(text);
    const verified = message9.verify(address, signature3);
    should.not.exist(message9.error);
    verified.should.equal(true);
  });

  it('will not verify with address mismatch', () => {
    const message10 = new Message(text);
    const verified = message10.verify(badAddress, signatureString);
    should.exist(message10.error);
    verified.should.equal(false);
  });

  it('will verify with an uncompressed pubkey', () => {
    const otherPrivateKey = new bitcore.PrivateKey('67fd2209ce4a95f6f1d421ab3fbea47ada13df11b73b30c4d9a9f78cc80651ac');
    const message = new Message('This is an example of a signed message.');
    const otherSignature = message.sign(otherPrivateKey);
    const verified = message.verify(otherPrivateKey.toAddress(), otherSignature);
    verified.should.equal(true);
  });

  it('can chain methods', () => {
    const verified = Message(text).verify(address, signatureString);
    verified.should.equal(true);
  });

  describe('#json', () => {
    it('roundtrip to-from-to', () => {
      const json = new Message(text).toJSON();
      const message = Message.fromJSON(json);
      message.toString().should.equal(text);
    });

    it('checks that the string parameter is valid JSON', () => {
      expect(() => Message.fromJSON('¹')).to.throw();
    });
  });

  describe('#toString', () => {
    it('message string', () => {
      const message = new Message(text);
      message.toString().should.equal(text);
    });

    it('roundtrip to-from-to', () => {
      const str = new Message(text).toString();
      const message = Message.fromString(str);
      message.toString().should.equal(text);
    });
  });

  describe('#inspect', () => {
    it('should output formatted output correctly', () => {
      const message = new Message(text);
      const output = `<Message: ${text}>`;
      message.inspect().should.equal(output);
    });
  });


  it('accepts Address for verification', () => {
    const verified = Message(text)
      .verify(new Address(address), signatureString);
    verified.should.equal(true);
  });
});
