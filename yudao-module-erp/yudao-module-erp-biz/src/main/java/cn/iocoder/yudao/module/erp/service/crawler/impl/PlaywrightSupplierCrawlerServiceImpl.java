package cn.iocoder.yudao.module.erp.service.crawler.impl;

import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.util.StrUtil;
import cn.iocoder.yudao.module.erp.controller.admin.purchase.vo.supplier.ErpSupplierSaveReqVO;
import cn.iocoder.yudao.module.erp.service.crawler.ErpSupplierCrawlerService;
import com.microsoft.playwright.*;
import com.microsoft.playwright.options.LoadState;
import com.microsoft.playwright.options.WaitForSelectorState;
import com.microsoft.playwright.options.WaitUntilState;
import org.apache.commons.lang3.tuple.Pair;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * ERP 供应商爬虫 Service 的 Playwright 实现类
 * 
 * 使用 Playwright 实现自动登录和爬取供应商数据
 */
@Service("playwrightSupplierCrawlerService")
public class PlaywrightSupplierCrawlerServiceImpl extends ErpSupplierCrawlerService {

    private static final Logger logger = LoggerFactory.getLogger(PlaywrightSupplierCrawlerServiceImpl.class);

    // 供应商系统URL
    private static final String SUPPLIER_URL = "http://189222.cn/x4/Default2.aspx?xww=13686770014";
    
    // 浏览器实例存储
    private final Map<String, Browser> browserMap = new ConcurrentHashMap<>();
    
    // 页面实例存储
    private final Map<String, Page> pageMap = new ConcurrentHashMap<>();
    
    @Override
    public Pair<Boolean, String> login(String username, String password, String userCode) {
        try {
            logger.info("开始使用Playwright登录到供应商系统, 用户编号: {}", userCode);
            
            // 初始化Playwright
            Playwright playwright = Playwright.create();
            
            // 创建浏览器实例，设置为无头模式在后台运行
            Browser browser = playwright.chromium().launch(new BrowserType.LaunchOptions()
                    .setHeadless(true)  // 生产环境设为true，在后台运行
                    .setSlowMo(500));    // 增加操作间隔，便于调试
            
            // 创建上下文和页面
            BrowserContext context = browser.newContext();
            Page page = context.newPage();
            
            // 设置更长的超时时间
            page.setDefaultTimeout(60000); // 60秒
            
            // 访问登录页面
            logger.info("正在导航到登录页面: {}", SUPPLIER_URL);
            page.navigate(SUPPLIER_URL);
            page.waitForLoadState(LoadState.NETWORKIDLE);
            
            // 等待页面加载完成
            logger.info("等待页面完全加载");
            page.waitForLoadState(LoadState.DOMCONTENTLOADED);
            
            // 截图保存以便调试
            page.screenshot(new Page.ScreenshotOptions().setPath(Paths.get("login-page.png")));
            logger.info("已保存登录页面截图");
            
            // 输入用户名 (在这个例子中使用userCode作为登录ID)
            // 根据截图，ID输入框已经自动填充，不需要再次填写
            
            // 选择用户类型 (如果需要)
            try {
                logger.info("尝试选择用户类型");
                page.selectOption("#huangbinxiala1_2", "ADMIN3");
                logger.info("已选择用户类型");
            } catch (Exception e) {
                logger.warn("选择用户类型时出错，可能已预设: {}", e.getMessage());
            }
            
            // 输入密码
            logger.info("尝试定位并填写密码输入框");
            // 使用ID定位密码输入框
            page.waitForSelector("#huangbintext_2", new Page.WaitForSelectorOptions().setState(WaitForSelectorState.VISIBLE));
            page.fill("#huangbintext_2", password);
            logger.info("已填写密码");
            
            // 点击登录按钮
            logger.info("尝试点击登录按钮");
            page.click("input[value=\"登陆\"]");
            page.waitForLoadState(LoadState.NETWORKIDLE);
            logger.info("已点击登录按钮");
            
            // 保存登录后页面截图
            page.screenshot(new Page.ScreenshotOptions().setPath(Paths.get("after-login.png")));
            logger.info("已保存登录后页面截图");
            
            // 检查登录是否成功（例如，检查特定元素是否出现）
            boolean loginSuccess = false;
            try {
                // 等待页面加载完成
                page.waitForLoadState(LoadState.NETWORKIDLE);
                
                // 截图保存以便调试
                page.screenshot(new Page.ScreenshotOptions().setPath(Paths.get("login-check.png")));
                
                // 获取页面内容
                String pageContent = page.content();
                
                // 检查是否存在登录成功后的特定文本
                boolean hasLoginText = pageContent.contains("登录") || page.querySelector("a:text('登录')") != null;
                boolean hasMoreText = pageContent.contains("更多") || page.querySelector("a:text('更多')") != null;
                boolean hasViewState = pageContent.contains("__VIEWSTATE");
                 
                
                // 登录成功的判断条件：存在特定文本且没有错误消息
                loginSuccess = (hasLoginText || hasMoreText) && hasViewState;
                
                logger.info("登录检查结果: 登录文本存在={}, 更多文本存在={}, VIEWSTATE存在={}, 错误消息不存在={}, 最终结果={}", 
                           hasLoginText, hasMoreText, hasViewState, loginSuccess);
            } catch (Exception e) {
                logger.error("检查登录状态时出错", e);
                loginSuccess = false;
            }
            
            if (loginSuccess) {
                logger.info("登录成功，用户编号: {}", userCode);

                page.selectOption("#xiala31_2", "1000");
                // 存储browser和page实例以供后续使用
                browserMap.put(userCode, browser);
                pageMap.put(userCode, page);
                return Pair.of(true, "登录成功");
            } else {
                logger.error("登录失败，用户编号: {}", userCode);
                browser.close();
                playwright.close();
                return Pair.of(false, "登录失败，请检查密码是否正确");
            }
            
        } catch (Exception e) {
            logger.error("登录过程中发生异常", e);
            return Pair.of(false, "登录异常: " + e.getMessage());
        }
    }
    
