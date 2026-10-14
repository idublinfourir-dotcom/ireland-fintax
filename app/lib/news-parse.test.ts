/* Unit tests for reading the news sources. The fixtures are trimmed copies of
   the real pages' structure (Oct 2026); if a source changes its markup, update
   the fixture and the source's settings together.
   Run: node --test app/lib/news-parse.test.ts */

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  canonicalUrl,
  decodeEntities,
  extractArticleText,
  followableLinks,
  htmlToText,
  parseDate,
  parseFeed,
  parseListPage,
  parseSource,
  robotsAllows,
  sliceArticle,
  urlHash,
} from "./news-parse.ts";
import { getNewsSource, type NewsSource } from "./news-sources.ts";

const ebrief = getNewsSource("revenue-ebrief")!;
const ecb = getNewsSource("ecb-press")!;

test("entities decode, including fadas and numeric forms", () => {
  assert.equal(decodeEntities("T&aacute;naiste &amp; &euro;5 &#8364;6 &#x20AC;7 &rsquo;"), "Tánaiste & €5 €6 €7 '");
  assert.equal(decodeEntities("&unknown; stays"), "&unknown; stays");
});

test("htmlToText keeps structure and drops page chrome", () => {
  const html = `<nav><a href="/">Home</a></nav><script>alert(1)</script>
    <h1>
      Revenue eBrief No. 148/26
    </h1><p>The manual has been <b>updated</b>.</p>
    <ul><li>One</li><li>Two</li></ul>
    <table><tr><th>Band</th><th>Rate</th></tr><tr><td>Single</td><td>20%</td></tr></table>
    <footer>Footer text</footer>`;
  const text = htmlToText(html);
  assert.match(text, /^## Revenue eBrief No\. 148\/26$/m);
  assert.match(text, /^The manual has been updated\.$/m);
  assert.match(text, /^- One$/m);
  assert.match(text, /Band \| Rate \|/);
  assert.doesNotMatch(text, /alert|Home|Footer/);
});

test("a Revenue page is cut from the h1 to the bottom links, with no half tag left", () => {
  const page = `<div class="breadcrumb"><a href="/en/home.aspx">Home</a></div>
    <div class="content row"><div class="large-7 columns"><h1> Revenue eBrief No. 148/26 </h1>
    <h3>09 October 2026</h3><h3>VAT Treatment of Medical Services</h3>
    The VAT Tax and Duty Manual on <a class="pdf" href="/en/tdm/services-medical.pdf">Medical Services</a> has been updated.
    <div class="bottom-links row"><p><em>Published: 09 October 2026</em></p></div></div></div>`;
  const sliced = sliceArticle(page, ebrief.extract);
  assert.doesNotMatch(sliced, /breadcrumb|bottom-links|<div\s*$/);
  const text = extractArticleText(page, ebrief.extract);
  assert.match(text, /^## Revenue eBrief No\. 148\/26$/m);
  assert.match(text, /has been updated\./);
  assert.doesNotMatch(text, /Published:/);
});

test("Revenue's list gives each item the date heading above it", () => {
  const html = `<h3>09 October 2026</h3>
    <a href="/en/tax-professionals/ebrief/2026/no-1482026.aspx">VAT Treatment of Medical Services</a>
    <a href="/en/tax-professionals/ebrief/2026/no-1472026.aspx">FATCA guidance</a>
    <a href="/en/home.aspx">Home</a>
    <h3>07 October 2026</h3>
    <a href="/en/tax-professionals/ebrief/2026/no-1442026.aspx">End-of-lease &amp; VAT</a>
    <a href="/en/tax-professionals/ebrief/2026/no-1442026.aspx">End-of-lease &amp; VAT</a>`;
  const items = parseListPage(html, ebrief);
  assert.deepEqual(
    items.map((i) => [i.title, i.publishedAt?.toISOString().slice(0, 10), i.url]),
    [
      ["VAT Treatment of Medical Services", "2026-10-09", "https://www.revenue.ie/en/tax-professionals/ebrief/2026/no-1482026.aspx"],
      ["FATCA guidance", "2026-10-09", "https://www.revenue.ie/en/tax-professionals/ebrief/2026/no-1472026.aspx"],
      ["End-of-lease & VAT", "2026-10-07", "https://www.revenue.ie/en/tax-professionals/ebrief/2026/no-1442026.aspx"],
    ],
  );
});

test("a list that prints the date after each title is read the other way round", () => {
  const source: NewsSource = { ...ebrief, linkPattern: /^\/news\//, dateMode: "following", url: "https://example.ie/" };
  const html = `<a href="/news/a">First</a> 12 October 2026; Department
    <a href="/news/b">Second</a> 11 October 2026; Department`;
  const items = parseListPage(html, source);
  assert.deepEqual(
    items.map((i) => [i.title, i.publishedAt?.toISOString().slice(0, 10)]),
    [
      ["First", "2026-10-12"],
      ["Second", "2026-10-11"],
    ],
  );
});

test("RSS: CDATA, escaped content, the Central Bank's trailing Z date", () => {
  const xml = `<rss><channel><item>
    <link>https://www.centralbank.ie/news/article/levy?utm_source=rss</link>
    <title><![CDATA[Insurance Compensation Fund Levy set to 0%]]></title>
    <description>Levy &amp;amp; fund</description>
    <pubDate>Tue, 29 Sep 2026 10:00:00 Z</pubDate>
    <a10:content type="text">&lt;p&gt;The levy is &lt;b&gt;0%&lt;/b&gt;.&lt;/p&gt;</a10:content>
  </item><item><title>No link</title></item></channel></rss>`;
  const [item, ...rest] = parseFeed(xml);
  assert.equal(rest.length, 0, "an item without a link is dropped");
  assert.equal(item.title, "Insurance Compensation Fund Levy set to 0%");
  assert.equal(item.url, "https://www.centralbank.ie/news/article/levy");
  assert.equal(item.publishedAt?.toISOString(), "2026-09-29T10:00:00.000Z");
  assert.equal(item.contentHtml, "<p>The levy is <b>0%</b>.</p>");
  assert.equal(htmlToText(item.contentHtml!), "The levy is 0%.");
});

test("Atom entries and their alternate link", () => {
  const xml = `<feed><entry><title>Rate decision</title>
    <link rel="self" href="https://x.ie/self"/><link rel="alternate" href="https://x.ie/post"/>
    <updated>2026-10-01T09:00:00Z</updated><summary>Short</summary></entry></feed>`;
  const [item] = parseFeed(xml);
  assert.equal(item.url, "https://x.ie/post");
  assert.equal(item.summary, "Short");
});

test("the ECB feed keeps press releases only, with its doubled slash fixed", () => {
  const xml = `<rss><channel>
    <item><title> Results of the survey</title><link>https://www.ecb.europa.eu//press/pr/date/2026/html/ecb.pr261007.en.html</link><pubDate>Wed, 07 Oct 2026 10:00:00 +0200</pubDate></item>
    <item><title>Interview</title><link>https://www.ecb.europa.eu//press/inter/date/2026/html/ecb.in261008.en.html</link></item>
  </channel></rss>`;
  const items = parseSource(xml, ecb);
  assert.equal(items.length, 1);
  assert.equal(items[0].url, "https://www.ecb.europa.eu/press/pr/date/2026/html/ecb.pr261007.en.html");
  assert.equal(items[0].title, "Results of the survey");
});

test("URLs: one spelling, one hash", () => {
  assert.equal(canonicalUrl("https://WWW.Revenue.ie//en/a.aspx?utm_source=x&id=2#top"), "https://www.revenue.ie/en/a.aspx?id=2");
  assert.equal(urlHash("https://www.revenue.ie/en/a.aspx?utm_medium=rss"), urlHash("https://www.revenue.ie/en/a.aspx"));
  assert.match(urlHash("https://x.ie/"), /^[0-9a-f]{64}$/);
});

test("dates in every format the sources use", () => {
  assert.equal(parseDate("09 October 2026")?.toISOString(), "2026-10-09T00:00:00.000Z");
  assert.equal(parseDate("Thu, 08 Oct 2026 13:30:00 +0200")?.toISOString(), "2026-10-08T11:30:00.000Z");
  assert.equal(parseDate("2026-10-01T09:00:00Z")?.toISOString(), "2026-10-01T09:00:00.000Z");
  assert.equal(parseDate("someday"), null);
  assert.equal(parseDate(""), null);
});

test("followable links: same site, no documents, not the page itself", () => {
  const html = `<a href="/en/tdm/vat.pdf">PDF</a><a href="/en/guide.aspx">Guide</a>
    <a href="https://other.ie/x">Other</a><a href="/en/brief.aspx">Self</a><a href="/en/guide.aspx">Again</a>
    <a href="/en/more.aspx">More</a><a href="/en/third.aspx">Third</a>`;
  assert.deepEqual(followableLinks(html, "https://www.revenue.ie/en/brief.aspx", 2), [
    "https://www.revenue.ie/en/guide.aspx",
    "https://www.revenue.ie/en/more.aspx",
  ]);
});

test("robots.txt: our group over *, longest rule wins, Allow wins a tie", () => {
  const robots = `User-agent: ClaudeBot
Disallow: /

User-agent: *
Disallow: /documents/
Disallow: /*/search/
Allow: /documents/public$

User-agent: IrishFintaxNewsBot
User-agent: OtherBot
Disallow: /private/
`;
  const bot = "IrishFintaxNewsBot";
  assert.equal(robotsAllows(robots, "/en/news/", bot), true);
  assert.equal(robotsAllows(robots, "/private/x", bot), false);
  // Our own group replaces "*" entirely.
  assert.equal(robotsAllows(robots, "/documents/a.pdf", bot), true);
  assert.equal(robotsAllows(robots, "/documents/a.pdf", "SomeBot"), false);
  assert.equal(robotsAllows(robots, "/en/search/q", "SomeBot"), false);
  assert.equal(robotsAllows(robots, "/documents/public", "SomeBot"), true);
  assert.equal(robotsAllows(robots, "/documents/public/x", "SomeBot"), false);
  assert.equal(robotsAllows("", "/anything", bot), true);
  assert.equal(robotsAllows("User-agent: *\nDisallow:", "/x", bot), true);
});
