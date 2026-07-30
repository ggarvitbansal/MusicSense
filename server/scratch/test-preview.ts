async function testUrl(url: string) {
  try {
    const res = await fetch(url, { redirect: "manual" });
    const text = await res.text();
    console.log(`URL: ${url}`);
    console.log(`Status: ${res.status} ${res.statusText}`);
    console.log(`Content-Type: ${res.headers.get("content-type")}`);
    console.log(`Body (first 100 chars): ${text.substring(0, 100).replace(/\n/g, " ")}`);
    console.log("-".repeat(50));
  } catch (err: any) {
    console.error(`Failed to fetch ${url}:`, err.message);
  }
}

async function run() {
  const urls = [
    "http://localhost:4173/",
    "http://localhost:4173/dashboard",
    "http://localhost:4173/dashboard/analysis",
    "http://localhost:4173/dashboard/upload"
  ];
  for (const url of urls) {
    await testUrl(url);
  }
}

run();
