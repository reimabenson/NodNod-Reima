/**
 * Custom Element: custom-featured-collection
 * Purpose: 
 * - Handles the dynamic rendering and loading of products from a selected collection.
 * - Manages the product display layout based on the configured settings (e.g., products per row).
 * - Implements the "Load More" functionality to fetch additional products via AJAX using the Shopify Section Rendering API.
 * 
 * Data Attributes:
 * - data-collection-handle: The handle of the selected collection from which products are being loaded.
 * - data-max-products-per-row: Number of products to display per row, defined by the section's settings.
 * - data-current-index: Tracks the current index of loaded products to manage pagination via the "Load More" button.
 * 
 * Features:
 * - Automatically loads the first row of products based on the section settings.
 * - Dynamically fetches more products upon clicking the "Load More" button using AJAX.
 * - Ensures that the "Load More" button is hidden when no more products are available.
 * - Uses the `custom-product-card` element to render each product card.
 * 
 * Important Methods:
 * - `loadMoreProducts`: Fetches additional products from the server using the Shopify Section Rendering API and appends them to the DOM.
 * - `updateLoadMoreButtonState`: Controls the visibility and behavior of the "Load More" button based on the fetched products.
 * 
 * Notes:
 * - The code is designed to handle multiple instances of `custom-featured-collection` on the same page.
 * - Uses modern JavaScript methods like `fetch()` for asynchronous data retrieval and `dataset` for accessing data attributes.
 */

class CustomFeaturedCollection extends HTMLElement {
    constructor() {
        super();

        // Initialize the required properties for managing collection display and product loading
        this.productsContainer = this.querySelector('.products-container');
        this.loadMoreBtn = this.querySelector('.load-more-btn');
        this.collectionHandle = this.dataset.collectionHandle;
        this.maxProductsPerRow = parseInt(this.dataset.maxProductsPerRow, 10);
        this.currentIndex = parseInt(this.dataset.currentIndex, 10) || 1;

        // Bind methods
        this.loadMoreProducts = this.loadMoreProducts.bind(this);
        this.handleLoadMoreClick = this.handleLoadMoreClick.bind(this);
    }

    connectedCallback() {
        if (this.loadMoreBtn) {
            this.loadMoreBtn.addEventListener('click', this.handleLoadMoreClick);
        }
    }

    disconnectedCallback() {
        if (this.loadMoreBtn) {
            this.loadMoreBtn.removeEventListener('click', this.handleLoadMoreClick);
        }
    }

    handleLoadMoreClick() {
        this.loadMoreProducts(this.collectionHandle, this.currentIndex + 1, this.maxProductsPerRow);
    }

    loadMoreProducts(collectionHandle, pageIndex, limit) {
        // limit = this.maxProductsPerRow + 1
        // Fetch more products using the Shopify Section Rendering API and append them to the DOM
        const ajaxUrl = window.Shopify.routes.root + `collections/${collectionHandle}?page=${pageIndex}&limit=${limit}&view=enriched`;

        this.loadMoreBtn.classList.add('loading');
        this.loadMoreBtn.querySelector('.loading__spinner').classList.remove('hidden');

        fetch(ajaxUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok.');
                }
                return response.text();
            })
            .then(html => {
                const parser = new DOMParser();
                const parsedHtml = parser.parseFromString(html, 'text/html');

                // Extract custom product cards only
                const productCards = parsedHtml.body.querySelectorAll('custom-product-card');

                // Insert only up to 'limit' number of product cards
                productCards.forEach((card) => {
                    this.productsContainer.appendChild(card);
                });

                // Check if there are more products to load
                const hasMoreProducts = parsedHtml.querySelector('.load-more-btn');
                if (!hasMoreProducts) {
                    this.loadMoreBtn.style.display = 'none';
                } else {
                    // Update the current index data attribute
                    this.currentIndex += 1;
                    this.dataset.currentIndex = this.currentIndex;
                }
            })
            .catch(error => console.error('Error loading more products:', error))
            .finally(() => {
                this.loadMoreBtn.classList.remove('loading');
                this.loadMoreBtn.querySelector('.loading__spinner').classList.add('hidden');
            });
    }
}

// Define the custom element
customElements.define('custom-featured-collection', CustomFeaturedCollection);


