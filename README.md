# axecore-message

[![Build Status](https://img.shields.io/travis/axerunners/axecore-message.svg?branch=master&style=flat-square)](https://travis-ci.org/axerunners/axecore-message)
[![NPM Package](https://img.shields.io/npm/v/@axerunners/axecore-message.svg?style=flat-square)](https://www.npmjs.org/package/@axerunners/axecore-message)

> Message Verification and Signing for axecore-lib

axecore-message adds support for verifying and signing axe messages in [Node.js](http://nodejs.org/) and web browsers.

See [the main axecore-lib repo](https://github.com/axerunners/axecore-lib) for more information.

## Install

```sh
npm install @axerunners/axecore-message
```

To sign a message:

```javascript
var bitcore = require('@axerunners/axecore-lib');
var Message = require('@axerunners/axecore-message');

var privateKey = bitcore.PrivateKey.fromWIF('cPBn5A4ikZvBTQ8D7NnvHZYCAxzDZ5Z2TSGW2LkyPiLxqYaJPBW4');
var signature = Message('hello, world').sign(privateKey);
```

To verify a message:

```javascript
var address = 'n1ZCYg9YXtB5XCZazLxSmPDa8iwJRZHhGx';
var signature = 'H/DIn8uA1scAuKLlCx+/9LnAcJtwQQ0PmcPrJUq90aboLv3fH5fFvY+vmbfOSFEtGarznYli6ShPr9RXwY9UrIY=';
var verified = Message('hello, world').verify(address, signature);
```

## Contributing

Feel free to dive in! [Open an issue](https://github.com/axerunners/axecore-message/issues/new) or submit PRs.

Please see [CONTRIBUTING.md](https://github.com/axerunners/axe/blob/master/CONTRIBUTING.md) on the DashCore repo for information about how to contribute.

## License

Code released under [the MIT license](LICENSE).
