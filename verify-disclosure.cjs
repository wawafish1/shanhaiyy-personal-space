async (page) => {
  await page.reload();
  await page.emulateMedia({reducedMotion:'reduce'});
  const summary = page.locator('.case-detail>summary');
  const details = page.locator('.case-detail');
  const checks = [];
  for (const width of [1440,390]) {
    await page.setViewportSize({width,height:1000});
    if (await details.getAttribute('open') !== null) await summary.click();
    await summary.click();
    if (await details.getAttribute('open') === null) throw new Error('Mouse click did not open');
    await summary.dblclick({position:{x:width===1440?1190:340,y:25}});
    const style = await summary.evaluate(el => ({selected:window.getSelection().toString(),background:getComputedStyle(el).backgroundColor,userSelect:getComputedStyle(el).userSelect,iconText:el.querySelector('.plus').textContent,open:el.parentElement.open}));
    if (style.selected || style.iconText || style.background !== 'rgba(0, 0, 0, 0)' || !style.open) throw new Error(JSON.stringify(style));
    await summary.press('Enter');
    if (await details.getAttribute('open') !== null) throw new Error('Enter did not close');
    await summary.press('Space');
    if (await details.getAttribute('open') === null) throw new Error('Space did not open');
    const focusVisible = await summary.evaluate(el => el.matches(':focus-visible'));
    if (!focusVisible) throw new Error('Keyboard focus indicator missing');
    // Return to mouse interaction before taking the visual review screenshot.
    await summary.click();
    await page.locator('h1').click();
    await summary.click();
    await details.screenshot({path:`C:/Users/87271/Documents/ChatGPT/个人空间/output/playwright/disclosure-fixed-${width}.png`});
    checks.push({width,...style,keyboardFocus:focusVisible});
  }
  return {passed:true,checks};
}
