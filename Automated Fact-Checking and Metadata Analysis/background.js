// background.js

chrome.runtime.onInstalled.addListener(() => {
  // Create a context menu item when the user right-clicks an image
  chrome.contextMenus.create({
    id: "factCheckImage",
    title: "Fact-Check / Analyze Image Metadata",
    contexts: ["image"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "factCheckImage") {
    const imageUrl = info.srcUrl;
    console.log("Image selected for analysis:", imageUrl);

    try {
      // Phase 1: Fetch the image data
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error("Failed to fetch image");
      
      // Blob conversion
      const blob = await response.blob();
      
      // Buffer conversion
      const arrayBuffer = await blob.arrayBuffer();

      console.log("Successfully fetched and converted image to ArrayBuffer.");
      console.log("Size:", arrayBuffer.byteLength, "bytes");

      // We will hook in the EXIF parser and OCR in Phase 2 here.

      // Store the URL to show in our dashboard
      chrome.storage.local.set({ lastAnalyzedImage: imageUrl }, () => {
        // Open the dashboard to show results
        chrome.tabs.create({ url: chrome.runtime.getURL("results.html") });
      });

    } catch (error) {
      console.error("Error fetching image data:", error);
    }
  }
});