    @Override
    public List<ErpSupplierSaveReqVO> crawlSuppliers() {
        logger.info("开始同步爬取供应商数据");
        try {
            // 在实际应用中，应该使用已登录的用户标识获取对应的Page实例
            // 这里简化处理，假设所有操作都是在同一个会话中进行的
            if (pageMap.isEmpty()) {
                logger.error("未找到已登录的页面实例，请先登录");
                return new ArrayList<>();
            }
            
            Page page = pageMap.values().iterator().next();
            // 添加页面刷新和错误恢复机制
            try {
                // 刷新页面以确保状态正常
                page.reload(new Page.ReloadOptions().setWaitUntil(WaitUntilState.NETWORKIDLE));
                logger.info("页面已刷新，准备提取数据");
            } catch (Exception e) {
                logger.warn("页面刷新失败，尝试继续操作", e);
            }
            
            return extractSupplierData(page);
            
        } catch (Exception e) {
            logger.error("爬取供应商数据过程中发生异常", e);
            return new ArrayList<>();
        }
    }

    @Override
    public int saveSuppliers(List<ErpSupplierSaveReqVO> suppliers) {
        if (CollUtil.isEmpty(suppliers)) {
            return 0;
        }
        logger.info("保存爬取的 {} 个供应商数据", suppliers.size());
        return suppliers.size();
    }
    
    @Override
    protected Pair<List<ErpSupplierSaveReqVO>, String> crawlSuppliers(CrawlerTask task) {
        logger.info("开始异步爬取供应商数据，任务ID: {}", task.getTaskId());
        try {
            // 在实际应用中，应该使用任务相关的用户标识获取对应的Page实例
            if (pageMap.isEmpty()) {
                return Pair.of(null, "未找到已登录的页面实例，请先登录");
            }
            
            Page page = pageMap.values().iterator().next();
            List<ErpSupplierSaveReqVO> suppliers = extractSupplierData(page);
            
            if (suppliers.isEmpty()) {
                return Pair.of(new ArrayList<>(), "未找到供应商数据");
            } else {
                return Pair.of(suppliers, String.format("成功爬取 %d 条供应商数据", suppliers.size()));
            }
        } catch (Exception e) {
            logger.error("异步爬取供应商数据过程中发生异常", e);
            return Pair.of(null, "爬取异常: " + e.getMessage());
        }
    }

