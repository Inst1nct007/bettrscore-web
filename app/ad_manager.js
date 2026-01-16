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

  // Listen for Render Ended (to catch empty/no-fill scenarios)
  googletag.pubads().addEventListener('slotRenderEnded', function(event) {
    if (event.slot === rewardedSlot) {
        console.log('JS: Slot render ended. isEmpty:', event.isEmpty);
        if (event.isEmpty) {
             // No ad returned. Fail immediately.
             if (onRewardCallback) {
                 onRewardCallback(null, null);
                 onRewardCallback = null;
             }
             isAdLoaded = false;
        }
    }
  });

  // Display the slot
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
    onRewardCallback = callback;
    
    // Safety Timeout: If nothing happens (no grant, no close, no empty render) in 10s, abort.
    setTimeout(function() {
        if (onRewardCallback) {
            console.log('JS: Ad timeout. Aborting.');
            onRewardCallback(null, null);
            onRewardCallback = null;
        }
    }, 10000);

    if (!isAdLoaded) {
         // Trigger refresh if not loaded
         googletag.cmd.push(function() {
             googletag.pubads().refresh([rewardedSlot]);
         });
    } else {
        // If already loaded/ready, GPT OutOfPage usually shows itself. 
        // But if it didn't, we might need to refresh again or just wait.
        // For simplicity/robustness, we'll refresh which usually re-serves or shows.
        // Or if it's already visible, the user is interacting.
         console.log('JS: Ad supposedly loaded/ready.');
    }
}

// Check if ready (always true for this pattern as we trigger on show)
function isWebAdReady() {
    return true; 
}
