const puppeteer = require('puppeteer')
const expect = require('chai').expect
 
let browser, page
const url = 'https://www.baidu.com'
const width = 1600
const height = 900
 
const browserOption = { 
    headless: false, 
    ignoreHTTPSErrors: true,
    slowMo: 100,
    args: [
    `--window-size=${width},${height}`
    ]
} 
const viewport = {
    width: width,
    height: height
}
 
 
describe('百度页面测试', function() {
    before('Before *',async function () {
        this.timeout(5000);
        browser = await puppeteer.launch(browserOption)
        page = await browser.newPage()
        await page.setViewport(viewport)
    })

    after('After *',async function() {
        await browser.close()
    })
 
    it('打开百度首页', async function () {    
        await page.goto(url)    
        logo = await page.waitForSelector('#lg')
        expect(logo).to.exist
    }).timeout(5000)
 
    it('搜索关键字', async function () {
        input = await page.waitForSelector('#kw')
        await input.type('puppeteer')
        btn = await page.waitForSelector('#su')
        await Promise.all([
            btn.click(),
            page.waitForNavigation()  
        ])
        container = await page.waitForSelector('#container')
        expect(container).to.exist
    }).timeout(10000)
 
})