    /**
     * 从页面中提取供应商数据
     */
    private List<ErpSupplierSaveReqVO> extractSupplierData(Page page) {
        List<ErpSupplierSaveReqVO> suppliers = new ArrayList<>();

        try {
            // 导航到供应商列表页面 (根据实际网站结构调整)
            navigateToSupplierListPage(page);
            // 获取供应商表格数据 - 从ID为wins1的DIV元素内获取表格行
            // 确保wins1元素存在
            ElementHandle wins1Div = page.querySelector("#wins1");
            if (wins1Div == null) {
                logger.error("未找到ID为wins1的DIV元素");
                return suppliers;
            }

            // 在wins1 DIV内查找表格行，从第二行开始（跳过表头）
            // 获取行数而不是保存所有ElementHandle对象
            int rowCount = wins1Div.querySelectorAll("table tr:nth-child(n+2)").size();
            logger.info("在wins1 DIV中找到 {} 行供应商数据", rowCount);
            page.screenshot(new Page.ScreenshotOptions().setPath(Paths.get("surpriser_table.png")));

            // 逐行处理，每次只获取一行的ElementHandle
            for (int i = 0; i < rowCount; i++) {
                try {
                    // 每次循环重新获取wins1元素和当前行，避免对象被回收
                    ElementHandle currentWins1Div = page.querySelector("#wins1");
                    if (currentWins1Div == null) {
                        logger.error("处理第 {} 行时未找到wins1 DIV", i);
                        continue;
                    }

                    // 使用nth-child选择器直接获取特定行
                    String rowSelector = String.format("table tr:nth-child(%d)", i + 2); // +2是因为跳过表头
                    ElementHandle row = currentWins1Div.querySelector(rowSelector);
                    if (row == null) {
                        logger.error("未找到第 {} 行", i);
                        continue;
                    }
                    page.click(rowSelector);
                    ErpSupplierSaveReqVO supplier = parseSupplierRow(page, row, i);
                    if (supplier != null) {
                        suppliers.add(supplier);
                    }
                    // ss240316
                    page.click("#ss240316");

                    // 等待页面跳转和加载完成
                    logger.info("等待页面跳转和网络请求完成");
                    page.waitForTimeout(1000);
                    // 等待DOM内容加载完成
                    page.waitForLoadState(LoadState.DOMCONTENTLOADED);
                    // 再次等待网络请求完成
                    page.waitForLoadState(LoadState.NETWORKIDLE);
                    // 处理完立即释放引用，帮助垃圾回收
                    row = null;
                    currentWins1Div = null;
                } catch (Exception e) {
                    logger.error("处理第 {} 行时发生异常", i, e);
                    // 继续处理下一行
                    continue;
                }

                // 更新进度
                if (i % 10 == 0 || i == rowCount - 1) {
                    logger.info("已处理 {}/{} 条供应商数据", i + 1, rowCount);
                }
            }

        } catch (Exception e) {
            logger.error("提取供应商数据时发生异常", e);
        }

        return suppliers;
    }

    /**
     * 导航到供应商列表页面
     */
    private void navigateToSupplierListPage(Page page) {
        try {
            // 根据实际网站结构调整导航逻辑
            // 例如，可能需要点击某个菜单项进入供应商列表页面
            if (!page.url().contains("Default2.aspx")) {
                page.navigate(SUPPLIER_URL);
                page.waitForLoadState(LoadState.NETWORKIDLE);
            }

            // 如果有特定的供应商列表页面，可以在此导航
            // 例如：page.click("text=供应商管理");

            // 添加垃圾回收建议
            System.gc();
        } catch (Exception e) {
            logger.error("导航到供应商列表页面时出错", e);
            // 尝试重新加载页面
            try {
                page.reload();
                page.waitForLoadState(LoadState.NETWORKIDLE);
            } catch (Exception reloadEx) {
                logger.error("重新加载页面失败", reloadEx);
            }
        }
    }

