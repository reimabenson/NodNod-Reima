## NodNod-Reima Shopify Custom Collection Section

## Overview

This project involves developing a **Custom Collection Section** for a Shopify store using the Dawn theme. The section displays products from a selected collection with customizable settings and integrates dynamic AJAX product loading and cart management.

## Features

### 1\. Customizable Collection Section

*   **Collection Selection**: Choose a collection to display in the section.
*   **Products Per Row**: Customize the number of products displayed per row (2-6).
*   **Section Heading**: Defaults to the collection name but can be overridden with a custom heading.
*   **Product Image Aspect Ratio**: Configure the aspect ratio of product images (Square, Portrait, or Natural).

### 2\. Product Display

*   **Product and Variant Titles**: Displays the product title and variant options in the format `Option Name: Option Value | Option Name: Option Value`.
*   **Product Tags**: Renders product tags as badges on the product card.
*   **Price and Compare-at Price**: Displays product prices dynamically. If the product is on sale, the compare-at price is shown with a strikethrough.
*   **Add to Cart Button**: Allows users to add products to the cart using AJAX. If the product is out of stock, an "Out of Stock" button is shown.
*   **Hover Effect**: On hover, the "Add to Cart" button is displayed with a smooth animation from the bottom of the image container.

### 3\. AJAX-Based "Load More" Button

*   **AJAX Pagination**: Implements the `collection.enriched` paginate template to load more products via AJAX without reloading the page.
*   **Load More Button**: Dynamically fetches more products when clicked and hides the button when no more products are available.

### 4\. Dynamic Cart Handling

*   **Cart Integration**: Integrated with the Dawn theme’s **Cart Class** to ensure the cart notification or drawer updates dynamically when a product is added via AJAX.

### 5\. Responsive Design

*   The section is fully responsive, displaying two products per row on mobile devices and up to six products per row on larger screens based on the settings.

## Section Settings

1.  **Collection Selection**: Allows the user to choose the collection to display.
2.  **Section Heading**: Custom heading for the section (defaults to the collection name).
3.  **Products Per Row**: Set the number of products to display per row (2-6).
4.  **Image Aspect Ratio**: Select the image aspect ratio (Square, Portrait, or Natural).
5.  **Show Product Tags**: Toggle to show or hide product tags.
6.  **Show Variant Titles**: Toggle to show or hide variant titles.

## Approach

### 1\. Custom Collection Section

*   Created the **Custom Collection Section** using Shopify’s `collection.enriched` paginate template for efficient product loading and pagination.
*   The section renders with preloaded products for initial display and dynamically loads more products using AJAX as needed.
*   Used **custom HTML elements** (`<custom-featured-collection>` and `<custom-product-card>`) for encapsulated, reusable components.

### 2\. AJAX Product Loading

*   Implemented AJAX-based pagination to dynamically load products when users click the "Load More" button. The section fetches products from the collection using Shopify’s Section Rendering API.
*   Handled product loading using the `page`, `limit`, and `collection.handle` parameters to control product pagination.

### 3\. Custom Product Card

*   The **Custom Product Card** displays the product’s title, variant options, tags, price, and an "Add to Cart" button.
*   Integrated the card with the Dawn theme’s **Cart Class** using AJAX to add the selected variant to the cart dynamically.
*   Implemented a loading spinner and error message handling during the add-to-cart process.

### 4\. AJAX Loading Enhancements

*   Implemented a **Load More** button using the `collection.enriched` paginate template for improved product loading.
*   The button dynamically loads more products and hides when there are no more products to display.

## File Changes

To view all changes made in this project, please visit the following PR file changes link:

[Full File Changes](https://github.com/reimabenson/NodNod-Reima/pull/3/files)