/**
 * CustomProductCard Class
 * 
 * Purpose:
 * - This class manages the Add to Cart functionality for a single product card. It handles interactions 
 *   with Shopify's cart API via AJAX and provides real-time feedback to the user, including loading 
 *   spinners and error messages. 
 * 
 * Features:
 * - Supports both cart notification and cart drawer functionality. This allows users to view updated cart 
 *   contents without reloading the page.
 * - Displays a loading spinner while the Add to Cart request is being processed to provide visual feedback.
 * - Handles errors gracefully by showing an error message below the Add to Cart button in case of API failure.
 * - Utilizes Shopify’s AJAX API to add a variant to the cart dynamically without requiring a page refresh.
 * 
 * Key Properties:
 * - this.variantId: Captures the product's first available variant ID, which is needed for adding to the cart.
 * - this.cart: References the cart notification or drawer, depending on the theme's setup, allowing seamless cart updates.
 * - this.addToCartBtn: The button that triggers the add-to-cart action.
 * - this.errorContainer: A dynamic container for displaying error messages if the API request fails.
 * - this.isLoading: A flag that prevents multiple submissions while the request is in progress.
 * 
 * Methods:
 * - init(): Initializes the event listeners for the product card.
 * - handleAddToCart(): Handles the Add to Cart API call, manages the button loading state, and processes API responses.
 * - setLoadingState(isLoading): Toggles the button's loading state and hides/shows the spinner.
 * - showErrorMessage(message): Displays an error message if the API call fails.
 * - createErrorContainer(): Dynamically creates a container for error messages if it doesn't exist.
 * 
 * Integration:
 * - This class integrates smoothly with both the cart notification and cart drawer, as it checks if the cart is a 
 *   notification or drawer (via this.cart) and updates the UI accordingly.
 * 
 * Theme Compatibility:
 * - The class is compatible with both static and AJAX-based Shopify themes.
 * - The class is designed to work with common theme features such as loading spinners, error message displays, 
 *   and section rendering for cart updates.
 * 
 * Usage:
 * - CustomProductCard is automatically initialized for each product card that uses the custom-product-card element.
 * - The class listens for click events on the Add to Cart button and processes the form submission via AJAX.
 * 
 * Example of Button States:
 * - The Add to Cart button enters a loading state when clicked, disabling further actions until the request is complete.
 * - If the request is successful, the cart is updated, and the button returns to its normal state.
 * - If the request fails, an error message is displayed below the button, and the button is re-enabled.
 */

class CustomProductCard extends HTMLElement {
    constructor() {
        super();

        this.addToCartBtn = this.querySelector('[data-js-add-to-cart]');
        this.variantId = this.dataset.variantId;
        this.isLoading = false;
        this.errorContainer = this.createErrorContainer();
        this.cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');

        this.init();
    }

    init() {
        if (this.addToCartBtn) {
            this.addToCartBtn.addEventListener('click', this.handleAddToCart.bind(this));
        }
    }

    handleAddToCart(event) {
        event.preventDefault();

        if (this.isLoading) return;

        this.setLoadingState(true);  // Start loading

        const config = {
            method: 'POST',
            headers: { 'X-Requested-With': 'XMLHttpRequest', Accept: `application/javascript` },
        };

        // Prepare form data
        const formData = new FormData();
        formData.append('id', this.variantId);
        formData.append('quantity', 1);

        if (this.cart) {
            formData.append(
                'sections',
                this.cart.getSectionsToRender().map((section) => section.id)
            );
            formData.append('sections_url', window.location.pathname);
        }

        config.body = formData;

        fetch(`${routes.cart_add_url}`, config)
            .then(response => response.json())
            .then(data => {
                if (data.status) { // If there's an error in the response
                    throw new Error(data.description || 'An error occurred while adding to the cart.');
                } else if (!this.cart) { // If cart type is page
                    window.location = window.routes.cart_url;
                    return;
                }

                // Update cart
                this.cart.renderContents(data);

                if (this.cart && this.cart.classList.contains('is-empty')) this.cart.classList.remove('is-empty');
            })
            .catch(error => {
                this.showErrorMessage(error.message);  // Show error on failure
                console.error(error);
            })
            .finally(() => {
                this.setLoadingState(false);  // End loading state
            });
    }

    setLoadingState(isLoading) {
        if (isLoading) {
            this.addToCartBtn.classList.add('loading');
            this.addToCartBtn.querySelector('.loading__spinner').classList.remove('hidden');
            this.errorContainer.classList.add('hidden');
        } else {
            this.addToCartBtn.classList.remove('loading');
            this.addToCartBtn.querySelector('.loading__spinner').classList.add('hidden');
        }

        this.isLoading = isLoading;
    }

    showErrorMessage(message) {
        // Display error message below the button
        this.errorContainer.innerText = message;
        this.errorContainer.classList.remove('hidden');
    }

    createErrorContainer() {
        // Create an error message container if not exists
        let errorContainer = this.querySelector('.error-message');
        if (!errorContainer) {
            errorContainer = document.createElement('div');
            errorContainer.classList.add('error-message', 'hidden');
            errorContainer.style.color = 'red';  // Add styling as per design
            this.appendChild(errorContainer);
        }
        return errorContainer;
    }
}

// Define the custom element
customElements.define('custom-product-card', CustomProductCard);