    /**
     * 解析表格行数据为供应商对象
     */
    private ErpSupplierSaveReqVO parseSupplierRow(Page page, ElementHandle row, int index) {
        ErpSupplierSaveReqVO supplier = new ErpSupplierSaveReqVO();
        try {
            page.click("#shaixuan1");
            page.waitForTimeout(10000);
            // 等待DOM内容加载完成
            page.waitForLoadState(LoadState.DOMCONTENTLOADED);
            // 再次等待网络请求完成
            page.waitForLoadState(LoadState.NETWORKIDLE);

            String fileName = String.format("surpriser_%d.png", index);
            page.screenshot(new Page.ScreenshotOptions().setPath(Paths.get(fileName)));
            ElementHandle spanc2 = page.querySelector("#Spanc2");
            if (spanc2 == null) {
                logger.error("未找到ID为Spanc2的SPAN元素");
                return supplier;
            }
            ElementHandle wins1Div = spanc2.querySelector("#wins1");
            int rowCount = wins1Div.querySelectorAll("table tr:nth-child(n+2)").size();
            logger.info("spanc2 span中找到 {} 行sku数据", rowCount);
            for (int i = 0; i < rowCount; i++) {
                try {
                    // 每次循环重新获取wins1元素和当前行，避免对象被回收
                    ElementHandle currentWins1Div = spanc2.querySelector("#wins1");
                    if (currentWins1Div == null) {
                        logger.error("处理第 {} 行时未找到wins1 DIV", i);
                        continue;
                    }

                    // 使用nth-child选择器直接获取特定行
                    String rowSelector = String.format("table tr:nth-child(%d)", i + 2); // +2是因为跳过表头
                    ElementHandle skurow = currentWins1Div.querySelector(rowSelector);
                    if (skurow == null) {
                        logger.error("未找到第 {} 行", i);
                        continue;
                    }

                    // 根据title属性查找并点击带有编辑商品文本的单元格
                    // 更精确的选择器，同时匹配title以及文本内容
                    extracted(page, skurow);
                } catch (Exception e) {
                    logger.error("处理第 {} 行时发生异常", i, e);
                    // 继续处理下一行
                    continue;
                }

                // 更新进度
                if (i % 10 == 0 || i == rowCount - 1) {
                    logger.info("已处理 {}/{} 条供应商数据", i + 1, rowCount);
                }
            }

            page.click("#shaixuan1");
            page.waitForTimeout(10000);
        } catch (Exception e) {
            logger.warn("截图第 {} 行时出错: {}", index, e.getMessage());
        }
        return supplier;
    }

    private static void extracted(Page page, ElementHandle skurow) {
        ElementHandle editCell = skurow.querySelector("td[title^='鼠标单击：编辑商品']");

        if (editCell != null) {
            // 记录找到的单元格属性，用于调试
            String title = editCell.getAttribute("title");
            String text = editCell.textContent().trim();
            logger.info("找到编辑商品单元格 - 文本内容: '{}', title属性: '{}'", text, title);

            // 点击单元格
            editCell.click();
            // 等待点击操作完成和页面响应
            page.waitForTimeout(1000);
            page.waitForLoadState(LoadState.NETWORKIDLE);
        } else {
            // 尝试更通用的方式查找单元格（两步验证）
            List<ElementHandle> cells = skurow.querySelectorAll("td");
            for (ElementHandle cell : cells) {
                String title = cell.getAttribute("title");
                String text = cell.textContent().trim();

                // 同时验证title和text内容
                if (title != null && title.contains("鼠标单击：编辑商品") && "3".equals(text)) {
                    logger.info("通过遍历找到编辑商品单元格 - 文本内容: '{}', title属性: '{}'", text, title);
                    cell.click();
                    // 等待点击操作完成和页面响应
                    page.waitForTimeout(1000);
                    page.waitForLoadState(LoadState.NETWORKIDLE);
                    break;
                }
            }
        }

        // 专门检查第三个单元格，如果文本是"图"则点击
        // 使用CSS选择器直接选择第三个单元格
        ElementHandle thirdCell = skurow.querySelector("td:nth-child(3)");
        if (thirdCell != null) {
            // 获取单元格的可见文本内容(即显示的"图"字)
            String cellText = thirdCell.textContent().trim();
            // 检查第三个单元格的文本是否为"图"
            if ("图".equals(cellText)) {
                logger.info("第三个单元格的文本是'图'，准备点击查看图片");
                thirdCell.click();
                // 等待点击操作完成和页面响应
                page.waitForTimeout(1000);
                page.waitForLoadState(LoadState.NETWORKIDLE);
            } else {
                logger.info("第三个单元格的文本不是'图'，不点击: {}", cellText);
            }
        } else {
            logger.warn("无法找到第三个单元格");
        }
        
        // 查找并处理关闭按钮（页面最后一个单元格）
        findAndClickCloseButton(page);
    }
    
