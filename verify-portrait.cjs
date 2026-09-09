async (page) => {
  const root = 'C:/Users/87271/Documents/ChatGPT/个人空间/output/playwright';
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('img').evaluateAll(images => images.forEach(image => image.loading = 'eager'));
  await page.evaluate(() => Promise.all([...document.images].map(image => image.decode())));
  const checks = [];
  for (const width of [1440, 390]) {
    await page.setViewportSize({width,height:1000});
    await page.evaluate(() => scrollTo(0,0));
    const name = width === 1440 ? 'desktop' : 'mobile';
    await page.locator('.hero-portrait').screenshot({path:`${root}/portrait-${name}-revised.png`});
    await page.screenshot({path:`${root}/${name}-hero.png`});
    await page.screenshot({path:`${root}/${name}-full.png`,fullPage:true});
    checks.push(await page.locator('.portrait-frame img').evaluate(image => ({viewport:innerWidth,loaded:image.complete&&image.naturalWidth>0,source:image.getAttribute('src'),scale:getComputedStyle(image).transform,horizontalOverflow:document.documentElement.scrollWidth>innerWidth})));
  }
  return checks;
}
