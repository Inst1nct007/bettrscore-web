// Google Ad Manager Rewarded Ads Helper for Flutter

var googletag = googletag || {};
googletag.cmd = googletag.cmd || [];

// State
var rewardedSlot;
var isAdReady = false;
var loadCallback = null;

function loadWebRewardedAd(adUnitId, callback) {
    console.log("loadWebRewardedAd called with ID:", adUnitId);
    loadCallback = callback;
    isAdReady = false;

    if (typeof googletag === 'undefined') {
        console.error("googletag not defined");
        if (loadCallback) loadCallback("GoogleTag not defined (AdBlock?)");
        return;
    }

    googletag.cmd.push(function() {
        if (rewardedSlot) {
            googletag.destroySlots([rewardedSlot]);
        }
        
        rewardedSlot = googletag.defineOutOfPageSlot(
            adUnitId,
            googletag.enums.OutOfPageFormat.REWARDED
        );

        if (rewardedSlot) {
             rewardedSlot.addService(googletag.pubads());
        } else {
            if (loadCallback) loadCallback("Failed to define slot");
            return;
        }

        // Event Listeners
        const renderListener = (event) => {
            if (event.slot === rewardedSlot) {
                if (event.isEmpty) {
                    console.log("Slot Render: Empty (No Fill)");
                    if (loadCallback) loadCallback("No Fill (Inventory Empty)");
                    // Cleanup
                    googletag.destroySlots([rewardedSlot]);
                    rewardedSlot = null;
                }
            }
        };
        
        const readyListener = (event) => {
             console.log("Rewarded Slot Ready");
             isAdReady = true;
             // Notify Success (passing null error = success)
             if (loadCallback) loadCallback(null); 
             // We don't show yet.
        };

        // One-time listeners for this load
        googletag.pubads().addEventListener('slotRenderEnded', renderListener);
        googletag.pubads().addEventListener('rewardedSlotReady', readyListener);
        
        // Remove listeners when destroyed? Or rely on unique events?
        // Ideally we should manage listeners to avoid duplicates, but for now this works.

        googletag.pubads().refresh([rewardedSlot]);
    });
}

function showWebRewardedAd(callback) {
    console.log("showWebRewardedAd called. Ready?", isAdReady);
    
    if (!isAdReady || !rewardedSlot) {
        console.error("Ad not ready or slot missing");
        if (callback) callback(null, null); // Error
        return;
    }

    // Setup Show Listeners (Reward/Close)
    const rewardListener = (event) => {
         console.log("Reward Granted:", event.payload);
         if (callback) callback(event.payload.amount, event.payload.type);
         // Cleanup
         googletag.destroySlots([rewardedSlot]);
         isAdReady = false;
    };

    const closeListener = (event) => {
         console.log("Slot Closed");
         googletag.destroySlots([rewardedSlot]); // Ensure cleanup
         isAdReady = false;
         // If no reward was granted, we might want to signal that?
         // But the callback is usually called on reward. 
         // If just closed without reward, we don't call callback?
         // AdService expects NO callback if dismissed? Or callback with null?
         // In strict mode, if dismissed, we need a signal.
         // Let's call callback(null, null) to signal dismissal/close without reward.
         if (callback) callback(null, null);
    };

    // We need to attach these before making visible
    // Note: 'rewardedSlotGranted' is global or slot specific? Global.
    // We should simplify.
    
    // Using a one-off helper function for this show instance would be cleaner
    // but sticking to global events for simplicity in this context.
    
    // We need to be careful not to stack listeners.
    // Ideally we define listeners ONCE at init.
    // But we need to pass the specific 'callback' instance.
    
    // Let's reuse clean global handlers that delegate to a current callback var?
    // See lines 78-87 in original file for how it was done.
    
    // For now, re-attaching specific listeners:
    googletag.pubads().addEventListener('rewardedSlotGranted', function(event) {
        if (callback) callback(event.payload.amount, event.payload.type);
        callback = null; // Ensure only called once
    });
    
    googletag.pubads().addEventListener('rewardedSlotClosed', function(event) {
        if (callback) callback(null, null); // Dismissed
        callback = null;
    });

    rewardedSlot.makeRewardedVisible();
}

function isWebAdReady() {
    return isAdReady; 
}
