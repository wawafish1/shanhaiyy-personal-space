async (page) => {
  const output = 'C:/Users/87271/Documents/ChatGPT/个人空间/output/playwright';
  const issues = [];
  page.on('pageerror', error => issues.push(error.message));
  await page.reload();
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('img').evaluateAll(images => images.forEach(image => image.loading = 'eager'));
  await page.evaluate(() => Promise.all(Array.from(document.images, image => image.decode().catch(() => {}))));
  const report = [];
  for (const width of [1440, 768, 390, 360]) {
    await page.setViewportSize({width, height:width > 800 ? 1000 : 844});
    await page.evaluate(() => window.scrollTo(0,0));
    const bounds = await page.evaluate(() => ({viewport:innerWidth, content:document.documentElement.scrollWidth, height:document.documentElement.scrollHeight, brokenImages:[...document.images].filter(image => !image.complete || !image.naturalWidth).map(image=>image.getAttribute('src'))}));
    if (bounds.content > width) throw new Error(`Horizontal overflow at ${width}: ${bounds.content}`);
    if (bounds.brokenImages.length) throw new Error(`Broken images: ${bounds.brokenImages.join(', ')}`);
    report.push({width,...bounds});
    if (width === 1440 || width === 390) {
      const name = width === 1440 ? 'desktop' : 'mobile';
      await page.screenshot({path:`${output}/${name}-hero.png`, fullPage:false});
      await page.screenshot({path:`${output}/${name}-full.png`, fullPage:true});
    }
  }
  await page.getByRole('button',{name:'打开导航',exact:true}).click();
  if (await page.getByRole('button',{name:'关闭导航',exact:true}).getAttribute('aria-expanded') !== 'true') throw new Error('Menu did not open');
  await page.getByRole('navigation').getByRole('link',{name:'现场经历',exact:true}).click();
  if (await page.getByRole('button',{name:'打开导航',exact:true}).getAttribute('aria-expanded') !== 'false') throw new Error('Menu did not close');
  await page.getByText('展开完整交付过程',{exact:true}).click();
  if (await page.locator('.case-detail').getAttribute('open') === null) throw new Error('Case did not expand');
  await page.getByText('展开完整交付过程',{exact:true}).click();
  await page.getByRole('button',{name:'查看项目与访问入口',exact:true}).click();
  if (!await page.getByRole('dialog',{name:'AI 内容研究与创作工作流',exact:true}).isVisible()) throw new Error('Writing dialog failed');
  await page.getByRole('button',{name:'关闭项目详情',exact:true}).click();
  await page.getByRole('button',{name:'项目详情',exact:true}).click();
  if (!await page.getByRole('dialog',{name:'轻盈计划，记录每一步。',exact:true}).isVisible()) throw new Error('FitAI dialog failed');
  await page.keyboard.press('Escape');
  await page.getByRole('button',{name:/币安广场/}).click();
  if (!await page.getByRole('dialog',{name:'山海yuyy',exact:true}).isVisible()) throw new Error('Account dialog failed');
  await page.screenshot({path:`${output}/account-dialog.png`,fullPage:false});
  await page.getByRole('button',{name:'关闭账号资料',exact:true}).click();
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('link',{name:'下载简历',exact:true}).click();
  const download = await downloadEvent;
  if (await download.failure()) throw new Error('Resume download failed');
  const emails = await page.locator('a[href^="mailto:"]').evaluateAll(links => links.map(link => link.getAttribute('href')));
  if (!emails.every(value => value === 'mailto:xyu024864@gmail.com')) throw new Error('Wrong email link');
  const body = await page.locator('body').innerText();
  for (const removed of ['不等同于商业转化','客户、产品及工艺信息已经隐去','产品判断：','我的工作：','免责声明：']) {
    if (body.includes(removed)) throw new Error(`Removed copy is present: ${removed}`);
  }
  if (issues.length) throw new Error(issues.join('\n'));
  await page.setViewportSize({width:1440,height:1000});
  await page.locator('h1').click();
  await page.locator('#projects').screenshot({path:`${output}/projects-desktop.png`});
  await page.locator('#beyond').screenshot({path:`${output}/beyond-desktop.png`});
  await page.evaluate(() => window.scrollTo(0,0));
  return {passed:true,breakpoints:report,download:download.suggestedFilename(),tested:['responsive overflow','image loads','mobile navigation','case disclosure','writing dialog','FitAI dialog and Escape','account dialog','resume download','email links','copy deletions','page errors']};
}