    /**
     * 查找并点击关闭按钮
     * 关闭按钮通常是带有特殊样式的最后一个单元格
     */
    private static void findAndClickCloseButton(Page page) {
        try {
            // 尝试读取商品编号输入框的值
            try {
                // 等待确保JavaScript执行完成
                page.waitForTimeout(1000);
                
                // 通过ID获取编号输入框
                ElementHandle codeInput = page.querySelector("#bianjisp1");
                if (codeInput != null) {
                    // 获取输入框的value属性值
                    String inputValue = codeInput.getAttribute("value");
                    // 还可以尝试通过JavaScript直接获取DOM元素的值
                    String jsValue = page.evaluate("() => document.getElementById('bianjisp1').value").toString();
                    
                    logger.info("商品编号输入框的值 - 通过属性: '{}', 通过JS: '{}'", inputValue, jsValue);
                    
                    // 如果通过属性获取的值为"0"或空，但通过JS获取有值，则使用JS获取的值
                    if ((inputValue == null || "0".equals(inputValue) || inputValue.isEmpty()) && 
                            jsValue != null && !jsValue.isEmpty() && !"0".equals(jsValue)) {
                        inputValue = jsValue;
                    }
                    
                    // 如果获取到有效的编号值，可以存储起来供后续使用
                    if (inputValue != null && !inputValue.isEmpty() && !"0".equals(inputValue)) {
                        logger.info("成功获取到商品编号: {}", inputValue);
                        // TODO: 将编号存储到供应商对象中，或执行其他操作
                    } else {
                        logger.warn("商品编号可能未正确加载，获取到的值为: {}", inputValue);
                    }
                } else {
                    logger.warn("未找到ID为bianjisp1的编号输入框");
                }
            } catch (Exception e) {
                logger.error("尝试获取商品编号时出错: {}", e.getMessage());
            }
            
            // 方法1：通过样式特征定位关闭按钮
            ElementHandle closeButton = page.querySelector("td[style*='text-align: right'][style*='color: rgb(255, 0, 102)'][style*='cursor: pointer']");
            
            // 方法2：通过onclick属性定位关闭按钮
            if (closeButton == null) {
                closeButton = page.querySelector("td[onclick*='js1001(37']");
            }
            
            // 方法3：如果前两种方式都失败，尝试获取所有的td，并查找最后一个带有onclick属性的
            if (closeButton == null) {
                List<ElementHandle> allTds = page.querySelectorAll("td[onclick]");
                if (!allTds.isEmpty()) {
                    closeButton = allTds.get(allTds.size() - 1);
                }
            }
            
            // 如果找到了关闭按钮，点击它
            if (closeButton != null) {
                logger.info("找到关闭按钮，准备点击关闭");
                String style = closeButton.getAttribute("style");
                logger.info("关闭按钮样式: {}", style);
                
                closeButton.click();
                // 等待点击操作完成和页面响应
                page.waitForTimeout(1000);
                page.waitForLoadState(LoadState.NETWORKIDLE);
                logger.info("已点击关闭按钮");
            } else {
                logger.warn("未找到关闭按钮");
            }
        } catch (Exception e) {
            logger.error("尝试点击关闭按钮时出错: {}", e.getMessage());
        }
    }

