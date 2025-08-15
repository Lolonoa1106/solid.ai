/**
 * Tooltips initialization using Popper.js
 */

export function initializeTooltips() {
  
  //HACK: replace data-tooltip-custom with data-tooltip
  // Goal is to prevent automatic tooltip from appearing on hover and use the one from popper.js
  
  const tooltipCustomElements = document.querySelectorAll("[data-tooltip-custom]");
  tooltipCustomElements.forEach((element) => {
    element.setAttribute("data-tooltip", element.getAttribute("data-tooltip-custom"));
  });

  // Get all elements with data-tooltip attribute
  const tooltipElements = document.querySelectorAll("[data-tooltip]");

  tooltipElements.forEach((element) => {
    // Create tooltip element
    const tooltip = document.createElement("div");
    tooltip.className = "popper-tooltip";

    // Create arrow element
    const arrow = document.createElement("div");
    arrow.setAttribute("data-popper-arrow", "");
    tooltip.appendChild(arrow);

    // Create tooltip content
    const content = document.createElement("div");
    content.className = "tooltip-content";
    content.textContent = element.getAttribute("data-tooltip");
    tooltip.appendChild(content);

    document.body.appendChild(tooltip);

    // Initialize Popper instance
    const popperInstance = Popper.createPopper(element, tooltip, {
      placement: "top",
      modifiers: [
        {
          name: "offset",
          options: {
            offset: [0, 12],
          },
        },
        {
          name: "arrow",
          options: {
            element: "[data-popper-arrow]",
            padding: 5,
          },
        },
      ],
    });

    // Show tooltip on hover
    element.addEventListener("mouseenter", () => {
      tooltip.setAttribute("data-show", "");
      popperInstance.update();
    });

    // Hide tooltip on mouse leave
    element.addEventListener("mouseleave", () => {
      tooltip.removeAttribute("data-show");
    });
  });
}
