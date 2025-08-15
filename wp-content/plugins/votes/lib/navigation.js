/**
 * AITECH Votes Navigation
 */
jQuery(document).ready(($) => {
  // Inject the sliding background if not present
  if ($(".aitech-tab-bg").length === 0) {
    $(".aitech-tabs").prepend('<div class="aitech-tab-bg"></div>');
  }

  function moveTabBg($tab) {
    const $bg = $(".aitech-tab-bg");
    const $visibleTabs = $(".aitech-tab:visible");
    if ($visibleTabs.length < 2 || !$tab.is(":visible")) {
      $bg.hide();
      return;
    }
    const left = $tab.position().left;
    const width = $tab.outerWidth();
    $bg.show().css({
      transform: `translateX(${left}px)`,
      width: width + "px",
    });
  }

  // On load, set to active tab
  moveTabBg($(".aitech-tab.active"));

  // Tab switching functionality
  $(".aitech-tab").on("click", function (e) {
    e.preventDefault();
    if ($(this).hasClass("active")) return;
    const tabId = $(this).data("tab");
    const currentTab = $(".aitech-tab.active");
    currentTab.removeClass("active");
    $(this).addClass("active");
    moveTabBg($(this));

    // Handle content transition
    const currentPane = $(".aitech-tab-pane.active");
    const newPane = $("#" + tabId);
    currentPane.css("opacity", "0");
    setTimeout(() => {
      currentPane.removeClass("active").hide();
      newPane.show().css("opacity", "0");
      setTimeout(() => {
        newPane.addClass("active").css("opacity", "1");
        moveTabBg($(".aitech-tab.active")); // Ensure bg is correct after content switch
      }, 50);
    }, 300);
  });

  // On window resize, recalculate background position
  $(window).on("resize", function () {
    moveTabBg($(".aitech-tab.active"));
  });

  // Handle filters
  $(".aitech-filter").on("click", function () {
    // In a real implementation, you would show a dropdown menu
  });

  // Handle pagination
  $(".aitech-page-item, .aitech-page-nav").on("click", function () {
    $(".aitech-page-item").removeClass("active");
    if ($(this).hasClass("aitech-page-item")) {
      $(this).addClass("active");
    }
    // In a real implementation, you would fetch the corresponding page of data
  });
});

// Add CSS for the sliding background if not present
(function () {
  const styleId = "aitech-tab-bg-style";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.innerHTML = `
      .aitech-tab-bg {
        position: absolute;
        top: 4px;
        left: 0;
        width: 0;
        height: 48px;
        background: radial-gradient(66.35% 139.61% at 13.37% 12.5%, #535353 0%, #3b3b3b 100%);
        border-radius: 24px;
        transition: transform 0.3s cubic-bezier(.4,0,.2,1), width 0.3s cubic-bezier(.4,0,.2,1);
        z-index: 0;
        pointer-events: none;
      }
      .aitech-tab {
        position: relative;
        z-index: 1;
      }
    `;
    document.head.appendChild(style);
  }
})();
