package com.github.bitfexl.notammap.notam.extraction.natsead;

import org.openqa.selenium.*;
import org.openqa.selenium.interactions.Action;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.time.Instant;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Supplier;

public class NATSInteractor {
    private static final DateTimeFormatter natsDateTimeFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final long actionPause = 200;

    private final Duration defaultImplicitWaitDuration = Duration.ofMillis(10_000);

    private final WebDriver driver;

    private final WebDriverWait waitLoading;

    private final WebDriverWait waitMenu;

    public NATSInteractor(WebDriver driver) {
        this.driver = driver;
        this.waitLoading = new WebDriverWait(driver, Duration.ofMinutes(5));
        this.waitMenu = new WebDriverWait(driver, Duration.ofMinutes(1));
    }

    // initialization

    public void init() {
        driver.manage().timeouts().implicitlyWait(defaultImplicitWaitDuration);
        driver.manage().window().setSize(new Dimension(1500, 1000));
        driver.get("https://nats-uk.ead-it.com/");
    }

    public void login(String username, String password) {
        driver.findElement(By.cssSelector("[placeholder=Username]")).sendKeys(username);
        driver.findElement(By.cssSelector("[placeholder=Password]")).sendKeys(password);
        driver.findElement(By.cssSelector("[value=Login]")).click();
    }

    // navigation

    public void selectAreaBriefing() {
        selectBriefing("Area PIB");
    }

    public void selectAerodromeBriefing() {
        selectBriefing("Aerodrome PIB");
    }

    private void selectBriefing(String type) {
        final WebElement briefingMenu = driver.findElement(innerText("span", "Pre-Flight Briefing"));
        final Action openMenu = new Actions(driver).moveToElement(briefingMenu).click().pause(actionPause).build();
        final By selector = innerText("a", type);
        for (int i = 0; i < 5; i++) {
            openMenu.perform();
            for (int j = 0; j < 3; j++) {
                if (driver.findElement(selector).isDisplayed()) {
                    driver.findElement(selector).click();
                    return;
                }
                actionPause();
            }
        }
    }

    // searching for airports/firs on airport/fir page

    public void openAdSearch() {
        openSearch("mainForm:ad:ad_search");
    }

    public void openFirSearch() {
        openSearch("mainForm:fir:fir_search");
    }

    private void openSearch(String id) {
        driver.findElement(By.id(id)).click();
        try {
            Thread.sleep(7_000);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new RuntimeException(ex);
        }
        driver.switchTo().frame(0);
    }

    public void searchByAdName(String name) {
        searchByName("mainForm:findAerodromeSC:aerodromeName", name);
    }

    public void searchByFirName(String name) {
        searchByName("mainForm:firNAme", name);
    }

    private void searchByName(String id, String name) {
        enterInput(By.id(id), name);
        final By pageSelector = By.cssSelector(".ui-paginator-page.ui-state-active");
        waitLoading.until(ExpectedConditions.presenceOfElementLocated(pageSelector));
    }

    public List<AerodromeSearchResult> extractAdSearchData() {
        return extractSearchData(this::aerodromeSearchDataExtractor);
    }

    public List<FIRSearchResult> extractFirSearchData() {
        return extractSearchData(this::firSearchDataExtractor);
    }

    private <T> List<T> extractSearchData(Supplier<List<T>> extractor) {
        final WebElement next = driver.findElement(By.cssSelector(".ui-paginator-next"));
        final By pageSelector = By.cssSelector(".ui-paginator-page.ui-state-active");

        String pageSelectorText = driver.findElement(pageSelector).getText();

        final List<T> extractedData = new ArrayList<>();

        while (true) {
            // extract
            extractedData.addAll(extractor.get());

            // next
            if (!Objects.requireNonNull(next.getAttribute("class")).contains("ui-state-disabled")) {
                next.click();

                String newPageSelectorText;
                do {
                    try {
                        newPageSelectorText = driver.findElement(pageSelector).getText();
                    } catch (StaleElementReferenceException ex) {
                        // try again
                        newPageSelectorText = pageSelectorText;
                    }
                    actionPause();
                } while (pageSelectorText.equals(newPageSelectorText));
                pageSelectorText = newPageSelectorText;
            } else {
                break;
            }
        }

        return extractedData;
    }

    private List<AerodromeSearchResult> aerodromeSearchDataExtractor() {
        final List<AerodromeSearchResult> aerodromeSearchResults = new ArrayList<>();

        final WebElement table = driver.findElement(By.id("mainForm:findAerodromeSC:resultTable_data"));

        for (WebElement row : table.findElements(By.tagName("tr"))) {
            final List<WebElement> tds = row.findElements(By.tagName("td"));
            final String icao = tds.get(0).getText().trim();
            final String iata = tds.get(1).getText().trim();
            final String fir = tds.get(2).getText().trim();
            final String name = tds.get(3).getText().trim();
            final String type = tds.get(4).getText().trim();
            aerodromeSearchResults.add(new AerodromeSearchResult(icao, iata, fir, name, type));
        }

        return aerodromeSearchResults;
    }

    private List<FIRSearchResult> firSearchDataExtractor() {
        final List<FIRSearchResult> firSearchResults = new ArrayList<>();

        final WebElement table = driver.findElement(By.id("mainForm:resultTable_data"));

        for (WebElement row : table.findElements(By.tagName("tr"))) {
            final List<WebElement> tds = row.findElements(By.tagName("td"));
            final String icao = tds.get(0).getText().trim();
            final String name = tds.get(1).getText().trim();
            firSearchResults.add(new FIRSearchResult(icao, name));
        }

        return firSearchResults;
    }

    // settings and query options on airport/fir page

