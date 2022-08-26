const EventEmitter = require('events');
const pageEvent = new EventEmitter();


var CommonFunction = {
    //============================================================================================

    addBrowserScript: async () => {
        const page = global.page;
        if (!page) {
            return;
        }

        const browser = Util.autotestConf.browser;
        if (!browser || !browser.buildFile) {
            return;
        }
        const hasComponent = await page.evaluate(function(componentName) {
            if (window[componentName]) {
                return true;
            }
            return false;
        }, browser.componentName);
        if (hasComponent) {
            return;
        }
        await page.addScriptTag({
            path: browser.buildFile
        });

    },

    initPCR: async (resolverOption, browserType) => {
        let pcr = {};
        Util.logRed("browserType=======" + browserType);
        if (browserType.toLowerCase() === "chrome") {
            if (CommonFunction.pcr) {
                return CommonFunction.pcr;
            }
            const time_start = Date.now();
            Util.logMsg("[puppeteer]", "init ...");
            pcr = await PCR(resolverOption);
            CommonFunction.pcr = pcr;
        }
        return pcr;
    },

    launchBrowser: (browserOption, resolverOption, browserType) => {
        return new Promise((resolve) => {
            let resolved = false;
            const timeout = 60 * 1000;
            const timeid = setTimeout(() => {;
                resolved = true;
                resolve();
            }, timeout);

            CommonFunction.initPCR(resolverOption, browserType).then((pcr) => {
                if (!pcr) {
                    clearTimeout(timeid);
                    resolve();
                    return;
                }
                CommonFunction.initBrowser(pcr, browserOption).then((browser) => {
                    if (resolved) {
                        Util.logRed("[browser] already resolved by timeout");
                        return;
                    }
                    clearTimeout(timeid);
                    resolve(browser);
                });
            });
        });

    },

    //============================================================================================
    createPage: async (config, browserOption = {},resolverOption = {}) => {
        //ui test browser
        browserOption.headless = false;
        let browserType = 'chrome'
        let browser = await common.launchBrowser(browserOption, resolverOption, browserType);
        if (!browser) {
            return false;
        }
        const defaultPages = await browser.pages();
        const page = await browser.newPage();
        //for report screenshot when err
        global.page = page;
        global.globalPage = page;

        //remove default pages
        defaultPages.forEach((dp) => {
            dp.close();
        });

        await common.initPageEvents(page, browser, config);
        await Util.delay(500);
        Util.logMsg("[page]", "created success");

        return page;
    },
};

module.exports = common;