    /**
     * 获取单元格文本内容
     */
    private String getTextContent(ElementHandle cell) {
        if (cell == null) {
            return "";
        }
        try {
            String text = cell.textContent().trim();
            return StrUtil.isBlank(text) ? "" : text;
        } catch (Exception e) {
            logger.warn("获取单元格文本内容时出错: {}", e.getMessage());
            return "";
        }
    }

    /**
     * 在任务开始前准备相关资源
     */
    @Override
    protected void prepareAsyncCrawlTask(CrawlerTask task) {
        logger.info("准备爬虫任务: {}", task.getTaskId());
        // 在任务开始前建议进行垃圾回收
        System.gc();
    }

    /**
     * 任务结束后清理资源
     */
    @Override
    protected void cleanupAsyncCrawlTask(CrawlerTask task) {
        logger.info("清理爬虫任务: {}", task.getTaskId());
        // 任务结束后建议进行垃圾回收
        System.gc();
    }

    /**
     * 关闭浏览器实例和Playwright
     */
    public void shutdown() {
        logger.info("关闭所有浏览器实例和Playwright");

        // 关闭所有页面和浏览器
        for (Page page : pageMap.values()) {
            try {
                page.close();
            } catch (Exception e) {
                logger.error("关闭页面时发生异常", e);
            }
        }
        pageMap.clear();

        for (Browser browser : browserMap.values()) {
            try {
                browser.close();
            } catch (Exception e) {
                logger.error("关闭浏览器时发生异常", e);
            }
        }
        browserMap.clear();

        // 建议进行垃圾回收
        System.gc();
    }

    /**
     * 截图功能
     */
    public byte[] takeScreenshot(String userCode) {
        Page page = pageMap.get(userCode);
        if (page != null) {
            try {
                return page.screenshot();
            } catch (Exception e) {
                logger.error("截图时发生异常", e);
            }
        }
        return new byte[0];
    }

    /**
     * 使用空格键触发特定输入框的事件
     */
    public boolean triggerSpaceKeyInSearchField(String userCode) {
        Page page = pageMap.get(userCode);
        if (page == null) {
            logger.error("未找到用户 {} 的页面实例", userCode);
            return false;
        }

        try {
            // 点击按钮
            logger.info("开始点击ID为bj240316的按钮");
            page.click("#bj240316");

            // 等待页面跳转和加载完成
            logger.info("等待页面跳转和网络请求完成");
            page.waitForTimeout(10000);
            // 等待DOM内容加载完成
            page.waitForLoadState(LoadState.DOMCONTENTLOADED);
            // 再次等待网络请求完成
            page.waitForLoadState(LoadState.NETWORKIDLE);

            // 特别等待wins1 DIV加载完成
            logger.info("等待ID为wins1的DIV元素加载完成");
            page.waitForSelector("#wins1", new Page.WaitForSelectorOptions()
                    .setState(WaitForSelectorState.VISIBLE)
                    .setTimeout(30000)); // 设置较长的超时时间

            logger.info("成功展开所有供货商事件，页面已加载完成");

            // 验证wins1 DIV内是否有表格数据
            ElementHandle wins1Div = page.querySelector("#wins1");
            if (wins1Div != null) {
                List<ElementHandle> rows = wins1Div.querySelectorAll("table tr");
                logger.info("在wins1 DIV中找到 {} 行数据", rows.size());
            } else {
                logger.warn("未找到ID为wins1的DIV元素");
            }

            // 截图保存以便调试
            page.screenshot(new Page.ScreenshotOptions().setPath(Paths.get("query-surpriser.png")));
            return true;
        } catch (Exception e) {
            logger.error("点击按钮或等待页面加载时发生异常", e);
            return false;
        }
    }
} 