    public void setOptions(Map<String, Boolean> checkboxOptions, String flightRules) {
        driver.findElement(innerText("span", "Briefing Options")).click();

        for (String label : checkboxOptions.keySet()) {
            final WebElement checkbox = driver.findElement(findOptionsCheckbox(label));
            boolean isChecked = Objects.requireNonNull(checkbox.getAttribute("class")).contains("ui-icon-check");
            if (isChecked != checkboxOptions.get(label)) {
                new Actions(driver).moveToElement(checkbox).click().pause(actionPause).perform();
            }
        }

        setSelectInput("Flight Rules *", flightRules);
    }

    public void enterFIR(String fir) {
        enterInput(By.id("mainForm:fir:fir_input"), fir, false);
        waitMenu.until(ExpectedConditions.presenceOfElementLocated(innerText("td", fir)));
    }

    public void enterAD(String ad) {
        enterInput(By.id("mainForm:ad:ad_input"), ad, false);
        waitMenu.until(ExpectedConditions.presenceOfElementLocated(innerText("td", ad)));
    }

    public void setLowerFl(String lowerFl) {
        enterInput(By.id("mainForm:lowerFL"), lowerFl);
    }

    public void setUpperFl(String upperFl) {
        enterInput(By.id("mainForm:upperFL"), upperFl);
    }

    public void setFromDate(ZonedDateTime date) {
        enterInput(By.id("mainForm:startDateSelected_input"), natsDateTimeFormatter.format(date));
    }

    public void setToDate(ZonedDateTime date) {
        enterInput(By.id("mainForm:endDateSelected_input"), natsDateTimeFormatter.format(date));
    }

    // generating briefing/extracting data

    public void generateBriefing() {
        driver.findElement(By.id("mainForm:generate")).click();
        waitLoading.until(ExpectedConditions.presenceOfElementLocated(By.id("mainForm:pibResultTab:pibResult")));
    }

    public List<NATSNotam> extractADBriefingData() {
        final WebElement mainContainer = driver.findElement(By.id("mainForm:pibResultTab:pibResult"));
        final List<WebElement> headings = mainContainer.findElements(By.className("subsection-heading"));
        final List<WebElement> tables = mainContainer.findElements(By.xpath(".//table[not(ancestor::table)]"));

        if (headings.size() != tables.size()) {
            throw new IllegalStateException("Got " + headings.size() + " headings, but only " + tables.size() + " tables on the result page.");
        }

        final List<NATSNotam> notams = new ArrayList<>();

        for (int i = 0; i < headings.size(); i++) {
            final String heading = headings.get(i).getText();

            for (final WebElement notamRecordRow : tables.get(i).findElements(By.xpath("./tbody/tr"))) {
                final List<WebElement> parts = notamRecordRow.findElements(By.xpath("./td"));
                final String notam = parts.get(0).getText();
                if (notam.equals("NIL")) {
                    // no notams for aerodrome
                    continue;
                }
                final String notamId = parts.get(1).getText();
                notams.add(new NATSNotam(NATSNotam.Type.AERODROME, notamId, notam, heading));
            }
        }

        return notams;
    }

    public List<NATSNotam> extractFIRBriefingData() {
        final WebElement mainContainer = driver.findElement(By.id("mainForm:pibResultTab:pibResult"));
        final List<WebElement> tables = mainContainer.findElements(By.xpath(".//table[not(ancestor::table)]"));

        final List<NATSNotam> notams = new ArrayList<>();

        for (WebElement table : tables) {
            for (final WebElement notamRecordRow : table.findElements(By.xpath("./tbody/tr"))) {
                final List<WebElement> parts = notamRecordRow.findElements(By.xpath("./td"));
                final String notam = parts.get(0).getText();
                // TODO: "NIL" check like in ad extraction?
                final String notamId = parts.get(1).getText();
                notams.add(new NATSNotam(NATSNotam.Type.FIR, notamId, notam, null));
            }
        }

        return notams;
    }

    // helper methods

    private By innerText(String tag, String text) {
        return By.xpath("//" + tag + "[normalize-space(.)='" + text + "']");
    }

    private By findOptionsCheckbox(String label) {
        return By.xpath("//*[self::label or self::span][normalize-space(.)='" + label + "']/preceding-sibling::*//span[contains(@class,'ui-chkbox-icon')]");
    }

    private void setSelectInput(String label, String value) {
        driver.findElement(By.xpath("//legend[normalize-space(.)='" + label + "']/following-sibling::div[1]//div[contains(@class,'ui-selectonemenu')]")).click();

        actionPause();

        for (WebElement selectItems : driver.findElements(By.className("ui-selectonemenu-items-wrapper"))) {
            if (selectItems.isDisplayed()) {
                selectItems.findElement(innerText("li", value)).click();
                actionPause();
                return;
            }
        }
    }

    private void enterInput(By inputSelector, String inputText) {
        enterInput(inputSelector, inputText, true);
    }

    private void enterInput(By inputSelector, String inputText, boolean clear) {
        final WebElement input = driver.findElement(inputSelector);

        final Actions action = new Actions(driver)
                .moveToElement(input)
                .click()
                .pause(actionPause);

        // delete possible prefilled value
        if (clear) {
            for (int i = 0; i < 30; i++) {
                action.sendKeys(Keys.BACK_SPACE);
                action.sendKeys(Keys.DELETE);
            }
            action.pause(actionPause);
        }

        action
                .sendKeys(inputText)
                .pause(actionPause)
                .sendKeys(Keys.ENTER)
                .pause(actionPause)
                .perform();
    }

    private void actionPause() {
        try {
            Thread.sleep(actionPause);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
        }
    }
}
