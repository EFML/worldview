const reuseables = require('../../reuseables/skip-tour.js');
const localSelectors = require('./selectors.js');
const localQuerystrings = require('./querystrings.js');
const TIME_LIMIT = 30000; // Sometimes takes a while to generate GIFs
const askDialog = '.wv-dialog-ask';
const paletteDialogOkButton =
  '.gif-palette-warning .ui-dialog-buttonset > .ui-button:nth-child(2)';
const rotationDialogOkButton =
  '.gif-rotation-warning .ui-dialog-buttonset > .ui-button:nth-child(2)';
const articeRotationResetButton = '#wv-map-arctic .wv-map-reset-rotation';

module.exports = {
  before: function(client) {
    reuseables.loadAndSkipTour(client, TIME_LIMIT);
  },
  'Downloading GIF when custom colormap is activated': function(client) {
    if (client.options.desiredCapabilities.browser !== 'ie') {
      // Custom colormaps down exist in IE
      client.url(client.globals.url + localQuerystrings.activeCustomColormap);
      client.waitForElementVisible(
        localSelectors.animationWidget,
        TIME_LIMIT,
        function() {
          client.click(localSelectors.createGifIcon).pause(1000);
          client.click(localSelectors.gifDownloadIcon).pause(1000);
          client.expect.element(askDialog).to.be.present;
          client.useCss().click(paletteDialogOkButton);
          client.waitForElementVisible(
            localSelectors.gifResults,
            TIME_LIMIT,
            function() {
              client.click(localSelectors.gifResultsCloseButton);
              client.expect.element(localSelectors.gifResults).to.not.be
                .present;
              client.waitForElementVisible(
                localSelectors.animationWidget,
                TIME_LIMIT
              );
            }
          );
        }
      );
    }
  },
  'Downloading GIF when polar projection is rotated': function(client) {
    client.url(
      client.globals.url + localQuerystrings.animationProjectionRotated
    );
    client.waitForElementVisible(
      localSelectors.animationWidget,
      TIME_LIMIT,
      function() {
        client.click(localSelectors.createGifIcon).pause(1000);
        client.click(localSelectors.gifDownloadIcon).pause(1000);
        client.useCss().assert.containsText(articeRotationResetButton, '-18');
        client.expect.element(askDialog).to.be.present;
        client
          .useCss()
          .click(rotationDialogOkButton)
          .pause(1000);
        client.useCss().assert.containsText(articeRotationResetButton, '0');
      }
    );
  },
  'GIF selection preview is Accurate and selections that are too high disable GIF download': function(
    client
  ) {
    client.url(client.globals.url + localQuerystrings.activeAnimationWidget);
    client.waitForElementVisible(
      localSelectors.animationWidget,
      TIME_LIMIT,
      function() {
        client.click(localSelectors.createGifIcon).pause(1000);
        client.waitForElementVisible(
          localSelectors.createGifButton,
          TIME_LIMIT,
          function() {
            client
              .useCss()
              .assert.containsText(
                localSelectors.gifPreviewStartDate,
                '2018-03-28'
              );
            client
              .useCss()
              .assert.containsText(
                localSelectors.gifPreviewEndDate,
                '2018-04-04'
              );
            client
              .useCss()
              .assert.containsText(
                localSelectors.gifPreviewFrameRateValue,
                '3 Frames Per Second'
              );
            client.assert.ok('#wv-checkbox-gif'); // checkbox is checked
            client
              .click(localSelectors.gifPreviewEndResolutionOption250)
              .pause(1000);
            client.assert.value(
              localSelectors.gifPreviewEndResolutionSelector,
              '1'
            );
            client.expect.element(localSelectors.gifDownloadButton).to.not.be
              .enabled;
          }
        );
      }
    );
  },
  after: function(client) {
    client.end();
  }
};
