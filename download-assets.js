'use strict';

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _require = require('gatsby-source-filesystem'),
    createRemoteFileNode = _require.createRemoteFileNode;

var _require2 = require('./normalize'),
    makeAssetNodeUid = _require2.makeAssetNodeUid;

var _require3 = require('./utils'),
    createProgress = _require3.createProgress,
    checkIfUnsupportedFormat = _require3.checkIfUnsupportedFormat;

var bar = void 0; // Keep track of the total number of jobs we push in the queue
var sizeBar = void 0;
var totalJobs = 0;
var totalSize = 0;

module.exports = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(_ref2, typePrefix, configOptions) {
    var cache = _ref2.cache,
        getCache = _ref2.getCache,
        createNode = _ref2.createNode,
        createNodeId = _ref2.createNodeId,
        getNodesByType = _ref2.getNodesByType,
        reporter = _ref2.reporter;
    var assets, batches, i, batchPromises, skip, lastCount, shouldBreak, j, regexp, matches, isUnsupportedExt;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            assets = getNodesByType(typePrefix + '_assets');


            configOptions.MAX_CONCURRENCY_LIMIT = process.env.GATSBY_CONCURRENT_DOWNLOAD || 20;

            batches = getBatches(assets.length, configOptions.MAX_CONCURRENCY_LIMIT);
            i = 0;

          case 5:
            if (!(i < batches.length)) {
              _context.next = 36;
              break;
            }

            batchPromises = [];
            skip = i * configOptions.MAX_CONCURRENCY_LIMIT;
            lastCount = (i + 1) * configOptions.MAX_CONCURRENCY_LIMIT;

            reporter.verbose('Skip: ' + skip + ', limit: ' + lastCount);

            shouldBreak = false;
            j = skip;

          case 12:
            if (!(j < lastCount)) {
              _context.next = 29;
              break;
            }

            if (!(!assets[j] && i + 1 === batches.length)) {
              _context.next = 16;
              break;
            }

            shouldBreak = true;
            return _context.abrupt('break', 29);

          case 16:

            // filter the images from all the assets
            regexp = new RegExp('https://(stag-images|images).contentstack.io/v3/assets/');
            matches = void 0;
            // SVG is not supported by gatsby-source-filesystem. Reference: https://github.com/gatsbyjs/gatsby/issues/10297

            isUnsupportedExt = false;

            try {
              if (assets[j]) {
                matches = regexp.exec(assets[j].url);
                isUnsupportedExt = checkIfUnsupportedFormat(assets[j].url);
              }
            } catch (error) {
              reporter.panic('Something went wrong. Details: ' + (0, _stringify2.default)(error));
            }

            // Only download images

            if (!(matches && !isUnsupportedExt)) {
              _context.next = 26;
              break;
            }

            _context.t0 = batchPromises;
            _context.next = 24;
            return createRemoteFileNodePromise({
              cache: cache, getCache: getCache, createNode: createNode, createNodeId: createNodeId
            }, assets[j], typePrefix, reporter);

          case 24:
            _context.t1 = _context.sent;

            _context.t0.push.call(_context.t0, _context.t1);

          case 26:
            j++;
            _context.next = 12;
            break;

          case 29:
            if (!shouldBreak) {
              _context.next = 31;
              break;
            }

            return _context.abrupt('break', 36);

          case 31:
            _context.next = 33;
            return _promise2.default.all(batchPromises);

          case 33:
            i++;
            _context.next = 5;
            break;

          case 36:

            bar && bar.done();
            sizeBar && sizeBar.done();
            reporter.verbose('Total size of downloaded files ' + totalSize);

            _context.next = 44;
            break;

          case 41:
            _context.prev = 41;
            _context.t2 = _context['catch'](0);

            reporter.info('Something went wrong while downloading assets. Details: ' + _context.t2);
            // throw error;

          case 44:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined, [[0, 41]]);
  }));

  return function (_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

var createRemoteFileNodePromise = function () {
  var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(params, node, typePrefix, reporter) {
    var fileNode, assetUid, fileSize;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;

            if (totalJobs === 0) {
              bar = createProgress('Downloading remote files', reporter);
              bar.start();
            }

            if (totalSize === 0) {
              sizeBar = createProgress('Total KBs downloaded', reporter);
              sizeBar.start();
            }

            totalJobs += 1;
            bar.total = totalJobs;

            fileNode = void 0;
            assetUid = makeAssetNodeUid(node, params.createNodeId, typePrefix);

            // Get asset from cache

            _context2.next = 9;
            return params.cache.get(assetUid);

          case 9:
            fileNode = _context2.sent;


            // Handles condition if the asset has been updated, then it will be downloaded again
            if (fileNode.updatedAt !== node.updatedAt) fileNode = null;

            if (fileNode) {
              _context2.next = 18;
              break;
            }

            _context2.next = 14;
            return createRemoteFileNode((0, _extends3.default)({}, params, { url: encodeURI(node.url), parentNodeId: node.id }));

          case 14:
            fileNode = _context2.sent;


            if (fileNode) {
              fileSize = parseInt(fileNode.size / 1000); // Get size in megabytes

              totalSize = totalSize + fileSize;
              sizeBar.total = totalSize;
              sizeBar.tick(fileSize);
            }
            // Cache fileNode to prevent re-downloading asset
            _context2.next = 18;
            return params.cache.set(assetUid, fileNode);

          case 18:

            bar.tick();

            if (fileNode) node.localAsset___NODE = fileNode.id;

            return _context2.abrupt('return', fileNode);

          case 23:
            _context2.prev = 23;
            _context2.t0 = _context2['catch'](0);

            reporter.info('Something went wrong while creating file nodes, Details: ' + _context2.t0);
            // throw error;

          case 26:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined, [[0, 23]]);
  }));

  return function createRemoteFileNodePromise(_x4, _x5, _x6, _x7) {
    return _ref3.apply(this, arguments);
  };
}();

var getBatches = function getBatches(count, batchLimit) {
  var partitions = Math.ceil(count / batchLimit);
  // Returns array filled with indexes
  return Array(partitions).fill(null).map(function (_, i) {
    return i;
  });
};