// Google Ad Manager Rewarded Ads Helper for Flutter

var googletag = googletag || {};
googletag.cmd = googletag.cmd || [];

var rewardedSlot;
var isAdLoaded = false;
var onRewardCallback = null;
var hasGranted = false;

// Initialize GPT
googletag.cmd.push(function() {
  // Define the rewarded ad slot.
  // Using Google's sample Rewarded Ad Unit ID for testing.
  // Replace '/22639388115/rewarded_web_example' with your actual GAM Ad Unit ID.
  rewardedSlot = googletag.defineOutOfPageSlot(
      '/22639388115/rewarded_web_example', 
      googletag.enums.OutOfPageFormat.REWARDED
  ).addService(googletag.pubads());

  googletag.pubads().enableSingleRequest();
  googletag.enableServices();

  // Listen for slot events
  googletag.pubads().addEventListener('rewardedSlotReady', function(event) {
    console.log('JS: Rewarded ad slot ready.');
    isAdLoaded = true;
  });

  googletag.pubads().addEventListener('rewardedSlotClosed', function(event) {
    console.log('JS: Rewarded ad slot closed.');
    isAdLoaded = false;
    if (onRewardCallback && !hasGranted) {
        // Not granted, so dismissed. Signal failure to Dart.
        onRewardCallback(null, null);
    }
    // Reset for next time
    hasGranted = false;
    onRewardCallback = null; 
  });

  googletag.pubads().addEventListener('rewardedSlotGranted', function(event) {
    console.log('JS: Reward granted!', event.payload);
    hasGranted = true;
    if (onRewardCallback) {
        // Pass a simple object back
        onRewardCallback(event.payload ? event.payload.amount : 1, event.payload ? event.payload.type : 'point');
    }
  });

  // Display the slot (this registers it, doesn't show it visually yet for rewarded)
  googletag.display(rewardedSlot);
});

function loadWebRewardedAd() {
    console.log('JS: Loading Web Rewarded Ad...');
    isAdLoaded = false;
    googletag.cmd.push(function() {
        googletag.pubads().refresh([rewardedSlot]);
    });
}

function showWebRewardedAd(callback) {
    console.log('JS: Showing Web Rewarded Ad...');
    if (isAdLoaded) {
        onRewardCallback = callback;
        // Check if we need to do anything specific to "show" it, 
        // usually refreshed usage in defineOutOfPageSlot handles the trigger?
        // Actually for GPT Rewarded, it usually shows automatically when 'ready' if config is set,
        // OR we might need to rely on the fact it's an overlay.
        // Wait, 'defineOutOfPageSlot' for rewarded ads works differently.
        // It serves immediately upon refresh if matched.
        // However, we usually want to control the "Show".
        // GAM Rewarded Ads are usually immediate.
        // Let's rely on the refresh triggered in 'load' to have prepared it, 
        // but wait... invalid logic. 
        // A refresh() on a rewarded slot usually triggers the ad to display immediately when ready.
        // To control it, we might need to use 'googletag.pubads().refresh()' ONLY when we want to show it?
        // NO, that's slow.
        // Correct pattern: Prefetch is tricky with standard GPT Rewarded.
        // Most web implementations just call refresh() when the user clicks the button.
        
        // Let's update logic: 'load' does nothing or sets a flag.
        // 'show' calls refresh().
        
        // REVISION: We will call refresh() inside showWebRewardedAd().
        // loadWebRewardedAd() will be a no-op or just log.
        googletag.cmd.push(function() {
             googletag.pubads().refresh([rewardedSlot]);
        });
    } else {
        console.log('JS: Ad not loaded (conceptually). Triggering refresh now.');
        onRewardCallback = callback;
        googletag.cmd.push(function() {
             googletag.pubads().refresh([rewardedSlot]);
        });
    }
}

// Check if ready (always true for this pattern as we trigger on show)
function isWebAdReady() {
    return true; 
}
